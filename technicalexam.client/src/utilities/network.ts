import { ADD_CHAIN_PARAMS, CHAIN_HEX } from "@/config/web3";

export async function switchToRequiredChain(): Promise<void> {
    if (!window.ethereum) throw new Error("MetaMask not found");
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: CHAIN_HEX }],
        });
    } catch (err: any) {
        // 4902 = chain not added to MetaMask
        if (err?.code === 4902) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [ADD_CHAIN_PARAMS],
            });
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: CHAIN_HEX }],
            });
        } else {
            throw err;
        }
    }
}
