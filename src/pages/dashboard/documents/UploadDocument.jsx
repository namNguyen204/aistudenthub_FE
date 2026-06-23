import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import documentService from '../../../services/document.service';
import folderService from '../../../services/folder.service';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { validateForm, ruleRequired } from '../../../utils/validation';
import './UploadDocument.css';

const UploadDocument = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [folders, setFolders] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    major: '',
    documentType: 'LECTURE',
    visibility: 'PRIVATE',
    folderId: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const data = await folderService.getFolders();
        setFolders(data);
      } catch (err) {
        console.error('Failed to load folders', err);
      }
    };
    loadFolders();
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (!formData.title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, title: nameWithoutExt }));
    }
    setFormErrors(prev => ({ ...prev, file: null }));
    setApiError('');
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    let errors = validateForm(formData, { 
      title: [ruleRequired('Title is required')] 
    });

    if (!file) {
      errors.file = 'Please select a file to upload';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        ...formData,
        folderId: formData.folderId || null
      };

      await documentService.upload(file, requestData);
      navigate('/dashboard/my', { state: { toastMessage: 'Document uploaded successfully!' } });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Tải lên tài liệu thất bại. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="premium-page-wrapper upload-container">
      <div className="page-header">
        <h1 className="page-title">Tải lên Tài liệu</h1>
        <p className="page-description">Tải lên an toàn tài liệu học tập, bài giảng và tài nguyên vào không gian làm việc của bạn.</p>
      </div>

      <div className="upload-card">
        {!file ? (
          <>
            <div 
              className={`dropzone ${isDragging ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-icon">
                <UploadCloud size={32} />
              </div>
              <p className="dropzone-text">Nhấp hoặc kéo tệp vào khu vực này để tải lên</p>
              <p className="dropzone-subtext">Hỗ trợ một tệp PDF, DOCX hoặc PPTX. Kích thước tối đa 50MB.</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
            </div>
            {formErrors.file && (
              <p style={{ color: 'var(--error-500)', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>
                {formErrors.file}
              </p>
            )}
          </>
        ) : (
          <div className="file-preview">
            <div className="file-preview-info">
              <FileIcon size={32} className="file-preview-icon" />
              <div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button className="file-remove-btn" onClick={handleRemoveFile} title="Remove file">
              <X size={20} />
            </button>
          </div>
        )}

        {apiError && (
          <div style={{ backgroundColor: 'var(--error-50)', color: 'var(--error-600)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{apiError}</span>
          </div>
        )}

        <form className="upload-form" onSubmit={handleSubmit}>
          <Input 
            label="Tiêu đề Tài liệu *" 
            placeholder="VD: Chương 1: Giới thiệu về AI"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (formErrors.title) setFormErrors({ ...formErrors, title: null });
            }}
            onBlur={(e) => {
              if (!e.target.value.trim()) {
                setFormErrors(prev => ({ ...prev, title: 'Tiêu đề là bắt buộc' }));
              }
            }}
            error={formErrors.title}
          />

          <Input 
            label="Mô tả" 
            placeholder="Tổng quan ngắn gọn về tài liệu này..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="form-row">
            <Input 
              label="Môn học" 
              placeholder="VD: SWP391"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
            <Input 
              label="Chuyên ngành" 
              placeholder="VD: Kỹ thuật Phần mềm"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Lưu vào Thư mục</label>
              <select 
                className="form-select"
                value={formData.folderId}
                onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
              >
                <option value="">-- Không có Thư mục (Gốc) --</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Loại tài liệu</label>
              <select 
                className="form-select"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              >
                <option value="LECTURE">Bài giảng</option>
                <option value="ASSIGNMENT">Bài tập</option>
                <option value="EXAM_PREP">Đề cương Ôn thi</option>
                <option value="REFERENCE">Tài liệu Tham khảo</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Quyền riêng tư</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '14px', color: 'var(--neutral-700)' }}>
                <input 
                  type="radio" 
                  name="visibility" 
                  value="PRIVATE" 
                  checked={formData.visibility === 'PRIVATE'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  style={{ accentColor: 'var(--primary-600)' }}
                />
                Riêng tư (Chỉ mình tôi)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '14px', color: 'var(--neutral-700)' }}>
                <input 
                  type="radio" 
                  name="visibility" 
                  value="PUBLIC" 
                  checked={formData.visibility === 'PUBLIC'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  style={{ accentColor: 'var(--primary-600)' }}
                />
                Công khai (Chia sẻ với mọi người)
              </label>
            </div>
          </div>

          <div className="upload-actions">
            <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>Hủy</Button>
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || (!file && !formData.title)}>
              Tải lên Hub
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;
