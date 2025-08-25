export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 11155111); // Sepolia default
export const ZUMEL_TOKEN = String(import.meta.env.VITE_ZUMEL_TOKEN ?? "").toLowerCase();
export const ZUMEL_NFT = String(import.meta.env.VITE_ZUMEL_NFT ?? "").toLowerCase();
export const DEFAULT_TOKEN_URI = String(import.meta.env.VITE_DEFAULT_TOKEN_URI ?? "https://localhost:56613/metadata/zumel-default.json");

export const EXPLORERS: Record<number, string> = {
    1: "https://etherscan.io",
    5: "https://goerli.etherscan.io",
    11155111: "https://sepolia.etherscan.io",
};

export const explorerBase = (chainId?: bigint | number) =>
    EXPLORERS[Number(chainId ?? CHAIN_ID)] ?? EXPLORERS[1];

export const CHAIN_HEX = "0x" + CHAIN_ID.toString(16);
export const CHAIN_NAME = (CHAIN_ID === 11155111) ? "Sepolia" :
    (CHAIN_ID === 1 ? "Ethereum" :
        (CHAIN_ID === 5 ? "Goerli" : `Chain ${CHAIN_ID}`));

export const CHAIN_RPC_URL =
    String(import.meta.env.VITE_CHAIN_RPC_URL ?? "https://rpc.sepolia.org");

export const ADD_CHAIN_PARAMS = {
    chainId: CHAIN_HEX,
    chainName: CHAIN_NAME,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: [CHAIN_RPC_URL],
    blockExplorerUrls: [explorerBase(CHAIN_ID)],
};
