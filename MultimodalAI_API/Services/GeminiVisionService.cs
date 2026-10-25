using System.Net.Http.Json;
using System.Text.Json;
using MultimodalAI_API.Dtos;
using MultimodalAI_API.Entities;

namespace MultimodalAI_API.Services
{
    public class GeminiVisionService : IGeminiVisionService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;

        public GeminiVisionService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _config = config;
        }

        public async Task<GeminiAnalysisResultDto> AnalyzeProductImageAsync(
            byte[] imageBytes, string mimeType, Product product, List<DefectCategory> categories)
        {
            var apiKey = _config["Gemini:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("Vui lòng cấu hình Gemini:ApiKey trong appsettings.json.");
            }

            var model = _config["Gemini:Model"] ?? "gemini-1.5-flash";
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            // Rút gọn danh sách danh mục lỗi để đưa vào prompt
            var catList = string.Join(", ", categories.Select(c => $"{c.DefectCategoryId}: {c.CategoryName} ({c.SeverityLevel})"));

            var prompt = $@"Bạn là chuyên gia QC kiểm tra sản phẩm '{product.ProductName}' ({product.Category}).
Danh mục lỗi: [{catList}].
Yêu cầu:
1. Nếu ảnh mờ/tối/lóa/không rõ chi tiết sản phẩm: đặt isImageClear = false, defectDetected = false, defectCategoryId = 1, qualityStatus = 'Failed', confidenceScore = 0.0, defectDescription = 'Ảnh mờ hoặc không rõ chi tiết, vui lòng chụp lại.'.
2. Nếu ảnh rõ nét (isImageClear = true):
   - Đạt (không lỗi): defectDetected = false, defectCategoryId = 1, defectCategoryName = 'Không có lỗi (No Defect)', severityLevel = 'None', qualityStatus = 'Passed', confidenceScore = 0.80 - 1.0, defectDescription = 'Sản phẩm hoàn thiện tốt, không phát hiện lỗi.'.
   - Lỗi: defectDetected = true, defectCategoryId = (chọn id phù hợp trong danh mục), defectCategoryName = (tên khớp), severityLevel = (mức độ lỗi), qualityStatus = 'Failed', confidenceScore (0 - 0.79), defectDescription = (mô tả lỗi chi tiết bằng tiếng Việt).
Trả về JSON đúng cấu trúc:
{{
  ""isImageClear"": true,
  ""defectDetected"": false,
  ""defectCategoryId"": 1,
  ""defectCategoryName"": ""Không có lỗi (No Defect)"",
  ""severityLevel"": ""None"",
  ""defectDescription"": ""..."",
  ""confidenceScore"": 0.95,
  ""qualityStatus"": ""Passed""
}}";

            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = prompt },
                            new { inline_data = new { mime_type = mimeType, data = Convert.ToBase64String(imageBytes) } }
                        }
                    }
                },
                generationConfig = new { response_mime_type = "application/json", temperature = 0.2 }
            };

            var response = await _http.PostAsJsonAsync(url, payload);
            response.EnsureSuccessStatusCode();

            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var rawText = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "{}";

            var cleanJson = rawText.Replace("```json", "").Replace("```", "").Trim();
            var result = JsonSerializer.Deserialize<GeminiAnalysisResultDto>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                         ?? new GeminiAnalysisResultDto();

            result.ProductId = product.ProductId;
            result.ProductName = product.ProductName;
            return result;
        }
    }
}
