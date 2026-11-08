import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { R, detikPenanda, detikSampel, dtg, kotakPenanda, penanda } from "../data";
import { Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Terminal } from "../komponen/Terminal";
import { Stempel, useMuncul } from "../komponen/dasar";
import { warna } from "../tema";
import { Bingkai } from "./Bingkai";

const EP = R.video.analis.mulai;
const SRC = "rekaman/analis-desktop.mp4";
const T = { kiri: 96, atas: 128, lebar: 640, tinggi: 740 };
const F = { kiri: 760, atas: 128, lebar: 1064, tinggi: 740 };
const RF = F.lebar / (F.tinggi - 44);
const FL = { kiri: 96, atas: 128, lebar: 1728, tinggi: 740 };
const RFL = FL.lebar / (FL.tinggi - 44);

// Bagian a: Kodim B dipindai -> peta 2 satuan -> Kampanye.
const A5a = () => {
  const { fps } = useVideoConfig();
  const mulai = detikPenanda("nmap-b") - 1.0;
  const { epoch } = useJam(mulai, 1, EP);
  const peta = kotakPenanda("beranda-kampanye", "peta");
  const tDua = detikPenanda("nmap-b") + R.ukur.nmapBKeDuaSatuanDiBerandaMs / 1000;
  const mulaiK = detikPenanda("kampanye") - 0.6;
  return (
    <>
      <Terminal ids={["nmap-kodim-b"]} epoch={epoch} {...T} judul="Terminal penyerang · 172.30.0.66" />
      <Sequence durationInFrames={6 * fps} layout="none">
        <Footage
          src={SRC}
          epochMulaiVideo={EP}
          mulai={mulai}
          {...F}
          label="Rekaman asli · Analis · Beranda"
          fokus={[{ pada: 0, kotak: fokusMuat(peta, RF, 0) }]}
          sorot={[{ dari: tDua - 0.2, sampai: mulai + 7, kotak: { x: 1665, y: 415, w: 160, h: 120 }, label: "IP sama → 2 satuan", warna: warna.awas, labelBawah: true, labelKanan: true }]}
        />
      </Sequence>
      <Sequence from={6 * fps} layout="none">
        <Footage
          src={SRC}
          epochMulaiVideo={EP}
          mulai={mulaiK}
          {...F}
          label="Rekaman asli · Analis · Kampanye"
          fokus={[{ pada: 0, kotak: fokusMuat({ x: 326, y: 140, w: 1532, h: 420 }, RF, 10) }]}
          sorot={[
            { dari: mulaiK + 0.6, sampai: mulaiK + 6, kotak: { x: 326, y: 140, w: 980, h: 52 }, label: "Kampanye lintas satuan" },
            { dari: mulaiK + 2, sampai: mulaiK + 6, kotak: { x: 330, y: 330, w: 1520, h: 200 }, label: "Kodim A lalu Kodim B · skor ×1,3", labelBawah: true },
          ]}
        />
      </Sequence>
    </>
  );
};

// Bagian b: sqlmap, webshell, Modbus, judol, sambil Attack Story terisi live (dipercepat 2x).
const A5b = ({ kecepatan }: { kecepatan: number }) => {
  const mulai = detikPenanda("sqlmap-a") - 0.3;
  const { epoch } = useJam(mulai, kecepatan, EP);
  const t3 = detikSampel((s) => s.tahap === 3);
  const t4 = detikSampel((s) => s.tahap === 4);
  const skor = kotakPenanda("detail-insiden-lengkap", "skor");
  return (
    <>
      <Terminal
        ids={["sqlmap-kodim-a", "webshell-kodim-a", "modbus-plc", "judol-kodim-a"]}
        epoch={epoch}
        {...T}
        judul="Terminal penyerang · 172.30.0.66"
        ukuranHuruf={19}
      />
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulai}
        kecepatan={kecepatan}
        {...F}
        label="Rekaman asli · Analis · Detail Insiden"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: 326, y: 96, w: 1532, h: 760 }, RF, 0) }]}
        sorot={[
          { dari: mulai + 0.5, sampai: t3 - 0.2, kotak: { x: 1366, y: 120, w: 270, h: 100 }, label: "Skor naik live", warna: warna.waspada, labelBawah: true },
          { dari: t3 - 0.3, sampai: t4 - 0.3, kotak: { x: 1097, y: 478, w: 364, h: 64 }, label: "Tahap 3: webshell (FIM)", labelBawah: true },
          { dari: t4 - 0.3, sampai: mulai + 40, kotak: { x: 1471, y: 478, w: 364, h: 64 }, label: "Tahap 4: Modbus ke PLC", warna: warna.awas, labelBawah: true, labelKanan: true },
          { dari: t4 + 6, sampai: mulai + 40, kotak: skor, label: "Kritis", warna: warna.awas, labelBawah: true, redup: false },
        ]}
      />
    </>
  );
};

// Bagian c: rincian skor 946 (rumus terbuka).
const A5c = () => {
  const mulai = detikSampel((s) => s.skor === "946") - 1.6;
  const stempel = useMuncul(2.2, 0.3);
  return (
    <>
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulai}
        {...FL}
        label="Rekaman asli · Analis · Rincian skor"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: 1080, y: 770, w: 790, h: 300 }, RFL, 0) }]}
        sorot={[{ dari: mulai + 1.7, sampai: mulai + 9, kotak: { x: 1370, y: 925, w: 480, h: 100 }, label: "Skor 946 · Kritis · rumus terbuka", warna: warna.awas }]}
      />
      <div style={{ position: "absolute", left: 170, top: 600, opacity: stempel, scale: `${1.3 - 0.3 * stempel}` }}>
        <Stempel warnaGaris={warna.awas} ukuran={70} style={{ backgroundColor: `${warna.canvas}E6` }}>
          Kritis · 4 tahap
        </Stempel>
      </div>
    </>
  );
};

// Bagian d: Penjaga Situs membandingkan 3 varian.
const A5d = () => {
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
        { dari: mulai + 0.6, sampai: mulai + 7, kotak: { x: 776, y, w: 308, h }, label: "Browser biasa: normal", warna: warna.aman, labelBawah: true },
        { dari: mulai + 1.6, sampai: mulai + 7, kotak: { x: 1106, y, w: 318, h }, label: "Googlebot: judi", warna: warna.awas, labelBawah: true, redup: false },
        { dari: mulai + 2.6, sampai: mulai + 7, kotak: { x: 1437, y, w: 318, h }, label: "Referer Google: judi", warna: warna.awas, labelBawah: true, redup: false },
      ]}
    />
  );
};

export const A05SeranganLanjut: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const a = 11;
  const b = 16;
  const c = 6;
  return (
    <Bingkai
      nomor="05"
      judul="Serangan lanjut"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(penanda("nmap-b").t)}
      keterangan={[
        { dari: 0.4, sampai: 6, teks: "IP yang sama memindai Kodim B. Peta operasi langsung menunjuk dua satuan sasaran." },
        { dari: 6, sampai: a, teks: "SENTRA mengaitkannya menjadi Kampanye lintas satuan; skor tiap insiden dikali 1,3." },
        { dari: a, sampai: a + 8, teks: "SQL injection, lalu webshell diunggah dan tertangkap pemantau integritas file (FIM)." },
        { dari: a + 8, sampai: a + b, teks: "Perintah tulis Modbus ke PLC dan injeksi judi online: Attack Story naik ke tahap Dampak." },
        { dari: a + b, sampai: a + b + c, teks: "Skor naik ke 946, Kritis. Rumusnya terbuka, bisa diperiksa per aturan." },
        { dari: a + b + c, sampai: 39.8, teks: "Penjaga Situs membuka portal 3 kali. Versi Googlebot dan referer Google berisi judi; browser biasa tetap normal." },
      ]}
    >
      <Sequence durationInFrames={a * fps} layout="none">
        <A5a />
      </Sequence>
      <Sequence from={a * fps} durationInFrames={b * fps} layout="none">
        <A5b kecepatan={2} />
      </Sequence>
      <Sequence from={(a + b) * fps} durationInFrames={c * fps} layout="none">
        <A5c />
      </Sequence>
      <Sequence from={(a + b + c) * fps} layout="none">
        <A5d />
      </Sequence>
    </Bingkai>
  );
};
