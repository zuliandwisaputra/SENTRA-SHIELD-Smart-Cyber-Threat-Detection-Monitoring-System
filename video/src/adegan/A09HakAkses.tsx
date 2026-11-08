import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AKSES, dtg } from "../data";
import { Footage, fokusMuat } from "../komponen/Footage";
import { Braket } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";
import { kata, teksNarasi } from "../data/narasi";

const ID = "09-hak-akses";
const B_BANDING = kata(ID, 5) - 0.5; // "operator Kodim A ..."

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
    <div style={{ position: "absolute", left: 96, right: 96, top: 150, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 26 }}>
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
  const P = { atas: 150, lebar, tinggi: 700 };
  const rasio = lebar / (P.tinggi - 44);
  // Kartu agent disorot saat peran itu disebut di narasi.
  const tSorot = { operator: kata(ID, 5) - B_BANDING, analis: kata(ID, 13) - B_BANDING };
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
    <Footage
      src={x.src}
      epochMulaiVideo={x.ep}
      mulai={x.mulai}
      kiri={kiri}
      {...P}
      label={label}
      fokus={[{ pada: x.mulai, kotak: x.kartu }]}
      sorot={[{ dari: x.mulai + x.tSorot, sampai: x.mulai + 12, kotak: { x: 536, y: 657, w: 209, h: 255 }, label: x.agent, warna: c }]}
    />
  );
  return (
    <>
      {panel(op, 96, "Rekaman asli · Operator Kodim A", warna.pasir)}
      {panel(an, 972, "Rekaman asli · Analis Kodam", warna.accent)}
    </>
  );
};

export const A09HakAkses: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const a = B_BANDING;
  return (
    <Bingkai
      nomor="09"
      judul="Hak akses"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(AKSES.video.operator.mulai)}
      keterangan={teksNarasi(ID, [
        [0, "Setiap peran punya hak berbeda."],
        [5, "Operator Kodim A hanya melihat satuannya sendiri,"],
        [12, "sedangkan analis di pusat melihat semua satuan."],
      ])}
    >
      <Sequence durationInFrames={Math.round(a * fps)} layout="none">
        <Peran />
      </Sequence>
      <Sequence from={Math.round(a * fps)} layout="none">
        <Banding />
      </Sequence>
    </Bingkai>
  );
};
