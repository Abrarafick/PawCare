import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { petsApi } from '../api/pets';
import { vaccinationsApi } from '../api/vaccinations';
import { usePet } from '../context/PetContext';
import type { Pet, VaccinationRecord } from '../types';
import { PetHeader } from '../components/PetHeader';
import { PhotoModal } from '../components/PhotoModal';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Bell, FileText, History, Trash2, ArrowRight,
  AlertTriangle, Info
} from 'lucide-react';

export const PetOverviewPage: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const { setSelectedPetId } = usePet();
  const navigate = useNavigate();

  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadPet = async () => {
    if (!petId) return;
    try {
      setLoading(true);
      const [data, vaxList] = await Promise.all([
        petsApi.get(petId),
        vaccinationsApi.list(petId),
      ]);
      setPet(data);
      setVaccinations(vaxList);
    } catch {
      setError('Unable to find this pet profile or you do not have permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPet();
    if (petId) {
      setSelectedPetId(petId);
    }
  }, [petId, setSelectedPetId]);

  const handleDeletePet = async () => {
    if (!pet) return;
    setDeleting(true);
    try {
      await petsApi.delete(pet.id);
      navigate('/');
    } catch {
      setError('Failed to delete pet.');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <p style={{ fontWeight: 600 }}>Loading pet healthcare profile...</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="paw-alert paw-alert-overdue" style={{ margin: '2rem 0' }}>
        <span>{error || 'Pet not found.'}</span>
        <Link to="/" className="btn-pill btn-pill-secondary btn-pill-sm" style={{ marginLeft: 'auto' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const criticalUpcoming = vaccinations.filter((v) => {
    if (v.is_completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(v.due_date);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 2;
  });

  return (
    <div>
      <PetHeader pet={pet} onOpenPhotoModal={() => setIsPhotoModalOpen(true)} />

      {/* Overdue alert if any */}
      {pet.overdue_vaccinations > 0 && (
        <div className="paw-alert paw-alert-overdue">
          <AlertTriangle size={20} />
          <div style={{ flex: 1 }}>
            <strong>Action Needed:</strong> {pet.name} has {pet.overdue_vaccinations} overdue vaccination.
          </div>
          <Link to={`/pets/${pet.id}/vaccinations`} className="btn-pill btn-pill-danger btn-pill-sm">
            View Overdue
          </Link>
        </div>
      )}

      {/* Critical 2-Day Deadline Urgent Notification with RED Front Text */}
      {criticalUpcoming.length > 0 && (
        <div
          className="paw-alert paw-alert-overdue"
          style={{
            borderLeft: '6px solid #dc2626',
            background: 'var(--status-overdue-bg)',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 16px rgba(220, 38, 38, 0.12)',
          }}
        >
          <AlertTriangle size={22} style={{ color: '#dc2626', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.975rem', color: '#dc2626', display: 'block' }}>
              ⚠️ URGENT NOTIFICATION: {criticalUpcoming.length} vaccination deadline{criticalUpcoming.length > 1 ? 's have' : ' has'} only 2 days or fewer remaining!
            </strong>
            <p style={{ fontSize: '0.85rem', color: '#b91c1c', marginTop: '0.2rem', fontWeight: 600 }}>
              {criticalUpcoming.map((c) => `${c.vaccine_name} (due ${new Date(c.due_date).toLocaleDateString()})`).join(', ')} for {pet.name}. Please confirm your veterinary appointment immediately.
            </p>
          </div>
          <Link to={`/pets/${pet.id}/vaccinations`} className="btn-pill btn-pill-danger btn-pill-sm">
            Schedule Now
          </Link>
        </div>
      )}

      {/* Main Feature Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
          Healthcare Management
        </h2>

        <div className="grid-cards">
          {/* Card 1: Vaccination Reminders */}
          <Link to={`/pets/${pet.id}/vaccinations`} className="paw-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--mint-light)',
                  color: 'var(--mint-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bell size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Vaccination Reminders</h3>
                <span className="status-pill status-upcoming" style={{ fontSize: '0.7rem' }}>
                  {pet.upcoming_vaccinations} upcoming
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', flex: 1 }}>
              Schedule future vaccines, track overdue shots, and mark completed administrations.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reminders & Deadlines</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                Open <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {/* Card 2: Medical Reports Vault */}
          <Link to={`/pets/${pet.id}/reports`} className="paw-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--bg-chip)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Medical Vault</h3>
                <span className="status-pill" style={{ background: 'var(--bg-chip)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  Private & Encrypted
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', flex: 1 }}>
              Securely store veterinary reports, blood test PDFs, prescriptions, and device camera scans.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Document Storage</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                Browse <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {/* Card 3: Vaccination History */}
          <Link to={`/pets/${pet.id}/history`} className="paw-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--status-completed-bg)',
                  color: 'var(--status-completed-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <History size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Vaccination History</h3>
                <span className="status-pill status-completed" style={{ fontSize: '0.7rem' }}>
                  Permanent Records
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', flex: 1 }}>
              Review administered vaccines timeline with clinics, batch numbers, and booster intervals.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Historical Timeline</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                History <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Additional Profile Notes & Details */}
      {pet.notes && (
        <div className="paw-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Info size={18} style={{ color: 'var(--mint-dark)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Profile Notes & Microchip</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
            {pet.notes}
          </p>
        </div>
      )}

      {/* Delete Pet Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 0' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--status-overdue-text)' }}>Delete Pet Profile</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
            Permanently removes {pet.name}'s reminders and documents.
          </p>
        </div>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="btn-pill btn-pill-danger btn-pill-sm"
        >
          <Trash2 size={14} />
          <span>Delete Profile</span>
        </button>
      </div>

      {/* Modals */}
      <PhotoModal
        isOpen={isPhotoModalOpen}
        petId={pet.id}
        hasExistingPhoto={!!pet.photo_key}
        onClose={() => setIsPhotoModalOpen(false)}
        onSuccess={loadPet}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={`Delete ${pet.name}?`}
        message={`Are you sure you want to delete ${pet.name}'s profile? All associated vaccination records and medical reports will be permanently erased.`}
        confirmLabel="Yes, Delete Profile"
        isLoading={deleting}
        onConfirm={handleDeletePet}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
