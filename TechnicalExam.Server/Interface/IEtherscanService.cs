using System.Numerics;
using TechnicalExam.Server.DTO.Response;
using TechnicalExam.Server.DTO.Response.Etherscan;

namespace TechnicalExam.Server.Interface
{
    public interface IEtherscanService
    {
        Task<ApiResponse<string>> GetBalanceAsync(string address);
        Task<ApiResponse<GasOracleResult>> GetGasOracleAsync();
        Task<ApiResponse<BigInteger>> GetBlockNumberAsync();
        Task<ApiResponse<EthereumDashboardResult>> GetDashboardAsync(string address);
    }
}
