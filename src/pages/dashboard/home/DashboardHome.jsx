import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import documentService from '../../../services/document.service';
import folderService from '../../../services/folder.service';
import { 
  FileText, Folder, Image, FileOutput, 
  Upload, MessageSquare, Plus, Clock, FileWarning
} from 'lucide-react';
import './DashboardHome.css';

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalFolders: 0,
    pdfCount: 0,
    imageCount: 0,
    otherCount: 0
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch documents and folders
      const [docsResponse, foldersResponse] = await Promise.all([
        documentService.getMyDocuments(),
        folderService.getFolders()
      ]);

      const docs = docsResponse || [];
      const folders = foldersResponse || [];

      // Calculate stats
      let pdfs = 0;
      let images = 0;
      let others = 0;

      docs.forEach(doc => {
        if (doc.documentType === 'PDF') pdfs++;
        else if (doc.documentType === 'IMAGE') images++;
        else others++;
      });

      setStats({
        totalDocs: docs.length,
        totalFolders: folders.length,
        pdfCount: pdfs,
        imageCount: images,
        otherCount: others
      });

      // Get 5 most recent documents (assuming they are returned chronologically, or we sort them)
      const sortedDocs = [...docs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentDocs(sortedDocs.slice(0, 5));

    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDocIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText size={20} />;
      case 'IMAGE': return <Image size={20} />;
      default: return <FileOutput size={20} />;
    }
  };

  const getDocIconClass = (type) => {
    switch (type) {
      case 'PDF': return 'pdf';
      case 'IMAGE': return 'image';
      default: return 'word';
    }
  };

  return (
    <div className="dashboard-home-wrapper">
      <div className="welcome-section">
        <h1>Chào mừng trở lại, {user?.fullName || 'bạn'}! 👋</h1>
        <p>Dưới đây là tổng quan về các hoạt động học tập gần đây và tài liệu đã tải lên của bạn.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{isLoading ? '...' : stats.totalDocs}</div>
            <div className="stat-label">Tổng số Tài liệu</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <Folder size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{isLoading ? '...' : stats.totalFolders}</div>
            <div className="stat-label">Tổng số Thư mục</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <FileWarning size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{isLoading ? '...' : stats.pdfCount}</div>
            <div className="stat-label">Tài liệu PDF</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon danger">
            <Image size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{isLoading ? '...' : stats.imageCount}</div>
            <div className="stat-label">Hình ảnh</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <div className="dashboard-section-title">
              <Clock size={20} /> Tài liệu tải lên gần đây
            </div>
            <Link to="/dashboard/my" style={{ fontSize: '0.875rem', color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 500 }}>
              Xem tất cả
            </Link>
          </div>
          
          <div className="recent-docs-list">
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Đang tải dữ liệu...</div>
            ) : recentDocs.length > 0 ? (
              recentDocs.map(doc => (
                <Link to={`/dashboard/documents/${doc.id}`} className="recent-doc-item" key={doc.id}>
                  <div className="recent-doc-main">
                    <div className={`recent-doc-icon ${getDocIconClass(doc.documentType)}`}>
                      {getDocIcon(doc.documentType)}
                    </div>
                    <div className="recent-doc-details">
                      <h4>{doc.title}</h4>
                      <p>{doc.subject || 'Không có môn học'} • {doc.documentType}</p>
                    </div>
                  </div>
                  <div className="recent-doc-meta">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                <FileOutput size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>Bạn chưa tải lên tài liệu nào.</p>
                <Link to="/dashboard/upload" style={{ color: 'var(--primary-600)', marginTop: '0.5rem', display: 'inline-block', textDecoration: 'none' }}>Tải lên ngay</Link>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <div className="dashboard-section-title">
              Truy cập nhanh
            </div>
          </div>
          <div className="dashboard-section-body">
            <div className="quick-actions-list">
              <Link to="/dashboard/upload" className="quick-action-btn">
                <div className="quick-action-icon">
                  <Upload size={20} />
                </div>
                <div className="quick-action-text">
                  <h4>Tải lên tài liệu</h4>
                  <p>Thêm tài liệu học tập mới</p>
                </div>
              </Link>
              
              <Link to="/dashboard/chat" className="quick-action-btn">
                <div className="quick-action-icon" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}>
                  <MessageSquare size={20} />
                </div>
                <div className="quick-action-text">
                  <h4>Hỏi đáp với AI</h4>
                  <p>Giải đáp thắc mắc ngay lập tức</p>
                </div>
              </Link>
              
              <Link to="/dashboard/my" className="quick-action-btn">
                <div className="quick-action-icon" style={{ background: 'var(--warning-100)', color: 'var(--warning-600)' }}>
                  <Plus size={20} />
                </div>
                <div className="quick-action-text">
                  <h4>Quản lý thư mục</h4>
                  <p>Sắp xếp tài liệu của bạn</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
