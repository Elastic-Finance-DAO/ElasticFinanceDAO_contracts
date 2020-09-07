const connectionConfig = require('frg-ethereum-runners/config/network_config.json');
const HDWalletProvider = require("truffle-hdwallet-provider");

const mainnetUrl = 'https://mainnet.infura.io/v3/00233ca8f2c74d0c97ae3af7b9f80953';

function keystoreProvider (providerURL) {
  const fs = require('fs');
  const EthereumjsWallet = require('ethereumjs-wallet');
  const HDWalletProvider = require('truffle-hdwallet-provider');

  const KEYFILE = process.env.KEYFILE;
  const PASSPHRASE = (process.env.PASSPHRASE || '');
  if (!KEYFILE) {
    throw new Error('Expected environment variable KEYFILE with path to ethereum wallet keyfile');
  }

  const KEYSTORE = JSON.parse(fs.readFileSync(KEYFILE));
  const wallet = EthereumjsWallet.fromV3(KEYSTORE, PASSPHRASE);
  return new HDWalletProvider(wallet._privKey.toString('hex'), providerURL);
}


module.exports = {
  networks: {
    ganacheUnitTest: connectionConfig.ganacheUnitTest,
    ganacheIntegration: connectionConfig.ganacheIntegration,
    gethUnitTest: connectionConfig.gethUnitTest,
    testrpcCoverage: connectionConfig.testrpcCoverage,
    mainnet: {
      ref: 'mainnet-prod',
      network_id: 1,
      provider: () => keystoreProvider(mainnetUrl),
      gasPrice: 30000000000
    },
    kovan: {
      provider: () => new HDWalletProvider("", "https://kovan.infura.io/v3/00233ca8f2c74d0c97ae3af7b9f80953"),
      network_id: 42,
      gas: 6000000,
      gasPrice : 2000000000,
      skipDryRun: true
    },
    ganache: {
      host: "localhost",
      port: 8545,
      network_id: "5555",
      gas: 6500000
    }
  },
  mocha: {
    enableTimeouts: false,
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD'
    }
  },
  compilers: {
    solc: {
      version: '0.5.0',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
