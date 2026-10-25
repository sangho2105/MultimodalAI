using Microsoft.EntityFrameworkCore;
using MultimodalAI_API.Entities;

namespace MultimodalAI_API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Inspector> Inspectors => Set<Inspector>();
        public DbSet<DefectCategory> DefectCategories => Set<DefectCategory>();
        public DbSet<InspectionReport> InspectionReports => Set<InspectionReport>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Cố định mốc thời gian cho seed data
            var seedDate = new DateTime(2025, 1, 1, 8, 0, 0, DateTimeKind.Utc);
            // 1. Seed DefectCategory (Theo các kịch bản R4 & R6: Tốt / Lỗi nhẹ / Lỗi nặng)
            modelBuilder.Entity<DefectCategory>().HasData(
                new DefectCategory
                {
                    DefectCategoryId = 1,
                    CategoryName = "Không có lỗi (No Defect)",
                    SeverityLevel = "None",
                    Description = "Sản phẩm đạt chuẩn kiểm định chất lượng, không phát hiện khiếm khuyết."
                },
                new DefectCategory
                {
                    DefectCategoryId = 2,
                    CategoryName = "Trầy xước bề mặt (Surface Scratch)",
                    SeverityLevel = "Minor",
                    Description = "Vết xước nông ngoài bề mặt vỏ, chưa ảnh hưởng cấu trúc hay chức năng."
                },
                new DefectCategory
                {
                    DefectCategoryId = 3,
                    CategoryName = "Nứt vỡ cấu trúc (Structural Crack)",
                    SeverityLevel = "Major",
                    Description = "Vết nứt trên thân sản phẩm hoặc bo mạch gây nguy cơ hỏng hóc nghiêm trọng."
                },
                new DefectCategory
                {
                    DefectCategoryId = 4,
                    CategoryName = "Biến dạng / Móp méo (Deformation)",
                    SeverityLevel = "Major",
                    Description = "Sản phẩm bị cong vênh, móp méo kích thước vượt ngưỡng dung sai cho phép."
                },
                new DefectCategory
                {
                    DefectCategoryId = 5,
                    CategoryName = "Ố bẩn / Đổi màu (Stain & Discoloration)",
                    SeverityLevel = "Minor",
                    Description = "Vết ố do dầu mỡ, oxy hóa hoặc sai lệch màu sắc lớp phủ bề mặt."
                },
                new DefectCategory
                {
                    DefectCategoryId = 6,
                    CategoryName = "Hở mối hàn / Thiếu linh kiện (Solder / Missing Component)",
                    SeverityLevel = "Critical",
                    Description = "Lỗi mạch in PCB: thiếu tụ/điện trở hoặc mối hàn bị bắc cầu gây đoản mạch."
                }
            );
            // 2. Seed Inspector (Nhân viên kiểm định QC)
            modelBuilder.Entity<Inspector>().HasData(
                new Inspector
                {
                    InspectorId = 1,
                    InspectorName = "Nguyễn Văn An",
                    Department = "Quality Control (QC) - Dây chuyền 1",
                    Email = "an.nguyen@smartqc.factory.com"
                },
                new Inspector
                {
                    InspectorId = 2,
                    InspectorName = "Trần Thị Bình",
                    Department = "Quality Assurance (QA) - Phòng thí nghiệm",
                    Email = "binh.tran@smartqc.factory.com"
                },
                new Inspector
                {
                    InspectorId = 3,
                    InspectorName = "Lê Hoàng Cường",
                    Department = "Incoming Material QC",
                    Email = "cuong.le@smartqc.factory.com"
                }
            );
            // 3. Seed Product (Sản phẩm mẫu để cập nhật kho theo R5)
            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    ProductId = 1,
                    ProductName = "Bo mạch điều khiển IoT PCB-V2",
                    Category = "Linh kiện điện tử",
                    TotalStock = 200,
                    PassedStock = 180,
                    FailedStock = 20,
                    CreatedAt = seedDate
                },
                new Product
                {
                    ProductId = 2,
                    ProductName = "Vỏ nhôm Anode Smartphone Pro",
                    Category = "Gia công cơ khí",
                    TotalStock = 150,
                    PassedStock = 142,
                    FailedStock = 8,
                    CreatedAt = seedDate
                },
                new Product
                {
                    ProductId = 3,
                    ProductName = "Ống kính quang học Coating Lens 50mm",
                    Category = "Quang học",
                    TotalStock = 80,
                    PassedStock = 75,
                    FailedStock = 5,
                    CreatedAt = seedDate
                }
            );
            // 4. Seed InspectionReport (1-2 báo cáo mẫu phục vụ test Dashboard R2)
            modelBuilder.Entity<InspectionReport>().HasData(
                new InspectionReport
                {
                    ReportId = 1,
                    ProductId = 1,
                    InspectorId = 1,
                    DefectCategoryId = 1, // Không có lỗi
                    ImageURL = "/uploads/samples/sample_pcb_pass.jpg",
                    DefectDescription = "Bề mặt linh kiện sạch sẽ, các chân IC hàn đúng chuẩn, không phát hiện khiếm khuyết.",
                    QualityStatus = "Passed",
                    ConfidenceScore = 0.98f,
                    IsUserConfirmed = true,
                    CreatedAt = seedDate.AddHours(2)
                },
                new InspectionReport
                {
                    ReportId = 2,
                    ProductId = 2,
                    InspectorId = 2,
                    DefectCategoryId = 2, // Trầy xước bề mặt
                    ImageURL = "/uploads/samples/sample_case_scratch.jpg",
                    DefectDescription = "Phát hiện vết trầy dài khoảng 1.5cm ở cạnh viền phải của vỏ nhôm.",
                    QualityStatus = "Failed",
                    ConfidenceScore = 0.91f,
                    IsUserConfirmed = true,
                    CreatedAt = seedDate.AddHours(5)
                }
            );
        }
    }
}
