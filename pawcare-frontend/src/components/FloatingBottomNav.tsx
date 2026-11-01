import React from 'react';
import { Home, PawPrint, HeartPulse, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigationDirection } from './NavigationDirectionController';

interface FloatingBottomNavProps {
  onTabChange?: (targetIndex: number, currentIndex: number) => void;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({ onTabChange }) => {
  const { isAuthenticated } = useAuth();
  const { currentIndex, navigateToTab } = useNavigationDirection();

  // If user is not authenticated, do not render bottom dock
  if (!isAuthenticated) {
    return null;
  }

  const handleNavClick = (targetIndex: number) => {
    if (onTabChange && targetIndex !== currentIndex) {
      onTabChange(targetIndex, currentIndex);
    }
    navigateToTab(targetIndex);
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      index: 0,
    },
    {
      id: 'pets',
      label: 'Pets',
      icon: PawPrint,
      index: 1,
    },
    {
      id: 'health',
      label: 'Health',
      icon: HeartPulse,
      index: 2,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      index: 3,
    },
  ];

  return (
    <nav className="paw-floating-bottom-nav" aria-label="Bottom Navigation">
      <div className="bottom-nav-track">
        {/* Physical Sliding Indicator (Synchronized with 380ms page transition) */}
        <div
          className="bottom-nav-slider-wrapper"
          style={{
            transform: `translateX(${currentIndex * 100}%)`,
          }}
          aria-hidden="true"
        >
          <div className="bottom-nav-slider-bubble" />
        </div>

        {/* 4 Navigation Buttons */}
        {navItems.map((item) => {
          const isActive = currentIndex === item.index;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className="bottom-nav-slot-btn"
              onClick={() => handleNavClick(item.index)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Soft Light-Grey Inactive Circular Background */}
              <div className="bottom-nav-slot-bg" aria-hidden="true" />

              {/* Centered Icon with synchronized scale & color transition */}
              <div className={`bottom-nav-slot-icon ${isActive ? 'active' : 'inactive'}`}>
                <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
