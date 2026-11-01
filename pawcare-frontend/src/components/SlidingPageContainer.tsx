import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationDirection } from './NavigationDirectionController';

interface SlidingPageContainerProps {
  children: React.ReactNode;
}

export const SlidingPageContainer: React.FC<SlidingPageContainerProps> = ({ children }) => {
  const location = useLocation();
  const { direction, navigateAdjacent } = useNavigationDirection();

  // Touch Gesture Tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number; isValid: boolean } | null>(null);
  const mouseStartRef = useRef<{ x: number; y: number; time: number; isValid: boolean } | null>(null);

  const isInteractiveElement = (target: HTMLElement | null): boolean => {
    if (!target) return false;
    return Boolean(
      target.closest(
        'input, textarea, select, button, a, [role="button"], [role="dialog"], .category-pills-row, .sub-nav-tabs, .btn-circle, .btn-pill, .paw-modal-card'
      )
    );
  };

  /* Touch Handlers (Mobile Phone & Tablet Swiping) */
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const target = e.target as HTMLElement | null;

    if (isInteractiveElement(target)) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now(), isValid: false };
      return;
    }

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      isValid: true,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !touchStartRef.current.isValid) {
      touchStartRef.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Conditions: under 600ms, at least 50px horizontal motion, horizontally dominant by 1.5x
    if (
      deltaTime < 600 &&
      Math.abs(deltaX) >= 50 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.5
    ) {
      if (deltaX < 0) {
        // Swiping LEFT -> Navigate to Next Tab (e.g. Home -> Pets)
        navigateAdjacent(1);
      } else {
        // Swiping RIGHT -> Navigate to Previous Tab (e.g. Health -> Pets)
        navigateAdjacent(-1);
      }
    }
  };

  /* Mouse Drag Handlers (Desktop Testing & Trackpads) */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left mouse button only
    const target = e.target as HTMLElement | null;
    if (isInteractiveElement(target)) {
      mouseStartRef.current = null;
      return;
    }

    mouseStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      isValid: true,
    };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseStartRef.current || !mouseStartRef.current.isValid) {
      mouseStartRef.current = null;
      return;
    }

    const deltaX = e.clientX - mouseStartRef.current.x;
    const deltaY = e.clientY - mouseStartRef.current.y;
    const deltaTime = Date.now() - mouseStartRef.current.time;
    mouseStartRef.current = null;

    if (
      deltaTime < 600 &&
      Math.abs(deltaX) >= 65 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.5
    ) {
      if (deltaX < 0) {
        navigateAdjacent(1);
      } else {
        navigateAdjacent(-1);
      }
    }
  };

  let animationClass = 'paw-page-fade';
  if (direction === 'forward') {
    // Current page content slides LEFT, incoming enters from RIGHT
    animationClass = 'paw-slide-content-left';
  } else if (direction === 'backward') {
    // Current page content slides RIGHT, incoming enters from LEFT
    animationClass = 'paw-slide-content-right';
  }

  return (
    <div
      className="paw-sliding-viewport-wrapper"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div key={location.pathname} className={`paw-sliding-page-panel ${animationClass}`}>
        {children}
      </div>
    </div>
  );
};
