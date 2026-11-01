import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import type { Pet } from '../types';
import {
  Bell, FileText, History, LayoutDashboard, Edit,
  ArrowLeft, Camera, AlertCircle
} from 'lucide-react';

interface PetHeaderProps {
  pet: Pet;
  onOpenPhotoModal?: () => void;
}

export const PetHeader: React.FC<PetHeaderProps> = ({ pet, onOpenPhotoModal }) => {
  const isCat = pet.species?.toLowerCase() === 'cat';
  const bubbleBg = isCat ? 'var(--cat-color-light)' : 'var(--mint-light)';
  const bubbleShadow = isCat ? 'inset 0 4px 12px rgba(246, 220, 121, 0.35)' : 'inset 0 4px 12px rgba(154, 217, 113, 0.25)';
  const cameraBg = isCat ? 'var(--cat-color)' : 'var(--mint)';
  const cameraColor = isCat ? 'var(--cat-color-dark)' : 'var(--mint-dark)';

  const getSpeciesEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case 'cat': return '🐱';
      case 'dog': return '🐶';
      case 'bird': return '🦜';
      case 'rabbit': return '🐰';
      default: return '🐾';
    }
  };

  const getAgeDisplay = () => {
    if (pet.date_of_birth) {
      const birth = new Date(pet.date_of_birth);
      const diffMonths = (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      if (diffMonths < 12) {
        return `${Math.max(1, Math.round(diffMonths))} Mo`;
      }
      const years = (diffMonths / 12).toFixed(1).replace('.0', '');
      return `${years} Yrs`;
    }
    return pet.estimated_age || '—';
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Top Header Card styled directly from reference image */}
      <div
        className="paw-card"
        style={{
          padding: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '1.25rem',
        }}
      >
        {/* Top Control Bar with circular buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" className="btn-circle" title="Return to Pet List" aria-label="Back">
            <ArrowLeft size={18} />
          </Link>

          <span
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              background: 'var(--bg-chip)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            Pet Healthcare Profile
          </span>

          <Link to={`/pets/${pet.id}/edit`} className="btn-circle" title="Edit Profile" aria-label="Edit">
            <Edit size={18} />
          </Link>
        </div>

        {/* Pet Visual Backdrop & Avatar */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          {/* Organic soft green (Dog) or soft pastel yellow (Cat) bubble background like reference */}
          <div
            style={{
              width: '180px',
              height: '180px',
              background: bubbleBg,
              borderRadius: '50% 50% 45% 55% / 55% 45% 55% 45%',
              margin: '0 auto 1.25rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: bubbleShadow,
              transition: 'var(--transition-smooth)',
            }}
          >
            {pet.photo_url ? (
              <img
                src={pet.photo_url}
                alt={pet.name}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #ffffff',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                }}
              />
            ) : (
              <span style={{ fontSize: '5rem', lineHeight: 1 }}>{getSpeciesEmoji(pet.species)}</span>
            )}

            {onOpenPhotoModal && (
              <button
                onClick={onOpenPhotoModal}
                className="btn-circle"
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '12px',
                  width: '38px',
                  height: '38px',
                  background: cameraBg,
                  color: cameraColor,
                  border: '2px solid #ffffff',
                }}
                title="Change Photo"
                aria-label="Upload pet photo"
              >
                <Camera size={16} />
              </button>
            )}
          </div>

          {/* Pet Name & Species/Breed */}
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            {pet.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
            {pet.breed && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.925rem', fontWeight: 600 }}>
                {pet.breed}
              </span>
            )}
            <span
              style={{
                textTransform: 'capitalize',
                background: isCat ? 'var(--cat-color-light)' : 'var(--mint-light)',
                color: isCat ? 'var(--cat-color-dark)' : 'var(--mint-dark)',
                padding: '0.15rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {pet.species}
            </span>
          </div>

          {/* 3-Column Metric Chips (directly matching the reference: Gender, Age, Weight) */}
          <div className="stat-chips-grid" style={{ maxWidth: '440px', margin: '1.5rem auto 0.5rem auto' }}>
            <div className="stat-chip">
              <div className="stat-chip-label">Gender</div>
              <div className="stat-chip-val" style={{ textTransform: 'capitalize' }}>
                {pet.gender || '—'}
              </div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Age</div>
              <div className="stat-chip-val">{getAgeDisplay()}</div>
            </div>

            <div className="stat-chip">
              <div className="stat-chip-label">Weight</div>
              <div className="stat-chip-val">{pet.weight || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <nav className="sub-nav-tabs">
        <NavLink
          to={`/pets/${pet.id}`}
          end
          className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to={`/pets/${pet.id}/vaccinations`}
          className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
        >
          <Bell size={18} />
          <span>Vaccination Reminders</span>
          {pet.overdue_vaccinations > 0 && (
            <span
              style={{
                background: 'var(--status-overdue-bg)',
                color: 'var(--status-overdue-text)',
                borderRadius: 'var(--radius-full)',
                padding: '0.15rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              <AlertCircle size={12} /> {pet.overdue_vaccinations}
            </span>
          )}
        </NavLink>

        <NavLink
          to={`/pets/${pet.id}/reports`}
          className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Medical Vault</span>
        </NavLink>

        <NavLink
          to={`/pets/${pet.id}/history`}
          className={({ isActive }) => `sub-nav-tab ${isActive ? 'active' : ''}`}
        >
          <History size={18} />
          <span>Vaccination History</span>
        </NavLink>
      </nav>
    </div>
  );
};
