import dotenv from "dotenv";
dotenv.config();

const url = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
import fs from "fs";

// ✅ Función para obtener holders con al menos 1 token
const findHolders = async () => {
  let page = 1;
  let holders = new Set(); // Usamos un Set para evitar duplicados

  while (true) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTokenAccounts",
        id: "helius-test",
        params: {
          page: page,
          limit: 1000,
          displayOptions: {},
          mint: "EPW6L3UrX8ArF4SVsGFNNNs2XccugnJGNNzXLeHUCNuz", // Dirección del token
        },
      }),
    });

    if (!response.ok) {
      console.log(`❌ Error: ${response.status}, ${response.statusText}`);
      break;
    }

    const data = await response.json();
    console.log(`📌 Procesando resultados de la página ${page}`);

    if (!data.result || data.result.token_accounts.length === 0) {
      console.log(`✅ No hay más resultados. Total de páginas procesadas: ${page - 1}`);
      break;
    }

    // ✅ Guardamos solo las direcciones (sin balances ni fechas)
    data.result.token_accounts.forEach((account: { amount: number; owner: unknown; }) => {
      const tokenBalance = account.amount / 10 ** 9;
      if (tokenBalance >= 1) {
        holders.add(account.owner);
      }
    });

    page++;
  }

  console.log(`✅ Total de holders encontrados: ${holders.size}`);

  // ✅ Convertimos el Set a un array y guardamos en JSON
  const holdersArray = Array.from(holders);
  fs.writeFileSync("holders_addresses.json", JSON.stringify(holdersArray, null, 2));

  console.log(`✅ Holders guardados en 'holders_addresses.json'`);
};

findHolders();