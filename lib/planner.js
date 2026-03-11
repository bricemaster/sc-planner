/**
 * @file Progression planner — calculates optimal upgrade paths to goal ships.
 * @module lib/planner
 */

import { getAllShips, getShipById } from '../data/ships.js';
import { getRecommendation } from './advisor.js';

/**
 * Simple direct grind calculation — how long to earn enough for the goal ship.
 * @param {object} currentShip - Current ship object
 * @param {object} goalShip - Target ship object
 * @param {object} bestMethod - Best method result from advisor (needs .effectiveRate)
 * @param {number} budget - Current aUEC balance
 * @returns {object} { hoursNeeded, earnings, deficit }
 */
export function planDirect(currentShip, goalShip, bestMethod, budget) {
  const deficit = Math.max(0, goalShip.price - budget);
  const rate = bestMethod?.effectiveRate || 0;
  const hoursNeeded = rate > 0 ? deficit / rate : Infinity;

  return {
    hoursNeeded: Math.round(hoursNeeded * 10) / 10,
    earnings: rate,
    deficit
  };
}

/**
 * Find an optimal upgrade path with intermediate ships that accelerate earnings.
 * @param {string} currentShipId - Current ship ID
 * @param {string} goalShipId - Goal ship ID
 * @param {number} budget - Current aUEC
 * @param {object} [options]
 * @param {boolean} [options.solo=true]
 * @param {string} [options.riskTolerance='medium']
 * @param {string} [options.skillLevel='beginner']
 * @param {number} [options.sessionLength=2]
 * @returns {object} { steps, totalTime, directTime, savings, verdict, assumptions }
 */
export function planWithUpgrades(currentShipId, goalShipId, budget, options = {}) {
  const {
    solo = true,
    riskTolerance = 'medium',
    skillLevel = 'beginner',
    sessionLength = 2
  } = options;

  const currentShip = getShipById(currentShipId);
  const goalShip = getShipById(goalShipId);

  if (!currentShip || !goalShip) {
    return {
      steps: [],
      totalTime: Infinity,
      directTime: Infinity,
      savings: 0,
      verdict: 'Could not find one or both ships in the database.',
      assumptions: []
    };
  }

  if (goalShip.price <= budget) {
    return {
      steps: [],
      totalTime: 0,
      directTime: 0,
      savings: 0,
      verdict: 'You already have enough aUEC to buy the goal ship!',
      assumptions: []
    };
  }

  const advisorOpts = { solo, riskTolerance, skillLevel, sessionLength };

  // --- Direct path ---
  const directRec = getRecommendation(currentShipId, budget, advisorOpts);
  const directRate = directRec.best?.effectiveRate || 0;
  const directDeficit = goalShip.price - budget;
  const directTime = directRate > 0 ? directDeficit / directRate : Infinity;

  // --- Find candidate intermediate ships ---
  const allShips = getAllShips();
  const candidates = allShips.filter(s => {
    return s.price > currentShip.price
      && s.price < goalShip.price
      && s.price - budget > 0  // we can't already afford it (wait, we want affordable ones too)
      && s.id !== currentShipId
      && s.id !== goalShipId;
  }).sort((a, b) => a.price - b.price);

  // Greedy upgrade path — try adding up to 3 intermediate upgrades
  const MAX_UPGRADES = 3;
  let bestPath = { steps: [], totalTime: directTime };

  // Try all single intermediate ships first, then build paths greedily
  _findBestPath(
    currentShipId,
    goalShipId,
    budget,
    directRate,
    candidates,
    advisorOpts,
    [],
    0,
    MAX_UPGRADES,
    bestPath
  );

  const savings = directTime - bestPath.totalTime;
  const steps = bestPath.steps;

  // Build verdict
  let verdict;
  if (steps.length === 0 || savings < 0.5) {
    verdict = `Grinding directly with your ${currentShip.name} is the fastest path. No intermediate upgrades are worth the detour.`;
  } else {
    const shipNames = steps.map(s => s.shipName).join(' → ');
    verdict = `Upgrading through ${shipNames} saves ~${Math.round(savings)} hours vs grinding directly with your ${currentShip.name}.`;
  }

  const assumptions = [
    'Assumes you sell or keep your old ship (no trade-in value calculated).',
    'Earning rates may change as you gain experience and reputation.',
    'Ship prices are approximate and may vary by location.'
  ];

  return {
    steps: steps.length > 0 ? steps : [],
    totalTime: Math.round(bestPath.totalTime * 10) / 10,
    directTime: Math.round(directTime * 10) / 10,
    savings: Math.round(Math.max(0, savings) * 10) / 10,
    verdict,
    assumptions
  };
}

/**
 * Recursive greedy path finder.
 * @private
 */
function _findBestPath(currentShipId, goalShipId, budget, currentRate, candidates, advisorOpts, currentSteps, currentTimeSpent, remainingUpgrades, bestPath) {
  const goalShip = getShipById(goalShipId);

  // Calculate time from current position to goal directly
  const deficit = goalShip.price - budget;
  const timeToGoal = currentRate > 0 ? deficit / currentRate : Infinity;
  const totalTime = currentTimeSpent + timeToGoal;

  // If this path is already worse than our best, prune
  if (totalTime >= bestPath.totalTime) return;

  // This is a better direct path from current position
  if (currentSteps.length > 0) {
    bestPath.totalTime = totalTime;
    bestPath.steps = [...currentSteps];
  }

  if (remainingUpgrades <= 0) return;

  // Try each candidate as next upgrade
  for (const candidate of candidates) {
    const costToCandidate = candidate.price - budget;
    if (costToCandidate <= 0) continue; // Can already afford — skip (should buy immediately if beneficial)
    if (currentRate <= 0) continue;

    const timeToCandidate = costToCandidate / currentRate;
    const newTimeSpent = currentTimeSpent + timeToCandidate;

    // Get new earning rate with candidate ship
    const newRec = getRecommendation(candidate.id, 0, advisorOpts); // budget 0 after buying ship
    const newRate = newRec.best?.effectiveRate || 0;

    // Only consider if rate improves by 25%+
    if (newRate < currentRate * 1.25) continue;

    // Break-even calculation
    const breakEvenHours = costToCandidate / (newRate - currentRate);

    const step = {
      shipName: candidate.name,
      shipId: candidate.id,
      cost: candidate.price,
      timeToReach: Math.round(timeToCandidate * 10) / 10,
      newRate: newRate,
      oldRate: currentRate,
      reasoning: `${candidate.name} increases earnings from ${Math.round(currentRate).toLocaleString()} to ${Math.round(newRate).toLocaleString()} aUEC/hr.`,
      breakEvenHours: Math.round(breakEvenHours * 10) / 10
    };

    // Filter remaining candidates (only ships more expensive than this one)
    const remainingCandidates = candidates.filter(c => c.price > candidate.price);

    _findBestPath(
      candidate.id,
      goalShipId,
      0, // spent all money on the ship
      newRate,
      remainingCandidates,
      advisorOpts,
      [...currentSteps, step],
      newTimeSpent,
      remainingUpgrades - 1,
      bestPath
    );
  }
}
