/**
 * @file Utility functions for the Star Citizen money planner.
 * @module lib/utils
 */

export const fmt = n => n.toLocaleString('en-US');
export const fmtK = n => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? Math.round(n / 1000) + 'k' : String(n);
export const fmtHrs = h => h < 1 ? Math.round(h * 60) + 'm' : h.toFixed(1) + 'h';
export const fmtDays = h => { const d = Math.floor(h / 24); const r = Math.round(h % 24); return d > 0 ? `${d}d ${r}h` : `${r}h`; };
export const fmtRange = (lo, hi) => `${fmtK(lo)} – ${fmtK(hi)}`;
export const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
export const $ = sel => document.querySelector(sel);
export const $$ = sel => [...document.querySelectorAll(sel)];
export const riskColor = r => r === 'high' ? 'var(--red)' : r === 'medium' ? 'var(--amber)' : 'var(--green)';
export const riskDot = r => `<span class="dot" style="background:${riskColor(r)}"></span>`;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function saveState(key, val) {
  try { localStorage.setItem('scp_' + key, JSON.stringify(val)); } catch (e) {}
}
export function loadState(key, fallback) {
  try { const v = localStorage.getItem('scp_' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
export function debounce(fn, ms = 300) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/**
 * Enhance a budget input to format with commas as user types.
 * @param {HTMLInputElement} input
 */
export function setupBudgetInput(input) {
  // Initialize dataset.value from any pre-existing display value
  const existing = input.value.replace(/[^0-9]/g, '');
  if (existing) {
    const num = parseInt(existing) || 0;
    input.dataset.value = num;
    input.value = num > 0 ? num.toLocaleString('en-US') : '';
  }

  input.addEventListener('input', () => {
    // Remember cursor position relative to end
    const pos = input.value.length - input.selectionStart;
    const raw = input.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw) || 0;
    input.dataset.value = num;
    if (raw) {
      input.value = num.toLocaleString('en-US');
      // Restore cursor position from end
      const newPos = Math.max(0, input.value.length - pos);
      input.setSelectionRange(newPos, newPos);
    }
  });
  // Helper to get numeric value
  input.getValue = () => parseInt(input.dataset.value) || parseInt(input.value.replace(/[^0-9]/g, '')) || 0;
  // Helper to set value programmatically (formatted)
  input.setValue = (num) => {
    input.dataset.value = num;
    input.value = num > 0 ? num.toLocaleString('en-US') : '';
  };
}
