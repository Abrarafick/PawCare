import React from 'react';
import { usePetTheme } from '../context/PetThemeContext';
import { UploadedDogIcon, UploadedCatIcon } from './PetIconComponents';

/* =========================================================================
   Supporting Decorative Accent Vectors (Subtle secondary charms)
   ========================================================================= */

const PawIcon: React.FC<{ size?: number; rotation?: number; opacity?: number }> = ({
  size = 28,
  rotation = 0,
  opacity = 0.3,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="currentColor"
    style={{ opacity, transform: `rotate(${rotation}deg)` }}
  >
    <ellipse cx="20" cy="27" rx="10" ry="7.5" />
    <circle cx="10" cy="15" r="4.2" />
    <circle cx="16.5" cy="10.5" r="4.2" />
    <circle cx="23.5" cy="10.5" r="4.2" />
    <circle cx="30" cy="15" r="4.2" />
  </svg>
);

const BoneIcon: React.FC<{ size?: number; rotation?: number; opacity?: number }> = ({
  size = 32,
  rotation = 0,
  opacity = 0.3,
}) => (
  <svg
    width={size}
    height={size * 0.55}
    viewBox="0 0 50 28"
    fill="currentColor"
    style={{ opacity, transform: `rotate(${rotation}deg)` }}
  >
    <path d="M12 7 C12 3.5 8 1 5 3 C2 5 2 10 5 12 C2 14 2 19 5 21 C8 23 12 20.5 12 17 L38 17 C38 20.5 42 23 45 21 C48 19 48 14 45 12 C48 10 48 5 45 3 C42 1 38 3.5 38 7 Z" />
  </svg>
);

const YarnBallIcon: React.FC<{ size?: number; opacity?: number }> = ({
  size = 32,
  opacity = 0.3,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ opacity }}
  >
    <circle cx="20" cy="20" r="16" fill="currentColor" fillOpacity="0.08" />
    <path d="M7 14 C12 20 28 20 33 14" />
    <path d="M10 26 C16 20 24 20 30 26" />
    <path d="M14 7 C20 12 20 28 14 33" />
    <path d="M26 10 C20 16 20 24 26 30" />
    <path d="M30 30 Q36 34 38 38" />
  </svg>
);

const HeartIcon: React.FC<{ size?: number; rotation?: number; opacity?: number }> = ({
  size = 22,
  rotation = 0,
  opacity = 0.3,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="currentColor"
    style={{ opacity, transform: `rotate(${rotation}deg)` }}
  >
    <path d="M16 28 C15 27 4 19 4 11 C4 6 8 3 12.5 3 C14.5 3 15.5 4 16 5 C16.5 4 17.5 3 19.5 3 C24 3 28 6 28 11 C28 19 17 27 16 28 Z" />
  </svg>
);

const SparkleIcon: React.FC<{ size?: number; opacity?: number }> = ({
  size = 20,
  opacity = 0.32,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="currentColor"
    style={{ opacity }}
  >
    <path d="M16 2 Q16 16 2 16 Q16 16 16 30 Q16 16 30 16 Q16 16 16 2 Z" />
  </svg>
);

/* =========================================================================
   Randomized, Non-Serial Placement Configurations
   Asymmetrical coordinates, varied scales, and subtle organic rotations
   so the background looks playful and moves naturally during page transitions.
   ========================================================================= */

interface RandomDecorItem {
  id: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  rotation: number;
  opacity: number;
  floatDelay: string;
  floatDuration: string;
  hideOnMobile?: boolean;
}

const DOG_RANDOM_NODES: RandomDecorItem[] = [
  // Top left corner peeking (large anchor)
  { id: 'd-tl', top: '2.2%', left: '1.2%', size: 116, rotation: -16, opacity: 0.38, floatDelay: '0s', floatDuration: '6.8s' },
  // Upper right floating
  { id: 'd-ur', top: '6.5%', right: '3.5%', size: 88, rotation: 14, opacity: 0.32, floatDelay: '1.4s', floatDuration: '7.2s' },
  // Upper center subtle floating face (non-intrusive)
  { id: 'd-uc', top: '14.2%', left: '38%', size: 52, rotation: -8, opacity: 0.24, floatDelay: '2.5s', floatDuration: '6.0s', hideOnMobile: true },
  // Mid upper right flank
  { id: 'd-mur', top: '23.8%', right: '17%', size: 68, rotation: 20, opacity: 0.27, floatDelay: '0.7s', floatDuration: '6.6s' },
  // Mid left flank (large lively accent)
  { id: 'd-ml', top: '34.5%', left: '0.6%', size: 122, rotation: -22, opacity: 0.40, floatDelay: '1.9s', floatDuration: '7.4s' },
  // Mid right flank
  { id: 'd-mr', top: '44.8%', right: '1.8%', size: 98, rotation: 16, opacity: 0.34, floatDelay: '3.2s', floatDuration: '6.3s' },
  // Mid center-left floating subtle
  { id: 'd-mcl', top: '54.2%', left: '13%', size: 58, rotation: -11, opacity: 0.25, floatDelay: '1.1s', floatDuration: '7.0s', hideOnMobile: true },
  // Lower center-right floating
  { id: 'd-lcr', top: '64.5%', right: '15%', size: 72, rotation: 22, opacity: 0.29, floatDelay: '2.3s', floatDuration: '6.5s' },
  // Lower left edge
  { id: 'd-ll', top: '74.8%', left: '2.2%', size: 104, rotation: -14, opacity: 0.38, floatDelay: '1.6s', floatDuration: '7.1s' },
  // Bottom right corner (large anchor)
  { id: 'd-br', bottom: '4.5%', right: '3.8%', size: 118, rotation: 11, opacity: 0.42, floatDelay: '0.5s', floatDuration: '6.7s' },
  // Bottom center-left peeking
  { id: 'd-bcl', bottom: '6.8%', left: '31%', size: 60, rotation: -18, opacity: 0.26, floatDelay: '2.9s', floatDuration: '7.5s', hideOnMobile: true },
];

const CAT_RANDOM_NODES: RandomDecorItem[] = [
  // Top right corner peeking (large anchor)
  { id: 'c-tr', top: '2.0%', right: '1.8%', size: 120, rotation: 18, opacity: 0.40, floatDelay: '0.8s', floatDuration: '7.0s' },
  // Upper left floating
  { id: 'c-ul', top: '8.2%', left: '3.6%', size: 84, rotation: -14, opacity: 0.32, floatDelay: '2.2s', floatDuration: '6.4s' },
  // Upper center-right subtle floating face (non-intrusive)
  { id: 'c-ucr', top: '15.8%', right: '33%', size: 54, rotation: 9, opacity: 0.24, floatDelay: '0.3s', floatDuration: '7.5s', hideOnMobile: true },
  // Mid upper left flank
  { id: 'c-mul', top: '26.4%', left: '15%', size: 66, rotation: -18, opacity: 0.27, floatDelay: '1.5s', floatDuration: '6.8s' },
  // Mid right flank (large lively accent)
  { id: 'c-mr', top: '36.8%', right: '0.8%', size: 124, rotation: 15, opacity: 0.42, floatDelay: '2.8s', floatDuration: '7.3s' },
  // Mid left flank
  { id: 'c-ml', top: '47.2%', left: '1.2%', size: 96, rotation: -20, opacity: 0.35, floatDelay: '0.6s', floatDuration: '6.2s' },
  // Mid center-right floating subtle
  { id: 'c-mcr', top: '56.5%', right: '14%', size: 60, rotation: 12, opacity: 0.25, floatDelay: '2.0s', floatDuration: '6.9s', hideOnMobile: true },
  // Lower center-left floating
  { id: 'c-lcl', top: '66.4%', left: '17%', size: 74, rotation: -12, opacity: 0.29, floatDelay: '3.4s', floatDuration: '6.6s' },
  // Lower right edge
  { id: 'c-lr', top: '76.0%', right: '3.2%', size: 106, rotation: 16, opacity: 0.38, floatDelay: '1.2s', floatDuration: '7.2s' },
  // Bottom left corner (large anchor)
  { id: 'c-bl', bottom: '4.0%', left: '2.8%', size: 120, rotation: -15, opacity: 0.44, floatDelay: '0.4s', floatDuration: '7.0s' },
  // Bottom center-right peeking
  { id: 'c-bcr', bottom: '6.2%', right: '29%', size: 58, rotation: 10, opacity: 0.26, floatDelay: '2.6s', floatDuration: '7.6s', hideOnMobile: true },
];

/* =========================================================================
   Fixed Stationary Background Layer
   - Left side icon used strictly for Cat theme
   - Right side icon used strictly for Dog theme
   - Dynamic theme color tinting (currentColor)
   - Scattered randomly across viewport without rigid grid lines
   ========================================================================= */

export const FixedBackgroundLayer: React.FC = () => {
  const { theme } = usePetTheme();

  return (
    <aside className="paw-fixed-background-container" aria-hidden="true">
      {/* =========================================================================
          1. DOG THEME BACKGROUND — SCATTERED UPLOADED DOG HEAD ICONS
          ========================================================================= */}
      <div className={`paw-bg-layer paw-bg-layer-dog ${theme === 'dog' ? 'active' : ''}`}>
        {/* Soft mint atmospheric sky gradient */}
        <div className="paw-bg-sky-gradient dog-sky" />

        {/* Ambient gentle sunlight glow */}
        <div className="dog-sun-glow" />

        {/* Dog Icons Random Floating Constellation */}
        <div className="paw-faces-stage dog-decor-theme">
          {DOG_RANDOM_NODES.map((node) => (
            <div
              key={node.id}
              className={`paw-random-icon-node ${node.hideOnMobile ? 'hide-on-mobile' : ''}`}
              style={{
                top: node.top,
                bottom: node.bottom,
                left: node.left,
                right: node.right,
                animationDelay: node.floatDelay,
                animationDuration: node.floatDuration,
              }}
            >
              <UploadedDogIcon
                size={node.size}
                opacity={node.opacity}
                rotation={node.rotation}
              />
            </div>
          ))}

          {/* Organic Scattered Secondary Accents (Bones, Paws, Hearts, Sparkles) */}
          <div className="paw-decor-node" style={{ top: '10.5%', left: '16.5%' }}>
            <PawIcon size={28} rotation={-18} opacity={0.32} />
          </div>
          <div className="paw-decor-node" style={{ top: '7.8%', right: '16.2%' }}>
            <BoneIcon size={36} rotation={24} opacity={0.30} />
          </div>
          <div className="paw-decor-node" style={{ top: '28.5%', left: '9.2%' }}>
            <HeartIcon size={24} rotation={-12} opacity={0.28} />
          </div>
          <div className="paw-decor-node" style={{ top: '24.2%', right: '9.5%' }}>
            <SparkleIcon size={22} opacity={0.32} />
          </div>
          <div className="paw-decor-node" style={{ bottom: '26.8%', right: '10.8%' }}>
            <PawIcon size={26} rotation={25} opacity={0.28} />
          </div>
          <div className="paw-decor-node" style={{ bottom: '18.2%', left: '14.5%' }}>
            <BoneIcon size={32} rotation={-30} opacity={0.28} />
          </div>
          <div className="paw-decor-node" style={{ bottom: '13.5%', right: '17.2%' }}>
            <HeartIcon size={22} rotation={15} opacity={0.26} />
          </div>
          <div className="paw-decor-node" style={{ bottom: '21.5%', right: '28.5%' }}>
            <SparkleIcon size={20} opacity={0.30} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CAT THEME BACKGROUND — SCATTERED UPLOADED CAT HEAD ICONS
          ========================================================================= */}
      <div className={`paw-bg-layer paw-bg-layer-cat ${theme === 'cat' ? 'active' : ''}`}>
        {/* Soft pastel golden-yellow atmospheric sky gradient */}
        <div className="paw-bg-sky-gradient cat-sky" />

        {/* Ambient warm sunshine glow */}
        <div className="cat-sun-glow" />

        {/* Cat Icons Random Floating Constellation */}
        <div className="paw-faces-stage cat-decor-theme">
          {CAT_RANDOM_NODES.map((node) => (
            <div
              key={node.id}
              className={`paw-random-icon-node ${node.hideOnMobile ? 'hide-on-mobile' : ''}`}
              style={{
                top: node.top,
                bottom: node.bottom,
                left: node.left,
                right: node.right,
                animationDelay: node.floatDelay,
                animationDuration: node.floatDuration,
              }}
            >
              <UploadedCatIcon
                size={node.size}
                opacity={node.opacity}
                rotation={node.rotation}
              />
            </div>
          ))}

          {/* Organic Scattered Secondary Accents (Yarn, Paws, Hearts, Sparkles) */}
          <div className="paw-decor-node" style={{ top: '9.2%', right: '16.5%' }}>
            <PawIcon size={28} rotation={-22} opacity={0.32} />
          </div>
          <div className="paw-decor-node" style={{ top: '8.4%', left: '17.2%' }}>
            <YarnBallIcon size={36} opacity={0.30} />
          </div>
          <div className="paw-decor-node" style={{ top: '27.5%', right: '10.2%' }}>
            <HeartIcon size={24} rotation={14} opacity={0.28} />
          </div>
          <div className="paw-decor-node" style={{ top: '25.8%', left: '8.5%' }}>
            <SparkleIcon size={22} opacity={0.32} />
          </div>
          <div className="paw-decor-node" style={{ bottom: '27.4%', left: '11.2%' }}>
            <PawIcon size={26} rotation={-25} opacity={0.28} />
          </div>
          <div className="paw-decor-node" style={{ bottom: '17.8%', right: '13.8%' }}>
            <YarnBallIcon size={30} opacity={0.28} />
          </div>
          <div className="paw-decor-node" style={{ bottom: '14.2%', left: '16.5%' }}>
            <HeartIcon size={22} rotation={-16} opacity={0.26} />
          </div>
          <div className="paw-decor-node" style={{ bottom: '20.8%', left: '27.8%' }}>
            <SparkleIcon size={20} opacity={0.30} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. NEUTRAL / DEFAULT THEME BACKGROUND LAYER
          ========================================================================= */}
      <div className={`paw-bg-layer paw-bg-layer-neutral ${theme === 'neutral' ? 'active' : ''}`}>
        <div className="paw-bg-sky-gradient neutral-sky" />
        <div className="neutral-paw-pattern" />
      </div>
    </aside>
  );
};
