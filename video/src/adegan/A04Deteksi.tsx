import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, detikPenanda, detikSampel, dtg, kotakPenanda, penanda, ribuan } from "../data";
import { kata, teksNarasi } from "../data/narasi";
import { Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Terminal } from "../komponen/Terminal";
import { Panel } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "04-deteksi";
const EP = R.video.analis.mulai;
const SRC = "rekaman/analis-desktop.mp4";
const T = { kiri: 96, atas: 128, lebar: 640, tinggi: 740 };
const F = { kiri: 760, atas: 128, lebar: 1064, tinggi: 740 };
const RASIO_F = F.lebar / (F.tinggi - 44);

const SITUASI = kotakPenanda("beranda-awal", "situasi");
const KARTU_INSIDEN = { x: 330, y: 660, w: 205, h: 245 };
const BERANDA_KIRI = { x: 312, y: 196, w: 1150, h: 1150 / RASIO_F };
const BERANDA_LEBAR = fokusMuat({ x: 280, y: 90, w: 1600, h: 980 }, RASIO_F, 0);

// Angka asli: event dari penyerang ke Kodim A sampai brute force selesai (firewall + SSH).
const EV = R.db.eventPenyerangPerSumber.filter((x) => x.satuan === "KODIM-LAT-A" && (x.sumber === "firewall" || x.sumber === "ssh"));
const EV_TOTAL = EV.reduce((a, x) => a + x.jumlah, 0);

// Batas bagian mengikuti narasi: nmap -> (menebak kata sandi) hydra -> (Di Detail Insiden) Detail Insiden.
const B_HYDRA = kata(ID, 9) - 0.2; // "...di Kodim A": insiden pertama sudah tampil
const B_DETAIL = kata(ID, 26) - 0.5; // "Di detail insiden"
// Hydra diputar 1x; potongannya dipilih agar perubahan Aman -> Siaga di Beranda jatuh tepat saat
// narasi mengucapkan "tingkat siaga naik".
const T_SIAGA = detikSampel((s) => s.siaga === "Siaga: Siaga") - 0.3;
const MULAI_HYDRA = T_SIAGA - (kata(ID, 23) - 0.1 - B_HYDRA);

const A4a = () => {
  const mulai = detikPenanda("nmap-a") - 1.0;
  const { epoch } = useJam(mulai, 1, EP);
  const tInsiden = detikSampel((s) => /Insiden terbuka 1/.test(s.insiden ?? ""));
  return (
    <>
      <Terminal ids={["nmap-kodim-a"]} epoch={epoch} {...T} judul="Terminal penyerang · 172.30.0.66" />
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulai}
        {...F}
        label="Rekaman asli · Analis · desktop"
        fokus={[{ pada: 0, kotak: BERANDA_KIRI }]}
        sorot={[{ dari: tInsiden - 0.5, sampai: mulai + 9, kotak: KARTU_INSIDEN, label: "Insiden baru, tanpa muat ulang" }]}
      />
    </>
  );
};

const A4b = () => {
  const mulai = MULAI_HYDRA;
  const { epoch } = useJam(mulai, 1, EP);
  return (
    <>
      <Terminal ids={["hydra-kodim-a"]} epoch={epoch} {...T} judul="Terminal penyerang · 172.30.0.66" saring={(t) => !/^Hydra v/.test(t)} ukuranHuruf={19} />
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulai}
        {...F}
        label="Rekaman asli · Analis · desktop"
        fokus={[{ pada: 0, kotak: BERANDA_LEBAR }]}
        sorot={[{ dari: T_SIAGA - 0.2, sampai: mulai + 60, kotak: SITUASI, label: "Tingkat Siaga naik: Aman → Siaga", warna: warna.siaga }]}
      />
    </>
  );
};

const A4c = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps + B_DETAIL; // detik adegan
  const mulaiFootage = detikPenanda("detail-insiden-awal") - 2.4;
  const lamaFootage = 2.0;
  const skor = kotakPenanda("detail-insiden-awal", "skor");
  const FL = { kiri: 96, atas: 128, lebar: 1236, tinggi: 740 };
  const rasio = FL.lebar / (FL.tinggi - 44);
  const atasHalaman = fokusMuat({ x: 290, y: 90, w: 1600, h: 860 }, rasio, 0);
  const tahap12 = fokusMuat({ x: 340, y: 450, w: 760, h: 250 }, rasio, 20);
  // Detik relatif tangkapan layar (mulai setelah footage pendek).
  const s0 = B_DETAIL + lamaFootage;
  const tRatusan = kata(ID, 29) - s0; // "ratusan kejadian dirangkum"
  const tTahap = kata(ID, 35) - s0; // "Serangannya tersusun per tahap"
  const tMitre = kata(ID, 42) - s0; // "MITRE ATT&CK"
  const angka = interpolate(d, [kata(ID, 29) - 0.3, kata(ID, 33)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Sequence durationInFrames={Math.round(lamaFootage * fps)} layout="none">
        <Footage src={SRC} epochMulaiVideo={EP} mulai={mulaiFootage} {...FL} label="Rekaman asli · Analis · Detail Insiden" fokus={[{ pada: mulaiFootage, kotak: atasHalaman }]} />
      </Sequence>
      <Sequence from={Math.round(lamaFootage * fps)} layout="none">
        {/* Tangkapan layar asli di detik yang sama (tajam untuk diperbesar). */}
        <Footage
          src="rekaman/stills/09-insiden-awal.png"
          gambar
          epochMulaiVideo={penanda("detail-insiden-awal").t}
          mulai={0}
          {...FL}
          label="Tangkapan layar asli · Detail Insiden"
          fokus={[
            { pada: 0, kotak: atasHalaman },
            { pada: tTahap - 0.4, kotak: atasHalaman },
            { pada: tTahap + 0.4, kotak: tahap12 },
          ]}
          sorot={[
            { dari: tRatusan - 0.2, sampai: tTahap - 0.3, kotak: skor, label: "Satu insiden, satu skor", warna: warna.waspada, labelBawah: true, labelKanan: true },
            { dari: tTahap + 0.5, sampai: 30, kotak: { x: 345, y: 476, w: 742, h: 68 }, label: "Per tahap: Pengintaian → Akses Awal" },
            { dari: tMitre - 0.2, sampai: 30, kotak: { x: 362, y: 624, w: 74, h: 26 }, label: "T1046", labelBawah: true, redup: false },
            { dari: tMitre, sampai: 30, kotak: { x: 736, y: 624, w: 110, h: 26 }, label: "T1110.001", labelBawah: true, redup: false },
          ]}
        />
      </Sequence>
      <Panel nomor="01" kode="Ringkas" style={{ left: 1360, top: 128, width: 464, height: 740, opacity: angka > 0 ? 1 : 0 }}>
        <div style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          {EV.map((x) => (
            <div key={x.sumber} style={{ display: "flex", justifyContent: "space-between", fontFamily: huruf.kondensasi, fontSize: 32, color: warna.ink2 }}>
              <span>Event {x.sumber === "ssh" ? "SSH" : x.sumber}</span>
              <span style={{ fontFamily: huruf.mono, color: warna.ink }}>{ribuan(Math.round(x.jumlah * angka))}</span>
            </div>
          ))}
          <div style={{ borderTop: `2px solid ${warna.lineStrong}`, paddingTop: 16, display: "flex", justifyContent: "space-between", fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 34, color: warna.ink }}>
            <span>Total</span>
            <span style={{ fontFamily: huruf.mono }}>{ribuan(Math.round(EV_TOTAL * angka))}</span>
          </div>
          <div style={{ textAlign: "center", fontFamily: huruf.stensil, fontSize: 64, color: warna.accent, marginTop: 10 }}>↓</div>
          <div style={{ textAlign: "center", fontFamily: huruf.stensil, fontSize: 92, lineHeight: 1, color: warna.awas, opacity: angka }}>1</div>
          <div style={{ textAlign: "center", fontFamily: huruf.stensil, fontSize: 40, letterSpacing: "0.08em", color: warna.ink, opacity: angka }}>INSIDEN</div>
          <div style={{ textAlign: "center", fontFamily: huruf.kondensasi, fontSize: 24, color: warna.ink3 }}>Kodim Latihan A · dari 172.30.0.66 · sampai brute force selesai</div>
        </div>
      </Panel>
    </>
  );
};

export const A04Deteksi: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  return (
    <Bingkai
      nomor="04"
      judul="Demo deteksi"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(penanda("nmap-a").t)}
      keterangan={teksNarasi(ID, [
        [0, "Sekarang, penyerang memindai port dan menebak kata sandi di Kodim A."],
        [11, "Ini serangan sungguhan, bukan animasi."],
        [16, "Lihat: dashboard berubah sendiri tanpa refresh, dan Tingkat Siaga naik."],
        [26, "Di Detail Insiden, ratusan kejadian dirangkum jadi satu insiden."],
        [35, "Serangannya tersusun per tahap dan dipetakan ke MITRE ATT&CK."],
      ])}
    >
      <Sequence durationInFrames={Math.round(B_HYDRA * fps)} layout="none">
        <A4a />
      </Sequence>
      <Sequence from={Math.round(B_HYDRA * fps)} durationInFrames={Math.round((B_DETAIL - B_HYDRA) * fps)} layout="none">
        <A4b />
      </Sequence>
      <Sequence from={Math.round(B_DETAIL * fps)} layout="none">
        <A4c />
      </Sequence>
    </Bingkai>
  );
};
