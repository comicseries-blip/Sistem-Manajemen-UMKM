import { state, commit } from '../core/store.js';
import { rupiah, escapeHtml, uid, todayStr, formatDate } from '../core/utils.js';
import { $, openModal, closeModal, emptyState } from '../core/ui.js';
import { on } from '../core/events.js';
import { getCurrentPage } from '../core/router.js';
import { showToast } from '../core/toast.js';
import { METODE_PEMBAYARAN } from '../data/constants.js';

function customerName(id) {
  return state.customers.find((c) => c.id === id)?.nama || null;
}

function renderPosProducts() {
  const q = ($('posSearch').value || '').toLowerCase();
  const list = state.products.filter((p) => p.nama.toLowerCase().includes(q));
  const grid = $('posProductGrid');

  if (list.length === 0) {
    grid.innerHTML = emptyState('▢', ['Belum ada produk.', 'Tambahkan produk terlebih dahulu.']);
    return;
  }

  grid.innerHTML = list.map((p) => {
    const low = p.stok <= p.stokMin;
    return `
      <div class="prod-tile" data-id="${p.id}">
        <div class="pname">${escapeHtml(p.nama)}</div>
        <div class="pcat">${escapeHtml(p.kategori)}</div>
        <div class="pprice">${rupiah(p.hargaJual)}</div>
        <div class="pstok" style="color:${low ? '#B0483B' : '#69736C'}">Stok: ${p.stok}</div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.prod-tile').forEach((tile) =>
    tile.addEventListener('click', () => addToCart(tile.dataset.id)));
}

function renderPosCustomerOptions() {
  const sel = $('posCustomer');
  const cur = sel.value;
  sel.innerHTML =
    '<option value="">Pelanggan Umum</option>' +
    state.customers.map((c) => `<option value="${c.id}">${escapeHtml(c.nama)}</option>`).join('');
  sel.value = cur;
}

function renderCart() {
  const el = $('cartItems');

  if (state.cart.length === 0) {
    el.innerHTML = emptyState('▤', ['Keranjang kosong.', 'Klik produk untuk menambahkan.']);
  } else {
    el.innerHTML = state.cart.map((l) => `
      <div class="cart-line">
        <div>
          <div class="cl-name">${escapeHtml(l.nama)}</div>
          <div class="cl-price">${rupiah(l.harga)}</div>
        </div>
        <div class="qty-ctrl">
          <button data-act="dec" data-id="${l.productId}">&minus;</button>
          <span>${l.qty}</span>
          <button data-act="inc" data-id="${l.productId}">+</button>
        </div>
      </div>`).join('');

    el.querySelectorAll('[data-act="inc"]').forEach((b) =>
      b.addEventListener('click', () => changeQty(b.dataset.id, 1)));
    el.querySelectorAll('[data-act="dec"]').forEach((b) =>
      b.addEventListener('click', () => changeQty(b.dataset.id, -1)));
  }

  const total = cartTotal();
  $('cartTotal').textContent = rupiah(total);
}

export function renderKasir() {
  renderPosProducts();
  renderPosCustomerOptions();
  renderCart();
}

function cartTotal() {
  return state.cart.reduce((s, l) => s + l.harga * l.qty, 0);
}

function addToCart(productId) {
  const p = state.products.find((x) => x.id === productId);
  if (!p) return;
  if (p.stok <= 0) {
    showToast('Stok produk habis');
    return;
  }

  const line = state.cart.find((l) => l.productId === productId);
  if (line) {
    if (line.qty >= p.stok) {
      showToast('Stok tidak mencukupi');
      return;
    }
    line.qty++;
  } else {
    state.cart.push({ productId, nama: p.nama, harga: p.hargaJual, hargaBeli: p.hargaBeli, qty: 1 });
  }
  renderCart();
}

function changeQty(productId, delta) {
  const line = state.cart.find((l) => l.productId === productId);
  if (!line) return;

  line.qty += delta;
  if (line.qty <= 0) {
    state.cart = state.cart.filter((l) => l.productId !== productId);
  } else {
    const p = state.products.find((x) => x.id === productId);
    if (p && line.qty > p.stok) {
      line.qty = p.stok;
      showToast('Stok tidak mencukupi');
    }
  }
  renderCart();
}

function processTransaction() {
  if (state.cart.length === 0) {
    showToast('Keranjang masih kosong');
    return;
  }

  const trx = {
    id: uid('trx'),
    tanggal: todayStr(),
    items: state.cart.map((l) => ({ nama: l.nama, qty: l.qty, harga: l.harga, hargaBeli: l.hargaBeli })),
    total: cartTotal(),
    metodeBayar: $('posPayment').value,
    pelangganId: $('posCustomer').value,
  };

  state.transactions.unshift(trx);

  state.cart.forEach((l) => {
    const p = state.products.find((x) => x.id === l.productId);
    if (p) p.stok = Math.max(0, p.stok - l.qty);
  });

  const customer = state.customers.find((c) => c.id === trx.pelangganId);
  if (customer) {
    customer.totalBelanja = (customer.totalBelanja || 0) + trx.total;
    customer.poin = (customer.poin || 0) + Math.floor(trx.total / 10000);
  }

  state.cart = [];
  commit();
  renderKasir();
  showReceipt(trx);
  showToast('Transaksi berhasil diproses');
}

function showReceipt(trx) {
  const s = state.settings;
  const customer = customerName(trx.pelangganId);

  let html = `<h3>${escapeHtml(s.namaUsaha || 'Usaha Anda')}</h3>`;
  if (s.alamat) html += `<div class="rc-sub">${escapeHtml(s.alamat)}</div>`;
  if (s.telepon) html += `<div class="rc-sub">${escapeHtml(s.telepon)}</div>`;
  html += `<hr>`;
  html += `<div class="rline"><span>${formatDate(trx.tanggal)}</span><span>${trx.id.slice(-6)}</span></div>`;
  if (customer) html += `<div class="rline"><span>Pelanggan</span><span>${escapeHtml(customer)}</span></div>`;
  html += `<hr>`;

  trx.items.forEach((it) => {
    html += `<div class="rline"><span>${escapeHtml(it.nama)} x${it.qty}</span><span>${rupiah(it.harga * it.qty)}</span></div>`;
  });

  html += `<hr>`;
  html += `<div class="rline" style="font-weight:600;"><span>TOTAL</span><span>${rupiah(trx.total)}</span></div>`;
  html += `<div class="rline"><span>Bayar</span><span>${escapeHtml(trx.metodeBayar)}</span></div>`;
  html += `<hr><div class="rc-sub">Terima kasih atas kunjungan Anda</div>`;

  $('receiptContent').innerHTML = html;
  openModal('modalReceipt');
}

export function initPos() {
  const paySel = $('posPayment');
  paySel.innerHTML = METODE_PEMBAYARAN.map((m) => `<option>${m}</option>`).join('');

  $('posSearch').addEventListener('input', renderPosProducts);
  $('prosesTransaksiBtn').addEventListener('click', processTransaction);
  $('printReceiptBtn').addEventListener('click', () => window.print());

  on('page-changed', (page) => { if (page === 'kasir') renderKasir(); });
  on('data-changed', () => { if (getCurrentPage() === 'kasir') renderKasir(); });
}