"""QA video final: durasi, keras suara, frame tiap 5 detik, dan sinkron narasi vs subtitle.

    venv-tts/bin/python rekam/qa.py <video.mp4> <folder-keluaran>

1. Durasi dan keras suara keseluruhan (ebur128: integrated LUFS, true peak).
2. Frame tiap 5 detik -> lembar kontak 3x3 (folder-keluaran/lembar-NN.png) untuk ditonton.
3. Sinkron: audio video final ditranskripsi Whisper (waktu per kata), lalu dibandingkan dengan waktu kata
   yang dipakai subtitle (src/data/narasi-v2.json + awal adegan dari src/adegan/daftar.ts).
   Melaporkan selisih rata-rata, persentil 95, dan maksimum, per adegan.
"""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

AKAR = Path(__file__).resolve().parents[1]
FPS = 60
JEDA_AWAL = float(re.search(r"JEDA_AWAL = ([\d.]+)", (AKAR / "src/data/narasi.ts").read_text()).group(1))


def jalankan(*a, **k):
    return subprocess.run(list(a), capture_output=True, text=True, **k)


def awal_adegan():
    narasi = json.loads((AKAR / "src/data/narasi-v2.json").read_text())
    daftar = (AKAR / "src/adegan/daftar.ts").read_text()
    t, hasil = 0.0, {}
    for id_, ekor in re.findall(r'id: "([^"]+)", nomor: "\d+", judul: "[^"]+", ekor: ([\d.]+)', daftar):
        frame = round((JEDA_AWAL + narasi[id_]["durasi"] + float(ekor)) * FPS)
        hasil[id_] = t
        t += frame / FPS
    return hasil, t, narasi


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main(video: str, keluar: str) -> None:
    out = Path(keluar)
    out.mkdir(parents=True, exist_ok=True)
    dur = float(jalankan("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video).stdout)
    eb = jalankan("ffmpeg", "-hide_banner", "-i", video, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-").stderr
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", eb)[-1])
    puncak = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", eb)[-1])
    print(f"Durasi {int(dur // 60)}:{dur % 60:05.2f} ({dur:.2f} dtk) · keras {lufs} LUFS · true peak {puncak} dBFS")

    # Frame tiap 5 detik -> lembar kontak.
    (out / "frame").mkdir(exist_ok=True)
    jalankan("ffmpeg", "-v", "error", "-y", "-i", video, "-vf", "fps=1/5,scale=640:-1,drawtext=text='%{pts\\:hms}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7", str(out / "frame/f-%03d.png"))
    jalankan("ffmpeg", "-v", "error", "-y", "-pattern_type", "glob", "-i", str(out / "frame/f-*.png"), "-vf", "tile=3x3:padding=4:color=white", str(out / "lembar-%02d.png"))
    print(f"Frame: {len(list((out / 'frame').glob('f-*.png')))} (tiap 5 dtk), lembar kontak di {out}")

    # Sinkron narasi.
    from faster_whisper import WhisperModel

    awal, total, narasi = awal_adegan()
    print(f"Durasi menurut daftar adegan: {total:.2f} dtk (selisih dengan video {dur - total:+.3f} dtk)")
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", video, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    audio = np.frombuffer(raw, np.float32)
    model = WhisperModel("medium", device="cpu", compute_type="int8")
    laporan = {}
    for id_, info in narasi.items():
        a = awal[id_] + JEDA_AWAL
        b = a + info["durasi"]
        potong = audio[int(max(0, a - 0.3) * 16000) : int((b + 0.5) * 16000)]
        segs, _ = model.transcribe(potong, language="id", beam_size=5, word_timestamps=True, condition_on_previous_text=False)
        kata_w = [(norm(w.word), max(0, a - 0.3) + w.start) for s in segs for w in (s.words or []) if norm(w.word)]
        harap = [(norm(k["k"]), a + k["m"]) for k in info["kata"] if norm(k["k"])]
        sm = difflib.SequenceMatcher(None, [x[0] for x in harap], [x[0] for x in kata_w], autojunk=False)
        selisih = [kata_w[j][1] - harap[i][1] for blok in sm.get_matching_blocks() for i, j in zip(range(blok.a, blok.a + blok.size), range(blok.b, blok.b + blok.size))]
        cocok = sm.ratio()
        if selisih:
            s = np.abs(np.array(selisih))
            laporan[id_] = {"kata": len(harap), "cocok": round(cocok, 3), "rata": round(float(np.mean(selisih)), 3), "p95": round(float(np.percentile(s, 95)), 3), "maks": round(float(s.max()), 3)}
        else:
            laporan[id_] = {"kata": len(harap), "cocok": round(cocok, 3)}
        print(id_, laporan[id_], flush=True)
    semua = [v for v in laporan.values() if "maks" in v]
    print(f"SINKRON: kecocokan kata rata-rata {np.mean([v['cocok'] for v in laporan.values()]):.3f}; selisih maks per adegan terbesar {max(v['maks'] for v in semua):.2f} dtk; p95 terbesar {max(v['p95'] for v in semua):.2f} dtk")
    (out / "qa.json").write_text(json.dumps({"durasi": dur, "lufs": lufs, "puncak": puncak, "sinkron": laporan}, indent=1))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
