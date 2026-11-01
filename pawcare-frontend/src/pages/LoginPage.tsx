import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('demo@pawcare.com');
  const [password, setPassword] = useState('PawCare123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2.5rem auto', padding: '0 1rem' }}>
      <div className="paw-card" style={{ padding: '2.25rem' }}>
        {/* Cute Mascot Bubble inspired by reference */}
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
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', lineHeight: 1.2 }}>
            Welcome to <br />PawCare
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, marginTop: '0.35rem' }}>
            Your Pet's Health, All in One Place.
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
            <label className="paw-label" htmlFor="email">Email address</label>
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
            <label className="paw-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="paw-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <Lock size={18} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-soft)' }} />
            </div>
          </div>

          {/* Demo account hint chip */}
          <div
            style={{
              background: 'var(--mint-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              color: 'var(--mint-dark)',
              marginBottom: '1.5rem',
            }}
          >
            <strong>Demo Account Ready:</strong>
            <div style={{ marginTop: '0.2rem', color: 'var(--text-muted)' }}>
              Email: <code>demo@pawcare.com</code> • Password: <code>PawCare123!</code>
            </div>
          </div>

          <button
            type="submit"
            className="btn-pill btn-pill-primary"
            style={{ width: '100%', padding: '0.9rem' }}
            disabled={loading}
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--mint-dark)', fontWeight: 800 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
