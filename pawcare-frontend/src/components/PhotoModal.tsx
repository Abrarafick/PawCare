import React, { useState } from 'react';
import { petsApi } from '../api/pets';
import { X, Upload, Trash2, Camera } from 'lucide-react';

interface PhotoModalProps {
  isOpen: boolean;
  petId: string;
  hasExistingPhoto: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  petId,
  hasExistingPhoto,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
        setError('Only JPEG, PNG, or WEBP images are supported.');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('Image must not exceed 10 MB.');
        return;
      }
      setError(null);
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await petsApi.uploadPhoto(petId, file);
      onSuccess();
      onClose();
    } catch {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await petsApi.deletePhoto(petId);
      onSuccess();
      onClose();
    } catch {
      setError('Failed to remove photo.');
    } finally {
      setLoading(false);
    }
  };

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
                background: 'var(--mint-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mint-dark)',
              }}
            >
              <Camera size={18} />
            </div>
            <h3 className="paw-modal-title">Pet Photo</h3>
          </div>

          <button onClick={onClose} className="btn-circle" style={{ width: '36px', height: '36px' }}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="paw-alert paw-alert-overdue" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          {preview ? (
            <div
              style={{
                width: '130px',
                height: '130px',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid var(--mint)',
                boxShadow: '0 8px 24px rgba(154, 217, 113, 0.3)',
              }}
            >
              <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div
              style={{
                padding: '2rem 1rem',
                border: '2px dashed var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-chip)',
                marginBottom: '1rem',
              }}
            >
              <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Select a cute photo of your pet
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
                JPEG, PNG, WEBP up to 10 MB
              </p>
            </div>
          )}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            id="photo-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="photo-input" className="btn-pill btn-pill-secondary btn-pill-sm" style={{ cursor: 'pointer' }}>
            Choose from Device
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {hasExistingPhoto ? (
            <button
              type="button"
              onClick={handleDelete}
              className="btn-pill btn-pill-danger btn-pill-sm"
              disabled={loading}
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-pill btn-pill-secondary btn-pill-sm" disabled={loading}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="btn-pill btn-pill-primary btn-pill-sm"
              disabled={!file || loading}
            >
              {loading ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
