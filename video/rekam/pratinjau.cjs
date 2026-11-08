// Render gambar diam (pratinjau) di detik-detik tertentu dari komposisi SentraDemo.
//   node rekam/pratinjau.cjs <folder-keluaran> [--skala 0.5] <nama=detik | detik> ...
// REMOTION_CHROME=<path chrome-headless-shell> bila Chrome tidak bisa diunduh.
const path = require("path");
const fs = require("fs");
const { bundle } = require("@remotion/bundler");
const { renderStill, selectComposition } = require("@remotion/renderer");

(async () => {
  const args = process.argv.slice(2);
  const out = path.resolve(args.shift() || "out/pratinjau");
  let skala = 1;
  const i = args.indexOf("--skala");
  if (i >= 0) {
    skala = Number(args[i + 1]);
    args.splice(i, 2);
  }
  const daftar = args.map((a) => (a.includes("=") ? [a.split("=")[0], Number(a.split("=")[1])] : [`t-${a}`, Number(a)]));
  fs.mkdirSync(out, { recursive: true });
  const serveUrl = await bundle({ entryPoint: path.resolve(__dirname, "../src/index.ts") });
  const browserExecutable = process.env.REMOTION_CHROME || null;
  const composition = await selectComposition({ serveUrl, id: "SentraDemo", browserExecutable });
  console.log(`durasi ${(composition.durationInFrames / composition.fps).toFixed(2)} dtk`);
  for (const [nama, detik] of daftar) {
    const frame = Math.min(composition.durationInFrames - 1, Math.round(detik * composition.fps));
    await renderStill({ composition, serveUrl, frame, output: path.join(out, `${nama}.png`), browserExecutable, imageFormat: "png", scale: skala });
    console.log(nama, detik);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
