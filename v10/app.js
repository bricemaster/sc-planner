/**
 * @file v10 Controller — wires UI elements to feature libraries.
 * Pure glue: no business logic here, just DOM ↔ state ↔ features.
 * @module v10/app
 */

import { $, $$, fmt, fmtK, fmtHrs, fmtDays, fmtRange, riskColor, riskDot, saveState, loadState, debounce, setupBudgetInput } from '../lib/utils.js';
import { getShipById, getAllShips } from '../data/ships.js';
import { methods } from '../data/methods.js';
import { routes } from '../data/routes.js';
import { createShipPicker } from '../lib/picker.js';
import { getRecommendation, getMethodsForShip, explainMethod, getNextBestUpgrade, getSessionPlan } from '../lib/advisor.js';
import { planDirect, planWithUpgrades } from '../lib/planner.js';
import {
  renderRiskBadge, renderPill, renderConfidenceDot, renderFreshnessBadge,
  renderProgressBar, renderMiniStat, renderMethodModal,
  renderCompactMethodRow, renderCompactShipRow
} from '../lib/renderer.js';
import { fetchLivePrices, startPriceRefresh, getPreviousPrices, getStalenessText } from '../lib/livedata.js';
import { initGlobalSearch } from '../lib/gsearch.js';
import {
  toggleFavorite, isFavorite, getFavorites,
  toggleWishlist, isWishlisted, getWishlist,
  logSession, getHistory
} from '../lib/favorites.js';
import { initPowerTools, showToast, showCompareModal } from '../lib/powertools.js';


// ─── State ───────────────────────────────────────────────────────────────────

const state = {
  shipId:      loadState('shipId', 'aurora-mr'),
  budget:      loadState('budget', 10000),
  session:     loadState('session', 2),
  solo:        loadState('solo', true),
  skill:       loadState('skill', 'beginner'),
  risk:        loadState('risk', 'low'),
  goalShipId:  loadState('goalShipId', ''),
  livePrices:  null,
  methodFilter:'all',
  methodSort:  'rate',
  expandedMethod: null,
  shipSearch:   '',
  shipMfrCollapsed: {}
};

// Guard prevents desktop<->mobile budget sync loops
let _budgetSyncing = false;

// Ship picker instance ref
let shipPicker = null;

// Timer state
let _timerInterval = null;
let _timerSeconds = 0;
let _timerRunning = false;


// ─── Persistence helpers ─────────────────────────────────────────────────────

function persist(key, val) {
  state[key] = val;
  saveState(key, val);
}

function showAutosave() {
  const el = $('#autosaveIndicator');
  if (!el) return;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1500);
}


// ─── Skill/Risk value mapping ────────────────────────────────────────────────
// UI uses short labels (new/mid/vet, safe/med/high)
// Advisor uses full labels (beginner/intermediate/advanced, low/medium/high)

const SKILL_MAP = { new: 'beginner', mid: 'intermediate', vet: 'advanced' };
const SKILL_REVERSE = { beginner: 'new', intermediate: 'mid', advanced: 'vet' };
const RISK_MAP  = { safe: 'low', med: 'medium', high: 'high' };
const RISK_REVERSE = { low: 'safe', medium: 'med', high: 'high' };


// ─── URL State Sharing ──────────────────────────────────────────────────────

function encodeStateToURL() {
  const params = new URLSearchParams();
  params.set('ship', state.shipId);
  params.set('budget', state.budget);
  params.set('session', state.session);
  params.set('solo', state.solo ? '1' : '0');
  params.set('skill', state.skill);
  params.set('risk', state.risk);
  if (state.goalShipId) params.set('goal', state.goalShipId);
  return window.location.origin + window.location.pathname + '?' + params.toString();
}

function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) return false;
  if (params.has('ship'))    { state.shipId = params.get('ship');    saveState('shipId', state.shipId); }
  if (params.has('budget'))  { state.budget = parseInt(params.get('budget')) || 10000; saveState('budget', state.budget); }
  if (params.has('session')) { state.session = parseFloat(params.get('session')) || 2; saveState('session', state.session); }
  if (params.has('solo'))    { state.solo = params.get('solo') === '1'; saveState('solo', state.solo); }
  if (params.has('skill'))   { state.skill = params.get('skill');   saveState('skill', state.skill); }
  if (params.has('risk'))    { state.risk = params.get('risk');     saveState('risk', state.risk); }
  if (params.has('goal'))    { state.goalShipId = params.get('goal'); saveState('goalShipId', state.goalShipId); }
  return true;
}


// ─── Update All ──────────────────────────────────────────────────────────────

function updateAll() {
  const rec = getRecommendation(state.shipId, state.budget, {
    solo: state.solo,
    riskTolerance: state.risk,
    skillLevel: state.skill,
    sessionLength: state.session
  });

  updateHero(rec);
  updateDashboard(rec);
  updateMethodsGrid();
  updateShipBrowser();
  updateLiveData();
  showAutosave();
}


// ─── Hero Section ────────────────────────────────────────────────────────────

function updateHero(rec) {
  const heroMethod     = $('#heroMethod');
  const heroRate       = $('#heroRate');
  const heroRange      = $('#heroRange');
  const heroReasoning  = $('#heroReasoning');
  const heroConfidence = $('#heroConfidence');
  const heroRisk       = $('#heroRisk');

  if (!rec.best) {
    if (heroMethod)     heroMethod.textContent = 'No Methods Available';
    if (heroRate)       heroRate.textContent = '\u2014';
    if (heroRange)      heroRange.textContent = '\u2014';
    if (heroReasoning)  heroReasoning.textContent = rec.warnings?.join(' ') || 'Try changing your filters.';
    if (heroConfidence) heroConfidence.textContent = '\u2014';
    if (heroRisk)       heroRisk.textContent = '\u2014';
    return;
  }

  const best = rec.best;
  const m = best.method;

  if (heroMethod)     heroMethod.textContent = m.name;
  if (heroRate)       heroRate.textContent = fmtK(best.effectiveRate) + '/hr';
  if (heroRange)      heroRange.textContent = fmtRange(m.aUEChrLow, m.aUEChrHigh) + '/hr';
  if (heroReasoning)  heroReasoning.textContent = best.reasoning;
  if (heroConfidence) heroConfidence.innerHTML = renderConfidenceDot(best.confidence) + ' ' + best.confidence;
  if (heroRisk)       heroRisk.innerHTML = renderRiskBadge(m.risk);
}


// ─── Dashboard Cards ─────────────────────────────────────────────────────────

function updateDashboard(rec) {
  updateShipCard();
  updateGoalCard(rec);
  updateSessionCard(rec);
  updateAltsCard(rec);
}

function updateShipCard() {
  const ship = getShipById(state.shipId);
  if (!ship) return;

  const nameEl   = $('#dashShipName');
  const mfrEl    = $('#dashShipMfr');
  const cargoEl  = $('#dashShipCargo');
  const combatEl = $('#dashShipCombat');
  const miningEl = $('#dashShipMining');
  const crewEl   = $('#dashShipCrew');

  if (nameEl)   nameEl.textContent = ship.name;
  if (mfrEl)    mfrEl.textContent = ship.mfr;
  if (cargoEl)  cargoEl.textContent = ship.cargo + ' SCU';
  if (crewEl)   crewEl.textContent = ship.crew;

  // Render dot ratings
  if (combatEl) combatEl.innerHTML = renderDots(ship.combat, 5);
  if (miningEl) miningEl.innerHTML = renderDots(ship.mining, 4);
}

function renderDots(filled, total) {
  let html = '';
  for (let i = 0; i < total; i++) {
    html += `<span class="dot dot--${i < filled ? 'filled' : 'empty'}"></span>`;
  }
  return html;
}

function updateGoalCard(rec) {
  const goalShip = getShipById(state.goalShipId);
  const nameEl   = $('#dashGoalName');
  const fillEl   = $('#dashGoalFill');
  const metaEl   = $('#dashGoalMeta');
  const milesEl  = $('#dashGoalMilestones');

  if (!goalShip) {
    if (nameEl) nameEl.textContent = 'No goal set';
    if (fillEl) fillEl.style.width = '0%';
    if (metaEl) metaEl.innerHTML = '<span class="dash-card__goal-pct">0%</span><span class="dash-card__goal-sep">&mdash;</span><span class="dash-card__goal-eta">Pick a goal ship below</span>';
    return;
  }

  const pct = Math.min(100, Math.round((state.budget / goalShip.price) * 100));
  const deficit = Math.max(0, goalShip.price - state.budget);
  const rate = rec.best?.effectiveRate || 0;
  const etaHrs = rate > 0 ? deficit / rate : Infinity;
  const etaStr = pct >= 100 ? 'Ready to buy!' : (etaHrs < Infinity ? '~' + fmtHrs(etaHrs) + ' to go' : 'N/A');

  if (nameEl) nameEl.textContent = goalShip.name;
  if (fillEl) fillEl.style.width = pct + '%';
  if (metaEl) metaEl.innerHTML = `<span class="dash-card__goal-pct">${pct}%</span><span class="dash-card__goal-sep">&mdash;</span><span class="dash-card__goal-eta">${etaStr}</span>`;

  // Milestones
  if (milesEl) {
    [25, 50, 75, 100].forEach(mark => {
      const dot = milesEl.querySelector(`[data-at="${mark}"] .milestone__dot`);
      if (dot) {
        dot.classList.toggle('milestone__dot--reached', pct >= mark);
      }
    });
  }
}

function updateSessionCard(rec) {
  const earnEl     = $('#dashSessionEarn');
  const mixEl      = $('#dashSessionMix');
  const timelineEl = $('#dashSessionTimeline');

  const plan = getSessionPlan(state.shipId, state.budget, state.session, {
    solo: state.solo,
    riskTolerance: state.risk,
    skillLevel: state.skill,
    sessionLength: state.session
  });

  if (earnEl) earnEl.textContent = '~' + fmtK(plan.totalEarnings);
  if (mixEl && plan.activities.length > 0) {
    mixEl.textContent = plan.activities.map(a => {
      const pct = Math.round((a.hours / state.session) * 100);
      return `${a.method} ${pct}%`;
    }).join(', ');
  } else if (mixEl) {
    mixEl.textContent = '\u2014';
  }

  // Timeline bar segments
  if (timelineEl && plan.activities.length > 0) {
    const colors = ['var(--gold)', 'var(--cyan)', 'var(--green)', 'var(--amber)'];
    timelineEl.innerHTML = plan.activities.map((a, i) => {
      const pct = Math.round((a.hours / state.session) * 100);
      return `<div class="dash-card__timeline-seg" style="width:${pct}%;background:${colors[i % colors.length]}" title="${a.method} ${pct}%"></div>`;
    }).join('');
  } else if (timelineEl) {
    timelineEl.innerHTML = '';
  }
}

function updateAltsCard(rec) {
  const listEl = $('#dashAltList');
  if (!listEl) return;

  if (!rec.alternatives || rec.alternatives.length === 0) {
    listEl.innerHTML = '<li class="dash-card__alt"><span class="dash-card__alt-name">No alternatives</span></li>';
    return;
  }

  listEl.innerHTML = rec.alternatives.slice(0, 3).map(alt => `
    <li class="dash-card__alt">
      <span class="dash-card__alt-name">${alt.method.name}</span>
      <span class="dash-card__alt-rate">~${fmtK(alt.effectiveRate)}/hr</span>
    </li>`).join('');
}


// ─── Methods Grid ────────────────────────────────────────────────────────────

function updateMethodsGrid() {
  const grid     = $('#methodsGrid');
  const countEl  = $('#methodsCount');
  if (!grid) return;

  const ship = getShipById(state.shipId);
  const viable = ship ? getMethodsForShip(ship) : [];

  // Get all methods, annotate with viability
  let displayMethods = methods.map(m => {
    const isViable = viable.some(v => v.id === m.id);
    const explained = ship && isViable ? explainMethod(m, ship, state.budget) : null;
    return { ...m, isViable, explained };
  });

  // Filter by category
  if (state.methodFilter !== 'all') {
    displayMethods = displayMethods.filter(m => m.category === state.methodFilter);
  }

  // Sort
  const sortFns = {
    rate:   (a, b) => (b.explained?.effectiveRate || b.aUEChr) - (a.explained?.effectiveRate || a.aUEChr),
    risk:   (a, b) => { const o = { low: 0, medium: 1, high: 2 }; return (o[a.risk] || 0) - (o[b.risk] || 0); },
    budget: (a, b) => (a.minBudget || 0) - (b.minBudget || 0),
    name:   (a, b) => a.name.localeCompare(b.name)
  };
  displayMethods.sort(sortFns[state.methodSort] || sortFns.rate);

  if (countEl) countEl.textContent = displayMethods.length + ' method' + (displayMethods.length !== 1 ? 's' : '');

  if (displayMethods.length === 0) {
    grid.innerHTML = '<div class="methods__empty">No methods match this filter.</div>';
    return;
  }

  grid.innerHTML = displayMethods.map(m => {
    const isExpanded = state.expandedMethod === m.id;
    const rate = m.explained?.effectiveRate || m.aUEChr;
    const rateStr  = fmtK(rate) + '/hr';
    const rangeStr = fmtK(m.aUEChrLow) + ' \u2014 ' + fmtK(m.aUEChrHigh) + '/hr';
    const favs = getFavorites();
    const isFav = favs.includes(m.id);

    return `
      <article class="method-card${isExpanded ? ' expanded' : ''}${m.isViable ? '' : ' method-card--dimmed'}" data-id="${m.id}" data-category="${m.category}">
        <div class="method-card__head">
          <span class="method-card__name">${m.name}</span>
          <span class="method-card__risk" data-risk="${m.risk}">${m.risk}</span>
        </div>
        <span class="method-card__rate">${rateStr}</span>
        <span class="method-card__range">${rangeStr}</span>
        <div class="method-card__tags">
          <span class="method-card__tag">${m.category}</span>
          <span class="method-card__tag">${m.soloFriendly ? 'Solo' : 'Group'}</span>
          <span class="method-card__tag">${m.skillLevel}</span>
          ${!m.isViable ? '<span class="method-card__tag method-card__tag--warn">Not viable</span>' : ''}
        </div>
        ${isExpanded ? renderMethodDetails(m, isFav) : ''}
      </article>`;
  }).join('');
}

function renderMethodDetails(m, isFav) {
  return `
    <div class="method-card__details">
      <p class="method-card__desc">${m.desc || ''}</p>
      ${m.explained?.reasoning ? `<p class="method-card__reasoning">${m.explained.reasoning}</p>` : ''}
      ${m.explained?.warnings?.length ? m.explained.warnings.map(w => `<p class="method-card__warning">${w}</p>`).join('') : ''}

      ${m.tips?.length ? `
      <div>
        <div class="method-card__tips-title">Tips</div>
        <div class="method-card__tips">
          ${m.tips.map(t => `<div class="method-card__tip">${t}</div>`).join('')}
        </div>
      </div>` : ''}

      ${m.gear?.length ? `
      <div>
        <div class="method-card__gear-title">Required Gear</div>
        <div class="method-card__gear">
          ${m.gear.map(g => `<span class="method-card__gear-item">${g}</span>`).join('')}
        </div>
      </div>` : ''}

      ${m.ships?.length ? `
      <div>
        <div class="method-card__ships-title">Best Ships</div>
        <div class="method-card__ships">
          ${m.ships.map(s => `<span class="method-card__ship-item">${s}</span>`).join('')}
        </div>
      </div>` : ''}

      <div class="method-card__meta">
        <span class="method-card__meta-item">Confidence: <span>${m.confidence}</span></span>
        <span class="method-card__meta-item">Consistency: <span>${m.consistency}</span></span>
      </div>

      <button class="method-card__fav${isFav ? ' favorited' : ''}" data-fav="${m.id}">
        ${isFav ? 'Favorited' : 'Add to Favorites'}
      </button>
    </div>`;
}


// ─── Ship Browser ────────────────────────────────────────────────────────────

function updateShipBrowser() {
  const listEl = $('#shipList');
  if (!listEl) return;

  const allShips = getAllShips().sort((a, b) => a.price - b.price);
  const q = state.shipSearch.toLowerCase().trim();

  if (q) {
    // Flat search results
    const filtered = allShips.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.mfr.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.tier.toLowerCase().includes(q)
    );
    listEl.classList.add('ships__list--flat');
    if (filtered.length === 0) {
      listEl.innerHTML = '<div class="ships__empty">No ships match your search.</div>';
    } else {
      listEl.innerHTML = filtered.map(s => renderShipRow(s)).join('');
    }
  } else {
    // Manufacturer accordion
    listEl.classList.remove('ships__list--flat');
    const grouped = new Map();
    allShips.forEach(s => {
      if (!grouped.has(s.mfr)) grouped.set(s.mfr, []);
      grouped.get(s.mfr).push(s);
    });

    const sortedMfrs = [...grouped.keys()].sort();
    listEl.innerHTML = sortedMfrs.map(mfr => {
      const ships = grouped.get(mfr);
      const isOpen = !state.shipMfrCollapsed[mfr];
      return `
        <div class="ships__group${isOpen ? ' ships__group--open' : ''}">
          <button class="ships__group-header" aria-expanded="${isOpen}" data-mfr="${mfr}">
            <span class="ships__mfr-name">${mfr}</span>
            <span class="ships__mfr-count">${ships.length} ship${ships.length !== 1 ? 's' : ''}</span>
            <svg class="ships__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="ships__group-content">
            ${ships.map(s => renderShipRow(s)).join('')}
          </div>
        </div>`;
    }).join('');
  }
}

function renderShipRow(ship) {
  const isActive = ship.id === state.shipId;
  const tierClass = { starter: 'starter', mid: 'mid', heavy: 'heavy', endgame: 'endgame' }[ship.tier] || 'mid';
  return `
    <div class="ship-row${isActive ? ' ship-row--active' : ''}" data-ship-id="${ship.id}" role="button" tabindex="0">
      <span class="ship-row__name">${ship.name}</span>
      <span class="ship-row__role">${ship.role}</span>
      <span class="ship-row__price">${fmtK(ship.price)} aUEC</span>
      <span class="ship-row__tier ship-row__tier--${tierClass}">${ship.tier}</span>
    </div>`;
}


// ─── Live Data ───────────────────────────────────────────────────────────────

function updateLiveData() {
  if (!state.livePrices) return;
  const prices = state.livePrices;

  // Staleness text
  const ageEl = $('#priceAge');
  if (ageEl && prices.timestamp) {
    ageEl.textContent = getStalenessText(prices.timestamp);
  }

  // Price table
  const tbody = $('#priceTableBody');
  if (tbody && prices.commodities) {
    const prev = getPreviousPrices();
    tbody.innerHTML = prices.commodities.slice(0, 20).map(c => {
      const margin = c.sellAvg - c.buyAvg;
      const marginPct = c.buyAvg > 0 ? ((margin / c.buyAvg) * 100).toFixed(1) : '0';
      let trend = '\u2014';
      if (prev?.commodities) {
        const prevC = prev.commodities.find(p => p.name === c.name);
        if (prevC) {
          const delta = c.sellAvg - prevC.sellAvg;
          trend = delta > 0 ? '\u25B2' : delta < 0 ? '\u25BC' : '\u2014';
        }
      }
      return `<tr>
        <td class="livedata__td">${c.name}</td>
        <td class="livedata__td livedata__td--num">${fmt(c.buyAvg)}</td>
        <td class="livedata__td livedata__td--num">${fmt(c.sellAvg)}</td>
        <td class="livedata__td livedata__td--num${margin > 0 ? ' livedata__td--pos' : ''}">${fmt(margin)} (${marginPct}%)</td>
        <td class="livedata__td livedata__td--center">${trend}</td>
      </tr>`;
    }).join('');
  }

  // Trade routes
  const routesEl = $('#routesList');
  if (routesEl) {
    const titleHtml = '<h4 class="livedata__routes-title">Best Trade Routes</h4>';
    const ship = getShipById(state.shipId);
    const cargoSCU = ship?.cargo || 0;

    if (cargoSCU <= 0) {
      routesEl.innerHTML = titleHtml + '<p class="livedata__no-routes">Your ship has no cargo capacity for trade routes.</p>';
      return;
    }

    const topRoutes = routes.slice(0, 5);
    routesEl.innerHTML = titleHtml + topRoutes.map(r => {
      const profit = Math.min(cargoSCU, Math.floor(state.budget / r.buyCost)) * r.marginPerSCU;
      return `
        <div class="livedata__route-card">
          <div class="livedata__route-name">${r.name}</div>
          <div class="livedata__route-detail">${r.origin} \u2192 ${r.destination}</div>
          <div class="livedata__route-profit">~${fmtK(profit)} profit/run</div>
        </div>`;
    }).join('');
  }
}


// ─── Header Inputs ───────────────────────────────────────────────────────────

function initHeaderInputs() {
  // Ship picker
  const shipBtn = $('#myShip');
  if (shipBtn) {
    shipPicker = createShipPicker(shipBtn.closest('.ship-picker'), {
      onSelect: id => {
        persist('shipId', id);
        updateAll();
      },
      initialShipId: state.shipId,
      id: 'myShip'
    });
  }

  // Budget inputs (desktop + mobile)
  const budgetDesktop = $('#myBudget');
  const budgetMobile  = $('#myBudgetMobile');

  if (budgetDesktop) {
    setupBudgetInput(budgetDesktop);
    budgetDesktop.setValue(state.budget);
  }
  if (budgetMobile) {
    setupBudgetInput(budgetMobile);
    budgetMobile.setValue(state.budget);
  }

  const debouncedBudget = debounce(() => {
    if (_budgetSyncing) return;
    _budgetSyncing = true;
    const val = budgetDesktop?.getValue?.() || budgetMobile?.getValue?.() || 0;
    persist('budget', val);
    // Sync other input
    if (budgetDesktop) budgetDesktop.setValue(val);
    if (budgetMobile)  budgetMobile.setValue(val);
    _budgetSyncing = false;
    updateAll();
  }, 400);

  budgetDesktop?.addEventListener('input', debouncedBudget);
  budgetMobile?.addEventListener('input', debouncedBudget);

  // Session length (desktop + mobile)
  const sessionDesktop = $('#sessionLen');
  const sessionMobile  = $('#sessionLenMobile');

  function onSessionChange(e) {
    const val = parseFloat(e.target.value) || 2;
    persist('session', val);
    if (sessionDesktop) sessionDesktop.value = val;
    if (sessionMobile)  sessionMobile.value = val;
    updateAll();
  }
  sessionDesktop?.addEventListener('change', onSessionChange);
  sessionMobile?.addEventListener('change', onSessionChange);

  // Set initial values
  if (sessionDesktop) sessionDesktop.value = state.session;
  if (sessionMobile)  sessionMobile.value = state.session;
}


// ─── Toggle Buttons ──────────────────────────────────────────────────────────

function initToggles() {
  // Solo toggle
  wireToggleGroup('soloToggle', state.solo ? 'solo' : 'group', val => {
    persist('solo', val === 'solo');
    updateAll();
  });

  // Skill toggle
  wireToggleGroup('skillToggle', SKILL_REVERSE[state.skill] || 'new', val => {
    persist('skill', SKILL_MAP[val] || 'beginner');
    updateAll();
  });

  // Risk toggle
  wireToggleGroup('riskToggle', RISK_REVERSE[state.risk] || 'safe', val => {
    persist('risk', RISK_MAP[val] || 'low');
    updateAll();
  });

  // Also wire mobile drawer toggles (they have data-sync attributes)
  initMobileDrawerToggles();
}

function wireToggleGroup(groupId, initialVal, onChange) {
  const group = document.getElementById(groupId);
  if (!group) return;

  const btns = group.querySelectorAll('.toggle-group__btn');

  // Set initial state
  btns.forEach(btn => {
    const isActive = btn.dataset.value === initialVal;
    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    btn.classList.toggle('active', isActive);
  });

  group.addEventListener('click', e => {
    const btn = e.target.closest('.toggle-group__btn');
    if (!btn) return;

    btns.forEach(b => {
      b.setAttribute('aria-checked', 'false');
      b.classList.remove('active');
    });
    btn.setAttribute('aria-checked', 'true');
    btn.classList.add('active');

    onChange(btn.dataset.value);
  });
}


// ─── Mobile Settings Drawer ─────────────────────────────────────────────────

function initMobileDrawer() {
  const toggle = $('#settingsToggle');
  const drawer = $('#settingsDrawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const isOpen = drawer.dataset.open === 'true';
    drawer.dataset.open = isOpen ? 'false' : 'true';
    toggle.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
  });
}

function initMobileDrawerToggles() {
  // Sync mobile drawer toggles with main toggles
  const drawer = $('#settingsDrawer');
  if (!drawer) return;

  drawer.querySelectorAll('.toggle-group').forEach(group => {
    const syncTarget = group.querySelector('[data-sync]')?.dataset.sync;
    if (!syncTarget) return;

    group.addEventListener('click', e => {
      const btn = e.target.closest('.toggle-group__btn');
      if (!btn) return;

      // Update this group
      group.querySelectorAll('.toggle-group__btn').forEach(b => {
        b.setAttribute('aria-checked', 'false');
        b.classList.remove('active');
      });
      btn.setAttribute('aria-checked', 'true');
      btn.classList.add('active');

      // Sync with desktop toggle
      const mainGroup = document.getElementById(syncTarget);
      if (mainGroup) {
        const mainBtns = mainGroup.querySelectorAll('.toggle-group__btn');
        mainBtns.forEach(b => {
          const match = b.dataset.value === btn.dataset.value;
          b.setAttribute('aria-checked', match ? 'true' : 'false');
          b.classList.toggle('active', match);
        });
      }

      // Fire state change
      const val = btn.dataset.value;
      if (syncTarget === 'soloToggle') {
        persist('solo', val === 'solo');
      } else if (syncTarget === 'skillToggle') {
        persist('skill', SKILL_MAP[val] || 'beginner');
      } else if (syncTarget === 'riskToggle') {
        persist('risk', RISK_MAP[val] || 'low');
      }
      updateAll();
    });
  });
}


// ─── Methods Section Event Delegation ────────────────────────────────────────

function initMethodsSection() {
  // Filter pills
  const filterBar = $('#methodsFilter');
  if (filterBar) {
    filterBar.addEventListener('click', e => {
      const pill = e.target.closest('.methods__pill');
      if (!pill) return;

      filterBar.querySelectorAll('.methods__pill').forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      state.methodFilter = pill.dataset.filter;
      state.expandedMethod = null;
      updateMethodsGrid();
    });
  }

  // Sort
  const sortSel = $('#methodsSort');
  if (sortSel) {
    sortSel.addEventListener('change', () => {
      state.methodSort = sortSel.value;
      updateMethodsGrid();
    });
  }

  // Card expand + favorite (delegated)
  const grid = $('#methodsGrid');
  if (grid) {
    grid.addEventListener('click', e => {
      // Favorite button
      const favBtn = e.target.closest('.method-card__fav');
      if (favBtn) {
        e.stopPropagation();
        const id = favBtn.dataset.fav;
        toggleFavorite(id);
        updateMethodsGrid();
        return;
      }

      // Card expand/collapse
      const card = e.target.closest('.method-card');
      if (!card) return;
      const id = card.dataset.id;
      state.expandedMethod = state.expandedMethod === id ? null : id;
      updateMethodsGrid();
    });
  }
}


// ─── Ship Browser Event Delegation ───────────────────────────────────────────

function initShipBrowserEvents() {
  const listEl = $('#shipList');
  const searchEl = $('#shipSearch');

  // Search
  if (searchEl) {
    searchEl.addEventListener('input', debounce(() => {
      state.shipSearch = searchEl.value;
      updateShipBrowser();
    }, 200));
  }

  // Ship selection + accordion toggle (delegated)
  if (listEl) {
    listEl.addEventListener('click', e => {
      // Accordion header
      const header = e.target.closest('.ships__group-header');
      if (header) {
        const mfr = header.dataset.mfr;
        state.shipMfrCollapsed[mfr] = !state.shipMfrCollapsed[mfr];
        header.setAttribute('aria-expanded', !state.shipMfrCollapsed[mfr] ? 'true' : 'false');
        updateShipBrowser();
        return;
      }

      // Ship row selection
      const row = e.target.closest('.ship-row');
      if (row) {
        selectShip(row.dataset.shipId);
      }
    });

    // Keyboard support for ship rows
    listEl.addEventListener('keydown', e => {
      const row = e.target.closest('.ship-row');
      if (row && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        selectShip(row.dataset.shipId);
      }
    });
  }

  // View toggles
  $$('.ships__view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.ships__view-btn').forEach(b => b.classList.remove('ships__view-btn--active'));
      btn.classList.add('ships__view-btn--active');
      if (listEl) listEl.setAttribute('data-view', btn.dataset.view);
    });
  });
}

function selectShip(id) {
  persist('shipId', id);
  if (shipPicker?.setValue) shipPicker.setValue(id);
  updateAll();
}


// ─── Goal Ship Picker ────────────────────────────────────────────────────────

function initGoalPicker() {
  const goalSel = $('#goalShip');
  if (!goalSel) return;

  // Populate options sorted by price
  const allShips = getAllShips().sort((a, b) => a.price - b.price);
  goalSel.innerHTML = '<option value="">Pick goal ship&hellip;</option>' +
    allShips.map(s => `<option value="${s.id}"${s.id === state.goalShipId ? ' selected' : ''}>${s.name} (${fmtK(s.price)})</option>`).join('');

  goalSel.addEventListener('change', () => {
    persist('goalShipId', goalSel.value);
    updateAll();
  });
}


// ─── Card Action Buttons ─────────────────────────────────────────────────────

function initCardActions() {
  // Change Ship button
  $('#btnChangeShip')?.addEventListener('click', () => {
    const shipBtn = $('#myShip');
    if (shipBtn) shipBtn.click();
  });

  // Start Timer button
  $('#btnStartTimer')?.addEventListener('click', () => {
    startTimer();
  });

  // Compare Ships button
  $('#btnCompareShips')?.addEventListener('click', () => {
    showCompareModal();
  });

  // Hero actions
  $('#btnFullGuide')?.addEventListener('click', () => {
    const rec = getRecommendation(state.shipId, state.budget, {
      solo: state.solo, riskTolerance: state.risk,
      skillLevel: state.skill, sessionLength: state.session
    });
    if (rec.best) {
      const ship = getShipById(state.shipId);
      const html = renderMethodModal(rec.best.method, ship, state.budget);
      const modalContent = $('#modalContent');
      const modal = $('#modal');
      if (modalContent) modalContent.innerHTML = html;
      if (modal) modal.classList.add('open');
    }
  });

  $('#btnAlts')?.addEventListener('click', () => {
    const section = $('#methodsSection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });

  $('#btnShare')?.addEventListener('click', async () => {
    const url = encodeStateToURL();
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!');
    } catch {
      showToast('Could not copy link');
    }
  });
}


// ─── Session Timer ───────────────────────────────────────────────────────────

function initTimer() {
  const display  = $('#timerDisplay');
  const startBtn = $('#timerStart');
  const pauseBtn = $('#timerPause');
  const resetBtn = $('#timerReset');

  startBtn?.addEventListener('click', startTimer);
  pauseBtn?.addEventListener('click', pauseTimer);
  resetBtn?.addEventListener('click', resetTimer);
}

function startTimer() {
  if (_timerRunning) return;
  _timerRunning = true;
  const timerEl = $('#sessionTimer');
  if (timerEl) timerEl.classList.add('active');

  _timerInterval = setInterval(() => {
    _timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  _timerRunning = false;
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
}

function resetTimer() {
  pauseTimer();
  _timerSeconds = 0;
  updateTimerDisplay();
  const timerEl = $('#sessionTimer');
  if (timerEl) timerEl.classList.remove('active');
}

function updateTimerDisplay() {
  const display = $('#timerDisplay');
  if (!display) return;
  const h = Math.floor(_timerSeconds / 3600);
  const m = Math.floor((_timerSeconds % 3600) / 60);
  const s = _timerSeconds % 60;
  display.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  // Estimated earnings while timer running
  const earningsEl = $('#timerEarnings');
  if (earningsEl) {
    const rec = getRecommendation(state.shipId, state.budget, {
      solo: state.solo, riskTolerance: state.risk,
      skillLevel: state.skill, sessionLength: state.session
    });
    const rate = rec.best?.effectiveRate || 0;
    const earned = Math.round(rate * (_timerSeconds / 3600));
    earningsEl.textContent = earned > 0 ? '~' + fmtK(earned) + ' earned' : '';
  }
}


// ─── Live Price Refresh ──────────────────────────────────────────────────────

function initLivePrices() {
  fetchLivePrices().then(prices => {
    state.livePrices = prices;
    updateLiveData();
  });
  startPriceRefresh(prices => {
    state.livePrices = prices;
    updateLiveData();
  });

  const refreshBtn = $('#btnRefreshPrices');
  if (refreshBtn) {
    let cooldown = false;
    refreshBtn.addEventListener('click', async () => {
      if (cooldown) return;
      cooldown = true;
      refreshBtn.classList.add('spinning');
      refreshBtn.disabled = true;
      const prices = await fetchLivePrices(true);
      state.livePrices = prices;
      updateLiveData();
      refreshBtn.classList.remove('spinning');
      setTimeout(() => { cooldown = false; refreshBtn.disabled = false; }, 30000);
    });
  }
}


// ─── Onboarding ──────────────────────────────────────────────────────────────

function initOnboarding() {
  const overlay = $('#onboarding');
  if (!overlay) return;

  const hasVisited = loadState('hasVisited', false);
  if (hasVisited) return; // Already onboarded

  overlay.hidden = false;

  let currentStep = 1;
  const totalSteps = 4;
  const shipSelect = $('#onboardShip');
  const budgetIn   = $('#onboardBudget');
  const backBtn    = $('#onboardBack');
  const nextBtn    = $('#onboardNext');

  // Populate ship select
  if (shipSelect) {
    const allShips = getAllShips().sort((a, b) => a.price - b.price);
    shipSelect.innerHTML = '<option value="">Select your ship...</option>' +
      allShips.map(s => `<option value="${s.id}">${s.name} (${fmtK(s.price)})</option>`).join('');
  }

  // Setup budget formatting
  if (budgetIn) setupBudgetInput(budgetIn);

  // Ship preview
  const shipPreview = $('#onboardShipPreview');
  if (shipSelect && shipPreview) {
    shipSelect.addEventListener('change', () => {
      const ship = getShipById(shipSelect.value);
      if (!ship) { shipPreview.innerHTML = ''; return; }
      const vm = getMethodsForShip(ship);
      shipPreview.innerHTML = `
        <div class="ship-preview-stats">
          <div class="sp-stat"><span class="sp-val">${ship.cargo}</span><span class="sp-lbl">SCU</span></div>
          <div class="sp-stat"><span class="sp-val">${ship.combat}/5</span><span class="sp-lbl">Combat</span></div>
          <div class="sp-stat"><span class="sp-val">${ship.mining}/4</span><span class="sp-lbl">Mining</span></div>
          <div class="sp-stat"><span class="sp-val">${vm.length}</span><span class="sp-lbl">Methods</span></div>
        </div>`;
    });
  }

  // Wire onboarding toggle groups
  wireOnboardToggle('onboardSolo');
  wireOnboardToggle('onboardSkill');
  wireOnboardToggle('onboardRisk');

  function goToStep(n) {
    currentStep = n;
    $$('.onboard__step').forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === n));
    $$('.onboard__dot').forEach(d => d.classList.toggle('active', parseInt(d.dataset.step) === n));

    if (backBtn) backBtn.style.visibility = n <= 1 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.textContent = n >= totalSteps ? 'Get Started' : 'Next';
  }

  backBtn?.addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  nextBtn?.addEventListener('click', () => {
    if (currentStep >= totalSteps) {
      // Save onboarding data
      if (shipSelect?.value) persist('shipId', shipSelect.value);
      if (budgetIn?.getValue) persist('budget', budgetIn.getValue());

      const soloVal = getOnboardToggleValue('onboardSolo');
      if (soloVal) persist('solo', soloVal === 'solo');

      const skillVal = getOnboardToggleValue('onboardSkill');
      if (skillVal) persist('skill', skillVal);

      const riskVal = getOnboardToggleValue('onboardRisk');
      if (riskVal) persist('risk', riskVal);

      saveState('hasVisited', true);

      // Dismiss overlay
      overlay.classList.add('is-dismissing');
      setTimeout(() => {
        overlay.hidden = true;
        overlay.classList.remove('is-dismissing');
        // Sync header with onboarding choices
        syncHeaderFromState();
        updateAll();
      }, 400);
    } else {
      goToStep(currentStep + 1);
    }
  });

  goToStep(1);
}

function wireOnboardToggle(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener('click', e => {
    const btn = e.target.closest('.toggle-group__btn');
    if (!btn) return;
    group.querySelectorAll('.toggle-group__btn').forEach(b => {
      b.setAttribute('aria-checked', 'false');
      b.classList.remove('active');
    });
    btn.setAttribute('aria-checked', 'true');
    btn.classList.add('active');
  });
}

function getOnboardToggleValue(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return null;
  const active = group.querySelector('[aria-checked="true"]');
  return active?.dataset.value || null;
}

function syncHeaderFromState() {
  // Sync ship picker
  if (shipPicker?.setValue) shipPicker.setValue(state.shipId);

  // Sync budget
  const budgetDesktop = $('#myBudget');
  const budgetMobile  = $('#myBudgetMobile');
  if (budgetDesktop?.setValue) budgetDesktop.setValue(state.budget);
  if (budgetMobile?.setValue)  budgetMobile.setValue(state.budget);

  // Sync session
  const sessionDesktop = $('#sessionLen');
  const sessionMobile  = $('#sessionLenMobile');
  if (sessionDesktop) sessionDesktop.value = state.session;
  if (sessionMobile)  sessionMobile.value = state.session;

  // Sync toggles
  syncToggle('soloToggle', state.solo ? 'solo' : 'group');
  syncToggle('skillToggle', SKILL_REVERSE[state.skill] || 'new');
  syncToggle('riskToggle', RISK_REVERSE[state.risk] || 'safe');
}

function syncToggle(groupId, activeVal) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.toggle-group__btn').forEach(b => {
    const match = b.dataset.value === activeVal;
    b.setAttribute('aria-checked', match ? 'true' : 'false');
    b.classList.toggle('active', match);
  });
}


// ─── Lazy Enhancement Loading ────────────────────────────────────────────────

async function loadEnhancements() {
  const results = await Promise.allSettled([
    import('../lib/effects.js'),
    import('../lib/a11y.js'),
    import('../lib/qol.js'),
    import('../lib/modal.js')
  ]);

  // Effects
  if (results[0].status === 'fulfilled') {
    try { results[0].value.initEffects(); } catch (e) { console.warn('initEffects:', e); }
  }

  // Accessibility
  if (results[1].status === 'fulfilled') {
    try { results[1].value.initAccessibility(); } catch (e) { console.warn('initA11y:', e); }
  }

  // Quality of life
  if (results[2].status === 'fulfilled') {
    try { results[2].value.initQoL(); } catch (e) { console.warn('initQoL:', e); }
  }

  // Modal
  if (results[3].status === 'fulfilled') {
    try { results[3].value.initModal(); } catch (e) { console.warn('initModal:', e); }
  }

  // Loading screen removal
  document.body.classList.add('loading-done');
  const ls = document.getElementById('loadingScreen');
  if (ls) setTimeout(() => ls.remove(), 700);

  // Welcome back toast
  if (loadState('hasVisited', false)) {
    const goalShip = getShipById(state.goalShipId);
    const goalPct = goalShip?.price > 0 ? Math.min(100, Math.round((state.budget / goalShip.price) * 100)) : 0;
    let msg = 'Welcome back, Citizen!';
    if (goalShip && goalPct < 100) {
      msg = `Welcome back! ${goalShip.name} is ${goalPct}% funded.`;
    } else if (goalShip && goalPct >= 100) {
      msg = `Welcome back! You can afford the ${goalShip.name}!`;
    }
    showToast(msg);
  }
}


// ─── Boot ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadStateFromURL();
  initHeaderInputs();
  initToggles();
  initMobileDrawer();
  initMethodsSection();
  initShipBrowserEvents();
  initGoalPicker();
  initCardActions();
  initTimer();
  initLivePrices();

  // Global search
  initGlobalSearch({
    onSelectShip: id => { persist('shipId', id); updateAll(); },
    onSelectGoal: id => { persist('goalShipId', id); updateAll(); },
    onSelectMethod: id => {
      state.expandedMethod = id;
      const section = $('#methodsSection');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
      updateMethodsGrid();
    }
  });

  // Power tools (keyboard shortcuts, compare, etc.)
  initPowerTools(state, updateAll);

  // Onboarding (first-time visitors)
  initOnboarding();

  // Initial render
  updateAll();

  // Load enhancement modules (non-blocking)
  loadEnhancements();
});
