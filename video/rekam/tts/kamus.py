"""Kamus pelafalan untuk TTS narasi video SENTRA SHIELD (lihat docs/naskah-video-v2.md).

Teks layar (subtitle) memakai ejaan asli dan angka. Fungsi `lafalkan` mengubah teks menjadi
ejaan yang dibaca TTS: istilah teknis menurut kamus, lalu angka menjadi kata
("2,46" -> "dua koma empat enam", "128" -> "seratus dua puluh delapan", "7%" -> "tujuh persen").
Urutan kamus penting: frasa panjang lebih dulu.
"""
import re

KAMUS = [
    (r"SENTRA SHIELD", "Sentra Syild"),
    (r"MITRE ATT&CK", "Maiter Atek"),
    (r"SHA-256", "Sya dua lima enam"),
    (r"SQL injection", "es kyu el injeksyen"),
    (r"\bnftables\b", "en ef tebels"),
    (r"\bwebshell\b", "web syel"),
    (r"\bGooglebot\b", "gugel bot"),
    (r"\bGoogle\b", "Gugel"),
    (r"\bAttack Story\b", "Atek Stori"),
    (r"\bbrute force\b", "brut fors"),
    (r"\bheartbeat\b", "hart bit"),
    (r"\bModbus\b", "Mod bas"),
    (r"\bLAPSIT\b", "Lapsit"),
    (r"\bhydra\b", "haidra"),
    (r"\bnmap\b", "en map"),
    (r"\bPLC\b", "pe el se"),
    (r"\bSSH\b", "es es ha"),
    (r"\bHP\b", "ha pe"),
    (r"\bIP\b", "ai pi"),
    (r"\bPDF\b", "pe de ef"),
    (r"\bmini-PC\b", "mini pe se"),
    (r"\bKodim A\b", "Kodim A"),
    (r"\bKodim B\b", "Kodim Be"),
    (r"\bagent\b", "éjen"),
    (r"\bhash\b", "hesy"),
    (r"\bCore\b", "Kor"),
    (r"\bCommand\b", "Komen"),
    (r"\bSENTRA\b", "Sentra"),
    (r"\bonline\b", "onlain"),
    (r"\bcloaking\b", "klowking"),
    (r"\bfirewall\b", "fairwol"),
    (r"\bdashboard\b", "desbor"),
    (r"\baudit log\b", "audit log"),
]

_SATUAN = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"]


def terbilang(n: int) -> str:
    """Bilangan bulat ke kata bahasa Indonesia (0 sampai milyaran)."""
    if n < 0:
        return "minus " + terbilang(-n)
    if n < 12:
        return _SATUAN[n]
    if n < 20:
        return f"{_SATUAN[n - 10]} belas"
    if n < 100:
        puluh, sisa = divmod(n, 10)
        return f"{_SATUAN[puluh]} puluh" + (f" {_SATUAN[sisa]}" if sisa else "")
    if n < 200:
        return "seratus" + (f" {terbilang(n - 100)}" if n > 100 else "")
    if n < 1000:
        ratus, sisa = divmod(n, 100)
        return f"{_SATUAN[ratus]} ratus" + (f" {terbilang(sisa)}" if sisa else "")
    if n < 2000:
        return "seribu" + (f" {terbilang(n - 1000)}" if n > 1000 else "")
    for besar, nama in ((10**9, "milyar"), (10**6, "juta"), (1000, "ribu")):
        if n >= besar:
            depan, sisa = divmod(n, besar)
            return f"{terbilang(depan)} {nama}" + (f" {terbilang(sisa)}" if sisa else "")
    raise ValueError(n)


def _angka(m: re.Match) -> str:
    bulat, pecahan, persen = m.group(1), m.group(2), m.group(3)
    kata = terbilang(int(bulat.replace(".", "")))
    if pecahan:
        kata += " koma " + " ".join(_SATUAN[int(d)] for d in pecahan)
    if persen:
        kata += " persen"
    return kata


def lafalkan(teks: str) -> str:
    for pola, ganti in KAMUS:
        teks = re.sub(pola, ganti, teks, flags=re.IGNORECASE)
    # Angka gaya Indonesia: titik pemisah ribuan, koma desimal, persen opsional.
    teks = re.sub(r"(?<![\w-])(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(%)?", _angka, teks)
    return teks


if __name__ == "__main__":
    for contoh in ["128 kombinasi", "933 catatan", "2,46 detik", "4,5 detik", "7% mirip", "1.020 event", "SHA-256", "Kodim B dan 11 dari 11"]:
        print(f"{contoh!r:28} -> {lafalkan(contoh)}")
