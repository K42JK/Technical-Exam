export type WalletAddressProps = {
    walletAddress: string;
};


export type TxRow = {
    hash: string;
    from: string;
    to: string | null;
    valueEth: string;    
    gasPriceEth: string; 
    blockNumber: number;
    time: number | null;  
};


export interface WalletScopedProps {
    walletAddress: string;
    chainId: bigint | null;
}


export interface WithChangedCallback {
    onChanged?: () => void;
}


export interface WithMintedCallback {
    onMinted?: (tokenId: string) => void;
}

export interface WithRefreshCallback {
    onRefresh?: () => void;
}

export interface PriceAllowanceStateProps {
    decimals: number;
    priceWei: bigint | null;
    allowanceWei: bigint | null;
}

export type ApproveZUMELCardProps = {
    walletAddress?: string | null;
    chainId?: bigint | null;
    decimals: number;
    priceRaw: bigint | null;
    allowanceRaw: bigint | null;
    onChanged?: () => Promise<void> | void;
};

export type MintNftCardProps = {
    walletAddress?: string | null;
    chainId?: bigint | null;
    decimals: number;
    priceRaw: bigint | null;
    allowanceRaw: bigint | null;
    onMinted?: (tokenId?: string) => void;
    onRefresh?: () => Promise<void> | void;
}; 