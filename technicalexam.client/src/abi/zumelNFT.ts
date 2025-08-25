export const ZUMEL_NFT_ABI = [
    // ERC721 core
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",

    // Enumerable & helpers you added
    "function tokensOfOwner(address owner) view returns (uint256[])",

    // Your custom API
    "function mint(string uri)",
    "function owner() view returns (address)",
    "function price() view returns (uint256)",
    "function paymentToken() view returns (address)",
] as const;
