import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type TextScale = 'standard' | 'large' | 'xlarge';

interface AccessibilityContextValue {
  grandmaMode: boolean;
  setGrandmaMode: (enabled: boolean) => void;
  toggleGrandmaMode: () => void;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  isSpeaking: boolean;
  speechSupported: boolean;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  GRANDMA_MODE: 'pawcare_grandma_mode',
  TEXT_SCALE: 'pawcare_text_scale',
  HIGH_CONTRAST: 'pawcare_high_contrast',
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [grandmaMode, setGrandmaModeState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.GRANDMA_MODE) === 'true';
  });

  const [textScale, setTextScaleState] = useState<TextScale>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEXT_SCALE) as TextScale | null;
    if (saved === 'standard' || saved === 'large' || saved === 'xlarge') {
      return saved;
    }
    return localStorage.getItem(STORAGE_KEYS.GRANDMA_MODE) === 'true' ? 'large' : 'standard';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST) === 'true';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  const speechSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined';

  const setGrandmaMode = useCallback((enabled: boolean) => {
    setGrandmaModeState(enabled);
    localStorage.setItem(STORAGE_KEYS.GRANDMA_MODE, String(enabled));
    // Automatically bump text size to 'large' when enabling Easy Mode if still standard
    if (enabled) {
      setTextScaleState((prev) => {
        const next = prev === 'standard' ? 'large' : prev;
        localStorage.setItem(STORAGE_KEYS.TEXT_SCALE, next);
        return next;
      });
      setHighContrastState(true);
      localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, 'true');
    } else {
      setTextScaleState('standard');
      localStorage.setItem(STORAGE_KEYS.TEXT_SCALE, 'standard');
      setHighContrastState(false);
      localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, 'false');
    }
  }, []);

  const toggleGrandmaMode = useCallback(() => {
    setGrandmaMode(!grandmaMode);
  }, [grandmaMode, setGrandmaMode]);

  const setTextScale = useCallback((scale: TextScale) => {
    setTextScaleState(scale);
    localStorage.setItem(STORAGE_KEYS.TEXT_SCALE, scale);
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, String(enabled));
  }, []);

  const stopSpeaking = useCallback(() => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [speechSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!speechSupported || !text.trim()) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      // Slightly slower, clearer speech rate for older adult comprehension
      utterance.rate = grandmaMode ? 0.9 : 0.96;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [speechSupported, grandmaMode]
  );

  // Apply root accessibility classes on html/body for global CSS scaling & contrast
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('text-scale-standard', 'text-scale-large', 'text-scale-xlarge');
    root.classList.add(`text-scale-${textScale}`);

    body.classList.toggle('grandma-mode', grandmaMode);
    body.classList.toggle('high-contrast', highContrast);
  }, [grandmaMode, textScale, highContrast]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  return (
    <AccessibilityContext.Provider
      value={{
        grandmaMode,
        setGrandmaMode,
        toggleGrandmaMode,
        textScale,
        setTextScale,
        highContrast,
        setHighContrast,
        isSpeaking,
        speechSupported,
        speak,
        stopSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextValue => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return ctx;
};
