using System.Text.Json.Serialization;

namespace TechnicalExam.Server.DTO.External.Alchemy.Nft
{
    public class AlchemyNftContract
    {
        [JsonPropertyName("address")] public string Address { get; set; } = "";
    }
}
