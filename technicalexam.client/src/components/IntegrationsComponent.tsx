import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CHAIN_ID, ZUMEL_TOKEN, ZUMEL_NFT } from "@/config/web3";
import { ZUMEL_TOKEN_ABI, ZUMEL_NFT_ABI } from "@/abi";
import ApproveZUMELCard from "@/components/ApproveZUMELCard";
import MintNftCard from "@/components/MintNftCard";
import MintZumelCard from "@/components/MintZumelCard";
import StatusMyNftsCard from "@/components/StatusMyNftsCard";
import { switchToRequiredChain } from "@/utilities/network";
import NetworkGasCard from "@/components/NetworkGasCard";
import { friendlyEthersError } from "@/utilities/errors";

const Integrations: React.FC = () => {
    const [walletAddress, setWalletAddress] = useState<string | null>(
        () => sessionStorage.getItem("walletAddress") ?? null
    );
    const [chainId, setChainId] = useState<bigint | null>(null);

    const [decimals, setDecimals] = useState<number>(18);
    const [priceRaw, setPriceRaw] = useState<bigint | null>(null);
    const [allowanceRaw, setAllowanceRaw] = useState<bigint | null>(null);

    const [nftsRefreshKey, setNftsRefreshKey] = useState(0);

    const [preLoading, setPreLoading] = useState(false);
    const [preError, setPreError] = useState<string | null>(null);

    const provider = useMemo(() => {
        if (!window.ethereum) return null;
        return new BrowserProvider(window.ethereum);
    }, []);

    useEffect(() => {
        if (!window.ethereum) return;

        const onAccountsChanged = (accounts: string[]) => {
            const next = accounts?.[0] ?? "";
            const addr = next || null;
            setWalletAddress(addr);
            if (addr) sessionStorage.setItem("walletAddress", addr);
            else sessionStorage.removeItem("walletAddress");
        };

        const onChainChanged = async () => {
            if (!provider) return;
            const net = await provider.getNetwork();
            setChainId(net.chainId);
        };

        window.ethereum.on("accountsChanged", onAccountsChanged);
        window.ethereum.on("chainChanged", onChainChanged);

        // initial network fetch
        (async () => {
            if (!provider) return;
            const net = await provider.getNetwork();
            setChainId(net.chainId);
        })();

        return () => {
            window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
            window.ethereum?.removeListener("chainChanged", onChainChanged);
        };
    }, [provider]);

    const refreshPrereqs = useCallback(async () => {
        if (!provider || !walletAddress) return;

        setPreError(null);
        setPreLoading(true);

        try {
            const net = await provider.getNetwork();
            if (Number(net.chainId) !== Number(CHAIN_ID)) {
                throw new Error(`Wrong network: expected ${CHAIN_ID}, got ${net.chainId}`);
            }

            const erc20 = new Contract(ZUMEL_TOKEN, ZUMEL_TOKEN_ABI, provider);
            const nft = new Contract(ZUMEL_NFT, ZUMEL_NFT_ABI, provider);

            const [decR, priceR, allowR] = await Promise.allSettled([
                erc20.decimals(),
                nft.price(),
                erc20.allowance(walletAddress, ZUMEL_NFT),
            ]);

            if (decR.status === "fulfilled") setDecimals(Number(decR.value));
            else setPreError((e) => (e ?? "") + (e ? "\n" : "") + friendlyEthersError(decR.reason));

            if (priceR.status === "fulfilled") setPriceRaw(priceR.value as bigint);
            else setPreError((e) => (e ?? "") + (e ? "\n" : "") + friendlyEthersError(priceR.reason));

            if (allowR.status === "fulfilled") setAllowanceRaw(allowR.value as bigint);
            else setPreError((e) => (e ?? "") + (e ? "\n" : "") + friendlyEthersError(allowR.reason));
        } catch (err: any) {
            setPreError(friendlyEthersError(err));
        } finally {
            setPreLoading(false);
        }
    }, [provider, walletAddress]);

    useEffect(() => {
        void refreshPrereqs();
    }, [walletAddress, chainId, refreshPrereqs]);

    const afterMint = useCallback(() => {
        void refreshPrereqs();
        setTimeout(() => setNftsRefreshKey((k) => k + 1), 800);
    }, [refreshPrereqs]);

    const isConnected = !!walletAddress;
    const isOnRequired = Number(chainId) === CHAIN_ID;

    const handleSwitch = async () => {
        try {
            await switchToRequiredChain();
            const net = await provider?.getNetwork();
            if (net) setChainId(net.chainId);
            void refreshPrereqs();
        } catch (e: any) {
            alert(e?.message ?? "Failed to switch network");
        }
    };


    return (
        <div className="row">
            {isConnected && !isOnRequired && (
                    <div className="col-12 mb-3">
                        <div className="alert alert-warning d-flex justify-content-between align-items-center mb-0">
                            <span>Please switch network to the required chain ({CHAIN_ID === 11155111 ? "Sepolia" : CHAIN_ID}).</span>
                            <button className="btn btn-sm btn-primary" onClick={handleSwitch}>
                                Switch now
                            </button>
                        </div>
                    </div>
            )}


            {isConnected && isOnRequired && (
                <div className="col-lg-6 mb-3">
                    <div className="d-grid gap-3">
                        <ApproveZUMELCard
                            walletAddress={walletAddress}
                            chainId={chainId}
                            decimals={decimals}
                            priceRaw={priceRaw}
                            allowanceRaw={allowanceRaw}
                            onChanged={refreshPrereqs}
                        />

                        <MintZumelCard
                            walletAddress={walletAddress}
                            chainId={chainId}
                            decimals={decimals}
                            onChanged={refreshPrereqs}   
                        />
                    </div>
                </div>
            )}
           

            {isConnected && isOnRequired && (
                <div className="col-lg-6 mb-3">
                    <MintNftCard
                        walletAddress={walletAddress}
                        chainId={chainId}
                        decimals={decimals}
                        priceRaw={priceRaw}
                        allowanceRaw={allowanceRaw}
                        onRefresh={refreshPrereqs}
                        onMinted={afterMint}
                    />
                </div>
            )}

            <div className="col-12 mb-3">
                <NetworkGasCard walletAddress={walletAddress} />
            </div>
            <div className="col-12 mb-3">
                <StatusMyNftsCard
                    walletAddress={walletAddress}
                    chainId={chainId}
                    refreshKey={nftsRefreshKey}
                />
            </div>
        </div>
    );
};

export default Integrations;
