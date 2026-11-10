"""Step 1: transcribe a video into timed segments.

Usage: python3 tools/dub/transcribe.py input.mp4 work/segments.json [--lang hi]
Writes a JSON list of {"id", "start", "end", "text"}. The Bengali translation
is then added as a "bn" field on each segment (step 2) before running dub.py.
"""
import argparse
import json
import subprocess

import numpy as np

from faster_whisper import WhisperModel

p = argparse.ArgumentParser()
p.add_argument("video")
p.add_argument("out_json")
p.add_argument("--lang", default=None, help="source language code, e.g. hi, ur, en (auto if omitted)")
p.add_argument("--model", default="large-v3")
a = p.parse_args()

model = WhisperModel(a.model, device="cpu", compute_type="int8")
# decode with ffmpeg (avoids PyAV version issues): 16 kHz mono float32
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", a.video, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
    check=True, capture_output=True,
).stdout
audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
segments, info = model.transcribe(audio, language=a.lang, vad_filter=True, beam_size=5,
                                  word_timestamps=True)

# split Whisper segments into sentences using word timings, so each dubbed
# line / subtitle stays short and well-timed
ENDS = ("।", ".", "?", "!", "؟", "|")
sentences = []
for seg in segments:
    cur = []
    for w in seg.words or []:
        cur.append(w)
        if w.word.strip().endswith(ENDS) or (cur[-1].end - cur[0].start) > 8:
            sentences.append(cur)
            cur = []
    if cur:
        sentences.append(cur)
out = [
    {"id": i, "start": round(ws[0].start, 2), "end": round(ws[-1].end, 2),
     "text": "".join(w.word for w in ws).strip()}
    for i, ws in enumerate(sentences)
]
with open(a.out_json, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(f"language={info.language} ({info.language_probability:.2f}), {len(out)} segments -> {a.out_json}")
