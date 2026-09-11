import { state, commit } from '../core/store.js';
import { rupiah, escapeHtml, uid, todayStr, formatDate, monthKey } from '../core/utils.js';
import { $, openModal, closeModal, emptyState } from '../core/ui.js';
import { on } from '../core/events.js';
import { getCurrentPage } from '../core/router.js';
import { showToast } from '../core/toast.js';
import { KATEGORI_PENGELUARAN } from '../data/constants.js';

export function renderKeuangan() {
  const ym = monthKey(todayStr());
  const trxBulan = state.transactions.filter((t) => monthKey(t.tanggal) === ym);

  const pemasukan = trxBulan.reduce((s, t) => s + t.total, 0);
  const modalTerjual = trxBulan.reduce(
    (s, t) => s + t.items.reduce((ss, it) => ss + (it.hargaBeli || 0) * it.qty, 0),
    0,
  );
  const pengeluaran = state.expenses.filter((e) => monthKey(e.tanggal) === ym).reduce((s, e) => s + e.jumlah, 0);

  $('kPemasukan').textContent = rupiah(pemasukan);
  $('kPengeluaran').textContent = rupiah(pengeluaran);
  $('kLaba').textContent = rupiah(pemasukan - modalTerjual - pengeluaran);

  renderPengeluaranTable();
}

function renderPengeluaranTable() {
  const container = $('pengeluaranTable');
  const sorted = [...state.expenses].sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  if (sorted.length === 0) {
    container.innerHTML = emptyState('▣', ['Belum ada catatan pengeluaran.']);
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr><th>Tanggal</th><th>Kategori</th><th>Keterangan</th><th class="num">Jumlah</th><th></th></tr>
      </thead>
      <tbody>
        ${sorted.map((e) => `
          <tr class="tr-hover">
            <td class="num">${formatDate(e.tanggal)}</td>
            <td><span class="badge gray">${escapeHtml(e.kategori)}</span></td>
            <td>${escapeHtml(e.keterangan)}</td>
            <td class="num">${rupiah(e.jumlah)}</td>
            <td>
              <button class="btn btn-danger-ghost btn-sm" data-id="${e.id}" data-act="del-exp">Hapus</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  container.querySelectorAll('[data-act="del-exp"]').forEach((b) => {
    b.addEventListener('click', () => {
      if (!confirm('Hapus catatan pengeluaran ini?')) return;
      state.expenses = state.expenses.filter((x) => x.id !== b.dataset.id);
      commit();
      showToast('Catatan dihapus');
    });
  });
}

export function initFinance() {
  const catSel = $('eKategori');
  catSel.innerHTML = KATEGORI_PENGELUARAN.map((k) => `<option>${k}</option>`).join('');

  $('openAddPengeluaranBtn').addEventListener('click', () => {
    $('pengeluaranForm').reset();
    catSel.selectedIndex = 0;
    openModal('modalPengeluaran');
  });

  $('pengeluaranForm').addEventListener('submit', (e) => {
    e.preventDefault();
    state.expenses.push({
      id: uid('exp'),
      tanggal: todayStr(),
      kategori: $('eKategori').value,
      keterangan: $('eKeterangan').value.trim(),
      jumlah: parseFloat($('eJumlah').value) || 0,
    });
    commit();
    closeModal('modalPengeluaran');
    showToast('Pengeluaran tercatat');
  });

  on('page-changed', (page) => { if (page === 'keuangan') renderKeuangan(); });
  on('data-changed', () => { if (getCurrentPage() === 'keuangan') renderKeuangan(); });
}