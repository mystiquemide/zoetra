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
const REGISTRY_ADDRESS = requireEnv("REGISTRY_ADDRESS");
const CHAIN_ID = Number(process.env.CHAIN_ID || "968");

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

let stopped = false;
let tickCount = 0;

function log(...args) {
  console.log(`[zoetra:${DEVICE_ID}]`, ...args);
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
    const latencyMs = Date.now() - startedAt;
    log(`beat #${tickCount} tx=${hash} block=${receipt.blockNumber} latency=${latencyMs}ms`);
  } catch (err) {
    log(`beat #${tickCount} FAILED: ${err.shortMessage || err.message}`);
  }
}

async function run() {
  log(`starting: device=${DEVICE_ID} interval=${INTERVAL_MS}ms registry=${REGISTRY_ADDRESS} chain=${CHAIN_ID} operator=${account.address}`);

  const scheduleStart = Date.now();
  while (!stopped) {
    tickCount += 1;
    await beatOnce();

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
