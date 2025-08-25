using System.Numerics;

namespace TechnicalExam.Server.DTO.Response.Etherscan
{
    public class EthereumDashboardResult
    {
        public string Balance { get; set; }
        public GasOracleResult GasOracle { get; set; }
        public BigInteger BlockNumber { get; set; }

        public EthereumDashboardResult(string balance, GasOracleResult gasOracle, BigInteger blockNumber)
        {
            Balance = balance;
            GasOracle = gasOracle;
            BlockNumber = blockNumber;
        }
    }
}
