import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pada } from "../data/narasi";
import { Bunyi } from "../komponen/v2";
import { LANDING, LOMBA, NAMA_ANGGOTA, NAMA_TIM, REPO } from "../data/identitas";
import { Logo, Panel, Stempel } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "19-penutup";

// Dari README bagian "Batasan yang diakui" dan "Sudah jalan vs peta jalan".
const BATASAN = [
  "Deteksi berbasis aturan dan ambang, belum machine learning.",
  "Blokir di firewall host agent, belum di perimeter jaringan.",
  "Sensor mesin industri baru Modbus TCP, diuji pada PLC simulasi.",
];
// Peta jalan; `frasa` = saat butir itu disebut di narasi (null = tidak disebut).
const PETA = [
  { k: "Pendek", isi: "mode latihan (replay), impor IOC offline, protokol industri S7comm dan DNP3.", frasa: "protokol mesin industri" as string | null },
  { k: "Menengah", isi: "LAPSIT berjenjang Kodim → Kodam → Pusat, anomali per satuan.", frasa: null as string | null },
  { k: "Panjang", isi: "uji coba di satuan nyata, sertifikasi keamanan, agent Windows.", frasa: "uji coba di satuan nyata" as string | null },
];
const KATA = [
  { kata: "Nyata", warna: warna.aman, frasa: "nyata," },
  { kata: "Terukur", warna: warna.waspada, frasa: "terukur" },
  { kata: "Siap pakai", warna: warna.accent, frasa: "siap pakai" },
];

const Butir: React.FC<{ children: React.ReactNode; o: number; sorot?: number }> = ({ children, o, sorot = 0 }) => (
  <div
    style={{
      display: "flex",
      gap: 16,
      fontFamily: huruf.kondensasi,
      fontSize: 34,
      whiteSpace: "nowrap",
      lineHeight: 1.25,
      color: sorot > 0.5 ? warna.ink : warna.ink2,
      opacity: o,
      padding: "12px 14px",
      marginLeft: -14,
      backgroundColor: `rgba(201,181,122,${0.14 * sorot})`,
      borderLeft: `6px solid rgba(201,181,122,${sorot})`,
    }}
  >
    <span style={{ color: warna.accent }}>▸</span>
    <span>{children}</span>
  </div>
);

export const S19Penutup: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const o = (t: number, lama = 0.35) => interpolate(d, [t, t + lama], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tAkhir = pada(ID, "SENTRA SHIELD") - 0.5;
  const akhir = o(tAkhir, 0.4);
  return (
    <Bingkai id={ID} nomor="19" judul="Penutup" durasi={durasi}>
      {KATA.map((k) => (
        <Bunyi key={k.kata} jenis="stempel" pada={pada(ID, k.frasa, k.frasa === "nyata," ? 2 : 1) - 0.1} />
      ))}
      <Bunyi jenis="ping" pada={tAkhir + 0.2} keras={0.8} />
      <div style={{ opacity: 1 - akhir }}>
        <Panel nomor="01" kode="Peta jalan" style={{ left: 96, top: 140, width: 1728, height: 340 }}>
          <div style={{ padding: "18px 34px" }}>
            {PETA.map((p, n) => (
              <Butir key={p.k} o={o(0.2 + n * 0.2)} sorot={p.frasa === null ? 0 : o(pada(ID, p.frasa) - 0.2)}>
                <b style={{ color: warna.ink }}>{p.k}:</b> {p.isi}
              </Butir>
            ))}
          </div>
        </Panel>
        <Panel nomor="02" kode="Batasan yang diakui" style={{ left: 96, top: 510, width: 1728, height: 330 }} aksen={warna.waspada}>
          <div style={{ padding: "18px 30px" }}>
            {BATASAN.map((b, i) => (
              <Butir key={b} o={o(0.6 + i * 0.2)}>
                <span>{b}</span>
              </Butir>
            ))}
          </div>
        </Panel>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: akhir }}>
        <Logo ukuran={150} gambar={interpolate(d, [tAkhir, tAkhir + 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        <div style={{ fontFamily: huruf.stensil, fontSize: 104, letterSpacing: "0.06em", color: warna.ink, lineHeight: 1 }}>SENTRA SHIELD</div>
        <div style={{ display: "flex", gap: 44, marginTop: 18, height: 96, alignItems: "center" }}>
          {KATA.map((k, n) => {
            const m = o(pada(ID, k.frasa, k.frasa === "nyata," ? 2 : 1) - 0.15, 0.25);
            return (
              <div key={k.kata} style={{ opacity: m, scale: `${1.25 - 0.25 * m}` }}>
                <Stempel warnaGaris={k.warna} ukuran={54} miring={n === 1 ? 3 : -3}>
                  {k.kata}
                </Stempel>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 22, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 40, color: warna.accent }}>
          {NAMA_ANGGOTA} · Tim {NAMA_TIM}
        </div>
        <div style={{ marginTop: 6, fontFamily: huruf.mono, fontSize: 26, color: warna.ink }}>{REPO}</div>
        <div style={{ fontFamily: huruf.mono, fontSize: 22, color: warna.ink3 }}>{LANDING}</div>
        <div style={{ marginTop: 10, fontFamily: huruf.kondensasi, fontSize: 28, color: warna.ink3 }}>{LOMBA}</div>
        <div style={{ marginTop: 6, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 24, color: warna.ink3, whiteSpace: "nowrap" }}>Narasi: suara sintetis (TTS) · Efek suara dan musik dibuat sendiri secara prosedural</div>
      </div>
    </Bingkai>
  );
};
