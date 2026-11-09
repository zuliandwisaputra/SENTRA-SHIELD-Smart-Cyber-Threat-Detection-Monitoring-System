import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, dtg } from "../data";
import { LOMBA, NAMA_ANGGOTA, NAMA_TIM } from "../data/identitas";
import { kalimatMulai, pada } from "../data/narasi";
import { Chip, Logo, Stempel } from "../komponen/dasar";
import { Bunyi } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "01-pembuka";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Tiga prinsip, masing-masing satu baris pendek.
const PRINSIP = [
  { kata: "Nyata", isi: "Serangan sungguhan di lab", warna: warna.aman },
  { kata: "Terukur", isi: "Setiap angka diukur", warna: warna.waspada },
  { kata: "Siap pakai", isi: "Offline, cukup di mini-PC", warna: warna.accent },
];
// Alur yang disebut di kalimat kedua.
const ALUR = ["dideteksi", "dijelaskan", "dihentikan", "terputus"];

export const S01Pembuka: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const o = (t: number, lama = 0.4) => interpolate(d, [t, t + lama], [0, 1], klem);
  const tJudul = pada(ID, "SENTRA SHIELD") - 0.2;
  const tSub = pada(ID, "pusat komando") - 0.2;
  const tPrinsip = [pada(ID, "untuk satuan") - 0.1, pada(ID, "untuk satuan") + 0.45, pada(ID, "untuk satuan") + 1.0];
  const tAlur = ALUR.map((k) => pada(ID, k) - 0.1);
  const tTim = pada(ID, "Tim Claudex404") - 0.1;
  const tAnggota = pada(ID, "Zulian") - 0.1;
  const tLomba = pada(ID, "Kartika") - 0.15;
  // Denyut singkat (0 → 1 → 0 dalam 0,6 dtk) saat nama disebut.
  const denyut = (t: number) => Math.sin(Math.PI * interpolate(d, [t, t + 0.6], [0, 1], klem));
  const logo = interpolate(d, [0.1, 1.6], [0, 1], klem);
  return (
    <Bingkai id={ID} nomor="01" judul="SENTRA SHIELD" durasi={durasi} tanpaKepala>
      <Bunyi jenis="ping" pada={0.15} />
      <Bunyi jenis="klik" pada={tTim} keras={0.6} />
      <Bunyi jenis="klik" pada={tLomba} keras={0.6} />
      {tPrinsip.map((t, i) => (
        <Bunyi key={i} jenis="stempel" pada={t + 0.05} />
      ))}

      <div style={{ position: "absolute", left: 144, top: 110, display: "flex", alignItems: "center", gap: 48 }}>
        <div style={{ opacity: Math.min(1, logo * 2) }}>
          <Logo ukuran={200} gambar={logo} />
        </div>
        <div style={{ whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: huruf.stensil, fontSize: 140, lineHeight: 0.95, letterSpacing: "0.06em", color: warna.ink, opacity: o(tJudul), translate: `${(1 - o(tJudul)) * -40}px 0px` }}>
            SENTRA SHIELD
          </div>
          <div style={{ marginTop: 20, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 50, color: warna.accent, opacity: o(tSub), translate: `0px ${(1 - o(tSub)) * 16}px` }}>
            Pusat Komando Deteksi &amp; Respons Ancaman Siber
          </div>
        </div>
      </div>

      {/* Identitas tim: tampil sejak awal, disorot saat kalimat "Karya ini dibuat oleh Tim …" diucapkan. */}
      <div style={{ position: "absolute", left: 144, top: 372, display: "flex", gap: 14, opacity: o(tSub + 0.6), whiteSpace: "nowrap" }}>
        <Chip warnaLatar={warna.accent} warnaTeks={warna.accentInk} style={{ fontSize: 26, padding: "8px 16px", scale: `${1 + 0.08 * denyut(tAnggota)}` }}>
          {NAMA_ANGGOTA}
        </Chip>
        <Chip warnaLatar={warna.raised} warnaTeks={warna.ink} style={{ fontSize: 26, padding: "8px 16px", border: `2px solid ${warna.accent}`, scale: `${1 + 0.08 * denyut(tTim)}` }}>
          Tim {NAMA_TIM}
        </Chip>
        <Chip warnaLatar={warna.raised} style={{ fontSize: 26, padding: "8px 16px", opacity: o(tLomba, 0.35), scale: `${1 + 0.08 * denyut(tLomba)}` }}>
          Kartika Cyber Hackathon 2026 · Penangkalan
        </Chip>
      </div>

      {/* Tiga prinsip: stempel + satu baris keterangan dengan jarak lega. */}
      <div style={{ position: "absolute", left: 144, right: 144, top: 470, display: "flex", justifyContent: "space-between" }}>
        {PRINSIP.map((k, i) => {
          const m = o(tPrinsip[i], 0.3);
          return (
            <div key={k.kata} style={{ width: 500, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 26, opacity: m, scale: `${1.25 - 0.25 * m}`, transformOrigin: "left center" }}>
              <Stempel warnaGaris={k.warna} ukuran={62} miring={i === 1 ? 3 : -3}>
                {k.kata}
              </Stempel>
              <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 36, color: warna.ink2, whiteSpace: "nowrap" }}>{k.isi}</div>
            </div>
          );
        })}
      </div>

      {/* Alur kalimat ketiga: dideteksi → dijelaskan → dihentikan → terputus. */}
      <div style={{ position: "absolute", left: 144, right: 144, top: 730, display: "flex", alignItems: "center", gap: 22, opacity: o(kalimatMulai(ID, 2) - 0.2) }}>
        {ALUR.map((k, i) => {
          const m = o(tAlur[i], 0.3);
          const akhir = i === ALUR.length - 1;
          return (
            <React.Fragment key={k}>
              {i > 0 && <span style={{ fontFamily: huruf.mono, fontSize: 40, color: m > 0.5 ? warna.accent : warna.lineStrong }}>→</span>}
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "14px 10px",
                  border: `2px solid ${m > 0.5 ? (akhir ? warna.awas : warna.accent) : warna.line}`,
                  backgroundColor: m > 0.5 ? (akhir ? `${warna.awas}22` : warna.raised) : `${warna.panel}AA`,
                  fontFamily: huruf.stensil,
                  fontSize: 40,
                  letterSpacing: "0.08em",
                  color: m > 0.5 ? (akhir ? warna.awas : warna.ink) : warna.ink3,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  scale: `${1 + 0.06 * Math.sin(Math.PI * m)}`,
                }}
              >
                {k}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 144, right: 144, top: 880, display: "flex", justifyContent: "space-between", gap: 24, fontFamily: huruf.mono, fontSize: 21, color: warna.ink3, opacity: o(tSub + 0.8), whiteSpace: "nowrap" }}>
        <span>{LOMBA}</span>
        <span>Rekaman asli lab · DTG {dtg(R.video.analis.mulai)}</span>
      </div>
    </Bingkai>
  );
};
