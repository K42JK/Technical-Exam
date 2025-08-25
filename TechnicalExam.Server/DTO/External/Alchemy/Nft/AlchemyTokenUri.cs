using System.Text.Json.Serialization;

namespace TechnicalExam.Server.DTO.External.Alchemy.Nft
{
    public class AlchemyTokenUri
    {
        [JsonPropertyName("raw")] public string? Raw { get; set; }
        [JsonPropertyName("gateway")] public string? Gateway { get; set; }
    }
}
