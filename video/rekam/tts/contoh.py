"""Buat contoh suara TTS ±20 detik (VoxCPM2, voice design) untuk persetujuan.

Pakai:
    python contoh.py <folder-keluaran>

Menghasilkan contoh-A.wav dan contoh-B.wav (48 kHz, mentah dari model).
Pengolahan (high-pass 60 Hz, potong hening, loudnorm -16 LUFS) dilakukan terpisah dengan ffmpeg.
Lihat README.md di folder ini untuk cara memasang VoxCPM2 di CPU.
"""
import json
import os
import sys
import time

import soundfile as sf
import torch
from voxcpm import VoxCPM

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kamus import lafalkan  # noqa: E402

TEKS = (
    "Ini SENTRA SHIELD, pusat komando siber untuk Kodim dan Kodam. "
    "Penyerang memindai dengan nmap, menebak kata sandi dengan hydra, lalu mencoba SQL injection "
    "dan menanam webshell, bahkan mengirim perintah Modbus ke PLC. "
    "SENTRA memetakan semuanya ke MITRE ATT&CK, Komandan menyetujui blokir di nftables, "
    "dan LAPSIT disegel dengan SHA-256."
)

# (nama, seed, deskripsi suara). Deskripsi tidak menyebut atau meniru orang tertentu.
VARIAN = [
    ("A", 1000, "Male narrator, baritone, documentary style, steady and warm"),
    ("B", 1002, "Male narrator, baritone, documentary style, steady and warm, clear articulation"),
]


def main() -> None:
    keluar = sys.argv[1]
    os.makedirs(keluar, exist_ok=True)
    torch.set_num_threads(os.cpu_count() or 4)

    model = VoxCPM.from_pretrained(
        os.environ.get("VOXCPM_MODEL", "openbmb/VoxCPM2"), load_denoiser=False, optimize=False, device="cpu"
    )
    sr = model.tts_model.sample_rate
    lafal = lafalkan(TEKS)
    print("Dibaca TTS:", lafal, flush=True)

    for nama, seed, deskripsi in VARIAN:
        t0 = time.time()
        torch.manual_seed(seed)
        wav = model.generate(text=f"({deskripsi}){lafal}", cfg_value=2.0, inference_timesteps=10)
        sf.write(os.path.join(keluar, f"contoh-{nama}.wav"), wav, sr)
        print(json.dumps({"varian": nama, "durasi_s": round(len(wav) / sr, 2), "proses_s": round(time.time() - t0, 1)}), flush=True)


if __name__ == "__main__":
    main()
