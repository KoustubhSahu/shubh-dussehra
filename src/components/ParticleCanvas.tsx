import React, { useEffect, useRef } from 'react';

export type ParticleMode = 'idle' | 'shooting' | 'burning' | 'celebrating';

interface ParticleCanvasProps {
  mode: ParticleMode;
  burnProgress: number; // 0 to 100
  targetCoords?: { x: number; y: number } | null;
}

interface FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
  type: 'flame' | 'spark' | 'smoke' | 'cracker';
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
  particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    alpha: number;
    decay: number;
    size: number;
  }[];
}

const FIRE_PALETTE = ['#ff2a00', '#ff5500', '#ff9900', '#ffcc00', '#ffe600', '#ffffff'];
const FIREWORK_COLORS = ['#fbbf24', '#f87171', '#34d399', '#60a5fa', '#f472b6', '#c084fc', '#fde047', '#38bdf8'];

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ mode, burnProgress, targetCoords }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<FireParticle[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  const lastFireworkTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const spawnFireParticles = (originX: number, originY: number, count: number, isCracker: boolean = false) => {
      for (let i = 0; i < count; i++) {
        const spreadX = (Math.random() - 0.5) * (isCracker ? 140 : 120);
        const spreadY = (Math.random() - 0.5) * (isCracker ? 140 : 160);
        const speed = isCracker ? Math.random() * 6 + 2 : Math.random() * 3 + 1;
        const angle = Math.random() * Math.PI * 2;

        const isSmoke = !isCracker && Math.random() < 0.25;

        particlesRef.current.push({
          x: originX + spreadX,
          y: originY + spreadY,
          vx: isCracker ? Math.cos(angle) * speed : (Math.random() - 0.5) * 2,
          vy: isCracker ? Math.sin(angle) * speed : -Math.random() * 3.5 - 1.5,
          size: isSmoke ? Math.random() * 8 + 6 : Math.random() * 4 + 2,
          color: isSmoke
            ? 'rgba(90, 80, 80, 0.4)'
            : FIRE_PALETTE[Math.floor(Math.random() * FIRE_PALETTE.length)],
          alpha: 1,
          decay: isSmoke ? Math.random() * 0.01 + 0.008 : Math.random() * 0.03 + 0.015,
          life: 1,
          type: isCracker ? 'cracker' : isSmoke ? 'smoke' : Math.random() < 0.5 ? 'spark' : 'flame',
        });
      }
    };

    const spawnFirework = () => {
      const startX = width * 0.15 + Math.random() * (width * 0.7);
      const targetY = height * 0.12 + Math.random() * (height * 0.35);
      const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

      fireworksRef.current.push({
        x: startX,
        y: height,
        targetY,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 4 - 8,
        color,
        exploded: false,
        particles: [],
      });
    };

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animFrameRef.current = requestAnimationFrame(loop);
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      const targetX = targetCoords ? targetCoords.x : width * 0.65;
      const targetY = targetCoords ? targetCoords.y : height * 0.5;

      // 1. Spawning during BURNING state
      if (mode === 'burning') {
        // As burn progress increases, intensity rises then tapers into embers
        const intensityMultiplier = burnProgress < 75 ? Math.max(1, burnProgress / 20) : 1.5;
        const spawnCount = Math.floor(4 * intensityMultiplier);
        spawnFireParticles(targetX, targetY, spawnCount, false);

        // Periodic cracker bursts
        if (Math.random() < 0.12) {
          const crackerOffsetY = (Math.random() - 0.5) * 180;
          spawnFireParticles(targetX + (Math.random() - 0.5) * 80, targetY + crackerOffsetY, 15, true);
        }
      }

      // 2. Spawning during CELEBRATING state (Fireworks show!)
      if (mode === 'celebrating') {
        if (currentTime - lastFireworkTimeRef.current > 450) {
          spawnFirework();
          lastFireworkTimeRef.current = currentTime;
        }

        // Occasional celebratory golden embers rising from ground
        if (Math.random() < 0.3) {
          particlesRef.current.push({
            x: Math.random() * width,
            y: height + 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 2 - 1,
            size: Math.random() * 3 + 1,
            color: '#fbbf24',
            alpha: 0.9,
            decay: 0.008,
            life: 1,
            type: 'spark',
          });
        }
      }

      // Update and draw fire/spark particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.type === 'smoke') {
          p.size += 0.2;
        } else if (p.type === 'flame') {
          p.size = Math.max(0.5, p.size - 0.05);
        }

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra glow for sparks
        if (p.type === 'spark' || p.type === 'cracker') {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.restore();
      }

      // Update and draw fireworks
      for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
        const fw = fireworksRef.current[i];

        if (!fw.exploded) {
          fw.x += fw.vx;
          fw.y += fw.vy;

          // Rocket tracer
          ctx.save();
          ctx.fillStyle = fw.color;
          ctx.shadowColor = fw.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (fw.y <= fw.targetY || fw.vy >= 0) {
            fw.exploded = true;
            // Create burst particles
            const count = 40 + Math.floor(Math.random() * 25);
            for (let j = 0; j < count; j++) {
              const speed = Math.random() * 5 + 1.5;
              const angle = Math.random() * Math.PI * 2;
              fw.particles.push({
                x: fw.x,
                y: fw.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: fw.color,
                alpha: 1,
                decay: Math.random() * 0.015 + 0.01,
                size: Math.random() * 2.5 + 1.5,
              });
            }
          }
        } else {
          // Update burst particles
          let allDead = true;
          for (let k = 0; k < fw.particles.length; k++) {
            const bp = fw.particles[k];
            bp.x += bp.vx;
            bp.y += bp.vy;
            bp.vy += 0.06; // gravity
            bp.alpha -= bp.decay;

            if (bp.alpha > 0) {
              allDead = false;
              ctx.save();
              ctx.globalAlpha = Math.max(0, bp.alpha);
              ctx.fillStyle = bp.color;
              ctx.shadowColor = bp.color;
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(bp.x, bp.y, bp.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }

          if (allDead) {
            fireworksRef.current.splice(i, 1);
          }
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, burnProgress, targetCoords]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20 h-full w-full"
      aria-hidden="true"
    />
  );
};
