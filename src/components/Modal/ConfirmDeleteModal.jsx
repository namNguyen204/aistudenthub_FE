import React from 'react';
import Modal from './Modal';
import Button from '../Button/Button';

const ConfirmDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting, 
  title = "Xác nhận Xóa", 
  message = "Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác." 
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button 
            onClick={onConfirm} 
            isLoading={isDeleting}
            style={{ backgroundColor: 'var(--error-600)', borderColor: 'var(--error-600)', color: 'white' }}
          >
            Xóa
          </Button>
        </>
      }
    >
      <div style={{ color: 'var(--neutral-600)', fontSize: '14px', lineHeight: '1.5' }}>
        {message}
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
