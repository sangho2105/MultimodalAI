using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MultimodalAI_API.Entities
{
    [Table("Product")]
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductId { get; set; }
        [Required]
        [StringLength(200)]
        public string ProductName { get; set; } = string.Empty;
        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;
        public int TotalStock { get; set; }
        public int PassedStock { get; set; }
        public int FailedStock { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        //khóa ngoại
        public ICollection<InspectionReport> inspectionReports { get; set; } = new List<InspectionReport>();
    }
}
