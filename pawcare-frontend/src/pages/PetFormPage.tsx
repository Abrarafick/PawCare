import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { petsApi } from '../api/pets';
import type { Species } from '../types';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

export const PetFormPage: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const isEditing = Boolean(petId);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('');
  const [ageType, setAgeType] = useState<'dob' | 'estimated'>('dob');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [estimatedAge, setEstimatedAge] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && petId) {
      petsApi.get(petId)
        .then((pet) => {
          setName(pet.name);
          setSpecies(pet.species);
          setBreed(pet.breed || '');
          setGender(pet.gender || 'Male');
          setWeight(pet.weight || '');
          if (pet.date_of_birth) {
            setDateOfBirth(pet.date_of_birth);
            setAgeType('dob');
          } else if (pet.estimated_age) {
            setEstimatedAge(pet.estimated_age);
            setAgeType('estimated');
          }
          setNotes(pet.notes || '');
        })
        .catch(() => {
          setError('Unable to load pet details.');
        })
        .finally(() => setFetchLoading(false));
    }
  }, [isEditing, petId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Pet name is required.');
      return;
    }

    if (ageType === 'dob' && !dateOfBirth) {
      setError('Please provide a date of birth, or switch to estimated age.');
      return;
    }
    if (ageType === 'estimated' && !estimatedAge.trim()) {
      setError('Please provide an estimated age (e.g. "~2 years").');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      species,
      breed: breed.trim(),
      gender,
      weight: weight.trim(),
      date_of_birth: ageType === 'dob' ? dateOfBirth : null,
      estimated_age: ageType === 'estimated' ? estimatedAge.trim() : '',
      notes: notes.trim(),
    };

    try {
      if (isEditing && petId) {
        const updated = await petsApi.update(petId, payload);
        navigate(`/pets/${updated.id}`);
      } else {
        const created = await petsApi.create(payload);
        navigate(`/pets/${created.id}`);
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (typeof data === 'string') {
        setError(data);
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data) {
        const firstErr = Object.values(data)[0];
        setError(Array.isArray(firstErr) ? firstErr[0] : String(firstErr));
      } else {
        setError('Failed to save pet profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <p style={{ fontWeight: 600 }}>Loading pet information...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to={isEditing && petId ? `/pets/${petId}` : '/'}
          className="btn-circle"
          style={{ width: '40px', height: '40px', display: 'inline-flex' }}
          title="Back"
        >
          <ArrowLeft size={18} />
        </Link>
      </div>

      <div className="paw-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--mint-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mint-dark)' }}>
            <Sparkles size={18} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {isEditing ? 'Edit Pet Profile' : 'Add New Pet Profile'}
          </h1>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          Create a dedicated health profile to track immunizations and private medical records.
        </p>

        {error && (
          <div className="paw-alert paw-alert-overdue" style={{ marginBottom: '1.25rem' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Pet Name */}
          <div className="paw-input-group">
            <label className="paw-label" htmlFor="pet-name">Pet Name *</label>
            <input
              id="pet-name"
              type="text"
              className="paw-input"
              placeholder="e.g. Milo, Luna, Charlie"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Species Category Selector */}
          <div className="paw-input-group">
            <label className="paw-label">Species *</label>
            <div className="pill-radio-group">
              {[
                { value: 'dog', label: 'Dog 🐶' },
                { value: 'cat', label: 'Cat 🐱' },
                { value: 'other', label: 'Bird / Rabbit / Other 🐾' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSpecies(item.value as Species)}
                  className={`pill-radio-btn ${
                    species === item.value
                      ? item.value === 'cat'
                        ? 'active-cat'
                        : 'active-dog'
                      : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Breed & Gender row */}
          <div className="paw-form-2col">
            <div className="paw-input-group">
              <label className="paw-label" htmlFor="pet-breed">Breed</label>
              <input
                id="pet-breed"
                type="text"
                className="paw-input"
                placeholder="e.g. Persian, Golden Retriever"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>

            <div className="paw-input-group">
              <label className="paw-label" htmlFor="pet-gender">Gender</label>
              <select
                id="pet-gender"
                className="paw-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          {/* Weight */}
          <div className="paw-input-group">
            <label className="paw-label" htmlFor="pet-weight">Weight (optional)</label>
            <input
              id="pet-weight"
              type="text"
              className="paw-input"
              placeholder="e.g. 4.2 kg, 28 lbs"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          {/* Age Selection Mode */}
          <div className="paw-input-group">
            <label className="paw-label">Age Information *</label>
            <div className="pill-radio-group" style={{ marginBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setAgeType('dob')}
                className={`pill-radio-btn ${ageType === 'dob' ? 'active' : ''}`}
              >
                Exact Date of Birth
              </button>
              <button
                type="button"
                onClick={() => setAgeType('estimated')}
                className={`pill-radio-btn ${ageType === 'estimated' ? 'active' : ''}`}
              >
                Estimated Age
              </button>
            </div>

            {ageType === 'dob' ? (
              <div>
                <input
                  type="date"
                  className="paw-input"
                  value={dateOfBirth}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required={ageType === 'dob'}
                />
                <p className="paw-help">Date of birth is used to track age-based vaccination schedules.</p>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  className="paw-input"
                  placeholder="e.g. 2 Years, 6 Months, ~3 Years"
                  value={estimatedAge}
                  onChange={(e) => setEstimatedAge(e.target.value)}
                  required={ageType === 'estimated'}
                />
                <p className="paw-help">Ideal for rescue or adopted pets whose exact birthday is unknown.</p>
              </div>
            )}
          </div>

          {/* Notes / Microchip */}
          <div className="paw-input-group">
            <label className="paw-label" htmlFor="pet-notes">Notes / Microchip / Allergies (optional)</label>
            <textarea
              id="pet-notes"
              className="paw-textarea"
              rows={3}
              placeholder="e.g. Microchip #985141..., allergic to chicken, sensitive digestion"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <Link to={isEditing && petId ? `/pets/${petId}` : '/'} className="btn-pill btn-pill-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-pill btn-pill-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
