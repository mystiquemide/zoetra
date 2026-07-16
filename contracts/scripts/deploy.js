const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  const expectedChainIds = { botchain: 677 };
  const expectedChainId = expectedChainIds[network];
  const actualChainId = Number((await hre.ethers.provider.getNetwork()).chainId);

  if (expectedChainId && actualChainId !== expectedChainId) {
    throw new Error(`wrong chain: ${network} expected ${expectedChainId}, got ${actualChainId}`);
  }

  const Registry = await hre.ethers.getContractFactory("ZoetraRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const chainId = actualChainId;

  console.log(`ZoetraRegistry deployed to ${address} on ${network} (chainId ${chainId})`);

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, `${network}.json`),
    JSON.stringify({ network, chainId, address, deployedAt: new Date().toISOString() }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
