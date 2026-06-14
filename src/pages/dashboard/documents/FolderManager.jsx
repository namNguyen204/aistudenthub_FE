import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const data = await folderService.getFolders();
      setFolders(data);
    } catch (error) {
      console.error('Failed to fetch folders', error);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="page-title">My Folders</h1>
          <p className="page-description">Organize your academic documents into custom folders.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex-center" style={{ gap: '8px' }}>
          <Plus size={20} /> Create Folder
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--neutral-400)' }}>
          Loading folders...
        </div>
      ) : folders.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} color="var(--neutral-300)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--neutral-700)' }}>No folders yet</h3>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '1.5rem' }}>Create your first folder to start organizing.</p>
          <Button onClick={() => handleOpenModal()} variant="outline">Create Folder</Button>
        </div>
      ) : (
        <div className="folder-grid">
          {folders.map(folder => (
            <div 
              key={folder.id} 
              className="folder-card" 
              style={{ '--folder-color': folder.color || 'var(--primary-500)' }}
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
                <span>{folder.documentCount || 0} Documents</span>
                <span>{new Date(folder.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Folder' : 'Create New Folder'}
        footer={
          <>
            <Button variant="text" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={submitting}>
              {editingId ? 'Save Changes' : 'Create Folder'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Folder Name" 
            placeholder="e.g. Machine Learning Docs"
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
                setFormErrors(prev => ({ ...prev, name: 'Folder name is required' }));
              }
            }}
            error={formErrors.name}
            required
          />
          <Input 
            label="Description (Optional)" 
            placeholder="What is this folder for?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
              Folder Color
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
        title="Delete Folder"
        message={<>Are you sure you want to delete <strong>{folderToDelete?.name}</strong>? This action cannot be undone.</>}
      />
    </div>
  );
};

export default FolderManager;
