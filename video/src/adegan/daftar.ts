// Urutan adegan video v2 (docs/naskah-video-v2.md). Durasi tiap adegan mengikuti panjang narasi TTS
// (src/data/narasi-v2.json): jeda awal + narasi + ekor. Ekor lebih panjang dipakai bila gambar perlu waktu tambahan.
import { JEDA_AWAL, durasiNarasi } from "../data/narasi";
import { VIDEO } from "../tema";

const DASAR = [
  { id: "01-pembuka", nomor: "01", judul: "SENTRA SHIELD", ekor: 1.6 },
  { id: "02-analogi", nomor: "02", judul: "Analogi pos jaga", ekor: 1.6 },
  { id: "03-masalah", nomor: "03", judul: "Masalah", ekor: 1.2 },
  { id: "04-arsitektur", nomor: "04", judul: "Arsitektur & teknologi", ekor: 1.6 },
  { id: "05-pindai", nomor: "05", judul: "Demo 1 · Pemindaian", ekor: 1.4 },
  { id: "06-insiden", nomor: "06", judul: "Demo 2 · Satu insiden", ekor: 1.6 },
  { id: "07-kampanye", nomor: "07", judul: "Demo 3 · Kampanye", ekor: 1.6 },
  { id: "08-lebih-dalam", nomor: "08", judul: "Demo 4 · Serangan lanjut", ekor: 1.6 },
  { id: "09-skor", nomor: "09", judul: "Demo 5 · Skor", ekor: 2.0 },
  { id: "10-penjaga-situs", nomor: "10", judul: "Demo 6 · Penjaga Situs", ekor: 2.0 },
  { id: "11-respons", nomor: "11", judul: "Demo 7 · Respons", ekor: 1.8 },
  { id: "12-lapsit", nomor: "12", judul: "Demo 8 · LAPSIT", ekor: 1.8 },
  { id: "13-sensor-buta", nomor: "13", judul: "Demo 9 · Sensor Buta", ekor: 1.6 },
  { id: "14-uji-kesiapan", nomor: "14", judul: "Demo 10 · Uji Kesiapan", ekor: 2.0 },
  { id: "15-buku-jaga", nomor: "15", judul: "Demo 11 · Buku jaga", ekor: 2.0 },
  { id: "16-hak-akses", nomor: "16", judul: "Hak akses", ekor: 1.8 },
  { id: "17-angka", nomor: "17", judul: "Angka & kelayakan", ekor: 2.2 },
  { id: "18-rekap", nomor: "18", judul: "Rekap 30 detik", ekor: 1.8 },
  { id: "19-penutup", nomor: "19", judul: "Kesimpulan", ekor: 3.5 },
] as const;

export type IdAdegan = (typeof DASAR)[number]["id"];

// Durasi dibulatkan ke frame agar Series dan Bingkai memakai angka yang sama persis.
export const ADEGAN = DASAR.map((a) => {
  const frame = Math.round((JEDA_AWAL + durasiNarasi(a.id) + a.ekor) * VIDEO.fps);
  return { ...a, frame, durasi: frame / VIDEO.fps };
});

export const FRAME_TOTAL = ADEGAN.reduce((a, x) => a + x.frame, 0);
export const mulaiAdegan = (id: IdAdegan) => {
  let t = 0;
  for (const a of ADEGAN) {
    if (a.id === id) return t;
    t += a.durasi;
  }
  return t;
};
