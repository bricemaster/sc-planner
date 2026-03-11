/**
 * @file Live commodity price fetcher for Star Citizen planner.
 * Tries public SC APIs, falls back to static estimates.
 * Auto-refreshes every 5 minutes with staleness tracking.
 * @module lib/livedata
 */

const CACHE_KEY = 'scp_livePrices';
const PREV_KEY = 'scp_prevPrices';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

let _refreshTimer = null;
let _onUpdate = null;

/**
 * Start auto-refreshing prices. Calls onUpdate(prices) whenever new data arrives.
 * @param {function} onUpdate - callback receiving the new price data
 */
export function startPriceRefresh(onUpdate) {
  _onUpdate = onUpdate;
  if (_refreshTimer) clearInterval(_refreshTimer);
  _refreshTimer = setInterval(async () => {
    const prices = await fetchLivePrices(true);
    if (_onUpdate) _onUpdate(prices);
  }, REFRESH_INTERVAL);
}

export function stopPriceRefresh() {
  if (_refreshTimer) { clearInterval(_refreshTimer); _refreshTimer = null; }
}

/**
 * Fetch live prices. Stores previous prices for delta comparison.
 * @param {boolean} [forceRefresh=false] - bypass cache
 */
export async function fetchLivePrices(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCached();
    if (cached) return cached;
  }

  // Save current prices as "previous" before fetching new ones
  const currentCached = getCached();
  if (currentCached) {
    try { localStorage.setItem(PREV_KEY, JSON.stringify(currentCached)); } catch {}
  }

  try {
    const response = await fetch('https://uexcorp.space/api/2.0/commodities_prices_all', {
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      const prices = parsePrices(data);
      cacheData(prices);
      return prices;
    }
  } catch (e) {
    console.warn('Live price fetch failed, trying snapshot:', e.message);
  }

  // Try daily snapshot (updated by GitHub Actions cron)
  try {
    const snapRes = await fetch('./data/prices-snapshot.json', { signal: AbortSignal.timeout(3000) });
    if (snapRes.ok) {
      const snap = await snapRes.json();
      if (snap.commodities && snap.commodities.length > 0) {
        const prices = {
          timestamp: snap.fetchedAt || Date.now(),
          source: 'snapshot',
          commodities: snap.commodities.slice(0, 15).map(c => ({
            name: c.name,
            buyAvg: c.buyAvg || KNOWN_BUY_PRICES[c.name] || 0,
            sellAvg: c.sellAvg || 0,
            trend: 'stable'
          }))
        };
        cacheData(prices);
        return prices;
      }
    }
  } catch { /* fall through to static */ }

  return getStaticPrices();
}

/**
 * Get previous price data for delta comparison.
 * @returns {object|null}
 */
export function getPreviousPrices() {
  try {
    const raw = localStorage.getItem(PREV_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * Get human-readable staleness string.
 * @param {number} timestamp
 * @returns {string}
 */
export function getStalenessText(timestamp) {
  if (!timestamp) return '';
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs === 1) return '1 hr ago';
  return `${hrs} hrs ago`;
}

// Known buy prices for tradeable commodities (from routes data / UEX 4.6)
// Used to fill in when API returns 0 for buy prices
const KNOWN_BUY_PRICES = {
  'Laranite': 4308, 'Gold': 6605, 'Titanium': 1657, 'Agricium': 3150,
  'Diamond': 6276, 'Corundum': 1153, 'Aluminum': 1092, 'Fluorine': 993,
  'Medical Supplies': 3376, 'Neon': 800, 'Helium': 1200
};

function parsePrices(data) {
  const commodities = {};

  if (data && data.data) {
    for (const entry of data.data.slice(0, 50)) {
      const name = entry.commodity_name || entry.name;
      if (!name) continue;
      if (!commodities[name]) {
        let buyAvg = entry.price_buy || entry.buy_price || 0;
        const sellAvg = entry.price_sell || entry.sell_price || 0;
        // If API returns 0 buy price but we know this is tradeable, use known price
        if (buyAvg === 0 && KNOWN_BUY_PRICES[name]) {
          buyAvg = KNOWN_BUY_PRICES[name];
        }
        commodities[name] = { name, buyAvg, sellAvg, trend: 'stable' };
      }
    }
  }

  // Prioritize commodities we have buy prices for (tradeable first)
  const sorted = Object.values(commodities).sort((a, b) => {
    if (a.buyAvg > 0 && b.buyAvg === 0) return -1;
    if (a.buyAvg === 0 && b.buyAvg > 0) return 1;
    return b.sellAvg - a.sellAvg;
  });

  return {
    timestamp: Date.now(),
    source: 'uex-live',
    commodities: sorted.slice(0, 15)
  };
}

function getStaticPrices() {
  // Prices from UEX Corp 4.6.0 (Mar 2026)
  // Use a fixed timestamp so these don't appear as "Just now" in the UI
  return {
    timestamp: new Date('2026-01-01T00:00:00Z').getTime(),
    source: 'static-4.6',
    commodities: [
      { name: 'Laranite', buyAvg: 4308, sellAvg: 6241, trend: 'stable' },
      { name: 'Quantanium', buyAvg: 0, sellAvg: 84508, trend: 'up' },
      { name: 'Hadanite', buyAvg: 0, sellAvg: 554031, trend: 'up' },
      { name: 'Gold', buyAvg: 6605, sellAvg: 8240, trend: 'stable' },
      { name: 'Titanium', buyAvg: 1657, sellAvg: 2569, trend: 'stable' },
      { name: 'Agricium', buyAvg: 3150, sellAvg: 4714, trend: 'stable' },
      { name: 'Diamond', buyAvg: 6276, sellAvg: 8226, trend: 'stable' },
      { name: 'Corundum', buyAvg: 1153, sellAvg: 2046, trend: 'up' },
      { name: 'Aluminum', buyAvg: 1092, sellAvg: 1960, trend: 'stable' },
      { name: 'Fluorine', buyAvg: 993, sellAvg: 1503, trend: 'stable' },
      { name: 'Medical Supplies', buyAvg: 3376, sellAvg: 5823, trend: 'up' }
    ]
  };
}

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function cacheData(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}
