import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';
import { usePet } from '../context/PetContext';
import type { DashboardData, DashboardPetSummary } from '../types';
import {
  Plus, AlertTriangle, Calendar, FileText, ArrowRight,
  CheckCircle2, Bell, ShieldAlert, ChevronRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const { selectedPetId, setSelectedPetId } = usePet();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getSummary();
      setData(res);
      if (res.pets.length > 0 && !selectedPetId) {
        setSelectedPetId(res.pets[0].id);
      }
    } catch {
      setError('Unable to load dashboard summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getSpeciesEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case 'cat': return '🐱';
      case 'dog': return '🐶';
      case 'bird': return '🦜';
      case 'rabbit': return '🐰';
      default: return '🐾';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', animation: 'bounce 1s infinite' }}>🐾</div>
        <p style={{ fontWeight: 600 }}>Loading your pet health dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="paw-alert paw-alert-overdue" style={{ margin: '2rem 0' }}>
        <span>{error || 'Failed to load data.'}</span>
        <button onClick={fetchDashboard} className="btn-pill btn-pill-secondary btn-pill-sm" style={{ marginLeft: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const { pets, totals } = data;
  const activePet: DashboardPetSummary | undefined = pets.find((p) => p.id === selectedPetId) || pets[0];
  const criticalUpcoming = activePet?.upcoming_vaccinations.filter((v) => v.days_until_due <= 2) || [];
  const nextUpcoming = activePet?.upcoming_vaccinations?.[0];
  const overdueFirst = activePet?.overdue_vaccinations?.[0];
  const targetVaccine = overdueFirst || nextUpcoming;
  const isTargetOverdue = Boolean(overdueFirst);
  const isTargetCritical = !isTargetOverdue && Boolean(nextUpcoming && nextUpcoming.days_until_due <= 2);
  const formattedNextDate = targetVaccine
    ? new Date(targetVaccine.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const isCat = activePet?.species?.toLowerCase() === 'cat';
  const heroCardClass = isCat ? 'hero-pet-card-cat' : 'hero-pet-card-dog';
  const heroTagClass = isCat ? 'hero-pet-tag-cat' : 'hero-pet-tag-dog';
  const heroTextColor = isCat ? 'var(--cat-color-dark)' : 'var(--dog-color-dark)';

  return (
    <div>
      {/* Friendly Personalized Welcome Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', lineHeight: 1.2 }}>
            Hey {activePet ? activePet.name : 'friend'}! <br />
            <span style={{ color: 'var(--text-main)' }}>Let's check on your little paws</span> 🐾
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.4rem' }}>
            Vaccination schedules, medical records, and health reminders in one place.
          </p>
        </div>

        <Link to="/pets/new" className="btn-pill btn-pill-primary">
          <Plus size={18} />
          <span>Add New Pet</span>
        </Link>
      </div>

      {/* Pet Selection Categories Row (Inspired by "Categories: All, Cats, Dog, Birds" in the reference) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Your Pets</span>
          <Link to="/pets/new" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            + Add Another
          </Link>
        </div>

        <div className="category-pills-row">
          {pets.map((pet) => {
            const isSelected = activePet && activePet.id === pet.id;
            const isCat = pet.species?.toLowerCase() === 'cat';
            const activeClass = isSelected ? (isCat ? 'active-cat' : 'active-dog') : '';
            const catHoverClass = isCat ? 'pet-category-pill-cat' : '';
            return (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`pet-category-pill ${catHoverClass} ${activeClass}`}
              >
                <div className="pet-category-pill-avatar">
                  {pet.photo_url ? (
                    <img src={pet.photo_url} alt={pet.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span>{getSpeciesEmoji(pet.species)}</span>
                  )}
                </div>
                <span>{pet.name}</span>
                {pet.overdue_count > 0 && (
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'var(--status-overdue-bg)',
                      color: 'var(--status-overdue-text)',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    !
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overdue Urgent Alert Banner (if any) */}
      {totals.overdue_vaccinations > 0 && (
        <div className="paw-alert paw-alert-overdue">
          <ShieldAlert size={22} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.95rem' }}>
              Action Required: {totals.overdue_vaccinations} vaccination{totals.overdue_vaccinations > 1 ? 's are' : ' is'} overdue!
            </strong>
            <p style={{ fontSize: '0.825rem', marginTop: '0.15rem' }}>
              Keep immunizations up to date to protect your pet against preventable diseases.
            </p>
          </div>
          {activePet && activePet.overdue_count > 0 && (
            <Link to={`/pets/${activePet.id}/vaccinations`} className="btn-pill btn-pill-danger btn-pill-sm">
              Review
            </Link>
          )}
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
              ⚠️ URGENT NOTIFICATION: Only {criticalUpcoming[0].days_until_due === 0 ? 'today' : `${criticalUpcoming[0].days_until_due} day${criticalUpcoming[0].days_until_due === 1 ? '' : 's'}`} remaining until vaccination deadline!
            </strong>
            <p style={{ fontSize: '0.85rem', color: '#b91c1c', marginTop: '0.2rem', fontWeight: 600 }}>
              {criticalUpcoming.map((c) => c.vaccine_name).join(', ')} for {activePet?.name} is due within 2 days ({new Date(criticalUpcoming[0].due_date).toLocaleDateString()}). Please schedule your veterinary appointment immediately.
            </p>
          </div>
          {activePet && (
            <Link to={`/pets/${activePet.id}/vaccinations`} className="btn-pill btn-pill-danger btn-pill-sm">
              Schedule Now
            </Link>
          )}
        </div>
      )}

      {/* Pet Introduction Dual Section (Mobile-First): Left = Pet Intro, Right = Next Vaccination Date */}
      {activePet ? (
        <div className="home-pet-intro-grid">
          {/* Section 1 (Left): Pet Short Introduction */}
          <div className={`hero-pet-card ${heroCardClass}`} style={{ marginBottom: 0 }}>
            <div className="hero-pet-info">
              <div className={`hero-pet-tag ${heroTagClass}`}>
                <span>{getSpeciesEmoji(activePet.species)}</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {activePet.breed ? `${activePet.breed} • ${activePet.species}` : activePet.species}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    border: '3px solid #ffffff',
                    flexShrink: 0,
                  }}
                >
                  {activePet.photo_url ? (
                    <img
                      src={activePet.photo_url}
                      alt={activePet.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>{getSpeciesEmoji(activePet.species)}</span>
                  )}
                </div>

                <div>
                  <h2 className="hero-pet-title" style={{ fontSize: '1.85rem', marginBottom: '0.1rem' }}>{activePet.name}</h2>
                  <p style={{ color: heroTextColor, opacity: 0.9, fontSize: '0.875rem', fontWeight: 600 }}>
                    {activePet.overdue_count > 0
                      ? `⚠️ ${activePet.overdue_count} overdue vaccination`
                      : activePet.upcoming_count > 0
                      ? `📅 ${activePet.upcoming_count} upcoming vaccination`
                      : '✨ All immunizations up to date'}
                  </p>
                </div>
              </div>

              {/* 3 Metrics Chips */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, color: heroTextColor }}>
                  Gender: {activePet.gender ? activePet.gender : '—'}
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, color: heroTextColor }}>
                  Age: {activePet.estimated_age || (activePet.date_of_birth ? `${new Date(activePet.date_of_birth).getFullYear()}` : '—')}
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, color: heroTextColor }}>
                  Weight: {activePet.weight || '—'}
                </div>
              </div>

              {/* View Profile Button */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={() => navigate(`/pets/${activePet.id}`)}
                  className="btn-pill btn-pill-secondary btn-pill-sm"
                  style={{ background: '#ffffff', color: 'var(--text-main)', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                  <span>View Pet Profile</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2 (Right): Next Vaccination Date & Deadline */}
          <div className="home-next-vax-card">
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isTargetOverdue || isTargetCritical ? 'var(--status-overdue-bg)' : 'var(--mint-light)',
                      color: isTargetOverdue || isTargetCritical ? '#dc2626' : 'var(--mint-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Calendar size={18} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Next Vaccination
                  </span>
                </div>

                {isTargetOverdue ? (
                  <span className="status-pill status-overdue" style={{ fontSize: '0.725rem', fontWeight: 800 }}>
                    ⚠️ Overdue
                  </span>
                ) : isTargetCritical ? (
                  <span className="status-pill status-overdue" style={{ fontSize: '0.725rem', fontWeight: 800, color: '#dc2626' }}>
                    ⚠️ Due in {nextUpcoming?.days_until_due}d
                  </span>
                ) : targetVaccine ? (
                  <span className="status-pill status-upcoming" style={{ fontSize: '0.725rem' }}>
                    Upcoming
                  </span>
                ) : (
                  <span className="status-pill status-completed" style={{ fontSize: '0.725rem' }}>
                    Up to Date
                  </span>
                )}
              </div>

              {/* Vaccine Name & Prominent Date */}
              {targetVaccine ? (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {targetVaccine.vaccine_name}
                  </h3>

                  <div
                    style={{
                      fontSize: '1.9rem',
                      fontWeight: 800,
                      color: isTargetOverdue || isTargetCritical ? '#dc2626' : 'var(--text-main)',
                      letterSpacing: '-0.02em',
                      margin: '0.35rem 0',
                    }}
                  >
                    {formattedNextDate}
                  </div>

                  {/* Deadline Notification Text */}
                  {isTargetOverdue ? (
                    <p style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 800 }}>
                      ⚠️ Overdue by {(targetVaccine as any).days_overdue || 1} day{((targetVaccine as any).days_overdue || 1) > 1 ? 's' : ''}!
                    </p>
                  ) : isTargetCritical ? (
                    <p style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 800 }}>
                      ⚠️ Only {nextUpcoming?.days_until_due === 0 ? 'today' : `${nextUpcoming?.days_until_due} day${nextUpcoming?.days_until_due === 1 ? '' : 's'}`} remaining!
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      📅 Due in {nextUpcoming?.days_until_due} days
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    All Up to Date!
                  </h3>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-completed-text)', margin: '0.4rem 0' }}>
                    No Pending Vaccines ✨
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {activePet.name} is fully protected with current immunizations.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Button */}
            <button
              onClick={() => navigate(`/pets/${activePet.id}/vaccinations`)}
              className="btn-pill btn-pill-secondary btn-pill-sm"
              style={{ width: '100%', marginTop: '1.25rem' }}
            >
              <span>{targetVaccine ? 'Manage Vaccination Reminders' : 'Schedule Future Vaccine'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="paw-empty-state" style={{ marginBottom: '2rem' }}>
          <div className="paw-empty-emoji">🐾</div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem' }}>No Pets Registered Yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Add your dog, cat, or pet to start organizing their vaccination reminders and medical documents.
          </p>
          <Link to="/pets/new" className="btn-pill btn-pill-primary">
            <Plus size={18} />
            <span>Add Your First Pet</span>
          </Link>
        </div>
      )}

      {/* Quick Care Section - Arranged for Mobile App UX */}
      {activePet && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Quick Care
            </h2>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Healthcare Modules
            </span>
          </div>

          <div className="quick-care-mobile-grid">
            {/* Reminders Card */}
            <div
              className="quick-care-card"
              onClick={() => navigate(`/pets/${activePet.id}/vaccinations`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'var(--status-upcoming-bg)',
                    color: 'var(--mint-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bell size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Vaccination Reminders</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.15rem' }}>
                    Deadlines, status & booster alerts
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="status-pill status-upcoming" style={{ fontSize: '0.75rem' }}>
                  {activePet.upcoming_count} Scheduled
                </span>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Medical Vault Card */}
            <div
              className="quick-care-card"
              onClick={() => navigate(`/pets/${activePet.id}/reports`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'var(--bg-chip)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Medical Vault</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.15rem' }}>
                    Prescriptions, lab PDFs & camera scans
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="status-pill" style={{ background: 'var(--bg-chip)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Private Vault
                </span>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* History Card */}
            <div
              className="quick-care-card"
              onClick={() => navigate(`/pets/${activePet.id}/history`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'var(--status-completed-bg)',
                    color: 'var(--status-completed-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Vaccination History</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.15rem' }}>
                    Archived past records & administration dates
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="status-pill status-completed" style={{ fontSize: '0.75rem' }}>
                  Timeline
                </span>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
