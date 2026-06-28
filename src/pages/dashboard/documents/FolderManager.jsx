import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, MoreVertical, Edit2, Trash2, Plus, FolderOpen } from 'lucide-react';
import folderService from '../../../services/folder.service';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import Modal from '../../../components/Modal/Modal';
import ConfirmDeleteModal from '../../../components/Modal/ConfirmDeleteModal';
import Toast from '../../../components/Toast/Toast';
import { validateForm, ruleRequired } from '../../../utils/validation';
import './FolderManager.css';

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

const FolderManager = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form states
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: PRESET_COLORS[0] });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Delete state
  const [folderToDelete, setFolderToDelete] = useState(null);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const data = await folderService.getFolders();
      setFolders(data || []);
    } catch (err) {
      console.error('Failed to load folders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleOpenModal = (folder = null) => {
    setFormErrors({});
    if (folder) {
      setEditingId(folder.id);
      setFormData({
        name: folder.name || '',
        description: folder.description || '',
        color: folder.color || PRESET_COLORS[0]
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', color: PRESET_COLORS[0] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const errors = validateForm(formData, { name: [ruleRequired('Folder name is required')] });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await folderService.updateFolder(editingId, formData);
        setToastMessage('Folder updated successfully!');
      } else {
        await folderService.createFolder(formData);
        setToastMessage('Folder created successfully!');
      }
      setIsModalOpen(false);
      fetchFolders();
    } catch (error) {
      console.error('Failed to save folder', error);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (folder) => {
    setFolderToDelete(folder);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!folderToDelete) return;
    setSubmitting(true);
    try {
      await folderService.deleteFolder(folderToDelete.id);
      setIsDeleteModalOpen(false);
      setFolderToDelete(null);
      fetchFolders();
    } catch (error) {
      console.error('Failed to delete folder', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="premium-page-wrapper folder-manager-container">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      
      <div className="folder-header">
        <div>
          <h1 className="page-title">Thư mục của tôi</h1>
          <p className="page-description">Sắp xếp tài liệu học tập vào các thư mục tùy chỉnh.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex-center" style={{ gap: '8px' }}>
          <Plus size={20} /> Tạo Thư mục
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--neutral-400)' }}>
          Đang tải thư mục...
        </div>
      ) : folders.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} color="var(--neutral-300)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--neutral-700)' }}>Chưa có thư mục nào</h3>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '1.5rem' }}>Tạo thư mục đầu tiên để bắt đầu sắp xếp.</p>
          <Button onClick={() => handleOpenModal()} variant="outline">Tạo Thư mục</Button>
        </div>
      ) : (
        <div className="folder-grid">
          {folders.map(folder => (
            <div 
              key={folder.id} 
              className="folder-card" 
              style={{ '--folder-color': folder.color || 'var(--primary-500)', cursor: 'pointer' }}
              onClick={() => navigate(`/dashboard/my?folderId=${folder.id}`)}
            >
              <div className="folder-card-header">
                <div className="folder-icon-wrapper">
                  <Folder size={24} fill="currentColor" />
                </div>
                <div className="folder-actions" onClick={e => e.stopPropagation()}>
                  <button className="folder-action-btn" onClick={() => handleOpenModal(folder)} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className="folder-action-btn delete" onClick={() => confirmDelete(folder)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="folder-content">
                <h3 className="folder-title" title={folder.name}>{folder.name}</h3>
                {folder.description && <p className="folder-desc">{folder.description}</p>}
              </div>

              <div className="folder-footer">
                <span>{folder.documentCount || 0} Tài liệu</span>
                <span>{folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Chỉnh sửa Thư mục' : 'Tạo Thư mục mới'}
        footer={
          <>
            <Button variant="text" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} isLoading={submitting}>
              {editingId ? 'Lưu Thay đổi' : 'Tạo Thư mục'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Tên Thư mục" 
            placeholder="VD: Tài liệu Machine Learning"
            value={formData.name}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({ ...formData, name: val });
              if (formErrors.name && val.trim()) {
                setFormErrors({ ...formErrors, name: null });
              }
            }}
            onBlur={(e) => {
              if (!e.target.value.trim()) {
                setFormErrors(prev => ({ ...prev, name: 'Tên thư mục là bắt buộc' }));
              }
            }}
            error={formErrors.name}
            required
          />
          <Input 
            label="Mô tả (Tùy chọn)" 
            placeholder="Thư mục này dùng để làm gì?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
              Màu Thư mục
            </label>
            <div className="color-picker">
              {PRESET_COLORS.map(color => (
                <div 
                  key={color}
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={submitting}
        title="Xóa Thư mục"
        message={<>Bạn có chắc chắn muốn xóa <strong>{folderToDelete?.name}</strong>? Hành động này không thể hoàn tác.</>}
      />
    </div>
  );
};

export default FolderManager;
