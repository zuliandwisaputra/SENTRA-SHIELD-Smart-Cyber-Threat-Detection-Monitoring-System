import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, detikPenanda, detikSampel, dtg, kotakPenanda, penanda, ribuan } from "../data";
import { Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Terminal } from "../komponen/Terminal";
import { Panel } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const EP = R.video.analis.mulai;
const SRC = "rekaman/analis-desktop.mp4";
// Tata letak: terminal kiri, footage kanan.
const T = { kiri: 96, atas: 128, lebar: 640, tinggi: 740 };
const F = { kiri: 760, atas: 128, lebar: 1064, tinggi: 740 };
const RASIO_F = F.lebar / (F.tinggi - 44);

// Kotak di layar Beranda (piksel viewport 1920x1080, dari penanda rekaman).
const SITUASI = kotakPenanda("beranda-awal", "situasi");
const KARTU_INSIDEN = { x: 330, y: 660, w: 205, h: 245 };
const BERANDA_KIRI = { x: 312, y: 196, w: 1150, h: 1150 / RASIO_F };
const BERANDA_LEBAR = fokusMuat({ x: 280, y: 90, w: 1600, h: 980 }, RASIO_F, 0);

// Angka asli: event dari penyerang ke Kodim A sampai brute force selesai (firewall + SSH).
const EV = R.db.eventPenyerangPerSumber.filter((x) => x.satuan === "KODIM-LAT-A" && (x.sumber === "firewall" || x.sumber === "ssh"));
const EV_TOTAL = EV.reduce((a, x) => a + x.jumlah, 0);

const A4a = () => {
  const mulai = detikPenanda("nmap-a") - 1.5;
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
        sorot={[{ dari: tInsiden - 0.4, sampai: mulai + 9, kotak: KARTU_INSIDEN, label: "Insiden baru, tanpa muat ulang", labelBawah: false }]}
      />
    </>
  );
};

const A4b = ({ kecepatan }: { kecepatan: number }) => {
  const mulai = detikPenanda("hydra-a") - 0.4;
  const { epoch } = useJam(mulai, kecepatan, EP);
  const tSiaga = detikSampel((s) => s.siaga === "Siaga: Siaga");
  const tAwas = detikSampel((s) => s.siaga === "Siaga: Awas");
  return (
    <>
      <Terminal ids={["hydra-kodim-a"]} epoch={epoch} {...T} judul="Terminal penyerang · 172.30.0.66" saring={(t) => !/^Hydra v/.test(t)} ukuranHuruf={19} />
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulai}
        kecepatan={kecepatan}
        {...F}
        label="Rekaman asli · Analis · desktop"
        fokus={[{ pada: 0, kotak: BERANDA_LEBAR }]}
        sorot={[
          { dari: tSiaga - 0.3, sampai: tSiaga + 12, kotak: SITUASI, label: "Tingkat Siaga naik: Siaga" },
          { dari: tAwas - 0.3, sampai: tAwas + 30, kotak: SITUASI, label: "Login berhasil → Awas", warna: warna.awas },
        ]}
      />
    </>
  );
};

const A4c = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const mulaiFootage = detikPenanda("detail-insiden-awal") - 2.4;
  const lamaFootage = 5.4;
  const story = kotakPenanda("detail-insiden-awal", "story");
  const skor = kotakPenanda("detail-insiden-awal", "skor");
  const FL = { kiri: 96, atas: 128, lebar: 1236, tinggi: 740 };
  const rasio = FL.lebar / (FL.tinggi - 44);
  const atasHalaman = fokusMuat({ x: 290, y: 90, w: 1600, h: 860 }, rasio, 0);
  const tahap12 = fokusMuat({ x: 340, y: 450, w: 760, h: 250 }, rasio, 20);
  const angka = interpolate(d, [7, 9.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Sequence durationInFrames={Math.round(lamaFootage * fps)} layout="none">
        <Footage
          src={SRC}
          epochMulaiVideo={EP}
          mulai={mulaiFootage}
          {...FL}
          label="Rekaman asli · Analis · Detail Insiden"
          fokus={[{ pada: mulaiFootage, kotak: atasHalaman }]}
          sorot={[{ dari: mulaiFootage + 2.4, sampai: mulaiFootage + 6, kotak: story, label: "Attack Story: tahap Pengintaian → Akses Awal" }]}
        />
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
            { pada: 1.2, kotak: tahap12 },
            { pada: 6.6, kotak: tahap12 },
            { pada: 7.4, kotak: atasHalaman },
          ]}
          sorot={[
            { dari: 1.6, sampai: 7, kotak: { x: 362, y: 624, w: 74, h: 26 }, label: "T1046" },
            { dari: 2.4, sampai: 7, kotak: { x: 736, y: 624, w: 110, h: 26 }, label: "T1110.001", labelBawah: true },
            { dari: 7.6, sampai: 20, kotak: skor, label: "Skor terhitung otomatis", warna: warna.waspada, labelBawah: true, labelKanan: true },
          ]}
        />
      </Sequence>
      <Panel nomor="01" kode="Ringkas" style={{ left: 1360, top: 128, width: 464, height: 740, opacity: angka }}>
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
          <div style={{ textAlign: "center", fontFamily: huruf.stensil, fontSize: 92, lineHeight: 1, color: warna.awas }}>1</div>
          <div style={{ textAlign: "center", fontFamily: huruf.stensil, fontSize: 40, letterSpacing: "0.08em", color: warna.ink }}>INSIDEN</div>
          <div style={{ textAlign: "center", fontFamily: huruf.kondensasi, fontSize: 24, color: warna.ink3 }}>Kodim Latihan A · dari 172.30.0.66 · sampai brute force selesai</div>
        </div>
      </Panel>
    </>
  );
};

export const A04Deteksi: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const sA = 8.5;
  const sB = 12;
  const kecB = 8;
  return (
    <Bingkai
      nomor="04"
      judul="Demo deteksi"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(penanda("nmap-a").t)}
      keterangan={[
        { dari: 0.4, sampai: sA, teks: "Penyerang 172.30.0.66 memindai port Kodim A. Insiden muncul di Beranda tanpa muat ulang." },
        { dari: sA, sampai: sA + sB, teks: "Brute force SSH, 128 percobaan login. Tingkat Siaga naik sendiri, feed event mengalir live." },
        { dari: sA + sB, sampai: 30, teks: "Detail Insiden: Attack Story per tahap, lengkap dengan teknik MITRE ATT&CK." },
        { dari: 30, sampai: 39.8, teks: `${ribuan(EV_TOTAL)} event mentah dari satu penyerang menjadi 1 insiden yang bisa dijelaskan.` },
      ]}
    >
      <Sequence durationInFrames={Math.round(sA * fps)} layout="none">
        <A4a />
      </Sequence>
      <Sequence from={Math.round(sA * fps)} durationInFrames={Math.round(sB * fps)} layout="none">
        <A4b kecepatan={kecB} />
      </Sequence>
      <Sequence from={Math.round((sA + sB) * fps)} layout="none">
        <A4c />
      </Sequence>
    </Bingkai>
  );
};
