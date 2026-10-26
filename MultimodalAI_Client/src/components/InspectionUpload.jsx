import React, { useState } from 'react';
import { 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Check, 
  ArrowRight,
  Info 
} from 'lucide-react';
import { api } from '../services/api';

export default function InspectionUpload({ 
  products, 
  inspectors, 
  categories, 
  onInspectionSuccess,
  onCancel 
}) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.productId || '');
  const [selectedInspectorId, setSelectedInspectorId] = useState(inspectors[0]?.inspectorId || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Trạng thái phân tích AI & kết quả
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  // Trạng thái cho form xác nhận (Review & Confirmation)
  const [confirmStatus, setConfirmStatus] = useState('Passed');
  const [confirmCategoryId, setConfirmCategoryId] = useState(1);
  const [confirmDescription, setConfirmDescription] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Xử lý chọn file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh hợp lệ (.jpg, .jpeg, .png, .webp).');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
    setAnalysisResult(null);
    setFeedback(null);
  };

  // Bộ 4 kịch bản ảnh kiểm thử thực tế (R6 Test Scenarios)
  const sampleScenarios = [
    {
      id: 1,
      title: '01. Đạt chuẩn (Pass)',
      filename: '01_good_product.jpg',
      productId: 2,
      desc: 'Bề mặt sạch đẹp, không lỗi'
    },
    {
      id: 2,
      title: '02. Lỗi nhẹ (Minor)',
      filename: '02_minor_scratch.jpg',
      productId: 2,
      desc: 'Trầy xước bề mặt vỏ nhôm'
    },
    {
      id: 3,
      title: '03. Lỗi nặng (Major)',
      filename: '03_major_cracked.jpg',
      productId: 2,
      desc: 'Nứt vỡ cấu trúc mặt lưng'
    },
    {
      id: 4,
      title: '04. Ảnh mờ (Unclear)',
      filename: '04_unclear_blurry.jpg',
      productId: 2,
      desc: 'Ảnh mờ/tối, AI báo chụp lại'
    }
  ];

  const handleSelectSample = async (sample) => {
    try {
      setSelectedProductId(sample.productId);
      const res = await fetch(`/test-images/${sample.filename}`);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      setError('');
      setAnalysisResult(null);
      setFeedback(null);
    } catch (err) {
      setError('Không thể nạp ảnh mẫu: ' + err.message);
    }
  };

  // Kéo thả file
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh hợp lệ.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setAnalysisResult(null);
      setFeedback(null);
    }
  };

  // Bắt đầu gọi API phân tích AI (R4)
  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn một hình ảnh sản phẩm để kiểm tra.');
      return;
    }
    if (!selectedProductId || !selectedInspectorId) {
      setError('Vui lòng chọn đầy đủ Sản phẩm và Nhân viên kiểm định.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    try {
      const result = await api.analyzeImage(selectedProductId, selectedInspectorId, selectedFile);
      setAnalysisResult(result);

      // Điền sẵn dữ liệu vào form Review
      setConfirmStatus(result.qualityStatus || 'Passed');
      setConfirmCategoryId(result.defectCategoryId || 1);
      setConfirmDescription(result.defectDescription || '');
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi gọi AI phân tích.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Xác nhận báo cáo và cập nhật kho tự động (R5 - Transaction)
  const handleConfirmReport = async () => {
    if (!analysisResult) return;

    setIsConfirming(true);
    setError('');
    try {
      const payload = {
        productId: Number(selectedProductId),
        inspectorId: Number(selectedInspectorId),
        defectCategoryId: Number(confirmCategoryId),
        imageUrl: analysisResult.imageUrl,
        defectDescription: confirmDescription,
        qualityStatus: confirmStatus,
        confidenceScore: analysisResult.confidenceScore || 0.95
      };

      const res = await api.confirmReport(payload);
      setFeedback(res);
      if (onInspectionSuccess) {
        onInspectionSuccess();
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi xác nhận báo cáo.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Reset để kiểm tra sản phẩm mới
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setAnalysisResult(null);
    setError('');
    setFeedback(null);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Thông báo Real-time feedback khi xác nhận thành công (R5) */}
      {feedback && (
        <div className="card" style={{ border: '1px solid #86efac', backgroundColor: '#f0fdf4' }}>
          <div className="card-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: '#dcfce7', 
              color: '#16a34a', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem auto' 
            }}>
              <Check size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>
              Xác Nhận & Cập Nhật Kho Thành Công!
            </h3>
            <p style={{ color: '#15803d', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {feedback.message}
            </p>

            {/* Thông tin kho cập nhật theo thời gian thực */}
            {feedback.updatedStock && (
              <div style={{ 
                display: 'inline-flex', 
                gap: '1.5rem', 
                backgroundColor: '#ffffff', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '8px', 
                border: '1px solid #bbf7d0',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Tổng kho</span>
                  <strong style={{ fontSize: '1.125rem', color: '#0f172a' }}>{feedback.updatedStock.totalStock}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Đạt chuẩn</span>
                  <strong style={{ fontSize: '1.125rem', color: '#16a34a' }}>{feedback.updatedStock.passedStock}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Hỏng / Lỗi</span>
                  <strong style={{ fontSize: '1.125rem', color: '#dc2626' }}>{feedback.updatedStock.failedStock}</strong>
                </div>
              </div>
            )}

            <div>
              <button className="btn btn-primary" onClick={handleReset}>
                + Tiếp tục kiểm tra sản phẩm khác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GIAO DIỆN KHI CHƯA PHÂN TÍCH HOẶC ĐANG CHỌN ẢNH */}
      {!analysisResult && !feedback && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Upload size={18} /> Biểu Mẫu Tải Ảnh Kiểm Định Sản Phẩm (QC Upload)
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Chọn sản phẩm */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Chọn Sản phẩm kiểm tra:</label>
                <select 
                  className="form-control"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {products.map(p => (
                    <option key={p.productId} value={p.productId}>
                      {p.productName} ({p.category}) - Tồn: {p.totalStock}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chọn nhân viên QC */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nhân viên QC phụ trách:</label>
                <select 
                  className="form-control"
                  value={selectedInspectorId}
                  onChange={(e) => setSelectedInspectorId(e.target.value)}
                >
                  {inspectors.map(i => (
                    <option key={i.inspectorId} value={i.inspectorId}>
                      {i.inspectorName} ({i.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bộ kịch bản ảnh test mẫu nhanh */}
            <div style={{ marginBottom: '1.25rem', backgroundColor: '#f8fafc', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Info size={15} color="#2563eb" />
                  Kịch bản kiểm thử mẫu có sẵn (R6 Test Images):
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bấm chọn để nạp nhanh</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {sampleScenarios.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSample(s)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                  >
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>{s.title}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', lineHeight: 1.2 }}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Khu vực chọn ảnh / kéo thả */}
            {!previewUrl ? (
              <div 
                className="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input 
                  id="file-input"
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Upload size={36} className="dropzone-icon" />
                <div className="dropzone-text">Kéo thả hình ảnh sản phẩm vào đây, hoặc click để chọn file</div>
                <div className="dropzone-hint">Hỗ trợ các định dạng .JPG, .PNG, .WEBP (Tối đa 10MB)</div>
              </div>
            ) : (
              <div>
                <div className="preview-image-container" style={{ marginBottom: '1rem', minHeight: '260px' }}>
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                    disabled={isAnalyzing}
                  >
                    <RotateCcw size={16} /> Chọn ảnh khác
                  </button>

                  <button 
                    className="btn btn-primary" 
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing}
                  >
                    <Sparkles size={16} />
                    {isAnalyzing ? 'Gemini AI đang phân tích...' : 'Bắt đầu Phân tích với Gemini Vision'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GIAO DIỆN BƯỚC 4: REVIEW & CONFIRMATION KHI ĐÃ CÓ KẾT QUẢ AI */}
      {analysisResult && !feedback && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={18} /> Kết Quả Phân Tích & Xác Nhận Kiểm Định (Review & Confirmation)
            </h3>
            <span className="badge badge-none">Bước 4/5 trong quy trình</span>
          </div>
          <div className="card-body">
            {/* Cảnh báo nếu ảnh mờ/lóa sáng */}
            {!analysisResult.isImageClear && (
              <div className="alert alert-warning">
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Cảnh báo chất lượng ảnh:</strong> AI đánh giá hình ảnh bị mờ hoặc không đủ độ sáng. 
                  Bạn nên chụp lại ảnh rõ nét để có kết quả chính xác nhất.
                </div>
              </div>
            )}

            <div className="preview-layout">
              {/* Cột trái: Ảnh sản phẩm */}
              <div>
                <div className="preview-image-container">
                  <img 
                    src={analysisResult.imageUrl || previewUrl} 
                    alt="Analyzed Product" 
                    className="preview-image" 
                  />
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: '#64748b', textAlign: 'center' }}>
                  Sản phẩm: <strong>{analysisResult.productName}</strong> | Mã kiểm tra: {selectedProductId}
                </div>
              </div>

              {/* Cột phải: Form kiểm tra và điều chỉnh thông tin */}
              <div>
                {/* Trạng thái đề xuất */}
                <div style={{ 
                  padding: '1rem', 
                  borderRadius: '6px', 
                  backgroundColor: confirmStatus === 'Passed' ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${confirmStatus === 'Passed' ? '#a7f3d0' : '#fecaca'}`,
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: '#64748b' }}>
                      Đề xuất của AI:
                    </span>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 700, 
                      color: confirmStatus === 'Passed' ? '#047857' : '#b91c1c',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {confirmStatus === 'Passed' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                      {confirmStatus === 'Passed' ? 'ĐẠT TIÊU CHUẨN (PASS)' : 'KHÔNG ĐẠT (FAILED)'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Độ tin cậy:</span>
                    <strong style={{ fontSize: '1.125rem' }}>
                      {(analysisResult.confidenceScore * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>

                {/* Cho phép QC điều chỉnh trạng thái */}
                <div className="form-group">
                  <label className="form-label">Quyết định trạng thái (QC Override):</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button 
                      type="button"
                      className={`btn ${confirmStatus === 'Passed' ? 'btn-success' : 'btn-outline'}`}
                      onClick={() => {
                        setConfirmStatus('Passed');
                        setConfirmCategoryId(1); // Mặc định không lỗi
                      }}
                    >
                      <CheckCircle2 size={16} /> ĐẠT (Passed)
                    </button>
                    <button 
                      type="button"
                      className={`btn ${confirmStatus === 'Failed' ? 'btn-primary' : 'btn-outline'}`}
                      style={confirmStatus === 'Failed' ? { backgroundColor: '#dc2626', borderColor: '#dc2626' } : {}}
                      onClick={() => setConfirmStatus('Failed')}
                    >
                      <XCircle size={16} /> LỖI (Failed)
                    </button>
                  </div>
                </div>

                {/* Chọn danh mục lỗi */}
                <div className="form-group">
                  <label className="form-label">Phân loại khuyết tật:</label>
                  <select 
                    className="form-control"
                    value={confirmCategoryId}
                    onChange={(e) => setConfirmCategoryId(e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c.defectCategoryId} value={c.defectCategoryId}>
                        {c.categoryName} ({c.severityLevel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mô tả chi tiết khuyết tật (có thể chỉnh sửa) */}
                <div className="form-group">
                  <label className="form-label">Mô tả chi tiết khuyết tật (Tiếng Việt):</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={confirmDescription}
                    onChange={(e) => setConfirmDescription(e.target.value)}
                    placeholder="Mô tả chi tiết tình trạng sản phẩm..."
                  />
                </div>

                {/* Các nút hành động */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={handleReset}
                    disabled={isConfirming}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    className="btn btn-success" 
                    style={{ flex: 2 }}
                    onClick={handleConfirmReport}
                    disabled={isConfirming}
                  >
                    <Check size={16} />
                    {isConfirming ? 'Đang lưu giao dịch & cập nhật kho...' : 'Xác nhận & Cập nhật kho'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
