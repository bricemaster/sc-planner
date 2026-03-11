/**
 * @file Features-A — Fleet, routes, challenges, timer, upgrades,
 * comparison, presets, import/export, share, print, overlay, patches.
 * @module lib/features-a
 */
import { getAllShips, getShipById } from '../data/ships.js';
const $ = s => document.querySelector(s);
const fmt = n => n.toLocaleString('en-US');

function scGet(key, fb) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function scSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

function createModal(id) {
  if ($(`#${id}Backdrop`)) return;
  const bd = document.createElement('div');
  bd.id = `${id}Backdrop`; bd.className = 'fa-modal-backdrop';
  const m = document.createElement('div');
  m.id = id; m.className = 'fa-modal';
  bd.appendChild(m); document.body.appendChild(bd);
  bd.addEventListener('click', e => { if (e.target === bd) closeFA(id); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFA(id); });
}
function openFA(id) {
  $(`#${id}Backdrop`)?.classList.add('open');
  $(`#${id}`)?.classList.add('open');
}
function closeFA(id) {
  $(`#${id}Backdrop`)?.classList.remove('open');
  $(`#${id}`)?.classList.remove('open');
}
function closeBtn(id) {
  return `<button class="fa-modal__close" onclick="document.querySelector('#${id}Backdrop').classList.remove('open');document.querySelector('#${id}').classList.remove('open');">&times;</button>`;
}

// ── 21. Fleet Builder ─────────────────────────────────────────────────────────
export function getFleet() { return scGet('sc_fleet', []); }
export function addToFleet(shipId, shipName) {
  const fleet = getFleet();
  if (fleet.find(f => f.id === shipId)) return;
  const ship = getShipById(shipId);
  fleet.push({ id: shipId, name: shipName || (ship ? ship.name : shipId), price: ship ? ship.price : 0 });
  scSet('sc_fleet', fleet);
}
export function removeFromFleet(shipId) { scSet('sc_fleet', getFleet().filter(f => f.id !== shipId)); }

export function renderFleetModal() {
  createModal('fleetModal');
  const fleet = getFleet(), total = fleet.reduce((s, f) => s + (f.price || 0), 0);
  const opts = getAllShips().map(s => `<option value="${s.id}" data-name="${s.name}">${s.name} (${fmt(s.price)} aUEC)</option>`).join('');
  $('#fleetModal').innerHTML = `${closeBtn('fleetModal')}
    <div class="fa-modal__title">Fleet Builder</div>
    <div class="fa-modal__sub">Manage your multi-ship fleet</div>
    <div class="fa-fleet-stats">
      <div class="fa-fleet-stat"><span class="fa-fleet-stat__label">Ships</span><span class="fa-fleet-stat__value">${fleet.length}</span></div>
      <div class="fa-fleet-stat"><span class="fa-fleet-stat__label">Est. Value</span><span class="fa-fleet-stat__value">${fmt(total)} aUEC</span></div>
    </div>
    <div class="fa-fleet-add">
      <select class="fa-input" id="fleetShipSelect"><option value="">Select ship...</option>${opts}</select>
      <button class="fa-btn fa-btn--accent" id="fleetAddBtn">Add</button>
    </div>
    <div id="fleetList">${fleet.length ? fleet.map(f => `<div class="fa-row fa-fleet-item">
        <span class="fa-fleet-item__name">${f.name}</span>
        <span class="fa-fleet-item__price">${fmt(f.price)} aUEC</span>
        <button class="fa-btn fa-btn--sm fa-btn--danger" data-remove="${f.id}">Remove</button>
      </div>`).join('') : '<div class="fa-empty">No ships in fleet yet</div>'}</div>`;
  $('#fleetAddBtn').addEventListener('click', () => {
    const sel = $('#fleetShipSelect');
    if (!sel.value) return;
    addToFleet(sel.value, sel.options[sel.selectedIndex].dataset.name);
    renderFleetModal();
  });
  $('#fleetList').addEventListener('click', e => {
    const id = e.target.dataset?.remove;
    if (id) { removeFromFleet(id); renderFleetModal(); }
  });
  openFA('fleetModal');
}

// ── 22. Route Planner ─────────────────────────────────────────────────────────
function getRoutes() { return scGet('sc_routes', []); }
function saveRoutes(r) { scSet('sc_routes', r); }
const TRAVEL_EST = { short: '~3 min', medium: '~8 min', long: '~15 min' };
function estTravel(o, d) { return ['short', 'medium', 'long'][(o.length + d.length) % 3]; }

export function renderRouteModal() {
  createModal('routeModal');
  const routes = getRoutes();
  $('#routeModal').innerHTML = `${closeBtn('routeModal')}
    <div class="fa-modal__title">Route Planner</div>
    <div class="fa-modal__sub">Plan your travel routes</div>
    <div class="fa-route-form">
      <input class="fa-input" id="routeOrigin" placeholder="Origin (e.g. Port Olisar)">
      <span class="fa-route-arrow">&rarr;</span>
      <input class="fa-input" id="routeDest" placeholder="Destination (e.g. ArcCorp)">
      <button class="fa-btn fa-btn--accent" id="routeAddBtn">Add</button>
    </div>
    <div id="routeList">${routes.length ? routes.map((r, i) => `<div class="fa-row fa-route-item">
        <span class="fa-route-item__path">${r.origin} <span>&rarr;</span> ${r.dest}</span>
        <span class="fa-route-item__time">${TRAVEL_EST[r.est] || '~8 min'}</span>
        <button class="fa-btn fa-btn--sm fa-btn--danger" data-ridx="${i}">Remove</button>
      </div>`).join('') : '<div class="fa-empty">No routes planned</div>'}</div>`;
  $('#routeAddBtn').addEventListener('click', () => {
    const o = $('#routeOrigin').value.trim(), d = $('#routeDest').value.trim();
    if (!o || !d) return;
    const r = getRoutes(); r.push({ origin: o, dest: d, est: estTravel(o, d) });
    saveRoutes(r); renderRouteModal();
  });
  $('#routeList').addEventListener('click', e => {
    const idx = e.target.dataset?.ridx;
    if (idx !== undefined) { const r = getRoutes(); r.splice(+idx, 1); saveRoutes(r); renderRouteModal(); }
  });
  openFA('routeModal');
}

// ── 25. Ship Upgrade Path ─────────────────────────────────────────────────────
const UPGRADE_TIERS = [
  { label: 'Starter', picks: ['aurora-mr', 'avenger-titan', 'arrow', 'nomad', 'gladius'] },
  { label: 'Mid-Range', picks: ['cutlass-black', 'prospector', 'vulture', 'freelancer-max', 'vanguard-warden'] },
  { label: 'Heavy', picks: ['constellation-andromeda', 'caterpillar', 'c2-hercules', 'mole', 'mercury-star-runner'] },
  { label: 'Capital', picks: ['reclaimer', 'carrack', 'hammerhead'] },
  { label: 'Endgame', picks: ['890-jump'] },
];

export function showUpgradePath(currentShipId) {
  createModal('upgradeModal');
  const cur = getShipById(currentShipId);
  let html = `${closeBtn('upgradeModal')}
    <div class="fa-modal__title">Upgrade Path</div>
    <div class="fa-modal__sub">From ${cur ? cur.name : currentShipId}</div>`;
  UPGRADE_TIERS.forEach((tier, ti) => {
    html += `<div class="fa-upgrade-tier"><div class="fa-upgrade-tier__label">${tier.label}</div>`;
    tier.picks.forEach(id => {
      const s = getShipById(id); if (!s) return;
      const c = id === currentShipId;
      html += `<div class="fa-upgrade-ship${c ? ' current' : ''}">
        <span class="fa-upgrade-ship__name">${s.name}${c ? ' (current)' : ''}</span>
        <span class="fa-upgrade-ship__role">${s.role}</span>
        <span class="fa-upgrade-ship__price">${fmt(s.price)} aUEC</span></div>`;
    });
    if (ti < UPGRADE_TIERS.length - 1) html += '<div class="fa-upgrade-connector"></div>';
    html += '</div>';
  });
  $('#upgradeModal').innerHTML = html;
  openFA('upgradeModal');
}

// ── 28. Daily Challenges ──────────────────────────────────────────────────────
const CHALLENGES = [
  { text: 'Mine 50 units of Quantanium', reward: '~75k aUEC' },
  { text: 'Complete 5 bounty contracts', reward: '~60k aUEC' },
  { text: 'Trade at 3 different stations', reward: '~40k aUEC' },
  { text: 'Complete 3 delivery missions', reward: '~18k aUEC' },
  { text: 'Salvage 2 ship wrecks', reward: '~50k aUEC' },
  { text: 'Clear a bunker without dying', reward: '~25k aUEC' },
  { text: 'Earn 100,000 aUEC in one session', reward: 'Achievement' },
  { text: 'Visit 4 different moons', reward: 'Explorer XP' },
  { text: 'Sell cargo worth over 50k aUEC', reward: '~55k aUEC' },
  { text: 'Complete an HRT bounty solo', reward: '~30k aUEC' },
  { text: 'Mine 3 different mineral types', reward: '~35k aUEC' },
  { text: 'Land at 5 different pads', reward: 'Pilot XP' },
];
function dayOfYear() { const n = new Date(), s = new Date(n.getFullYear(), 0, 0); return Math.floor((n - s) / 864e5); }
function seededRand(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

export function generateDailyChallenges() {
  const day = dayOfYear(), rand = seededRand(day * 7919), idx = [];
  while (idx.length < 3) { const i = Math.floor(rand() * CHALLENGES.length); if (!idx.includes(i)) idx.push(i); }
  return idx.map(i => ({ ...CHALLENGES[i], id: `dc_${day}_${i}` }));
}

function initDailyChallenges() {
  const el = $('.challenges-widget'); if (!el) return;
  const ch = generateDailyChallenges(), done = scGet('sc_challenges_done', []);
  el.innerHTML = `<div class="challenges-widget__title">Daily Challenges</div>
    ${ch.map(c => { const d = done.includes(c.id);
      return `<div class="fa-challenge${d ? ' completed' : ''}">
        <div class="fa-challenge__check${d ? ' done' : ''}" data-cid="${c.id}"></div>
        <span class="fa-challenge__text">${c.text}</span>
        <span class="fa-challenge__reward">${c.reward}</span></div>`;
    }).join('')}`;
  el.addEventListener('click', e => {
    const cid = e.target.dataset?.cid; if (!cid) return;
    let d = scGet('sc_challenges_done', []);
    d = d.includes(cid) ? d.filter(x => x !== cid) : [...d, cid];
    scSet('sc_challenges_done', d); initDailyChallenges();
  });
}

// ── 30. Widget Visibility Toggle ──────────────────────────────────────────────
const WIDGETS = [
  { key: 'challenges', label: 'Challenges', sel: '.challenges-widget' },
  { key: 'patch', label: 'Patch Notes', sel: '.patch-widget' },
  { key: 'timer', label: 'Session Timer', sel: '.session-timer' },
  { key: 'methods', label: 'Methods', sel: '#methodsSection' },
  { key: 'ships', label: 'Ships', sel: '#shipsSection' },
  { key: 'plan', label: 'Plan', sel: '#planSection' },
];

function applyWidgetPrefs(p) {
  WIDGETS.forEach(w => { const e = $(w.sel); if (!e) return;
    if (p[w.key] === false) e.classList.add('hidden-widget', 'draggable-widget');
    else e.classList.remove('hidden-widget');
    if (!e.classList.contains('draggable-widget')) e.classList.add('draggable-widget');
  });
}

function initWidgetToggle() {
  const el = $('.fa-widget-toggle'); if (!el) return;
  const p = scGet('sc_widgets', WIDGETS.reduce((o, w) => { o[w.key] = true; return o; }, {}));
  el.innerHTML = `<div class="fa-widget-toggle__title">Dashboard Widgets</div>
    <div class="fa-widget-toggle__grid">${WIDGETS.map(w => `
      <div class="fa-widget-opt${p[w.key] !== false ? ' active' : ''}" data-wkey="${w.key}">
        <span class="fa-widget-opt__dot"></span>${w.label}</div>`).join('')}</div>`;
  applyWidgetPrefs(p);
  el.addEventListener('click', e => {
    const opt = e.target.closest('.fa-widget-opt'); if (!opt) return;
    const pr = scGet('sc_widgets', {}); pr[opt.dataset.wkey] = !(pr[opt.dataset.wkey] !== false);
    scSet('sc_widgets', pr); initWidgetToggle();
  });
}

// ── 31. Export to PDF ─────────────────────────────────────────────────────────
export function exportToPDF() { window.print(); }

// ── 32. Share via Link ────────────────────────────────────────────────────────
function showShareToast(msg) {
  let el = $('.fa-share-copied');
  if (!el) { el = document.createElement('div'); el.className = 'fa-share-copied'; document.body.appendChild(el); }
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

export function generateShareLink() {
  const params = new URLSearchParams();
  ['shipId', 'budget', 'session', 'solo', 'skill', 'risk', 'goalShipId'].forEach(k => {
    try { const v = localStorage.getItem('scp_' + k); if (v !== null) params.set(k, JSON.parse(v)); } catch {}
  });
  const url = location.origin + location.pathname + '?share=1&' + params.toString();
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => showShareToast('Link copied to clipboard'));
  return url;
}

export function parseShareLink() {
  const p = new URLSearchParams(location.search);
  if (!p.has('share')) return false;
  ['shipId', 'budget', 'session', 'solo', 'skill', 'risk', 'goalShipId'].forEach(k => {
    if (!p.has(k)) return;
    let v = p.get(k);
    if (v === 'true') v = true; else if (v === 'false') v = false; else if (!isNaN(v) && v !== '') v = Number(v);
    try { localStorage.setItem('scp_' + k, JSON.stringify(v)); } catch {}
  });
  history.replaceState({}, '', location.pathname);
  return true;
}

// ── 36. Session Timer ─────────────────────────────────────────────────────────
let _tInt = null, _tSec = 0, _tDir = 1, _tRun = false;

function renderTimer(el) {
  const mm = String(Math.floor(Math.abs(_tSec) / 60)).padStart(2, '0');
  const ss = String(Math.abs(_tSec) % 60).padStart(2, '0');
  el.innerHTML = `<span class="session-timer__display">${mm}:${ss}</span>
    <div class="session-timer__controls">
      <button class="session-timer__btn" id="tPP" title="${_tRun ? 'Pause' : 'Play'}">${_tRun ? '||' : '\u25B6'}</button>
      <button class="session-timer__btn" id="tRst" title="Reset">\u21BA</button>
      <button class="session-timer__btn" id="tSet" title="Set">Set</button>
    </div>
    <button class="session-timer__minimize" id="tMin" title="Minimize">\u2014</button>`;
  $('#tPP')?.addEventListener('click', () => { _tRun ? pauseTimer() : startTimerUp(); renderTimer(el); });
  $('#tRst')?.addEventListener('click', () => { resetTimer(); renderTimer(el); });
  $('#tSet')?.addEventListener('click', () => { const m = prompt('Countdown minutes:', '30'); if (m && !isNaN(m)) { startTimer(+m); renderTimer(el); } });
  $('#tMin')?.addEventListener('click', () => el.classList.toggle('minimized'));
}

function initSessionTimer() {
  let el = $('.session-timer');
  if (!el) { el = document.createElement('div'); el.className = 'session-timer'; document.body.appendChild(el); }
  renderTimer(el);
}

export function startTimer(minutes) {
  clearInterval(_tInt); _tSec = minutes * 60; _tDir = -1; _tRun = true;
  const el = $('.session-timer');
  _tInt = setInterval(() => {
    _tSec += _tDir;
    if (_tSec <= 0 && _tDir === -1) { _tSec = 0; pauseTimer(); el?.classList.add('times-up'); setTimeout(() => el?.classList.remove('times-up'), 5500); }
    if (el) renderTimer(el);
  }, 1000);
}
function startTimerUp() {
  clearInterval(_tInt); _tDir = 1; _tRun = true;
  const el = $('.session-timer');
  _tInt = setInterval(() => { _tSec += 1; if (el) renderTimer(el); }, 1000);
}
export function pauseTimer() { clearInterval(_tInt); _tRun = false; }
export function resetTimer() { clearInterval(_tInt); _tSec = 0; _tRun = false; _tDir = 1; }

// ── 38. Method Comparison Table ───────────────────────────────────────────────
const R_LBL = { low: 'Low', medium: 'Medium', high: 'High' };
const S_LBL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const FUN = { 'box-delivery': 2, 'bounty-vlrt': 3, 'bounty-lrt': 3, 'bounty-mrt': 4, 'bounty-hrt': 4, 'bounty-vhrt': 5, 'bounty-ert': 5, 'trade-low': 2, 'trade-med': 3, 'trade-high': 3, 'roc-mining': 4, 'prospector-quantanium': 5, 'prospector-safe': 3, 'salvage-vulture': 4, 'bunker-low': 3, 'bunker-high': 5 };

export function showComparisonModal(methods) {
  if (!methods || methods.length < 2) return;
  createModal('compareModal');
  const items = methods.slice(0, 3);
  const stars = n => '\u2605'.repeat(n) + '\u2606'.repeat(5 - n);
  const row = (lbl, fn) => `<tr><td class="compare-label">${lbl}</td>${items.map(fn).join('')}</tr>`;
  $('#compareModal').innerHTML = `${closeBtn('compareModal')}
    <div class="fa-modal__title">Method Comparison</div>
    <div class="fa-modal__sub">Side-by-side analysis</div>
    <table class="fa-compare-table">
    <thead><tr><th></th>${items.map(m => `<th>${m.name}</th>`).join('')}</tr></thead>
    <tbody>
      ${row('Rate', m => `<td class="fa-compare-highlight">${fmt(m.aUEChr)}/hr</td>`)}
      ${row('Range', m => `<td>${fmt(m.aUEChrLow)} - ${fmt(m.aUEChrHigh)}/hr</td>`)}
      ${row('Risk', m => `<td>${R_LBL[m.risk] || m.risk}</td>`)}
      ${row('Skill', m => `<td>${S_LBL[m.skillLevel] || m.skillLevel}</td>`)}
      ${row('Fun', m => `<td>${stars(FUN[m.id] || 3)}</td>`)}
      ${row('Ships', m => `<td>${(m.bestWith || []).map(id => { const s = getShipById(id); return s ? s.name : id; }).join(', ') || 'Any'}</td>`)}
    </tbody></table>`;
  openFA('compareModal');
}

// ── 40. Saved Presets ─────────────────────────────────────────────────────────
export function getPresets() { return scGet('sc_presets', {}); }
export function savePreset(name) {
  const presets = getPresets(), data = {};
  ['shipId', 'budget', 'session', 'solo', 'skill', 'risk', 'goalShipId'].forEach(k => {
    try { const v = localStorage.getItem('scp_' + k); if (v !== null) data[k] = JSON.parse(v); } catch {}
  });
  const t = localStorage.getItem('scp_theme'); if (t) data.theme = JSON.parse(t);
  presets[name] = data; scSet('sc_presets', presets);
}
export function loadPreset(name) {
  const d = getPresets()[name]; if (!d) return;
  Object.entries(d).forEach(([k, v]) => { try { localStorage.setItem('scp_' + k, JSON.stringify(v)); } catch {} });
  location.reload();
}
export function deletePreset(name) { const p = getPresets(); delete p[name]; scSet('sc_presets', p); }

function renderPresetsModal() {
  createModal('presetsModal');
  const presets = getPresets(), names = Object.keys(presets);
  $('#presetsModal').innerHTML = `${closeBtn('presetsModal')}
    <div class="fa-modal__title">Saved Presets</div>
    <div class="fa-modal__sub">Save and restore configurations</div>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <input class="fa-input" id="presetNameInput" placeholder="Preset name...">
      <button class="fa-btn fa-btn--accent" id="presetSaveBtn">Save Current</button>
    </div>
    <div id="presetsList">${names.length ? names.map(n => `<div class="fa-row fa-preset-item">
        <span class="fa-preset-item__name">${n}</span>
        <span class="fa-preset-item__meta">${presets[n].shipId || ''}</span>
        <button class="fa-btn fa-btn--sm" data-pload="${n}">Load</button>
        <button class="fa-btn fa-btn--sm fa-btn--danger" data-pdel="${n}">Del</button>
      </div>`).join('') : '<div class="fa-empty">No presets saved</div>'}</div>`;
  $('#presetSaveBtn').addEventListener('click', () => {
    const n = $('#presetNameInput').value.trim(); if (!n) return;
    savePreset(n); renderPresetsModal();
  });
  $('#presetsList').addEventListener('click', e => {
    if (e.target.dataset?.pload) loadPreset(e.target.dataset.pload);
    if (e.target.dataset?.pdel) { deletePreset(e.target.dataset.pdel); renderPresetsModal(); }
  });
  openFA('presetsModal');
}

// ── 41. Import/Export Data ────────────────────────────────────────────────────
export function exportAllData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith('sc_') || k.startsWith('scp_'))
      try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); }
  }
  return JSON.stringify(data, null, 2);
}
export function importAllData(json) {
  try { const d = typeof json === 'string' ? JSON.parse(json) : json;
    Object.entries(d).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)));
    return true;
  } catch { return false; }
}

function readAndImport(file) {
  const r = new FileReader();
  r.onload = () => { if (importAllData(r.result)) { showShareToast('Data imported'); location.reload(); } else showShareToast('Invalid JSON'); };
  r.readAsText(file);
}

function renderImportExportModal() {
  createModal('ioModal');
  $('#ioModal').innerHTML = `${closeBtn('ioModal')}
    <div class="fa-modal__title">Import / Export Data</div>
    <div class="fa-modal__sub">Backup or transfer your data</div>
    <div class="fa-import-export">
      <button class="fa-btn fa-btn--accent" id="ioExportBtn">Export &amp; Download JSON</button>
      <div class="fa-import-drop" id="ioDropZone">Click to upload JSON or drag &amp; drop</div>
      <input type="file" id="ioFileInput" accept=".json" style="display:none">
      <textarea class="fa-import-export__area" id="ioTxt" placeholder="Or paste JSON here..."></textarea>
      <button class="fa-btn" id="ioImportBtn">Import from text</button>
    </div>`;
  $('#ioExportBtn').addEventListener('click', () => {
    const b = new Blob([exportAllData()], { type: 'application/json' }), u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = 'sc-planner-data.json'; a.click(); URL.revokeObjectURL(u);
  });
  const dz = $('#ioDropZone'), fi = $('#ioFileInput');
  dz.addEventListener('click', () => fi.click());
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor = 'var(--g)'; });
  dz.addEventListener('dragleave', () => { dz.style.borderColor = ''; });
  dz.addEventListener('drop', e => { e.preventDefault(); dz.style.borderColor = ''; if (e.dataTransfer.files[0]) readAndImport(e.dataTransfer.files[0]); });
  fi.addEventListener('change', () => { if (fi.files[0]) readAndImport(fi.files[0]); });
  $('#ioImportBtn').addEventListener('click', () => {
    const j = $('#ioTxt').value.trim(); if (!j) return;
    if (importAllData(j)) { showShareToast('Data imported'); location.reload(); } else showShareToast('Invalid JSON');
  });
  openFA('ioModal');
}

// ── 44. Patch Notes Widget ────────────────────────────────────────────────────
function initPatchWidget() {
  const el = $('.patch-widget'); if (!el) return;
  el.innerHTML = `<div class="patch-widget__title">Patch Notes</div>
    <div class="patch-widget__header">
      <span class="patch-widget__version">SC 4.0 Live</span>
      <span class="patch-widget__date">March 2026</span>
    </div>
    <div class="patch-widget__item">Cargo hauling rates adjusted; C2 Hercules remains top-tier for trade runs</div>
    <div class="patch-widget__item">Quantanium mining payouts stable; Prospector still the solo mining benchmark</div>
    <div class="patch-widget__item">Bunker mission rewards increased by ~15% for high-threat variants</div>
    <div class="patch-widget__item">Salvage economy rebalanced; Reclaimer earnings slightly reduced from 3.23</div>`;
}

// ── 47. Streaming Overlay Mode ────────────────────────────────────────────────
export function toggleOverlayMode() {
  document.body.classList.toggle('overlay-mode');
  let btn = $('.overlay-toggle');
  if (!btn) { btn = document.createElement('button'); btn.className = 'overlay-toggle'; btn.textContent = 'Exit OBS';
    btn.addEventListener('click', () => toggleOverlayMode()); document.body.appendChild(btn); }
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initFeaturesA() {
  parseShareLink();
  initSessionTimer();
  initDailyChallenges();
  initWidgetToggle();
  initPatchWidget();
  window.openFleetModal = renderFleetModal;
  window.openRouteModal = renderRouteModal;
  window.openPresetsModal = renderPresetsModal;
  window.openImportExport = renderImportExportModal;
  window.openUpgradePath = showUpgradePath;
  window.openComparison = showComparisonModal;
  window.shareLink = generateShareLink;
  window.printPage = exportToPDF;
  window.toggleOBS = toggleOverlayMode;
}
