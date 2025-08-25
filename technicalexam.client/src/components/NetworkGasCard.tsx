import { useEffect, useRef, useState } from "react";

type GetEthereumData = {
    address: string;
    balanceWei: string;    
    blockNumber: number;
    gasPrice: number;        
};

type ApiResponse<T> = {
    status: string;
    message: string;
    result: T | null;
};

type Props = {
    walletAddress?: string | null;
    /** Polling interval in ms (default 15s) */
    pollingMs?: number;
};

function formatEthWeiString(weiStr: string) {
    const wei = BigInt(weiStr);
    const ether = Number(wei) / 1e18; 
    return ether.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function formatGwei(weiNum: number) {
    const gwei = weiNum / 1e9;
    return gwei.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const NetworkGasCard: React.FC<Props> = ({ walletAddress, pollingMs = 15000 }) => {
    const [data, setData] = useState<GetEthereumData | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);
    const timerRef = useRef<number | null>(null);

    function isAbortError(err: any) {
        return err?.name === "AbortError"
            || err?.code === 20
            || (typeof err?.message === "string" && /abort/i.test(err.message));
    }


    async function fetchNow(signal?: AbortSignal) {
        if (!walletAddress) return;
        setErr(null);
        setLoading(true);
        try {
            const url = `/api/v2/ethereum/GetEthereumData?address=${encodeURIComponent(walletAddress)}`;
            const res = await fetch(url, { signal });
            const text = await res.text();
            
            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 160)}`);

            const payload = JSON.parse(text) as ApiResponse<GetEthereumData>;
            if (payload.status !== "1" || !payload.result) {
                throw new Error(payload.message || "Backend returned an error");
            }

            setData(payload.result);
            setLastUpdated(Date.now());
        } catch (e: any) {
            if (isAbortError(e)) {
                return;
            }
            setErr(e?.message ?? "Failed to fetch");
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!walletAddress) {
            setData(null);
            setErr(null);
            setLastUpdated(null);
            if (timerRef.current) window.clearInterval(timerRef.current);
            timerRef.current = null;
            return;
        }

        const ac = new AbortController();
        void fetchNow(ac.signal);

        timerRef.current = window.setInterval(() => {
            void fetchNow();
        }, pollingMs);

        return () => {
            ac.abort();
            if (timerRef.current) window.clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [walletAddress, pollingMs]);

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <span>Network &amp; Gas</span>
                {/*<button*/}
                {/*    className="btn btn-sm btn-outline-secondary"*/}
                {/*    onClick={() => fetchNow()}*/}
                {/*    disabled={loading || !walletAddress}*/}
                {/*    title="Refresh now"*/}
                {/*>*/}
                {/*    Refresh*/}
                {/*</button>*/}
            </div>
            
            <div className="card-body">
                {!walletAddress && <p className="text-muted mb-0">Connect a wallet to see network status.</p>}

                {walletAddress && err && (
                    <div className="alert alert-danger" role="alert">{err}</div>
                )}
                
                {walletAddress && !err && (
                    <>
                        {loading && <p className="text-muted">Loading...</p>}
                        
                        {data && (
                            <div className="row">
                                <div className="col-12 col-md-4 mb-2">
                                    <div><strong>Block</strong></div>
                                    <div>{data.blockNumber.toLocaleString()}</div>
                                </div>
                                <div className="col-12 col-md-4 mb-2">
                                    <div><strong>Gas (gwei)</strong></div>
                                    <div>{formatGwei(data.gasPrice)}</div>
                                </div>
                                <div className="col-12 col-md-4 mb-2">
                                    <div><strong>ETH balance</strong></div>
                                    <div>{data ? formatEthWeiString(data.balanceWei) : "—"} ETH</div>
                                </div>
                            </div>
                        )}

                        {lastUpdated && (
                            <small className="text-muted">
                                Updated: {new Date(lastUpdated).toLocaleTimeString()}
                            </small>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NetworkGasCard;
