namespace TechnicalExam.Server.DTO.Response.Alchemy
{
    public class NftMetadataResponse : OwnedNftsItem
    {
        public string? Description { get; init; }
        //public NftMetadataResponse(string tokenIdHex,string tokenId,string? title, string? tokenUri, string? imageUrl, string? description) : base(tokenIdHex, tokenId, title, tokenUri, imageUrl)
        //{
        //    TokenIdHex = tokenIdHex;
        //    TokenId = tokenId;
        //    Title = title;
        //    Description = description;
        //    TokenUri = tokenId;
        //    ImageUrl = imageUrl;
        //}
    }
}
