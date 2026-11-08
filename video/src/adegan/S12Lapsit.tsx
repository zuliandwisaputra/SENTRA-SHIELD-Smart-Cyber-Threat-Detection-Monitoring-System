// Demo 8: LAPSIT. Klik Buat LAPSIT (asli), kutipan [EV-n], Unduh PDF, kaki halaman PDF dengan SHA-256, stempel segel.
import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, desimal, detikPenanda, dtg, penanda } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { Footage, fokusMuat } from "../komponen/Footage";
import { Rangkaian, dariJangkar, detikVideoUntuk } from "../komponen/Rangkaian";
import { Chip, Stempel } from "../komponen/dasar";
import { ApaItu, Bunyi, ISI } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "12-lapsit";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EP = R.video.analis.mulai;
const FL = { kiri: ISI.kiri, atas: ISI.atasDemo + 14, lebar: 1728, tinggi: 700 };
const RFL = FL.lebar / (FL.tinggi - 44);
const PDF = { w: 1819, h: 2573 };

const panel = fokusMuat({ x: 326, y: 560, w: 1030, h: 360 }, RFL, 0);
const atasDok = fokusMuat({ x: 330, y: 100, w: 1500, h: 560 }, RFL, 0);
const kutipan = fokusMuat({ x: 345, y: 640, w: 820, h: 300 }, RFL, 0);

const D_BUAT = detikPenanda("buat-lapsit");
const D_TERBIT = detikPenanda("lapsit-terbit");
const D_UNDUH = detikPenanda("unduh-pdf");

// Bagian (detik adegan).
const B_KUTIPAN = kalimatMulai(ID, 2) - 0.3; // "disusun dari data insiden ... mengutip nomor bukti"
const B_UNDUH = pada(ID, "PDF-nya") - 1.0;
const B_SEGEL = pada(ID, "disegel") - 0.2;

const POT_BUAT = dariJangkar(
  [
    { footage: D_BUAT - 1.6, adegan: 0 },
    { footage: D_BUAT, adegan: pada(ID, "satu klik") },
    { footage: D_TERBIT + 0.2, adegan: pada(ID, "Laporan selesai") },
  ],
  6,
);

const Buat: React.FC<{ mulai: number; k: number }> = ({ mulai, k }) => (
  <Footage
    src="rekaman/analis-desktop.mp4"
    epochMulaiVideo={EP}
    mulai={mulai}
    kecepatan={k}
    {...FL}
    label="Rekaman asli · Analis · LAPSIT"
    fokus={[
      { pada: D_BUAT - 1.6, kotak: panel },
      { pada: D_TERBIT - 0.6, kotak: panel },
      { pada: D_TERBIT + 0.4, kotak: atasDok },
    ]}
    klik={[{ pada: D_BUAT, kotak: penanda("buat-lapsit").klik! }]}
    sorot={[{ dari: D_BUAT - 1.2, sampai: D_TERBIT - 0.8, kotak: penanda("buat-lapsit").klik!, label: "Buat LAPSIT" }]}
  />
);

export const S12Lapsit: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const fr = (t: number) => Math.round(t * fps);
  const tTerbit = detikVideoUntuk(POT_BUAT, D_TERBIT + 0.2);
  const ukur = interpolate(d, [tTerbit, tTerbit + 0.3, B_KUTIPAN - 0.3, B_KUTIPAN], [0, 1, 1, 0], klem);
  const tStempel = pada(ID, "SHA-256") + 0.1;
  const stempel = interpolate(d, [tStempel, tStempel + 0.3], [0, 1], klem);
  const mulaiUnduh = D_UNDUH - (pada(ID, "PDF-nya") - B_UNDUH);
  return (
    <Bingkai id={ID} nomor="12" judul="Demo 8 · LAPSIT" durasi={durasi} dataLatihan dtgTeks={dtg(penanda("buat-lapsit").t)} tigaBagian={[kalimatMulai(ID, 0), kalimatMulai(ID, 1), kalimatMulai(ID, 3)]}>
      <Bunyi jenis="klik" pada={pada(ID, "satu klik")} />
      <Bunyi jenis="ketik-panjang" pada={tTerbit} keras={0.8} />
      <Bunyi jenis="whoosh" pada={B_KUTIPAN - 0.1} keras={0.6} />
      <Bunyi jenis="klik" pada={pada(ID, "PDF-nya")} />
      <Bunyi jenis="stempel" pada={tStempel} />

      <Sequence durationInFrames={fr(B_KUTIPAN)} layout="none">
        <Rangkaian potongan={POT_BUAT}>{(m, k) => <Buat mulai={m} k={k} />}</Rangkaian>
      </Sequence>
      <Sequence from={fr(B_KUTIPAN)} durationInFrames={fr(B_UNDUH) - fr(B_KUTIPAN)} layout="none">
        <Footage
          src="rekaman/stills/25-lapsit.png"
          gambar
          epochMulaiVideo={penanda("lapsit-terbit").t}
          mulai={0}
          {...FL}
          label="Tangkapan layar asli · LAPSIT"
          fokus={[
            { pada: 0, kotak: atasDok },
            { pada: 0.8, kotak: kutipan },
          ]}
          sorot={[{ dari: pada(ID, "mengutip nomor bukti") - B_KUTIPAN - 0.1, sampai: 30, kotak: { x: 494, y: 779, w: 150, h: 70 }, label: "Kutipan nomor bukti [EV-n]", warna: warna.awas, labelKanan: true }]}
        />
      </Sequence>
      <Sequence from={fr(B_UNDUH)} durationInFrames={fr(B_SEGEL) - fr(B_UNDUH)} layout="none">
        <Footage
          src="rekaman/analis-desktop.mp4"
          epochMulaiVideo={EP}
          mulai={mulaiUnduh}
          {...FL}
          label="Rekaman asli · Analis · LAPSIT"
          fokus={[{ pada: 0, kotak: atasDok }]}
          klik={[{ pada: D_UNDUH, kotak: penanda("unduh-pdf").klik! }]}
          sorot={[{ dari: D_UNDUH - 0.6, sampai: mulaiUnduh + 20, kotak: penanda("unduh-pdf").klik!, label: "Unduh PDF", labelBawah: true, labelKanan: true }]}
        />
      </Sequence>
      <Sequence from={fr(B_SEGEL)} layout="none">
        <Footage
          src="rekaman/stills/lapsit-hd-1.png"
          gambar
          epochMulaiVideo={penanda("unduh-pdf").t}
          mulai={0}
          {...FL}
          sumber={PDF}
          label="PDF asli hasil unduhan · halaman 1"
          fokus={[
            { pada: 0, kotak: fokusMuat({ x: 0, y: 120, w: PDF.w, h: 700 }, RFL, 0, PDF) },
            { pada: 0.7, kotak: fokusMuat({ x: 120, y: 2370, w: 1580, h: 150 }, RFL, 20, PDF) },
          ]}
          sorot={[{ dari: 0.6, sampai: 30, kotak: { x: 150, y: 2425, w: 1130, h: 40 }, label: "SHA-256 isi LAPSIT di kaki halaman", warna: warna.awas }]}
        />
      </Sequence>

      {/* Waktu pembuatan diukur Core (bukan perkiraan). */}
      {ukur > 0 && (
        <div style={{ position: "absolute", right: 120, top: 300, opacity: ukur, padding: "16px 24px", backgroundColor: `${warna.canvas}F2`, border: `2px solid ${warna.aman}`, whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase" }}>Waktu pembuatan LAPSIT</div>
          <div style={{ fontFamily: huruf.stensil, fontSize: 64, lineHeight: 1.05, color: warna.aman }}>
            {desimal(R.ukur.lapsitMs / 1000, 2)} <span style={{ fontSize: 30 }}>DTK</span>
          </div>
          <Chip warnaLatar={warna.raised} style={{ fontSize: 17, padding: "3px 10px" }}>
            diukur di lab · template
          </Chip>
        </div>
      )}
      {stempel > 0 && (
        <div style={{ position: "absolute", right: 150, top: 290, opacity: stempel, scale: `${1.3 - 0.3 * stempel}` }}>
          <Stempel warnaGaris={warna.awas} ukuran={64} style={{ backgroundColor: `${warna.canvas}E6` }}>
            Segel SHA-256
          </Stempel>
        </div>
      )}
      <ApaItu kiri={ISI.kiri + 16} bawah={500} lebar={760} kartu={[{ istilah: "Hash SHA-256", isi: "Sidik jari digital sebuah berkas. Berubah satu huruf saja, sidik jarinya berubah total.", dari: pada(ID, "sidik jari"), sampai: pada(ID, "sidik jari") + 6.5 }]} />
    </Bingkai>
  );
};
