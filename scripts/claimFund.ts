import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import dotenv from "dotenv";
import fs from "fs";
import bs58 from "bs58";

// Cargar variables de entorno
dotenv.config();

// Configuración inicial
const CLUSTER_URL = process.env.CLUSTER_URL || "https://api.devnet.solana.com";
const WALLET_KEYPAIR_PATH = process.env.WALLET_KEYPAIR_PATH || "Provide a wallety key pair";

const main = async () => {

  const connection = new anchor.web3.Connection(CLUSTER_URL, "confirmed");
  dotenv.config();
  const private_key = process.env.SOLANA_PRIVATE_KEY;
  const base58Key = private_key || "undefined";
  const secretKey = bs58.decode(base58Key);

  // Crear el Keypair desde el secretKey decodificado
  const keypair = Keypair.fromSecretKey(secretKey);

  // Cargar la keypair de la billetera desde el archivo
  const walletKeypair = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(WALLET_KEYPAIR_PATH, "utf-8")))
  );
  const wallet = new anchor.Wallet(walletKeypair);

  // Crear el proveedor y configurar Anchor
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // IDL y programa
  const idl = require("../target/idl/vesting_v1.json"); // Cambia el nombre del archivo IDL si es diferente
  const program = new anchor.Program(idl, provider);


    // Dirección del PDA (vesting account)
    const vestingAccountPDA = new PublicKey("7YXvuuNxSZ5RjXms3jkTNHEVcTnxioJ2DYtAqMDbHJww"); // PDA generated from the initialize function

    // beneficiary ATA
    const beneficiaryAta = new PublicKey("HuH5N7BxNeCAg5r89e5yvvQ3R8XiCza6PHoR26jiJbgX");

    // Public key of the mint address
    const mintAddress = new PublicKey("FMjNwsbDcmNJc9hCn6ysFzAVQGG8ssfF28AitmsxCMxn") 

    // Beneficiario
    const beneficiary = new PublicKey("D7Suu7PJywz1cTWroTsRCWCWEmiJYr6iBnq3VV9AypDg");

    // ATA of the PDA 
    const pdaTokenAccount = new PublicKey("7shbDMrmN7QfBH5cCoZJsAnFh77muB5sfJKjLkpKvPNP"); // Owner of this account has to be VestingAccountPda 

    const [programSigner] = await PublicKey.findProgramAddressSync(
      [Buffer.from("vesting-v1"), beneficiary.toBuffer()],
      program.programId
    );

    // Llamar a la función claim_marketing  
    // @ts-ignore
    const tx = await program.methods
        .claimFund() // Cambia a `claimFund()` 
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