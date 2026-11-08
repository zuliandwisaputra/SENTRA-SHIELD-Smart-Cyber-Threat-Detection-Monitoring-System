// Rangkaian potongan footage berurutan dengan kecepatan berbeda per potongan.
// Setiap potongan: detik footage mentah [mulai, sampai) diputar dengan `kecepatan`,
// atau gambar ditahan (freeze) di detik `mulai` selama `tahan` detik.
// Anak berupa fungsi (mulai, kecepatan) agar Footage, Terminal, dan penghitung memakai jam potongan yang aktif.
import React from "react";
import { Freeze, Sequence, useVideoConfig } from "remotion";

export type Potongan = { mulai: number; sampai: number; kecepatan?: number; tahan?: number };

const lama = (x: Potongan) => (x.tahan !== undefined ? x.tahan : (x.sampai - x.mulai) / (x.kecepatan ?? 1));

/** Lama rangkaian di video (detik). */
export const lamaRangkaian = (p: Potongan[]) => p.reduce((a, x) => a + lama(x), 0);

/** Detik video (relatif awal rangkaian) saat footage mencapai detik `t` (kemunculan pertama). */
export const detikVideoUntuk = (p: Potongan[], t: number) => {
  let v = 0;
  for (const x of p) {
    if (x.tahan === undefined && t <= x.sampai) return v + Math.max(0, t - x.mulai) / (x.kecepatan ?? 1);
    v += lama(x);
  }
  return v;
};

export type Jangkar = { footage: number; adegan: number };

/**
 * Potongan dari titik jangkar: detik footage `footage[i]` tampil tepat pada detik `adegan[i]`
 * (relatif awal rangkaian). Kecepatan dibulatkan ke atas per 0,1 (tidak pernah diperlambat);
 * selisih waktu yang tersisa diisi dengan menahan gambar terakhir. Setelah jangkar terakhir,
 * footage berjalan 1x selama `ekor` detik.
 */
export const dariJangkar = (j: Jangkar[], ekor: number): Potongan[] => {
  const p: Potongan[] = [];
  for (let i = 0; i < j.length - 1; i++) {
    const dF = j[i + 1].footage - j[i].footage;
    const dA = j[i + 1].adegan - j[i].adegan;
    if (dA <= 0) throw new Error(`Jangkar ${i} tidak berurutan`);
    const k = Math.max(1, Math.ceil((dF / dA) * 10 - 1e-6) / 10);
    p.push({ mulai: j[i].footage, sampai: j[i + 1].footage, kecepatan: k });
    const sisa = dA - dF / k;
    if (sisa > 1 / 120) p.push({ mulai: j[i + 1].footage, sampai: j[i + 1].footage, tahan: sisa });
  }
  const t = j[j.length - 1].footage;
  if (ekor > 0) p.push({ mulai: t, sampai: t + ekor, kecepatan: 1 });
  return p;
};

export const Rangkaian: React.FC<{ potongan: Potongan[]; children: (mulai: number, kecepatan: number) => React.ReactNode }> = ({ potongan, children }) => {
  const { fps } = useVideoConfig();
  let dari = 0;
  return (
    <>
      {potongan.map((x, i) => {
        const f0 = Math.round(dari * fps);
        dari += lama(x);
        const f1 = Math.round(dari * fps);
        if (f1 <= f0) return null;
        return (
          <Sequence key={i} from={f0} durationInFrames={f1 - f0} layout="none">
            {x.tahan !== undefined ? <Freeze frame={0}>{children(x.mulai, 1)}</Freeze> : children(x.mulai, x.kecepatan ?? 1)}
          </Sequence>
        );
      })}
    </>
  );
};
