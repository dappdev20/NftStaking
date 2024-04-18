import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"

const testnetURL= 'https://data-seed-prebsc-2-s2.binance.org:8545' as string;
const mainnetURL= 'https://bsc-dataseed1.binance.org/' as string;
const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    // for mainnet
    mainnet : {
      url: mainnetURL,
      accounts: [process.env.WALLET_KEY?.toString() as string],
      gasPrice: 1000000000,
    },
    // for testnet
    testnet : {
      url: testnetURL,
      accounts: [process.env.WALLET_KEY?.toString() as string],
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: "6X5CMTSHS28UPH1H4468DYRXVYGVPXGDG1",
      mainnet: "6X5CMTSHS28UPH1H4468DYRXVYGVPXGDG1"
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: false,
            runs: 200
          }
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      }
    ],
  },
};

export default config;
