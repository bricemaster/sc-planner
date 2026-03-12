/**
 * @file Searchable ship picker component.
 * @module lib/picker
 */

import { getAllShips, getShipById } from '../data/ships.js';
import { fmt, loadState, saveState } from './utils.js';

const RECENT_KEY = 'recentShips';
const MAX_RECENT = 3;

/**
 * Load recent ship IDs from localStorage.
 * @returns {string[]}
 */
function getRecent() {
  return loadState(RECENT_KEY, []);
}

/**
 * Add a ship ID to the recent list (most recent first, max 3).
 * @param {string} id
 */
function addRecent(id) {
  let recent = getRecent().filter(r => r !== id);
  recent.unshift(id);
  if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
  saveState(RECENT_KEY, recent);
}

/**
 * Group ships by manufacturer, sorted alphabetically by mfr.
 * @param {Array} ships
 * @returns {Map<string, Array>}
 */
function groupByMfr(ships) {
  const map = new Map();
  ships.forEach(s => {
    if (!map.has(s.mfr)) map.set(s.mfr, []);
    map.get(s.mfr).push(s);
  });
  // Sort groups alphabetically
  const sorted = new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  return sorted;
}

/**
 * Create a searchable ship picker component.
 * @param {HTMLElement} container - DOM element to mount into
 * @param {Object} options
 * @param {function} options.onSelect - Callback(shipId) when selection changes
 * @param {string} [options.initialShipId] - Initial ship ID to select
 * @param {string} [options.id] - ID attribute for the picker
 * @returns {{ getValue: function, setValue: function, destroy: function }}
 */
export function createShipPicker(container, options = {}) {
  const { onSelect, initialShipId, id } = options;
  const allShips = getAllShips().sort((a, b) => a.price - b.price);
  let selectedId = initialShipId || allShips[0].id;
  let isOpen = false;

  // Build DOM
  const root = document.createElement('div');
  root.className = 'ship-picker';
  if (id) root.id = id;

  // Display button
  const display = document.createElement('button');
  display.type = 'button';
  display.className = 'ship-picker__display';

  // Panel
  const panel = document.createElement('div');
  panel.className = 'ship-picker__panel';

  // Search input
  const search = document.createElement('input');
  search.type = 'text';
  search.className = 'ship-picker__search';
  search.placeholder = 'Search ships by name or manufacturer...';
  panel.appendChild(search);

  // Options container
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'ship-picker__options';
  panel.appendChild(optionsContainer);

  root.appendChild(display);
  root.appendChild(panel);

  // Clear container and mount
  container.innerHTML = '';
  container.appendChild(root);

  /** Update the display button text */
  function updateDisplay() {
    const ship = getShipById(selectedId);
    if (!ship) {
      display.innerHTML = `
        <div>
          <div class="ship-picker__display-name">Select a ship</div>
        </div>
        <span class="ship-picker__chevron">&#9660;</span>`;
      return;
    }
    display.innerHTML = `
      <div>
        <div class="ship-picker__display-name">${ship.name}</div>
        <div class="ship-picker__display-meta">${ship.mfr} &middot; ${ship.role}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="ship-picker__display-price">${fmt(ship.price)} aUEC</span>
        <span class="ship-picker__chevron">&#9660;</span>
      </div>`;
  }

  /** Track which manufacturer group is expanded (null = all collapsed) */
  let expandedMfr = null;

  /** Render the options list, optionally filtered */
  function renderOptions(filter = '') {
    optionsContainer.innerHTML = '';
    const q = filter.toLowerCase().trim();

    // Filter ships
    const filtered = q
      ? allShips.filter(s => s.name.toLowerCase().includes(q) || s.mfr.toLowerCase().includes(q))
      : allShips;

    // Recent section (only when not filtering)
    if (!q) {
      const recentIds = getRecent();
      const recentShips = recentIds.map(id => getShipById(id)).filter(Boolean);
      if (recentShips.length > 0) {
        const recentLabel = document.createElement('div');
        recentLabel.className = 'ship-picker__recent-label';
        recentLabel.textContent = 'Recent';
        optionsContainer.appendChild(recentLabel);

        recentShips.forEach(s => {
          optionsContainer.appendChild(createOption(s));
        });
      }
    }

    // When searching, show flat filtered results (no accordion)
    if (q) {
      filtered.forEach(s => {
        optionsContainer.appendChild(createOption(s));
      });

      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'ship-picker__option';
        empty.style.color = 'var(--tx4)';
        empty.style.justifyContent = 'center';
        empty.textContent = 'No ships found';
        optionsContainer.appendChild(empty);
      }
      return;
    }

    // Manufacturer-first accordion (collapsed by default)
    const groups = groupByMfr(filtered);
    groups.forEach((ships, mfr) => {
      const isExpanded = expandedMfr === mfr;

      // Manufacturer header (always visible)
      const header = document.createElement('div');
      header.className = 'ship-picker__mfr-header';
      if (isExpanded) header.classList.add('expanded');
      header.innerHTML = `
        <span class="ship-picker__mfr-name">${mfr}</span>
        <span class="ship-picker__mfr-count">${ships.length} ship${ships.length !== 1 ? 's' : ''}</span>
        <span class="ship-picker__mfr-chevron">${isExpanded ? '&#9650;' : '&#9660;'}</span>`;

      header.addEventListener('click', () => {
        expandedMfr = expandedMfr === mfr ? null : mfr;
        renderOptions(filter);
      });

      optionsContainer.appendChild(header);

      // Ship rows (only when expanded)
      if (isExpanded) {
        ships.forEach(s => {
          optionsContainer.appendChild(createOption(s));
        });
      }
    });

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'ship-picker__option';
      empty.style.color = 'var(--tx4)';
      empty.style.justifyContent = 'center';
      empty.textContent = 'No ships found';
      optionsContainer.appendChild(empty);
    }
  }

  /** Create a single option row */
  function createOption(ship) {
    const row = document.createElement('div');
    row.className = 'ship-picker__option';
    if (ship.id === selectedId) row.classList.add('selected');
    row.dataset.shipId = ship.id;

    row.innerHTML = `
      <div>
        <span class="ship-picker__option-name">${ship.name}</span>
        <span class="ship-picker__option-role">${ship.role}</span>
      </div>
      <span class="ship-picker__option-price">${fmt(ship.price)}</span>`;

    row.addEventListener('click', () => selectShip(ship.id));
    return row;
  }

  /** Select a ship and close the panel */
  function selectShip(shipId) {
    selectedId = shipId;
    addRecent(shipId);
    updateDisplay();
    close();

    // Flash animation — fire callback after flash completes to avoid desync
    display.classList.add('flash');
    setTimeout(() => {
      display.classList.remove('flash');
      if (onSelect) onSelect(shipId);
    }, 400);
  }

  /** Open the dropdown panel */
  function open() {
    isOpen = true;
    expandedMfr = null;
    display.classList.add('open');
    panel.classList.add('open');
    search.value = '';
    renderOptions();
    // Focus search after a tick so the panel is visible
    requestAnimationFrame(() => search.focus());
  }

  /** Close the dropdown panel */
  function close() {
    isOpen = false;
    display.classList.remove('open');
    panel.classList.remove('open');
    search.value = '';
  }

  // Event: toggle panel on display click
  display.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) close();
    else open();
  });

  // Event: filter on search input
  search.addEventListener('input', () => {
    renderOptions(search.value);
  });

  // Prevent search clicks from closing panel
  search.addEventListener('click', (e) => e.stopPropagation());
  panel.addEventListener('click', (e) => e.stopPropagation());

  // Event: close on click outside
  function onDocClick() {
    if (isOpen) close();
  }
  document.addEventListener('click', onDocClick);

  // Event: close on Escape
  function onKeyDown(e) {
    if (e.key === 'Escape' && isOpen) {
      close();
      e.stopPropagation();
    }
  }
  document.addEventListener('keydown', onKeyDown);

  // Initial render
  updateDisplay();

  // Public API
  return {
    getValue() {
      return selectedId;
    },
    setValue(shipId) {
      const ship = getShipById(shipId);
      if (ship) {
        selectedId = shipId;
        updateDisplay();
      }
    },
    destroy() {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
      root.remove();
    }
  };
}
