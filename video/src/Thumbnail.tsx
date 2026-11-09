// Thumbnail YouTube 1280x720. Semua gambar adalah tangkapan layar asli dari rekaman lab;
// angka diambil dari rekaman.json (bukan diketik tangan).
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { R, desimal } from "./data";
import { Braket, Latar, Logo } from "./komponen/dasar";
import { huruf, warna } from "./tema";

export const THUMBNAIL = { width: 1280, height: 720 } as const;

const PUTUS = desimal(R.ukur.portal.setujuKeGagalPertamaMs / 1000, 2);

// Potongan Beranda desktop (kartu Situasi AWAS + peta operasi dengan garis serangan).
const DESK = { src: "rekaman/stills/23-beranda-blokir.png", x: 320, y: 200, w: 1560, h: 880 };
const DESK_LEBAR = 640;
const DESK_SKALA = DESK_LEBAR / DESK.w;

// HP Komandan: Antrean Persetujuan dengan usulan blokir 172.30.0.66, skor 946.
const HP = { src: "rekaman/stills/19-hp-antrean.png", w: 1170 };
const HP_LEBAR = 300;
const HP_SKALA = HP_LEBAR / HP.w;

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: warna.canvas, overflow: "hidden" }}>
    <Latar />
    {/* Cahaya merah di sisi kanan, sumber "bahaya". */}
    <AbsoluteFill style={{ background: `radial-gradient(circle at 78% 46%, ${warna.awas}40 0%, transparent 52%)` }} />

    {/* Beranda desktop, miring ke belakang. */}
    <div style={{ position: "absolute", left: 700, top: 74, perspective: 1400 }}>
      <div
        style={{
          position: "relative",
          width: DESK_LEBAR,
          height: DESK.h * DESK_SKALA,
          overflow: "hidden",
          border: `2px solid ${warna.lineStrong}`,
          boxShadow: `0 30px 80px #000C`,
          transform: "rotateY(-14deg) rotateX(3deg)",
          transformOrigin: "left center",
        }}
      >
        <Img
          src={staticFile(DESK.src)}
          style={{ position: "absolute", left: -DESK.x * DESK_SKALA, top: -DESK.y * DESK_SKALA, width: 1920 * DESK_SKALA }}
        />
        <AbsoluteFill style={{ background: `linear-gradient(90deg, ${warna.canvas}66, transparent 40%)` }} />
      </div>
    </div>

    {/* HP Komandan, keluar dari tepi bawah. */}
    <div
      style={{
        position: "absolute",
        left: 944,
        top: 232,
        width: HP_LEBAR + 24,
        height: 620,
        padding: 12,
        borderRadius: 44,
        backgroundColor: "#0A0C07",
        border: `3px solid ${warna.lineControl}`,
        boxShadow: `0 24px 60px #000E, 0 0 0 1px #000`,
        rotate: "6deg",
      }}
    >
      <div style={{ position: "relative", width: HP_LEBAR, height: 596, borderRadius: 32, overflow: "hidden", backgroundColor: warna.canvas }}>
        <Img src={staticFile(HP.src)} style={{ position: "absolute", left: 0, top: 0, width: HP.w * HP_SKALA }} />
      </div>
    </div>

    {/* Teks utama. */}
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

    <div
      style={{
        position: "absolute",
        left: 58,
        top: 646,
        padding: "4px 12px",
        backgroundColor: warna.waspada,
        color: warna.accentInk,
        fontFamily: huruf.kondensasi,
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: "0.14em",
        whiteSpace: "nowrap",
      }}
    >
      DEMO LAB · DATA LATIHAN · REKAMAN ASLI
    </div>
  </AbsoluteFill>
);
