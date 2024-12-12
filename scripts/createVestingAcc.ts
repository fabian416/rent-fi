import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import dotenv from "dotenv";
import fs from "fs";

// Cargar variables de entorno
dotenv.config();

// Configuración inicial
const CLUSTER_URL = process.env.CLUSTER_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey("6U1EhFyn2nFpNsxD5Rf6JU1eQeRgBPPv3aET6xZkoF5F"); // Reemplaza con tu PROGRAM_ID
const WALLET_KEYPAIR_PATH = process.env.WALLET_KEYPAIR_PATH || "Provide a wallety key pair";

// Parámetros de inicialización
const TOTAL_TOKENS = new anchor.BN(150_000_000 * 10 ** 9); // Tokens totales (para Marketing) elevando para lograr 9 decimales
const CLIFF_DURATION = new anchor.BN(3 * 30 * 24 * 60 * 60); // Cliff en segundos
const VESTING_DURATION = new anchor.BN(12 * 30 * 24 * 60 * 60); // Vesting lineal en segundos
const BENEFICIARY_TYPE = 1; // Tipo de beneficiario: Marketing

(async () => {
  // Conexión a la red
  const connection = new anchor.web3.Connection(CLUSTER_URL, "confirmed");

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

  // Cargar el IDL de tu programa
  const idl = require("../target/idl/vesting_v2.json"); // Cambia el nombre al de tu IDL
  const program = new anchor.Program(idl, provider);
  // Crear la cuenta Mint (SPL Token) si no existe
  const mint = new PublicKey("8zKNc2RqKSU2TFUXjs2RCELGn8SiJifePrJCTFMjbfoL");

  // Dirección del beneficiario
  const beneficiaryPublicKey = new PublicKey("DyKDpm6rb4CGMNJQUmmu22PvtohKv9kQWYqHhzXbHjXF"); // Cambia por la dirección real del beneficiario

  // Calcular el PDA para la cuenta de vesting
  const [vestingAccountPDA] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vesting"), beneficiaryPublicKey.toBuffer()],
    PROGRAM_ID
  );

  console.log(`Vesting Account PDA: ${vestingAccountPDA.toBase58()}`);

  // @ts-ignore
  const tx = await program.methods
    .initialize(
      TOTAL_TOKENS,
      CLIFF_DURATION,
      VESTING_DURATION,
      beneficiaryPublicKey,
      BENEFICIARY_TYPE,
      mint
    )
    .accounts({
      vestingAccount: vestingAccountPDA,
      mint,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([wallet.payer])
    .rpc();

  console.log(`Transaction Signature: ${tx}`);
})();