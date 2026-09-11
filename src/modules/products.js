import { state, commit } from '../core/store.js';
import { rupiah, escapeHtml, uid } from '../core/utils.js';
import { $, openModal, closeModal, emptyState } from '../core/ui.js';
import { on } from '../core/events.js';
import { getCurrentPage } from '../core/router.js';
import { showToast } from '../core/toast.js';
import { KATEGORI_PRODUK } from '../data/constants.js';

function badgeStok(p) {
  const low = p.stok <= p.stokMin;
  return low
    ? '<span class="badge danger">Stok Menipis</span>'
    : '<span class="badge success">Aman</span>';
}

export function renderProdukTable() {
  const q = ($('produkSearch').value || '').toLowerCase();
  const list = state.products.filter((p) => p.nama.toLowerCase().includes(q));
  const container = $('produkTable');

  if (list.length === 0) {
    container.innerHTML = emptyState('▢', ['Belum ada produk.', 'Klik "Tambah Produk" untuk memulai.']);
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Nama Produk</th><th>Kategori</th><th class="num">Modal</th>
          <th class="num">Harga Jual</th><th class="num">Stok</th><th>Status</th><th></th>
        </tr>
      </thead>
      <tbody>
        ${list.map((p) => `
          <tr class="tr-hover">
            <td>${escapeHtml(p.nama)}</td>
            <td><span class="badge gray">${escapeHtml(p.kategori)}</span></td>
            <td class="num">${rupiah(p.hargaBeli)}</td>
            <td class="num">${rupiah(p.hargaJual)}</td>
            <td class="num">${p.stok}</td>
            <td>${badgeStok(p)}</td>
            <td>
              <div class="btn-row">
                <button class="btn btn-ghost btn-sm" data-act="edit-produk" data-id="${p.id}">Ubah</button>
                <button class="btn btn-danger-ghost btn-sm" data-act="del-produk" data-id="${p.id}">Hapus</button>
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  container.querySelectorAll('[data-act="edit-produk"]').forEach((b) =>
    b.addEventListener('click', () => editProduk(b.dataset.id)));
  container.querySelectorAll('[data-act="del-produk"]').forEach((b) =>
    b.addEventListener('click', () => deleteProduk(b.dataset.id)));
}

function openProdukForm(editId) {
  if (!editId) $('produkForm').reset();

  const p = editId ? state.products.find((x) => x.id === editId) : null;
  if (editId && !p) return;

  $('pEditId').value = editId;
  $('modalProdukTitle').textContent = editId ? 'Ubah Produk' : 'Tambah Produk';
  if (p) {
    $('pNama').value = p.nama;
    $('pKategori').value = p.kategori;
    $('pStokMin').value = p.stokMin;
    $('pHargaBeli').value = p.hargaBeli;
    $('pHargaJual').value = p.hargaJual;
    $('pStok').value = p.stok;
  } else {
    $('pKategori').selectedIndex = 0;
    $('pStokMin').value = 5;
  }
  openModal('modalProduk');
}

function editProduk(id) {
  openProdukForm(id);
}

function deleteProduk(id) {
  if (!confirm('Hapus produk ini?')) return;
  state.products = state.products.filter((p) => p.id !== id);
  commit();
  showToast('Produk dihapus');
}

function readProdukForm() {
  return {
    nama: $('pNama').value.trim(),
    kategori: $('pKategori').value,
    stokMin: parseInt($('pStokMin').value, 10) || 0,
    hargaBeli: parseFloat($('pHargaBeli').value) || 0,
    hargaJual: parseFloat($('pHargaJual').value) || 0,
    stok: parseInt($('pStok').value, 10) || 0,
  };
}

export function initProducts() {
  const catSel = $('pKategori');
  catSel.innerHTML = KATEGORI_PRODUK.map((k) => `<option>${k}</option>`).join('');

  $('openAddProdukBtn').addEventListener('click', () => openProdukForm(''));
  $('produkSearch').addEventListener('input', renderProdukTable);

  $('produkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = $('pEditId').value;
    const data = readProdukForm();

    if (editId) {
      const idx = state.products.findIndex((p) => p.id === editId);
      if (idx > -1) state.products[idx] = { ...state.products[idx], ...data };
      showToast('Produk diperbarui');
    } else {
      state.products.push({ id: uid('prod'), ...data });
      showToast('Produk baru ditambahkan');
    }
    commit();
    closeModal('modalProduk');
  });

  on('page-changed', (page) => { if (page === 'produk') renderProdukTable(); });
  on('data-changed', () => { if (getCurrentPage() === 'produk') renderProdukTable(); });
}