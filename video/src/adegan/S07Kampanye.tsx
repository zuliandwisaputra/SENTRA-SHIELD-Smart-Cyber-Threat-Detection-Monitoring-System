// Demo 3: kampanye lintas satuan. Animasi peta sederhana dengan jam asli, lalu footage asli peta operasi dan halaman Kampanye.
import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, detikDi, detikPenanda, dtg, jamWib, kotakPenanda, terminal } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { Footage, fokusMuat } from "../komponen/Footage";
import { SimbolPenyerang, SimbolSatuan, Stempel } from "../komponen/dasar";
import { Bunyi, ISI } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "07-kampanye";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EP = R.video.analis.mulai;
const SRC = "rekaman/analis-desktop.mp4";
const FL = { kiri: ISI.kiri, atas: ISI.atasDemo + 14, lebar: 1728, tinggi: 700 };
const RFL = FL.lebar / (FL.tinggi - 44);

const NMAP_A = terminal("nmap-kodim-a").mulai;
const NMAP_B = terminal("nmap-kodim-b").mulai;
const KAMPANYE_DIBUAT = Date.parse(String((R.ukur as unknown as { kampanye: { dibuat: string } }).kampanye.dibuat).replace(" ", "T") + "Z");
const D_DUA = detikDi(NMAP_B) + R.ukur.nmapBKeDuaSatuanDiBerandaMs / 1000;
const PETA = kotakPenanda("beranda-kampanye", "peta");
const URUTAN = kotakPenanda("kampanye", "urutan");

// Titik peta animasi (koordinat layar).
const P = { x: 330, y: 450 };
const A = { x: 1000, y: 330 };
const B = { x: 1000, y: 750 };

const Garis: React.FC<{ dari: { x: number; y: number }; ke: { x: number; y: number }; g: number; c: string; geser: number }> = ({ dari, ke, g, c, geser }) => {
  const mx = (dari.x + ke.x) / 2;
  const d = `M${dari.x} ${dari.y} C ${mx} ${dari.y}, ${mx} ${ke.y}, ${ke.x - 90} ${ke.y}`;
  return (
    <>
      <path d={d} fill="none" stroke={c} strokeWidth={6} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - g} opacity={0.25} />
      <path d={d} fill="none" stroke={c} strokeWidth={5} strokeDasharray="18 14" strokeDashoffset={-geser} opacity={g > 0.98 ? 1 : 0} />
      <path d={d} fill="none" stroke={c} strokeWidth={5} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - g} opacity={g > 0.98 ? 0 : 1} />
    </>
  );
};

const Peta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const o = (t: number, lama = 0.5) => interpolate(d, [t, t + lama], [0, 1], klem);
  const tB = pada(ID, "memindai Kodim B") - 0.2;
  const tKampanye = pada(ID, "satu kampanye") - 0.2;
  const gA = o(0.6, 1.0);
  const gB = o(tB, 1.0);
  const k = o(tKampanye, 0.4);
  const geser = f * 1.4;
  const c = k > 0.5 ? warna.awas : warna.waspada;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Garis dari={P} ke={A} g={gA} c={c} geser={geser} />
        <Garis dari={P} ke={B} g={gB} c={c} geser={geser} />
        {k > 0 && (
          <rect x={A.x - 120} y={A.y - 110} width={700} height={B.y - A.y + 230} fill="none" stroke={warna.awas} strokeWidth={4} strokeDasharray="14 10" opacity={k} />
        )}
      </svg>
      <div style={{ position: "absolute", left: P.x - 70, top: P.y - 70, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
        <SimbolPenyerang ukuran={140} />
        <div style={{ fontFamily: huruf.stensil, fontSize: 30, color: warna.awas }}>PENYERANG</div>
        <div style={{ fontFamily: huruf.mono, fontSize: 30, color: warna.ink }}>172.30.0.66</div>
      </div>
      {[
        { p: A, nama: "Kodim Latihan A", jam: jamWib(NMAP_A), o: o(0.9) },
        { p: B, nama: "Kodim Latihan B", jam: jamWib(NMAP_B), o: o(tB + 0.6) },
      ].map((x) => (
        <div key={x.nama} style={{ position: "absolute", left: x.p.x - 80, top: x.p.y - 70, display: "flex", alignItems: "center", gap: 22, opacity: Math.max(0.35, x.o), whiteSpace: "nowrap" }}>
          <SimbolSatuan lebar={150} eselon="II" warnaGaris={x.o > 0.5 ? warna.awas : warna.accent} />
          <div>
            <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 36, color: warna.ink }}>{x.nama}</div>
            <div style={{ fontFamily: huruf.mono, fontSize: 26, color: warna.waspada, opacity: x.o }}>dipindai {x.jam} WIB</div>
          </div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 140, top: 680, opacity: k, scale: `${1.3 - 0.3 * k}`, transformOrigin: "left center", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14, whiteSpace: "nowrap" }}>
        <Stempel warnaGaris={warna.awas} ukuran={52} style={{ backgroundColor: `${warna.canvas}E6` }}>
          Kampanye #1
        </Stempel>
        <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 28, color: warna.ink2 }}>2 satuan · IP yang sama</div>
        <div style={{ fontFamily: huruf.mono, fontSize: 22, color: warna.ink3 }}>dibuat {jamWib(KAMPANYE_DIBUAT)} WIB</div>
      </div>
    </>
  );
};

/** Ringkasan kampanye dari data asli, di sebelah peta operasi. */
const InfoKampanye: React.FC = () => (
  <div style={{ position: "absolute", left: ISI.kiri, top: ISI.atasDemo + 14, width: 960, display: "flex", flexDirection: "column", gap: 22, whiteSpace: "nowrap" }}>
    <div style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.accent }}>PETA OPERASI //</div>
    <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 34, color: warna.ink2 }}>Garis putus-putus: serangan aktif</div>
    {[
      { k: "Penyerang", v: "172.30.0.66" },
      { k: "Kodim Latihan A", v: `dipindai ${jamWib(NMAP_A)} WIB` },
      { k: "Kodim Latihan B", v: `dipindai ${jamWib(NMAP_B)} WIB` },
      { k: "Kampanye #1", v: `dibuat ${jamWib(KAMPANYE_DIBUAT)} WIB` },
    ].map((x) => (
      <div key={x.k} style={{ padding: "16px 22px", backgroundColor: warna.panel, borderLeft: `6px solid ${x.k.startsWith("Kampanye") ? warna.awas : warna.accent}` }}>
        <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 30, color: warna.ink }}>{x.k}</div>
        <div style={{ fontFamily: huruf.mono, fontSize: 26, color: warna.ink2 }}>{x.v}</div>
      </div>
    ))}
  </div>
);

export const S07Kampanye: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const fr = (t: number) => Math.round(t * fps);
  const B_PETA = pada(ID, "dan peta operasi") - 0.3;
  const B_HALAMAN = kalimatMulai(ID, 2) - 0.3;
  // Peta operasi: dua satuan sasaran muncul tepat saat "menunjuk keduanya".
  const mulaiPeta = D_DUA - (pada(ID, "menunjuk keduanya") - B_PETA);
  const mulaiHalaman = detikPenanda("kampanye") - 0.4;
  return (
    <Bingkai id={ID} nomor="07" judul="Demo 3 · Kampanye" durasi={durasi} dataLatihan dtgTeks={dtg(NMAP_B)} tigaBagian={[kalimatMulai(ID, 0), kalimatMulai(ID, 1), kalimatMulai(ID, 2)]}>
      <Bunyi jenis="ping" pada={0.5} />
      <Bunyi jenis="bip" pada={pada(ID, "memindai Kodim B") + 0.4} />
      <Bunyi jenis="stempel" pada={pada(ID, "satu kampanye") - 0.05} />
      <Bunyi jenis="whoosh" pada={B_PETA - 0.2} keras={0.6} />
      <Bunyi jenis="ping" pada={pada(ID, "menunjuk keduanya")} keras={0.7} />
      <Bunyi jenis="whoosh" pada={B_HALAMAN - 0.2} keras={0.6} />

      <Sequence durationInFrames={fr(B_PETA)} layout="none">
        <Peta />
      </Sequence>
      <Sequence from={fr(B_PETA)} durationInFrames={fr(B_HALAMAN) - fr(B_PETA)} layout="none">
        {/* Panel ramping agar seluruh peta operasi masuk tanpa terpotong; info kampanye di kiri. */}
        <Footage
          src={SRC}
          epochMulaiVideo={EP}
          mulai={mulaiPeta}
          kiri={ISI.kiri + 1028}
          atas={FL.atas}
          lebar={700}
          tinggi={FL.tinggi}
          label="Rekaman asli · Analis · Peta operasi"
          fokus={[{ pada: 0, kotak: fokusMuat({ x: PETA.x, y: PETA.y, w: PETA.w, h: PETA.h - 20 }, 700 / (FL.tinggi - 44), 0) }]}
          sorot={[{ dari: D_DUA - 0.2, sampai: mulaiPeta + 30, kotak: { x: 1660, y: 420, w: 170, h: 120 }, label: "IP sama → 2 satuan", warna: warna.awas, labelBawah: true, labelKanan: true }]}
        />
        <InfoKampanye />
      </Sequence>
      <Sequence from={fr(B_HALAMAN)} layout="none">
        <Footage
          src={SRC}
          epochMulaiVideo={EP}
          mulai={mulaiHalaman}
          {...FL}
          label="Rekaman asli · Analis · Kampanye"
          fokus={[{ pada: 0, kotak: fokusMuat({ x: 326, y: 120, w: 1532, h: 460 }, RFL, 10) }]}
          sorot={[
            { dari: mulaiHalaman + 0.3, sampai: mulaiHalaman + 30, kotak: { x: 326, y: 120, w: 1000, h: 60 }, label: "Kampanye lintas satuan" },
            { dari: mulaiHalaman + 1.2, sampai: mulaiHalaman + 30, kotak: URUTAN, label: "Kodim A lalu Kodim B · skor ×1,3", labelBawah: true, redup: false },
          ]}
        />
      </Sequence>
    </Bingkai>
  );
};
