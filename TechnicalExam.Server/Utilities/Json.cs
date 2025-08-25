using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using TechnicalExam.Server.DTO.External.Alchemy.Nft;

namespace TechnicalExam.Server.Utilities.Json
{
    public sealed class StringOrObjectTokenUriConverter : JsonConverter<AlchemyTokenUri?>
    {
        public override AlchemyTokenUri? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null) return null;

            if (reader.TokenType == JsonTokenType.String)
            {
                var s = reader.GetString();
                return s is null ? null : new AlchemyTokenUri { Raw = s, Gateway = s };
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                using var doc = JsonDocument.ParseValue(ref reader);
                string? raw = null, gateway = null;

                if (doc.RootElement.TryGetProperty("raw", out var rawEl) && rawEl.ValueKind == JsonValueKind.String)
                    raw = rawEl.GetString();

                if (doc.RootElement.TryGetProperty("gateway", out var gwEl) && gwEl.ValueKind == JsonValueKind.String)
                    gateway = gwEl.GetString();

                return new AlchemyTokenUri { Raw = raw, Gateway = gateway };
            }

            reader.Skip();
            return null;
        }

        public override void Write(Utf8JsonWriter writer, AlchemyTokenUri? value, JsonSerializerOptions options)
        {
            if (value is null) { writer.WriteNullValue(); return; }
            writer.WriteStartObject();
            if (value.Raw is not null) writer.WriteString("raw", value.Raw);
            if (value.Gateway is not null) writer.WriteString("gateway", value.Gateway);
            writer.WriteEndObject();
        }
    }
}
