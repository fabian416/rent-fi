import {
  sendAndConfirmTransaction,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import {
  ExtensionType,
  createInitializeMintInstruction,
  mintTo,
  getMintLen,
  TYPE_SIZE,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  createInitializeTransferFeeConfigInstruction,
  createInitializeMetadataPointerInstruction,
  harvestWithheldTokensToMint,
  transferCheckedWithFee,
  withdrawWithheldTokensFromMint,
  createAssociatedTokenAccountIdempotent,
  setAuthority,
  AuthorityType
} from '@solana/spl-token';

import * as anchor from '@coral-xyz/anchor';
import { generateExplorerTxUrl } from './explorer';
import {
  payer,
  mintAuthority,
  transferFeeConfigAuthority,
  withdrawWithheldAuthority,
} from './keys';
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from '@solana/spl-token-metadata';
import { getConnection } from './connection';

console.log('Initializing connection...');

const connection = getConnection();

export async function createNewToken() {
  console.log('Generating keypairs...');
  
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  console.log("Mint public Key is: ", mint);
  const freezeAcc = Keypair.generate();
  const freeze = freezeAcc.publicKey;


  // Fee basis points for transfers (100 = 1%)
  const feeBasisPoints = 100;
  const decimals = 9;

  const metaData: TokenMetadata = {
    updateAuthority: mintAuthority.publicKey,
    mint: mint,
    name: 'RentFi',
    symbol: 'RENT',
    uri: 'https://ipfs.io/ipfs/QmSom9agZurpjLV1uECMLMZr5fDUSdE12pmvVBZKSvUjbX?filename=happy-monkey.json',
    additionalMetadata: [['RentFi', 'Real State Solutions']],
  };

  const metadataExtension = TYPE_SIZE + LENGTH_SIZE;

  // Size of metadata
  const metadataLen = pack(metaData).length;
  const extensions = [
    ExtensionType.MetadataPointer,
    ExtensionType.TransferFeeConfig,
  ];

  // Size of Mint Account with extension
  const mintLen = getMintLen(extensions);

  // Minimum lamports required for Mint Account
  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataExtension + metadataLen,
  );
  // 100 million aiming to not use it max Fee at all
  const maxFee =  BigInt(100_000_000 * Math.pow(10, 9))

  // Instruction to invoke System Program to create new account
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
    newAccountPubkey: mint, // Address of the account to create
    space: mintLen, // Amount of bytes to allocate to the created account
    lamports, // Amount of lamports transferred to created account
    programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
  });
  // Instruction to initialize TransferFeeConfig Extension

  const initializeTransferFeeConfig =
    createInitializeTransferFeeConfigInstruction(
      mint, // Mint Account address
      transferFeeConfigAuthority.publicKey, // Authority to update fees
      withdrawWithheldAuthority.publicKey, // Authority to withdraw fees
      feeBasisPoints, // Basis points for transfer fee calculation // Maximum fee per transfer
      maxFee,
      TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
    );

  const initializeMetadataPointerInstruction =
    createInitializeMetadataPointerInstruction(
      mint, // Mint Account address
      mintAuthority.publicKey, // Authority that can set the metadata address
      mint, // Account address that holds the metadata
      TOKEN_2022_PROGRAM_ID,
    );
  // Instruction to initialize Mint Account data
  const initializeMintInstruction = createInitializeMintInstruction(
    mint, // Mint Account Address
    decimals, // Decimals of Mint
    mintAuthority.publicKey, // Designated Mint Authority
    freeze, // Optional Freeze Authority
    TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
  );

  // Instruction to initialize Metadata Account data
  const initializeMetadataInstruction = createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
    metadata: mint, // Account address that holds the metadata
    updateAuthority: mintAuthority.publicKey, // Authority that can update the metadata
    mint: mint, // Mint Account address
    mintAuthority: mintAuthority.publicKey, // Designated Mint Authority
    name: metaData.name,
    symbol: metaData.symbol,
    uri: metaData.uri,
  });

  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMetadataPointerInstruction,
    initializeTransferFeeConfig,
    // note: the above instructions are required before initializing the mint
    initializeMintInstruction,
    initializeMetadataInstruction,
  );

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair], // Signers
  );

  
  console.log(
    'Create mint account:',
    generateExplorerTxUrl(connection, transactionSignature),
  );
}

export async function mintAndDistributeTokens() {
  console.log("Minting and distributing tokens...");

  // Mint Address
  const mintAddress = "8zKNc2RqKSU2TFUXjs2RCELGn8SiJifePrJCTFMjbfoL";
  const mintPublicKey = new PublicKey(mintAddress);

  // Destination test account addresses
  const distribution = [
      { destination: "DcULdzaL51jMapL4o9DVTqvVf3CM3CCHVjeXzfVGp6cT", amount: BigInt(40_000_000 * Math.pow(10, 9)) }, // 40%
      { destination: "DcULdzaL51jMapL4o9DVTqvVf3CM3CCHVjeXzfVGp6cT", amount: BigInt(30_000_000 * Math.pow(10, 9)) }, // 30%
      { destination: "DcULdzaL51jMapL4o9DVTqvVf3CM3CCHVjeXzfVGp6cT", amount: BigInt(5_000_000 * Math.pow(10, 9)) },  // 5%
      { destination: "DcULdzaL51jMapL4o9DVTqvVf3CM3CCHVjeXzfVGp6cT", amount: BigInt(10_000_000 * Math.pow(10, 9)) }, // 10%
      { destination: "DcULdzaL51jMapL4o9DVTqvVf3CM3CCHVjeXzfVGp6cT", amount: BigInt(15_000_000 * Math.pow(10, 9)) }, // 15%
  ];

  for (const { destination, amount } of distribution) {
      const destinationPublicKey = new PublicKey(destination);

      // Create or use the associated account
      const destinationAccount = await createAssociatedTokenAccountIdempotent(
          connection,
          payer,
          mintPublicKey,
          destinationPublicKey,
          {},
          TOKEN_2022_PROGRAM_ID
      );

      // Mint tokens to associated account
      const mintSig = await mintTo(
          connection,
          payer,
          mintPublicKey,
          destinationAccount,
          mintAuthority,
          amount,
          [],
          undefined,
          TOKEN_2022_PROGRAM_ID
      );

      console.log(`Minted ${amount} tokens to ${destination}:`, generateExplorerTxUrl(connection, mintSig));
  }

  console.log("Token distribution complete.");

  // Disable mint authority to not mint more tokens
  console.log("Disabling mint authority...");
  const disableAuthoritySig = await setAuthority(
      connection,
      payer,
      mintPublicKey,
      mintAuthority.publicKey, // Autoridad actual
      AuthorityType.MintTokens,
      null,
      [], 
      {commitment: "finalized"},// Deshabilitar autoridad
      TOKEN_2022_PROGRAM_ID
  );

  console.log(
    "Mint authority disabled:",
    generateExplorerTxUrl(connection, disableAuthoritySig)
  );
}
