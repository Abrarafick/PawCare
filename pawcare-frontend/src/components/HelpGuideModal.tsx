import React from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle, Glasses, PawPrint, Bell, FileText, Phone } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { ReadAloudButton } from './ReadAloudButton';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE_STEPS = [
  {
    icon: PawPrint,
    title: '1. Pick Your Pet at the Top',
    description: 'Tap your dog or cat’s name pill near the top of the screen to see their health details.',
  },
  {
    icon: Bell,
    title: '2. Check Upcoming Shots',
    description: 'Look at the "Next Vaccination" card to see the exact date of the next vet visit. Red means due soon or overdue.',
  },
  {
    icon: FileText,
    title: '3. Open Saved Vet Papers',
    description: 'Tap "Medical Vault" to view prescriptions, receipts, or take a photo of a new vet paper.',
  },
  {
    icon: Phone,
    title: '4. Call Your Vet in One Tap',
    description: 'Save your vet clinic phone number once on the home screen, then tap "Call Vet Now" whenever you need them.',
  },
];

const GUIDE_SPEECH =
  'Welcome to the PawCare Easy Guide. Step 1: Pick your pet at the top by tapping their name. Step 2: Check the Next Vaccination card for the exact date of the next vet visit. Step 3: Tap Medical Vault to see saved vet papers or upload a photo. Step 4: Save your vet clinic phone number once to call your vet in one tap.';

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  const { grandmaMode, toggleGrandmaMode } = useAccessibility();

  if (!isOpen) return null;

  return createPortal(
    <div
      className="paw-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-guide-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="paw-modal-card" style={{ maxWidth: '580px' }}>
        <div className="paw-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--theme-primary)',
                color: 'var(--theme-primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HelpCircle size={22} />
            </div>
            <h2 id="help-guide-title" className="paw-modal-title">
              How to Use PawCare
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-circle"
            aria-label="Close guide"
            title="Close guide"
          >
            <X size={20} />
          </button>
        </div>

        {/* Voice Readout + Quick Easy Mode Toggle */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.65rem',
            marginBottom: '1.25rem',
            padding: '0.9rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--theme-primary-subtle)',
            border: '1.5px solid var(--theme-hover-border)',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ReadAloudButton text={GUIDE_SPEECH} label="Listen to Guide" stopLabel="Stop Listening" />

          <button
            type="button"
            onClick={toggleGrandmaMode}
            className={`btn-pill btn-pill-sm ${grandmaMode ? 'btn-pill-primary' : 'btn-pill-secondary'}`}
          >
            <Glasses size={17} />
            <span>Easy Mode: {grandmaMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* 4 Clear Step Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          {GUIDE_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.9rem',
                  padding: '0.95rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-chip)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--theme-primary-light)',
                    color: 'var(--theme-primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-pill btn-pill-primary"
          style={{ width: '100%', padding: '0.9rem' }}
        >
          Got It, Back to PawCare
        </button>
      </div>
    </div>,
    document.body
  );
};
