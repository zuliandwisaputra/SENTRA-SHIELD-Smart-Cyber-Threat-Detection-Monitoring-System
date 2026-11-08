// Demo 9: Sensor Buta. Agent Kodim B dimatikan; penghitung dimulai dari heartbeat terakhir yang dicatat Core.
import React from "react";
import { Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, detikDi, detikPenanda, dtg, jamWib, penanda, terminal } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { Footage, fokusMuat, useJam } from "../komponen/Footage";
import { Rangkaian, dariJangkar, detikVideoUntuk } from "../komponen/Rangkaian";
import { Terminal } from "../komponen/Terminal";
import { Panel } from "../komponen/dasar";
import { ApaItu, Bunyi, ISI } from "../komponen/v2";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "13-sensor-buta";
const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EP = R.video.analis.mulai;
const ATAS = ISI.atasDemo + 14;
const F = { kiri: 760, atas: ATAS, lebar: 1064, tinggi: 700 };
const RF = F.lebar / (F.tinggi - 44);

const butaDb = (R.db as unknown as { agentButa: { waktu: string; data: { heartbeat_terakhir: string } | string }[] }).agentButa[0];
const dataButa = typeof butaDb.data === "string" ? JSON.parse(butaDb.data) : butaDb.data;
const T_HB = Date.parse(dataButa.heartbeat_terakhir); // heartbeat terakhir (dicatat Core)
const T_BUTA_CORE = Date.parse(butaDb.waktu.replace(" ", "T") + "Z"); // Core menandai BUTA
const T_MATI = terminal("sensor-mati").mulai;
const T_LAYAR = penanda("agent-buta").t; // status BUTA tampil di Beranda
const TANPA_SINYAL = Math.floor((T_BUTA_CORE - T_HB) / 1000);
const KARTU_AGENT = (penanda("agent-buta").kotak as unknown as { agent: { x: number; y: number; w: number; h: number } }).agent;

const B_INSIDEN = kalimatMulai(ID, 4) - 0.3; // "Ini penting ..." : daftar insiden Sensor Buta
const POT = dariJangkar(
  [
    { footage: detikDi(T_HB) - 1.5, adegan: 0 },
    { footage: detikDi(T_MATI), adegan: kalimatMulai(ID, 1) - 0.4 },
    { footage: detikDi(T_LAYAR), adegan: pada(ID, "menandai agent itu buta") },
  ],
  20,
);

const Isi: React.FC<{ mulai: number; k: number }> = ({ mulai, k }) => {
  const { epoch } = useJam(mulai, k, EP);
  const buta = epoch >= T_BUTA_CORE;
  const dt = Math.max(0, Math.min(epoch, T_BUTA_CORE) - T_HB) / 1000;
  const c = buta ? warna.awas : epoch >= T_MATI ? warna.waspada : warna.aman;
  return (
    <>
      <Terminal ids={["sensor-mati"]} epoch={epoch} kiri={ISI.kiri} atas={ATAS} lebar={640} tinggi={200} judul="Terminal lab · container kodim-b" />
      <Panel nomor="02" kode="Heartbeat" judul="agent kodim-b" style={{ left: ISI.kiri, top: ATAS + 216, width: 640, height: 484 }} aksen={c}>
        <div style={{ padding: "18px 28px", whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", color: warna.ink3, textTransform: "uppercase" }}>Tanpa sinyal sejak heartbeat terakhir</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 4 }}>
            <span style={{ fontFamily: huruf.stensil, fontSize: 120, lineHeight: 1, color: c }}>{/* Heartbeat terakhir dicatat Core dengan presisi detik, jadi penghitung memakai detik bulat. */}
              {epoch < T_HB ? "0" : Math.floor(dt)}</span>
            <span style={{ fontFamily: huruf.stensil, fontSize: 38, color: c }}>DETIK</span>
          </div>
          <div style={{ marginTop: 8, height: 14, backgroundColor: warna.inset, position: "relative" }}>
            <div style={{ width: `${Math.min(1, dt / 30) * 100}%`, height: "100%", backgroundColor: c }} />
            <div style={{ position: "absolute", right: 0, top: -6, bottom: -6, width: 3, backgroundColor: warna.ink }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", fontFamily: huruf.mono, fontSize: 18, color: warna.ink3, marginTop: 4 }}>batas 30 dtk</div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, fontFamily: huruf.mono, fontSize: 21, color: warna.ink2 }}>
            <span>{jamWib(T_HB)} WIB  heartbeat terakhir</span>
            <span style={{ opacity: epoch >= T_MATI ? 1 : 0.3 }}>{jamWib(T_MATI)} WIB  sensor dimatikan</span>
            <span style={{ opacity: buta ? 1 : 0.3, color: buta ? warna.awas : warna.ink2 }}>{jamWib(T_BUTA_CORE)} WIB  ditandai BUTA</span>
          </div>
        </div>
      </Panel>
      <Footage
        src="rekaman/analis-desktop.mp4"
        epochMulaiVideo={EP}
        mulai={mulai}
        kecepatan={k}
        {...F}
        label="Rekaman asli · Analis · Beranda"
        fokus={[{ pada: 0, kotak: fokusMuat({ x: 300, y: 200, w: 1100, h: 720 }, RF, 0) }]}
        sorot={[{ dari: detikDi(T_LAYAR) - 0.3, sampai: mulai + 600, kotak: KARTU_AGENT, label: "1 agent BUTA", warna: warna.awas }]}
      />
    </>
  );
};

export const S13SensorButa: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const fr = (t: number) => Math.round(t * fps);
  const ke = (t: number) => detikVideoUntuk(POT, detikDi(t));
  const sorotAngka = interpolate(d, [kalimatMulai(ID, 3) - 0.2, kalimatMulai(ID, 3) + 0.3], [0, 1], klem);
  const mulaiDaftar = detikPenanda("insiden-sensor-buta") - 0.5;
  return (
    <Bingkai id={ID} nomor="13" judul="Demo 9 · Sensor Buta" durasi={durasi} dataLatihan dtgTeks={dtg(T_MATI)} tigaBagian={[kalimatMulai(ID, 0), kalimatMulai(ID, 2), kalimatMulai(ID, 4)]}>
      <Bunyi jenis="detak" pada={ke(T_HB)} />
      <Bunyi jenis="ketik" pada={ke(T_MATI)} />
      <Bunyi jenis="bip" pada={ke(T_LAYAR)} />
      <Bunyi jenis="whoosh" pada={B_INSIDEN - 0.1} keras={0.6} />

      <Sequence durationInFrames={fr(B_INSIDEN)} layout="none">
        <Rangkaian potongan={POT}>{(m, k) => <Isi mulai={m} k={k} />}</Rangkaian>
        {sorotAngka > 0 && (
          <div style={{ position: "absolute", left: ISI.kiri - 6, top: ATAS + 210, width: 652, height: 496, border: `4px solid ${warna.awas}`, boxShadow: `0 0 40px ${warna.awas}`, opacity: sorotAngka }}>
            <div style={{ position: "absolute", right: 16, top: -20, padding: "2px 14px", backgroundColor: warna.awas, color: warna.accentInk, fontFamily: huruf.stensil, fontSize: 26, whiteSpace: "nowrap" }}>
              {TANPA_SINYAL} DTK TANPA SINYAL
            </div>
          </div>
        )}
      </Sequence>
      <Sequence from={fr(B_INSIDEN)} layout="none">
        <Footage
          src="rekaman/analis-desktop.mp4"
          epochMulaiVideo={EP}
          mulai={mulaiDaftar}
          kiri={ISI.kiri}
          atas={ATAS}
          lebar={1728}
          tinggi={700}
          label="Rekaman asli · Analis · daftar Insiden"
          fokus={[{ pada: 0, kotak: fokusMuat({ x: 300, y: 90, w: 1580, h: 600 }, 1728 / 656, 0) }]}
        />
      </Sequence>
      <ApaItu kiri={F.kiri + 10} lebar={720} bawah={150} kartu={[{ istilah: "Heartbeat", isi: "Sinyal “saya masih hidup” yang dikirim agent secara rutin.", dari: pada(ID, "heartbeat") - 0.2, sampai: pada(ID, "heartbeat") + 5.5 }]} />
    </Bingkai>
  );
};
