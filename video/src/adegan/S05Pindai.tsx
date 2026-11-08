// Demo 1: pemindaian port (nmap) dan tebak kata sandi (hydra). Layar terbagi PENYERANG vs PERTAHANAN.
import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, desimal, detikDi, detikPenanda, detikSampel, dtg, kotakPenanda, terminal } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Rangkaian, dariJangkar, detikVideoUntuk } from "../komponen/Rangkaian";
import { Terminal } from "../komponen/Terminal";
import { ApaItu, Bunyi, ISI, Sisi } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "05-pindai";
const EP = R.video.analis.mulai;
const SRC = "rekaman/analis-desktop.mp4";
const T = { kiri: ISI.kiri, atas: ISI.atasDemo + 14, lebar: 640, tinggi: 700 };
const F = { kiri: 760, atas: ISI.atasDemo + 14, lebar: 1064, tinggi: 700 };
const RF = F.lebar / (F.tinggi - 44);

const NMAP = terminal("nmap-kodim-a");
const HYDRA = terminal("hydra-kodim-a");
const D_NMAP = detikDi(NMAP.mulai);
const D_INSIDEN = D_NMAP + R.ukur.nmapKeInsidenDiBerandaMs / 1000; // diukur dari frame video
const D_SIAGA = detikSampel((s) => /siaga:\s*siaga/i.test(s.siaga ?? "")) - 0.2;
const SITUASI = kotakPenanda("beranda-awal", "situasi");
const KARTU_INSIDEN = kotakPenanda("beranda-insiden-pertama", "insiden");
const BERANDA_KIRI = fokusMuat({ x: 312, y: 200, w: 1160, h: 760 }, RF, 0);
const BERANDA_LEBAR = fokusMuat({ x: 290, y: 100, w: 1590, h: 960 }, RF, 0);

// Bagian (detik adegan).
const B_ULANG = kalimatMulai(ID, 4) - 0.2; // "Apa yang dilakukan SENTRA": putar ulang momen nmap -> insiden, 1x
const B_HYDRA = kalimatMulai(ID, 6) - 0.3; // "Begitu percobaan login menumpuk"

// A: serangan berjalan; nmap dimulai saat narasi menyebut "memindai port".
const MULAI_A = D_NMAP - (pada(ID, "memindai port") - 0.1);
// B: ulangan 1x; insiden muncul tepat saat "insiden baru muncul" diucapkan.
const MULAI_B = D_INSIDEN - (pada(ID, "insiden baru muncul") - B_ULANG);
// C: hydra; Tingkat Siaga berubah saat "Tingkat Siaga naik" diucapkan. Gambar Beranda lalu ditahan
// sebelum analis pindah ke halaman Arus Event.
// Sampel layar terakhir yang masih di Beranda sebelum pindah ke Arus Event (penanda dicatat setelah halaman baru termuat).
const D_PINDAH = detikDi(R.sampel.analis.filter((x) => x.path === "/beranda" && detikDi(x.t) < detikPenanda("arus-event")).slice(-1)[0].t) - 0.4;
const POT_C = dariJangkar([{ footage: D_SIAGA - (pada(ID, "Tingkat Siaga naik") - B_HYDRA), adegan: 0 }, { footage: D_SIAGA, adegan: pada(ID, "Tingkat Siaga naik") - B_HYDRA }], Math.max(0, D_PINDAH - D_SIAGA));
POT_C.push({ mulai: Math.max(D_SIAGA, D_PINDAH), sampai: Math.max(D_SIAGA, D_PINDAH), tahan: 120 });

const Stopwatch: React.FC<{ epoch: number }> = ({ epoch }) => {
  const dt = Math.max(0, Math.min(epoch, NMAP.mulai + R.ukur.nmapKeInsidenDiBerandaMs) - NMAP.mulai) / 1000;
  const jalan = epoch >= NMAP.mulai;
  const selesai = epoch >= NMAP.mulai + R.ukur.nmapKeInsidenDiBerandaMs;
  const c = selesai ? warna.awas : warna.waspada;
  return (
    <div style={{ position: "absolute", right: 22, bottom: 22, padding: "12px 20px", backgroundColor: `${warna.canvas}F2`, border: `2px solid ${c}`, opacity: jalan ? 1 : 0.5, whiteSpace: "nowrap" }}>
      <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 20, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase" }}>Sejak nmap dimulai</div>
      <div style={{ fontFamily: huruf.stensil, fontSize: 64, lineHeight: 1, color: c }}>
        {desimal(dt, 1)} <span style={{ fontSize: 30 }}>DTK</span>
      </div>
      <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 22, color: selesai ? warna.awas : warna.ink2, textTransform: "uppercase" }}>{selesai ? "Insiden tampil" : "Menunggu…"}</div>
    </div>
  );
};

const Panel: React.FC<{ mulai: number; k?: number; ulang?: boolean; fokus: { x: number; y: number; w: number; h: number }; sorotSiaga?: boolean }> = ({ mulai, k = 1, ulang, fokus, sorotSiaga }) => {
  const { epoch } = useJam(mulai, k, EP);
  return (
    <>
      <Terminal ids={["nmap-kodim-a", "hydra-kodim-a"]} epoch={epoch} {...T} judul="Terminal penyerang · 172.30.0.66" saring={(t) => !/^Hydra v|^\[DATA\]|^\[WARNING\]/.test(t)} ukuranHuruf={19} />
      <Footage
        src={SRC}
        epochMulaiVideo={EP}
        mulai={mulai}
        kecepatan={k}
        {...F}
        label={ulang ? "Rekaman asli · diputar ulang 1×" : "Rekaman asli · Analis · Beranda"}
        fokus={[{ pada: 0, kotak: fokus }]}
        sorot={[
          { dari: D_INSIDEN - 0.1, sampai: D_INSIDEN + 40, kotak: KARTU_INSIDEN, label: "Insiden baru", warna: warna.awas, labelBawah: true },
          ...(sorotSiaga ? [{ dari: D_SIAGA - 0.1, sampai: D_SIAGA + 60, kotak: SITUASI, label: "Tingkat Siaga: Aman → Siaga", warna: warna.siaga }] : []),
        ]}
      >
        {ulang && <Stopwatch epoch={epoch} />}
      </Footage>
    </>
  );
};

export const S05Pindai: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const fr = (t: number) => Math.round(t * fps);
  // Waktu adegan untuk efek suara.
  const tNmapA = D_NMAP - MULAI_A;
  const tInsidenA = D_INSIDEN - MULAI_A;
  const tNmapB = B_ULANG + (D_NMAP - MULAI_B);
  const tInsidenB = B_ULANG + (D_INSIDEN - MULAI_B);
  const tHydraB = B_ULANG + (detikDi(HYDRA.mulai) - MULAI_B);
  const tSiaga = B_HYDRA + detikVideoUntuk(POT_C, D_SIAGA);
  const tutupUlang = interpolate(f / fps, [B_ULANG - 0.25, B_ULANG], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Bingkai
      id={ID}
      nomor="05"
      judul="Demo 1 · Pemindaian"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(NMAP.mulai)}
      tigaBagian={[kalimatMulai(ID, 2), kalimatMulai(ID, 4), kalimatMulai(ID, 7)]}
    >
      <Bunyi jenis="ketik-panjang" pada={tNmapA} />
      {tInsidenA < B_ULANG && <Bunyi jenis="bip" pada={tInsidenA} />}
      <Bunyi jenis="whoosh" pada={B_ULANG - 0.3} keras={0.6} />
      <Bunyi jenis="ketik-panjang" pada={tNmapB} />
      <Bunyi jenis="bip" pada={tInsidenB} />
      {tHydraB < B_HYDRA && <Bunyi jenis="ketik" pada={tHydraB} />}
      <Bunyi jenis="bip" pada={tSiaga} />

      <Sequence durationInFrames={fr(B_ULANG)} layout="none">
        <Panel mulai={MULAI_A} fokus={BERANDA_KIRI} />
      </Sequence>
      <Sequence from={fr(B_ULANG)} durationInFrames={fr(B_HYDRA) - fr(B_ULANG)} layout="none">
        <Panel mulai={MULAI_B} ulang fokus={BERANDA_KIRI} />
      </Sequence>
      <Sequence from={fr(B_HYDRA)} layout="none">
        <Rangkaian potongan={POT_C}>{(m, k) => <Panel mulai={m} k={k} fokus={BERANDA_LEBAR} sorotSiaga />}</Rangkaian>
      </Sequence>
      {/* Kilatan singkat saat pindah ke ulangan. */}
      {tutupUlang > 0 && tutupUlang < 1 && <div style={{ position: "absolute", left: F.kiri, top: F.atas, width: F.lebar, height: F.tinggi, backgroundColor: warna.canvas, opacity: tutupUlang * 0.8 }} />}

      <Sisi jenis="penyerang" {...T} />
      <Sisi jenis="pertahanan" {...F} />
      <ApaItu
        lebar={640}
        kartu={[
          { istilah: "Pemindaian port", isi: "Mengetuk semua “pintu” sebuah komputer untuk mencari yang terbuka.", dari: pada(ID, "memindai port") },
          { istilah: "Brute force", isi: "Menebak kata sandi berulang-ulang sampai cocok.", dari: pada(ID, "Lalu dengan hydra"), sampai: pada(ID, "Lalu dengan hydra") + 6.5 },
        ]}
      />
    </Bingkai>
  );
};
