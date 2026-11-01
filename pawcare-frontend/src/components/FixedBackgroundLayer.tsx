import React from 'react';
import { usePetTheme } from '../context/PetThemeContext';

/* =========================================================================
   Cohesive Pet-Themed Decorative SVG Elements
   Styled with matching stroke, fill, and smooth line-art aesthetic
   ========================================================================= */

// Cute Pet Paw Print
const PawIcon: React.FC<{ size?: number; opacity?: number; rotation?: number }> = ({
  size = 32,
  opacity = 0.35,
  rotation = 0,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="currentColor"
    style={{ opacity, transform: `rotate(${rotation}deg)` }}
  >
    <ellipse cx="11" cy="11" rx="4" ry="5.5" />
    <ellipse cx="20" cy="8" rx="4" ry="6" />
    <ellipse cx="29" cy="11" rx="4" ry="5.5" />
    <ellipse cx="34" cy="19" rx="3.5" ry="5" />
    <ellipse cx="6" cy="19" rx="3.5" ry="5" />
    <path d="M12 24c0-4 3.5-7 8-7s8 3 8 7c0 5-3.5 9-8 9s-8-4-8-9z" />
  </svg>
);

// Dog Bone
const BoneIcon: React.FC<{ size?: number; opacity?: number; rotation?: number }> = ({
  size = 36,
  opacity = 0.35,
  rotation = 0,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 30"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity, transform: `rotate(${rotation}deg)` }}
  >
    <path d="M14 11a5 5 0 1 0-8-5 5 5 0 0 0-1 7 5 5 0 0 0 1 7 5 5 0 1 0 8-5h22a5 5 0 1 0 8 5 5 5 0 0 0 1-7 5 5 0 0 0-1-7 5 5 0 1 0-8 5H14z" />
  </svg>
);

// Floating Heart
const HeartIcon: React.FC<{ size?: number; opacity?: number; rotation?: number }> = ({
  size = 28,
  opacity = 0.35,
  rotation = 0,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="currentColor"
    style={{ opacity, transform: `rotate(${rotation}deg)` }}
  >
    <path d="M16 28s-11-7.2-11-14a6.5 6.5 0 0 1 11-4.7A6.5 6.5 0 0 1 27 14c0 6.8-11 14-11 14z" />
  </svg>
);

// Pet Food Bowl
const FoodBowlIcon: React.FC<{ size?: number; opacity?: number; isCat?: boolean }> = ({
  size = 42,
  opacity = 0.35,
  isCat = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 35"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity }}
  >
    <path d="M6 16c3 12 10 16 19 16s16-4 19-16H6z" />
    <path d="M10 16c0-3 6.7-5 15-5s15 2 15 5" />
    {isCat ? (
      /* Little fish motif for cat bowl */
      <path d="M22 23c2-2 4-2 6 0-2 2-4 2-6 0m6 0l2-2m-2 2l2 2" strokeWidth="2" />
    ) : (
      /* Little bone motif for dog bowl */
      <path d="M21 23h8" strokeWidth="3" />
    )}
  </svg>
);

// Tennis Ball Toy (for dogs)
const BallToyIcon: React.FC<{ size?: number; opacity?: number }> = ({
  size = 32,
  opacity = 0.35,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ opacity }}
  >
    <circle cx="18" cy="18" r="14" />
    <path d="M8 8c6 5 6 15 0 20" />
    <path d="M28 8c-6 5-6 15 0 20" />
  </svg>
);

// Yarn Ball Toy with thread (for cats)
const YarnBallIcon: React.FC<{ size?: number; opacity?: number }> = ({
  size = 36,
  opacity = 0.35,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 44 44"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    style={{ opacity }}
  >
    <circle cx="20" cy="20" r="14" />
    <path d="M10 14c6 2 12 8 14 16" />
    <path d="M14 10c2 6 8 12 16 14" />
    <path d="M8 22c5-1 11-1 18 4" />
    <path d="M28 30c5 4 10 2 13 6" />
  </svg>
);

// Sparkle Star
const SparkleIcon: React.FC<{ size?: number; opacity?: number }> = ({
  size = 22,
  opacity = 0.35,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ opacity }}
  >
    <path d="M12 2l2.4 6.8L21 11.2l-6.6 2.4L12 20.4l-2.4-6.8L3 11.2l6.6-2.4z" />
  </svg>
);

// Fluffy Cloud Outline
const CloudIcon: React.FC<{ width?: number; height?: number; opacity?: number }> = ({
  width = 90,
  height = 42,
  opacity = 0.35,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 100 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    style={{ opacity }}
  >
    <path d="M18 38h64a13 13 0 0 0 0-26 18 18 0 0 0-33-6 13 13 0 0 0-24 6 12 12 0 0 0-7 26z" />
  </svg>
);

export const FixedBackgroundLayer: React.FC = () => {
  const { theme } = usePetTheme();

  return (
    <aside className="paw-fixed-background-container" aria-hidden="true">
      {/* =========================================================================
          1. DOG THEME BACKGROUND COMPOSITION
          Main Focal Point: Center owner petting dog, occupying 55-65% viewport height
          Periphery: Balanced decorative dog bones, paws, hearts, ball, bowl, clouds
          ========================================================================= */}
      <div className={`paw-bg-layer paw-bg-layer-dog ${theme === 'dog' ? 'active' : ''}`}>
        {/* Soft mint atmospheric sky gradient */}
        <div className="paw-bg-sky-gradient dog-sky" />

        {/* Ambient gentle sunlight glow */}
        <div className="dog-sun-glow" />

        {/* --- MAIN FOCAL POINT (Center Stage: Owner + Dog) --- */}
        <div className="paw-focal-center-stage">
          <div className="paw-focal-art-frame">
            <img
              src="/assets/backgrounds/dog-theme-art.png"
              alt=""
              className="paw-focal-illustration-img dog-art-img"
              loading="eager"
            />
          </div>
        </div>

        {/* --- SURROUNDING DECORATIVE COMPOSITION (Periphery Orbit) --- */}
        <div className="paw-decor-orbit dog-decor-theme">
          {/* Top Left: Paw trail & floating heart */}
          <div className="paw-decor-item decor-top-left-1">
            <PawIcon size={34} rotation={-15} opacity={0.38} />
          </div>
          <div className="paw-decor-item decor-top-left-2">
            <HeartIcon size={24} rotation={-10} opacity={0.32} />
          </div>

          {/* Top Right: Fluffy cloud & sparkles */}
          <div className="paw-decor-item decor-top-right-cloud">
            <CloudIcon width={100} height={46} opacity={0.42} />
          </div>
          <div className="paw-decor-item decor-top-right-sparkle">
            <SparkleIcon size={24} opacity={0.4} />
          </div>

          {/* Mid Left: Dog bone */}
          <div className="paw-decor-item decor-mid-left">
            <BoneIcon size={42} rotation={25} opacity={0.38} />
          </div>

          {/* Mid Right: Bouncing tennis ball toy */}
          <div className="paw-decor-item decor-mid-right">
            <BallToyIcon size={36} opacity={0.36} />
          </div>

          {/* Bottom Left: Dog food bowl & little bone */}
          <div className="paw-decor-item decor-bottom-left-bowl">
            <FoodBowlIcon size={44} isCat={false} opacity={0.36} />
          </div>
          <div className="paw-decor-item decor-bottom-left-paw">
            <PawIcon size={26} rotation={35} opacity={0.3} />
          </div>

          {/* Bottom Right: Bone & floating heart */}
          <div className="paw-decor-item decor-bottom-right-bone">
            <BoneIcon size={38} rotation={-30} opacity={0.38} />
          </div>
          <div className="paw-decor-item decor-bottom-right-heart">
            <HeartIcon size={22} rotation={15} opacity={0.34} />
          </div>
        </div>

        {/* Soft background scrim for 100% crisp foreground text & card contrast */}
        <div className="paw-bg-scrim dog-scrim" />
      </div>

      {/* =========================================================================
          2. CAT THEME BACKGROUND COMPOSITION
          Main Focal Point: Center owner petting cat, occupying 55-65% viewport height
          Periphery: Balanced decorative yarn, cat paws, hearts, fish bowl, clouds
          ========================================================================= */}
      <div className={`paw-bg-layer paw-bg-layer-cat ${theme === 'cat' ? 'active' : ''}`}>
        {/* Soft pastel golden-yellow atmospheric sky gradient */}
        <div className="paw-bg-sky-gradient cat-sky" />

        {/* Ambient warm sunshine glow */}
        <div className="cat-sun-glow" />

        {/* --- MAIN FOCAL POINT (Center Stage: Owner + Cat) --- */}
        <div className="paw-focal-center-stage">
          <div className="paw-focal-art-frame">
            <img
              src="/assets/backgrounds/cat-theme-art.png"
              alt=""
              className="paw-focal-illustration-img cat-art-img"
              loading="eager"
            />
          </div>
        </div>

        {/* --- SURROUNDING DECORATIVE COMPOSITION (Periphery Orbit) --- */}
        <div className="paw-decor-orbit cat-decor-theme">
          {/* Top Left: Cat paw trail & floating heart */}
          <div className="paw-decor-item decor-top-left-1">
            <PawIcon size={32} rotation={-20} opacity={0.38} />
          </div>
          <div className="paw-decor-item decor-top-left-2">
            <HeartIcon size={24} rotation={-12} opacity={0.34} />
          </div>

          {/* Top Right: Sunny fluffy cloud & sparkles */}
          <div className="paw-decor-item decor-top-right-cloud">
            <CloudIcon width={100} height={46} opacity={0.42} />
          </div>
          <div className="paw-decor-item decor-top-right-sparkle">
            <SparkleIcon size={24} opacity={0.42} />
          </div>

          {/* Mid Left: Cat food bowl with fish motif */}
          <div className="paw-decor-item decor-mid-left">
            <FoodBowlIcon size={44} isCat={true} opacity={0.38} />
          </div>

          {/* Mid Right: Yarn ball toy with winding thread */}
          <div className="paw-decor-item decor-mid-right">
            <YarnBallIcon size={42} opacity={0.38} />
          </div>

          {/* Bottom Left: Little playful cat paw */}
          <div className="paw-decor-item decor-bottom-left-bowl">
            <PawIcon size={30} rotation={20} opacity={0.34} />
          </div>
          <div className="paw-decor-item decor-bottom-left-paw">
            <HeartIcon size={20} rotation={-8} opacity={0.3} />
          </div>

          {/* Bottom Right: Floating heart & sparkle */}
          <div className="paw-decor-item decor-bottom-right-bone">
            <HeartIcon size={26} rotation={18} opacity={0.36} />
          </div>
          <div className="paw-decor-item decor-bottom-right-heart">
            <PawIcon size={24} rotation={-35} opacity={0.32} />
          </div>
        </div>

        {/* Soft background scrim for 100% crisp foreground text & card contrast */}
        <div className="paw-bg-scrim cat-scrim" />
      </div>

      {/* =========================================================================
          3. NEUTRAL / DEFAULT THEME BACKGROUND LAYER
          Clean off-white & subtle sage mint tint for other pets (birds, etc.) or no pet
          ========================================================================= */}
      <div className={`paw-bg-layer paw-bg-layer-neutral ${theme === 'neutral' ? 'active' : ''}`}>
        <div className="paw-bg-sky-gradient neutral-sky" />
        <div className="neutral-paw-pattern" />
      </div>
    </aside>
  );
};
