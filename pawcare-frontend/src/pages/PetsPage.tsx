import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePet } from '../context/PetContext';
import { Plus, Check, ArrowRight, Bell, FileText, Sparkles } from 'lucide-react';

export const PetsPage: React.FC = () => {
  const { pets, selectedPetId, setSelectedPetId, loading } = usePet();
  const navigate = useNavigate();

  const getSpeciesEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case 'cat': return '🐱';
      case 'dog': return '🐶';
      case 'bird': return '🦜';
      case 'rabbit': return '🐰';
      default: return '🐾';
    }
  };

  const handleSelectPet = (id: string) => {
    setSelectedPetId(id);
  };

  if (loading && pets.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', animation: 'bounce 1s infinite' }}>🐾</div>
        <p style={{ fontWeight: 600 }}>Loading your pet profiles...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--mint-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mint-dark)' }}>
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Pet Profiles & Selection</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Your Pets
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
            Choose an active pet to access reminders, medical files, and health history.
          </p>
        </div>

        <Link to="/pets/new" className="btn-pill btn-pill-primary">
          <Plus size={18} />
          <span>Add New Pet</span>
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="paw-empty-state">
          <div className="paw-empty-emoji">🐾</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>No Pets Registered Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
            Create your first pet profile to begin organizing vaccination schedules and health documents.
          </p>
          <Link to="/pets/new" className="btn-pill btn-pill-primary">
            <Plus size={16} />
            <span>Add Your First Pet</span>
          </Link>
        </div>
      ) : (
        <div className="grid-cards">
          {pets.map((pet) => {
            const isSelected = selectedPetId === pet.id;
            const isCat = pet.species?.toLowerCase() === 'cat';
            const cardAccentBg = isCat ? 'var(--cat-color-light)' : 'var(--mint-light)';
            const cardAccentColor = isCat ? 'var(--cat-color-dark)' : 'var(--mint-dark)';

            return (
              <div
                key={pet.id}
                className="paw-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: isSelected
                    ? isCat
                      ? '2px solid var(--cat-color)'
                      : '2px solid var(--mint)'
                    : '1px solid var(--border-subtle)',
                  boxShadow: isSelected
                    ? isCat
                      ? '0 12px 30px var(--cat-glow)'
                      : '0 12px 30px var(--dog-glow)'
                    : 'var(--shadow-card)',
                }}
              >
                {/* Pet Identity Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '58px',
                      height: '58px',
                      borderRadius: '50%',
                      background: cardAccentBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '2px solid #ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    {pet.photo_url ? (
                      <img src={pet.photo_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.75rem' }}>{getSpeciesEmoji(pet.species)}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pet.name}
                      </h3>
                      {isSelected && (
                        <span
                          style={{
                            background: cardAccentBg,
                            color: cardAccentColor,
                            fontSize: '0.725rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Check size={11} strokeWidth={3} /> Active
                        </span>
                      )}
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600, textTransform: 'capitalize', marginTop: '0.15rem' }}>
                      {pet.breed ? `${pet.breed} • ${pet.species}` : pet.species}
                    </p>
                  </div>
                </div>

                {/* 3 Metrics Chips */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'var(--bg-chip)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gender</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'capitalize' }}>{pet.gender || '—'}</span>
                  </div>
                  <div style={{ background: 'var(--bg-chip)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Age</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{pet.estimated_age || (pet.date_of_birth ? `${new Date().getFullYear() - new Date(pet.date_of_birth).getFullYear()}y` : '—')}</span>
                  </div>
                  <div style={{ background: 'var(--bg-chip)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weight</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{pet.weight || '—'}</span>
                  </div>
                </div>

                {/* Vaccination Summary */}
                <div style={{ marginBottom: '1.25rem', flex: 1 }}>
                  {pet.overdue_vaccinations > 0 ? (
                    <div style={{ background: 'var(--status-overdue-bg)', color: 'var(--status-overdue-text)', padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700 }}>
                      ⚠️ {pet.overdue_vaccinations} overdue vaccination
                    </div>
                  ) : pet.upcoming_vaccinations > 0 ? (
                    <div style={{ background: 'var(--status-upcoming-bg)', color: 'var(--status-upcoming-text)', padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700 }}>
                      📅 {pet.upcoming_vaccinations} upcoming vaccination
                    </div>
                  ) : (
                    <div style={{ background: 'var(--status-completed-bg)', color: 'var(--status-completed-text)', padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700 }}>
                      ✨ Immunizations up to date
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                  {!isSelected ? (
                    <button
                      type="button"
                      onClick={() => handleSelectPet(pet.id)}
                      className="btn-pill btn-pill-secondary btn-pill-sm"
                      style={{ width: '100%' }}
                    >
                      <Check size={14} />
                      <span>Set as Active Pet</span>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/pets/${pet.id}/vaccinations`)}
                        className="btn-pill btn-pill-primary btn-pill-sm"
                        style={{ flex: 1 }}
                      >
                        <Bell size={14} />
                        <span>Reminders</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/pets/${pet.id}/reports`)}
                        className="btn-pill btn-pill-secondary btn-pill-sm"
                        style={{ flex: 1 }}
                      >
                        <FileText size={14} />
                        <span>Vault</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPetId(pet.id);
                      navigate(`/pets/${pet.id}`);
                    }}
                    className="btn-pill btn-pill-secondary btn-pill-sm"
                    style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-light)' }}
                  >
                    <span>View Profile & Details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

