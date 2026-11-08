// Demo 6: Penjaga Situs membuka halaman yang sama tiga kali. Kartu penjelasan memakai data asli
// (keluaran skenario lab dan hasil pemeriksaan Core), lalu tangkapan layar asli tiga varian.
import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, barisTerminal, dtg, penanda } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { Footage, fokusMuat } from "../komponen/Footage";
import { Braket, EASE, Stempel } from "../komponen/dasar";
import { Bunyi, ISI } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "10-penjaga-situs";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const isi = (re: RegExp) => barisTerminal("judol-kodim-a", re).teks.split(":").slice(1).join(":").trim();
const BIASA = isi(/pengunjung biasa/);
const BOT = isi(/Googlebot/);
const cek = (v: string) => R.db.penjagaSitus.find((x) => x.varian === v)!;

const VARIAN = [
  { judul: "Pengunjung biasa", ikon: "orang", data: cek("browser"), tampil: BIASA, frasa: "pengunjung biasa" },
  { judul: "Googlebot", ikon: "robot", data: cek("googlebot"), tampil: BOT, frasa: "sebagai Googlebot" },
  { judul: "Datang dari Google", ikon: "tautan", data: cek("referer"), tampil: BOT, frasa: "datang dari Google" },
] as const;

const Ikon: React.FC<{ jenis: string; c: string }> = ({ jenis, c }) => (
  <svg width={54} height={54} viewBox="0 0 60 60" fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    {jenis === "orang" && (
      <>
        <circle cx="30" cy="20" r="10" />
        <path d="M12 54 Q14 34 30 33 Q46 34 48 54" />
      </>
    )}
    {jenis === "robot" && (
      <>
        <rect x="12" y="18" width="36" height="28" rx="4" />
        <circle cx="23" cy="31" r="3.5" fill={c} />
        <circle cx="37" cy="31" r="3.5" fill={c} />
        <path d="M30 18 V8 M24 54 V46 M36 54 V46" />
      </>
    )}
    {jenis === "tautan" && (
      <>
        <path d="M26 34 a9 9 0 0 0 13 0 l9 -9 a9 9 0 0 0 -13 -13 l-4 4" />
        <path d="M34 26 a9 9 0 0 0 -13 0 l-9 9 a9 9 0 0 0 13 13 l4 -4" />
      </>
    )}
  </svg>
);

const Kartu: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const o = (t: number, lama = 0.4) => interpolate(d, [t, t + lama], [0, 1], { ...klem, easing: EASE });
  const tNormal = pada(ID, "Versi biasa tetap normal");
  const tMirip = pada(ID, `${Math.round(cek("googlebot").kemiripan * 100)}% mirip`);
  const tJudi = pada(ID, `${cek("googlebot").kata_judi} kata judi`);
  return (
    <div style={{ position: "absolute", left: ISI.kiri, top: ISI.atasDemo + 20, width: 1728, display: "flex", gap: 30 }}>
      {VARIAN.map((v, i) => {
        const m = o(pada(ID, v.frasa) - 0.15);
        const judi = v.data.ditandai === 1;
        const c = d >= tMirip - 0.1 ? (judi ? warna.awas : warna.aman) : warna.accent;
        const persen = Math.round(v.data.kemiripan * 100);
        const bar = interpolate(d, [tMirip - 0.2, tMirip + 0.6], [1, v.data.kemiripan], klem);
        return (
          <div key={v.judul} style={{ position: "relative", flex: 1, height: 680, padding: "24px 28px", backgroundColor: warna.panel, border: `2px solid ${c}`, opacity: m, translate: `0px ${(1 - m) * 30}px` }}>
            <Braket warnaGaris={c} />
            <div style={{ display: "flex", alignItems: "center", gap: 16, whiteSpace: "nowrap" }}>
              <Ikon jenis={v.ikon} c={c} />
              <div>
                <div style={{ fontFamily: huruf.mono, fontSize: 20, color: warna.accent }}>0{i + 1} // DIBUKA SEBAGAI</div>
                <div style={{ fontFamily: huruf.stensil, fontSize: 32, color: warna.ink }}>{v.judul.toUpperCase()}</div>
              </div>
            </div>
            {/* Judul halaman yang benar-benar diterima (keluaran skenario lab). */}
            <div style={{ marginTop: 24, height: 220, padding: "20px 22px", backgroundColor: "#0A0C07", border: `1px solid ${warna.lineStrong}` }}>
              <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 20, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase" }}>Isi halaman yang diterima</div>
              <div style={{ marginTop: 14, fontFamily: huruf.mono, fontSize: 34, lineHeight: 1.25, color: judi ? warna.waspada : warna.ink, textWrap: "balance" }}>{v.tampil}</div>
            </div>
            <div style={{ marginTop: 26, opacity: o(tMirip - 0.2) }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 28, color: warna.ink2, whiteSpace: "nowrap" }}>
                <span>Kemiripan dengan versi normal</span>
                <span style={{ fontFamily: huruf.mono, color: c }}>{persen}%</span>
              </div>
              <div style={{ marginTop: 10, height: 16, backgroundColor: warna.inset }}>
                <div style={{ width: `${bar * 100}%`, height: "100%", backgroundColor: c }} />
              </div>
            </div>
            <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 28, color: warna.ink2, opacity: o(tJudi - 0.2), whiteSpace: "nowrap" }}>
              <span>Kata judi ditemukan</span>
              <span style={{ fontFamily: huruf.mono, color: judi ? warna.awas : warna.aman }}>{v.data.kata_judi}</span>
            </div>
            <div style={{ position: "absolute", left: 28, bottom: 26, opacity: judi ? o(tJudi + 0.4, 0.25) : o(tNormal, 0.25), scale: `${1.3 - 0.3 * (judi ? o(tJudi + 0.4, 0.25) : o(tNormal, 0.25))}` }}>
              <Stempel warnaGaris={judi ? warna.awas : warna.aman} ukuran={40} miring={judi ? -4 : 3}>
                {judi ? "Berisi judi" : "Normal"}
              </Stempel>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const S10PenjagaSitus: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const fr = (t: number) => Math.round(t * fps);
  const B_ASLI = kalimatMulai(ID, 3) - 0.3; // "SENTRA menandainya ..."
  const FL = { kiri: ISI.kiri, atas: ISI.atasDemo + 14, lebar: 1728, tinggi: 700 };
  const RFL = FL.lebar / (FL.tinggi - 44);
  const tPenting = kalimatMulai(ID, 4) - B_ASLI;
  const y = 466;
  const h = 318;
  return (
    <Bingkai id={ID} nomor="10" judul="Demo 6 · Penjaga Situs" durasi={durasi} dataLatihan dtgTeks={dtg(penanda("penjaga-situs").t)} tigaBagian={[kalimatMulai(ID, 0), kalimatMulai(ID, 1), kalimatMulai(ID, 4)]}>
      {VARIAN.map((v) => (
        <Bunyi key={v.judul} jenis="whoosh" pada={pada(ID, v.frasa) - 0.2} keras={0.6} />
      ))}
      <Bunyi jenis="bip" pada={pada(ID, `${cek("googlebot").kata_judi} kata judi`) + 0.4} />
      <Bunyi jenis="whoosh" pada={B_ASLI - 0.1} keras={0.6} />
      <Bunyi jenis="stempel" pada={pada(ID, "menandainya") + 0.2} />

      <Sequence durationInFrames={fr(B_ASLI)} layout="none">
        <Kartu />
      </Sequence>
      <Sequence from={fr(B_ASLI)} layout="none">
        <Footage
          src="rekaman/stills/17-penjaga-situs-varian.png"
          gambar
          epochMulaiVideo={penanda("penjaga-situs-varian").t}
          mulai={0}
          {...FL}
          label="Tangkapan layar asli · Penjaga Situs"
          fokus={[
            { pada: 0, kotak: fokusMuat({ x: 760, y: 170, w: 1015, h: 630 }, RFL, 0) },
            { pada: 1.6, kotak: fokusMuat({ x: 760, y: 170, w: 1015, h: 630 }, RFL, 0) },
            { pada: 2.6, kotak: fokusMuat({ x: 755, y: 445, w: 1027, h: 392 }, RFL, 0) },
          ]}
          sorot={[
            { dari: 0.3, sampai: 2.3, kotak: { x: 1560, y: 180, w: 196, h: 56 }, label: "Ditandai: cloaking judi", warna: warna.awas, labelBawah: true, labelKanan: true },
            { dari: 2.5, sampai: tPenting, kotak: { x: 1107, y, w: 317, h }, label: "Googlebot: judi", warna: warna.awas, labelBawah: true, redup: false },
            { dari: 2.8, sampai: tPenting, kotak: { x: 1437, y, w: 318, h }, label: "Referer Google: judi", warna: warna.awas, labelBawah: true, labelKanan: true, redup: false },
            { dari: tPenting, sampai: 99, kotak: { x: 776, y, w: 317, h }, label: "Yang dilihat pengelola: normal", warna: warna.aman, labelBawah: true },
          ]}
        />
      </Sequence>
    </Bingkai>
  );
};
