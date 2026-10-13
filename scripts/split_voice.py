"""Splits the full voice-over into one file per scene.

Usage: python3 scripts/split_voice.py public/dome/voix-raw.wav
Writes public/dome/voix/01.wav ... 10.wav (cut on the 9 longest pauses),
with a light "radio" polish (high-pass, compression, loudness normalisation).
Then set withVoice: true in the DomeMotionShowreel props.
"""

import os
import re
import subprocess
import sys

SCENES = 10
src = sys.argv[1]
out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "dome", "voix")
os.makedirs(out_dir, exist_ok=True)

probe = subprocess.run(
    ["ffmpeg", "-i", src, "-af", "silencedetect=noise=-38dB:d=0.25", "-f", "null", "-"],
    capture_output=True,
    text=True,
).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", probe)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", probe)]
total = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe).group(3)) + 60 * int(
    re.search(r"Duration: (\d+):(\d+):", probe).group(2)
)
# Expected boundaries from the length of each scene's line (read from the composition).
here = os.path.dirname(__file__)
with open(os.path.join(here, "..", "src", "Dome", "DomeShowreel.tsx"), encoding="utf-8") as f:
    lines = re.findall(r'vo: "([^"]+)"', f.read())
assert len(lines) == SCENES, lines
weights = [len(t) for t in lines]
mids = [((a + b) / 2, b - a) for a, b in zip(starts, ends) if a > 0.2 and b < total - 0.2]
cuts = [0.0]
acc = 0
for i in range(SCENES - 1):
    acc += weights[i]
    target = total * acc / sum(weights)
    # nearest pause to the expected position, longer pauses preferred
    candidates = [m for m in mids if m[0] > cuts[-1] + 0.5]
    best = min(candidates, key=lambda m: abs(m[0] - target) - 1.5 * m[1])
    cuts.append(best[0])
cuts.append(total)

polish = "highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=10:release=120,loudnorm=I=-16:TP=-1.5"
for i in range(SCENES):
    a, b = cuts[i], cuts[i + 1]
    dst = os.path.join(out_dir, f"{i + 1:02d}.wav")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-ss", f"{a:.3f}", "-to", f"{b:.3f}",
         "-af", f"silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse,{polish}",
         "-ar", "44100", dst],
        check=True,
    )
    print(f"{i + 1:02d}: {b - a:5.2f}s")
