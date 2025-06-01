/** @type import('hardhat/config').HardhatUserConfig */
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
module.exports = {
  solidity: "0.8.28",
  networks: {
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC,
      accounts: [process.env.PRIVATE_KEY],     
    }
  }
};
