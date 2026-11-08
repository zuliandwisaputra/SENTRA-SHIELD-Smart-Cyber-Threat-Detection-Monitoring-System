// Waktu narasi TTS (video v2). Sumber: src/data/naskah.json (teks, ejaan asli) dan
// src/data/narasi-v2.json (hasil rekam/tts/narasi.py: waktu tiap kata dari Whisper, diselaraskan ke naskah).
// Semua fungsi mengembalikan DETIK RELATIF AWAL ADEGAN (sudah termasuk jeda awal sebelum suara masuk).
import narasiJson from "./narasi-v2.json";
import naskahJson from "./naskah.json";

/** Jeda sebelum suara narasi masuk di tiap adegan. */
export const JEDA_AWAL = 0.5;

export type Kata = { k: string; m: number; s: number; kalimat: number };
type InfoAdegan = { durasi: number; kalimat: { teks: string; mulai: number; selesai: number }[]; kata: Kata[] };

export const NASKAH = (naskahJson as unknown as { adegan: Record<string, string[]> }).adegan;
export const ANGKA = (naskahJson as unknown as { angka: Record<string, string | number> }).angka;
const NARASI = narasiJson as unknown as Record<string, InfoAdegan>;

/** Perkiraan bila suara adegan belum dibuat (hanya untuk menyusun gambar sebelum TTS selesai). */
const perkiraan = (id: string): InfoAdegan => {
  const kalimat = NASKAH[id] ?? [];
  const kata: Kata[] = [];
  const info: InfoAdegan["kalimat"] = [];
  let t = 0;
  kalimat.forEach((teks, n) => {
    if (n > 0) t += 0.35;
    const m0 = t;
    for (const k of teks.split(/\s+/)) {
      const lama = 0.12 + 0.055 * k.length;
      kata.push({ k, m: t, s: t + lama, kalimat: n });
      t += lama;
    }
    info.push({ teks, mulai: m0, selesai: t });
  });
  return { durasi: t, kalimat: info, kata };
};

export const infoNarasi = (id: string): InfoAdegan => NARASI[id] ?? perkiraan(id);
export const adaSuara = (id: string) => Boolean(NARASI[id]);
export const durasiNarasi = (id: string) => infoNarasi(id).durasi;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const cari = (id: string, frasa: string, ke: number) => {
  const kata = infoNarasi(id).kata;
  const t = frasa.split(/\s+/).map(norm).filter(Boolean);
  let n = 0;
  for (let i = 0; i + t.length <= kata.length; i++) {
    if (t.every((x, j) => norm(kata[i + j].k) === x)) {
      n++;
      if (n === ke) return { awal: kata[i], akhir: kata[i + t.length - 1] };
    }
  }
  throw new Error(`Frasa "${frasa}" (ke-${ke}) tidak ada di narasi ${id}`);
};

/** Detik adegan saat frasa (ejaan naskah) mulai diucapkan. */
export const pada = (id: string, frasa: string, ke = 1) => JEDA_AWAL + cari(id, frasa, ke).awal.m;
/** Detik adegan saat frasa selesai diucapkan. */
export const akhir = (id: string, frasa: string, ke = 1) => JEDA_AWAL + cari(id, frasa, ke).akhir.s;
/** Detik adegan saat kalimat ke-n mulai / selesai. */
export const kalimatMulai = (id: string, n: number) => JEDA_AWAL + infoNarasi(id).kalimat[n].mulai;
export const kalimatSelesai = (id: string, n: number) => JEDA_AWAL + infoNarasi(id).kalimat[n].selesai;
/** Detik adegan saat narasi selesai. */
export const akhirNarasi = (id: string) => JEDA_AWAL + infoNarasi(id).durasi;

/**
 * Faktor ducking pada detik adegan `t`: `rendah` saat narasi berbicara, 1 saat hening,
 * dengan transisi halus 0,15 dtk agar tidak ada lompatan volume.
 */
export const faktorRedam = (id: string, t: number, rendah: number) => {
  const x = t - JEDA_AWAL;
  let jarak = Infinity; // jarak ke kalimat terdekat (0 = di dalam kalimat)
  for (const k of infoNarasi(id).kalimat) {
    const a = k.mulai - 0.1;
    const b = k.selesai + 0.15;
    jarak = Math.min(jarak, x < a ? a - x : x > b ? x - b : 0);
  }
  const r = Math.min(1, jarak / 0.15);
  return rendah + (1 - rendah) * r;
};

// ---------- Subtitle: satu baris per potongan, sinkron per kata ----------
export type Potong = { dari: number; sampai: number; teks: string };
const MAKS = 50; // karakter per baris (muat satu baris pada 50 px dengan jarak lega)

const pecah = (kata: Kata[]): Kata[][] => {
  const teks = (ks: Kata[]) => ks.map((k) => k.k).join(" ");
  if (teks(kata).length <= MAKS) return [kata];
  // Cari titik potong terbaik: setelah tanda baca, sedekat mungkin ke tengah, kedua sisi tidak terlalu pendek.
  let terbaik = -1;
  let skor = -Infinity;
  for (let i = 1; i < kata.length; i++) {
    const kiri = teks(kata.slice(0, i)).length;
    const kanan = teks(kata.slice(i)).length;
    if (kiri < 12 || kanan < 12) continue;
    const tanda = /[,;:]$/.test(kata[i - 1].k) ? 18 : 0;
    const muat = kiri <= MAKS ? 0 : -1000;
    const s = tanda + muat - Math.abs(kiri - kanan) * 0.35;
    if (s > skor) {
      skor = s;
      terbaik = i;
    }
  }
  if (terbaik < 0) terbaik = Math.ceil(kata.length / 2);
  return [...pecah(kata.slice(0, terbaik)), ...pecah(kata.slice(terbaik))];
};

export const subtitle = (id: string): Potong[] => {
  const info = infoNarasi(id);
  const hasil: Potong[] = [];
  info.kalimat.forEach((kal, n) => {
    const kata = info.kata.filter((k) => k.kalimat === n);
    const potong = pecah(kata);
    const berikut = info.kalimat[n + 1];
    potong.forEach((p, i) => {
      const dari = JEDA_AWAL + p[0].m - 0.12;
      const sampai =
        i < potong.length - 1
          ? JEDA_AWAL + potong[i + 1][0].m - 0.14
          : JEDA_AWAL + Math.min(kal.selesai + 0.45, berikut ? berikut.mulai - 0.14 : kal.selesai + 0.8);
      hasil.push({ dari, sampai, teks: p.map((k) => k.k).join(" ") });
    });
  });
  return hasil;
};
