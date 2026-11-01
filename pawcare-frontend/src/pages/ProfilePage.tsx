import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePet } from '../context/PetContext';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  User, Shield, Mail, Calendar, PawPrint, LogOut,
  Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { pets, selectedPet } = usePet();
  const navigate = useNavigate();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login');
    } finally {
      setLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const memberSince = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="paw-card" style={{ marginBottom: '1.5rem', textAlign: 'center', position: 'relative' }}>
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'var(--mint-light)',
            color: 'var(--mint-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            fontSize: '2.2rem',
            fontWeight: 800,
            border: '4px solid #ffffff',
            boxShadow: '0 8px 24px rgba(154, 217, 113, 0.35)',
          }}
        >
          {user?.first_name ? user.first_name[0].toUpperCase() : <User size={40} />}
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email.split('@')[0]}
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', fontWeight: 500 }}>
          {user?.email}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <span className="status-pill status-upcoming" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
            <Calendar size={12} /> Member since {memberSince}
          </span>
          <span className="status-pill" style={{ background: 'var(--bg-chip)', color: 'var(--text-main)', fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
            <PawPrint size={12} /> {pets.length} Pet{pets.length === 1 ? '' : 's'} Managed
          </span>
        </div>
      </div>

      {/* Current Active Pet Card */}
      {selectedPet && (
        <div
          className="paw-card"
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/pets/${selectedPet.id}`)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: selectedPet.species?.toLowerCase() === 'cat' ? 'var(--cat-color-light)' : 'var(--mint-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              {selectedPet.photo_url ? (
                <img src={selectedPet.photo_url} alt={selectedPet.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : selectedPet.species?.toLowerCase() === 'cat' ? '🐱' : '🐶'}
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Pet Context
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedPet.name}</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
            <span>Manage</span>
            <ChevronRight size={16} />
          </div>
        </div>
      )}

      {/* Account Settings & Security Details */}
      <div className="paw-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.85rem', paddingLeft: '0.5rem' }}>
          Account & Security
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-chip)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{user?.email}</span>
              </div>
            </div>
            <CheckCircle2 size={18} style={{ color: 'var(--status-completed-text)' }} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-chip)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={18} style={{ color: 'var(--mint-dark)' }} />
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Document Vault Protection</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Private & Isolated Storage</span>
              </div>
            </div>
            <span className="status-pill status-completed" style={{ fontSize: '0.7rem' }}>Active</span>
          </div>
        </div>
      </div>

      {/* App Info & About */}
      <div className="paw-card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <Sparkles size={18} style={{ color: 'var(--mint-dark)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>About PawCare</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          "Your Pet's Health, All in One Place." Manage vaccination deadlines, medical records, and pet profiles securely.
        </p>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-soft)' }}>
          PawCare Web App • Version 1.0.0
        </span>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={() => setIsLogoutModalOpen(true)}
        className="btn-pill btn-pill-danger"
        style={{ width: '100%', padding: '0.85rem' }}
      >
        <LogOut size={18} />
        <span>Log Out of PawCare</span>
      </button>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Log Out"
        message="Are you sure you want to log out of PawCare? Your pet records remain securely saved."
        confirmLabel="Log Out"
        confirmVariant="danger"
        isLoading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};
