// Komponen pola berulang video v2: subtitle satu baris, pola tiga bagian, kartu "APA ITU?",
// label layar terbagi PENYERANG vs PERTAHANAN, dan efek suara dengan ducking di bawah narasi.
import { Audio } from "@remotion/media";
import React, { createContext, useContext } from "react";
import { Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { faktorRedam, subtitle } from "../data/narasi";
import { huruf, warna } from "../tema";
import { Braket, Chip, EASE } from "./dasar";

/** Id adegan yang sedang tampil (untuk subtitle dan ducking SFX). */
export const KonteksAdegan = createContext<string>("");

const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Batas area isi: di bawah kepala (dan pita tiga bagian), di atas subtitle. */
export const ISI = { atas: 136, atasDemo: 196, bawah: 930, kiri: 96, kanan: 1824 } as const;

// ---------- Subtitle ----------
export const Subtitle: React.FC<{ id: string }> = ({ id }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const aktif = subtitle(id).find((p) => d >= p.dari && d < p.sampai);
  if (!aktif) return null;
  const masuk = interpolate(d, [aktif.dari, aktif.dari + 0.18], [0, 1], { ...klem, easing: EASE });
  const keluar = interpolate(d, [aktif.sampai - 0.12, aktif.sampai], [1, 0], klem);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          padding: "12px 40px 14px",
          backgroundColor: `${warna.canvas}F0`,
          borderLeft: `8px solid ${warna.accent}`,
          boxShadow: `0 0 0 1px ${warna.lineStrong}, 0 10px 30px rgba(0,0,0,0.45)`,
          fontFamily: huruf.kondensasi,
          fontWeight: 600,
          fontSize: 52,
          lineHeight: 1.15,
          letterSpacing: "0.01em",
          color: warna.ink,
          whiteSpace: "nowrap",
          opacity: masuk * keluar,
          translate: `0px ${(1 - masuk) * 10}px`,
        }}
      >
        {aktif.teks}
      </div>
    </div>
  );
};

// ---------- Pola tiga bagian ----------
const BAGIAN = ["Apa yang terjadi", "Apa yang dilakukan SENTRA", "Kenapa penting"];
/** Pita 01/02/03 di bawah kepala. `waktu` = detik adegan saat tiap bagian mulai (null = tidak dipakai). */
export const TigaBagian: React.FC<{ waktu: (number | null)[] }> = ({ waktu }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  let aktif = -1;
  waktu.forEach((t, i) => {
    if (t !== null && d >= t - 0.15) aktif = i;
  });
  const muncul = interpolate(d, [0.2, 0.6], [0, 1], klem);
  return (
    <div style={{ position: "absolute", left: ISI.kiri, top: 120, height: 52, display: "flex", gap: 14, alignItems: "center", opacity: muncul }}>
      {BAGIAN.map((b, i) => {
        const t = waktu[i];
        const on = i === aktif;
        const lewat = i < aktif;
        const nyala = t === null ? 0 : interpolate(d, [t - 0.15, t + 0.2], [0, 1], klem);
        return (
          <React.Fragment key={b}>
            {i > 0 && <span style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.lineControl }}>›</span>}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 48,
                padding: "0 20px",
                whiteSpace: "nowrap",
                backgroundColor: on ? warna.accent : lewat ? warna.raised : `${warna.panel}CC`,
                border: `1px solid ${on ? warna.accentStrong : warna.lineStrong}`,
                opacity: t === null ? 0.35 : on ? 1 : lewat ? 0.8 : 0.55,
                scale: `${on ? 1 + 0.04 * nyala * (1 - Math.min(1, Math.max(0, d - t! - 0.2) * 3)) : 1}`,
              }}
            >
              <span style={{ fontFamily: huruf.mono, fontSize: 22, color: on ? warna.accentInk : warna.accent }}>0{i + 1}</span>
              <span style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 25, letterSpacing: "0.12em", textTransform: "uppercase", color: on ? warna.accentInk : warna.ink2 }}>{b}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------- Kartu "APA ITU?" ----------
export type DefApaItu = { istilah: string; isi: string; dari: number; sampai?: number };
/** Kartu penjelasan istilah, lower-third di kiri bawah (di atas subtitle). Beberapa kartu bisa bertumpuk. */
export const ApaItu: React.FC<{ kartu: DefApaItu[]; kiri?: number; bawah?: number; lebar?: number }> = ({ kartu, kiri = ISI.kiri, bawah = 150, lebar = 780 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const tampil = kartu.filter((k) => d >= k.dari - 0.05 && d < (k.sampai ?? k.dari + 6));
  if (tampil.length === 0) return null;
  return (
    <div style={{ position: "absolute", left: kiri, bottom: bawah, width: lebar, display: "flex", flexDirection: "column", gap: 10 }}>
      {tampil.map((k) => {
        const sampai = k.sampai ?? k.dari + 6;
        const m = interpolate(d, [k.dari, k.dari + 0.35], [0, 1], { ...klem, easing: EASE });
        const o = interpolate(d, [sampai - 0.3, sampai], [1, 0], klem);
        // Teks penjelasan diketik seperti teleprinter.
        const huruf_ = Math.floor(interpolate(d, [k.dari + 0.25, k.dari + 0.25 + k.isi.length * 0.022], [0, k.isi.length], klem));
        return (
          <div
            key={k.istilah}
            style={{
              position: "relative",
              padding: "14px 24px 16px",
              backgroundColor: `${warna.canvas}F5`,
              border: `1px solid ${warna.lineStrong}`,
              borderLeft: `8px solid ${warna.waspada}`,
              boxShadow: "0 12px 34px rgba(0,0,0,0.55)",
              opacity: m * o,
              translate: `${(1 - m) * -40}px 0px`,
            }}
          >
            <Braket warnaGaris={warna.waspada} ukuran={14} tebal={2} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" }}>
              <Chip warnaLatar={warna.waspada} warnaTeks={warna.accentInk} style={{ fontSize: 18, padding: "3px 10px" }}>
                Apa itu?
              </Chip>
              <span style={{ fontFamily: huruf.stensil, fontSize: 34, letterSpacing: "0.04em", color: warna.ink }}>{k.istilah}</span>
            </div>
            <div style={{ marginTop: 8, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 30, lineHeight: 1.22, color: warna.ink2, textWrap: "balance" }}>
              {k.isi.slice(0, huruf_)}
              <span style={{ opacity: 0 }}>{k.isi.slice(huruf_)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Layar terbagi ----------
/** Bingkai berwarna + label sisi (PENYERANG merah / PERTAHANAN hijau) di sekeliling panel. */
export const Sisi: React.FC<{ jenis: "penyerang" | "pertahanan"; kiri: number; atas: number; lebar: number; tinggi: number }> = ({ jenis, kiri, atas, lebar, tinggi }) => {
  const c = jenis === "penyerang" ? warna.awas : warna.aman;
  return (
    <div style={{ position: "absolute", left: kiri - 6, top: atas - 6, width: lebar + 12, height: tinggi + 12, border: `3px solid ${c}`, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          right: -3,
          top: -30,
          padding: "1px 14px",
          backgroundColor: c,
          color: warna.accentInk,
          fontFamily: huruf.stensil,
          fontSize: 24,
          letterSpacing: "0.12em",
          whiteSpace: "nowrap",
        }}
      >
        {jenis === "penyerang" ? "PENYERANG" : "PERTAHANAN"}
      </div>
    </div>
  );
};

// ---------- Efek suara ----------
export type JenisBunyi = "klik" | "ketik" | "ketik-panjang" | "bip" | "stempel" | "whoosh" | "ping" | "putus" | "sukses" | "detak" | "retak";
const KERAS: Record<JenisBunyi, number> = {
  klik: 0.5,
  ketik: 0.32,
  "ketik-panjang": 0.28,
  bip: 0.42,
  stempel: 0.6,
  whoosh: 0.32,
  ping: 0.4,
  putus: 0.7,
  sukses: 0.5,
  detak: 0.55,
  retak: 0.55,
};
const LAMA: Record<JenisBunyi, number> = {
  klik: 0.12,
  ketik: 0.6,
  "ketik-panjang": 2.4,
  bip: 0.39,
  stempel: 0.45,
  whoosh: 0.5,
  ping: 2.2,
  putus: 0.88,
  sukses: 0.95,
  detak: 0.5,
  retak: 0.5,
};
/** Redaman saat narasi berbicara: SFX turun ±8 dB. */
export const REDAM_SFX = 0.4;

/** Satu efek suara pada detik adegan `pada`. Keras diredam otomatis saat narasi berbicara. */
export const Bunyi: React.FC<{ jenis: JenisBunyi; pada: number; keras?: number }> = ({ jenis, pada, keras = 1 }) => {
  const id = useContext(KonteksAdegan);
  const { fps } = useVideoConfig();
  if (!Number.isFinite(pada) || pada < 0) return null;
  const dari = Math.round(pada * fps);
  return (
    <Sequence from={dari} durationInFrames={Math.ceil(LAMA[jenis] * fps) + 2} layout="none" name={`SFX ${jenis}`}>
      <Audio
        src={staticFile(`sfx/${jenis}.wav`)}
        volume={(fr) => {
          const t = pada + fr / fps;
          return KERAS[jenis] * keras * faktorRedam(id, t, REDAM_SFX);
        }}
      />
    </Sequence>
  );
};
