import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, desimal, detikDi, detikPenanda, dtg, jamWib, penanda } from "../data";
import { BingkaiPonsel, Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Terminal } from "../komponen/Terminal";
import { Braket, Keterangan, Latar, Panel, useMuncul } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const EP = R.video.analis.mulai;
const EK = R.video.komandan.mulai;
const A = { kiri: 96, atas: 128, lebar: 980, tinggi: 560 };
const RA = A.lebar / (A.tinggi - 44);
const TERM = { kiri: 96, atas: 704, lebar: 980, tinggi: 170 };
const SKALA_HP = 0.9;

const T_SETUJU = R.ukur.waktuSetuju;
const T_PUTUS = T_SETUJU + R.ukur.portal.setujuKeGagalPertamaMs;

/** Penghitung detik ASLI sejak Komandan klik Setujui sampai permintaan penyerang pertama gagal. */
const Penghitung: React.FC<{ epoch: number }> = ({ epoch }) => {
  const sebelum = epoch < T_SETUJU;
  const putus = epoch >= T_PUTUS;
  const dt = Math.min(epoch, T_PUTUS) - T_SETUJU;
  const c = putus ? warna.awas : sebelum ? warna.ink3 : warna.waspada;
  return (
    <Panel nomor="03" kode="Waktu" style={{ left: 1520, top: 150, width: 304, height: 560 }} aksen={c}>
      <div style={{ padding: "22px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase" }}>
          Sejak klik Setujui
        </div>
        <div style={{ fontFamily: huruf.stensil, fontSize: 104, lineHeight: 1, color: c }}>{sebelum ? "0,00" : desimal(dt / 1000, 2)}</div>
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

const A6a = () => {
  const mulai = detikPenanda("panel-tindakan") - 0.6;
  const { epoch } = useJam(mulai, 1, EP);
  const mulaiK = detikDi(EP + mulai * 1000, "komandan");
  const pTindakan = penanda("panel-tindakan");
  const tEks = detikDi(T_SETUJU + R.ukur.setujuKeDieksekusiDiLayarAnalisMs);
  const kotakTindakan = pTindakan.kotak as { x: number; y: number; w: number; h: number };
  return (
    <>
      <Footage
        src="rekaman/analis-desktop.mp4"
        epochMulaiVideo={EP}
        mulai={mulai}
        {...A}
        label="Rekaman asli · Analis · desktop"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: 900, y: 80, w: 980, h: 600 }, RA, 0) }]}
        klik={[
          { pada: detikPenanda("pilih-durasi"), kotak: penanda("pilih-durasi").klik! },
          { pada: detikPenanda("usulkan"), kotak: penanda("usulkan").klik! },
        ]}
        sorot={[
          { dari: detikPenanda("usulkan") - 0.8, sampai: detikPenanda("usulan-terkirim") + 2.5, kotak: penanda("usulkan").klik!, label: "Analis: usulkan blokir", labelBawah: true },
          { dari: tEks - 0.2, sampai: mulai + 30, kotak: { x: kotakTindakan.x + 10, y: 420, w: kotakTindakan.w - 20, h: 200 }, label: "Dieksekusi di 2 agent", warna: warna.aman },
        ]}
      />
      <Terminal ids={["akses-portal"]} epoch={epoch} {...TERM} judul="Terminal penyerang · membuka portal Kodim A tiap 0,5 dtk" tampilkanPerintah={false} ukuranHuruf={20} />
      <BingkaiPonsel kiri={1100} atas={150} skala={SKALA_HP} label="Rekaman asli · HP Komandan">
        <Footage
          src="rekaman/komandan-hp.mp4"
          epochMulaiVideo={EK}
          mulai={mulaiK}
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
            { pada: detikPenanda("setujui", "komandan") + 1, kotak: penanda("setujui").klik! },
          ]}
          sorot={[
            { dari: detikPenanda("antrean", "komandan") - 0.3, sampai: detikPenanda("setujui", "komandan") + 0.6, kotak: { x: 17, y: 351, w: 356, h: 200 }, label: "Usulan masuk", labelBawah: true },
            { dari: detikPenanda("setujui", "komandan") + 0.2, sampai: detikPenanda("disetujui", "komandan") + 2, kotak: penanda("setujui").klik!, label: "Setujui", warna: warna.aman },
          ]}
        />
      </BingkaiPonsel>
      <Penghitung epoch={epoch} />
    </>
  );
};

const LANGKAH = (() => {
  const t = R.db as unknown as { tindakan: { jenis: string; pengusul: string; pemutus: string; diusulkan: string; disetujui: string; dieksekusi: string; hasil: { message: string } }[] };
  const b = t.tindakan.find((x) => x.jenis === "block_ip")!;
  const wib = (s: string) => `${jamWib(Date.parse(s.replace(" ", "T") + "Z"))} WIB`;
  return [
    { siapa: "Analis", akun: b.pengusul, aksi: "Mengusulkan blokir", waktu: wib(b.diusulkan), c: warna.accent },
    { siapa: "Komandan", akun: b.pemutus, aksi: "Menyetujui dari HP", waktu: wib(b.disetujui), c: warna.aman },
    { siapa: "Agent", akun: "kodim-a · plc-sim", aksi: b.hasil.message, waktu: wib(b.dieksekusi), c: warna.awas },
  ];
})();

// Jeda nyata antar langkah (dari kolom waktu tindakan di basis data, presisi detik).
const JEDA = (() => {
  const b = R.db.tindakan.find((x) => x.jenis === "block_ip")!;
  const ms = (s: string) => Date.parse(s.replace(" ", "T") + "Z");
  return [
    { dtk: `${Math.round((ms(b.disetujui) - ms(b.diusulkan)) / 1000)} dtk`, ket: "usul → keputusan Komandan" },
    { dtk: `${Math.round((ms(b.dieksekusi) - ms(b.disetujui)) / 1000)} dtk`, ket: "keputusan → blokir aktif di agent" },
  ];
})();

const A6b = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const bawah = useMuncul(3.6, 0.4);
  return (
    <div style={{ position: "absolute", left: 96, right: 96, top: 170, display: "flex", flexDirection: "column", gap: 34 }}>
      <div style={{ display: "flex", gap: 30 }}>
        {LANGKAH.map((l, i) => {
          const o = interpolate(d, [0.2 + i * 0.8, 0.6 + i * 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={l.siapa} style={{ position: "relative", flex: 1, padding: "26px 28px", backgroundColor: warna.panel, border: `1px solid ${warna.lineStrong}`, borderTop: `8px solid ${l.c}`, opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
              <Braket warnaGaris={l.c} />
              <div style={{ fontFamily: huruf.mono, fontSize: 26, color: l.c }}>0{i + 1} // {l.waktu}</div>
              <div style={{ marginTop: 10, fontFamily: huruf.stensil, fontSize: 50, color: warna.ink }}>{l.siapa.toUpperCase()}</div>
              <div style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.ink3 }}>{l.akun}</div>
              <div style={{ marginTop: 16, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 34, lineHeight: 1.2, color: warna.ink2 }}>{l.aksi}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 60, opacity: interpolate(d, [2.6, 3.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        {JEDA.map((j) => (
          <div key={j.ket} style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontFamily: huruf.stensil, fontSize: 72, color: warna.accent }}>{j.dtk}</span>
            <span style={{ fontFamily: huruf.kondensasi, fontSize: 32, color: warna.ink2 }}>{j.ket}</span>
          </div>
        ))}
      </div>
      <div style={{ opacity: bawah, textAlign: "center", fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 36, color: warna.ink2 }}>
        Perintah hanya dari daftar tetap (block_ip, unblock_ip, run_test). Setiap langkah tercatat di audit log berantai.
      </div>
    </div>
  );
};

const BagianB: React.FC<{ durasi: number }> = ({ durasi }) => {
  const masuk = useMuncul(0, 0.25);
  return (
    <AbsoluteFill style={{ opacity: masuk }}>
      <Latar />
      <A6b />
      <Keterangan
        items={[{ dari: 0.3, sampai: durasi - 0.2, teks: "Two-person rule: yang mengusulkan tidak bisa menyetujui sendiri. Komandan memutuskan, agent mengeksekusi." }]}
      />
    </AbsoluteFill>
  );
};

export const A06Respons: React.FC<{ durasi: number }> = ({ durasi }) => {
  const { fps } = useVideoConfig();
  const a = 24.4;
  return (
    <Bingkai
      nomor="06"
      judul="Respons berjenjang"
      durasi={durasi}
      dataLatihan
      dtgTeks={dtg(T_SETUJU)}
      posisiKeterangan={{ kiri: 96, lebar: 1000, bawah: 40 }}
      keterangan={[
        { dari: 0.4, sampai: 7.5, teks: "Analis mengusulkan blokir 172.30.0.66 selama 1 jam. Penyerang masih tersambung." },
        { dari: 7.5, sampai: 18.5, teks: "Usulan masuk Antrean Persetujuan di HP Komandan." },
        { dari: 18.5, sampai: a, teks: `Komandan menyetujui. ${desimal(R.ukur.portal.setujuKeGagalPertamaMs / 1000, 2)} detik kemudian koneksi penyerang terputus.` },
      ]}
    >
      <Sequence durationInFrames={Math.round(a * fps)} layout="none">
        <A6a />
      </Sequence>
      <Sequence from={Math.round(a * fps)} layout="none">
        <BagianB durasi={durasi - a} />
      </Sequence>
    </Bingkai>
  );
};
