import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    danger = false,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content">
                <h3 className="confirm-modal-title">{title}</h3>
                <p className="confirm-modal-message">{message}</p>
                <div className="confirm-modal-actions">
                    <button onClick={onCancel} className="confirm-btn-secondary">
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={danger ? 'confirm-btn-danger' : 'confirm-btn-primary'}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
