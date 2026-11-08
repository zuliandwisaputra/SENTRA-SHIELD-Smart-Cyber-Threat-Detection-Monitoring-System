import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, desimal, detikDi, detikPenanda, dtg, jamWib, penanda } from "../data";
import { kata, teksNarasi } from "../data/narasi";
import { BingkaiPonsel, Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Rangkaian } from "../komponen/Rangkaian";
import { Terminal } from "../komponen/Terminal";
import { Braket, Panel } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "06-respons";
const EP = R.video.analis.mulai;
const EK = R.video.komandan.mulai;
const A = { kiri: 96, atas: 128, lebar: 980, tinggi: 520 };
const RA = A.lebar / (A.tinggi - 44);
const TERM = { kiri: 96, atas: 664, lebar: 980, tinggi: 210 };
const SKALA_HP = 0.9;

const T_SETUJU = R.ukur.waktuSetuju;
const T_PUTUS = T_SETUJU + R.ukur.portal.setujuKeGagalPertamaMs;

// Rangkaian footage: usulan Analis 2x, navigasi Komandan sampai klik Setujui 6x,
// lalu 1x sejak klik Setujui agar penghitung dan terminal berjalan dengan waktu asli.
const MULAI = detikPenanda("panel-tindakan") - 0.6;
const T_USUL = detikPenanda("usulkan");
const T_SETUJU_DTK = detikDi(T_SETUJU);
const POTONGAN = [
  { mulai: MULAI, sampai: T_USUL, kecepatan: 2 },
  { mulai: T_USUL, sampai: T_SETUJU_DTK - 0.1, kecepatan: 6 },
  { mulai: T_SETUJU_DTK - 0.1, sampai: T_SETUJU_DTK + 30, kecepatan: 1 },
];

// Detik adegan untuk ucapan.
const T_ATURAN = [kata(ID, 10) - 0.25, kata(ID, 19) - 0.4]; // "Pengusul tidak bisa menyetujui ... rantai komando"
const T_ANGKA = kata(ID, 19) - 0.2; // "Hanya 2,46 detik setelah disetujui ..."

/** Penghitung detik ASLI sejak Komandan klik Setujui sampai permintaan penyerang pertama gagal. */
const Penghitung: React.FC<{ epoch: number; sorot: number }> = ({ epoch, sorot }) => {
  const sebelum = epoch < T_SETUJU;
  const putus = epoch >= T_PUTUS;
  const dt = Math.min(epoch, T_PUTUS) - T_SETUJU;
  const c = putus ? warna.awas : sebelum ? warna.ink3 : warna.waspada;
  return (
    <Panel
      nomor="03"
      kode="Waktu"
      style={{ left: 1520, top: 150, width: 304, height: 560, boxShadow: sorot > 0 ? `0 0 ${40 * sorot}px ${warna.awas}, 0 0 0 ${4 * sorot}px ${warna.awas}` : undefined }}
      aksen={c}
    >
      <div style={{ padding: "22px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase" }}>Sejak klik Setujui</div>
        <div style={{ fontFamily: huruf.stensil, fontSize: 104, lineHeight: 1, color: c, scale: `${1 + 0.08 * sorot}`, transformOrigin: "left center" }}>{sebelum ? "0,00" : desimal(dt / 1000, 2)}</div>
        <div style={{ fontFamily: huruf.stensil, fontSize: 34, color: c }}>DETIK</div>
        <div style={{ marginTop: 14, fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 30, lineHeight: 1.15, color: putus ? warna.awas : warna.ink2, textTransform: "uppercase" }}>
          {putus ? "Penyerang terputus" : sebelum ? "Menunggu keputusan" : "Perintah ke agent…"}
        </div>
        {putus && (
          <div style={{ fontFamily: huruf.kondensasi, fontSize: 22, color: warna.ink3, lineHeight: 1.25 }}>
            Diukur dari jam di terminal penyerang. Sukses terakhir {desimal(R.ukur.portal.setujuKeSuksesTerakhirMs / 1000, 2)} dtk.
          </div>
        )}
      </div>
    </Panel>
  );
};

// Tiga langkah dengan waktu asli dari basis data (presisi detik).
const LANGKAH = (() => {
  const b = R.db.tindakan.find((x) => x.jenis === "block_ip")!;
  const wib = (s: string) => `${jamWib(Date.parse(s.replace(" ", "T") + "Z"))} WIB`;
  return [
    { siapa: "Analis", aksi: "mengusulkan", waktu: wib(b.diusulkan), c: warna.accent },
    { siapa: "Komandan", aksi: "menyetujui (HP)", waktu: wib(b.disetujui), c: warna.aman },
    { siapa: "Agent", aksi: "memblokir (nftables)", waktu: wib(b.dieksekusi), c: warna.awas },
  ];
})();

const AturanDuaOrang: React.FC<{ o: number }> = ({ o }) => (
  <div style={{ position: "absolute", left: A.kiri, top: A.atas, width: A.lebar, height: A.tinggi, opacity: o, backgroundColor: `${warna.canvas}F2`, border: `1px solid ${warna.lineStrong}`, padding: "34px 36px" }}>
    <Braket warnaGaris={warna.aman} />
    <div style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.aman }}>TWO-PERSON RULE //</div>
    <div style={{ fontFamily: huruf.stensil, fontSize: 44, color: warna.ink, marginTop: 6 }}>PENGUSUL ≠ PEMUTUS</div>
    <div style={{ display: "flex", gap: 18, marginTop: 34 }}>
      {LANGKAH.map((l, i) => (
        <div key={l.siapa} style={{ flex: 1, padding: "18px 20px", backgroundColor: warna.panel, borderTop: `6px solid ${l.c}` }}>
          <div style={{ fontFamily: huruf.mono, fontSize: 22, color: l.c }}>
            0{i + 1} // {l.waktu}
          </div>
          <div style={{ fontFamily: huruf.stensil, fontSize: 38, color: warna.ink, marginTop: 6 }}>{l.siapa.toUpperCase()}</div>
          <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 30, color: warna.ink2 }}>{l.aksi}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 30, fontFamily: huruf.kondensasi, fontSize: 28, color: warna.ink2 }}>Setiap langkah tercatat di audit log berantai.</div>
  </div>
);

const Isi: React.FC<{ mulai: number; k: number; detikAdeganAwal: number }> = ({ mulai, k, detikAdeganAwal }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = detikAdeganAwal + f / fps; // detik adegan
  const { epoch } = useJam(mulai, k, EP);
  const mulaiK = detikDi(EP + mulai * 1000, "komandan");
  const tEks = detikDi(T_SETUJU + R.ukur.setujuKeDieksekusiDiLayarAnalisMs);
  const kotakTindakan = penanda("panel-tindakan").kotak as { x: number; y: number; w: number; h: number };
  const aturan = interpolate(d, [T_ATURAN[0], T_ATURAN[0] + 0.3, T_ATURAN[1] - 0.3, T_ATURAN[1]], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sorotAngka = interpolate(d, [T_ANGKA, T_ANGKA + 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Footage
        src="rekaman/analis-desktop.mp4"
        epochMulaiVideo={EP}
        mulai={mulai}
        kecepatan={k}
        {...A}
        label="Rekaman asli · Analis · desktop"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: 900, y: 80, w: 980, h: 600 }, RA, 0) }]}
        klik={[
          { pada: detikPenanda("pilih-durasi"), kotak: penanda("pilih-durasi").klik! },
          { pada: detikPenanda("usulkan"), kotak: penanda("usulkan").klik! },
        ]}
        sorot={[
          { dari: detikPenanda("usulkan") - 1.2, sampai: detikPenanda("usulan-terkirim") + 3, kotak: penanda("usulkan").klik!, label: "Analis: usulkan blokir", labelBawah: true },
          { dari: tEks - 0.2, sampai: mulai + 40, kotak: { x: kotakTindakan.x + 10, y: 420, w: kotakTindakan.w - 20, h: 200 }, label: "Dieksekusi di 2 agent", warna: warna.aman },
        ]}
      />
      <AturanDuaOrang o={aturan} />
      <Terminal ids={["akses-portal"]} epoch={epoch} {...TERM} judul="Terminal penyerang · membuka portal Kodim A tiap 0,5 dtk" tampilkanPerintah={false} ukuranHuruf={20} />
      {sorotAngka > 0 && (
        <div
          style={{
            position: "absolute",
            left: TERM.kiri - 4,
            top: TERM.atas - 4,
            width: TERM.lebar + 8,
            height: TERM.tinggi + 8,
            border: `4px solid ${warna.awas}`,
            boxShadow: `0 0 36px ${warna.awas}`,
            opacity: sorotAngka,
          }}
        />
      )}
      <BingkaiPonsel kiri={1100} atas={150} skala={SKALA_HP} label={k > 1 ? `HP Komandan · dipercepat ${String(k).replace(".", ",")}×` : "Rekaman asli · HP Komandan"}>
        <Footage
          src="rekaman/komandan-hp.mp4"
          epochMulaiVideo={EK}
          mulai={mulaiK}
          kecepatan={k}
          kiri={0}
          atas={0}
          lebar={390 * SKALA_HP}
          tinggi={844 * SKALA_HP}
          sumber={{ w: 390, h: 844 }}
          tanpaKepala
          label=""
          klik={[
            { pada: detikPenanda("hp-antrean-laci", "komandan"), kotak: penanda("hp-antrean-laci").klik! },
            { pada: detikPenanda("hp-antrean", "komandan"), kotak: penanda("hp-antrean").klik! },
            { pada: detikDi(T_SETUJU, "komandan"), kotak: penanda("setujui").klik! },
          ]}
          sorot={[
            { dari: detikPenanda("antrean", "komandan") - 0.3, sampai: detikDi(T_SETUJU, "komandan") - 0.6, kotak: { x: 17, y: 351, w: 356, h: 200 }, label: "Usulan masuk", labelBawah: true },
            { dari: detikDi(T_SETUJU, "komandan") - 0.6, sampai: detikDi(T_SETUJU, "komandan") + 2.5, kotak: penanda("setujui").klik!, label: "Setujui", warna: warna.aman },
          ]}
        />
      </BingkaiPonsel>
      <Penghitung epoch={epoch} sorot={sorotAngka} />
    </>
  );
};

export const A06Respons: React.FC<{ durasi: number }> = ({ durasi }) => {
  // Detik adegan saat tiap potongan mulai (untuk overlay yang mengikuti narasi).
  const awal: number[] = [];
  let t = 0;
  for (const p of POTONGAN) {
    awal.push(t);
    t += (p.sampai - p.mulai) / p.kecepatan;
  }
  return (
    <Bingkai
      nomor="06"
      judul="Respons berjenjang"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(T_SETUJU)}
      posisiKeterangan={{ kiri: 96, lebar: 1000, bawah: 40 }}
      keterangan={teksNarasi(ID, [
        [0, "Sekarang, respons."],
        [2, "Analis mengusulkan blokir,"],
        [5, "lalu Komandan menyetujui dari HP."],
        [10, "Pengusul tidak bisa menyetujui usulannya sendiri, sesuai rantai komando."],
        [19, "Hanya 2,46 detik setelah disetujui,"],
        [25, "koneksi penyerang benar-benar terputus."],
      ])}
    >
      <Rangkaian potongan={POTONGAN}>{(mulai, k) => <Isi mulai={mulai} k={k} detikAdeganAwal={awal[POTONGAN.findIndex((p) => p.mulai === mulai)]} />}</Rangkaian>
    </Bingkai>
  );
};
