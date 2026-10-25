using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultimodalAI_API.Data;
using MultimodalAI_API.Dtos;
using MultimodalAI_API.Entities;
using MultimodalAI_API.Services;

namespace MultimodalAI_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InspectionReportsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IGeminiVisionService _geminiVisionService;

        public InspectionReportsController(
            AppDbContext context,
            IWebHostEnvironment environment,
            IGeminiVisionService geminiVisionService)
        {
            _context = context;
            _environment = environment;
            _geminiVisionService = geminiVisionService;
        }

        // POST: api/inspectionreports/analyze (R4 - Phân tích ảnh với Gemini Vision AI)
        [HttpPost("analyze")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<GeminiAnalysisResultDto>> AnalyzeImage([FromForm] AnalyzeImageRequestDto request)
        {
            if (request.Image == null || request.Image.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng chọn hình ảnh sản phẩm để kiểm định." });
            }

            // Kiểm tra định dạng file ảnh hợp lệ
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".bmp" };
            var extension = Path.GetExtension(request.Image.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Định dạng file không được hỗ trợ. Vui lòng tải lên ảnh có đuôi .jpg, .jpeg, .png, .webp." });
            }

            // Giới hạn dung lượng tối đa 10MB
            if (request.Image.Length > 10 * 1024 * 1024)
            {
                return BadRequest(new { message = "Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 10MB)." });
            }

            // Kiểm tra sản phẩm có tồn tại trong hệ thống không
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm có mã ID = {request.ProductId}" });
            }

            // Kiểm tra nhân viên QC có tồn tại không
            var inspector = await _context.Inspectors.FindAsync(request.InspectorId);
            if (inspector == null)
            {
                return NotFound(new { message = $"Không tìm thấy nhân viên kiểm định có mã ID = {request.InspectorId}" });
            }

            // Lưu file ảnh vào wwwroot/uploads
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"inspection_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            byte[] imageBytes;
            using (var memoryStream = new MemoryStream())
            {
                await request.Image.CopyToAsync(memoryStream);
                imageBytes = memoryStream.ToArray();
            }

            await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

            // Lấy danh mục lỗi từ DB để cung cấp context cho AI
            var categories = await _context.DefectCategories.AsNoTracking().ToListAsync();

            try
            {
                // Gọi Gemini Vision Service phân tích ảnh
                var analysisResult = await _geminiVisionService.AnalyzeProductImageAsync(
                    imageBytes,
                    request.Image.ContentType,
                    product,
                    categories);

                // Gán đường dẫn ảnh tĩnh và thông tin liên quan để trả về client
                analysisResult.ImageUrl = $"/uploads/{uniqueFileName}";
                analysisResult.InspectorId = inspector.InspectorId;
                analysisResult.InspectorName = inspector.InspectorName;

                return Ok(analysisResult);
            }
            catch (Exception ex)
            {
                // Nếu có lỗi AI, vẫn trả về URL ảnh kèm thông báo lỗi để người dùng biết
                return StatusCode(500, new
                {
                    message = ex.Message,
                    imageUrl = $"/uploads/{uniqueFileName}",
                    productId = product.ProductId,
                    inspectorId = inspector.InspectorId
                });
            }
        }

        // POST: api/inspectionreports/confirm (R5 - Giao dịch nguyên tử IDbContextTransaction & Cập nhật kho)
        [HttpPost("confirm")]
        public async Task<ActionResult<ConfirmInspectionResponseDto>> ConfirmReport([FromBody] ConfirmInspectionReportDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var status = request.QualityStatus.Trim();
            if (!string.Equals(status, "Passed", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(status, "Failed", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Trạng thái chất lượng chỉ được là 'Passed' hoặc 'Failed'." });
            }

            // Kiểm tra các entity liên quan
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm có mã ID = {request.ProductId}" });
            }

            var inspector = await _context.Inspectors.FindAsync(request.InspectorId);
            if (inspector == null)
            {
                return NotFound(new { message = $"Không tìm thấy nhân viên QC có mã ID = {request.InspectorId}" });
            }

            var category = await _context.DefectCategories.FindAsync(request.DefectCategoryId);
            if (category == null)
            {
                return NotFound(new { message = $"Không tìm thấy phân loại lỗi có mã ID = {request.DefectCategoryId}" });
            }

            // Bắt đầu giao dịch nguyên tử EF Core (R5 - IDbContextTransaction)
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Tạo bản ghi InspectionReport đã xác nhận
                var report = new InspectionReport
                {
                    ProductId = request.ProductId,
                    InspectorId = request.InspectorId,
                    DefectCategoryId = request.DefectCategoryId,
                    ImageURL = request.ImageUrl,
                    DefectDescription = request.DefectDescription,
                    QualityStatus = char.ToUpper(status[0]) + status.Substring(1).ToLower(),
                    ConfidenceScore = request.ConfidenceScore,
                    IsUserConfirmed = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.InspectionReports.Add(report);

                // 2. Tự động cập nhật tồn kho sản phẩm (Automated inventory updates - R5)
                if (string.Equals(report.QualityStatus, "Passed", StringComparison.OrdinalIgnoreCase))
                {
                    product.PassedStock += 1;
                }
                else
                {
                    product.FailedStock += 1;
                }

                // Đảm bảo TotalStock khớp với tổng hàng đạt + lỗi nếu phát sinh thêm
                if (product.PassedStock + product.FailedStock > product.TotalStock)
                {
                    product.TotalStock = product.PassedStock + product.FailedStock;
                }

                await _context.SaveChangesAsync();

                // 3. Commit giao dịch nguyên tử
                await transaction.CommitAsync();

                // 4. Trả về phản hồi Real-time Feedback cho client
                var response = new ConfirmInspectionResponseDto
                {
                    Success = true,
                    Message = $"Kiểm định thành công! Đã ghi nhận báo cáo #{report.ReportId} và cập nhật tồn kho cho sản phẩm '{product.ProductName}'.",
                    Report = new InspectionReportReadDto
                    {
                        ReportId = report.ReportId,
                        ProductId = report.ProductId,
                        ProductName = product.ProductName,
                        InspectorId = report.InspectorId,
                        InspectorName = inspector.InspectorName,
                        DefectCategoryId = report.DefectCategoryId,
                        DefectCategoryName = category.CategoryName,
                        SeverityLevel = category.SeverityLevel,
                        ImageURL = report.ImageURL,
                        DefectDescription = report.DefectDescription,
                        QualityStatus = report.QualityStatus,
                        ConfidenceScore = report.ConfidenceScore,
                        IsUserConfirmed = report.IsUserConfirmed,
                        CreatedAt = report.CreatedAt
                    },
                    UpdatedStock = new ProductStockSummaryDto
                    {
                        ProductId = product.ProductId,
                        ProductName = product.ProductName,
                        TotalStock = product.TotalStock,
                        PassedStock = product.PassedStock,
                        FailedStock = product.FailedStock
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = $"Lỗi giao dịch cơ sở dữ liệu: {ex.Message}" });
            }
        }

        // GET: api/inspectionreports?productId=1&qualityStatus=Passed
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InspectionReportReadDto>>> GetReports(
            [FromQuery] int? productId,
            [FromQuery] string? qualityStatus)
        {
            var query = _context.InspectionReports
                .AsNoTracking()
                .Include(r => r.product)
                .Include(r => r.inspector)
                .Include(r => r.defectCategory)
                .AsQueryable();

            if (productId.HasValue)
            {
                query = query.Where(r => r.ProductId == productId.Value);
            }

            if (!string.IsNullOrWhiteSpace(qualityStatus))
            {
                query = query.Where(r => r.QualityStatus.ToLower() == qualityStatus.Trim().ToLower());
            }

            var reports = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new InspectionReportReadDto
                {
                    ReportId = r.ReportId,
                    ProductId = r.ProductId,
                    ProductName = r.product != null ? r.product.ProductName : string.Empty,
                    InspectorId = r.InspectorId,
                    InspectorName = r.inspector != null ? r.inspector.InspectorName : string.Empty,
                    DefectCategoryId = r.DefectCategoryId,
                    DefectCategoryName = r.defectCategory != null ? r.defectCategory.CategoryName : string.Empty,
                    SeverityLevel = r.defectCategory != null ? r.defectCategory.SeverityLevel : string.Empty,
                    ImageURL = r.ImageURL,
                    DefectDescription = r.DefectDescription,
                    QualityStatus = r.QualityStatus,
                    ConfidenceScore = r.ConfidenceScore,
                    IsUserConfirmed = r.IsUserConfirmed,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reports);
        }

        // GET: api/inspectionreports/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<InspectionReportReadDto>> GetReport(int id)
        {
            var report = await _context.InspectionReports
                .AsNoTracking()
                .Include(r => r.product)
                .Include(r => r.inspector)
                .Include(r => r.defectCategory)
                .Where(r => r.ReportId == id)
                .Select(r => new InspectionReportReadDto
                {
                    ReportId = r.ReportId,
                    ProductId = r.ProductId,
                    ProductName = r.product != null ? r.product.ProductName : string.Empty,
                    InspectorId = r.InspectorId,
                    InspectorName = r.inspector != null ? r.inspector.InspectorName : string.Empty,
                    DefectCategoryId = r.DefectCategoryId,
                    DefectCategoryName = r.defectCategory != null ? r.defectCategory.CategoryName : string.Empty,
                    SeverityLevel = r.defectCategory != null ? r.defectCategory.SeverityLevel : string.Empty,
                    ImageURL = r.ImageURL,
                    DefectDescription = r.DefectDescription,
                    QualityStatus = r.QualityStatus,
                    ConfidenceScore = r.ConfidenceScore,
                    IsUserConfirmed = r.IsUserConfirmed,
                    CreatedAt = r.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (report == null)
            {
                return NotFound(new { message = $"Không tìm thấy báo cáo kiểm định có mã {id}" });
            }

            return Ok(report);
        }
    }
}
