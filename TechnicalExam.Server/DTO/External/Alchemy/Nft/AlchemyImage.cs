using System.Text.Json.Serialization;

namespace TechnicalExam.Server.DTO.External.Alchemy.Nft
{
    public class AlchemyImage
    {
        [JsonPropertyName("cachedUrl")] public string? CachedUrl { get; set; }
        [JsonPropertyName("thumbnailUrl")] public string? ThumbnailUrl { get; set; }
        [JsonPropertyName("pngUrl")] public string? PngUrl { get; set; }
        [JsonPropertyName("originalUrl")] public string? OriginalUrl { get; set; }
        [JsonPropertyName("contentType")] public string? ContentType { get; set; }
    }
}
