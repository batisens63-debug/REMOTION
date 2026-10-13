"""Generates the Dome Motion music bed and sound effects (no external samples).

Usage: python3 scripts/make_audio.py
Writes public/dome/musique.wav, whoosh.wav, hit.wav, pop.wav
"""

import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 100
BEAT = 60 / BPM
DURATION = 66.0
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "dome")
rng = np.random.default_rng(7)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def lowpass(x, freq, order=2):
    return sosfilt(butter(order, freq, "low", fs=SR, output="sos"), x)


def highpass(x, freq, order=2):
    return sosfilt(butter(order, freq, "high", fs=SR, output="sos"), x)


def bandpass(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def place(buf, sound, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    end = min(len(buf), i + len(sound))
    buf[i:end] += sound[: end - i]


def kick():
    t = t_axis(0.45)
    freq = 45 + 85 * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(phase) * np.exp(-t * 7) * 0.9


def hat():
    t = t_axis(0.08)
    return highpass(rng.standard_normal(len(t)), 7000) * np.exp(-t * 60) * 0.12


def clap():
    t = t_axis(0.25)
    n = bandpass(rng.standard_normal(len(t)), 900, 3500)
    env = np.exp(-t * 18) + 0.6 * np.exp(-((t - 0.012) ** 2) / 0.00002)
    return n * env * 0.22


def saw(freq, t):
    return 2 * ((freq * t) % 1) - 1


def note(f):
    return 440 * 2 ** ((f - 69) / 12)


# Am - F - C - G, two bars each (midi notes)
CHORDS = [
    [57, 60, 64, 69],
    [53, 57, 60, 65],
    [48, 55, 60, 64],
    [55, 59, 62, 67],
]
BASS = [45, 41, 48, 43]


def build_music():
    n = int(DURATION * SR)
    drums = np.zeros(n)
    bass = np.zeros(n)
    pad = np.zeros(n)
    side = np.ones(n)

    total_beats = int(DURATION / BEAT)
    k, h, c = kick(), hat(), clap()
    for b in range(total_beats):
        at = b * BEAT
        intro = at < 4.8
        outro = at > DURATION - 7
        if not intro and not outro:
            place(drums, k, at)
            # sidechain pump
            i = int(at * SR)
            pump = 1 - 0.55 * np.exp(-t_axis(BEAT) * 9)
            side[i : i + len(pump)] = np.minimum(side[i : i + len(pump)], pump[: n - i])
            if b % 2 == 1:
                place(drums, c, at)
            place(drums, h, at + BEAT / 2)
            if at > 20:
                place(drums, h * 0.6, at + BEAT * 0.75)

    bar = BEAT * 4
    t_chord = t_axis(bar * 2)
    for i in range(int(DURATION / (bar * 2)) + 1):
        start = i * bar * 2
        idx = i % 4
        env = np.minimum(1, t_chord / 0.6) * np.minimum(1, (bar * 2 - t_chord) / 0.4)
        chord = np.zeros(len(t_chord))
        for m in CHORDS[idx]:
            f = note(m)
            chord += saw(f, t_chord) + saw(f * 1.004, t_chord) + saw(f * 0.996, t_chord)
        chord = lowpass(chord, 1400) * env * 0.035
        place(pad, chord, start)
        # bass on eighths
        fb = note(BASS[idx])
        for e in range(16):
            tb = t_axis(BEAT / 2)
            tone = (np.sin(2 * np.pi * fb * tb) + 0.35 * saw(fb, tb)) * np.exp(-tb * 5)
            if start + e * BEAT / 2 > 4.8:
                place(bass, lowpass(tone, 500) * 0.22, start + e * BEAT / 2)

    mix = drums + (bass + pad) * side
    # gentle fade in/out
    tt = t_axis(DURATION)
    mix *= np.minimum(1, tt / 1.5) * np.minimum(1, (DURATION - tt) / 3)
    mix = np.tanh(mix * 1.3) * 0.8
    stereo = np.stack([mix, np.roll(mix, 220) * 0.98], axis=1)
    return stereo


def whoosh():
    t = t_axis(0.9)
    noise = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    # sweep a band through the noise in chunks
    chunk = 1024
    for i in range(0, len(t), chunk):
        p = i / len(t)
        center = 300 + 4500 * np.sin(np.pi * p) ** 2
        seg = bandpass(noise[i : i + chunk + 512], center * 0.6, center * 1.4)[:chunk]
        out[i : i + len(seg)] = seg[: len(out) - i]
    env = np.sin(np.pi * np.minimum(1, t / 0.9)) ** 2
    return out * env * 0.5


def hit():
    t = t_axis(1.6)
    boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-t * 10)) * t) * np.exp(-t * 3)
    noise = lowpass(rng.standard_normal(len(t)), 2500) * np.exp(-t * 6) * 0.3
    return np.tanh((boom + noise) * 1.5) * 0.7


def pop():
    t = t_axis(0.12)
    return np.sin(2 * np.pi * (900 - 500 * t / 0.12) * t) * np.exp(-t * 40) * 0.4


def save(name, data):
    data = np.asarray(data)
    peak = np.max(np.abs(data)) or 1
    if peak > 0.98:
        data = data / peak * 0.98
    wavfile.write(os.path.join(OUT, name), SR, (data * 32767).astype(np.int16))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    save("musique.wav", build_music())
    save("whoosh.wav", whoosh())
    save("hit.wav", hit())
    save("pop.wav", pop())
    print("ok")
