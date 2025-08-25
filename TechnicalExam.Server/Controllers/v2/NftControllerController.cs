using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using TechnicalExam.Server.DTO.Response;
using TechnicalExam.Server.DTO.Response.Alchemy;
using TechnicalExam.Server.Interface;

namespace TechnicalExam.Server.Controllers.v2
{
    [ApiVersion(2)]
    [Route("api/v{version:apiVersion}/nft")]
    [ApiController]
    public sealed class NftController : ControllerBase
    {
        private readonly IAlchemyNftService _nft;
        private readonly ILogger<NftController> _log;

        public NftController(IAlchemyNftService nft, ILogger<NftController> log)
        {
            _nft = nft;
            _log = log;
        }

        /// <summary>
        /// List NFTs the owner holds for a specific contract.
        /// </summary>
        [HttpGet("owned")]
        [ProducesResponseType(typeof(ApiResponse<OwnedNftsResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<OwnedNftsResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<OwnedNftsResponse>>> GetOwnedAsync(
            [FromQuery] string owner,
            [FromQuery] string contractAddress,
            CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(owner) || string.IsNullOrWhiteSpace(contractAddress))
                return BadRequest(new ApiResponse<OwnedNftsResponse>("0", "owner and contractAddress are required", null!));

            try
            {
                var data = await _nft.GetOwnedNftsAsync(owner, contractAddress, ct);
                return Ok(new ApiResponse<OwnedNftsResponse>("1", "OK", data));
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "owned NFTs failed for {Owner} / {Contract}", owner, contractAddress);
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse<OwnedNftsResponse>("0", ex.Message, null!));
            }
        }

        /// <summary>
        /// Get NFT metadata by tokenId (decimal) for a contract.
        /// </summary>
        [HttpGet("metadata")]
        [ProducesResponseType(typeof(ApiResponse<NftMetadataResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<NftMetadataResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<NftMetadataResponse>>> GetMetadataAsync(
            [FromQuery] string contractAddress,
            [FromQuery] string tokenId,
            CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(contractAddress) || string.IsNullOrWhiteSpace(tokenId))
                return BadRequest(new ApiResponse<NftMetadataResponse>("0", "contractAddress and tokenId are required", null!));

            try
            {
                var data = await _nft.GetNftMetadataAsync(contractAddress, tokenId, ct);
                return Ok(new ApiResponse<NftMetadataResponse>("1", "OK", data));
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "metadata failed for {Contract} / {TokenId}", contractAddress, tokenId);
                return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse<NftMetadataResponse>("0", ex.Message, null!));
            }
        }
    }
}
