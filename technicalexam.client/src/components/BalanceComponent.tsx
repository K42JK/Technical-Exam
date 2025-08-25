import { BrowserProvider, formatEther } from "ethers";
import { useEffect, useState } from "react";
import type { WalletAddressProps } from "../types/properties";

function BalanceComponent({ walletAddress }: WalletAddressProps) {
    const [balance, setBalance] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatEthForDisplay = (raw: string) => {
        if (!raw) return "0";
        const [intPart, decPart = ""] = raw.split(".");
        const intFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
            Number(intPart || "0")
        );
        const trimmedDec = decPart.slice(0, 6).replace(/0+$/, "");
        return trimmedDec ? `${intFmt}.${trimmedDec}` : intFmt;
    };

    useEffect(() => {
        let cancelled = false;

        const fetchBalance = async () => {
            setError(null);
            setBalance("");
            if (!walletAddress) return;

            if (!window.ethereum) {
                setError("MetaMask not found");
                return;
            }

            setLoading(true);
            try {
                const provider = new BrowserProvider(window.ethereum);
                const raw = await provider.getBalance(walletAddress);
                const eth = formatEther(raw);
                if (!cancelled) setBalance(eth);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Error fetching balance");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchBalance();
        return () => {
            cancelled = true;
        };
    }, [walletAddress]);

    if (!walletAddress) return <h3 className="h3">ETH balance: —</h3>;
    if (loading) return <h3 className="h3">ETH balance: loading...</h3>;
    if (error) return <h3 className="h3" style={{ color: "crimson" }}>ETH balance: {error}</h3>;

    return <h3 className="h3">ETH balance: {formatEthForDisplay(balance)}</h3>;
}

export default BalanceComponent;