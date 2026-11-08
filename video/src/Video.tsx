// Video demo SENTRA SHIELD: 11 adegan sesuai storyboard, total 5 menit.
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Series, getStaticFiles, staticFile, useVideoConfig } from "remotion";
import { A01Intro } from "./adegan/A01Intro";
import { A02Masalah } from "./adegan/A02Masalah";
import { A03Arsitektur } from "./adegan/A03Arsitektur";
import { A04Deteksi } from "./adegan/A04Deteksi";
import { A05SeranganLanjut } from "./adegan/A05SeranganLanjut";
import { A06Respons } from "./adegan/A06Respons";
import { A07Lapsit } from "./adegan/A07Lapsit";
import { A08Ketahanan } from "./adegan/A08Ketahanan";
import { A09HakAkses } from "./adegan/A09HakAkses";
import { A10Angka } from "./adegan/A10Angka";
import { A11Penutup } from "./adegan/A11Penutup";
import { ADEGAN, IdAdegan } from "./adegan/daftar";
import { warna } from "./tema";

const KOMPONEN: Record<IdAdegan, React.FC<{ durasi: number }>> = {
  "01-intro": A01Intro,
  "02-masalah": A02Masalah,
  "03-arsitektur": A03Arsitektur,
  "04-deteksi": A04Deteksi,
  "05-serangan-lanjut": A05SeranganLanjut,
  "06-respons": A06Respons,
  "07-lapsit": A07Lapsit,
  "08-ketahanan": A08Ketahanan,
  "09-hak-akses": A09HakAkses,
  "10-angka": A10Angka,
  "11-penutup": A11Penutup,
};

/**
 * Slot narasi: taruh rekaman suara per adegan di public/narasi/<id adegan>.<wav|mp3|m4a>,
 * misalnya public/narasi/04-deteksi.wav. File yang ada otomatis dipakai; yang belum ada dilewati.
 * Naskahnya: docs/naskah-video.md.
 */
const narasiUntuk = (id: string) => {
  let files: { name: string }[] = [];
  try {
    files = getStaticFiles();
  } catch {
    files = [];
  }
  return files.find((f) => /^narasi\//.test(f.name) && f.name.replace(/^narasi\//, "").replace(/\.(wav|mp3|m4a|aac|ogg)$/i, "") === id)?.name ?? null;
};

export const SentraDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: warna.canvas }}>
      <Series>
        {ADEGAN.map((a) => {
          const K = KOMPONEN[a.id];
          const narasi = narasiUntuk(a.id);
          return (
            <Series.Sequence key={a.id} name={`${a.nomor} ${a.judul}`} durationInFrames={a.durasi * fps}>
              <K durasi={a.durasi} />
              {narasi && <Audio src={staticFile(narasi)} name={`Narasi ${a.id}`} />}
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
