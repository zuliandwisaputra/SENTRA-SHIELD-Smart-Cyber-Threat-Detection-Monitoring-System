// Thumbnail: YouTube (1280x720) dan karya untuk pameran hackathon (1200x630).
// Semua gambar adalah tangkapan layar asli dari rekaman lab; angka diambil dari rekaman.json (bukan diketik tangan).
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { R, desimal } from "./data";
import { Braket, Latar, Logo } from "./komponen/dasar";
import { huruf, warna } from "./tema";

export const THUMBNAIL = { width: 1280, height: 720 } as const;
export const THUMBNAIL_KARYA = { width: 1200, height: 630 } as const;

const PUTUS = desimal(R.ukur.portal.setujuKeGagalPertamaMs / 1000, 2);

type Potong = { src: string; x: number; y: number; w: number; h: number };

/** Potongan tangkapan layar desktop (1920 lebar), dimiringkan ke belakang. */
const LayarDesktop: React.FC<{ potong: Potong; lebar: number; kiri: number; atas: number; putarY?: number }> = ({ potong, lebar, kiri, atas, putarY = -14 }) => {
  const k = lebar / potong.w;
  return (
    <div style={{ position: "absolute", left: kiri, top: atas, perspective: 1400 }}>
      <div
        style={{
          position: "relative",
          width: lebar,
          height: potong.h * k,
          overflow: "hidden",
          border: `2px solid ${warna.lineStrong}`,
          boxShadow: `0 30px 80px #000C`,
          transform: `rotateY(${putarY}deg) rotateX(3deg)`,
          transformOrigin: "left center",
        }}
      >
        <Img src={staticFile(potong.src)} style={{ position: "absolute", left: -potong.x * k, top: -potong.y * k, width: 1920 * k }} />
        <AbsoluteFill style={{ background: `linear-gradient(90deg, ${warna.canvas}66, transparent 40%)` }} />
      </div>
    </div>
  );
};

/** HP dengan bingkai; tangkapan layar HP asli (lebar 1170) mulai dari atas. */
const LayarHp: React.FC<{ src: string; lebar: number; tinggi: number; kiri: number; atas: number; miring?: number }> = ({ src, lebar, tinggi, kiri, atas, miring = 6 }) => (
  <div
    style={{
      position: "absolute",
      left: kiri,
      top: atas,
      padding: 12,
      borderRadius: 44,
      backgroundColor: "#0A0C07",
      border: `3px solid ${warna.lineControl}`,
      boxShadow: `0 24px 60px #000E, 0 0 0 1px #000`,
      rotate: `${miring}deg`,
    }}
  >
    <div style={{ position: "relative", width: lebar, height: tinggi, borderRadius: 32, overflow: "hidden", backgroundColor: warna.canvas }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: 0, width: lebar }} />
    </div>
  </div>
);

const LabelLatihan: React.FC<{ kiri: number; atas: number; ukuran?: number }> = ({ kiri, atas, ukuran = 20 }) => (
  <div
    style={{
      position: "absolute",
      left: kiri,
      top: atas,
      padding: "4px 12px",
      backgroundColor: warna.waspada,
      color: warna.accentInk,
      fontFamily: huruf.kondensasi,
      fontWeight: 700,
      fontSize: ukuran,
      letterSpacing: "0.14em",
      whiteSpace: "nowrap",
    }}
  >
    DEMO LAB · DATA LATIHAN · REKAMAN ASLI
  </div>
);

// Beranda: kartu Situasi AWAS + peta operasi dengan garis serangan.
const BERANDA_BLOKIR: Potong = { src: "rekaman/stills/23-beranda-blokir.png", x: 320, y: 200, w: 1560, h: 880 };
// HP Komandan: Antrean Persetujuan dengan usulan blokir 172.30.0.66, skor 946.
const HP_ANTREAN = "rekaman/stills/19-hp-antrean.png";

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: warna.canvas, overflow: "hidden" }}>
    <Latar />
    {/* Cahaya merah di sisi kanan, sumber "bahaya". */}
    <AbsoluteFill style={{ background: `radial-gradient(circle at 78% 46%, ${warna.awas}40 0%, transparent 52%)` }} />
    <LayarDesktop potong={BERANDA_BLOKIR} lebar={640} kiri={700} atas={74} />
    <LayarHp src={HP_ANTREAN} lebar={300} tinggi={596} kiri={944} atas={232} />

    <div style={{ position: "absolute", left: 56, top: 54, display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" }}>
      <Logo ukuran={58} />
      <span style={{ fontFamily: huruf.stensil, fontSize: 44, letterSpacing: "0.08em", color: warna.accentStrong }}>SENTRA SHIELD</span>
    </div>

    <div style={{ position: "absolute", left: 50, top: 150, whiteSpace: "nowrap", lineHeight: 0.92 }}>
      <div style={{ fontFamily: huruf.stensil, fontSize: 124, letterSpacing: "0.02em", color: warna.ink, textShadow: "0 6px 24px #000" }}>SERANGAN</div>
      <div style={{ fontFamily: huruf.stensil, fontSize: 124, letterSpacing: "0.02em", color: warna.awas, textShadow: "0 6px 24px #000" }}>TERPUTUS</div>
    </div>

    <div
      style={{
        position: "absolute",
        left: 56,
        top: 448,
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        padding: "8px 22px 10px",
        backgroundColor: `${warna.canvas}E6`,
        border: `3px solid ${warna.aman}`,
        whiteSpace: "nowrap",
      }}
    >
      <Braket warnaGaris={warna.aman} ukuran={18} tebal={4} />
      <span style={{ fontFamily: huruf.stensil, fontSize: 92, lineHeight: 1, color: warna.aman }}>{PUTUS}</span>
      <span style={{ fontFamily: huruf.stensil, fontSize: 46, color: warna.aman }}>DETIK</span>
    </div>
    <div style={{ position: "absolute", left: 58, top: 584, fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 34, color: warna.ink2, whiteSpace: "nowrap" }}>
      setelah Komandan menyetujui blokir dari HP
    </div>
    <LabelLatihan kiri={58} atas={646} />
  </AbsoluteFill>
);

// Beranda dua satuan: AWAS + peta dengan garis serangan ke Kodim A dan Kodim B.
const BERANDA_DUA: Potong = { src: "rekaman/stills/05-beranda-dua-satuan.png", x: 300, y: 90, w: 1600, h: 990 };
const PILAR = ["Nyata", "Terukur", "Siap pakai"];

/** Thumbnail karya untuk pameran (1200x630): identitas produk, bukan cuplikan video. */
export const ThumbnailKarya: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: warna.canvas, overflow: "hidden" }}>
    <Latar />
    <AbsoluteFill style={{ background: `radial-gradient(circle at 80% 42%, ${warna.accent}2E 0%, transparent 55%)` }} />
    <LayarDesktop potong={BERANDA_DUA} lebar={580} kiri={650} atas={96} />
    <LayarHp src={HP_ANTREAN} lebar={250} tinggi={520} kiri={918} atas={178} />

    {/* Nama dan logo. */}
    <div style={{ position: "absolute", left: 50, top: 58, display: "flex", alignItems: "center", gap: 20 }}>
      <Logo ukuran={132} />
      <div style={{ whiteSpace: "nowrap", lineHeight: 0.9 }}>
        <div style={{ fontFamily: huruf.stensil, fontSize: 96, letterSpacing: "0.04em", color: warna.ink, textShadow: "0 6px 24px #000" }}>SENTRA</div>
        <div style={{ fontFamily: huruf.stensil, fontSize: 96, letterSpacing: "0.04em", color: warna.accentStrong, textShadow: "0 6px 24px #000" }}>SHIELD</div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 56, top: 262, fontFamily: huruf.mono, fontSize: 17, color: warna.accent, whiteSpace: "nowrap" }}>
      Smart Cyber Threat Detection &amp; Monitoring System
    </div>

    <div style={{ position: "absolute", left: 56, top: 304, fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 36, lineHeight: 1.15, color: warna.ink, whiteSpace: "nowrap", textShadow: "0 4px 16px #000" }}>
      <div>Pusat komando deteksi dan respons</div>
      <div>ancaman siber untuk satuan TNI AD</div>
    </div>

    <div style={{ position: "absolute", left: 56, top: 410, display: "flex", gap: 12 }}>
      {PILAR.map((p) => (
        <div
          key={p}
          style={{
            position: "relative",
            padding: "6px 18px 4px",
            backgroundColor: `${warna.canvas}E6`,
            border: `2px solid ${warna.accent}`,
            fontFamily: huruf.stensil,
            fontSize: 26,
            letterSpacing: "0.08em",
            color: warna.accentStrong,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {p}
        </div>
      ))}
    </div>

    <div style={{ position: "absolute", left: 56, top: 494, whiteSpace: "nowrap" }}>
      <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", color: warna.ink2 }}>KARTIKA CYBER HACKATHON 2026</div>
      <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 20, letterSpacing: "0.08em", color: warna.ink3 }}>
        Kategori 02 Penangkalan (Defensive Shield) · <span style={{ color: warna.accent }}>Tim Claudex404</span>
      </div>
    </div>
    <LabelLatihan kiri={58} atas={576} ukuran={17} />
  </AbsoluteFill>
);
