// Video demo SENTRA SHIELD versi 2: 19 adegan (docs/naskah-video-v2.md), narasi TTS, efek suara prosedural,
// dan musik ambient sangat pelan yang selalu diredam (ducking) saat narasi berbicara.
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, Series, getStaticFiles, interpolate, staticFile, useVideoConfig } from "remotion";
import { ADEGAN, FRAME_TOTAL, IdAdegan } from "./adegan/daftar";
import { S01Pembuka } from "./adegan/S01Pembuka";
import { S02Analogi } from "./adegan/S02Analogi";
import { S03Masalah } from "./adegan/S03Masalah";
import { S04Arsitektur } from "./adegan/S04Arsitektur";
import { S05Pindai } from "./adegan/S05Pindai";
import { S06Insiden } from "./adegan/S06Insiden";
import { S07Kampanye } from "./adegan/S07Kampanye";
import { S08LebihDalam } from "./adegan/S08LebihDalam";
import { S09Skor } from "./adegan/S09Skor";
import { S10PenjagaSitus } from "./adegan/S10PenjagaSitus";
import { S11Respons } from "./adegan/S11Respons";
import { S12Lapsit } from "./adegan/S12Lapsit";
import { S13SensorButa } from "./adegan/S13SensorButa";
import { S14UjiKesiapan } from "./adegan/S14UjiKesiapan";
import { S15BukuJaga } from "./adegan/S15BukuJaga";
import { S16HakAkses } from "./adegan/S16HakAkses";
import { S17Angka } from "./adegan/S17Angka";
import { S18Rekap } from "./adegan/S18Rekap";
import { S19Penutup } from "./adegan/S19Penutup";
import { JEDA_AWAL, faktorRedam } from "./data/narasi";
import { KonteksAdegan, Bunyi } from "./komponen/v2";
import { warna } from "./tema";

const KOMPONEN: Record<IdAdegan, React.FC<{ durasi: number }>> = {
  "01-pembuka": S01Pembuka,
  "02-analogi": S02Analogi,
  "03-masalah": S03Masalah,
  "04-arsitektur": S04Arsitektur,
  "05-pindai": S05Pindai,
  "06-insiden": S06Insiden,
  "07-kampanye": S07Kampanye,
  "08-lebih-dalam": S08LebihDalam,
  "09-skor": S09Skor,
  "10-penjaga-situs": S10PenjagaSitus,
  "11-respons": S11Respons,
  "12-lapsit": S12Lapsit,
  "13-sensor-buta": S13SensorButa,
  "14-uji-kesiapan": S14UjiKesiapan,
  "15-buku-jaga": S15BukuJaga,
  "16-hak-akses": S16HakAkses,
  "17-angka": S17Angka,
  "18-rekap": S18Rekap,
  "19-penutup": S19Penutup,
};

/** Narasi TTS: public/narasi-v2/<id adegan>.wav (hasil rekam/tts/narasi.py). Adegan tanpa berkas tetap hening. */
const narasiUntuk = (id: string) => {
  let files: { name: string }[] = [];
  try {
    files = getStaticFiles();
  } catch {
    files = [];
  }
  return files.find((f) => f.name === `narasi-v2/${id}.wav`)?.name ?? null;
};

/** Keras dasar musik ambient (sudah sangat pelan) dan redamannya saat narasi berbicara (±12 dB). */
const AMBIENT = 0.11;
const REDAM_AMBIENT = 0.25;
const MULAI = ADEGAN.reduce<number[]>((a, x, i) => [...a, i === 0 ? 0 : a[i - 1] + ADEGAN[i - 1].durasi], []);

const Ambient: React.FC = () => {
  const { fps } = useVideoConfig();
  const total = FRAME_TOTAL / fps;
  return (
    <Audio
      src={staticFile("sfx/ambient.wav")}
      loop
      volume={(f) => {
        const t = f / fps;
        let i = MULAI.length - 1;
        while (i > 0 && MULAI[i] > t) i--;
        const pudar = interpolate(t, [0, 2.5, total - 3.5, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return AMBIENT * pudar * faktorRedam(ADEGAN[i].id, t - MULAI[i], REDAM_AMBIENT);
      }}
    />
  );
};

export const SentraDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: warna.canvas }}>
      <Series>
        {ADEGAN.map((a, i) => {
          const K = KOMPONEN[a.id];
          const narasi = narasiUntuk(a.id);
          return (
            <Series.Sequence key={a.id} name={`${a.nomor} ${a.judul}`} durationInFrames={a.frame}>
              <K durasi={a.durasi} />
              {i > 0 && (
                <KonteksAdegan.Provider value={a.id}>
                  <Bunyi jenis="whoosh" pada={0} keras={0.9} />
                </KonteksAdegan.Provider>
              )}
              {narasi && (
                <Sequence from={Math.round(JEDA_AWAL * fps)} layout="none" name={`Narasi ${a.id}`}>
                  <Audio src={staticFile(narasi)} />
                </Sequence>
              )}
            </Series.Sequence>
          );
        })}
      </Series>
      <Ambient />
    </AbsoluteFill>
  );
};
