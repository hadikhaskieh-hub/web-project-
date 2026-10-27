"""Subtle sound design under the narration (no music): sub hits on each kill,
soft ticks on the rapid-fire strikes, airy whooshes on scene changes, a low swell on the logo.
Timings come from timeline.js, using the same rules as reel.html.
Usage: python3 sfx.py out.wav
"""
import json
import re
import sys

import numpy as np
import soundfile as sf

SR = 48000
src = open('timeline.js').read()
V = json.loads(re.search(r'window\.VO = (\{.*\});', src).group(1))
DUR = float(re.search(r'window\.VO_DUR = ([\d.]+);', src).group(1))
at = lambda i: V[i][0]
end = lambda i: V[i][1]
pre = lambda i: at(i) - .25

KILLS = [end('c3') - .45, end('d3') - .45, end('a3') - .45]
RAPID = [at(f'r{i}') + .12 for i in range(1, 7)]
CUTS = [pre('c1'), pre('d1'), pre('a1'), pre('r0'), pre('m1'), at('e1') - .3]
LOGO = at('e1') - .3

N = int((DUR + .5) * SR)
out = np.zeros(N)
rng = np.random.default_rng(3)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def band(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g /= np.sqrt(1 + (f / hi) ** 4)
    if lo: g /= np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * g, len(x))


def place(sig, t, gain):
    i = int(t * SR); j = min(N, i + len(sig))
    if 0 <= i < N: out[i:j] += sig[: j - i] * gain


n = int(1.4 * SR); tt = np.arange(n) / SR
HIT = np.sin(2 * np.pi * np.cumsum(42 + 60 * np.exp(-tt / .05)) / SR) * env(n, .002, .38) \
    + band(rng.standard_normal(n), lo=2500) * env(n, .001, .03) * .25
n = int(.06 * SR)
TICK = band(rng.standard_normal(n), lo=3000, hi=9000) * env(n, .0005, .01)
n = int(.7 * SR); tt = np.arange(n) / SR
WHOOSH = band(rng.standard_normal(n), lo=600, hi=5000) * np.exp(-((tt - .35) / .13) ** 2)
n = int(3.5 * SR); tt = np.arange(n) / SR
SWELL = sum(np.sin(2 * np.pi * f * tt) for f in (55, 82.5, 110)) / 3 * np.minimum(tt / .8, 1) * np.exp(-tt / 1.6)

for k in KILLS: place(HIT, k, .9)
for r in RAPID: place(TICK, r, .5)
for c in CUTS: place(WHOOSH, c - .35, .22)
place(SWELL, LOGO, .35)

sf.write(sys.argv[1], (out / max(1, np.abs(out).max() * 1.2)).astype(np.float32), SR)
print('sfx', len(KILLS), 'kills', len(RAPID), 'ticks')
