# agent/ — SENTRA Agent (Python)

Sensor ringan yang dipasang di tiap host satuan. **Zero dependency**: hanya pustaka standar Python 3.10+ (keputusan A5), konfigurasi berformat JSON.

Isi (dikerjakan di Fase 1a):

- `sentra_agent.py` — collector log web, SSH, firewall (nftables), FIM, sensor Modbus pasif; batch event tiap 1 detik; antrean lokal hingga 10.000 baris; heartbeat tiap 10 detik; eksekusi perintah dari daftar tetap (`block_ip`, `unblock_ip`, `run_test`).
- `install.sh` + unit systemd.
- `config.example.json`.
