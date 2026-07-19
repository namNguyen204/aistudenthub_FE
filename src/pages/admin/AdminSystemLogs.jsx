import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, AlertTriangle, Info, Terminal, Trash2, Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import adminService from '../../services/admin.service';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import { format } from 'date-fns';

const AdminSystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // View details
  const [viewLog, setViewLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      if (level) params.level = level;
      
      const data = await adminService.getSystemLogs(params);
      setLogs(data?.data || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError('Lỗi khi tải nhật ký hệ thống: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, level]);

  const handleClearLogs = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ logs cũ hơn 7 ngày trước không? Hành động này không thể hoàn tác.')) return;
    try {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      await adminService.clearSystemLogs(date.toISOString());
      alert('Đã xóa logs thành công');
      setPage(1);
      fetchLogs();
    } catch (err) {
      alert('Lỗi khi xóa logs: ' + (err.response?.data?.message || err.message));
    }
  };

  const getLevelIcon = (lvl) => {
    switch(lvl) {
      case 'ERROR':
      case 'CRITICAL': return <ShieldAlert size={18} color="var(--error-500)" />;
      case 'WARN':
      case 'WARNING': return <AlertTriangle size={18} color="var(--warning-500)" />;
      default: return <Info size={18} color="var(--primary-500)" />;
    }
  };

  const getLevelBadge = (lvl) => {
    let bg = 'var(--primary-100)';
    let color = 'var(--primary-700)';
    if (lvl === 'ERROR' || lvl === 'CRITICAL') {
      bg = 'var(--error-100)';
      color = 'var(--error-700)';
    } else if (lvl === 'WARN' || lvl === 'WARNING') {
      bg = 'var(--warning-100)';
      color = 'var(--warning-700)';
    }
    return (
      <span style={{ backgroundColor: bg, color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
        {lvl}
      </span>
    );
  };

  return (
    <div className="premium-page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Nhật ký Hệ thống (System Logs)</h1>
          <p className="page-description">Theo dõi, kiểm tra lỗi và quản lý lịch sử hoạt động của toàn bộ hệ thống.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={level} 
            onChange={(e) => { setLevel(e.target.value); setPage(1); }}
            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', outline: 'none' }}
          >
            <option value="">Tất cả mức độ</option>
            <option value="INFO">Thông tin (INFO)</option>
            <option value="WARNING">Cảnh báo (WARN)</option>
            <option value="ERROR">Lỗi (ERROR)</option>
          </select>
          <Button variant="danger" onClick={handleClearLogs} icon={<Trash2 size={18} />}>
            Dọn rác (7 ngày cũ)
          </Button>
        </div>
      </div>

      <div className="dashboard-section glass-card" style={{ padding: '1.5rem' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-600)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>Đang tải nhật ký...</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--neutral-200)', color: 'var(--neutral-600)' }}>
                    <th style={{ padding: '1rem 0.5rem' }}>Thời gian</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Mức độ</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Module/Source</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Nội dung (Message)</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
                        Không có log nào.
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)', whiteSpace: 'nowrap' }}>
                          {log.createdAt ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss') : '-'}
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {getLevelIcon(log.level)}
                            {getLevelBadge(log.level)}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-700)', fontWeight: 500 }}>
                          {log.source || '-'}
                        </td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--neutral-600)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.message}
                        </td>
                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                          <button 
                            title="Xem chi tiết log"
                            onClick={() => setViewLog(log)}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}
                          >
                            <Terminal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--neutral-100)' }}>
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <ChevronLeft size={16} /> Trước
                </button>
                <span style={{ fontWeight: 500, color: 'var(--neutral-700)' }}>
                  Trang {page} / {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--neutral-200)', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  Sau <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={!!viewLog}
        onClose={() => setViewLog(null)}
        title="Chi tiết Log Hệ thống"
        footer={<Button onClick={() => setViewLog(null)}>Đóng</Button>}
      >
        {viewLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--neutral-600)' }}>ID:</span>
              <span style={{ color: 'var(--neutral-800)' }}>{viewLog.id}</span>
              
              <span style={{ fontWeight: 600, color: 'var(--neutral-600)' }}>Thời gian:</span>
              <span style={{ color: 'var(--neutral-800)' }}>{viewLog.createdAt ? format(new Date(viewLog.createdAt), 'dd/MM/yyyy HH:mm:ss') : '-'}</span>
              
              <span style={{ fontWeight: 600, color: 'var(--neutral-600)' }}>Mức độ:</span>
              <span>{getLevelBadge(viewLog.level)}</span>
              
              <span style={{ fontWeight: 600, color: 'var(--neutral-600)' }}>Module:</span>
              <span style={{ color: 'var(--neutral-800)' }}>{viewLog.source || '-'}</span>
              
              <span style={{ fontWeight: 600, color: 'var(--neutral-600)' }}>Hành động:</span>
              <span style={{ color: 'var(--neutral-800)' }}>{viewLog.action || '-'}</span>

              <span style={{ fontWeight: 600, color: 'var(--neutral-600)' }}>API Endpoint:</span>
              <span style={{ color: 'var(--neutral-800)' }}>{viewLog.requestMethod} {viewLog.requestPath} {viewLog.httpStatus ? `(${viewLog.httpStatus})` : ''}</span>

              <span style={{ fontWeight: 600, color: 'var(--neutral-600)' }}>IP Client:</span>
              <span style={{ color: 'var(--neutral-800)' }}>{viewLog.clientIp || '-'}</span>
              
              <span style={{ fontWeight: 600, color: 'var(--neutral-600)' }}>Người dùng:</span>
              <span style={{ color: 'var(--neutral-800)' }}>{viewLog.actorEmail || viewLog.actorUserId || 'Hệ thống'}</span>
            </div>
            
            <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: '1rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--neutral-600)', display: 'block', marginBottom: '0.5rem' }}>Nội dung thông báo (Message):</span>
              <div style={{ backgroundColor: 'var(--neutral-50)', padding: '1rem', borderRadius: '8px', color: 'var(--neutral-800)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {viewLog.message}
              </div>
            </div>

            {viewLog.stackTrace && (
              <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: '1rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--error-600)', display: 'block', marginBottom: '0.5rem' }}>Stack Trace (Lỗi kỹ thuật):</span>
                <div style={{ backgroundColor: '#2d3748', padding: '1rem', borderRadius: '8px', color: '#e2e8f0', fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.85rem', overflowX: 'auto' }}>
                  {viewLog.stackTrace}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSystemLogs;
