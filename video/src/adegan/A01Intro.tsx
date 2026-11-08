import React from "react";
import { R, dtg } from "../data";
import { LOMBA, NAMA_ANGGOTA, NAMA_TIM } from "../data/identitas";
import { kata, teksNarasi } from "../data/narasi";
import { Chip, Logo, Stempel, useMuncul } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const ID = "01-intro";
const KATA = [
  { kata: "Nyata", isi: "Telemetri asli dari serangan di lab. Blokir benar-benar memutus penyerang.", warna: warna.aman, i: 24 },
  { kata: "Terukur", isi: "Sistem menguji dirinya sendiri: cakupan dan waktu deteksi dalam angka.", warna: warna.waspada, i: 25 },
  { kata: "Siap pakai", isi: "Satu klik menyalakan lab. Berjalan offline, cukup di mini-PC.", warna: warna.accent, i: 27 },
];

export const A01Intro: React.FC<{ durasi: number }> = ({ durasi }) => {
  const logo = useMuncul(0.1, 1.6);
  const pembicara = useMuncul(kata(ID, 1) - 0.2, 0.4);
  const nama = useMuncul(kata(ID, 7) - 0.3, 0.5);
  const sub = useMuncul(kata(ID, 9) - 0.2, 0.5);
  const kaki = useMuncul(kata(ID, 16), 0.5);
  const kataMuncul = [useMuncul(kata(ID, 24) - 0.1, 0.3), useMuncul(kata(ID, 25) - 0.1, 0.3), useMuncul(kata(ID, 27) - 0.1, 0.3)];
  return (
    <Bingkai
      nomor="01"
      judul="SENTRA SHIELD"
      durasi={durasi}
      tanpaKepala
      keterangan={teksNarasi(ID, [
        [0, `Halo, nama saya ${NAMA_ANGGOTA}.`],
        [6, "Ini SENTRA SHIELD, Pusat Komando Deteksi dan Respons Ancaman Siber"],
        [16, "untuk satuan TNI Angkatan Darat."],
        [21, "Tiga prinsip kami: nyata, terukur, dan siap pakai."],
      ])}
    >
      <div style={{ position: "absolute", left: 144, top: 120, display: "flex", alignItems: "center", gap: 48 }}>
        <div style={{ opacity: Math.min(1, logo * 2) }}>
          <Logo ukuran={210} gambar={logo} />
        </div>
        <div>
          <div style={{ fontFamily: huruf.stensil, fontSize: 150, lineHeight: 0.95, letterSpacing: "0.06em", color: warna.ink, opacity: nama, translate: `${(1 - nama) * -40}px 0px` }}>
            SENTRA SHIELD
          </div>
          <div style={{ marginTop: 22, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 54, color: warna.accent, opacity: sub, translate: `0px ${(1 - sub) * 16}px` }}>
            Pusat Komando Deteksi & Respons Ancaman Siber
          </div>
        </div>
      </div>

      {/* Nama pembicara saat memperkenalkan diri. */}
      <div style={{ position: "absolute", left: 144, top: 420, opacity: pembicara, display: "flex", gap: 14, alignItems: "center" }}>
        <Chip warnaLatar={warna.accent} warnaTeks={warna.accentInk} style={{ fontSize: 26, padding: "8px 16px" }}>
          {NAMA_ANGGOTA}
        </Chip>
        <Chip warnaLatar={warna.raised} style={{ fontSize: 26, padding: "8px 16px" }}>
          Tim {NAMA_TIM}
        </Chip>
      </div>

      <div style={{ position: "absolute", left: 144, right: 144, top: 490, display: "flex", gap: 40 }}>
        {KATA.map((k, i) => (
          <div key={k.kata} style={{ flex: 1, opacity: kataMuncul[i], scale: `${1.25 - 0.25 * kataMuncul[i]}` }}>
            <Stempel warnaGaris={k.warna} ukuran={64} miring={i === 1 ? 3 : -3}>
              {k.kata}
            </Stempel>
            <div style={{ marginTop: 26, fontFamily: huruf.kondensasi, fontSize: 40, lineHeight: 1.2, color: warna.ink2, maxWidth: 480 }}>{k.isi}</div>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 144, right: 144, top: 850, display: "flex", justifyContent: "space-between", gap: 24, fontFamily: huruf.mono, fontSize: 21, color: warna.ink3, opacity: kaki, whiteSpace: "nowrap" }}>
        <span>{LOMBA}</span>
        <span>Rekaman asli lab · DTG {dtg(R.video.analis.mulai)}</span>
      </div>
    </Bingkai>
  );
};
