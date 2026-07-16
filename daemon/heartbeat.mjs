import { createWalletClient, createPublicClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnvFile(process.env.ZOETRA_ENV_FILE || path.join(__dirname, ".env"));

const RPC_URL = requireEnv("RPC_URL");
const PRIVATE_KEY = requireEnv("PRIVATE_KEY");
const DEVICE_ID = requireEnv("DEVICE_ID");
const INTERVAL_MS = Number(process.env.INTERVAL_MS || "5000");
const MAX_BEATS = Number(process.env.MAX_BEATS || "0");
const REGISTRY_ADDRESS = requireEnv("REGISTRY_ADDRESS");
const CHAIN_ID = Number(process.env.CHAIN_ID || "677");

const registryAbi = [
  {
    type: "function",
    name: "heartbeat",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
];

const chain = defineChain({
  id: CHAIN_ID,
  name: "bot-chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
const walletClient = createWalletClient({ account, chain, transport: http(RPC_URL) });

const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL || "";
const WARN_BEATS_REMAINING = 50n;
const CRITICAL_BEATS_REMAINING = 10n;

let stopped = false;
let tickCount = 0;
let lastTxCostWei = null;
let balanceAlertLevel = null; // null | "warn" | "critical"

function log(...args) {
  console.log(`[zoetra:${DEVICE_ID}]`, ...args);
}

async function notify(text) {
  log(text);
  if (!ALERT_WEBHOOK_URL) return;
  try {
    await fetch(ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `Zoetra device ${DEVICE_ID} (${account.address}): ${text}` }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    log(`webhook delivery failed: ${err.message}`);
  }
}

async function checkBalance() {
  let costEstimate = lastTxCostWei;
  if (costEstimate === null) {
    const gasPrice = await publicClient.getGasPrice();
    costEstimate = gasPrice * 30000n; // conservative pre-first-success estimate
  }
  if (costEstimate === 0n) return;

  const balance = await publicClient.getBalance({ address: account.address });
  const beatsRemaining = balance / costEstimate;

  let level = null;
  if (beatsRemaining < CRITICAL_BEATS_REMAINING) level = "critical";
  else if (beatsRemaining < WARN_BEATS_REMAINING) level = "warn";

  if (level === balanceAlertLevel) return;
  balanceAlertLevel = level;

  if (level === "critical") {
    await notify(`CRITICAL low balance, ~${beatsRemaining} heartbeats of gas left. Top up now or it will start missing SLA.`);
  } else if (level === "warn") {
    await notify(`LOW BALANCE WARNING, ~${beatsRemaining} heartbeats of gas left. Plan a top-up soon.`);
  } else {
    log(`balance recovered, ~${beatsRemaining} heartbeats of gas available`);
  }
}

async function beatOnce() {
  const startedAt = Date.now();
  try {
    const hash = await walletClient.writeContract({
      address: REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: "heartbeat",
      args: [BigInt(DEVICE_ID)],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    lastTxCostWei = receipt.gasUsed * receipt.effectiveGasPrice;
    const latencyMs = Date.now() - startedAt;
    log(`beat #${tickCount} tx=${hash} block=${receipt.blockNumber} latency=${latencyMs}ms`);
  } catch (err) {
    log(`beat #${tickCount} FAILED: ${err.shortMessage || err.message}`);
  }

  try {
    await checkBalance();
  } catch (err) {
    log(`balance check failed: ${err.message}`);
  }
}

async function run() {
  log(
    `starting: device=${DEVICE_ID} interval=${INTERVAL_MS}ms maxBeats=${MAX_BEATS || "unlimited"} registry=${REGISTRY_ADDRESS} chain=${CHAIN_ID} operator=${account.address}`
  );

  const scheduleStart = Date.now();
  while (!stopped) {
    tickCount += 1;
    await beatOnce();

    if (MAX_BEATS > 0 && tickCount >= MAX_BEATS) {
      log(`max beats reached (${MAX_BEATS}), exiting cleanly`);
      stopped = true;
      break;
    }

    const nextTick = scheduleStart + tickCount * INTERVAL_MS;
    const waitMs = Math.max(0, nextTick - Date.now());
    await sleep(waitMs);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`missing required env var ${name}`);
    process.exit(1);
  }
  return value;
}

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

process.on("SIGINT", () => {
  log("stopped (SIGINT)");
  stopped = true;
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("stopped (SIGTERM)");
  stopped = true;
  process.exit(0);
});

run();
