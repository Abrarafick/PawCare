import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { petsApi } from '../api/pets';
import { invalidatePetPhotoCache } from './AuthenticatedPetPhoto';
import { prepareCameraImage } from '../utils/imageCompress';
import { X, Upload, Trash2, Camera } from 'lucide-react';

interface PhotoModalProps {
  isOpen: boolean;
  petId: string;
  petName?: string;
  hasExistingPhoto: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  petId,
  petName = 'your pet',
  hasExistingPhoto,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const raw = e.target.files[0];
      setError(null);
      setPreparing(true);
      try {
        const prepared = await prepareCameraImage(raw);
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(prepared.type)) {
          setError('Please pick a JPEG, PNG, or WEBP photo.');
          return;
        }
        if (prepared.size > 10 * 1024 * 1024) {
          setError('Photo is too large (over 10 MB).');
          return;
        }
        setFile(prepared);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(prepared));
      } finally {
        setPreparing(false);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await petsApi.uploadPhoto(petId, file);
      invalidatePetPhotoCache(petId);
      setFile(null);
      setPreview(null);
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
      invalidatePetPhotoCache(petId);
      setFile(null);
      setPreview(null);
      onSuccess();
      onClose();
    } catch {
      setError('Failed to remove photo.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="paw-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="paw-modal-card" style={{ maxWidth: '460px' }}>
        <div className="paw-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--theme-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--theme-primary-dark)',
              }}
            >
              <Camera size={20} />
            </div>
            <h3 className="paw-modal-title">Photo of {petName}</h3>
          </div>

          <button onClick={onClose} className="btn-circle" style={{ width: '38px', height: '38px' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="paw-alert paw-alert-overdue" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {preview ? (
            <div
              style={{
                width: '150px',
                height: '150px',
                margin: '0 auto 1.1rem',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid var(--theme-primary)',
                boxShadow: '0 8px 24px var(--theme-glow)',
              }}
            >
              <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div
              style={{
                padding: '1.65rem 1rem',
                border: '2px dashed var(--theme-hover-border)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--theme-primary-subtle)',
                marginBottom: '1.1rem',
              }}
            >
              <Camera size={40} style={{ color: 'var(--theme-primary-dark)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {preparing ? 'Preparing photo...' : `Snap or choose a photo of ${petName}`}
              </p>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Works directly with your phone camera!
              </p>
            </div>
          )}

          {/* Camera capture & device gallery inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="btn-pill btn-pill-primary"
              style={{ width: '100%' }}
              disabled={preparing || loading}
            >
              <Camera size={19} />
              <span>Take Photo with Camera</span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="btn-pill btn-pill-secondary btn-pill-sm"
              style={{ width: '100%' }}
              disabled={preparing || loading}
            >
              <Upload size={17} />
              <span>Choose Photo from Phone</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-pill btn-pill-secondary btn-pill-sm" disabled={loading}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="btn-pill btn-pill-primary btn-pill-sm"
              disabled={!file || loading || preparing}
            >
              {loading ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
