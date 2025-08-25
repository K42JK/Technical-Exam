namespace TechnicalExam.Server.DTO.Response.Etherscan
{
    public class GetBalanceResponse
    {
        public string Address { get; set; }

        public GetBalanceResponse(string address) 
        {
            Address = address;
        }   
    } 
}
