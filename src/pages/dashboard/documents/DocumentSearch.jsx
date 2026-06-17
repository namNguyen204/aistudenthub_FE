import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, FileText, Download, Eye, Filter, FileCode2, FileSpreadsheet, FileIcon } from 'lucide-react';
import documentService from '../../../services/document.service';
import folderService from '../../../services/folder.service';
import Button from '../../../components/Button/Button';
import Toast from '../../../components/Toast/Toast';
import './DocumentSearch.css';

const getFileIcon = (documentType, fileName = '') => {
  const name = fileName.toLowerCase();
  if (name.endsWith('.pdf')) return <FileText size={24} />;
  if (name.endsWith('.doc') || name.endsWith('.docx')) return <FileText size={24} />;
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return <FileSpreadsheet size={24} />;
  if (documentType === 'CODE') return <FileCode2 size={24} />;
  return <FileIcon size={24} />;
};

const getIconClass = (fileName = '') => {
  const name = fileName.toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'word';
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'ppt';
  return 'other';
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const DocumentSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  
  const [toastMessage, setToastMessage] = useState(location.state?.toastMessage || '');

  const handleCloseToast = () => {
    setToastMessage('');
    window.history.replaceState({}, document.title);
  };

  const [filters, setFilters] = useState({
    keyword: '',
    folderId: '',
    documentType: '',
    page: 0,
    size: 12
  });
  
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  const loadFolders = async () => {
    try {
      const data = await folderService.getFolders();
      setFolders(data || []);
    } catch (error) {
      console.error('Failed to load folders');
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: filters.keyword,
        folderId: filters.folderId,
        documentType: filters.documentType,
        page: filters.page,
        size: filters.size
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const data = await documentService.search(params);
      if (data) {
        setDocuments(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      }
    } catch (error) {
      console.error('Failed to search documents', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filters.page !== 0) {
      setFilters(prev => ({ ...prev, page: 0 }));
    } else {
      fetchDocuments();
    }
  };

  const handleDownload = async (docId, fileName, e) => {
    e.stopPropagation();
    try {
      const url = await documentService.getDownloadUrl(docId);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Failed to get download URL', err);
      alert('Failed to download document');
    }
  };

  const handlePreview = (docId, e) => {
    e.stopPropagation();
    navigate(`/dashboard/documents/${docId}`);
  };

  return (
    <div className="premium-page-wrapper document-search-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">My Documents</h1>
          <p className="page-description">Find exactly what you need across all your folders and the hub.</p>
        </div>
        <Button onClick={() => navigate('/dashboard/upload')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} /> Upload Document
        </Button>
      </div>

      <Toast message={toastMessage} onClose={handleCloseToast} />

      <div className="search-header-card">
        <form onSubmit={handleSearchSubmit} className="search-bar-wrapper" style={{ marginBottom: 0 }}>
          <div className="search-input-container">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by title, description, or keyword..." 
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            />
          </div>
          <select 
            className="filter-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={filters.folderId}
            onChange={(e) => setFilters(prev => ({ ...prev, folderId: e.target.value, page: 0 }))}
          >
            <option value="">All Folders</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <select 
            className="filter-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={filters.documentType}
            onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value, page: 0 }))}
          >
            <option value="">All Types</option>
            <option value="LECTURE">Lecture Note</option>
            <option value="ASSIGNMENT">Assignment</option>
            <option value="EXAM_PREP">Exam Prep</option>
            <option value="REFERENCE">Reference</option>
            <option value="OTHER">Other</option>
          </select>
          <Button type="submit" style={{ padding: '0 32px' }}>Search</Button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--neutral-400)' }}>
          Searching documents...
        </div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--glass-bg)', borderRadius: 'var(--radius-xl)' }}>
          <FileText size={48} color="var(--neutral-300)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--neutral-700)' }}>No documents found</h3>
          <p style={{ color: 'var(--neutral-500)' }}>Try adjusting your search criteria or upload a new document.</p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '14px', color: 'var(--neutral-500)', fontWeight: 500 }}>
            Found {totalElements} document(s)
          </div>
          
          <div className="documents-grid">
            {documents.map(doc => (
              <div key={doc.id} className="document-card" onClick={(e) => handlePreview(doc.id, e)}>
                <div className="document-card-header">
                  <div className={`doc-icon-wrapper ${getIconClass(doc.fileName)}`}>
                    {getFileIcon(doc.documentType, doc.fileName)}
                  </div>
                  <div className="doc-info">
                    <h3 className="doc-title" title={doc.title}>{doc.title}</h3>
                    <div className="doc-meta">
                      {doc.subject && <span className="doc-badge">{doc.subject}</span>}
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <p className="doc-description">
                  {doc.description || 'No description provided for this document.'}
                </p>

                <div className="doc-footer">
                  <span className="doc-size">{formatFileSize(doc.fileSize)}</span>
                  <div className="doc-actions">
                    <button className="doc-btn" onClick={(e) => handlePreview(doc.id, e)}>
                      <Eye size={16} /> View
                    </button>
                    <button className="doc-btn" onClick={(e) => handleDownload(doc.id, doc.fileName, e)}>
                      <Download size={16} /> Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <Button 
                variant="outline" 
                disabled={filters.page === 0}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="pagination-text">Page {filters.page + 1} of {totalPages}</span>
              <Button 
                variant="outline" 
                disabled={filters.page === totalPages - 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentSearch;
