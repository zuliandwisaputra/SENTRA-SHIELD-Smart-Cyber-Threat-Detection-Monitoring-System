// Footage tambahan untuk adegan Hak Akses: Operator Kodim A dan Analis membuka Beranda pada lab yang sama,
// direkam bersamaan. Jalankan langsung setelah rekam.cjs (lab jangan di-reset) agar datanya sama.
//   node rekam/rekam-akses.cjs

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const AKAR = path.resolve(__dirname, "..");
const OUT = path.join(AKAR, "public", "rekaman");
const URL_CORE = process.env.SENTRA_URL || "https://localhost:8443";
const jeda = (ms) => new Promise((r) => setTimeout(r, ms));
const data = { mulai: Date.now(), video: {}, penanda: [], galat: [] };

async function kotak(page, sel) {
  const b = await page.locator(sel).first().boundingBox().catch(() => null);
  return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null;
}
async function teks(page, sel) {
  return ((await page.textContent(sel).catch(() => "")) || "").replace(/\s+/g, " ").trim();
}

(async () => {
  const browser = await chromium.launch();
  const buat = async (nama, email) => {
    const ctx = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: path.join(OUT, `_mentah-${nama}`), size: { width: 1920, height: 1080 } },
    });
    const page = await ctx.newPage();
    data.video[nama] = { berkas: `rekaman/akses-${nama}.webm`, akun: email, mulai: Date.now() };
    page.on("pageerror", (e) => data.galat.push({ di: nama, pesan: e.message }));
    return { ctx, page, nama, email };
  };
  const op = await buat("operator", "operator.a@sentra.lab");
  const an = await buat("analis", "analis@sentra.lab");

  const masuk = async ({ page, nama, email }) => {
    await page.goto(`${URL_CORE}/login`);
    await page.fill("#email", email);
    await page.fill("#password", "Latihan#2026");
    await page.click("button[type=submit]");
    await page.waitForURL("**/beranda");
    await page.waitForFunction(() => document.querySelector("[data-sentra-live]")?.dataset.mode === "live", null, { timeout: 15000 }).catch(() => {});
    await jeda(1500);
    data.penanda.push({
      t: Date.now(),
      video: nama,
      id: "beranda",
      ket: `Beranda ${email}`,
      agent: await teks(page, "[data-testid=kartu-agent]"),
      insiden: await teks(page, "[data-testid=kartu-insiden]"),
      kotak: {
        agent: await kotak(page, "[data-testid=kartu-agent]"),
        menu: await kotak(page, 'aside[aria-label="Menu operasi"] nav'),
        peta: await kotak(page, "section[aria-labelledby=pohon-satuan]"),
        pengguna: await kotak(page, 'aside[aria-label="Menu operasi"] > div:last-child'),
      },
    });
    await page.screenshot({ path: path.join(OUT, "stills", `akses-${nama}.png`) });
  };
  await Promise.all([masuk(op), masuk(an)]);
  await jeda(9000);
  for (const x of [op, an]) {
    await x.page.click('aside[aria-label="Menu operasi"] a:has-text("Insiden")');
    await x.page.waitForURL("**/insiden");
  }
  await jeda(1500);
  for (const x of [op, an]) {
    data.penanda.push({ t: Date.now(), video: x.nama, id: "insiden", ket: `Daftar insiden ${x.email}`, baris: await x.page.locator("main table tbody tr").count() });
    await x.page.screenshot({ path: path.join(OUT, "stills", `akses-${x.nama}-insiden.png`) });
  }
  await jeda(6000);

  for (const x of [op, an]) {
    const v = await x.page.video();
    await x.ctx.close();
    fs.renameSync(await v.path(), path.join(OUT, `akses-${x.nama}.webm`));
    fs.rmSync(path.join(OUT, `_mentah-${x.nama}`), { recursive: true, force: true });
  }
  await browser.close();
  data.selesai = Date.now();
  fs.writeFileSync(path.join(AKAR, "src", "data", "akses.json"), JSON.stringify(data, null, 1));
  console.log(JSON.stringify(data.penanda.map((p) => [p.video, p.id, p.agent || p.baris]), null, 0), "galat", data.galat.length);
})();
