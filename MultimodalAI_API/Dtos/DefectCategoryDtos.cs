namespace MultimodalAI_API.Dtos
{
    public class DefectCategoryReadDto
    {
        public int DefectCategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string SeverityLevel { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
