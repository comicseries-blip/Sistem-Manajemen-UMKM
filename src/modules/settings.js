import { state, commit, resetData } from '../core/store.js';
import { $ } from '../core/ui.js';
import { on } from '../core/events.js';
import { showToast } from '../core/toast.js';
import { loadSampleData } from '../data/sample.js';

export function applySettingsToUI() {
  const nama = state.settings.namaUsaha || 'Nama Usaha Anda';
  $('sbBizName').textContent = nama;
  $('topBizName').textContent = nama;
  $('setNamaUsaha').value = state.settings.namaUsaha || '';
  $('setPemilik').value = state.settings.pemilik || '';
  $('setTelepon').value = state.settings.telepon || '';
  $('setAlamat').value = state.settings.alamat || '';
}

export function initSettings() {
  $('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings.namaUsaha = $('setNamaUsaha').value.trim() || 'Nama Usaha Anda';
    state.settings.pemilik = $('setPemilik').value.trim();
    state.settings.telepon = $('setTelepon').value.trim();
    state.settings.alamat = $('setAlamat').value.trim();
    commit();
    applySettingsToUI();
    showToast('Informasi usaha disimpan');
  });

  $('resetAllBtn').addEventListener('click', () => {
    if (!confirm('Semua data (produk, transaksi, keuangan, pelanggan) akan dihapus permanen. Lanjutkan?')) return;
    resetData();
    showToast('Seluruh data telah dihapus');
  });

  $('loadSampleBtn').addEventListener('click', () => {
    if (state.products.length || state.transactions.length) {
      if (!confirm('Ini akan menambahkan data contoh ke data yang sudah ada. Lanjutkan?')) return;
    }
    loadSampleData(state);
    commit();
    showToast('Data contoh berhasil dimuat');
  });

  on('data-changed', applySettingsToUI);
}