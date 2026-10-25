// API Client kết nối với Backend ASP.NET Core
const API_BASE = '/api';

export const api = {
  // Lấy danh sách sản phẩm
  async getProducts() {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
    return res.json();
  },

  // Lấy danh sách nhân viên kiểm định
  async getInspectors() {
    const res = await fetch(`${API_BASE}/inspectors`);
    if (!res.ok) throw new Error('Không thể tải danh sách nhân viên QC');
    return res.json();
  },

  // Lấy danh sách phân loại lỗi
  async getDefectCategories() {
    const res = await fetch(`${API_BASE}/defectcategories`);
    if (!res.ok) throw new Error('Không thể tải danh mục khuyết tật');
    return res.json();
  },

  // Lấy danh sách lịch sử kiểm định (có lọc)
  async getReports(productId = null, qualityStatus = '') {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    if (qualityStatus) params.append('qualityStatus', qualityStatus);

    const url = `${API_BASE}/inspectionreports${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể tải lịch sử kiểm định');
    return res.json();
  },

  // Phân tích ảnh với Gemini Vision AI (R4)
  async analyzeImage(productId, inspectorId, imageFile) {
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('inspectorId', inspectorId);
    formData.append('image', imageFile);

    const res = await fetch(`${API_BASE}/inspectionreports/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Lỗi khi phân tích hình ảnh với AI');
    }

    return res.json();
  },

  // Xác nhận báo cáo và cập nhật kho tự động (R5 - Transaction)
  async confirmReport(data) {
    const res = await fetch(`${API_BASE}/inspectionreports/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Lỗi khi xác nhận báo cáo và cập nhật kho');
    }

    return res.json();
  },
};
