import fs from 'fs';
import * as dotenv from 'dotenv';
import { Keypair } from '@solana/web3.js';

dotenv.config()
// Carga una clave privada desde un archivo JSON especificado por una variable de entorno.

function loadKeypairFromPath(envVar: string): Keypair {
  const path = process.env[envVar];
  if (!path) {
    throw new Error(`Environment variable ${envVar} not set.`);
  }
  try {
    const secretKey = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
  } catch (err) {
    throw new Error(`Failed to load keypair from path ${path}: ${err}`);
  }
}

// Supongamos que estas claves se generan aquí o se cargan de alguna forma
export const payer = loadKeypairFromPath('PAYER_KEY_PATH');
export const mintAuthority = loadKeypairFromPath('MINT_AUTHORITY_KEY_PATH');
export const transferFeeConfigAuthority = loadKeypairFromPath(
  'TRANSFER_FEE_AUTHORITY_KEY_PATH',
);
export const withdrawWithheldAuthority = loadKeypairFromPath(
  'WITHDRAW_WITHHELD_AUTHORITY_PATH',
);
