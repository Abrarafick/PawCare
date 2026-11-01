import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="paw-modal-backdrop">
      <div className="paw-modal-card" style={{ maxWidth: '440px' }}>
        <div className="paw-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--status-overdue-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-overdue-text)',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h3 className="paw-modal-title">{title}</h3>
          </div>

          <button onClick={onCancel} className="btn-circle" style={{ width: '36px', height: '36px' }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.925rem', lineHeight: 1.6 }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn-pill btn-pill-secondary btn-pill-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn-pill ${confirmVariant === 'danger' ? 'btn-pill-danger' : 'btn-pill-primary'} btn-pill-sm`}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
