// Demo 11: buku jaga berantai. Animasi rantai memakai hash ASLI catatan audit 18-21 dari lab;
// bagian "kalau diubah" diberi label ILUSTRASI. Lalu footage asli klik Verifikasi Rantai -> Rantai utuh.
import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, detikPenanda, dtg, jamWib, penanda } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { Footage, fokusMuat } from "../komponen/Footage";
import { Braket, Chip, EASE } from "../komponen/dasar";
import { Bunyi, ISI } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "15-buku-jaga";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EP = R.video.analis.mulai;

type Catatan = { id: number; aksi: string; waktu: string; hash: string; prev: string };
const RANTAI = (R.db as unknown as { auditRantai: Catatan[] }).auditRantai.filter((x) => x.id >= 18 && x.id <= 21);
const pendek = (h: string) => `${h.slice(0, 8)}…`;
const DIUBAH = 1; // indeks blok yang "diubah" dalam ilustrasi (catatan 19)

const LEBAR = 380;
const JARAK = 70;
const KIRI = (1920 - (RANTAI.length * LEBAR + (RANTAI.length - 1) * JARAK)) / 2;
const ATAS = 300;

const Rantai: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const o = (t: number, lama = 0.4) => interpolate(d, [t, t + lama], [0, 1], { ...klem, easing: EASE });
  const tBlok = kalimatMulai(ID, 1) - 0.1;
  const tSidik = pada(ID, "sidik jari catatan sebelumnya") - 0.1;
  const tRantai = pada(ID, "membentuk rantai") - 0.1;
  const tUbah = pada(ID, "satu catatan diubah") - 0.1;
  const tPutus = pada(ID, "rantainya putus") - 0.1;
  const ubah = o(tUbah, 0.3);
  const putus = o(tPutus, 0.25);
  return (
    <>
      <div style={{ position: "absolute", left: KIRI, top: 214, display: "flex", alignItems: "baseline", gap: 14, opacity: o(tBlok), whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.accent }}>AUDIT LOG //</span>
        <span style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 28, color: warna.ink2 }}>catatan asli dari lab, hash SHA-256 dipendekkan</span>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {RANTAI.slice(1).map((_, i) => {
          const x1 = KIRI + (i + 1) * LEBAR + i * JARAK;
          const x2 = x1 + JARAK;
          const y = ATAS + 150;
          const rusak = i === DIUBAH && putus > 0;
          const c = rusak ? warna.awas : warna.aman;
          const g = o(tRantai + i * 0.25, 0.3);
          return (
            <g key={i} opacity={g}>
              <path d={`M${x1} ${y} H${x2 - 6}`} stroke={c} strokeWidth={6} strokeDasharray={rusak ? "10 12" : undefined} />
              <path d={`M${x2 - 18} ${y - 12} L${x2 - 4} ${y} L${x2 - 18} ${y + 12}`} fill="none" stroke={c} strokeWidth={5} />
              {rusak && (
                <g stroke={warna.awas} strokeWidth={6} opacity={putus}>
                  <path d={`M${(x1 + x2) / 2 - 18} ${y - 18} L${(x1 + x2) / 2 + 18} ${y + 18} M${(x1 + x2) / 2 + 18} ${y - 18} L${(x1 + x2) / 2 - 18} ${y + 18}`} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {RANTAI.map((c, i) => {
        const m = o(tBlok + i * 0.3);
        const diubah = i === DIUBAH && ubah > 0;
        const terputus = i === DIUBAH + 1 && putus > 0;
        const garis = diubah ? warna.waspada : terputus ? warna.awas : warna.lineStrong;
        return (
          <div key={c.id} style={{ position: "absolute", left: KIRI + i * (LEBAR + JARAK), top: ATAS, width: LEBAR, height: 300, padding: "18px 22px", backgroundColor: warna.panel, border: `2px solid ${garis}`, opacity: m, translate: `0px ${(1 - m) * 20}px`, whiteSpace: "nowrap" }}>
            <Braket warnaGaris={diubah ? warna.waspada : warna.accent} ukuran={16} tebal={2} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: huruf.mono, fontSize: 22, color: warna.accent }}>
              <span>CATATAN #{c.id}</span>
              <span style={{ color: warna.ink3 }}>{jamWib(Date.parse(c.waktu.replace(" ", "T") + "Z"))}</span>
            </div>
            <div style={{ marginTop: 8, fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 30, color: warna.ink, overflow: "hidden", textOverflow: "ellipsis" }}>{diubah ? "isi diubah diam-diam" : c.aksi.replace(/_/g, " ")}</div>
            <div style={{ marginTop: 16, fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 18, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase", opacity: o(tSidik) }}>Sidik jari catatan sebelumnya</div>
            <div style={{ fontFamily: huruf.mono, fontSize: 26, color: terputus ? warna.awas : warna.ink2, opacity: o(tSidik) }}>{pendek(c.prev)}</div>
            <div style={{ marginTop: 10, fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 18, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase" }}>Sidik jari catatan ini</div>
            <div style={{ fontFamily: huruf.mono, fontSize: 26, color: diubah ? warna.waspada : warna.aman }}>{diubah ? "berubah total" : pendek(c.hash)}</div>
          </div>
        );
      })}
      {/* Ilustrasi: bagian ini tidak terjadi di lab. */}
      <div style={{ position: "absolute", left: KIRI + DIUBAH * (LEBAR + JARAK), top: ATAS + 320, opacity: ubah, display: "flex", flexDirection: "column", gap: 10, whiteSpace: "nowrap" }}>
        <Chip warnaLatar={warna.waspada} warnaTeks={warna.accentInk} style={{ fontSize: 18 }}>
          Ilustrasi · bila catatan diubah
        </Chip>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: ATAS + 400, display: "flex", justifyContent: "center", opacity: putus, whiteSpace: "nowrap" }}>
        <div style={{ padding: "12px 28px", border: `3px solid ${warna.awas}`, backgroundColor: `${warna.awas}22`, fontFamily: huruf.stensil, fontSize: 40, color: warna.awas, letterSpacing: "0.06em" }}>RANTAI PUTUS · LANGSUNG KETAHUAN</div>
      </div>
    </>
  );
};

export const S15BukuJaga: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const fr = (t: number) => Math.round(t * fps);
  const B_ASLI = kalimatMulai(ID, 3) - 0.3; // "Satu klik Verifikasi Rantai"
  const D_KLIK = detikPenanda("verifikasi");
  const D_UTUH = detikPenanda("audit-utuh");
  const mulai = D_KLIK - (pada(ID, "Verifikasi Rantai") - B_ASLI);
  const FL = { kiri: ISI.kiri, atas: ISI.atasDemo + 14, lebar: 1728, tinggi: 700 };
  const RFL = FL.lebar / (FL.tinggi - 44);
  const hasil = (penanda("audit-utuh").kotak as unknown as { hasil: { x: number; y: number; w: number; h: number } }).hasil;
  return (
    <Bingkai id={ID} nomor="15" judul="Demo 11 · Buku jaga" durasi={durasi} dataLatihan dtgTeks={dtg(penanda("verifikasi").t)} tigaBagian={[kalimatMulai(ID, 2), kalimatMulai(ID, 3), null]}>
      {RANTAI.map((_, i) => (
        <Bunyi key={i} jenis="klik" pada={kalimatMulai(ID, 1) - 0.1 + i * 0.3} keras={0.7} />
      ))}
      <Bunyi jenis="ketik" pada={pada(ID, "satu catatan diubah")} />
      <Bunyi jenis="retak" pada={pada(ID, "rantainya putus")} />
      <Bunyi jenis="whoosh" pada={B_ASLI - 0.1} keras={0.6} />
      <Bunyi jenis="klik" pada={pada(ID, "Verifikasi Rantai")} />
      <Bunyi jenis="sukses" pada={B_ASLI + (D_UTUH - mulai)} />

      <Sequence durationInFrames={fr(B_ASLI)} layout="none">
        <Rantai />
      </Sequence>
      <Sequence from={fr(B_ASLI)} layout="none">
        <Footage
          src="rekaman/analis-desktop.mp4"
          epochMulaiVideo={EP}
          mulai={mulai}
          {...FL}
          label="Rekaman asli · Analis · Audit Log"
          fokus={[{ pada: 0, kotak: fokusMuat({ x: 326, y: 150, w: 1532, h: 560 }, RFL, 0) }]}
          klik={[{ pada: D_KLIK, kotak: penanda("verifikasi").klik! }]}
          sorot={[
            { dari: D_KLIK - 0.6, sampai: D_UTUH - 0.3, kotak: penanda("verifikasi").klik!, label: "Verifikasi Rantai", labelBawah: true },
            { dari: D_UTUH - 0.3, sampai: mulai + 60, kotak: hasil, label: "Rantai utuh", warna: warna.aman, labelBawah: true },
          ]}
        />
      </Sequence>
    </Bingkai>
  );
};
