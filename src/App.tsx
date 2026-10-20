import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Flame, Info, RotateCcw, ArrowDown } from 'lucide-react';
import { soundEngine } from './utils/audio.ts';
import { ParticleCanvas, ParticleMode } from './components/ParticleCanvas.tsx';
import { RavanaEffigy, HeadInfo, RAVANA_HEADS } from './components/RavanaEffigy.tsx';
import { DivineBow } from './components/DivineBow.tsx';
import { CelebrationCard } from './components/CelebrationCard.tsx';

type AppState = 'idle' | 'aiming' | 'shooting' | 'hit' | 'burning' | 'consumed';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [burnProgress, setBurnProgress] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hoveredHead, setHoveredHead] = useState<HeadInfo | null>(null);
  const [arrowProgress, setArrowProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'arena' | 'significance'>('arena');
  const [isShootButtonInView, setIsShootButtonInView] = useState<boolean>(true);
  const [isRavanaLaughing, setIsRavanaLaughing] = useState<boolean>(false);
  const [flightDistance, setFlightDistance] = useState<number>(450);
  const [targetCoords, setTargetCoords] = useState<{ x: number; y: number } | null>(null);

  // Responsive mobile state (mobile/tablet: < 1024px)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  const navelRef = useRef<SVGCircleElement | null>(null);
  const bowContainerRef = useRef<HTMLDivElement | null>(null);
  const shootButtonContainerRef = useRef<HTMLDivElement | null>(null);

  const burnIntervalRef = useRef<number | null>(null);
  const crackerIntervalRef = useRef<number | null>(null);
  const laughTimeoutRef = useRef<number | null>(null);

  // Track window resize for mobile orientation
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      updateTargetCoords();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updateTargetCoords, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateTargetCoords);
    };
  }, []);

  // IntersectionObserver to detect if Shoot Arrow Button is currently visible
  useEffect(() => {
    const target = shootButtonContainerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsShootButtonInView(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab]);

  const updateTargetCoords = () => {
    if (navelRef.current) {
      const rect = navelRef.current.getBoundingClientRect();
      setTargetCoords({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  };

  // Sync sound engine state
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.enabled = next;
  };

  // Ravana click reaction: evil laugh + visual shake & bubble
  const handleRavanaClick = () => {
    if (state === 'burning' || state === 'consumed') return;
    soundEngine.playRavanaLaugh();
    setIsRavanaLaughing(true);

    if (laughTimeoutRef.current) clearTimeout(laughTimeoutRef.current);
    laughTimeoutRef.current = window.setTimeout(() => {
      setIsRavanaLaughing(false);
    }, 1400);
  };

  // Launch the arrow and initiate Ravan Dahan
  const startRavanDahan = () => {
    if (state !== 'idle') return;

    // Calculate dynamic flight distance between bow and navel
    updateTargetCoords();
    if (bowContainerRef.current && navelRef.current) {
      const bowRect = bowContainerRef.current.getBoundingClientRect();
      const navelRect = navelRef.current.getBoundingClientRect();

      if (isMobile) {
        // In mobile view: Bow is at the bottom, Ravana is at the top.
        // Arrow flies vertically UP: distance between bow center and navel center
        const verticalDist = Math.abs(bowRect.top + bowRect.height / 2 - (navelRect.top + navelRect.height / 2));
        setFlightDistance(Math.max(240, verticalDist + 10));
      } else {
        // In desktop view: Bow is on the left, Ravana is on the right.
        // Arrow flies horizontally RIGHT
        const horizontalDist = Math.abs(navelRect.left - bowRect.left);
        setFlightDistance(Math.max(300, horizontalDist + 20));
      }
    }

    // 1. Aiming phase (Bow tension)
    setState('aiming');
    soundEngine.playBowDraw();

    setTimeout(() => {
      // 2. Release fiery arrow
      setState('shooting');
      soundEngine.playArrowRelease();

      const startTime = performance.now();
      const flightDuration = 850; // ms flight time

      const animateFlight = (now: number) => {
        const elapsed = now - startTime;
        const p = Math.min(100, (elapsed / flightDuration) * 100);
        setArrowProgress(p);

        if (elapsed < flightDuration) {
          requestAnimationFrame(animateFlight);
        } else {
          // Arrow reached target!
          handleArrowHit();
        }
      };

      requestAnimationFrame(animateFlight);
    }, 600);
  };

  // Arrow impacts Ravana's navel
  const handleArrowHit = () => {
    setState('hit');
    soundEngine.playImpactExplosion();
    updateTargetCoords();

    // Start effigy combustion after immediate explosion impact
    setTimeout(() => {
      setState('burning');

      // Continuous firecracker popping sound
      crackerIntervalRef.current = window.setInterval(() => {
        if (Math.random() < 0.6) {
          soundEngine.playCrackerBurst();
        }
        if (Math.random() < 0.4) {
          soundEngine.playFireCrackle();
        }
      }, 350);

      // Burn progress loop (approx 7.5 seconds to fully consume effigy)
      const burnDuration = 7500;
      const startTime = performance.now();

      burnIntervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(100, Math.floor((elapsed / burnDuration) * 100));
        setBurnProgress(progress);

        if (progress >= 100) {
          if (burnIntervalRef.current) clearInterval(burnIntervalRef.current);
          if (crackerIntervalRef.current) clearInterval(crackerIntervalRef.current);
          handleEffigyConsumed();
        }
      }, 60);
    }, 400);
  };

  // Effigy fully consumed -> trigger victory celebration
  const handleEffigyConsumed = () => {
    setState('consumed');
    soundEngine.playVictoryFanfare();
  };

  // Rebuild effigy to burn again
  const handleRebuild = () => {
    if (burnIntervalRef.current) clearInterval(burnIntervalRef.current);
    if (crackerIntervalRef.current) clearInterval(crackerIntervalRef.current);
    if (laughTimeoutRef.current) clearTimeout(laughTimeoutRef.current);
    setState('idle');
    setBurnProgress(0);
    setArrowProgress(0);
    setIsRavanaLaughing(false);
  };

  // Scroll smoothly down to the centered Shoot Arrow button
  const scrollToShootButton = () => {
    shootButtonContainerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (burnIntervalRef.current) clearInterval(burnIntervalRef.current);
      if (crackerIntervalRef.current) clearInterval(crackerIntervalRef.current);
      if (laughTimeoutRef.current) clearTimeout(laughTimeoutRef.current);
    };
  }, []);

  // Compute particle canvas mode
  const particleMode: ParticleMode =
    state === 'consumed'
      ? 'celebrating'
      : state === 'burning' || state === 'hit'
      ? 'burning'
      : state === 'shooting'
      ? 'shooting'
      : 'idle';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Dynamic Canvas for Real-time Fire, Crackers, and Fireworks */}
      <ParticleCanvas mode={particleMode} burnProgress={burnProgress} targetCoords={targetCoords} />

      {/* Decorative Night Sky Background with Stars and Deep Twilight Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950" />
        <div
          className="absolute top-0 inset-x-0 h-96 opacity-30"
          style={{
            backgroundImage: `radial-gradient(1.5px 1.5px at 40px 60px, #fef08a, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 120px 180px, #ffffff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 280px 90px, #f59e0b, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 420px 220px, #ffffff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 580px 140px, #fde047, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 750px 70px, #ffffff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 890px 240px, #fef08a, rgba(0,0,0,0))`,
            backgroundRepeat: 'repeat',
            backgroundSize: '950px 300px',
          }}
        />
        {/* Festive Golden Crescent Moon */}
        <div className="absolute top-10 right-8 md:right-24 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[-4px_4px_0_2px_#fef08a] opacity-80" />
      </div>

      {/* Top Bar Navigation (Strict 3-Zone Contract) */}
      <header className="relative z-30 flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-amber-500/15 bg-slate-950/80 backdrop-blur-md">
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-amber-400 font-serif">
            Shubh Dussehra
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold text-amber-500/80 uppercase tracking-widest pl-2 border-l border-slate-800">
            Vijayadashami
          </span>
        </div>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('arena')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-400 ${
              activeTab === 'arena' ? 'text-amber-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Ramlila Arena
          </button>
          <button
            onClick={() => setActiveTab('significance')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-400 ${
              activeTab === 'significance' ? 'text-amber-400 font-semibold' : 'text-slate-400'
            }`}
          >
            10 Heads & Significance
          </button>
        </nav>

        {/* Zone 3: Primary Action / Audio Controller */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-slate-800 transition-all whitespace-nowrap shrink-0"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Muted</span>
              </>
            )}
          </button>

          {state === 'consumed' && (
            <button
              onClick={handleRebuild}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Burn Again</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Experience Layout */}
      <main className="relative z-10 flex-1 flex flex-col justify-between max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* Header Hero Title Section */}
        <div className="text-center space-y-1.5 sm:space-y-2 mt-1 mb-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-amber-400 font-semibold">
            <span>बुराई पर अच्छाई की विजय</span>
            <span aria-hidden="true">·</span>
            <span>Vijayadashami Festival</span>
            <span aria-hidden="true">·</span>
            <span>Ravan Dahan</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-500 font-serif drop-shadow-md">
            Shubh Dussehra
          </h1>

          <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto font-medium px-2">
            {state === 'idle' &&
              'Witness the 10-headed effigy of Ravana. Draw Lord Rama’s bow and shoot the flaming Agnyastra arrow to ignite Ravan Dahan!'}
            {state === 'aiming' && 'Drawing the divine Kodanda bow... tension rises!'}
            {state === 'shooting' && 'The flaming Agnyastra arrow streaks towards Ravana’s navel!'}
            {state === 'hit' && 'Impact! The divine arrow pierces the sacred Amrit Kund!'}
            {state === 'burning' && 'Effigy bursting with fireworks and consumed by sacred flames!'}
            {state === 'consumed' && 'Victory! Evil has turned to ash. Celebrate the light of Dharma!'}
          </p>

          {/* Combustion Progress Indicator during Burning */}
          {(state === 'burning' || state === 'hit') && (
            <div className="max-w-md mx-auto pt-1 animate-in fade-in duration-300 px-4">
              <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                  Effigy Combustion
                </span>
                <span className="font-mono tabular-nums">{burnProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-amber-500/30">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transition-all duration-100 ease-out"
                  style={{ width: `${burnProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 2: Educational Significance Panel */}
        {activeTab === 'significance' && (
          <div className="max-w-4xl mx-auto w-full my-4 p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-md space-y-4 sm:space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-amber-300 font-serif">
                  The 10 Heads of Ravana (Dashanana)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  In Indian philosophy, each of Ravana&apos;s 10 heads symbolizes a human weakness or vice that we strive to overcome on Dussehra.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('arena')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all whitespace-nowrap"
              >
                Back to Arena
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-3">
              {RAVANA_HEADS.map((head) => (
                <div
                  key={head.id}
                  className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-amber-500/20 hover:border-amber-400/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
                    <span>Head #{head.id}</span>
                    <span className="text-[11px] text-slate-400">{head.hindiName}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{head.name}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{head.meaning}</p>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
              <span className="font-bold">Why shoot the navel?</span> According to the Ramayana, Ravana possessed a pot of divine nectar of immortality (Amrit Kumbh) in his navel. Lord Rama, guided by Vibhishana, discharged the divine Agnyastra arrow at the navel to dry the nectar, leading to his righteous victory.
            </div>
          </div>
        )}

        {/* Tab 1: The Arena */}
        {activeTab === 'arena' && (
          <div className="relative flex-1 flex flex-col justify-center items-center my-1 w-full">
            {/* Overlay Celebratory Card when effigy is consumed */}
            {state === 'consumed' && (
              <div className="w-full py-2 sm:py-4">
                <CelebrationCard onRebuild={handleRebuild} />
              </div>
            )}

            {/* DIV 1: Contains Arrow/Bow and Ravana */}
            {/* On mobile: Ravana at the top (order-1), Bow at the bottom facing UP (order-2) */}
            {/* On desktop: Bow on the left (order-1), Ravana on the right (order-2) */}
            <div
              className={`w-full flex flex-col lg:flex-row items-center justify-between lg:justify-around gap-4 sm:gap-6 lg:gap-12 transition-opacity duration-500 ${
                state === 'consumed' ? 'opacity-35 pointer-events-none' : 'opacity-100'
              }`}
            >
              {/* RAVANA EFFIGY: Order 1 on mobile (TOP), Order 2 on desktop (RIGHT) */}
              <div className="order-1 lg:order-2 flex flex-col items-center justify-center relative w-full lg:w-auto">
                <div className="text-center mb-1">
                  <span className="text-[11px] sm:text-xs uppercase tracking-wider text-amber-400/90 font-semibold">
                    10-Headed Effigy of Ravana
                  </span>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    {state === 'idle'
                      ? 'Hover or tap heads to reveal the 10 vices'
                      : state === 'burning'
                      ? 'Combusting in holy fire and cracker explosions'
                      : 'Amrit Kund targeted'}
                  </p>
                </div>

                <div className="w-full flex justify-center">
                  <RavanaEffigy
                    burnProgress={burnProgress}
                    isHit={state === 'hit' || state === 'burning' || state === 'consumed'}
                    isBurning={state === 'burning'}
                    isConsumed={state === 'consumed'}
                    isLaughing={isRavanaLaughing}
                    onRavanaClick={handleRavanaClick}
                    onTargetRef={(el) => {
                      navelRef.current = el;
                    }}
                    hoveredHeadId={hoveredHead?.id ?? null}
                    onHeadHover={setHoveredHead}
                  />
                </div>

                {/* Quick Hint / Hover Info */}
                {hoveredHead && (
                  <div className="mt-2 p-2 px-3 rounded-xl bg-slate-900 border border-amber-500/40 text-center animate-in fade-in duration-200">
                    <span className="text-xs text-amber-300 font-bold block">
                      Head: {hoveredHead.name} ({hoveredHead.hindiName})
                    </span>
                    <span className="text-[11px] text-slate-300 block">
                      Symbolizes: {hoveredHead.meaning}
                    </span>
                  </div>
                )}
              </div>

              {/* BOW AND ARROW: Order 2 on mobile (BOTTOM, facing UP), Order 1 on desktop (LEFT) */}
              <div
                ref={bowContainerRef}
                className="order-2 lg:order-1 flex flex-col items-center justify-center p-2 relative"
              >
                <div className="text-center mb-2">
                  <span className="text-[11px] sm:text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Lord Rama&apos;s Divine Bow (Kodanda)
                  </span>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                    {isMobile ? 'Facing up towards Ravana' : 'Armed with flaming Agnyastra'}
                  </p>
                </div>

                {/* The Divine Bow with Arrow (vertical facing UP on mobile, horizontal on desktop) */}
                <DivineBow
                  state={state}
                  arrowProgress={arrowProgress}
                  flightDistance={flightDistance}
                  isVertical={isMobile}
                  onBowClick={() => {
                    // String twang and pop handled inside DivineBow
                  }}
                />
              </div>
            </div>

            {/* DIV 2: Centered Shoot Arrow Button */}
            <div
              ref={shootButtonContainerRef}
              className="w-full flex flex-col items-center justify-center my-6 py-3 z-30"
            >
              <button
                onClick={startRavanDahan}
                disabled={state !== 'idle'}
                className={`group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-4.5 text-base sm:text-lg font-bold tracking-wide rounded-2xl transition-all duration-300 shadow-xl ${
                  state !== 'idle'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 shadow-none'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white hover:from-amber-400 hover:via-orange-500 hover:to-red-500 hover:shadow-orange-500/40 hover:scale-[1.03] active:scale-[0.98]'
                }`}
              >
                <span className="text-2xl" role="img" aria-label="bow and arrow">
                  🏹
                </span>
                <span>
                  {state === 'aiming'
                    ? 'Aiming Bow...'
                    : state === 'shooting'
                    ? 'Arrow in Flight...'
                    : state === 'hit' || state === 'burning'
                    ? 'Effigy Ignited!'
                    : state === 'consumed'
                    ? 'Ravana Vanquished!'
                    : 'Shoot Arrow (Ravan Dahan)'}
                </span>
              </button>

              <span className="text-xs text-amber-300/80 mt-2 font-medium tracking-wide">
                {state === 'idle'
                  ? 'Aim for the Navel (Amrit Kund) · Click to burn Ravana'
                  : state === 'burning'
                  ? 'Effigy is burning down in holy flames'
                  : ''}
              </span>
            </div>
          </div>
        )}

        {/* Footer Ground / Ramlila Festival Footnotes */}
        <footer className="relative z-20 border-t border-slate-900/80 pt-3 mt-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span>Vijayadashami Mahotsav</span>
            <span aria-hidden="true">·</span>
            <span>Ravan Dahan Celebration</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab(activeTab === 'arena' ? 'significance' : 'arena')}
              className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{activeTab === 'arena' ? 'Learn About 10 Heads' : 'Back to Arena'}</span>
            </button>
          </div>
        </footer>
      </main>

      {/* Mobile & Tablet Floating Scroll-to-Shoot Button (Bottom-Right) */}
      {/* Appears only when the Shoot Arrow button is not in the viewport, and disappears once visible */}
      {!isShootButtonInView && state === 'idle' && (
        <div className="fixed bottom-6 right-5 z-40 lg:hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            onClick={scrollToShootButton}
            aria-label="Scroll to Shoot Arrow button"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/40 hover:from-amber-400 hover:to-orange-400 active:scale-95 transition-all"
          >
            <span>Shoot Arrow</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      )}
    </div>
  );
}
