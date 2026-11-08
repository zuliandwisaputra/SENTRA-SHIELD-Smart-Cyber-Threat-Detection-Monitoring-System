// Bingkai tiap adegan: latar, kepala bernomor, keterangan, transisi masuk/keluar yang singkat dan tegas.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { warna } from "../tema";
import { ItemKeterangan, Kepala, Keterangan, Latar } from "../komponen/dasar";

export const Bingkai: React.FC<{
  nomor: string;
  judul: string;
  durasi: number;
  dtgTeks?: string;
  dataLatihan?: boolean;
  keterangan?: ItemKeterangan[];
  posisiKeterangan?: { kiri: number; lebar: number; bawah?: number };
  tanpaKepala?: boolean;
  children: React.ReactNode;
}> = ({ nomor, judul, durasi, dtgTeks, dataLatihan, keterangan = [], posisiKeterangan, tanpaKepala, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationInFrames = Math.round(durasi * fps);
  // Masuk: bilah khaki menyapu dari kiri ke kanan dalam 14 frame.
  const sapu = interpolate(f, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Keluar: meredup ke kanvas pada 8 frame terakhir.
  const redup = interpolate(f, [durationInFrames - 8, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Latar />
      {children}
      {!tanpaKepala && <Kepala nomor={nomor} judul={judul} dtgTeks={dtgTeks} dataLatihan={dataLatihan} />}
      <Keterangan items={keterangan} {...posisiKeterangan} />
      {sapu < 1 && (
        <AbsoluteFill style={{ backgroundColor: warna.canvas, clipPath: `inset(0 0 0 ${sapu * 100}%)` }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sapu * 100}%`, width: 14, marginLeft: -14, backgroundColor: warna.accent }} />
        </AbsoluteFill>
      )}
      {redup > 0 && <AbsoluteFill style={{ backgroundColor: warna.canvas, opacity: redup }} />}
    </AbsoluteFill>
  );
};
