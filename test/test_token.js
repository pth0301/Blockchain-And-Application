const { expect } = require("chai");
const { ethers } = require("hardhat");
require("dotenv").config();

describe("Token", function () {
  let token;
  let ownerWallet;
  let addr1;

  beforeEach(async function () {
    [_, addr1] = await ethers.getSigners();

    // Fund the custom ownerWallet 
    const provider = ethers.provider;
    const fundedSigner = _;
    await fundedSigner.sendTransaction({
      to: ethers.computeAddress(process.env.PRIVATE_KEY),
      value: ethers.parseEther("100"),
    });

    // Create custom wallet and connect to provider
    ownerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const TokenFactory = await ethers.getContractFactory("Token", ownerWallet);
    token = await TokenFactory.deploy("PhanThuHa", "Ha", ownerWallet.address);
    await token.waitForDeployment();

  });

  it("Should set correct name and symbol", async function () {
    expect(await token.name()).to.equal("PhanThuHa");
    expect(await token.symbol()).to.equal("Ha");
  });

  it("Should set the correct owner", async function () {
    expect(await token.owner()).to.equal(ownerWallet.address);
  });

  it("Should mint tokens only by owner", async function () {
    const amountMinted = ethers.parseUnits("100000", 18);
    await token.connect(ownerWallet).mint();
    const balance = await token.balanceOf(ownerWallet.address);
    expect(balance).to.equal(amountMinted);
  });

  it("Should fail if non-owner tries to mint", async function () {
    try {
      await token.connect(addr1).mint();
      // If it gets here, the test should fail
      expect.fail("Expected transaction to revert, but it succeeded");
    } catch (error) {
      // Check revert reason (optional)
      expect(error.message).to.include("OwnableUnauthorizedAccount");
    }
  });
});
