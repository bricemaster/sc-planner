// a11y.js — Accessibility & Performance Utilities (Items 66, 69, 71-72, 76-83, 85)
export function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}
export function throttle(fn, ms) {
  let last = 0;
  let timer;
  return function (...args) {
    const now = Date.now();
    const remaining = ms - (now - last);
    clearTimeout(timer);
    if (remaining <= 0) {
      last = now;
      fn.apply(this, args);
    } else {
      timer = setTimeout(() => {
        last = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}
// ── 66. Lazy Loading ──
export function observeLazy() {
  const sections = document.querySelectorAll('.lazy-section');
  if (!sections.length) return;
  if (!('IntersectionObserver' in window)) {
    sections.forEach(s => s.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '50px' });
  sections.forEach(s => observer.observe(s));
}
// ── 69. Virtual Scroll 
export function virtualScroll(container, items, renderFn, itemHeight) {
  const BUFFER = 5;
  let scrollTop = 0;
  const totalHeight = items.length * itemHeight;
  const viewport = container;
  // Create inner container for scroll height
  let inner = viewport.querySelector('.vs-inner');
  if (!inner) {
    inner = document.createElement('div');
    inner.className = 'vs-inner';
    inner.style.position = 'relative';
    viewport.appendChild(inner);
  }
  inner.style.height = totalHeight + 'px';
  function render() {
    const viewH = viewport.clientHeight;
    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - BUFFER);
    const endIdx = Math.min(items.length, Math.ceil((scrollTop + viewH) / itemHeight) + BUFFER);
    // Clear and re-render only visible items
    inner.innerHTML = '';
    for (let i = startIdx; i < endIdx; i++) {
      const el = renderFn(items[i], i);
      if (typeof el === 'string') {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = el;
        const node = wrapper.firstElementChild || wrapper;
        node.style.position = 'absolute';
        node.style.top = (i * itemHeight) + 'px';
        node.style.width = '100%';
        node.style.height = itemHeight + 'px';
        inner.appendChild(node);
      } else if (el instanceof HTMLElement) {
        el.style.position = 'absolute';
        el.style.top = (i * itemHeight) + 'px';
        el.style.width = '100%';
        el.style.height = itemHeight + 'px';
        inner.appendChild(el);
      }
    }
    // Maintain total height
    inner.style.height = totalHeight + 'px';
  }
  viewport.style.overflow = 'auto';
  viewport.addEventListener('scroll', throttle(() => {
    scrollTop = viewport.scrollTop;
    render();
  }, 16));
  render();
  return {
    refresh(newItems) {
      items = newItems;
      inner.style.height = (newItems.length * itemHeight) + 'px';
      render();
    }
  };
}
// ── 71. Preload Hints ─
export function generatePreloadHints() {
  return [
    '<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" as="style">',
    '<link rel="preload" href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" as="style">',
    '<link rel="preload" href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap" as="style">',
    '<link rel="preload" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" as="style">'
  ];
}
// ── 77. Screen Reader Support ───
let srRegion = null;
export function announce(text) {
  if (!srRegion) {
    srRegion = document.getElementById('srAnnounce');
    if (!srRegion) {
      srRegion = document.createElement('div');
      srRegion.id = 'srAnnounce';
      srRegion.setAttribute('aria-live', 'polite');
      srRegion.setAttribute('aria-atomic', 'true');
      srRegion.setAttribute('role', 'status');
      document.body.appendChild(srRegion);
    }
  }
  // Clear then set to ensure re-announcement
  srRegion.textContent = '';
  requestAnimationFrame(() => {
    srRegion.textContent = text;
  });
}
function initScreenReader() {
  // Create aria-live region
  if (!document.getElementById('srAnnounce')) {
    const region = document.createElement('div');
    region.id = 'srAnnounce';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('role', 'status');
    document.body.appendChild(region);
    srRegion = region;
  }
  // Add roles to key sections
  const header = document.querySelector('header, .header');
  if (header) header.setAttribute('role', 'banner');
  const nav = document.querySelector('nav, .nav, .header__controls');
  if (nav) nav.setAttribute('role', 'navigation');
  const main = document.querySelector('main, #main-content, .main');
  if (main) main.setAttribute('role', 'main');
  // Mark decorative elements
  document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
    el.setAttribute('tabindex', '-1');
  });
}
// ── 76. Keyboard Navigation 
function initKeyboardNav() {
  document.body.classList.add('kbd-nav-active');
  // Arrow key navigation between cards / list items
  document.addEventListener('keydown', (e) => {
    const target = e.target;
    const isCard = target.matches('.card, [role="option"], .list-item, [data-nav]');
    if (!isCard) return;
    const parent = target.parentElement;
    if (!parent) return;
    const siblings = Array.from(
      parent.querySelectorAll('.card, [role="option"], .list-item, [data-nav]')
    );
    const idx = siblings.indexOf(target);
    if (idx < 0) return;
    let next = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      next = siblings[idx + 1] || siblings[0];
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      next = siblings[idx - 1] || siblings[siblings.length - 1];
    }
    if (next) {
      e.preventDefault();
      next.focus();
    }
  });
  // Escape to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modal = document.querySelector('.modal.open, .modal[open], .modal.active, [role="dialog"]:not([hidden])');
    if (modal) {
      e.preventDefault();
      const closeBtn = modal.querySelector('.modal-close, [data-close], .close-btn');
      if (closeBtn) {
        closeBtn.click();
      } else {
        modal.classList.remove('open', 'active');
        modal.setAttribute('hidden', '');
      }
      announce('Dialog closed');
    }
    // Close a11y panel on Escape
    const panel = document.querySelector('.a11y-panel.open');
    if (panel) {
      panel.classList.remove('open');
      announce('Accessibility panel closed');
    }
  });
  // Tab trapping for modals
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const modal = document.querySelector('.modal.open, .modal[open], .modal.active, [role="dialog"]:not([hidden])');
    if (!modal) return;
    const focusable = modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
// ── 79. Font Size Controls ─
let fontScale = 1;
const FONT_SCALE_KEY = 'sc_fontScale';
const FONT_MIN = 0.7;
const FONT_MAX = 1.6;
const FONT_STEP = 0.1;
function applyFontScale(scale) {
  fontScale = Math.max(FONT_MIN, Math.min(FONT_MAX, scale));
  document.documentElement.style.setProperty('--font-scale', fontScale);
  document.documentElement.style.fontSize = (fontScale * 100) + '%';
  localStorage.setItem(FONT_SCALE_KEY, fontScale.toString());
  updateFontDisplay();
  announce('Font size: ' + Math.round(fontScale * 100) + '%');
}
function updateFontDisplay() {
  const display = document.querySelector('.a11y-font-value');
  if (display) display.textContent = Math.round(fontScale * 100) + '%';
}
function initFontControls() {
  document.addEventListener('keydown', (e) => {
    if (!e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      applyFontScale(fontScale + FONT_STEP);
    } else if (e.key === '-') {
      e.preventDefault();
      applyFontScale(fontScale - FONT_STEP);
    } else if (e.key === '0') {
      e.preventDefault();
      applyFontScale(1);
    }
  });
}
// ── 78. High Contrast Toggle ────
function toggleHighContrast(force) {
  const active = force !== undefined ? force : !document.body.classList.contains('theme-high-contrast');
  document.body.classList.toggle('theme-high-contrast', active);
  localStorage.setItem('sc_highContrast', active ? '1' : '0');
  announce(active ? 'High contrast mode enabled' : 'High contrast mode disabled');
  syncPanelToggle('a11y-hc', active);
}
// ── 83. Reduced Motion 
function initReducedMotion() {
  // Check OS preference
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches && !localStorage.getItem('sc_reduceMotion')) {
    localStorage.setItem('sc_reduceMotion', '1');
  }
  mq.addEventListener('change', (e) => {
    if (e.matches) {
      toggleReducedMotion(true);
    }
  });
}
function toggleReducedMotion(force) {
  const active = force !== undefined ? force : !document.body.classList.contains('reduce-motion');
  document.body.classList.toggle('reduce-motion', active);
  localStorage.setItem('sc_reduceMotion', active ? '1' : '0');
  announce(active ? 'Animations disabled' : 'Animations enabled');
  syncPanelToggle('a11y-motion', active);
}
// ── 82. Color-Blind Mode ───
function injectCBFilters() {
  if (document.getElementById('cb-filters-svg')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'cb-filters-svg';
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.style.width = '0';
  svg.style.height = '0';
  svg.innerHTML = `
    <defs>
      <filter id="cb-deuteranopia-filter">
        <feColorMatrix type="matrix" values="
          0.625 0.375 0     0 0
          0.7   0.3   0     0 0
          0     0.3   0.7   0 0
          0     0     0     1 0"/>
      </filter>
      <filter id="cb-protanopia-filter">
        <feColorMatrix type="matrix" values="
          0.567 0.433 0     0 0
          0.558 0.442 0     0 0
          0     0.242 0.758 0 0
          0     0     0     1 0"/>
      </filter>
      <filter id="cb-tritanopia-filter">
        <feColorMatrix type="matrix" values="
          0.95  0.05  0     0 0
          0     0.433 0.567 0 0
          0     0.475 0.525 0 0
          0     0     0     1 0"/>
      </filter>
    </defs>
  `;
  document.body.appendChild(svg);
}
function setColorBlindMode(mode) {
  document.body.classList.remove('cb-deuteranopia', 'cb-protanopia', 'cb-tritanopia');
  if (mode && mode !== 'none') {
    injectCBFilters();
    document.body.classList.add('cb-' + mode);
    announce(mode + ' color-blind simulation enabled');
  } else {
    announce('Color-blind simulation disabled');
  }
  localStorage.setItem('sc_cbMode', mode || 'none');
  const sel = document.getElementById('a11y-cb-select');
  if (sel) sel.value = mode || 'none';
}
// ── 85. Dyslexia Font Toggle ────
function toggleDyslexiaFont(force) {
  const active = force !== undefined ? force : !document.body.classList.contains('dyslexia-font');
  document.body.classList.toggle('dyslexia-font', active);
  localStorage.setItem('sc_dyslexiaFont', active ? '1' : '0');
  announce(active ? 'Dyslexia-friendly font enabled' : 'Standard font restored');
  syncPanelToggle('a11y-dyslexia', active);
}
// ── Panel Sync Helper ─
function syncPanelToggle(id, active) {
  const input = document.getElementById(id);
  if (input) input.checked = active;
}
// ── Load Saved Preferences ─
function loadA11yPreferences() {
  // Font scale
  const savedScale = localStorage.getItem(FONT_SCALE_KEY);
  if (savedScale) {
    applyFontScale(parseFloat(savedScale));
  }
  // High contrast
  if (localStorage.getItem('sc_highContrast') === '1') {
    toggleHighContrast(true);
  }
  // Reduced motion
  if (localStorage.getItem('sc_reduceMotion') === '1') {
    toggleReducedMotion(true);
  }
  // Color-blind mode
  const cbMode = localStorage.getItem('sc_cbMode');
  if (cbMode && cbMode !== 'none') {
    setColorBlindMode(cbMode);
  }
  // Dyslexia font
  if (localStorage.getItem('sc_dyslexiaFont') === '1') {
    toggleDyslexiaFont(true);
  }
}
// ── Accessibility Panel ────
export function renderA11yPanel() {
  const sw = (id, label, shortcut) => `<div class="a11y-panel__group"><label class="a11y-panel__label" for="${id}"><span>${label}${shortcut ? ` <span class="a11y-shortcut">${shortcut}</span>` : ''}</span><span class="a11y-switch"><input type="checkbox" id="${id}"><span class="a11y-switch__track"></span></span></label></div>`;
  return `<div class="a11y-panel" id="a11yPanel" role="dialog" aria-label="Accessibility Settings">
    <h3 class="a11y-panel__title">Accessibility Settings</h3>
    ${sw('a11y-hc', 'High Contrast', 'Ctrl+Shift+H')}
    ${sw('a11y-motion', 'Reduced Motion', '')}
    ${sw('a11y-dyslexia', 'Dyslexia Font', '')}
    <div class="a11y-panel__group"><label class="a11y-panel__label"><span>Color-Blind Mode</span></label>
      <select class="a11y-select" id="a11y-cb-select" aria-label="Color-blind mode">
        <option value="none">None</option><option value="deuteranopia">Deuteranopia (green-blind)</option>
        <option value="protanopia">Protanopia (red-blind)</option><option value="tritanopia">Tritanopia (blue-blind)</option>
      </select></div>
    <div class="a11y-panel__group"><label class="a11y-panel__label"><span>Font Size <span class="a11y-shortcut">Ctrl+/\u2212</span></span></label>
      <div class="a11y-font-controls">
        <button class="a11y-font-btn" id="a11y-font-down" aria-label="Decrease font size">&minus;</button>
        <span class="a11y-font-value">100%</span>
        <button class="a11y-font-btn" id="a11y-font-up" aria-label="Increase font size">+</button>
        <button class="a11y-font-btn" id="a11y-font-reset" aria-label="Reset font size">Reset</button>
      </div></div></div>`;
}
function mountA11yPanel() {
  // Inject toggle button
  const btn = document.createElement('button');
  btn.className = 'a11y-toggle-btn';
  btn.setAttribute('aria-label', 'Open accessibility settings');
  btn.setAttribute('title', 'Accessibility (Ctrl+Shift+A)');
  btn.textContent = '\u267F';
  document.body.appendChild(btn);
  // Inject panel
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderA11yPanel();
  const panel = wrapper.firstElementChild;
  document.body.appendChild(panel);
  // Toggle panel
  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    announce(isOpen ? 'Accessibility panel opened' : 'Accessibility panel closed');
  });
  // Wire up toggles
  const hcToggle = document.getElementById('a11y-hc');
  if (hcToggle) hcToggle.addEventListener('change', () => toggleHighContrast(hcToggle.checked));
  const motionToggle = document.getElementById('a11y-motion');
  if (motionToggle) motionToggle.addEventListener('change', () => toggleReducedMotion(motionToggle.checked));
  const dyslexiaToggle = document.getElementById('a11y-dyslexia');
  if (dyslexiaToggle) dyslexiaToggle.addEventListener('change', () => toggleDyslexiaFont(dyslexiaToggle.checked));
  const cbSelect = document.getElementById('a11y-cb-select');
  if (cbSelect) cbSelect.addEventListener('change', () => setColorBlindMode(cbSelect.value));
  const fontDown = document.getElementById('a11y-font-down');
  if (fontDown) fontDown.addEventListener('click', () => applyFontScale(fontScale - FONT_STEP));
  const fontUp = document.getElementById('a11y-font-up');
  if (fontUp) fontUp.addEventListener('click', () => applyFontScale(fontScale + FONT_STEP));
  const fontReset = document.getElementById('a11y-font-reset');
  if (fontReset) fontReset.addEventListener('click', () => applyFontScale(1));
  // Sync initial state
  updateFontDisplay();
  if (localStorage.getItem('sc_highContrast') === '1') syncPanelToggle('a11y-hc', true);
  if (localStorage.getItem('sc_reduceMotion') === '1') syncPanelToggle('a11y-motion', true);
  if (localStorage.getItem('sc_dyslexiaFont') === '1') syncPanelToggle('a11y-dyslexia', true);
  const savedCb = localStorage.getItem('sc_cbMode');
  if (savedCb && cbSelect) cbSelect.value = savedCb;
}
// ── Keyboard Shortcuts 
function initGlobalShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (!e.ctrlKey || !e.shiftKey) return;
    if (e.key === 'H' || e.key === 'h') {
      e.preventDefault();
      toggleHighContrast();
    } else if (e.key === 'A' || e.key === 'a') {
      e.preventDefault();
      const panel = document.getElementById('a11yPanel');
      if (panel) {
        const isOpen = panel.classList.toggle('open');
        announce(isOpen ? 'Accessibility panel opened' : 'Accessibility panel closed');
      }
    }
  });
}
// ── Skip Link Injection ────
function injectSkipLink() {
  if (document.querySelector('.skip-link')) return;
  const link = document.createElement('a');
  link.className = 'skip-link';
  link.href = '#main-content';
  link.textContent = 'Skip to main content';
  document.body.insertBefore(link, document.body.firstChild);
}
// ── Main Init ────
export function initAccessibility() {
  injectSkipLink();
  injectCBFilters();
  initKeyboardNav();
  initScreenReader();
  initFontControls();
  initReducedMotion();
  initGlobalShortcuts();
  mountA11yPanel();
  loadA11yPreferences();
  observeLazy();
}
