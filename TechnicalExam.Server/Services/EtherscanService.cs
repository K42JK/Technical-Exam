// TechnicalExam.Server/Services/EtherscanService.cs
using System.Numerics;
using System.Net.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using TechnicalExam.Server.DTO.Response;
using TechnicalExam.Server.DTO.Response.Etherscan;
using TechnicalExam.Server.Utilities;
using TechnicalExam.Server.Interface;
using TechnicalExam.Server.Models;
using TechnicalExam.Server.DTO.External;

namespace TechnicalExam.Server.Services
{
    public class EtherscanService : IEtherscanService
    {
        private readonly HttpClient _http;
        private readonly IMemoryCache _mem;
        private readonly EtherscanApiSettings _apiSettings;
        private readonly string _prefix;

        private static readonly TimeSpan GasTtl = TimeSpan.FromSeconds(15);
        private static readonly TimeSpan BlockTtl = TimeSpan.FromSeconds(5);

        public EtherscanService(HttpClient http, IConfiguration config, IMemoryCache mem)
        {
            _http = http;
            _mem = mem;

            _apiSettings = config.GetSection("EtherscanApiSettings").Get<EtherscanApiSettings>()
                ?? throw new InvalidOperationException("EtherscanApiSettings missing");

            _prefix = (_http.BaseAddress?.Host ?? "etherscan") + ":";
        }

        // ---- raw GET to Etherscan REST/proxy ----
        private async Task<T> GetAsync<T>(string endpoint, CancellationToken ct = default)
        {
            using var resp = await _http.GetAsync(endpoint, ct);
            resp.EnsureSuccessStatusCode();
            var payload = await resp.Content.ReadFromJsonAsync<T>(cancellationToken: ct)
                         ?? throw new InvalidOperationException($"Null response for {endpoint}");
            return payload;
        }

        private async Task<ApiResponse<T>> ProxyAsApiResponse<T>(string endpoint, CancellationToken ct = default)
        {
            var rpc = await GetAsync<RpcResponse<T>>(endpoint, ct);
            if (rpc.Error is not null) return new ApiResponse<T>("0", $"RPC error {rpc.Error.Code}: {rpc.Error.Message}", default!);
            if (rpc.Result is null) return new ApiResponse<T>("0", "Empty JSON-RPC result", default!);
            return new ApiResponse<T>("1", "OK", rpc.Result);
        }

        public Task<ApiResponse<string>> GetBalanceAsync(string address)
        {
            var ep = $"api?module=account&action=balance&address={address}&tag=latest&apikey={_apiSettings.ApiKey}";
            return GetAsync<ApiResponse<string>>(ep);
        }

        public Task<ApiResponse<GasOracleResult>> GetGasOracleAsync()
        {
            var key = _prefix + "gas_oracle";
            return CacheUtilities.GetWithCacheAsync(_mem, key, GasTtl, async () =>
            {
                var ep = $"api?module=gastracker&action=gasoracle&apikey={_apiSettings.ApiKey}";
                return await GetAsync<ApiResponse<GasOracleResult>>(ep);
            });
        }

        public Task<ApiResponse<BigInteger>> GetBlockNumberAsync()
        {
            var key = _prefix + "block_number";
            return CacheUtilities.GetWithCacheAsync(_mem, key, BlockTtl, async () =>
            {
                var rpcHex = await ProxyAsApiResponse<string>(
                    $"api?module=proxy&action=eth_blockNumber&apikey={_apiSettings.ApiKey}");

                if (rpcHex.Status != "1" || string.IsNullOrWhiteSpace(rpcHex.Result))
                    return new ApiResponse<BigInteger>("0", rpcHex.Message, default);

                if (!ConverterUtilities.TryParseHexBigInteger(rpcHex.Result, out var bn))
                    return new ApiResponse<BigInteger>("0", $"Invalid hex: {rpcHex.Result}", default);

                return new ApiResponse<BigInteger>("1", "OK", bn);
            });
        }

        public async Task<ApiResponse<EthereumDashboardResult>> GetDashboardAsync(string address)
        {
            var balanceTask = GetBalanceAsync(address);
            var gasTask = GetGasOracleAsync();
            var blockTask = GetBlockNumberAsync();

            await Task.WhenAll(balanceTask, gasTask, blockTask);

            var b = await balanceTask;
            var g = await gasTask;
            var n = await blockTask;

            if (b.Status != "1" || g.Status != "1" || n.Status != "1")
                return new ApiResponse<EthereumDashboardResult>("0", "One or more API calls failed", null!);

            var dto = new EthereumDashboardResult(b.Result, g.Result, n.Result);
            return new ApiResponse<EthereumDashboardResult>("1", "Success", dto);
        }
    }
}
