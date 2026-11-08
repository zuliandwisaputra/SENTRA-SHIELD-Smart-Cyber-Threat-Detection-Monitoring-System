// Demo 10: Uji Kesiapan. Klik Jalankan (asli), matriks terisi (dipercepat, berlabel), lalu ditahan pada 11/11 (momen kunci).
import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, desimal, detikPenanda, detikSampel, dtg, penanda } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { Footage, fokusMuat } from "../komponen/Footage";
import { Rangkaian, dariJangkar, detikVideoUntuk } from "../komponen/Rangkaian";
import { Stempel } from "../komponen/dasar";
import { Bunyi, ISI } from "../komponen/v2";
import { warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "14-uji-kesiapan";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EP = R.video.analis.mulai;
const FL = { kiri: ISI.kiri, atas: ISI.atasDemo + 14, lebar: 1728, tinggi: 700 };
const RFL = FL.lebar / (FL.tinggi - 44);

const D_JALANKAN = detikPenanda("jalankan-uji");
const D_11 = detikSampel((s) => s.cakupan === `${R.db.ujiKesiapanHasil.length}/${R.db.ujiKesiapanHasil.length}`);
const lolos = R.db.ujiKesiapanHasil.filter((x) => x.terdeteksi).length;
const total = R.db.ujiKesiapanHasil.length;
const LABEL = `${lolos}/${total} terdeteksi · rata-rata ${desimal(R.db.ujiKesiapan.rata_ttd_ms / 1000, 1)} dtk`;
const kamera = fokusMuat({ x: 300, y: 230, w: 1560, h: 830 }, RFL, 0);
const DIAL = { x: 410, y: 520, w: 440, h: 380 };

const B_DIAM = pada(ID, `${lolos} dari ${total}`) + 0.6; // 11/11 ditahan
const POT = dariJangkar(
  [
    { footage: D_JALANKAN - (pada(ID, "Lewat Uji Kesiapan") - 0.2), adegan: 0 },
    { footage: D_JALANKAN, adegan: pada(ID, "Lewat Uji Kesiapan") - 0.2 + 0.0001 },
    { footage: D_11, adegan: pada(ID, `${lolos} dari ${total}`) },
  ],
  3,
);

const Uji: React.FC<{ mulai: number; k: number }> = ({ mulai, k }) => (
  <Footage
    src="rekaman/analis-desktop.mp4"
    epochMulaiVideo={EP}
    mulai={mulai}
    kecepatan={k}
    {...FL}
    label="Rekaman asli · Analis · Uji Kesiapan"
    fokus={[{ pada: 0, kotak: kamera }]}
    klik={[{ pada: D_JALANKAN, kotak: penanda("jalankan-uji").klik! }]}
    sorot={[
      { dari: D_JALANKAN - 0.6, sampai: D_JALANKAN + 6, kotak: penanda("jalankan-uji").klik!, label: "Jalankan Uji Kesiapan", labelBawah: true },
      { dari: D_11 - 0.4, sampai: mulai + 600, kotak: DIAL, label: LABEL, warna: warna.aman },
    ]}
  />
);

export const S14UjiKesiapan: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const fr = (t: number) => Math.round(t * fps);
  const t11 = detikVideoUntuk(POT, D_11);
  const tPalsu = pada(ID, "insiden palsu") - 0.2;
  const stempel = interpolate(d, [tPalsu, tPalsu + 0.3], [0, 1], klem);
  return (
    <Bingkai id={ID} nomor="14" judul="Demo 10 · Uji Kesiapan" durasi={durasi} dataLatihan dtgTeks={dtg(penanda("jalankan-uji").t)} tigaBagian={[kalimatMulai(ID, 1), kalimatMulai(ID, 2), kalimatMulai(ID, 3)]}>
      <Bunyi jenis="klik" pada={detikVideoUntuk(POT, D_JALANKAN)} />
      <Bunyi jenis="ketik-panjang" pada={detikVideoUntuk(POT, D_JALANKAN) + 0.6} keras={0.7} />
      <Bunyi jenis="sukses" pada={t11} />
      <Bunyi jenis="stempel" pada={tPalsu + 0.05} />

      <Sequence durationInFrames={fr(B_DIAM)} layout="none">
        <Rangkaian potongan={POT}>{(m, k) => <Uji mulai={m} k={k} />}</Rangkaian>
      </Sequence>
      <Sequence from={fr(B_DIAM)} layout="none">
        <Footage
          src="rekaman/stills/29-uji-selesai.png"
          gambar
          epochMulaiVideo={penanda("uji-selesai").t}
          mulai={0}
          {...FL}
          label="Tangkapan layar asli · Uji Kesiapan · ditahan"
          fokus={[
            { pada: 0, kotak: kamera },
            { pada: 0.8, kotak: fokusMuat({ x: 400, y: 380, w: 1460, h: 560 }, RFL, 0) },
          ]}
          sorot={[{ dari: 0, sampai: 99, kotak: DIAL, label: LABEL, warna: warna.aman }]}
        />
      </Sequence>
      {stempel > 0 && (
        <div style={{ position: "absolute", right: 150, top: 300, opacity: stempel, scale: `${1.3 - 0.3 * stempel}` }}>
          <Stempel warnaGaris={warna.aman} ukuran={52} style={{ backgroundColor: `${warna.canvas}E6` }}>
            {`${R.db.insidenDariEventUji.jumlah} insiden palsu`}
          </Stempel>
        </div>
      )}
    </Bingkai>
  );
};
