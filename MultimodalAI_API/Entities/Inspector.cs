using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MultimodalAI_API.Entities
{
    [Table("Inspector")]
    public class Inspector
    {
        [Key]
        public int InspectorId { get; set; }
        [Required]
        [StringLength(100)]
        public string InspectorName { get; set; } = string.Empty;
        [Required]
        [StringLength(100)]
        public string Department { get; set; } = string.Empty;
        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        //khóa ngoại
        public ICollection<InspectionReport> inspectionReports { get; set; } = new List<InspectionReport>();
    }
}
