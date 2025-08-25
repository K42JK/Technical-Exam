import React, { useMemo, useState } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { CHAIN_ID, ZUMEL_NFT, ZUMEL_TOKEN, DEFAULT_TOKEN_URI, explorerBase } from "@/config/web3";
import { ZUMEL_NFT_ABI, ZUMEL_TOKEN_ABI } from "@/abi";
import { friendlyEthersError } from "@/utilities/errors";
import type { MintNftCardProps } from "@/types/properties";

const MintNftCard: React.FC<MintNftCardProps> = ({ walletAddress, chainId, decimals, priceRaw, allowanceRaw, onMinted, onRefresh }) => {
    const baseUrl = explorerBase(chainId ?? CHAIN_ID);
    const [tokenUri, setTokenUri] = useState<string>(DEFAULT_TOKEN_URI);
    const [minting, setMinting] = useState(false);
    const [mintTx, setMintTx] = useState<string | null>(null);
    const [mintTokenId, setMintTokenId] = useState<string | null>(null);
    const [mintErr, setMintErr] = useState<string | null>(null);

    const provider = useMemo(() => (window.ethereum ? new BrowserProvider(window.ethereum) : null), []);

    const allowanceTooLow =
        allowanceRaw !== null && priceRaw !== null && allowanceRaw < priceRaw;

    const canMint =
        !!walletAddress &&
        !!tokenUri &&
        priceRaw !== null &&
        allowanceRaw !== null &&
        allowanceRaw >= priceRaw &&
        !minting;

    async function mintNft() {
        if (!provider || !walletAddress) return;
        setMintErr(null);
        setMintTx(null);
        setMintTokenId(null);
        setMinting(true);
        try {
            const erc20 = new Contract(ZUMEL_TOKEN, ZUMEL_TOKEN_ABI, provider);
            const bal = (await erc20.balanceOf(walletAddress)) as bigint;
            if (priceRaw && bal < priceRaw) {
                setMintErr(
                    `Insufficient ZUMEL balance. Need ${formatUnits(priceRaw, decimals)} ZUMEL, ` +
                    `you have ${formatUnits(bal, decimals)}.`
                );
                return;
            }

            const signer = await provider.getSigner();
            const nft = new Contract(ZUMEL_NFT, ZUMEL_NFT_ABI, signer);

            const tx = await nft.mint(tokenUri);
            setMintTx(tx.hash);
            const receipt = await tx.wait();

            let tokenIdFound: string | null = null;
                for (const log of receipt.logs ?? []) {                   
                    const parsed = nft.interface.parseLog(log);
                    if (parsed?.name === "Transfer") {
                        const to = (parsed.args?.to as string)?.toLowerCase?.();
                        if (to && walletAddress && to === walletAddress.toLowerCase()) {
                            const tid = parsed.args?.tokenId?.toString?.();
                            if (tid) { tokenIdFound = tid; break; }
                        }
                    }                   
                }

            if (tokenIdFound) {
                setMintTokenId(tokenIdFound);
                onMinted?.(tokenIdFound);
            }

            await onRefresh?.(); // refresh decimals/price/allowance after mint
        } catch (e: any) {
            setMintErr(friendlyEthersError(e));
        } finally {
            setMinting(false);
        }
    }

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <span>Mint NFT</span>
                {/*<button*/}
                {/*    className="btn btn-sm btn-outline-secondary"*/}
                {/*    onClick={() => onRefresh?.()}*/}
                {/*    disabled={minting}*/}
                {/*    title="Refresh price & allowance"*/}
                {/*>*/}
                {/*    Refresh*/}
                {/*</button>*/}
            </div>
            <div className="card-body">
                {mintErr && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {mintErr}
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={() => setMintErr(null)}
                            style={{ float: "right" }}
                        />
                    </div>
                )}

                <p className="mb-3">
                    <strong>Mint price:</strong>{" "}
                    {priceRaw !== null ? formatUnits(priceRaw, decimals) : "—"} ZUMEL
                </p>

                <label htmlFor="tokenUri" className="form-label">tokenURI</label>
                <input
                    id="tokenUri"
                    type="url"
                    className="form-control mb-2"
                    placeholder="http://localhost:5173/metadata/zumel-default.json"
                    value={tokenUri}
                    onChange={(e) => setTokenUri(e.target.value)}
                    disabled={minting}
                />
                <small className="text-muted d-block mb-3">
                    Must be a public URL returning ERC-721 metadata JSON.
                </small>

                <button
                    className="btn btn-success"
                    onClick={mintNft}
                    disabled={!canMint}
                    title={
                        allowanceTooLow
                            ? "Approve at least the mint price before minting."
                            : "Mint a new NFT using the tokenURI."
                    }
                >
                    {minting ? "Mintin..." : "Mint NFT"}
                </button>

                {!minting && allowanceTooLow && (
                    <small className="text-muted d-block mt-2">
                        Your approval is below the mint price. Use <strong>Approve ZUMEL</strong> to grant enough allowance,
                        then try minting again.
                    </small>
                )}

                {(mintTx || mintTokenId) && (
                    <div className="mt-3">
                        {mintTx && (
                            <div>
                                <a href={`${baseUrl}/tx/${mintTx}`} target="_blank" rel="noreferrer">
                                    View mint tx on Etherscan
                                </a>
                            </div>
                        )}
                        {mintTokenId && (
                            <div className="mt-1">
                                Token ID: <strong>{mintTokenId}</strong>{" "}
                                <a
                                    href={`${baseUrl}/token/${ZUMEL_NFT}?a=${mintTokenId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    View NFT
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MintNftCard;
