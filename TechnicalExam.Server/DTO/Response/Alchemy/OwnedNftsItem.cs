namespace TechnicalExam.Server.DTO.Response.Alchemy
{
    public class OwnedNftsItem
    {
        public string TokenIdHex { get; init; } = "";
        public string TokenId { get; init; } = "";
        public string? Title { get; init; }
        public string? TokenUri { get; init; }
        public string? ImageUrl { get; init; }

        //public OwnedNftsItem(string tokenIdHex, string tokenId, string? title, string? tokenUri, string? imageUrl)
        //{
        //    TokenIdHex = tokenIdHex;
        //    TokenId = tokenId;
        //    Title = title;            
        //    TokenUri = tokenId;
        //    ImageUrl = imageUrl;
        //}
    }
}
