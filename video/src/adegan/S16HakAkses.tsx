import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AKSES, dtg } from "../data";
import { Footage, fokusMuat } from "../komponen/Footage";
import { Braket } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";
import { kalimatMulai, pada } from "../data/narasi";
import { Bunyi } from "../komponen/v2";

const ID = "16-hak-akses";
const B_BANDING = kalimatMulai(ID, 1) - 0.4; // "Operator Kodim A ..."

// Sesuai tabel akun di README dan AccessMatrix Core.
const PERAN = [
  { peran: "Operator", satuan: "Satuannya sendiri", bisa: "Melihat satuannya, ubah status insiden, usul tindakan", c: warna.pasir },
  { peran: "Analis", satuan: "Lintas satuan", bisa: "Usul tindakan, LAPSIT, Uji Kesiapan, Penjaga Situs, audit", c: warna.accent },
  { peran: "Komandan", satuan: "Lintas satuan", bisa: "Setuju/tolak tindakan (juga dari HP), LAPSIT, audit", c: warna.aman },
  { peran: "Admin", satuan: "Sistem", bisa: "Satuan, agent, pengguna, aturan, pengaturan", c: warna.waspada },
];

const Peran = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  return (
    <div style={{ position: "absolute", left: 96, right: 96, top: 156, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 26 }}>
      {PERAN.map((p, i) => {
        const o = interpolate(d, [0.15 + i * 0.25, 0.45 + i * 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={p.peran} style={{ position: "relative", height: 470, padding: "30px 28px", backgroundColor: warna.panel, border: `1px solid ${warna.lineStrong}`, borderTop: `8px solid ${p.c}`, opacity: o, translate: `0px ${(1 - o) * 24}px` }}>
            <Braket warnaGaris={p.c} />
            <div style={{ fontFamily: huruf.mono, fontSize: 24, color: p.c }}>0{i + 1} //</div>
            <div style={{ fontFamily: huruf.stensil, fontSize: 48, color: warna.ink, marginTop: 6 }}>{p.peran.toUpperCase()}</div>
            <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 26, letterSpacing: "0.1em", color: warna.ink3, textTransform: "uppercase", marginTop: 8 }}>{p.satuan}</div>
            <div style={{ fontFamily: huruf.kondensasi, fontSize: 40, lineHeight: 1.25, color: warna.ink2, marginTop: 24 }}>{p.bisa}</div>
          </div>
        );
      })}
      <div style={{ gridColumn: "1 / -1", fontFamily: huruf.kondensasi, fontSize: 28, color: warna.ink3, opacity: interpolate(d, [1.3, 1.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Ditambah akun Demo yang hanya bisa melihat, untuk juri.
      </div>
    </div>
  );
};

const Banding = () => {
  const lebar = 852;
  const P = { atas: 156, lebar, tinggi: 740 };
  const rasio = lebar / (P.tinggi - 44);
  // Kartu agent disorot saat peran itu disebut di narasi.
  const tSorot = { operator: pada(ID, "Operator Kodim A") - B_BANDING, analis: pada(ID, "Analis di pusat") - B_BANDING };
  const v = (nama: "operator" | "analis") => {
    const info = AKSES.video[nama];
    const p = AKSES.penanda.find((x) => x.video === nama && x.id === "beranda")!;
    const mulai = (p.t - info.mulai) / 1000 - 0.3;
    const kartu = fokusMuat({ x: 300, y: 420, w: 700, h: 520 }, rasio, 0);
    const m = (p.agent ?? "").match(/(\d+)\s*\/\s*(\d+)/);
    return { mulai, kartu, tSorot: tSorot[nama], src: `rekaman/akses-${nama}.mp4`, ep: info.mulai, agent: m ? `Agent: ${m[1]} / ${m[2]}` : "Agent" };
  };
  const op = v("operator");
  const an = v("analis");
  const panel = (x: ReturnType<typeof v>, kiri: number, label: string, c: string) => (
    // Tangkapan layar asli Beranda tiap akun (diambil di detik penanda yang sama dengan footage).
    <Footage
      src={x.src.replace(/^rekaman\/akses-(\w+)\.mp4$/, "rekaman/stills/akses-$1.png")}
      gambar
      epochMulaiVideo={x.ep + (x.mulai + 0.3) * 1000}
      mulai={0}
      kiri={kiri}
      {...P}
      label={label.replace("Rekaman asli", "Tangkapan layar asli")}
      fokus={[{ pada: 0, kotak: x.kartu }]}
      sorot={[{ dari: x.tSorot, sampai: 60, kotak: { x: 536, y: 657, w: 209, h: 255 }, label: x.agent, warna: c }]}
    />
  );
  return (
    <>
      {panel(op, 96, "Rekaman asli · Operator Kodim A", warna.pasir)}
      {panel(an, 972, "Rekaman asli · Analis Kodam", warna.accent)}
    </>
  );
};

export const S16HakAkses: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const a = B_BANDING;
  return (
    <Bingkai id={ID} nomor="16" judul="Hak akses" durasi={durasi} dataLatihan dtgTeks={dtg(AKSES.video.operator.mulai)}>
      {[0, 1, 2, 3].map((i) => (
        <Bunyi key={i} jenis="klik" pada={0.15 + i * 0.25} keras={0.6} />
      ))}
      <Bunyi jenis="whoosh" pada={a - 0.1} keras={0.6} />
      <Bunyi jenis="bip" pada={pada(ID, "Operator Kodim A")} keras={0.7} />
      <Bunyi jenis="bip" pada={pada(ID, "Analis di pusat")} keras={0.7} />
      <Sequence durationInFrames={Math.round(a * fps)} layout="none">
        <Peran />
      </Sequence>
      <Sequence from={Math.round(a * fps)} layout="none">
        <Banding />
      </Sequence>
    </Bingkai>
  );
};
