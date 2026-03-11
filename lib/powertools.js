/**
 * @file Power-user tools — keyboard shortcuts, comparison mode, earning calculator,
 * quick theme toggle, export build, and toast notifications.
 * @module lib/powertools
 */

import { $, $$, fmt, fmtK, fmtHrs, loadState, saveState } from './utils.js';
import { getAllShips, getShipById } from '../data/ships.js';
import { routes } from '../data/routes.js';
import { openModal } from './modal.js';
import { applyTheme, applyManufacturerTheme } from './themes.js';
import { getMethodsForShip } from './advisor.js';
import { REFINERY_METHODS } from './data-extended.js';

// ─── Shared refs (set via initPowerTools) ───────────────────────────────────

let _state = null;
let _updateAll = null;

// ─── Toast Notification System ──────────────────────────────────────────────

let toastContainer = null;

function ensureToastContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement('div');
  toastContainer.className = 'pt-toast-container';
  document.body.appendChild(toastContainer);
  return toastContainer;
}

/**
 * Show a slide-in toast notification from the bottom-right.
 * @param {string} message
 * @param {number} duration - Auto-dismiss in ms (default 3000)
 */
export function showToast(message, duration = 3000) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = 'pt-toast';
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger slide-in on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    // Fallback removal
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 500);
  }, duration);
}

// ─── Keyboard Shortcuts Overlay ─────────────────────────────────────────────

const SHORTCUTS = [
  { keys: ['?'],            label: 'Show keyboard shortcuts' },
  { keys: ['/', 'Ctrl+K'],  label: 'Open search' },
  { keys: ['1'],            label: 'Jump to Overview' },
  { keys: ['2'],            label: 'Jump to Methods' },
  { keys: ['3'],            label: 'Jump to Ships' },
  { keys: ['4'],            label: 'Jump to Plan' },
  { keys: ['T'],            label: 'Cycle themes' },
  { keys: ['S'],            label: 'Toggle Solo / Group' },
  { keys: ['R'],            label: 'Cycle risk level' },
  { keys: ['['],            label: 'Previous ship (by price)' },
  { keys: [']'],            label: 'Next ship (by price)' },
  { keys: ['C'],            label: 'Compare ships' },
  { keys: ['E'],            label: 'Earning calculator' },
  { keys: ['D'],            label: 'Trade calculator' },
  { keys: ['F'],            label: 'Fleet manager' },
  { keys: ['G'],            label: 'Refinery calculator' },
  { keys: ['H'],            label: 'Session history' },
  { keys: ['L'],            label: 'Toggle light / dark mode' },
  { keys: ['Ctrl+E'],       label: 'Export build to clipboard' },
  { keys: ['Esc'],          label: 'Close any overlay' },
];

function showShortcutsModal() {
  const rows = SHORTCUTS.map(s => {
    const kbds = s.keys.map(k => `<kbd>${k}</kbd>`).join('');
    return `<div class="pt-shortcut-row">
      <span class="pt-shortcut-label">${s.label}</span>
      <span class="pt-shortcut-keys">${kbds}</span>
    </div>`;
  }).join('');

  openModal(`
    <div class="pt-shortcuts">
      <h2>Keyboard Shortcuts</h2>
      <p class="pt-subtitle">Power-user hotkeys for fast navigation</p>
      <div class="pt-shortcut-grid">${rows}</div>
    </div>
  `);
}

// ─── Ship Comparison Mode ───────────────────────────────────────────────────

function showCompareModal() {
  const ships = getAllShips().sort((a, b) => a.price - b.price);
  const optionsHtml = ships.map(s =>
    `<option value="${s.id}">${s.name} (${fmtK(s.price)})</option>`
  ).join('');

  const selectHtml = `<select class="pt-compare-select">
    <option value="">-- Select ship --</option>
    ${optionsHtml}
  </select>`;

  openModal(`
    <div class="pt-compare">
      <h2>Ship Comparison</h2>
      <div class="pt-compare-selectors">
        ${selectHtml}
        ${selectHtml}
        ${selectHtml}
      </div>
      <div id="ptCompareGrid" class="pt-stats-grid">
        <p style="color:var(--fg2);padding:20px;text-align:center;font-size:0.85rem;">
          Select 2-3 ships above to compare stats side by side.
        </p>
      </div>
    </div>
  `);

  // Wire up selectors
  const selects = document.querySelectorAll('.pt-compare-select');
  selects.forEach(sel => sel.addEventListener('change', () => {
    updateCompareGrid(selects);
  }));
}

function updateCompareGrid(selects) {
  const ids = [...selects].map(s => s.value).filter(Boolean);
  const grid = document.getElementById('ptCompareGrid');
  if (!grid) return;

  if (ids.length < 2) {
    grid.innerHTML = `<p style="color:var(--fg2);padding:20px;text-align:center;font-size:0.85rem;">
      Select at least 2 ships to compare.
    </p>`;
    return;
  }

  const shipObjs = ids.map(id => getShipById(id)).filter(Boolean);
  if (shipObjs.length < 2) return;

  const cols = shipObjs.length + 1; // stat label + ship columns
  const colTemplate = `grid-template-columns: 140px repeat(${shipObjs.length}, 1fr)`;

  const stats = [
    { label: 'Price',    get: s => s.price,   fmt: v => fmt(v) + ' aUEC', best: 'low' },
    { label: 'Cargo',    get: s => s.cargo,   fmt: v => v + ' SCU',       best: 'high' },
    { label: 'Combat',   get: s => s.combat,  fmt: v => v + '/5',         best: 'high' },
    { label: 'Mining',   get: s => s.mining,  fmt: v => v + '/4',         best: 'high' },
    { label: 'Salvage',  get: s => s.salvage, fmt: v => v + '/4',         best: 'high' },
    { label: 'Crew',     get: s => s.crew,    fmt: v => v,                best: 'low' },
    { label: 'ROC',      get: s => s.canROC,  fmt: v => v ? 'Yes' : 'No', best: 'bool' },
    { label: 'Solo',     get: s => s.solo,    fmt: v => v ? 'Yes' : 'No', best: 'bool' },
    { label: 'Tier',     get: s => s.tier,    fmt: v => v,                best: null },
    { label: 'Role',     get: s => s.role,    fmt: v => v,                best: null },
    { label: 'MFR',      get: s => s.mfr,     fmt: v => v,                best: null },
    {
      label: 'Best Rate',
      get: s => {
        const viable = getMethodsForShip(s);
        if (viable.length === 0) return 0;
        return Math.max(...viable.map(m => m.aUEChr));
      },
      fmt: v => v > 0 ? fmtK(v) + '/hr' : 'N/A',
      best: 'high'
    },
    {
      label: 'Methods',
      get: s => getMethodsForShip(s).length,
      fmt: v => v.toString(),
      best: 'high'
    },
  ];

  // Header row
  let html = `<div class="pt-stats-row pt-stats-header" style="${colTemplate}">
    <div class="pt-stats-cell">Stat</div>
    ${shipObjs.map(s => `<div class="pt-stats-cell">${s.name}</div>`).join('')}
  </div>`;

  // Stat rows
  for (const stat of stats) {
    const vals = shipObjs.map(s => stat.get(s));
    let bestIdx = -1, worstIdx = -1;

    if (stat.best === 'high') {
      const numVals = vals.map(Number);
      const max = Math.max(...numVals);
      const min = Math.min(...numVals);
      if (max !== min) {
        bestIdx = numVals.indexOf(max);
        worstIdx = numVals.indexOf(min);
      }
    } else if (stat.best === 'low') {
      const numVals = vals.map(Number);
      const max = Math.max(...numVals);
      const min = Math.min(...numVals);
      if (max !== min) {
        bestIdx = numVals.indexOf(min);
        worstIdx = numVals.indexOf(max);
      }
    } else if (stat.best === 'bool') {
      const trueCount = vals.filter(Boolean).length;
      if (trueCount > 0 && trueCount < vals.length) {
        bestIdx = vals.indexOf(true);
        worstIdx = vals.indexOf(false);
      }
    }

    const cells = vals.map((v, i) => {
      let cls = '';
      if (i === bestIdx) cls = ' pt-best';
      else if (i === worstIdx) cls = ' pt-worst';
      return `<div class="pt-stats-cell${cls}">${stat.fmt(v)}</div>`;
    }).join('');

    html += `<div class="pt-stats-row" style="${colTemplate}">
      <div class="pt-stats-cell">${stat.label}</div>
      ${cells}
    </div>`;
  }

  grid.innerHTML = html;
}

// ─── Earning Calculator ─────────────────────────────────────────────────────

function showEarningCalc() {
  const shipId = loadState('shipId', 'aurora-mr');
  const ship = getShipById(shipId);
  const goalShipId = loadState('goalShipId', null);
  const goalShip = goalShipId ? getShipById(goalShipId) : null;
  const budget = loadState('budget', 10000);

  // Get best method rate for this ship
  let bestRate = 20000; // fallback
  if (ship) {
    const viable = getMethodsForShip(ship);
    if (viable.length > 0) {
      bestRate = Math.max(...viable.map(m => m.aUEChr));
    }
  }

  const goalSection = goalShip ? `
    <div class="pt-earncalc-goal" id="ptCalcGoal">
      <div class="pt-earncalc-goal-name">Goal: ${goalShip.name} (${fmt(goalShip.price)} aUEC)</div>
      <div class="pt-progress-track"><div class="pt-progress-fill" id="ptCalcBar" style="width:0%"></div></div>
      <div class="pt-progress-text">
        <span id="ptCalcProgress">0%</span>
        <span id="ptCalcRemaining"></span>
      </div>
    </div>
  ` : '';

  openModal(`
    <div class="pt-earncalc">
      <h2>Earning Calculator</h2>
      <div class="pt-earncalc-inputs">
        <div class="pt-earncalc-field">
          <label for="ptCalcHours">Hours / Day</label>
          <input type="number" id="ptCalcHours" value="2" min="0.5" max="24" step="0.5">
        </div>
        <div class="pt-earncalc-field">
          <label for="ptCalcDays">Days</label>
          <input type="number" id="ptCalcDays" value="7" min="1" max="365" step="1">
        </div>
      </div>
      <div class="pt-earncalc-result">
        <div class="pt-earncalc-total" id="ptCalcTotal">0 aUEC</div>
        <div class="pt-earncalc-label">
          Estimated earnings using <strong>${ship ? ship.name : 'your ship'}</strong>
          at ~${fmtK(bestRate)}/hr
        </div>
        ${goalSection}
      </div>
    </div>
  `);

  // Wire up live calculation
  const hoursInput = document.getElementById('ptCalcHours');
  const daysInput = document.getElementById('ptCalcDays');

  function recalc() {
    const hours = parseFloat(hoursInput.value) || 0;
    const days = parseFloat(daysInput.value) || 0;
    const totalHours = hours * days;
    const earned = Math.round(totalHours * bestRate);
    const totalWithBudget = earned + budget;

    const totalEl = document.getElementById('ptCalcTotal');
    if (totalEl) totalEl.textContent = fmt(earned) + ' aUEC';

    if (goalShip) {
      const pct = Math.min(100, (totalWithBudget / goalShip.price) * 100);
      const bar = document.getElementById('ptCalcBar');
      const progressEl = document.getElementById('ptCalcProgress');
      const remainEl = document.getElementById('ptCalcRemaining');

      if (bar) {
        bar.style.width = pct + '%';
        bar.classList.toggle('pt-complete', pct >= 100);
      }
      if (progressEl) progressEl.textContent = pct.toFixed(1) + '%';
      if (remainEl) {
        const remaining = Math.max(0, goalShip.price - totalWithBudget);
        remainEl.textContent = remaining > 0 ? fmt(remaining) + ' aUEC remaining' : 'Goal reached!';
      }
    }
  }

  if (hoursInput && daysInput) {
    hoursInput.addEventListener('input', recalc);
    daysInput.addEventListener('input', recalc);
    recalc(); // initial calculation
  }
}

// ─── Dark / Light Quick Toggle ──────────────────────────────────────────────

const LIGHT_THEMES = ['arctic', 'corporate'];
const DARK_DEFAULT = 'void';
const LIGHT_DEFAULT = 'arctic';

function toggleLightDark() {
  const current = loadState('theme', 'void');
  const isLight = LIGHT_THEMES.includes(current);
  const newTheme = isLight ? DARK_DEFAULT : LIGHT_DEFAULT;

  applyTheme(newTheme);
  saveState('theme', newTheme);
  showToast(`Switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme`);
}

// ─── Cycle Themes ───────────────────────────────────────────────────────────

const CYCLE_THEMES = ['void', 'arctic', 'crimson', 'neon', 'tactical', 'corporate'];

function cycleTheme() {
  const current = loadState('theme', 'void');
  const idx = CYCLE_THEMES.indexOf(current);
  const next = CYCLE_THEMES[(idx + 1) % CYCLE_THEMES.length];
  applyTheme(next);
  saveState('theme', next);
  showToast(`Theme: ${next.charAt(0).toUpperCase() + next.slice(1)}`);
}

// ─── Navigate Ships by Price ────────────────────────────────────────────────

function navigateShip(direction) {
  const ships = getAllShips().sort((a, b) => a.price - b.price);
  const currentId = _state ? _state.shipId : loadState('shipId', 'aurora-mr');
  const idx = ships.findIndex(s => s.id === currentId);
  let newIdx = idx + direction;

  if (newIdx < 0) newIdx = ships.length - 1;
  if (newIdx >= ships.length) newIdx = 0;

  const newShip = ships[newIdx];
  if (_state) { _state.shipId = newShip.id; }
  saveState('shipId', newShip.id);
  applyManufacturerTheme(newShip.mfr);
  if (_updateAll) _updateAll();
  showToast(`Ship: ${newShip.name}`);
}

// ─── Toggle Solo/Group ──────────────────────────────────────────────────────

function toggleSolo() {
  const current = _state ? _state.solo : loadState('solo', true);
  const next = !current;
  if (_state) { _state.solo = next; }
  saveState('solo', next);
  // Sync header toggle UI
  const val = next ? 'solo' : 'group';
  $$('#soloToggle .tbtn').forEach(b => b.classList.toggle('active', b.dataset.val === val));
  $$('#soloToggleMobile .tbtn').forEach(b => b.classList.toggle('active', b.dataset.val === val));
  if (_updateAll) _updateAll();
  showToast(next ? 'Mode: Solo' : 'Mode: Group');
}

// ─── Cycle Risk ─────────────────────────────────────────────────────────────

const RISK_LEVELS = ['low', 'medium', 'high'];

function cycleRisk() {
  const current = _state ? _state.risk : loadState('risk', 'low');
  const idx = RISK_LEVELS.indexOf(current);
  const next = RISK_LEVELS[(idx + 1) % RISK_LEVELS.length];
  if (_state) { _state.risk = next; }
  saveState('risk', next);
  // Sync header toggle UI
  $$('#riskToggle .tbtn').forEach(b => b.classList.toggle('active', b.dataset.val === next));
  $$('#riskToggleMobile .tbtn').forEach(b => b.classList.toggle('active', b.dataset.val === next));
  if (_updateAll) _updateAll();
  showToast(`Risk: ${next.charAt(0).toUpperCase() + next.slice(1)}`);
}

// ─── Export Build ───────────────────────────────────────────────────────────

function exportBuild() {
  const shipId = loadState('shipId', 'aurora-mr');
  const ship = getShipById(shipId);
  const budget = loadState('budget', 10000);
  const session = loadState('session', 2);
  const solo = loadState('solo', true);
  const skill = loadState('skill', 'beginner');
  const risk = loadState('risk', 'low');
  const goalShipId = loadState('goalShipId', null);
  const goalShip = goalShipId ? getShipById(goalShipId) : null;

  let bestMethod = 'N/A';
  let bestRate = 0;
  if (ship) {
    const viable = getMethodsForShip(ship);
    if (viable.length > 0) {
      const sorted = [...viable].sort((a, b) => b.aUEChr - a.aUEChr);
      bestMethod = sorted[0].name;
      bestRate = sorted[0].aUEChr;
    }
  }

  let goalLine = '';
  if (goalShip && bestRate > 0) {
    const remaining = Math.max(0, goalShip.price - budget);
    const hoursNeeded = remaining / bestRate;
    const sessionsNeeded = Math.ceil(hoursNeeded / session);
    goalLine = `\nGoal Ship:  ${goalShip.name} (${fmt(goalShip.price)} aUEC)\nRemaining:  ${fmt(remaining)} aUEC\nEst. Time:  ${fmtHrs(hoursNeeded)} (~${sessionsNeeded} sessions)`;
  }

  const text = `SC Planner Build
${'='.repeat(32)}
Ship:       ${ship ? ship.name : 'None'}
Budget:     ${fmt(budget)} aUEC
Session:    ${session}h
Mode:       ${solo ? 'Solo' : 'Group'}
Skill:      ${skill.charAt(0).toUpperCase() + skill.slice(1)}
Risk:       ${risk.charAt(0).toUpperCase() + risk.slice(1)}
Best Method: ${bestMethod} (~${fmtK(bestRate)}/hr)${goalLine}
${'='.repeat(32)}
Generated by SC Planner`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('Build copied to clipboard!');
  }).catch(() => {
    showToast('Could not copy — check clipboard permissions');
  });
}

// ─── Section Jump ───────────────────────────────────────────────────────────

const SECTIONS = ['rec-hero', 'methods-section', 'ships-section', 'plan-section'];

function jumpToSection(idx) {
  const id = SECTIONS[idx];
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// ─── Open Search ────────────────────────────────────────────────────────────

function openSearch() {
  const gsearch = document.getElementById('globalSearch');
  if (gsearch) {
    gsearch.classList.add('open');
    const input = document.getElementById('gsearchInput');
    if (input) input.focus();
  }
}

// ─── Keyboard Handler ───────────────────────────────────────────────────────

function isTyping(e) {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (e.target.isContentEditable) return true;
  return false;
}

function handleKeydown(e) {
  // Never intercept when typing in form fields
  if (isTyping(e)) return;

  const key = e.key;
  const ctrl = e.ctrlKey || e.metaKey;

  // Ctrl combos
  if (ctrl) {
    if (key === 'k' || key === 'K') {
      e.preventDefault();
      openSearch();
      return;
    }
    if (key === 'e' || key === 'E') {
      e.preventDefault();
      exportBuild();
      return;
    }
    return; // Don't process other Ctrl combos
  }

  switch (key) {
    case '?':
      showShortcutsModal();
      break;
    case '/':
      e.preventDefault();
      openSearch();
      break;
    case '1': case '2': case '3': case '4':
      jumpToSection(parseInt(key) - 1);
      break;
    case 't': case 'T':
      cycleTheme();
      break;
    case 's': case 'S':
      toggleSolo();
      break;
    case 'r': case 'R':
      cycleRisk();
      break;
    case '[':
      navigateShip(-1);
      break;
    case ']':
      navigateShip(1);
      break;
    case 'c': case 'C':
      showCompareModal();
      break;
    case 'd': case 'D':
      showTradeCalc();
      break;
    case 'e': case 'E':
      showEarningCalc();
      break;
    case 'f': case 'F':
      showFleetManager();
      break;
    case 'g': case 'G':
      showRefineryCalc();
      break;
    case 'h': case 'H':
      showSessionHistory();
      break;
    case 'l': case 'L':
      toggleLightDark();
      break;
  }
}

// ─── Trade Calculator ──────────────────────────────────────────────────────

function showTradeCalc() {
  const shipId = loadState('shipId', 'aurora-mr');
  const ship = getShipById(shipId);
  const budget = loadState('budget', 10000);
  const maxSCU = ship ? ship.cargo : 10;

  const routeOpts = routes.map(r =>
    `<option value="${r.id}">${r.name} (${fmt(r.profitSCU)}/SCU)</option>`
  ).join('');

  openModal(`
    <div class="pt-tradecalc">
      <h2>Trade Calculator</h2>
      <div class="pt-earncalc-inputs">
        <div class="pt-earncalc-field">
          <label for="ptTradeRoute">Route</label>
          <select id="ptTradeRoute" class="pt-compare-select">${routeOpts}</select>
        </div>
        <div class="pt-earncalc-field">
          <label for="ptTradeSCU">SCU to Fill</label>
          <input type="number" id="ptTradeSCU" value="${maxSCU}" min="1" max="9999" step="1">
        </div>
      </div>
      <div id="ptTradeResult" class="pt-earncalc-result"></div>
    </div>
  `);

  const routeSel = document.getElementById('ptTradeRoute');
  const scuInput = document.getElementById('ptTradeSCU');

  function recalcTrade() {
    const r = routes.find(rt => rt.id === routeSel.value);
    const scu = parseInt(scuInput.value) || 0;
    const resultEl = document.getElementById('ptTradeResult');
    if (!r || !resultEl) return;

    const totalBuy = scu * r.buySCU;
    const totalSell = scu * r.sellSCU;
    const profit = scu * r.profitSCU;
    const canAfford = totalBuy <= budget;
    const affordSCU = Math.floor(budget / r.buySCU);
    const runsPerHr = 60 / r.time;
    const profitPerHr = Math.round(profit * runsPerHr);

    resultEl.innerHTML = `
      <div class="pt-earncalc-total">${fmt(profit)} aUEC profit</div>
      <div class="pt-earncalc-label">
        <div>Buy Cost: ${fmt(totalBuy)} aUEC · Sell: ${fmt(totalSell)} aUEC</div>
        <div>Route Time: ${r.time} min · Risk: ${r.risk} · ${fmt(profitPerHr)}/hr</div>
        <div>${canAfford ? 'You can afford this run.' : `Need ${fmt(totalBuy - budget)} more aUEC. You can fill ${affordSCU} SCU.`}</div>
        ${r.notes ? `<div style="margin-top:6px;color:var(--mt);font-size:0.78rem;">${r.notes}</div>` : ''}
      </div>`;
  }

  if (routeSel && scuInput) {
    routeSel.addEventListener('change', recalcTrade);
    scuInput.addEventListener('input', recalcTrade);
    recalcTrade();
  }
}

// ─── Refinery Calculator ────────────────────────────────────────────────────

function showRefineryCalc() {
  const SPEED_MULT = { 'very-low': 0.3, 'low': 0.6, 'moderate': 1.0, 'high': 1.5 };
  const YIELD_MULT = { low: 0.7, moderate: 0.85, high: 1.0 };
  const COST_MULT = { low: 0.6, moderate: 1.0, high: 1.4 };

  const methodOpts = REFINERY_METHODS.map((m, i) =>
    `<option value="${i}">${m.name}</option>`
  ).join('');

  openModal(`
    <div class="pt-refinery">
      <h2>Refinery Calculator</h2>
      <div class="pt-earncalc-inputs">
        <div class="pt-earncalc-field">
          <label for="ptRefMethod">Refinery Method</label>
          <select id="ptRefMethod" class="pt-compare-select">${methodOpts}</select>
        </div>
        <div class="pt-earncalc-field">
          <label for="ptRefOre">Ore Value (aUEC)</label>
          <input type="number" id="ptRefOre" value="50000" min="1000" max="10000000" step="1000">
        </div>
      </div>
      <div id="ptRefResult" class="pt-earncalc-result"></div>
      <div class="pt-refinery-grid" id="ptRefGrid"></div>
    </div>
  `);

  const methodSel = document.getElementById('ptRefMethod');
  const oreInput = document.getElementById('ptRefOre');

  function recalcRefinery() {
    const m = REFINERY_METHODS[parseInt(methodSel.value)];
    const oreVal = parseInt(oreInput.value) || 0;
    const resultEl = document.getElementById('ptRefResult');
    const gridEl = document.getElementById('ptRefGrid');
    if (!m || !resultEl) return;

    const yieldPct = YIELD_MULT[m.yield] || 0.85;
    const costPct = COST_MULT[m.cost] || 1.0;
    const speedFactor = SPEED_MULT[m.speed] || 1.0;

    const refinedValue = Math.round(oreVal * yieldPct);
    const refCost = Math.round(oreVal * costPct * 0.08); // ~8% base refinery cost
    const netProfit = refinedValue - refCost;
    const timeEst = Math.round(30 / speedFactor); // base 30 min

    resultEl.innerHTML = `
      <div class="pt-earncalc-total">${fmt(netProfit)} aUEC net</div>
      <div class="pt-earncalc-label">
        <div>Refined Value: ${fmt(refinedValue)} · Cost: ${fmt(refCost)} · Time: ~${timeEst} min</div>
        <div>Yield: ${(yieldPct * 100).toFixed(0)}% · Speed: ${m.speed} · Method Cost: ${m.cost}</div>
      </div>`;

    // Comparison grid of all methods
    if (gridEl) {
      let html = `<div class="pt-stats-row pt-stats-header" style="grid-template-columns:1fr 60px 60px 60px 80px">
        <div class="pt-stats-cell">Method</div><div class="pt-stats-cell">Yield</div><div class="pt-stats-cell">Speed</div><div class="pt-stats-cell">Cost</div><div class="pt-stats-cell">Net</div>
      </div>`;
      REFINERY_METHODS.forEach((rm, i) => {
        const y = YIELD_MULT[rm.yield] || 0.85;
        const c = COST_MULT[rm.cost] || 1.0;
        const rv = Math.round(oreVal * y);
        const rc = Math.round(oreVal * c * 0.08);
        const net = rv - rc;
        const active = i === parseInt(methodSel.value) ? ' pt-best' : '';
        html += `<div class="pt-stats-row" style="grid-template-columns:1fr 60px 60px 60px 80px">
          <div class="pt-stats-cell${active}">${rm.name}</div>
          <div class="pt-stats-cell">${(y * 100).toFixed(0)}%</div>
          <div class="pt-stats-cell">${rm.speed}</div>
          <div class="pt-stats-cell">${rm.cost}</div>
          <div class="pt-stats-cell${net === Math.max(...REFINERY_METHODS.map(x => Math.round(oreVal * (YIELD_MULT[x.yield]||0.85)) - Math.round(oreVal * (COST_MULT[x.cost]||1)*0.08))) ? ' pt-best' : ''}">${fmtK(net)}</div>
        </div>`;
      });
      gridEl.innerHTML = html;
    }
  }

  if (methodSel && oreInput) {
    methodSel.addEventListener('change', recalcRefinery);
    oreInput.addEventListener('input', recalcRefinery);
    recalcRefinery();
  }
}

// ─── Fleet Manager ──────────────────────────────────────────────────────────

const FLEET_KEY = 'scp_fleet';

function getFleet() {
  try {
    const raw = localStorage.getItem(FLEET_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFleet(fleet) {
  try { localStorage.setItem(FLEET_KEY, JSON.stringify(fleet)); } catch {}
}

function showFleetManager() {
  const fleet = getFleet();
  const allShips = getAllShips().sort((a, b) => a.price - b.price);

  const addOpts = allShips.map(s =>
    `<option value="${s.id}">${s.name} (${fmtK(s.price)})</option>`
  ).join('');

  function renderFleetModal() {
    const fl = getFleet();
    const totalValue = fl.reduce((sum, id) => {
      const s = getShipById(id);
      return sum + (s ? s.price : 0);
    }, 0);
    const totalCargo = fl.reduce((sum, id) => {
      const s = getShipById(id);
      return sum + (s ? s.cargo : 0);
    }, 0);

    const shipRows = fl.map((id, i) => {
      const s = getShipById(id);
      if (!s) return '';
      return `<div class="pt-stats-row" style="grid-template-columns:1fr 80px 50px 40px">
        <div class="pt-stats-cell">${s.name}</div>
        <div class="pt-stats-cell">${fmtK(s.price)}</div>
        <div class="pt-stats-cell">${s.cargo} SCU</div>
        <div class="pt-stats-cell"><button class="pt-fleet-rm" data-idx="${i}" title="Remove">&times;</button></div>
      </div>`;
    }).join('');

    return `
      <div class="pt-fleet">
        <h2>Fleet Manager</h2>
        <div class="pt-earncalc-inputs">
          <div class="pt-earncalc-field" style="flex:1">
            <label for="ptFleetAdd">Add Ship</label>
            <select id="ptFleetAdd" class="pt-compare-select">
              <option value="">-- Add a ship --</option>
              ${addOpts}
            </select>
          </div>
        </div>
        <div class="pt-earncalc-result">
          <div class="pt-earncalc-total">${fl.length} ships · ${fmt(totalValue)} aUEC</div>
          <div class="pt-earncalc-label">Total cargo capacity: ${totalCargo} SCU</div>
        </div>
        ${fl.length > 0 ? `
          <div class="pt-stats-grid">
            <div class="pt-stats-row pt-stats-header" style="grid-template-columns:1fr 80px 50px 40px">
              <div class="pt-stats-cell">Ship</div><div class="pt-stats-cell">Value</div><div class="pt-stats-cell">Cargo</div><div class="pt-stats-cell"></div>
            </div>
            ${shipRows}
          </div>
        ` : '<div class="empty-hint">No ships in fleet yet. Add ships above to track your collection.</div>'}
      </div>`;
  }

  openModal(renderFleetModal());

  // Wire up add and remove
  setTimeout(() => {
    const addSel = document.getElementById('ptFleetAdd');
    if (addSel) {
      addSel.addEventListener('change', () => {
        if (!addSel.value) return;
        const fl = getFleet();
        fl.push(addSel.value);
        saveFleet(fl);
        // Re-render modal content
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) modalBody.innerHTML = renderFleetModal();
        // Re-wire after re-render
        wireFleetEvents();
        showToast('Ship added to fleet!');
      });
    }
    wireFleetEvents();
  }, 50);

  function wireFleetEvents() {
    document.querySelectorAll('.pt-fleet-rm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const fl = getFleet();
        fl.splice(idx, 1);
        saveFleet(fl);
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) modalBody.innerHTML = renderFleetModal();
        wireFleetEvents();
        showToast('Ship removed from fleet');
      });
    });
    // Re-wire add select after re-render
    const addSel = document.getElementById('ptFleetAdd');
    if (addSel) {
      addSel.addEventListener('change', () => {
        if (!addSel.value) return;
        const fl = getFleet();
        fl.push(addSel.value);
        saveFleet(fl);
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) modalBody.innerHTML = renderFleetModal();
        wireFleetEvents();
        showToast('Ship added to fleet!');
      });
    }
  }
}

// ─── Session History ────────────────────────────────────────────────────────

function showSessionHistory() {
  const HISTORY_KEY = 'scp_sessionHistory';
  let history = [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    history = raw ? JSON.parse(raw) : [];
  } catch {}

  if (history.length === 0) {
    openModal(`<div class="pt-earncalc"><h2>Session History</h2><div class="empty-hint">No sessions recorded yet. Use the planner and your history will appear here.</div></div>`);
    return;
  }

  // Show most recent first
  const rows = history.slice().reverse().slice(0, 30).map(h => {
    const date = new Date(h.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `<div class="pt-stats-row" style="grid-template-columns:80px 1fr 80px 80px">
      <div class="pt-stats-cell">${dateStr} ${timeStr}</div>
      <div class="pt-stats-cell">${h.method || 'Unknown'}</div>
      <div class="pt-stats-cell">${fmtK(h.effectiveRate || 0)}/hr</div>
      <div class="pt-stats-cell">${fmtK(h.estimatedEarnings || 0)}</div>
    </div>`;
  }).join('');

  const totalEarnings = history.reduce((sum, h) => sum + (h.estimatedEarnings || 0), 0);

  openModal(`
    <div class="pt-earncalc" style="max-width:600px">
      <h2>Session History</h2>
      <div class="pt-earncalc-result" style="margin-bottom:16px">
        <div class="pt-earncalc-total">${fmt(totalEarnings)} aUEC</div>
        <div class="pt-earncalc-label">Total estimated earnings across ${history.length} sessions</div>
      </div>
      <div class="pt-stats-grid">
        <div class="pt-stats-row pt-stats-header" style="grid-template-columns:80px 1fr 80px 80px">
          <div class="pt-stats-cell">Date</div>
          <div class="pt-stats-cell">Method</div>
          <div class="pt-stats-cell">Rate</div>
          <div class="pt-stats-cell">Earned</div>
        </div>
        ${rows}
      </div>
    </div>
  `);
}

// ─── Init ───────────────────────────────────────────────────────────────────

/**
 * Initialize all power-user tools. Call once from DOMContentLoaded.
 * @param {object} state - The app state object (mutated directly for reactivity)
 * @param {function} updateAll - Re-render callback from app.js
 */
export function initPowerTools(state, updateAll) {
  _state = state;
  _updateAll = updateAll;
  ensureToastContainer();
  document.addEventListener('keydown', handleKeydown);
}

// Expose modal openers for contextual integration from dashboard cards
export { showCompareModal, showTradeCalc, showRefineryCalc, showFleetManager, showEarningCalc, showSessionHistory };
