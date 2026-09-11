import { state } from '../core/store.js';
import { $ } from '../core/ui.js';
import { showToast } from '../core/toast.js';

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('File diunduh: ' + filename);
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

export function initExport() {
  $('exportTransaksiCsv').addEventListener('click', () => {
    const header = ['tanggal', 'item', 'metode_bayar', 'total'];
    const rows = state.transactions.map((t) =>
      [t.tanggal, csvEscape(t.items.map((i) => i.nama + ' x' + i.qty).join('; ')), t.metodeBayar, t.total].join(','));
    downloadFile('transaksi.csv', header.join(',') + '\n' + rows.join('\n'), 'text/csv');
  });

  $('exportProdukCsv').addEventListener('click', () => {
    const header = ['nama', 'kategori', 'harga_modal', 'harga_jual', 'stok', 'stok_minimum'];
    const rows = state.products.map((p) =>
      [csvEscape(p.nama), csvEscape(p.kategori), p.hargaBeli, p.hargaJual, p.stok, p.stokMin].join(','));
    downloadFile('produk.csv', header.join(',') + '\n' + rows.join('\n'), 'text/csv');
  });

  $('exportPengeluaranCsv').addEventListener('click', () => {
    const header = ['tanggal', 'kategori', 'keterangan', 'jumlah'];
    const rows = state.expenses.map((e) =>
      [e.tanggal, csvEscape(e.kategori), csvEscape(e.keterangan), e.jumlah].join(','));
    downloadFile('pengeluaran.csv', header.join(',') + '\n' + rows.join('\n'), 'text/csv');
  });
}