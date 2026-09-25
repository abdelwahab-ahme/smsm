// Comprehensive Web Audio API sound effects system for Samasm
// Provides musical chimes, tactile bubble pops, triumphant fanfare, success whistle (صفارة نجاح),
// points cascade, gentle sparkles, and volume control

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMutedState = false;
let globalVolume = 0.8;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(isMutedState ? 0 : globalVolume, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getMasterOutput(ctx: AudioContext): AudioNode {
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isMutedState ? 0 : globalVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);
  }
  return masterGain;
}

export function setGlobalVolume(volume: number) {
  globalVolume = Math.max(0, Math.min(1, volume));
  if (audioCtx && masterGain) {
    masterGain.gain.setValueAtTime(isMutedState ? 0 : globalVolume, audioCtx.currentTime);
  }
}

export function getGlobalVolume(): number {
  return globalVolume;
}

export function setGlobalSoundMuted(muted: boolean) {
  isMutedState = muted;
  if (audioCtx && masterGain) {
    masterGain.gain.setValueAtTime(muted ? 0 : globalVolume, audioCtx.currentTime);
  }
}

export function getGlobalSoundMuted(): boolean {
  return isMutedState;
}

/**
 * 1. Play Soft Click (Tactile button interaction)
 */
export function playClickSound() {
  if (isMutedState || globalVolume === 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const out = getMasterOutput(ctx);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(out);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (err) {
    console.error('Audio error (click):', err);
  }
}

/**
 * 2. Play Pop (Satisfying bubble pop for badge unlocking, avatar choosing, or modal opening)
 */
export function playPopSound() {
  if (isMutedState || globalVolume === 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const out = getMasterOutput(ctx);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.09);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(out);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (err) {
    console.error('Audio error (pop):', err);
  }
}

/**
 * 3. Play Chime (Vibrant harmonic bell chime for correct answer)
 */
export function playChimeSound() {
  if (isMutedState || globalVolume === 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const out = getMasterOutput(ctx);

    const now = ctx.currentTime;
    const frequencies = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      const noteStart = now + i * 0.06;
      const noteEnd = noteStart + 0.65;

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      osc.connect(gain);
      gain.connect(out);

      osc.start(noteStart);
      osc.stop(noteEnd);
    });
  } catch (err) {
    console.error('Audio error (chime):', err);
  }
}

/**
 * 4. Play Badge Unlock Sound (Triumphant celebratory fanfare)
 */
export function playBadgeUnlockSound() {
  if (isMutedState || globalVolume === 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const out = getMasterOutput(ctx);

    // Pop introductory trigger
    playPopSound();

    // Majestic melodic fanfare (C5 -> E5 -> G5 -> C6 -> E6 -> G6)
    const melody = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    const now = ctx.currentTime + 0.05;

    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === melody.length - 1 ? 'triangle' : 'sine';
      const noteStart = now + idx * 0.09;
      const noteEnd = noteStart + 0.6;

      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      osc.connect(gain);
      gain.connect(out);

      osc.start(noteStart);
      osc.stop(noteEnd);
    });
  } catch (err) {
    console.error('Audio error (badge unlock):', err);
  }
}

/**
 * 5. Play Success Whistle (صفارة نجاح مبهجة واحتفالية)
 * Joyful celebratory whistle glide with vibrant festive flutter!
 */
export function playSuccessWhistleSound() {
  if (isMutedState || globalVolume === 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const out = getMasterOutput(ctx);
    const now = ctx.currentTime;

    // First ascending energetic slide whistle
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';

    // Slide up: 1300Hz -> 2600Hz
    osc1.frequency.setValueAtTime(1300, now);
    osc1.frequency.exponentialRampToValueAtTime(2600, now + 0.16);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.32, now + 0.02);
    gain1.gain.setValueAtTime(0.32, now + 0.13);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gain1);
    gain1.connect(out);

    osc1.start(now);
    osc1.stop(now + 0.19);

    // Second celebratory double-chirp flutter whistle
    const chirpStart = now + 0.22;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';

    // Triumphant fluttering victory whistle
    osc2.frequency.setValueAtTime(2100, chirpStart);
    osc2.frequency.exponentialRampToValueAtTime(3200, chirpStart + 0.08);
    osc2.frequency.setValueAtTime(3000, chirpStart + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(3600, chirpStart + 0.22);

    gain2.gain.setValueAtTime(0, chirpStart);
    gain2.gain.linearRampToValueAtTime(0.35, chirpStart + 0.03);
    gain2.gain.setValueAtTime(0.32, chirpStart + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, chirpStart + 0.42);

    osc2.connect(gain2);
    gain2.connect(out);

    osc2.start(chirpStart);
    osc2.stop(chirpStart + 0.44);

    // Harmonic airy shimmer
    const noiseOsc = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noiseOsc.type = 'triangle';
    noiseOsc.frequency.setValueAtTime(4200, chirpStart);
    noiseOsc.frequency.exponentialRampToValueAtTime(6200, chirpStart + 0.18);

    noiseGain.gain.setValueAtTime(0, chirpStart);
    noiseGain.gain.linearRampToValueAtTime(0.06, chirpStart + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, chirpStart + 0.35);

    noiseOsc.connect(noiseGain);
    noiseGain.connect(out);

    noiseOsc.start(chirpStart);
    noiseOsc.stop(chirpStart + 0.36);
  } catch (err) {
    console.error('Audio error (success whistle):', err);
  }
}

/**
 * 6. Play Points Earned Sound (رنين وحصاد النقاط المبهج)
 * Golden sparkling coin cascade with resonant bell overtones
 */
export function playPointsEarnedSound() {
  if (isMutedState || globalVolume === 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const out = getMasterOutput(ctx);
    const now = ctx.currentTime;

    const freqs = [784, 987.77, 1318.51, 1568.0, 2093.0]; // G5, B5, E6, G6, C7
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const noteStart = now + idx * 0.06;
      const noteEnd = noteStart + 0.4;

      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.24, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      osc.connect(gain);
      gain.connect(out);

      osc.start(noteStart);
      osc.stop(noteEnd);
    });
  } catch (err) {
    console.error('Audio error (points earned):', err);
  }
}

/**
 * 7. Play Correct Sound (alias to chime for backward compatibility)
 */
export function playCorrectSound() {
  playChimeSound();
}

/**
 * 8. Play Gentle Try-Again Sound
 */
export function playTryAgainSound() {
  if (isMutedState || globalVolume === 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const out = getMasterOutput(ctx);

    const notes = [392.0, 329.63]; // G4 -> E4 gentle drop
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const noteStart = now + idx * 0.12;
      const noteEnd = noteStart + 0.28;

      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      osc.connect(gain);
      gain.connect(out);

      osc.start(noteStart);
      osc.stop(noteEnd);
    });
  } catch (err) {
    console.error('Audio error (try again):', err);
  }
}

/**
 * 9. Play Sparkle Sound
 */
export function playSparkleSound() {
  if (isMutedState || globalVolume === 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const out = getMasterOutput(ctx);

    const now = ctx.currentTime;
    const glissando = [1046.5, 1318.5, 1567.98, 2093.0, 2637.02];

    glissando.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const start = now + i * 0.05;
      const end = start + 0.35;

      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(out);

      osc.start(start);
      osc.stop(end);
    });
  } catch (err) {
    console.error('Audio error (sparkle):', err);
  }
}

// Backward-compat exports
export const setSoundMuted = setGlobalSoundMuted;
export const getSoundMuted = getGlobalSoundMuted;
