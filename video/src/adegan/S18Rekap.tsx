// Rekap 30 detik: garis waktu dengan jam asli dari rekaman, disorot per kelompok mengikuti narasi.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, desimal, dtg, jamWib, penanda, terminal } from "../data";
import { kalimatMulai } from "../data/narasi";
import { Braket, EASE } from "../komponen/dasar";
import { Bunyi, ISI } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "18-rekap";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const utc = (s: string) => Date.parse(s.replace(" ", "T") + "Z");

const NMAP_A = terminal("nmap-kodim-a").mulai;
const blokir = R.db.tindakan.find((x) => x.jenis === "block_ip")!;
const T_SETUJU = R.ukur.waktuSetuju;
const T_PUTUS = T_SETUJU + R.ukur.portal.setujuKeGagalPertamaMs;
const t946 = R.sampel.analis.find((s) => s.skor === String(R.db.insiden.find((x) => x.id === 1)!.skor))!.t;
const butaDb = (R.db as unknown as { agentButa: { waktu: string }[] }).agentButa[0];
const lolos = R.db.ujiKesiapanHasil.filter((x) => x.terdeteksi).length;
const uji = R.db.ujiKesiapan as unknown as { selesai: string; rata_ttd_ms: number };

type Butir = { jam: string; teks: string; c?: string };
const KELOMPOK: { judul: string; isi: Butir[] }[] = [
  {
    judul: "Serangan mulai",
    isi: [
      { jam: jamWib(NMAP_A), teks: "Pemindaian port Kodim A" },
      { jam: jamWib(NMAP_A + R.ukur.nmapKeInsidenDiBerandaMs), teks: `Insiden tampil (+${desimal(R.ukur.nmapKeInsidenDiBerandaMs / 1000, 1)} dtk)`, c: warna.waspada },
      { jam: jamWib(terminal("hydra-kodim-a").mulai), teks: "Tebak kata sandi SSH" },
    ],
  },
  {
    judul: "Serangan melebar",
    isi: [
      { jam: jamWib(terminal("nmap-kodim-b").mulai), teks: "Kodim B → Kampanye #1" },
      { jam: `${jamWib(terminal("sqlmap-kodim-a").mulai)}–${jamWib(terminal("judol-kodim-a").mulai)}`, teks: "SQLi, webshell, PLC, judi" },
      { jam: jamWib(t946), teks: "Skor 946 · Kritis", c: warna.awas },
    ],
  },
  {
    judul: "Respons",
    isi: [
      { jam: jamWib(utc(blokir.diusulkan)), teks: "Analis mengusulkan" },
      { jam: jamWib(utc(blokir.disetujui)), teks: "Komandan menyetujui (HP)", c: warna.aman },
      { jam: jamWib(T_PUTUS), teks: `Terputus (+${desimal(R.ukur.portal.setujuKeGagalPertamaMs / 1000, 2)} dtk)`, c: warna.awas },
    ],
  },
  {
    judul: "Bukti dan uji",
    isi: [
      { jam: jamWib(utc(R.ukur.lapsit.dibuat ?? blokir.dieksekusi)), teks: "LAPSIT bersegel SHA-256" },
      { jam: jamWib(utc(butaDb.waktu)), teks: "Sensor Buta terdeteksi" },
      { jam: jamWib(utc(uji.selesai)), teks: `Uji Kesiapan ${lolos}/${R.db.ujiKesiapanHasil.length}`, c: warna.aman },
      { jam: jamWib(penanda("audit-utuh").t), teks: "Rantai audit utuh", c: warna.aman },
    ],
  },
];

export const S18Rekap: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const mulai = [1, 2, 3, 4].map((n) => kalimatMulai(ID, n) - 0.2);
  const aktif = mulai.filter((t) => d >= t).length - 1;
  const lebar = (1728 - 3 * 24) / 4;
  const maju = interpolate(d, [mulai[0], mulai[3] + 3], [0, 1], klem);
  return (
    <Bingkai id={ID} nomor="18" judul="Rekap 30 detik" durasi={durasi} dataLatihan dtgTeks={dtg(NMAP_A)}>
      <Bunyi jenis="ping" pada={0.4} />
      {mulai.map((t, i) => (
        <Bunyi key={i} jenis="whoosh" pada={t} keras={0.6} />
      ))}
      <Bunyi jenis="putus" pada={mulai[2] + 2.2} keras={0.5} />
      <Bunyi jenis="sukses" pada={mulai[3] + 2.4} keras={0.7} />

      {/* Garis waktu */}
      <div style={{ position: "absolute", left: ISI.kiri, top: 168, width: 1728, height: 8, backgroundColor: warna.inset }}>
        <div style={{ width: `${maju * 100}%`, height: "100%", backgroundColor: warna.accent }} />
      </div>
      {KELOMPOK.map((k, i) => {
        const muncul = interpolate(d, [mulai[i] - 0.1, mulai[i] + 0.4], [0, 1], { ...klem, easing: EASE });
        const on = i === aktif;
        return (
          <div
            key={k.judul}
            style={{
              position: "absolute",
              left: ISI.kiri + i * (lebar + 24),
              top: 206,
              width: lebar,
              height: 700,
              padding: "22px 22px",
              backgroundColor: on ? warna.raised : warna.panel,
              border: `2px solid ${on ? warna.accent : warna.lineStrong}`,
              opacity: 0.25 + 0.75 * muncul * (on ? 1 : 0.75),
              translate: `0px ${(1 - muncul) * 20}px`,
            }}
          >
            <Braket warnaGaris={on ? warna.accent : warna.lineControl} />
            <div style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.accent }}>0{i + 1} //</div>
            <div style={{ fontFamily: huruf.stensil, fontSize: 31, letterSpacing: "0.04em", color: warna.ink, whiteSpace: "nowrap" }}>{k.judul.toUpperCase()}</div>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 22 }}>
              {k.isi.map((b, j) => {
                const m = interpolate(d, [mulai[i] + 0.3 + j * 0.5, mulai[i] + 0.6 + j * 0.5], [0, 1], klem);
                return (
                  <div key={b.teks} style={{ opacity: Math.max(0.15, m), whiteSpace: "nowrap" }}>
                    <div style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.ink3 }}>{b.jam} WIB</div>
                    <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 31, color: b.c ?? warna.ink }}>{b.teks}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </Bingkai>
  );
};
