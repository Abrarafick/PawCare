import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { HelpGuideModal } from './HelpGuideModal';
import { HeartPulse, LogOut, User as UserIcon, Glasses, HelpCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { grandmaMode, toggleGrandmaMode } = useAccessibility();
  const [helpOpen, setHelpOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="paw-navbar">
        <div className="paw-navbar-inner">
          <Link to="/" className="brand-badge">
            <div className="brand-icon-bubble">
              <HeartPulse size={22} />
            </div>
            <span className="brand-title">PawCare</span>
          </Link>

          <div className="paw-navbar-actions">
            {/* Always-Visible Grandma-Proof Easy Mode Toggle & Plain Help Button */}
            <button
              type="button"
              onClick={toggleGrandmaMode}
              className={`btn-pill btn-pill-sm navbar-easy-btn ${grandmaMode ? 'btn-pill-primary' : 'btn-pill-secondary'}`}
              aria-pressed={grandmaMode}
              title="Toggle Easy Mode (Larger Text, Clear Labels & High Contrast)"
            >
              <Glasses size={17} />
              <span className="hide-xs-text">Easy Mode{grandmaMode ? ': ON' : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="btn-pill btn-pill-secondary btn-pill-sm navbar-help-btn"
              title="Open Easy Step-by-Step Guide"
              aria-label="Help Guide"
            >
              <HelpCircle size={17} />
              <span className="hide-xs-text">Help</span>
            </button>

            {isAuthenticated && user ? (
              <>
                <div className="paw-user-badge hide-sm-badge">
                  <div className="paw-user-avatar">
                    <UserIcon size={14} />
                  </div>
                  <span className="paw-user-email">{user.email.split('@')[0]}</span>
                </div>

                {grandmaMode ? (
                  <button
                    onClick={handleLogout}
                    className="btn-pill btn-pill-danger btn-pill-sm"
                    title="Log out of PawCare"
                    aria-label="Log out"
                  >
                    <LogOut size={17} />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="btn-circle"
                    title="Log out of PawCare"
                    aria-label="Log out"
                  >
                    <LogOut size={18} />
                  </button>
                )}
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

      <HelpGuideModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};
