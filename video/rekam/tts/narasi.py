"""Narasi lengkap video v2 dengan suara A (VoxCPM2, kloning dari contoh yang disetujui).

    venv-tts/bin/python rekam/tts/narasi.py [id-adegan ...]      (dari folder video/)

Alur per kalimat (src/data/naskah.json):
  1. TTS membaca teks setelah kamus pelafalan, suaranya dikloning dari suara-a.flac.
  2. Hening di awal/akhir dipotong.
  3. Diperiksa: transkrip Whisper harus cocok dengan naskah (tanpa kata tambahan di akhir),
     nada dasar harus di rentang suara A. Gagal -> dibuat ulang dengan seed lain.
Lalu kalimat disatukan per adegan dengan jeda tetap, high-pass 60 Hz, loudnorm -16 LUFS
(dua tahap, linear), ditulis ke public/narasi-v2/<id>.wav. Waktu tiap kata (relatif awal suara)
ditulis ke src/data/narasi-v2.json untuk subtitle dan sinkron gambar.

Butuh paket tambahan di venv-tts: faster-whisper (lihat README.md).
"""
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
import torch

DIR = Path(__file__).resolve().parent
AKAR = DIR.parents[1]
sys.path.insert(0, str(DIR))
from kamus import lafalkan, terbilang  # noqa: E402

SR = 48000
NASKAH = json.loads((AKAR / "src/data/naskah.json").read_text())["adegan"]
POTONGAN = AKAR / "public/narasi-v2/potongan"
KELUAR_WAV = AKAR / "public/narasi-v2"
KELUAR_JSON = AKAR / "src/data/narasi-v2.json"
REFERENSI = DIR / "suara-a.flac"
# Teks contoh A persis seperti yang dibaca TTS (lihat contoh.py), untuk mode kloning lanjutan.
TEKS_REFERENSI = (
    "Ini Sentra Syild, pusat komando siber untuk Kodim dan Kodam. Penyerang memindai dengan en map, menebak kata sandi "
    "dengan haidra, lalu mencoba es kyu el injeksyen dan menanam web syel, bahkan mengirim perintah Mod bas ke pe el se. "
    "Sentra memetakan semuanya ke Maiter Atek, Komandan menyetujui blokir di en ef tebels, dan Lapsit disegel dengan Sya dua lima enam."
)
JEDA = 0.32  # detik antar kalimat
JEDA_BAGIAN = 0.6  # sebelum "Apa yang dilakukan SENTRA" dan "Kenapa ini penting"
F0_MIN, F0_MAX = 88.0, 165.0
COCOK_MIN = 0.86
PERCOBAAN = 6
SEED_GESER = int(os.environ.get("SEED_GESER", "0"))  # ganti untuk membuat ulang kalimat dengan seed lain


def kunci(teks: str) -> str:
    """Normalisasi untuk membandingkan naskah dengan transkrip: huruf kecil, angka jadi kata, tanpa spasi/tanda baca."""
    teks = re.sub(r"(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?", lambda m: terbilang(int(m.group(1).replace(".", ""))) + (" koma " + " ".join(terbilang(int(d)) for d in m.group(2)) if m.group(2) else ""), teks)
    teks = teks.lower().replace("%", " persen")
    # Ejaan yang lazim keluar dari Whisper untuk istilah kamus.
    for a, b in [("sha-256", "sha256"), ("sya dua lima enam", "sha256"), ("shia", "sha"), ("n-map", "nmap"), ("nf tables", "nftables"), ("n-f-tables", "nftables"), ("web shell", "webshell"), ("mod bus", "modbus")]:
        teks = teks.replace(a, b)
    return re.sub(r"[^a-z0-9]", "", teks)


def potong_hening(y: np.ndarray, ambang_db: float = -45.0, sisa: float = 0.04) -> np.ndarray:
    h = int(0.01 * SR)
    n = len(y) // h
    if n == 0:
        return y
    rms = np.sqrt(np.mean(y[: n * h].reshape(n, h) ** 2, axis=1) + 1e-12)
    aktif = np.where(20 * np.log10(rms) > ambang_db)[0]
    if len(aktif) == 0:
        return y
    a = max(0, aktif[0] * h - int(sisa * SR))
    b = min(len(y), (aktif[-1] + 1) * h + int(sisa * SR))
    return y[a:b]


def f0_median(y: np.ndarray) -> float:
    y16 = librosa.resample(y, orig_sr=SR, target_sr=16000)
    f0, v, _ = librosa.pyin(y16, fmin=60, fmax=400, sr=16000)
    f = f0[v & ~np.isnan(f0)]
    return float(np.median(f)) if len(f) else 0.0


class Pemeriksa:
    def __init__(self):
        from faster_whisper import WhisperModel

        self.m = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)

    def transkrip(self, y: np.ndarray):
        y16 = librosa.resample(y, orig_sr=SR, target_sr=16000).astype(np.float32)
        segs, _ = self.m.transcribe(y16, language="id", beam_size=5, word_timestamps=True, condition_on_previous_text=False)
        kata = [{"k": w.word.strip(), "m": round(w.start, 3), "s": round(w.end, 3)} for s in segs for w in (s.words or [])]
        return " ".join(w["k"] for w in kata), kata


def nilai(naskah: str, transkrip: str) -> dict:
    a, b = kunci(naskah), kunci(transkrip)
    cocok = difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()
    ekor_n = min(14, len(a))
    ekor = difflib.SequenceMatcher(None, a[-ekor_n:], b[-ekor_n:], autojunk=False).ratio() if b else 0.0
    kepala = difflib.SequenceMatcher(None, a[:ekor_n], b[:ekor_n], autojunk=False).ratio() if b else 0.0
    rasio = len(b) / max(1, len(a))
    # Kata terakhir naskah harus benar-benar terdengar (model kadang berhenti sebelum kata terakhir).
    akhir = kunci(naskah.split()[-1])
    kata_t = [kunci(w) for w in transkrip.split() if kunci(w)][-3:]
    akhir_ok = max((difflib.SequenceMatcher(None, akhir, w).ratio() for w in kata_t), default=0.0)
    return {"cocok": round(cocok, 3), "kepala": round(kepala, 3), "ekor": round(ekor, 3), "akhir": round(akhir_ok, 3), "rasio_panjang": round(rasio, 3)}


def lulus(n: dict, f0: float) -> bool:
    return n["cocok"] >= COCOK_MIN and n.get("kepala", 1) >= 0.7 and n["ekor"] >= 0.75 and n.get("akhir", 1) >= 0.8 and 0.85 <= n["rasio_panjang"] <= 1.15 and F0_MIN <= f0 <= F0_MAX


def selaraskan(kalimat: str, kata_whisper: list, durasi: float) -> list:
    """Waktu untuk tiap kata NASKAH (ejaan asli) dari kata Whisper; yang tidak cocok diinterpolasi."""
    token = kalimat.split()
    ka = [kunci(t) for t in token]
    kb = [kunci(w["k"]) for w in kata_whisper]
    waktu = [None] * len(token)
    sm = difflib.SequenceMatcher(None, ka, kb, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for d in range(i2 - i1):
                waktu[i1 + d] = (kata_whisper[j1 + d]["m"], kata_whisper[j1 + d]["s"])
        elif op == "replace" and j2 > j1:
            # Bagi rentang kata Whisper secara proporsional panjang huruf.
            m0, s0 = kata_whisper[j1]["m"], kata_whisper[j2 - 1]["s"]
            panjang = [max(1, len(ka[i])) for i in range(i1, i2)]
            total, acc = sum(panjang), 0
            for d, p in enumerate(panjang):
                waktu[i1 + d] = (m0 + (s0 - m0) * acc / total, m0 + (s0 - m0) * (acc + p) / total)
                acc += p
    # Interpolasi sisa (kata naskah yang tidak terdengar jelas oleh Whisper).
    jangkar = [(-1, 0.0, 0.0)] + [(i, w[0], w[1]) for i, w in enumerate(waktu) if w] + [(len(token), durasi, durasi)]
    for (i0, _, s0), (i1, m1, _) in zip(jangkar, jangkar[1:]):
        celah = list(range(i0 + 1, i1))
        if not celah:
            continue
        panjang = [max(1, len(ka[i])) for i in celah]
        total, acc = sum(panjang), 0
        for i, p in zip(celah, panjang):
            waktu[i] = (s0 + (m1 - s0) * acc / total, s0 + (m1 - s0) * (acc + p) / total)
            acc += p
    return [{"k": t, "m": round(w[0], 3), "s": round(w[1], 3)} for t, w in zip(token, waktu)]


def loudnorm(masuk: Path, keluar: Path) -> dict:
    saring = "highpass=f=60:poles=2"
    ukur = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(masuk), "-af", f"{saring},loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    ).stderr
    j = json.loads(ukur[ukur.rindex("{"): ukur.rindex("}") + 1])
    m = f"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}"
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", str(masuk), "-af", f"{saring},loudnorm=I=-16:TP=-1.5:LRA=11:{m}:linear=true", "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s24le", str(keluar)],
        check=True,
    )
    hasil = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(keluar), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", hasil)[-1])
    puncak = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", hasil)[-1])
    return {"lufs": lufs, "puncak": puncak}


def main(pilihan: list[str]) -> None:
    POTONGAN.mkdir(parents=True, exist_ok=True)
    torch.set_num_threads(os.cpu_count() or 4)
    from voxcpm import VoxCPM

    model = VoxCPM.from_pretrained(os.environ.get("VOXCPM_MODEL", "openbmb/VoxCPM2"), load_denoiser=False, optimize=False, device="cpu")
    assert model.tts_model.sample_rate == SR
    pemeriksa = Pemeriksa()
    hasil_json = json.loads(KELUAR_JSON.read_text()) if KELUAR_JSON.exists() else {}
    laporan = []

    for id_adegan, kalimat in NASKAH.items():
        if pilihan and id_adegan not in pilihan:
            continue
        bagian, kata_adegan, info_kalimat, t = [], [], [], 0.0
        for n, teks in enumerate(kalimat):
            lafal = lafalkan(teks)
            sidik = hashlib.sha1(f"{lafal}|{REFERENSI.stat().st_size}".encode()).hexdigest()[:12]
            berkas, meta_f = POTONGAN / f"{id_adegan}-{n:02d}.wav", POTONGAN / f"{id_adegan}-{n:02d}.json"
            meta = json.loads(meta_f.read_text()) if meta_f.exists() else None
            if not (meta and meta.get("sidik") == sidik and berkas.exists()):
                terbaik = None
                for coba in range(PERCOBAAN):
                    seed = int(sidik[:6], 16) + coba * 7919 + SEED_GESER
                    torch.manual_seed(seed)
                    t0 = time.time()
                    wav = model.generate(text=lafal, prompt_wav_path=str(REFERENSI), prompt_text=TEKS_REFERENSI, cfg_value=2.0, inference_timesteps=10)
                    y = potong_hening(np.asarray(wav, dtype=np.float32))
                    tr, kata_w = pemeriksa.transkrip(y)
                    nl, f0 = nilai(teks, tr), f0_median(y)
                    ok = lulus(nl, f0)
                    skor = nl["cocok"] + (0.5 if ok else 0)
                    print(json.dumps({"adegan": id_adegan, "kalimat": n, "coba": coba, "lulus": ok, **nl, "f0": round(f0), "durasi": round(len(y) / SR, 2), "proses": round(time.time() - t0, 1), "transkrip": tr}, ensure_ascii=False), flush=True)
                    if terbaik is None or skor > terbaik[0]:
                        terbaik = (skor, y, tr, kata_w, nl, f0, seed, ok, coba + 1)
                    if ok:
                        break
                _, y, tr, kata_w, nl, f0, seed, ok, jumlah = terbaik
                sf.write(berkas, y, SR, subtype="PCM_24")
                meta = {"sidik": sidik, "teks": teks, "lafal": lafal, "seed": seed, "lulus": ok, "percobaan": jumlah, "nilai": nl, "f0": round(f0, 1), "transkrip": tr, "kata_whisper": kata_w}
                meta_f.write_text(json.dumps(meta, ensure_ascii=False, indent=1))
            y, _ = sf.read(berkas, dtype="float32")
            durasi = len(y) / SR
            if n > 0:
                jeda = JEDA_BAGIAN if re.match(r"(Apa yang dilakukan SENTRA|Kenapa ini penting)", teks) else JEDA
                bagian.append(np.zeros(int(jeda * SR), dtype=np.float32))
                t += jeda
            for w in selaraskan(teks, meta["kata_whisper"], durasi):
                kata_adegan.append({"k": w["k"], "m": round(t + w["m"], 3), "s": round(t + w["s"], 3), "kalimat": n})
            info_kalimat.append({"teks": teks, "mulai": round(t, 3), "selesai": round(t + durasi, 3), "lulus": meta["lulus"], "percobaan": meta.get("percobaan"), "nilai": meta["nilai"], "f0": meta["f0"], "transkrip": meta["transkrip"]})
            laporan.append((id_adegan, n, meta["lulus"], meta["nilai"]["cocok"], meta["f0"]))
            bagian.append(y)
            t += durasi
        with tempfile.TemporaryDirectory() as tmp:
            mentah = Path(tmp) / "mentah.wav"
            sf.write(mentah, np.concatenate(bagian), SR, subtype="FLOAT")
            KELUAR_WAV.mkdir(parents=True, exist_ok=True)
            keras = loudnorm(mentah, KELUAR_WAV / f"{id_adegan}.wav")
        hasil_json[id_adegan] = {"durasi": round(t, 3), **keras, "kalimat": info_kalimat, "kata": kata_adegan}
        KELUAR_JSON.write_text(json.dumps(dict(sorted(hasil_json.items())), ensure_ascii=False, indent=1) + "\n")
        print(f"== {id_adegan}: {t:.2f} dtk, {keras['lufs']} LUFS, puncak {keras['puncak']} dBFS", flush=True)

    gagal = [x for x in laporan if not x[2]]
    print(f"SELESAI: {len(laporan)} kalimat, {len(gagal)} tidak lulus pemeriksaan: {gagal}", flush=True)


if __name__ == "__main__":
    main(sys.argv[1:])
