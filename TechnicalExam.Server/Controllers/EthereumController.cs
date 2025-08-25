using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System.Numerics;
using TechnicalExam.Server.DTO.Response;
using TechnicalExam.Server.DTO.Response.Etherscan;
using TechnicalExam.Server.Interface;

namespace TechnicalExam.Server.Controllers
{
    [ApiVersion(1)]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class EthereumController : ControllerBase
    {
        private readonly IEtherscanService _etherscanService;
        private readonly ILogger<EthereumController> _logger;

        public EthereumController(IEtherscanService etherscanService, ILogger<EthereumController> logger)
        {
            _etherscanService = etherscanService;
            _logger = logger;
        }

        [MapToApiVersion(1)]
        [HttpGet("GetBalance/{address}")]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<string>>> GetBalanceAsync([FromRoute] string address)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponse<string>("0", "Invalid Ethereum address", ""));

            try
            {
                var result = await _etherscanService.GetBalanceAsync(address);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Request {TraceId}: Error retrieving balance for {Address}", HttpContext.TraceIdentifier, address);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ApiResponse<string>("0", $"Error: {ex.Message}", ""));
            }
        }

        [MapToApiVersion(1)]
        [HttpGet("GetGasOracle")]
        [ProducesResponseType(typeof(ApiResponse<GasOracleResult>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<GasOracleResult>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<GasOracleResult>>> GetGasOracleAsync()
        {
            try
            {
                var response = await _etherscanService.GetGasOracleAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Request {TraceId}: Error retrieving latest gas fee");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ApiResponse<GasOracleResult>("0", "Error retrieving latest gas fee",
                        new GasOracleResult("0", "0", "0", "0", "0", "0")));
            }
        }

        [MapToApiVersion(1)]
        [HttpGet("GetBlockNumber")]
        [ProducesResponseType(typeof(ApiResponse<BigInteger>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BigInteger>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<BigInteger>>> GetBlockNumberAsync()
        {
            try
            {
                var response = await _etherscanService.GetBlockNumberAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Request {TraceId}: Error retrieving block number", HttpContext.TraceIdentifier);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ApiResponse<BigInteger>("0", "Error retrieving block number", default));
            }
        }

        [MapToApiVersion(1)]
        [HttpGet("GetDashboard/{address}")]
        [ProducesResponseType(typeof(ApiResponse<EthereumDashboardResult>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<EthereumDashboardResult>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<EthereumDashboardResult>>> GetDashboardAsync([FromRoute] string address)
        {
            try
            {
                var response = await _etherscanService.GetDashboardAsync(address);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Request {TraceId}: Error retrieving dashboard for {Address}", HttpContext.TraceIdentifier, address);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new ApiResponse<EthereumDashboardResult>("0", "Error retrieving dashboard", null!));
            }
        }
    }
}
