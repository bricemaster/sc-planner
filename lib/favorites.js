/**
 * @file Favorites, wishlist, session history, and quick notes.
 * Persists user personalization data to localStorage.
 * @module lib/favorites
 */

const KEYS = {
  favorites: 'sc_favorites',
  wishlist: 'sc_wishlist',
  history: 'sc_history',
  notes: 'sc_notes'
};

const MAX_HISTORY = 20;

// ─── Helpers ────────────────────────────────────────────────────────────────

function load(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
}

function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── Favorite Methods ───────────────────────────────────────────────────────

export function toggleFavorite(methodId) {
  const favs = getFavorites();
  const idx = favs.indexOf(methodId);
  if (idx === -1) favs.push(methodId);
  else favs.splice(idx, 1);
  save(KEYS.favorites, favs);
  return idx === -1; // true if now favorited
}

export function isFavorite(methodId) {
  return getFavorites().includes(methodId);
}

export function getFavorites() {
  return load(KEYS.favorites) || [];
}

// ─── Ship Wishlist ──────────────────────────────────────────────────────────

export function toggleWishlist(shipId) {
  const list = getWishlist();
  const idx = list.indexOf(shipId);
  if (idx === -1) list.push(shipId);
  else list.splice(idx, 1);
  save(KEYS.wishlist, list);
  return idx === -1;
}

export function isWishlisted(shipId) {
  return getWishlist().includes(shipId);
}

export function getWishlist() {
  return load(KEYS.wishlist) || [];
}

// ─── Session History ────────────────────────────────────────────────────────

export function logSession(data) {
  const history = getHistory();
  history.unshift({
    timestamp: Date.now(),
    ship: data.ship || '',
    budget: data.budget || 0,
    method: data.method || '',
    rate: data.rate || 0
  });
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  save(KEYS.history, history);
}

export function getHistory() {
  return load(KEYS.history) || [];
}

/**
 * Build the history modal HTML.
 */
export function renderHistoryModal() {
  const history = getHistory();
  let html = '<div class="history-modal">';
  html += '<h2 class="history-modal__title">Session History</h2>';

  if (history.length === 0) {
    html += '<p class="history-modal__empty">No sessions recorded yet. Change your ship or settings to start logging.</p>';
    html += '</div>';
    return html;
  }

  html += '<div class="history-modal__list">';
  history.forEach(entry => {
    const d = new Date(entry.timestamp);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const rate = entry.rate >= 1000000
      ? (entry.rate / 1000000).toFixed(1) + 'M'
      : entry.rate >= 1000
        ? Math.round(entry.rate / 1000) + 'k'
        : String(entry.rate);

    html += `<div class="history-entry">
      <div class="history-entry__time">${dateStr} <span>${timeStr}</span></div>
      <div class="history-entry__details">
        <span class="history-entry__ship">${entry.ship}</span>
        <span class="history-entry__method">${entry.method}</span>
      </div>
      <div class="history-entry__numbers">
        <span class="history-entry__rate">${rate}/hr</span>
        <span class="history-entry__budget">${entry.budget.toLocaleString('en-US')} aUEC</span>
      </div>
    </div>`;
  });
  html += '</div></div>';
  return html;
}

// ─── Quick Notes ────────────────────────────────────────────────────────────

export function saveNote(methodId, text) {
  const notes = load(KEYS.notes) || {};
  if (text && text.trim()) {
    notes[methodId] = text.trim();
  } else {
    delete notes[methodId];
  }
  save(KEYS.notes, notes);
}

export function getNote(methodId) {
  const notes = load(KEYS.notes) || {};
  return notes[methodId] || '';
}

export function hasNote(methodId) {
  return !!getNote(methodId);
}
