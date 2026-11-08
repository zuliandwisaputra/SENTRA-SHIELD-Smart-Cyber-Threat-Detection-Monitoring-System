import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { R, detikPenanda, dtg, penanda } from "../data";
import { kata, teksNarasi } from "../data/narasi";
import { Footage, fokusMuat } from "../komponen/Footage";
import { Stempel, useMuncul } from "../komponen/dasar";
import { warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "07-lapsit";
const EP = R.video.analis.mulai;
const FL = { kiri: 96, atas: 128, lebar: 1728, tinggi: 740 };
const RFL = FL.lebar / (FL.tinggi - 44);
const PDF = { w: 1819, h: 2573 };

const panel = fokusMuat({ x: 326, y: 560, w: 1030, h: 360 }, RFL, 0);
const atasDok = fokusMuat({ x: 330, y: 150, w: 1500, h: 560 }, RFL, 0);
const kutipan = fokusMuat({ x: 340, y: 720, w: 840, h: 330 }, RFL, 0);

// Batas bagian (detik adegan) mengikuti narasi.
const KEC_BUAT = 1.5;
const MULAI_BUAT = detikPenanda("panel-lapsit") - 0.4;
const T_TERBIT = detikPenanda("lapsit-terbit");
const B_KUTIPAN = (T_TERBIT + 0.6 - MULAI_BUAT) / KEC_BUAT; // dokumen tampil, lalu kutipan [EV-n]
const B_UNDUH = kata(ID, 10) - 0.2; // "dan PDF-nya"
const B_SEGEL = kata(ID, 14) - 0.3; // "diberi segel SHA-256"
const T_UNDUH = detikPenanda("unduh-pdf");

const A7Buat = () => (
  <Footage
    src="rekaman/analis-desktop.mp4"
    epochMulaiVideo={EP}
    mulai={MULAI_BUAT}
    kecepatan={KEC_BUAT}
    {...FL}
    label="Rekaman asli · Analis · LAPSIT"
    fokus={[
      { pada: MULAI_BUAT, kotak: panel },
      { pada: T_TERBIT - 1.4, kotak: panel },
      { pada: T_TERBIT, kotak: atasDok },
    ]}
    klik={[{ pada: detikPenanda("buat-lapsit"), kotak: penanda("buat-lapsit").klik! }]}
    sorot={[{ dari: detikPenanda("buat-lapsit") - 0.6, sampai: T_TERBIT - 1.6, kotak: penanda("buat-lapsit").klik!, label: "Buat LAPSIT" }]}
  />
);

const A7Kutipan = () => (
  <Footage
    src="rekaman/stills/25-lapsit.png"
    gambar
    epochMulaiVideo={penanda("lapsit-terbit").t}
    mulai={0}
    {...FL}
    label="Tangkapan layar asli · LAPSIT"
    fokus={[
      { pada: 0, kotak: atasDok },
      { pada: 0.6, kotak: kutipan },
    ]}
    sorot={[{ dari: kata(ID, 5) - B_KUTIPAN - 0.1, sampai: 10, kotak: { x: 470, y: 782, w: 190, h: 72 }, label: "Kutipan nomor bukti [EV-n]", warna: warna.awas, labelKanan: true }]}
  />
);

const A7Unduh = () => {
  const mulai = T_UNDUH - 1.0;
  return (
    <Footage
      src="rekaman/analis-desktop.mp4"
      epochMulaiVideo={EP}
      mulai={mulai}
      {...FL}
      label="Rekaman asli · Analis · LAPSIT"
      fokus={[{ pada: 0, kotak: atasDok }]}
      klik={[{ pada: T_UNDUH, kotak: penanda("unduh-pdf").klik! }]}
      sorot={[{ dari: T_UNDUH - 0.6, sampai: mulai + 20, kotak: penanda("unduh-pdf").klik!, label: "Unduh PDF", labelBawah: true }]}
    />
  );
};

const A7Pdf = () => {
  const stempel = useMuncul(0.5, 0.3);
  const atas = fokusMuat({ x: 0, y: 120, w: PDF.w, h: 700 }, RFL, 0, PDF);
  const kaki = fokusMuat({ x: 120, y: 2380, w: 1580, h: 140 }, RFL, 20, PDF);
  return (
    <>
      <Footage
        src="rekaman/stills/lapsit-hd-1.png"
        gambar
        epochMulaiVideo={penanda("unduh-pdf").t}
        mulai={0}
        {...FL}
        sumber={PDF}
        label="PDF asli hasil unduhan · halaman 1"
        fokus={[
          { pada: 0, kotak: atas },
          { pada: 0.7, kotak: kaki },
        ]}
        sorot={[{ dari: 0.6, sampai: 20, kotak: { x: 150, y: 2425, w: 1130, h: 40 }, label: "SHA-256 isi LAPSIT di kaki halaman", warna: warna.awas }]}
      />
      <div style={{ position: "absolute", right: 150, top: 190, opacity: stempel, scale: `${1.3 - 0.3 * stempel}` }}>
        <Stempel warnaGaris={warna.awas} ukuran={64} style={{ backgroundColor: `${warna.canvas}E6` }}>
          Segel SHA-256
        </Stempel>
      </div>
    </>
  );
};

export const A07Lapsit: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const f = (t: number) => Math.round(t * fps);
  return (
    <Bingkai
      nomor="07"
      judul="LAPSIT"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(penanda("buat-lapsit").t)}
      keterangan={teksNarasi(ID, [
        [0, "Analis membuat laporan situasi otomatis,"],
        [5, "setiap temuan mengutip nomor buktinya,"],
        [10, "dan PDF-nya diberi segel SHA-256"],
        [17, "supaya tidak bisa diubah diam-diam."],
      ])}
    >
      <Sequence durationInFrames={f(B_KUTIPAN)} layout="none">
        <A7Buat />
      </Sequence>
      <Sequence from={f(B_KUTIPAN)} durationInFrames={f(B_UNDUH) - f(B_KUTIPAN)} layout="none">
        <A7Kutipan />
      </Sequence>
      <Sequence from={f(B_UNDUH)} durationInFrames={f(B_SEGEL) - f(B_UNDUH)} layout="none">
        <A7Unduh />
      </Sequence>
      <Sequence from={f(B_SEGEL)} layout="none">
        <A7Pdf />
      </Sequence>
    </Bingkai>
  );
};
