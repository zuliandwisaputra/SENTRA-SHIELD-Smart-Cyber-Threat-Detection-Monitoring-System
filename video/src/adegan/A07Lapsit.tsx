import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { R, desimal, detikPenanda, dtg, penanda } from "../data";
import { Footage, fokusMuat } from "../komponen/Footage";
import { Stempel, useMuncul } from "../komponen/dasar";
import { warna } from "../tema";
import { Bingkai } from "./Bingkai";

const EP = R.video.analis.mulai;
const FL = { kiri: 96, atas: 128, lebar: 1728, tinggi: 740 };
const RFL = FL.lebar / (FL.tinggi - 44);
const PDF = { w: 1819, h: 2573 };

const A7a = () => {
  const { fps } = useVideoConfig();
  const mulai = detikPenanda("panel-lapsit") - 0.4;
  const tTerbit = detikPenanda("lapsit-terbit");
  const tUnduh = detikPenanda("unduh-pdf");
  const panel = fokusMuat({ x: 326, y: 560, w: 1030, h: 360 }, RFL, 0);
  const atasDok = fokusMuat({ x: 330, y: 150, w: 1500, h: 560 }, RFL, 0);
  const kutipan = fokusMuat({ x: 340, y: 720, w: 840, h: 330 }, RFL, 0);
  // 1) Footage: klik Buat LAPSIT sampai dokumen tampil. 2) Tangkapan layar asli di detik yang sama
  // untuk membaca kutipan [EV-n]. 3) Footage lagi: klik Unduh PDF.
  const lama1 = tTerbit + 0.6 - mulai;
  const lama2 = 4.2;
  const mulai3 = tUnduh - 1.6;
  return (
    <>
      <Sequence durationInFrames={Math.round(lama1 * fps)} layout="none">
        <Footage
          src="rekaman/analis-desktop.mp4"
          epochMulaiVideo={EP}
          mulai={mulai}
          {...FL}
          label="Rekaman asli · Analis · LAPSIT"
          fokus={[
            { pada: mulai, kotak: panel },
            { pada: tTerbit - 1.4, kotak: panel },
            { pada: tTerbit, kotak: atasDok },
          ]}
          klik={[{ pada: detikPenanda("buat-lapsit"), kotak: penanda("buat-lapsit").klik! }]}
          sorot={[{ dari: detikPenanda("buat-lapsit") - 0.6, sampai: tTerbit - 1.6, kotak: penanda("buat-lapsit").klik!, label: "Buat LAPSIT" }]}
        />
      </Sequence>
      <Sequence from={Math.round(lama1 * fps)} durationInFrames={Math.round(lama2 * fps)} layout="none">
        <Footage
          src="rekaman/stills/25-lapsit.png"
          gambar
          epochMulaiVideo={penanda("lapsit-terbit").t}
          mulai={0}
          {...FL}
          label="Tangkapan layar asli · LAPSIT"
          fokus={[
            { pada: 0, kotak: atasDok },
            { pada: 0.8, kotak: kutipan },
          ]}
          sorot={[{ dari: 1.0, sampai: 4.4, kotak: { x: 480, y: 782, w: 170, h: 72 }, label: "Kutipan event bukti", warna: warna.awas, labelKanan: true }]}
        />
      </Sequence>
      <Sequence from={Math.round((lama1 + lama2) * fps)} layout="none">
        <Footage
          src="rekaman/analis-desktop.mp4"
          epochMulaiVideo={EP}
          mulai={mulai3}
          {...FL}
          label="Rekaman asli · Analis · LAPSIT"
          fokus={[{ pada: 0, kotak: atasDok }]}
          klik={[{ pada: tUnduh, kotak: penanda("unduh-pdf").klik! }]}
          sorot={[{ dari: tUnduh - 0.6, sampai: mulai3 + 20, kotak: penanda("unduh-pdf").klik!, label: "Unduh PDF", labelBawah: true }]}
        />
      </Sequence>
    </>
  );
};

const A7b = () => {
  const stempel = useMuncul(3.2, 0.3);
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
          { pada: 1.6, kotak: atas },
          { pada: 2.6, kotak: kaki },
        ]}
        sorot={[{ dari: 2.9, sampai: 8, kotak: { x: 150, y: 2425, w: 1130, h: 40 }, label: "SHA-256 isi LAPSIT di kaki halaman", warna: warna.awas }]}
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
  const a = 13;
  return (
    <Bingkai
      nomor="07"
      judul="LAPSIT"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(penanda("buat-lapsit").t)}
      keterangan={[
        { dari: 0.4, sampai: 5.2, teks: `Satu klik: Laporan Situasi tersusun dari fakta insiden dalam ${desimal(R.ukur.lapsitMs / 1000, 1)} detik.` },
        {
          dari: 5.2,
          sampai: a,
          teks: (
            <>
              Setiap temuan mengutip event buktinya <span style={{ whiteSpace: "nowrap" }}>[EV-n]</span>. Di lab ini dari template; LLM lokal opsional.
            </>
          ),
        },
        { dari: a, sampai: 19.8, teks: "PDF diunduh dengan segel hash SHA-256: perubahan sekecil apa pun ketahuan." },
      ]}
    >
      <Sequence durationInFrames={a * fps} layout="none">
        <A7a />
      </Sequence>
      <Sequence from={a * fps} layout="none">
        <A7b />
      </Sequence>
    </Bingkai>
  );
};
