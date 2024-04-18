// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTContract is ERC721Enumerable, Ownable {
    uint256 public _mintCost = 1000000000000000; // 0.001 ETH.
    uint256 public _maxPerWallet = 10;
    uint256 public _maxSupply = 10000;
    uint256 public _totalSupply;
    string baseUri;
    mapping(address => uint256) public walletMints;
    mapping(address => uint256[]) public userMintedTokens;

    constructor(
        string memory _initBaseUri
    ) ERC721("NFT Contract", "APE") Ownable(msg.sender) {
        baseUri = _initBaseUri;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }

    function mint(uint256 _mintAmount) public payable {
        require(msg.value >= _mintAmount*_mintCost, "Wrong mint value.");
        require(_totalSupply + _mintAmount <= _maxSupply, "Sold out.");
        require(walletMints[msg.sender] + _mintAmount <= _maxPerWallet, "Max collectibles minted.");

        // High gas fees when > 1
        for (uint256 i = 0; i < _mintAmount; i++) {
            _totalSupply++;
            uint256 tokenId = _totalSupply;
            walletMints[msg.sender]++;
            userMintedTokens[msg.sender].push(tokenId);
            _safeMint(msg.sender, tokenId);
        }
    }

    function tokenURI(uint256 _tokenId)
    public
    view
    virtual
    override
    returns (string memory) {
        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, "/", Strings.toString(_tokenId), ".json"))
            : "";
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os, "Withdraw failed.");
    }

    // Function to get all tokens minted by a user
    function getMintedTokens(address user) public view returns (uint256[] memory) {
        return userMintedTokens[user];
    }
}