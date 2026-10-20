import React, { useState } from 'react';
import { soundEngine } from '../utils/audio.ts';

interface DivineBowProps {
  state: 'idle' | 'aiming' | 'shooting' | 'hit' | 'burning' | 'consumed';
  arrowProgress: number; // 0 (at bow) to 100 (at target)
  flightDistance?: number; // pixel distance to travel
  isVertical?: boolean; // Mobile view: arrow travels vertically UP
  onBowClick?: () => void;
}

export const DivineBow: React.FC<DivineBowProps> = ({
  state,
  arrowProgress,
  flightDistance = 420,
  isVertical = false,
  onBowClick,
}) => {
  const [isPopping, setIsPopping] = useState(false);

  const isDrawn = state === 'aiming';
  const isShooting = state === 'shooting';
  const isFired = state === 'hit' || state === 'burning' || state === 'consumed';

  // String stretch offsets
  const stringPullX = isDrawn ? -28 : 0;

  // Arrow translation:
  // In normal (horizontal) mode: arrow moves in +X direction towards Ravana
  // In vertical mode: the entire SVG is rotated -90deg, so +X translates vertically UPWARDS towards Ravana!
  const travelDistance = isShooting ? (arrowProgress / 100) * flightDistance : isDrawn ? -28 : 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (state !== 'idle') return;
    soundEngine.playBowPluck();
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 300);
    onBowClick?.();
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={`relative flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-200 ${
        isPopping ? 'scale-115 -rotate-3' : 'hover:scale-105 active:scale-95'
      }`}
    >
      {/* Bow and Arrow SVG Container */}
      <div
        className={`relative flex items-center justify-center transition-all ${
          isVertical ? 'w-44 h-44 sm:w-52 sm:h-52' : 'w-44 sm:w-56 h-56 sm:h-72'
        }`}
        style={{
          transform: isVertical ? 'rotate(-90deg)' : 'none',
        }}
      >
        <svg
          viewBox="-80 -120 220 240"
          className="w-full h-full overflow-visible drop-shadow-xl"
        >
          <defs>
            {/* Golden bow gradient */}
            <linearGradient id="bowGoldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#eab308" />
              <stop offset="70%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>

            {/* Flaming Arrow Tip Gradient */}
            <radialGradient id="arrowFireGrad" cx="30%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </radialGradient>
          </defs>

          {/* Divine Aura Glow around Bow */}
          <circle
            cx="0"
            cy="0"
            r="85"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="0.8"
            strokeDasharray="4 6"
            className="animate-spin"
            style={{ animationDuration: '24s', opacity: 0.4 }}
          />

          {/* Celestial Bow Body (Kodanda) */}
          <g transform="translate(-10, 0)">
            {/* The curved golden stave */}
            <path
              d="M -5 -95 C 45 -60, 45 60, -5 95 C 10 70, 15 -70, -5 -95 Z"
              fill="url(#bowGoldGrad)"
              stroke="#713f12"
              strokeWidth="1.5"
            />
            {/* Bow center grip */}
            <rect x="18" y="-18" width="12" height="36" rx="4" fill="#991b1b" stroke="#fef08a" strokeWidth="1" />
            {/* Decorative golden rings */}
            <circle cx="24" cy="-8" r="2.5" fill="#fef08a" />
            <circle cx="24" cy="8" r="2.5" fill="#fef08a" />
            {/* Upper and lower curved horn tips */}
            <circle cx="-5" cy="-95" r="4.5" fill="#fef08a" stroke="#854d0e" strokeWidth="1" />
            <circle cx="-5" cy="95" r="4.5" fill="#fef08a" stroke="#854d0e" strokeWidth="1" />

            {/* Bowstring - stretches back when aiming, vibrates on pluck */}
            <path
              d={`M -5 -95 Q ${stringPullX + (isPopping ? 12 : 5)} 0, -5 95`}
              fill="none"
              stroke="#fef08a"
              strokeWidth="2.5"
              className={!isFired ? 'drop-shadow-[0_0_4px_#f59e0b]' : ''}
            />
          </g>

          {/* The Blazing Agnyastra Arrow */}
          {!isFired && (
            <g
              transform={`translate(${travelDistance}, 0)`}
              className="transition-transform duration-75"
            >
              {/* Arrow shaft */}
              <line
                x1="-65"
                y1="0"
                x2="45"
                y2="0"
                stroke="#fef08a"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Arrow fletching feathers (Peacock green and gold) */}
              <path d="M -65 0 L -80 -10 L -60 -2 Z" fill="#047857" stroke="#fef08a" strokeWidth="0.8" />
              <path d="M -65 0 L -80 10 L -60 2 Z" fill="#047857" stroke="#fef08a" strokeWidth="0.8" />

              {/* Arrowhead (Sacred Trident / Trishula shaped golden blade) */}
              <path
                d="M 45 -8 L 65 0 L 45 8 L 48 0 Z"
                fill="#fef08a"
                stroke="#b45309"
                strokeWidth="1.2"
              />

              {/* Divine Blazing Fireball at arrowhead */}
              <circle cx="62" cy="0" r="11" fill="url(#arrowFireGrad)" className="animate-pulse" />
              
              {/* Flame trail behind tip */}
              <path
                d="M 60 -5 C 75 -2, 75 2, 60 5 C 45 2, 45 -2, 60 -5 Z"
                fill="#ff5500"
                opacity="0.85"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
