let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playTone(
  enabled: boolean,
  freq: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.06
) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(gainPeak, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000 + 0.02);
  } catch {
    // Audio playback blocked or unavailable
  }
}

export const soundFx = {
  click: (enabled: boolean) => playTone(enabled, 520, 45, 'triangle', 0.04),
  relaySnap: (enabled: boolean) => playTone(enabled, 190, 65, 'square', 0.045),
  success: (enabled: boolean) => {
    if (!enabled) return;
    playTone(true, 523.25, 110, 'sine', 0.06);
    setTimeout(() => playTone(true, 659.25, 150, 'sine', 0.06), 95);
  },
  fault: (enabled: boolean) => {
    if (!enabled) return;
    playTone(true, 220, 140, 'sawtooth', 0.05);
    setTimeout(() => playTone(true, 165, 190, 'sawtooth', 0.05), 130);
  },
  complete: (enabled: boolean) => {
    if (!enabled) return;
    playTone(true, 523.25, 110, 'triangle', 0.06);
    setTimeout(() => playTone(true, 659.25, 110, 'triangle', 0.06), 95);
    setTimeout(() => playTone(true, 783.99, 220, 'triangle', 0.07), 190);
  },
};
