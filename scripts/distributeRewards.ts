import dotenv from "dotenv";
dotenv.config();


const url = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
import fs from "fs";

// ✅ Type definition for a holder
type Holder = {
  address: string;
  amount: number;
  firstTransactionDate?: string; // ✅ Now correctly handles undefined
};

// ✅ Function to fetch the first transaction date of a wallet
const getFirstTransactionDate = async (walletAddress: string): Promise<string | undefined> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getSignaturesForAddress",
        id: "helius-test",
        params: [
          walletAddress,
          { limit: 10, order: "asc" } // Get earliest transactions
        ]
      }),
    });

    const data = await response.json();
    if (!data.result || data.result.length === 0) return undefined; // ✅ Use undefined instead of null

    const firstTransaction = data.result[0]; // Oldest transaction
    const blockTime = firstTransaction.blockTime; // Timestamp in seconds

    return new Date(blockTime * 1000).toUTCString();
  } catch (error) {
    console.error(`❌ Error fetching transaction for ${walletAddress}:`, error);
    return undefined; // ✅ Return undefined instead of null
  }
};

// ✅ Function to fetch holders with at least 1,000 tokens
const findHolders = async () => {
  let page = 1;
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
          mint: "EPW6L3UrX8ArF4SVsGFNNNs2XccugnJGNNzXLeHUCNuz", // Your token mint address
        },
      }),
    });

    if (!response.ok) {
      console.log(`❌ Error: ${response.status}, ${response.statusText}`);
      break;
    }

    const data = await response.json();
    console.log(`📌 Processing results from page ${page}`);

    if (!data.result || data.result.token_accounts.length === 0) {
      console.log(`✅ No more results. Total pages processed: ${page - 1}`);
      break;
    }

    // ✅ Convert the amount (divide by 10^9 for 9 decimals) and filter by ≥ 1,000 tokens
    data.result.token_accounts.forEach((account: { owner: string; amount: number }) => {
      const tokenBalance = account.amount / 10 ** 9;

      if (tokenBalance >= 1000) {
        holders.push({
          address: account.owner,
          amount: tokenBalance
        });
      }
    });

    page++;
  }

  console.log(`✅ Total holders found: ${holders.length}`);

  // ✅ Fetch first transaction dates in batches to avoid slow requests
  console.log("📌 Fetching first transaction dates...");
  for (let i = 0; i < holders.length; i++) {
    holders[i].firstTransactionDate = await getFirstTransactionDate(holders[i].address);
    console.log(`📌 Processed ${i + 1}/${holders.length}`);
  }

  // ✅ Filter out holders who have NOT held tokens for at least 15 days
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  const filteredHolders = holders.filter(holder => {
    if (!holder.firstTransactionDate) return false; // Ignore if no transaction found
    return new Date(holder.firstTransactionDate) <= fifteenDaysAgo;
  });

  // ✅ Save results
  fs.writeFileSync("filtered_holders.json", JSON.stringify(filteredHolders, null, 2));

  console.log(`✅ Holders who have ≥ 1,000 tokens for at least 15 days: ${filteredHolders.length}`);
  console.table(filteredHolders);
};

findHolders();