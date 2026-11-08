// Urutan adegan sesuai storyboard (total 5 menit). Durasi dalam detik.
// Naskah narasinya ada di docs/naskah-video.md dengan id yang sama.
export const ADEGAN = [
  { id: "01-intro", nomor: "01", judul: "SENTRA SHIELD", durasi: 20 },
  { id: "02-masalah", nomor: "02", judul: "Masalah", durasi: 30 },
  { id: "03-arsitektur", nomor: "03", judul: "Arsitektur", durasi: 40 },
  { id: "04-deteksi", nomor: "04", judul: "Demo deteksi", durasi: 40 },
  { id: "05-serangan-lanjut", nomor: "05", judul: "Serangan lanjut", durasi: 40 },
  { id: "06-respons", nomor: "06", judul: "Respons berjenjang", durasi: 30 },
  { id: "07-lapsit", nomor: "07", judul: "LAPSIT", durasi: 20 },
  { id: "08-ketahanan", nomor: "08", judul: "Ketahanan", durasi: 30 },
  { id: "09-hak-akses", nomor: "09", judul: "Hak akses", durasi: 15 },
  { id: "10-angka", nomor: "10", judul: "Angka hasil uji", durasi: 20 },
  { id: "11-penutup", nomor: "11", judul: "Penutup", durasi: 15 },
] as const;

export type IdAdegan = (typeof ADEGAN)[number]["id"];
export const DURASI_TOTAL = ADEGAN.reduce((a, x) => a + x.durasi, 0);
export const mulaiAdegan = (id: IdAdegan) => {
  let t = 0;
  for (const a of ADEGAN) {
    if (a.id === id) return t;
    t += a.durasi;
  }
  return t;
};
