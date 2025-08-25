# Technical Exam – Ethereum Full-Stack (React + .NET)

A small full-stack dApp that:<br />
  Connects a wallet via MetaMask<br />
  Shows ETH balance and recent transactions<br />
  Exposes a versioned ASP.NET Core API<br />
      *v1: Etherscan (gas, block, balance/dashboard)<br />
      *v2: Alchemy (gas, block, balance)<br />
  *Integrates ERC-20 (ZUMEL) and ERC-721 (ZumelNFT) on Sepolia<br />
  *Lets users approve ZUMEL spending and mint an NFT with a provided tokenURI<br />

# Stack
  Frontend<br />
    React + Vite + TypeScript<br />
    ethers v6<br />
    Bootstrap 5<br />
    MetaMask<br />

Solidity (contracts on Sepolia)<br />

Backend<br />
  ASP.NET Core (versioned API via Asp.Versioning)<br />
  IMemoryCache for lightweight caching<br />
  Alchemy JSON-RPC & Etherscan REST<br />

Contracts (Sepolia)<br />
  ZUMEL (ERC-20)<br />
      0xdB031faD000678D7F799Ea2F39e53502260abb0<br />
      https://sepolia.etherscan.io/address/0xdB031faD0006787D7F799Ea2F39e53502260abb0<br />
  ZumelNFT (ERC-721)<br />
      0xb89d729fDaF3ca921ED9fAa6Cbd75eB19e7D4150<br />
      https://sepolia.etherscan.io/address/0xb89d729fDaF3ca921ED9fAa6Cbd75eB19e7D4150<br />
  Network: Sepolia (chain id 11155111)<br />

# Screens
  Connect wallet (MetaMask)<br />
  ETH balance + recent transactions<br />
  Approve ZUMEL allowance<br />
  Mint NFT (with tokenURI)<br />
  Status & My NFTs<br />
  Network & Gas (via backend v2)<br />
  Getting Started<br />

# Prerequisites
  Node 18+ and your package manager (npm / pnpm / yarn)<br />
  .NET SDK 8 (or the version used by the solution)<br />
  MetaMask browser extension<br />

API keys:
  Etherscan API key<br />
  Alchemy HTTPS RPC URL (Sepolia)<br />

Configuration<br />
  Frontend env (client/.env or .env.local)<br />

Sepolia by default<br />
VITE_CHAIN_ID=11155111<br />

Contract addresses (lowercased by code)<br />
VITE_ZUMEL_TOKEN=0xdb031fad0006787d7f799ea2f39e53502260abb0<br />
VITE_ZUMEL_NFT=0xb89d729fdaf3ca921ed9faa6cbd75eb19e7d4150<br />

VITE_DEFAULT_TOKEN_URI=https://localhost:<your-api-port>/metadata/zumel-default.json<br />


Backend appsettings.json<br />
{<br />
  "EtherscanApiSettings": {<br />
    "BaseUrl": "",<br />
    "ApiKey": ""<br />
  },<br />
  "Alchemy": {<br />
    "ApiKey": "",<br />
    "Network": "",<br />
    "RpcUrl": ""<br />
  }<br />
}<br />



Run<br />
  Backend<br />
    cd server<br />
    dotnet restore<br />
    dotnet run<br />
Swagger is available in Development (v1 & v2 groups)<br />

  Frontend<br />
    cd client<br />
    npm install<br />
    npm run dev<br />
Vite dev server runs with HTTPS (MetaMask-friendly)<br />

Open the frontend URL (e.g. https://localhost:5173) and connect MetaMask on Sepolia.<br />

API<br />
  v1 – Etherscan-backed<br />
      GET /api/v1/ethereum/GetBalance/{address}<br />
      GET /api/v1/ethereum/GetGasOracle<br />
      GET /api/v1/ethereum/GetBlockNumber<br />
      GET /api/v1/ethereum/GetDashboard/{address}<br />
          Returns { balance, gas oracle, block number } using a unified ApiResponse<T>.<br />

  v2 – Alchemy-backed<br />
      GET /api/v2/ethereum/GetEthereumData?address=<addr><br />
          Returns { address, balanceWei (hex), blockNumber (ulong), gasPrice (ulong) } wrapped in ApiResponse<T>.<br />
Caching<br />
  IMemoryCache for gas price & block number (short TTLs) to reduce upstream calls.<br />

Frontend Features (Tier 1 & 4)<br />
  MetaMask Connect (account/chain listeners; session persistence)<br />
      ETH Balance (live via provider)<br />
  Recent Transactions<br />
      Scans recent blocks via the browser provider (illustrative; for production use a history API).<br />
  Approve ZUMEL<br />
      Set or revoke allowance for the NFT contract to spend ZUMEL<br />
      Shows current allowance; disables Mint if allowance is insufficient<br />
  Mint NFT<br />
      Requires allowance ≥ mint price<br />
      Accepts tokenURI (default points to /metadata/zumel-default.json)<br />
      Shows tx link and tokenId after mint<br />
      Status & My NFTs<br />
  Lists owned token IDs for the configured NFT contract<br />
      Network & Gas<br />
      Reads block number & gas via backend v2 (Alchemy)<br />
      UI: Bootstrap – simple cards & tables.<br />

# Backend Features (Tier 2)
  REST endpoints (v1 Etherscan, v2 Alchemy)<br />
  API versioning with Asp.Versioning and grouped Swagger<br />
  Caching via IMemoryCache with TTLs<br />
  Utilities:<br />
    JsonRpcUtilities – safe JSON-RPC calls (unified errors)<br />
    ConverterUtilities – hex to numeric conversions<br />
    CacheUtilities – simple GetWithCacheAsync<br />

# Smart Contracts (Tier 3)
  ZUMEL (ERC-20) – public mint with rate limit (OpenZeppelin ERC20)<br />
                   Each address can mint up to 100 ZUMEL per 30 minutes (18-decimals).<br />
  ZumelNFT (ERC-721) – mint for a price (paid in ZUMEL), per-token tokenURI, owner withdraw, tokensOfOwner.<br />

  Both deployed to Sepolia.<br />

# Notes & Troubleshooting
  Wrong network: UI prompts to switch to Sepolia (chain id 11155111).<br />
  Allowance vs. Mint: “Approve” authorizes the NFT contract to spend your ZUMEL.<br />
                      You still sign the mint transaction, but you don’t need to approve again unless allowance is exhausted or revoked.<br />
  Transactions table: built by scanning recent blocks via ethers.js; for production consider Alchemy / Etherscan / Covalent history APIs.<br />
  HTTPS dev: Vite is configured with local dev certs so MetaMask will inject the provider on https://localhost.<br />

# Assumptions & Decisions

API design:<br />
    EthereumController v1 (Etherscan) was kept to provide granular endpoints and potential reuse.<br />
    v2 (Alchemy) was added to meet Tier-2 and provide a JSON-RPC-backed path.<br />

Two contracts: <br />
    Separate ZUMEL Token and ZumelNFT to practice ERC-20 approvals + ERC-721 mint flows.<br />

React + TypeScript:<br />
    Chosen (despite limited prior experience) to hit the bonus and modern stack.<br />

# Known Issues / Limitations

Tier 1 – Transactions UI<br />
    ethers.js browser provider doesn’t expose a search index; this component scans recent blocks (capped at ~3000) and may miss older txs.<br />
    Verified locally (e.g., with Ganache) that matches render when found.<br />

ZUMEL Token minting<br />
    Per-address rate limit: 100 ZUMEL per 30 minutes.<br />

Caching<br />
    IMemoryCache paths are lightly tested; edge cases may still exist.<br />

Package<br />
    I will test and update the How to setup the environment, coming from this repository to a working env.<br />





