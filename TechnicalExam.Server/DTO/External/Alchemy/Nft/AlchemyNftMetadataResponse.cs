using System.Text.Json.Serialization;

namespace TechnicalExam.Server.DTO.External.Alchemy.Nft
{
    public class AlchemyNftMetadataResponse
    {
        [JsonPropertyName("contract")] public AlchemyNftContract Contract { get; set; } = new();
        [JsonPropertyName("tokenId")] public string TokenId { get; set; } = "";
        [JsonPropertyName("tokenType")] public string? TokenType { get; set; }
        [JsonPropertyName("name")] public string? Name { get; set; }
        [JsonPropertyName("title")] public string? Title { get; set; }
        [JsonPropertyName("description")] public string? Description { get; set; }
        [JsonPropertyName("tokenUri")] public AlchemyTokenUri? TokenUri { get; set; }
        [JsonPropertyName("image")] public AlchemyImage? Image { get; set; }
        [JsonPropertyName("raw")] public object? Raw { get; set; }
    }
}
