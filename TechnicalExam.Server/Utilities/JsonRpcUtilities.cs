using TechnicalExam.Server.DTO.External;
using TechnicalExam.Server.DTO.Response;

namespace TechnicalExam.Server.Utilities
{
    public class JsonRpcUtilities
    {
        private readonly HttpClient _http;

        private record RpcRequest(string jsonrpc, string method, object[] @params, int id);

        public JsonRpcUtilities(HttpClient http) => _http = http;

        public async Task<RpcResponse<T>> CallAsync<T>(string method, object[]? @params = null, CancellationToken ct = default)
        {
            var req = new RpcRequest("2.0", method, @params ?? Array.Empty<object>(), 1);
            using var resp = await _http.PostAsJsonAsync("", req, ct);
            resp.EnsureSuccessStatusCode();

            var rpc = await resp.Content.ReadFromJsonAsync<RpcResponse<T>>(cancellationToken: ct)
                      ?? throw new InvalidOperationException("Null JSON-RPC response");
            return rpc;
        }

        public async Task<ApiResponse<T>> CallAsApiResponseAsync<T>(string method, object[]? @params = null, CancellationToken ct = default)
        {
            var rpc = await CallAsync<T>(method, @params, ct);
            if (rpc.Error is not null)
                return new ApiResponse<T>("0", $"RPC error {rpc.Error.Code}: {rpc.Error.Message}", default!);
            if (rpc.Result is null)
                return new ApiResponse<T>("0", "Empty JSON-RPC result", default!);
            return new ApiResponse<T>("1", "OK", rpc.Result);
        }
    }
}
