// Demo 7: respons berjenjang (momen kunci). Kiri PENYERANG: terminal asli yang membuka portal tiap 0,5 dtk.
// Kanan PERTAHANAN: Analis mengusulkan (desktop) dan Komandan menyetujui (HP), lalu TERPUTUS ditahan dan diperbesar.
import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, barisTerminal, desimal, detikDi, detikPenanda, dtg, jamWib, penanda } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { BingkaiPonsel, Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Rangkaian, dariJangkar, detikVideoUntuk } from "../komponen/Rangkaian";
import { Terminal } from "../komponen/Terminal";
import { Braket, Chip, EASE, Panel } from "../komponen/dasar";
import { ApaItu, Bunyi, ISI, Sisi } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "11-respons";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EP = R.video.analis.mulai;
const EK = R.video.komandan.mulai;
const ATAS = ISI.atasDemo + 14;
const TERM = { kiri: ISI.kiri, atas: ATAS, lebar: 640, tinggi: 430 };
const WAKTU = { kiri: ISI.kiri, atas: ATAS + 446, lebar: 640, tinggi: 254 };
const AN = { kiri: 760, atas: ATAS, lebar: 690, tinggi: 700 };
const RAN = AN.lebar / (AN.tinggi - 44);
const SKALA_HP = 0.775;
const HP = { kiri: 1470, atas: ATAS };

const T_SETUJU = R.ukur.waktuSetuju;
const T_PUTUS = T_SETUJU + R.ukur.portal.setujuKeGagalPertamaMs;
const D_SETUJU = detikDi(T_SETUJU);
const D_USUL = detikPenanda("usulkan");
const D_ANTREAN = detikDi(penanda("antrean").t);
const BARIS_PUTUS = barisTerminal("akses-portal", /kode 000/).teks;

// Bagian (detik adegan).
const B_TAHAN = kalimatMulai(ID, 6) - 0.2; // "3,19 detik setelah tombol Setujui ditekan" : gambar ditahan
const B_DAFTAR = kalimatMulai(ID, 7) - 0.2; // daftar perintah tetap
const B_ATURAN = kalimatMulai(ID, 8) - 0.2; // dua orang

// Footage: usulan Analis, usulan masuk HP, klik Setujui, lalu 1x sampai terputus.
const POT = dariJangkar(
  [
    { footage: D_USUL - 2.2, adegan: 0 },
    { footage: D_USUL, adegan: pada(ID, "mengusulkan blokir") },
    { footage: D_ANTREAN, adegan: pada(ID, "Usulan masuk") + 0.2 },
    { footage: D_SETUJU, adegan: pada(ID, "Komandan menyetujui") + 0.45 },
    { footage: detikDi(T_PUTUS) + 0.35, adegan: B_TAHAN },
  ],
  0,
);
const T_PUTUS_ADEGAN = detikVideoUntuk(POT, detikDi(T_PUTUS));

const LANGKAH = (() => {
  const b = R.db.tindakan.find((x) => x.jenis === "block_ip")!;
  const wib = (s: string) => `${jamWib(Date.parse(s.replace(" ", "T") + "Z"))} WIB`;
  return [
    { siapa: "Analis", aksi: "mengusulkan", waktu: wib(b.diusulkan), c: warna.accent },
    { siapa: "Komandan", aksi: "menyetujui (HP)", waktu: wib(b.disetujui), c: warna.aman },
    { siapa: "Agent", aksi: "memblokir (nftables)", waktu: wib(b.dieksekusi), c: warna.awas },
  ];
})();

/** Penghitung detik ASLI sejak Komandan klik Setujui sampai permintaan penyerang pertama gagal. */
const Penghitung: React.FC<{ epoch: number }> = ({ epoch }) => {
  const sebelum = epoch < T_SETUJU;
  const putus = epoch >= T_PUTUS;
  const dt = Math.min(epoch, T_PUTUS) - T_SETUJU;
  const c = putus ? warna.awas : sebelum ? warna.ink3 : warna.waspada;
  return (
    <Panel nomor="03" kode="Waktu" judul="sejak klik Setujui" style={{ left: WAKTU.kiri, top: WAKTU.atas, width: WAKTU.lebar, height: WAKTU.tinggi }} aksen={c}>
      <div style={{ padding: "14px 26px", display: "flex", alignItems: "center", gap: 28, whiteSpace: "nowrap" }}>
        <div style={{ fontFamily: huruf.stensil, fontSize: 110, lineHeight: 1, color: c }}>{sebelum ? "0,00" : desimal(dt / 1000, 2)}</div>
        <div>
          <div style={{ fontFamily: huruf.stensil, fontSize: 36, color: c }}>DETIK</div>
          <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 30, color: putus ? warna.awas : warna.ink2, textTransform: "uppercase" }}>
            {putus ? "Penyerang terputus" : sebelum ? "Menunggu keputusan" : "Perintah ke agent…"}
          </div>
          <div style={{ fontFamily: huruf.kondensasi, fontSize: 22, color: warna.ink3 }}>diukur dari jam di terminal penyerang</div>
        </div>
      </div>
    </Panel>
  );
};

const Isi: React.FC<{ mulai: number; k: number }> = ({ mulai, k }) => {
  const { epoch } = useJam(mulai, k, EP);
  const mulaiK = detikDi(EP + mulai * 1000, "komandan");
  const kotakTindakan = penanda("usulan-terkirim").kotak as unknown as { tindakan: { x: number; y: number; w: number; h: number } };
  const tEks = detikDi(T_SETUJU + R.ukur.setujuKeDieksekusiDiLayarAnalisMs);
  return (
    <>
      <Terminal ids={["akses-portal"]} epoch={epoch} {...TERM} judul="Penyerang · buka portal tiap 0,5 dtk" tampilkanPerintah={false} ukuranHuruf={16} />
      <Penghitung epoch={epoch} />
      <Footage
        src="rekaman/analis-desktop.mp4"
        epochMulaiVideo={EP}
        mulai={mulai}
        kecepatan={k}
        {...AN}
        label="Rekaman asli · Analis"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: kotakTindakan.tindakan.x - 30, y: 80, w: kotakTindakan.tindakan.w + 60, h: 700 }, RAN, 0) }]}
        klik={[
          { pada: detikPenanda("pilih-durasi"), kotak: penanda("pilih-durasi").klik! },
          { pada: D_USUL, kotak: penanda("usulkan").klik! },
        ]}
        sorot={[
          { dari: D_USUL - 1.2, sampai: D_USUL + 3, kotak: penanda("usulkan").klik!, label: "Usulkan blokir", labelBawah: true },
          { dari: tEks - 0.2, sampai: mulai + 900, kotak: { x: kotakTindakan.tindakan.x + 10, y: 420, w: kotakTindakan.tindakan.w - 20, h: 200 }, label: "Dieksekusi di agent", warna: warna.aman },
        ]}
      />
      <BingkaiPonsel kiri={HP.kiri} atas={HP.atas} skala={SKALA_HP}>
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
            { dari: detikDi(penanda("antrean").t, "komandan") - 0.2, sampai: detikDi(T_SETUJU, "komandan") - 0.8, kotak: { x: 14, y: 276, w: 362, h: 128 }, label: "Usulan masuk", labelBawah: true },
            { dari: detikDi(T_SETUJU, "komandan") - 0.8, sampai: detikDi(T_SETUJU, "komandan") + 2.5, kotak: penanda("setujui").klik!, label: "Setujui", warna: warna.aman },
          ]}
        />
      </BingkaiPonsel>
      <div style={{ position: "absolute", left: HP.kiri, top: HP.atas - 4, width: 390 * SKALA_HP + 32, display: "flex", justifyContent: "center" }}>
        <Chip warnaLatar={warna.raised} warnaTeks={warna.ink2} style={{ fontSize: 17, padding: "3px 10px" }}>
          {k > 1 ? `HP Komandan · dipercepat ${String(k).replace(".", ",")}×` : "Rekaman asli · HP Komandan"}
        </Chip>
      </div>
    </>
  );
};

/** Saat ditahan: baris merah di terminal diperbesar seperti kaca pembesar. */
const Pembesar: React.FC<{ o: number }> = ({ o }) => (
  <div style={{ position: "absolute", left: TERM.kiri - 10, top: TERM.atas + 150, width: 1060, opacity: o, scale: `${0.85 + 0.15 * o}`, transformOrigin: "left center" }}>
    <div style={{ padding: "18px 24px", backgroundColor: "#0A0C07", border: `4px solid ${warna.awas}`, boxShadow: `0 0 50px ${warna.awas}88, 0 20px 60px rgba(0,0,0,0.7)` }}>
      <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase" }}>Baris asli di terminal penyerang</div>
      <div style={{ marginTop: 8, fontFamily: huruf.mono, fontSize: 30, color: warna.awas, fontWeight: 700, whiteSpace: "nowrap" }}>{BARIS_PUTUS}</div>
    </div>
  </div>
);

const DaftarTetap: React.FC<{ o: number }> = ({ o }) => (
  <div style={{ position: "absolute", left: AN.kiri, top: AN.atas, width: AN.lebar, height: AN.tinggi, opacity: o, backgroundColor: `${warna.canvas}F2`, border: `1px solid ${warna.lineStrong}`, padding: "30px 34px" }}>
    <Braket warnaGaris={warna.accent} />
    <div style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.accent }}>DAFTAR TETAP //</div>
    <div style={{ fontFamily: huruf.stensil, fontSize: 40, color: warna.ink, marginTop: 6 }}>PERINTAH KE AGENT</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 30 }}>
      {[
        { k: "block_ip", isi: "blokir IP penyerang" },
        { k: "unblock_ip", isi: "buka blokir" },
        { k: "run_test", isi: "uji kesiapan (aman)" },
      ].map((x) => (
        <div key={x.k} style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 20px", backgroundColor: warna.panel, borderLeft: `6px solid ${warna.accent}`, whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: huruf.mono, fontSize: 30, color: warna.accent, width: 210 }}>{x.k}</span>
          <span style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 30, color: warna.ink }}>{x.isi}</span>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 26, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 28, color: warna.ink2 }}>Di luar daftar ini, agent menolak perintah.</div>
  </div>
);

const AturanDuaOrang: React.FC<{ o: number }> = ({ o }) => (
  <div style={{ position: "absolute", left: AN.kiri, top: AN.atas, width: 1064, height: AN.tinggi, opacity: o, backgroundColor: `${warna.canvas}F2`, border: `1px solid ${warna.lineStrong}`, padding: "30px 34px" }}>
    <Braket warnaGaris={warna.aman} />
    <div style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.aman }}>RANTAI KOMANDO //</div>
    <div style={{ fontFamily: huruf.stensil, fontSize: 44, color: warna.ink, marginTop: 6 }}>PENGUSUL ≠ PEMUTUS</div>
    <div style={{ display: "flex", gap: 18, marginTop: 34 }}>
      {LANGKAH.map((l, i) => (
        <div key={l.siapa} style={{ flex: 1, padding: "18px 20px", backgroundColor: warna.panel, borderTop: `6px solid ${l.c}`, whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: huruf.mono, fontSize: 21, color: l.c }}>0{i + 1} // {l.waktu}</div>
          <div style={{ fontFamily: huruf.stensil, fontSize: 38, color: warna.ink, marginTop: 6 }}>{l.siapa.toUpperCase()}</div>
          <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 28, color: warna.ink2 }}>{l.aksi}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 30, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 30, color: warna.ink2 }}>Setiap langkah tercatat di buku jaga (audit log).</div>
  </div>
);

export const S11Respons: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const fr = (t: number) => Math.round(t * fps);
  const o = (t: number, lama = 0.4) => interpolate(d, [t, t + lama], [0, 1], { ...klem, easing: EASE });
  const ke = (t: number) => detikVideoUntuk(POT, t);
  const lamaPot = POT.reduce((a, x) => a + (x.tahan ?? (x.sampai - x.mulai) / (x.kecepatan ?? 1)), 0);
  const tahanMulai = POT[POT.length - 1].sampai;
  return (
    <Bingkai id={ID} nomor="11" judul="Demo 7 · Respons" durasi={durasi} dataLatihan dtgTeks={dtg(T_SETUJU)} tigaBagian={[kalimatMulai(ID, 1), kalimatMulai(ID, 4), kalimatMulai(ID, 8)]}>
      <Bunyi jenis="klik" pada={ke(D_USUL)} />
      <Bunyi jenis="bip" pada={ke(D_ANTREAN)} />
      <Bunyi jenis="klik" pada={ke(D_SETUJU)} />
      <Bunyi jenis="putus" pada={T_PUTUS_ADEGAN} />
      <Bunyi jenis="whoosh" pada={B_DAFTAR - 0.1} keras={0.6} />
      <Bunyi jenis="stempel" pada={B_ATURAN + 0.2} keras={0.8} />

      <Sequence durationInFrames={fr(lamaPot)} layout="none">
        <Rangkaian potongan={POT}>{(m, k) => <Isi mulai={m} k={k} />}</Rangkaian>
      </Sequence>
      {/* Setelah TERPUTUS: semua gambar ditahan di detik putus. */}
      <Sequence from={fr(lamaPot)} layout="none">
        <Rangkaian potongan={[{ mulai: tahanMulai, sampai: tahanMulai, tahan: 120 }]}>{(m, k) => <Isi mulai={m} k={k} />}</Rangkaian>
      </Sequence>
      <Sisi jenis="penyerang" kiri={TERM.kiri} atas={TERM.atas} lebar={TERM.lebar} tinggi={WAKTU.atas + WAKTU.tinggi - TERM.atas} />
      <Sisi jenis="pertahanan" kiri={AN.kiri} atas={AN.atas} lebar={HP.kiri + 390 * SKALA_HP + 32 - AN.kiri} tinggi={AN.tinggi} />
      <Pembesar o={interpolate(d, [B_TAHAN, B_TAHAN + 0.4, B_DAFTAR - 0.3, B_DAFTAR], [0, 1, 1, 0], klem)} />
      <DaftarTetap o={interpolate(d, [B_DAFTAR, B_DAFTAR + 0.4, B_ATURAN - 0.3, B_ATURAN], [0, 1, 1, 0], klem)} />
      <AturanDuaOrang o={o(B_ATURAN)} />
      <ApaItu kiri={AN.kiri + 10} lebar={AN.lebar - 20} kartu={[{ istilah: "nftables", isi: "Firewall bawaan Linux tempat agent memasang aturan blokir.", dari: pada(ID, "firewall nftables") - 0.2, sampai: pada(ID, "firewall nftables") + 5.5 }]} />
    </Bingkai>
  );
};
