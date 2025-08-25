import React, { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";
import { CHAIN_ID, ZUMEL_TOKEN, explorerBase } from "@/config/web3";
import { ZUMEL_TOKEN_ABI } from "@/abi";
import { friendlyEthersError } from "@/utilities/errors";

type Props = {
    walletAddress?: string | null;
    chainId?: bigint | null;
    decimals: number;
    onChanged?: () => Promise<void> | void;
};

const MintZumelCard: React.FC<Props> = ({ walletAddress, chainId, decimals, onChanged }) => {
    const [amountInput, setAmountInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [balanceRaw, setBalanceRaw] = useState<bigint | null>(null);
    const [lastTx, setLastTx] = useState<string | null>(null);

    const [maxPerPeriodRaw, setMaxPerPeriodRaw] = useState<bigint | null>(null);
    const [periodSec, setPeriodSec] = useState<number | null>(null);

    const provider = useMemo(() => (window.ethereum ? new BrowserProvider(window.ethereum) : null), []);
    const base = explorerBase(chainId ?? CHAIN_ID);

    const canSubmit = !!walletAddress && !!amountInput && !busy;

    async function refreshBalance() {
        if (!provider || !walletAddress) return;
        const erc20 = new Contract(ZUMEL_TOKEN, ZUMEL_TOKEN_ABI, provider);
        const bal = (await erc20.balanceOf(walletAddress)) as bigint;
        setBalanceRaw(bal);
    }

    async function refreshLimits() {
        if (!provider) return;
        const erc20 = new Contract(ZUMEL_TOKEN, ZUMEL_TOKEN_ABI, provider);
      
        if (typeof (erc20 as any).MAX_MINT_PER_PERIOD === "function") {
            const max = (await (erc20 as any).MAX_MINT_PER_PERIOD()) as bigint;
            setMaxPerPeriodRaw(max);
        }
     
      
        if (typeof (erc20 as any).MINT_PERIOD === "function") {
            const p = (await (erc20 as any).MINT_PERIOD()) as bigint;
            setPeriodSec(Number(p));
        }
        
    }

    useEffect(() => {
        void refreshBalance();
        void refreshLimits();
    }, [walletAddress, chainId, provider]);

    async function mintZml() {
        if (!provider || !walletAddress) return;
        setErr(null);
        setBusy(true);
        setLastTx(null);
        try {
            const amountRaw = parseUnits(amountInput || "0", decimals);
            if (amountRaw <= 0n) {
                setErr("Enter a positive amount.");
                return;
            }

            if (maxPerPeriodRaw && amountRaw > maxPerPeriodRaw) {
                setErr(
                    `Amount exceeds max per mint: ${formatUnits(maxPerPeriodRaw, decimals)} ZUMEL` +
                    (periodSec ? ` (per ${Math.round(periodSec / 60)} min)` : "")
                );
                return;
            }

            const signer = await provider.getSigner();
            const erc20 = new Contract(ZUMEL_TOKEN, ZUMEL_TOKEN_ABI, signer);

            const tx = await (erc20 as any).mint(amountRaw);
            const receipt = await tx.wait();
            setLastTx(receipt.hash);

            setAmountInput("");
            await refreshBalance();
            await onChanged?.();
        } catch (e: any) {
            setErr(friendlyEthersError(e));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <span>Mint ZUMEL (ERC-20)</span>
                {/*<button*/}
                {/*    className="btn btn-sm btn-outline-secondary"*/}
                {/*    onClick={() => { void refreshBalance(); void refreshLimits(); }}*/}
                {/*    disabled={busy}*/}
                {/*    title="Refresh balance and limits"*/}
                {/*>*/}
                {/*    Refresh*/}
                {/*</button>*/}
            </div>
            <div className="card-body">
                {err && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {err}
                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setErr(null)} />
                    </div>
                )}

                <p className="mb-2">
                    <strong>Your ZUMEL balance:</strong>{" "}
                    {balanceRaw !== null ? `${formatUnits(balanceRaw, decimals)} ZUMEL` : "—"}
                </p>
                {maxPerPeriodRaw && (
                    <p className="text-muted mb-3">
                        Max per mint: {formatUnits(maxPerPeriodRaw, decimals)} ZUMEL
                        {periodSec ? ` (per ~${Math.round(periodSec / 60)} min)` : ""}
                    </p>
                )}

                <label htmlFor="zmlAmount" className="form-label">Amount (ZUMEL)</label>
                <input
                    id="zmlAmount"
                    className="form-control mb-3"
                    placeholder="e.g. 50"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    disabled={busy}
                    inputMode="decimal"
                />

                <button className="btn btn-primary" onClick={mintZml} disabled={!canSubmit}>
                    {busy ? "Minting..." : "Mint ZUMEL"}
                </button>

                {lastTx && (
                    <div className="mt-3">
                        <a href={`${base}/tx/${lastTx}`} target="_blank" rel="noreferrer">
                            View transaction on Etherscan
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MintZumelCard;