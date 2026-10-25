import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  RotateCw, 
  CheckCircle, 
  ShieldCheck,
  AlertCircle 
} from 'lucide-react';
import { api } from './services/api';
import Dashboard from './components/Dashboard';
import InspectionUpload from './components/InspectionUpload';
import InspectionHistory from './components/InspectionHistory';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Hàm tải toàn bộ dữ liệu từ Backend
  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [prods, insps, cats, reps] = await Promise.all([
        api.getProducts(),
        api.getInspectors(),
        api.getDefectCategories(),
        api.getReports()
      ]);
      setProducts(prods);
      setInspectors(insps);
      setCategories(cats);
      setReports(reps);
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối đến Backend Web API. Vui lòng kiểm tra xem Backend (http://localhost:5223) đã chạy chưa.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="app-container">
      {/* Header tối giản & thanh điều hướng */}
      <header className="app-header">
        <div className="header-inner">
          {/* Logo & Tên dự án */}
          <div className="brand">
            <div className="brand-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="brand-title">AI QC Assistant</div>
              <div className="brand-subtitle">Quality Control & Defect Inspection</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={16} /> QC Dashboard
            </button>
            <button 
              className={`nav-tab ${activeTab === 'inspect' ? 'active' : ''}`}
              onClick={() => setActiveTab('inspect')}
            >
              <UploadCloud size={16} /> Kiểm Định Mới
            </button>
            <button 
              className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={16} /> Lịch Sử Báo Cáo
            </button>
          </nav>

          {/* Nút làm mới dữ liệu */}
          <div className="header-actions">
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}
              onClick={loadData}
              disabled={isLoading}
            >
              <RotateCw size={14} className={isLoading ? 'spin' : ''} />
              {isLoading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>
        </div>
      </header>

      {/* Nội dung chính */}
      <main className="main-content">
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Lỗi kết nối:</strong> {error}
            </div>
          </div>
        )}

        {isLoading && products.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: '5rem' }}>
            <RotateCw size={36} className="spin empty-icon" />
            <p>Đang tải dữ liệu từ hệ thống...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                products={products}
                reports={reports}
                onNavigateToInspect={() => setActiveTab('inspect')}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'inspect' && (
              <InspectionUpload 
                products={products}
                inspectors={inspectors}
                categories={categories}
                onInspectionSuccess={() => {
                  loadData(); // Tự động cập nhật lại số lượng kho và lịch sử
                }}
                onCancel={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'history' && (
              <InspectionHistory 
                reports={reports}
                products={products}
                onRefresh={loadData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
