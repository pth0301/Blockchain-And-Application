//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Token.sol";
import "hardhat/console.sol";

contract tokenSale is Ownable {
    
    Token public token;
    uint256 public SALE_DURATION = 30 days;
    uint256 public startTime;
    uint256 public tokensSold;
    uint public totalSupply;

    constructor (address _tokenAddress, uint256 _totalSupply) {
        token = Token(_tokenAddress);
        totalSupply= _totalSupply;
        startTime = block.timestamp;
    }
    /** Allow your users to buy up to 50% of the tokens from you by paying ETH to your wallet
    * When 50% of your tokens are sold, stop allowing other users to buy
    * Set the price of your token as follows:
    *  + For the first 25% of your tokens, each token costs 5 ETH
    *  + After 25% of your tokens were sold, each token costs 10 ETH
    * After 30 days, stop the token sale campaign
     */
    function buyTokens(uint256 amountTokens) public payable {
        require(block.timestamp <= startTime + SALE_DURATION, "Token sale campaign is stopped");
        require(tokensSold + amountTokens <= (totalSupply / 2), "Buying tokens is stopped");

        uint256 price = getTokenPrice(amountTokens);
        require(msg.value >= price, "Insufficient ETH sent");

        tokensSold += amountTokens;
        token.transfer(msg.sender, amountTokens);

    }

    function getTokenPrice(uint256 amountTokens) public view returns (uint256){
        uint256 firstTime = totalSupply / 4;
        uint256 price;

        if (tokensSold + amountTokens <= firstTime){
            price = amountTokens * 5 ether;
        }else{
            price = amountTokens * 10 ether;
        }
        return price;
    }


}