import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";
import { CHAIN_ID, ZUMEL_TOKEN, ZUMEL_NFT, explorerBase } from "@/config/web3";
import { ZUMEL_TOKEN_ABI } from "@/abi";
import { friendlyEthersError } from "@/utilities/errors";
import type { ApproveZUMELCardProps } from "@/types/properties";

const ApproveZUMELCard: React.FC<ApproveZUMELCardProps> = ({ walletAddress, chainId, decimals, priceRaw, allowanceRaw, onChanged}) => {
    const [amountInput, setAmountInput] = useState<string>("");
    const [unlimited, setUnlimited] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const provider = useMemo(() => (window.ethereum ? new BrowserProvider(window.ethereum) : null), []);
    const base = explorerBase(chainId ?? CHAIN_ID);

    const approveDisabled = !walletAddress || busy || (!unlimited && !amountInput);

    const doApprove = async () => {
        if (!provider || !walletAddress) return;
        setErr(null);
        setBusy(true);
        try {
            const signer = await provider.getSigner();
            const erc20 = new Contract(ZUMEL_TOKEN, ZUMEL_TOKEN_ABI, signer);

            const amountRaw = unlimited
                ? (2n ** 256n - 1n)
                : parseUnits(amountInput || "0", decimals);

            const tx = await erc20.approve(ZUMEL_NFT, amountRaw);
            const receipt = await tx.wait();

            await onChanged?.();
            setAmountInput("");
        } catch (e: any) {
            setErr(friendlyEthersError(e));
        } finally {
            setBusy(false);
        }
    };

    const revoke = async () => {
        if (!provider || !walletAddress) return;
        setErr(null);
        setBusy(true);
        try {
            const signer = await provider.getSigner();
            const erc20 = new Contract(ZUMEL_TOKEN, ZUMEL_TOKEN_ABI, signer);
            const tx = await erc20.approve(ZUMEL_NFT, 0);
            await tx.wait();
            await onChanged?.();
        } catch (e: any) {
            setErr(friendlyEthersError(e));
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        if (!provider || !walletAddress) return;
        const erc20 = new Contract(ZUMEL_TOKEN, ZUMEL_TOKEN_ABI, provider);
        const handler = (owner: string, spender: string) => {
            if (
                owner?.toLowerCase() === walletAddress.toLowerCase() &&
                spender?.toLowerCase() === ZUMEL_NFT.toLowerCase()
            ) {
                void onChanged?.();
            }
        };
        erc20.on("Approval", handler);
        return () => { erc20.off("Approval", handler); };
    }, [provider, walletAddress, onChanged]);

    return (
        <div className="card">
            <div className="card-header">Approve ZUMEL</div>
            <div className="card-body">
                {err && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {err}
                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setErr(null)} />
                    </div>
                )}

                <p className="mb-2">
                    <strong>Current allowance:</strong>{" "}
                    {allowanceRaw !== null ? `${formatUnits(allowanceRaw, decimals)} ZUMEL` : "—"}
                </p>
                <p className="mb-3">
                    <strong>Current mint price:</strong>{" "}
                    {priceRaw !== null ? `${formatUnits(priceRaw, decimals)} ZUMEL` : "—"}
                </p>

                <div className="form-check form-switch mb-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="unlimitedSwitch"
                        checked={unlimited}
                        onChange={(e) => setUnlimited(e.target.checked)}
                        disabled={busy}
                    />
                    <label className="form-check-label" htmlFor="unlimitedSwitch">
                        Approve unlimited (MaxUint256)
                    </label>
                </div>

                {!unlimited && (
                    <>
                        <label htmlFor="approveAmount" className="form-label">Amount (ZUMEL)</label>
                        <input
                            id="approveAmount"
                            className="form-control mb-3"
                            placeholder={priceRaw !== null ? formatUnits(priceRaw, decimals) : "e.g. 50"}
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            disabled={busy}
                            inputMode="decimal"
                        />
                    </>
                )}

                <div className="d-flex gap-2">
                    <button className="btn btn-primary" onClick={doApprove} disabled={approveDisabled}>
                        {busy ? "Submitting..." : "Approve"}
                    </button>
                    <button className="btn btn-outline-danger" onClick={revoke} disabled={!walletAddress || busy}>
                        Revoke
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveZUMELCard;
