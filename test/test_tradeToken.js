const { expect } = require("chai");
const { ethers } = require("hardhat");
require("dotenv").config();

describe("TradeToken", function () {
  let token, tradeToken;
  let ownerWallet, addr1;
  let tokenAmount;
  let buyValue;

  beforeEach(async function () {
    [_, addr1] = await ethers.getSigners();

    const provider = ethers.provider;
    await _.sendTransaction({
      to: ethers.computeAddress(process.env.PRIVATE_KEY),
      value: ethers.parseEther("100"),
    });

    ownerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    tokenAmount = ethers.parseUnits("100000", 18);
    buyValue = ethers.parseEther("10");

    const TokenFactory = await ethers.getContractFactory("Token", ownerWallet);
    token = await TokenFactory.deploy("PhanThuHa", "Ha", ownerWallet.address);
    await token.waitForDeployment();

    await token.connect(ownerWallet).mint();

    const TradeTokenFactory = await ethers.getContractFactory("TradeToken", ownerWallet);
    tradeToken = await TradeTokenFactory.deploy(token.target);
    await tradeToken.waitForDeployment();

    await token.connect(ownerWallet).approve(tradeToken.target, tokenAmount);
    await token.connect(ownerWallet).transfer(tradeToken.target, tokenAmount);

    await ownerWallet.sendTransaction({
      to: tradeToken.target,
      value: ethers.parseEther("50"),
    });
  });

  it("Should set the correct token address", async function () {
    expect(await tradeToken.token()).to.equal(token.target);
  });

  it("Should allow a user to buy tokens", async function () {
    await tradeToken.connect(addr1).buy({ value: buyValue });

    const userBalance = await token.balanceOf(addr1.address);
    const lastPrice = await tradeToken.lastPrice();
    const decimals = await token.decimals();
    const expectedAmount = buyValue * (10n ** BigInt(decimals)) / lastPrice;
    expect(userBalance).to.equal(expectedAmount);
  });

  it("Should forward ETH to the owner's wallet when buying tokens", async function () {
    const initialOwnerBalance = await ethers.provider.getBalance(ownerWallet.address);

    const tx = await tradeToken.connect(addr1).buy({ value: buyValue });
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const updatedOwnerBalance = await ethers.provider.getBalance(ownerWallet.address);

    // Note: You can loosen this test a bit depending on how precision behaves
    expect(updatedOwnerBalance).to.equal(initialOwnerBalance + buyValue);
  });

  it("Should update price over time", async function () {
    const initialPrice = await tradeToken.lastPrice();

    await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 2 days
    await ethers.provider.send("evm_mine");

    await tradeToken.connect(addr1).buy({ value: buyValue });

    const newPrice = await tradeToken.lastPrice();
    expect(newPrice).to.be.gt(initialPrice);
  });

  it("Should allow a user to sell tokens", async function () {
    await tradeToken.connect(addr1).buy({ value: buyValue });

    const userBalance = await token.balanceOf(addr1.address);
    await token.connect(addr1).approve(tradeToken.target, userBalance);

    const userInitialEth = await ethers.provider.getBalance(addr1.address);

    const tx = await tradeToken.connect(addr1).sell(userBalance);
    const receipt = await tx.wait();

    const gasCost = receipt.gasUsed * receipt.gasPrice;
    const userFinalEth = await ethers.provider.getBalance(addr1.address);

    expect(userFinalEth + gasCost).to.be.gt(userInitialEth - 1n);
  });

  it("Should revert when selling 0 tokens", async function () {
    await expect(tradeToken.connect(addr1).sell(0)).to.be.revertedWith("Insufficient tokens");
  });
});
