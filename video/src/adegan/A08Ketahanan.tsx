import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { R, desimal, detikDi, detikPenanda, detikSampel, dtg, penanda, terminal } from "../data";
import { kata, teksNarasi } from "../data/narasi";
import { Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Terminal } from "../komponen/Terminal";
import { Panel } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "08-ketahanan";
const EP = R.video.analis.mulai;
const SRC = "rekaman/analis-desktop.mp4";
const F = { kiri: 760, atas: 128, lebar: 1064, tinggi: 740 };
const RF = F.lebar / (F.tinggi - 44);
const FL = { kiri: 96, atas: 128, lebar: 1728, tinggi: 740 };
const RFL = FL.lebar / (FL.tinggi - 44);

const T_MATI = terminal("sensor-mati").mulai;
const T_BUTA = T_MATI + R.ukur.sensorMatiKeButaMs;

// Sensor Buta 5x: status BUTA muncul saat narasi menyebut "agent dinyatakan buta".
const KEC_SENSOR = 5;
const MULAI_SENSOR = detikDi(T_BUTA) - (kata(ID, 10) - 0.2) * KEC_SENSOR;
const SELESAI_SENSOR = detikPenanda("menu-insiden-sensor") - 0.3; // sebelum pindah halaman
const B_UJI = (SELESAI_SENSOR - MULAI_SENSOR) / KEC_SENSOR;
// Uji Kesiapan 16x sampai matriks 11/11, lalu tangkapan layar asli ditahan.
const KEC_UJI = 16; // cukup cepat agar klik "Jalankan" (412,5 dtk) ikut tampil
const T_11 = detikSampel((s) => s.cakupan === "11/11");
const MULAI_UJI = T_11 - (kata(ID, 19) - 0.2 - B_UJI) * KEC_UJI;
const B_UJI_DIAM = B_UJI + (T_11 + 2.5 - MULAI_UJI) / KEC_UJI;
const B_AUDIT = kata(ID, 24) - 1.2; // "Audit log berantai"

const A8Sensor = () => {
  const { epoch } = useJam(MULAI_SENSOR, KEC_SENSOR, EP);
  const buta = epoch >= T_BUTA;
  const dt = (Math.min(epoch, T_BUTA) - T_MATI) / 1000;
  const tButa = detikDi(T_BUTA);
  return (
    <>
      <Terminal ids={["sensor-mati"]} epoch={epoch} kiri={96} atas={128} lebar={640} tinggi={240} judul="Terminal lab · container kodim-b" />
      <Panel nomor="02" kode="Heartbeat" style={{ left: 96, top: 392, width: 640, height: 476 }} aksen={buta ? warna.awas : warna.waspada}>
        <div style={{ padding: "26px 30px" }}>
          <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase" }}>Sejak agent kodim-b dimatikan</div>
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
        mulai={MULAI_SENSOR}
        kecepatan={KEC_SENSOR}
        {...F}
        label="Rekaman asli · Analis · Beranda"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: 300, y: 200, w: 1100, h: 720 }, RF, 0) }]}
        sorot={[{ dari: tButa - 0.6, sampai: SELESAI_SENSOR + 5, kotak: { x: 536, y: 657, w: 209, h: 255 }, label: "1 agent BUTA", warna: warna.awas }]}
      />
    </>
  );
};

const kameraUji = fokusMuat({ x: 300, y: 230, w: 1560, h: 830 }, RFL, 0);
const DIAL = { x: 410, y: 520, w: 440, h: 380 };
const labelUji = `${R.db.ujiKesiapanHasil.filter((x) => x.terdeteksi).length}/${R.db.ujiKesiapanHasil.length} · rata-rata ${desimal(R.db.ujiKesiapan.rata_ttd_ms / 1000, 1)} dtk`;

const A8Uji = () => (
  <Footage
    src={SRC}
    epochMulaiVideo={EP}
    mulai={MULAI_UJI}
    kecepatan={KEC_UJI}
    {...FL}
    label="Rekaman asli · Analis · Uji Kesiapan"
    fokus={[{ pada: 0, kotak: kameraUji }]}
    klik={[{ pada: detikPenanda("jalankan-uji"), kotak: penanda("jalankan-uji").klik! }]}
    sorot={[
      { dari: detikPenanda("jalankan-uji") - 0.6, sampai: detikPenanda("jalankan-uji") + 12, kotak: penanda("jalankan-uji").klik!, label: "Jalankan Uji Kesiapan", labelBawah: true },
      { dari: T_11 - 0.5, sampai: MULAI_UJI + 300, kotak: DIAL, label: labelUji, warna: warna.aman },
    ]}
  />
);

const A8UjiDiam = () => (
  <Footage
    src="rekaman/stills/29-uji-selesai.png"
    gambar
    epochMulaiVideo={penanda("uji-selesai").t}
    mulai={0}
    {...FL}
    label="Tangkapan layar asli · Uji Kesiapan"
    fokus={[{ pada: 0, kotak: kameraUji }, { pada: 0.6, kotak: fokusMuat({ x: 400, y: 380, w: 1460, h: 560 }, RFL, 0) }]}
    sorot={[{ dari: 0, sampai: 10, kotak: DIAL, label: labelUji, warna: warna.aman }]}
  />
);

const A8Audit = () => {
  // Klik Verifikasi Rantai jatuh tepat saat "Audit log berantai" diucapkan.
  const mulai = detikPenanda("verifikasi") - 1.3;
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
  const f = (t: number) => Math.round(t * fps);
  return (
    <Bingkai
      nomor="08"
      judul="Ketahanan"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(T_MATI)}
      keterangan={teksNarasi(ID, [
        [0, "Kalau penyerang mematikan sensor, SENTRA tahu:"],
        [6, "dalam 29 detik, agent dinyatakan buta."],
        [12, "Dengan Uji Kesiapan, SENTRA menguji dirinya sendiri."],
        [19, "11 dari 11 skenario terdeteksi."],
        [24, "Audit log berantai memastikan tidak ada catatan yang diubah."],
      ])}
    >
      <Sequence durationInFrames={f(B_UJI)} layout="none">
        <A8Sensor />
      </Sequence>
      <Sequence from={f(B_UJI)} durationInFrames={f(B_UJI_DIAM) - f(B_UJI)} layout="none">
        <A8Uji />
      </Sequence>
      <Sequence from={f(B_UJI_DIAM)} durationInFrames={f(B_AUDIT) - f(B_UJI_DIAM)} layout="none">
        <A8UjiDiam />
      </Sequence>
      <Sequence from={f(B_AUDIT)} layout="none">
        <A8Audit />
      </Sequence>
    </Bingkai>
  );
};
