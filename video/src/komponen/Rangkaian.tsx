// Rangkaian potongan footage berurutan dengan kecepatan berbeda per potongan.
// Setiap potongan: detik footage mentah [mulai, sampai) diputar dengan `kecepatan`.
// Anak berupa fungsi (mulai, kecepatan) agar Footage, Terminal, dan penghitung memakai jam potongan yang aktif.
import React from "react";
import { Sequence, useVideoConfig } from "remotion";

export type Potongan = { mulai: number; sampai: number; kecepatan?: number };

/** Lama rangkaian di video (detik). */
export const lamaRangkaian = (p: Potongan[]) => p.reduce((a, x) => a + (x.sampai - x.mulai) / (x.kecepatan ?? 1), 0);

/** Detik video (relatif awal rangkaian) saat footage mencapai detik `t`. */
export const detikVideoUntuk = (p: Potongan[], t: number) => {
  let v = 0;
  for (const x of p) {
    const k = x.kecepatan ?? 1;
    if (t <= x.sampai) return v + Math.max(0, t - x.mulai) / k;
    v += (x.sampai - x.mulai) / k;
  }
  return v;
};

export const Rangkaian: React.FC<{ potongan: Potongan[]; children: (mulai: number, kecepatan: number) => React.ReactNode }> = ({ potongan, children }) => {
  const { fps } = useVideoConfig();
  let dari = 0;
  return (
    <>
      {potongan.map((x, i) => {
        const k = x.kecepatan ?? 1;
        const f0 = Math.round(dari * fps);
        dari += (x.sampai - x.mulai) / k;
        const f1 = Math.round(dari * fps);
        return (
          <Sequence key={i} from={f0} durationInFrames={Math.max(1, f1 - f0)} layout="none">
            {children(x.mulai, k)}
          </Sequence>
        );
      })}
    </>
  );
};
