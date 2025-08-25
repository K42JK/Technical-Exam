import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, formatEther } from "ethers";
import type { WalletAddressProps, TxRow } from "../types/properties";

function TransactionTableComponent({ walletAddress }: WalletAddressProps) {
    const [rows, setRows] = useState<TxRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const provider = useMemo(() => {
        if (!window.ethereum) return null;
        return new BrowserProvider(window.ethereum);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const fetchTxs = async () => {
            setError(null);
            setRows([]);
            if (!walletAddress || !provider) return;

            setLoading(true);
            try {
                const latest = await provider.getBlockNumber();

                const maxBlocksToScan = 3000;
                const batchSize = 25;
                const targetCount = 10;

                const out: TxRow[] = [];
                const a = walletAddress.toLowerCase();
                let current = latest;

                while (current >= 0 && out.length < targetCount) {
                    const start = Math.max(0, current - batchSize + 1);
                    const blockNums: number[] = [];
                    for (let b = current; b >= start; b--) blockNums.push(b);

                    const blocks = await Promise.all(
                        blockNums.map((bn) => provider.getBlock(bn).catch(() => null))
                    );

                    for (const block of blocks) {
                        if (!block) continue;

                        // block.transactions is string[] of tx hashes
                        for (const txHash of block.transactions) {
                            const tx = await provider.getTransaction(txHash).catch(() => null);
                            if (!tx) continue;

                            const from = tx.from?.toLowerCase();
                            const to = tx.to?.toLowerCase() ?? null;

                            if (from === a || to === a) {
                                const gp = (tx as any).gasPrice ?? (tx as any).maxFeePerGas ?? 0n; // EIP-1559 safe
                                out.push({
                                    hash: tx.hash,
                                    from: tx.from,
                                    to: tx.to ?? null,
                                    valueEth: formatEther(tx.value ?? 0n),
                                    gasPriceEth: formatEther(gp),
                                    blockNumber: Number(tx.blockNumber ?? block.number),
                                    time: block.timestamp ? block.timestamp * 1000 : null,
                                });
                                if (out.length >= targetCount) break;
                            }
                        }
                        if (out.length >= targetCount) break;
                    }

                    current = start - 1;
                    if (latest - current > maxBlocksToScan) break; 
                }

                const unique = Array.from(new Map(out.map((t) => [t.hash, t])).values())
                    .sort((x, y) => y.blockNumber - x.blockNumber || (y.time ?? 0) - (x.time ?? 0))
                    .slice(0, targetCount);

                if (!cancelled) setRows(unique);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Failed to load transactions");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchTxs();
        return () => {
            cancelled = true;
        };
    }, [walletAddress, provider]);

    return (
        <div className="card mt-3">
            <div className="card-header">Transaction History</div>

            <div className="card-body p-0">
                {!walletAddress && (
                    <div className="p-3 text-muted">Connect a wallet to see recent transactions.</div>
                )}

                {error && <div className="alert alert-danger m-3 mb-0">{error}</div>}

                {loading && (
                    <div className="d-flex justify-content-center align-items-center p-4">
                        <div className="spinner-border" role="status" aria-label="Loading" />
                    </div>
                )}

                {!loading && !error && walletAddress && rows.length === 0 && (
                    <div className="p-3 text-muted">No recent transactions found (scanned recent blocks).</div>
                )}

                {!loading && !error && rows.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-sm table-striped table-hover mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: 110 }}>Block</th>
                                    <th>Hash</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th className="text-end" style={{ width: 140 }}>Value (ETH)</th>
                                    <th className="text-end" style={{ width: 160 }}>Gas Price (ETH)</th>
                                    <th style={{ width: 200 }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((tx) => (
                                    <tr key={tx.hash}>
                                        <td className="font-monospace">{tx.blockNumber.toLocaleString()}</td>

                                        <td className="font-monospace" title={tx.hash}>
                                            <span className="d-inline-block text-truncate" style={{ maxWidth: "16ch" }}>
                                                {tx.hash}
                                            </span>
                                        </td>

                                        <td className="font-monospace" title={tx.from}>
                                            <span className="d-inline-block text-truncate" style={{ maxWidth: "16ch" }}>
                                                {tx.from}
                                            </span>
                                        </td>

                                        <td className="font-monospace" title={tx.to ?? ""}>
                                            <span className="d-inline-block text-truncate" style={{ maxWidth: "16ch" }}>
                                                {tx.to ?? "—"}
                                            </span>
                                        </td>

                                        <td className="text-end">
                                            {Number(tx.valueEth).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                        </td>

                                        <td className="text-end">
                                            {Number(tx.gasPriceEth).toLocaleString(undefined, { maximumFractionDigits: 9 })}
                                        </td>

                                        <td title={tx.time ? new Date(tx.time).toLocaleString() : ""}>
                                            {tx.time ? new Date(tx.time).toLocaleString() : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
export default TransactionTableComponent;