Technical Exam – Ethereum Full-Stack (React + .NET)

A small full-stack dApp that:
  Connects a wallet via MetaMask
  Shows ETH balance and recent transactions
  Exposes a versioned ASP.NET Core API
      v1: Etherscan (gas, block, balance/dashboard)
      v2: Alchemy (gas, block, balance)
  Integrates ERC-20 (ZUMEL) and ERC-721 (ZumelNFT) on Sepolia
  Lets users approve ZUMEL spending and mint an NFT with a provided tokenURI

Stack
  Frontend
    React + Vite + TypeScript
    ethers v6
    Bootstrap 5
    MetaMask

Solidity (contracts on Sepolia)

Backend
  ASP.NET Core (versioned API via Asp.Versioning)
  IMemoryCache for lightweight caching
  Alchemy JSON-RPC & Etherscan REST

Contracts (Sepolia)
  ZUMEL (ERC-20)
      0xdB031faD0006787D7F799Ea2F39e53502260abb0
      https://sepolia.etherscan.io/address/0xdB031faD0006787D7F799Ea2F39e53502260abb0#code
  ZumelNFT (ERC-721)
      0xb89d729fDaF3ca921ED9fAa6Cbd75eB19e7D4150
      https://sepolia.etherscan.io/address/0xb89d729fDaF3ca921ED9fAa6Cbd75eB19e7D4150#code

  Network: Sepolia (chain id 11155111)

Screens
  Connect wallet (MetaMask)
  ETH balance + recent transactions
  Approve ZUMEL allowance
  Mint NFT (with tokenURI)
  Status & My NFTs
  Network & Gas (via backend v2)
  Getting Started

Prerequisites
  Node 18+ and your package manager (npm / pnpm / yarn)
  .NET SDK 8 (or the version used by the solution)
  MetaMask browser extension

API keys:
  Etherscan API key
  Alchemy HTTPS RPC URL (Sepolia)

Configuration
  Frontend env (client/.env or .env.local)

Sepolia by default
VITE_CHAIN_ID=11155111

Contract addresses (lowercased by code)
VITE_ZUMEL_TOKEN=0xdb031fad0006787d7f799ea2f39e53502260abb0
VITE_ZUMEL_NFT=0xb89d729fdaf3ca921ed9faa6cbd75eb19e7d4150

VITE_DEFAULT_TOKEN_URI=https://localhost:<your-api-port>/metadata/zumel-default.json


Backend appsettings.json
{
  "EtherscanApiSettings": {
    "BaseUrl": "",
    "ApiKey": ""
  },
  "Alchemy": {
    "ApiKey": "",
    "Network": "",
    "RpcUrl": ""
  }
}



Run
  Backend
    cd server
    dotnet restore
    dotnet run
# Swagger is available in Development (v1 & v2 groups)

  Frontend
    cd client
    npm install
    npm run dev
# Vite dev server runs with HTTPS (MetaMask-friendly)

Open the frontend URL (e.g. https://localhost:5173) and connect MetaMask on Sepolia.

API
  v1 – Etherscan-backed
      GET /api/v1/ethereum/GetBalance/{address}
      GET /api/v1/ethereum/GetGasOracle
      GET /api/v1/ethereum/GetBlockNumber
      GET /api/v1/ethereum/GetDashboard/{address}
          Returns { balance, gas oracle, block number } using a unified ApiResponse<T>.

  v2 – Alchemy-backed
      GET /api/v2/ethereum/GetEthereumData?address=<addr>
          Returns { address, balanceWei (hex), blockNumber (ulong), gasPrice (ulong) } wrapped in ApiResponse<T>.
Caching
  IMemoryCache for gas price & block number (short TTLs) to reduce upstream calls.

Frontend Features (Tier 1 & 4)
  MetaMask Connect (account/chain listeners; session persistence)
      ETH Balance (live via provider)
  Recent Transactions
      Scans recent blocks via the browser provider (illustrative; for production use a history API).
  Approve ZUMEL
      Set or revoke allowance for the NFT contract to spend ZUMEL
      Shows current allowance; disables Mint if allowance is insufficient
  Mint NFT
      Requires allowance ≥ mint price
      Accepts tokenURI (default points to /metadata/zumel-default.json)
      Shows tx link and tokenId after mint
      Status & My NFTs
  Lists owned token IDs for the configured NFT contract
      Network & Gas
      Reads block number & gas via backend v2 (Alchemy)
      UI: Bootstrap – simple cards & tables.

Backend Features (Tier 2)
  REST endpoints (v1 Etherscan, v2 Alchemy)
  API versioning with Asp.Versioning and grouped Swagger
  Caching via IMemoryCache with TTLs
  Utilities:
    JsonRpcUtilities – safe JSON-RPC calls (unified errors)
    ConverterUtilities – hex to numeric conversions
    CacheUtilities – simple GetWithCacheAsync

Smart Contracts (Tier 3)
  ZUMEL (ERC-20) – public mint with rate limit (OpenZeppelin ERC20)
                   Each address can mint up to 100 ZUMEL per 30 minutes (18-decimals).
  ZumelNFT (ERC-721) – mint for a price (paid in ZUMEL), per-token tokenURI, owner withdraw, tokensOfOwner.

  Both deployed to Sepolia.

Notes & Troubleshooting
  Wrong network: UI prompts to switch to Sepolia (chain id 11155111).
  Allowance vs. Mint: “Approve” authorizes the NFT contract to spend your ZUMEL.
                      You still sign the mint transaction, but you don’t need to approve again unless allowance is exhausted or revoked.
  Transactions table: built by scanning recent blocks via ethers.js; for production consider Alchemy / Etherscan / Covalent history APIs.
  HTTPS dev: Vite is configured with local dev certs so MetaMask will inject the provider on https://localhost.

Assumptions & Decisions

API design:
    EthereumController v1 (Etherscan) was kept to provide granular endpoints and potential reuse.
    v2 (Alchemy) was added to meet Tier-2 and provide a JSON-RPC-backed path.

Two contracts: 
    Separate ZUMEL Token and ZumelNFT to practice ERC-20 approvals + ERC-721 mint flows.

React + TypeScript:
    Chosen (despite limited prior experience) to hit the bonus and modern stack.

Known Issues / Limitations

Tier 1 – Transactions UI
    ethers.js browser provider doesn’t expose a search index; this component scans recent blocks (capped at ~3000) and may miss older txs.
    Verified locally (e.g., with Ganache) that matches render when found.

ZUMEL Token minting
    Per-address rate limit: 100 ZUMEL per 30 minutes.

Caching
    IMemoryCache paths are lightly tested; edge cases may still exist.

