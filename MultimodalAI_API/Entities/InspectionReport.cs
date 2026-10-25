using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MultimodalAI_API.Entities
{
    [Table("InspectionReport")]
    public class InspectionReport
    {
        [Key]
        public int ReportId { get; set; }
        //khóa ngoại
        [Required]
        public int ProductId { get; set; }
        [Required]
        public int InspectorId { get; set; }
        [Required]
        public int DefectCategoryId { get; set; }

        [Required]
        [StringLength(500)]
        public string ImageURL { get; set; } = string.Empty;
        public string DefectDescription { get; set; } = string.Empty;
        [Required]
        [StringLength(50)]
        public string QualityStatus { get; set; } = string.Empty;
        public float ConfidenceScore { get; set; }
        public bool IsUserConfirmed { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        //
        [ForeignKey(nameof(ProductId))]
        public Product? product { get; set; }
        [ForeignKey(nameof(InspectorId))]
        public Inspector? inspector { get; set; }
        [ForeignKey(nameof(DefectCategoryId))]
        public DefectCategory? defectCategory { get; set; }
    }
}
