using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MultimodalAI_API.Entities
{
    [Table("DefectCategory")]
    public class DefectCategory
    {
        [Key]
        public int DefectCategoryId { get; set; }
        [Required]
        [StringLength(100)]
        public string CategoryName { get; set; } = string.Empty;
        [Required]
        [StringLength(50)]
        public string SeverityLevel { get; set; } = string.Empty;
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        //khoá ngoại
        public ICollection<InspectionReport> inspectionReports { get; set; } = new List<InspectionReport>();
    }
}
