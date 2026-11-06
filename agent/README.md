# agent/ — SENTRA Agent (Python)

Sensor ringan untuk host satuan. **Zero dependency**: satu file `sentra_agent.py`, hanya pustaka standar Python 3.10+, konfigurasi JSON.

| Sumber | Cara membaca | Event |
|---|---|---|
| `web` | tail log akses nginx/apache (format combined), tahan rotasi | IP, method, path, query, status, user agent |
| `ssh` | tail `auth.log` / log sshd | login gagal & berhasil, user, IP |
| `firewall` | nftables `log group` (NFLOG) dibaca lewat netlink; agent memasang aturan log port tertutup sendiri | IP sumber, port tujuan |
| `fim` | pemindaian berkala folder web | file baru/berubah/dihapus + SHA-256 + cuplikan isi |
| `modbus` | sensor pasif raw socket (AF_PACKET) pada TCP/502 | perintah tulis FC 5, 6, 15, 16 + IP pengirim |

Perilaku sesuai PRD:

- Event dikirim batch tiap 1 detik (maks 500), heartbeat tiap 10 detik, perintah diambil tiap 3 detik.
- Saat Core tidak terjangkau, event ditahan di antrean SQLite lokal hingga 10.000 baris, lalu dikirim ulang.
- Perintah hanya dari daftar tetap: `block_ip`, `unblock_ip`, `run_test`. Parameter divalidasi (IP lewat modul `ipaddress`, durasi 60–86.400 detik), dan `nft` dipanggil dengan argumen tetap, tanpa shell.
- Blokir memakai nftables set dengan `timeout`, sehingga blokir terbuka sendiri walau Core mati, dan tetap bertahan saat agent restart.
- Token disimpan di `state_dir/token` dengan izin `0600`. Komunikasi ke Core wajib HTTPS (verifikasi CA).

## Pemasangan di host nyata

```bash
sudo ./install.sh --core-url https://sentra-core.satuan.lan --code SNTR-XXXX-XXXX-XXXX-XXXX --ca /path/ca.crt
```

Kode pendaftaran dibuat Admin di halaman **Satuan & Agent** (sekali pakai, berlaku 24 jam).

## Test

```bash
python3 -m unittest discover -s agent/tests -v
```
