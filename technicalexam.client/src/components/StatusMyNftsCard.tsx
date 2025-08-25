// src/components/StatusMyNftsCard.tsx
import React, { useEffect, useState } from "react";
import { ZUMEL_NFT, explorerBase, CHAIN_ID } from "@/config/web3";

type OwnedItem = {
    tokenIdHex: string;
    tokenId: string;           
    title?: string | null;
    tokenUri?: string | null;
    imageUrl?: string | null;
};

type OwnedNftsResponse = { items: OwnedItem[] };
type ApiResponse<T> = { status: string; message: string; result: T | null };

type Props = {
    walletAddress?: string | null;
    chainId?: bigint | null;
    refreshKey?: number;
};

const StatusMyNftsCard: React.FC<Props> = ({ walletAddress, chainId, refreshKey }) => {
    const [items, setItems] = useState<OwnedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [localRefreshKey, setLocalRefreshKey] = useState(0);

    const base = explorerBase(chainId ?? CHAIN_ID);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setErr(null);
            setItems([]);
            if (!walletAddress) return;

            setLoading(true);
            try {
                const url =
                    `/api/v2/nft/owned?owner=${encodeURIComponent(walletAddress)}&contractAddress=${ZUMEL_NFT}`;

                const res = await fetch(url, { method: "GET" });
                const text = await res.text();

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 140)}`);
                }

                let data: ApiResponse<OwnedNftsResponse>;
                try {
                    data = JSON.parse(text);
                } catch {
                    throw new Error(
                        `Unexpected non-JSON from API (first bytes: ${text.slice(0, 80)}). ` +
                        `Check your Vite proxy and Program.cs route order.`
                    );
                }

                if (data.status !== "1" || !data.result) {
                    throw new Error(data.message || "Failed to load NFTs");
                }

                if (!cancelled) setItems(data.result.items ?? []);
            } catch (e: any) {
                if (!cancelled) setErr(e?.message ?? "Failed to load NFTs");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [walletAddress, chainId, refreshKey, localRefreshKey]);

    const triggerLocalRefresh = () => setLocalRefreshKey((k) => k + 1);

    return (
        <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
                <span>Status &amp; My NFTs</span>
                {/*<button*/}
                {/*    className="btn btn-sm btn-outline-secondary"*/}
                {/*    onClick={triggerLocalRefresh}*/}
                {/*    disabled={loading || !walletAddress}*/}
                {/*    title="Refresh owned NFTs"*/}
                {/*>*/}
                {/*    Refresh*/}
                {/*</button>*/}
            </div>

            <div className="card-body">
                {!walletAddress && <p className="text-muted mb-0">Connect your wallet to view your NFTs.</p>}

                {walletAddress && loading && <p className="text-muted mb-0">Loading...</p>}

                {walletAddress && err && (
                    <div className="alert alert-danger" role="alert">
                        {err}
                    </div>
                )}

                {walletAddress && !loading && !err && items.length === 0 && (
                    <p className="text-muted mb-0">No NFTs found for this contract.</p>
                )}

                {items.length > 0 && (
                    <div className="row g-3">
                        {items.map((nft) => (
                            <div key={nft.tokenIdHex} className="col-12 col-sm-6 col-lg-4">
                                <div className="card h-100">
                                    {nft.imageUrl && (
                                        <img
                                            src={nft.imageUrl}
                                            className="card-img-top"
                                            alt={nft.title ?? `Token #${nft.tokenId}`}
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                        />
                                    )}
                                    <div className="card-body">
                                        <h6 className="card-title mb-1">{nft.title ?? `Token #${nft.tokenId}`}</h6>
                                        <div className="small text-muted">ID: {nft.tokenId}</div>

                                        <div className="mt-2 d-flex gap-2 flex-wrap">
                                            <a
                                                className="btn btn-sm btn-outline-primary"
                                                href={`${base}/token/${ZUMEL_NFT}?a=${nft.tokenId}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="View on Etherscan"
                                            >
                                                Etherscan
                                            </a>
                                            {nft.tokenUri && (
                                                <a
                                                    className="btn btn-sm btn-outline-secondary"
                                                    href={nft.tokenUri}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title="Open token metadata"
                                                >
                                                    Metadata
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusMyNftsCard;
