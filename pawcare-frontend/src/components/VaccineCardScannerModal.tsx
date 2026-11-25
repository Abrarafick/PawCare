import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Tesseract from 'tesseract.js';
import { Camera, Upload, Sparkles, CheckCircle2, Calendar, FileText, X, RefreshCw, AlertCircle } from 'lucide-react';
import { reportsApi } from '../api/reports';
import { vaccinationsApi } from '../api/vaccinations';
import { useAccessibility } from '../context/AccessibilityContext';
import { prepareCameraImage } from '../utils/imageCompress';
import { parseVaccineCardText, type ParsedVaccineCard } from '../utils/vaccineOcrParser';

interface VaccineCardScannerModalProps {
  isOpen: boolean;
  petId: string;
  petName: string;
  petSpecies?: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Grandma-Proof "Snap Vaccine Paper -> Auto-Set Reminder + Save Vet Document" Modal.
 * Directly addresses senior feedback: take one photo of an old vaccination card/paper,
 * read the vaccine name & previous/next dates automatically via in-browser OCR,
 * save the paper permanently to Saved Vet Papers, and schedule the reminder automatically.
 */
export const VaccineCardScannerModal: React.FC<VaccineCardScannerModalProps> = ({
  isOpen,
  petId,
  petName,
  petSpecies = 'dog',
  onClose,
  onSuccess,
}) => {
  const { speak, grandmaMode } = useAccessibility();

  const [step, setStep] = useState<'pick' | 'scanning' | 'confirm' | 'done'>('pick');
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [parsed, setParsed] = useState<ParsedVaccineCard | null>(null);
  const [vaccineName, setVaccineName] = useState('');
  const [previousDate, setPreviousDate] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [vetClinic, setVetClinic] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStep('pick');
    setScanProgress(0);
    setSelectedFile(null);
    setPreviewUrl(null);
    setParsed(null);
    setVaccineName('');
    setPreviousDate('');
    setNextDueDate('');
    setVetClinic('');
    setError(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handlePhotoChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setError(null);
    setStep('scanning');
    setScanProgress(10);

    try {
      const prepared = await prepareCameraImage(rawFile);
      setSelectedFile(prepared);
      const url = URL.createObjectURL(prepared);
      setPreviewUrl(url);
      setScanProgress(25);

      const ocrResult = await Tesseract.recognize(prepared, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            setScanProgress(25 + Math.round(m.progress * 70));
          }
        },
      });

      const extracted = parseVaccineCardText(ocrResult.data.text || '', petSpecies);
      setParsed(extracted);
      setVaccineName(extracted.vaccineName);
      setPreviousDate(extracted.previousDate || '');
      setNextDueDate(extracted.nextDueDate);
      setVetClinic(extracted.vetClinic || '');
      setScanProgress(100);
      setStep('confirm');
    } catch {
      // Even if OCR fails, never block Dadi from saving the paper & setting the date manually!
      const todayIso = new Date().toISOString().split('T')[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const fallbackDue = nextYear.toISOString().split('T')[0];

      setVaccineName(petSpecies.toLowerCase() === 'cat' ? 'FVRCP Core Vaccine' : 'Rabies Booster');
      setPreviousDate(todayIso);
      setNextDueDate(fallbackDue);
      setParsed({
        vaccineName: 'Vaccination Record',
        previousDate: todayIso,
        nextDueDate: fallbackDue,
        vetClinic: '',
        detectedConfidence: 'fallback',
        explanation: 'Photo captured! Please confirm the vaccine name and deadline date below.',
        rawText: '',
      });
      setStep('confirm');
    }
  };

  const handleSaveEverything = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !vaccineName.trim() || !nextDueDate) {
      setError('Please enter a vaccine name and next due date.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const docDate = previousDate || new Date().toISOString().split('T')[0];
      const cleanName = vaccineName.trim();

      // 1. Save the snapped photo permanently to Saved Vet Papers (Medical Vault)
      await reportsApi.upload(petId, {
        file: selectedFile,
        title: `${cleanName} — Vet Paper`,
        document_date: docDate,
        description: previousDate
          ? `Scanned vaccine card. Previous shot: ${previousDate}. Auto-scheduled next reminder: ${nextDueDate}.${vetClinic ? ` Clinic: ${vetClinic}` : ''}`
          : `Scanned vaccine paper. Auto-scheduled reminder for: ${nextDueDate}.`,
      });

      // 2. If a previous administered date was read from the paper, log it into Vaccination History
      if (previousDate) {
        const pastRec = await vaccinationsApi.create(petId, {
          vaccine_name: cleanName,
          due_date: previousDate,
          vet_clinic: vetClinic.trim(),
          notes: 'Recorded automatically from photographed vaccination paper.',
        });
        await vaccinationsApi.markComplete(petId, pastRec.id, {
          administered_date: previousDate,
          vet_clinic: vetClinic.trim(),
          next_due_date: nextDueDate,
          notes: 'Completed shot scanned from vet paper.',
        });
      }

      // 3. Create the upcoming / overdue reminder automatically
      await vaccinationsApi.create(petId, {
        vaccine_name: cleanName,
        due_date: nextDueDate,
        vet_clinic: vetClinic.trim(),
        notes: previousDate
          ? `Auto-scheduled from previous shot on ${previousDate}. Vet paper saved in Saved Vet Papers.`
          : 'Auto-scheduled from scanned vet paper.',
      });

      setStep('done');
      if (grandmaMode) {
        speak(`All saved! Your vet paper for ${petName} is stored safely, and your next ${cleanName} reminder is set for ${nextDueDate}.`);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not save right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="paw-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) handleClose();
      }}
    >
      <div className="paw-modal-card" style={{ maxWidth: '560px' }}>
        <div className="paw-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h2 id="scanner-modal-title" className="paw-modal-title" style={{ marginBottom: 0 }}>
                Snap Vaccine Paper
              </h2>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                For {petName} • Auto-Reads Dates & Saves Photo
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="btn-circle"
            aria-label="Close scanner"
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="paw-alert paw-alert-overdue" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChosen}
          style={{ display: 'none' }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChosen}
          style={{ display: 'none' }}
        />

        {/* STEP 1: PICK OR SNAP PHOTO */}
        {step === 'pick' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                padding: '1.5rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--theme-primary-subtle)',
                border: '2px dashed var(--theme-hover-border)',
                marginBottom: '1.25rem',
              }}
            >
              <Camera size={46} style={{ color: 'var(--theme-primary-dark)', marginBottom: '0.65rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Take a Photo of {petName}'s Old Shot Paper
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                PawCare will read the previous date, automatically set your next booster reminder, and keep the photo safely inside <strong>Saved Vet Papers</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="btn-pill btn-pill-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
              >
                <Camera size={22} />
                <span>Take Photo with Phone Camera</span>
              </button>

              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="btn-pill btn-pill-secondary"
                style={{ width: '100%', padding: '0.9rem' }}
              >
                <Upload size={19} />
                <span>Choose Photo from Device</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SCANNING WITH PROGRESS */}
        {step === 'scanning' && (
          <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem' }}>
            {previewUrl && (
              <div
                style={{
                  width: '100%',
                  maxHeight: '220px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: '1.25rem',
                  border: '2px solid var(--theme-hover-border)',
                }}
              >
                <img src={previewUrl} alt="Vaccine card preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', background: '#f8faf6' }} />
              </div>
            )}

            <RefreshCw size={34} className="spin-slow" style={{ color: 'var(--theme-primary-dark)', marginBottom: '0.65rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Reading Dates & Vaccine Name...
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Checking your vet paper ({scanProgress}%)
            </p>
            <div style={{ width: '100%', height: '12px', borderRadius: '999px', background: 'var(--bg-chip)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${scanProgress}%`,
                  height: '100%',
                  background: 'var(--theme-primary)',
                  transition: 'width 200ms ease',
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM EXTRACTED DATES & SAVE */}
        {step === 'confirm' && (
          <form onSubmit={handleSaveEverything}>
            {previewUrl && (
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-chip)' }}>
                <img
                  src={previewUrl}
                  alt="Captured vet paper"
                  style={{ width: '68px', height: '68px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--theme-primary-dark)', fontWeight: 800, marginBottom: '0.15rem' }}>
                    <FileText size={15} />
                    <span>Photo Ready to Save in Vet Papers</span>
                  </div>
                  <span>{parsed?.explanation}</span>
                </div>
              </div>
            )}

            <div className="paw-input-group">
              <label className="paw-label" htmlFor="scan-vax-name">Vaccine Name</label>
              <input
                id="scan-vax-name"
                type="text"
                className="paw-input"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                required
              />
            </div>

            <div className="paw-form-2col">
              <div className="paw-input-group">
                <label className="paw-label" htmlFor="scan-prev-date">Previous Shot Date (Optional)</label>
                <input
                  id="scan-prev-date"
                  type="date"
                  className="paw-input"
                  value={previousDate}
                  onChange={(e) => setPreviousDate(e.target.value)}
                />
              </div>

              <div className="paw-input-group">
                <label className="paw-label" htmlFor="scan-due-date">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--theme-primary-dark)' }}>
                    <Calendar size={14} /> Next Reminder Deadline *
                  </span>
                </label>
                <input
                  id="scan-due-date"
                  type="date"
                  className="paw-input"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="paw-input-group">
              <label className="paw-label" htmlFor="scan-clinic">Vet Clinic (Optional)</label>
              <input
                id="scan-clinic"
                type="text"
                className="paw-input"
                placeholder="e.g. Oakwood Family Vet"
                value={vetClinic}
                onChange={(e) => setVetClinic(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={resetAll}
                className="btn-pill btn-pill-secondary btn-pill-sm"
                disabled={saving}
              >
                Retake Photo
              </button>
              <button
                type="submit"
                className="btn-pill btn-pill-primary"
                style={{ flex: 1 }}
                disabled={saving}
              >
                <CheckCircle2 size={19} />
                <span>{saving ? 'Saving Paper & Reminder...' : 'Save Paper & Set Reminder'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'var(--status-completed-bg)',
                color: 'var(--status-completed-text)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={38} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.45rem' }}>
              Saved & Reminder Set!
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
              <strong>{petName}'s</strong> vet paper is now safely stored inside <strong>Saved Vet Papers</strong>, and your next <strong>{vaccineName}</strong> reminder is scheduled for <strong>{nextDueDate}</strong>.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="btn-pill btn-pill-primary"
              style={{ width: '100%', padding: '0.95rem' }}
            >
              Done, Back to {petName}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
