import {
    getAssociatedTokenAddressSync,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";
  import {
    PublicKey,
  } from "@solana/web3.js";

  // Parámteros:
  const mintAddress = new PublicKey("J4RjmjUPT8HKpx7M8ZjwjBFLrQ2M7Ah9sSsYTq5jYC78");  // Token SPL
  const programSigner = new PublicKey("6icMpGvjgfQJorCqAb1Mcpkp6RbfWMB11ukWeihC2Whq");  // PDA del vesting
  
  // Calcular el ATA del PDA (pdaTokenAccount)
  const pdaTokenAccount = getAssociatedTokenAddressSync(
    mintAddress,            // SPL token (mint)
    programSigner,          // El PDA (vestingAccount)
    true,                   // Permitir off-curve (PDA no tiene private key)
    TOKEN_2022_PROGRAM_ID,  // Programa de token (usar TOKEN_2022 si aplica)
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  
  console.log(`pdaTokenAccount: ${pdaTokenAccount.toBase58()}`);