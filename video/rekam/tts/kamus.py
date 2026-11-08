"""Kamus pelafalan untuk TTS narasi video SENTRA SHIELD (lihat docs/naskah-video-v2.md).

Teks layar memakai ejaan asli; fungsi `lafalkan` mengubah teks menjadi ejaan yang dibaca TTS.
Urutan penting: frasa panjang lebih dulu.
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
    (r"\bagent\b", "éjen"),
    (r"\bhash\b", "hesy"),
    (r"\bCore\b", "Kor"),
    (r"\bCommand\b", "Komen"),
    (r"\bSENTRA\b", "Sentra"),
    (r"\bKodim\b", "Kodim"),
    (r"\bKodam\b", "Kodam"),
    (r"\bonline\b", "onlain"),
    (r"\bcloaking\b", "klowking"),
    (r"\bport\b", "port"),
    (r"\blog\b", "log"),
    (r"\bfirewall\b", "fairwol"),
    (r"\bdashboard\b", "desbor"),
]


def lafalkan(teks: str) -> str:
    for pola, ganti in KAMUS:
        teks = re.sub(pola, ganti, teks)
    return teks
