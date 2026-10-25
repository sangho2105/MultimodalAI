using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MultimodalAI_API.Migrations
{
    /// <inheritdoc />
    public partial class MultimodalAI : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DefectCategory",
                columns: table => new
                {
                    DefectCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SeverityLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefectCategory", x => x.DefectCategoryId);
                });

            migrationBuilder.CreateTable(
                name: "Inspector",
                columns: table => new
                {
                    InspectorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InspectorName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inspector", x => x.InspectorId);
                });

            migrationBuilder.CreateTable(
                name: "Product",
                columns: table => new
                {
                    ProductId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TotalStock = table.Column<int>(type: "int", nullable: false),
                    PassedStock = table.Column<int>(type: "int", nullable: false),
                    FailedStock = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.ProductId);
                });

            migrationBuilder.CreateTable(
                name: "InspectionReport",
                columns: table => new
                {
                    ReportId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    InspectorId = table.Column<int>(type: "int", nullable: false),
                    DefectCategoryId = table.Column<int>(type: "int", nullable: false),
                    ImageURL = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DefectDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QualityStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ConfidenceScore = table.Column<float>(type: "real", nullable: false),
                    IsUserConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspectionReport", x => x.ReportId);
                    table.ForeignKey(
                        name: "FK_InspectionReport_DefectCategory_DefectCategoryId",
                        column: x => x.DefectCategoryId,
                        principalTable: "DefectCategory",
                        principalColumn: "DefectCategoryId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InspectionReport_Inspector_InspectorId",
                        column: x => x.InspectorId,
                        principalTable: "Inspector",
                        principalColumn: "InspectorId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InspectionReport_Product_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Product",
                        principalColumn: "ProductId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "DefectCategory",
                columns: new[] { "DefectCategoryId", "CategoryName", "Description", "SeverityLevel" },
                values: new object[,]
                {
                    { 1, "Không có lỗi (No Defect)", "Sản phẩm đạt chuẩn kiểm định chất lượng, không phát hiện khiếm khuyết.", "None" },
                    { 2, "Trầy xước bề mặt (Surface Scratch)", "Vết xước nông ngoài bề mặt vỏ, chưa ảnh hưởng cấu trúc hay chức năng.", "Minor" },
                    { 3, "Nứt vỡ cấu trúc (Structural Crack)", "Vết nứt trên thân sản phẩm hoặc bo mạch gây nguy cơ hỏng hóc nghiêm trọng.", "Major" },
                    { 4, "Biến dạng / Móp méo (Deformation)", "Sản phẩm bị cong vênh, móp méo kích thước vượt ngưỡng dung sai cho phép.", "Major" },
                    { 5, "Ố bẩn / Đổi màu (Stain & Discoloration)", "Vết ố do dầu mỡ, oxy hóa hoặc sai lệch màu sắc lớp phủ bề mặt.", "Minor" },
                    { 6, "Hở mối hàn / Thiếu linh kiện (Solder / Missing Component)", "Lỗi mạch in PCB: thiếu tụ/điện trở hoặc mối hàn bị bắc cầu gây đoản mạch.", "Critical" }
                });

            migrationBuilder.InsertData(
                table: "Inspector",
                columns: new[] { "InspectorId", "Department", "Email", "InspectorName" },
                values: new object[,]
                {
                    { 1, "Quality Control (QC) - Dây chuyền 1", "an.nguyen@smartqc.factory.com", "Nguyễn Văn An" },
                    { 2, "Quality Assurance (QA) - Phòng thí nghiệm", "binh.tran@smartqc.factory.com", "Trần Thị Bình" },
                    { 3, "Incoming Material QC", "cuong.le@smartqc.factory.com", "Lê Hoàng Cường" }
                });

            migrationBuilder.InsertData(
                table: "Product",
                columns: new[] { "ProductId", "Category", "CreatedAt", "FailedStock", "PassedStock", "ProductName", "TotalStock" },
                values: new object[,]
                {
                    { 1, "Linh kiện điện tử", new DateTime(2025, 1, 1, 8, 0, 0, 0, DateTimeKind.Utc), 20, 180, "Bo mạch điều khiển IoT PCB-V2", 200 },
                    { 2, "Gia công cơ khí", new DateTime(2025, 1, 1, 8, 0, 0, 0, DateTimeKind.Utc), 8, 142, "Vỏ nhôm Anode Smartphone Pro", 150 },
                    { 3, "Quang học", new DateTime(2025, 1, 1, 8, 0, 0, 0, DateTimeKind.Utc), 5, 75, "Ống kính quang học Coating Lens 50mm", 80 }
                });

            migrationBuilder.InsertData(
                table: "InspectionReport",
                columns: new[] { "ReportId", "ConfidenceScore", "CreatedAt", "DefectCategoryId", "DefectDescription", "ImageURL", "InspectorId", "IsUserConfirmed", "ProductId", "QualityStatus" },
                values: new object[,]
                {
                    { 1, 0.98f, new DateTime(2025, 1, 1, 10, 0, 0, 0, DateTimeKind.Utc), 1, "Bề mặt linh kiện sạch sẽ, các chân IC hàn đúng chuẩn, không phát hiện khiếm khuyết.", "/uploads/samples/sample_pcb_pass.jpg", 1, true, 1, "Passed" },
                    { 2, 0.91f, new DateTime(2025, 1, 1, 13, 0, 0, 0, DateTimeKind.Utc), 2, "Phát hiện vết trầy dài khoảng 1.5cm ở cạnh viền phải của vỏ nhôm.", "/uploads/samples/sample_case_scratch.jpg", 2, true, 2, "Failed" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_InspectionReport_DefectCategoryId",
                table: "InspectionReport",
                column: "DefectCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionReport_InspectorId",
                table: "InspectionReport",
                column: "InspectorId");

            migrationBuilder.CreateIndex(
                name: "IX_InspectionReport_ProductId",
                table: "InspectionReport",
                column: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InspectionReport");

            migrationBuilder.DropTable(
                name: "DefectCategory");

            migrationBuilder.DropTable(
                name: "Inspector");

            migrationBuilder.DropTable(
                name: "Product");
        }
    }
}
