import forms from '@tailwindcss/forms';

// Token warna didefinisikan sekali sebagai variabel CSS (resources/css/app.css)
// dan dipetakan di sini, sehingga modifier opasitas Tailwind tetap jalan
// (mis. bg-awas/15). Rincian dan alasan: docs/design-system.md.
const token = (nama) => `rgb(var(--${nama}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
    // Mode gelap permanen lewat class="dark" pada <html>.
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.js',
        // Kelas warna Tingkat Siaga/severity didefinisikan di enum PHP; lencana
        // status dan sorotan kata di beberapa komponen Livewire.
        './app/Enums/**/*.php',
        './app/Livewire/**/*.php',
    ],

    theme: {
        extend: {
            colors: {
                // 'canvas', bukan 'base': nama 'base' bentrok dengan utilitas ukuran huruf text-base.
                canvas: token('base'),
                panel: token('panel'),
                raised: token('raised'),
                inset: token('inset'),
                line: { DEFAULT: token('line'), strong: token('line-strong'), control: token('line-control') },
                ink: { DEFAULT: token('ink'), 2: token('ink-2'), 3: token('ink-3') },
                accent: { DEFAULT: token('accent'), ink: token('accent-ink'), strong: token('accent-strong') },
                // Tingkat Siaga satuan = severity: Aman/Rendah, Waspada/Sedang, Siaga/Tinggi, Awas/Kritis.
                aman: token('aman'),
                waspada: token('waspada'),
                siaga: token('siaga'),
                awas: token('awas'),
                // Netral Tailwind dipetakan ke netral SENTRA (sedikit kebiruan), agar
                // halaman lama ikut serasi dan teks redup tetap lolos WCAG AA.
                gray: {
                    50: '#F3F6FA', 100: '#E7EDF5', 200: '#DAE2EC', 300: '#C5D0DE', 400: '#A9B6C8',
                    500: '#8492A8', 600: '#52657F', 700: '#2C3C51', 800: '#1D2938', 900: '#0C121C', 950: '#070B12',
                },
            },
            fontFamily: {
                // Fira dibundel lokal (fontsource, OFL-1.1): tidak ada unduhan font dari internet.
                sans: ['"Fira Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
                display: ['"Fira Sans Condensed"', '"Fira Sans"', 'ui-sans-serif', 'system-ui', 'Arial Narrow', 'sans-serif'],
                mono: ['"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
            },
            borderRadius: {
                chip: '3px',
                control: '6px',
                panel: '8px',
            },
            boxShadow: {
                // Hanya untuk lapisan melayang (dropdown, dialog). Panel cukup bergaris.
                overlay: '0 10px 30px -8px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(var(--line-strong) / 1)',
            },
            transitionTimingFunction: {
                sentra: 'cubic-bezier(.2, .8, .2, 1)',
            },
            keyframes: {
                'denyut': {
                    '0%': { boxShadow: '0 0 0 0 rgb(var(--denyut, var(--aman)) / 0.55)' },
                    '70%': { boxShadow: '0 0 0 6px rgb(var(--denyut, var(--aman)) / 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgb(var(--denyut, var(--aman)) / 0)' },
                },
                'masuk': {
                    '0%': { opacity: '0', transform: 'translateY(-4px)', backgroundColor: 'rgb(var(--accent) / 0.16)' },
                    '40%': { opacity: '1', transform: 'translateY(0)' },
                    '100%': { backgroundColor: 'rgb(var(--accent) / 0)' },
                },
                'sorot': {
                    '0%': { color: 'rgb(var(--accent))' },
                    '100%': { color: 'inherit' },
                },
                'kilau': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'sapu': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
            },
            animation: {
                denyut: 'denyut 1.8s cubic-bezier(.2,.8,.2,1) infinite',
                masuk: 'masuk 1.4s cubic-bezier(.2,.8,.2,1) both',
                sorot: 'sorot 1.2s ease-out',
                kilau: 'kilau 1.6s linear infinite',
                sapu: 'sapu 9s linear infinite',
            },
        },
    },

    plugins: [forms],
};
