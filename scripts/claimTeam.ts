import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import dotenv from "dotenv";
import fs from "fs";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// Cargar variables de entorno
dotenv.config();

// Configuración inicial
const CLUSTER_URL = process.env.CLUSTER_URL || "https://api.mainnet-beta.solana.com";

const main = async () => {

  const connection = new anchor.web3.Connection(CLUSTER_URL, "confirmed");
  dotenv.config();

  const WALLET_PRIVATE_KEY_BASE58 = process.env.WALLET_PRIVATE_KEY_BASE58;
  if (!WALLET_PRIVATE_KEY_BASE58) {
    throw new Error("Debe definir WALLET_PRIVATE_KEY_BASE58 en el archivo .env");
  }

  const decoded = bs58.decode(WALLET_PRIVATE_KEY_BASE58);
  const walletKeypair = Keypair.fromSecretKey(decoded);
  const wallet = new anchor.Wallet(walletKeypair);
  
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // IDL y programa
  const idl = require("../target/idl/rentfi_vesting.json"); // Cambia el nombre del archivo IDL si es diferente
  const program = new anchor.Program(idl, provider);

    // Dirección del PDA address(vesting account)
    const vestingAccountPDA = new PublicKey("J3W47QCZVwgYBCQsud9FdwowaY7p5bk2mzD48ypRCyUq"); // PDA generated from the initialize function

    // beneficiary ATA which is the team
    const beneficiaryAta = new PublicKey("6pKbFYePhYpy5H26xSQCPVNTVDcXkdK6e8Zmej1YJCrU");

    // Public key of the mint address of RENTFI token
    const mintAddress = new PublicKey("EPW6L3UrX8ArF4SVsGFNNNs2XccugnJGNNzXLeHUCNuz") 

    // Beneficiario address
    const beneficiary = new PublicKey("AZV4gYxmuCvkR4sCcXKXNMo4jpk6JfdR2r9WL1w5pQTE");

    // ATA of the PDA 
    const pdaTokenAccount = new PublicKey("FvCdyF6MEqUj6jMdnxA9DisTH7HuhvmWAuRoaxGAia1i"); // Owner of this account has to be VestingAccountPda 

    const [programSigner] = await PublicKey.findProgramAddressSync(
      [Buffer.from("vesting-v1"), beneficiary.toBuffer()],
      program.programId
    );

    // Llamar a la función claim_marketing  
    // @ts-ignore
    const tx = await program.methods
        .claimTeam() // Cambia a `claimTeam()` si corresponde
        .accounts({
        vestingAccount: vestingAccountPDA,
        beneficiary,
        pdaTokenAccount,
        tokenAccount: beneficiaryAta, // Dirección del ATA del beneficiario
        tokenProgram: TOKEN_2022_PROGRAM_ID, // SPL Token Program
        programSigner, // Dirección del PDA como signer
        mint: mintAddress, // Dirección del mint asociado
        })// we don need a signer here because the vesting pda is the one is signing the transaction 
        .rpc();

  console.log(`Transaction Signature: ${tx}`);
};

main().catch((err) => console.error(err));