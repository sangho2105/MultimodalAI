# AI Product Defect Inspection & Quality Control Assistant

Hệ thống kiểm định khuyết tật sản phẩm và quản lý chất lượng (QC) tự động ứng dụng **Multimodal AI (Google Gemini Vision)**, xây dựng trên nền tảng **ASP.NET Core Web API (.NET 10)**, **SQL Server với Entity Framework Core (Code First)** và **React.js**.

---

## 📑 MỤC LỤC
1. [Giới thiệu Dự án](#1-giới-thiệu-dự-án)
2. [Luồng Hoạt động (Workflow)](#2-luồng-hoạt-động-workflow)
3. [Công nghệ Sử dụng (Technology Stack)](#3-công-nghệ-sử-dụng-technology-stack)
4. [Đặc tả RESTful API Endpoints](#4-đặc-tả-restful-api-endpoints)
5. [Kịch bản Kiểm thử Thực tế (R6 Testing Scenarios)](#5-kịch-bản-kiểm-thử-thực-tế-r6-testing-scenarios)
6. [Hướng dẫn Cài đặt & Khởi chạy (Getting Started)](#6-hướng-dẫn-cài-đặt--khởi-chạy-getting-started)

---

## 1. GIỚI THIỆU DỰ ÁN

**AI Product Defect Inspection Assistant** là giải pháp hỗ trợ nhân viên QC trên dây chuyền sản xuất:
- **Tự động phân tích**: Sử dụng **Multimodal AI (Google Gemini Vision)** nhận diện khuyết tật bề mặt/cấu trúc từ ảnh chụp sản phẩm.
- **Phân loại & Đánh giá**: Phân loại mức độ lỗi (*None, Minor, Major, Critical*), tính điểm tin cậy (*Confidence Score*) và đề xuất trạng thái (*Passed/Failed*).
- **Kiểm soát & Xác nhận (Review & Confirm)**: Nhân viên QC xem trước kết quả AI, hiệu chỉnh mô tả và quyết định phê duyệt.
- **Cập nhật kho tự động**: Sử dụng **giao dịch nguyên tử (Atomic Database Transaction)** để lưu báo cáo và đồng bộ số lượng tồn kho (*PassedStock*, *FailedStock*) tức thời.

---

## 2. LUỒNG HOẠT ĐỘNG (WORKFLOW)

Hệ thống vận hành theo quy trình khép kín 5 bước:

**[1. Tải ảnh & Chọn tiêu chí]** ➔ **[2. Backend xử lý & Lưu ảnh]** ➔ **[3. Gemini AI phân tích]** ➔ **[4. QC Xem lại & Xác nhận]** ➔ **[5. Giao dịch DB & Cập nhật kho]**

1. **Bước 1: Tải ảnh & Chọn tiêu chí (User Interface - React)**
   - Nhân viên QC chọn sản phẩm cần kiểm định, chọn người thực hiện và tải ảnh lên từ giao diện.
   - Hỗ trợ kéo thả file và xem trước ảnh tức thì (Live Preview).

2. **Bước 2: Tiếp nhận & Lưu trữ file (Web API Backend - .NET 10)**
   - API tiếp nhận yêu cầu dạng `multipart/form-data`.
   - Kiểm tra định dạng hợp lệ (.jpg, .png, .webp) và giới hạn dung lượng (tối đa 10MB).
   - Lưu trữ ảnh vật lý vào thư mục tĩnh `wwwroot/uploads/` và chuyển đổi sang Base64 phục vụ AI.

3. **Bước 3: Phân tích hình ảnh (Google Gemini Vision AI)**
   - Backend gửi ảnh kèm prompt tiếng Việt chuẩn hóa định dạng JSON tới Gemini API.
   - AI kiểm tra độ rõ nét của ảnh, phát hiện khuyết tật, phân loại lỗi, chấm điểm tin cậy (*Confidence Score*) và đề xuất trạng thái (*Passed/Failed*).
   - Tích hợp cơ chế tự động thử lại (Retry) và chuyển đổi dự phòng model (Fallback) nếu server AI bận.

4. **Bước 4: Xem lại & Xác nhận (Review & Confirmation)**
   - Kết quả trích xuất từ AI được hiển thị trực quan bên cạnh ảnh sản phẩm trên giao diện.
   - Nhân viên QC có thể kiểm tra, điều chỉnh thông tin hoặc bổ sung mô tả lỗi trước khi phê duyệt.

5. **Bước 5: Giao dịch & Cập nhật kho (Database Transaction - EF Core)**
   - Kích hoạt giao dịch nguyên tử `IDbContextTransaction` để đảm bảo tính toàn vẹn dữ liệu.
   - Lưu báo cáo kiểm định (`InspectionReport`) với cờ xác nhận `IsUserConfirmed = true`.
   - Tự động tăng số lượng hàng đạt (`PassedStock`) hoặc hàng lỗi (`FailedStock`) của sản phẩm.
   - Commit giao dịch và đồng bộ số liệu thống kê lên Dashboard theo thời gian thực.

---

## 3. CÔNG NGHỆ SỬ DỤNG (TECHNOLOGY STACK)

| Thành phần | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | React 19, Lucide React, Modern CSS System |
| **Backend** | ASP.NET Core Web API | .NET 10, C# 13, Controllers, Dependency Injection |
| **Database** | SQL Server | Microsoft Entity Framework Core 10, Code First Migrations |
| **AI Service** | Google Gemini Multimodal API | `gemini-3.5-flash`, `gemini-3.1-flash-lite`, Structured JSON |
| **Static Files** | Static File Middleware | Quản lý và phục vụ ảnh tại `wwwroot/uploads` |

---

## 4. ĐẶC TẢ RESTFUL API ENDPOINTS

Base URL: `http://localhost:5223`

| STT | Phương thức | Đường dẫn API | Chức năng nghiệp vụ |
| :---: | :---: | :--- | :--- |
| 1 | `GET` | `/api/products` | Lấy danh sách sản phẩm kèm số lượng tồn kho (`TotalStock`, `PassedStock`, `FailedStock`) |
| 2 | `GET` | `/api/products/{id}` | Lấy chi tiết thông tin sản phẩm |
| 3 | `GET` | `/api/inspectors` | Lấy danh sách nhân viên QC |
| 4 | `GET` | `/api/defectcategories` | Lấy danh mục phân loại khuyết tật |
| 5 | `GET` | `/api/inspectionreports` | Lấy lịch sử kiểm định (hỗ trợ lọc theo `productId` và `qualityStatus`) |
| 6 | `GET` | `/api/inspectionreports/{id}`| Lấy chi tiết một báo cáo kiểm định |
| 7 | `POST` | `/api/inspectionreports/analyze` | Tải ảnh lên (`multipart/form-data`) & phân tích khuyết tật với Gemini Vision AI |
| 8 | `POST` | `/api/inspectionreports/confirm` | Xác nhận báo cáo, thực thi `IDbContextTransaction` và tự động cập nhật kho |

---

## 5. KỊCH BẢN KIỂM THỬ THỰC TẾ (R6 TESTING SCENARIOS)

Dự án đã chuẩn bị sẵn bộ 4 hình ảnh kiểm thử thực tế trong thư mục [`TestImages/`](./TestImages/) để phục vụ chạy thử cho các tình huống:
1. **`01_good_product.jpg`**: Tình huống sản phẩm đạt chuẩn (*Passed / Không có lỗi*).
2. **`02_minor_scratch.jpg`**: Tình huống sản phẩm có lỗi nhẹ (*Failed - Minor: Trầy xước bề mặt*).
3. **`03_major_cracked.jpg`**: Tình huống sản phẩm có lỗi nặng (*Failed - Major: Nứt vỡ cấu trúc*).
4. **`04_unclear_blurry.jpg`**: Tình huống ảnh không đạt chuẩn (*Ảnh mờ/tối/không rõ chi tiết, AI cảnh báo chụp lại*).

---

## 6. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (GETTING STARTED)

### 6.1. Yêu cầu môi trường
- [.NET SDK 10.0](https://dotnet.microsoft.com/)
- [Node.js (LTS v18+)](https://nodejs.org/) & npm
- SQL Server (MSSQLLocalDB đi kèm Visual Studio hoặc SQL Server Express)

### 6.2. Cấu hình Gemini API Key
Cấu hình API Key của bạn vào file `MultimodalAI_API/appsettings.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=MultimodalAI_DB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Gemini": {
    "ApiKey": "YOUR_GOOGLE_GEMINI_API_KEY",
    "Model": "gemini-3.5-flash"
  },
  "AllowedHosts": "*"
}
```

### 6.3. Cập nhật Cơ sở dữ liệu (Migration)
Mở terminal tại thư mục gốc và chạy lệnh để tự động tạo Database `MultimodalAI_DB` cùng dữ liệu mẫu ban đầu:
```bash
cd MultimodalAI_API
dotnet ef database update
```

### 6.4. Khởi chạy Backend Web API
Tại thư mục `MultimodalAI_API`:
```bash
dotnet run
```
- API chạy tại: `http://localhost:5223`
- Tài liệu Swagger UI: `http://localhost:5223/swagger`

### 6.5. Khởi chạy Frontend React
Mở terminal mới tại thư mục `MultimodalAI_Client`:
```bash
cd MultimodalAI_Client
npm install
npm run dev
```
- Ứng dụng chạy tại: `http://localhost:5173`
