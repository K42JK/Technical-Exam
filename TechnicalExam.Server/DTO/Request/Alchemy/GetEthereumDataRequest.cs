using System.ComponentModel.DataAnnotations;

namespace TechnicalExam.Server.DTO.Request.Alchemy
{
    public class GetEthereumDataRequest
    {
        [Required]
        [StringLength(42, MinimumLength = 42, ErrorMessage = "Ethereum address must be 42 characters (0x + 40 hex).")]
        public string Address { get; set; } = "";
    }
}
