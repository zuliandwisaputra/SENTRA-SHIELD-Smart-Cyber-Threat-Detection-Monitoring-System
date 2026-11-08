import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, desimal, dtg, ribuan } from "../data";
import { Braket, Panel } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

// Semua angka dari src/data/rekaman.json (rekaman 8 Nov 2026).
const insidenA = R.db.insiden.find((x) => x.satuan === "Kodim Latihan A" && /172\.30\.0\.66/.test(x.judul))!;
const eventA = R.db.eventPenyerangPerSumber.filter((x) => x.satuan === "KODIM-LAT-A").reduce((a, x) => a + x.jumlah, 0);
const aturan = R.db.deteksiPerAturan.length;
const uji = R.db.ujiKesiapan;
const ujiLolos = R.db.ujiKesiapanHasil.filter((x) => x.terdeteksi).length;
const auditBaris = (R.ukur.auditTeks.match(/(\d+) baris/) ?? [])[1];

const BARIS: { hal: string; nilai: string; ket: string; c: string }[] = [
  { hal: "Serangan ke Kodim A", nilai: `${ribuan(eventA)} → 1`, ket: `event menjadi 1 insiden · ${aturan} aturan · skor ${insidenA.skor} Kritis`, c: warna.awas },
  { hal: "Insiden tampil di Beranda", nilai: `${desimal(R.ukur.nmapKeInsidenDiBerandaMs / 1000, 1)} dtk`, ket: "setelah nmap dimulai, tanpa muat ulang", c: warna.accent },
  { hal: "Setujui → penyerang terputus", nilai: `≤ ${desimal(R.ukur.portal.setujuKeGagalPertamaMs / 1000, 2)} dtk`, ket: "diukur dari terminal penyerang", c: warna.aman },
  { hal: "Sensor dimatikan → BUTA", nilai: `${desimal(R.ukur.sensorMatiKeButaMs / 1000, 0)} dtk`, ket: "batas heartbeat 30 detik", c: warna.waspada },
  { hal: "Uji Kesiapan", nilai: `${ujiLolos}/${R.db.ujiKesiapanHasil.length}`, ket: `rata-rata ${desimal(uji.rata_ttd_ms / 1000, 1)} dtk · ${R.db.insidenDariEventUji.jumlah} insiden palsu`, c: warna.aman },
  { hal: "LAPSIT", nilai: `${desimal(R.ukur.lapsitMs / 1000, 1)} dtk`, ket: "template · PDF bersegel SHA-256", c: warna.accent },
  { hal: "Audit log", nilai: "Utuh", ket: `${auditBaris} baris diperiksa, semua hash cocok`, c: warna.aman },
];

const LAYAK = [
  { judul: "Satu klik", isi: "mulai-lab.bat menyalakan seluruh lab di Windows." },
  { judul: "Offline", isi: "Tanpa internet setelah image diunduh sekali. Tanpa cloud." },
  { judul: "Mini-PC", isi: "Docker dengan RAM kosong ±3 GB." },
  { judul: "Agent satu skrip", isi: "sudo ./install.sh --core-url … --code …" },
];

export const A10Angka: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const kanan = interpolate(d, [10.5, 11.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Bingkai
      nomor="10"
      judul="Angka hasil uji"
      durasi={durasi}
      dtgTeks={dtg(R.video.analis.mulai)}
      keterangan={[
        { dari: 0.5, sampai: 10.5, teks: "Semua angka ini diukur saat perekaman video ini, dari lab yang dinyalakan dari nol." },
        { dari: 10.5, sampai: 19.8, teks: "Siap dipasang: satu klik, offline, cukup di mini-PC, agent cukup satu skrip." },
      ]}
    >
      <Panel nomor="01" kode="Hasil uji" judul="Rekaman lab 8 November 2026" style={{ left: 96, top: 136, width: 1100, height: 770 }}>
        <div style={{ padding: "8px 28px" }}>
          {BARIS.map((b, i) => {
            const o = interpolate(d, [0.4 + i * 0.55, 0.8 + i * 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={b.hal} style={{ display: "grid", gridTemplateColumns: "340px 270px 1fr", alignItems: "center", gap: 20, padding: "12px 0", borderBottom: `1px solid ${warna.line}`, opacity: o, translate: `${(1 - o) * -24}px 0px` }}>
                <span style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 30, color: warna.ink }}>{b.hal}</span>
                <span style={{ fontFamily: huruf.stensil, fontSize: 44, color: b.c, whiteSpace: "nowrap" }}>{b.nilai}</span>
                <span style={{ fontFamily: huruf.kondensasi, fontSize: 25, lineHeight: 1.2, color: warna.ink2 }}>{b.ket}</span>
              </div>
            );
          })}
        </div>
      </Panel>
      <div style={{ position: "absolute", left: 1226, top: 136, width: 598, display: "flex", flexDirection: "column", gap: 14, opacity: kanan, translate: `${(1 - kanan) * 30}px 0px` }}>
        {LAYAK.map((l, i) => (
          <div key={l.judul} style={{ position: "relative", padding: "14px 24px", backgroundColor: warna.panel, border: `1px solid ${warna.lineStrong}`, borderLeft: `8px solid ${warna.accent}` }}>
            <Braket ukuran={16} tebal={2} />
            <div style={{ fontFamily: huruf.mono, fontSize: 22, color: warna.accent }}>0{i + 1} //</div>
            <div style={{ fontFamily: huruf.stensil, fontSize: 34, color: warna.ink }}>{l.judul.toUpperCase()}</div>
            <div style={{ fontFamily: i === 3 ? huruf.mono : huruf.kondensasi, fontSize: i === 3 ? 21 : 26, lineHeight: 1.2, color: warna.ink2, marginTop: 2 }}>{l.isi}</div>
          </div>
        ))}
      </div>
    </Bingkai>
  );
};
