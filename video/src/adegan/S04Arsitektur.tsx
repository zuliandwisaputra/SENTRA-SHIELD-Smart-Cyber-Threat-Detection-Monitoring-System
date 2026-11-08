import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Braket, Chip, Logo, SimbolPenyerang, SimbolSatuan, Stempel } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";
import { kalimatMulai, pada } from "../data/narasi";
import { Bunyi } from "../komponen/v2";

const ID = "04-arsitektur";
// Waktu muncul tiap bagian mengikuti frasa narasi.
const T = {
  kepala: kalimatMulai(ID, 0) + 0.6,
  agent: pada(ID, "Agent di setiap satuan") - 0.2,
  core: pada(ID, "Core di pusat") - 0.2,
  command: pada(ID, "Command adalah layar") - 0.2,
  hp: pada(ID, "termasuk di HP") - 0.3,
  kembali: pada(ID, "termasuk di HP") + 0.5,
  lab: pada(ID, "Untuk demo ini") - 0.4,
  kodimA: pada(ID, "Kodim A") - 0.1,
  kodimB: pada(ID, "Kodim B") - 0.1,
  plc: pada(ID, "mesin industri PLC") - 0.1,
  penyerang: pada(ID, "satu komputer penyerang") - 0.1,
  panahPenyerang: pada(ID, "jaringan terpisah"),
  pusat: pada(ID, "jaringan terpisah") + 0.6,
  offline: pada(ID, "Semuanya berjalan tanpa internet") - 0.2,
};

const klem = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Kotak: React.FC<{ x: number; y: number; w: number; h: number; o: number; judul: string; kode?: string; aksen?: string; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  o,
  judul,
  kode,
  aksen = warna.accent,
  children,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, backgroundColor: `${warna.panel}F5`, border: `1px solid ${warna.lineStrong}`, opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
    <Braket warnaGaris={aksen} />
    <div style={{ padding: "16px 22px 10px", borderBottom: `1px solid ${warna.line}` }}>
      {kode && <div style={{ fontFamily: huruf.mono, fontSize: 20, color: aksen }}>{kode}</div>}
      <div style={{ fontFamily: huruf.stensil, fontSize: 32, letterSpacing: "0.06em", color: warna.ink }}>{judul}</div>
    </div>
    <div style={{ padding: "14px 22px" }}>{children}</div>
  </div>
);

const Butir: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c = warna.ink2 }) => (
  <div style={{ fontFamily: huruf.kondensasi, fontSize: 28, lineHeight: 1.35, color: c }}>
    <span style={{ color: warna.accent }}>▸ </span>
    {children}
  </div>
);

/** Panah putus-putus yang mengalir (arah data). */
const Panah: React.FC<{ d: string; o: number; c?: string; geser: number }> = ({ d, o, c = warna.accent, geser }) => (
  <path d={d} fill="none" stroke={c} strokeWidth={4} strokeDasharray="16 12" strokeDashoffset={-geser} opacity={o} markerEnd={`url(#ujung-${c.slice(1)})`} />
);

const LabelPanah: React.FC<{ x: number; y: number; o: number; children: React.ReactNode; c?: string }> = ({ x, y, o, children, c = warna.ink2 }) => (
  <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", opacity: o, fontFamily: huruf.mono, fontSize: 21, color: c, backgroundColor: warna.canvas, padding: "2px 10px", whiteSpace: "nowrap" }}>
    {children}
  </div>
);

export const S04Arsitektur: React.FC<{ durasi: number }> = ({ durasi }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = f / fps;
  const geser = f * 1.6;
  const a = (t: number) => interpolate(d, [t, t + 0.5], [0, 1], klem);
  const bagianA = interpolate(d, [T.lab, T.lab + 0.5], [1, 0], klem);
  const bagianB = interpolate(d, [T.lab + 0.3, T.lab + 0.8], [0, 1], klem);
  const stempel = interpolate(d, [T.offline, T.offline + 0.4], [0, 1], klem);
  const ujung = [warna.accent, warna.awas, warna.aman];

  return (
    <Bingkai id={ID} nomor="04" judul="Arsitektur & lab" durasi={durasi}>
      <Bunyi jenis="whoosh" pada={T.agent - 0.1} keras={0.7} />
      <Bunyi jenis="whoosh" pada={T.core - 0.1} keras={0.7} />
      <Bunyi jenis="whoosh" pada={T.command - 0.1} keras={0.7} />
      <Bunyi jenis="whoosh" pada={T.lab} />
      <Bunyi jenis="ping" pada={T.lab + 0.4} />
      <Bunyi jenis="bip" pada={T.penyerang + 0.1} keras={0.8} />
      <Bunyi jenis="stempel" pada={T.offline + 0.05} />
      <Bunyi jenis="stempel" pada={T.offline + 0.35} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {ujung.map((c) => (
            <marker key={c} id={`ujung-${c.slice(1)}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 Z" fill={c} />
            </marker>
          ))}
        </defs>
        <g opacity={bagianA}>
          <Panah d="M560 260 C 640 260, 640 420, 714 420" o={a(T.core + 0.3)} geser={geser} />
          <Panah d="M560 460 L 714 470" o={a(T.core + 0.3)} geser={geser} />
          <Panah d="M560 660 C 640 660, 640 520, 714 520" o={a(T.core + 0.3)} geser={geser} />
          <Panah d="M1206 400 L 1354 330" o={a(T.command + 0.3)} geser={geser} />
          <Panah d="M1354 600 L 1206 520" o={a(T.hp + 0.3)} geser={geser} c={warna.aman} />
          <Panah d="M960 760 C 960 830, 330 830, 330 742" o={a(T.kembali)} geser={geser} c={warna.aman} />
        </g>
        <g opacity={bagianB}>
          <Panah d="M476 470 C 640 380, 700 240, 806 240" o={a(T.panahPenyerang)} geser={geser} c={warna.awas} />
          <Panah d="M476 490 C 640 490, 700 450, 806 450" o={a(T.panahPenyerang)} geser={geser} c={warna.awas} />
          <Panah d="M476 510 C 640 600, 700 660, 806 660" o={a(T.panahPenyerang)} geser={geser} c={warna.awas} />
          <Panah d="M1170 240 C 1260 240, 1260 440, 1354 440" o={a(T.pusat)} geser={geser} />
          <Panah d="M1170 450 C 1260 450, 1260 500, 1354 500" o={a(T.pusat)} geser={geser} />
          <Panah d="M1170 660 C 1260 660, 1260 560, 1354 560" o={a(T.pusat)} geser={geser} />
        </g>
      </svg>

      {/* Bagian A: aliran data */}
      <div style={{ opacity: bagianA }}>
        {[
          { x: 96, w: 464, t: "Agent", ket: "di tiap satuan" },
          { x: 714, w: 492, t: "Core", ket: "di pusat" },
          { x: 1354, w: 470, t: "Command", ket: "dashboard" },
        ].map((k, i) => (
          <div key={k.t} style={{ position: "absolute", left: k.x, width: k.w, top: 128, display: "flex", alignItems: "baseline", gap: 12, opacity: a(T.kepala + i * 0.25) }}>
            <span style={{ fontFamily: huruf.mono, fontSize: 22, color: warna.accent }}>0{i + 1} //</span>
            <span style={{ fontFamily: huruf.stensil, fontSize: 30, letterSpacing: "0.1em", color: warna.ink }}>{k.t.toUpperCase()}</span>
            <span style={{ fontFamily: huruf.kondensasi, fontSize: 24, color: warna.ink3 }}>{k.ket}</span>
          </div>
        ))}
        {[
          { y: 180, kode: "AGENT · kodim-a", judul: "Kodim Latihan A", isi: "web · SSH · firewall · FIM", ikon: "sinyal" as const },
          { y: 380, kode: "AGENT · plc-sim", judul: "PLC (Kodim A)", isi: "Modbus · firewall", ikon: "plc" as const },
          { y: 580, kode: "AGENT · kodim-b", judul: "Kodim Latihan B", isi: "web · SSH · firewall · FIM", ikon: "sinyal" as const },
        ].map((x, i) => (
          <Kotak key={x.kode} x={96} y={x.y} w={464} h={160} o={a(T.agent + i * 0.35)} judul={x.judul} kode={x.kode}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <SimbolSatuan lebar={70} isi={x.ikon} />
              <span style={{ fontFamily: huruf.kondensasi, fontSize: 28, color: warna.ink2 }}>{x.isi}</span>
            </div>
          </Kotak>
        ))}
        <Kotak x={714} y={250} w={492} h={510} o={a(T.core)} judul="SENTRA CORE" kode="PUSAT · Laravel">
          <Butir>13 aturan deteksi + MITRE ATT&CK</Butir>
          <Butir>Korelasi Attack Story per tahap</Butir>
          <Butir>Skor terbuka → Tingkat Siaga</Butir>
          <Butir>Kampanye lintas satuan</Butir>
          <Butir>Sensor Buta · Uji Kesiapan</Butir>
          <Butir>Penjaga Situs · LAPSIT</Butir>
          <Butir>Audit log berantai SHA-256</Butir>
        </Kotak>
        <Kotak x={1354} y={210} w={470} h={220} o={a(T.command)} judul="DASHBOARD" kode="KOMANDO · browser">
          <Butir>Operator · Analis</Butir>
          <Butir>Beranda live (WebSocket)</Butir>
        </Kotak>
        <Kotak x={1354} y={500} w={470} h={200} o={a(T.hp)} judul="HP KOMANDAN" kode="KOMANDO · HP" aksen={warna.aman}>
          <Butir>Setujui / Tolak tindakan</Butir>
        </Kotak>
        <LabelPanah x={637} y={232} o={a(T.core + 0.5)}>HTTPS · event per 1 dtk</LabelPanah>
        <LabelPanah x={1280} y={330} o={a(T.command + 0.5)}>WebSocket</LabelPanah>
        <LabelPanah x={1280} y={606} o={a(T.hp + 0.5)} c={warna.aman}>keputusan</LabelPanah>
        <LabelPanah x={660} y={826} o={a(T.kembali + 0.2)} c={warna.aman}>
          perintah daftar tetap: block_ip · unblock_ip · run_test
        </LabelPanah>
      </div>

      {/* Bagian B: topologi lab */}
      <div style={{ opacity: bagianB }}>
        <div style={{ position: "absolute", left: 96, top: 170, width: 380, height: 640, border: `2px dashed ${warna.awas}88`, backgroundImage: `repeating-linear-gradient(135deg, ${warna.awas}10 0 12px, transparent 12px 24px)` }}>
          <div style={{ padding: 18, fontFamily: huruf.stensil, fontSize: 28, letterSpacing: "0.08em", color: warna.awas }}>ZONA LUAR</div>
          <div style={{ paddingLeft: 18, fontFamily: huruf.mono, fontSize: 21, color: warna.ink3 }}>net-wan 172.30.0.0/24</div>
          <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: a(T.penyerang) }}>
            <SimbolPenyerang ukuran={130} />
            <div style={{ fontFamily: huruf.stensil, fontSize: 30, color: warna.awas }}>PENYERANG</div>
            <div style={{ fontFamily: huruf.mono, fontSize: 30, color: warna.ink }}>172.30.0.66</div>
            <div style={{ fontFamily: huruf.kondensasi, fontSize: 24, color: warna.ink3, textAlign: "center", padding: "0 20px" }}>container attacker, mesin dan jaringan terpisah</div>
          </div>
        </div>
        {[
          { y: 210, judul: "Kodim Latihan A", ip: "172.30.0.11", agent: "agent kodim-a", ikon: "sinyal" as const },
          { y: 420, judul: "Kodim Latihan B", ip: "172.30.0.12", agent: "agent kodim-b", ikon: "sinyal" as const },
          { y: 630, judul: "PLC (Kodim A)", ip: "172.30.0.20", agent: "agent plc-sim · Modbus", ikon: "plc" as const },
        ].map((x, i) => (
          <div key={x.ip} style={{ position: "absolute", left: 806, top: x.y - 50, width: 364, height: 160, display: "flex", alignItems: "center", gap: 20, padding: "0 20px", backgroundColor: `${warna.panel}F5`, border: `1px solid ${warna.lineStrong}`, opacity: a([T.kodimA, T.kodimB, T.plc][i]) }}>
            <Braket />
            <SimbolSatuan lebar={90} isi={x.ikon} />
            <div>
              <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 30, color: warna.ink }}>{x.judul}</div>
              <div style={{ fontFamily: huruf.mono, fontSize: 24, color: warna.accent }}>{x.ip}</div>
              <div style={{ fontFamily: huruf.kondensasi, fontSize: 22, color: warna.ink3 }}>{x.agent}</div>
            </div>
          </div>
        ))}
        <div style={{ position: "absolute", left: 1354, top: 330, width: 470, height: 340, backgroundColor: `${warna.panel}F5`, border: `1px solid ${warna.lineStrong}`, opacity: a(T.pusat - 0.3), padding: 24 }}>
          <Braket />
          <div style={{ fontFamily: huruf.stensil, fontSize: 28, letterSpacing: "0.08em", color: warna.accent }}>PUSAT</div>
          <div style={{ fontFamily: huruf.mono, fontSize: 21, color: warna.ink3 }}>net-pusat 172.31.0.0/24</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 26 }}>
            <Logo ukuran={84} />
            <div>
              <div style={{ fontFamily: huruf.kondensasi, fontWeight: 700, fontSize: 32, color: warna.ink }}>SENTRA Core + MySQL</div>
              <div style={{ fontFamily: huruf.mono, fontSize: 22, color: warna.ink2 }}>https://localhost:8443</div>
            </div>
          </div>
          <div style={{ marginTop: 22, fontFamily: huruf.kondensasi, fontSize: 25, color: warna.ink2 }}>Agent melapor lewat jaringan pusat; penyerang tidak punya akses ke sana.</div>
        </div>
        <LabelPanah x={640} y={350} o={a(T.panahPenyerang + 0.2)} c={warna.awas}>
          nmap · hydra · sqlmap · Modbus
        </LabelPanah>
        <LabelPanah x={1262} y={300} o={a(T.pusat + 0.2)}>
          telemetri
        </LabelPanah>
      </div>

      {/* Bagian C: offline */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: warna.canvas, opacity: 0.82 * stempel }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", gap: 70, opacity: stempel, scale: `${1.3 - 0.3 * stempel}` }}>
        <Stempel warnaGaris={warna.aman} ukuran={84} miring={-5} style={{ backgroundColor: `${warna.canvas}E6` }}>
          Offline
        </Stempel>
        <Stempel warnaGaris={warna.accent} ukuran={84} miring={4} style={{ backgroundColor: `${warna.canvas}E6` }}>
          Tanpa cloud
        </Stempel>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center", opacity: stempel }}>
        <Chip warnaLatar={warna.raised} style={{ fontSize: 30, padding: "10px 22px" }}>
          docker compose · satu laptop / mini-PC
        </Chip>
      </div>
    </Bingkai>
  );
};
