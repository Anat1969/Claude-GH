"""Background music for demo.cjs, composed in code: no library, no licence, no key.
usage: python3 -I music.py <out.wav> <seconds> [mood] [lift_at_seconds]
moods: the lively family (Anat, 2026-11-11: "מוזיקה ראויה חיונית וחיננית מבלי להפריע להסבר", then "תגוון במוזיקה ועדיין
שתהיה חיננית חיונית ומעוררת השראה", after she heard wonder as funeral music): bright, spring, stroll, carousel, sunrise.
"lively:<film name>" picks one of them by the name, so every film has its own tune. Also wonder (warm pad, slow piano
arpeggio), calm (pad only), drive (faster pulse): only for a quiet, slow film she asks for.
lift_at: from that second the arpeggio doubles and a bell shimmer enters (the "magic wand" moment, the closing card).
The track is quiet by design: demo.cjs ducks it further under the narration.
"""
import sys, wave
import numpy as np

SR = 44100
out, secs = sys.argv[1], float(sys.argv[2])
mood = sys.argv[3] if len(sys.argv) > 3 else 'lively'
# degree of the chord (1-3) and octave, for every eighth of the bar
LIVELY = {
    # marimba in D, four-four, 116: the first one (the portfolio film)
    'bright': dict(bpm=116, key=0, steps=8, swing=0, dec=7.0, prog=['I', 'IV', 'vi', 'V'],
                   arp=[(1, 1), (3, 1), (2, 1), (3, 1), (1, 1), (3, 1), (2, 1), (3, 1)], acc=[1.0, .5, .7, .85, .6, .5, .8, .55],
                   bass=[(0, 0, 1.0), (3, 0, .6), (4, 7, .8), (6, 0, .5)], rim=[2, 6], top=[81, 83, 86, 85, 81, 78, 81, 76]),
    # pizzicato in G, quick and springy, 126
    'spring': dict(bpm=126, key=5, steps=8, swing=0, dec=10.0, prog=['I', 'V', 'vi', 'IV'],
                   arp=[(1, 1), (2, 1), (3, 1), (2, 1), (3, 1), (2, 1), (1, 2), (3, 1)], acc=[1.0, .6, .8, .5, .9, .5, .85, .6],
                   bass=[(0, 0, 1.0), (2, 0, .5), (4, 7, .8), (7, 0, .5)], rim=[2, 6], top=[78, 81, 83, 81, 86, 83, 81, 78]),
    # a strolling piano in C with a light swing, 100
    'stroll': dict(bpm=100, key=-2, steps=8, swing=0.2, dec=4.5, prog=['I', 'vi', 'ii', 'V'],
                   arp=[(1, 1), (3, 1), (2, 1), (1, 2), (3, 1), (2, 1), (3, 1), (1, 1)], acc=[.9, .6, .6, 1.0, .6, .9, .6, .7],
                   bass=[(0, 0, 1.0), (4, 7, .8), (6, 12, .5)], rim=[2, 6], top=[81, 85, 83, 81, 78, 81, 83, 86]),
    # a carousel in F, lilting six-eight, 132
    'carousel': dict(bpm=132, key=3, steps=6, swing=0, dec=6.0, prog=['I', 'IV', 'I', 'V'],
                     arp=[(1, 1), (2, 1), (3, 1), (1, 2), (3, 1), (2, 1)], acc=[1.0, .5, .6, .9, .5, .6],
                     bass=[(0, 0, 1.0), (3, 7, .7)], rim=[3], top=[81, 86, 85, 83, 81, 78, 83, 81]),
    # sunrise in E: the harmony climbs, the arpeggio rises through two octaves, 108. The most inspiring of the five.
    'sunrise': dict(bpm=108, key=2, steps=8, swing=0, dec=4.0, prog=['IV', 'I', 'V', 'vi'],
                    arp=[(1, 0), (2, 0), (3, 0), (1, 1), (2, 1), (3, 1), (1, 2), (3, 1)], acc=[.9, .5, .6, .8, .6, .7, 1.0, .6],
                    bass=[(0, 0, 1.0), (4, 0, .7)], rim=[4], top=[74, 78, 81, 83, 85, 86, 88, 90]),
}
# "lively" or "lively:<name of the film>": one of the family, always the same one for the same film, different across films.
if mood.split(':')[0] == 'lively':
    names = sorted(LIVELY)
    seed = mood.partition(':')[2]
    mood = names[sum(seed.encode('utf-8')) % len(names)] if seed else 'bright'
lift = float(sys.argv[4]) if len(sys.argv) > 4 else secs - 6
rng = np.random.default_rng(7)
n = int(secs * SR)
t = np.arange(n) / SR
mix = np.zeros(n)

def hz(m):
    return 440 * 2 ** ((m - 69) / 12)

# D major: I V vi IV, voiced close and warm (MIDI notes)
CHORDS = [[50, 57, 62, 66, 69], [45, 57, 61, 64, 69], [47, 54, 59, 62, 66], [43, 55, 59, 62, 67]]
BAR = {'wonder': 4.0, 'calm': 5.0, 'drive': 3.0}.get(mood, 4.0)

# pad: detuned sines with soft harmonics, long crossfades between chords
for k in range(int(np.ceil(secs / BAR)) + 1):
    a0 = k * BAR - 0.8
    i0, i1 = max(0, int(a0 * SR)), min(n, int((a0 + BAR + 1.6) * SR))
    if i0 >= i1:
        continue
    tt = t[i0:i1] - a0
    env = np.clip(tt / 1.2, 0, 1) * np.clip((BAR + 1.6 - tt) / 1.2, 0, 1)
    sig = np.zeros(i1 - i0)
    for m in CHORDS[k % 4]:
        f = hz(m)
        for det in (-0.12, 0.12):
            ph = rng.uniform(0, 6.28)
            sig += np.sin(2 * np.pi * (f + det) * t[i0:i1] + ph) + 0.18 * np.sin(4 * np.pi * (f + det) * t[i0:i1] + ph)
    mix[i0:i1] += (0.0 if mood in LIVELY else 0.035) * sig * env

# piano-like arpeggio (sine + harmonics, fast attack, exponential decay)
def pluck(at, m, vel=1.0, dec=1.6):
    i0 = int(at * SR)
    if i0 >= n:
        return
    L = min(n - i0, int(3.5 * SR))
    tt = np.arange(L) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 3) + 0.12 * np.sin(6 * np.pi * f * tt) * np.exp(-tt * 5)
    env = (1 - np.exp(-tt * 300)) * np.exp(-tt * dec)
    mix[i0:i0 + L] += 0.07 * vel * s * env

if mood != 'calm' and mood not in LIVELY:
    step = BAR / (6 if mood == 'drive' else 4)
    k = 0
    at = 1.0
    while at < secs - 1.5:
        ch = CHORDS[int(at // BAR) % 4]
        pattern = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12]
        pluck(at, pattern[k % 4], 0.9 if k % 4 == 0 else 0.6)
        if at >= lift:  # the lift: a second, higher voice in between
            pluck(at + step / 2, pattern[(k + 2) % 4] + 12, 0.35, 2.4)
        at += step
        k += 1

# bass: one soft root per bar
for k in range(0 if mood in LIVELY else int(secs / BAR) + 1):
    at = k * BAR
    i0 = int(at * SR)
    if i0 >= n:
        break
    L = min(n - i0, int(BAR * SR))
    tt = np.arange(L) / SR
    mix[i0:i0 + L] += 0.06 * np.sin(2 * np.pi * hz(CHORDS[k % 4][0] - 12) * tt) * (1 - np.exp(-tt * 20)) * np.exp(-tt * 0.5)

# The lively family: light, dancing pulses with nothing sustained under the voice. Each is a different tune (key, tempo,
# metre, pattern, register), so no two films sound the same (Anat, 2026-11-11: "תגוון במוזיקה ועדיין שתהיה חיננית חיונית
# ומעוררת השראה"). Plucked eighths on an arpeggio, a short bass, a shaker and a soft rim tick; a small tune on top.
if mood in LIVELY:
    V = LIVELY[mood]
    BEAT = 60 / V['bpm']
    N = V['steps']                      # eighths in a bar: 8 (four-four) or 6 (a lilting six-eight)
    E = BEAT / 2
    I_, IV_, V_, VI_, II_ = [50, 62, 66, 69], [43, 62, 67, 71], [45, 61, 64, 69], [47, 62, 66, 71], [40, 64, 67, 71]
    CH = {'I': I_, 'IV': IV_, 'V': V_, 'vi': VI_, 'ii': II_}
    BR = [[m + V['key'] for m in CH[c]] for c in V['prog']]
    bars = int(secs / (N * E)) + 1
    for b in range(bars):
        ch = BR[b % len(BR)]
        t0 = 0.3 + b * N * E
        for e in range(N):
            at = t0 + e * E + (V['swing'] * E if e % 2 else 0)
            if at > secs - 0.8:
                break
            deg, octv = V['arp'][e]
            pluck(at, ch[deg] + 12 * octv, V['acc'][e], V['dec'])
            if at >= lift and e % 2 == 1:
                pluck(at, ch[deg] + 12 * (octv + 1), 0.3, V['dec'] + 1)
            i0 = int(at * SR)
            L = min(n - i0, int(0.05 * SR))
            if L > 8:  # shaker: a few milliseconds of high noise, louder off the beat
                nz = np.diff(rng.standard_normal(L + 1))
                mix[i0:i0 + L] += (0.012 if e % 2 else 0.006) * nz * np.exp(-np.arange(L) / SR * 90)
        for e, up, vel in V['bass']:
            at = t0 + e * E
            i0 = int(at * SR)
            L = min(n - i0, int(0.45 * SR))
            if L > 8 and at < secs - 0.8:
                tt = np.arange(L) / SR
                f = hz(ch[0] + up)
                mix[i0:i0 + L] += 0.075 * vel * (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) * (1 - np.exp(-tt * 200)) * np.exp(-tt * 6)
        for e in V['rim']:
            at = t0 + e * E
            i0 = int(at * SR)
            L = min(n - i0, int(0.04 * SR))
            if L > 8 and at < secs - 0.8:
                tt = np.arange(L) / SR
                mix[i0:i0 + L] += 0.03 * np.sin(2 * np.pi * 1700 * tt) * np.exp(-tt * 120)
        for h in range(2):
            at = t0 + h * (N // 2) * E
            if 2.0 < at < secs - 1.2:
                pluck(at, V['top'][(b * 2 + h) % len(V['top'])] + V['key'], 0.5, 4.0)

# shimmer at the lift: high bells on the tonic chord
for j, m in enumerate([86, 90, 93, 98]):
    pluck(lift + 0.25 + j * 0.18, m, 0.45, 1.1)

# room: short convolution reverb from decaying noise
ir_len = int(2.2 * SR)
ir = rng.standard_normal(ir_len) * np.exp(-np.arange(ir_len) / SR * 3.0)
ir[0] = 0
wet = np.fft.irfft(np.fft.rfft(mix, n + ir_len) * np.fft.rfft(ir, n + ir_len))[:n]
mix = mix + 0.018 * wet

# fades, gentle limiter, stereo with a small Haas offset
fade = np.clip(t / (0.4 if mood in LIVELY else 1.5), 0, 1) * np.clip((secs - t) / 2.5, 0, 1)
mix = np.tanh(mix * fade * 1.4) * 0.55
mix /= max(1e-6, np.abs(mix).max()) / 0.5
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]])], 1)
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print(f'music: {out} {secs:.1f}s {mood}, lift at {lift:.1f}s')
