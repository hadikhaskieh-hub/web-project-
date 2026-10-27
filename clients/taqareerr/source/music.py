"""Synthesizes the 30s news-intro music bed + sound design, synced to intro.html.

120 bpm, D minor. Hits land on the visual beats: cold-open burst, the
"verified" stamp, the logo burst. Whooshes ride every stripe wipe.
Usage: python3 music.py out.wav
"""
import sys
import wave
import numpy as np

SR = 48000
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5
WIPES = [1.5, 7.0, 13.5, 19.5, 24.5]
HITS = [0.15, 12.1, 25.35]
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR


def hz(note):  # midi -> Hz
    return 440.0 * 2 ** ((note - 69) / 12)


def spectral_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * g, len(x))


def place(buf, sig, at):
    i = int(at * SR)
    j = min(N, i + len(sig))
    if i < N: buf[i:j] += sig[: j - i]


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


# ---- stems ----
kick = np.zeros(N); bass = np.zeros(N); ticks = np.zeros(N); pad = np.zeros(N)
pluck = np.zeros(N); fx = np.zeros(N)

# kick: pitch-swept sine
n = int(.35 * SR); tt = np.arange(n) / SR
k = np.sin(2 * np.pi * np.cumsum(45 + 95 * np.exp(-tt / .03)) / SR) * env(n, .002, .12)

# chord loop (2 bars each): Dm, Bb, F, C
CHORDS = [[62, 65, 69], [58, 62, 65], [57, 60, 65], [55, 60, 64]]
ROOTS = [38, 34, 41, 36]

def chord_at(time):
    return int(time // 4) % 4

# pulse section: from the first wipe until the logo
beat_times = np.arange(1.5, 24.5, BEAT)
for bt in beat_times:
    place(kick, k * (1.0 if (bt - 1.5) % 2 == 0 else .75), bt)
    root = hz(ROOTS[chord_at(bt)])
    n = int(.45 * SR); tt = np.arange(n) / SR
    b = np.tanh(1.6 * np.sin(2 * np.pi * root * tt)) * env(n, .005, .22)
    place(bass, b, bt)

# teleprinter ticks on 8ths, accented off-beats; start after the hook lands
for i, tt0 in enumerate(np.arange(2.0, 24.5, BEAT / 2)):
    n = int(.03 * SR)
    noise = rng.standard_normal(n) * env(n, .0005, .006)
    place(ticks, noise * (1 if i % 2 else .55), tt0)
ticks = spectral_filter(ticks, lo=5000)

# pad: detuned saws, whole piece, swells in, ducks under kick
for c in range(8):
    start = c * 4.0
    n = int(4.3 * SR); tt = np.arange(n) / SR
    sig = np.zeros(n)
    for note in CHORDS[c % 4]:
        for det in (-0.12, 0.0, 0.11):
            f = hz(note - 12) * 2 ** (det / 12)
            sig += 2 * ((tt * f) % 1) - 1
    a = np.minimum(tt / .6, 1) * np.minimum((4.3 - tt) / .4, 1)
    place(pad, sig * a / 9, start)
pad = spectral_filter(pad, hi=1400)

# plucks: 16th-note arpeggio during the "verify" and "field" scenes
for i, tt0 in enumerate(np.arange(7.0, 24.5, BEAT / 4)):
    ch = CHORDS[chord_at(tt0)]
    note = (ch + [ch[0] + 12])[[0, 1, 2, 3, 2, 1, 0, 2][i % 8]] + 12
    n = int(.18 * SR); tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * hz(note) * tt) + .3 * np.sin(4 * np.pi * hz(note) * tt)) * env(n, .002, .05)
    place(pluck, s * (1 if i % 4 == 0 else .6), tt0)

# whooshes: rising filtered noise into each wipe, falling tail after
for T in WIPES:
    n = int(.9 * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n); y = 0.0
    for i in range(n):
        tt = i / SR - .45  # 0 at the cut
        fc = 300 + 5200 * np.exp(-abs(tt) / .18)
        a = 1 - np.exp(-2 * np.pi * fc / SR)
        y += a * (noise[i] - y); out[i] = y
    shape = np.exp(-((np.arange(n) / SR - .45) / .22) ** 2)
    place(fx, out * shape * .9, T - .45)

# impacts: sub boom + noise crack
for H, size in zip(HITS, (0.8, 1.0, 1.3)):
    n = int(2.0 * SR); tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-tt / .05)) / SR) * env(n, .002, .55)
    crack = spectral_filter(rng.standard_normal(n), lo=1500) * env(n, .001, .05)
    place(fx, (boom * 1.1 + crack * .35) * size, H)

# final sting: open D chord swell at the follow button, ringing out
n = int(3.2 * SR); tt = np.arange(n) / SR
sting = sum(np.sin(2 * np.pi * hz(m) * tt) for m in (50, 57, 62, 69, 74)) * env(n, .01, 1.1) / 5
place(pluck, sting * 2.2, 27.3)

# sidechain pump on pad from kick times
duck = np.ones(N)
for bt in beat_times:
    i = int(bt * SR); m = min(N - i, int(.4 * SR))
    duck[i:i + m] = np.minimum(duck[i:i + m], 1 - .55 * np.exp(-np.arange(m) / SR / .12))

# arrangement: pad thinner under the hook, bed drops at the logo
pad_gain = np.interp(t_all, [0, 1.5, 7, 24.3, 25.3, 30], [.35, .45, .7, .7, .5, .0])
mix = (kick * .9 + bass * .32 + ticks * .22 + pad * pad_gain * duck + pluck * .16 + fx * .7)
mix *= np.interp(t_all, [0, .05, 28.8, 30], [0, 1, 1, 0])  # fades
mix = np.tanh(mix * 1.1) / 1.1
mix /= np.max(np.abs(mix)) * 1.12

stereo = np.stack([mix, np.roll(mix, 12)], axis=1)  # tiny width
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())
