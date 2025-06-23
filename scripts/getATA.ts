import {
    PublicKey,
    Connection,
  } from "@solana/web3.js";
  import {
    getAssociatedTokenAddressSync,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  } from "@solana/spl-token";
  
  (async () => {
    const CLUSTER_URL = "https://api.mainnet-beta.solana.com";
    const connection = new Connection(CLUSTER_URL, "confirmed");
  
    // Direcciones relevantes
    const mintAddress = new PublicKey("EPW6L3UrX8ArF4SVsGFNNNs2XccugnJGNNzXLeHUCNuz"); // Mint del token SPL
    const beneficiaryAddress = new PublicKey("AZV4gYxmuCvkR4sCcXKXNMo4jpk6JfdR2r9WL1w5pQTE"); // Dirección del propietario

    // Permitir propietarios off-curve si es un PDA
    const allowOwnerOffCurve = true;
  
    // Opcional: Si estás usando un programa de tokens diferente (como Token 2022)
    const programId = new PublicKey("Edb58tf9QWCJVoVYqppvYKrgueAxqR1nFFsNxhc7pNQv"); // O usa TOKEN_2022_PROGRAM_ID
    const associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID;
  
    // Obtener la dirección del ATA
    try {
      const ataAddress = getAssociatedTokenAddressSync(
        mintAddress,
        beneficiaryAddress,
        allowOwnerOffCurve,
        TOKEN_2022_PROGRAM_ID,
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