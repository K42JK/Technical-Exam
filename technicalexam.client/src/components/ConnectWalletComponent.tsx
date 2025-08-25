import { useEffect, useState } from "react";
import { ethers } from "ethers";
import TransactionTableComponent from "./TransactionTableComponent";
import BalanceComponent from "./BalanceComponent";

function ConnectWalletComponent() {
    const [walletAddress, setWalletAddress] = useState<string>(
        () => sessionStorage.getItem("walletAddress") ?? ""
    );
    const [disableButton, setDisableButton] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!window.ethereum) return;

        const onAccountsChanged = (accounts: string[]) => {
            const next = accounts[0] ?? "";
            setWalletAddress(next);
            if (next) sessionStorage.setItem("walletAddress", next);
            else sessionStorage.removeItem("walletAddress");
        };

        const onChainChanged = () => {
            window.location.reload();
        };

        window.ethereum.on("accountsChanged", onAccountsChanged);
        window.ethereum.on("chainChanged", onChainChanged);

        return () => {
            window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
            window.ethereum?.removeListener("chainChanged", onChainChanged);
        };
    }, []);

    const connectWallet = async () => {
        setErr(null);
        if (!window.ethereum) {
            setErr("MetaMask not found. Please install it first.");
            return;
        }
        setDisableButton(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setWalletAddress(address);
            sessionStorage.setItem("walletAddress", address);
        } catch (e: any) {
            if (e?.code === 4001) {
                setErr("Connection request was rejected in MetaMask.");
            } else if (e?.code === -32002) {
                setErr("A connection request is already pending in MetaMask. Please open MetaMask and approve it.");
            } else {
                setErr(e?.message ?? "Unknown MetaMask error.");
            }
        } finally {
            setDisableButton(false);
        }
    };

    const disconnect = () => {
        sessionStorage.removeItem("walletAddress");
        setWalletAddress("");
        setErr(null);
    };

    if (!walletAddress) {
        return (
            <div className="card mb-3">
                <div className="card-header">Connect Wallet</div>
                <div className="card-body text-center">
                    {err && <div className="alert alert-danger">{err}</div>}
                    <button
                        className="btn btn-dark"
                        onClick={connectWallet}
                        disabled={disableButton}
                    >
                        {disableButton ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                Connecting...
                            </>
                        ) : (
                            "Connect MetaMask"
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <span>Wallet</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={disconnect}>
                    Disconnect
                </button>
            </div>
            <div className="card-body">
                {err && <div className="alert alert-danger">{err}</div>}

                <div className="mb-3">
                    <div className="form-label mb-1">Connected Address</div>
                    <div className="form-control font-monospace text-truncate">
                        {walletAddress}
                    </div>
                </div>

                <div className="mb-3">
                    <BalanceComponent walletAddress={walletAddress} />
                </div>

                <TransactionTableComponent walletAddress={walletAddress} />
            </div>
        </div>
    );
}

export default ConnectWalletComponent;
