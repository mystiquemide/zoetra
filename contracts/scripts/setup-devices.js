// One-time setup: fund the 3 device wallets from the deployer, then register
// each device on ZoetraRegistry. Reads keys only from the gitignored
// repo-root .secrets/ directory; never touches committed files.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const SECRETS_DIR = path.join(__dirname, "..", "..", ".secrets");
const DEPLOYMENT_PATH = path.join(__dirname, "..", "deployments", "bohr.json");

const DEVICES = [
  { key: "device-a", name: "device-a", interval: 5, slaBps: 9000, stake: "0.3" },
  { key: "device-b", name: "device-b", interval: 5, slaBps: 9000, stake: "0.3" },
  { key: "device-c", name: "device-c", interval: 5, slaBps: 9000, stake: "0.3" },
];

const FUND_AMOUNT = "0.5"; // BOT sent from deployer to each device before registration

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
  const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, "utf8"));
  const registryAddress = deployment.address;

  const deployerEnv = readEnvFile(path.join(SECRETS_DIR, "deployer.env"));
  const deployerWallet = new ethers.Wallet(deployerEnv.PRIVATE_KEY, ethers.provider);

  const Registry = await ethers.getContractFactory("ZoetraRegistry");
  const registry = Registry.attach(registryAddress);

  const results = [];

  for (const d of DEVICES) {
    const deviceEnv = readEnvFile(path.join(SECRETS_DIR, `${d.key}.env`));
    const deviceWallet = new ethers.Wallet(deviceEnv.PRIVATE_KEY, ethers.provider);

    const balance = await ethers.provider.getBalance(deviceWallet.address);
    if (balance < ethers.parseEther(FUND_AMOUNT)) {
      console.log(`funding ${d.name} (${deviceWallet.address}) with ${FUND_AMOUNT} BOT...`);
      const fundTx = await deployerWallet.sendTransaction({
        to: deviceWallet.address,
        value: ethers.parseEther(FUND_AMOUNT),
      });
      await fundTx.wait();
    } else {
      console.log(`${d.name} already funded (${ethers.formatEther(balance)} BOT)`);
    }

    console.log(`registering ${d.name}...`);
    const registerTx = await registry
      .connect(deviceWallet)
      .register(d.name, d.interval, d.slaBps, { value: ethers.parseEther(d.stake) });
    const receipt = await registerTx.wait();

    const deviceId = await registry.deviceCount();
    console.log(`  -> device id ${deviceId}, tx ${receipt.hash}`);

    results.push({
      name: d.name,
      deviceId: deviceId.toString(),
      operator: deviceWallet.address,
      intervalSec: d.interval,
      slaBps: d.slaBps,
      registerTx: receipt.hash,
    });
  }

  const outPath = path.join(__dirname, "..", "deployments", "devices.bohr.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
