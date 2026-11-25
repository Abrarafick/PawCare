import React, { useState, useEffect } from 'react';
import { Phone, Edit2, Check, X, Stethoscope } from 'lucide-react';

interface VetContact {
  clinicName: string;
  phoneNumber: string;
}

interface VetContactCardProps {
  petId: string;
  petName: string;
}

const STORAGE_KEY_PREFIX = 'pawcare_vet_contact_';

/**
 * Grandma-Proof 1-Tap Vet Call Card.
 * Stores the trusted veterinarian phone number locally per pet so older adults
 * can call their clinic in one clear tap without searching contacts.
 */
export const VetContactCard: React.FC<VetContactCardProps> = ({ petId, petName }) => {
  const [contact, setContact] = useState<VetContact>({ clinicName: '', phoneNumber: '' });
  const [editing, setEditing] = useState(false);
  const [clinicInput, setClinicInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${petId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as VetContact;
        setContact(parsed);
        setClinicInput(parsed.clinicName || '');
        setPhoneInput(parsed.phoneNumber || '');
      } else {
        setContact({ clinicName: '', phoneNumber: '' });
        setClinicInput('');
        setPhoneInput('');
      }
      setEditing(false);
    } catch {
      setContact({ clinicName: '', phoneNumber: '' });
    }
  }, [petId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: VetContact = {
      clinicName: clinicInput.trim() || 'Family Vet Clinic',
      phoneNumber: phoneInput.trim(),
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${petId}`, JSON.stringify(cleaned));
    setContact(cleaned);
    setEditing(false);
  };

  const hasPhone = Boolean(contact.phoneNumber);
  const sanitizedTel = contact.phoneNumber.replace(/[^+\d]/g, '');

  return (
    <div className="paw-card" style={{ padding: '1.35rem 1.5rem', marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--theme-primary-light)',
              color: 'var(--theme-primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Stethoscope size={24} />
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Trusted Vet Contact for {petName}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {hasPhone ? contact.clinicName : 'Save Your Vet Phone Number'}
            </h3>
            {hasPhone && (
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                {contact.phoneNumber}
              </p>
            )}
          </div>
        </div>

        {!editing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {hasPhone ? (
              <>
                <a
                  href={`tel:${sanitizedTel}`}
                  className="btn-pill btn-pill-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <Phone size={18} />
                  <span>Call Vet Now</span>
                </a>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="btn-pill btn-pill-secondary btn-pill-sm"
                  aria-label="Edit vet phone number"
                >
                  <Edit2 size={15} />
                  <span>Edit</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="btn-pill btn-pill-primary btn-pill-sm"
              >
                <Phone size={16} />
                <span>Add Vet Phone Number</span>
              </button>
            )}
          </div>
        )}
      </div>

      {editing && (
        <form onSubmit={handleSave} style={{ marginTop: '1.15rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <div className="paw-form-2col">
            <div className="paw-input-group" style={{ marginBottom: '0.75rem' }}>
              <label className="paw-label" htmlFor={`vet-clinic-${petId}`}>Vet Clinic Name</label>
              <input
                id={`vet-clinic-${petId}`}
                type="text"
                className="paw-input"
                placeholder="e.g. Happy Paws Vet Clinic"
                value={clinicInput}
                onChange={(e) => setClinicInput(e.target.value)}
              />
            </div>

            <div className="paw-input-group" style={{ marginBottom: '0.75rem' }}>
              <label className="paw-label" htmlFor={`vet-phone-${petId}`}>Phone Number</label>
              <input
                id={`vet-phone-${petId}`}
                type="tel"
                className="paw-input"
                placeholder="e.g. +1 555-234-5678"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-pill btn-pill-secondary btn-pill-sm"
            >
              <X size={15} />
              <span>Cancel</span>
            </button>
            <button type="submit" className="btn-pill btn-pill-primary btn-pill-sm">
              <Check size={15} />
              <span>Save Vet Number</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
