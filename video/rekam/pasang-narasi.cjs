// Pasang narasi suara: ubah ke WAV, kurangi dengung, potong hening awal/akhir, samakan volume.
//   node rekam/pasang-narasi.cjs <folder sumber>
// Sumber boleh .m4a/.mp4/.mpeg/.mp3/.wav dari HP. Nama berkas cukup nama adegan ("intro", "serangan lanjut",
// "hak akses", ...) atau id lengkap ("04-deteksi"). Hasil: public/narasi/<id>.wav (48 kHz, mono, 24-bit)
// dan src/data/narasi.json (durasi hasil, dipakai untuk menyesuaikan durasi adegan).
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const AKAR = path.resolve(__dirname, "..");
const ID = ["01-intro", "02-masalah", "03-arsitektur", "04-deteksi", "05-serangan-lanjut", "06-respons", "07-lapsit", "08-ketahanan", "09-hak-akses", "10-angka", "11-penutup"];
const TARGET_LUFS = -16;

// Pembersihan: high-pass 80 Hz (dengung 50 Hz PLN dan gemuruh), notch sempit di harmonik 100/150 Hz,
// lalu pengurang derau FFT ringan yang melacak lantai derau.
const BERSIH = [
  "highpass=f=80:poles=2",
  "highpass=f=80:poles=2",
  "equalizer=f=100:t=q:w=10:g=-18",
  "equalizer=f=150:t=q:w=10:g=-12",
  "afftdn=nr=12:nf=-50:tn=1",
].join(",");
// Potong hening di awal dan akhir (ambang -45 dB), sisakan 0,12 detik agar napas tidak terpotong kasar.
const POTONG = [
  "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-45dB:start_silence=0.12",
  "areverse",
  "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-45dB:start_silence=0.12",
  "areverse",
].join(",");

const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-nostdin", "-y", ...args], { stdio: ["ignore", "pipe", "pipe"] });
const durasi = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

const cocokId = (nama) => {
  const dasar = nama.toLowerCase().replace(/(\.(m4a|mp4|mpeg|mp3|wav|aac|ogg|caf))+$/g, "").trim().replace(/[\s_]+/g, "-");
  return ID.find((id) => id === dasar || id.slice(3) === dasar || id === dasar.replace(/^(\d)-/, "0$1-"));
};

const sumber = path.resolve(process.argv[2] || "narasi-sumber");
const keluar = path.join(AKAR, "public", "narasi");
fs.mkdirSync(keluar, { recursive: true });
const laporan = {};
for (const nama of fs.readdirSync(sumber).sort()) {
  const id = cocokId(nama);
  if (!id) {
    console.log(`lewati: ${nama} (tidak cocok dengan id adegan)`);
    continue;
  }
  const masuk = path.join(sumber, nama);
  const sementara = path.join(keluar, `.${id}.bersih.wav`);
  ff(["-i", masuk, "-af", `${BERSIH},${POTONG}`, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", sementara]);
  // Loudnorm dua tahap: ukur dulu (hasil JSON ada di stderr), lalu terapkan secara linear ke -16 LUFS.
  const ukur = spawnSync("ffmpeg", ["-hide_banner", "-nostdin", "-i", sementara, "-af", `loudnorm=I=${TARGET_LUFS}:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"]);
  const json = ukur.stderr.toString();
  const m = JSON.parse(json.slice(json.lastIndexOf("{"), json.lastIndexOf("}") + 1));
  const hasil = path.join(keluar, `${id}.wav`);
  ff([
    "-i",
    sementara,
    "-af",
    `loudnorm=I=${TARGET_LUFS}:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
    "-ar",
    "48000",
    "-ac",
    "1",
    "-c:a",
    "pcm_s24le",
    hasil,
  ]);
  fs.rmSync(sementara);
  laporan[id] = { sumber: nama, durasiAsli: Number(durasi(masuk).toFixed(3)), durasi: Number(durasi(hasil).toFixed(3)), lufsAsli: Number(m.input_i) };
  console.log(`${id}: ${nama} ${laporan[id].durasiAsli}s -> ${laporan[id].durasi}s (LUFS asli ${m.input_i})`);
}
fs.writeFileSync(path.join(AKAR, "src", "data", "narasi.json"), JSON.stringify(laporan, null, 1));
const kurang = ID.filter((id) => !laporan[id]);
if (kurang.length) console.log("belum ada narasi:", kurang.join(", "));
