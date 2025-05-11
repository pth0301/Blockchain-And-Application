const hre = require("hardhat");

async function main() {
    const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
    const totalSupply = hre.ethers.utils.parseUnits("1000000", 18); 


    const TokenSale = await hre.ethers.getContractFactory("tokenSale");
    const tokenSale = await TokenSale.deploy(tokenAddress, totalSupply);
    await tokenSale.deployed();

    console.log("TokenSale deployed to:", tokenSale.address);
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
