"""Calm, luxurious music bed for the handbag ad, synthesized (no samples, no copyright).

72 bpm, D major: soft electric-piano chords, a warm pad, a quiet sub, and small chimes on
the scene changes. Timings follow TL in ad.html.
Usage: python3 music.py out.wav
"""
import sys
import wave

import numpy as np

SR = 48000
DUR = 21.5
N = int(SR * DUR)
BEAT = 60 / 72
CUTS = [2.4, 8.4, 10.1, 11.8, 13.5, 15.5, 17.5]   # scene / tile changes
FLIPS = [4.7, 7.3]
T = np.arange(N) / SR
rng = np.random.default_rng(5)


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def lowpass(x, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / hi) ** 4), len(x))


def place(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= N: return
    j = min(N, i + len(sig)); buf[i:j] += sig[: j - i] * gain


def epiano(m, length=3.2):
    """FM bell-ish electric piano note."""
    n = int(length * SR); t = np.arange(n) / SR; f = hz(m)
    mod = np.sin(2 * np.pi * f * 2 * t) * 1.6 * np.exp(-t / .35)
    return np.sin(2 * np.pi * f * t + mod) * env(n, .004, 1.1)


def chime(m):
    n = int(2.2 * SR); t = np.arange(n) / SR; f = hz(m)
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / .2)) * env(n, .002, .55)


# Dmaj9 – Bm9 – Gmaj7 – A6/9, two bars (8 beats = 6.67s) would be too slow: one bar each
CHORDS = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 59], [45, 52, 54, 59, 61]]
BAR = BEAT * 4
keys = np.zeros(N); pad = np.zeros(N); sub = np.zeros(N); fx = np.zeros(N)

for bar in range(int(DUR / BAR) + 1):
    ch = CHORDS[bar % 4]; t0 = bar * BAR
    # rolled chord on the downbeat, a soft answer on beat 3
    for k, m in enumerate(ch):
        place(keys, epiano(m + 12), t0 + k * .045, .5 if k else .7)
    for k, m in enumerate(ch[2:]):
        place(keys, epiano(m + 24, 2.0), t0 + BEAT * 2 + k * .06, .22)
    # pad: detuned sines, slow swell
    n = int((BAR + .6) * SR); t = np.arange(n) / SR
    sw = np.minimum(t / 1.2, 1) * np.minimum((BAR + .6 - t) / .6, 1)
    for m in ch[1:]:
        for det in (-.07, .07):
            place(pad, np.sin(2 * np.pi * hz(m + 12) * 2 ** (det / 12) * t) * sw, t0, .1)
    n = int(BAR * SR); t = np.arange(n) / SR
    place(sub, np.sin(2 * np.pi * hz(ch[0] - 12) * t) * np.minimum(t / .05, 1) * np.exp(-t / 1.6), t0, .5)

for i, c in enumerate(CUTS):
    place(fx, chime([86, 81, 83, 88, 90, 86, 93][i]), c, .16)
for f in FLIPS:  # airy whoosh under each turn of the bag
    n = int(1.0 * SR); t = np.arange(n) / SR
    w = lowpass(rng.standard_normal(n), 2600) * np.exp(-((t - .45) / .2) ** 2)
    place(fx, w, f - .1, .22)

mix = lowpass(keys, 5200) * .5 + lowpass(pad, 3000) * .6 + sub * .35 + fx
mix *= np.interp(T, [0, .4, DUR - 2.2, DUR], [0, 1, 1, 0])
mix = np.tanh(mix * 1.1) / 1.1
mix /= np.abs(mix).max() * 1.15
# gentle stereo width + a touch of room (two short delays)
L = mix + .22 * np.roll(mix, int(.037 * SR)); R = mix + .22 * np.roll(mix, int(.053 * SR))
st = np.stack([L, R], 1); st /= np.abs(st).max() * 1.1
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
