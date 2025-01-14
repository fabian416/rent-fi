import { Connection, clusterApiUrl } from '@solana/web3.js';

export function getConnection(): Connection {
  return new Connection(clusterApiUrl('devnet'), 'confirmed'); // testnet, devnet or mainnet
}
