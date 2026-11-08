// Urutan adegan sesuai storyboard. Durasi tiap adegan mengikuti panjang narasi suara
// (src/data/narasi.json): jeda awal + narasi + ekor. Ekor lebih panjang dipakai bila gambar perlu waktu tambahan.
import narasiJson from "../data/narasi.json";
import { JEDA_AWAL } from "../data/narasi";
import { VIDEO } from "../tema";

const NARASI = narasiJson as Record<string, { durasi: number }>;

const DASAR = [
  { id: "01-intro", nomor: "01", judul: "SENTRA SHIELD", ekor: 1.4 },
  { id: "02-masalah", nomor: "02", judul: "Masalah", ekor: 1.2 },
  { id: "03-arsitektur", nomor: "03", judul: "Arsitektur", ekor: 1.3 },
  { id: "04-deteksi", nomor: "04", judul: "Demo deteksi", ekor: 1.3 },
  // Ekor 5 detik: Penjaga Situs (3 varian berdampingan) setelah narasi selesai.
  { id: "05-serangan-lanjut", nomor: "05", judul: "Serangan lanjut", ekor: 5.0 },
  { id: "06-respons", nomor: "06", judul: "Respons berjenjang", ekor: 1.5 },
  { id: "07-lapsit", nomor: "07", judul: "LAPSIT", ekor: 1.4 },
  { id: "08-ketahanan", nomor: "08", judul: "Ketahanan", ekor: 1.4 },
  { id: "09-hak-akses", nomor: "09", judul: "Hak akses", ekor: 1.6 },
  { id: "10-angka", nomor: "10", judul: "Angka hasil uji", ekor: 1.8 },
  { id: "11-penutup", nomor: "11", judul: "Penutup", ekor: 2.2 },
] as const;

export type IdAdegan = (typeof DASAR)[number]["id"];

// Durasi dibulatkan ke frame agar Series dan Bingkai memakai angka yang sama persis.
export const ADEGAN = DASAR.map((a) => {
  const n = NARASI[a.id]?.durasi ?? 10;
  const frame = Math.round((JEDA_AWAL + n + a.ekor) * VIDEO.fps);
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
