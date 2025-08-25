using System.Globalization;
using System.Net.Http.Json;
using System.Numerics;
using TechnicalExam.Server.DTO.External.Alchemy.Nft;
using TechnicalExam.Server.DTO.Response.Alchemy;
using TechnicalExam.Server.Interface;

namespace TechnicalExam.Server.Services
    {
        public sealed class AlchemyNftService : IAlchemyNftService
        {
        private readonly HttpClient _http;

        public AlchemyNftService(HttpClient http)
        {
            _http = http ?? throw new ArgumentNullException(nameof(http));
        }
        public async Task<OwnedNftsResponse> GetOwnedNftsAsync(string owner, string contractAddress, CancellationToken ct = default)
            {
                var url = $"getNFTsForOwner?owner={owner}&withMetadata=true&contractAddresses[]={contractAddress}";

                var raw = await _http.GetFromJsonAsync<AlchemyOwnedNftsResponse>(url, ct)
                          ?? new AlchemyOwnedNftsResponse();

                var items = raw.OwnedNfts.Select(n =>
                    {                    
                        var hex = (n.TokenId ?? "0x0").StartsWith("0x", StringComparison.OrdinalIgnoreCase)
                            ? n.TokenId
                            : "0x" + n.TokenId;

                        string id;
                        try
                        {
                            id = BigInteger.Parse(hex.AsSpan(2), NumberStyles.HexNumber).ToString();
                        }
                        catch
                        {
                            id = "0";
                        }

                        var img = n.TokenUri?.Gateway
                               ?? n.TokenUri?.Raw;

                        var title = n.Title ?? n.Name ?? $"Token #{id}";
                        var tokenUri = n.TokenUri?.Gateway ?? n.TokenUri?.Raw;

                        return new OwnedNftsItem()
                        {
                            TokenIdHex = hex,
                            TokenId = id,
                            Title = title,
                            TokenUri = tokenUri,
                            ImageUrl = img
                        };
                    }).ToList();

                    return new OwnedNftsResponse { Items = items };
            }

            public async Task<NftMetadataResponse> GetNftMetadataAsync(string contractAddress, string tokenId, CancellationToken ct = default)
            {
                var url = $"/getNFTMetadata?contractAddress={contractAddress}&tokenId={tokenId}";
                var raw = await _http.GetFromJsonAsync<AlchemyNftMetadataResponse>(url, ct)
                          ?? new AlchemyNftMetadataResponse { TokenId = tokenId, Contract = new() { Address = contractAddress } };

                var hex = (raw.TokenId ?? "0x0").StartsWith("0x", StringComparison.OrdinalIgnoreCase)
                    ? raw.TokenId
                    : "0x" + raw.TokenId;


                var img = raw.TokenUri?.Gateway
                       ?? raw.TokenUri?.Raw;

                return new NftMetadataResponse
                {
                    TokenIdHex = hex,
                    TokenId = tokenId,
                    Title = raw.Title ?? raw.Name ?? $"Token #{tokenId}",
                    Description = raw.Description,
                    TokenUri = raw.TokenUri?.Gateway ?? raw.TokenUri?.Raw,
                    ImageUrl = img
                };
            }
        }
}
