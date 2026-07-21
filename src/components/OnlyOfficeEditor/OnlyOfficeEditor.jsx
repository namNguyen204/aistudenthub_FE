import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import './OnlyOfficeEditor.css';

const OnlyOfficeEditor = ({ configData, onClose }) => {
  const editorContainerRef = useRef(null);
  const docEditorRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!configData || !configData.docserviceUrl) {
      setLoadError('Dữ liệu cấu hình OnlyOffice không hợp lệ.');
      return;
    }

    // Tải script API của OnlyOffice
    const scriptUrl = `${configData.docserviceUrl}/web-apps/apps/api/documents/api.js`;
    
    // Kiểm tra xem script đã được tải chưa
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    
    if (existingScript) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setLoadError('Không thể tải bộ soạn thảo OnlyOffice. Vui lòng kiểm tra lại kết nối mạng hoặc server.');
    
    document.body.appendChild(script);

    return () => {
      // Cleanup script khi unmount (Tùy chọn)
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [configData]);

  useEffect(() => {
    // Khởi tạo Editor khi script đã tải xong
    if (isScriptLoaded && editorContainerRef.current && window.DocsAPI && !docEditorRef.current) {
      try {
        const config = {
          document: configData.document,
          documentType: configData.documentType,
          editorConfig: {
            ...configData.editorConfig,
            customization: {
              ...configData.editorConfig.customization,
              forcesave: true, // Cho phép lưu ép buộc
              compact: false,
              toolbarNoTabs: false
            }
          },
          token: configData.token
        };

        // Khởi tạo OnlyOffice
        docEditorRef.current = new window.DocsAPI.DocEditor("onlyoffice-placeholder", config);
      } catch (err) {
        console.error("Lỗi khi khởi tạo OnlyOffice:", err);
        setLoadError('Đã xảy ra lỗi khi khởi tạo giao diện soạn thảo.');
      }
    }

    return () => {
      if (docEditorRef.current) {
        docEditorRef.current.destroyEditor();
        docEditorRef.current = null;
      }
    };
  }, [isScriptLoaded, configData]);

  return (
    <div className="onlyoffice-overlay">
      <div className="onlyoffice-header">
        <div className="document-title">
          {configData?.document?.title || 'Đang tải tài liệu...'}
        </div>
        <button className="onlyoffice-close-btn" onClick={onClose} title="Đóng cửa sổ">
          <X size={24} />
          <span>Đóng</span>
        </button>
      </div>

      <div className="onlyoffice-body">
        {loadError ? (
          <div className="onlyoffice-error">
            <h3>Lỗi Tải Trình Soạn Thảo</h3>
            <p>{loadError}</p>
            <button className="btn btn-primary mt-3" onClick={onClose}>Quay lại</button>
          </div>
        ) : !isScriptLoaded ? (
          <div className="onlyoffice-loading">
            <Loader2 size={48} className="animate-spin text-primary-500 mb-3" />
            <p>Đang tải trình soạn thảo văn bản trực tiếp...</p>
            <p className="text-neutral-400" style={{ fontSize: '0.85rem' }}>Vui lòng đợi trong giây lát</p>
          </div>
        ) : null}
        
        {/* Placeholder container cho OnlyOffice */}
        <div 
          id="onlyoffice-placeholder" 
          ref={editorContainerRef} 
          style={{ width: '100%', height: '100%', display: isScriptLoaded && !loadError ? 'block' : 'none' }}
        ></div>
      </div>
    </div>
  );
};

export default OnlyOfficeEditor;
