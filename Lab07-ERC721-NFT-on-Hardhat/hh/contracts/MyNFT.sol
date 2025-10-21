// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * dùng ERC721URIStorage để dễ lưu tokenURI string cho mỗi token.
 * 
 * onlyOwner để chỉ account deployer có quyền mint - để dễ test.
 */
contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _currentTokenId;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    function mintTo(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _currentTokenId += 1;
        uint256 newItemId = _currentTokenId;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}
