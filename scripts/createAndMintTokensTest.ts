import {
    sendAndConfirmTransaction,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction
  } from '@solana/web3.js';
  
  import {
    ExtensionType,
    createInitializeMintInstruction,
    mintTo,
    getMintLen,
    TYPE_SIZE,
    LENGTH_SIZE,
    TOKEN_2022_PROGRAM_ID,
  
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createInitializeTransferFeeConfigInstruction,
    createInitializeMetadataPointerInstruction,
    setAuthority,
    AuthorityType,
    createAssociatedTokenAccount
  } from '@solana/spl-token';
  import { generateExplorerTxUrl } from './explorer';
  import {
    payer,
    mintAuthority
  } from './keys';
  import {
    createInitializeInstruction,
    pack,
    TokenMetadata,
  } from '@solana/spl-token-metadata';
  import { getConnection } from './connection';
  
  console.log('Initializing connection...');
  
  const connection = getConnection();
  
  export async function createNewTokenTest() {
    console.log('Generating keypairs...');
    
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log("Mint public Key is: ", mint);
  
    // Fee basis points for transfers (100 = 1%)
    const feeBasisPoints = 100;
    const decimals = 9;
  
    const metaData: TokenMetadata = {
      updateAuthority: mintAuthority.publicKey,
      mint: mint,
      name: 'RentFi',
      symbol: 'RENT',
      // in order to deploy we need to change it for production
      uri: '',
      // real state cuzotmize solutions
      additionalMetadata: [['', '']],
    };
  
    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
  
    // Size of metadata
    const metadataLen = pack(metaData).length;
    const extensions = [
      ExtensionType.TransferFeeConfig,
      ExtensionType.MetadataPointer,
    ];
  
    // Size of Mint Account with extension
    const mintLen = getMintLen(extensions);
  
    // Minimum lamports required for Mint Account
    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataExtension + metadataLen,
    );
    // 100 million aiming to not use it max Fee at all
    const maxFee =  BigInt(1_000_000 * Math.pow(10, 9))
    
    // Instruction to invoke System Program to create new account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
      newAccountPubkey: mint, // Address of the account to create
      space: mintLen, // Amount of bytes to allocate to the created account
      lamports, // Amount of lamports transferred to created account
      programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
    });
  
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
      null, // Optional Freeze Authority
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
    //
    const multisigBeneficiary = new PublicKey("");
      
    const initializeTransferFeeConfig =
    createInitializeTransferFeeConfigInstruction(
      mint, // Mint Account address
      null, // Authority to update fees
      multisigBeneficiary, // Authority to withdraw fees
      feeBasisPoints, // Basis points for transfer fee calculation // Maximum fee per transfer
      maxFee,
      TOKEN_2022_PROGRAM_ID, // TokenčExtension Program ID
    );
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
  
  export async function mintAndDistributeTokensTest() {
    console.log("Minting and distributing tokens...");
  
    // Mint Address
    const mintAddress = "J4RjmjUPT8HKpx7M8ZjwjBFLrQ2M7Ah9sSsYTq5jYC78";
    const mintPublicKey = new PublicKey(mintAddress);
  
    // Destination test account addresses 4 PDAs 4 Multisigs
    const distribution = [
        { destination: "DcULdzaL51jMapL4o9DVTqvVf3CM3CCHVjeXzfVGp6cT", amount: BigInt(30_000_000 * Math.pow(10, 9)) }, // 30% Liquidity multisig
        { destination: "3xp2vVJDuZkm3hm3H6RLzZhF31ToPqPGh5vpEEhPGcaY", amount: BigInt(30_000_000 * Math.pow(10, 9)) }, // PDA Fund
        { destination: "DyKDpm6rb4CGMNJQUmmu22PvtohKv9kQWYqHhzXbHjXF", amount: BigInt(10_000_000 * Math.pow(10, 9)) }, // Multisig Fund
        { destination: "E23vT7Lc2q1iUExcrgqGcs4RZGgPqG1NbRuXQ8MEV7qz", amount: BigInt(11_250_000 * Math.pow(10, 9)) }, // PDA marketing
        { destination: "81mWBWcomsjKxmNqPzZMrFSbNpu11niSWi844r9Vo1Ub", amount: BigInt(3_750_000 * Math.pow(10, 9)) }, //  Multisig marketing
        { destination: "FG9G2xU7FSaUvxTBF1WtxuZkLEiABv1vfv8prQtfLT1L", amount: BigInt(8_000_000 * Math.pow(10, 9)) },  //  PDA Team
        { destination: "8x2o8wtQ1gCfsjf8bdTQijwXNQbWcD5xtdgXNqTEFrsm", amount: BigInt(2_000_000 * Math.pow(10, 9)) },  //  Multisig Team
        { destination: "BRRFwentT7oVn448AU4t9yYGKP1k7pUtGwSef1Be1PkL", amount: BigInt(5_000_000 * Math.pow(10, 9)) }, // PDA Dao 5M
    ];
  
    for (const { destination, amount } of distribution) {
        const destinationPublicKey = new PublicKey(destination);
  
        // Create or use the associated account
        const destinationAccount = await createAssociatedTokenAccount(
          connection,
          payer,                         // Wallet que paga la transacción
          mintPublicKey,                 // Token SPL (mint)
          destinationPublicKey,                    // PDA (propietario del ATA)
          undefined,                     // Opciones de confirmación (opcional)
          TOKEN_2022_PROGRAM_ID,         // Programa de token (Token 2022)
          ASSOCIATED_TOKEN_PROGRAM_ID,   // Programa ATA
          true         
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
  