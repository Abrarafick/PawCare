import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

interface ReadAloudButtonProps {
  text: string;
  label?: string;
  stopLabel?: string;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/**
 * Accessible voice readout toggle button using the Web Speech API.
 * Helps older adults or users with reading fatigue listen to summaries in one tap.
 */
export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  text,
  label = 'Read Aloud',
  stopLabel = 'Stop Reading',
  size = 'sm',
  style = {},
}) => {
  const { isSpeaking, speechSupported, speak, stopSpeaking } = useAccessibility();

  if (!speechSupported) {
    return null;
  }

  const handleToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`btn-pill ${isSpeaking ? 'btn-pill-primary' : 'btn-pill-secondary'} ${size === 'sm' ? 'btn-pill-sm' : ''}`}
      aria-pressed={isSpeaking}
      aria-label={isSpeaking ? stopLabel : label}
      style={style}
    >
      {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
      <span>{isSpeaking ? stopLabel : label}</span>
    </button>
  );
};
