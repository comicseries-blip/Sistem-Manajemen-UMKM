export const KEYS = {
  products: 'umkm_products',
  transactions: 'umkm_transactions',
  expenses: 'umkm_expenses',
  customers: 'umkm_customers',
  settings: 'umkm_settings',
};

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value, onError) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    onError?.('Gagal menyimpan data');
    return false;
  }
}