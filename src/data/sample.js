import { uid, todayStr, daysAgoISO } from '../core/utils.js';
import { METODE_PEMBAYARAN } from './constants.js';

const SAMPLE_PRODUCTS = [
  { nama: 'Kopi Susu Gula Aren', kategori: 'Minuman', hargaBeli: 6000, hargaJual: 15000, stok: 40, stokMin: 10 },
  { nama: 'Es Teh Manis', kategori: 'Minuman', hargaBeli: 2000, hargaJual: 6000, stok: 60, stokMin: 15 },
  { nama: 'Nasi Goreng Spesial', kategori: 'Makanan', hargaBeli: 9000, hargaJual: 22000, stok: 25, stokMin: 8 },
  { nama: 'Ayam Geprek', kategori: 'Makanan', hargaBeli: 11000, hargaJual: 20000, stok: 6, stokMin: 10 },
  { nama: 'Tas Rajut Handmade', kategori: 'Kerajinan', hargaBeli: 35000, hargaJual: 75000, stok: 12, stokMin: 3 },
  { nama: 'Kaos Sablon Custom', kategori: 'Fashion', hargaBeli: 28000, hargaJual: 60000, stok: 18, stokMin: 5 },
  { nama: 'Sabun Cuci Piring 800ml', kategori: 'Kebutuhan Harian', hargaBeli: 9000, hargaJual: 14000, stok: 3, stokMin: 10 },
];

const SAMPLE_CUSTOMERS = [
  { nama: 'Siti Aminah', telepon: '0812-3456-7890', alamat: 'Jl. Melati No. 12' },
  { nama: 'Budi Santoso', telepon: '0813-9988-1122', alamat: 'Jl. Kenanga No. 5' },
];

const rand = (n) => Math.floor(Math.random() * n);

export function loadSampleData(state) {
  const addedProducts = SAMPLE_PRODUCTS.map((p) => ({ id: uid('prod'), ...p }));
  state.products.push(...addedProducts);

  SAMPLE_CUSTOMERS.forEach((c) =>
    state.customers.push({ id: uid('cust'), ...c, poin: 0, totalBelanja: 0 }),
  );

  for (let d = 6; d >= 0; d--) {
    const nTrans = 2 + rand(4);
    for (let t = 0; t < nTrans; t++) {
      const pick = rand() < 0.7
        ? addedProducts[rand(addedProducts.length)]
        : state.products[rand(state.products.length)];
      const qty = 1 + rand(3);
      const hargaBeli = pick.hargaBeli ?? Math.round(pick.hargaJual * 0.5);
      state.transactions.push({
        id: uid('trx'),
        tanggal: daysAgoISO(d),
        items: [{ nama: pick.nama, qty, harga: pick.hargaJual, hargaBeli }],
        total: pick.hargaJual * qty,
        metodeBayar: METODE_PEMBAYARAN[rand(METODE_PEMBAYARAN.length)],
        pelangganId: '',
      });
    }
  }

  state.expenses.push({
    id: uid('exp'),
    tanggal: todayStr(),
    kategori: 'Bahan Baku',
    keterangan: 'Belanja bahan baku mingguan',
    jumlah: 250000,
  });
  state.expenses.push({
    id: uid('exp'),
    tanggal: todayStr(),
    kategori: 'Sewa Tempat',
    keterangan: 'Sewa kios bulanan',
    jumlah: 800000,
  });
}