// One-time migration: deregisters the 3 original 5s-interval devices and
// registers 3 fresh devices at a slower interval, so a single faucet claim
// lasts much longer. Reuses the same operator wallets (device-a/b/c), so
// only the on-chain device id and the daemon's declared interval change.
// Reads keys only from the gitignored repo-root .secrets/ directory.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const SECRETS_DIR = path.join(__dirname, "..", "..", ".secrets");
const DEPLOYMENT_PATH = path.join(__dirname, "..", "deployments", "bohr.json");

const NEW_INTERVAL_SEC = Number(process.env.NEW_INTERVAL_SEC || "60");
const NEW_SLA_BPS = 9000;
const NEW_STAKE = "0.3";
const TOPUP_AMOUNT = "0.5"; // BOT sent to each device wallet to cover deregister + register gas + stake
const POLL_MS = 15000;

const DEVICES = [
  { key: "device-a", oldId: 1, daemonEnv: "daemon-a.env" },
  { key: "device-b", oldId: 2, daemonEnv: "daemon-b.env" },
  { key: "device-c", oldId: 3, daemonEnv: "daemon-c.env" },
];

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

function updateEnvFile(filePath, updates) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const seen = new Set();
  const next = lines.map((line) => {
    const trimmed = line.trim();
    const idx = trimmed.indexOf("=");
    if (idx === -1) return line;
    const key = trimmed.slice(0, idx).trim();
    if (key in updates) {
      seen.add(key);
      return `${key}=${updates[key]}`;
    }
    return line;
  });
  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) next.push(`${key}=${value}`);
  }
  fs.writeFileSync(filePath, next.join("\n"));
}

async function waitForDeployerFunds(ethers, deployerWallet, minEth) {
  const min = ethers.parseEther(minEth);
  for (;;) {
    const balance = await ethers.provider.getBalance(deployerWallet.address);
    console.log(`deployer balance: ${ethers.formatEther(balance)} BOT (need >= ${minEth})`);
    if (balance >= min) return;
    console.log(`waiting ${POLL_MS / 1000}s for faucet funds into ${deployerWallet.address}...`);
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

async function main() {
  const { ethers } = hre;
  const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, "utf8"));
  const registryAddress = deployment.address;

  const deployerEnv = readEnvFile(path.join(SECRETS_DIR, "new-deployer.env"));
  const deployerWallet = new ethers.Wallet(deployerEnv.PRIVATE_KEY, ethers.provider);

  const neededForTopups = Number(TOPUP_AMOUNT) * DEVICES.length + 0.1; // + gas slack
  await waitForDeployerFunds(ethers, deployerWallet, String(neededForTopups));

  const Registry = await ethers.getContractFactory("ZoetraRegistry");
  const registry = Registry.attach(registryAddress);

  const results = [];

  for (const d of DEVICES) {
    const deviceEnv = readEnvFile(path.join(SECRETS_DIR, `${d.key}.env`));
    const deviceWallet = new ethers.Wallet(deviceEnv.PRIVATE_KEY, ethers.provider);

    console.log(`\n=== ${d.key} (${deviceWallet.address}) ===`);

    const balance = await ethers.provider.getBalance(deviceWallet.address);
    if (balance < ethers.parseEther(TOPUP_AMOUNT)) {
      console.log(`funding with ${TOPUP_AMOUNT} BOT...`);
      const fundTx = await deployerWallet.sendTransaction({
        to: deviceWallet.address,
        value: ethers.parseEther(TOPUP_AMOUNT),
      });
      await fundTx.wait();
    }

    console.log(`deregistering device #${d.oldId}...`);
    try {
      // Fetch the nonce right before sending: if this wallet has other
      // in-flight activity (e.g. a heartbeat daemon still running against
      // it), a nonce cached earlier in this loop can go stale and the send
      // fails with "nonce too low" instead of a real revert.
      const nonce = await ethers.provider.getTransactionCount(deviceWallet.address, "latest");
      const deregisterTx = await registry.connect(deviceWallet).deregister(d.oldId, { nonce });
      await deregisterTx.wait();
      console.log(`  deregistered`);
    } catch (err) {
      console.log(`  skip (already deregistered or not owned by this wallet): ${err.shortMessage || err.message}`);
    }

    console.log(`registering fresh device at ${NEW_INTERVAL_SEC}s interval...`);
    const registerTx = await registry
      .connect(deviceWallet)
      .register(d.key, NEW_INTERVAL_SEC, NEW_SLA_BPS, { value: ethers.parseEther(NEW_STAKE) });
    await registerTx.wait();
    const newId = await registry.deviceCount();
    console.log(`  -> new device id ${newId}`);

    const daemonEnvPath = path.join(SECRETS_DIR, d.daemonEnv);
    updateEnvFile(daemonEnvPath, {
      DEVICE_ID: newId.toString(),
      INTERVAL_MS: String(NEW_INTERVAL_SEC * 1000),
    });
    console.log(`  updated ${d.daemonEnv}: DEVICE_ID=${newId}, INTERVAL_MS=${NEW_INTERVAL_SEC * 1000}`);

    results.push({ name: d.key, oldId: d.oldId, newId: newId.toString(), intervalSec: NEW_INTERVAL_SEC });
  }

  console.log("\nmigration complete:", results);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
