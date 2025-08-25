namespace TechnicalExam.Server.DTO.Response.Etherscan
{
    public class GasOracleResult
    {
        public string LastBlock { get; set; }
        public string SafeGasPrice { get; set; }
        public string ProposeGasPrice { get; set; }
        public string FastGasPrice { get; set; }
        public string SuggestBaseFee { get; set; }
        public string GasUsedRatio { get; set; }

        public GasOracleResult(string lastBlock, string safeGasPrice, string proposeGasPrice
            , string fastGasPrice, string suggestBaseFee, string gasUsedRatio)
        {
            LastBlock = lastBlock;
            SafeGasPrice = safeGasPrice;
            ProposeGasPrice = proposeGasPrice;
            FastGasPrice = fastGasPrice;
            SuggestBaseFee = suggestBaseFee;
            GasUsedRatio = gasUsedRatio;
        }
    }
}
