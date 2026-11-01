import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePet } from '../context/PetContext';
import { Plus } from 'lucide-react';

export const HealthRedirectPage: React.FC = () => {
  const { pets, selectedPetId, loading } = usePet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (selectedPetId) {
        navigate(`/pets/${selectedPetId}/vaccinations`, { replace: true });
      } else if (pets.length > 0) {
        navigate(`/pets/${pets[0].id}/vaccinations`, { replace: true });
      }
    }
  }, [loading, selectedPetId, pets, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <p style={{ fontWeight: 600 }}>Loading health records...</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="paw-empty-state" style={{ maxWidth: '500px', margin: '3rem auto' }}>
        <div className="paw-empty-emoji">❤️</div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Pets Registered</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.5rem' }}>
          To view health reminders, immunization schedules, and medical vaults, add your pet's profile first.
        </p>
        <Link to="/pets/new" className="btn-pill btn-pill-primary">
          <Plus size={16} />
          <span>Add Your Pet</span>
        </Link>
      </div>
    );
  }

  return null;
};

