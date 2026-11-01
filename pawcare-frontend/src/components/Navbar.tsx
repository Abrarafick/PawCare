import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="paw-navbar">
      <div className="paw-navbar-inner">
        <Link to="/" className="brand-badge">
          <div className="brand-icon-bubble">
            <HeartPulse size={22} />
          </div>
          <span className="brand-title">PawCare</span>
        </Link>

        <div className="paw-navbar-actions">
          {isAuthenticated && user ? (
            <>
              <div className="paw-user-badge">
                <div className="paw-user-avatar">
                  <UserIcon size={14} />
                </div>
                <span className="paw-user-email">{user.email.split('@')[0]}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-circle"
                title="Log out of PawCare"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn-pill btn-pill-secondary btn-pill-sm">
                Log In
              </Link>
              <Link to="/register" className="btn-pill btn-pill-primary btn-pill-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
