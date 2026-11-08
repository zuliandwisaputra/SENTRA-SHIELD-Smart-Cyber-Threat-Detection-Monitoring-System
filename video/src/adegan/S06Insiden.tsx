// Demo 2: satu insiden, satu cerita. Tangkapan layar asli Detail Insiden (diperbesar pelan, momen kunci).
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, dtg, kotakPenanda, penanda, ribuan } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { Footage, fokusMuat } from "../komponen/Footage";
import { Braket, Panel } from "../komponen/dasar";
import { ApaItu, Bunyi, ISI } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "06-insiden";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FL = { kiri: ISI.kiri, atas: ISI.atasDemo + 14, lebar: 1224, tinggi: 700 };
const RFL = FL.lebar / (FL.tinggi - 44);
const KANAN = { kiri: 1344, atas: ISI.atasDemo + 14, lebar: 480, tinggi: 700 };

// Angka asli: event dari penyerang ke Kodim A sampai brute force selesai (firewall + SSH).
const EV = R.db.eventPenyerangPerSumber.filter((x) => x.satuan === "KODIM-LAT-A" && (x.sumber === "firewall" || x.sumber === "ssh"));
const EV_TOTAL = EV.reduce((a, x) => a + x.jumlah, 0);

const TAHAP = [
  { k: "Pengintaian", awam: "mengintai", tercapai: true, t: () => pada(ID, "mengintai") },
  { k: "Akses awal", awam: "masuk", tercapai: true, t: () => pada(ID, "masuk") },
  { k: "Eksekusi / persistensi", awam: "bertahan", tercapai: false, t: () => pada(ID, "bertahan") },
  { k: "Dampak", awam: "merusak", tercapai: false, t: () => pada(ID, "merusak") },
];
// Teknik yang tampil di tangkapan layar (kode dan nama sesuai Core).
const TEKNIK = [
  { kode: "T1046", nama: "Network Service Discovery", awam: "pemindaian port" },
  { kode: "T1110.001", nama: "Password Guessing", awam: "tebak kata sandi" },
  { kode: "T1078", nama: "Valid Accounts", awam: "login berhasil" },
];

const halaman = fokusMuat({ x: 290, y: 90, w: 1600, h: 790 }, RFL, 0);
const alur = fokusMuat({ x: 326, y: 345, w: 1532, h: 520 }, RFL, 0);
const kartuTeknik = fokusMuat({ x: 345, y: 548, w: 745, h: 300 }, RFL, 16);

export const S06Insiden: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const o = (t: number, lama = 0.4) => interpolate(d, [t, t + lama], [0, 1], klem);
  const tHitung = kalimatMulai(ID, 0) + 0.3;
  const tSatu = pada(ID, "dirangkum menjadi satu insiden");
  const tCerita = kalimatMulai(ID, 1) - 0.2;
  const tMitre = pada(ID, "MITRE ATT&CK") - 0.2;
  const tPenting = kalimatMulai(ID, 4) - 0.2;
  const hitung = interpolate(d, [tHitung, tSatu - 0.3], [0, 1], klem);
  const bagian = d < tCerita ? 0 : d < tMitre - 0.6 ? 1 : 2;
  const skor = kotakPenanda("detail-insiden-awal", "skor");
  return (
    <Bingkai id={ID} nomor="06" judul="Demo 2 · Satu insiden" durasi={durasi} dataLatihan dtgTeks={dtg(penanda("detail-insiden-awal").t)} tigaBagian={[null, kalimatMulai(ID, 0), kalimatMulai(ID, 4)]}>
      <Bunyi jenis="ketik-panjang" pada={tHitung} keras={0.8} />
      <Bunyi jenis="stempel" pada={tSatu} keras={0.8} />
      <Bunyi jenis="whoosh" pada={tCerita} keras={0.6} />
      {TAHAP.map((x) => (
        <Bunyi key={x.k} jenis="klik" pada={x.t() - 0.05} keras={0.8} />
      ))}
      <Bunyi jenis="klik" pada={tMitre + 0.3} />
      <Bunyi jenis="whoosh" pada={tPenting} keras={0.6} />

      <Footage
        src="rekaman/stills/09-insiden-awal.png"
        gambar
        epochMulaiVideo={penanda("detail-insiden-awal").t}
        mulai={0}
        {...FL}
        label="Tangkapan layar asli · Detail Insiden"
        fokus={[
          { pada: 0, kotak: halaman },
          { pada: tCerita, kotak: halaman },
          { pada: tCerita + 1.2, kotak: alur },
          { pada: tMitre - 0.3, kotak: alur },
          { pada: tMitre + 0.9, kotak: kartuTeknik },
          { pada: tPenting, kotak: kartuTeknik },
          { pada: tPenting + 1.4, kotak: alur },
        ]}
        sorot={[
          { dari: tSatu - 0.2, sampai: tCerita, kotak: skor, label: "Satu insiden, satu skor", warna: warna.waspada, labelBawah: true, labelKanan: true },
          { dari: tCerita + 1.0, sampai: tMitre - 0.4, kotak: { x: 345, y: 478, w: 1495, h: 64 }, label: "Attack Story · per tahap" },
          { dari: tMitre + 0.6, sampai: tPenting, kotak: { x: 362, y: 624, w: 74, h: 26 }, label: "T1046", labelBawah: true, redup: false },
          { dari: tMitre + 0.9, sampai: tPenting, kotak: { x: 736, y: 624, w: 106, h: 26 }, label: "T1110.001", labelBawah: true, redup: false },
          { dari: tMitre + 1.2, sampai: tPenting, kotak: { x: 736, y: 771, w: 74, h: 26 }, label: "T1078", labelBawah: true, redup: false },
        ]}
      />

      {/* Panel kanan: hitungan -> tahap -> teknik */}
      <Panel nomor="01" kode={bagian === 0 ? "Ringkas" : bagian === 1 ? "Tahap" : "Teknik"} style={{ left: KANAN.kiri, top: KANAN.atas, width: KANAN.lebar, height: KANAN.tinggi }}>
        {bagian === 0 && (
          <div style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
            {EV.map((x) => (
              <div key={x.sumber} style={{ display: "flex", justifyContent: "space-between", fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 32, color: warna.ink2, whiteSpace: "nowrap" }}>
                <span>Catatan {x.sumber === "ssh" ? "login SSH" : x.sumber}</span>
                <span style={{ fontFamily: huruf.mono, color: warna.ink }}>{ribuan(Math.round(x.jumlah * hitung))}</span>
              </div>
            ))}
            <div style={{ borderTop: `2px solid ${warna.lineStrong}`, paddingTop: 16, display: "flex", justifyContent: "space-between", fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 36, color: warna.ink }}>
              <span>Total</span>
              <span style={{ fontFamily: huruf.mono }}>{ribuan(Math.round(EV_TOTAL * hitung))}</span>
            </div>
            <div style={{ textAlign: "center", fontFamily: huruf.stensil, fontSize: 64, color: warna.accent, marginTop: 6, opacity: o(tSatu - 0.4) }}>↓</div>
            <div style={{ textAlign: "center", fontFamily: huruf.stensil, fontSize: 110, lineHeight: 1, color: warna.awas, opacity: o(tSatu - 0.2), scale: `${1.4 - 0.4 * o(tSatu - 0.2, 0.3)}` }}>1</div>
            <div style={{ textAlign: "center", fontFamily: huruf.stensil, fontSize: 44, letterSpacing: "0.08em", color: warna.ink, opacity: o(tSatu - 0.2) }}>INSIDEN</div>
          </div>
        )}
        {bagian === 1 && (
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 24, color: warna.ink3 }}>Urutan serangan pada umumnya</div>
            {TAHAP.map((x, i) => {
              const m = o(x.t() - 0.15, 0.3);
              return (
                <div key={x.k} style={{ position: "relative", padding: "8px 18px", backgroundColor: m > 0.5 ? warna.raised : `${warna.panel}AA`, border: `1px solid ${m > 0.5 ? warna.accent : warna.line}`, borderLeft: `8px solid ${x.tercapai ? warna.accent : warna.lineStrong}`, opacity: 0.4 + 0.6 * m, whiteSpace: "nowrap" }}>
                  <div style={{ fontFamily: huruf.mono, fontSize: 18, color: warna.accent }}>TAHAP {i + 1}</div>
                  <div style={{ fontFamily: huruf.stensil, fontSize: 30, lineHeight: 1.1, color: warna.ink }}>{x.awam.toUpperCase()}</div>
                  <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 22, color: warna.ink2 }}>
                    {x.k} · {x.tercapai ? "sudah tercapai" : "belum"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {bagian === 2 && (
          <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
            {TEKNIK.map((x, i) => {
              const m = o(tMitre + 0.6 + i * 0.3, 0.3);
              return (
                <div key={x.kode} style={{ position: "relative", padding: "12px 18px", backgroundColor: warna.raised, border: `1px solid ${warna.lineStrong}`, opacity: m, translate: `${(1 - m) * 24}px 0px`, whiteSpace: "nowrap" }}>
                  <Braket ukuran={12} tebal={2} />
                  <div style={{ fontFamily: huruf.mono, fontSize: 30, color: warna.accent }}>{x.kode}</div>
                  <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 26, color: warna.ink }}>{x.nama}</div>
                  <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 24, color: warna.ink3 }}>= {x.awam}</div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      <ApaItu kiri={ISI.kiri + 16} lebar={700} bawah={160} kartu={[{ istilah: "MITRE ATT&CK", isi: "Kamus internasional teknik serangan siber. Setiap teknik punya kode, misalnya T1046 untuk pemindaian.", dari: tMitre, sampai: tMitre + 6.5 }]} />
    </Bingkai>
  );
};
