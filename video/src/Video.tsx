// Video demo SENTRA SHIELD: 11 adegan sesuai storyboard, total 5 menit.
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, Series, getStaticFiles, staticFile, useVideoConfig } from "remotion";
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
import { JEDA_AWAL } from "./data/narasi";
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
 * Slot narasi: public/narasi/<id adegan>.wav (hasil rekam/pasang-narasi.cjs dari rekaman HP .m4a).
 * WAV diutamakan; format lain dipakai hanya bila WAV belum ada. Adegan tanpa narasi tetap hening.
 */
const narasiUntuk = (id: string) => {
  let files: { name: string }[] = [];
  try {
    files = getStaticFiles();
  } catch {
    files = [];
  }
  const cocok = files.filter((f) => /^narasi\/[^.]/.test(f.name) && f.name.replace(/^narasi\//, "").replace(/\.(wav|mp3|m4a|aac|ogg)$/i, "") === id);
  return (cocok.find((f) => /\.wav$/i.test(f.name)) ?? cocok[0])?.name ?? null;
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
            <Series.Sequence key={a.id} name={`${a.nomor} ${a.judul}`} durationInFrames={a.frame}>
              <K durasi={a.durasi} />
              {narasi && (
                <Sequence from={Math.round(JEDA_AWAL * fps)} layout="none" name={`Narasi ${a.id}`}>
                  <Audio src={staticFile(narasi)} />
                </Sequence>
              )}
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
