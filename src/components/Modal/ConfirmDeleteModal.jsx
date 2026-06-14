import React from 'react';
import Modal from './Modal';
import Button from '../Button/Button';

const ConfirmDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to delete this item? This action cannot be undone." 
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={onConfirm} 
            isLoading={isDeleting}
            style={{ backgroundColor: 'var(--error-600)', borderColor: 'var(--error-600)', color: 'white' }}
          >
            Delete
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
