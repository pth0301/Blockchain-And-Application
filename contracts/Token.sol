// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is Ownable, ERC20 {
    string private constant _symbol = 'Titan';               
    string private constant _name = 'Titanium';               

    constructor() ERC20(_name, _symbol) Ownable(msg.sender) {}

    function mint(uint amount) 
        public 
        onlyOwner
    {
        _mint(msg.sender, amount *  10 ** decimals());
    }
}