import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

const photoBlobCache = new Map<string, string>();
const listeners = new Map<string, Set<() => void>>();

/**
 * Call after uploading or deleting a pet photo so all avatars refresh immediately.
 */
export function invalidatePetPhotoCache(petId: string): void {
  const existing = photoBlobCache.get(petId);
  if (existing) {
    URL.revokeObjectURL(existing);
    photoBlobCache.delete(petId);
  }
  const subs = listeners.get(petId);
  if (subs) {
    subs.forEach((cb) => cb());
  }
}

interface AuthenticatedPetPhotoProps {
  petId: string;
  hasPhoto: boolean;
  petName: string;
  species: string;
  emojiFontSize?: string;
  style?: React.CSSProperties;
}

const getSpeciesEmoji = (species: string) => {
  switch (species.toLowerCase()) {
    case 'cat':
      return '🐱';
    case 'dog':
      return '🐶';
    case 'bird':
      return '🦜';
    case 'rabbit':
      return '🐰';
    default:
      return '🐾';
  }
};

/**
 * Renders a private pet photo via authenticated axios blob fetch (Bearer JWT),
 * preventing 401 broken images on private /api/pets/:id/photo/ endpoints.
 */
export const AuthenticatedPetPhoto: React.FC<AuthenticatedPetPhotoProps> = ({
  petId,
  hasPhoto,
  petName,
  species,
  emojiFontSize = '1.75rem',
  style = {},
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(() =>
    hasPhoto ? photoBlobCache.get(petId) || null : null
  );
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!listeners.has(petId)) {
      listeners.set(petId, new Set());
    }
    const trigger = () => setVersion((v) => v + 1);
    listeners.get(petId)!.add(trigger);
    return () => {
      listeners.get(petId)?.delete(trigger);
    };
  }, [petId]);

  useEffect(() => {
    let active = true;
    if (!hasPhoto) {
      setBlobUrl(null);
      return;
    }

    const cached = photoBlobCache.get(petId);
    if (cached) {
      setBlobUrl(cached);
      return;
    }

    apiClient
      .get(`/pets/${petId}/photo/serve/`, { responseType: 'blob' })
      .then((res) => {
        if (!active) return;
        const url = URL.createObjectURL(res.data);
        photoBlobCache.set(petId, url);
        setBlobUrl(url);
      })
      .catch(() => {
        if (active) setBlobUrl(null);
      });

    return () => {
      active = false;
    };
  }, [petId, hasPhoto, version]);

  if (hasPhoto && blobUrl) {
    return (
      <img
        src={blobUrl}
        alt={petName}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
          ...style,
        }}
      />
    );
  }

  return <span style={{ fontSize: emojiFontSize, lineHeight: 1 }}>{getSpeciesEmoji(species)}</span>;
};
