import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { R, desimal, detikDi, detikPenanda, detikSampel, dtg, penanda, terminal } from "../data";
import { Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Terminal } from "../komponen/Terminal";
import { Panel } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const EP = R.video.analis.mulai;
const SRC = "rekaman/analis-desktop.mp4";
const F = { kiri: 760, atas: 128, lebar: 1064, tinggi: 740 };
const RF = F.lebar / (F.tinggi - 44);
const FL = { kiri: 96, atas: 128, lebar: 1728, tinggi: 740 };
const RFL = FL.lebar / (FL.tinggi - 44);

const T_MATI = terminal("sensor-mati").mulai;
const T_BUTA = T_MATI + R.ukur.sensorMatiKeButaMs;

const A8a = ({ kecepatan }: { kecepatan: number }) => {
  const mulai = detikPenanda("sensor-mati") - 0.6;
  const { epoch } = useJam(mulai, kecepatan, EP);
  const buta = epoch >= T_BUTA;
  const dt = (Math.min(epoch, T_BUTA) - T_MATI) / 1000;
  const tButa = detikDi(T_BUTA);
  const tList = detikPenanda("insiden-sensor-buta") - 0.6;
  return (
    <>
      <Terminal ids={["sensor-mati"]} epoch={epoch} kiri={96} atas={128} lebar={640} tinggi={240} judul="Terminal lab · container kodim-b" />
      <Panel nomor="02" kode="Heartbeat" style={{ left: 96, top: 392, width: 640, height: 476 }} aksen={buta ? warna.awas : warna.waspada}>
        <div style={{ padding: "26px 30px" }}>
          <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase" }}>
            Sejak agent kodim-b dimatikan
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 8 }}>
            <span style={{ fontFamily: huruf.stensil, fontSize: 130, lineHeight: 1, color: buta ? warna.awas : warna.waspada }}>{epoch < T_MATI ? "0,0" : desimal(dt, 1)}</span>
            <span style={{ fontFamily: huruf.stensil, fontSize: 40, color: buta ? warna.awas : warna.waspada }}>DETIK</span>
          </div>
          <div style={{ marginTop: 20, fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 36, color: buta ? warna.awas : warna.ink2, textTransform: "uppercase" }}>
            {buta ? "Agent BUTA · insiden Sensor Buta" : "Menunggu heartbeat…"}
          </div>
          <div style={{ marginTop: 12, fontFamily: huruf.kondensasi, fontSize: 26, color: warna.ink3 }}>Batas: heartbeat hilang lebih dari 30 detik.</div>
        </div>
      </Panel>
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulai}
        kecepatan={kecepatan}
        {...F}
        label="Rekaman asli · Analis · Beranda"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: 300, y: 200, w: 1100, h: 720 }, RF, 0) }, { pada: tList - 0.1, kotak: fokusMuat({ x: 300, y: 200, w: 1100, h: 720 }, RF, 0) }, { pada: tList + 0.3, kotak: fokusMuat({ x: 326, y: 340, w: 1530, h: 320 }, RF, 10) }]}
        sorot={[
          { dari: tButa - 0.6, sampai: tList - 1.5, kotak: { x: 536, y: 657, w: 209, h: 255 }, label: "1 agent BUTA", warna: warna.awas },
          { dari: tList + 0.6, sampai: mulai + 60, kotak: { x: 330, y: 470, w: 1525, h: 58 }, label: "Insiden Sensor Buta · Tinggi", warna: warna.awas, labelBawah: true },
        ]}
      />
    </>
  );
};

const A8b = ({ kecepatan, lama }: { kecepatan: number; lama: number }) => {
  const { fps } = useVideoConfig();
  const mulai = detikPenanda("jalankan-uji") - 1.5;
  const t11 = detikSampel((s) => s.cakupan === "11/11");
  const kamera = fokusMuat({ x: 300, y: 230, w: 1560, h: 830 }, RFL, 0);
  const dial = { x: 410, y: 520, w: 440, h: 380 };
  return (
    <>
      <Sequence durationInFrames={Math.round(lama * fps)} layout="none">
        <Footage
          src={SRC}
          epochMulaiVideo={EP}
          mulai={mulai}
          kecepatan={kecepatan}
          {...FL}
          label="Rekaman asli · Analis · Uji Kesiapan"
          fokus={[{ pada: 0, kotak: kamera }]}
          klik={[{ pada: detikPenanda("jalankan-uji"), kotak: penanda("jalankan-uji").klik! }]}
          sorot={[
            { dari: detikPenanda("jalankan-uji") - 0.6, sampai: detikPenanda("jalankan-uji") + 6, kotak: penanda("jalankan-uji").klik!, label: "Jalankan Uji Kesiapan", labelBawah: true },
            { dari: t11 - 0.5, sampai: mulai + 200, kotak: dial, label: "11/11 · rata-rata 4,5 dtk", warna: warna.aman },
          ]}
        />
      </Sequence>
      <Sequence from={Math.round(lama * fps)} layout="none">
        <Footage
          src="rekaman/stills/29-uji-selesai.png"
          gambar
          epochMulaiVideo={penanda("uji-selesai").t}
          mulai={0}
          {...FL}
          label="Tangkapan layar asli · Uji Kesiapan"
          fokus={[{ pada: 0, kotak: kamera }, { pada: 0.8, kotak: fokusMuat({ x: 400, y: 380, w: 1460, h: 560 }, RFL, 0) }]}
          sorot={[{ dari: 0, sampai: 10, kotak: dial, label: "11/11 · rata-rata 4,5 dtk", warna: warna.aman }]}
        />
      </Sequence>
    </>
  );
};

const A8c = () => {
  const mulai = detikPenanda("verifikasi") - 2.0;
  return (
    <Footage
      src={SRC}
      epochMulaiVideo={EP}
      mulai={mulai}
      {...FL}
      label="Rekaman asli · Analis · Audit Log"
      fokus={[{ pada: 0, kotak: fokusMuat({ x: 390, y: 160, w: 1400, h: 330 }, RFL, 40) }]}
      klik={[{ pada: detikPenanda("verifikasi"), kotak: penanda("verifikasi").klik! }]}
      sorot={[
        { dari: detikPenanda("verifikasi") - 0.6, sampai: detikPenanda("audit-utuh") - 0.3, kotak: penanda("verifikasi").klik!, label: "Verifikasi Rantai", labelBawah: true },
        { dari: detikPenanda("audit-utuh") - 0.3, sampai: mulai + 20, kotak: { x: 407, y: 369, w: 1370, h: 101 }, label: "Rantai utuh", warna: warna.aman, labelBawah: true },
      ]}
    />
  );
};

export const A08Ketahanan: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const a = 10;
  const b = 11;
  const ujiR = R.db.ujiKesiapan;
  return (
    <Bingkai
      nomor="08"
      judul="Ketahanan"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(T_MATI)}
      keterangan={[
        { dari: 0.4, sampai: a, teks: `Penyerang mematikan sensor Kodim B. ${desimal(R.ukur.sensorMatiKeButaMs / 1000, 0)} detik kemudian agent ditandai BUTA dan insiden Sensor Buta muncul.` },
        {
          dari: a,
          sampai: a + b,
          teks: `Uji Kesiapan: 11 skenario aman ke host sendiri. ${Math.round(Number(ujiR.cakupan) * 11)}/11 terdeteksi, rata-rata ${desimal(ujiR.rata_ttd_ms / 1000, 1)} detik, ${R.db.insidenDariEventUji.jumlah === 0 ? "tanpa insiden palsu" : `${R.db.insidenDariEventUji.jumlah} insiden dari event uji`}.`,
        },
        { dari: a + b, sampai: 29.8, teks: "Audit log berantai SHA-256. Satu klik membuktikan tidak ada catatan yang diubah." },
      ]}
    >
      <Sequence durationInFrames={a * fps} layout="none">
        <A8a kecepatan={4} />
      </Sequence>
      <Sequence from={a * fps} durationInFrames={b * fps} layout="none">
        <A8b kecepatan={8} lama={9.4} />
      </Sequence>
      <Sequence from={(a + b) * fps} layout="none">
        <A8c />
      </Sequence>
    </Bingkai>
  );
};
