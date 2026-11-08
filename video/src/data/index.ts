// Akses ke hasil perekaman asli (rekam/rekam.cjs dan rekam/rekam-akses.cjs).
// Semua waktu footage dihitung dari data ini, bukan diketik tangan, agar tetap sinkron bila direkam ulang.
import aksesJson from "./akses.json";
import rekamanJson from "./rekaman.json";

export type Kotak = { x: number; y: number; w: number; h: number };
export type Baris = { t: number; teks: string; stderr?: boolean };
export type EntriTerminal = {
  id: string;
  judul: string;
  container: string;
  perintah: string;
  mulai: number;
  selesai: number;
  kode: number;
  baris: Baris[];
};
export type Penanda = {
  t: number;
  video: string;
  id: string;
  ket: string;
  kotak?: Kotak | Record<string, Kotak | null> | null;
  klik?: Kotak | null;
};
export type Sampel = {
  t: number;
  path: string;
  scrollY: number;
  skor: string | null;
  tahap: number | null;
  siaga: string | null;
  insiden: string | null;
  agent: string | null;
  cakupan: string | null;
};
export type InfoVideo = { berkas: string; mulai: number; selesai: number };

type Rekaman = {
  video: { analis: InfoVideo; komandan: InfoVideo };
  terminal: EntriTerminal[];
  penanda: Penanda[];
  sampel: { analis: Sampel[]; komandan: Sampel[] };
  ukur: {
    nmapBKeDuaSatuanDiBerandaMs: number;
    nmapKeInsidenDiBerandaMs: number;
    waktuSetuju: number;
    setujuKeDieksekusiDiLayarAnalisMs: number;
    portal: { setujuKeGagalPertamaMs: number; setujuKeSuksesTerakhirMs: number; permintaanSukses: number };
    lapsitMs: number;
    lapsit: { sha256: string; generator: string };
    sensorMatiKeButaMs: number;
    sensorHidupKeOnlineMs: number;
    ujiKesiapanDurasiMs: number;
    auditTeks: string;
  };
  db: {
    insiden: { id: number; skor: number; severity: string; satuan: string; judul: string }[];
    deteksiPerAturan: { aturan: string; nama: string; jumlah: number }[];
    eventPenyerangPerSumber: { satuan: string; sumber: string; jumlah: number }[];
    ujiKesiapan: { cakupan: string | number; rata_ttd_ms: number };
    ujiKesiapanHasil: { aturan: string; ttd_ms: number; terdeteksi: number }[];
    insidenDariEventUji: { jumlah: number };
    penjagaSitus: { varian: string; ditandai: number; kemiripan: number; kata_judi: number }[];
    auditVerifikasi: { ok: boolean; checked: number };
    tindakan: { jenis: string; pengusul: string; pemutus: string; diusulkan: string; disetujui: string; dieksekusi: string; hasil: { message: string } }[];
  };
};

export const R = rekamanJson as unknown as Rekaman;
export const AKSES = aksesJson as unknown as {
  video: { operator: InfoVideo; analis: InfoVideo };
  penanda: (Penanda & { agent?: string; insiden?: string; baris?: number })[];
};

export type NamaVideo = "analis" | "komandan";

/** Detik di footage mentah untuk suatu waktu epoch (ms). */
export const detikDi = (t: number, v: NamaVideo = "analis") => (t - R.video[v].mulai) / 1000;

export const penanda = (id: string): Penanda => {
  const p = R.penanda.find((x) => x.id === id);
  if (!p) throw new Error(`Penanda ${id} tidak ada di rekaman.json`);
  return p;
};
export const detikPenanda = (id: string, v: NamaVideo = "analis") => detikDi(penanda(id).t, v);

export const kotakPenanda = (id: string, kunci?: string): Kotak => {
  const k = penanda(id).kotak;
  const hasil = kunci ? (k as Record<string, Kotak | null> | undefined)?.[kunci] : (k as Kotak | undefined);
  if (!hasil) throw new Error(`Kotak ${id}.${kunci ?? ""} tidak ada`);
  return hasil;
};

export const terminal = (id: string): EntriTerminal => {
  const t = R.terminal.find((x) => x.id === id);
  if (!t) throw new Error(`Terminal ${id} tidak ada`);
  return t;
};

/** Waktu (detik footage Analis) pertama kali sampel layar memenuhi syarat. */
export const detikSampel = (syarat: (s: Sampel) => boolean, v: NamaVideo = "analis") => {
  const s = R.sampel[v].find(syarat);
  if (!s) throw new Error("Sampel tidak ditemukan");
  return detikDi(s.t, v);
};

/** Baris terminal pertama yang cocok. */
export const barisTerminal = (id: string, pola: RegExp) => {
  const b = terminal(id).baris.find((x) => pola.test(x.teks));
  if (!b) throw new Error(`Baris ${pola} tidak ada di ${id}`);
  return b;
};

/** Jam WIB (HH:MM:SS) dari epoch ms. */
export const jamWib = (t: number) => {
  const d = new Date(t + 7 * 3600e3);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
};

/** Date-time group gaya militer, sama dengan helper dtg() di Core: "080942 WIB NOV 26". */
export const dtg = (t: number) => {
  const d = new Date(t + 7 * 3600e3);
  const p = (n: number) => String(n).padStart(2, "0");
  const bulan = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGT", "SEP", "OKT", "NOV", "DES"][d.getUTCMonth()];
  return `${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())} WIB ${bulan} ${String(d.getUTCFullYear()).slice(2)}`;
};

/** Angka gaya Indonesia: 2,46 */
export const desimal = (n: number, digit = 1) => n.toFixed(digit).replace(".", ",");
export const ribuan = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
