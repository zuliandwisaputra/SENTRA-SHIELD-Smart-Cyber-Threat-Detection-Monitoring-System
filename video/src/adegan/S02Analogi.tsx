// Analogi pos jaga markas: setiap unsur pos jaga "berubah label" menjadi bagian SENTRA.
// Ikon generik buatan sendiri (bukan lambang resmi).
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pada } from "../data/narasi";
import { Braket, EASE } from "../komponen/dasar";
import { Bunyi } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "02-analogi";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type JenisIkon = "penjaga" | "posko" | "papan" | "komandan" | "buku";
const Ikon: React.FC<{ jenis: JenisIkon; c: string }> = ({ jenis, c }) => (
  <svg width={92} height={92} viewBox="0 0 100 100" fill="none" stroke={c} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
    {jenis === "penjaga" && (
      <>
        <path d="M30 36 Q50 16 70 36 Z" fill={`${c}33`} />
        <circle cx="50" cy="44" r="12" />
        <path d="M24 90 Q26 62 50 60 Q74 62 76 90" />
        <path d="M82 30 V90" />
      </>
    )}
    {jenis === "posko" && (
      <>
        <path d="M14 52 L50 24 L86 52" />
        <rect x="22" y="52" width="56" height="38" fill={`${c}22`} />
        <rect x="42" y="66" width="16" height="24" />
        <path d="M50 24 V8 L64 13 L50 18" />
      </>
    )}
    {jenis === "papan" && (
      <>
        <rect x="12" y="14" width="76" height="62" />
        <rect x="20" y="24" width="60" height="8" fill={warna.aman} stroke="none" />
        <rect x="20" y="36" width="60" height="8" fill={warna.waspada} stroke="none" />
        <rect x="20" y="48" width="60" height="8" fill={warna.siaga} stroke="none" />
        <rect x="20" y="60" width="60" height="8" fill={warna.awas} stroke="none" />
        <path d="M30 76 L24 92 M70 76 L76 92" />
      </>
    )}
    {jenis === "komandan" && (
      <>
        <path d="M50 6 L54 16 L65 16 L56 22 L60 32 L50 26 L40 32 L44 22 L35 16 L46 16 Z" fill={c} stroke="none" />
        <circle cx="50" cy="48" r="11" />
        <path d="M24 92 Q26 66 50 64 Q74 66 76 92" />
      </>
    )}
    {jenis === "buku" && (
      <>
        <path d="M50 26 Q32 16 12 20 V80 Q32 76 50 86 Q68 76 88 80 V20 Q68 16 50 26 Z" fill={`${c}18`} />
        <path d="M50 26 V86" />
        <path d="M22 36 H40 M22 48 H40 M60 36 H78 M60 48 H78 M60 60 H78" strokeWidth={3} />
      </>
    )}
  </svg>
);

type Baris = {
  ikon: JenisIkon;
  analog: string;
  analogIsi: string;
  sentra: string;
  sentraIsi: string;
  tAnalog: number;
  tSentra: number;
};

const BARIS: Baris[] = [
  { ikon: "penjaga", analog: "Penjaga gerbang", analogIsi: "mencatat siapa yang datang", sentra: "Agent", sentraIsi: "program kecil di komputer tiap satuan", tAnalog: pada(ID, "Di setiap gerbang"), tSentra: pada(ID, "disebut agent") },
  { ikon: "posko", analog: "Posko", analogIsi: "menerima semua laporan", sentra: "Core", sentraIsi: "membaca, mengenali pola, menilai bahaya", tAnalog: pada(ID, "dikirim ke posko"), tSentra: pada(ID, "disebut Core") },
  { ikon: "papan", analog: "Papan siaga", analogIsi: "tanda bahaya untuk semua", sentra: "Tingkat Siaga", sentraIsi: "", tAnalog: pada(ID, "papan siaga"), tSentra: pada(ID, "yaitu Tingkat Siaga") },
  { ikon: "komandan", analog: "Komandan", analogIsi: "satu-satunya pemberi perintah", sentra: "Persetujuan blokir", sentraIsi: "petugas mengusulkan, komandan memutuskan", tAnalog: pada(ID, "Kalau perlu tindakan"), tSentra: pada(ID, "hanya komandan") },
  { ikon: "buku", analog: "Buku jaga", analogIsi: "tidak bisa dihapus diam-diam", sentra: "Audit log", sentraIsi: "catatan berantai sidik jari", tAnalog: pada(ID, "ditulis di buku jaga"), tSentra: pada(ID, "audit log") },
];

const LEVEL = [
  { k: "Aman", c: warna.aman, t: pada(ID, "Aman") },
  { k: "Waspada", c: warna.waspada, t: pada(ID, "Waspada") },
  { k: "Siaga", c: warna.siaga, t: pada(ID, "Siaga", 3) },
  { k: "Awas", c: warna.awas, t: pada(ID, "Awas") },
];

const ATAS = 210;
const TINGGI = 128;
const JARAK = 14;

export const S02Analogi: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const o = (t: number, lama = 0.4) => interpolate(d, [t - 0.15, t - 0.15 + lama], [0, 1], { ...klem, easing: EASE });
  const tJudul = pada(ID, "pos jaga") - 0.2;
  return (
    <Bingkai id={ID} nomor="02" judul="Analogi pos jaga" durasi={durasi}>
      <Bunyi jenis="ping" pada={tJudul} />
      {BARIS.map((b) => (
        <React.Fragment key={b.analog}>
          <Bunyi jenis="klik" pada={b.tAnalog - 0.1} />
          <Bunyi jenis="whoosh" pada={b.tSentra - 0.25} keras={0.7} />
        </React.Fragment>
      ))}
      <Bunyi jenis="stempel" pada={BARIS[4].tSentra + 0.1} />

      {/* Kepala kolom */}
      {/* Kerangka lima baris sejak awal; terisi satu per satu mengikuti narasi. */}
      {BARIS.map((b, i) => (
        <React.Fragment key={`k-${b.analog}`}>
          <div style={{ position: "absolute", left: 96, top: ATAS + i * (TINGGI + JARAK), width: 760, height: TINGGI, border: `2px dashed ${warna.line}`, opacity: o(0.4) * (1 - o(b.tAnalog)) }} />
          <div style={{ position: "absolute", left: 1000, top: ATAS + i * (TINGGI + JARAK), width: 824, height: TINGGI, border: `2px dashed ${warna.line}`, opacity: o(0.4) * (1 - o(b.tSentra)) }} />
        </React.Fragment>
      ))}
      <div style={{ position: "absolute", left: 96, top: 140, width: 760, display: "flex", alignItems: "baseline", gap: 14, opacity: o(0.5), whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.accent }}>A //</span>
        <span style={{ fontFamily: huruf.stensil, fontSize: 36, letterSpacing: "0.08em", color: warna.ink }}>POS JAGA MARKAS</span>
      </div>
      <div style={{ position: "absolute", left: 1000, top: 140, width: 824, display: "flex", alignItems: "baseline", gap: 14, opacity: o(0.7), whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.aman }}>B //</span>
        <span style={{ fontFamily: huruf.stensil, fontSize: 36, letterSpacing: "0.08em", color: warna.ink }}>DI SENTRA</span>
      </div>

      {BARIS.map((b, i) => {
        const y = ATAS + i * (TINGGI + JARAK);
        const a = o(b.tAnalog);
        const s = o(b.tSentra, 0.5);
        const aktif = d >= b.tAnalog - 0.15 && (i === BARIS.length - 1 || d < BARIS[i + 1].tAnalog - 0.15);
        return (
          <React.Fragment key={b.analog}>
            <div
              style={{
                position: "absolute",
                left: 96,
                top: y,
                width: 760,
                height: TINGGI,
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "0 24px",
                backgroundColor: aktif ? warna.raised : `${warna.panel}EE`,
                border: `1px solid ${aktif ? warna.accent : warna.lineStrong}`,
                opacity: a,
                translate: `${(1 - a) * -40}px 0px`,
                whiteSpace: "nowrap",
              }}
            >
              <Braket warnaGaris={aktif ? warna.accent : warna.lineControl} ukuran={16} tebal={2} />
              <Ikon jenis={b.ikon} c={aktif ? warna.accentStrong : warna.accent} />
              <div>
                <div style={{ fontFamily: huruf.stensil, fontSize: 40, letterSpacing: "0.05em", color: warna.ink }}>{b.analog.toUpperCase()}</div>
                <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 30, color: warna.ink2 }}>{b.analogIsi}</div>
              </div>
            </div>
            {/* Panah "berubah label" */}
            <svg style={{ position: "absolute", left: 876, top: y + TINGGI / 2 - 20, opacity: s }} width={104} height={40}>
              <path d={`M4 20 H${4 + 86 * s}`} stroke={warna.accent} strokeWidth={5} />
              <path d="M78 6 L98 20 L78 34" fill="none" stroke={warna.accent} strokeWidth={5} opacity={s} />
            </svg>
            <div
              style={{
                position: "absolute",
                left: 1000,
                top: y,
                width: 824,
                height: TINGGI,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 28px",
                backgroundColor: `${warna.panel}F5`,
                border: `1px solid ${warna.lineStrong}`,
                borderLeft: `8px solid ${warna.aman}`,
                opacity: s,
                translate: `${(1 - s) * 40}px 0px`,
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ fontFamily: huruf.stensil, fontSize: 44, letterSpacing: "0.05em", color: warna.ink }}>{b.sentra.toUpperCase()}</div>
              {b.ikon === "papan" ? (
                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                  {LEVEL.map((l) => {
                    const m = o(l.t, 0.25);
                    return (
                      <span
                        key={l.k}
                        style={{
                          padding: "3px 16px",
                          backgroundColor: l.c,
                          color: warna.accentInk,
                          fontFamily: huruf.kondensasi,
                          fontWeight: 700,
                          fontSize: 26,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          opacity: m,
                          scale: `${1.3 - 0.3 * m}`,
                        }}
                      >
                        {l.k}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 30, color: warna.ink2 }}>{b.sentraIsi}</div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </Bingkai>
  );
};
