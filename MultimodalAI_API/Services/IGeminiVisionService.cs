using MultimodalAI_API.Dtos;
using MultimodalAI_API.Entities;

namespace MultimodalAI_API.Services
{
    public interface IGeminiVisionService
    {
        Task<GeminiAnalysisResultDto> AnalyzeProductImageAsync(
            byte[] imageBytes,
            string mimeType,
            Product product,
            List<DefectCategory> categories);
    }
}
