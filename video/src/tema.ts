// Token warna dan huruf identitas Olive Drab / Ops Darat.
// Sumber: docs/design-system.md dan core/resources/css/app.css. Jangan menambah warna di luar daftar ini.

export const warna = {
  canvas: "#0E110A", // latar olive-hitam
  panel: "#181D10", // pelat panel olive drab
  raised: "#20271A",
  inset: "#283020",
  line: "#343C26",
  lineStrong: "#4A5134",
  lineControl: "#8A8463",
  ink: "#ECE4C8", // teks utama (krem)
  ink2: "#CEC6A6",
  ink3: "#A69F80",
  accent: "#C9B57A", // khaki/tan
  accentStrong: "#DCCB96",
  accentInk: "#17140A", // teks di atas warna padat
  // Tingkat Siaga / keparahan
  pasir: "#D8C59C", // Rendah
  aman: "#5FD39A", // hijau sinyal
  waspada: "#E5A73B", // Sedang
  siaga: "#E07B42", // Tinggi
  awas: "#F06E5E", // Kritis
  grafik: "#9E8E58",
} as const;

export const huruf = {
  stensil: "'Saira Stencil One', 'Saira Condensed', sans-serif",
  kondensasi: "'Saira Condensed', 'Arial Narrow', sans-serif",
  mono: "'Fira Code', ui-monospace, monospace",
} as const;

// Ukuran video sesuai permintaan: 16:9, 1920x1080, 60 fps.
export const VIDEO = { width: 1920, height: 1080, fps: 60 } as const;

// Area aman teks penting (skill remotion-markup video-layout, diskalakan ke lebar 1920).
export const AMAN = { sisi: 144, atasBawah: 100 } as const;
