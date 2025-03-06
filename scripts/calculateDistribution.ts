const fs = require("fs");

// 📌 File paths
const WALLET_INPUT_FILE = "eligible_main.txt";
const DISTRIBUTION_OUTPUT_FILE = "rent_distribution.csv";

// 📌 Define the total RENT tokens to distribute
const TOTAL_RENT_AMOUNT = 48619.152;

// 📌 Ensure the file exists before reading
if (!fs.existsSync(WALLET_INPUT_FILE)) {
  console.error(`❌ Error: File '${WALLET_INPUT_FILE}' not found.`);
  process.exit(1);
}

// 📌 Read file content
const fileData = fs.readFileSync(WALLET_INPUT_FILE, "utf-8");
const walletLines = fileData.split("\n").filter((line: string) => line.trim() !== "");

// 📌 Process addresses and holdings
const walletHolders = walletLines
  .map((line: string) => {
    const parts = line.trim().split(" ");
    if (parts.length < 2 || isNaN(parseFloat(parts[1]))) {
      console.error(`❌ Invalid line detected: '${line}'`);
      return null;
    }
    return {
      address: parts[0],
      holdings: parseFloat(parts[1]),
    };
  })
  .filter(Boolean);

if (walletHolders.length === 0) {
  console.error("❌ Error: No valid wallet holdings found in the file.");
  process.exit(1);
}

// 📌 Calculate total eligible holdings
const totalTokensHeld = walletHolders.reduce((sum: any, holder: { holdings: any; }) => sum + holder.holdings, 0);
console.log(`📌 Total eligible tokens: ${totalTokensHeld}`);

if (totalTokensHeld === 0) {
  console.error("❌ Error: No eligible holdings for distribution.");
  process.exit(1);
}

const distributionData = walletHolders.map((holder: { address: string; holdings: number }) => ({
    address: holder.address,
    reward: (holder.holdings / totalTokensHeld) * TOTAL_RENT_AMOUNT,
  }));
  
  // 📌 Convert to CSV format
  const csvContent = distributionData
    .map(({ address, reward }: { address: string; reward: number }) => `${address}, ${reward.toFixed(6)}`)
    .join("\n");

    
// 📌 Save to CSV file
try {
  fs.writeFileSync(DISTRIBUTION_OUTPUT_FILE, csvContent);
  console.log(`✅ Distribution saved in '${DISTRIBUTION_OUTPUT_FILE}'`);
} catch (error) {
  console.error("❌ Error saving CSV file:", error);
}