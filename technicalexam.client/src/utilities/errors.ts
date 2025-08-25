export function friendlyEthersError(err: any): string {
    if (!err) return "Unknown error";

    if (err.code === "ACTION_REJECTED") return "Transaction rejected in MetaMask.";

    const mmCode = err?.info?.error?.code ?? err?.error?.code;
    if (mmCode === 4001) return "Request was rejected in MetaMask.";

    if (err.code === -32002) return "A request is already pending in MetaMask. Open it to continue.";

    if (err.code === "INSUFFICIENT_FUNDS" || /insufficient funds/i.test(err?.message ?? "")) {
        return "Insufficient ETH to cover gas fees.";
    }

    if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
        return "Transaction may fail (gas estimate failed). Check allowance/price or try again.";
    }

    if (/network error/i.test(err?.message ?? "")) return "Network error. Check your connection and RPC.";

    if (err.shortMessage) return err.shortMessage;

    return err.message ?? JSON.stringify(err);
}
