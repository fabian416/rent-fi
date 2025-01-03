import { Connection, clusterApiUrl } from '@solana/web3.js';

export function getConnection(): Connection {
  return new Connection(clusterApiUrl('mainnet-beta'), 'confirmed'); // testnet, devnet or mainnet
}
