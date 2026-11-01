import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Pet } from '../types';
import { petsApi } from '../api/pets';
import { useAuth } from './AuthContext';

interface PetContextType {
  pets: Pet[];
  selectedPetId: string | null;
  selectedPet: Pet | null;
  loading: boolean;
  setSelectedPetId: (id: string | null) => void;
  refreshPets: () => Promise<Pet[]>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

const STORAGE_KEY = 'pawcare_selected_pet_id';

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });
  const [loading, setLoading] = useState(false);

  const setSelectedPetId = useCallback((id: string | null) => {
    setSelectedPetIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const refreshPets = useCallback(async (): Promise<Pet[]> => {
    if (!isAuthenticated) {
      setPets([]);
      setSelectedPetId(null);
      return [];
    }

    try {
      setLoading(true);
      const list = await petsApi.list();
      setPets(list);

      // If no pet is selected or current selected pet no longer exists, select first pet
      if (list.length > 0) {
        const currentSaved = localStorage.getItem(STORAGE_KEY);
        const match = list.find((p) => p.id === currentSaved);
        if (match) {
          setSelectedPetIdState(match.id);
        } else {
          setSelectedPetId(list[0].id);
        }
      } else {
        setSelectedPetId(null);
      }
      return list;
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setSelectedPetId]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshPets();
    } else {
      setPets([]);
      setSelectedPetId(null);
    }
  }, [isAuthenticated, refreshPets]);

  const selectedPet = pets.find((p) => p.id === selectedPetId) || (pets.length > 0 ? pets[0] : null);

  return (
    <PetContext.Provider
      value={{
        pets,
        selectedPetId: selectedPet ? selectedPet.id : selectedPetId,
        selectedPet,
        loading,
        setSelectedPetId,
        refreshPets,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};

