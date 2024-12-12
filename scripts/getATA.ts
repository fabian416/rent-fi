import {
    PublicKey,
    Connection,
    Keypair,
  } from "@solana/web3.js";
  import {
    getAssociatedTokenAddressSync,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";
  
  (async () => {
    const CLUSTER_URL = "https://api.devnet.solana.com";
    const connection = new Connection(CLUSTER_URL, "confirmed");
  
    // Direcciones relevantes
    const mintAddress = new PublicKey("8zKNc2RqKSU2TFUXjs2RCELGn8SiJifePrJCTFMjbfoL"); // Mint del token SPL
    const beneficiaryAddress = new PublicKey("DyKDpm6rb4CGMNJQUmmu22PvtohKv9kQWYqHhzXbHjXF"); // Dirección del propietario
    const PROGRAM_ID = new PublicKey("6U1EhFyn2nFpNsxD5Rf6JU1eQeRgBPPv3aET6xZkoF5F");
    const [programSigner, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("vesting"), beneficiaryAddress.toBuffer()],
      PROGRAM_ID
    );

    console.log("programSigner, bump", programSigner, bump);
  
    // Permitir propietarios off-curve si es un PDA
    const allowOwnerOffCurve = true;
  
    // Opcional: Si estás usando un programa de tokens diferente (como Token 2022)
    const programId = TOKEN_2022_PROGRAM_ID; // O usa TOKEN_2022_PROGRAM_ID
    const associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID;
  
    // Obtener la dirección del ATA
    try {
      const ataAddress = getAssociatedTokenAddressSync(
        mintAddress,
        beneficiaryAddress,
        allowOwnerOffCurve,
        programId,
        associatedTokenProgramId
      );
  
      console.log(`La dirección del ATA calculada es: ${ataAddress.toBase58()}`);
  
      // Validar si la cuenta existe
      const accountInfo = await connection.getAccountInfo(ataAddress);
      if (accountInfo) {
        console.log("El ATA ya existe en la red.");
      } else {
        console.log("El ATA no existe en la red, necesitas crearlo.");
      }
    } catch (err) {
      console.error("Error al calcular el ATA:", err);
    }
  })();