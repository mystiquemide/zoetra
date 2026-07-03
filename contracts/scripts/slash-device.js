// Manual test helper: slash a given device id using the deployer wallet as
// the permissionless caller. Usage: DEVICE_ID=3 npx hardhat run scripts/slash-device.js --network bohr
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const deployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "deployments", "bohr.json"), "utf8")
  );
  const deployerEnv = fs.readFileSync(
    path.join(__dirname, "..", "..", ".secrets", "deployer.env"),
    "utf8"
  );
  const pkLine = deployerEnv.split("\n").find((l) => l.startsWith("PRIVATE_KEY="));
  const wallet = new ethers.Wallet(pkLine.split("=")[1], ethers.provider);

  const Registry = await ethers.getContractFactory("ZoetraRegistry");
  const registry = Registry.attach(deployment.address).connect(wallet);

  const deviceId = process.env.DEVICE_ID;
  const before = await registry.scoreOf(deviceId);
  console.log(`device ${deviceId} score before slash: ${(Number(before) / 100).toFixed(1)}%`);

  const balanceBefore = await ethers.provider.getBalance(wallet.address);
  const tx = await registry.slash(deviceId);
  const receipt = await tx.wait();
  const balanceAfter = await ethers.provider.getBalance(wallet.address);

  const device = await registry.devices(deviceId);
  console.log(`slash tx: ${receipt.hash}`);
  console.log(`remaining stake: ${ethers.formatEther(device.stake)} BOT`);
  console.log(`caller balance change: ${ethers.formatEther(balanceAfter - balanceBefore)} BOT (net of gas)`);
}

main().catch((error) => {
  console.error(error.shortMessage || error.message);
  process.exitCode = 1;
});
