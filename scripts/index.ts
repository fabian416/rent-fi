import { createNewTokenMain, mintAndDistributeTokensMain } from './createTokenMain';
import { createAssociatedTokenAccountIdempotentInstructionWithDerivation } from '@solana/spl-token';
import { mintAndDistributeTokens, createNewToken  } from './createAndMintTokens';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    // Create new token
  await createNewTokenMain();
    // Mint and distribute 1 billion tokens
 // await mintAndDistributeTokensMainTest();
 // await mintAndDistributeTokens(); 
}

main();