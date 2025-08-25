// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ZumelToken is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;

    // Rate limiting
    uint256 public constant MAX_MINT_PER_PERIOD = 100 * 10**18; // 100 tokens
    uint256 public constant MINT_PERIOD = 30 minutes;

    mapping(address => uint256) public lastMintTime;
    mapping(address => uint256) public mintedInPeriod;

    constructor() ERC20("Zumel Token", "ZUMEL") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @notice Public mint function with rate limiting
     */
    function mint(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= MAX_MINT_PER_PERIOD, "Exceeds max per mint");

        // Reset the period if enough time has passed
        if (block.timestamp > lastMintTime[msg.sender] + MINT_PERIOD) {
            lastMintTime[msg.sender] = block.timestamp;
            mintedInPeriod[msg.sender] = 0;
        }

        require(
            mintedInPeriod[msg.sender] + amount <= MAX_MINT_PER_PERIOD,
            "Rate limit exceeded for 30 min"
        );

        mintedInPeriod[msg.sender] += amount;
        _mint(msg.sender, amount);
    }

    /**
     * @notice Optional: burn your tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}