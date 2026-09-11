import { state, commit } from '../core/store.js';
import { rupiah, escapeHtml, uid } from '../core/utils.js';
import { $, openModal, closeModal, emptyState } from '../core/ui.js';
import { on } from '../core/events.js';
import { getCurrentPage } from '../core/router.js';
import { showToast } from '../core/toast.js';

export function renderPelangganTable() {
  const container = $('pelangganTable');

  if (state.customers.length === 0) {
    container.innerHTML = emptyState('◈', ['Belum ada data pelanggan.', 'Klik "Tambah Pelanggan" untuk memulai.']);
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Nama</th><th>Telepon</th><th>Alamat</th>
          <th class="num">Total Belanja</th><th class="num">Poin</th><th></th>
        </tr>
      </thead>
      <tbody>
        ${state.customers.map((c) => `
          <tr class="tr-hover">
            <td>${escapeHtml(c.nama)}</td>
            <td>${escapeHtml(c.telepon || '—')}</td>
            <td>${escapeHtml(c.alamat || '—')}</td>
            <td class="num">${rupiah(c.totalBelanja || 0)}</td>
            <td class="num"><span class="badge gold">${c.poin || 0} pts</span></td>
            <td>
              <button class="btn btn-danger-ghost btn-sm" data-id="${c.id}" data-act="del-cust">Hapus</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  container.querySelectorAll('[data-act="del-cust"]').forEach((b) => {
    b.addEventListener('click', () => {
      if (!confirm('Hapus pelanggan ini?')) return;
      state.customers = state.customers.filter((x) => x.id !== b.dataset.id);
      commit();
      showToast('Pelanggan dihapus');
    });
  });
}

export function initCustomers() {
  $('openAddPelangganBtn').addEventListener('click', () => {
    $('pelangganForm').reset();
    openModal('modalPelanggan');
  });

  $('pelangganForm').addEventListener('submit', (e) => {
    e.preventDefault();
    state.customers.push({
      id: uid('cust'),
      nama: $('cNama').value.trim(),
      telepon: $('cTelepon').value.trim(),
      alamat: $('cAlamat').value.trim(),
      poin: 0,
      totalBelanja: 0,
    });
    commit();
    closeModal('modalPelanggan');
    showToast('Pelanggan baru ditambahkan');
  });

  on('page-changed', (page) => { if (page === 'pelanggan') renderPelangganTable(); });
  on('data-changed', () => { if (getCurrentPage() === 'pelanggan') renderPelangganTable(); });
}