namespace TechnicalExam.Server.DTO.Response
{
    public class ApiResponse<T>
    {
        public string Status { get; set; }
        public string Message { get; set; }
        public T Result { get; set; }
        public ApiResponse(string status, string message, T result) {
        
            Status = status;
            Message = message;
            Result = result;
        }
    }
}
