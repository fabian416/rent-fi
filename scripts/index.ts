import { createNewTokenMainTest, mintAndDistributeTokensMainTest } from './createTokenTestV1';
import { createAssociatedTokenAccountIdempotentInstructionWithDerivation } from '@solana/spl-token';
import { mintAndDistributeTokens, createNewToken  } from './createAndMintTokens';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    // Create new token
 //  await createNewTokenMainTest();
 // await createNewToken();
    // Mint and distribute 1 billion tokens
 // await mintAndDistributeTokensMainTest();
  await mintAndDistributeTokens(); 
}

main();