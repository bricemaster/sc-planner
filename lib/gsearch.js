/**
 * @file Global search overlay — Cmd/Ctrl+K to search everything.
 * @module lib/gsearch
 */

import { $, $$, fmt, fmtK } from './utils.js';
import { getAllShips, getShipById } from '../data/ships.js';
import { methods } from '../data/methods.js';
import { getMethodsForShip } from './advisor.js';

let isOpen = false;
let selectedIdx = 0;
let results = [];
let onSelectShip = null;
let onSelectGoal = null;
let onSelectMethod = null;

export function initGlobalSearch(callbacks) {
  onSelectShip = callbacks.onSelectShip;
  onSelectGoal = callbacks.onSelectGoal;
  onSelectMethod = callbacks.onSelectMethod;

  const overlay = $('#globalSearch');
  const backdrop = overlay?.querySelector('.gsearch__backdrop');
  const input = $('#gsearchInput');
  const resultsList = $('#gsearchResults');
  const triggerBtn = $('#globalSearchBtn');

  if (!overlay || !input) return;

  // Open/close
  function open() {
    overlay.classList.add('open');
    input.value = '';
    input.focus();
    isOpen = true;
    selectedIdx = 0;
    results = [];
    renderResults([]);
  }

  function close() {
    overlay.classList.remove('open');
    isOpen = false;
  }

  // Keyboard shortcut
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      isOpen ? close() : open();
    }
    if (e.key === 'Escape' && isOpen) close();

    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, results.length - 1);
      highlightResult();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      highlightResult();
    }
    if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault();
      selectResult(results[selectedIdx]);
      close();
    }
  });

  if (backdrop) backdrop.addEventListener('click', close);
  if (triggerBtn) triggerBtn.addEventListener('click', open);

  // Search on input
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results = []; renderResults([]); return; }

    const ships = getAllShips();
    const shipResults = ships
      .filter(s => s.name.toLowerCase().includes(q) || s.mfr.toLowerCase().includes(q) || s.role.toLowerCase().includes(q))
      .slice(0, 5)
      .map(s => ({
        type: 'ship',
        id: s.id,
        title: s.name,
        subtitle: `${s.mfr} · ${s.role} · ${fmtK(s.price)} aUEC`,
        data: s
      }));

    const methodResults = methods
      .filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q))
      .slice(0, 5)
      .map(m => ({
        type: 'method',
        id: m.id,
        title: m.name,
        subtitle: `${m.category} · ${fmtK(m.aUEChr)}/hr · ${m.risk} risk`,
        data: m
      }));

    // Search locations within methods
    const locationResults = [];
    methods.forEach(m => {
      if (m.locations && Array.isArray(m.locations)) {
        m.locations.forEach(loc => {
          if (loc.toLowerCase().includes(q) && !locationResults.some(r => r.title === loc)) {
            locationResults.push({
              type: 'location',
              id: m.id,
              title: loc,
              subtitle: `Used in: ${m.name}`,
              data: m
            });
          }
        });
      }
    });

    results = [...shipResults, ...methodResults, ...locationResults.slice(0, 3)];
    selectedIdx = 0;
    renderResults(results);
  });

  function renderResults(items) {
    if (!resultsList) return;
    if (items.length === 0) {
      const q = input.value.trim();
      resultsList.innerHTML = q.length >= 2
        ? '<div class="gsearch__empty">No results found</div>'
        : '<div class="gsearch__empty">Type to search ships, methods, locations...</div>';
      return;
    }

    let html = '';
    items.forEach((item, i) => {
      const typeLabel = item.type === 'ship' ? 'SHIP' : item.type === 'method' ? 'METHOD' : 'LOCATION';
      const activeClass = i === selectedIdx ? ' gsearch__item--active' : '';
      html += `<div class="gsearch__item${activeClass}" data-idx="${i}">
        <span class="gsearch__type">${typeLabel}</span>
        <div class="gsearch__info">
          <span class="gsearch__title">${item.title}</span>
          <span class="gsearch__sub">${item.subtitle}</span>
        </div>
        ${item.type === 'ship' ? '<span class="gsearch__actions"><span class="gsearch__act" data-act="set-ship">Use Ship</span><span class="gsearch__act" data-act="set-goal">Set Goal</span></span>' : ''}
      </div>`;
    });
    resultsList.innerHTML = html;

    // Click handlers
    resultsList.querySelectorAll('.gsearch__item').forEach(el => {
      el.addEventListener('click', e => {
        const idx = parseInt(el.dataset.idx);
        const act = e.target.closest('[data-act]');
        if (act && act.dataset.act === 'set-goal') {
          if (results[idx] && onSelectGoal) onSelectGoal(results[idx].data.id);
        } else {
          selectResult(results[idx]);
        }
        close();
      });
    });
  }

  function highlightResult() {
    resultsList.querySelectorAll('.gsearch__item').forEach((el, i) => {
      el.classList.toggle('gsearch__item--active', i === selectedIdx);
    });
    // Scroll into view
    const active = resultsList.querySelector('.gsearch__item--active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function selectResult(result) {
    if (!result) return;
    if (result.type === 'ship' && onSelectShip) {
      onSelectShip(result.data.id);
    } else if (result.type === 'method' && onSelectMethod) {
      onSelectMethod(result.data.id);
    } else if (result.type === 'location' && onSelectMethod) {
      onSelectMethod(result.data.id);
    }
  }
}
