import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { petsApi } from '../api/pets';
import { vaccinationsApi } from '../api/vaccinations';
import { usePet } from '../context/PetContext';
import type { Pet, VaccinationRecord } from '../types';
import { PetHeader } from '../components/PetHeader';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  CheckCircle2, Hospital, Calendar,
  Edit2, Trash2, X, Plus
} from 'lucide-react';

export const VaccinationHistoryPage: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const { setSelectedPetId } = usePet();

  const [pet, setPet] = useState<Pet | null>(null);
  const [history, setHistory] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit / Add record modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VaccinationRecord | null>(null);
  const [vaccineName, setVaccineName] = useState('');
  const [administeredDate, setAdministeredDate] = useState('');
  const [vetClinic, setVetClinic] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    if (!petId) return;
    try {
      setLoading(true);
      const [petData, historyData] = await Promise.all([
        petsApi.get(petId),
        vaccinationsApi.list(petId, 'COMPLETED'),
      ]);
      setPet(petData);
      setHistory(historyData);
    } catch {
      setError('Unable to load vaccination history.');
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

  const openEditModal = (rec: VaccinationRecord) => {
    setEditingRecord(rec);
    setVaccineName(rec.vaccine_name);
    setAdministeredDate(rec.administered_date || rec.due_date);
    setVetClinic(rec.vet_clinic || '');
    setNextDueDate(rec.next_due_date || '');
    setNotes(rec.notes || '');
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const openLogPastModal = () => {
    setEditingRecord(null);
    setVaccineName('');
    const today = new Date().toISOString().split('T')[0];
    setAdministeredDate(today);
    setVetClinic('');
    setNextDueDate('');
    setNotes('');
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId || !vaccineName.trim() || !administeredDate) {
      setModalError('Vaccine name and administration date are required.');
      return;
    }

    setModalLoading(true);
    setModalError(null);
    try {
      if (editingRecord) {
        await vaccinationsApi.update(petId, editingRecord.id, {
          vaccine_name: vaccineName.trim(),
          administered_date: administeredDate,
          vet_clinic: vetClinic.trim(),
          next_due_date: nextDueDate || null,
          notes: notes.trim(),
        });
      } else {
        const created = await vaccinationsApi.create(petId, {
          vaccine_name: vaccineName.trim(),
          due_date: administeredDate,
          vet_clinic: vetClinic.trim(),
          next_due_date: nextDueDate || null,
          notes: notes.trim(),
        });
        await vaccinationsApi.markComplete(petId, created.id, {
          administered_date: administeredDate,
          vet_clinic: vetClinic.trim(),
          next_due_date: nextDueDate || null,
          notes: notes.trim(),
        });
      }
      setIsEditModalOpen(false);
      await loadData();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to save record.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!petId || !deletingId) return;
    setDeleteLoading(true);
    try {
      await vaccinationsApi.delete(petId, deletingId);
      setDeletingId(null);
      await loadData();
    } catch {
      setError('Failed to delete vaccination record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>Loading history...</div>;
  }

  if (error || !pet) {
    return (
      <div className="paw-alert paw-alert-overdue">
        <span>{error || 'Pet not found.'}</span>
        <Link to="/" className="btn-pill btn-pill-secondary btn-pill-sm" style={{ marginLeft: 'auto' }}>Back to Dashboard</Link>
      </div>
    );
  }

  const isCat = pet?.species?.toLowerCase() === 'cat';
  const bubbleBg = isCat ? 'var(--cat-color)' : 'var(--mint)';
  const bubbleColor = isCat ? 'var(--cat-color-dark)' : 'var(--mint-dark)';

  return (
    <div>
      <PetHeader pet={pet} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Vaccination History
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Archived medical timeline of all administered vaccines for {pet.name}.
          </p>
        </div>

        <button onClick={openLogPastModal} className="btn-pill btn-pill-primary">
          <Plus size={18} />
          <span>Log Past Vaccine</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div className="paw-empty-state">
          <div className="paw-empty-emoji">📋</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>No Completed Vaccinations Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Vaccinations marked as administered will automatically appear here in {pet.name}'s permanent medical history.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <Link to={`/pets/${pet.id}/vaccinations`} className="btn-pill btn-pill-secondary btn-pill-sm">
              View Reminders
            </Link>
            <button onClick={openLogPastModal} className="btn-pill btn-pill-primary btn-pill-sm">
              Log Past Vaccine
            </button>
          </div>
        </div>
      ) : (
        /* Timeline structured layout */
        <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '3px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginLeft: '0.75rem' }}>
          {history.map((rec) => (
            <div key={rec.id} style={{ position: 'relative' }}>
              {/* Timeline bubble */}
              <div
                style={{
                  position: 'absolute',
                  left: '-2.15rem',
                  top: '1.25rem',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: bubbleBg,
                  color: bubbleColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <CheckCircle2 size={14} />
              </div>

              <div className="paw-card" style={{ padding: '1.35rem 1.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{rec.vaccine_name}</h3>
                      <span className="status-pill status-completed">Administered</span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.35rem' }}>
                      Administered on <strong>{rec.administered_date ? new Date(rec.administered_date).toLocaleDateString() : 'Recorded'}</strong>
                    </p>

                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.4rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      {rec.vet_clinic && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Hospital size={14} /> {rec.vet_clinic}
                        </span>
                      )}
                      {rec.next_due_date && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--mint-dark)', fontWeight: 700 }}>
                          <Calendar size={14} /> Next Booster: {new Date(rec.next_due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {rec.notes && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.4rem', fontStyle: 'italic' }}>
                        "{rec.notes}"
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => openEditModal(rec)}
                      className="btn-circle"
                      style={{ width: '36px', height: '36px' }}
                      title="Correct record"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeletingId(rec.id)}
                      className="btn-circle"
                      style={{ width: '36px', height: '36px', color: 'var(--status-overdue-text)' }}
                      title="Delete record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Log Record Modal */}
      {isEditModalOpen && (
        <div className="paw-modal-backdrop">
          <div className="paw-modal-card">
            <div className="paw-modal-header">
              <h3 className="paw-modal-title">
                {editingRecord ? 'Correct Vaccination Record' : 'Log Past Vaccine'}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="btn-circle" style={{ width: '36px', height: '36px' }}>
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="paw-alert paw-alert-overdue" style={{ marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveRecord}>
              <div className="paw-input-group">
                <label className="paw-label" htmlFor="hist-vaccine">Vaccine Name *</label>
                <input
                  id="hist-vaccine"
                  type="text"
                  className="paw-input"
                  placeholder="e.g. Rabies, DHPP, Leukemia"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  required
                />
              </div>

              <div className="paw-input-group">
                <label className="paw-label" htmlFor="hist-admin-date">Date Administered *</label>
                <input
                  id="hist-admin-date"
                  type="date"
                  className="paw-input"
                  max={new Date().toISOString().split('T')[0]}
                  value={administeredDate}
                  onChange={(e) => setAdministeredDate(e.target.value)}
                  required
                />
              </div>

              <div className="paw-input-group">
                <label className="paw-label" htmlFor="hist-clinic">Clinic or Veterinarian (optional)</label>
                <input
                  id="hist-clinic"
                  type="text"
                  className="paw-input"
                  placeholder="e.g. Dr. Floyd Miles, Animal Care"
                  value={vetClinic}
                  onChange={(e) => setVetClinic(e.target.value)}
                />
              </div>

              <div className="paw-input-group">
                <label className="paw-label" htmlFor="hist-next-due">Next Scheduled Due Date (optional)</label>
                <input
                  id="hist-next-due"
                  type="date"
                  className="paw-input"
                  min={administeredDate}
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                />
              </div>

              <div className="paw-input-group">
                <label className="paw-label" htmlFor="hist-notes">Notes / Batch # (optional)</label>
                <textarea
                  id="hist-notes"
                  className="paw-textarea"
                  rows={2}
                  placeholder="e.g. 3-year rabies certificate on file"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-pill btn-pill-secondary btn-pill-sm" disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-pill btn-pill-primary btn-pill-sm" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete History Record?"
        message="Warning: This will remove this completed vaccination from your pet's permanent medical history. Are you sure you want to proceed?"
        confirmLabel="Yes, Delete Record"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
