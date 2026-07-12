import React, { useState, useEffect } from 'react';
import { FileText, Search, Trash2, Eye, Download, AlertCircle } from 'lucide-react';
import adminService from '../../services/admin.service';
import Button from '../../components/Button/Button';
import ConfirmDeleteModal from '../../components/Modal/ConfirmDeleteModal';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminDocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllDocuments(keyword, page, 20);
      setDocuments(data?.content || []);
    } catch (err) {
      setError('Lỗi khi tải danh sách tài liệu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDocuments();
  };

  const confirmDelete = async () => {
    if (!deleteDocId) return;
    setIsProcessing(true);
    try {
      await adminService.deleteDocument(deleteDocId);
      setDeleteDocId(null);
      fetchDocuments();
    } catch (err) {
      alert('Lỗi xóa tài liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (fileType) => {
    return <FileText size={20} color="var(--primary-500)" />;
  };

  return (
    <div className="premium-page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Kiểm duyệt Tài liệu</h1>
        <p className="page-description">Quản lý và xóa các tài liệu vi phạm bản quyền hoặc nội dung không phù hợp.</p>
      </div>

      <div className="dashboard-section glass-card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="header-search" style={{ flex: 1, backgroundColor: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)' }}>
            <Search size={18} color="var(--neutral-400)" style={{ marginLeft: '1rem' }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu theo tên..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ padding: '0.75rem', width: '100%', border: 'none', backgroundColor: 'transparent', outline: 'none' }}
            />
          </div>
          <Button type="submit">Tìm kiếm</Button>
        </form>

        {error && (
          <div style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-600)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Đang tải danh sách tài liệu...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-600)' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Tên tài liệu</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Người đăng</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Môn học</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Thời gian</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Trạng thái xử lý</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Không tìm thấy tài liệu nào.</td>
                  </tr>
                ) : (
                  documents.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {getFileIcon(doc.fileType)}
                        <span style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.title}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>{doc.ownerName || 'User'}</td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>{doc.subject || '-'}</td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>
                        {doc.createdAt ? formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true, locale: vi }) : '-'}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        {doc.processingStatus === 'COMPLETED' ? (
                          <span style={{ color: 'var(--success-600)', fontWeight: 500, fontSize: '14px' }}>Hoàn tất</span>
                        ) : doc.processingStatus === 'FAILED' ? (
                          <span style={{ color: 'var(--error-600)', fontWeight: 500, fontSize: '14px' }}>Lỗi</span>
                        ) : (
                          <span style={{ color: 'var(--warning-600)', fontWeight: 500, fontSize: '14px' }}>Đang xử lý</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            title="Xóa tài liệu"
                            onClick={() => setDeleteDocId(doc.id)}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--error-50)', color: 'var(--error-600)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDeleteModal 
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={confirmDelete}
        isDeleting={isProcessing}
        title="Xóa Tài liệu Vi phạm"
        message="Cảnh báo: Bạn có chắc chắn muốn xóa vĩnh viễn tài liệu này khỏi hệ thống? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default AdminDocumentList;
