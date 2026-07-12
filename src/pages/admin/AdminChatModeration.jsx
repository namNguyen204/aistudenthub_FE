import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Search, AlertCircle } from 'lucide-react';
import adminService from '../../services/admin.service';
import Button from '../../components/Button/Button';
import ConfirmDeleteModal from '../../components/Modal/ConfirmDeleteModal';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminChatModeration = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteChatId, setDeleteChatId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllChatSessions();
      setSessions(data || []);
    } catch (err) {
      setError('Lỗi khi tải danh sách chat sessions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const confirmDelete = async () => {
    if (!deleteChatId) return;
    setIsProcessing(true);
    try {
      await adminService.deleteChatSession(deleteChatId);
      setDeleteChatId(null);
      fetchSessions();
    } catch (err) {
      alert('Lỗi xóa phiên chat: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="premium-page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Kiểm duyệt Chat AI</h1>
        <p className="page-description">Quản lý và theo dõi các phiên trò chuyện của người dùng trên toàn hệ thống.</p>
      </div>

      <div className="dashboard-section glass-card" style={{ padding: '1.5rem' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-600)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Đang tải danh sách phiên chat...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-600)' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>ID Phiên chat</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Người dùng</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Liên kết tài liệu</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Thời gian tạo</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                      Không có phiên chat nào hoặc API chưa được hỗ trợ.
                    </td>
                  </tr>
                ) : (
                  sessions.map(session => (
                    <tr key={session.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MessageSquare size={20} color="var(--primary-500)" />
                        <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.id}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>{session.ownerName || 'User'}</td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>
                        {session.documentId ? (
                           <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                            Có tài liệu đính kèm
                           </span>
                        ) : (
                           <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 600, backgroundColor: 'var(--neutral-100)', color: 'var(--neutral-700)' }}>
                            Chat tự do
                           </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)' }}>
                        {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: vi }) : '-'}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            title="Xóa phiên chat"
                            onClick={() => setDeleteChatId(session.id)}
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
        isOpen={!!deleteChatId}
        onClose={() => setDeleteChatId(null)}
        onConfirm={confirmDelete}
        isDeleting={isProcessing}
        title="Xóa Phiên Trò chuyện"
        message="Cảnh báo: Bạn có chắc chắn muốn xóa phiên trò chuyện này? Toàn bộ lịch sử nhắn tin của người dùng sẽ bị xóa vĩnh viễn khỏi hệ thống."
      />
    </div>
  );
};

export default AdminChatModeration;
