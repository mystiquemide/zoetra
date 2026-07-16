// Mainnet setup: register one low-cost production verification device on BOT Chain
// mainnet. Reads the operator key from env or repo-root .secrets/deployer.env;
// never commit secrets.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const SECRETS_PATH = path.join(__dirname, "..", "..", ".secrets", "deployer.env");
const DEPLOYMENT_PATH = path.join(__dirname, "..", "deployments", "botchain.json");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvFile(SECRETS_PATH);

  const { ethers } = hre;
  const network = hre.network.name;
  const chainId = Number((await ethers.provider.getNetwork()).chainId);

  if (network !== "botchain" || chainId !== 677) {
    throw new Error(`wrong network: expected botchain/677, got ${network}/${chainId}`);
  }

  if (!fs.existsSync(DEPLOYMENT_PATH)) {
    throw new Error(`missing deployment file: ${DEPLOYMENT_PATH}`);
  }

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("missing DEPLOYER_PRIVATE_KEY or PRIVATE_KEY");
  }

  const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, "utf8"));
  const wallet = new ethers.Wallet(privateKey, ethers.provider);
  const Registry = await ethers.getContractFactory("ZoetraRegistry");
  const registry = Registry.attach(deployment.address);

  const name = process.env.DEVICE_NAME || "zoetra-mainnet-sentinel";
  const intervalSec = Number(process.env.DEVICE_INTERVAL_SEC || "300");
  const slaBps = Number(process.env.DEVICE_SLA_BPS || "9000");
  const stakeBot = process.env.DEVICE_STAKE_BOT || "0.05";

  console.log(`registering ${name} on ${deployment.address}`);
  console.log(`operator=${wallet.address} interval=${intervalSec}s slaBps=${slaBps} stake=${stakeBot} BOT`);

  const tx = await registry
    .connect(wallet)
    .register(name, intervalSec, slaBps, { value: ethers.parseEther(stakeBot) });
  const receipt = await tx.wait();
  const deviceId = await registry.deviceCount();

  const result = {
    network,
    chainId,
    registry: deployment.address,
    deviceId: deviceId.toString(),
    operator: wallet.address,
    name,
    intervalSec,
    slaBps,
    stakeBot,
    registerTx: receipt.hash,
    registeredAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "deployments", "devices.botchain.json");
  fs.writeFileSync(outPath, JSON.stringify([result], null, 2));

  console.log(`registered device id ${result.deviceId}`);
  console.log(`tx ${result.registerTx}`);
  console.log(`wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
