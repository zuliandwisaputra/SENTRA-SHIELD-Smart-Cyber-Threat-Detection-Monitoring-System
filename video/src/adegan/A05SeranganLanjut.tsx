import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { R, detikPenanda, detikSampel, dtg, kotakPenanda, penanda } from "../data";
import { akhirNarasi, kata, teksNarasi } from "../data/narasi";
import { Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Rangkaian } from "../komponen/Rangkaian";
import { Terminal } from "../komponen/Terminal";
import { Stempel, useMuncul } from "../komponen/dasar";
import { warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "05-serangan-lanjut";
const EP = R.video.analis.mulai;
const SRC = "rekaman/analis-desktop.mp4";
const T = { kiri: 96, atas: 128, lebar: 640, tinggi: 740 };
const F = { kiri: 760, atas: 128, lebar: 1064, tinggi: 740 };
const RF = F.lebar / (F.tinggi - 44);
const FL = { kiri: 96, atas: 128, lebar: 1728, tinggi: 740 };
const RFL = FL.lebar / (FL.tinggi - 44);

// Batas bagian (detik adegan) mengikuti narasi.
const B_KAMPANYE = kata(ID, 8) - 0.2; // "menandainya sebagai kampanye"
const B_EKSPLOIT = kata(ID, 13) - 0.3; // "Lalu ada SQL injection"
const B_TERTANGKAP = kata(ID, 33) - 0.3; // "Semua tertangkap"
const B_SKOR = kata(ID, 36) - 0.2; // "naik ke kritis dengan skor 946"
const B_SITUS = akhirNarasi(ID) + 0.3; // setelah narasi: Penjaga Situs

// Rangkaian eksploit: kecepatan dipilih agar tiap serangan muncul saat namanya diucapkan.
const EKSPLOIT = [
  { mulai: detikPenanda("sqlmap-a") - 0.3, sampai: detikPenanda("webshell-a") - 0.2, kecepatan: 3 },
  { mulai: detikPenanda("webshell-a") - 0.2, sampai: detikPenanda("modbus") - 0.2, kecepatan: 3 },
  { mulai: detikPenanda("modbus") - 0.2, sampai: detikPenanda("judol") - 0.2, kecepatan: 2 },
];
const lamaEksploitAwal = EKSPLOIT.reduce((a, x) => a + (x.sampai - x.mulai) / x.kecepatan, 0);
EKSPLOIT.push({
  mulai: detikPenanda("judol") - 0.2,
  sampai: detikPenanda("judol") - 0.2 + (B_TERTANGKAP - B_EKSPLOIT - lamaEksploitAwal) * 2,
  kecepatan: 2,
});

const A5Beranda = () => {
  const mulai = detikPenanda("nmap-b") - 1.0;
  const { epoch } = useJam(mulai, 1, EP);
  const peta = kotakPenanda("beranda-kampanye", "peta");
  const tDua = detikPenanda("nmap-b") + R.ukur.nmapBKeDuaSatuanDiBerandaMs / 1000;
  return (
    <>
      <Terminal ids={["nmap-kodim-b"]} epoch={epoch} {...T} judul="Terminal penyerang · 172.30.0.66" />
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulai}
        {...F}
        label="Rekaman asli · Analis · Beranda"
        fokus={[{ pada: 0, kotak: fokusMuat(peta, RF, 0) }]}
        sorot={[{ dari: tDua - 0.2, sampai: mulai + 9, kotak: { x: 1665, y: 415, w: 160, h: 120 }, label: "IP sama → 2 satuan", warna: warna.awas, labelBawah: true, labelKanan: true }]}
      />
    </>
  );
};

const A5Kampanye = () => {
  const mulaiK = detikPenanda("kampanye") - 0.3;
  return (
    <>
      <Terminal ids={["nmap-kodim-b"]} epoch={R.terminal.find((t) => t.id === "nmap-kodim-b")!.selesai} {...T} judul="Terminal penyerang · 172.30.0.66" />
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulaiK}
        {...F}
        label="Rekaman asli · Analis · Kampanye"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: 326, y: 140, w: 1532, h: 420 }, RF, 10) }]}
        sorot={[
          { dari: mulaiK + 0.2, sampai: mulaiK + 6, kotak: { x: 326, y: 140, w: 980, h: 52 }, label: "Kampanye lintas satuan" },
          { dari: mulaiK + 1.2, sampai: mulaiK + 6, kotak: { x: 330, y: 330, w: 1520, h: 200 }, label: "Kodim A lalu Kodim B · skor ×1,3", labelBawah: true, redup: false },
        ]}
      />
    </>
  );
};

const A5Eksploit = () => {
  const t3 = detikSampel((s) => s.tahap === 3);
  const t4 = detikSampel((s) => s.tahap === 4);
  return (
    <Rangkaian potongan={EKSPLOIT}>
      {(mulai, k) => <Eksploit mulai={mulai} k={k} t3={t3} t4={t4} />}
    </Rangkaian>
  );
};
const Eksploit: React.FC<{ mulai: number; k: number; t3: number; t4: number }> = ({ mulai, k, t3, t4 }) => {
  const { epoch } = useJam(mulai, k, EP);
  return (
    <>
      <Terminal ids={["sqlmap-kodim-a", "webshell-kodim-a", "modbus-plc", "judol-kodim-a"]} epoch={epoch} {...T} judul="Terminal penyerang · 172.30.0.66" ukuranHuruf={19} />
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulai}
        kecepatan={k}
        {...F}
        label="Rekaman asli · Analis · Detail Insiden"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: 326, y: 96, w: 1532, h: 760 }, RF, 0) }]}
        sorot={[
          { dari: 0, sampai: t3 - 0.2, kotak: { x: 1366, y: 120, w: 270, h: 100 }, label: "Skor naik live", warna: warna.waspada, labelBawah: true },
          { dari: t3 - 0.3, sampai: t4 - 0.3, kotak: { x: 1097, y: 478, w: 364, h: 64 }, label: "Tahap 3: webshell (FIM)", labelBawah: true },
          { dari: t4 - 0.3, sampai: 400, kotak: { x: 1471, y: 478, w: 364, h: 64 }, label: "Tahap 4: Modbus ke PLC", warna: warna.awas, labelBawah: true, labelKanan: true },
        ]}
      />
    </>
  );
};

const A5Tertangkap = () => (
  <Footage
    src="rekaman/stills/13-insiden-lengkap.png"
    gambar
    epochMulaiVideo={penanda("detail-insiden-lengkap").t}
    mulai={0}
    {...FL}
    label="Tangkapan layar asli · Detail Insiden"
    fokus={[{ pada: 0, kotak: fokusMuat({ x: 326, y: 100, w: 1532, h: 600 }, RFL, 0) }]}
    sorot={[{ dari: 0.1, sampai: 10, kotak: { x: 345, y: 476, w: 1495, h: 68 }, label: "4 tahap tertangkap: Pengintaian → Akses Awal → Eksekusi → Dampak", warna: warna.awas }]}
  />
);

const A5Skor = () => {
  const { fps } = useVideoConfig();
  const t946 = detikSampel((s) => s.skor === "946");
  // Angka 946 tampil tepat saat narasi menyebut "skor 946".
  const mulai = t946 - (kata(ID, 41) - 0.1 - B_SKOR);
  const lamaFootage = 250.1 - mulai;
  const stempel = useMuncul(kata(ID, 41) - B_SKOR, 0.3);
  const kamera = fokusMuat({ x: 1080, y: 770, w: 790, h: 300 }, RFL, 0);
  const total = { x: 1360, y: 930, w: 500, h: 135 };
  return (
    <>
      <Sequence durationInFrames={Math.round(lamaFootage * fps)} layout="none">
        <Footage
          src={SRC}
          epochMulaiVideo={EP}
          mulai={mulai}
          {...FL}
          label="Rekaman asli · Analis · Rincian skor"
          fokus={[{ pada: 0, kotak: kamera }]}
          sorot={[{ dari: t946 - 0.2, sampai: mulai + 20, kotak: total, label: "Skor 946 · Kritis", warna: warna.awas }]}
        />
      </Sequence>
      <Sequence from={Math.round(lamaFootage * fps)} layout="none">
        {/* Frame asli detik 250,1 ditahan selama kalimat "setiap angka skornya bisa dijelaskan". */}
        <Footage
          src="rekaman/stills/frame-rincian-946.png"
          gambar
          epochMulaiVideo={EP + 250.1 * 1000}
          mulai={0}
          {...FL}
          label="Rekaman asli · dijeda · Rincian skor"
          fokus={[{ pada: 0, kotak: kamera }]}
          sorot={[{ dari: 0, sampai: 20, kotak: { x: 1360, y: 965, w: 500, h: 95 }, label: "Rumus terbuka: (425 + 60) × 1,5 × 1,3", warna: warna.awas }]}
        />
      </Sequence>
      <div style={{ position: "absolute", left: 150, top: 250, opacity: stempel, scale: `${1.3 - 0.3 * stempel}` }}>
        <Stempel warnaGaris={warna.awas} ukuran={56} style={{ backgroundColor: `${warna.canvas}E6` }}>
          Kritis · 4 tahap
        </Stempel>
      </div>
    </>
  );
};

const A5Situs = () => {
  const mulai = detikPenanda("penjaga-situs-varian") - 0.5;
  const y = 389;
  const h = 318;
  return (
    <Footage
      src={SRC}
      epochMulaiVideo={EP}
      mulai={mulai}
      {...FL}
      label="Rekaman asli · Analis · Penjaga Situs"
      fokus={[{ pada: 0, kotak: fokusMuat({ x: 766, y: 360, w: 1000, h: 400 }, RFL, 0) }]}
      sorot={[
        { dari: mulai + 0.4, sampai: mulai + 9, kotak: { x: 776, y, w: 308, h }, label: "Browser biasa: normal", warna: warna.aman, labelBawah: true },
        { dari: mulai + 1.2, sampai: mulai + 9, kotak: { x: 1106, y, w: 318, h }, label: "Googlebot: judi", warna: warna.awas, labelBawah: true, redup: false },
        { dari: mulai + 2.0, sampai: mulai + 9, kotak: { x: 1437, y, w: 318, h }, label: "Referer Google: judi", warna: warna.awas, labelBawah: true, redup: false },
      ]}
    />
  );
};

export const A05SeranganLanjut: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const f = (t: number) => Math.round(t * fps);
  return (
    <Bingkai
      nomor="05"
      judul="Serangan lanjut"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(penanda("nmap-b").t)}
      keterangan={teksNarasi(
        ID,
        [
          [0, "Penyerang yang sama memindai Kodim B,"],
          [5, "dan SENTRA langsung menandainya sebagai kampanye lintas satuan."],
          [13, "Lalu ada SQL injection, penanaman webshell,"],
          [19, "perintah tulis ke mesin PLC,"],
          [24, "dan penyusupan judi online yang hanya muncul di Google."],
          [33, "Semua tertangkap."],
          [35, "Insidennya naik ke Kritis dengan skor 946,"],
          [42, "dan setiap angka skornya bisa dijelaskan."],
        ],
        [{ dari: B_SITUS + 0.2, sampai: durasi - 0.2, teks: "Penjaga Situs: versi Googlebot dan referer Google berisi judi, browser biasa tetap normal." }],
      )}
    >
      <Sequence durationInFrames={f(B_KAMPANYE)} layout="none">
        <A5Beranda />
      </Sequence>
      <Sequence from={f(B_KAMPANYE)} durationInFrames={f(B_EKSPLOIT) - f(B_KAMPANYE)} layout="none">
        <A5Kampanye />
      </Sequence>
      <Sequence from={f(B_EKSPLOIT)} durationInFrames={f(B_TERTANGKAP) - f(B_EKSPLOIT)} layout="none">
        <A5Eksploit />
      </Sequence>
      <Sequence from={f(B_TERTANGKAP)} durationInFrames={f(B_SKOR) - f(B_TERTANGKAP)} layout="none">
        <A5Tertangkap />
      </Sequence>
      <Sequence from={f(B_SKOR)} durationInFrames={f(B_SITUS) - f(B_SKOR)} layout="none">
        <A5Skor />
      </Sequence>
      <Sequence from={f(B_SITUS)} layout="none">
        <A5Situs />
      </Sequence>
    </Bingkai>
  );
};
