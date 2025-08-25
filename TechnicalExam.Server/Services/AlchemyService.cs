// TechnicalExam.Server/Services/AlchemyService.cs
using Microsoft.Extensions.Caching.Memory;
using System.Numerics;
using TechnicalExam.Server.DTO.Response;
using TechnicalExam.Server.Utilities;
using TechnicalExam.Server.Interface;
using TechnicalExam.Server.Utilities;

namespace TechnicalExam.Server.Services
{
    public class AlchemyService : IAlchemyService
    {
        private readonly JsonRpcUtilities _rpc;
        private readonly IMemoryCache _mem;
        private readonly string _prefix;

        private static readonly TimeSpan GasTtl = TimeSpan.FromSeconds(15);
        private static readonly TimeSpan BlockTtl = TimeSpan.FromSeconds(5);

        public AlchemyService(HttpClient http, IMemoryCache mem)
        {
            _rpc = new JsonRpcUtilities(http); // POST JSON-RPC via BaseAddress
            _mem = mem;
            _prefix = (http.BaseAddress?.Host ?? "alchemy") + ":"; // cache namespace per host
        }

        public async Task<ApiResponse<BigInteger>> GetBlockNumberAsync()
        {

            var key = _prefix + "block_number";

            if (_mem.TryGetValue<ApiResponse<BigInteger>>(key, out var cached) && cached?.Status == "1")
                return cached;

            // 1st attempt
            var hex1 = await _rpc.CallAsApiResponseAsync<string>("eth_blockNumber");
            if (hex1.Status != "1" || string.IsNullOrWhiteSpace(hex1.Result))
                return new ApiResponse<BigInteger>("0", hex1.Message, default);

            if (!ConverterUtilities.TryHexToULong(hex1.Result, out var blockUlong))
            {
                // Retry once (sometimes gateways hiccup)
                var hex2 = await _rpc.CallAsApiResponseAsync<string>("eth_blockNumber");
                if (hex2.Status == "1" && ConverterUtilities.TryHexToULong(hex2.Result, out blockUlong))
                {
                    var ok2 = new ApiResponse<BigInteger>("1", "OK", new BigInteger(blockUlong));
                    _mem.Set(key, ok2, BlockTtl);
                    return ok2;
                }

                return new ApiResponse<BigInteger>("0", $"Invalid hex: {hex1.Result}", default);
            }

            var ok = new ApiResponse<BigInteger>("1", "OK", new BigInteger(blockUlong));
            _mem.Set(key, ok, BlockTtl); // cache only success
            return ok;
        }


        public async Task<ApiResponse<BigInteger>> GetGasPriceWeiAsync()
        {
            var key = _prefix + "gas_price_wei";

            if (_mem.TryGetValue<ApiResponse<BigInteger>>(key, out var cached) && cached?.Status == "1")
                return cached;

            var hex = await _rpc.CallAsApiResponseAsync<string>("eth_gasPrice");
            if (hex.Status != "1" || string.IsNullOrWhiteSpace(hex.Result))
                return new ApiResponse<BigInteger>("0", hex.Message, default);

            if (!ConverterUtilities.TryHexToULong(hex.Result, out var weiUlong))
                return new ApiResponse<BigInteger>("0", $"Invalid hex: {hex.Result}", default);

            var ok = new ApiResponse<BigInteger>("1", "OK", new BigInteger(weiUlong));
            _mem.Set(key, ok, GasTtl);
            return ok;
        }

        public Task<ApiResponse<string>> GetBalanceHexAsync(string address) =>
            _rpc.CallAsApiResponseAsync<string>("eth_getBalance", new object[] { address, "latest" });

        public Task<ApiResponse<string[]>> GetAccountsAsync() =>
            _rpc.CallAsApiResponseAsync<string[]>("eth_accounts");
    }
}
