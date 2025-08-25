using System.Threading;
using TechnicalExam.Server.DTO.Response.Alchemy;

namespace TechnicalExam.Server.Interface
{
    public interface IAlchemyNftService
    {
        Task<OwnedNftsResponse> GetOwnedNftsAsync(string owner, string contractAddress, CancellationToken ct = default);
        Task<NftMetadataResponse> GetNftMetadataAsync(string contractAddress, string tokenId, CancellationToken ct = default);
    }
}