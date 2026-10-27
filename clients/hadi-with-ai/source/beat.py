"""Synthesizes a 30s Brazilian-phonk style track synced to reel.html.

128 bpm, A minor: distorted sliding 808 on a tresillo kick, claps, hats,
the signature phonk cowbell melody, plus risers/impacts/blips on the cuts.
Usage: python3 beat.py out.wav
"""
import sys
import wave
import numpy as np

SR = 48000
N = int(SR * 30.0)
BEAT = 60 / 128
STEP = BEAT / 4
BAR = BEAT * 4
rng = np.random.default_rng(11)
T = np.arange(N) / SR

# arrangement (seconds) — mirrors the edit
DRUMS = [(3.75, 20.625), (20.625 + BEAT * 2, 28.125)]
KILLS = [7.5, 13.125, 18.75]
HITS = [0.0, BEAT, BEAT * 2, 20.625, 20.625 + BEAT, 20.625 + BEAT * 5, 24.375 + BEAT * 3, 26.25]
BLIPS = [BEAT * 5, BEAT * 6, BEAT * 7] + [24.375 + BEAT * (1 + i / 2) for i in range(4)]
SCENES = [9.375, 15.0, 24.375]       # snare-roll fills land on these
ROOTS = [33, 33, 29, 31]             # A1 A1 F1 G1, one per bar


def hz(m): return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)


def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * g, len(x))


def place(buf, sig, at, gain=1.0):
    i = int(round(at * SR))
    if i >= N: return
    j = min(N, i + len(sig)); buf[i:j] += sig[: j - i] * gain


def drums_on(t): return any(a <= t < b for a, b in DRUMS)


kick = np.zeros(N); sub = np.zeros(N); clap = np.zeros(N); hat = np.zeros(N)
bell = np.zeros(N); bell_intro = np.zeros(N); fx = np.zeros(N); tom = np.zeros(N)

# ---- one-shots ----
n = int(.3 * SR); t = np.arange(n) / SR
KICK = np.tanh(3 * np.sin(2 * np.pi * np.cumsum(48 + 140 * np.exp(-t / .025)) / SR) * env(n, .001, .09))

def make_808(root, length=.55):
    n = int(length * SR); t = np.arange(n) / SR
    f = hz(root) * 2 ** ((5 * np.exp(-t / .035)) / 12)      # slide down into the note
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .003, length * .55)
    return np.tanh(4.5 * s)                                  # the phonk crunch

def make_clap():
    n = int(.25 * SR); x = np.zeros(n)
    for k, off in enumerate((0, .011, .022)):
        i = int(off * SR); m = n - i
        x[i:] += rng.standard_normal(m) * env(m, .0005, .012 if k < 2 else .09)
    return filt(x, lo=900, hi=6000)
CLAP = make_clap()

n = int(.05 * SR)
HAT = filt(rng.standard_normal(n) * env(n, .0005, .012), lo=7500)
OPEN = filt(rng.standard_normal(int(.25 * SR)) * env(int(.25 * SR), .001, .08), lo=6500)

def make_tom():
    n = int(.18 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(170 + 90 * np.exp(-t / .02)) / SR) * env(n, .001, .06)
TOM = make_tom()

def make_bell(m, length=.32):
    n = int(length * SR); t = np.arange(n) / SR
    f = hz(m)
    sq = lambda fr: np.sign(np.sin(2 * np.pi * fr * t))
    s = (sq(f) + .8 * sq(f * 1.4836)) * env(n, .001, .09)
    return np.tanh(2.2 * filt(s, lo=500, hi=5200))

BELL_A = [(0, 81), (2, 79), (3, 76), (5, 79), (6, 76), (8, 74), (10, 76), (11, 72), (13, 74), (14, 69)]
BELL_B = [(0, 81), (2, 84), (3, 81), (5, 79), (6, 76), (8, 79), (10, 81), (11, 76), (13, 74), (14, 76)]
bell_cache = {}

# ---- sequence the 16 bars ----
for bar in range(16):
    b0 = bar * BAR
    root = ROOTS[bar % 4]
    for s in range(16):
        at = b0 + s * STEP
        if not drums_on(at):
            continue
        if s in (0, 3, 6, 10):                       # tresillo-ish kick + 808
            place(kick, KICK, at)
            place(sub, make_808(root + (12 if s == 10 and bar % 2 else 0), .5 if s != 10 else .9), at)
        if s in (4, 12):
            place(clap, CLAP, at)
        if s in (7, 14) and bar % 2:
            place(tom, TOM, at, .8)
        if s in (2, 9, 13):
            place(tom, TOM, at, .5)
        if s % 2 == 0:
            place(hat, HAT, at, 1.0 if s % 4 == 2 else .6)
        if s == 14:
            place(hat, OPEN, at, .6)
    pat = BELL_A if bar % 2 == 0 else BELL_B
    for s, m in pat:
        at = b0 + s * STEP
        sig = bell_cache.setdefault(m, make_bell(m))
        if drums_on(at):
            place(bell, sig, at, 1.0 if s in (0, 8) else .8)
        elif at < 3.75:
            place(bell_intro, sig, at, .9)

# snare-roll fills into scene changes: 16ths on the last beat, rising
for sc in SCENES:
    for k in range(4):
        place(clap, CLAP, sc - BEAT + k * STEP, .45 + .18 * k)

# final phrase: a lone cowbell line over a long 808 after the beat stops
for s, m in BELL_A[:7]:
    place(bell, bell_cache[m], 28.125 + s * STEP, .7)
place(sub, make_808(33, 1.6), 28.125, 1.0)
place(kick, KICK, 28.125)

# ---- fx ----
# intro riser (0 → 3.75): noise through an opening filter + rising tone
n = int(3.75 * SR); t = np.arange(n) / SR
noise = rng.standard_normal(n); out = np.zeros(n); y = 0.0
for i in range(n):
    fc = 200 + 7000 * (t[i] / 3.75) ** 2.5
    a = 1 - np.exp(-2 * np.pi * fc / SR); y += a * (noise[i] - y); out[i] = y
tone = np.sin(2 * np.pi * np.cumsum(180 + 900 * (t / 3.75) ** 2) / SR) * .25
riser = (out * .8 + tone) * (t / 3.75) ** 2
riser[-int(.06 * SR):] *= np.linspace(1, 0, int(.06 * SR))
place(fx, riser, 0, .9)
bell_intro = filt(bell_intro, hi=1100) * np.interp(T, [0, 3.6, 3.75], [.5, 1, 0])

def impact(size):
    n = int(1.6 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-t / .04)) / SR) * env(n, .001, .45)
    crash = filt(rng.standard_normal(n), lo=3000) * env(n, .001, .35)
    return (np.tanh(2 * boom) + crash * .45) * size

def reverse_swell(length=.45):
    n = int(length * SR); t = np.arange(n) / SR
    x = filt(rng.standard_normal(n), lo=2500) * (t / length) ** 3
    return x

for k in KILLS:
    place(fx, reverse_swell(), k - .45, .7)
    place(fx, impact(1.2), k)
for h in HITS:
    place(fx, impact(.75), h)
    place(kick, KICK, h)
    place(sub, make_808(33, .7), h, .9)
for bl in BLIPS:
    n = int(.09 * SR); t = np.arange(n) / SR
    place(fx, np.sign(np.sin(2 * np.pi * 1320 * t)) * env(n, .001, .03), bl, .35)

# ---- mix ----
duck = np.ones(N)  # sidechain the bell a touch under each kick
for i in np.nonzero(np.abs(np.diff(kick, prepend=0)) > .5)[0][::200]:
    m = min(N - i, int(.15 * SR)); duck[i:i + m] = np.minimum(duck[i:i + m], 1 - .35 * np.exp(-np.arange(m) / SR / .05))

mix = (kick * .8 + sub * .55 + clap * .55 + hat * .22 + tom * .3 + bell * .3 * duck + bell_intro * .35 + fx * .55)
mix *= np.interp(T, [0, .01, 29.3, 30], [0, 1, 1, 0])
mix = np.tanh(mix * 1.3) / 1.3
mix /= np.max(np.abs(mix)) * 1.1
st = np.stack([mix, np.roll(mix, 14)], axis=1)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
