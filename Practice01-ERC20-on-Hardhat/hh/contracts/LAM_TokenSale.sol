// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LAM_Token.sol";

contract LAM_TokenSale {
    LAM_Token public token;
    address public owner;
    uint256 public rate = 1000; // 1 ETH = 1000 LAM

    constructor(address tokenAddress) {
        token = LAM_Token(tokenAddress);
        owner = msg.sender;
    }

    function buy() external payable {
        require(msg.value > 0, "Send ETH to buy tokens");

        uint256 amount = msg.value * rate;
        uint256 allowance = token.allowance(owner, address(this));

        require(allowance >= amount, "Not enough allowance for sale");

        bool ok = token.transferFrom(owner, msg.sender, amount);
        require(ok, "Token transfer failed");
    }

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }
}
