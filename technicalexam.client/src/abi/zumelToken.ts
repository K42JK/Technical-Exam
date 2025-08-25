export const ZUMEL_TOKEN_ABI = [
    // ERC20 standard
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
    "function transfer(address to, uint256 value) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",

    // Your extras
    "function mint(uint256 amount)",
    "function burn(uint256 amount)",
    "function MAX_MINT_PER_PERIOD() view returns (uint256)",
    "function MINT_PERIOD() view returns (uint256)",
    "function lastMintTime(address) view returns (uint256)",
    "function mintedInPeriod(address) view returns (uint256)",
] as const;