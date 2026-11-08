// Render gambar diam (pratinjau) di detik-detik tertentu dari komposisi SentraDemo.
//   node rekam/pratinjau.cjs <folder-keluaran> [detik ...]
// Tanpa daftar detik: memakai titik pratinjau bawaan (2-5 per adegan).
// REMOTION_CHROME=<path chrome-headless-shell> bila Chrome tidak bisa diunduh.
const path = require("path");
const fs = require("fs");
const { bundle } = require("@remotion/bundler");
const { renderStill, selectComposition } = require("@remotion/renderer");

const BAWAAN = [
  ["01-intro", 12],
  ["02-masalah-a", 30.5],
  ["02-masalah-b", 46],
  ["03-arsitektur-a", 63],
  ["03-arsitektur-b", 78],
  ["03-arsitektur-c", 87],
  ["04-deteksi-a", 96],
  ["04-deteksi-b", 105],
  ["04-deteksi-c", 124],
  ["05-lanjut-a", 134],
  ["05-lanjut-b", 139],
  ["05-lanjut-c", 152],
  ["05-lanjut-d", 160],
  ["05-lanjut-e", 167],
  ["06-respons-a", 175],
  ["06-respons-b", 187],
  ["06-respons-c", 193.5],
  ["06-respons-d", 197],
  ["07-lapsit-a", 203],
  ["07-lapsit-b", 209],
  ["07-lapsit-c", 217.5],
  ["08-ketahanan-a", 228],
  ["08-ketahanan-b", 240],
  ["08-ketahanan-c", 247],
  ["09-akses-a", 254],
  ["09-akses-b", 262],
  ["10-angka-a", 274],
  ["10-angka-b", 282],
  ["11-penutup-a", 290],
  ["11-penutup-b", 297],
];

(async () => {
  const out = path.resolve(process.argv[2] || "out/pratinjau");
  fs.mkdirSync(out, { recursive: true });
  const daftar = process.argv.length > 3 ? process.argv.slice(3).map((d) => [`t-${d}`, Number(d)]) : BAWAAN;
  const serveUrl = await bundle({ entryPoint: path.resolve(__dirname, "../src/index.ts") });
  const browserExecutable = process.env.REMOTION_CHROME || null;
  const composition = await selectComposition({ serveUrl, id: "SentraDemo", browserExecutable });
  for (const [nama, detik] of daftar) {
    const frame = Math.round(detik * composition.fps);
    await renderStill({ composition, serveUrl, frame, output: path.join(out, `${nama}.png`), browserExecutable, imageFormat: "png" });
    console.log(nama, detik);
  }
})();
