import { transfer, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
import fs from "fs";


// Cargar variables de entorno
dotenv.config();

// Configuración inicial
const CLUSTER_URL =  process.env.CLUSTER_URL || "https://api.devnet.solana.com"  ;
const PROGRAM_ID = new PublicKey("6zwP3ZLNrv5jwksK8Eztt7tFt2WYKDqdo5FXQkWv5otc"); 
const WALLET_KEYPAIR_PATH = process.env.WALLET_KEYPAIR_PATH || "Provide a wallety key pair";
const TOTAL_TOKENS = new anchor.BN(150_000_000); // Tokens totales (para Marketing)
(async () => {

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
    const mint = new PublicKey("8zKNc2RqKSU2TFUXjs2RCELGn8SiJifePrJCTFMjbfoL");
    const fromTokenAccount = new PublicKey("DE86QMYFJTcNmDejaCKL2EGRCgKhFNKjfaqNpwAFuCYp");
    const vestingAccountPDA = new PublicKey("Ez4rWe5zY9SJNjaNd5kFt6sUY7bdA2uJTqqmVm1pXSk4");

    // @ts-ignore
    const tx = await transfer(
        connection,
        wallet.payer,
        fromTokenAccount,
        vestingAccountPDA, // Dirección del PDA
        wallet.publicKey, // Propietario de la cuenta de origen
        TOTAL_TOKENS.toNumber() // Monto de tokens a transferir
    );

    console.log(`Transaction Signature: ${tx}`);
})();