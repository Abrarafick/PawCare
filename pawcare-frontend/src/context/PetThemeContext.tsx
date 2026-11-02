import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { usePet } from './PetContext';
import type { Pet, Species } from '../types';

export type PetThemeType = 'dog' | 'cat' | 'neutral';

interface PetThemeContextValue {
  theme: PetThemeType;
  species: Species | null;
  selectedPet: Pet | null;
  isDog: boolean;
  isCat: boolean;
  themeColor: string;
  themeColorDark: string;
  themeGlow: string;
}

const PetThemeContext = createContext<PetThemeContextValue | undefined>(undefined);

export const PetThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedPet } = usePet();

  const themeValue = useMemo<PetThemeContextValue>(() => {
    if (!selectedPet) {
      return {
        theme: 'neutral',
        species: null,
        selectedPet: null,
        isDog: false,
        isCat: false,
        themeColor: 'var(--mint)',
        themeColorDark: 'var(--mint-dark)',
        themeGlow: 'var(--dog-glow)',
      };
    }

    const speciesLower = (selectedPet.species || '').toLowerCase();
    let theme: PetThemeType = 'neutral';
    if (speciesLower === 'dog') {
      theme = 'dog';
    } else if (speciesLower === 'cat') {
      theme = 'cat';
    }

    const isDog = theme === 'dog';
    const isCat = theme === 'cat';

    return {
      theme,
      species: selectedPet.species,
      selectedPet,
      isDog,
      isCat,
      themeColor: isCat ? 'var(--cat-color)' : 'var(--dog-color)',
      themeColorDark: isCat ? 'var(--cat-color-dark)' : 'var(--dog-color-dark)',
      themeGlow: isCat ? 'var(--cat-glow)' : 'var(--dog-glow)',
    };
  }, [selectedPet]);

  useEffect(() => {
    document.body.classList.remove('theme-dog', 'theme-cat', 'theme-neutral');
    document.body.classList.add(`theme-${themeValue.theme}`);
  }, [themeValue.theme]);

  return (
    <PetThemeContext.Provider value={themeValue}>
      {children}
    </PetThemeContext.Provider>
  );
};

export const usePetTheme = (): PetThemeContextValue => {
  const context = useContext(PetThemeContext);
  if (!context) {
    throw new Error('usePetTheme must be used within a PetThemeProvider');
  }
  return context;
};
