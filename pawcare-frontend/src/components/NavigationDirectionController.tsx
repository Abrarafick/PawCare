import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePet } from '../context/PetContext';

export type SlideDirection = 'forward' | 'backward' | 'same';

interface NavigationDirectionContextValue {
  currentIndex: number;
  prevIndex: number;
  direction: SlideDirection;
  currentPath: string;
  navigateToTab: (targetIndex: number) => void;
  navigateAdjacent: (delta: -1 | 1) => void;
}

const NavigationDirectionContext = createContext<NavigationDirectionContextValue>({
  currentIndex: 0,
  prevIndex: 0,
  direction: 'same',
  currentPath: '/',
  navigateToTab: () => {},
  navigateAdjacent: () => {},
});

export const getNavIndexFromPath = (path: string): number => {
  if (path === '/' || path === '/dashboard') return 0;
  if (
    path.includes('/vaccinations') ||
    path.includes('/history') ||
    path.includes('/reports') ||
    path === '/health'
  ) {
    return 2;
  }
  if (path.startsWith('/pets')) return 1;
  if (path === '/profile') return 3;
  return 0;
};

export const getNavPathForIndex = (index: number, petId: string | null): string => {
  switch (index) {
    case 0:
      return '/';
    case 1:
      return '/pets';
    case 2:
      return petId ? `/pets/${petId}/vaccinations` : '/health';
    case 3:
      return '/profile';
    default:
      return '/';
  }
};

export const NavigationDirectionController: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPetId } = usePet();

  const currentPath = location.pathname;
  const currentNavIndex = getNavIndexFromPath(currentPath);

  const prevIndexRef = useRef<number>(currentNavIndex);
  const [direction, setDirection] = useState<SlideDirection>('same');
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const prev = prevIndexRef.current;
    if (currentNavIndex > prev) {
      setDirection('forward');
    } else if (currentNavIndex < prev) {
      setDirection('backward');
    } else {
      setDirection('same');
    }
    prevIndexRef.current = currentNavIndex;
  }, [currentNavIndex, currentPath]);

  const navigateToTab = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex > 3) return;
      if (targetIndex === currentNavIndex) return;
      if (isNavigatingRef.current) return;

      // Lock rapid navigation triggers to synchronize with the 380ms transition duration
      isNavigatingRef.current = true;
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 400);

      const dest = getNavPathForIndex(targetIndex, selectedPetId);
      navigate(dest);
    },
    [currentNavIndex, selectedPetId, navigate]
  );

  const navigateAdjacent = useCallback(
    (delta: -1 | 1) => {
      const nextIndex = currentNavIndex + delta;
      if (nextIndex >= 0 && nextIndex <= 3) {
        navigateToTab(nextIndex);
      }
    },
    [currentNavIndex, navigateToTab]
  );

  return (
    <NavigationDirectionContext.Provider
      value={{
        currentIndex: currentNavIndex,
        prevIndex: prevIndexRef.current,
        direction,
        currentPath,
        navigateToTab,
        navigateAdjacent,
      }}
    >
      {children}
    </NavigationDirectionContext.Provider>
  );
};

export const useNavigationDirection = () => useContext(NavigationDirectionContext);
