import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const url = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

type Holder = {
  address: string;
  balance: number;
};

// ✅ Function to find holders with at least 1000 RENT tokens
const findEligibleHolders = async () => {
  let page: number = 1;
  let holders: Holder[] = [];

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
          mint: "EPW6L3UrX8ArF4SVsGFNNNs2XccugnJGNNzXLeHUCNuz", // Token address
        },
      }),
    });

    if (!response.ok) {
      console.log(`❌ Error: ${response.status}, ${response.statusText}`);
      break;
    }

    const data = await response.json();
    console.log(`📌 Processing page ${page}`);

    if (!data.result || data.result.token_accounts.length === 0) {
      console.log(`✅ No more results. Total pages processed: ${page - 1}`);
      break;
    }

    data.result.token_accounts.forEach((account: { owner: string; amount: number }) => {
      const rawBalance = account.amount / 10 ** 9;  // Convert from raw amount
      const integerBalance = Math.floor(rawBalance); // ✅ Convert to whole number
      if (integerBalance >= 1000) {
        holders.push({ address: account.owner, balance: integerBalance });
      }
    });

    page++;
  }

  console.log(`✅ Total eligible holders found: ${holders.length}`);

  // ✅ Save data to JSON
  fs.writeFileSync("eligible_holders_5_april.json", JSON.stringify(holders, null, 2));

  // ✅ Save data to CSV with no decimals
  const csvContent = holders.map(({ address, balance }) => `${address}, ${balance}`).join("\n");
  fs.writeFileSync("eligible_holders_5_april.csv", csvContent);

  console.log(`📦 Holders saved in 'eligible_holders_5_april.json' and 'eligible_holders_5_april.csv'`);
};

findEligibleHolders();