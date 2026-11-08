// Demo 4: penyerang masuk lebih dalam (SQL injection, webshell, Modbus ke PLC, judi online ber-cloaking).
// Layar terbagi: terminal penyerang asli vs Detail Insiden asli; lalu tangkapan layar Attack Story lengkap.
import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, detikPenanda, detikSampel, dtg, penanda } from "../data";
import { kalimatMulai, kalimatSelesai, pada } from "../data/narasi";
import { Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Rangkaian, dariJangkar, detikVideoUntuk } from "../komponen/Rangkaian";
import { Terminal } from "../komponen/Terminal";
import { Braket, Chip, EASE, Stempel } from "../komponen/dasar";
import { Bunyi, ISI, Sisi } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "08-lebih-dalam";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EP = R.video.analis.mulai;
const SRC = "rekaman/analis-desktop.mp4";
const ATAS = ISI.atasDemo + 14;
const PENDEK = 556; // tinggi panel saat kartu APA ITU berjajar di bawah
const PENUH = 700;

const KARTU = [
  { istilah: "SQL injection", isi: "Menyelipkan perintah database lewat kolom isian situs.", frasa: "SQL injection" },
  { istilah: "Webshell", isi: "Pintu belakang berupa file yang ditanam di server web.", frasa: "menanam webshell" },
  { istilah: "PLC dan Modbus", isi: "PLC: komputer pengendali mesin industri. Modbus: bahasa perintahnya.", frasa: "mesin PLC" },
  { istilah: "Cloaking judi online", isi: "Situs tampil normal bagi manusia, tetapi berisi judi bagi Google.", frasa: "iklan judi online" },
];

// Kejadian serangan jatuh tepat saat namanya diucapkan.
const D = {
  sql: detikPenanda("sqlmap-a") - 0.2,
  webshell: detikPenanda("webshell-a") - 0.2,
  modbus: detikPenanda("modbus") - 0.2,
  judol: detikPenanda("judol") - 0.2,
};
const T3 = detikSampel((s) => s.tahap === 3);
const T4 = detikSampel((s) => s.tahap === 4);
const B_DIAM = kalimatMulai(ID, 2) - 0.3; // "Webshell ketahuan ...": tangkapan layar lengkap
const POT = dariJangkar(
  [
    { footage: D.sql - (pada(ID, "SQL injection") - 0.6), adegan: 0.6 },
    { footage: D.sql, adegan: pada(ID, "SQL injection") },
    { footage: D.webshell, adegan: pada(ID, "menanam webshell") },
    { footage: D.modbus, adegan: pada(ID, "mesin PLC") },
    { footage: D.judol, adegan: pada(ID, "iklan judi online") },
  ],
  40,
);
// Mulai 0,6 dtk pertama: gambar yang sama ditahan saat sapuan masuk.
POT.unshift({ mulai: POT[0].mulai, sampai: POT[0].mulai, tahan: 0.6 });

const Panel: React.FC<{ mulai: number; k: number; tinggi: number }> = ({ mulai, k, tinggi }) => {
  const { epoch } = useJam(mulai, k, EP);
  const F = { kiri: 760, atas: ATAS, lebar: 1064, tinggi };
  const RF = F.lebar / (F.tinggi - 44);
  return (
    <>
      <Terminal ids={["sqlmap-kodim-a", "webshell-kodim-a", "modbus-plc", "judol-kodim-a"]} epoch={epoch} kiri={ISI.kiri} atas={ATAS} lebar={640} tinggi={tinggi} judul="Terminal penyerang · 172.30.0.66" ukuranHuruf={18} />
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulai}
        kecepatan={k}
        {...F}
        label="Rekaman asli · Analis · Detail Insiden"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: 326, y: 100, w: 1532, h: 640 }, RF, 0) }]}
        sorot={[
          { dari: 0, sampai: T3 - 0.2, kotak: { x: 1350, y: 108, w: 290, h: 116 }, label: "Skor naik live", warna: warna.waspada, labelBawah: true },
          { dari: T3 - 0.2, sampai: T4 - 0.2, kotak: { x: 1097, y: 481, w: 364, h: 60 }, label: "Tahap 3: webshell", labelBawah: true },
          { dari: T4 - 0.2, sampai: 900, kotak: { x: 1471, y: 481, w: 364, h: 60 }, label: "Tahap 4: Modbus ke PLC", warna: warna.awas, labelBawah: true, labelKanan: true },
        ]}
      />
    </>
  );
};

const KartuBaris: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const sampai = kalimatSelesai(ID, 1) + 0.6;
  const keluar = interpolate(d, [sampai - 0.35, sampai], [1, 0], klem);
  if (keluar <= 0) return null;
  return (
    <div style={{ position: "absolute", left: ISI.kiri, top: ATAS + PENDEK + 22, width: 1728, display: "flex", gap: 16 }}>
      {KARTU.map((k) => {
        const t = pada(ID, k.frasa);
        const m = interpolate(d, [t - 0.1, t + 0.25], [0, 1], { ...klem, easing: EASE });
        const n = Math.floor(interpolate(d, [t + 0.15, t + 0.15 + k.isi.length * 0.02], [0, k.isi.length], klem));
        return (
          <div
            key={k.istilah}
            style={{
              position: "relative",
              flex: 1,
              height: 122,
              padding: "10px 18px",
              backgroundColor: `${warna.canvas}F5`,
              border: `1px solid ${warna.lineStrong}`,
              borderTop: `6px solid ${warna.waspada}`,
              opacity: m * keluar,
              translate: `0px ${(1 - m) * 24}px`,
            }}
          >
            <Braket warnaGaris={warna.waspada} ukuran={12} tebal={2} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
              <Chip warnaLatar={warna.waspada} warnaTeks={warna.accentInk} style={{ fontSize: 15, padding: "2px 8px" }}>
                Apa itu?
              </Chip>
              <span style={{ fontFamily: huruf.stensil, fontSize: 27, color: warna.ink }}>{k.istilah}</span>
            </div>
            <div style={{ marginTop: 6, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 24, lineHeight: 1.18, color: warna.ink2, textWrap: "balance" }}>
              {k.isi.slice(0, n)}
              <span style={{ opacity: 0 }}>{k.isi.slice(n)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TAHAP4 = { x: 345, y: 478, w: 1495, h: 66 };
const kameraLengkap = (rasio: number) => fokusMuat({ x: 326, y: 100, w: 1532, h: 800 }, rasio, 0);

const Lengkap: React.FC<{ awal: number }> = ({ awal }) => {
  const FL = { kiri: ISI.kiri, atas: ATAS, lebar: 1728, tinggi: PENUH };
  const RFL = FL.lebar / (FL.tinggi - 44);
  const tWeb = pada(ID, "Webshell ketahuan") - awal;
  const tPlc = pada(ID, "perintah ke PLC") - awal;
  const tDampak = pada(ID, "tahap Dampak") - awal;
  const tPenting = kalimatMulai(ID, 4) - awal;
  return (
    <Footage
      src="rekaman/stills/13-insiden-lengkap.png"
      gambar
      epochMulaiVideo={penanda("detail-insiden-lengkap").t}
      mulai={0}
      {...FL}
      label="Tangkapan layar asli · Attack Story lengkap"
      fokus={[
        { pada: 0, kotak: kameraLengkap(RFL) },
        { pada: tWeb - 0.4, kotak: kameraLengkap(RFL) },
        { pada: tWeb + 0.6, kotak: fokusMuat({ x: 1097, y: 470, w: 740, h: 420 }, RFL, 20) },
        { pada: tDampak - 0.6, kotak: fokusMuat({ x: 1097, y: 470, w: 740, h: 420 }, RFL, 20) },
        { pada: tDampak + 0.6, kotak: kameraLengkap(RFL) },
      ]}
      sorot={[
        { dari: tWeb, sampai: tPlc - 0.1, kotak: { x: 1097, y: 551, w: 365, h: 174 }, label: "Webshell: file baru di server (FIM)", warna: warna.waspada },
        { dari: tPlc, sampai: tDampak - 0.3, kotak: { x: 1471, y: 551, w: 365, h: 140 }, label: "Perintah tulis ke PLC (Modbus)", warna: warna.awas, labelKanan: true },
        { dari: tDampak, sampai: tPenting + 30, kotak: TAHAP4, label: "4 tahap: Pengintaian → Akses Awal → Eksekusi → Dampak", warna: warna.awas, labelBawah: true },
      ]}
    />
  );
};

export const S08LebihDalam: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const fr = (t: number) => Math.round(t * fps);
  // Panel memanjang kembali setelah kartu APA ITU hilang.
  const tinggi = Math.round(interpolate(d, [kalimatSelesai(ID, 1) + 0.6, kalimatSelesai(ID, 1) + 1.2], [PENDEK, PENUH], { ...klem, easing: EASE }));
  const tStempel = pada(ID, "tahap Dampak") + 0.3;
  const stempel = interpolate(d, [tStempel, tStempel + 0.3], [0, 1], klem);
  const keAdegan = (t: number) => detikVideoUntuk(POT, t);
  return (
    <Bingkai id={ID} nomor="08" judul="Demo 4 · Serangan lanjut" durasi={durasi} dataLatihan dtgTeks={dtg(penanda("sqlmap-a").t)} tigaBagian={[kalimatMulai(ID, 0), kalimatMulai(ID, 1), kalimatMulai(ID, 4)]}>
      {(["sql", "webshell", "modbus", "judol"] as const).map((k) => (
        <Bunyi key={k} jenis="ketik" pada={keAdegan(D[k] + 0.2)} />
      ))}
      {keAdegan(T3) < B_DIAM && <Bunyi jenis="bip" pada={keAdegan(T3)} />}
      {keAdegan(T4) < B_DIAM && <Bunyi jenis="bip" pada={keAdegan(T4)} />}
      <Bunyi jenis="whoosh" pada={B_DIAM - 0.2} keras={0.6} />
      <Bunyi jenis="klik" pada={pada(ID, "Webshell ketahuan")} />
      <Bunyi jenis="klik" pada={pada(ID, "perintah ke PLC")} />
      <Bunyi jenis="stempel" pada={tStempel} />

      <Sequence durationInFrames={fr(B_DIAM)} layout="none">
        <Rangkaian potongan={POT}>{(m, k) => <Panel mulai={m} k={k} tinggi={tinggi} />}</Rangkaian>
        <Sisi jenis="penyerang" kiri={ISI.kiri} atas={ATAS} lebar={640} tinggi={tinggi} />
        <Sisi jenis="pertahanan" kiri={760} atas={ATAS} lebar={1064} tinggi={tinggi} />
      </Sequence>
      <Sequence from={fr(B_DIAM)} layout="none">
        <Lengkap awal={B_DIAM} />
      </Sequence>
      <KartuBaris />
      {stempel > 0 && (
        <div style={{ position: "absolute", left: 1180, top: 770, opacity: stempel, scale: `${1.3 - 0.3 * stempel}` }}>
          <Stempel warnaGaris={warna.awas} ukuran={56} style={{ backgroundColor: `${warna.canvas}E6` }}>
            Tahap 4: Dampak
          </Stempel>
        </div>
      )}
    </Bingkai>
  );
};
