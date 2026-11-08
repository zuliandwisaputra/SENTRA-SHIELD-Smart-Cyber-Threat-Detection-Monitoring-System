// Bingkai tiap adegan: latar, kepala bernomor, pita tiga bagian (opsional), subtitle satu baris dari narasi,
// transisi masuk/keluar yang singkat dan tegas. Menyediakan id adegan untuk ducking SFX.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { warna } from "../tema";
import { Kepala, Latar } from "../komponen/dasar";
import { KonteksAdegan, Subtitle, TigaBagian } from "../komponen/v2";

export const Bingkai: React.FC<{
  id: string;
  nomor: string;
  judul: string;
  durasi: number;
  dtgTeks?: string;
  dataLatihan?: boolean;
  tigaBagian?: (number | null)[];
  tanpaKepala?: boolean;
  children: React.ReactNode;
}> = ({ id, nomor, judul, durasi, dtgTeks, dataLatihan, tigaBagian, tanpaKepala, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationInFrames = Math.round(durasi * fps);
  // Masuk: bilah khaki menyapu dari kiri ke kanan dalam 14 frame.
  const sapu = interpolate(f, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Keluar: meredup ke kanvas pada 10 frame terakhir.
  const redup = interpolate(f, [durationInFrames - 10, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <KonteksAdegan.Provider value={id}>
      <AbsoluteFill>
        <Latar />
        {children}
        {!tanpaKepala && <Kepala nomor={nomor} judul={judul} dtgTeks={dtgTeks} dataLatihan={dataLatihan} />}
        {tigaBagian && <TigaBagian waktu={tigaBagian} />}
        <Subtitle id={id} />
        {sapu < 1 && (
          <AbsoluteFill style={{ backgroundColor: warna.canvas, clipPath: `inset(0 0 0 ${sapu * 100}%)` }}>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sapu * 100}%`, width: 14, marginLeft: -14, backgroundColor: warna.accent }} />
          </AbsoluteFill>
        )}
        {redup > 0 && <AbsoluteFill style={{ backgroundColor: warna.canvas, opacity: redup }} />}
      </AbsoluteFill>
    </KonteksAdegan.Provider>
  );
};
