import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { R, barisTerminal, ribuan } from "../data";
import { kalimatMulai, pada } from "../data/narasi";
import { Bunyi } from "../komponen/v2";
import { Chip, Panel, SimbolPenyerang, SimbolSatuan, useMuncul } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const MASALAH = [
  { judul: "Satuan tanpa tim siber", ket: "Satuan setingkat Kodim jarang punya analis siber. Catatan tersebar dan tidak pernah dibaca." },
  { judul: "Peringatan membanjiri", ket: "Alat biasa membanjiri operator dengan alert mentah tanpa konteks." },
  { judul: "Serangan terkoordinasi", ket: "Serangan ke beberapa satuan sekaligus tidak terlihat bila tiap satuan dipantau terpisah." },
  { judul: "Sensor dimatikan", ket: "Penyerang mematikan sensor lebih dulu. Pertahanan buta tanpa disadari." },
  { judul: "Situs disusupi judi online", ket: "Judi online ber-cloaking: hanya Google yang melihatnya, admin situs tidak." },
];
const ID = "03-masalah";
// Tiap masalah tampil saat mulai diucapkan.
const MULAI = [kalimatMulai(ID, 1), kalimatMulai(ID, 2), kalimatMulai(ID, 3), pada(ID, "bahkan mematikan sensor"), kalimatMulai(ID, 4)].map((t) => t - 0.2);

// Angka asli dari rekaman: semua event dari 172.30.0.66 ke Kodim Latihan A.
const EVENT_KE_A = R.db.eventPenyerangPerSumber.filter((x) => x.satuan === "KODIM-LAT-A").reduce((a, x) => a + x.jumlah, 0);
const JUDOL_BIASA = barisTerminal("judol-kodim-a", /pengunjung biasa/).teks.split(":").slice(1).join(":").trim();
const JUDOL_BOT = barisTerminal("judol-kodim-a", /Googlebot/).teks.split(":").slice(1).join(":").trim();

const Visual: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const a = interpolate(t, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
  const mid: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: a };
  if (i === 0) {
    return (
      <div style={{ ...mid, flexDirection: "column", gap: 34 }}>
        <SimbolSatuan lebar={260} eselon="II" />
        <div style={{ display: "flex", gap: 20 }}>
          <Chip warnaLatar={warna.inset}>Catatan web · SSH · firewall</Chip>
          <Chip warnaLatar={warna.awas} warnaTeks={warna.accentInk}>Analis siber: 0</Chip>
        </div>
      </div>
    );
  }
  if (i === 1) {
    const n = Math.round(interpolate(t, [0.2, 3.2], [0, EVENT_KE_A], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    return (
      <div style={{ ...mid, flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: huruf.stensil, fontSize: 200, color: warna.waspada, lineHeight: 1 }}>{ribuan(n)}</div>
        <div style={{ fontFamily: huruf.kondensasi, fontSize: 40, color: warna.ink2, textAlign: "center", maxWidth: 760, textWrap: "balance" }}>
          event dari satu penyerang ke satu satuan dalam kurang dari 5 menit
        </div>
        <div style={{ fontFamily: huruf.mono, fontSize: 22, color: warna.ink3, marginTop: 14 }}>angka asli dari rekaman lab di video ini</div>
      </div>
    );
  }
  if (i === 2) {
    const g = interpolate(t, [0.3, 1.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div style={{ ...mid }}>
        <svg width={900} height={520} style={{ position: "absolute" }}>
          <path d="M450 110 C 300 160, 220 260, 200 380" stroke={warna.awas} strokeWidth={5} fill="none" strokeDasharray="14 12" pathLength={1} strokeDashoffset={0} opacity={g} />
          <path d="M450 110 C 600 160, 680 260, 700 380" stroke={warna.awas} strokeWidth={5} fill="none" strokeDasharray="14 12" opacity={g} />
        </svg>
        <div style={{ position: "absolute", top: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <SimbolPenyerang ukuran={110} />
          <span style={{ fontFamily: huruf.mono, fontSize: 28, color: warna.awas }}>IP yang sama</span>
        </div>
        <div style={{ position: "absolute", bottom: 40, left: 120, textAlign: "center" }}>
          <SimbolSatuan lebar={180} />
          <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 32, color: warna.ink }}>Satuan A</div>
        </div>
        <div style={{ position: "absolute", bottom: 40, right: 120, textAlign: "center" }}>
          <SimbolSatuan lebar={180} />
          <div style={{ fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 32, color: warna.ink }}>Satuan B</div>
        </div>
      </div>
    );
  }
  if (i === 3) {
    const datar = interpolate(t, [1.4, 2.0], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const titik = Array.from({ length: 60 }, (_, k) => {
      const x = k * 12;
      const denyut = k % 15 === 7 ? -70 : k % 15 === 8 ? 50 : 0;
      return `${x},${110 + denyut * (k < 30 ? 1 : datar)}`;
    }).join(" ");
    return (
      <div style={{ ...mid, flexDirection: "column", gap: 30 }}>
        <SimbolSatuan lebar={220} isi="server" warnaGaris={t > 1.8 ? warna.ink3 : warna.accent} />
        <svg width={720} height={220}>
          <polyline points={titik} fill="none" stroke={t > 1.8 ? warna.awas : warna.aman} strokeWidth={5} />
        </svg>
        <Chip warnaLatar={t > 1.8 ? warna.awas : warna.inset} warnaTeks={t > 1.8 ? warna.accentInk : warna.ink2} style={{ fontSize: 26 }}>
          {t > 1.8 ? "Heartbeat hilang" : "Heartbeat"}
        </Chip>
      </div>
    );
  }
  const kotak = (label: string, isi: string, c: string, o: number) => (
    <div style={{ width: 420, minHeight: 260, padding: 30, border: `3px solid ${c}`, backgroundColor: warna.panel, opacity: o }}>
      <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 28, letterSpacing: "0.12em", color: c, textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 22, fontFamily: huruf.mono, fontSize: 36, lineHeight: 1.3, color: warna.ink }}>{isi}</div>
    </div>
  );
  return (
    <div style={{ ...mid, gap: 40, flexDirection: "column" }}>
      <div style={{ fontFamily: huruf.kondensasi, fontSize: 28, color: warna.ink3 }}>Halaman yang sama, dibuka oleh dua pengunjung (keluaran asli skenario lab):</div>
      <div style={{ display: "flex", gap: 40 }}>
      {kotak("Dilihat pengunjung biasa", JUDOL_BIASA, warna.aman, 1)}
      {kotak("Dilihat Googlebot", JUDOL_BOT, warna.awas, interpolate(t, [0.8, 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}
      </div>
    </div>
  );
};

export const S03Masalah: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const aktif = Math.max(0, MULAI.filter((m) => d >= m).length - 1);
  const tLokal = d - MULAI[aktif];
  const daftar = useMuncul(0.3, 0.5);
  return (
    <Bingkai id={ID} nomor="03" judul="Masalah" durasi={durasi}>
      {MULAI.map((t, i) => (
        <Bunyi key={i} jenis="bip" pada={t + 0.1} keras={0.8} />
      ))}
      <div style={{ position: "absolute", left: 96, top: 150, width: 700, display: "flex", flexDirection: "column", gap: 16, opacity: daftar }}>
        {MASALAH.map((m, i) => {
          const on = i === aktif;
          return (
            <div
              key={m.judul}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "18px 24px",
                backgroundColor: on ? warna.raised : `${warna.panel}AA`,
                border: `1px solid ${on ? warna.accent : warna.line}`,
                borderLeft: `8px solid ${on ? warna.awas : warna.lineStrong}`,
                opacity: i <= aktif ? 1 : 0.45,
              }}
            >
              <span style={{ fontFamily: huruf.mono, fontSize: 30, color: on ? warna.accent : warna.ink3 }}>0{i + 1}</span>
              <span style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 38, color: on ? warna.ink : warna.ink2 }}>{m.judul}</span>
            </div>
          );
        })}
      </div>
      <Panel nomor={`0${aktif + 1}`} kode="Ancaman" style={{ left: 860, top: 150, width: 964, height: 690 }} aksen={warna.awas}>
        <Visual i={aktif} t={tLokal} />
      </Panel>
    </Bingkai>
  );
};
