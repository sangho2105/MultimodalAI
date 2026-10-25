namespace MultimodalAI_API.Dtos
{
    public class InspectionReportReadDto
    {
        public int ReportId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int InspectorId { get; set; }
        public string InspectorName { get; set; } = string.Empty;
        public int DefectCategoryId { get; set; }
        public string DefectCategoryName { get; set; } = string.Empty;
        public string SeverityLevel { get; set; } = string.Empty;

        public string ImageURL { get; set; } = string.Empty;
        public string DefectDescription { get; set; } = string.Empty;
        public string QualityStatus { get; set; } = string.Empty;
        public float ConfidenceScore { get; set; }
        public bool IsUserConfirmed { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
