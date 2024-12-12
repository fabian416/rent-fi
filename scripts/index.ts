import { createNewToken, mintAndDistributeTokens } from './createAndMintTokens';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    // Create new token
    // await createNewToken();
    // Mint and distribute 1 billion tokens
   await mintAndDistributeTokens(); 
}

main();