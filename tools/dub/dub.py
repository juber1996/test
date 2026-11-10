"""Step 3: build the Bengali-dubbed video from translated segments.

Usage:
  python3 tools/dub/dub.py input.mp4 work/segments.json output.mp4 \
      [--voice bn-IN-TanishaaNeural] [--bg 0.15] [--subs]

segments.json: list of {"start", "end", "bn"} (output of transcribe.py plus a
"bn" translation per segment). Each Bengali line is spoken with edge-tts,
sped up if needed to fit its time slot, and placed at the original start
time. The original audio is kept underneath at --bg volume (0 = remove).
--subs also burns Bengali subtitles into the picture.
"""
import argparse
import asyncio
import json
import os
import subprocess
import tempfile
import wave

import edge_tts
import numpy as np

SR = 24000
MAX_SPEEDUP = 1.35  # above this, speech starts to sound rushed


def run(*cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        check=True, capture_output=True, text=True,
    )
    return float(out.stdout.strip())


def to_pcm(src, dst, tempo=1.0):
    filters = []
    t = tempo
    while t > 2.0:  # atempo accepts at most 2.0 per stage
        filters.append("atempo=2.0")
        t /= 2.0
    if abs(t - 1.0) > 1e-3:
        filters.append(f"atempo={t:.4f}")
    cmd = ["ffmpeg", "-y", "-i", src, "-ac", "1", "-ar", str(SR)]
    if filters:
        cmd += ["-af", ",".join(filters)]
    run(*cmd, dst)
    with wave.open(dst) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)



def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def ass_time(t):
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02}:{cs // 100 % 60:02}.{cs % 100:02}"


def video_size(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
         "-of", "csv=p=0", path], check=True, capture_output=True, text=True,
    )
    w, h = out.stdout.strip().split(",")[:2]
    return int(w), int(h)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("video")
    p.add_argument("segments")
    p.add_argument("output")
    p.add_argument("--voice", default="bn-IN-TanishaaNeural")
    p.add_argument("--rate", default="+0%", help="base speaking rate, e.g. +5%%")
    p.add_argument("--bg", type=float, default=0.15, help="original audio volume under the dub")
    p.add_argument("--subs", action="store_true")
    a = p.parse_args()

    segs = [s for s in json.load(open(a.segments, encoding="utf-8")) if s.get("bn", "").strip()]
    total = duration(a.video)
    track = np.zeros(int(total * SR) + SR, dtype=np.float32)
    proxy = os.environ.get("HTTPS_PROXY")
    tmp = tempfile.mkdtemp(prefix="dub_")

    for i, s in enumerate(segs):
        mp3 = os.path.join(tmp, f"{i}.mp3")
        comm = edge_tts.Communicate(s["bn"], a.voice, rate=a.rate, proxy=proxy)
        asyncio.run(comm.save(mp3))
        # slot = until the next segment starts (or video end), not just this segment's end
        nxt = segs[i + 1]["start"] if i + 1 < len(segs) else total
        slot = max(nxt - s["start"], 0.3)
        spoken = duration(mp3)
        tempo = min(max(spoken / slot, 1.0), MAX_SPEEDUP)
        pcm = to_pcm(mp3, os.path.join(tmp, f"{i}.wav"), tempo)
        start = int(s["start"] * SR)
        end = min(start + len(pcm), len(track))
        track[start:end] += pcm[: end - start]
        flag = "  (overruns slot)" if spoken / tempo > slot + 0.05 else ""
        print(f"[{i + 1}/{len(segs)}] {s['start']:.1f}s tempo={tempo:.2f}{flag}")

    track = np.clip(track, -32768, 32767).astype(np.int16)
    dub_wav = os.path.join(tmp, "dub.wav")
    with wave.open(dub_wav, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(track.tobytes())

    cmd = ["ffmpeg", "-y", "-i", a.video, "-i", dub_wav]
    if a.bg > 0:
        fc = (f"[0:a]volume={a.bg}[bg];[1:a]aresample=48000,volume=1.6[v];"
              f"[bg][v]amix=inputs=2:duration=first:normalize=0[aout]")
        amap = "[aout]"
    else:
        fc = "[1:a]aresample=48000,volume=1.6[aout]"
        amap = "[aout]"

    # always save an .srt next to the output (can be uploaded to Facebook as captions)
    os.makedirs(os.path.dirname(os.path.abspath(a.output)), exist_ok=True)
    with open(os.path.splitext(a.output)[0] + ".bn.srt", "w", encoding="utf-8") as f:
        for i, s in enumerate(segs, 1):
            f.write(f"{i}\n{srt_time(s['start'])} --> {srt_time(s['end'])}\n{s['bn']}\n\n")

    vcodec = ["-c:v", "copy"]
    vmap = ["-map", "0:v"]
    if a.subs:
        # ASS + the `ass` filter with complex shaping: needed for correct Bengali
        # conjuncts and vowel signs (the plain subtitles filter mis-orders them)
        w, h = video_size(a.video)
        ass = os.path.join(tmp, "bn.ass")
        with open(ass, "w", encoding="utf-8") as f:
            f.write(
                "[Script Info]\nScriptType: v4.00+\n"
                f"PlayResX: {w}\nPlayResY: {h}\nWrapStyle: 0\n\n"
                "[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, "
                "OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, "
                "Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
                f"Style: Default,Noto Sans Bengali,{round(min(w, h) * 0.055)},&H00FFFFFF,&H00FFFFFF,"
                f"&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,{max(2, round(h * 0.004))},0,2,"
                f"{round(w * 0.05)},{round(w * 0.05)},{round(h * 0.07)},1\n\n"
                "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
            )
            for s in segs:
                f.write(f"Dialogue: 0,{ass_time(s['start'])},{ass_time(s['end'])},Default,,0,0,0,,"
                        + s["bn"].replace("\n", "\\N") + "\n")
        fc += f";[0:v]ass={ass}:shaping=complex[vout]"
        vmap = ["-map", "[vout]"]
        vcodec = ["-c:v", "libx264", "-preset", "medium", "-crf", "20"]

    run(*cmd, "-filter_complex", fc, *vmap, "-map", amap, *vcodec,
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", a.output)
    print(f"done -> {a.output}")


if __name__ == "__main__":
    main()
