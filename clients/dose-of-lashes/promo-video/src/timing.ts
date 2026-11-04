import { Easing, interpolate, spring } from 'remotion';
import beats from './beats.json';

// Beat times (seconds) detected with librosa from the song, relative to the
// song offset we start at (1.956 s into the track, same entry as the reference).
// 129 BPM, ~0.464 s per beat. Beat 33-37 is the near-silent break.
export const SONG_OFFSET = 1.956;
export const FPS = 30;

const beatTime = (n: number): number => {
  const i = Math.floor(n);
  const fr = n - i;
  const a = (beats as number[])[i];
  const b = (beats as number[])[i + 1] ?? a + 0.4641;
  return a + (b - a) * fr;
};

/** Frame of beat n (fractional beats allowed). */
export const B = (n: number): number => Math.max(0, Math.round(beatTime(n) * FPS));

export const END_BEAT = 72;
export const TOTAL_FRAMES = B(END_BEAT);

export const ease = (
  f: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing: (t: number) => number = Easing.out(Easing.cubic),
): number =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const inOut = Easing.inOut(Easing.cubic);

export const pop = (
  f: number,
  start: number,
  config: { damping?: number; stiffness?: number; mass?: number } = {},
): number =>
  f < start
    ? 0
    : spring({
        frame: f - start,
        fps: FPS,
        config: { damping: 14, stiffness: 170, mass: 0.9, ...config },
      });
