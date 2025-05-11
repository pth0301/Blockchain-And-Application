const hre = require("hardhat");

async function main(){
    const TokenSaleContract = await hre.ethers.getContractAt("tokenSale");
    const tokenSaleContract = await TokenSaleContract.deploy();
    await tokenSaleContract.deploy();

    console.log(`TokenSale address: ${tokenSaleContract.address}`);
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });