using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace MultimodalAI_API.Dtos
{
    // DTO nhận request phân tích ảnh từ Frontend Upload Form (R2 & R4)
    public class AnalyzeImageRequestDto
    {
        [Required(ErrorMessage = "Vui lòng chọn hình ảnh sản phẩm để kiểm định")]
        public IFormFile Image { get; set; } = null!;

        [Required(ErrorMessage = "Vui lòng chọn sản phẩm")]
        public int ProductId { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn nhân viên kiểm định")]
        public int InspectorId { get; set; }
    }

    // DTO kết quả AI Gemini Vision trả về để hiển thị trên Preview Form (R2 & R4)
    public class GeminiAnalysisResultDto
    {
        public bool IsImageClear { get; set; } = true;
        public bool DefectDetected { get; set; }
        public int DefectCategoryId { get; set; }
        public string DefectCategoryName { get; set; } = string.Empty;
        public string SeverityLevel { get; set; } = string.Empty;
        public string DefectDescription { get; set; } = string.Empty;
        public float ConfidenceScore { get; set; }
        public string QualityStatus { get; set; } = string.Empty; // "Passed" hoặc "Failed"

        public string ImageUrl { get; set; } = string.Empty;
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int InspectorId { get; set; }
        public string InspectorName { get; set; } = string.Empty;
    }

    // DTO gửi lên khi nhân viên QC bấm Xác nhận & Cập nhật kho (R5)
    public class ConfirmInspectionReportDto
    {
        [Required(ErrorMessage = "Mã sản phẩm không được để trống")]
        public int ProductId { get; set; }

        [Required(ErrorMessage = "Mã nhân viên QC không được để trống")]
        public int InspectorId { get; set; }

        [Required(ErrorMessage = "Mã phân loại lỗi không được để trống")]
        public int DefectCategoryId { get; set; }

        [Required(ErrorMessage = "Đường dẫn ảnh không được để trống")]
        public string ImageUrl { get; set; } = string.Empty;

        public string DefectDescription { get; set; } = string.Empty;

        [Required(ErrorMessage = "Trạng thái chất lượng không được để trống")]
        public string QualityStatus { get; set; } = string.Empty; // "Passed" hoặc "Failed"

        public float ConfidenceScore { get; set; }
    }

    // DTO phản hồi Real-time Feedback sau khi lưu và cập nhật kho thành công (R5)
    public class ConfirmInspectionResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public InspectionReportReadDto Report { get; set; } = null!;
        public ProductStockSummaryDto UpdatedStock { get; set; } = null!;
    }

    public class ProductStockSummaryDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int TotalStock { get; set; }
        public int PassedStock { get; set; }
        public int FailedStock { get; set; }
    }
}
