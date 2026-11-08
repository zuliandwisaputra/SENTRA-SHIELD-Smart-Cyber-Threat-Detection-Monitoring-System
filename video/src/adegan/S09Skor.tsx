// Demo 5: cara skor dihitung. Persamaan dengan angka asli dari rincian skor Core (momen kunci, perlahan),
// lalu baris rumus yang sama di PDF LAPSIT asli.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, desimal, dtg, penanda } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { Footage, fokusMuat } from "../komponen/Footage";
import { EASE, Stempel } from "../komponen/dasar";
import { Bunyi, ISI } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "09-skor";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Rincian = {
  aturan: { kode: string; label: string; poin: number }[];
  tahap: { jumlah: number; poin: number };
  pengali_aset: { nilai: number; label: string };
  pengali_kampanye: { nilai: number };
  total: number;
};
const db = R.db as unknown as { rincianSkor: { insiden: number; rincian: Rincian | string }[]; insiden: { id: number; severity: string }[] };
const mentah = db.rincianSkor.find((x) => x.insiden === 1)!.rincian;
const RIN: Rincian = typeof mentah === "string" ? JSON.parse(mentah) : mentah;
const BOBOT = RIN.aturan.reduce((a, x) => a + x.poin, 0);
const SEVERITY = db.insiden.find((x) => x.id === 1)!.severity.toUpperCase();
const PDF = { w: 1819, h: 2573 };

const Operand: React.FC<{ nilai: string; ket: string; o: number; c?: string; besar?: boolean }> = ({ nilai, ket, o, c = warna.ink, besar }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: o, scale: `${1.2 - 0.2 * o}`, whiteSpace: "nowrap" }}>
    <div style={{ minWidth: besar ? 260 : 200, padding: "8px 22px", textAlign: "center", border: `3px solid ${c}`, backgroundColor: `${warna.panel}F2`, fontFamily: huruf.stensil, fontSize: besar ? 92 : 78, lineHeight: 1.05, color: c }}>{nilai}</div>
    <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 25, color: warna.ink2 }}>{ket}</div>
  </div>
);
const Op: React.FC<{ t: string; o: number }> = ({ t, o }) => <div style={{ fontFamily: huruf.stensil, fontSize: 64, color: warna.accent, opacity: o, marginTop: -34 }}>{t}</div>;

export const S09Skor: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const o = (t: number, lama = 0.35) => interpolate(d, [t, t + lama], [0, 1], { ...klem, easing: EASE });
  const tRumus = kalimatMulai(ID, 1);
  const tChip0 = kalimatMulai(ID, 2);
  const t425 = pada(ID, String(BOBOT));
  const t60 = pada(ID, `Ditambah ${RIN.tahap.poin}`);
  const tAset = pada(ID, `dikali ${desimal(RIN.pengali_aset.nilai, 1)}`);
  const tKampanye = pada(ID, `dikali ${desimal(RIN.pengali_kampanye.nilai, 1)}`);
  const tTotal = pada(ID, `Hasilnya ${RIN.total}`);
  const tKritis = pada(ID, SEVERITY.charAt(0) + SEVERITY.slice(1).toLowerCase()) - 0.05;
  const tPdf = kalimatMulai(ID, 6) - 0.2;
  const langkah = (t425 - 0.3 - tChip0) / RIN.aturan.length;
  const jumlah = Math.round(
    RIN.aturan.reduce((a, x, i) => a + x.poin * interpolate(d, [tChip0 + i * langkah, tChip0 + i * langkah + 0.25], [0, 1], klem), 0),
  );
  const PDFP = { kiri: ISI.kiri, atas: 770, lebar: 1728, tinggi: 160 };
  return (
    <Bingkai id={ID} nomor="09" judul="Demo 5 · Skor" durasi={durasi} dataLatihan dtgTeks={dtg(penanda("rincian-skor").t)} tigaBagian={[null, kalimatMulai(ID, 1), kalimatMulai(ID, 6)]}>
      <Bunyi jenis="ketik-panjang" pada={tChip0} />
      {[t425, t60, tAset, tKampanye, tTotal].map((t, i) => (
        <Bunyi key={i} jenis="klik" pada={t - 0.05} />
      ))}
      <Bunyi jenis="stempel" pada={tKritis + 0.05} />
      <Bunyi jenis="whoosh" pada={tPdf} keras={0.6} />

      {/* Rumus terbuka, sama dengan yang tertulis di Core. */}
      <div style={{ position: "absolute", left: ISI.kiri, right: ISI.kiri, top: 198, display: "flex", alignItems: "baseline", justifyContent: "space-between", opacity: o(tRumus), whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: huruf.mono, fontSize: 30, color: warna.ink }}>
          S = (Σ bobot aturan + 20 × (tahap − 1)) × pengali aset × pengali kampanye
        </span>
        <span style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 26, color: warna.ink3 }}>
          Σ sekarang: <span style={{ fontFamily: huruf.mono, color: warna.waspada }}>{jumlah}</span>
        </span>
      </div>

      {/* Bobot aturan yang terpicu (asli dari Core). */}
      <div style={{ position: "absolute", left: ISI.kiri, top: 256, width: 1728, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, opacity: 1 - o(tPdf - 0.1, 0.3) }}>
        {RIN.aturan.map((a, i) => {
          // Tampil samar sejak awal, lalu menyala saat bobotnya dijumlahkan.
          const m = o(tChip0 + i * langkah, 0.25);
          const dasar = o(0.4, 0.5) * 0.3;
          return (
            <div key={a.kode} style={{ position: "relative", height: 56, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", backgroundColor: m > 0.5 ? warna.raised : warna.panel, border: `1px solid ${m > 0.5 ? warna.accent : warna.lineStrong}`, opacity: Math.max(dasar, m), whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: huruf.mono, fontSize: 22, color: warna.accent }}>{a.kode}</span>
              <span style={{ flex: 1, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 26, color: warna.ink, overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</span>
              <span style={{ fontFamily: huruf.stensil, fontSize: 32, color: warna.waspada }}>+{a.poin}</span>
            </div>
          );
        })}
      </div>

      {/* Persamaan */}
      <div style={{ position: "absolute", left: ISI.kiri, width: 1728, top: 548, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
        <div style={{ fontFamily: huruf.stensil, fontSize: 70, color: warna.ink3, opacity: o(t425), marginTop: -34 }}>(</div>
        <Operand nilai={String(BOBOT)} ket={`bobot ${RIN.aturan.length} aturan`} o={o(t425 - 0.15)} />
        <Op t="+" o={o(t60 - 0.15)} />
        <Operand nilai={String(RIN.tahap.poin)} ket={`20 × (${RIN.tahap.jumlah} tahap − 1)`} o={o(t60 - 0.15)} />
        <div style={{ fontFamily: huruf.stensil, fontSize: 70, color: warna.ink3, opacity: o(t425), marginTop: -34 }}>)</div>
        <Op t="×" o={o(tAset - 0.15)} />
        <Operand nilai={desimal(RIN.pengali_aset.nilai, 1)} ket="mesin industri (PLC)" o={o(tAset - 0.15)} c={warna.siaga} />
        <Op t="×" o={o(tKampanye - 0.15)} />
        <Operand nilai={desimal(RIN.pengali_kampanye.nilai, 1)} ket="bagian kampanye" o={o(tKampanye - 0.15)} c={warna.siaga} />
        <Op t="=" o={o(tTotal - 0.15)} />
        <Operand nilai={String(RIN.total)} ket="skor insiden" o={o(tTotal - 0.15)} c={warna.awas} besar />
      </div>
      <div style={{ position: "absolute", left: 1440, top: 680, opacity: o(tKritis, 0.25) * (1 - o(tPdf - 0.1, 0.3)), scale: `${1.35 - 0.35 * o(tKritis, 0.25)}`, rotate: "-6deg" }}>
        <Stempel warnaGaris={warna.awas} ukuran={46} style={{ backgroundColor: `${warna.canvas}E6` }}>
          {SEVERITY}
        </Stempel>
      </div>

      {/* Angka yang sama di aplikasi asli (panel Perhitungan) dan di PDF LAPSIT asli. */}
      {d >= tPdf - 0.05 && (
        <div style={{ opacity: o(tPdf, 0.4) }}>
          <Footage
            src="rekaman/stills/25-lapsit.png"
            gambar
            epochMulaiVideo={penanda("lapsit-terbit").t}
            mulai={0}
            kiri={ISI.kiri + 314}
            atas={252}
            lebar={1100}
            tinggi={280}
            label="Tangkapan layar asli · panel Perhitungan"
            fokus={[{ pada: 0, kotak: fokusMuat({ x: 1366, y: 140, w: 486, h: 186 }, 1100 / (280 - 44), 6) }]}
            sorot={[{ dari: 0.3, sampai: 99, kotak: { x: 1380, y: 236, w: 456, h: 88 }, warna: warna.awas, redup: false }]}
          />
          <Footage
            src="rekaman/stills/lapsit-hd-2.png"
            gambar
            epochMulaiVideo={penanda("unduh-pdf").t}
            mulai={0}
            {...PDFP}
            sumber={PDF}
            label="PDF LAPSIT asli · halaman 2 · bagian Penilaian"
            fokus={[{ pada: 0, kotak: fokusMuat({ x: 120, y: 1268, w: 1560, h: 104 }, PDFP.lebar / (PDFP.tinggi - 44), 4, PDF) }]}
            sorot={[{ dari: 0, sampai: 99, kotak: { x: 150, y: 1322, w: 905, h: 52 }, warna: warna.awas, redup: false }]}
          />
        </div>
      )}
    </Bingkai>
  );
};
