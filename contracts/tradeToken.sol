// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Token.sol";
import "hardhat/console.sol";

contract TradeToken {
    Token public token;
    address public owner;
    uint256 public basePrice = 5 ether; // Initial token price
    uint256 public lastPrice;
    uint256 public lastUpdate;

    event Buy(address indexed buyer, uint256 ethSpent, uint256 tokensReceived, uint256 price);
    event Sell(address indexed seller, uint256 tokensSold, uint256 ethReceived, uint256 price);

    constructor(address _tokenAddress) {
        token = Token(_tokenAddress);
        owner = msg.sender;
        lastPrice = basePrice;
        lastUpdate = block.timestamp;
    }

    // Compute new price using wallet balance
    function updatePrice() public {
        uint256 ethBalance = owner.balance;
        uint256 interestRate = (ethBalance * 1e18) / (2 * 10**9); // Scale to handle decimals
        uint256 timeElapsed = block.timestamp - lastUpdate;
        lastPrice += (interestRate * timeElapsed) / 1 days;
        lastUpdate = block.timestamp;
    }

    // Buy function
    function buy() public payable {
        require(msg.value > 0, "Insufficient ETH");

        updatePrice(); 
        uint256 amount = (msg.value * (10 ** token.decimals())) / lastPrice;

        // Send ETH directly to owner's wallet
        (bool sent, ) = payable(owner).call{value: msg.value}("");
        require(sent, "ETH transfer failed");

        // Transfer token to buyer from contract's balance
        require(token.transfer(msg.sender, amount), "Token transfer failed");

        emit Buy(msg.sender, msg.value, amount, lastPrice);
    }

    // Sell function
    function sell(uint256 amount) public {
        require(amount > 0, "Insufficient tokens");

        updatePrice();
        uint256 ethAmount = (amount * lastPrice) / (10 ** token.decimals());

        require(address(this).balance >= ethAmount, "Insufficient ETH in contract");

        // Transfer tokens from user to owner
        require(token.transferFrom(msg.sender, owner, amount), "Token transfer failed");

        // Send ETH from contract to user
        (bool sent, ) = payable(msg.sender).call{value: ethAmount}("");
        require(sent, "ETH transfer failed");

        emit Sell(msg.sender, amount, ethAmount, lastPrice);
    }

    receive() external payable {}
}
