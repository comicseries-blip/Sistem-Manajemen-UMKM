import { state } from '../core/store.js';
import { rupiah, escapeHtml, todayStr, daysAgoISO } from '../core/utils.js';
import { $, emptyState } from '../core/ui.js';
import { on } from '../core/events.js';
import { getCurrentPage } from '../core/router.js';
import { createChart } from '../core/charts.js';

function renderStats() {
  const today = todayStr();
  const trxToday = state.transactions.filter((t) => t.tanggal === today);
  const pendapatanHariIni = trxToday.reduce((s, t) => s + t.total, 0);

  const pendapatanKemarin = state.transactions
    .filter((t) => t.tanggal === daysAgoISO(1))
    .reduce((s, t) => s + t.total, 0);
  const delta = pendapatanKemarin > 0
    ? ((pendapatanHariIni - pendapatanKemarin) / pendapatanKemarin) * 100
    : pendapatanHariIni > 0 ? 100 : 0;

  $('statPendapatanHariIni').textContent = rupiah(pendapatanHariIni);

  const deltaEl = $('statPendapatanDelta');
  deltaEl.textContent = (delta >= 0 ? '▲ ' : '▼ ') + Math.abs(delta).toFixed(0) + '% dari kemarin';
  deltaEl.className = 'delta ' + (delta >= 0 ? 'up' : 'down');

  $('statTransaksiHariIni').textContent = trxToday.length;
  $('statRataRata').textContent = rupiah(trxToday.length ? pendapatanHariIni / trxToday.length : 0);
  $('statTotalProduk').textContent = state.products.length;
  $('statStokMenipis').textContent = state.products.filter((p) => p.stok <= p.stokMin).length;
}

function renderChart7Hari() {
  const labels = [];
  const values = [];

  for (let i = 6; i >= 0; i--) {
    const iso = daysAgoISO(i);
    labels.push(new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short' }));
    values.push(state.transactions.filter((t) => t.tanggal === iso).reduce((s, t) => s + t.total, 0));
  }

  createChart('chartDashboard', {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: '#6366F1', borderRadius: 6, maxBarThickness: 36 }],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => rupiah(c.parsed.y) } },
      },
      scales: {
        y: { ticks: { callback: (v) => 'Rp ' + (v / 1000) + 'rb', font: { size: 10.5 } }, grid: { color: '#E9EEF6' } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  });
}

function renderTopProduk() {
  const sinceISO = daysAgoISO(30);

  const sold = {};
  state.transactions
    .filter((t) => t.tanggal >= sinceISO)
    .forEach((t) => t.items.forEach((it) => { sold[it.nama] = (sold[it.nama] || 0) + it.qty; }));

  const topArr = Object.entries(sold).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topEl = $('topProdukList');

  if (topArr.length === 0) {
    topEl.innerHTML = emptyState('◆', ['Belum ada data penjualan.']);
    return;
  }

  const maxQty = topArr[0][1];
  topEl.innerHTML = topArr.map(([nama, qty]) => `
    <div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px;">
        <span style="font-weight:700;">${escapeHtml(nama)}</span><span class="num" style="color:var(--ink-soft);">${qty} terjual</span>
      </div>
      <div style="background:#EEF0FF;height:8px;border-radius:999px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#6366F1,#8B5CF6);height:100%;width:${(qty / maxQty) * 100}%;border-radius:999px;"></div>
      </div>
    </div>`).join('');
}

function renderRecentTransaksi() {
  const recent = state.transactions.slice(0, 6);
  $('jumlahTransaksiSpan').textContent = state.transactions.length + ' TOTAL TRANSAKSI';
  const recentEl = $('recentTransaksiTable');

  if (recent.length === 0) {
    recentEl.innerHTML = emptyState('▤', ['Belum ada transaksi.', 'Mulai transaksi pertama Anda di halaman Kasir.']);
    return;
  }

  recentEl.innerHTML = `
    <table>
      <thead><tr><th>Tanggal</th><th>Item</th><th>Metode</th><th class="num">Total</th></tr></thead>
      <tbody>
        ${recent.map((t) => {
          const itemSummary = t.items.map((it) => `${it.nama} x${it.qty}`).join(', ');
          return `
            <tr class="tr-hover">
              <td class="num">${new Date(t.tanggal + 'T00:00:00').toLocaleDateString('id-ID')}</td>
              <td>${escapeHtml(itemSummary)}</td>
              <td><span class="badge gray">${escapeHtml(t.metodeBayar)}</span></td>
              <td class="num">${rupiah(t.total)}</td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

export function renderDashboard() {
  renderStats();
  renderChart7Hari();
  renderTopProduk();
  renderRecentTransaksi();
}

export function initDashboard() {
  on('page-changed', (page) => { if (page === 'dashboard') renderDashboard(); });
  on('data-changed', () => { if (getCurrentPage() === 'dashboard') renderDashboard(); });
}