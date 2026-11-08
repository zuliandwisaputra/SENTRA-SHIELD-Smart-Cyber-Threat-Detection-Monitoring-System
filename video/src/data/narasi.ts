// Penanda waktu narasi suara per kata (dari transkripsi Whisper atas rekaman narasi).
// Semua fungsi mengembalikan DETIK RELATIF AWAL ADEGAN (sudah termasuk jeda awal sebelum suara masuk).
import kataJson from "./narasi-kata.json";
import type { ItemKeterangan } from "../komponen/dasar";

/** Jeda sebelum suara narasi masuk di tiap adegan. */
export const JEDA_AWAL = 0.4;

type Kata = { k: string; m: number; s: number };
const KATA = (kataJson as unknown as { kata: Record<string, Kata[]> }).kata;

const ambil = (id: string, i: number) => {
  const w = KATA[id]?.[i];
  if (!w) throw new Error(`Kata ${i} di narasi ${id} tidak ada`);
  return w;
};

/** Detik (relatif adegan) saat kata ke-i mulai diucapkan. */
export const kata = (id: string, i: number) => JEDA_AWAL + ambil(id, i).m;
/** Detik (relatif adegan) saat kata ke-i selesai diucapkan. */
export const kataAkhir = (id: string, i: number) => JEDA_AWAL + ambil(id, i).s;
/** Detik saat narasi adegan selesai. */
export const akhirNarasi = (id: string) => JEDA_AWAL + KATA[id][KATA[id].length - 1].s;

/**
 * Teks layar yang mengikuti ucapan. Setiap entri: [indeks kata pertama, teks yang sudah dikoreksi].
 * Teks tampil sejak kata itu diucapkan sampai entri berikutnya mulai (yang terakhir: 0,8 dtk setelah kata terakhir).
 */
export const teksNarasi = (id: string, potongan: [number, React.ReactNode][], tambahan: ItemKeterangan[] = []): ItemKeterangan[] => {
  const hasil = potongan.map(([i, teks], n) => {
    const dari = kata(id, i) - 0.15;
    const sampai = n < potongan.length - 1 ? kata(id, potongan[n + 1][0]) - 0.2 : akhirNarasi(id) + 0.8;
    return { dari, sampai, teks };
  });
  return [...hasil, ...tambahan];
};
