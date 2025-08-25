using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System.Numerics;
using TechnicalExam.Server.DTO.Request.Alchemy;
using TechnicalExam.Server.DTO.Response;
using TechnicalExam.Server.DTO.Response.Alchemy; 
using TechnicalExam.Server.Interface;
using TechnicalExam.Server.Utilities;

namespace TechnicalExam.Server.Controllers.v2
{
    [ApiVersion(2)]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public sealed class EthereumController : ControllerBase
    {
        private readonly IAlchemyService _alchemyService;
        private readonly ILogger<EthereumController> _logger;

        public EthereumController(IAlchemyService alchemy, ILogger<EthereumController> logger)
        {
            _alchemyService = alchemy;
            _logger = logger;
        }

        /// <summary>
        /// Returns ETH balance, current block number, and gas price.
        /// </summary>
        [HttpGet("GetEthereumData")]
        [MapToApiVersion(2)]
        [ProducesResponseType(typeof(ApiResponse<GetEthereumData>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<GetEthereumData>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<GetEthereumData>), StatusCodes.Status502BadGateway)]
        [ProducesResponseType(typeof(ApiResponse<GetEthereumData>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<GetEthereumData>>> GetEthereumDataAsync(
            [FromQuery] GetEthereumDataRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<GetEthereumData>("0", "Invalid Ethereum address", null!));
            }

            try
            {
                // Call Alchemy in parallel
                var balanceTask = _alchemyService.GetBalanceHexAsync(request.Address); 
                var blockTask = _alchemyService.GetBlockNumberAsync();              
                var gasTask = _alchemyService.GetGasPriceWeiAsync();              

                await Task.WhenAll(balanceTask, blockTask, gasTask);

                var balanceResp = await balanceTask;
                var blockResp = await blockTask;
                var gasResp = await gasTask;

                if (balanceResp.Status != "1" || blockResp.Status != "1" || gasResp.Status != "1")
                {
                    var msg =
                        $"Upstream error(s): " +
                        $"balance='{balanceResp.Message}', " +
                        $"block='{blockResp.Message}', " +
                        $"gas='{gasResp.Message}'";

                    return StatusCode(StatusCodes.Status502BadGateway,
                        new ApiResponse<GetEthereumData>("0", msg, null!));
                }

                if (!ConverterUtilities.TryBigIntToULong(blockResp.Result, out var blockUlong))
                {
                    return StatusCode(StatusCodes.Status502BadGateway,
                        new ApiResponse<GetEthereumData>("0", "Block number overflow", null!));
                }

                if (!ConverterUtilities.TryBigIntToULong(gasResp.Result, out var gasUlong))
                {
                    return StatusCode(StatusCodes.Status502BadGateway,
                        new ApiResponse<GetEthereumData>("0", "Gas price overflow", null!));
                }

                var dto = new GetEthereumData(
                    address: request.Address,
                    balanceWei: balanceResp.Result, 
                    block: blockUlong,
                    gas: gasUlong
                );

                return Ok(new ApiResponse<GetEthereumData>("1", "OK", dto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Request {TraceId}: Error retrieving Ethereum data for {Address}",
                    HttpContext.TraceIdentifier, request.Address);

                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ApiResponse<GetEthereumData>("0", $"Error: {ex.Message}", null!));
            }
        }
    }
}
