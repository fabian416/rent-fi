import { createNewToken, mintAndDistributeTokens } from './createAndMintTokens';
import { createNewTokenMainTest, mintAndDistributeTokensMainTest } from './createTokenTestV1';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    // Create new token
  // await createNewTokenMainTest();
    // Mint and distribute 1 billion tokens
  await mintAndDistributeTokensMainTest(); 
}

main();