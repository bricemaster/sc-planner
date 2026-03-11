/** @file Quality of Life features (items 86–100). @module lib/qol */
import { $, $$, debounce } from './utils.js';
import { openModal } from './modal.js';
import { showToast } from './powertools.js';

// ── 86. Undo / Redo ─────────────────────────────────────────────────────────
class UndoManager {
  constructor(max = 20) { this._stack = []; this._index = -1; this._max = max; }
  push(state) {
    this._stack = this._stack.slice(0, this._index + 1);
    this._stack.push(JSON.parse(JSON.stringify(state)));
    if (this._stack.length > this._max) this._stack.shift();
    this._index = this._stack.length - 1;
  }
  undo() { if (!this.canUndo()) return null; return JSON.parse(JSON.stringify(this._stack[--this._index])); }
  redo() { if (!this.canRedo()) return null; return JSON.parse(JSON.stringify(this._stack[++this._index])); }
  canUndo() { return this._index > 0; }
  canRedo() { return this._index < this._stack.length - 1; }
}
const undoMgr = new UndoManager(20);
let _onRestore = null;
function initUndoRedo() {
  document.addEventListener('keydown', e => {
    if (!e.ctrlKey) return;
    if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); const s = undoMgr.undo(); if (s && _onRestore) _onRestore(s); }
    if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); const s = undoMgr.redo(); if (s && _onRestore) _onRestore(s); }
  });
}
export function pushUndo(state) { undoMgr.push(state); }
export function onUndoRestore(fn) { _onRestore = fn; }

// ═══════════════════════════════════════════════════════════════════════════════
// 87. Search / Filter Methods
// ═══════════════════════════════════════════════════════════════════════════════

export function renderSearchBar() {
  return `<div class="method-search">
    <span class="method-search__icon">&#128269;</span>
    <input type="text" id="methodSearch" class="method-search__input"
      placeholder="Search methods..." autocomplete="off" />
  </div>`;
}

/** Bind search behaviour after the search bar is in the DOM. */
export function bindSearchBar() {
  const input = $('#methodSearch');
  if (!input) return;
  const handler = debounce(() => {
    const q = input.value.trim().toLowerCase();
    const cards = $$('.method-card');
    cards.forEach(card => {
      // Reset any previous highlights
      card.querySelectorAll('mark').forEach(m => {
        m.replaceWith(document.createTextNode(m.textContent));
      });
      if (!q) { card.style.display = ''; return; }
      const text = card.textContent.toLowerCase();
      if (text.includes(q)) {
        card.style.display = '';
        highlightText(card, q);
      } else {
        card.style.display = 'none';
      }
    });
  }, 200);
  input.addEventListener('input', handler);
}

function highlightText(el, query) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const idx = node.textContent.toLowerCase().indexOf(query);
    if (idx === -1) return;
    const span = document.createElement('span');
    const before = document.createTextNode(node.textContent.slice(0, idx));
    const mark = document.createElement('mark');
    mark.textContent = node.textContent.slice(idx, idx + query.length);
    const after = document.createTextNode(node.textContent.slice(idx + query.length));
    span.appendChild(before);
    span.appendChild(mark);
    span.appendChild(after);
    node.parentNode.replaceChild(span, node);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 88. Sort Methods
// ═══════════════════════════════════════════════════════════════════════════════

let currentSortKey = null;
let currentSortDir = 'asc';

export function renderSortControls() {
  return `<div class="sort-controls">
    <button class="sort-btn" data-sort-key="rate" data-sort-dir="desc">
      Rate <span class="sort-btn__arrow">&#9660;</span>
    </button>
    <button class="sort-btn" data-sort-key="risk" data-sort-dir="asc">
      Risk <span class="sort-btn__arrow">&#9650;</span>
    </button>
    <button class="sort-btn" data-sort-key="name" data-sort-dir="asc">
      Name <span class="sort-btn__arrow">&#9650;</span>
    </button>
  </div>`;
}

export function bindSortControls() {
  const btns = $$('.sort-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sortKey;
      if (currentSortKey === key) {
        currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortKey = key;
        currentSortDir = btn.dataset.sortDir || 'asc';
      }
      btns.forEach(b => b.classList.remove('sort-btn--active'));
      btn.classList.add('sort-btn--active');
      btn.dataset.sortDir = currentSortDir;
      sortMethodCards(key, currentSortDir);
    });
  });
}

function sortMethodCards(key, dir) {
  const container = $('.method-card')?.parentElement;
  if (!container) return;
  const cards = [...container.querySelectorAll('.method-card')];
  cards.sort((a, b) => {
    let va, vb;
    if (key === 'rate') {
      va = parseFloat(a.querySelector('.method-card__rate')?.textContent.replace(/[^0-9.]/g, '') || '0');
      vb = parseFloat(b.querySelector('.method-card__rate')?.textContent.replace(/[^0-9.]/g, '') || '0');
    } else if (key === 'risk') {
      const order = { low: 1, medium: 2, high: 3 };
      va = order[a.dataset.risk] || 2;
      vb = order[b.dataset.risk] || 2;
    } else {
      va = (a.querySelector('.method-card__name')?.textContent || '').toLowerCase();
      vb = (b.querySelector('.method-card__name')?.textContent || '').toLowerCase();
    }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return dir === 'asc' ? cmp : -cmp;
  });
  // Re-insert pinned first, then sorted
  const pinned = cards.filter(c => c.classList.contains('method-card--pinned'));
  const unpinned = cards.filter(c => !c.classList.contains('method-card--pinned'));
  [...pinned, ...unpinned].forEach(c => container.appendChild(c));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 89. Pinned Methods
// ═══════════════════════════════════════════════════════════════════════════════

function getPinned() {
  try { return JSON.parse(localStorage.getItem('sc_pinned') || '[]'); } catch { return []; }
}
function savePinned(arr) {
  localStorage.setItem('sc_pinned', JSON.stringify(arr));
}

export function togglePin(methodId) {
  const pins = getPinned();
  const idx = pins.indexOf(methodId);
  if (idx >= 0) pins.splice(idx, 1);
  else pins.push(methodId);
  savePinned(pins);
  applyPins();
}

export function applyPins() {
  const pins = getPinned();
  $$('.method-card').forEach(card => {
    const id = card.dataset.methodId || card.dataset.id;
    if (pins.includes(id)) {
      card.classList.add('method-card--pinned');
    } else {
      card.classList.remove('method-card--pinned');
    }
  });
  // Move pinned cards to top
  const container = $$('.method-card')[0]?.parentElement;
  if (!container) return;
  const pinned = [...container.querySelectorAll('.method-card--pinned')];
  pinned.reverse().forEach(c => container.prepend(c));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 90. Quick Switch Shortcuts (Alt+1-9)
// ═══════════════════════════════════════════════════════════════════════════════

let _quickSwitchCb = null;
let switchToast = null;

export function onQuickSwitch(fn) { _quickSwitchCb = fn; }

function initQuickSwitch() {
  switchToast = document.createElement('div');
  switchToast.className = 'quick-switch-toast';
  document.body.appendChild(switchToast);

  document.addEventListener('keydown', e => {
    if (!e.altKey) return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
      e.preventDefault();
      let favs = [];
      try { favs = JSON.parse(localStorage.getItem('scp_favorites') || '[]'); } catch {}
      if (favs.length === 0) {
        showToast('No favorites saved. Star some ships first!');
        return;
      }
      const idx = num - 1;
      if (idx >= favs.length) {
        showToast(`Only ${favs.length} favorite(s) saved`);
        return;
      }
      const shipId = favs[idx];
      if (_quickSwitchCb) _quickSwitchCb(shipId);
      showSwitchToast(num, shipId);
    }
  });
}

function showSwitchToast(num, shipId) {
  if (!switchToast) return;
  const name = shipId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  switchToast.innerHTML = `<span class="quick-switch-toast__key">${num}</span> ${name}`;
  switchToast.classList.add('quick-switch-toast--visible');
  setTimeout(() => switchToast.classList.remove('quick-switch-toast--visible'), 1200);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 91. Auto-save Indicator
// ═══════════════════════════════════════════════════════════════════════════════

let saveIndicator = null;
let saveTimeout = null;

function initAutoSaveIndicator() {
  saveIndicator = document.createElement('div');
  saveIndicator.className = 'autosave-indicator';
  saveIndicator.textContent = 'Saved \u2713';
  document.body.appendChild(saveIndicator);

  // Proxy localStorage.setItem to detect writes
  const origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, val) {
    origSet(key, val);
    flashSaveIndicator();
  };
}

function flashSaveIndicator() {
  if (!saveIndicator) return;
  clearTimeout(saveTimeout);
  saveIndicator.classList.add('autosave-indicator--show');
  saveTimeout = setTimeout(() => {
    saveIndicator.classList.remove('autosave-indicator--show');
  }, 1400);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 92. Welcome Back Message
// ═══════════════════════════════════════════════════════════════════════════════

function initWelcomeBack() {
  showWelcomeBack();
}

export function showWelcomeBack() {
  const now = Date.now();
  const lastRaw = localStorage.getItem('sc_lastVisit');
  // Always update timestamp
  localStorage.setItem('sc_lastVisit', String(now));

  if (!lastRaw) return; // First visit
  const last = parseInt(lastRaw);
  const diff = now - last;
  const ONE_HOUR = 3600000;
  if (diff < ONE_HOUR) return;

  const ago = formatTimeAgo(diff);
  setTimeout(() => {
    showToast(`Welcome back, citizen! Last session: ${ago}`, 4500);
  }, 800);
}

function formatTimeAgo(ms) {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 93. Tooltip System
// ═══════════════════════════════════════════════════════════════════════════════

let activeTooltip = null;

function initTooltips() {
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tooltip]');
    if (!el) return;
    showTooltipFor(el);
  });
  document.addEventListener('mouseout', e => {
    const el = e.target.closest('[data-tooltip]');
    if (!el) return;
    hideTooltip();
  });
  document.addEventListener('focusin', e => {
    const el = e.target.closest('[data-tooltip]');
    if (el) showTooltipFor(el);
  });
  document.addEventListener('focusout', e => {
    const el = e.target.closest('[data-tooltip]');
    if (el) hideTooltip();
  });
}

function showTooltipFor(el) {
  hideTooltip();
  const text = el.getAttribute('data-tooltip');
  if (!text) return;
  const pos = el.getAttribute('data-tooltip-pos') || 'top';

  const tip = document.createElement('div');
  tip.className = `qol-tooltip qol-tooltip--${pos}`;
  tip.innerHTML = `${text}<div class="qol-tooltip__arrow"></div>`;
  document.body.appendChild(tip);
  activeTooltip = tip;

  // Position
  const rect = el.getBoundingClientRect();
  const tr = tip.getBoundingClientRect();
  let top, left;

  if (pos === 'top') {
    top = rect.top - tr.height - 8;
    left = rect.left + rect.width / 2 - tr.width / 2;
  } else if (pos === 'bottom') {
    top = rect.bottom + 8;
    left = rect.left + rect.width / 2 - tr.width / 2;
  } else if (pos === 'left') {
    top = rect.top + rect.height / 2 - tr.height / 2;
    left = rect.left - tr.width - 8;
  } else {
    top = rect.top + rect.height / 2 - tr.height / 2;
    left = rect.right + 8;
  }

  // Keep in viewport
  if (left < 4) left = 4;
  if (left + tr.width > window.innerWidth - 4) left = window.innerWidth - tr.width - 4;
  if (top < 4) { top = rect.bottom + 8; tip.className = `qol-tooltip qol-tooltip--bottom`; }

  tip.style.top = top + 'px';
  tip.style.left = left + 'px';
  requestAnimationFrame(() => tip.classList.add('qol-tooltip--visible'));
}

function hideTooltip() {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 94. Contextual Help
// ═══════════════════════════════════════════════════════════════════════════════

function initHelpButtons() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.help-btn');
    if (btn) {
      e.stopPropagation();
      const text = btn.getAttribute('data-help');
      if (!text) return;
      closeAllPopovers();
      const pop = document.createElement('div');
      pop.className = 'help-popover';
      pop.textContent = text;
      btn.style.position = 'relative';
      btn.parentElement.style.position = 'relative';
      btn.parentElement.appendChild(pop);
      // Position near the button
      const br = btn.getBoundingClientRect();
      pop.style.top = (btn.offsetTop + btn.offsetHeight + 6) + 'px';
      pop.style.left = btn.offsetLeft + 'px';
      return;
    }
    // Click outside closes popovers
    closeAllPopovers();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllPopovers();
  });
}

function closeAllPopovers() {
  $$('.help-popover').forEach(p => p.remove());
}

// ═══════════════════════════════════════════════════════════════════════════════
// 95. Changelog Modal
// ═══════════════════════════════════════════════════════════════════════════════

const CHANGELOG = [
  {
    version: '2.3', date: '2025-12',
    items: ['Quality-of-life features: undo/redo, search, sort, pins', 'Easter eggs for the brave', 'Data dashboard and feedback form', 'Print-friendly stylesheet']
  },
  {
    version: '2.2', date: '2025-09',
    items: ['Power tools: comparison mode, export builds', 'Keyboard shortcuts for power users', 'Live commodity price integration']
  },
  {
    version: '2.1', date: '2025-06',
    items: ['Manufacturer themes with dynamic color palettes', 'Multi-step onboarding wizard', 'Favorites and session history']
  },
  {
    version: '2.0', date: '2025-03',
    items: ['Complete UI overhaul with chamfered card design', 'Reactive single-page dashboard', 'Ship upgrade path planner']
  },
  {
    version: '1.0', date: '2024-12',
    items: ['Initial release', 'Basic earning method browser', 'Budget and session planner']
  }
];

export function showChangelog() {
  const html = `<div class="changelog">
    <div class="changelog__title">Changelog</div>
    ${CHANGELOG.map(v => `
      <div class="changelog__version">
        <div class="changelog__version-head">
          <span class="changelog__version-num">v${v.version}</span>
          <span class="changelog__version-date">${v.date}</span>
        </div>
        <ul class="changelog__list">
          ${v.items.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>`;
  openModal(html);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 96. Feedback Form
// ═══════════════════════════════════════════════════════════════════════════════

export function showFeedbackForm() {
  const html = `<div class="feedback">
    <div class="feedback__title">Send Feedback</div>
    <div class="feedback__field">
      <label class="feedback__label">Category</label>
      <select class="feedback__select" id="fbCategory">
        <option value="Bug">Bug Report</option>
        <option value="Feature">Feature Request</option>
        <option value="Other">Other</option>
      </select>
    </div>
    <div class="feedback__field">
      <label class="feedback__label">Details</label>
      <textarea class="feedback__textarea" id="fbText"
        placeholder="Tell us what's on your mind..."></textarea>
    </div>
    <button class="feedback__submit" id="fbSubmit">Copy to Clipboard &amp; Submit</button>
  </div>`;
  openModal(html);

  // Bind after modal renders
  setTimeout(() => {
    const btn = $('#fbSubmit');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const cat = $('#fbCategory')?.value || 'Other';
      const text = $('#fbText')?.value?.trim();
      if (!text) { showToast('Please enter some feedback'); return; }
      const payload = `[SC Planner Feedback]\nCategory: ${cat}\n\n${text}\n\nTimestamp: ${new Date().toISOString()}`;
      navigator.clipboard.writeText(payload).then(() => {
        showToast('Feedback copied to clipboard! Paste it wherever you like.', 4000);
      }).catch(() => {
        showToast('Could not copy — check clipboard permissions');
      });
    });
  }, 100);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 97. Data Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

export function showDataDashboard() {
  const keys = [];
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('sc_') || k.startsWith('scp_'))) {
      const val = localStorage.getItem(k) || '';
      const bytes = new Blob([val]).size;
      totalBytes += bytes;
      keys.push({ key: k, size: bytes, preview: val.slice(0, 60) });
    }
  }
  keys.sort((a, b) => b.size - a.size);

  const fmtBytes = b => b < 1024 ? b + ' B' : (b / 1024).toFixed(1) + ' KB';

  const html = `<div class="data-dash">
    <div class="data-dash__title">Data Dashboard</div>
    <div class="data-dash__total">Total stored: ${fmtBytes(totalBytes)} across ${keys.length} keys</div>
    ${keys.map(k => `
      <div class="data-dash__row" data-storage-key="${k.key}">
        <span class="data-dash__key">${k.key}</span>
        <span class="data-dash__size">${fmtBytes(k.size)}</span>
        <div class="data-dash__actions">
          <button class="data-dash__btn" data-action="export" data-key="${k.key}">Export</button>
          <button class="data-dash__btn data-dash__btn--danger" data-action="clear" data-key="${k.key}">Clear</button>
        </div>
      </div>
    `).join('')}
    ${keys.length === 0 ? '<div style="color:var(--dm);text-align:center;padding:20px">No data stored yet</div>' : ''}
  </div>`;
  openModal(html);

  setTimeout(() => {
    $$('.data-dash__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (btn.dataset.action === 'export') {
          const val = localStorage.getItem(key) || '';
          navigator.clipboard.writeText(val).then(() => {
            showToast(`Copied ${key} to clipboard`);
          }).catch(() => showToast('Clipboard not available'));
        } else if (btn.dataset.action === 'clear') {
          localStorage.removeItem(key);
          const row = btn.closest('.data-dash__row');
          if (row) row.remove();
          showToast(`Cleared ${key}`);
        }
      });
    });
  }, 100);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 99. URL State Sync
// ═══════════════════════════════════════════════════════════════════════════════

export function syncToURL(params = {}) {
  const url = new URL(window.location);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    } else {
      url.searchParams.delete(k);
    }
  });
  history.replaceState(null, '', url);
}

export function readFromURL() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  if (params.has('ship'))    result.shipId  = params.get('ship');
  if (params.has('budget'))  result.budget  = parseInt(params.get('budget')) || undefined;
  if (params.has('session')) result.session = parseFloat(params.get('session')) || undefined;
  if (params.has('solo'))    result.solo    = params.get('solo') === '1';
  if (params.has('skill'))   result.skill   = params.get('skill');
  if (params.has('risk'))    result.risk    = params.get('risk');
  if (params.has('goal'))    result.goalShipId = params.get('goal');
  return result;
}

function initURLSync() {
  // On load, read URL params and apply if present
  const fromURL = readFromURL();
  if (Object.keys(fromURL).length > 0) {
    // Dispatch a custom event so app.js can pick up the values
    window.dispatchEvent(new CustomEvent('qol:urlstate', { detail: fromURL }));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 100. Easter Eggs
// ═══════════════════════════════════════════════════════════════════════════════

function initEasterEggs() {
  initKonamiCode();
  initLogoClicks();
  init30kJoke();
}

// --- Konami Code: ↑↑↓↓←→←→BA ---
function initKonamiCode() {
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let progress = 0;

  document.addEventListener('keydown', e => {
    if (e.key === sequence[progress] || e.key.toLowerCase() === sequence[progress]) {
      progress++;
      if (progress === sequence.length) {
        progress = 0;
        triggerRainbow();
      }
    } else {
      progress = 0;
    }
  });
}

function triggerRainbow() {
  document.body.classList.add('rainbow-mode');
  showToast('RAINBOW MODE ACTIVATED! \uD83C\uDF08', 5000);
  setTimeout(() => document.body.classList.remove('rainbow-mode'), 5000);
}

// --- Logo clicks: 7 rapid clicks ---
function initLogoClicks() {
  let clicks = 0;
  let timer = null;
  // Try common logo selectors
  const logo = $('.header__title') || $('.header__brand') || $('header a');
  if (!logo) return;

  logo.addEventListener('click', () => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 2000);
    if (clicks >= 7) {
      clicks = 0;
      showToast('Fly safe, citizen! o7', 3500);
    }
  });
}

// --- Typing "30k" in budget triggers disconnect animation ---
function init30kJoke() {
  let buffer = '';
  let active = false;

  document.addEventListener('input', e => {
    const el = e.target;
    if (!el || el.type !== 'text' && el.type !== 'number') return;
    // Check raw key values in the input
    const val = el.value.replace(/[^0-9k]/gi, '').toLowerCase();
    if (val.includes('30k') && !active) {
      active = true;
      trigger30kDisconnect();
      setTimeout(() => { active = false; }, 5000);
    }
  });

  // Also listen on keydown for budget-like inputs
  document.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      buffer += e.key.toLowerCase();
      if (buffer.length > 10) buffer = buffer.slice(-10);
      if (buffer.includes('30k') && !active) {
        active = true;
        buffer = '';
        trigger30kDisconnect();
        setTimeout(() => { active = false; }, 5000);
      }
    }
  });
}

function trigger30kDisconnect() {
  const overlay = document.createElement('div');
  overlay.className = 'disconnect-overlay';
  overlay.innerHTML = `
    <div class="disconnect-overlay__text">ERROR 30000</div>
    <div class="disconnect-overlay__sub">Disconnected from server</div>
    <div class="disconnect-overlay__sub" style="margin-top:8px;color:var(--dm)">Just kidding. o7</div>
  `;
  document.body.appendChild(overlay);
  document.body.classList.add('disconnect-anim');

  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .4s';
    setTimeout(() => {
      overlay.remove();
      document.body.classList.remove('disconnect-anim');
    }, 400);
  }, 2000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public Init
// ═══════════════════════════════════════════════════════════════════════════════

export function initQoL() {
  initUndoRedo();
  initTooltips();
  initWelcomeBack();
  initURLSync();
  initEasterEggs();
  initAutoSaveIndicator();
  initHelpButtons();
  initQuickSwitch();
}
