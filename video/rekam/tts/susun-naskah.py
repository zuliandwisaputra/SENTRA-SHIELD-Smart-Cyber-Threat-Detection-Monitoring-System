"""Susun naskah narasi v2 (docs/naskah-video-v2.md) dengan angka dari rekaman asli.

Angka TIDAK diketik tangan: semuanya diambil dari src/data/rekaman.json dan src/data/akses.json
hasil rekam/rekam.sh. Keluaran: src/data/naskah.json (kalimat per adegan, ejaan asli + angka),
dipakai oleh narasi.py (TTS) dan oleh Remotion (subtitle).

    python3 rekam/tts/susun-naskah.py      (dari folder video/)
"""
import json
import re
from pathlib import Path

AKAR = Path(__file__).resolve().parents[2]
R = json.loads((AKAR / "src/data/rekaman.json").read_text())
AKSES = json.loads((AKAR / "src/data/akses.json").read_text())
db, ukur = R["db"], R["ukur"]


def koma(x: float, digit: int = 1) -> str:
    return f"{x:.{digit}f}".replace(".", ",")


def pengali(x: float) -> str:
    return koma(x, 1) if abs(x * 10 - round(x * 10)) < 1e-9 else koma(x, 2)


def sumber(satuan: str, jenis: str) -> int:
    return next(x["jumlah"] for x in db["eventPenyerangPerSumber"] if x["satuan"] == satuan and x["sumber"] == jenis)


def siaga_pada(penanda_id: str) -> str:
    t = next(p["t"] for p in R["penanda"] if p["id"] == penanda_id)
    s = min(R["sampel"]["analis"], key=lambda x: abs(x["t"] - t))
    # Teks sampel: "Siaga: aman" -> "Aman".
    return (s["siaga"] or "").split(":")[-1].strip().capitalize()


insiden1 = next(x for x in db["insiden"] if x["id"] == 1)
rincian = next(x["rincian"] for x in db["rincianSkor"] if x["insiden"] == 1)
if isinstance(rincian, str):
    rincian = json.loads(rincian)
googlebot = next(x for x in db["penjagaSitus"] if x["varian"] == "googlebot")
hasil_uji = db["ujiKesiapanHasil"]
audit = int(re.search(r"(\d+) baris diperiksa", ukur["auditTeks"]).group(1))


def tanpa_sinyal() -> int:
    """Detik tanpa heartbeat saat Core menandai agent BUTA (audit agent_buta: heartbeat terakhir -> waktu catat)."""
    from datetime import datetime, timezone

    a = db["agentButa"][0]
    data = a["data"] if isinstance(a["data"], dict) else json.loads(a["data"])
    terakhir = datetime.fromisoformat(data["heartbeat_terakhir"])
    buta = datetime.strptime(a["waktu"], "%Y-%m-%d %H:%M:%S.%f").replace(tzinfo=timezone.utc)
    return int((buta - terakhir).total_seconds())


def agent_online(video: str) -> int:
    teks = next(p["agent"] for p in AKSES["penanda"] if p["video"] == video and p.get("agent"))
    online, total = map(int, re.search(r"(\d+)\s*/\s*(\d+)", teks).groups())
    assert online == total, f"{video}: {teks}"
    return total



A = {
    "hydra": sumber("KODIM-LAT-A", "ssh"),
    "firewallA": sumber("KODIM-LAT-A", "firewall"),
    "nmapKeInsiden": koma(ukur["nmapKeInsidenDiBerandaMs"] / 1000, 1),
    "siagaAwal": siaga_pada("beranda-awal"),
    "siagaHydra": siaga_pada("beranda-saat-hydra"),
    "jumlahAturan": len(rincian["aturan"]),
    "bobot": sum(int(a["poin"]) for a in rincian["aturan"]),
    "tahap": rincian["tahap"]["jumlah"],
    "bonusTahap": rincian["tahap"]["poin"],
    "pengaliAset": pengali(rincian["pengali_aset"]["nilai"]),
    "pengaliKampanye": pengali(rincian["pengali_kampanye"]["nilai"]),
    "skor": rincian["total"],
    "severity": insiden1["severity"].capitalize(),
    "mirip": round(googlebot["kemiripan"] * 100),
    "kataJudi": googlebot["kata_judi"],
    "putus": koma(ukur["portal"]["setujuKeGagalPertamaMs"] / 1000, 2),
    "lapsitMs": ukur["lapsitMs"],
    "buta": round(ukur["sensorMatiKeButaMs"] / 1000),
    "butaSejakSinyal": tanpa_sinyal(),
    "ujiN": len(hasil_uji),
    "ujiOk": sum(1 for x in hasil_uji if x["terdeteksi"]),
    "ujiRata": koma(db["ujiKesiapan"]["rata_ttd_ms"] / 1000, 1),
    "ujiInsidenPalsu": db["insidenDariEventUji"]["jumlah"],
    "audit": audit,
    "agentOperator": agent_online("operator"),
    "agentAnalis": agent_online("analis"),
}
A["totalA"] = A["firewallA"] + A["hydra"]
assert A["skor"] == insiden1["skor"], "skor rincian berbeda dengan skor insiden"

lapsit = "Laporan selesai dalam kurang dari satu detik." if A["lapsitMs"] < 1000 else f"Laporan selesai dalam {koma(A['lapsitMs'] / 1000, 1)} detik."
palsu = "dan tidak satu pun menjadi insiden palsu." if A["ujiInsidenPalsu"] == 0 else f"dan {A['ujiInsidenPalsu']} menjadi insiden."

ADEGAN = {
    "01-pembuka": [
        "Ini SENTRA SHIELD, pusat komando deteksi dan respons ancaman siber untuk satuan.",
        "Karya ini dibuat oleh Tim Claudex404, Zulian Dwi Saputra, untuk kategori Penangkalan di Kartika Cyber Hackathon 2026.",
        "Dalam beberapa menit ke depan, kita lihat bagaimana satu serangan sungguhan dideteksi, dijelaskan, lalu dihentikan, sampai penyerang terputus.",
    ],
    "02-analogi": [
        "Cara paling mudah memahami SENTRA: bayangkan pos jaga di sebuah markas.",
        "Di setiap gerbang ada penjaga yang mencatat siapa yang datang.",
        "Di SENTRA, penjaga itu disebut agent, program kecil yang dipasang di komputer setiap satuan.",
        "Semua laporan penjaga dikirim ke posko.",
        "Posko SENTRA disebut Core.",
        "Ia membaca laporan, mengenali pola serangan, dan menilai seberapa berbahaya.",
        "Hasilnya tampil di papan siaga, yaitu Tingkat Siaga: Aman, Waspada, Siaga, atau Awas.",
        "Kalau perlu tindakan, petugas mengusulkan, dan hanya komandan yang boleh memberi perintah.",
        "Setiap kejadian ditulis di buku jaga yang tidak bisa dihapus diam-diam, yaitu audit log.",
    ],
    "03-masalah": [
        "Kenapa SENTRA dibutuhkan?",
        "Satuan setingkat Kodim jarang punya tim keamanan siber sendiri, sehingga catatan komputer menumpuk tanpa pernah dibaca.",
        "Alat keamanan biasa membanjiri petugas dengan ribuan peringatan mentah.",
        "Penyerang bisa menyerang beberapa satuan sekaligus, bahkan mematikan sensor lebih dulu.",
        "Dan situs resmi bisa disusupi iklan judi online yang hanya muncul di Google, sehingga pengelolanya tidak sadar.",
    ],
    "04-arsitektur": [
        "Secara teknis, SENTRA punya tiga bagian.",
        "Agent di setiap satuan membaca catatan web, login SSH, firewall, perubahan file, dan perintah ke mesin industri, lalu mengirimnya ke pusat setiap detik lewat jalur terenkripsi.",
        "Core di pusat menjalankan 13 aturan deteksi, merangkai serangan, dan memberi skor.",
        "Command adalah layar untuk operator, analis, dan komandan, termasuk di HP.",
        "Teknologinya: Core dibangun dengan Laravel dan MySQL, tampilannya memakai Livewire, dan layar diperbarui lewat WebSocket Reverb setiap ada perubahan.",
        "Agent ditulis dengan Python tanpa pustaka tambahan, dan memblokir penyerang lewat nftables di firewall.",
        "Laporan situasi bisa disusun model AI lokal lewat Ollama, dan seluruh sistem dijalankan dengan Docker Compose dalam satu perintah.",
        "Untuk demo ini kami membangun lab: dua satuan latihan, Kodim A dan Kodim B, sebuah mesin industri PLC, dan satu komputer penyerang di jaringan terpisah.",
        "Semuanya berjalan tanpa internet, di satu laptop.",
    ],
    "05-pindai": [
        "Demo dimulai.",
        "Semua tampilan aplikasi adalah rekaman asli dari lab.",
        "Apa yang terjadi: penyerang memindai port Kodim A dengan nmap.",
        f"Lalu dengan hydra, ia mencoba {A['hydra']} kombinasi nama pengguna dan kata sandi.",
        f"Apa yang dilakukan SENTRA: {A['nmapKeInsiden']} detik setelah pemindaian dimulai, insiden baru muncul di layar, tanpa perlu dimuat ulang.",
        "Insiden adalah satu berkas kasus yang mengumpulkan semua jejak dari penyerang yang sama.",
        f"Begitu percobaan login menumpuk, Tingkat Siaga naik dari {A['siagaAwal']} ke {A['siagaHydra']}.",
        "Kenapa ini penting: petugas tidak perlu membaca ratusan baris catatan; layar memberi tahu sendiri saat ada bahaya.",
    ],
    "06-insiden": [
        f"Apa yang dilakukan SENTRA berikutnya: {A['totalA']} catatan mentah dari penyerang ini dirangkum menjadi satu insiden.",
        "Di Detail Insiden, serangannya disusun sebagai Attack Story, tahap demi tahap, dari pengintaian sampai akses awal.",
        "Tahapnya mengikuti urutan serangan pada umumnya: mengintai, masuk, bertahan, lalu merusak.",
        "Setiap langkah diberi kode teknik dari MITRE ATT&CK.",
        "Kenapa ini penting: analis langsung melihat cerita serangannya, bukan tumpukan peringatan.",
    ],
    "07-kampanye": [
        "Apa yang terjadi: dengan alamat IP yang sama, penyerang lalu memindai Kodim B.",
        "Apa yang dilakukan SENTRA: dua serangan di dua satuan itu langsung dikaitkan menjadi satu kampanye lintas satuan, dan peta operasi menunjuk keduanya.",
        "Kenapa ini penting: serangan terkoordinasi terlihat utuh dari pusat, tidak terpecah per satuan.",
    ],
    "08-lebih-dalam": [
        "Apa yang terjadi: penyerang menyelipkan perintah ke portal lewat SQL injection, menanam webshell, mengirim perintah tulis ke mesin PLC, lalu menyisipkan iklan judi online yang hanya tampil untuk Google.",
        "Apa yang dilakukan SENTRA: setiap langkah tertangkap dan masuk ke cerita yang sama.",
        "Webshell ketahuan karena agent mengawasi perubahan file di server, dan perintah ke PLC tertangkap oleh sensor Modbus.",
        "Attack Story naik sampai tahap Dampak.",
        "Kenapa ini penting: yang diserang bukan hanya situs web, tetapi juga mesin fisik, dan SENTRA mengawasi keduanya.",
    ],
    "09-skor": [
        "Seberapa berbahaya insiden ini?",
        "SENTRA menghitung skor dengan rumus terbuka.",
        f"Bobot {A['jumlahAturan']} aturan yang terpicu dijumlahkan: {A['bobot']}.",
        f"Ditambah {A['bonusTahap']} karena serangan mencapai {A['tahap']} tahap.",
        f"Lalu dikali {A['pengaliAset']} karena mengenai mesin industri, dan dikali {A['pengaliKampanye']} karena bagian dari kampanye.",
        f"Hasilnya {A['skor']}, {A['severity']}.",
        "Setiap angkanya bisa ditelusuri.",
    ],
    "10-penjaga-situs": [
        "Bagaimana dengan judi online tadi?",
        "Penjaga Situs membuka halaman yang sama tiga kali: sebagai pengunjung biasa, sebagai Googlebot, dan sebagai pengunjung yang datang dari Google.",
        f"Versi biasa tetap normal, tetapi dua versi lainnya hanya {A['mirip']}% mirip dan berisi {A['kataJudi']} kata judi.",
        "SENTRA menandainya sebagai cloaking judi online.",
        "Inilah sebabnya pengelola situs sering terlambat sadar: dari browser mereka, semuanya tampak normal.",
    ],
    "11-respons": [
        "Saatnya bertindak.",
        "Apa yang terjadi: analis mengusulkan blokir IP penyerang selama satu jam.",
        "Usulan masuk ke HP Komandan.",
        "Selama belum disetujui, penyerang masih bisa membuka portal.",
        "Apa yang dilakukan SENTRA: Komandan menyetujui.",
        "Perintah dikirim ke agent, dan agent memblokir penyerang di firewall nftables.",
        f"{A['putus']} detik setelah tombol Setujui ditekan, koneksi penyerang terputus.",
        "Perintah ke agent hanya boleh dari daftar tetap, yaitu blokir, buka blokir, dan uji, sehingga tidak bisa disalahgunakan.",
        "Kenapa ini penting: yang mengusulkan tidak bisa menyetujui sendiri.",
        "Keputusan tetap di tangan komandan, sesuai rantai komando.",
    ],
    "12-lapsit": [
        "Setelah itu, analis membuat Laporan Situasi, atau LAPSIT, dengan satu klik.",
        lapsit,
        "Laporan ini disusun dari data insiden, bukan dikarang, dan setiap temuan mengutip nomor bukti aslinya.",
        "Berkas PDF-nya disegel dengan sidik jari SHA-256, sehingga perubahan sekecil apa pun akan ketahuan.",
    ],
    "13-sensor-buta": [
        "Apa yang terjadi kalau penyerang mematikan sensor?",
        "Setiap agent mengirim sinyal hidup, atau heartbeat, secara berkala.",
        "Begitu sinyal dari Kodim B hilang lebih dari 30 detik, SENTRA menandai agent itu buta dan membuka insiden Sensor Buta.",
        f"Di rekaman ini, tanda buta muncul {A['butaSejakSinyal']} detik setelah sinyal terakhir.",
        "Ini penting, karena penyerang yang cerdas biasanya membutakan penjaga lebih dulu.",
    ],
    "14-uji-kesiapan": [
        "Bagaimana kita tahu SENTRA benar-benar bekerja?",
        f"Lewat Uji Kesiapan, SENTRA menjalankan {A['ujiN']} serangan tiruan yang aman ke komputernya sendiri.",
        "Serangan tiruan ini diberi tanda khusus, sehingga dihitung sebagai uji, bukan insiden.",
        f"Hasilnya, {A['ujiOk']} dari {A['ujiN']} terdeteksi, rata-rata {A['ujiRata']} detik, {palsu}",
    ],
    "15-buku-jaga": [
        "Terakhir, buku jaganya.",
        "Setiap catatan audit menyimpan sidik jari catatan sebelumnya, sehingga membentuk rantai.",
        "Kalau satu catatan diubah atau dihapus langsung di database, rantainya putus dan langsung ketahuan.",
        f"Satu klik Verifikasi Rantai: {A['audit']} catatan diperiksa, rantai utuh.",
    ],
    "16-hak-akses": [
        "Hak akses mengikuti peran dan satuan.",
        f"Operator Kodim A hanya melihat satuannya sendiri, {A['agentOperator']} agent.",
        f"Analis di pusat melihat semuanya, {A['agentAnalis']} agent.",
        "Dengan begitu, setiap orang hanya melihat dan melakukan apa yang menjadi tugasnya.",
    ],
    "17-angka": [
        "Semua angka di video ini diukur dari rekaman lab yang sama.",
        "Dan SENTRA siap dipasang: satu klik untuk menyalakan, berjalan tanpa internet, dan cukup di mini-PC.",
        "Agent dipasang dengan satu perintah.",
    ],
    "18-rekap": [
        "Sekali lagi, alurnya.",
        "Penyerang memindai dan menebak kata sandi; SENTRA membuka insiden dalam hitungan detik.",
        "Serangan melebar ke satuan lain dan ke mesin industri; semuanya terangkai dalam satu cerita dengan skor yang terbuka.",
        f"Analis mengusulkan, Komandan menyetujui dari HP, dan {A['putus']} detik kemudian penyerang terputus.",
        "Semuanya tercatat di buku jaga yang tidak bisa diubah.",
    ],
    "19-penutup": [
        "Dampak nyatanya bagi pertahanan siber: Kodim tanpa tim siber tetap terpantau dari pusat, dan serangan terkoordinasi terlihat utuh.",
        "Setiap tindakan tetap di tangan komandan, dengan bukti yang tercatat dan bisa diperiksa.",
        "Potensi implementasinya luas karena pemasangannya ringan: satu mini-PC di pusat dan satu agent di tiap satuan.",
        "Langkah berikutnya: uji coba di satuan nyata dan menambah protokol mesin industri lain.",
        "SENTRA SHIELD: nyata, terukur, siap pakai.",
        "Terima kasih.",
    ],
}

keluar = AKAR / "src/data/naskah.json"
keluar.write_text(json.dumps({"angka": A, "adegan": ADEGAN}, ensure_ascii=False, indent=1) + "\n")
kata = sum(len(k.split()) for v in ADEGAN.values() for k in v)
print(json.dumps(A, ensure_ascii=False))
print(f"{keluar}: {len(ADEGAN)} adegan, {sum(len(v) for v in ADEGAN.values())} kalimat, {kata} kata")
