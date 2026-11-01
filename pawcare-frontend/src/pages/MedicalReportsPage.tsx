import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { petsApi } from '../api/pets';
import { reportsApi } from '../api/reports';
import { usePet } from '../context/PetContext';
import type { Pet, MedicalReport } from '../types';
import { PetHeader } from '../components/PetHeader';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  FileText, Plus, Camera, Upload, Eye, Download,
  Trash2, X, RefreshCw, Calendar, HardDrive
} from 'lucide-react';

export const MedicalReportsPage: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const { setSelectedPetId } = usePet();

  const [pet, setPet] = useState<Pet | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Report Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'camera' | 'file'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Preview Modal state
  const [previewReport, setPreviewReport] = useState<MedicalReport | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    if (!petId) return;
    try {
      setLoading(true);
      const [petData, reportsData] = await Promise.all([
        petsApi.get(petId),
        reportsApi.list(petId),
      ]);
      setPet(petData);
      setReports(reportsData);
    } catch {
      setError('Unable to load medical documents for this pet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (petId) {
      setSelectedPetId(petId);
    }
  }, [petId, setSelectedPetId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    };
  }, [previewUrl, previewBlobUrl]);

  const openAddModal = (mode: 'camera' | 'file') => {
    setUploadMode(mode);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTitle('');
    setDocumentDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setModalError(null);
    setIsAddModalOpen(true);

    setTimeout(() => {
      if (mode === 'camera' && cameraInputRef.current) {
        cameraInputRef.current.click();
      } else if (mode === 'file' && fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 100);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setModalError('Invalid format. Supported: JPEG, PNG, WEBP, and PDF.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setModalError('File size exceeds the 10 MB limit.');
        return;
      }

      setModalError(null);
      setSelectedFile(file);
      if (!title) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(baseName.replace(/[_-]/g, ' '));
      }

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId || !selectedFile || !title.trim() || !documentDate) {
      setModalError('Title, document date, and document file are required.');
      return;
    }

    setUploading(true);
    setModalError(null);
    try {
      await reportsApi.upload(petId, {
        file: selectedFile,
        title: title.trim(),
        document_date: documentDate,
        description: description.trim(),
      });
      setIsAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      const detail = err.response?.data?.file?.[0] || err.response?.data?.detail || 'Failed to upload document.';
      setModalError(detail);
    } finally {
      setUploading(false);
    }
  };

  // Authenticated file preview
  const handleOpenPreview = async (report: MedicalReport) => {
    if (!petId) return;
    setPreviewReport(report);
    setPreviewLoading(true);
    setPreviewError(null);

    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }

    try {
      const { blob } = await reportsApi.getFileBlob(petId, report.id, false);
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch {
      setPreviewError('Unable to load document preview. Verification failed.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Authenticated file download
  const handleDownload = async (report: MedicalReport) => {
    if (!petId) return;
    try {
      const { blob, filename } = await reportsApi.getFileBlob(petId, report.id, true);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || report.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download document. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!petId || !deletingId) return;
    setDeleteLoading(true);
    try {
      await reportsApi.delete(petId, deletingId);
      setDeletingId(null);
      await loadData();
    } catch {
      setError('Failed to delete report.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>Loading medical reports...</div>;
  }

  if (error || !pet) {
    return (
      <div className="paw-alert paw-alert-overdue">
        <span>{error || 'Pet not found.'}</span>
        <Link to="/" className="btn-pill btn-pill-secondary btn-pill-sm" style={{ marginLeft: 'auto' }}>Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <PetHeader pet={pet} />

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Medical Document Vault
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Encrypted private vault for {pet.name}'s vet invoices, prescriptions, and lab tests.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={() => openAddModal('camera')} className="btn-pill btn-pill-secondary">
            <Camera size={16} />
            <span>Camera Scan</span>
          </button>
          <button onClick={() => openAddModal('file')} className="btn-pill btn-pill-primary">
            <Upload size={16} />
            <span>Upload File / PDF</span>
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="paw-empty-state">
          <div className="paw-empty-emoji">📁</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>Document Vault is Empty</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Store digital copies of veterinary prescriptions, lab tests, surgical notes, and invoices for {pet.name}.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => openAddModal('camera')} className="btn-pill btn-pill-secondary btn-pill-sm">
              <Camera size={14} />
              <span>Photograph Document</span>
            </button>
            <button onClick={() => openAddModal('file')} className="btn-pill btn-pill-primary btn-pill-sm">
              <Plus size={14} />
              <span>Upload PDF or Image</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-cards">
          {reports.map((report) => (
            <div key={report.id} className="paw-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: report.mime_type === 'application/pdf' ? 'var(--status-overdue-bg)' : 'var(--mint-light)',
                      color: report.mime_type === 'application/pdf' ? 'var(--status-overdue-text)' : 'var(--mint-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, wordBreak: 'break-word' }}>{report.title}</h4>
                    <span className="status-pill" style={{ background: 'var(--bg-chip)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      {report.mime_type === 'application/pdf' ? 'PDF Document' : 'Image Scan'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setDeletingId(report.id)}
                  className="btn-circle"
                  style={{ width: '34px', height: '34px', color: 'var(--status-overdue-text)' }}
                  title="Delete report"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {report.description && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', flex: 1, lineHeight: 1.5 }}>
                  {report.description}
                </p>
              )}

              {/* Metadata */}
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-soft)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} /> {new Date(report.document_date).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <HardDrive size={13} /> {report.file_size_display}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => handleOpenPreview(report)}
                  className="btn-pill btn-pill-secondary btn-pill-sm"
                  style={{ flex: 1 }}
                >
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleDownload(report)}
                  className="btn-pill btn-pill-primary btn-pill-sm"
                  style={{ flex: 1 }}
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Capture Document Modal */}
      {isAddModalOpen && (
        <div className="paw-modal-backdrop">
          <div className="paw-modal-card">
            <div className="paw-modal-header">
              <h3 className="paw-modal-title">
                {uploadMode === 'camera' ? 'Photograph Medical Report' : 'Upload Medical Document'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="btn-circle" style={{ width: '36px', height: '36px' }}>
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="paw-alert paw-alert-overdue" style={{ marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            {/* File Review / Capture Box */}
            <div
              style={{
                border: '2px dashed var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--bg-chip)',
                marginBottom: '1.25rem',
              }}
            >
              {previewUrl ? (
                <div>
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => (uploadMode === 'camera' ? cameraInputRef.current?.click() : fileInputRef.current?.click())}
                      className="btn-pill btn-pill-secondary btn-pill-sm"
                    >
                      <RefreshCw size={14} />
                      <span>Retake / Choose Another</span>
                    </button>
                  </div>
                </div>
              ) : selectedFile ? (
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--status-overdue-bg)', color: 'var(--status-overdue-text)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <FileText size={24} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedFile.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-pill btn-pill-secondary btn-pill-sm"
                  >
                    <RefreshCw size={14} />
                    <span>Choose Different File</span>
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    No file selected yet (JPEG, PNG, WEBP, PDF up to 10 MB)
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                    <button type="button" onClick={() => cameraInputRef.current?.click()} className="btn-pill btn-pill-secondary btn-pill-sm">
                      <Camera size={14} />
                      <span>Camera</span>
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-pill btn-pill-secondary btn-pill-sm">
                      <Upload size={14} />
                      <span>Browse Files</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveReport}>
              <div className="paw-input-group">
                <label className="paw-label" htmlFor="report-title">Document Title *</label>
                <input
                  id="report-title"
                  type="text"
                  className="paw-input"
                  placeholder="e.g. Annual Bloodwork, Rabies Certificate"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="paw-input-group">
                <label className="paw-label" htmlFor="report-date">Document Date *</label>
                <input
                  id="report-date"
                  type="date"
                  className="paw-input"
                  max={new Date().toISOString().split('T')[0]}
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  required
                />
                <p className="paw-help">The date printed on the medical record.</p>
              </div>

              <div className="paw-input-group">
                <label className="paw-label" htmlFor="report-desc">Diagnosis / Prescription Details (optional)</label>
                <textarea
                  id="report-desc"
                  className="paw-textarea"
                  rows={2}
                  placeholder="e.g. Normal blood counts, antibiotic dosage 50mg"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-pill btn-pill-secondary btn-pill-sm" disabled={uploading}>
                  Cancel
                </button>
                <button type="submit" className="btn-pill btn-pill-primary btn-pill-sm" disabled={!selectedFile || uploading}>
                  {uploading ? 'Saving to Vault...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Authenticated Preview Modal */}
      {previewReport && (
        <div className="paw-modal-backdrop">
          <div className="paw-modal-card" style={{ maxWidth: '840px', width: '95vw', height: '88vh', display: 'flex', flexDirection: 'column', padding: '1.75rem' }}>
            <div className="paw-modal-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 className="paw-modal-title" style={{ fontSize: '1.2rem' }}>{previewReport.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Date: {new Date(previewReport.document_date).toLocaleDateString()} • {previewReport.original_filename}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <button
                  onClick={() => handleDownload(previewReport)}
                  className="btn-pill btn-pill-primary btn-pill-sm"
                  title="Download file"
                >
                  <Download size={15} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    setPreviewReport(null);
                    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
                    setPreviewBlobUrl(null);
                  }}
                  className="btn-circle"
                  style={{ width: '36px', height: '36px' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-chip)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
              }}
            >
              {previewLoading ? (
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Retrieving private document...</p>
              ) : previewError ? (
                <div className="paw-alert paw-alert-overdue">
                  <span>{previewError}</span>
                </div>
              ) : previewBlobUrl ? (
                previewReport.mime_type === 'application/pdf' ? (
                  <iframe
                    src={previewBlobUrl}
                    title={previewReport.title}
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius-md)' }}
                  />
                ) : (
                  <img
                    src={previewBlobUrl}
                    alt={previewReport.title}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
                  />
                )
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Medical Document?"
        message="Are you sure you want to permanently delete this document from the vault? The file will be erased from secure private storage."
        confirmLabel="Yes, Delete Document"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
