import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-truffle5";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "@typechain/hardhat";
import 'dotenv/config';

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    testnet: {
      url: 'https://evm-t3.cronos.org',
      chainId: 338,
      accounts: [
        process.env.TESTNET_DEPLOYER_PRIVATE_KEY,
        process.env.TESTNET_OWNER_PRIVATE_KEY,
      ].filter((pk) => !!pk),
    },
    mainnet: {
      url: `https://evm.cronos.org`,
      chainId: 25,
      accounts: [
        process.env.MAINNET_DEPLOYER_PRIVATE_KEY,
        process.env.MAINNET_OWNER_PRIVATE_KEY,
      ].filter((pk) => !!pk),
    },
    ethereum_goerli: {
      url: `https://goerli.blockpi.network/v1/rpc/public`,
      chainId: 5,
      accounts: [
        process.env.TESTNET_DEPLOYER_PRIVATE_KEY,
        process.env.TESTNET_OWNER_PRIVATE_KEY,
      ].filter((pk) => !!pk),
    },
    ethereum_holesky: {
      url: `https://ethereum-holesky.publicnode.com`,
      chainId: 17000,
      accounts: [
        process.env.TESTNET_DEPLOYER_PRIVATE_KEY,
        process.env.TESTNET_OWNER_PRIVATE_KEY,
      ].filter((pk) => !!pk),
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000000,
          },
        },
      },
      {
        version: "0.8.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000000,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "@types/generated",
    target: "truffle-v5",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    tokenOwner: {
      default: 1,
    },
    masterMinter: {
      default: 1,
    },
    pauser: {
      default: 1,
    },
    blacklister: {
      default: 1,
    },
    lostAndFound: {
      default: 1,
    },
    mintForwarderOwner: {
      default: 1,
      25: "TBD",
    },
    exchangeRateUpdaterOwner: {
      default: 1,
      25: "TBD",
    },
  },
  mocha: {
    timeout: 0,
  },
};
