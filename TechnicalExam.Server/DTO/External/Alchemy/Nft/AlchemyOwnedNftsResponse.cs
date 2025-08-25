using System.Text.Json.Serialization;

namespace TechnicalExam.Server.DTO.External.Alchemy.Nft
{
    public sealed class AlchemyOwnedNftsResponse
    {
        [JsonPropertyName("ownedNfts")] public List<AlchemyOwnedNftItem> OwnedNfts { get; set; } = new();
        [JsonPropertyName("pageKey")] public string? PageKey { get; set; }
        [JsonPropertyName("totalCount")] public int? TotalCount { get; set; }
    }

}
