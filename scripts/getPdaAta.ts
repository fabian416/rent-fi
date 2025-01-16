import {
    getAssociatedTokenAddressSync,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";
  import {
    PublicKey,
  } from "@solana/web3.js";

  // Parámteros:
  const mintAddress = new PublicKey("FMjNwsbDcmNJc9hCn6ysFzAVQGG8ssfF28AitmsxCMxn");  // Token SPL
  const programSigner = new PublicKey("7YXvuuNxSZ5RjXms3jkTNHEVcTnxioJ2DYtAqMDbHJww");  // PDA del vesting
  
  // Calcular el ATA del PDA (pdaTokenAccount)
  const pdaTokenAccount = getAssociatedTokenAddressSync(
    mintAddress,            // SPL token (mint)
    programSigner,          // El PDA (vestingAccount)
    true,                   // Permitir off-curve (PDA no tiene private key)
    TOKEN_2022_PROGRAM_ID,  // Programa de token (usar TOKEN_2022 si aplica)
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  
  console.log(`pdaTokenAccount: ${pdaTokenAccount.toBase58()}`);