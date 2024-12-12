// src/services/utils.ts
import { Connection } from '@solana/web3.js';

export function generateExplorerTxUrl(
  connection: Connection,
  txId: string,
): string {
  const cluster = getCluster(connection.rpcEndpoint);
  return `https://explorer.solana.com/tx/${txId}?cluster=${cluster}`;
}

function getCluster(rpcEndpoint: string): string {
  if (rpcEndpoint.includes('devnet')) {
    return 'devnet';
  } else if (rpcEndpoint.includes('testnet')) {
    return 'testnet';
  } else if (rpcEndpoint.includes('mainnet-beta')) {
    return 'mainnet-beta';
  } else {
    return 'custom'; // localhost
  }
}
