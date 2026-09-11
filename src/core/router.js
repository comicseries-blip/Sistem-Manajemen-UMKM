import { emit } from './events.js';
import { PAGE_TITLES } from '../data/constants.js';

let currentPage = 'dashboard';

function setActivePage(page) {
  currentPage = page;

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  document.querySelectorAll('.page').forEach((p) => {
    p.classList.toggle('active', p.id === 'page-' + page);
  });
  document.getElementById('pageTitle').textContent = PAGE_TITLES[page] || '';

  emit('page-changed', page);
}

export function getCurrentPage() {
  return currentPage;
}

export function initRouter() {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => setActivePage(item.dataset.page));
  });

  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}