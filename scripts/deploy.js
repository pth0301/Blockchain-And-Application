async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with owner:", deployer.address);

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("Group08", "G8", deployer.address);
  await token.deployed();

  console.log("Token deployed at:", token.address);

  const TradeToken = await ethers.getContractFactory("TradeToken");
  const tradeToken = await TradeToken.deploy(token.address);
  await tradeToken.deployed();

  console.log("TradeToken deployed at:", tradeToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
