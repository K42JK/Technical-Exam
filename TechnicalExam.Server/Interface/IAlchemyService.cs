using System.Numerics;
using TechnicalExam.Server.DTO.Response;

namespace TechnicalExam.Server.Interface
{
    public interface IAlchemyService
    {
        Task<ApiResponse<BigInteger>> GetBlockNumberAsync();
        Task<ApiResponse<BigInteger>> GetGasPriceWeiAsync();
        Task<ApiResponse<string>> GetBalanceHexAsync(string address);
        Task<ApiResponse<string[]>> GetAccountsAsync();
    }
}
