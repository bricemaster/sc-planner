/**
 * @file Main reactive engine — single-page dashboard with no tab navigation.
 * All user inputs live in the header; everything below updates reactively.
 * @module lib/app
 */

import { $, $$, fmt, fmtK, fmtHrs, fmtDays, fmtRange, riskColor, riskDot, saveState, loadState, debounce, setupBudgetInput } from './utils.js';
import { getShipById, getAllShips } from '../data/ships.js';
import { methods } from '../data/methods.js';
import { routes } from '../data/routes.js';
import { createShipPicker } from './picker.js';
import { getRecommendation, getMethodsForShip, explainMethod, getNextBestUpgrade, getSessionPlan } from './advisor.js';
import { planDirect, planWithUpgrades } from './planner.js';
import {
  renderFreshnessBadge, renderRiskBadge, renderPill, renderConfidenceDot,
  renderProgressBar, renderMiniStat, renderMethodModal,
  renderCompactMethodRow, renderCompactShipRow
} from './renderer.js';
import { fetchLivePrices, startPriceRefresh, getPreviousPrices, getStalenessText } from './livedata.js';
import { initModal, openModal } from './modal.js';
import { initGlobalSearch } from './gsearch.js';
import { initThemeSwitcher } from './themes.js';
import {
  toggleFavorite, isFavorite, getFavorites,
  toggleWishlist, isWishlisted, getWishlist,
  logSession, getHistory, renderHistoryModal,
  saveNote, getNote, hasNote
} from './favorites.js';
import { initPowerTools, showToast, showCompareModal, showTradeCalc, showRefineryCalc, showFleetManager, showEarningCalc, showSessionHistory } from './powertools.js';

// Session history — tracks earnings estimates per session
const SESSION_HISTORY_KEY = 'scp_sessionHistory';

function logSessionHistory(entry) {
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.push({ ...entry, timestamp: Date.now() });
    // Keep last 50 sessions
    if (history.length > 50) history.splice(0, history.length - 50);
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

export function getSessionHistory() {
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ─── Lazy-loaded enhancement modules (won't break app if they fail) ─────────
let _effects = null, _featA = null, _data = null, _a11y = null, _qol = null;
async function loadEnhancements() {
  const results = await Promise.allSettled([
    import('./effects.js'),
    import('./features-a.js'),
    import('./data-extended.js'),
    import('./a11y.js'),
    import('./qol.js')
  ]);
  if (results[0].status === 'fulfilled') _effects = results[0].value;
  else console.warn('effects.js failed:', results[0].reason);
  if (results[1].status === 'fulfilled') _featA = results[1].value;
  else console.warn('features-a.js failed:', results[1].reason);
  if (results[2].status === 'fulfilled') _data = results[2].value;
  else console.warn('data-extended.js failed:', results[2].reason);
  if (results[3].status === 'fulfilled') _a11y = results[3].value;
  else console.warn('a11y.js failed:', results[3].reason);
  if (results[4].status === 'fulfilled') _qol = results[4].value;
  else console.warn('qol.js failed:', results[4].reason);
}

// ─── State ───────────────────────────────────────────────────────────────────

let state = {
  shipId: loadState('shipId', 'aurora-mr'),
  budget: loadState('budget', 10000),
  session: loadState('session', 2),
  solo: loadState('solo', true),
  skill: loadState('skill', 'beginner'),
  risk: loadState('risk', 'low'),
  goalShipId: loadState('goalShipId', '600i-explorer'),
  expandedMethod: null,
  expandedShip: null,
  livePrices: null,
  methodFilter: 'all',
  methodSmartFilter: null,
  shipSearch: '',
  shipRoleFilter: 'all',
  shipMfrFilter: 'all',
  shipMfrCollapsed: {},
  shipSort: 'price',
  methodSort: 'rate'
};

let goalPicker = null;

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

  if (params.has('ship')) { state.shipId = params.get('ship'); saveState('shipId', state.shipId); }
  if (params.has('budget')) { state.budget = parseInt(params.get('budget')) || 10000; saveState('budget', state.budget); }
  if (params.has('session')) { state.session = parseFloat(params.get('session')) || 2; saveState('session', state.session); }
  if (params.has('solo')) { state.solo = params.get('solo') === '1'; saveState('solo', state.solo); }
  if (params.has('skill')) { state.skill = params.get('skill'); saveState('skill', state.skill); }
  if (params.has('risk')) { state.risk = params.get('risk'); saveState('risk', state.risk); }
  if (params.has('goal')) { state.goalShipId = params.get('goal'); saveState('goalShipId', state.goalShipId); }

  return true;
}

// ─── Boot ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadStateFromURL();
  initHeaderInputs();
  initMobileDrawer();
  initMobileControls();
  initGoalPicker();
  initModal();
  initThemeSwitcher();
  initGlobalSearch({
    onSelectShip: id => { state.shipId = id; saveState('shipId', id); updateAll(); },
    onSelectGoal: id => { state.goalShipId = id; saveState('goalShipId', id); updateAll(); },
    onSelectMethod: id => {
      state.expandedMethod = id;
      // Open methods tab overlay
      const tabBtn = document.querySelector('.tab-bar__btn[data-tab="methods"]');
      if (tabBtn) tabBtn.click();
      renderMethodsOnly();
    }
  });
  initSectionDelegation();
  initScrollReveals();
  initTabOverlay();
  initLiveClock();
  initSectionFlash();
  initPowerTools(state, updateAll);
  fetchLivePrices().then(prices => { state.livePrices = prices; updateAll(); });
  startPriceRefresh(prices => { state.livePrices = prices; updateAll(); });
  const refreshBtn = document.getElementById('btnRefreshPrices');
  if (refreshBtn) {
    let cooldown = false;
    refreshBtn.addEventListener('click', async () => {
      if (cooldown) return;
      cooldown = true;
      refreshBtn.classList.add('spinning');
      refreshBtn.disabled = true;
      const prices = await fetchLivePrices(true);
      state.livePrices = prices;
      updateAll();
      refreshBtn.classList.remove('spinning');
      setTimeout(() => { cooldown = false; refreshBtn.disabled = false; }, 30000);
    });
  }
  initOfflineIndicator();
  initCardActions();
  updateAll();

  // Load enhancement modules (non-blocking)
  loadEnhancements().then(() => {
    try { if (_effects) _effects.initEffects(); } catch(e) { console.warn('initEffects:', e); }
    try { if (_featA) _featA.initFeaturesA(); } catch(e) { console.warn('initFeaturesA:', e); }
    try { if (_a11y) { _a11y.initAccessibility(); _a11y.observeLazy(); } } catch(e) { console.warn('initA11y:', e); }
    try { if (_qol) _qol.initQoL(); } catch(e) { console.warn('initQoL:', e); }

    try {
      const dp = document.getElementById('dataPanel');
      if (dp && _data) dp.innerHTML = _data.renderDataPanel();
    } catch(e) { console.warn('dataPanel:', e); }

    // Footer button hooks
    try {
      const btnDataDash = document.getElementById('btnDataDash');
      if (btnDataDash && _qol) btnDataDash.addEventListener('click', () => openModal(_qol.showDataDashboard()));
      const btnFeedback = document.getElementById('btnFeedback');
      if (btnFeedback && _qol) btnFeedback.addEventListener('click', () => openModal(_qol.showFeedbackForm()));
      const btnChangelog = document.getElementById('btnChangelog');
      if (btnChangelog && _qol) btnChangelog.addEventListener('click', () => openModal(_qol.showChangelog()));
      const fabChangelog = document.getElementById('fabChangelog');
      if (fabChangelog && _qol) fabChangelog.addEventListener('click', () => openModal(_qol.showChangelog()));
    } catch(e) { console.warn('footer hooks:', e); }

    // Welcome back toast
    // Contextual welcome-back message
    try {
      if (_qol && loadState('hasVisited', false)) {
        const goalShip = getShipById(state.goalShipId);
        const goalPct = goalShip && goalShip.price > 0 ? Math.min(100, Math.round((state.budget / goalShip.price) * 100)) : 0;
        let msg = 'Welcome back, Citizen!';
        if (goalShip && goalPct < 100) {
          msg = `Welcome back! ${goalShip.name} is ${goalPct}% funded — let's keep grinding.`;
        } else if (goalShip && goalPct >= 100) {
          msg = `Welcome back! You can afford the ${goalShip.name}! Time to buy it.`;
        }
        showToast(msg);
      }
    } catch(e) {}

    // Remove loading screen
    document.body.classList.add('loading-done');
    const ls = document.getElementById('loadingScreen');
    if (ls) setTimeout(() => ls.remove(), 700);
  });

  // Show onboarding for first-time visitors
  const _hasVisited = loadState('hasVisited', false);
  if (!_hasVisited) {
    initOnboarding();
  }
});

// ─── Onboarding Wizard ──────────────────────────────────────────────────────

function initOnboarding() {
  const overlay = $('#onboarding');
  if (!overlay) return;
  overlay.classList.add('open');

  let currentStep = 1;
  const steps = $$('.onboard__step');
  const dots  = $$('.onboard__dot');
  const shipSelect = $('#onboardShip');
  const budgetIn   = $('#onboardBudget');
  const sessionIn  = $('#onboardSession');
  if (budgetIn) setupBudgetInput(budgetIn);

  // Ship preview in onboarding
  const shipPreview = $('#onboardShipPreview');
  if (shipSelect && shipPreview) {
    shipSelect.addEventListener('change', () => {
      const ship = getShipById(shipSelect.value);
      if (!ship) {
        shipPreview.innerHTML = '<p class="onboard__ship-preview-empty">Select a ship above to see what it can do</p>';
        return;
      }
      const caps = [];
      if (ship.cargo > 0) caps.push(`${ship.cargo} SCU cargo`);
      if (ship.combat >= 3) caps.push('strong combat');
      else if (ship.combat >= 1) caps.push('light combat');
      if (ship.mining >= 2) caps.push('mining');
      if (ship.salvage >= 2) caps.push('salvage');
      if (ship.solo) caps.push('solo-friendly');
      const vm = getMethodsForShip(ship);
      shipPreview.innerHTML = `
        <div class="ship-preview-stats">
          <div class="sp-stat"><span class="sp-val">${ship.cargo}</span><span class="sp-lbl">SCU</span></div>
          <div class="sp-stat"><span class="sp-val">${ship.combat}/5</span><span class="sp-lbl">Combat</span></div>
          <div class="sp-stat"><span class="sp-val">${ship.mining}/4</span><span class="sp-lbl">Mining</span></div>
          <div class="sp-stat"><span class="sp-val">${vm.length}</span><span class="sp-lbl">Methods</span></div>
        </div>
        <div class="sp-caps">${caps.join(' · ') || 'Basic capabilities'}</div>`;
    });
  }

  function goToStep(n) {
    const prev = currentStep;
    currentStep = n;

    steps.forEach(s => {
      const sn = Number(s.dataset.step);
      s.classList.remove('active', 'onboard__step--exit-left', 'onboard__step--exit-right');
      if (sn === n) {
        s.classList.add('active');
      }
    });
    dots.forEach(d => {
      d.classList.toggle('active', Number(d.dataset.dot) === n);
    });

    // Collect profile values when leaving step 3
    if (prev === 3) collectProfileValues();
    // Collect ship when leaving step 2
    if (prev === 2 && shipSelect && shipSelect.value) {
      state.shipId = shipSelect.value;
      saveState('shipId', shipSelect.value);
    }
    // Build summary when entering step 4
    if (n === 4) buildSummary();
  }

  goToStep(1);

  // ── Generic Next / Back / Skip buttons via data attributes ────────────
  overlay.addEventListener('click', e => {
    const nextBtn = e.target.closest('[data-onboard-next]');
    if (nextBtn) {
      goToStep(Number(nextBtn.dataset.onboardNext));
      return;
    }
    const backBtn = e.target.closest('[data-onboard-back]');
    if (backBtn) {
      goToStep(Number(backBtn.dataset.onboardBack));
      return;
    }
  });

  // ── Toggle buttons (solo, skill, risk) ────────────────────────────────
  ['onboardSolo', 'onboardSkill', 'onboardRisk'].forEach(id => {
    const container = $('#' + id);
    if (!container) return;
    container.querySelectorAll('.onboard__tbtn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.onboard__tbtn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  // ── Collect profile values from step 3 ────────────────────────────────
  function collectProfileValues() {
    if (budgetIn && budgetIn.value) {
      const raw = budgetIn.getValue ? budgetIn.getValue() : Number(budgetIn.value.replace(/[^0-9]/g, ''));
      if (raw > 0) { state.budget = raw; saveState('budget', raw); }
    }
    if (sessionIn && sessionIn.value) {
      const hrs = Number(sessionIn.value);
      if (hrs > 0) { state.session = hrs; saveState('session', hrs); }
    }
    const soloContainer = $('#onboardSolo');
    if (soloContainer) {
      const activeBtn = soloContainer.querySelector('.onboard__tbtn.active');
      if (activeBtn) {
        const val = activeBtn.dataset.val === 'solo';
        state.solo = val;
        saveState('solo', val);
      }
    }
    const skillContainer = $('#onboardSkill');
    if (skillContainer) {
      const activeBtn = skillContainer.querySelector('.onboard__tbtn.active');
      if (activeBtn) {
        state.skill = activeBtn.dataset.val;
        saveState('skill', activeBtn.dataset.val);
      }
    }
    const riskContainer = $('#onboardRisk');
    if (riskContainer) {
      const activeBtn = riskContainer.querySelector('.onboard__tbtn.active');
      if (activeBtn) {
        state.risk = activeBtn.dataset.val;
        saveState('risk', activeBtn.dataset.val);
      }
    }
  }

  // ── Step 4: Summary & Launch ──────────────────────────────────────────
  function buildSummary() {
    const ship = getShipById(state.shipId);
    const el = id => document.getElementById(id);
    const sumShip = el('sumShip');
    const sumBudget = el('sumBudget');
    const sumSession = el('sumSession');
    const sumSolo = el('sumSolo');
    const sumSkill = el('sumSkill');
    const sumRisk = el('sumRisk');

    if (sumShip) sumShip.textContent = ship ? ship.name : 'Not selected';

    if (sumBudget) sumBudget.textContent = fmt(state.budget) + ' aUEC';
    if (sumSession) sumSession.textContent = state.session + 'h';
    if (sumSolo) sumSolo.textContent = state.solo ? 'Solo' : 'Group';
    if (sumSkill) { const sk = state.skill || 'beginner'; sumSkill.textContent = sk.charAt(0).toUpperCase() + sk.slice(1); }
    if (sumRisk) { const rk = state.risk || 'low'; sumRisk.textContent = rk.charAt(0).toUpperCase() + rk.slice(1); }
  }

  // Dismiss button (Launch Dashboard)
  const dismissBtn = $('#onboardDismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      // Collect profile values one final time in case step 3 is current
      if (currentStep === 3 || currentStep === 4) collectProfileValues();
      // Collect ship one final time in case step 2 values weren't captured
      if (shipSelect && shipSelect.value) {
        state.shipId = shipSelect.value;
        saveState('shipId', shipSelect.value);
      }

      overlay.classList.remove('open');
      saveState('hasVisited', true);

      // ── Sync header inputs with onboarding selections ──────────────
      // Ship picker — re-create with the new initialShipId
      const headerShipEl = $('#myShip');
      if (headerShipEl) {
        createShipPicker(headerShipEl, {
          onSelect: id => {
            state.shipId = id; saveState('shipId', id);
            updateAll();
          },
          initialShipId: state.shipId,
          id: 'headerShipPicker'
        });
      }

      // Budget input
      const headerBudget = $('#myBudget');
      if (headerBudget && headerBudget.setValue) headerBudget.setValue(state.budget);
      const mobBudget = $('#myBudgetMobile');
      if (mobBudget && mobBudget.setValue) mobBudget.setValue(state.budget);

      // Session select
      const headerSession = $('#sessionLen');
      if (headerSession) headerSession.value = state.session;
      const mobSession = $('#sessionLenMobile');
      if (mobSession) mobSession.value = state.session;

      // Toggle buttons (solo, skill, risk) — sync desktop & mobile
      function syncToggle(selector, val) {
        $$(selector + ' .tbtn').forEach(b => {
          b.classList.toggle('active', b.dataset.val === val);
        });
      }
      syncToggle('#soloToggle', state.solo ? 'solo' : 'group');
      syncToggle('#soloToggleMobile', state.solo ? 'solo' : 'group');
      syncToggle('#skillToggle', state.skill || 'beginner');
      syncToggle('#skillToggleMobile', state.skill || 'beginner');
      syncToggle('#riskToggle', state.risk || 'low');
      syncToggle('#riskToggleMobile', state.risk || 'low');

      updateAll();
    });
  }
}

// ─── Header Inputs ───────────────────────────────────────────────────────────

function initHeaderInputs() {
  // Ship picker in header — HTML id="myShip"
  const headerShipEl = $('#myShip');
  if (headerShipEl) {
    createShipPicker(headerShipEl, {
      onSelect: id => {
        state.shipId = id; saveState('shipId', id);
        updateAll();
      },
      initialShipId: state.shipId,
      id: 'headerShipPicker'
    });
  }

  // Budget input — HTML id="myBudget"
  const budgetInput = $('#myBudget');
  if (budgetInput) {
    budgetInput.value = state.budget ? fmt(state.budget) : '';
    setupBudgetInput(budgetInput);
    budgetInput.addEventListener('input', debounce(() => {
      state.budget = budgetInput.getValue();
      saveState('budget', state.budget);
      // Sync mobile
      const mob = $('#myBudgetMobile');
      if (mob && mob.setValue) mob.setValue(state.budget);
      updateAll();
    }, 300));
  }

  // Session select — HTML <select id="sessionLen">
  const sessionSelect = $('#sessionLen');
  if (sessionSelect) {
    sessionSelect.value = state.session;
    sessionSelect.addEventListener('change', () => {
      state.session = parseFloat(sessionSelect.value);
      saveState('session', state.session);
      // Sync mobile
      const mob = $('#sessionLenMobile');
      if (mob) mob.value = sessionSelect.value;
      updateAll();
    });
  }

  // Toggle groups — HTML uses .tbtn class
  setupToggles('#soloToggle', 'solo', val => val === 'solo');
  setupToggles('#skillToggle', 'skill');
  setupToggles('#riskToggle', 'risk');
}

function setupToggles(selector, stateKey, transform) {
  const btns = $$(selector + ' .tbtn');
  btns.forEach(btn => {
    const val = transform ? transform(btn.dataset.val) : btn.dataset.val;
    if (val === state[stateKey] || String(val) === String(state[stateKey])) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state[stateKey] = transform ? transform(btn.dataset.val) : btn.dataset.val;
      saveState(stateKey, state[stateKey]);
      // Sync the corresponding mobile toggle
      syncToggleToMobile(selector, btn.dataset.val);
      updateAll();
    });
  });
}

function syncToggleToMobile(desktopSelector, activeVal) {
  const mobileSelector = desktopSelector + 'Mobile';
  const mobileBtns = $$(mobileSelector + ' .tbtn');
  mobileBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.val === activeVal);
  });
}

function syncToggleToDesktop(mobileSelector, activeVal) {
  const desktopSelector = mobileSelector.replace('Mobile', '');
  const desktopBtns = $$(desktopSelector + ' .tbtn');
  desktopBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.val === activeVal);
  });
}

// ─── Mobile Settings Drawer ──────────────────────────────────────────────────

function initMobileDrawer() {
  const toggle = $('#settingsToggle');
  const drawer = $('#settingsDrawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      drawer.classList.toggle('open');
      toggle.classList.toggle('active');
    });
  }
}

function initMobileControls() {
  // Mobile budget
  const mobBudget = $('#myBudgetMobile');
  if (mobBudget) {
    mobBudget.value = state.budget ? fmt(state.budget) : '';
    setupBudgetInput(mobBudget);
    mobBudget.addEventListener('input', debounce(() => {
      state.budget = mobBudget.getValue();
      saveState('budget', state.budget);
      // Sync desktop
      const desk = $('#myBudget');
      if (desk && desk.setValue) desk.setValue(state.budget);
      updateAll();
    }, 300));
  }

  // Mobile session select
  const mobSession = $('#sessionLenMobile');
  if (mobSession) {
    mobSession.value = state.session;
    mobSession.addEventListener('change', () => {
      state.session = parseFloat(mobSession.value);
      saveState('session', state.session);
      // Sync desktop
      const desk = $('#sessionLen');
      if (desk) desk.value = mobSession.value;
      updateAll();
    });
  }

  // Mobile toggles
  setupMobileToggle('#soloToggleMobile', 'solo', val => val === 'solo');
  setupMobileToggle('#skillToggleMobile', 'skill');
  setupMobileToggle('#riskToggleMobile', 'risk');
}

function setupMobileToggle(selector, stateKey, transform) {
  const btns = $$(selector + ' .tbtn');
  btns.forEach(btn => {
    const val = transform ? transform(btn.dataset.val) : btn.dataset.val;
    if (val === state[stateKey] || String(val) === String(state[stateKey])) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state[stateKey] = transform ? transform(btn.dataset.val) : btn.dataset.val;
      saveState(stateKey, state[stateKey]);
      // Sync desktop
      syncToggleToDesktop(selector, btn.dataset.val);
      updateAll();
    });
  });
}

// ─── Scroll Reveals ──────────────────────────────────────────────────────────

function initScrollReveals() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });
  $$('.rv').forEach(el => observer.observe(el));
  // Also reveal any elements already in the viewport on load
  requestAnimationFrame(() => {
    $$('.rv').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('in');
        observer.unobserve(el);
      }
    });
  });

  // Quick nav active tracking
  const navLinks = $$('.qn-link');
  const sections = ['rec-hero', 'methods-section', 'ships-section', 'plan-section'];
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('qn-link--active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.1, rootMargin: '-20% 0px -60% 0px' });
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) navObserver.observe(el);
  });
}

// ─── Goal Picker ─────────────────────────────────────────────────────────────

function initGoalPicker() {
  const goalEl = $('#goalShip');
  if (!goalEl) return;
  goalPicker = createShipPicker(goalEl, {
    onSelect: id => { state.goalShipId = id; saveState('goalShipId', id); updateAll(); },
    initialShipId: state.goalShipId,
    id: 'goalShipPicker'
  });
}

// ─── Event Delegation ────────────────────────────────────────────────────────

function initSectionDelegation() {
  // Dashboard: upgrade hint → set as goal ship
  const dashboard = $('#dashboard');
  if (dashboard) {
    const handleDashboardAction = e => {
      const upgradeHint = e.target.closest('[data-set-goal]');
      if (upgradeHint) {
        const goalId = upgradeHint.dataset.setGoal;
        state.goalShipId = goalId;
        saveState('goalShipId', goalId);
        updateAll();
        showToast('Goal set to ' + (getShipById(goalId)?.name || goalId));
        return;
      }
      // Contextual action links woven into card content
      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        const action = actionEl.dataset.action;
        if (action === 'method-detail') {
          const methodId = actionEl.dataset.method;
          const method = methods.find(m => m.id === methodId);
          const ship = getShipById(state.shipId);
          if (method && ship) openModal(renderMethodModal(method, ship, state.budget));
          return;
        }
        const actions = {
          'trade-calc': showTradeCalc,
          'refinery-calc': showRefineryCalc,
          'earning-calc': showEarningCalc,
          'fleet-mgr': showFleetManager,
          'session-history': showSessionHistory,
          'compare-ships': showCompareModal
        };
        const fn = actions[action];
        if (fn) fn();
      }
    };
    dashboard.addEventListener('click', handleDashboardAction);
    dashboard.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const focusedAction = e.target.closest('[data-set-goal], [data-action="method-detail"]');
        if (focusedAction) {
          e.preventDefault();
          handleDashboardAction(e);
        }
      }
    });
  }

  // Methods section: category filters, smart filters, card clicks
  const methodsSec = $('#methods-section');
  if (methodsSec) {
    methodsSec.addEventListener('click', e => {
      // Category filter pill
      const catPill = e.target.closest('[data-cat]');
      if (catPill) {
        state.methodFilter = catPill.dataset.cat;
        state.expandedMethod = null;
        updateAll();
        return;
      }
      // Smart filter pill
      const smartPill = e.target.closest('[data-smart]');
      if (smartPill) {
        const val = smartPill.dataset.smart;
        state.methodSmartFilter = state.methodSmartFilter === val ? null : val;
        state.expandedMethod = null;
        updateAll();
        return;
      }
      // Sort option click
      const sortOpt = e.target.closest('[data-sort]');
      if (sortOpt) {
        state.methodSort = sortOpt.dataset.sort;
        state.expandedMethod = null;
        renderMethodsOnly();
        return;
      }
      // Favorite star toggle
      const favBtnEl = e.target.closest('.fav-btn');
      if (favBtnEl) {
        e.stopPropagation();
        toggleFavorite(favBtnEl.dataset.favMethod);
        renderMethodsOnly();
        return;
      }
      // Notes toggle button
      const notesBtnEl = e.target.closest('.notes-btn');
      if (notesBtnEl) {
        e.stopPropagation();
        const area = document.querySelector('.method-notes-area[data-notes-for="' + notesBtnEl.dataset.notesMethod + '"]');
        if (area) area.classList.toggle('hidden');
        return;
      }
      // Method card click to expand (skip if clicking inside detail area)
      const card = e.target.closest('[data-method]');
      if (card && !e.target.closest('.method-card__detail')) {
        const id = card.dataset.method;
        state.expandedMethod = state.expandedMethod === id ? null : id;
        renderMethodsOnly();
        return;
      }
      // Full Guide button inside expanded card
      const guideBtn = e.target.closest('[data-action="method-guide"]');
      if (guideBtn) {
        const methodId = guideBtn.dataset.methodId;
        const method = methods.find(m => m.id === methodId);
        const ship = getShipById(state.shipId);
        if (method && ship) {
          openModal(renderMethodModal(method, ship, state.budget));
        }
        return;
      }
    });

    // Notes textarea save on input (delegated)
    methodsSec.addEventListener('input', e => {
      if (e.target.matches('.method-note-input')) {
        saveNote(e.target.dataset.noteFor, e.target.value);
      }
    });
  }

  // Ships section: search, role filter, row clicks
  const shipsSec = $('#ships-section');
  if (shipsSec) {
    shipsSec.addEventListener('click', e => {
      // Ship sort option
      const shipSortOpt = e.target.closest('[data-shipsort]');
      if (shipSortOpt) {
        state.shipSort = shipSortOpt.dataset.shipsort;
        renderShipsOnly();
        return;
      }
      // Manufacturer filter pill
      const mfrPill = e.target.closest('[data-mfr]');
      if (mfrPill) {
        state.shipMfrFilter = mfrPill.dataset.mfr;
        state.expandedShip = null;
        renderShipsOnly();
        return;
      }
      // Manufacturer group toggle (collapse/expand)
      const mfrToggle = e.target.closest('[data-mfr-toggle]');
      if (mfrToggle) {
        const mfr = mfrToggle.dataset.mfrToggle;
        if (!state.shipMfrCollapsed) state.shipMfrCollapsed = {};
        state.shipMfrCollapsed[mfr] = !state.shipMfrCollapsed[mfr];
        renderShipsOnly();
        return;
      }
      // Role filter pill
      const rolePill = e.target.closest('[data-role]');
      if (rolePill) {
        state.shipRoleFilter = rolePill.dataset.role;
        state.expandedShip = null;
        renderShipsOnly();
        return;
      }
      // Set As Ship button
      const setShipBtn = e.target.closest('[data-action="set-ship"]');
      if (setShipBtn) {
        state.shipId = setShipBtn.dataset.shipId;
        saveState('shipId', state.shipId);
        const headerShipEl = $('#myShip');
        if (headerShipEl) {
          createShipPicker(headerShipEl, {
            onSelect: id => { state.shipId = id; saveState('shipId', id); updateAll(); },
            initialShipId: state.shipId,
            id: 'headerShipPicker'
          });
        }
        updateAll();
        return;
      }
      // Set As Goal button
      const setGoalBtn = e.target.closest('[data-action="set-goal"]');
      if (setGoalBtn) {
        state.goalShipId = setGoalBtn.dataset.shipId;
        saveState('goalShipId', state.goalShipId);
        if (goalPicker) goalPicker.setValue(state.goalShipId);
        updateAll();
        return;
      }
      // Wishlist bookmark toggle
      const wlBtn = e.target.closest('.wishlist-btn');
      if (wlBtn) {
        e.stopPropagation();
        toggleWishlist(wlBtn.dataset.wlShip);
        renderShipsOnly();
        return;
      }
      // Ship row click to expand
      const row = e.target.closest('[data-ship]');
      if (row) {
        const id = row.dataset.ship;
        state.expandedShip = state.expandedShip === id ? null : id;
        renderShipsOnly();
        return;
      }
    });

    // Ship search input (use event delegation on the section for the input)
    shipsSec.addEventListener('input', e => {
      if (e.target.matches('#shipSearch')) {
        state.shipSearch = e.target.value;
        state.expandedShip = null;
        renderShipsOnly();
      }
    });
  }

  // Alternatives card clicks — delegate on #altList
  const altList = $('#altList');
  if (altList) {
    altList.addEventListener('click', e => {
      const row = e.target.closest('[data-method]');
      if (row) {
        const methodId = row.dataset.method;
        const method = methods.find(m => m.id === methodId);
        const ship = getShipById(state.shipId);
        if (method && ship) {
          openModal(renderMethodModal(method, ship, state.budget));
        }
      }
    });
  }

  // Compare Alternatives button — scroll to methods section
  const btnCompare = $('#btnCompareAlts');
  if (btnCompare) {
    btnCompare.addEventListener('click', () => {
      const sec = $('#methods-section');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Share Build button
  const btnShare = $('#btnShare');
  if (btnShare) {
    btnShare.addEventListener('click', async () => {
      const url = encodeStateToURL();
      try {
        await navigator.clipboard.writeText(url);
        btnShare.textContent = 'Copied!';
        btnShare.classList.add('btn-share--copied');
        setTimeout(() => {
          btnShare.textContent = 'Share Build';
          btnShare.classList.remove('btn-share--copied');
        }, 2000);
      } catch {
        // Fallback: select text in a temp input
        const inp = document.createElement('input');
        inp.value = url;
        document.body.appendChild(inp);
        inp.select();
        document.execCommand('copy');
        document.body.removeChild(inp);
        btnShare.textContent = 'Copied!';
        setTimeout(() => { btnShare.textContent = 'Share Build'; }, 2000);
      }
    });
  }

  // History button in footer
  const btnHistory = $('#btnHistory');
  if (btnHistory) {
    btnHistory.addEventListener('click', () => {
      openModal(renderHistoryModal());
    });
  }

  // Smooth scroll for quick nav and all internal anchor links
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 40;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
}

// ─── Master Update ───────────────────────────────────────────────────────────

let _lastLoggedState = '';

function updateAll() {
  const ship = getShipById(state.shipId);
  if (!ship) return;

  const rec = getRecommendation(state.shipId, state.budget, {
    solo: state.solo,
    riskTolerance: state.risk,
    skillLevel: state.skill,
    sessionLength: state.session
  });

  // Log session when meaningful state changes
  const stateKey = `${state.shipId}|${state.budget}|${state.session}|${state.solo}|${state.skill}|${state.risk}`;
  if (stateKey !== _lastLoggedState && rec.best) {
    _lastLoggedState = stateKey;
    logSession({
      ship: ship.name,
      budget: state.budget,
      method: rec.best.method.name,
      rate: rec.best.effectiveRate
    });
    // Log session estimate for history
    logSessionHistory({
      shipId: state.shipId,
      method: rec.best.method.name,
      effectiveRate: rec.best.effectiveRate,
      session: state.session,
      estimatedEarnings: Math.round(rec.best.effectiveRate * state.session)
    });
  }

  // Always render dashboard cards (visible by default)
  renderHero(rec, ship);
  renderAlternatives(rec);
  renderShipCard(ship);
  renderGoalTracker(ship);
  renderLivePrices();
  renderQuickIntel();
  renderSessionPlanner(rec, ship);

  // Only render tab content if the tab overlay is open (perf optimization)
  const overlay = document.getElementById('tabOverlay');
  const tabOpen = overlay && overlay.classList.contains('open');
  if (tabOpen) {
    const activeTab = overlay.querySelector('.tab-content.active');
    const tabId = activeTab ? activeTab.id : '';
    if (tabId === 'tab-methods') renderMethodsOnly();
    else if (tabId === 'tab-ships') renderShipsOnly();
    else if (tabId === 'tab-plan') renderPlan(ship);
  }
  // Mark tabs as needing re-render when opened
  state._tabsDirty = true;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

const _animFrames = new Map();

function animateValue(el, start, end, duration) {
  if (!el || start === end) { if (el) el.textContent = fmtK(end); return; }
  // Cancel any previous animation on this element
  if (_animFrames.has(el)) {
    cancelAnimationFrame(_animFrames.get(el));
    _animFrames.delete(el);
  }
  const range = end - start;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + range * eased);
    el.textContent = fmtK(current);
    if (progress < 1) {
      const id = requestAnimationFrame(step);
      _animFrames.set(el, id);
    } else {
      _animFrames.delete(el);
      el.classList.add('updated');
      setTimeout(() => el.classList.remove('updated'), 600);
    }
  }
  const id = requestAnimationFrame(step);
  _animFrames.set(el, id);
}

// ─── Tab Overlay ─────────────────────────────────────────────────────────────
// Opens Methods, Ships, Plan, Intel as fullscreen overlays accessible via tab bar.

function initTabOverlay() {
  const overlay = document.getElementById('tabOverlay');
  const closeBtn = document.getElementById('tabClose');
  const tabBar = document.getElementById('tabBar');
  if (!overlay || !tabBar) return;

  const tabs = ['methods', 'ships', 'plan', 'intel'];

  function renderContextBar() {
    const ship = getShipById(state.shipId);
    const shipName = ship ? ship.name : 'No ship';
    return `<div class="tab-context-bar">
      <div class="tab-context-bar__item"><span class="tab-context-bar__label">Ship</span> <span class="tab-context-bar__value">${shipName}</span></div>
      <div class="tab-context-bar__item"><span class="tab-context-bar__label">Budget</span> <span class="tab-context-bar__value">${fmt(state.budget)}</span></div>
      <div class="tab-context-bar__item"><span class="tab-context-bar__label">Session</span> <span class="tab-context-bar__value">${state.session}h</span></div>
      <div class="tab-context-bar__item"><span class="tab-context-bar__label">Mode</span> <span class="tab-context-bar__value">${state.solo ? 'Solo' : 'Group'}</span></div>
    </div>`;
  }

  function openTab(name) {
    tabs.forEach(t => {
      const el = document.getElementById('tab-' + t);
      if (el) el.style.display = t === name ? 'block' : 'none';
    });
    // Inject context bar at top of tab panel
    const panel = document.getElementById('tabPanel');
    let contextBar = panel.querySelector('.tab-context-bar');
    if (contextBar) contextBar.remove();
    panel.insertAdjacentHTML('afterbegin', renderContextBar());

    overlay.classList.add('open');
    closeBtn.classList.add('visible');
    // Update active tab button and aria-selected
    tabBar.querySelectorAll('.tab-bar__btn').forEach(b => {
      const isActive = b.dataset.tab === name;
      b.classList.toggle('tab-bar__btn--active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    // Trigger re-render for the opened section
    if (name === 'methods') renderMethodsOnly();
    if (name === 'ships') renderShipsOnly();
    if (name === 'plan') {
      const ship = getShipById(state.shipId);
      if (ship) renderPlan(ship);
    }
  }

  function closeTab() {
    overlay.classList.remove('open');
    closeBtn.classList.remove('visible');
    tabBar.querySelectorAll('.tab-bar__btn').forEach(b => {
      b.classList.remove('tab-bar__btn--active');
      b.setAttribute('aria-selected', 'false');
    });
  }

  tabBar.addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    const tab = btn.dataset.tab;
    // Toggle: if already open on this tab, close it
    if (overlay.classList.contains('open') && btn.classList.contains('tab-bar__btn--active')) {
      closeTab();
    } else {
      openTab(tab);
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeTab);
  overlay.querySelector('.tab-modal-panel')?.addEventListener('click', e => e.stopPropagation());

  // Allow card footer links to open tabs
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-tab]');
    if (link && !link.closest('.tab-bar')) {
      e.preventDefault();
      openTab(link.dataset.tab);
    }
  });

  // Escape key closes overlay
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeTab();
    }
  });
}

// ─── Live Clock ─────────────────────────────────────────────────────────────

function initLiveClock() {
  const el = document.getElementById('liveClock');
  if (!el) return;
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    el.textContent = h + ':' + m + ':' + s;
  }
  tick();
  setInterval(tick, 1000);
}

// ─── Card Action Buttons ────────────────────────────────────────────────────
// Wire contextual tool buttons integrated into dashboard card footers.

function initCardActions() {
  const wire = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };
  wire('btnCompareShips', showCompareModal);
  wire('btnFleetMgr', showFleetManager);
  wire('btnTradeCalc', showTradeCalc);
  wire('btnEarnCalc', showEarningCalc);
  wire('btnSessionHistory', showSessionHistory);
  wire('btnRefineryCalc', showRefineryCalc);
}

// ─── Offline Indicator ──────────────────────────────────────────────────────

function initOfflineIndicator() {
  let indicator = null;

  function show() {
    if (indicator) return;
    indicator = document.createElement('div');
    indicator.className = 'offline-indicator';
    indicator.setAttribute('role', 'alert');
    indicator.textContent = 'Offline — using cached data';
    document.body.appendChild(indicator);
    requestAnimationFrame(() => requestAnimationFrame(() => indicator.classList.add('show')));
  }

  function hide() {
    if (!indicator) return;
    indicator.classList.remove('show');
    indicator.addEventListener('transitionend', () => { if (indicator) { indicator.remove(); indicator = null; } }, { once: true });
  }

  window.addEventListener('offline', show);
  window.addEventListener('online', hide);
  if (!navigator.onLine) show();
}

// ─── Section Flash on Nav Jump ──────────────────────────────────────────────

function initSectionFlash() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"], .qn-link');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (target) {
      // Remove any existing flash first
      target.classList.remove('section-flash');
      // Force reflow to restart animation
      void target.offsetWidth;
      target.classList.add('section-flash');
      target.addEventListener('animationend', () => {
        target.classList.remove('section-flash');
      }, { once: true });
    }
  });
}

// ─── Render: Hero Recommendation ────────────────────────────────────────────

function renderHero(rec, ship) {
  const heroMethod = $('#heroMethod');
  const heroRate = $('#heroRate');
  const heroRisk = $('#heroRisk');
  const heroConfidence = $('#heroConfidence');
  const heroReasoning = $('#heroReasoning');
  const btnFullGuide = $('#btnFullGuide');

  if (!rec.best) {
    if (heroMethod) heroMethod.innerHTML = 'No Methods Available';
    if (heroRate) heroRate.innerHTML = '<span class="hero-rate-range">Adjust your filters to unlock earning methods</span>';
    if (heroRisk) heroRisk.innerHTML = '';
    if (heroConfidence) heroConfidence.innerHTML = '';
    if (heroReasoning) {
      const tips = [];
      if (state.risk === 'low') tips.push('Set <strong>Risk</strong> to Medium');
      if (state.skill === 'advanced') tips.push('Try <strong>Mid</strong> or <strong>New</strong> skill level');
      if (state.solo === true) tips.push('Try <strong>Group</strong> mode for more options');
      heroReasoning.innerHTML = tips.length > 0
        ? 'Try: ' + tips.join(' · ')
        : 'Your current filters are too restrictive. Widen Risk, Skill, or Play Style in the header.';
    }
    if (btnFullGuide) btnFullGuide.style.display = 'none';
    return;
  }

  const m = rec.best.method;
  const rate = rec.best.effectiveRate;

  if (heroMethod) {
    heroMethod.textContent = m.name;
    heroMethod.style.cursor = 'pointer';
    heroMethod.title = 'Click for full guide';
    heroMethod.onclick = () => openModal(renderMethodModal(m, ship, state.budget));
  }
  if (heroRate) {
    // Check if we need to animate the rate change
    const bigEl = heroRate.querySelector('.hero-rate-big');
    const prevRate = bigEl && bigEl.textContent ? parseInt(bigEl.textContent.replace(/[^0-9]/g, '')) * 1000 || 0 : 0;
    const goalShipForRate = getShipById(state.goalShipId);
    const remainingForRate = goalShipForRate ? Math.max(0, goalShipForRate.price - state.budget) : 0;
    const daysToGoal = remainingForRate > 0 && rate > 0 ? Math.ceil((remainingForRate / rate) / state.session) : 0;
    const goalContext = daysToGoal > 0 ? ` · ${goalShipForRate.name} in ~${daysToGoal} sessions` : '';
    heroRate.innerHTML = `<span class="hero-rate-big">${fmtK(rate)}</span><small>/hr</small> <span class="hero-rate-range">${fmtRange(m.aUEChrLow, m.aUEChrHigh)}/hr range${goalContext}</span>`;
    if (prevRate !== rate && prevRate > 0) {
      animateValue(heroRate.querySelector('.hero-rate-big'), prevRate, rate, 600);
    }
  }
  if (heroRisk) heroRisk.innerHTML = renderRiskBadge(m.risk);
  if (heroConfidence) heroConfidence.innerHTML = renderConfidenceDot(rec.best.confidence);
  if (heroReasoning) {
    // Contextual, useful reasoning with personality — no disclaimers
    const goalShip = getShipById(state.goalShipId);
    const goalName = goalShip ? goalShip.name : '';
    const remaining = goalShip ? Math.max(0, goalShip.price - state.budget) : 0;
    const hoursToGoal = remaining > 0 && rate > 0 ? remaining / rate : 0;

    let text = '';
    if (hoursToGoal > 0 && hoursToGoal < 200) {
      const days = Math.ceil(hoursToGoal / state.session);
      text = `At this rate, you'll reach your ${goalName} in about ${days} sessions. `;
    }

    // Add personality tip — budget-aware, session-aware, method-aware
    if (state.budget < 5000) {
      text += 'Low on cash? This method needs zero startup capital — just fly and earn.';
    } else if (state.budget > 5000000) {
      text += 'With that bankroll, you can afford to fill a C2 with Laranite or invest in higher-risk, higher-reward runs.';
    } else if (state.session <= 1 && m.category !== 'mission') {
      text += 'Short session? Focus on quick-turnover methods — bounties or box missions near landing zones.';
    } else if (state.session >= 4) {
      text += 'Long session — consider mixing methods. Start with cargo runs, switch to bounties when stock runs out.';
    } else if (m.category === 'mining') {
      text += 'Head to caves on Aberdeen or Daymar for the best Hadanite spawns.';
    } else if (m.category === 'combat') {
      text += 'Stack bounty certifications for higher-paying targets as you rank up.';
    } else if (m.id === 'medical-rescue' && state.budget > 1000000) {
      text += "You've got serious cash — medical is passive income while you do other things.";
    } else if (m.id === 'medical-rescue') {
      text += "Not glamorous, but it prints money. Park at Orison or GrimHEX for fast pickups.";
    } else if (state.session === 2) {
      text += '2-hour sweet spot — enough for a full cargo run or a bounty chain.';
    } else if (m.category === 'salvage') {
      text += 'Salvage is incredibly profitable in 4.6 — Pyro wrecks can earn 1M+/hr.';
    } else if (m.category === 'cargo') {
      text += 'Check commodity prices before committing — margins shift between patches.';
    } else {
      text += rec.best.reasoning || `${m.name} is your strongest option right now — give it a few runs and see how the aUEC stacks up.`;
    }
    heroReasoning.innerHTML = text;
  }
  if (btnFullGuide) {
    btnFullGuide.style.display = '';
    btnFullGuide.dataset.methodId = m.id;
    btnFullGuide.onclick = () => {
      openModal(renderMethodModal(m, ship, state.budget));
    };
  }
}

// ─── Render: Alternatives ───────────────────────────────────────────────────

function renderAlternatives(rec) {
  const el = $('#altList');
  if (!el) return;

  if (!rec.alternatives || rec.alternatives.length === 0) {
    el.innerHTML = `<div class="compact-row compact-row--empty">Only one method works here — it's your best bet for now.</div>`;
    return;
  }

  let html = '';
  rec.alternatives.slice(0, 5).forEach(alt => {
    html += `<div class="compact-row alt-row alt-row--action" data-method="${alt.method.id}" data-action="method-detail" title="Click for full guide" tabindex="0" role="button">
      <span class="cr-name">${alt.method.name}</span>
      <span class="cr-rate">${fmtK(alt.effectiveRate)}/hr</span>
      <span class="cr-risk">${riskDot(alt.method.risk)}</span>
    </div>`;
  });

  el.innerHTML = html;
}

// ─── Render: Ship Card ──────────────────────────────────────────────────────

function renderShipCard(ship) {
  const el = $('#shipInfo');
  if (!el) return;

  const vm = getMethodsForShip(ship);
  const topMethods = vm.slice(0, 2).map(m => m.name).join(', ');

  // Find best next upgrade (cheapest ship that unlocks more methods)
  const allShips = getAllShips();
  const currentMethodCount = vm.length;
  const upgrades = allShips
    .filter(s => s.price > ship.price && s.id !== ship.id)
    .map(s => ({ ship: s, methods: getMethodsForShip(s).length }))
    .filter(u => u.methods > currentMethodCount)
    .sort((a, b) => a.ship.price - b.ship.price);
  const bestUpgrade = upgrades[0];

  // Build capability summary instead of raw numbers
  const capabilities = [];
  if (ship.cargo > 0) capabilities.push(`${ship.cargo} SCU cargo`);
  if (ship.combat >= 3) capabilities.push('strong combat');
  else if (ship.combat >= 1) capabilities.push('light combat');
  if (ship.mining >= 2) capabilities.push('mining capable');
  if (ship.salvage >= 2) capabilities.push('salvage capable');
  if (ship.canROC) capabilities.push('ROC mining');

  const limitations = [];
  if (ship.cargo === 0) limitations.push('no cargo');
  if (ship.combat === 0) limitations.push('no combat');
  if (ship.mining === 0) limitations.push('no mining');
  if (ship.salvage === 0) limitations.push('no salvage');
  if (!ship.solo) limitations.push('needs crew');

  const capText = capabilities.length > 0
    ? `<span class="ship-cap ship-cap--good">${capabilities.join(' \u00b7 ')}</span>`
    : '<span class="ship-cap ship-cap--bad">Very limited capabilities</span>';
  const limText = limitations.length > 0
    ? `<span class="ship-cap ship-cap--bad">${limitations.join(' \u00b7 ')}</span>`
    : '';

  let upgradeHtml = '';
  const smartUpgrade = getNextBestUpgrade(state.shipId, state.budget, {
    solo: state.solo, riskTolerance: state.risk, skillLevel: state.skill, sessionLength: state.session
  });
  if (smartUpgrade) {
    const earnBoost = Math.round((smartUpgrade.payoffRatio - 1) * 100);
    upgradeHtml = `<div class="ship-upgrade-hint ship-upgrade-hint--clickable" data-set-goal="${smartUpgrade.ship.id}" title="Click to set as goal ship" tabindex="0" role="button">
      <span class="upgrade-label">Best Upgrade</span>
      <span class="upgrade-name">${smartUpgrade.ship.name}</span>
      <span class="upgrade-meta">+${earnBoost}% earnings · ${fmtK(smartUpgrade.cost)} aUEC · Pays for itself in ~${Math.round(smartUpgrade.breakEvenHrs)}h</span>
    </div>`;
  } else if (bestUpgrade) {
    const cost = bestUpgrade.ship.price - ship.price;
    const newMethods = bestUpgrade.methods - currentMethodCount;
    upgradeHtml = `<div class="ship-upgrade-hint ship-upgrade-hint--clickable" data-set-goal="${bestUpgrade.ship.id}" title="Click to set as goal ship" tabindex="0" role="button">
      <span class="upgrade-label">Best Upgrade</span>
      <span class="upgrade-name">${bestUpgrade.ship.name}</span>
      <span class="upgrade-meta">+${newMethods} new methods · ${fmtK(cost)} aUEC</span>
    </div>`;
  }

  el.innerHTML = `
    <div class="ship-card-name">${ship.name} <span class="ship-card-mfr">${ship.mfr} · ${fmt(ship.price)} aUEC</span></div>
    <div class="ship-card-caps">
      ${capText}
      ${limText}
    </div>
    <div class="stat-grid">
      <div class="sg-item"><span class="sg-val">${ship.cargo}</span><span class="sg-lbl">SCU</span></div>
      <div class="sg-item"><span class="sg-val">${ship.combat}/5</span><span class="sg-lbl">Combat</span></div>
      <div class="sg-item"><span class="sg-val">${ship.mining}/4</span><span class="sg-lbl">Mining</span></div>
      <div class="sg-item"><span class="sg-val">${ship.salvage}/4</span><span class="sg-lbl">Salvage</span></div>
      <div class="sg-item"><span class="sg-val">${ship.crew}</span><span class="sg-lbl">Crew</span></div>
      <div class="sg-item"><span class="sg-val">${ship.solo ? 'Yes' : 'No'}</span><span class="sg-lbl">Solo</span></div>
    </div>
    <div class="ship-unlocks-text ship-unlocks-text--action" data-action="earning-calc" title="Open earning calculator">Unlocks ${vm.length} methods${topMethods ? ' \u2014 ' + topMethods : ''} ›</div>
    ${upgradeHtml}`;
}

// ─── Render: Goal Tracker ───────────────────────────────────────────────────

function renderGoalTracker(ship) {
  const el = $('#goalProgress');
  if (!el) return;

  const goalShip = getShipById(state.goalShipId);
  if (!goalShip) {
    el.innerHTML = `<div class="empty-hint">Set a <strong>Goal Ship</strong> above to track your progress and see how many sessions until you can afford it.</div>`;
    return;
  }

  const pct = goalShip.price > 0 ? Math.min(100, Math.round((state.budget / goalShip.price) * 100)) : 0;
  const remaining = Math.max(0, goalShip.price - state.budget);

  // Get rate estimate for time calculation
  const rec = getRecommendation(state.shipId, state.budget, {
    solo: state.solo,
    riskTolerance: state.risk,
    skillLevel: state.skill,
    sessionLength: state.session
  });

  const bestRate = rec.best?.effectiveRate || 0;
  const m = rec.best?.method;
  const lowRate = m ? m.aUEChrLow : 0;
  const highRate = m ? m.aUEChrHigh : 0;
  const timeHigh = lowRate > 0 ? remaining / lowRate : Infinity;
  const timeLow = highRate > 0 ? remaining / highRate : Infinity;

  const plan = planWithUpgrades(state.shipId, state.goalShipId, state.budget, {
    solo: state.solo,
    riskTolerance: state.risk,
    skillLevel: state.skill,
    sessionLength: state.session
  });

  let timeStr = 'N/A';
  if (timeLow !== Infinity && timeHigh !== Infinity) {
    timeStr = `${fmtDays(timeLow)} – ${fmtDays(timeHigh)}`;
  } else if (bestRate > 0) {
    timeStr = fmtDays(remaining / bestRate);
  }

  // Build milestone projections
  let milestonesHtml = '';
  if (bestRate > 0 && remaining > 0) {
    const milestones = [
      { pct: 25, label: '25%' },
      { pct: 50, label: '50%' },
      { pct: 75, label: '75%' },
      { pct: 100, label: 'Goal!' }
    ].filter(ms => ms.pct > pct);

    if (milestones.length > 0) {
      milestonesHtml = '<div class="goal-milestones">';
      milestones.forEach(ms => {
        const needed = (goalShip.price * ms.pct / 100) - state.budget;
        if (needed <= 0) return; // Already past this milestone
        const hrs = needed / bestRate;
        const sessions = Math.ceil(hrs / state.session);
        milestonesHtml += `<div class="goal-ms"><span class="goal-ms__pct">${ms.label}</span><span class="goal-ms__time">${sessions} sessions</span></div>`;
      });
      milestonesHtml += '</div>';
    }
  }

  // Apply goal-complete celebration class when progress >= 100%
  const goalCard = document.getElementById('goal-card');
  if (goalCard) {
    if (pct >= 100) goalCard.classList.add('goal-complete');
    else goalCard.classList.remove('goal-complete');
  }

  el.innerHTML = `
    <div class="goal-ship-name goal-ship-name--action" data-action="compare-ships" title="Compare ships">Goal: ${goalShip.name} \u2014 ${fmt(goalShip.price)} aUEC ›</div>
    <div class="goal-progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Goal progress"><div class="goal-progress-fill" style="width:${pct}%"></div></div>
    <div class="goal-stats">
      <span class="goal-stat">${fmt(state.budget)} saved (${pct}%)</span>
      <span class="goal-stat">${fmt(remaining)} remaining</span>
    </div>
    <div class="goal-time">Est. Time: ${timeStr}</div>
    ${milestonesHtml}
    <p class="goal-verdict-text">${pct >= 100 ? `You can afford the ${goalShip.name}! Head to a ship dealer and make it yours.` : plan.verdict}</p>`;
}

// ─── Render: Live Prices ────────────────────────────────────────────────────

function renderLivePrices() {
  const listEl = $('#pricesList');
  const metaEl = $('#pricesMeta');
  if (!listEl) return;

  if (!state.livePrices) {
    listEl.innerHTML = `<span class="skeleton skeleton--wide"></span><span class="skeleton skeleton--med"></span><span class="skeleton skeleton--short"></span>`;
    if (metaEl) metaEl.textContent = 'Fetching live prices...';
    return;
  }

  const source = state.livePrices.source === 'uex-live' ? 'UEX Live' : 'Estimated';
  const ship = getShipById(state.shipId);
  const hasCargo = ship && ship.cargo > 0;

  // Split into tradeable (has buy price) and mineable (no buy price)
  const tradeable = state.livePrices.commodities.filter(c => c.buyAvg > 0);
  const mineable = state.livePrices.commodities.filter(c => c.buyAvg === 0);

  let html = '';

  if (tradeable.length > 0 && hasCargo) {
    html += `<div class="price-section-label">Trade Commodities</div>`;
    html += `<div class="price-table">`;
    html += `<div class="price-row price-header"><span>Commodity</span><span>Buy</span><span>Sell</span><span>Margin</span></div>`;
    const prev = getPreviousPrices();
    const prevMap = {};
    if (prev && prev.commodities) prev.commodities.forEach(c => { prevMap[c.name] = c; });
    tradeable.forEach(c => {
      const margin = c.buyAvg > 0 ? ((c.sellAvg - c.buyAvg) / c.buyAvg * 100).toFixed(1) + '%' : 'N/A';
      const p = prevMap[c.name];
      let arrow = '';
      if (p) {
        const delta = c.sellAvg - p.sellAvg;
        if (delta > 0) arrow = ' <span class="price-arrow price-arrow--up" title="Price up">&#9650;</span>';
        else if (delta < 0) arrow = ' <span class="price-arrow price-arrow--down" title="Price down">&#9660;</span>';
      }
      html += `<div class="price-row"><span>${c.name}${arrow}</span><span>${fmt(Math.round(c.buyAvg))}</span><span>${fmt(Math.round(c.sellAvg))}</span><span class="price-margin--pos">${margin}</span></div>`;
    });
    html += `</div>`;
    if (ship) {
      const bestTrade = tradeable.reduce((best, c) => {
        const profit = (c.sellAvg - c.buyAvg) * ship.cargo;
        return profit > best.profit ? { name: c.name, profit } : best;
      }, { name: '', profit: 0 });
      if (bestTrade.profit > 0) {
        html += `<div class="price-tip price-tip--action" data-action="trade-calc">Best fill: ${bestTrade.name} for ~${fmtK(Math.round(bestTrade.profit))} profit/run with ${ship.cargo} SCU ›</div>`;
      }
    }
  } else if (!hasCargo) {
    html += `<div class="price-note">Your ${ship ? ship.name : 'ship'} has no cargo space. Trading isn't available — focus on missions, combat, or mining.</div>`;
  }

  if (mineable.length > 0) {
    html += `<div class="price-section-label">Mineable Resources</div>`;
    html += `<div class="price-table">`;
    html += `<div class="price-row price-header"><span>Resource</span><span colspan="2">Sell Price</span><span>Method</span></div>`;
    mineable.forEach(c => {
      html += `<div class="price-row"><span>${c.name}</span><span>—</span><span>${fmt(Math.round(c.sellAvg))}</span><span class="price-method">Mine &amp; Sell</span></div>`;
    });
    html += `</div>`;
  }

  if (!html) {
    html = `<div class="compact-row compact-row--empty">No price data available</div>`;
  }

  listEl.innerHTML = html;
  if (metaEl) {
    const staleness = getStalenessText(state.livePrices.timestamp);
    const staleClass = (Date.now() - state.livePrices.timestamp) > 10 * 60 * 1000 ? ' prices-stale' : '';
    metaEl.innerHTML = `${source} · ${state.livePrices.commodities.length} commodities · <span class="staleness-text${staleClass}">${staleness}</span>`;
  }

  // Flash card when prices update
  const pricesCard = document.getElementById('prices-card');
  if (pricesCard && state.livePrices && state.livePrices.source !== 'static-4.6') {
    pricesCard.classList.remove('dash-card--fresh');
    requestAnimationFrame(() => pricesCard.classList.add('dash-card--fresh'));
  }
}

// ─── Render: Quick Intel ────────────────────────────────────────────────────

function renderQuickIntel() {
  const el = $('#intelSummary');
  if (!el) return;

  const allShips = getAllShips();
  const ship = getShipById(state.shipId);
  const viableMethods = ship ? getMethodsForShip(ship) : [];

  // Use effective rates (budget-adjusted) not raw rates
  const explained = viableMethods.map(m => explainMethod(m, ship, state.budget));
  const effectiveRates = explained.map(e => e.effectiveRate).filter(r => r >= 1000);
  const riskAdjRates = explained.map(e => e.riskAdjustedRate).filter(r => r >= 1000);

  const avgRate = effectiveRates.length > 0
    ? Math.round(effectiveRates.reduce((sum, r) => sum + r, 0) / effectiveRates.length)
    : 0;
  const maxRate = effectiveRates.length > 0 ? Math.max(...effectiveRates) : 0;
  const maxRiskAdj = riskAdjRates.length > 0 ? Math.max(...riskAdjRates) : 0;

  const shipRank = allShips.sort((a,b) => a.price - b.price).findIndex(s => s.id === state.shipId) + 1;
  const affordableShips = allShips.filter(s => s.price <= state.budget).length;
  const lockedMethods = methods.length - viableMethods.length;

  const minRate = effectiveRates.length > 0 ? Math.min(...effectiveRates) : 0;
  const rangeText = avgRate > 0
    ? fmtK(minRate) + ' – ' + fmtK(maxRate) + '/hr'
    : 'N/A';
  const riskAdjText = maxRiskAdj > 0 && maxRiskAdj < maxRate
    ? ` (${fmtK(maxRiskAdj)} risk-adjusted)`
    : '';

  el.innerHTML = `
    <div class="intel-items">
      <div class="mini-stat mini-stat--action" data-action="compare-ships"><span class="ms-label">Your Ship</span><span class="ms-value">${ship ? ship.name : 'None'} (#${shipRank} of ${allShips.length} by price) ›</span></div>
      <div class="mini-stat mini-stat--action" data-action="earning-calc"><span class="ms-label">Earning Methods</span><span class="ms-value">${viableMethods.length} available · ${lockedMethods} locked ›</span></div>
      <div class="mini-stat mini-stat--action" data-action="earning-calc"><span class="ms-label">Your Earning Range</span><span class="ms-value">${rangeText + riskAdjText} ›</span></div>
      ${renderMiniStat('Can Afford', affordableShips > 0 ? `${affordableShips} ship${affordableShips > 1 ? 's' : ''}` : 'No ships yet — keep earning!')}
      ${renderMiniStat('Patch', '4.6.0 · Stanton + Pyro + Nyx · Armor & Engineering live')}
      ${renderMiniStat('Data', 'Community-verified Q1 2026')}
      ${(() => {
        const bestRouteInfo = ship && ship.cargo > 0
          ? (() => {
              const sorted = [...routes].filter(r => ship.cargo >= r.minSCU).sort((a, b) => b.profitSCU - a.profitSCU);
              return sorted[0] ? `${sorted[0].name} (${fmt(sorted[0].profitSCU)}/SCU)` : 'No routes for your ship';
            })()
          : 'Need cargo ship';
        return `<div class="mini-stat mini-stat--action" data-action="trade-calc"><span class="ms-label">Best Route</span><span class="ms-value">${bestRouteInfo} ›</span></div>`;
      })()}
    </div>`;
}

// ─── Render: Session Planner ────────────────────────────────────────────────

function renderSessionPlanner(rec, ship) {
  const el = $('#sessionPlan');
  if (!el) return;

  if (!rec.best) {
    el.innerHTML = `<div class="empty-hint">No methods match your current filters. Try lowering <strong>Skill</strong> or raising <strong>Risk</strong> tolerance.</div>`;
    return;
  }

  const m = rec.best.method;
  const lowEarn = Math.round(m.aUEChrLow * state.session);
  const highEarn = Math.round(m.aUEChrHigh * state.session);
  const effEarn = Math.round(rec.best.effectiveRate * state.session);

  // Activity split suggestion
  let activity = m.category;
  if (activity === 'mission') activity = 'running missions';
  else if (activity === 'combat') activity = 'combat activities';
  else if (activity === 'mining') activity = 'mining operations';
  else if (activity === 'cargo') activity = 'cargo hauling';
  else if (activity === 'salvage') activity = 'salvage runs';

  // Net progress toward goal
  const goalShip = getShipById(state.goalShipId);
  let goalProgress = '';
  if (goalShip && goalShip.id !== state.shipId) {
    const remaining = Math.max(0, goalShip.price - state.budget);
    const sessionsNeeded = remaining > 0 && effEarn > 0 ? Math.ceil(remaining / effEarn) : 0;
    goalProgress = `<div class="session-goal">~${sessionsNeeded} sessions to reach ${goalShip.name}</div>`;
  }

  // Get smart session plan with activity mix
  const plan = getSessionPlan(state.shipId, state.budget, state.session, {
    solo: state.solo, riskTolerance: state.risk, skillLevel: state.skill, sessionLength: state.session
  });

  let activitiesHtml = '';
  if (plan.activities.length > 1) {
    activitiesHtml = `<div class="session-mix">
      <div class="session-mix__label">Suggested Mix</div>
      ${plan.activities.map(a => `<div class="session-mix__item"><span class="session-mix__method session-mix__method--action" data-action="earning-calc">${a.method}</span><span class="session-mix__time">${a.hours}h</span><span class="session-mix__earn">~${fmtK(a.earnings)}</span></div>`).join('')}
    </div>`;
  } else {
    activitiesHtml = `<p class="session-activity">Spend your time ${activity} via <strong>${m.name}</strong>.</p>`;
  }

  // Risk-adjusted earnings
  const riskLine = plan.riskAdjustedEarnings < plan.totalEarnings
    ? `<div class="session-risk-note"><span class="risk-warn-icon" aria-hidden="true">&#9888;</span> Risk-adjusted: ~${fmtK(plan.riskAdjustedEarnings)} aUEC (accounts for potential losses)</div>`
    : '';

  el.innerHTML = `
    <div class="session-header">In your ${state.session}h session:</div>
    <div class="session-earnings">
      ${renderMiniStat('Expected', fmtK(lowEarn) + ' – ' + fmtK(highEarn) + ' aUEC')}
      ${renderMiniStat('Effective', fmtK(effEarn) + ' aUEC')}
    </div>
    ${activitiesHtml}
    ${riskLine}
    ${goalProgress}`;
}

// ─── Render: Methods Section ────────────────────────────────────────────────

function renderMethodsOnly() {
  const filtersEl = $('#methodFilters');
  const listEl = $('#methodList');
  if (!listEl) return;

  const ship = getShipById(state.shipId);
  if (!ship) return;

  const categories = ['all', 'cargo', 'mining', 'combat', 'salvage', 'mission', 'other'];
  const smartFilters = [
    { key: 'solo', label: 'Solo' },
    { key: 'lowcap', label: 'Low Capital' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'short', label: 'Short Session' }
  ];

  // Build filter pills into #methodFilters
  if (filtersEl) {
    let filterHtml = `<div class="filter-bar">`;
    categories.forEach(cat => {
      const active = state.methodFilter === cat ? ' pill--active' : '';
      const label = cat.charAt(0).toUpperCase() + cat.slice(1);
      filterHtml += `<span class="pill pill--filter${active}" data-cat="${cat}">${label}</span>`;
    });
    filterHtml += `</div>`;

    filterHtml += `<div class="filter-bar filter-bar--smart">`;
    smartFilters.forEach(sf => {
      const active = state.methodSmartFilter === sf.key ? ' pill--active' : '';
      filterHtml += `<span class="pill pill--smart${active}" data-smart="${sf.key}">${sf.label}</span>`;
    });
    // Favorites filter
    const favActive = state.methodSmartFilter === 'favorites' ? ' pill--active' : '';
    filterHtml += `<span class="pill pill--smart pill--favorites${favActive}" data-smart="favorites">\u2605 Favorites</span>`;
    filterHtml += `</div>`;
    filtersEl.innerHTML = filterHtml;
  }

  const sortEl = $('#methodSort');
  if (sortEl) {
    const sortOpts = [
      { key: 'rate', label: 'Earnings' },
      { key: 'risk', label: 'Risk' },
      { key: 'setup', label: 'Setup Time' },
      { key: 'consistency', label: 'Consistency' }
    ];
    sortEl.innerHTML = `<div class="sort-bar">
      <span class="sort-label">Sort by:</span>
      ${sortOpts.map(o => `<span class="sort-opt${state.methodSort === o.key ? ' sort-opt--active' : ''}" data-sort="${o.key}">${o.label}</span>`).join('')}
    </div>`;
  }

  // Get and filter methods
  let viableMethods = getMethodsForShip(ship);

  if (state.methodFilter !== 'all') {
    viableMethods = viableMethods.filter(m => m.category === state.methodFilter);
  }

  // Smart filters
  if (state.methodSmartFilter === 'solo') {
    viableMethods = viableMethods.filter(m => m.soloFriendly);
  } else if (state.methodSmartFilter === 'lowcap') {
    viableMethods = viableMethods.filter(m => m.minBudget <= 20000);
  } else if (state.methodSmartFilter === 'beginner') {
    viableMethods = viableMethods.filter(m => m.skillLevel === 'beginner');
  } else if (state.methodSmartFilter === 'short') {
    viableMethods = viableMethods.filter(m => m.setupTime <= 10);
  } else if (state.methodSmartFilter === 'favorites') {
    viableMethods = viableMethods.filter(m => isFavorite(m.id));
  }

  // Score and sort methods
  const riskOrder = { low: 0, medium: 1, high: 2 };
  const consistencyOrder = { high: 2, medium: 1, low: 0 };
  const allScored = viableMethods.map(m => {
    const explained = explainMethod(m, ship, state.budget);
    return { method: m, rate: explained.effectiveRate };
  });

  if (state.methodSort === 'risk') {
    allScored.sort((a, b) => (riskOrder[a.method.risk] || 0) - (riskOrder[b.method.risk] || 0) || b.rate - a.rate);
  } else if (state.methodSort === 'setup') {
    allScored.sort((a, b) => (a.method.setupTime || 0) - (b.method.setupTime || 0) || b.rate - a.rate);
  } else if (state.methodSort === 'consistency') {
    allScored.sort((a, b) => (consistencyOrder[b.method.consistency] || 0) - (consistencyOrder[a.method.consistency] || 0) || b.rate - a.rate);
  } else {
    allScored.sort((a, b) => b.rate - a.rate);
  }

  // Filter out methods with 0 or very low effective rate (under 1000 aUEC/hr)
  const scored = allScored.filter(s => s.rate >= 1000);
  const hiddenCount = allScored.length - scored.length;

  // Build a rate-sorted ranking for tier rank numbers
  const rateRanked = [...scored].sort((a, b) => b.rate - a.rate);
  const rankMap = new Map();
  rateRanked.forEach((item, idx) => rankMap.set(item.method.id, idx + 1));

  let html = '';

  if (scored.length === 0) {
    html += `<div class="empty-hint">No methods match current filters for your ship. Try <strong>All</strong> category or adjust your filters.</div>`;
  }

  scored.forEach(({ method: m, rate }) => {
    const isExpanded = state.expandedMethod === m.id;
    const confDot = renderConfidenceDot(m.confidence);
    const rank = rankMap.get(m.id) || 0;
    const fav = isFavorite(m.id);
    const noteExists = hasNote(m.id);

    const tierClass = rate >= 80000 ? ' method-card--tier-s' : rate >= 40000 ? ' method-card--tier-a' : rate >= 20000 ? ' method-card--tier-b' : ' method-card--tier-c';
    const favClass = fav ? ' method-card--favorited' : '';
    html += `<div class="method-card${tierClass}${favClass}${isExpanded ? ' method-card--expanded' : ''}" data-method="${m.id}">`;
    html += `<span class="method-rank">#${rank}</span>`;
    html += `<div class="method-card__header">`;
    html += `<button class="fav-btn${fav ? ' fav-btn--active' : ''}" data-fav-method="${m.id}" title="${fav ? 'Remove from favorites' : 'Add to favorites'}">${fav ? '\u2605' : '\u2606'}</button>`;
    html += `<span class="method-card__name">${m.name}${noteExists ? ' <span class="note-icon" title="Has notes">\uD83D\uDCDD</span>' : ''}</span>`;
    const perSession = Math.round(rate * state.session);
    html += `<span class="method-card__rate">${fmtK(rate)}/hr <span class="method-card__session">${fmtK(perSession)} per ${state.session}h</span></span>`;
    html += `</div>`;
    html += `<div class="method-card__meta">`;
    const catIcons = { mining: '\u26CF', combat: '\u2694', cargo: '\u25A3', salvage: '\u2692', mission: '\u2691', other: '\u26A1' };
    const catIcon = catIcons[m.category] || '\u26A1';
    html += `<span class="method-cat-badge">${catIcon} ${m.category}</span> ${riskDot(m.risk)} <span class="method-card__desc">${m.desc}</span> ${confDot}`;
    html += `</div>`;

    if (isExpanded) {
      html += `<div class="method-card__detail">`;
      html += `<div class="mg-stats">`;
      html += renderMiniStat('Income Range', fmtRange(m.aUEChrLow, m.aUEChrHigh) + '/hr');
      html += renderMiniStat('Setup Time', m.setupTime + ' min');
      html += renderMiniStat('Consistency', m.consistency);
      html += renderMiniStat('Skill Level', m.skillLevel);
      html += `</div>`;

      if (m.steps && m.steps.length) {
        html += `<div class="mg-section"><h4>Steps</h4><ol class="mg-steps">`;
        m.steps.forEach(s => html += `<li>${s}</li>`);
        html += `</ol></div>`;
      }

      if (m.locations && m.locations.length) {
        html += `<div class="mg-section"><h4>Locations</h4><div class="mg-pills">`;
        m.locations.forEach(l => html += renderPill(l, 'default'));
        html += `</div></div>`;
      }

      if (m.gear && m.gear.length) {
        html += `<div class="mg-section"><h4>Gear</h4><ul class="mg-list">`;
        m.gear.forEach(g => html += `<li>${g}</li>`);
        html += `</ul></div>`;
      }

      if (m.risks && m.risks.length) {
        html += `<div class="mg-section"><h4>Risks</h4><ul class="mg-risks">`;
        m.risks.forEach(r => html += `<li>${r}</li>`);
        html += `</ul></div>`;
      }

      if (m.beginnerTips && m.beginnerTips.length) {
        html += `<div class="mg-section"><h4>Beginner Tips</h4><ul class="mg-list">`;
        m.beginnerTips.forEach(t => html += `<li>${t}</li>`);
        html += `</ul></div>`;
      }

      html += `<div class="method-detail-actions">`;
      html += `<button class="btn btn--sm" data-action="method-guide" data-method-id="${m.id}">Full Guide</button>`;
      html += `<button class="notes-btn${noteExists ? ' notes-btn--has-note' : ''}" data-notes-method="${m.id}"><span class="note-icon">\uD83D\uDCDD</span> Notes</button>`;
      html += `</div>`;
      const currentNote = getNote(m.id);
      html += `<div class="method-notes-area hidden" data-notes-for="${m.id}">`;
      html += `<textarea class="method-note-input" data-note-for="${m.id}" placeholder="Your personal notes about ${m.name}...">${currentNote}</textarea>`;
      html += `<div class="notes-save-hint">Auto-saved locally</div>`;
      html += `</div>`;
      html += `</div>`; // detail
    }

    html += `</div>`; // card
  });

  // Count methods the ship doesn't unlock at all (from full method list)
  const totalMethods = methods.length;
  const unlockedMethods = getMethodsForShip(ship);
  const lockedCount = totalMethods - unlockedMethods.length;

  if (hiddenCount > 0) {
    html += `<div class="methods-hidden">${hiddenCount} method${hiddenCount > 1 ? 's' : ''} hidden (under 1k/hr with current budget)</div>`;
  }
  if (lockedCount > 0) {
    html += `<div class="methods-hidden">${lockedCount} method${lockedCount > 1 ? 's' : ''} require${lockedCount === 1 ? 's' : ''} different ship capabilities</div>`;
  }

  listEl.innerHTML = html;
}

// ─── Render: Ships Section ──────────────────────────────────────────────────

function renderShipsOnly() {
  const filtersEl = $('#shipFilters');
  const listEl = $('#shipList');
  if (!listEl) return;

  const allShips = getAllShips();
  const MFR_ORDER = ['RSI', 'Aegis', 'Drake', 'Origin', 'MISC', 'Anvil', 'Crusader', 'Consolidated Outland', 'Argo', 'Gatac', 'Esperia', 'Banu'];
  const roleCategories = ['all', 'Fighter', 'Hauler', 'Mining', 'Salvage', 'Multi', 'Explorer', 'Other'];

  // Build filter pills — manufacturers first, then roles
  if (filtersEl) {
    let filterHtml = '';
    // Manufacturer quick-jump pills
    filterHtml += `<div class="filter-bar filter-bar--mfr">`;
    filterHtml += `<span class="sort-label">Manufacturer:</span>`;
    const mfrActive = !state.shipMfrFilter || state.shipMfrFilter === 'all' ? ' pill--active' : '';
    filterHtml += `<span class="pill pill--filter${mfrActive}" data-mfr="all">All</span>`;
    MFR_ORDER.forEach(mfr => {
      const active = state.shipMfrFilter === mfr ? ' pill--active' : '';
      const shortName = mfr === 'Consolidated Outland' ? 'CO' : mfr;
      filterHtml += `<span class="pill pill--filter${active}" data-mfr="${mfr}">${shortName}</span>`;
    });
    filterHtml += `</div>`;
    // Role filters
    filterHtml += `<div class="filter-bar">`;
    roleCategories.forEach(r => {
      const active = state.shipRoleFilter === r ? ' pill--active' : '';
      filterHtml += `<span class="pill pill--filter${active}" data-role="${r}">${r}</span>`;
    });
    const wlActive = state.shipRoleFilter === 'wishlist' ? ' pill--active' : '';
    filterHtml += `<span class="pill pill--filter pill--favorites${wlActive}" data-role="wishlist">\uD83D\uDD16 Wishlist</span>`;
    filterHtml += `</div>`;
    // Sort controls
    filterHtml += `<div class="sort-bar sort-bar--inline">
      <span class="sort-label">Sort:</span>
      <span class="sort-opt${state.shipSort === 'price' ? ' sort-opt--active' : ''}" data-shipsort="price">Price</span>
      <span class="sort-opt${state.shipSort === 'name' ? ' sort-opt--active' : ''}" data-shipsort="name">Name</span>
      <span class="sort-opt${state.shipSort === 'cargo' ? ' sort-opt--active' : ''}" data-shipsort="cargo">Cargo</span>
      <span class="sort-opt${state.shipSort === 'combat' ? ' sort-opt--active' : ''}" data-shipsort="combat">Combat</span>
      <span class="sort-opt${state.shipSort === 'methods' ? ' sort-opt--active' : ''}" data-shipsort="methods">Methods</span>
    </div>`;
    filtersEl.innerHTML = filterHtml;
  }

  // Read search value from the existing #shipSearch input (don't recreate it)
  const searchInput = $('#shipSearch');
  if (searchInput && searchInput.value !== state.shipSearch) {
    if (document.activeElement !== searchInput) {
      searchInput.value = state.shipSearch || '';
    }
  }

  // Filter ships
  let filtered = allShips;
  if (state.shipSearch) {
    const q = state.shipSearch.toLowerCase();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(q) || s.mfr.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)
    );
  }
  // Manufacturer filter
  if (state.shipMfrFilter && state.shipMfrFilter !== 'all') {
    filtered = filtered.filter(s => s.mfr === state.shipMfrFilter);
  }
  if (state.shipRoleFilter === 'wishlist') {
    filtered = filtered.filter(s => isWishlisted(s.id));
  } else if (state.shipRoleFilter && state.shipRoleFilter !== 'all') {
    const rf = state.shipRoleFilter.toLowerCase();
    filtered = filtered.filter(s => s.role.toLowerCase().includes(rf));
  }

  if (state.shipSort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.shipSort === 'cargo') {
    filtered.sort((a, b) => b.cargo - a.cargo);
  } else if (state.shipSort === 'combat') {
    filtered.sort((a, b) => b.combat - a.combat);
  } else if (state.shipSort === 'methods') {
    filtered.sort((a, b) => getMethodsForShip(b).length - getMethodsForShip(a).length);
  } else {
    filtered.sort((a, b) => a.price - b.price);
  }

  let html = '';

  if (filtered.length === 0) {
    html += `<div class="empty-hint">No ships match your search. Try a different name or clear the filter.</div>`;
  }

  // Group ships by manufacturer
  const grouped = new Map();
  filtered.forEach(ship => {
    if (!grouped.has(ship.mfr)) grouped.set(ship.mfr, []);
    grouped.get(ship.mfr).push(ship);
  });

  // Sort manufacturer groups by MFR_ORDER
  const sortedMfrs = [...grouped.keys()].sort((a, b) => {
    const ai = MFR_ORDER.indexOf(a), bi = MFR_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const maxShipPrice = filtered.length > 0 ? Math.max(...filtered.map(s => s.price)) : 1;

  sortedMfrs.forEach(mfr => {
    const ships = grouped.get(mfr);
    const isCollapsed = !(state.shipMfrCollapsed && state.shipMfrCollapsed[mfr]);
    html += `<div class="mfr-group${isCollapsed ? ' mfr-group--collapsed' : ''}">`;
    html += `<div class="mfr-group__header" data-mfr-toggle="${mfr}">`;
    html += `<span class="mfr-group__name">${mfr}</span>`;
    html += `<span class="mfr-group__count">${ships.length} ship${ships.length !== 1 ? 's' : ''}</span>`;
    html += `<span class="mfr-group__chevron">${isCollapsed ? '\u25B6' : '\u25BC'}</span>`;
    html += `</div>`;

    if (!isCollapsed) {
      ships.forEach(ship => {
        html += renderShipRow(ship, maxShipPrice);
      });
    }
    html += `</div>`;
  });

  listEl.innerHTML = html;
}

function renderShipRow(ship, maxShipPrice) {
  const isExpanded = state.expandedShip === ship.id;
  const isCurrent = ship.id === state.shipId;
  const isGoal = ship.id === state.goalShipId;
  const wishlisted = isWishlisted(ship.id);

  let keyStat = ship.cargo > 0 ? ship.cargo + ' SCU' : '';
  if (!keyStat && ship.combat > 0) keyStat = 'Combat ' + ship.combat + '/5';
  if (!keyStat && ship.mining > 0) keyStat = 'Mining ' + ship.mining + '/4';
  if (!keyStat && ship.salvage > 0) keyStat = 'Salvage ' + ship.salvage + '/4';

  let html = '';
  html += `<div class="ship-list-item${isExpanded ? ' ship-list-item--expanded' : ''}${isCurrent ? ' ship-list-item--current' : ''}${wishlisted ? ' ship-list-item--wishlisted' : ''}" data-ship="${ship.id}">`;
  const priceTier = ship.price < 500000 ? 'starter' : ship.price < 2000000 ? 'mid' : ship.price < 10000000 ? 'high' : 'endgame';

  html += `<div class="ship-list-row slr--${priceTier}">`;
  html += `<button class="wishlist-btn${wishlisted ? ' wishlist-btn--active' : ''}" data-wl-ship="${ship.id}" title="${wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}">${wishlisted ? '\uD83D\uDD16' : '\u2661'}</button>`;
  html += `<span class="slr-name">${ship.name}${isCurrent ? ' <span class="slr-badge slr-badge--current">YOUR SHIP</span>' : ''}${isGoal ? ' <span class="slr-badge slr-badge--goal">GOAL</span>' : ''}</span>`;
  html += `<span class="slr-mfr">${ship.mfr}</span>`;
  const priceBarPct = maxShipPrice > 0 ? Math.round((ship.price / maxShipPrice) * 100) : 0;
  html += `<span class="slr-price">${fmtK(ship.price)} aUEC <span class="ship-price-bar-wrap"><span class="ship-price-bar" style="width:${Math.max(2, priceBarPct * 0.8)}px"></span></span></span>`;
  html += `<span class="slr-role">${ship.role}</span>`;
  html += `<span class="slr-stat">${keyStat}</span>`;
  html += `</div>`;

  if (isExpanded) {
    const viableMethods = getMethodsForShip(ship);
    const methodNames = viableMethods.slice(0, 4).map(m => m.name).join(', ');

    html += `<div class="ship-detail">`;
    html += `<p class="ship-desc">${ship.desc}</p>`;
    html += `<div class="ship-stats-grid">`;
    html += renderMiniStat('SCU', ship.cargo);
    html += renderMiniStat('Combat', ship.combat + '/5');
    html += renderMiniStat('Mining', ship.mining + '/4');
    html += renderMiniStat('Salvage', ship.salvage + '/4');
    html += renderMiniStat('Crew', ship.crew);
    html += renderMiniStat('Solo', ship.solo ? 'Yes' : 'No');
    html += renderMiniStat('ROC', ship.canROC ? 'Yes' : 'No');
    html += renderMiniStat('Tier', ship.tier);
    html += `</div>`;
    html += `<div class="ship-methods">Unlocks ${viableMethods.length} methods${methodNames ? ': ' + methodNames : ''}</div>`;

    const currentShip = getShipById(state.shipId);
    if (currentShip && currentShip.id !== ship.id) {
      const currentMethods = getMethodsForShip(currentShip);
      const newMethods = viableMethods.filter(m => !currentMethods.some(cm => cm.id === m.id));
      const priceDiff = ship.price - currentShip.price;

      html += `<div class="ship-compare">`;
      html += `<span class="ship-compare__label">vs ${currentShip.name}</span>`;
      html += `<div class="ship-compare__stats">`;
      html += `<span class="ship-compare__stat">${priceDiff > 0 ? '+' : ''}${fmtK(priceDiff)} aUEC</span>`;
      html += `<span class="ship-compare__stat">${ship.cargo - currentShip.cargo > 0 ? '+' : ''}${ship.cargo - currentShip.cargo} SCU</span>`;
      if (newMethods.length > 0) {
        html += `<span class="ship-compare__stat ship-compare__stat--new">+${newMethods.length} new method${newMethods.length > 1 ? 's' : ''}</span>`;
      }
      html += `</div>`;
      html += `</div>`;
    }

    html += `<div class="ship-actions">`;
    if (!isCurrent) {
      html += `<button class="btn btn--sm" data-action="set-ship" data-ship-id="${ship.id}">Set As Ship</button>`;
    }
    if (!isGoal) {
      html += `<button class="btn btn--sm" data-action="set-goal" data-ship-id="${ship.id}">Set As Goal</button>`;
    }
    html += `</div>`;
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

// ─── Render: Plan Section ───────────────────────────────────────────────────

function renderPlan(ship) {
  const el = $('#planResults');
  if (!el) return;

  const goalShip = getShipById(state.goalShipId);

  if (!goalShip || goalShip.id === state.shipId) {
    el.innerHTML = `<div class="compact-row compact-row--empty">Set a different goal ship to see your upgrade plan.</div>`;
    return;
  }

  const plan = planWithUpgrades(state.shipId, state.goalShipId, state.budget, {
    solo: state.solo,
    riskTolerance: state.risk,
    skillLevel: state.skill,
    sessionLength: state.session
  });

  const rec = getRecommendation(state.shipId, state.budget, {
    solo: state.solo,
    riskTolerance: state.risk,
    skillLevel: state.skill,
    sessionLength: state.session
  });

  const directPlan = planDirect(ship, goalShip, rec.best, state.budget);

  let html = '';

  // Header
  html += `<h3 class="plan-title">${ship.name} &rarr; ${goalShip.name}</h3>`;

  // Direct time
  html += `<div class="plan-summary">`;
  html += renderMiniStat('Direct Grind', directPlan.hoursNeeded === Infinity ? 'N/A' : fmtDays(directPlan.hoursNeeded));
  html += renderMiniStat('With Upgrades', plan.totalTime === Infinity ? 'N/A' : fmtDays(plan.totalTime));
  if (plan.savings > 0) {
    html += renderMiniStat('Time Saved', fmtDays(plan.savings));
  }
  html += `</div>`;

  // If times are the same or no savings, say so clearly
  if (plan.savings <= 0 || !plan.steps || plan.steps.length === 0) {
    html += `<div class="plan-direct-note">Direct path is optimal — no intermediate upgrades needed. Focus on earning with your current ship.</div>`;
  }

  // Upgrade path steps (only show if they actually help)
  if (plan.steps && plan.steps.length > 0 && plan.savings > 0) {
    html += `<div class="plan-steps">`;
    html += `<h4>Recommended Upgrade Path</h4>`;
    plan.steps.forEach((step, i) => {
      html += `<div class="plan-step">
        <span class="plan-step__num">${i + 1}</span>
        <div class="plan-step__info">
          <strong>${step.shipName}</strong> — ${fmt(step.cost)} aUEC
          <div class="plan-step__detail">${step.reasoning}</div>
          <div class="plan-step__meta">Time to reach: ${fmtDays(step.timeToReach)} | Break-even: ${fmtHrs(step.breakEvenHours)}</div>
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  // Verdict
  html += `<div class="plan-verdict"><strong>Verdict:</strong> ${plan.verdict}</div>`;

  // Sensitivity note
  if (rec.best) {
    const m = rec.best.method;
    const lowTime = m.aUEChrLow > 0 ? fmtDays(directPlan.deficit / m.aUEChrLow) : 'N/A';
    const highTime = m.aUEChrHigh > 0 ? fmtDays(directPlan.deficit / m.aUEChrHigh) : 'N/A';
    html += `<p class="plan-sensitivity">Sensitivity: direct grind ranges from ${highTime} (best case) to ${lowTime} (worst case).</p>`;
  }

  el.innerHTML = html;
}
