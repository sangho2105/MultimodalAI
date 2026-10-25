namespace MultimodalAI_API.Dtos
{
    public class ProductReadDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int TotalStock { get; set; }
        public int PassedStock { get; set; }
        public int FailedStock { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
