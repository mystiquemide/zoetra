// Tops up the 3 device wallets from new-deployer.env with enough BOT to run
// indefinitely at the 60s heartbeat interval.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const SECRETS_DIR = path.join(__dirname, "..", "..", ".secrets");
const TOPUP_AMOUNT = "1.0";
const DEVICE_KEYS = ["device-a", "device-b", "device-c"];

function readEnvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return out;
}

async function main() {
  const { ethers } = hre;
  const deployerEnv = readEnvFile(path.join(SECRETS_DIR, "new-deployer.env"));
  const deployerWallet = new ethers.Wallet(deployerEnv.PRIVATE_KEY, ethers.provider);

  for (const key of DEVICE_KEYS) {
    const deviceEnv = readEnvFile(path.join(SECRETS_DIR, `${key}.env`));
    const before = await ethers.provider.getBalance(deviceEnv.ADDRESS);
    const nonce = await ethers.provider.getTransactionCount(deployerWallet.address, "latest");
    const tx = await deployerWallet.sendTransaction({
      to: deviceEnv.ADDRESS,
      value: ethers.parseEther(TOPUP_AMOUNT),
      nonce,
    });
    await tx.wait();
    const after = await ethers.provider.getBalance(deviceEnv.ADDRESS);
    console.log(`${key} (${deviceEnv.ADDRESS}): ${ethers.formatEther(before)} -> ${ethers.formatEther(after)} BOT`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
