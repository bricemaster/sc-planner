/**
 * @file Modal overlay system for deep content display.
 * @module lib/modal
 */

import { $ } from './utils.js';

let isOpen = false;

export function initModal() {
  const backdrop = $('.modal__backdrop');
  const closeBtn = $('.modal__close');

  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeModal();
  });
}

export function openModal(html) {
  const modal = $('#modal');
  const content = $('#modalContent');
  if (!modal || !content) return;

  content.innerHTML = html;
  modal.classList.add('open');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  document.body.style.overflow = 'hidden';
  isOpen = true;
}

export function closeModal() {
  const modal = $('#modal');
  if (!modal) return;

  modal.classList.remove('open');
  document.body.style.overflow = '';
  isOpen = false;
}
