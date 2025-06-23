import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import dotenv from "dotenv";
import fs from "fs";
import bs58 from "bs58";

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

  // Crear el proveedor y configurar Anchor
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // IDL y programa
  const idl = require("../target/idl/rentfi_vesting.json"); // Cambia el nombre del archivo IDL si es diferente
  const program = new anchor.Program(idl, provider);

    // Address del PDA (vesting account)
    const vestingAccountPDA = new PublicKey("GWZDvfZZTeCdCNd4zhHRQy5K5obY24TWU7LBebJS2My1"); // PDA generated from the initialize function

    // beneficiary ATA (associated token account)
    const beneficiaryAta = new PublicKey("CV2hNCoMkfFJrFvZEEqoFnEDNjMBAvKYfXGj6581sq8x");

    // Public key of the mint address
    const mintAddress = new PublicKey("EPW6L3UrX8ArF4SVsGFNNNs2XccugnJGNNzXLeHUCNuz");

    // Beneficiario
    const beneficiary = new PublicKey("6SbybXSGViN4Q1QzjFVbR6gvHhAFdNAhhbtyBsMsL5Sj");

    // ATA of the PDA 
    const pdaTokenAccount = new PublicKey("5qGzZTkNQwQj8HgdwcAXCjecveuyuy4a6HpiycD4ACic"); // Owner of this account has to be VestingAccountPda 

    const [programSigner] = await PublicKey.findProgramAddressSync(
      [Buffer.from("vesting-v1"), beneficiary.toBuffer()],
      program.programId
    );

    // Llamar a la función claim_marketing  
    // @ts-ignore
    const tx = await program.methods
        .claimMarketing() // Cambia a `claimTeam()` si corresponde
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