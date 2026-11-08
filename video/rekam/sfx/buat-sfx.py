"""Efek suara prosedural untuk video v2: semuanya disintesis dengan kode (numpy/scipy), tanpa berkas berhak cipta.

    python rekam/sfx/buat-sfx.py      (dari folder video/; keluaran public/sfx/*.wav, 48 kHz mono)

Setiap bunyi dinormalkan ke puncak -6 dBFS; keras akhirnya diatur di Remotion (src/komponen/Bunyi.tsx)
dan selalu diredam (ducking) saat narasi berbicara.
"""
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
KELUAR = Path(__file__).resolve().parents[2] / "public/sfx"
rng = np.random.default_rng(2026)


def t(durasi: float) -> np.ndarray:
    return np.arange(int(durasi * SR)) / SR


def saring(x, jenis, f, orde=2):
    return sosfilt(butter(orde, f, btype=jenis, fs=SR, output="sos"), x)


def env(n, serang=0.002, lepas=0.1, durasi=None):
    """Selubung serang-eksponensial."""
    tt = np.arange(n) / SR
    a = np.clip(tt / max(serang, 1e-4), 0, 1)
    return a * np.exp(-tt / lepas)


def normal(x, puncak_db=-6.0):
    x = x - np.mean(x)
    p = np.max(np.abs(x)) or 1.0
    # Fade 3 ms di ujung agar tidak ada klik digital.
    f = int(0.003 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    return (x / p * 10 ** (puncak_db / 20)).astype(np.float32)


def tulis(nama, x, puncak_db=-6.0):
    KELUAR.mkdir(parents=True, exist_ok=True)
    sf.write(KELUAR / f"{nama}.wav", normal(x, puncak_db), SR, subtype="PCM_16")
    print(f"{nama}.wav {len(x) / SR:.2f} dtk")


def ketukan(kecerahan=1.0):
    """Satu ketukan mekanis: transien noise + badan resonan pendek."""
    n = int(0.05 * SR)
    noise = saring(rng.standard_normal(n), "bandpass", [1800 * kecerahan, 6500], 2) * env(n, 0.0004, 0.006)
    badan = np.sin(2 * np.pi * 210 * np.arange(n) / SR) * env(n, 0.0008, 0.012) * 0.6
    return noise + badan


def klik():
    x = np.zeros(int(0.12 * SR))
    a = ketukan(1.3)
    x[: len(a)] += a
    b = ketukan(1.6) * 0.45  # lepas tombol
    o = int(0.055 * SR)
    x[o : o + len(b)] += b
    return saring(x, "highpass", 300)


def ketik(durasi, laju=11.0):
    """Teleprinter: ketukan berirama hampir teratur + dengung motor sangat pelan."""
    x = np.zeros(int(durasi * SR))
    pos = 0.0
    while pos < durasi - 0.06:
        k = ketukan(rng.uniform(0.85, 1.2)) * rng.uniform(0.6, 1.0)
        i = int(pos * SR)
        x[i : i + len(k)] += k[: len(x) - i]
        pos += (1 / laju) * rng.uniform(0.85, 1.15)
    motor = saring(rng.standard_normal(len(x)), "bandpass", [90, 160], 2) * 0.05
    return x + motor


def nada(f, durasi, harmonik=(1.0, 0.25, 0.08), serang=0.005, lepas=0.08):
    tt = t(durasi)
    y = sum(a * np.sin(2 * np.pi * f * (i + 1) * tt) for i, a in enumerate(harmonik))
    return y * env(len(tt), serang, lepas)


def bip():
    """Peringatan: dua nada naik."""
    a = nada(880, 0.13, lepas=0.06)
    b = nada(1175, 0.18, lepas=0.08)
    jeda = np.zeros(int(0.03 * SR))
    return np.concatenate([a, jeda, b, np.zeros(int(0.05 * SR))])


def stempel():
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 95 * np.exp(-tt / 0.08) + 48  # hentakan dengan nada turun
    dentum = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.09)
    ketuk = saring(rng.standard_normal(n), "bandpass", [250, 1400], 2) * env(n, 0.0005, 0.02) * 0.7
    kertas = saring(rng.standard_normal(n), "bandpass", [2500, 9000], 2) * env(n, 0.004, 0.06) * 0.25
    return dentum + ketuk + kertas


def whoosh(durasi=0.5):
    """Desis noise yang disapu filter pita (pusat naik lalu turun)."""
    n = int(durasi * SR)
    noise = rng.standard_normal(n)
    keluar = np.zeros(n)
    blok = 512
    for i in range(0, n, blok):
        p = i / n
        pusat = 300 + 2600 * np.sin(np.pi * p) ** 1.5
        sos = butter(2, [pusat * 0.6, min(pusat * 1.7, 20000)], btype="bandpass", fs=SR, output="sos")
        keluar[i : i + blok] = sosfilt(sos, noise[max(0, i - 2048) : i + blok])[-len(noise[i : i + blok]) :]
    selubung = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return keluar * selubung


def ping():
    """Ping radar: nada sinus dengan gema."""
    dasar = nada(1250, 1.4, harmonik=(1.0, 0.12), serang=0.003, lepas=0.32)
    x = np.zeros(int(2.2 * SR))
    x[: len(dasar)] += dasar
    for tunda, g in ((0.21, 0.35), (0.42, 0.16), (0.63, 0.07)):
        o = int(tunda * SR)
        x[o : o + len(dasar)] += saring(dasar, "lowpass", 3000) * g
    return x


def putus():
    """Koneksi diputus: dengung terputus mendadak + nada turun."""
    n1 = int(0.18 * SR)
    tt1 = np.arange(n1) / SR
    dengung = (np.sin(2 * np.pi * 120 * tt1) + 0.4 * np.sin(2 * np.pi * 240 * tt1)) * 0.35
    patah = ketukan(0.9) * 1.2
    n2 = int(0.7 * SR)
    tt2 = np.arange(n2) / SR
    f = 620 * np.exp(-tt2 / 0.25) + 140
    turun = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n2, 0.002, 0.28) * 0.8
    x = np.zeros(n1 + n2)
    x[:n1] += dengung
    x[n1 : n1 + len(patah)] += patah
    x[n1:] += turun
    return x


def sukses():
    """Tiga nada naik (C6-E6-G6), nada terakhir ditahan."""
    bagian = [nada(1046.5, 0.12, lepas=0.07), nada(1318.5, 0.12, lepas=0.07), nada(1568.0, 0.55, lepas=0.22)]
    x = np.zeros(int(0.95 * SR))
    for i, b in enumerate(bagian):
        o = int(i * 0.1 * SR)
        x[o : o + len(b)] += b
    return x


def detak():
    """Detak jantung pelan (lub-dub) untuk heartbeat."""
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    lub = np.sin(2 * np.pi * 62 * tt) * env(n, 0.004, 0.05)
    dub = np.zeros(n)
    o = int(0.17 * SR)
    dub[o:] = (np.sin(2 * np.pi * 55 * tt[: n - o]) * env(n - o, 0.004, 0.045)) * 0.7
    return saring(lub + dub, "lowpass", 400)


def retak():
    """Rantai putus: retakan noise berderak."""
    x = np.zeros(int(0.5 * SR))
    for _ in range(9):
        k = ketukan(rng.uniform(0.5, 1.4)) * rng.uniform(0.3, 1.0)
        i = int(rng.uniform(0, 0.25) * SR)
        x[i : i + len(k)] += k
    dentum = stempel() * 0.4
    x[: len(dentum)] += dentum[: len(x)]
    return x


def ambient(durasi=64.0):
    """Pad rendah yang bisa diulang mulus: semua frekuensi dan LFO berulang tepat dalam `durasi`."""
    n = int(durasi * SR)
    tt = np.arange(n) / SR
    bulat = lambda f: round(f * durasi) / durasi  # noqa: E731
    x = np.zeros(n)
    for f, a in ((73.42, 1.0), (110.0, 0.7), (146.83, 0.45), (174.61, 0.35), (220.0, 0.2)):
        for detune in (-0.12, 0.0, 0.12):
            fr = bulat(f + detune)
            lfo = 0.75 + 0.25 * np.sin(2 * np.pi * bulat(1 / 16 + f / 1000) * tt + f)
            x += a * lfo * np.sin(2 * np.pi * fr * tt + rng.uniform(0, 2 * np.pi)) / 3
    # Lapisan desis angin sangat tipis, dibuat periodik dengan cross-fade melingkar.
    angin = saring(rng.standard_normal(n + SR), "bandpass", [300, 1200], 2)
    awal, sisa = angin[:SR], angin[n:]
    angin = angin[:n].copy()
    fade = np.linspace(0, 1, SR)
    angin[:SR] = awal * fade + sisa * (1 - fade)
    gelombang = 0.6 + 0.4 * np.sin(2 * np.pi * bulat(1 / 8) * tt)
    x = x / np.max(np.abs(x)) + angin / np.max(np.abs(angin)) * 0.08 * gelombang
    return saring(x, "lowpass", 900)


if __name__ == "__main__":
    tulis("klik", klik())
    tulis("ketik", ketik(0.6))
    tulis("ketik-panjang", ketik(2.4))
    tulis("bip", bip())
    tulis("stempel", stempel())
    tulis("whoosh", whoosh())
    tulis("ping", ping())
    tulis("putus", putus())
    tulis("sukses", sukses())
    tulis("detak", detak())
    tulis("retak", retak())
    tulis("ambient", ambient(), puncak_db=-3.0)
