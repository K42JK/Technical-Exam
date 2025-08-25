namespace TechnicalExam.Server.DTO.Response.Alchemy
{
    public class GetEthereumData
    {

        public string Address  { get; set; } 
        public string BalanceWei  { get; set; }
        public ulong BlockNumber  { get; set; }
        public ulong GasPrice  { get; set; }

        public GetEthereumData(string address, string balanceWei, ulong block, ulong gas)
        {
            Address = address;
            BalanceWei = balanceWei;
            BlockNumber = block;
            GasPrice = gas;
        }


    }
}
