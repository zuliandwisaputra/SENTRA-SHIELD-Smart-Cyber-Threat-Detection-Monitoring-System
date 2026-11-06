/**
 * Grafik event per menit (Beranda Komando). Satu seri, sehingga tanpa legend;
 * judul kartu menamai serinya. Warna seri #3987e5 lolos validator palet
 * terhadap permukaan gelap #111827. Teks memakai warna teks, bukan warna seri.
 */
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const SERIES = '#3987e5';
const TEXT_MUTED = '#9ca3af';
const GRID = '#1f2937';
const SURFACE = '#111827';

document.addEventListener('alpine:init', () => {
    window.Alpine.data('grafikEvent', (series) => ({
        chart: null,
        init() {
            this.chart = new Chart(this.$refs.canvas, {
                type: 'bar',
                data: { labels: series.labels, datasets: [{ data: series.counts }] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    datasets: {
                        bar: {
                            backgroundColor: SERIES,
                            hoverBackgroundColor: '#5c9ded',
                            borderRadius: { topLeft: 4, topRight: 4 },
                            borderSkipped: 'bottom',
                            borderColor: SURFACE,
                            borderWidth: { left: 1, right: 1 },
                            categoryPercentage: 0.9,
                            barPercentage: 1,
                        },
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            border: { color: GRID },
                            ticks: { color: TEXT_MUTED, maxRotation: 0, autoSkip: true, maxTicksLimit: 8, font: { size: 11 } },
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: GRID },
                            border: { display: false },
                            ticks: { color: TEXT_MUTED, precision: 0, maxTicksLimit: 5, font: { size: 11 } },
                        },
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#030712',
                            borderColor: '#374151',
                            borderWidth: 1,
                            titleColor: '#f3f4f6',
                            bodyColor: '#d1d5db',
                            displayColors: false,
                            callbacks: {
                                title: (items) => `Menit ${items[0].label} WIB`,
                                label: (item) => `${item.formattedValue} event`,
                            },
                        },
                    },
                },
            });
            // Livewire memperbarui data saat ada sinyal perubahan.
            this.$wire.$watch('series', (value) => {
                this.chart.data.labels = value.labels;
                this.chart.data.datasets[0].data = value.counts;
                this.chart.update('none');
            });
        },
        destroy() {
            this.chart?.destroy();
        },
    }));
});
