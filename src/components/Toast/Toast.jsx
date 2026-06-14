import React, { useEffect } from 'react';

const Toast = ({ message, onClose, duration = 3000, type = 'success' }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'var(--success-500)',
    error: 'var(--error-500)',
    info: 'var(--primary-500)'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: bgColors[type] || bgColors.success,
      color: 'white',
      padding: '12px 24px',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      animation: 'slideUpFade 0.3s ease-out forwards'
    }}>
      {type === 'success' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )}
      {type === 'error' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      )}
      {message}
    </div>
  );
};

export default Toast;
