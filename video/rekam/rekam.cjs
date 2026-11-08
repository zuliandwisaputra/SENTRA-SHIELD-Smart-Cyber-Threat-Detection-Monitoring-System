// Perekam footage ASLI untuk video demo SENTRA SHIELD.
//
// Menjalankan skenario serangan sungguhan dari container attacker di lab, sambil merekam browser
// (Playwright recordVideo) untuk akun Analis (desktop 1920x1080) dan Komandan (viewport HP).
// Semua keluaran terminal disimpan apa adanya beserta waktunya; semua angka diukur di sini.
//
// Dipanggil oleh rekam.sh (yang lebih dulu me-reset lab dari nol). Jangan jalankan di lab produksi.
//
// Keluaran:
//   public/rekaman/analis-desktop.webm, komandan-hp.webm   (footage, tidak di-commit)
//   public/rekaman/stills/*.png                             (tangkapan layar tajam di momen penting)
//   public/rekaman/lapsit.pdf                               (LAPSIT asli hasil unduhan)
//   src/data/rekaman.json                                   (transkrip terminal, penanda, sampel layar, ukuran)

const { chromium, devices } = require("playwright");
const { spawn, execSync, execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const AKAR = path.resolve(__dirname, "..");
const OUT = path.join(AKAR, "public", "rekaman");
const STILLS = path.join(OUT, "stills");
const DATA = path.join(AKAR, "src", "data");
const URL_CORE = process.env.SENTRA_URL || "https://localhost:8443";
// Perintah docker compose lab (tanpa spasi di path). Contoh sandbox: "docker compose -f ../lab/docker-compose.yml --env-file x.env".
const DC = process.env.SENTRA_DC || `docker compose -f ${path.resolve(AKAR, "..", "lab", "docker-compose.yml")}`;
const DC_ARGS = DC.trim().split(/\s+/);
const dc = (args, opt = {}) => execFileSync(DC_ARGS[0], [...DC_ARGS.slice(1), ...args], { stdio: ["ignore", "pipe", "ignore"], ...opt });
const SANDI = "Latihan#2026";
const KODIM_A = "172.30.0.11";
const KODIM_B = "172.30.0.12";
const PLC = "172.30.0.20";

fs.mkdirSync(STILLS, { recursive: true });
fs.mkdirSync(DATA, { recursive: true });

const rekaman = {
  versi: 1,
  catatan:
    "Semua isi berkas ini dihasilkan otomatis oleh video/rekam/rekam.cjs dari lab yang berjalan. Waktu dalam epoch milidetik (t) kecuali disebut lain.",
  mulai: Date.now(),
  selesai: null,
  git: null,
  video: {},
  terminal: [],
  penanda: [],
  sampel: { analis: [], komandan: [] },
  ukur: {},
  db: {},
  galat: [],
};
try {
  rekaman.git = execSync("git rev-parse --short HEAD", { cwd: AKAR }).toString().trim();
} catch {}

const jeda = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 23), ...a);
const tanpaAnsi = (s) => s.replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "").replace(/\r/g, "");

function simpan() {
  fs.writeFileSync(path.join(DATA, "rekaman.json"), JSON.stringify(rekaman, null, 1));
}

// ---------- Terminal: jalankan perintah di container, simpan setiap baris + waktunya ----------
function terminal(id, judul, perintah, { container = "attacker", env = {}, latar = false } = {}) {
  const entri = { id, judul, container, perintah, mulai: Date.now(), selesai: null, kode: null, baris: [] };
  rekaman.terminal.push(entri);
  const envArgs = Object.entries({ PYTHONUNBUFFERED: "1", ...env }).flatMap(([k, v]) => ["-e", `${k}=${v}`]);
  // stdbuf: keluaran per baris (bukan per blok) agar waktu tiap baris akurat. 2>&1: stderr ikut terekam.
  // Tanpa shell di sisi host, jadi isi perintah sampai ke container apa adanya.
  log(`[${id}] $ ${perintah.split("\n")[0]}`);
  const p = spawn(DC_ARGS[0], [...DC_ARGS.slice(1), "exec", "-T", ...envArgs, container, "stdbuf", "-oL", "-eL", "sh", "-c", `${perintah} 2>&1`]);
  const baca = readline.createInterface({ input: p.stdout });
  baca.on("line", (l) => {
    const teks = tanpaAnsi(l);
    entri.baris.push({ t: Date.now(), teks });
    if (process.env.GEMA) log(`  ${id}| ${teks}`);
  });
  p.stderr.on("data", (d) => entri.baris.push({ t: Date.now(), teks: tanpaAnsi(d.toString()).trimEnd(), stderr: true }));
  const selesai = new Promise((res) =>
    p.on("close", (kode) => {
      entri.selesai = Date.now();
      entri.kode = kode;
      log(`[${id}] selesai kode=${kode} baris=${entri.baris.length} durasi=${((entri.selesai - entri.mulai) / 1000).toFixed(1)}s`);
      simpan();
      res(entri);
    }),
  );
  return latar ? { entri, selesai, proses: p } : selesai;
}

function sql(q) {
  return dc(["exec", "-T", "mysql", "mysql", "-usentra", "-psentra-lab", "sentra", "-N", "-B", "-r", "-e", q]).toString().trim();
}
function sqlJson(q) {
  const s = sql(q);
  return s ? JSON.parse(s) : null;
}

// ---------- Penanda (marker) untuk penyuntingan di Remotion ----------
function tandai(video, id, ket, extra = {}) {
  const m = { t: Date.now(), video, id, ket, ...extra };
  rekaman.penanda.push(m);
  log(`  > ${video}:${id} ${ket}`);
  simpan();
  return m;
}
async function kotak(page, selector) {
  try {
    const b = await page.locator(selector).first().boundingBox();
    return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null;
  } catch {
    return null;
  }
}
async function still(page, nama) {
  try {
    await page.screenshot({ path: path.join(STILLS, `${nama}.png`) });
  } catch (e) {
    rekaman.galat.push({ t: Date.now(), di: `still ${nama}`, pesan: e.message });
  }
}

// ---------- Sampel layar: catat setiap perubahan keadaan yang terlihat ----------
function sampler(page, nama) {
  let terakhir = "";
  let aktif = true;
  (async () => {
    while (aktif) {
      try {
        const s = await page.evaluate(() => {
          const q = (sel) => document.querySelector(sel);
          const t = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : null);
          const story = q("section[aria-labelledby=attack-story]");
          return {
            path: location.pathname,
            scrollY: Math.round(window.scrollY),
            live: q("[data-sentra-live]")?.dataset.mode ?? null,
            siaga: t(q('a[title="Tingkat Siaga keseluruhan"]')),
            insiden: t(q("[data-testid=kartu-insiden]")),
            agent: t(q("[data-testid=kartu-agent]")),
            blokir: t(q("[data-testid=kartu-blokir]")),
            skor: t(q("[data-testid=skor]")),
            tahap: story ? story.querySelectorAll("ol > li > div.bg-accent").length : null,
            cakupan: t(q("[data-testid=cakupan]")),
          };
        });
        const k = JSON.stringify(s);
        if (k !== terakhir) {
          terakhir = k;
          rekaman.sampel[nama].push({ t: Date.now(), ...s });
        }
      } catch {}
      await jeda(400);
    }
  })();
  return () => {
    aktif = false;
  };
}

// ---------- Aksi browser yang terlihat ----------
async function ketik(page, sel, teks) {
  await page.locator(sel).click();
  await page.locator(sel).pressSequentially(teks, { delay: 55 });
}
async function masuk(page, video, email) {
  await page.goto(`${URL_CORE}/login`);
  await page.waitForSelector("#email");
  await jeda(1200);
  tandai(video, "login", `Halaman masuk, akun ${email}`);
  await ketik(page, "#email", email);
  await jeda(300);
  await ketik(page, "#password", SANDI);
  await jeda(500);
  await page.click("button[type=submit]");
  await page.waitForURL("**/beranda");
  await page
    .waitForFunction(() => document.querySelector("[data-sentra-live]")?.dataset.mode === "live", null, { timeout: 15000 })
    .catch(() => rekaman.galat.push({ t: Date.now(), di: `${video} live`, pesan: "indikator tidak Live dalam 15 detik" }));
}
async function klik(page, video, selector, id, ket) {
  const loc = page.locator(selector).first();
  await loc.scrollIntoViewIfNeeded();
  await jeda(500);
  const b = await loc.boundingBox();
  tandai(video, id, ket, { klik: b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null });
  await loc.hover().catch(() => {});
  await jeda(500);
  await loc.click();
}
async function menuDesktop(page, label, id) {
  await klik(page, "analis", `aside[aria-label="Menu operasi"] a:has-text("${label}")`, id, `Menu ${label}`);
  await page.waitForLoadState("networkidle").catch(() => {});
  await jeda(800);
}
async function menuHp(page, label, id) {
  await klik(page, "komandan", 'button[aria-label="Buka menu operasi"]', `${id}-laci`, "Buka menu operasi");
  await jeda(1200);
  await klik(page, "komandan", `[role=dialog][aria-label="Menu operasi"] a:has-text("${label}")`, id, `Menu ${label}`);
  await page.waitForLoadState("networkidle").catch(() => {});
  await jeda(800);
}
async function gulirKe(page, video, selector, id, ket, offset = 90) {
  const y = await page.evaluate(
    ([s, o]) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const top = el.getBoundingClientRect().top + window.scrollY - o;
      window.scrollTo({ top, behavior: "smooth" });
      return top;
    },
    [selector, offset],
  );
  await jeda(1400);
  tandai(video, id, ket, { kotak: await kotak(page, selector), scrollY: y });
}
async function gulirAtas(page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await jeda(1200);
}
async function tunggu(page, fn, arg, batas, label) {
  const t0 = Date.now();
  try {
    await page.waitForFunction(fn, arg, { timeout: batas, polling: 200 });
    const dt = Date.now() - t0;
    log(`  ~ ${label}: ${(dt / 1000).toFixed(2)} s`);
    return Date.now();
  } catch {
    rekaman.galat.push({ t: Date.now(), di: label, pesan: `tidak terjadi dalam ${batas} ms` });
    return null;
  }
}

// ---------- Alur rekaman ----------
(async () => {
  const browser = await chromium.launch();

  const ctxA = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    acceptDownloads: true,
    recordVideo: { dir: path.join(OUT, "_mentah-analis"), size: { width: 1920, height: 1080 } },
  });
  rekaman.video.analis = { berkas: "rekaman/analis-desktop.webm", akun: "analis@sentra.lab", viewport: [1920, 1080], mulai: Date.now() };
  const A = await ctxA.newPage();
  rekaman.video.analis.mulai = Date.now();
  A.on("pageerror", (e) => rekaman.galat.push({ t: Date.now(), di: "analis pageerror", pesan: e.message }));

  const hp = { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } };
  const ctxK = await browser.newContext({
    ...hp,
    ignoreHTTPSErrors: true,
    recordVideo: { dir: path.join(OUT, "_mentah-komandan"), size: { width: 390, height: 844 } },
  });
  const K = await ctxK.newPage();
  rekaman.video.komandan = {
    berkas: "rekaman/komandan-hp.webm",
    akun: "komandan@sentra.lab",
    viewport: [390, 844],
    perangkat: "iPhone 13 (emulasi Playwright, viewport 390x844)",
    mulai: Date.now(),
  };
  K.on("pageerror", (e) => rekaman.galat.push({ t: Date.now(), di: "komandan pageerror", pesan: e.message }));
  simpan();

  const henti = [sampler(A, "analis"), sampler(K, "komandan")];
  const U = rekaman.ukur;

  try {
    // 0. Masuk
    await masuk(A, "analis", "analis@sentra.lab");
    await jeda(2500);
    tandai("analis", "beranda-awal", "Beranda Komando sebelum serangan", {
      kotak: { situasi: await kotak(A, "[data-testid=tingkat-keseluruhan]"), peta: await kotak(A, "section[aria-labelledby=pohon-satuan]") },
      siaga: await A.textContent('a[title="Tingkat Siaga keseluruhan"]').catch(() => null),
    });
    await still(A, "01-beranda-awal");
    await masuk(K, "komandan", "komandan@sentra.lab");
    tandai("komandan", "beranda-awal", "Beranda Komando di HP");
    await jeda(1500);
    await still(K, "01-hp-beranda-awal");
    await jeda(4000);

    // 1. Pengintaian: nmap ke Kodim A, Analis menonton Beranda
    tandai("serangan", "nmap-a", "nmap ke Kodim A");
    const tNmap = Date.now();
    // Insiden pemindaian berkeparahan Rendah, jadi Tingkat Siaga tetap Aman; yang berubah adalah kartu Insiden terbuka.
    const pantauSiaga = tunggu(A, () => /Insiden terbuka\s*[1-9]/.test(document.querySelector("[data-testid=kartu-insiden]")?.textContent || ""), null, 60000, "Kartu Insiden terbuka di Beranda berubah setelah nmap");
    await terminal("nmap-kodim-a", "Pengintaian: pindai port Kodim A", `./skenario/01-pindai.sh ${KODIM_A}`);
    const tSiaga = await pantauSiaga;
    if (tSiaga) {
      U.nmapKeInsidenDiBerandaMs = tSiaga - tNmap;
      tandai("analis", "beranda-insiden-pertama", "Insiden pertama tampil di Beranda tanpa muat ulang", {
        kotak: { situasi: await kotak(A, "[data-testid=tingkat-keseluruhan]"), insiden: await kotak(A, "[data-testid=kartu-insiden]") },
      });
    }
    await jeda(1500);
    await still(A, "02-beranda-setelah-nmap");
    await jeda(2000);

    // 2. Akses awal: hydra brute force SSH ke Kodim A
    tandai("serangan", "hydra-a", "hydra brute force SSH ke Kodim A");
    const hydra = terminal("hydra-kodim-a", "Akses awal: brute force SSH Kodim A", `./skenario/02-bruteforce-ssh.sh ${KODIM_A}`, { latar: true });
    await jeda(12000);
    await gulirKe(A, "analis", "section[aria-labelledby=feed-judul]", "arus-event", "Arus event live saat brute force");
    await jeda(1000);
    await still(A, "03-arus-event");
    await jeda(14000);
    await gulirAtas(A);
    tandai("analis", "beranda-saat-hydra", "Beranda saat brute force berjalan");
    await hydra.selesai;
    await jeda(3000);
    await still(A, "04-beranda-setelah-hydra");

    // 3. IP yang sama memindai Kodim B -> Kampanye lintas satuan
    tandai("serangan", "nmap-b", "nmap ke Kodim B");
    const tNmapB = Date.now();
    const pantauDua = tunggu(A, () => document.body.textContent.includes("2 satuan sasaran"), null, 60000, "Peta operasi: 2 satuan sasaran");
    await terminal("nmap-kodim-b", "Pengintaian: pindai port Kodim B", `./skenario/01-pindai.sh ${KODIM_B}`);
    const tDua = await pantauDua;
    if (tDua) U.nmapBKeDuaSatuanDiBerandaMs = tDua - tNmapB;
    await jeda(3000);
    tandai("analis", "beranda-kampanye", "Peta operasi: dua satuan sasaran dari IP yang sama", {
      kotak: { peta: await kotak(A, "section[aria-labelledby=pohon-satuan]") },
    });
    await still(A, "05-beranda-dua-satuan");
    await jeda(3000);
    await menuDesktop(A, "Kampanye", "menu-kampanye");
    await jeda(2000);
    await still(A, "06-daftar-kampanye");
    await klik(A, "analis", 'main a[href*="/kampanye/"]', "buka-kampanye", "Buka kampanye");
    await A.waitForURL("**/kampanye/*");
    await jeda(2500);
    const kampanyeId = Number(A.url().split("/").pop());
    U.kampanye = sqlJson(
      `select json_object('id', id, 'src_ip', src_ip, 'unit_count', unit_count, 'status', status, 'dibuat', date_format(created_at, '%Y-%m-%d %H:%i:%s')) from campaigns where id=${kampanyeId}`,
    );
    tandai("analis", "kampanye", "Kampanye lintas satuan", { kotak: { urutan: await kotak(A, "section[aria-labelledby=urutan]") } });
    await still(A, "07-kampanye");
    await jeda(6000);

    // 4. Detail Insiden Kodim A, lalu eksploitasi + OT sambil Attack Story terisi live
    await menuDesktop(A, "Insiden", "menu-insiden");
    await jeda(1500);
    await still(A, "08-daftar-insiden");
    const incA = Number(
      sql(`select i.id from incidents i join units u on u.id=i.unit_id where u.code='KODIM-LAT-A' and i.src_ip='172.30.0.66' order by i.id limit 1`),
    );
    U.insidenKodimA = incA;
    await klik(A, "analis", `main a:visible[href$="/insiden/${incA}"]`, "buka-insiden", "Buka insiden Kodim A");
    await A.waitForURL(`**/insiden/${incA}`);
    await jeda(2500);
    tandai("analis", "detail-insiden-awal", "Detail Insiden: tahap Pengintaian dan Akses Awal", {
      kotak: { story: await kotak(A, "section[aria-labelledby=attack-story]"), skor: await kotak(A, "[data-testid=skor]") },
    });
    await still(A, "09-insiden-awal");
    await jeda(3000);

    tandai("serangan", "sqlmap-a", "sqlmap ke portal Kodim A");
    await terminal("sqlmap-kodim-a", "Akses awal: SQL injection portal Kodim A", `./skenario/03-sqlmap.sh ${KODIM_A}`);
    await jeda(4000);
    await still(A, "10-insiden-setelah-sqlmap");
    tandai("serangan", "webshell-a", "Unggah webshell ke portal Kodim A");
    await terminal("webshell-kodim-a", "Persistensi: unggah webshell", `./skenario/05-webshell.sh ${KODIM_A}`);
    await jeda(4000);
    await still(A, "11-insiden-setelah-webshell");
    tandai("serangan", "modbus", "Perintah tulis Modbus ke PLC");
    await terminal("modbus-plc", "Dampak OT: tulis Modbus ke PLC", `python3 skenario/04-modbus-tulis.py ${PLC}`);
    await jeda(4000);
    await still(A, "12-insiden-setelah-modbus");
    tandai("serangan", "judol", "Injeksi judi online ber-cloaking ke portal Kodim A");
    await terminal("judol-kodim-a", "Dampak: injeksi judi online ber-cloaking", `./skenario/06-judol-cloaking.sh ${KODIM_A}`);
    await jeda(3000);
    tandai("analis", "detail-insiden-lengkap", "Attack Story lengkap, skor Kritis", {
      kotak: { story: await kotak(A, "section[aria-labelledby=attack-story]"), skor: await kotak(A, "[data-testid=skor]") },
      skor: await A.textContent("[data-testid=skor]").catch(() => null),
    });
    await still(A, "13-insiden-lengkap");
    await jeda(3000);
    await gulirKe(A, "analis", "section[aria-labelledby=rincian-skor]", "rincian-skor", "Rincian skor dengan rumus terbuka");
    await still(A, "14-rincian-skor");
    await jeda(4000);
    await gulirKe(A, "analis", "section[aria-labelledby=bukti]", "event-bukti", "Event bukti mentah");
    await still(A, "15-event-bukti");
    await jeda(3000);
    await gulirAtas(A);

    // 5. Penjaga Situs memeriksa portal (sama dengan jadwal tiap menit, dijalankan sekarang)
    tandai("core", "penjaga-situs", "Core: Penjaga Situs memeriksa portal");
    await terminal("penjaga-situs", "Core: Penjaga Situs memeriksa portal", "php artisan sentra:penjaga-situs", { container: "sentra-core" });
    await menuDesktop(A, "Penjaga Situs", "menu-penjaga-situs");
    await jeda(2000);
    tandai("analis", "penjaga-situs", "Penjaga Situs: versi Googlebot berisi judi", {
      kotak: { status: await kotak(A, "[data-testid=status-situs]"), googlebot: await kotak(A, "[data-testid=varian-googlebot]") },
    });
    await still(A, "16-penjaga-situs");
    await jeda(3000);
    await gulirKe(A, "analis", "[data-testid=varian-googlebot]", "penjaga-situs-varian", "Perbandingan varian browser vs Googlebot", 160);
    await still(A, "17-penjaga-situs-varian");
    await jeda(5000);
    await gulirAtas(A);

    // 6. Respons berjenjang: Analis mengusulkan, Komandan menyetujui dari HP, penyerang terputus
    const loop = terminal(
      "akses-portal",
      "Penyerang mencoba membuka portal Kodim A",
      [
        "n=0; gagal=0",
        "while [ $n -lt 600 ]; do",
        "  n=$((n+1)); w=$(TZ=WIB-7 date +%H:%M:%S.%3N)",
        `  k=$(curl -s -m 1 -o /dev/null -w '%{http_code}' http://${KODIM_A}/)`,
        `  if [ "$k" = "200" ]; then echo "$w GET http://${KODIM_A}/ -> HTTP $k (tersambung)";`,
        "  else gagal=$((gagal+1))",
        `    if [ $gagal -eq 1 ]; then echo "$w GET http://${KODIM_A}/ -> kode $k"; echo "Koneksi penyerang ke Kodim A TERPUTUS (kode $k). Blokir nftables bekerja.";`,
        `    else echo "$w GET http://${KODIM_A}/ -> kode $k (masih terputus)"; fi`,
        "    [ $gagal -ge 4 ] && break",
        "  fi",
        "  sleep 0.5",
        "done",
      ].join("\n"),
      { latar: true },
    );
    tandai("serangan", "akses-portal", "Penyerang terus membuka portal Kodim A");
    await jeda(2000);
    await A.goto(`${URL_CORE}/insiden/${incA}`);
    await jeda(2000);
    await gulirKe(A, "analis", "section[aria-labelledby=tindakan]", "panel-tindakan", "Panel Tindakan respons");
    await jeda(1500);
    await klik(A, "analis", "#durasi", "pilih-durasi", "Pilih durasi blokir");
    await A.selectOption("#durasi", "3600");
    await jeda(1200);
    await klik(A, "analis", 'button:has-text("Usulkan blokir IP")', "usulkan", "Analis mengusulkan blokir IP");
    const tUsul = Date.now();
    await A.waitForSelector("text=Usulan blokir dikirim", { timeout: 15000 });
    tandai("analis", "usulan-terkirim", "Usulan blokir terkirim ke Antrean Persetujuan", { kotak: { tindakan: await kotak(A, "section[aria-labelledby=tindakan]") } });
    await still(A, "18-usulan-terkirim");

    await jeda(1500);
    await menuHp(K, "Antrean Persetujuan", "hp-antrean");
    await K.waitForSelector("[data-testid=usulan]", { timeout: 15000 });
    U.usulKeAntreanHpMs = Date.now() - tUsul;
    await jeda(2000);
    tandai("komandan", "antrean", "Antrean Persetujuan di HP Komandan", { kotak: { usulan: await kotak(K, "[data-testid=usulan]") } });
    await still(K, "19-hp-antrean");
    await jeda(2500);
    await klik(K, "komandan", 'button:has-text("Setujui")', "setujui", "Komandan menyetujui dari HP");
    const tSetuju = Date.now();
    U.waktuSetuju = tSetuju;
    await K.waitForSelector("text=Disetujui. Perintah dikirim", { timeout: 15000 });
    tandai("komandan", "disetujui", "Perintah dikirim ke agent");
    await still(K, "20-hp-disetujui");
    const tDieksekusi = tunggu(A, () => !!document.querySelector("section[aria-labelledby=tindakan]")?.textContent.includes("Dieksekusi"), null, 30000, "Detail Insiden Analis berubah ke Dieksekusi");
    const hasilLoop = await loop.selesai;
    const tEks = await tDieksekusi;
    if (tEks) {
      U.setujuKeDieksekusiDiLayarAnalisMs = tEks - tSetuju;
      tandai("analis", "dieksekusi", "Status tindakan Dieksekusi tanpa muat ulang", { kotak: { tindakan: await kotak(A, "section[aria-labelledby=tindakan]") } });
    }
    await still(A, "21-dieksekusi");
    // Waktu putus: waktu MULAI permintaan pertama yang gagal, dibaca dari keluaran terminal penyerang (WIB).
    const keMs = (teks) => {
      const m = teks.match(/^(\d\d):(\d\d):(\d\d)\.(\d{3}) GET/);
      if (!m) return null;
      const d = new Date(tSetuju + 7 * 3600e3); // tanggal WIB
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), +m[1] - 7, +m[2], +m[3], +m[4]);
    };
    const barisOk = hasilLoop.baris.filter((b) => / HTTP 200 /.test(b.teks));
    const barisGagal = hasilLoop.baris.find((b) => /-> kode /.test(b.teks));
    U.portal = {
      permintaanSukses: barisOk.length,
      suksesTerakhirSebelumPutus: barisOk.length ? barisOk[barisOk.length - 1].teks : null,
      gagalPertama: barisGagal ? barisGagal.teks : null,
      setujuKeGagalPertamaMs: barisGagal ? keMs(barisGagal.teks) - tSetuju : null,
      setujuKeSuksesTerakhirMs: barisOk.length ? keMs(barisOk[barisOk.length - 1].teks) - tSetuju : null,
      catatan:
        "Penyerang membuka portal tiap ~0,5 detik (curl, batas 1 detik). Blokir aktif di antara sukses terakhir dan gagal pertama; angka yang dipakai adalah gagal pertama.",
    };
    log("  ~ portal", JSON.stringify(U.portal));
    await jeda(3000);
    await menuHp(K, "Beranda", "hp-beranda");
    await jeda(2000);
    await still(K, "22-hp-beranda-blokir");

    await menuDesktop(A, "Beranda", "menu-beranda-blokir");
    await jeda(1500);
    tandai("analis", "beranda-blokir", "Beranda: blokir aktif", { kotak: { blokir: await kotak(A, "[data-testid=kartu-blokir]") } });
    await still(A, "23-beranda-blokir");
    await jeda(4000);
    await menuDesktop(A, "Tindakan", "menu-tindakan");
    await jeda(1500);
    tandai("analis", "riwayat-tindakan", "Riwayat tindakan: pengusul, pemutus, hasil agent");
    await still(A, "24-tindakan");
    await jeda(5000);

    // 7. LAPSIT
    await A.goto(`${URL_CORE}/insiden/${incA}`);
    await jeda(1500);
    await gulirKe(A, "analis", "section[aria-labelledby=lapsit]", "panel-lapsit", "Panel LAPSIT");
    const nLapsit = await A.locator('li[wire\\:key^="lapsit-"]').count();
    await klik(A, "analis", 'button:has-text("Buat LAPSIT")', "buat-lapsit", "Analis membuat LAPSIT");
    const tLap = Date.now();
    await A.waitForFunction((n) => document.querySelectorAll('li[wire\\:key^="lapsit-"]').length > n, nLapsit, { timeout: 150000 });
    U.lapsitMs = Date.now() - tLap;
    await jeda(1500);
    await gulirKe(A, "analis", "section[aria-labelledby=lapsit]", "lapsit-terbit", "LAPSIT terbit dengan sitasi bukti", 70);
    await still(A, "25-lapsit");
    await jeda(4000);
    const [unduh] = await Promise.all([
      A.waitForEvent("download"),
      klik(A, "analis", 'section[aria-labelledby=lapsit] :text("Unduh PDF")', "unduh-pdf", "Unduh PDF LAPSIT"),
    ]);
    await unduh.saveAs(path.join(OUT, "lapsit.pdf"));
    U.lapsit = sqlJson(
      `select json_object('id', id, 'generator', generator, 'sha256', sha256, 'dibuat', date_format(created_at, '%Y-%m-%d %H:%i:%s')) from reports order by id desc limit 1`,
    );
    await jeda(3000);
    await gulirAtas(A);

    // 8. Sensor Buta: sensor Kodim B dimatikan (simulasi penyerang mematikan agent)
    await menuDesktop(A, "Beranda", "menu-beranda-sensor");
    await jeda(2000);
    tandai("lab", "sensor-mati", "Agent Kodim B dimatikan");
    const tMati = Date.now();
    await terminal("sensor-mati", "Simulasi: sensor Kodim B dimatikan", "supervisorctl stop sentra-agent", { container: "kodim-b" });
    const tButa = await tunggu(A, () => /buta/i.test(document.querySelector("[data-testid=kartu-agent]")?.textContent || "") && !/tidak ada agent buta/i.test(document.querySelector("[data-testid=kartu-agent]")?.textContent || ""), null, 120000, "Beranda menandai agent BUTA");
    if (tButa) {
      U.sensorMatiKeButaMs = tButa - tMati;
      tandai("analis", "agent-buta", "Agent Kodim B BUTA", { kotak: { agent: await kotak(A, "[data-testid=kartu-agent]"), peta: await kotak(A, "section[aria-labelledby=pohon-satuan]") } });
    }
    await jeda(2000);
    await still(A, "26-agent-buta");
    await jeda(3000);
    await menuDesktop(A, "Insiden", "menu-insiden-sensor");
    await jeda(1500);
    tandai("analis", "insiden-sensor-buta", "Insiden Sensor Buta di daftar");
    await still(A, "27-insiden-sensor-buta");
    await jeda(3000);
    tandai("lab", "sensor-hidup", "Agent Kodim B dihidupkan kembali");
    const tHidup = Date.now();
    await terminal("sensor-hidup", "Agent Kodim B dihidupkan kembali", "supervisorctl start sentra-agent", { container: "kodim-b" });
    await menuDesktop(A, "Beranda", "menu-beranda-hidup");
    const tOnline = await tunggu(A, () => /3\s*\/\s*3/.test(document.querySelector("[data-testid=kartu-agent]")?.textContent || ""), null, 90000, "Agent kembali 3/3");
    if (tOnline) U.sensorHidupKeOnlineMs = tOnline - tHidup;
    await jeda(2000);
    await still(A, "28-agent-pulih");

    // 9. Uji Kesiapan
    await menuDesktop(A, "Uji Kesiapan", "menu-uji");
    await jeda(1500);
    await klik(A, "analis", "#satuan", "pilih-satuan", "Pilih satuan Kodim Latihan A");
    const opsi = await A.$$eval("#satuan option", (os) => os.map((o) => ({ v: o.value, t: o.textContent.trim() })));
    const pilihan = opsi.find((o) => /Kodim Latihan A/i.test(o.t));
    if (pilihan) await A.selectOption("#satuan", pilihan.v);
    await jeda(1000);
    await klik(A, "analis", 'button:has-text("Jalankan Uji Kesiapan")', "jalankan-uji", "Jalankan Uji Kesiapan");
    const tUji = Date.now();
    let status = "";
    for (let i = 0; i < 80 && status !== "selesai"; i++) {
      await jeda(3000);
      status = sql("select status from readiness_runs order by id desc limit 1");
    }
    U.ujiKesiapanDurasiMs = Date.now() - tUji;
    await jeda(4000);
    tandai("analis", "uji-selesai", "Matriks Uji Kesiapan terisi", { kotak: { cakupan: await kotak(A, "[data-testid=cakupan]") } });
    await still(A, "29-uji-selesai");
    await jeda(3000);
    await gulirKe(A, "analis", "[data-testid=cakupan]", "uji-matriks", "Matriks skenario", 140);
    await still(A, "30-uji-matriks");
    await jeda(5000);
    await gulirAtas(A);

    // 10. Audit Log: Verifikasi Rantai
    await menuDesktop(A, "Audit Log", "menu-audit");
    await jeda(2000);
    await klik(A, "analis", 'button:has-text("Verifikasi Rantai")', "verifikasi", "Verifikasi Rantai audit");
    await A.waitForSelector("[data-testid=hasil-verifikasi]", { timeout: 30000 });
    await jeda(1500);
    tandai("analis", "audit-utuh", "Rantai audit utuh", { kotak: { hasil: await kotak(A, "[data-testid=hasil-verifikasi]") } });
    U.auditTeks = (await A.textContent("[data-testid=hasil-verifikasi]").catch(() => "")).replace(/\s+/g, " ").trim();
    await still(A, "31-audit");
    await jeda(5000);

    // 11. Penutup: Beranda akhir
    await menuDesktop(A, "Beranda", "menu-beranda-akhir");
    await jeda(3000);
    tandai("analis", "beranda-akhir", "Beranda akhir");
    await still(A, "32-beranda-akhir");
    await still(K, "33-hp-beranda-akhir");
    await jeda(4000);
  } catch (e) {
    rekaman.galat.push({ t: Date.now(), di: "alur", pesan: e.stack || e.message });
    log("GALAT", e.message);
    await still(A, "galat-analis");
    await still(K, "galat-komandan");
  }

  henti.forEach((h) => h());
  rekaman.video.analis.selesai = Date.now();
  rekaman.video.komandan.selesai = Date.now();
  const vA = await A.video();
  const vK = await K.video();
  await ctxA.close();
  await ctxK.close();
  await browser.close();
  fs.renameSync(await vA.path(), path.join(OUT, "analis-desktop.webm"));
  fs.renameSync(await vK.path(), path.join(OUT, "komandan-hp.webm"));
  for (const d of ["_mentah-analis", "_mentah-komandan"]) fs.rmSync(path.join(OUT, d), { recursive: true, force: true });

  // ---------- Angka dari basis data lab (sumber kebenaran) ----------
  const ambil = (nama, q) => {
    try {
      rekaman.db[nama] = sqlJson(q);
    } catch (e) {
      rekaman.galat.push({ t: Date.now(), di: `db ${nama}`, pesan: e.message });
    }
  };
  ambil(
    "insiden",
    `select json_arrayagg(json_object('id', i.id, 'satuan', u.name, 'judul', i.title, 'src_ip', i.src_ip, 'skor', i.score, 'severity', i.severity, 'tahap_max', i.stage_max, 'kampanye', i.campaign_id, 'status', i.status, 'pertama', date_format(i.first_seen_at, '%Y-%m-%d %H:%i:%s.%f'), 'terakhir', date_format(i.last_seen_at, '%Y-%m-%d %H:%i:%s.%f'))) from incidents i join units u on u.id=i.unit_id`,
  );
  ambil(
    "deteksiPerAturan",
    `select json_arrayagg(json_object('aturan', x.code, 'nama', x.name, 'jumlah', x.n, 'insiden', x.inc, 'pertama', x.pertama)) from (select r.code, r.name, count(*) n, min(d.incident_id) inc, date_format(min(d.detected_at), '%Y-%m-%d %H:%i:%s.%f') pertama from detections d join detection_rules r on r.id=d.rule_id join events e on e.id=d.event_id where e.is_test=0 group by r.code, r.name order by r.code) x`,
  );
  ambil("jumlahEvent", `select json_object('semua', count(*), 'uji', sum(is_test), 'serangan', sum(src_ip='172.30.0.66')) from events`);
  ambil(
    "eventPerInsiden",
    `select json_arrayagg(json_object('insiden', x.incident_id, 'event', x.n)) from (select d.incident_id, count(distinct d.event_id) n from detections d where d.incident_id is not null group by d.incident_id) x`,
  );
  ambil(
    "tindakan",
    `select json_arrayagg(json_object('id', a.id, 'jenis', a.type, 'status', a.status, 'params', a.params, 'pengusul', pu.email, 'pemutus', ap.email, 'diusulkan', date_format(a.created_at, '%Y-%m-%d %H:%i:%s'), 'disetujui', date_format(a.approved_at, '%Y-%m-%d %H:%i:%s'), 'dieksekusi', date_format(a.executed_at, '%Y-%m-%d %H:%i:%s'), 'berlaku_sampai', date_format(a.expires_at, '%Y-%m-%d %H:%i:%s'), 'hasil', a.result)) from actions a left join users pu on pu.id=a.proposed_by left join users ap on ap.id=a.approved_by`,
  );
  ambil(
    "ujiKesiapan",
    `select json_object('id', id, 'status', status, 'cakupan', coverage, 'rata_ttd_ms', avg_ttd_ms, 'mulai', date_format(started_at, '%Y-%m-%d %H:%i:%s.%f'), 'selesai', date_format(finished_at, '%Y-%m-%d %H:%i:%s.%f')) from readiness_runs order by id desc limit 1`,
  );
  ambil(
    "ujiKesiapanHasil",
    `select json_arrayagg(json_object('skenario', r.scenario, 'aturan', d.code, 'terdeteksi', r.detected, 'ttd_ms', r.ttd_ms, 'catatan', r.note)) from readiness_results r join detection_rules d on d.id=r.rule_id where r.run_id=(select max(id) from readiness_runs)`,
  );
  ambil("insidenDariEventUji", `select json_object('jumlah', count(*)) from detections d join events e on e.id=d.event_id where e.is_test=1 and d.incident_id is not null`);
  ambil(
    "penjagaSitus",
    `select json_arrayagg(json_object('varian', variant, 'ditandai', flagged, 'kemiripan', similarity, 'kata_judi', gambling_hits, 'waktu', date_format(checked_at, '%Y-%m-%d %H:%i:%s.%f'))) from site_checks where check_uuid=(select check_uuid from site_checks where flagged=1 order by id desc limit 1)`,
  );
  ambil("auditJumlah", `select json_object('baris', count(*)) from audit_logs`);
  try {
    rekaman.db.auditVerifikasi = JSON.parse(
      dc(["exec", "-T", "sentra-core", "php", "artisan", "tinker", "--execute", "echo json_encode(app(App\\Services\\AuditLogger::class)->verify());"])
        .toString()
        .trim()
        .split("\n")
        .pop(),
    );
  } catch (e) {
    rekaman.galat.push({ t: Date.now(), di: "audit verify", pesan: e.message });
  }

  rekaman.selesai = Date.now();
  simpan();
  log("SELESAI. galat:", rekaman.galat.length);
  for (const g of rekaman.galat) log("  galat", g.di, g.pesan.split("\n")[0]);
})();
