/**
 * @file Smart recommendation engine for earning methods.
 * Analyzes ship capabilities, budget, and player preferences to recommend
 * the best money-making strategy.
 * @module lib/advisor
 */

import { getShipById, getAllShips } from '../data/ships.js';
import { methods } from '../data/methods.js';
import { getBestRouteForCargo } from '../data/routes.js';

const CONSISTENCY_MULTIPLIER = {
  'very-consistent': 1.05,
  'consistent': 1.0,
  'variable': 0.9,
  'volatile': 0.8
};

const RISK_ORDER = { low: 0, medium: 1, high: 2 };

// Risk-adjusted multiplier — high risk methods have a chance of total loss
const RISK_ADJUSTMENT = { low: 1.0, medium: 0.92, high: 0.78 };

/**
 * Get all earning methods that are viable for a given ship.
 * @param {object} ship - Ship object from ships.js
 * @returns {object[]} Filtered methods
 */
export function getMethodsForShip(ship) {
  return methods.filter(m => {
    // Combat level check
    if (m.requiresCombat > 0 && ship.combat < m.requiresCombat) return false;
    // Cargo check
    if (m.requiresCargo && ship.cargo <= 0) return false;
    // Mining check — ship needs mining capability OR it's hand mining (mining-gem)
    if (m.requiresMining && ship.mining <= 0 && m.id !== 'mining-gem') return false;
    // Hand mining (mining-gem) works with any ship since you just need to get there
    // Salvage check
    if (m.requiresSalvage && ship.salvage <= 0) return false;
    // ROC check
    if (m.requiresROC && !ship.canROC) return false;
    // Specific ship requirement
    if (m.requiresShipId && !m.requiresShipId.includes(ship.id)) return false;
    return true;
  });
}

/**
 * Generate a detailed explanation for how a method performs with a given ship and budget.
 * @param {object} method
 * @param {object} ship
 * @param {number} budget
 * @returns {object} { effectiveRate, reasoning, confidence, warnings }
 */
export function explainMethod(method, ship, budget) {
  const warnings = [];
  let effectiveRate = method.aUEChr;
  const reasons = [];

  // Cargo scaling
  if (method.requiresCargo && ship.cargo > 0) {
    const cargoResult = getBestRouteForCargo(ship.cargo, budget);
    if (cargoResult) {
      effectiveRate = cargoResult.profitPerHour;
      reasons.push(`Best route: ${cargoResult.route.name} using ${cargoResult.scuUsed}/${ship.cargo} SCU for ${Math.round(cargoResult.profitPerHour).toLocaleString()} aUEC/hr`);
      if (cargoResult.scuUsed < ship.cargo) {
        const pct = Math.round((cargoResult.scuUsed / ship.cargo) * 100);
        warnings.push(`Budget only fills ${pct}% of cargo (${cargoResult.scuUsed}/${ship.cargo} SCU). More capital = higher earnings.`);
      }
    } else {
      effectiveRate = 0;
      warnings.push('Insufficient budget or cargo capacity for any trade route.');
    }
  }

  // Budget check for minimum — apply penalty but don't zero out
  if (budget < method.minBudget && method.minBudget > 0) {
    const budgetRatio = budget / method.minBudget;
    warnings.push(`This method works best with at least ${method.minBudget.toLocaleString()} aUEC. You have ${budget.toLocaleString()}.`);
    // Scale rate by how close to minimum budget — still viable but less efficient
    effectiveRate = effectiveRate * Math.max(0.3, budgetRatio);
    reasons.push(`Reduced efficiency due to limited budget (${Math.round(budgetRatio * 100)}% of recommended).`);
  }

  // Ship is in bestWith list — bonus reasoning
  if (method.bestWith && method.bestWith.includes(ship.id)) {
    reasons.push(`${ship.name} is one of the best ships for this method.`);
  }

  // Consistency
  const consistencyMult = CONSISTENCY_MULTIPLIER[method.consistency] || 1.0;
  if (method.consistency === 'volatile') {
    reasons.push('Volatile income — actual earnings may vary significantly session to session.');
  } else if (method.consistency === 'very-consistent') {
    reasons.push('Very consistent earnings — low variance between sessions.');
  }

  // Risk-adjusted rate accounts for loss probability (e.g. cargo piracy, scan penalties)
  const riskAdj = RISK_ADJUSTMENT[method.risk] || 1.0;
  const riskAdjustedRate = Math.round(effectiveRate * riskAdj);

  return {
    effectiveRate: Math.round(effectiveRate),
    riskAdjustedRate,
    consistencyMult,
    reasoning: reasons.join(' '),
    confidence: method.confidence,
    warnings
  };
}

/**
 * Get the best earning recommendation for a player's situation.
 * @param {string} shipId - Current ship ID
 * @param {number} budget - Available aUEC
 * @param {object} [options]
 * @param {boolean} [options.solo=true] - Solo play only
 * @param {string} [options.riskTolerance='medium'] - 'low'|'medium'|'high'
 * @param {string} [options.skillLevel='beginner'] - 'beginner'|'intermediate'|'advanced'
 * @param {number} [options.sessionLength=2] - Play session in hours
 * @returns {object} { best, alternatives, warnings, assumptions }
 */
export function getRecommendation(shipId, budget, options = {}) {
  const {
    solo = true,
    riskTolerance = 'medium',
    skillLevel = 'beginner',
    sessionLength = 2
  } = options;

  const ship = getShipById(shipId);
  if (!ship) {
    return {
      best: null,
      alternatives: [],
      warnings: ['Ship not found in database.'],
      assumptions: []
    };
  }

  const SKILL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };
  const playerSkill = SKILL_ORDER[skillLevel] ?? 0;
  const maxRisk = RISK_ORDER[riskTolerance] ?? 1;

  // Get viable methods for this ship
  let viable = getMethodsForShip(ship);

  // Filter by solo preference
  if (solo) {
    viable = viable.filter(m => m.soloFriendly);
  }

  // Filter by risk tolerance
  viable = viable.filter(m => RISK_ORDER[m.risk] <= maxRisk);

  // Filter by skill level
  viable = viable.filter(m => SKILL_ORDER[m.skillLevel] <= playerSkill);

  const globalWarnings = [];
  const assumptions = [];

  if (viable.length === 0) {
    globalWarnings.push('No earning methods match your current filters. Try relaxing risk tolerance or skill level.');
    return { best: null, alternatives: [], warnings: globalWarnings, assumptions };
  }

  // Score each method
  const scored = viable.map(method => {
    const explained = explainMethod(method, ship, budget);
    let { effectiveRate } = explained;

    // Apply session length overhead (setup time reduces effective hourly rate)
    const setupHours = method.setupTime / 60;
    if (sessionLength > 0) {
      effectiveRate = effectiveRate * (sessionLength / (sessionLength + setupHours));
    }

    // Apply consistency multiplier (once, here in scoring — not in explainMethod)
    effectiveRate = effectiveRate * (explained.consistencyMult || 1.0);

    const reasoning = _buildReasoning(method, ship, effectiveRate, explained, sessionLength);

    return {
      method,
      effectiveRate: Math.round(effectiveRate),
      reasoning,
      confidence: method.confidence,
      warnings: explained.warnings
    };
  });

  // Sort by effective rate descending
  scored.sort((a, b) => b.effectiveRate - a.effectiveRate);

  // Remove methods with 0 effective rate
  const validScored = scored.filter(s => s.effectiveRate > 0);

  if (validScored.length === 0) {
    globalWarnings.push('All viable methods have zero effective earnings with your current budget and ship.');
    return { best: null, alternatives: [], warnings: globalWarnings, assumptions };
  }

  const best = validScored[0];
  const alternatives = validScored.slice(1, 4); // top 3 alternatives

  // Collect warnings from best method
  if (best.warnings) {
    globalWarnings.push(...best.warnings);
  }

  // Generate assumptions
  assumptions.push('Assumes average luck on spawns and NPC difficulty.');
  assumptions.push('Assumes no PvP interference or server issues.');
  if (best.method.requiresCargo) {
    assumptions.push('Cargo prices may fluctuate — check in-game before committing.');
  }
  if (best.method.requiresMining) {
    assumptions.push('Mining yields depend on rock scanning luck.');
  }
  if (sessionLength < 1) {
    assumptions.push('Very short sessions lose more time to setup overhead.');
  }

  return {
    best: {
      method: best.method,
      effectiveRate: best.effectiveRate,
      reasoning: best.reasoning,
      confidence: best.confidence,
      warnings: best.warnings
    },
    alternatives,
    warnings: globalWarnings,
    assumptions
  };
}

/**
 * Build a human-readable reasoning string.
 * @private
 */
function _buildReasoning(method, ship, effectiveRate, explained, sessionLength) {
  const parts = [];

  parts.push(`${method.name} earns an estimated ${Math.round(effectiveRate).toLocaleString()} aUEC/hr with your ${ship.name}.`);

  if (method.bestWith && method.bestWith.includes(ship.id)) {
    parts.push(`Your ship is ideal for this activity.`);
  }

  if (method.setupTime > 10) {
    parts.push(`Includes ~${method.setupTime} min setup time per session.`);
  }

  if (method.consistency === 'volatile') {
    parts.push(`Warning: earnings are volatile — expect significant variation.`);
  } else if (method.consistency === 'very-consistent') {
    parts.push(`Earnings are very predictable session to session.`);
  }

  if (sessionLength < 1 && method.setupTime > 5) {
    parts.push(`Short sessions are less efficient due to setup overhead.`);
  }

  if (explained.reasoning) {
    parts.push(explained.reasoning);
  }

  return parts.join(' ');
}

/**
 * Find the best next ship upgrade based on earnings improvement and break-even time.
 * @param {string} currentShipId
 * @param {number} budget
 * @param {object} [options] - advisor options
 * @returns {object|null} { ship, currentRate, newRate, cost, breakEvenHrs, payoffRatio }
 */
export function getNextBestUpgrade(currentShipId, budget, options = {}) {
  const currentShip = getShipById(currentShipId);
  if (!currentShip) return null;

  const currentRec = getRecommendation(currentShipId, budget, options);
  const currentRate = currentRec.best?.effectiveRate || 0;

  const allShips = getAllShips();
  let best = null;
  let bestScore = 0;

  for (const s of allShips) {
    if (s.id === currentShipId || s.price <= currentShip.price) continue;
    const cost = s.price - budget;
    if (cost <= 0) continue; // can already afford — should just buy it

    const rec = getRecommendation(s.id, 0, options);
    const newRate = rec.best?.effectiveRate || 0;
    if (newRate <= currentRate * 1.1) continue; // needs 10%+ improvement

    const rateGain = newRate - currentRate;
    const breakEvenHrs = rateGain > 0 ? cost / rateGain : Infinity;
    // Score: prefer upgrades that pay for themselves quickly
    const score = rateGain / Math.max(1, breakEvenHrs);

    if (score > bestScore) {
      bestScore = score;
      best = {
        ship: s,
        currentRate,
        newRate,
        cost,
        breakEvenHrs: Math.round(breakEvenHrs * 10) / 10,
        payoffRatio: +(newRate / currentRate).toFixed(2)
      };
    }
  }

  return best;
}

/**
 * Build optimal session plan — mix methods for maximum earnings in a given time.
 * @param {string} shipId
 * @param {number} budget
 * @param {number} sessionHours
 * @param {object} [options]
 * @returns {object} { activities[], totalEarnings, riskAdjustedEarnings }
 */
export function getSessionPlan(shipId, budget, sessionHours, options = {}) {
  const ship = getShipById(shipId);
  if (!ship) return { activities: [], totalEarnings: 0, riskAdjustedEarnings: 0 };

  const rec = getRecommendation(shipId, budget, options);
  const allScored = rec.best
    ? [rec.best, ...rec.alternatives]
    : [];

  if (allScored.length === 0) {
    return { activities: [], totalEarnings: 0, riskAdjustedEarnings: 0 };
  }

  // For short sessions (< 2hr): just do best method
  if (sessionHours < 2 || allScored.length < 2) {
    const m = allScored[0];
    const earn = m.effectiveRate * sessionHours;
    const riskAdj = RISK_ADJUSTMENT[m.method.risk] || 1.0;
    return {
      activities: [{ method: m.method.name, hours: sessionHours, earnings: Math.round(earn), category: m.method.category }],
      totalEarnings: Math.round(earn),
      riskAdjustedEarnings: Math.round(earn * riskAdj)
    };
  }

  // For longer sessions: suggest mixing top 2 methods (variety + stock depletion)
  const primary = allScored[0];
  const secondary = allScored[1];
  const primaryHrs = Math.round(sessionHours * 0.65 * 10) / 10;
  const secondaryHrs = +(sessionHours - primaryHrs).toFixed(1);
  const primaryEarn = primary.effectiveRate * primaryHrs;
  const secondaryEarn = secondary.effectiveRate * secondaryHrs;
  const total = Math.round(primaryEarn + secondaryEarn);
  const riskAdj1 = RISK_ADJUSTMENT[primary.method.risk] || 1.0;
  const riskAdj2 = RISK_ADJUSTMENT[secondary.method.risk] || 1.0;
  const riskTotal = Math.round(primaryEarn * riskAdj1 + secondaryEarn * riskAdj2);

  return {
    activities: [
      { method: primary.method.name, hours: primaryHrs, earnings: Math.round(primaryEarn), category: primary.method.category },
      { method: secondary.method.name, hours: secondaryHrs, earnings: Math.round(secondaryEarn), category: secondary.method.category }
    ],
    totalEarnings: total,
    riskAdjustedEarnings: riskTotal
  };
}
