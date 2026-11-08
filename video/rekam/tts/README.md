# Narasi TTS (video versi 2)

Narasi video versi 2 memakai suara sintetis dari **VoxCPM2** (OpenBMB, lisensi Apache-2.0, mendukung bahasa Indonesia, keluaran 48 kHz). Suara dibuat dengan *voice design* dari deskripsi teks dan tidak meniru orang tertentu. Video mencantumkan keterangan "Narasi: suara sintetis (TTS)".

| Berkas | Isi |
| --- | --- |
| `kamus.py` | Kamus pelafalan. Subtitle memakai ejaan asli, `lafalkan()` mengubahnya menjadi ejaan yang dibaca TTS. |
| `contoh.py` | Membuat contoh ±20 detik (dua varian) untuk persetujuan suara. |

## Memasang di CPU (tanpa GPU)

Paket `voxcpm` dari PyPI menarik dependensi pelatihan dan antarmuka web (gradio, modelscope, funasr, datasets) yang tidak dibutuhkan untuk membuat suara. Pasang torch versi CPU lalu `voxcpm` tanpa dependensi:

```bash
python3 -m venv venv-tts
```

```bash
curl -LO "https://download.pytorch.org/whl/cpu/torch-2.8.0%2Bcpu-cp313-cp313-manylinux_2_28_x86_64.whl"
```

```bash
curl -LO "https://download.pytorch.org/whl/cpu/torchaudio-2.8.0%2Bcpu-cp313-cp313-manylinux_2_28_x86_64.whl"
```

```bash
venv-tts/bin/pip install ./torch-2.8.0+cpu-*.whl ./torchaudio-2.8.0+cpu-*.whl
```

```bash
venv-tts/bin/pip install "transformers>=4.36.2,<5" einops safetensors soundfile librosa pydantic tqdm huggingface_hub regex pyyaml inflect wetext
```

```bash
venv-tts/bin/pip install --no-deps voxcpm==2.0.3
```

Model (`openbmb/VoxCPM2`, ±5 GB) diunduh otomatis dari Hugging Face saat pertama dipakai.

Di CPU 4 inti, satu detik suara butuh sekitar 6–7 detik proses. Narasi 8 menit selesai dalam ±1 jam.

## Contoh suara

```bash
venv-tts/bin/python contoh.py keluaran/
```

Setiap potongan diperiksa sebelum dipakai: nada dasar (F0) harus di rentang suara pria, dan transkrip Whisper harus cocok dengan naskah. Model kadang menambah kata ngawur di akhir kalimat, jadi potongan yang tidak cocok dibuat ulang.
