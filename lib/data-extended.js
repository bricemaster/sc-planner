/**
 * @file Extended data and calculator functions for Star Citizen earning planner.
 * Items 51-65: Data & Content module.
 * Updated for Alpha 4.6.0 — includes Pyro and Nyx systems.
 * @module lib/data-extended
 */

// SHIPS_EXTENDED removed — use data/ships.js instead (82 verified ships with 4.6 prices)

// ─── 52. Component Database ──────────────────────────────────────────────────

export const COMPONENTS = {
  shields: [
    { name: 'FR-66',            grade: 'C', size: 1, price: 5500,   stat_bonus: 'Base shield HP 2700, regen 85/s' },
    { name: 'Palisade',         grade: 'B', size: 1, price: 10800,  stat_bonus: 'Shield HP 3400, regen 113/s, +26% uptime' },
    { name: 'Sukoran',          grade: 'A', size: 1, price: 18200,  stat_bonus: 'Shield HP 4200, regen 140/s, best-in-class S1' },
    { name: 'INK-Mark',         grade: 'C', size: 2, price: 15500,  stat_bonus: 'Shield HP 5800, regen 180/s' },
    { name: 'Rampart',          grade: 'B', size: 2, price: 28400,  stat_bonus: 'Shield HP 7500, regen 240/s, +29% uptime' },
    { name: 'Fortifier',        grade: 'A', size: 2, price: 47000,  stat_bonus: 'Shield HP 9800, regen 310/s, top-tier S2' },
    { name: 'Guardian',         grade: 'B', size: 3, price: 68000,  stat_bonus: 'Shield HP 18500, regen 520/s, capital-class' },
  ],
  quantum_drives: [
    { name: 'Beacon',           grade: 'C', size: 1, price: 7200,   stat_bonus: 'QT speed 74 Mm/s, range 102 Gm, slow spool' },
    { name: 'Voyage',           grade: 'B', size: 1, price: 14500,  stat_bonus: 'QT speed 88 Mm/s, range 168 Gm, balanced' },
    { name: 'Atlas',            grade: 'A', size: 1, price: 24000,  stat_bonus: 'QT speed 105 Mm/s, range 230 Gm, fast spool' },
    { name: 'Erebos',           grade: 'C', size: 2, price: 18000,  stat_bonus: 'QT speed 82 Mm/s, range 210 Gm' },
    { name: 'Pontes',           grade: 'B', size: 2, price: 35000,  stat_bonus: 'QT speed 115 Mm/s, range 340 Gm' },
    { name: 'VK-00',            grade: 'A', size: 2, price: 56000,  stat_bonus: 'QT speed 143 Mm/s, range 480 Gm, fastest S2' },
  ],
  weapons: [
    { name: 'CF-117 Badger',    grade: 'B', size: 2, price: 9200,   stat_bonus: 'Laser repeater, 240 dps, good range' },
    { name: 'CF-227 Panther',   grade: 'B', size: 3, price: 15800,  stat_bonus: 'Laser repeater, 390 dps, versatile' },
    { name: 'M5A Laser Cannon', grade: 'B', size: 3, price: 18000,  stat_bonus: 'Laser cannon, 450 dps, high alpha' },
    { name: 'Mantis GT-220',    grade: 'B', size: 3, price: 14200,  stat_bonus: 'Ballistic gatling, 520 dps, ammo-limited' },
    { name: 'Attrition-3',      grade: 'A', size: 3, price: 22000,  stat_bonus: 'Energy repeater, 410 dps, low heat buildup' },
    { name: 'GVSR Laser Cannon',grade: 'A', size: 4, price: 38000,  stat_bonus: 'Laser cannon, 680 dps, turret-class' },
    { name: 'Revenant Ballistic',grade:'B', size: 4, price: 28000,  stat_bonus: 'Ballistic gatling, 780 dps, high ammo draw' },
  ],
};


// ─── 53. Location Database ───────────────────────────────────────────────────
// Updated for Alpha 4.6.0 — Pyro (added 4.0) and Nyx (added 4.4) systems

export const LOCATIONS = {
  stations: [
    // Stanton
    { name: 'Port Olisar',             system: 'Stanton', parent_body: 'Crusader',    has_refinery: false, has_trading: true,  danger_level: 1 },
    { name: 'Everus Harbor',           system: 'Stanton', parent_body: 'Hurston',     has_refinery: false, has_trading: true,  danger_level: 2 },
    { name: 'Baijini Point',           system: 'Stanton', parent_body: 'ArcCorp',     has_refinery: false, has_trading: true,  danger_level: 2 },
    { name: 'Port Tressler',           system: 'Stanton', parent_body: 'microTech',   has_refinery: false, has_trading: true,  danger_level: 1 },
    { name: 'CRU-L1 Ambitious Dream',  system: 'Stanton', parent_body: 'Crusader L1', has_refinery: true,  has_trading: true,  danger_level: 2 },
    { name: 'ARC-L1 Wide Forest',      system: 'Stanton', parent_body: 'ArcCorp L1',  has_refinery: true,  has_trading: true,  danger_level: 2 },
    { name: 'HUR-L1 Green Glade',      system: 'Stanton', parent_body: 'Hurston L1',  has_refinery: true,  has_trading: true,  danger_level: 3 },
    { name: 'HUR-L2 Faithful Dream',   system: 'Stanton', parent_body: 'Hurston L2',  has_refinery: true,  has_trading: true,  danger_level: 3 },
    { name: 'MIC-L1 Shallow Frontier', system: 'Stanton', parent_body: 'microTech L1',has_refinery: true,  has_trading: true,  danger_level: 2 },
    { name: 'Grim HEX',               system: 'Stanton', parent_body: 'Crusader',    has_refinery: false, has_trading: true,  danger_level: 4 },
    // Pyro (added Alpha 4.0, Dec 2024) — lawless system
    { name: 'Checkmate Station',       system: 'Pyro',    parent_body: 'Pyro',        has_refinery: false, has_trading: true,  danger_level: 5 },
    { name: "Rat's Nest",              system: 'Pyro',    parent_body: 'Pyro',        has_refinery: false, has_trading: true,  danger_level: 5 },
    { name: 'Last Landing',            system: 'Pyro',    parent_body: 'Pyro',        has_refinery: false, has_trading: true,  danger_level: 4 },
    { name: 'Ruin Station',            system: 'Pyro',    parent_body: 'Pyro',        has_refinery: true,  has_trading: true,  danger_level: 5 },
    { name: 'Orbituary',               system: 'Pyro',    parent_body: 'Pyro',        has_refinery: false, has_trading: true,  danger_level: 5 },
    { name: 'Patch City',              system: 'Pyro',    parent_body: 'Pyro',        has_refinery: false, has_trading: true,  danger_level: 5 },
    { name: 'Gaslight',                system: 'Pyro',    parent_body: 'Pyro',        has_refinery: false, has_trading: false, danger_level: 4 },
    { name: 'Megumi Refueling',        system: 'Pyro',    parent_body: 'Pyro',        has_refinery: true,  has_trading: false, danger_level: 4 },
    { name: 'Endgame',                 system: 'Pyro',    parent_body: 'Pyro',        has_refinery: false, has_trading: true,  danger_level: 5 },
    { name: "Rod's Fuel 'N Supplies",  system: 'Pyro',    parent_body: 'Pyro',        has_refinery: true,  has_trading: true,  danger_level: 4 },
    { name: 'Stanton Gateway',         system: 'Pyro',    parent_body: 'Pyro',        has_refinery: false, has_trading: false, danger_level: 3 },
    { name: 'Nyx Gateway',             system: 'Pyro',    parent_body: 'Pyro',        has_refinery: false, has_trading: true,  danger_level: 3 },
    // Nyx (added Alpha 4.4, Nov 2025) — semi-lawless
    { name: 'Levski',                  system: 'Nyx',     parent_body: 'Delamar',     has_refinery: false, has_trading: true,  danger_level: 3 },
    { name: 'Pyro Gateway (Nyx)',      system: 'Nyx',     parent_body: 'Nyx',         has_refinery: false, has_trading: false, danger_level: 3 },
  ],
  planets: [
    // Stanton
    { name: 'Hurston',   system: 'Stanton', parent_body: 'Stanton',  has_refinery: false, has_trading: true,  danger_level: 2 },
    { name: 'Crusader',  system: 'Stanton', parent_body: 'Stanton',  has_refinery: false, has_trading: true,  danger_level: 1 },
    { name: 'ArcCorp',   system: 'Stanton', parent_body: 'Stanton',  has_refinery: false, has_trading: true,  danger_level: 2 },
    { name: 'microTech', system: 'Stanton', parent_body: 'Stanton',  has_refinery: false, has_trading: true,  danger_level: 1 },
    // Pyro
    { name: 'Monox',     system: 'Pyro',    parent_body: 'Pyro',     has_refinery: false, has_trading: false, danger_level: 5 },
    { name: 'Bloom',     system: 'Pyro',    parent_body: 'Pyro',     has_refinery: false, has_trading: false, danger_level: 4 },
    { name: 'Pyro V',    system: 'Pyro',    parent_body: 'Pyro',     has_refinery: false, has_trading: false, danger_level: 4 },
    { name: 'Terminus',  system: 'Pyro',    parent_body: 'Pyro',     has_refinery: false, has_trading: false, danger_level: 5 },
  ],
  moons: [
    // Stanton
    { name: 'Yela',     system: 'Stanton', parent_body: 'Crusader',  has_refinery: false, has_trading: false, danger_level: 3 },
    { name: 'Daymar',   system: 'Stanton', parent_body: 'Crusader',  has_refinery: false, has_trading: false, danger_level: 2 },
    { name: 'Cellin',   system: 'Stanton', parent_body: 'Crusader',  has_refinery: false, has_trading: false, danger_level: 3 },
    { name: 'Aberdeen', system: 'Stanton', parent_body: 'Hurston',   has_refinery: false, has_trading: false, danger_level: 3 },
    { name: 'Arial',    system: 'Stanton', parent_body: 'Hurston',   has_refinery: false, has_trading: false, danger_level: 3 },
    { name: 'Ita',      system: 'Stanton', parent_body: 'Hurston',   has_refinery: false, has_trading: false, danger_level: 4 },
    { name: 'Lyria',    system: 'Stanton', parent_body: 'ArcCorp',   has_refinery: false, has_trading: false, danger_level: 2 },
    { name: 'Wala',     system: 'Stanton', parent_body: 'ArcCorp',   has_refinery: false, has_trading: false, danger_level: 2 },
    { name: 'Calliope', system: 'Stanton', parent_body: 'microTech', has_refinery: false, has_trading: false, danger_level: 2 },
    { name: 'Clio',     system: 'Stanton', parent_body: 'microTech', has_refinery: false, has_trading: false, danger_level: 2 },
    { name: 'Euterpe',  system: 'Stanton', parent_body: 'microTech', has_refinery: false, has_trading: false, danger_level: 1 },
  ],
  asteroids: [
    // Nyx
    { name: 'Delamar',  system: 'Nyx',     parent_body: 'Nyx',       has_refinery: false, has_trading: true,  danger_level: 3 },
  ],
};


// ─── 54. Mining Hotspots ─────────────────────────────────────────────────────

export const MINING_SPOTS = [
  { name: 'Lyria Belt Cluster',       location: 'Lyria',              ore_type: 'Quantanium',   avg_yield: 0.38, danger_level: 3, notes: 'Best Quantanium density; volatile ore, refine quickly' },
  { name: 'Aberdeen Ridge',           location: 'Aberdeen',           ore_type: 'Quantanium',   avg_yield: 0.30, danger_level: 4, notes: 'High temp surface; suit cooling recommended' },
  { name: 'Yela Asteroid Belt',       location: 'Yela',              ore_type: 'Bexalite',     avg_yield: 0.22, danger_level: 2, notes: 'Safe belt mining, good for beginners' },
  { name: 'Daymar Highlands',         location: 'Daymar',            ore_type: 'Hadanite',     avg_yield: 0.45, danger_level: 2, notes: 'ROC mining; easy terrain, consistent yields' },
  { name: 'Aberdeen Flats',           location: 'Aberdeen',           ore_type: 'Hadanite',     avg_yield: 0.40, danger_level: 3, notes: 'ROC mining; hostile environment but high density' },
  { name: 'Arial Caves',              location: 'Arial',             ore_type: 'Hadanite',     avg_yield: 0.42, danger_level: 3, notes: 'Cave hand-mining; FPS gear required' },
  { name: 'Cellin Scatter Fields',    location: 'Cellin',            ore_type: 'Taranite',     avg_yield: 0.28, danger_level: 3, notes: 'Moderate yields; watch for outlaw ambushes' },
  { name: 'Aaron Halo Belt',          location: 'Aaron Halo',        ore_type: 'Quantanium',   avg_yield: 0.35, danger_level: 3, notes: 'Deep-space belt; long travel, good deposits' },
  { name: 'Wala Surface Deposits',    location: 'Wala',              ore_type: 'Laranite',     avg_yield: 0.18, danger_level: 2, notes: 'Low yield but safe; good for rep building' },
  { name: 'Clio Northern Ridges',     location: 'Clio',              ore_type: 'Agricium',     avg_yield: 0.20, danger_level: 2, notes: 'Surface mining; cold environment, moderate yields' },
  // Pyro mining hotspots (added Alpha 4.0)
  { name: 'Pyro Asteroid Belt',       location: 'Pyro Belt',         ore_type: 'Stileron',     avg_yield: 0.32, danger_level: 5, notes: 'Lawless system; high-value Stileron deposits, watch for gangs' },
  { name: 'Pyro V Surface Deposits',  location: 'Pyro V',            ore_type: 'Riccite',      avg_yield: 0.15, danger_level: 5, notes: 'Rare ore; extremely dangerous, bring escorts and heavy gear' },
];


// ─── 55. Trade Routes ────────────────────────────────────────────────────────

export const TRADE_ROUTES = [
  { from: 'Bezdek',           to: 'Area18 TDD',           commodity: 'Laranite',         buy_price: 27.5,  sell_price: 31.5,  profit_per_scu: 4.0,  cargo_needed: 46,  estimated_time_min: 15 },
  { from: 'Loveridge',        to: 'Port Olisar',          commodity: 'Agricium',         buy_price: 25.0,  sell_price: 28.2,  profit_per_scu: 3.2,  cargo_needed: 66,  estimated_time_min: 12 },
  { from: 'Kudre Ore',        to: 'Area18 TDD',           commodity: 'Titanium',         buy_price: 8.0,   sell_price: 11.5,  profit_per_scu: 3.5,  cargo_needed: 120, estimated_time_min: 18 },
  { from: 'Shubin SAL-2',     to: 'NB Trade Center',      commodity: 'Fluorine',         buy_price: 2.8,   sell_price: 5.1,   profit_per_scu: 2.3,  cargo_needed: 96,  estimated_time_min: 14 },
  { from: 'Benson Mining',    to: 'Lorville CBD',         commodity: 'Astatine',         buy_price: 8.4,   sell_price: 12.8,  profit_per_scu: 4.4,  cargo_needed: 46,  estimated_time_min: 10 },
  { from: 'Hickes Research',  to: 'Port Tressler',        commodity: 'Stims',            buy_price: 3.4,   sell_price: 5.8,   profit_per_scu: 2.4,  cargo_needed: 576, estimated_time_min: 20 },
  { from: 'ArcCorp Mining 141',to:'NB Trade Center',      commodity: 'Gold',             buy_price: 6.1,   sell_price: 8.2,   profit_per_scu: 2.1,  cargo_needed: 696, estimated_time_min: 22 },
  { from: 'Tram & Myers',     to: 'Everus Harbor',        commodity: 'Diamond',          buy_price: 6.8,   sell_price: 9.0,   profit_per_scu: 2.2,  cargo_needed: 120, estimated_time_min: 8 },
  { from: 'Rayari Deltana',   to: 'Baijini Point',        commodity: 'Revenant Tree Pollen', buy_price: 1.5, sell_price: 3.8, profit_per_scu: 2.3,  cargo_needed: 66,  estimated_time_min: 11 },
  { from: 'Humboldt Mines',   to: 'Lorville CBD',         commodity: 'Corundum',         buy_price: 2.5,   sell_price: 4.6,   profit_per_scu: 2.1,  cargo_needed: 46,  estimated_time_min: 9 },
];


// ─── 56. Mission Payouts ─────────────────────────────────────────────────────
// Updated for Alpha 4.6.0 payout rebalance

export const MISSION_PAYOUTS = {
  bounty: [
    { name: 'VLRT (Very Low Risk Target)',  min_payout: 4000,    max_payout: 6000,    rep_required: 0,   license_cost: 500,    estimated_time_min: 5 },
    { name: 'LRT (Low Risk Target)',        min_payout: 8000,    max_payout: 15000,   rep_required: 1,   license_cost: 1000,   estimated_time_min: 8 },
    { name: 'MRT (Medium Risk Target)',     min_payout: 15000,   max_payout: 25000,   rep_required: 2,   license_cost: 2500,   estimated_time_min: 10 },
    { name: 'HRT (High Risk Target)',       min_payout: 30000,   max_payout: 42000,   rep_required: 3,   license_cost: 5000,   estimated_time_min: 12 },
    { name: 'VHRT (Very High Risk Target)', min_payout: 45000,   max_payout: 60000,   rep_required: 4,   license_cost: 10000,  estimated_time_min: 15 },
    { name: 'ERT (Extreme Risk Target)',    min_payout: 80000,   max_payout: 100000,  rep_required: 5,   license_cost: 25000,  estimated_time_min: 20 },
    { name: 'Group VHRT',                  min_payout: 100000,  max_payout: 130000,  rep_required: 5,   license_cost: 0,      estimated_time_min: 25 },
    { name: 'Group ERT',                   min_payout: 130000,  max_payout: 180000,  rep_required: 5,   license_cost: 0,      estimated_time_min: 30 },
    { name: 'Fugitive Recovery (PvP)',      min_payout: 151000,  max_payout: 151000,  rep_required: 3,   license_cost: 0,      estimated_time_min: 15 },
  ],
  delivery: [
    { name: 'Local Delivery',               min_payout: 4500,    max_payout: 6500,    rep_required: 0,   estimated_time_min: 10 },
    { name: 'Planetary Delivery',           min_payout: 8000,    max_payout: 12000,   rep_required: 1,   estimated_time_min: 15 },
    { name: 'Multi-Stop Delivery',          min_payout: 15000,   max_payout: 22000,   rep_required: 2,   estimated_time_min: 25 },
    { name: 'Cross-System Delivery',        min_payout: 25000,   max_payout: 36000,   rep_required: 3,   estimated_time_min: 35 },
    { name: 'Hazardous Materials',          min_payout: 45000,   max_payout: 60000,   rep_required: 4,   estimated_time_min: 30 },
  ],
  mining_contract: [
    { name: 'Basic Ore Collection',         min_payout: 10000,   max_payout: 15000,   rep_required: 0,   estimated_time_min: 20 },
    { name: 'Targeted Mineral Extraction',  min_payout: 20000,   max_payout: 30000,   rep_required: 2,   estimated_time_min: 30 },
    { name: 'Rare Ore Acquisition',         min_payout: 40000,   max_payout: 60000,   rep_required: 3,   estimated_time_min: 40 },
    { name: 'Quantanium Rush',              min_payout: 80000,   max_payout: 120000,  rep_required: 4,   estimated_time_min: 45 },
  ],
  salvage_contract: [
    { name: 'Unverified Salvage',           min_payout: 50000,   max_payout: 100000,  rep_required: 1,   estimated_time_min: 15 },
    { name: 'Licensed Salvage',             min_payout: 80000,   max_payout: 150000,  rep_required: 3,   estimated_time_min: 20 },
  ],
};

// ─── Refinery Methods (from wiki) ────────────────────────────────────────────
export const REFINERY_METHODS = [
  { name: 'Cormack Method',          speed: 'high',     cost: 'moderate', yield: 'low' },
  { name: 'Dinyx Solvention',        speed: 'very-low', cost: 'low',      yield: 'high' },
  { name: 'Electrostarolysis',       speed: 'moderate', cost: 'moderate', yield: 'moderate' },
  { name: 'Ferron Exchange',         speed: 'low',      cost: 'moderate', yield: 'high' },
  { name: 'Gaskin Process',          speed: 'high',     cost: 'high',     yield: 'moderate' },
  { name: 'Kazen Winnowing',         speed: 'moderate', cost: 'low',      yield: 'low' },
  { name: 'Pyrometric Chromalysis',  speed: 'low',      cost: 'high',     yield: 'high' },
  { name: 'Thermonatic Deposition',  speed: 'low',      cost: 'low',      yield: 'moderate' },
  { name: 'XCR Reaction',            speed: 'high',     cost: 'high',     yield: 'low' },
];

// ─── Ship Rental Prices (from wiki 4.6) ─────────────────────────────────────
export const SHIP_RENTALS = [
  { id: 'aurora-es',      name: 'Aurora ES',           rentalPerDay: 6350 },
  { id: 'aurora-mr',      name: 'Aurora MR',           rentalPerDay: 17010 },
  { id: 'aurora-ln',      name: 'Aurora LN',           rentalPerDay: 22680 },
  { id: 'aurora-cl',      name: 'Aurora CL',           rentalPerDay: 20412 },
  { id: 'mustang-alpha',  name: 'Mustang Alpha',       rentalPerDay: 9639 },
  { id: 'pisces',         name: 'C8X Pisces',          rentalPerDay: 13891 },
  { id: 'cutter',         name: 'Cutter',              rentalPerDay: 9525 },
  { id: 'avenger-titan',  name: 'Avenger Titan',       rentalPerDay: 27165 },
  { id: 'nomad',          name: 'Nomad',               rentalPerDay: 30240 },
  { id: 'hull-a',         name: 'Hull A',              rentalPerDay: 34020 },
  { id: 'reliant-kore',   name: 'Reliant Kore',        rentalPerDay: 42997 },
  { id: '325a',           name: '325a',                rentalPerDay: 46305 },
  { id: 'cutlass-black',  name: 'Cutlass Black',       rentalPerDay: 52920 },
  { id: 'freelancer',     name: 'Freelancer',          rentalPerDay: 62370 },
  { id: 'c1-spirit',      name: 'C1 Spirit',           rentalPerDay: 62370 },
  { id: 'defender',       name: 'Banu Defender',       rentalPerDay: 155925 },
  { id: 'constellation-taurus', name: 'Constellation Taurus', rentalPerDay: 160877 },
  { id: 'drake-corsair',  name: 'Corsair',             rentalPerDay: 163800 },
  { id: 'constellation-andromeda', name: 'Constellation Andromeda', rentalPerDay: 254016 },
  { id: '600i-explorer',  name: '600i Explorer',       rentalPerDay: 680794 },
];

// Rental locations
export const RENTAL_LOCATIONS = [
  'Riker Memorial Spaceport (Area18, ArcCorp)',
  'Teasa Spaceport (Lorville, Hurston)',
  'New Babbage Interstellar Spaceport (microTech)',
  'Orison (Crusader)',
  'Levski (Delamar, Nyx)',
  'Cargo/Refinery Decks at Lagrange stations',
];


// ─── 57. Reputation Tracker UI ───────────────────────────────────────────────

const FACTIONS = [
  { id: 'hurston',        name: 'Hurston Dynamics',        color: '#c9aa6e' },
  { id: 'crusader',       name: 'Crusader Industries',     color: '#6eb88a' },
  { id: 'arccorp',        name: 'ArcCorp',                 color: '#6ea8c9' },
  { id: 'microtech',      name: 'microTech',               color: '#9b6ec9' },
  { id: 'bounty',         name: 'Bounty Hunters Guild',    color: '#c46e6e' },
  // Pyro gangs (added Alpha 4.0)
  { id: 'pyro_headhunters', name: 'Pyro Headhunters',     color: '#e85d3a' },
  { id: 'pyro_marauders',   name: 'Rust Marauders',       color: '#d4442e' },
  { id: 'pyro_reapers',     name: 'Reapers of Pyro',      color: '#a83219' },
  // Nyx independent factions (added Alpha 4.4)
  { id: 'nyx_peoples_alliance', name: "People's Alliance of Nyx", color: '#8eb8a0' },
  { id: 'nyx_delamar_independents', name: 'Delamar Independents', color: '#7ca392' },
];

/**
 * Renders a reputation tracker panel with progress bars for each faction.
 * @param {Object} [repData] — { factionId: 0-5 value } or defaults to zeros
 * @returns {string} HTML string
 */
export function renderRepTracker(repData = {}) {
  const maxRep = 5;
  const rows = FACTIONS.map(f => {
    const level = Math.min(maxRep, Math.max(0, repData[f.id] || 0));
    const pct = (level / maxRep) * 100;
    return `
      <div class="rep-row">
        <span class="rep-label">${f.name}</span>
        <div class="rep-bar-track">
          <div class="rep-bar-fill" style="width:${pct}%;background:${f.color}"></div>
        </div>
        <span class="rep-level">${level}/${maxRep}</span>
      </div>`;
  }).join('');

  return `
    <div class="rep-tracker">
      <h3 class="data-section-title">Reputation</h3>
      ${rows}
    </div>`;
}


// ─── 58. Insurance Costs ─────────────────────────────────────────────────────

/**
 * Calculate insurance claim cost.
 * @param {number} shipPrice — aUEC price of the ship
 * @param {'standard'|'expedited'} claimType
 * @returns {{ cost: number, wait_minutes: number, type: string }}
 */
export function getInsuranceCost(shipPrice, claimType = 'standard') {
  if (claimType === 'expedited') {
    return { cost: Math.round(shipPrice * 0.05), wait_minutes: 0, type: 'expedited' };
  }
  return { cost: Math.round(shipPrice * 0.01), wait_minutes: estimateWait(shipPrice), type: 'standard' };
}

function estimateWait(price) {
  if (price < 500000) return 3;
  if (price < 2000000) return 8;
  if (price < 5000000) return 15;
  if (price < 10000000) return 25;
  return 40;
}


// ─── 59. Fuel Calculator ────────────────────────────────────────────────────

/**
 * Estimate fuel cost for a quantum travel leg.
 * @param {object} ship — a ship from SHIPS_EXTENDED (uses cargo_capacity as size proxy)
 * @param {number} distance — distance in Gm (gigameters)
 * @returns {{ hydrogen_cost: number, quantum_cost: number, total: number }}
 */
export function calculateFuelCost(ship, distance) {
  const sizeCategory = ship.cargo_capacity <= 10 ? 'small'
    : ship.cargo_capacity <= 100 ? 'medium'
    : ship.cargo_capacity <= 600 ? 'large'
    : 'capital';

  const rates = {
    small:   { h2_per_gm: 12,  qt_per_gm: 45 },
    medium:  { h2_per_gm: 28,  qt_per_gm: 80 },
    large:   { h2_per_gm: 55,  qt_per_gm: 140 },
    capital: { h2_per_gm: 120, qt_per_gm: 260 },
  };

  const r = rates[sizeCategory];
  const hydrogen_cost = Math.round(r.h2_per_gm * distance);
  const quantum_cost = Math.round(r.qt_per_gm * distance);
  return { hydrogen_cost, quantum_cost, total: hydrogen_cost + quantum_cost };
}


// ─── 60. Risk Assessment ────────────────────────────────────────────────────

const ACTIVITY_RISK = {
  mining:    { base: 1, factors: ['Ore volatility', 'Collision with asteroids'], tips: ['Keep Quantanium cool', 'Watch scanner for hostiles'] },
  trading:   { base: 1, factors: ['Cargo loss on death', 'Pirate interdiction'], tips: ['Avoid pad ramming zones', 'Use armistice-to-armistice routes'] },
  bounty:    { base: 2, factors: ['Target firepower', 'Ambush by wingmen'], tips: ['Upgrade shields first', 'Approach from range'] },
  salvage:   { base: 1, factors: ['Derelict traps', 'Environmental hazard'], tips: ['Scan before EVA', 'Bring a sidearm'] },
  delivery:  { base: 0, factors: ['Low combat risk'], tips: ['Use QT markers', 'Check destination landing zone'] },
  combat:    { base: 3, factors: ['PvP encounters', 'Crime stat escalation'], tips: ['Check reputation before engagement', 'Fly with org-mates'] },
};

/**
 * Produce a risk assessment for a given location + activity.
 * @param {object} location — from LOCATIONS
 * @param {string} activity — mining|trading|bounty|salvage|delivery|combat
 * @returns {{ level: number, label: string, factors: string[], tips: string[] }}
 */
export function getRiskAssessment(location, activity) {
  const act = ACTIVITY_RISK[activity] || ACTIVITY_RISK.delivery;
  const raw = (location.danger_level || 1) + act.base;
  const level = Math.min(5, Math.max(1, raw));

  const labels = { 1: 'Minimal', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Extreme' };

  const factors = [
    `${location.name} danger level: ${location.danger_level}/5`,
    ...act.factors,
  ];

  return { level, label: labels[level], factors, tips: act.tips };
}


// ─── 61. Event Calendar ─────────────────────────────────────────────────────

export const EVENTS = [
  {
    name: 'Jumptown',
    description: 'Contested drug-lab event. Teams fight over control of a narcotics production facility for high-value loot drops.',
    rewards_description: 'Up to 200k+ aUEC per cycle from maze boxes; risk of total loss on death',
    difficulty: 4,
    recommended_ships: ['Cutlass Black', 'Freelancer', 'Constellation Andromeda', 'Vanguard Warden'],
  },
  {
    name: 'Xenothreat',
    description: 'Large-scale PvE fleet battle against the Xenothreat faction. Multi-phase event with supply, combat, and rescue stages.',
    rewards_description: '100k-350k aUEC for full event completion; bonus for top contributors',
    difficulty: 3,
    recommended_ships: ['Vanguard Warden', 'Constellation Andromeda', 'Hammerhead', 'C2 Hercules'],
  },
  {
    name: 'Nine Tails Lockdown',
    description: 'Blockade-breaking event. Players must escort supply convoys through hostile Nine Tails pirate forces.',
    rewards_description: '80k-180k aUEC per phase; combat and logistics roles available',
    difficulty: 3,
    recommended_ships: ['Gladius', 'Arrow', 'Cutlass Black', 'Freelancer MAX'],
  },
  {
    name: 'Siege of Orison',
    description: 'FPS-focused event on Crusader platforms. Clear hostile forces across multiple platform stages.',
    rewards_description: '60k-120k aUEC per run; bonus for speed; rare loot drops',
    difficulty: 4,
    recommended_ships: ['Pisces', 'Avenger Titan', 'Cutlass Black'],
  },
];


// ─── 62. Rent vs Buy Analysis ────────────────────────────────────────────────

/**
 * Compare renting vs buying a ship.
 * @param {number} shipPrice — full purchase price in aUEC
 * @param {number} rentalCost — cost per rental period (1-day rental)
 * @param {number} sessionsPerWeek — how many play sessions per week
 * @returns {{ breakEvenSessions: number, breakEvenWeeks: number, recommendation: string }}
 */
export function rentVsBuy(shipPrice, rentalCost, sessionsPerWeek) {
  const breakEvenSessions = Math.ceil(shipPrice / rentalCost);
  const breakEvenWeeks = Math.ceil(breakEvenSessions / Math.max(1, sessionsPerWeek));

  let recommendation;
  if (breakEvenWeeks <= 2) {
    recommendation = 'Buy immediately — you will break even in under 2 weeks.';
  } else if (breakEvenWeeks <= 6) {
    recommendation = 'Buying is worthwhile if you plan to keep playing regularly.';
  } else if (breakEvenWeeks <= 12) {
    recommendation = 'Consider renting first to test the ship, then buy if you like it.';
  } else {
    recommendation = 'Rent as needed — buying would take a very long time to pay off.';
  }

  return { breakEvenSessions, breakEvenWeeks, recommendation };
}


// ─── 63. Crew Pay Calculator ────────────────────────────────────────────────

/**
 * Split earnings among crew members.
 * @param {number} totalEarnings — total aUEC earned
 * @param {number} crewCount — number of crew including captain
 * @param {number} [captainBonus=0.1] — captain's bonus as fraction (0.1 = 10% extra)
 * @returns {{ captainShare: number, crewShare: number, breakdown: { role: string, amount: number }[] }}
 */
export function calculateCrewPay(totalEarnings, crewCount, captainBonus = 0.1) {
  if (crewCount <= 0) return { captainShare: totalEarnings, crewShare: 0, breakdown: [{ role: 'Captain (solo)', amount: totalEarnings }] };
  if (crewCount === 1) return { captainShare: totalEarnings, crewShare: 0, breakdown: [{ role: 'Captain (solo)', amount: totalEarnings }] };

  const captainCut = totalEarnings * captainBonus;
  const remainder = totalEarnings - captainCut;
  const perPerson = Math.floor(remainder / crewCount);
  const captainShare = perPerson + Math.round(captainCut);
  const crewShare = perPerson;

  const breakdown = [{ role: 'Captain', amount: captainShare }];
  for (let i = 1; i < crewCount; i++) {
    breakdown.push({ role: `Crew ${i}`, amount: crewShare });
  }

  return { captainShare, crewShare, breakdown };
}


// ─── 64. Fee Calculator ─────────────────────────────────────────────────────

/**
 * Calculate net earnings after various fees.
 * @param {number} earnings — gross aUEC
 * @param {object} fees — { refining?: number, landing?: number, insurance?: number }
 * @returns {{ gross: number, totalFees: number, net: number, feeBreakdown: { name: string, amount: number }[] }}
 */
export function calculateFees(earnings, fees = {}) {
  const feeBreakdown = [];
  let totalFees = 0;

  if (fees.refining) {
    const amt = Math.round(fees.refining);
    feeBreakdown.push({ name: 'Refining', amount: amt });
    totalFees += amt;
  }
  if (fees.landing) {
    const amt = Math.round(fees.landing);
    feeBreakdown.push({ name: 'Landing', amount: amt });
    totalFees += amt;
  }
  if (fees.insurance) {
    const amt = Math.round(fees.insurance);
    feeBreakdown.push({ name: 'Insurance', amount: amt });
    totalFees += amt;
  }

  return { gross: earnings, totalFees, net: earnings - totalFees, feeBreakdown };
}


// ─── 65. Price Trend Display ────────────────────────────────────────────────

/**
 * Render a CSS-only sparkline bar chart for a commodity's fake 7-day price trend.
 * @param {string} commodity — commodity name
 * @returns {string} HTML string
 */
export function renderPriceTrend(commodity) {
  // Deterministic pseudo-random based on commodity name
  const seed = commodity.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 5 + (seed % 20);
  const points = [];
  for (let i = 0; i < 7; i++) {
    const noise = ((seed * (i + 1) * 7) % 11) - 5;
    points.push(Math.max(1, base + noise));
  }
  const max = Math.max(...points);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const bars = points.map((v, i) => {
    const h = Math.round((v / max) * 100);
    const trending = i > 0 && points[i] > points[i - 1] ? 'trend-up' : i > 0 && points[i] < points[i - 1] ? 'trend-down' : '';
    return `<div class="spark-col">
      <div class="spark-bar ${trending}" style="height:${h}%"><span class="spark-val">${v.toFixed(1)}</span></div>
      <span class="spark-day">${days[i]}</span>
    </div>`;
  }).join('');

  return `
    <div class="price-trend">
      <div class="price-trend-header">${commodity} — 7-Day Trend (aUEC/SCU)</div>
      <div class="spark-chart">${bars}</div>
    </div>`;
}


// ─── Data Panel ──────────────────────────────────────────────────────────────

/**
 * Render a collapsible data summary panel with top trade routes,
 * mining hotspots, and upcoming events.
 * @returns {string} HTML string
 */
export function renderDataPanel() {
  // Top 5 trade routes by profit_per_scu
  const topRoutes = [...TRADE_ROUTES]
    .sort((a, b) => b.profit_per_scu - a.profit_per_scu)
    .slice(0, 5);

  const routeRows = topRoutes.map(r => `
    <tr>
      <td>${r.commodity}</td>
      <td>${r.from} &rarr; ${r.to}</td>
      <td class="num">${r.profit_per_scu.toFixed(1)}</td>
      <td class="num">${r.estimated_time_min}m</td>
    </tr>`).join('');

  // Top 5 mining spots by avg_yield
  const topSpots = [...MINING_SPOTS]
    .sort((a, b) => b.avg_yield - a.avg_yield)
    .slice(0, 5);

  const spotRows = topSpots.map(s => `
    <div class="hotspot-row">
      <span class="hotspot-name">${s.name}</span>
      <span class="hotspot-ore">${s.ore_type}</span>
      <span class="hotspot-yield">${(s.avg_yield * 100).toFixed(0)}%</span>
      <span class="hotspot-danger danger-${s.danger_level}">${'&#9670;'.repeat(s.danger_level)}</span>
    </div>`).join('');

  // Events
  const eventCards = EVENTS.map(e => `
    <div class="event-card">
      <div class="event-name">${e.name}</div>
      <div class="event-diff">Difficulty: ${'&#9733;'.repeat(e.difficulty)}${'&#9734;'.repeat(5 - e.difficulty)}</div>
      <div class="event-desc">${e.description}</div>
      <div class="event-reward">${e.rewards_description}</div>
    </div>`).join('');

  return `
    <div class="data-panel">
      <details class="data-section" open>
        <summary class="data-section-title">Top Trade Routes</summary>
        <table class="data-table">
          <thead><tr><th>Commodity</th><th>Route</th><th>Profit/SCU</th><th>Time</th></tr></thead>
          <tbody>${routeRows}</tbody>
        </table>
      </details>

      <details class="data-section" open>
        <summary class="data-section-title">Mining Hotspots</summary>
        <div class="hotspot-list">${spotRows}</div>
      </details>

      <details class="data-section">
        <summary class="data-section-title">Dynamic Events</summary>
        <div class="event-grid">${eventCards}</div>
      </details>
    </div>`;
}
