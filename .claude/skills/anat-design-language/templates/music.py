"""Background music for demo.cjs, composed in code: no library, no licence, no key.
usage: python3 -I music.py <out.wav> <seconds> [mood] [lift_at_seconds]
moods: wonder (default: warm pad, slow piano arpeggio, D major, I-V-vi-IV), calm (pad only), drive (faster pulse).
lift_at: from that second the arpeggio doubles and a bell shimmer enters (the "magic wand" moment, the closing card).
The track is quiet by design: demo.cjs ducks it further under the narration.
"""
import sys, wave
import numpy as np

SR = 44100
out, secs = sys.argv[1], float(sys.argv[2])
mood = sys.argv[3] if len(sys.argv) > 3 else 'wonder'
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
    mix[i0:i1] += 0.035 * sig * env

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

if mood != 'calm':
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
for k in range(int(secs / BAR) + 1):
    at = k * BAR
    i0 = int(at * SR)
    if i0 >= n:
        break
    L = min(n - i0, int(BAR * SR))
    tt = np.arange(L) / SR
    mix[i0:i0 + L] += 0.06 * np.sin(2 * np.pi * hz(CHORDS[k % 4][0] - 12) * tt) * (1 - np.exp(-tt * 20)) * np.exp(-tt * 0.5)

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
fade = np.clip(t / 1.5, 0, 1) * np.clip((secs - t) / 2.5, 0, 1)
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
