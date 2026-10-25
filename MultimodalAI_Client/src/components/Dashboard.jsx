import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ClipboardCheck, 
  Package, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle 
} from 'lucide-react';

export default function Dashboard({ products, reports, onNavigateToInspect, onRefresh }) {
  // Tính toán các chỉ số thống kê
  const totalInspections = reports.length;
  const passedCount = reports.filter(r => r.qualityStatus === 'Passed').length;
  const failedCount = reports.filter(r => r.qualityStatus === 'Failed').length;
  const passRate = totalInspections > 0 ? ((passedCount / totalInspections) * 100).toFixed(1) : 0;
  const defectRate = totalInspections > 0 ? ((failedCount / totalInspections) * 100).toFixed(1) : 0;

  // Thống kê phân loại lỗi
  const defectStats = reports
    .filter(r => r.qualityStatus === 'Failed')
    .reduce((acc, curr) => {
      const cat = curr.defectCategoryName || 'Khác';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

  const sortedDefects = Object.entries(defectStats).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      {/* 4 Thẻ thống kê chính */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Tổng lượt kiểm định</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
              <ClipboardCheck size={18} />
            </div>
          </div>
          <div className="metric-value">{totalInspections}</div>
          <div className="metric-sub">Báo cáo đã được xác nhận</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Sản phẩm Đạt chuẩn</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#16a34a' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#16a34a' }}>{passedCount}</div>
          <div className="metric-sub">Tỷ lệ Đạt: <strong>{passRate}%</strong></div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Phát hiện Lỗi / Hỏng</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <XCircle size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#dc2626' }}>{failedCount}</div>
          <div className="metric-sub">Tỷ lệ Lỗi: <strong>{defectRate}%</strong></div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Mẫu sản phẩm theo dõi</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
              <Package size={18} />
            </div>
          </div>
          <div className="metric-value">{products.length}</div>
          <div className="metric-sub">Đang lưu hành trong kho</div>
        </div>
      </div>

      {/* Grid 2 cột: Bảng tồn kho & Phân bố lỗi */}
      <div className="dashboard-grid">
        {/* Cột 1: Tình trạng tồn kho sản phẩm */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Package size={18} /> Tình trạng Tồn kho & Tỷ lệ Đạt
            </h3>
            <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }} onClick={onRefresh}>
              Làm mới
            </button>
          </div>
          <div className="table-wrap">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Phân loại</th>
                  <th style={{ textAlign: 'center' }}>Tổng kho</th>
                  <th style={{ textAlign: 'center' }}>Đạt</th>
                  <th style={{ textAlign: 'center' }}>Lỗi</th>
                  <th>Tỷ lệ Đạt</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có dữ liệu sản phẩm</td>
                  </tr>
                ) : (
                  products.map(p => {
                    const totalInspected = p.passedStock + p.failedStock;
                    const pRate = totalInspected > 0 ? Math.round((p.passedStock / totalInspected) * 100) : 100;
                    return (
                      <tr key={p.productId}>
                        <td><strong>{p.productName}</strong></td>
                        <td><span className="badge badge-none">{p.category}</span></td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.totalStock}</td>
                        <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{p.passedStock}</td>
                        <td style={{ textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>{p.failedStock}</td>
                        <td style={{ width: '140px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                            <span>{pRate}%</span>
                            <span style={{ color: '#64748b' }}>{totalInspected}/{p.totalStock}</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${pRate}%`, 
                                backgroundColor: pRate >= 90 ? '#16a34a' : pRate >= 75 ? '#eab308' : '#dc2626' 
                              }} 
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cột 2: Phân bố các nhóm lỗi */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <AlertCircle size={18} /> Phân bố Khuyết tật
            </h3>
          </div>
          <div className="card-body">
            {sortedDefects.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                <CheckCircle2 size={32} style={{ color: '#16a34a', margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontSize: '0.875rem' }}>Chưa ghi nhận lỗi nào trong các báo cáo.</p>
              </div>
            ) : (
              <div>
                {sortedDefects.map(([name, count]) => {
                  const pct = Math.round((count / failedCount) * 100);
                  return (
                    <div key={name} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500 }}>{name}</span>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>{count} vụ ({pct}%)</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: '#dc2626' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lịch sử kiểm định gần đây */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <TrendingUp size={18} /> Lịch sử Kiểm định gần nhất
          </h3>
          <button className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8125rem' }} onClick={onNavigateToInspect}>
            + Kiểm định mới
          </button>
        </div>
        <div className="table-wrap">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Mã BC</th>
                <th>Sản phẩm</th>
                <th>Nhân viên QC</th>
                <th>Loại khuyết tật</th>
                <th>Trạng thái</th>
                <th>Độ tin cậy</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 5).map(r => (
                <tr key={r.reportId}>
                  <td>
                    <img 
                      src={r.imageURL} 
                      alt="QC thumbnail" 
                      className="table-thumb"
                      onError={(e) => { e.target.src = 'https://placehold.co/44x44?text=Img'; }}
                    />
                  </td>
                  <td><strong>#{r.reportId}</strong></td>
                  <td>{r.productName}</td>
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
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có báo cáo kiểm định nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
