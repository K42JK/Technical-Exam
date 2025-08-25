// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZumelNFT is ERC721Enumerable, Ownable {
    IERC20 public immutable paymentToken;
    uint256 public price = 50 * 10**18;
    uint256 private _nextId = 1;

    mapping(uint256 => string) private _tokenURIs;

    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor(address _paymentToken, address initialOwner) 
        ERC721("Zumel NFT", "ZUMELNFT") 
        Ownable(initialOwner) 
    {
        paymentToken = IERC20(_paymentToken);
    }

    function setPrice(uint256 newPrice) external onlyOwner {
        price = newPrice;
    }

    function mint(string memory uri) external {
        paymentToken.transferFrom(msg.sender, address(this), price); // will revert automatically if fails
        uint256 id = _nextId++;
        _safeMint(msg.sender, id);
        _tokenURIs[id] = uri;
        emit Minted(msg.sender, id, uri);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Nonexistent token");
        return _tokenURIs[tokenId];
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory ids) {
        uint256 n = balanceOf(owner);
        ids = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            ids[i] = tokenOfOwnerByIndex(owner, i);
        }
    }

    function withdrawZUMEL(address to, uint256 amount) external onlyOwner {
        require(paymentToken.transfer(to, amount), "Withdraw failed");
    }
}
