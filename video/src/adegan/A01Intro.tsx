import React from "react";
import { R, dtg } from "../data";
import { LOMBA } from "../data/identitas";
import { Logo, Stempel, useMuncul } from "../komponen/dasar";
import { huruf, warna } from "../tema";
import { Bingkai } from "./Bingkai";

const KATA = [
  { kata: "Nyata", isi: "Telemetri asli dari serangan di lab. Blokir benar-benar memutus penyerang.", warna: warna.aman },
  { kata: "Terukur", isi: "Sistem menguji dirinya sendiri: cakupan dan waktu deteksi dalam angka.", warna: warna.waspada },
  { kata: "Siap pakai", isi: "Satu klik menyalakan lab. Berjalan offline, cukup di mini-PC.", warna: warna.accent },
];

export const A01Intro: React.FC<{ durasi: number }> = ({ durasi }) => {
  const logo = useMuncul(0.1, 1.6);
  const nama = useMuncul(1.0, 0.6);
  const sub = useMuncul(2.0, 0.6);
  const kaki = useMuncul(13.5, 0.6);
  const kata = [useMuncul(4.4, 0.35), useMuncul(7.4, 0.35), useMuncul(10.4, 0.35)];
  return (
    <Bingkai
      nomor="01"
      judul="SENTRA SHIELD"
      durasi={durasi}
      tanpaKepala
      keterangan={[{ dari: 14.5, sampai: 19.6, teks: "Semua tampilan aplikasi di video ini adalah rekaman asli dari lab latihan." }]}
    >
      <div style={{ position: "absolute", left: 144, top: 120, display: "flex", alignItems: "center", gap: 48 }}>
        <div style={{ opacity: Math.min(1, logo * 2) }}>
          <Logo ukuran={210} gambar={logo} />
        </div>
        <div>
          <div
            style={{
              fontFamily: huruf.stensil,
              fontSize: 150,
              lineHeight: 0.95,
              letterSpacing: "0.06em",
              color: warna.ink,
              opacity: nama,
              translate: `${(1 - nama) * -40}px 0px`,
            }}
          >
            SENTRA SHIELD
          </div>
          <div style={{ marginTop: 22, fontFamily: huruf.kondensasi, fontWeight: 600, fontSize: 54, color: warna.accent, opacity: sub, translate: `0px ${(1 - sub) * 16}px` }}>
            Pusat Komando Deteksi & Respons Ancaman Siber
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 144, right: 144, top: 520, display: "flex", gap: 40 }}>
        {KATA.map((k, i) => (
          <div key={k.kata} style={{ flex: 1, opacity: kata[i], scale: `${1.25 - 0.25 * kata[i]}` }}>
            <Stempel warnaGaris={k.warna} ukuran={64} miring={i === 1 ? 3 : -3}>
              {k.kata}
            </Stempel>
            <div style={{ marginTop: 26, fontFamily: huruf.kondensasi, fontSize: 40, lineHeight: 1.2, color: warna.ink2, maxWidth: 480 }}>{k.isi}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 144,
          right: 144,
          top: 820,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: huruf.mono,
          fontSize: 26,
          color: warna.ink3,
          opacity: kaki,
        }}
      >
        <span>{LOMBA}</span>
        <span>REKAMAN LAB · DTG {dtg(R.video.analis.mulai)}</span>
      </div>
    </Bingkai>
  );
};
