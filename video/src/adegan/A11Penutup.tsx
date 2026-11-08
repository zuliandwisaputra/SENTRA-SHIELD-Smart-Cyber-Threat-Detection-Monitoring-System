import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { kata, teksNarasi } from "../data/narasi";
import { LANDING, LOMBA, NAMA_ANGGOTA, NAMA_TIM, REPO } from "../data/identitas";
import { Logo, Panel, Stempel } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "11-penutup";

// Dari README bagian "Batasan yang diakui" dan "Sudah jalan vs peta jalan".
const BATASAN = [
  "Deteksi berbasis aturan dan ambang, belum machine learning.",
  "Blokir di firewall host agent, belum di perimeter.",
  "Sensor OT baru Modbus TCP, diuji pada PLC simulasi.",
];
// Peta jalan; `i` = indeks kata narasi saat butir itu disebut (null = tidak disebut).
const PETA = [
  { k: "Panjang", isi: "Uji coba di satuan nyata, sertifikasi keamanan, agent Windows.", i: 2 },
  { k: "Pendek", isi: "Mode latihan (replay), impor IOC offline, protokol industri S7comm dan DNP3.", i: 7 },
  { k: "Menengah", isi: "LAPSIT berjenjang Kodim → Kodam → Pusat, anomali per satuan.", i: null },
];
const KATA = [
  { kata: "Nyata", warna: warna.aman, i: 13 },
  { kata: "Terukur", warna: warna.waspada, i: 14 },
  { kata: "Siap pakai", warna: warna.accent, i: 15 },
];

const Butir: React.FC<{ children: React.ReactNode; o: number; sorot?: number }> = ({ children, o, sorot = 0 }) => (
  <div
    style={{
      display: "flex",
      gap: 16,
      fontFamily: huruf.kondensasi,
      fontSize: 38,
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

export const A11Penutup: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const o = (t: number, lama = 0.35) => interpolate(d, [t, t + lama], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tAkhir = kata(ID, 11) - 0.5; // "SENTRA SHIELD ..."
  const akhir = o(tAkhir, 0.4);
  return (
    <Bingkai
      nomor="11"
      judul="Penutup"
      durasi={durasi}
      keterangan={teksNarasi(ID, [
        [0, "Langkah berikutnya: uji coba di satuan nyata,"],
        [6, "dan menambah protokol industri lain."],
        [11, "SENTRA SHIELD: nyata, terukur, siap pakai."],
        [17, "Terima kasih."],
      ])}
    >
      <div style={{ opacity: 1 - akhir }}>
        <Panel nomor="01" kode="Peta jalan" style={{ left: 96, top: 150, width: 1040, height: 660 }}>
          <div style={{ padding: "18px 34px" }}>
            {PETA.map((p, n) => (
              <Butir key={p.k} o={o(0.2 + n * 0.2)} sorot={p.i === null ? 0 : o(kata(ID, p.i) - 0.2)}>
                <b style={{ color: warna.ink }}>{p.k}:</b> {p.isi}
              </Butir>
            ))}
          </div>
        </Panel>
        <Panel nomor="02" kode="Batasan" style={{ left: 1184, top: 150, width: 640, height: 660 }} aksen={warna.waspada}>
          <div style={{ padding: "18px 30px" }}>
            {BATASAN.map((b, i) => (
              <Butir key={b} o={o(0.6 + i * 0.2)}>
                <span style={{ fontSize: 32 }}>{b}</span>
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
            const m = o(kata(ID, k.i) - 0.15, 0.25);
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
      </div>
    </Bingkai>
  );
};
