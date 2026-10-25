namespace MultimodalAI_API.Dtos
{
    public class InspectorReadDto
    {
        public int InspectorId { get; set; }
        public string InspectorName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
