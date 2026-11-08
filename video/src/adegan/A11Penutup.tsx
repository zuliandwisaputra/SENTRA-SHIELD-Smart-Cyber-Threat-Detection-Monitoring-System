import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LANDING, LOMBA, NAMA_TIM, REPO } from "../data/identitas";
import { Logo, Panel } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

// Dari README bagian "Batasan yang diakui" dan "Sudah jalan vs peta jalan".
const BATASAN = [
  "Deteksi berbasis aturan dan ambang, belum machine learning.",
  "Blokir di firewall host agent, belum di perimeter.",
  "Sensor OT baru Modbus TCP, diuji pada PLC simulasi.",
];
const PETA = [
  { k: "Pendek", isi: "Mode latihan (replay), impor IOC offline, S7comm dan DNP3." },
  { k: "Menengah", isi: "LAPSIT berjenjang Kodim → Kodam → Pusat, anomali per satuan." },
  { k: "Panjang", isi: "Uji coba di satuan nyata, sertifikasi keamanan, agent Windows." },
];

const Butir: React.FC<{ children: React.ReactNode; o: number }> = ({ children, o }) => (
  <div style={{ display: "flex", gap: 16, fontFamily: huruf.kondensasi, fontSize: 40, lineHeight: 1.25, color: warna.ink2, opacity: o, padding: "14px 0" }}>
    <span style={{ color: warna.accent }}>▸</span>
    <span>{children}</span>
  </div>
);

export const A11Penutup: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const o = (t: number) => interpolate(d, [t, t + 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const akhir = o(7.2);
  const awal = 1 - akhir;
  return (
    <Bingkai nomor="11" judul="Penutup" durasi={durasi} keterangan={[{ dari: 0.4, sampai: 7.2, teks: "Batasan kami akui terbuka, dan peta jalannya jelas." }]}>
      <div style={{ opacity: awal }}>
        <Panel nomor="01" kode="Batasan" style={{ left: 96, top: 150, width: 840, height: 660 }} aksen={warna.waspada}>
          <div style={{ padding: "18px 30px" }}>
            {BATASAN.map((b, i) => (
              <Butir key={b} o={o(0.4 + i * 0.4)}>
                {b}
              </Butir>
            ))}
          </div>
        </Panel>
        <Panel nomor="02" kode="Peta jalan" style={{ left: 984, top: 150, width: 840, height: 660 }}>
          <div style={{ padding: "18px 30px" }}>
            {PETA.map((p, i) => (
              <Butir key={p.k} o={o(1.8 + i * 0.4)}>
                <b style={{ color: warna.ink }}>{p.k}:</b> {p.isi}
              </Butir>
            ))}
          </div>
        </Panel>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: akhir }}>
        <Logo ukuran={170} gambar={interpolate(d, [7.2, 8.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        <div style={{ fontFamily: huruf.stensil, fontSize: 110, letterSpacing: "0.06em", color: warna.ink, lineHeight: 1 }}>SENTRA SHIELD</div>
        <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 46, color: warna.accent }}>Tim {NAMA_TIM}</div>
        <div style={{ marginTop: 26, fontFamily: huruf.mono, fontSize: 28, color: warna.ink }}>{REPO}</div>
        <div style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.ink3 }}>{LANDING}</div>
        <div style={{ marginTop: 24, fontFamily: huruf.kondensasi, fontSize: 30, color: warna.ink3 }}>{LOMBA}</div>
      </div>
    </Bingkai>
  );
};
