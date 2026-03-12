/**
 * @file Cargo trade routes for Star Citizen 4.6 money planner.
 * Three star systems: Stanton, Pyro (added 4.0), Nyx (added 4.4).
 * Prices are approximate and fluctuate with server economy.
 * @module data/routes
 */

export const routes = [
  // ─── Stanton System (prices from UEX 4.6.0) ─────────────────────
  {
    id: 'bezdek-tdd-laranite',
    name: 'Bezdek → Area18 (Laranite)',
    origin: 'Bezdek Mining Outpost (microTech)',
    destination: 'TDD, Area18 (ArcCorp)',
    commodity: 'Laranite',
    buySCU: 4308,
    sellSCU: 6241,
    profitSCU: 1933,
    time: 15,
    risk: 'medium',
    minSCU: 20,
    notes: 'Classic Laranite run. Massive margins in 4.6. Stock can run out fast on busy servers.'
  },
  {
    id: 'shubin-cbd-gold',
    name: 'Shubin → Lorville (Gold)',
    origin: 'Shubin Mining Facility (microTech)',
    destination: 'CBD, Lorville (Hurston)',
    commodity: 'Gold',
    buySCU: 6605,
    sellSCU: 8240,
    profitSCU: 1635,
    time: 18,
    risk: 'low',
    minSCU: 15,
    notes: 'Safe and reliable route. Gold usually available. High buy cost but good margin.'
  },
  {
    id: 'cru-l5-orison-titanium',
    name: 'CRU-L5 → Orison (Titanium)',
    origin: 'CRU-L5 Rest Stop',
    destination: 'Orison (Crusader)',
    commodity: 'Titanium',
    buySCU: 1657,
    sellSCU: 2569,
    profitSCU: 912,
    time: 12,
    risk: 'low',
    minSCU: 10,
    notes: 'Short run with solid margin. Titanium is cheap to buy and widely available.'
  },
  {
    id: 'deakins-nyx-medsupply',
    name: 'Deakins → Nyx Gateway (Medical Supplies)',
    origin: 'Deakins Research Outpost (Stanton)',
    destination: 'Nyx Gateway',
    commodity: 'Medical Supplies',
    buySCU: 3376,
    sellSCU: 5823,
    profitSCU: 2447,
    time: 14,
    risk: 'medium',
    minSCU: 20,
    notes: 'Best legal margin in 4.6. Medical supplies to Nyx Gateway. Moderate risk.'
  },
  {
    id: 'microtech-orison-diamond',
    name: 'microTech → Orison (Diamond)',
    origin: 'New Babbage (microTech)',
    destination: 'Orison (Crusader)',
    commodity: 'Diamond',
    buySCU: 6276,
    sellSCU: 8226,
    profitSCU: 1950,
    time: 16,
    risk: 'low',
    minSCU: 15,
    notes: 'High-value commodity. Great margins but expensive to fill. Both endpoints are major landing zones.'
  },
  {
    id: 'stanton-agricium',
    name: 'Outpost → Area18 (Agricium)',
    origin: 'Loveridge Mineral Reserve (Stanton)',
    destination: 'TDD, Area18 (ArcCorp)',
    commodity: 'Agricium',
    buySCU: 3150,
    sellSCU: 4714,
    profitSCU: 1564,
    time: 14,
    risk: 'medium',
    minSCU: 15,
    notes: 'Solid Agricium run. 33% margin. Moderate buy cost makes it accessible.'
  },
  {
    id: 'stanton-corundum',
    name: 'Shubin SAL-5 → Pyro (Corundum)',
    origin: 'Shubin Mining Facility SAL-5 (Stanton)',
    destination: "Rod's Fuel 'N Supplies (Pyro)",
    commodity: 'Corundum',
    buySCU: 1153,
    sellSCU: 2046,
    profitSCU: 893,
    time: 25,
    risk: 'high',
    minSCU: 10,
    notes: 'Cross-system Corundum run. Cheap buy, good margin. Pyro destination is lawless.'
  },
  {
    id: 'cru-l1-hurston-fluorine',
    name: 'CRU-L1 → Hurston (Fluorine)',
    origin: 'CRU-L1 Rest Stop',
    destination: 'CBD, Lorville (Hurston)',
    commodity: 'Fluorine',
    buySCU: 993,
    sellSCU: 1503,
    profitSCU: 510,
    time: 12,
    risk: 'low',
    minSCU: 20,
    notes: 'Budget-friendly route. Fluorine is cheap to buy. Good beginner trade route.'
  },
  {
    id: 'stanton-aluminum',
    name: 'Outpost → Lorville (Aluminum)',
    origin: 'Mining Outpost (Stanton)',
    destination: 'CBD, Lorville (Hurston)',
    commodity: 'Aluminum',
    buySCU: 1092,
    sellSCU: 1960,
    profitSCU: 868,
    time: 14,
    risk: 'low',
    minSCU: 20,
    notes: 'Cheapest tradeable commodity with decent margin. 44% profit. Great for beginners with small budgets.'
  },
  {
    id: 'jumptown-area18-maze',
    name: 'Jumptown → Area18 (Maze)',
    origin: 'Jumptown, Yela (Crusader)',
    destination: 'TDD, Area18 (ArcCorp)',
    commodity: 'Maze (illegal)',
    buySCU: 1500,
    sellSCU: 3800,
    profitSCU: 2300,
    time: 20,
    risk: 'high',
    minSCU: 5,
    notes: 'Extremely high margin but illegal. If scanned, you lose everything. Jumptown is a PvP hotspot.'
  },
  {
    id: 'grim-lorville-slam',
    name: 'GrimHEX → Lorville (Slam)',
    origin: 'GrimHEX (Crusader)',
    destination: 'CBD, Lorville (Hurston)',
    commodity: 'Slam (illegal)',
    buySCU: 1100,
    sellSCU: 2200,
    profitSCU: 1100,
    time: 18,
    risk: 'high',
    minSCU: 5,
    notes: 'Illegal drug run. Massive margins but total loss if caught.'
  },

  // ─── Pyro System ──────────────────────────────────────────────────
  {
    id: 'pyro-stanton-helium',
    name: 'Pyro → Stanton (Helium)',
    origin: 'Pyro Station',
    destination: 'Stanton Trade Hub',
    commodity: 'Helium',
    buySCU: 1200,
    sellSCU: 1850,
    profitSCU: 650,
    time: 30,
    risk: 'high',
    minSCU: 20,
    notes: 'Major cross-system route. Jump point takes ~2 min. High profit but Pyro is lawless — PvP risk.'
  },
  {
    id: 'pyro-neon',
    name: 'Pyro Stations (Neon)',
    origin: 'Checkmate Station (Pyro)',
    destination: 'Ratsnest (Pyro)',
    commodity: 'Neon',
    buySCU: 800,
    sellSCU: 1100,
    profitSCU: 300,
    time: 10,
    risk: 'medium',
    minSCU: 10,
    notes: 'Quick intra-Pyro run. Auto-load services available for ~10k aUEC (keeps ship in hangar).'
  },
  {
    id: 'pyro-osoian',
    name: 'Pyro (Osoian Hides)',
    origin: 'Last Landing (Pyro)',
    destination: 'Checkmate Station (Pyro)',
    commodity: 'Osoian Hides',
    buySCU: 2200,
    sellSCU: 3400,
    profitSCU: 1200,
    time: 12,
    risk: 'high',
    minSCU: 5,
    notes: 'Best profit per SCU in Pyro. Limited supply — may not fill large ships. Worth it even for small haulers.'
  },
  {
    id: 'pyro-altruciatoxin',
    name: 'Pyro (AltruciaToxin)',
    origin: 'Ratsnest (Pyro)',
    destination: 'Stanton Trade Hub',
    commodity: 'AltruciaToxin',
    buySCU: 1800,
    sellSCU: 2900,
    profitSCU: 1100,
    time: 28,
    risk: 'high',
    minSCU: 10,
    notes: 'Illegal substance. Massive margins but total loss if scanned entering Stanton.'
  },

  // ─── Nyx System ───────────────────────────────────────────────────
  {
    id: 'nyx-stanton-scrap',
    name: 'Nyx → Stanton (Processed Scrap)',
    origin: 'Levski (Nyx)',
    destination: 'Area18 TDD (ArcCorp)',
    commodity: 'Processed Scrap',
    buySCU: 400,
    sellSCU: 620,
    profitSCU: 220,
    time: 25,
    risk: 'medium',
    minSCU: 20,
    notes: 'Cross-system via Nyx jump point. Levski has good supply. Medium risk — Nyx is semi-lawless.'
  },
  {
    id: 'nyx-stanton-tungsten',
    name: 'Levski → Lorville (Tungsten)',
    origin: 'Levski (Nyx)',
    destination: 'CBD, Lorville (Hurston)',
    commodity: 'Tungsten',
    buySCU: 350,
    sellSCU: 520,
    profitSCU: 170,
    time: 22,
    risk: 'medium',
    minSCU: 15,
    notes: 'Reliable cross-system route. Tungsten has steady demand.'
  }
];

/**
 * Look up a route by its ID.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getRouteById(id) {
  return routes.find(r => r.id === id);
}

/**
 * Get all routes originating from a given location (partial match).
 * @param {string} origin
 * @returns {object[]}
 */
export function getRoutesByOrigin(origin) {
  const lower = origin.toLowerCase();
  return routes.filter(r => r.origin.toLowerCase().includes(lower));
}

/**
 * Find the best trade route given a ship's SCU capacity and available budget.
 * "Best" = highest profit per hour, constrained by how much cargo you can afford.
 * @param {number} scuCapacity - Ship's cargo SCU
 * @param {number} budget - Available aUEC to spend on cargo
 * @returns {object|null} { route, profitPerRun, profitPerHour, scuUsed }
 */
export function getBestRouteForCargo(scuCapacity, budget) {
  if (scuCapacity <= 0 || budget <= 0) return null;

  let best = null;
  let bestPPH = 0;

  for (const route of routes) {
    if (scuCapacity < route.minSCU) continue;

    // How many SCU can we actually fill? Limited by ship capacity and budget.
    // Guard against zero buySCU or zero route time to prevent division by zero
    if (!route.buySCU || route.buySCU <= 0) continue;
    if (!route.time || route.time <= 0) continue;

    const affordableSCU = Math.floor(budget / route.buySCU);
    const scuUsed = Math.min(scuCapacity, affordableSCU);

    if (scuUsed < route.minSCU) continue;

    const profitPerRun = scuUsed * route.profitSCU;
    const runsPerHour = 60 / route.time;
    const profitPerHour = profitPerRun * runsPerHour;

    if (profitPerHour > bestPPH) {
      bestPPH = profitPerHour;
      best = { route, profitPerRun, profitPerHour, scuUsed };
    }
  }

  return best;
}
