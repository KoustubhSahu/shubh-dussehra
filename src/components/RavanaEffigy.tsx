import React, { useId } from 'react';

export interface HeadInfo {
  id: number;
  name: string;
  hindiName: string;
  meaning: string;
  xOffset: number;
  yOffset: number;
  scale: number;
  rotation: number;
  isCenter?: boolean;
}

export const RAVANA_HEADS: HeadInfo[] = [
  // Left 4 heads
  { id: 1, name: 'Kama', hindiName: 'काम', meaning: 'Lust', xOffset: -140, yOffset: 12, scale: 0.65, rotation: -16 },
  { id: 2, name: 'Krodha', hindiName: 'क्रोध', meaning: 'Anger', xOffset: -105, yOffset: 4, scale: 0.72, rotation: -11 },
  { id: 3, name: 'Moha', hindiName: 'मोह', meaning: 'Delusion', xOffset: -70, yOffset: -2, scale: 0.8, rotation: -6 },
  { id: 4, name: 'Lobha', hindiName: 'लोभ', meaning: 'Greed', xOffset: -35, yOffset: -5, scale: 0.88, rotation: -2 },
  // Center king head (Ahankara / Ego)
  { id: 5, name: 'Ahankara', hindiName: 'अहंकार', meaning: 'Ego (Primary)', xOffset: 0, yOffset: -8, scale: 1.05, rotation: 0, isCenter: true },
  // Right 5 heads
  { id: 6, name: 'Mada', hindiName: 'मद', meaning: 'Pride', xOffset: 35, yOffset: -5, scale: 0.88, rotation: 2 },
  { id: 7, name: 'Matsarya', hindiName: 'मात्सर्य', meaning: 'Jealousy', xOffset: 70, yOffset: -2, scale: 0.8, rotation: 6 },
  { id: 8, name: 'Swartha', hindiName: 'स्वार्थ', meaning: 'Selfishness', xOffset: 105, yOffset: 4, scale: 0.72, rotation: 11 },
  { id: 9, name: 'Anyaya', hindiName: 'अन्याय', meaning: 'Injustice', xOffset: 140, yOffset: 12, scale: 0.65, rotation: 16 },
  { id: 10, name: 'Amanavta', hindiName: 'अमानवता', meaning: 'Cruelty', xOffset: 175, yOffset: 24, scale: 0.58, rotation: 22 },
];

interface RavanaEffigyProps {
  burnProgress: number; // 0 to 100
  isHit: boolean;
  isBurning: boolean;
  isConsumed: boolean;
  isLaughing?: boolean;
  onRavanaClick?: () => void;
  onTargetRef?: (el: SVGCircleElement | null) => void;
  hoveredHeadId?: number | null;
  onHeadHover?: (head: HeadInfo | null) => void;
}

export const RavanaEffigy: React.FC<RavanaEffigyProps> = ({
  burnProgress,
  isHit,
  isBurning,
  isConsumed,
  isLaughing = false,
  onRavanaClick,
  onTargetRef,
  hoveredHeadId,
  onHeadHover,
}) => {
  const filterId = useId();

  // Burn-driven geometric collapses and effects
  // 0% -> full height; 100% -> collapsed ash heap
  const collapseScaleY = Math.max(0.12, 1 - (burnProgress / 100) * 0.85);
  const collapseOffsetY = (burnProgress / 100) * 260;
  
  // Shake offset: shaking when hit/burning OR shaking with menacing laughter
  const shakeOffset =
    isLaughing && !isConsumed
      ? (Math.random() - 0.5) * 8
      : isHit && burnProgress < 90
      ? (Math.random() - 0.5) * (Math.min(12, burnProgress / 4 + 3))
      : 0;
  
  // Charcoal / fire filter values
  const charcoalDarkness = Math.min(1, burnProgress / 65);
  const fireGlowIntensity = isBurning ? Math.sin((burnProgress / 10) * Math.PI) * 15 + 15 : 0;

  return (
    <div
      onClick={!isConsumed && !isBurning ? onRavanaClick : undefined}
      role="button"
      tabIndex={0}
      className={`relative flex flex-col items-center justify-center select-none ${
        !isConsumed && !isBurning ? 'cursor-pointer group' : ''
      }`}
    >
      {/* Laugh speech bubble */}
      {isLaughing && !isConsumed && (
        <div className="absolute -top-12 sm:-top-14 left-1/2 -translate-x-1/2 bg-red-950/95 border-2 border-red-500 text-yellow-300 px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg shadow-red-500/50 animate-bounce whitespace-nowrap z-30">
          😈 हा! हा! हा! (Mwahahaha!)
        </div>
      )}
      {/* Dynamic fire/cracker glow aura around the effigy */}
      {(isBurning || isHit) && (
        <div
          className="absolute inset-0 -m-16 rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 55%, rgba(255, 85, 0, ${Math.min(0.75, (100 - burnProgress) / 100)}), rgba(255, 180, 0, 0.2), transparent 70%)`,
            filter: `blur(${Math.min(40, burnProgress / 2 + 15)}px)`,
            opacity: burnProgress >= 100 ? 0.2 : 0.85,
          }}
        />
      )}

      {/* SVG Canvas for Ravana Effigy */}
      <svg
        viewBox="-240 -120 480 620"
        className="w-full max-w-[460px] md:max-w-[540px] h-auto drop-shadow-2xl transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${shakeOffset}px, ${collapseOffsetY}px) scaleY(${collapseScaleY})`,
          transformOrigin: 'bottom center',
        }}
      >
        <defs>
          {/* Flame gradient for burning effects */}
          <linearGradient id={`flameGrad-${filterId}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff1100" />
            <stop offset="40%" stopColor="#ff6600" />
            <stop offset="80%" stopColor="#ffcc00" />
            <stop offset="100%" stopColor="#ffff99" />
          </linearGradient>

          {/* Charcoal burnt gradient */}
          <linearGradient id={`charcoalGrad-${filterId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1818" />
            <stop offset="50%" stopColor="#2c2523" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>

          {/* Golden crown gradient */}
          <linearGradient id={`crownGrad-${filterId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="85%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Royal robe gradient */}
          <linearGradient id={`robeGrad-${filterId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>

          {/* Navel Amrit nectar glow */}
          <radialGradient id={`amritGlow-${filterId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>

          {/* Burning heat displacement filter */}
          {isBurning && (
            <filter id={`burnHeat-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" seed="42">
                <animate attributeName="baseFrequency" dur="1.2s" values="0.03;0.06;0.03" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={Math.min(25, burnProgress / 3 + 4)} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          )}
        </defs>

        {/* Effigy Wooden Base & Stand (Bamboo pole) */}
        <g id="effigy-scaffolding" opacity={isConsumed ? 0.3 : 1}>
          {/* Main vertical bamboo post */}
          <rect x="-8" y="160" width="16" height="300" rx="3" fill="#854d0e" stroke="#583101" strokeWidth="2" />
          
          {/* Wooden cross stand at bottom */}
          <path d="M -90 460 L 90 460 L 60 475 L -60 475 Z" fill="#713f12" stroke="#451a03" strokeWidth="2" />
          <path d="M -60 445 L -8 460 L 8 460 L 60 445" stroke="#583101" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="0" cy="466" rx="80" ry="12" fill="none" stroke="#ca8a04" strokeWidth="3" strokeDasharray="6 4" />
          
          {/* Earthen festive diyas at the base */}
          {[-70, -35, 0, 35, 70].map((dx, i) => (
            <g key={i} transform={`translate(${dx}, 462)`}>
              {/* Diya clay bowl */}
              <path d="M -10 0 C -10 6, 10 6, 10 0 Z" fill="#b45309" stroke="#78350f" strokeWidth="1" />
              {/* Diya flame */}
              <path
                d="M 0 -8 C 3 -4, 4 0, 0 1 C -4 0, -3 -4, 0 -8 Z"
                fill="#fde047"
                className="animate-pulse"
                style={{ animationDuration: `${0.8 + (i % 3) * 0.3}s` }}
              />
            </g>
          ))}
        </g>

        {/* Effigy Main Body (Apparel & Arms) */}
        <g
          id="effigy-body"
          filter={isBurning ? `url(#burnHeat-${filterId})` : undefined}
          style={{
            filter: charcoalDarkness > 0 ? `grayscale(${charcoalDarkness * 0.8}) brightness(${1 - charcoalDarkness * 0.45})` : undefined,
          }}
        >
          {/* Left Arm with Bow */}
          <g
            transform={`translate(-85, 180) rotate(${isBurning ? -15 : -5})`}
            opacity={burnProgress > 70 ? 0.1 : 1}
          >
            {/* Upper arm */}
            <path d="M 0 0 L -55 35 L -45 50 L 5 12 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
            {/* Forearm holding effigy sword/bow */}
            <path d="M -55 35 L -80 85 L -65 90 L -45 50 Z" fill="#047857" stroke="#065f46" strokeWidth="2" />
            {/* Gold armlet */}
            <rect x="-42" y="24" width="14" height="20" rx="3" fill={`url(#crownGrad-${filterId})`} />
            {/* Chandrahas sword */}
            <path
              d="M -75 88 C -105 50, -115 -10, -85 -55 C -82 -40, -88 20, -68 85 Z"
              fill="#cbd5e1"
              stroke="#64748b"
              strokeWidth="2"
            />
            {/* Sword hilt */}
            <circle cx="-72" cy="88" r="7" fill={`url(#crownGrad-${filterId})`} />
          </g>

          {/* Right Arm with Demon Bow */}
          <g
            transform={`translate(85, 180) rotate(${isBurning ? 15 : 5})`}
            opacity={burnProgress > 70 ? 0.1 : 1}
          >
            {/* Upper arm */}
            <path d="M 0 0 L 55 35 L 45 50 L -5 12 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
            {/* Forearm */}
            <path d="M 55 35 L 80 85 L 65 90 L 45 50 Z" fill="#047857" stroke="#065f46" strokeWidth="2" />
            {/* Gold armlet */}
            <rect x="28" y="24" width="14" height="20" rx="3" fill={`url(#crownGrad-${filterId})`} />
            {/* Demon Bow */}
            <path d="M 75 40 Q 110 90 75 140" fill="none" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
            <line x1="75" y1="40" x2="75" y2="140" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 2" />
          </g>

          {/* Broad Demon King Torso / Chestplate (Kavach) */}
          <g transform="translate(0, 150)">
            {/* Royal crimson angavastram shawl */}
            <path
              d="M -90 10 L 90 10 L 105 130 L -105 130 Z"
              fill={`url(#robeGrad-${filterId})`}
              stroke="#7f1d1d"
              strokeWidth="3"
            />

            {/* Golden ornate chestplate & ornaments */}
            <path
              d="M -70 15 L 70 15 L 55 90 L -55 90 Z"
              fill={`url(#crownGrad-${filterId})`}
              stroke="#92400e"
              strokeWidth="2"
            />

            {/* Traditional bead necklaces */}
            <path d="M -50 20 Q 0 65 50 20" fill="none" stroke="#fef08a" strokeWidth="4" />
            <path d="M -40 25 Q 0 80 40 25" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="5 3" />
            
            {/* Royal waistband (Kamarbandh) */}
            <rect x="-85" y="115" width="170" height="22" rx="4" fill={`url(#crownGrad-${filterId})`} stroke="#b45309" strokeWidth="2" />
            <circle cx="0" cy="126" r="10" fill="#dc2626" stroke="#fef08a" strokeWidth="2" />

            {/* Emerald royal skirt / dhoti */}
            <path
              d="M -85 137 L 85 137 L 115 310 L -115 310 Z"
              fill="#065f46"
              stroke="#022c22"
              strokeWidth="3"
            />
            {/* Golden zari pleats in center */}
            <path d="M -25 137 L -35 310 L 35 310 L 25 137 Z" fill={`url(#crownGrad-${filterId})`} />
            <line x1="0" y1="137" x2="0" y2="310" stroke="#78350f" strokeWidth="3" />
            <line x1="-12" y1="137" x2="-18" y2="310" stroke="#78350f" strokeWidth="1.5" />
            <line x1="12" y1="137" x2="18" y2="310" stroke="#78350f" strokeWidth="1.5" />
          </g>

          {/* Sacred Navel - Amrit Kund (Target of Rama's Arrow) */}
          <g id="amrit-navel" transform="translate(0, 245)">
            {/* Outer golden chakra border */}
            <circle cx="0" cy="0" r="26" fill="none" stroke="#fef08a" strokeWidth="2.5" strokeDasharray="5 3" />
            
            {/* Amrit Kumbh center */}
            <circle
              ref={onTargetRef}
              cx="0"
              cy="0"
              r="19"
              fill={`url(#amritGlow-${filterId})`}
              stroke="#b45309"
              strokeWidth="2.5"
              className={!isHit ? 'animate-pulse' : ''}
              style={{
                boxShadow: isHit ? '0 0 25px #ff5500' : '0 0 10px #fbbf24',
              }}
            />

            {/* Sacred sunburst rays around navel */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <line
                key={idx}
                x1={Math.cos((angle * Math.PI) / 180) * 21}
                y1={Math.sin((angle * Math.PI) / 180) * 21}
                x2={Math.cos((angle * Math.PI) / 180) * 28}
                y2={Math.sin((angle * Math.PI) / 180) * 28}
                stroke="#f59e0b"
                strokeWidth="2"
              />
            ))}

            {/* Glowing target indicator if idle */}
            {!isHit && (
              <g className="animate-spin" style={{ animationDuration: '6s', transformOrigin: '0 0' }}>
                <circle cx="0" cy="0" r="32" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="8 6" />
              </g>
            )}

            {/* Impact fracture / fiery burst at navel when hit */}
            {isHit && (
              <g>
                <circle cx="0" cy="0" r={Math.min(45, burnProgress + 20)} fill="none" stroke="#ff4500" strokeWidth="4" />
                <path d="M -12 -12 L 0 0 L 15 -10 M 0 0 L -8 14 M 0 0 L 12 10" stroke="#ffff00" strokeWidth="2.5" />
              </g>
            )}
          </g>
        </g>

        {/* 10 Heads of Ravana (Dashanana) */}
        <g id="ravana-ten-heads" transform="translate(0, 70)">
          {RAVANA_HEADS.map((head) => {
            // Check if this head is burning/detached based on burnProgress
            // Outer heads burn earlier (id 1, 10 at 25%, id 2, 9 at 40%, etc.)
            const distFromCenter = Math.abs(head.id - 5.5);
            const headBurnThreshold = 20 + (5 - distFromCenter) * 14;
            const isHeadBurning = burnProgress >= headBurnThreshold;
            const isHeadDestroyed = burnProgress >= headBurnThreshold + 25;

            const isHovered = hoveredHeadId === head.id;

            return (
              <g
                key={head.id}
                transform={`translate(${head.xOffset}, ${head.yOffset}) rotate(${head.rotation}) scale(${head.scale})`}
                className="cursor-pointer transition-transform duration-200"
                style={{
                  opacity: isHeadDestroyed ? 0.05 : 1,
                  transformOrigin: '0 30px',
                  filter: isHovered
                    ? 'drop-shadow(0 0 10px #f59e0b)'
                    : isHeadBurning
                    ? `drop-shadow(0 0 ${fireGlowIntensity}px #ff4500)`
                    : undefined,
                }}
                onMouseEnter={() => onHeadHover?.(head)}
                onMouseLeave={() => onHeadHover?.(null)}
              >
                {/* Neck */}
                <path d="M -10 30 L 10 30 L 12 48 L -12 48 Z" fill="#78350f" stroke="#451a03" strokeWidth="1" />

                {/* Face base */}
                <ellipse
                  cx="0"
                  cy="14"
                  rx="19"
                  ry="23"
                  fill={isHeadBurning ? `url(#charcoalGrad-${filterId})` : '#9a3412'}
                  stroke={isHeadBurning ? '#ff5500' : '#431407'}
                  strokeWidth="2"
                />

                {/* Fierce Eyes */}
                <g>
                  {/* Left Eye */}
                  <path d="M -14 8 Q -8 3 -3 8 Q -8 13 -14 8 Z" fill="#ffffff" stroke="#451a03" strokeWidth="1" />
                  <circle cx="-8" cy="8" r="3" fill="#dc2626" />
                  <circle cx="-8" cy="8" r="1.5" fill="#000000" />
                  {/* Left Eyebrow (Arched & Fierce) */}
                  <path d="M -16 4 Q -9 -1 -2 6" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Right Eye */}
                  <path d="M 3 8 Q 8 3 14 8 Q 8 13 3 8 Z" fill="#ffffff" stroke="#451a03" strokeWidth="1" />
                  <circle cx="8" cy="8" r="3" fill="#dc2626" />
                  <circle cx="8" cy="8" r="1.5" fill="#000000" />
                  {/* Right Eyebrow */}
                  <path d="M 2 6 Q 9 -1 16 4" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
                </g>

                {/* Sacred Tilak / Tripundra on Forehead */}
                <g transform="translate(0, 0)">
                  <line x1="-8" y1="-2" x2="8" y2="-2" stroke="#fef08a" strokeWidth="1.5" />
                  <line x1="-10" y1="1" x2="10" y2="1" stroke="#fef08a" strokeWidth="1.5" />
                  <line x1="-8" y1="4" x2="8" y2="4" stroke="#fef08a" strokeWidth="1.5" />
                  <circle cx="0" cy="1" r="2.5" fill="#dc2626" />
                </g>

                {/* Royal Mustache (Curled with Pride) */}
                <path
                  d="M -17 21 C -12 17, -2 19, 0 21 C 2 19, 12 17, 17 21 C 20 23, 21 27, 18 28 C 15 28, 13 24, 0 24 C -13 24, -15 28, -18 28 C -21 27, -20 23, -17 21 Z"
                  fill="#111827"
                  stroke="#000000"
                  strokeWidth="0.8"
                />

                {/* Mouth with Fangs */}
                <path d="M -7 25 Q 0 31 7 25 Z" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1" />
                {/* White Fangs */}
                <polygon points="-5,25 -4,29 -3,25" fill="#ffffff" />
                <polygon points="3,25 4,29 5,25" fill="#ffffff" />

                {/* Ear Kundals (Gold Earrings) */}
                <circle cx="-19" cy="16" r="3.5" fill={`url(#crownGrad-${filterId})`} stroke="#b45309" strokeWidth="1" />
                <circle cx="19" cy="16" r="3.5" fill={`url(#crownGrad-${filterId})`} stroke="#b45309" strokeWidth="1" />

                {/* Crown (Mukut) */}
                <g transform="translate(0, -6)">
                  {/* Crown base */}
                  <path
                    d="M -18 2 L -14 -18 L -6 -10 L 0 -26 L 6 -10 L 14 -18 L 18 2 Z"
                    fill={`url(#crownGrad-${filterId})`}
                    stroke="#78350f"
                    strokeWidth="1.5"
                  />
                  {/* Ruby jewel on crown peak */}
                  <circle cx="0" cy="-16" r="3.5" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
                  <circle cx="-10" cy="-10" r="2" fill="#0284c7" />
                  <circle cx="10" cy="-10" r="2" fill="#0284c7" />
                </g>

                {/* Head number badge on hover */}
                {isHovered && (
                  <g transform="translate(0, -42)">
                    <rect x="-35" y="-14" width="70" height="24" rx="12" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="0" y="2" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {head.name} ({head.hindiName})
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Effigy Burning Overlay Flames directly over SVG */}
        {isBurning && burnProgress > 5 && (
          <g id="burning-svg-flames">
            {/* Multiple flame tongues climbing effigy */}
            {[
              { x: -50, y: 220, s: 1.2, h: 80 },
              { x: 0, y: 190, s: 1.6, h: 110 },
              { x: 45, y: 230, s: 1.3, h: 85 },
              { x: -90, y: 120, s: 1.1, h: 70 },
              { x: 80, y: 130, s: 1.1, h: 70 },
              { x: 0, y: 80, s: 1.8, h: 120 },
            ].map((flame, idx) => (
              <path
                key={idx}
                d={`M ${flame.x - 20 * flame.s} ${flame.y} Q ${flame.x - 5} ${flame.y - flame.h * 0.5} ${flame.x} ${flame.y - flame.h} Q ${flame.x + 5} ${flame.y - flame.h * 0.5} ${flame.x + 20 * flame.s} ${flame.y} Z`}
                fill={`url(#flameGrad-${filterId})`}
                opacity={Math.min(0.9, (burnProgress / 100) * 1.2)}
                className="animate-pulse"
                style={{
                  animationDuration: `${0.6 + (idx % 4) * 0.2}s`,
                  mixBlendMode: 'screen',
                }}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};
