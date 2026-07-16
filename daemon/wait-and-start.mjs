// Polls a wallet's balance and spawns heartbeat.mjs the moment it's funded,
// so you don't have to babysit the fund-then-restart cycle after topping up BOT
// claim or topup. Reads the same env file heartbeat.mjs uses.
import { createPublicClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.env.ZOETRA_ENV_FILE || path.join(__dirname, ".env");
loadEnvFile(envFile);

const RPC_URL = requireEnv("RPC_URL");
const PRIVATE_KEY = requireEnv("PRIVATE_KEY");
const CHAIN_ID = Number(process.env.CHAIN_ID || "677");
const POLL_MS = Number(process.env.POLL_MS || "10000");
const MIN_BALANCE_WEI = BigInt(process.env.MIN_BALANCE_WEI || "50000000000000000"); // 0.05 BOT

const chain = defineChain({
  id: CHAIN_ID,
  name: "bot-chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

function log(...args) {
  console.log(`[wait-and-start:${account.address.slice(0, 8)}]`, ...args);
}

async function poll() {
  const balance = await publicClient.getBalance({ address: account.address });
  log(`balance=${(Number(balance) / 1e18).toFixed(4)} BOT, need >= ${(Number(MIN_BALANCE_WEI) / 1e18).toFixed(4)} BOT`);
  if (balance >= MIN_BALANCE_WEI) {
    log("funded, starting heartbeat.mjs");
    const child = spawn(process.execPath, [path.join(__dirname, "heartbeat.mjs")], {
      env: { ...process.env, ZOETRA_ENV_FILE: envFile },
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      log(`heartbeat.mjs exited with code ${code}`);
      process.exit(code ?? 0);
    });
    return;
  }
  setTimeout(poll, POLL_MS);
}

log(`watching ${account.address} on chain ${CHAIN_ID}, polling every ${POLL_MS}ms`);
poll();

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
