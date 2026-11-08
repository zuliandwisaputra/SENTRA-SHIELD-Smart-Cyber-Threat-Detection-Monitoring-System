// Panel terminal yang menampilkan keluaran ASLI dari rekaman.json, muncul sesuai waktu aslinya.
import React from "react";
import { useCurrentFrame } from "remotion";
import { EntriTerminal, terminal } from "../data";
import { huruf, warna } from "../tema";
import { Braket } from "./dasar";

const warnaBaris = (teks: string) => {
  if (/TERPUTUS|kode 000/.test(teks)) return warna.awas;
  if (/\(tersambung\)/.test(teks)) return warna.aman;
  if (/valid pair found|password found|password: |SLOT GACOR|DITANDAI|setelah tulis|uid=33/.test(teks)) return warna.waspada;
  if (/^\[ATTEMPT\]|^\s*$/.test(teks)) return warna.ink3;
  return warna.ink2;
};

export const Terminal: React.FC<{
  ids: string[];
  epoch: number;
  kiri: number;
  atas: number;
  lebar: number;
  tinggi: number;
  judul: string;
  /** Sembunyikan baris tertentu (teks tidak diubah, hanya dipilih). */
  saring?: (teks: string) => boolean;
  tampilkanPerintah?: boolean;
  ukuranHuruf?: number;
}> = ({ ids, epoch, kiri, atas, lebar, tinggi, judul, saring, tampilkanPerintah = true, ukuranHuruf = 21 }) => {
  const f = useCurrentFrame();
  const entri: EntriTerminal[] = ids.map(terminal);
  type B = { teks: string; warna: string; perintah?: boolean };
  const baris: B[] = [];
  for (const e of entri) {
    if (epoch < e.mulai) break;
    if (tampilkanPerintah) baris.push({ teks: `$ ${e.perintah}`, warna: warna.accent, perintah: true });
    for (const b of e.baris) {
      if (b.t > epoch) break;
      if (b.stderr) continue;
      if (saring && !saring(b.teks)) continue;
      baris.push({ teks: b.teks, warna: warnaBaris(b.teks) });
    }
  }
  const kepala = 44;
  const lh = ukuranHuruf * 1.42;
  const perBaris = Math.max(10, Math.floor((lebar - 44) / (ukuranHuruf * 0.6)));
  const muat = Math.floor((tinggi - kepala - 28) / lh);
  // Ambil baris dari bawah sampai penuh (baris panjang dihitung sesuai bungkusnya).
  const tampil: B[] = [];
  let terpakai = 0;
  for (let i = baris.length - 1; i >= 0; i--) {
    const n = Math.max(1, Math.ceil(baris[i].teks.length / perBaris));
    if (terpakai + n > muat) break;
    terpakai += n;
    tampil.unshift(baris[i]);
  }
  const kursor = Math.floor(f / 18) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: kiri, top: atas, width: lebar, height: tinggi, backgroundColor: "#0A0C07", border: `1px solid ${warna.lineStrong}` }}>
      <div
        style={{
          height: kepala,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          backgroundColor: warna.raised,
          borderBottom: `1px solid ${warna.lineStrong}`,
          fontFamily: huruf.kondensasi,
          fontWeight: 700,
          fontSize: 21,
          letterSpacing: "0.12em",
          color: warna.ink2,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <span style={{ flexShrink: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: warna.awas }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{judul}</span>
      </div>
      <div style={{ padding: "14px 20px", fontFamily: huruf.mono, fontSize: ukuranHuruf, lineHeight: `${lh}px`, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
        {tampil.map((b, i) => (
          <div key={i} style={{ color: b.warna, fontWeight: /TERPUTUS/.test(b.teks) ? 700 : 400 }}>
            {b.teks || " "}
          </div>
        ))}
        <span style={{ display: "inline-block", width: ukuranHuruf * 0.6, height: ukuranHuruf, backgroundColor: kursor ? warna.ink2 : "transparent", verticalAlign: "middle" }} />
      </div>
      <Braket warnaGaris={warna.lineControl} ukuran={20} tebal={2} />
    </div>
  );
};
