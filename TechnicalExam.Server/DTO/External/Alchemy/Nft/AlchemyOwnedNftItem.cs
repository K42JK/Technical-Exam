using System.Text.Json.Serialization;
using TechnicalExam.Server.Utilities.Json;

namespace TechnicalExam.Server.DTO.External.Alchemy.Nft
{
    public sealed class AlchemyOwnedNftItem
    {
        [JsonPropertyName("contract")] public AlchemyNftContract Contract { get; set; } = new();
        [JsonPropertyName("tokenId")] public string TokenId { get; set; } = "";
        [JsonPropertyName("tokenType")] public string? TokenType { get; set; } // "erc721"
        [JsonPropertyName("name")] public string? Name { get; set; }
        [JsonPropertyName("title")] public string? Title { get; set; }
        [JsonPropertyName("tokenUri")][JsonConverter(typeof(StringOrObjectTokenUriConverter))] public AlchemyTokenUri? TokenUri { get; set; }
        [JsonPropertyName("image")] public AlchemyImage? Image { get; set; }
    }
}
