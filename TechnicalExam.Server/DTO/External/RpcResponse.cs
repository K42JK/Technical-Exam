using System.Text.Json;
using System.Text.Json.Serialization;

namespace TechnicalExam.Server.DTO.External
{
    public sealed class RpcResponse<T>
    {
        [JsonPropertyName("jsonrpc")]   public string? JsonRpc { get; set; }
        [JsonPropertyName("id")]        public JsonElement? Id { get; set; }
        [JsonPropertyName("result")]    public T? Result { get; set; }
        [JsonPropertyName("error")]     public RpcError? Error { get; set; }
    }
}
