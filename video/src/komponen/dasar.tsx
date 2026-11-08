// Komponen dasar identitas Olive Drab / Ops Darat untuk video.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { huruf, warna } from "../tema";

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** 0..1 dari detik `mulai` selama `durasi` detik (relatif terhadap Sequence saat ini). */
export const useMuncul = (mulai: number, durasi = 0.45) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(f, [mulai * fps, (mulai + durasi) * fps], [0, 1], {
    easing: EASE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/** Latar kanvas olive dengan grid koordinat peta tipis. */
export const Latar: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: warna.canvas }}>
    <AbsoluteFill
      style={{
        backgroundImage: [
          `linear-gradient(${warna.line}55 1px, transparent 1px)`,
          `linear-gradient(90deg, ${warna.line}55 1px, transparent 1px)`,
          `linear-gradient(${warna.line}22 1px, transparent 1px)`,
          `linear-gradient(90deg, ${warna.line}22 1px, transparent 1px)`,
        ].join(","),
        backgroundSize: "240px 240px, 240px 240px, 48px 48px, 48px 48px",
      }}
    />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, transparent 40%, ${warna.canvas} 100%)` }} />
    {children}
  </AbsoluteFill>
);

/** Sudut braket (seperti panel di Core). */
export const Braket: React.FC<{ warnaGaris?: string; ukuran?: number; tebal?: number }> = ({
  warnaGaris = warna.accent,
  ukuran = 22,
  tebal = 3,
}) => {
  const s: React.CSSProperties = { position: "absolute", width: ukuran, height: ukuran, borderColor: warnaGaris, borderStyle: "solid" };
  return (
    <>
      <div style={{ ...s, left: -2, top: -2, borderWidth: `${tebal}px 0 0 ${tebal}px` }} />
      <div style={{ ...s, right: -2, top: -2, borderWidth: `${tebal}px ${tebal}px 0 0` }} />
      <div style={{ ...s, left: -2, bottom: -2, borderWidth: `0 0 ${tebal}px ${tebal}px` }} />
      <div style={{ ...s, right: -2, bottom: -2, borderWidth: `0 ${tebal}px ${tebal}px 0` }} />
    </>
  );
};

/** Panel bernomor: "02 // KODE" + judul. */
export const Panel: React.FC<{
  nomor?: string;
  kode?: string;
  judul?: string;
  style?: React.CSSProperties;
  isiStyle?: React.CSSProperties;
  children?: React.ReactNode;
  aksen?: string;
}> = ({ nomor, kode, judul, style, isiStyle, children, aksen = warna.accent }) => (
  <div
    style={{
      position: "absolute",
      backgroundColor: `${warna.panel}F2`,
      border: `1px solid ${warna.lineStrong}`,
      display: "flex",
      flexDirection: "column",
      ...style,
    }}
  >
    <Braket warnaGaris={aksen} />
    {(nomor || kode) && (
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "18px 26px 14px", borderBottom: `1px solid ${warna.line}` }}>
        {nomor && <span style={{ fontFamily: huruf.mono, fontSize: 24, color: aksen }}>{nomor} //</span>}
        {kode && (
          <span style={{ fontFamily: huruf.stensil, fontSize: 30, letterSpacing: "0.08em", color: warna.ink, textTransform: "uppercase" }}>
            {kode}
          </span>
        )}
        {judul && <span style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 26, color: warna.ink2, marginLeft: 6 }}>{judul}</span>}
      </div>
    )}
    <div style={{ position: "relative", flex: 1, ...isiStyle }}>{children}</div>
  </div>
);

/** Chip kecil berhuruf kapital. */
export const Chip: React.FC<{ children: React.ReactNode; warnaLatar?: string; warnaTeks?: string; style?: React.CSSProperties }> = ({
  children,
  warnaLatar = warna.inset,
  warnaTeks = warna.ink2,
  style,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 14px",
      borderRadius: 4,
      backgroundColor: warnaLatar,
      color: warnaTeks,
      fontFamily: huruf.kondensasi,
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

/** Label DATA LATIHAN: selalu terlihat saat footage aplikasi tampil. */
export const LabelDataLatihan: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <Chip
    warnaLatar={warna.waspada}
    warnaTeks={warna.accentInk}
    style={{ fontSize: 20, padding: "5px 12px", ...style }}
  >
    DATA LATIHAN · REKAMAN ASLI LAB
  </Chip>
);

/** Stempel miring seperti di Core. */
export const Stempel: React.FC<{ children: React.ReactNode; warnaGaris?: string; ukuran?: number; miring?: number; style?: React.CSSProperties }> = ({
  children,
  warnaGaris = warna.awas,
  ukuran = 44,
  miring = -4,
  style,
}) => (
  <div
    style={{
      display: "inline-block",
      padding: "10px 26px",
      border: `5px double ${warnaGaris}`,
      color: warnaGaris,
      fontFamily: huruf.stensil,
      fontSize: ukuran,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      rotate: `${miring}deg`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Kepala adegan: nomor // judul di kiri, DTG di kanan, penggaris di bawah. */
export const Kepala: React.FC<{ nomor: string; judul: string; dtgTeks?: string; dataLatihan?: boolean }> = ({ nomor, judul, dtgTeks, dataLatihan }) => {
  const m = useMuncul(0.05, 0.4);
  return (
    <div style={{ position: "absolute", left: 96, right: 96, top: 40, height: 64, opacity: m, translate: `${(1 - m) * -30}px 0px` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: huruf.mono, fontSize: 30, color: warna.accent }}>{nomor} //</span>
        <span style={{ fontFamily: huruf.stensil, fontSize: 46, letterSpacing: "0.08em", color: warna.ink, textTransform: "uppercase" }}>{judul}</span>
        <span style={{ flex: 1 }} />
        {dataLatihan && <LabelDataLatihan style={{ alignSelf: "center" }} />}
        {dtgTeks && <span style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.ink3, letterSpacing: "0.06em", marginLeft: 18 }}>DTG {dtgTeks}</span>}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 66,
          height: 10,
          borderTop: `1px solid ${warna.lineStrong}`,
          backgroundImage: `linear-gradient(90deg, ${warna.lineStrong} 1px, transparent 1px)`,
          backgroundSize: "48px 8px",
          backgroundRepeat: "repeat-x",
        }}
      />
    </div>
  );
};

/** Teks keterangan besar berbahasa Indonesia di bagian bawah. Waktu dalam detik relatif adegan. */
export type ItemKeterangan = { dari: number; sampai: number; teks: React.ReactNode };
export const Keterangan: React.FC<{ items: ItemKeterangan[]; bawah?: number; kiri?: number; lebar?: number }> = ({ items, bawah = 56, kiri, lebar }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const aktif = items.find((i) => d >= i.dari && d < i.sampai);
  if (!aktif) return null;
  const masuk = interpolate(d, [aktif.dari, aktif.dari + 0.3], [0, 1], { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const keluar = interpolate(d, [aktif.sampai - 0.2, aktif.sampai], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: kiri ?? 0,
        right: kiri === undefined ? 0 : undefined,
        width: lebar,
        bottom: bawah,
        display: "flex",
        justifyContent: kiri === undefined ? "center" : "flex-start",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: lebar ?? 1560,
          padding: "16px 34px 18px 40px",
          backgroundColor: `${warna.canvas}EE`,
          borderLeft: `8px solid ${warna.accent}`,
          boxShadow: `0 0 0 1px ${warna.lineStrong}`,
          fontFamily: huruf.kondensasi,
          fontWeight: 600,
          fontSize: 50,
          lineHeight: 1.18,
          color: warna.ink,
          textAlign: "left",
          opacity: masuk * keluar,
          translate: `0px ${(1 - masuk) * 18}px`,
          textWrap: "balance",
        }}
      >
        {aktif.teks}
      </div>
    </div>
  );
};

/** Tanda SENTRA SHIELD (perisai dengan radar), sama dengan application-logo di Core. Rancangan sendiri. */
export const Logo: React.FC<{ ukuran: number; gambar?: number; warnaGaris?: string }> = ({ ukuran, gambar = 1, warnaGaris = warna.accent }) => {
  const panjang = 90;
  return (
    <svg viewBox="0 0 32 32" width={ukuran} height={ukuran} fill="none" style={{ color: warnaGaris, overflow: "visible" }}>
      <path
        d="M16 2.6 5.2 6.7v8.1c0 6.5 4.5 12.4 10.8 14 6.3-1.6 10.8-7.5 10.8-14V6.7L16 2.6Z"
        fill="currentColor"
        fillOpacity={0.1 * gambar}
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
        strokeDasharray={panjang}
        strokeDashoffset={panjang * (1 - gambar)}
      />
      <g opacity={interpolate(gambar, [0.4, 1], [0, 1], { extrapolateLeft: "clamp" })}>
        <circle cx="16" cy="15.4" r="6" stroke="currentColor" strokeOpacity=".45" strokeWidth="1.2" />
        <circle cx="16" cy="15.4" r="2.8" stroke="currentColor" strokeOpacity=".45" strokeWidth="1.2" />
        <path d="M16 7.6v2.2M16 21v2.2M8.2 15.4h2.2M21.6 15.4h2.2" stroke="currentColor" strokeOpacity=".7" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M16 15.4 20.6 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16" cy="15.4" r="1.4" fill="currentColor" />
      </g>
    </svg>
  );
};

/** Simbol satuan generik (persegi + garis sinyal), mirip simbol di peta operasi Core. */
export const SimbolSatuan: React.FC<{ lebar?: number; warnaGaris?: string; eselon?: string; isi?: "sinyal" | "plc" | "server" }> = ({
  lebar = 120,
  warnaGaris = warna.accent,
  eselon,
  isi = "sinyal",
}) => {
  const t = lebar * 0.62;
  return (
    <div style={{ position: "relative", width: lebar, height: t + (eselon ? 30 : 0) }}>
      {eselon && (
        <div style={{ textAlign: "center", fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 24, letterSpacing: "0.2em", color: warnaGaris, height: 30 }}>{eselon}</div>
      )}
      <svg width={lebar} height={t} viewBox="0 0 100 62">
        <rect x="2" y="2" width="96" height="58" fill={`${warnaGaris}14`} stroke={warnaGaris} strokeWidth="3" />
        {isi === "sinyal" && <path d="M14 42 L34 20 L50 38 L66 20 L86 42" fill="none" stroke={warnaGaris} strokeWidth="3.5" />}
        {isi === "plc" && (
          <g stroke={warnaGaris} strokeWidth="3.5" fill="none">
            <path d="M22 16v30M38 16v30M54 16v30M70 16v30" />
            <path d="M16 31h64" />
          </g>
        )}
        {isi === "server" && (
          <g stroke={warnaGaris} strokeWidth="3.5" fill="none">
            <rect x="24" y="12" width="52" height="16" />
            <rect x="24" y="34" width="52" height="16" />
          </g>
        )}
      </svg>
    </div>
  );
};

/** Penanda penyerang: belah ketupat dengan silang (seperti di peta operasi Core). */
export const SimbolPenyerang: React.FC<{ ukuran?: number; warnaGaris?: string }> = ({ ukuran = 90, warnaGaris = warna.awas }) => (
  <svg width={ukuran} height={ukuran} viewBox="0 0 100 100">
    <path d="M50 4 L96 50 L50 96 L4 50 Z" fill={`${warnaGaris}18`} stroke={warnaGaris} strokeWidth="4" />
    <path d="M34 34 L66 66 M66 34 L34 66" stroke={warnaGaris} strokeWidth="5" />
  </svg>
);
