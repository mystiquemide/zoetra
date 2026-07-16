require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // contracts/.env: non-secret RPC config
require("dotenv").config({ path: "../.secrets/deployer.env" }); // gitignored, holds PRIVATE_KEY

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
const accounts = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    botchain: {
      url: process.env.BOTCHAIN_RPC_URL || "https://rpc.botchain.ai",
      chainId: 677,
      accounts,
    },
    hardhat: {},
  },
  etherscan: {
    apiKey: {
      botchain: process.env.BOTCHAIN_EXPLORER_API_KEY || "blockscout",
    },
    customChains: [
      {
        network: "botchain",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
    ],
  },
};
