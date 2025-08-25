//import { CHAIN_ID } from "@/config/web3";

//// Required network (Sepolia)
//export const REQUIRED_CHAIN_ID = BigInt(CHAIN_ID);
//export const REQUIRED_CHAIN_ID_HEX = "0x" + REQUIRED_CHAIN_ID.toString(16);

///** Get current chainId (as bigint) or null if unavailable */
//export async function getCurrentChainId(): Promise<bigint | null> {
//    if (!window.ethereum) return null;
//    try {
//        const hex = (await window.ethereum.request({ method: "eth_chainId" })) as string;
//        return BigInt(hex);
//    } catch {
//        return null;
//    }
//}

///** Prompt MetaMask to switch to the required network (adds Sepolia if missing) */
//export async function switchToRequiredChain(): Promise<void> {
//    if (!window.ethereum) throw new Error("Wallet not detected");
//    try {
//        await window.ethereum.request({
//            method: "wallet_switchEthereumChain",
//            params: [{ chainId: REQUIRED_CHAIN_ID_HEX }],
//        });
//    } catch (err: any) {
//        // 4902 = unknown chain; add Sepolia & retry
//        if (err?.code === 4902) {
//            await window.ethereum.request({
//                method: "wallet_addEthereumChain",
//                params: [
//                    {
//                        chainId: REQUIRED_CHAIN_ID_HEX,
//                        chainName: "Sepolia",
//                        nativeCurrency: { name: "Sepolia ETH", symbol: "SEP", decimals: 18 },
//                        rpcUrls: ["https://rpc.sepolia.org"],
//                        blockExplorerUrls: ["https://sepolia.etherscan.io"],
//                    },
//                ],
//            });
//        } else {
//            throw err;
//        }
//    }
//}
