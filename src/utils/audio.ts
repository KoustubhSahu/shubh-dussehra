/**
 * Dussehra celebration Web Audio API sound synthesizer
 * Zero external audio files required - 100% reliable and instantaneous.
 */

class DussehraSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Sound of pulling the bow string
  playBowDraw() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Resonant string tension sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + 0.6);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.5);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.7);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Sound of fiery arrow released & whistling through air
  playArrowRelease() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Bow twang
      const twang = this.ctx.createOscillator();
      const twangGain = this.ctx.createGain();
      twang.type = 'triangle';
      twang.frequency.setValueAtTime(350, t);
      twang.frequency.exponentialRampToValueAtTime(80, t + 0.25);
      twangGain.gain.setValueAtTime(0.3, t);
      twangGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      twang.connect(twangGain);
      twangGain.connect(this.ctx.destination);
      twang.start(t);
      twang.stop(t + 0.25);

      // Whistling wind / flame whoosh
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(400, t);
      bandpass.frequency.exponentialRampToValueAtTime(2400, t + 0.4);
      bandpass.frequency.exponentialRampToValueAtTime(800, t + 0.8);
      bandpass.Q.setValueAtTime(5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, t);
      noiseGain.gain.linearRampToValueAtTime(0.25, t + 0.3);
      noiseGain.gain.linearRampToValueAtTime(0.01, t + 0.8);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.8);
    } catch {
      // Audio fallback
    }
  }

  // Celestial impact explosion when arrow hits Ravana's navel
  playImpactExplosion() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Sub-bass thud
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(150, t);
      bass.frequency.exponentialRampToValueAtTime(35, t + 0.5);
      bassGain.gain.setValueAtTime(0.5, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      bass.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bass.start(t);
      bass.stop(t + 0.6);

      // Shimmering brass strike
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = 'triangle';
      bell.frequency.setValueAtTime(520, t);
      bell.frequency.exponentialRampToValueAtTime(260, t + 0.8);
      bellGain.gain.setValueAtTime(0.25, t);
      bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      bell.connect(bellGain);
      bellGain.connect(this.ctx.destination);
      bell.start(t);
      bell.stop(t + 0.8);

      // Initial cracker burst
      this.playCrackerBurst();
    } catch {
      // Fallback
    }
  }

  // Firecracker pop (Dussehra Patakhe)
  playCrackerBurst() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Random small bursts
      const count = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const offset = Math.random() * 0.4;
        const popTime = t + offset;

        const pop = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        pop.type = 'square';
        pop.frequency.setValueAtTime(180 + Math.random() * 600, popTime);
        pop.frequency.exponentialRampToValueAtTime(40, popTime + 0.08);

        popGain.gain.setValueAtTime(0.15 + Math.random() * 0.1, popTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.08);

        pop.connect(popGain);
        popGain.connect(this.ctx.destination);
        pop.start(popTime);
        pop.stop(popTime + 0.08);
      }
    } catch {
      // Fallback
    }
  }

  // Sustained fire crackle
  playFireCrackle() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.85 ? 1 : 0.1);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(1200, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      noise.connect(hp);
      hp.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.25);
    } catch {
      // Fallback
    }
  }

  // Triumphant victory fanfare & celestial temple bell sound
  playVictoryFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Harmonic chords (Raag Yaman inspired celebratory notes: Sa Re Ga Pa Dha Sa)
      // D4 (293.66), F#4 (369.99), A4 (440.00), D5 (587.33), F#5 (739.99)
      const notes = [
        { freq: 293.66, time: 0, dur: 0.6 },
        { freq: 369.99, time: 0.2, dur: 0.6 },
        { freq: 440.00, time: 0.4, dur: 0.8 },
        { freq: 587.33, time: 0.65, dur: 1.4 },
        { freq: 739.99, time: 0.9, dur: 1.8 }
      ];

      notes.forEach(({ freq, time, dur }) => {
        if (!this.ctx) return;
        const noteTime = t + time;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.01, noteTime);
        gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + dur);
      });

      // Temple bell chime
      const bellFreqs = [880, 1320, 1760];
      bellFreqs.forEach((bfreq) => {
        if (!this.ctx) return;
        const bellOsc = this.ctx.createOscillator();
        const bellG = this.ctx.createGain();
        bellOsc.type = 'triangle';
        bellOsc.frequency.setValueAtTime(bfreq, t + 0.7);

        bellG.gain.setValueAtTime(0.12, t + 0.7);
        bellG.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

        bellOsc.connect(bellG);
        bellG.connect(this.ctx.destination);

        bellOsc.start(t + 0.7);
        bellOsc.stop(t + 2.5);
      });
    } catch {
      // Fallback
    }
  }

  // Click reaction: Pluck/vibrate the bowstring (~0.4s)
  playBowPluck() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.35);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch {
      // Fallback
    }
  }

  // Click reaction: Characteristic short Ravana evil laugh (~1.4s)
  playRavanaLaugh() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 4 rhythmic deep demon syllables: "HA - HA - HA - HAARGH"
      const laughPulses = [
        { time: 0.0, freq: 115, dur: 0.22, pitchDrop: 85 },
        { time: 0.26, freq: 108, dur: 0.22, pitchDrop: 80 },
        { time: 0.52, freq: 100, dur: 0.25, pitchDrop: 75 },
        { time: 0.82, freq: 90, dur: 0.45, pitchDrop: 55 },
      ];

      laughPulses.forEach((p) => {
        if (!this.ctx) return;
        const pt = t + p.time;

        const osc = this.ctx.createOscillator();
        const sub = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(p.freq, pt);
        osc.frequency.exponentialRampToValueAtTime(p.pitchDrop, pt + p.dur);

        sub.type = 'triangle';
        sub.frequency.setValueAtTime(p.freq * 0.5, pt);
        sub.frequency.exponentialRampToValueAtTime(p.pitchDrop * 0.5, pt + p.dur);

        // Vocal formant filter (creates 'Aah'/'Ha' demon throat resonance)
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, pt);
        filter.Q.setValueAtTime(3.5, pt);

        gain.gain.setValueAtTime(0.01, pt);
        gain.gain.linearRampToValueAtTime(0.3, pt + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, pt + p.dur);

        osc.connect(filter);
        sub.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(pt);
        sub.start(pt);
        osc.stop(pt + p.dur);
        sub.stop(pt + p.dur);
      });
    } catch {
      // Fallback
    }
  }
}

export const soundEngine = new DussehraSoundEngine();
