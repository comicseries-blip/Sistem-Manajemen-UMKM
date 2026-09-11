import { KEYS, load, save } from './storage.js';
import { DEFAULT_SETTINGS } from '../data/constants.js';
import { showToast } from './toast.js';
import { emit } from './events.js';

export const state = {
  products: load(KEYS.products, []),
  transactions: load(KEYS.transactions, []),
  expenses: load(KEYS.expenses, []),
  customers: load(KEYS.customers, []),
  settings: { ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}) },
  cart: [],
};

export function saveAll() {
  save(KEYS.products, state.products, showToast);
  save(KEYS.transactions, state.transactions, showToast);
  save(KEYS.expenses, state.expenses, showToast);
  save(KEYS.customers, state.customers, showToast);
  save(KEYS.settings, state.settings, showToast);
}

export function commit() {
  saveAll();
  emit('data-changed');
}

export function resetData() {
  state.products = [];
  state.transactions = [];
  state.expenses = [];
  state.customers = [];
  state.cart = [];
  commit();
}