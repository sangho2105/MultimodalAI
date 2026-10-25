import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Eye, 
  Calendar, 
  X,
  Search 
} from 'lucide-react';

export default function InspectionHistory({ reports, products, onRefresh }) {
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Lọc dữ liệu client-side
  const filteredReports = reports.filter(r => {
    const matchProduct = !filterProduct || r.productId === Number(filterProduct);
    const matchStatus = !filterStatus || r.qualityStatus.toLowerCase() === filterStatus.toLowerCase();
    return matchProduct && matchStatus;
  });

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Filter size={18} /> Lịch Sử Báo Cáo Kiểm Định Chất Lượng (QC History)
          </h3>
          <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Hiển thị <strong>{filteredReports.length}</strong> / {reports.length} báo cáo
          </span>
        </div>
        <div className="card-body" style={{ paddingBottom: '0.5rem' }}>
          {/* Thanh bộ lọc */}
          <div className="filter-bar">
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Lọc theo Sản phẩm:
              </label>
              <select 
                className="filter-select"
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
              >
                <option value="">Tất cả sản phẩm</option>
                {products.map(p => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Lọc theo Trạng thái:
              </label>
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Passed">Đạt chuẩn (Passed)</option>
                <option value="Failed">Phát hiện lỗi (Failed)</option>
              </select>
            </div>

            {(filterProduct || filterStatus) && (
              <div style={{ alignSelf: 'flex-end', marginBottom: '4px' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => { setFilterProduct(''); setFilterStatus(''); }}
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bảng danh sách báo cáo */}
        <div className="table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Mã BC</th>
                <th>Sản phẩm</th>
                <th>Nhân viên QC</th>
                <th>Phân loại khuyết tật</th>
                <th>Trạng thái</th>
                <th>Độ tin cậy</th>
                <th>Thời gian</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                    Không tìm thấy báo cáo kiểm định nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredReports.map(r => (
                  <tr key={r.reportId}>
                    <td>
                      <img 
                        src={r.imageURL} 
                        alt="QC" 
                        className="table-thumb"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedReport(r)}
                        onError={(e) => { e.target.src = 'https://placehold.co/44x44?text=Img'; }}
                      />
                    </td>
                    <td><strong>#{r.reportId}</strong></td>
                    <td><strong>{r.productName}</strong></td>
                    <td>{r.inspectorName}</td>
                    <td>
                      {r.defectCategoryName && (
                        <span className={`badge ${
                          r.severityLevel === 'Minor' ? 'badge-minor' :
                          r.severityLevel === 'Major' ? 'badge-major' :
                          r.severityLevel === 'Critical' ? 'badge-critical' : 'badge-none'
                        }`}>
                          {r.defectCategoryName}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${r.qualityStatus === 'Passed' ? 'badge-passed' : 'badge-failed'}`}>
                        {r.qualityStatus === 'Passed' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {r.qualityStatus === 'Passed' ? 'ĐẠT' : 'LỖI'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{(r.confidenceScore * 100).toFixed(1)}%</td>
                    <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                      {new Date(r.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => setSelectedReport(r)}
                      >
                        <Eye size={14} /> Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal xem chi tiết báo cáo & phóng to ảnh */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                Chi tiết Báo Cáo Kiểm Định #{selectedReport.reportId}
              </h3>
              <button 
                onClick={() => setSelectedReport(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <div style={{ 
                backgroundColor: '#0f172a', 
                borderRadius: '6px', 
                overflow: 'hidden', 
                textAlign: 'center', 
                marginBottom: '1.25rem',
                maxHeight: '360px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={selectedReport.imageURL} 
                  alt="Chi tiết lỗi" 
                  style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = 'https://placehold.co/600x360?text=Khong+Tai+Duoc+Anh'; }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Sản phẩm:</span>
                  <strong>{selectedReport.productName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Nhân viên QC:</span>
                  <strong>{selectedReport.inspectorName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Kết quả kiểm định:</span>
                  <span className={`badge ${selectedReport.qualityStatus === 'Passed' ? 'badge-passed' : 'badge-failed'}`} style={{ marginTop: '2px' }}>
                    {selectedReport.qualityStatus === 'Passed' ? 'ĐẠT (PASSED)' : 'LỖI (FAILED)'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Độ tin cậy AI:</span>
                  <strong>{(selectedReport.confidenceScore * 100).toFixed(1)}%</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Phân loại lỗi:</span>
                  <strong>{selectedReport.defectCategoryName || 'Không có lỗi'}</strong> ({selectedReport.severityLevel})
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Thời gian thực hiện:</span>
                  <span>{new Date(selectedReport.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Mô tả khuyết tật:
                </span>
                <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  {selectedReport.defectDescription || 'Không có ghi chú thêm.'}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
                <button className="btn btn-outline" onClick={() => setSelectedReport(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
