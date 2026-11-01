import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !passwordConfirm) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      const data = err.response?.data;
      if (data) {
        if (data.email) setError(Array.isArray(data.email) ? data.email[0] : data.email);
        else if (data.password) setError(Array.isArray(data.password) ? data.password[0] : data.password);
        else if (data.detail) setError(data.detail);
        else setError('Registration failed. Please check your information.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '2.5rem auto', padding: '0 1rem' }}>
      <div className="paw-card" style={{ padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              background: 'var(--mint)',
              borderRadius: '50% 50% 45% 55% / 55% 45% 55% 45%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--mint-dark)',
              fontSize: '2.2rem',
              marginBottom: '1rem',
              boxShadow: '0 8px 20px rgba(154, 217, 113, 0.4)',
            }}
          >
            🐾
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Join PawCare
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, marginTop: '0.35rem' }}>
            Start managing your pets' health & records in one safe place.
          </p>
        </div>

        {error && (
          <div className="paw-alert paw-alert-overdue" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="paw-input-group">
            <label className="paw-label" htmlFor="email">Email address *</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="paw-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Mail size={18} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-soft)' }} />
            </div>
          </div>

          <div className="paw-input-group">
            <label className="paw-label" htmlFor="firstName">Your Name (optional)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="firstName"
                type="text"
                className="paw-input"
                placeholder="e.g. Floyd Miles"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <User size={18} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-soft)' }} />
            </div>
          </div>

          <div className="paw-input-group">
            <label className="paw-label" htmlFor="password">Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="paw-input"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <Lock size={18} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-soft)' }} />
            </div>
          </div>

          <div className="paw-input-group">
            <label className="paw-label" htmlFor="passwordConfirm">Confirm Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                id="passwordConfirm"
                type="password"
                className="paw-input"
                placeholder="Repeat password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
              <Lock size={18} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-soft)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-pill btn-pill-primary"
            style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--mint-dark)', fontWeight: 800 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
