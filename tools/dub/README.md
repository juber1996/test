# Bengali video dubbing

Turns a Hindi/Urdu/English video into a Bengali-dubbed video (Bengali voice,
original audio kept quietly underneath, optional burned-in Bengali subtitles,
plus an `.srt` caption file).

## Setup (once per machine)

```bash
pip install faster-whisper edge-tts
apt-get install -y ffmpeg fonts-noto-core   # Noto Sans Bengali for subtitles
```

Network hosts needed: `huggingface.co` (+ its CDN hosts) for the Whisper model,
`speech.platform.bing.com` for the Bengali voice. In the cloud environment these
are allowed in the `video-dubbing` environment.

## Steps

```bash
# 1. speech -> timed text (Whisper large-v3, CPU)
python3 tools/dub/transcribe.py input.mp4 work/segments.json --lang hi

# 2. add a "bn" field (Bengali translation) to every segment in segments.json

# 3. build the dubbed video
python3 tools/dub/dub.py input.mp4 work/segments.json out/output_bn.mp4 --subs
```

`dub.py` options:

| option | default | meaning |
|---|---|---|
| `--voice` | `bn-IN-TanishaaNeural` | also `bn-IN-BashkarNeural` (male), `bn-BD-NabanitaNeural`, `bn-BD-PradeepNeural` (Bangladesh accent) |
| `--rate` | `+0%` | base speaking speed, e.g. `+10%` |
| `--bg` | `0.15` | volume of original audio under the dub (`0` removes it) |
| `--subs` | off | burn Bengali subtitles into the picture |

Lines that are longer than their time slot are sped up by at most 1.35x; the
script prints `(overruns slot)` when a line still doesn't fit, and that line's
translation should be shortened.
