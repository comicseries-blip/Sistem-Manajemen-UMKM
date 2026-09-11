export function $(id) {
  return document.getElementById(id);
}

export function openModal(id) {
  $(id).classList.add('show');
}

export function closeModal(id) {
  $(id).classList.remove('show');
}

export function initModals() {
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('show');
    });
  });
}

export function emptyState(mark, lines) {
  const inner = lines.map((l) => escapeHtmlText(l)).join('<br>');
  return `<div class="empty-state"><span class="mark">${mark}</span><p>${inner}</p></div>`;
}

function escapeHtmlText(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
}