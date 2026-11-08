// Footage asli (rekaman Playwright) dengan kamera zoom/geser, sorotan, dan tanda klik.
// Semua waktu dalam DETIK FOOTAGE MENTAH, sehingga bisa langsung memakai data rekaman.json.
import { Video } from "@remotion/media";
import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Kotak, jamWib } from "../data";
import { huruf, warna } from "../tema";
import { Braket, Chip, EASE } from "./dasar";

/** Jam footage: detik footage dan waktu epoch untuk frame saat ini. */
export const useJam = (mulai: number, kecepatan: number, epochMulaiVideo: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const detik = mulai + (kecepatan * f) / fps;
  return { detik, epoch: epochMulaiVideo + detik * 1000 };
};

export type Fokus = { pada: number; kotak: Kotak };
export type SorotDef = { dari: number; sampai: number; kotak: Kotak; label?: string; warna?: string; labelBawah?: boolean; labelKanan?: boolean; redup?: boolean };
export type KlikDef = { pada: number; kotak: Kotak };

/** Kotak fokus dengan rasio panel, berpusat di (cx, cy) selebar w piksel sumber. */
export const fokusPusat = (cx: number, cy: number, w: number, rasio: number): Kotak => ({ x: cx - w / 2, y: cy - w / rasio / 2, w, h: w / rasio });
/** Kotak fokus yang memuat kotak k (dengan margin), mengikuti rasio panel. */
export const fokusMuat = (k: Kotak, rasio: number, margin = 40, sumber = { w: 1920, h: 1080 }): Kotak => {
  const w = Math.min(sumber.w, Math.max(k.w + margin * 2, (k.h + margin * 2) * rasio));
  const f = fokusPusat(k.x + k.w / 2, k.y + k.h / 2, w, rasio);
  // Jangan keluar dari bingkai sumber.
  const x = Math.min(Math.max(f.x, 0), sumber.w - f.w);
  const y = f.h >= sumber.h ? f.y : Math.min(Math.max(f.y, 0), sumber.h - f.h);
  return { ...f, x, y };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const kameraPada = (fokus: Fokus[], detik: number, sumber: { w: number; h: number }): Kotak => {
  if (fokus.length === 0) return { x: 0, y: 0, w: sumber.w, h: sumber.h };
  if (detik <= fokus[0].pada) return fokus[0].kotak;
  for (let i = 0; i < fokus.length - 1; i++) {
    const a = fokus[i];
    const b = fokus[i + 1];
    if (detik < b.pada) {
      const t = EASE(Math.min(1, Math.max(0, (detik - a.pada) / (b.pada - a.pada))));
      return { x: lerp(a.kotak.x, b.kotak.x, t), y: lerp(a.kotak.y, b.kotak.y, t), w: lerp(a.kotak.w, b.kotak.w, t), h: lerp(a.kotak.h, b.kotak.h, t) };
    }
  }
  return fokus[fokus.length - 1].kotak;
};

/** Transisi kamera: pegang `kotak` sampai `dari`, lalu bergerak ke `ke` dalam `durasi` detik. */
export const gerak = (dari: number, durasi: number, awal: Kotak, ke: Kotak): Fokus[] => [
  { pada: dari, kotak: awal },
  { pada: dari + durasi, kotak: ke },
];

export const Footage: React.FC<{
  src: string;
  epochMulaiVideo: number;
  mulai: number;
  kecepatan?: number;
  gambar?: boolean;
  kiri: number;
  atas: number;
  lebar: number;
  tinggi: number;
  sumber?: { w: number; h: number };
  fokus?: Fokus[];
  sorot?: SorotDef[];
  klik?: KlikDef[];
  label: string;
  tanpaKepala?: boolean;
  children?: React.ReactNode;
}> = ({
  src,
  epochMulaiVideo,
  mulai,
  kecepatan = 1,
  gambar = false,
  kiri,
  atas,
  lebar,
  tinggi,
  sumber = { w: 1920, h: 1080 },
  fokus = [],
  sorot = [],
  klik = [],
  label,
  tanpaKepala = false,
  children,
}) => {
  const { fps } = useVideoConfig();
  const { detik, epoch } = useJam(mulai, kecepatan, epochMulaiVideo);
  const kepala = tanpaKepala ? 0 : 44;
  const W = lebar;
  const H = tinggi - kepala;
  const k = kameraPada(fokus, detik, sumber);
  const s = Math.min(W / k.w, H / k.h);
  const tx = W / 2 - (k.x + k.w / 2) * s;
  const ty = H / 2 - (k.y + k.h / 2) * s;

  return (
    <div style={{ position: "absolute", left: kiri, top: atas, width: lebar, height: tinggi }}>
      {!tanpaKepala && (
        <div
          style={{
            height: kepala,
            display: "flex",
            alignItems: "center",
            gap: 14,
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
          <span style={{ flexShrink: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: gambar ? warna.accent : warna.awas }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
          <span style={{ flex: 1 }} />
          {kecepatan > 1 && (
            <Chip warnaLatar={warna.accent} warnaTeks={warna.accentInk} style={{ fontSize: 18, padding: "3px 10px" }}>
              Dipercepat {String(kecepatan).replace(".", ",")}×
            </Chip>
          )}
          <span style={{ fontFamily: huruf.mono, fontWeight: 400, fontSize: 20, letterSpacing: "0.04em", color: warna.ink3 }}>{jamWib(epoch)} WIB</span>
        </div>
      )}
      <div style={{ position: "relative", width: W, height: H, overflow: "hidden", backgroundColor: "#000" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: sumber.w, height: sumber.h, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
          {gambar ? (
            <Img src={staticFile(src)} style={{ width: sumber.w, height: sumber.h }} />
          ) : (
            <Video src={staticFile(src)} trimBefore={Math.round(mulai * fps)} playbackRate={kecepatan} muted style={{ width: sumber.w, height: sumber.h }} />
          )}
          {sorot.map((x, i) => (
            <Sorot key={i} def={x} detik={detik} skala={s} />
          ))}
          {klik.map((x, i) => (
            <TandaKlik key={i} def={x} detik={detik} skala={s} />
          ))}
        </div>
        {children}
      </div>
      <Braket warnaGaris={warna.accent} ukuran={26} />
    </div>
  );
};

const Sorot: React.FC<{ def: SorotDef; detik: number; skala: number }> = ({ def, detik, skala }) => {
  const masuk = interpolate(detik, [def.dari, def.dari + 0.35], [0, 1], { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const keluar = interpolate(detik, [def.sampai - 0.25, def.sampai], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = masuk * keluar;
  if (o <= 0) return null;
  const c = def.warna ?? warna.accent;
  const tebal = 5 / skala;
  const pad = 8 / skala;
  return (
    <div
      style={{
        position: "absolute",
        left: def.kotak.x - pad,
        top: def.kotak.y - pad,
        width: def.kotak.w + pad * 2,
        height: def.kotak.h + pad * 2,
        border: `${tebal}px solid ${c}`,
        boxShadow: def.redup === false ? `0 0 ${24 / skala}px ${c}` : `0 0 0 ${9999}px rgba(14,17,10,${0.45 * o}), 0 0 ${24 / skala}px ${c}`,
        opacity: o,
        scale: `${interpolate(masuk, [0, 1], [1.08, 1])}`,
      }}
    >
      {def.label && (
        <div
          style={{
            position: "absolute",
            ...(def.labelKanan ? { right: -tebal } : { left: -tebal }),
            ...(def.labelBawah ? { top: `calc(100% + ${6 / skala}px)` } : { bottom: `calc(100% + ${6 / skala}px)` }),
            padding: `${5 / skala}px ${14 / skala}px`,
            backgroundColor: c,
            color: warna.accentInk,
            fontFamily: huruf.kondensasi,
            fontWeight: 700,
            fontSize: 28 / skala,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {def.label}
        </div>
      )}
    </div>
  );
};

const TandaKlik: React.FC<{ def: KlikDef; detik: number; skala: number }> = ({ def, detik, skala }) => {
  const t = (detik - def.pada) / 0.7;
  if (t < -0.15 || t > 1) return null;
  const cx = def.kotak.x + def.kotak.w / 2;
  const cy = def.kotak.y + def.kotak.h / 2;
  const r = interpolate(Math.max(0, t), [0, 1], [14, 60]) / skala;
  const o = interpolate(t, [-0.15, 0, 1], [0, 1, 0]);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          border: `${4 / skala}px solid ${warna.accentStrong}`,
          opacity: o,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: cx - 9 / skala,
          top: cy - 9 / skala,
          width: 18 / skala,
          height: 18 / skala,
          borderRadius: "50%",
          backgroundColor: warna.accentStrong,
          opacity: o,
        }}
      />
    </>
  );
};

/** Bingkai HP generik (bukan merek tertentu) untuk footage viewport HP. */
export const BingkaiPonsel: React.FC<{ kiri: number; atas: number; skala: number; label?: string; children: React.ReactNode }> = ({
  kiri,
  atas,
  skala,
  label,
  children,
}) => {
  const w = 390 * skala;
  const h = 844 * skala;
  const tepi = 16;
  return (
    <div style={{ position: "absolute", left: kiri, top: atas, width: w + tepi * 2, height: h + tepi * 2 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 52,
          backgroundColor: "#11140C",
          border: `2px solid ${warna.lineControl}`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.6)`,
        }}
      />
      <div style={{ position: "absolute", left: tepi, top: tepi, width: w, height: h, borderRadius: 38, overflow: "hidden" }}>{children}</div>
      {label && (
        <div style={{ position: "absolute", top: -48, left: 0, right: 0, textAlign: "center" }}>
          <Chip warnaLatar={warna.raised} warnaTeks={warna.ink2} style={{ fontSize: 20 }}>
            {label}
          </Chip>
        </div>
      )}
    </div>
  );
};
