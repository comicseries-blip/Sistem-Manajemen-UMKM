import { state } from '../core/store.js';
import { rupiah, daysAgoISO } from '../core/utils.js';
import { on } from '../core/events.js';
import { getCurrentPage } from '../core/router.js';
import { createChart } from '../core/charts.js';
import { KATEGORI_WARNA } from '../data/constants.js';

function renderChartTren() {
  const labels = [];
  const values = [];

  for (let i = 29; i >= 0; i--) {
    const iso = daysAgoISO(i);
    labels.push(new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric' }));
    values.push(state.transactions.filter((t) => t.tanggal === iso).reduce((s, t) => s + t.total, 0));
  }

  createChart('chartTren', {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99,102,241,0.10)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2.5,
      }],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => rupiah(c.parsed.y) } },
      },
      scales: {
        y: { ticks: { callback: (v) => 'Rp ' + v / 1000 + 'rb', font: { size: 10 } }, grid: { color: '#E9EEF6' } },
        x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 10 } } },
      },
    },
  });
}

function renderChartKategori() {
  const kategoriTotal = {};
  state.transactions.forEach((t) =>
    t.items.forEach((it) => {
      const prod = state.products.find((p) => p.nama === it.nama);
      const kat = prod ? prod.kategori : 'Lainnya';
      kategoriTotal[kat] = (kategoriTotal[kat] || 0) + it.harga * it.qty;
    }),
  );

  const labels = Object.keys(kategoriTotal);
  const values = Object.values(kategoriTotal);

  createChart('chartKategori', {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map((k) => KATEGORI_WARNA[k] || '#7A6C56'),
        borderWidth: 2,
        borderColor: '#FFFFFF',
      }],
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 10, padding: 12 } },
        tooltip: { callbacks: { label: (c) => c.label + ': ' + rupiah(c.parsed) } },
      },
    },
  });
}

export function renderLaporan() {
  renderChartTren();
  renderChartKategori();
}

export function initReports() {
  on('page-changed', (page) => { if (page === 'laporan') renderLaporan(); });
  on('data-changed', () => { if (getCurrentPage() === 'laporan') renderLaporan(); });
}