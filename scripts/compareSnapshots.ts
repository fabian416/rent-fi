import fs from "fs";
import path from "path";

// Cargar CSV en un Map<address, balance>
function loadAddressBalancesFromCSV(filePath: string): Map<string, number> {
  const csvContent = fs.readFileSync(path.resolve(filePath), "utf-8");
  const lines = csvContent.trim().split("\n");

  const addressMap = new Map<string, number>();
  for (const line of lines) {
    const [address, balanceStr] = line.split(",").map(part => part.trim());
    const balance = Number(balanceStr);
    if (address && !isNaN(balance)) {
      addressMap.set(address, balance);
    }
  }
  return addressMap;
}

const oldSnapshotPath = "eligible_holders_20_june.csv";  // To be set to the old snapshot date
const newSnapshotPath = "eligible_holders_5_july.csv";  // To be set to the new snapshot date

const oldMap = loadAddressBalancesFromCSV(oldSnapshotPath);
const newMap = loadAddressBalancesFromCSV(newSnapshotPath);

// 1. Final elegibles wichc were in the old snapshot and have a balance >= 1000
const finalEligible: string[] = [];
newMap.forEach((balance, address) => {
  if (oldMap.has(address) && balance >= 1000) {
    finalEligible.push(`${address}, ${balance}`);
  }
});
fs.writeFileSync("final_eligible_wallets.csv", finalEligible.join("\n"));

// 2. New wallets that are not in the old snapshot
const newWallets: string[] = [];
newMap.forEach((balance, address) => {
  if (!oldMap.has(address)) {
    newWallets.push(`${address}, ${balance}`);
  }
});
fs.writeFileSync("new_wallets_excluded.csv", newWallets.join("\n"));

// 3. Eliminados (ya no están)
const removedWallets: string[] = [];
oldMap.forEach((_, address) => {
  if (!newMap.has(address)) {
    removedWallets.push(address);
  }
});
fs.writeFileSync("wallets_no_longer_eligible.csv", removedWallets.join("\n"));

// Logs
console.log(`✅ Elegibles finales: ${finalEligible.length}`);
console.log(`⚠️ Nuevas wallets excluidas: ${newWallets.length}`);
console.log(`📉 Wallets que ya no están: ${removedWallets.length}`);