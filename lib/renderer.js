/**
 * @file HTML string template helpers for the Star Citizen money planner UI.
 * All functions return HTML strings (not DOM elements).
 * @module lib/renderer
 */

import { riskColor, riskDot, fmtK, fmtRange } from './utils.js';

/**
 * Render a small pill/badge.
 * @param {string} text
 * @param {string} [variant='default'] - 'default'|'cyan'|'amber'|'green'|'red'
 * @returns {string} HTML
 */
export function renderPill(text, variant = 'default') {
  return `<span class="pill pill--${variant}">${text}</span>`;
}

/**
 * Render a risk badge with color coding.
 * @param {string} risk - 'low'|'medium'|'high'
 * @returns {string} HTML
 */
export function renderRiskBadge(risk) {
  const variant = risk === 'high' ? 'red' : risk === 'medium' ? 'amber' : 'green';
  const label = risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk';
  return renderPill(label, variant);
}

/**
 * Render a stat block with label, value, and optional sub-text.
 * @param {string} label
 * @param {string} value
 * @param {string} [sub]
 * @returns {string} HTML
 */
export function renderStatBlock(label, value, sub) {
  return `<div class="stat-block">
  <span class="stat-block__label">${label}</span>
  <span class="stat-block__value">${value}</span>
  ${sub ? `<span class="stat-block__sub">${sub}</span>` : ''}
</div>`;
}

/**
 * Render a progress bar.
 * @param {number} current
 * @param {number} total
 * @param {string} [label]
 * @returns {string} HTML
 */
export function renderProgressBar(current, total, label) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return `<div class="progress-bar">
  ${label ? `<span class="progress-bar__label">${label}</span>` : ''}
  <div class="progress-bar__track">
    <div class="progress-bar__fill" style="width:${pct}%"></div>
  </div>
  <span class="progress-bar__pct">${pct}%</span>
</div>`;
}

/**
 * Render an action button.
 * @param {string} text
 * @param {string} [cls] - Additional CSS class
 * @param {string} [onclick] - data-action attribute value
 * @returns {string} HTML
 */
export function renderActionButton(text, cls, onclick) {
  const classes = ['btn', cls].filter(Boolean).join(' ');
  const action = onclick ? ` data-action="${onclick}"` : '';
  return `<button class="${classes}"${action}>${text}</button>`;
}

/**
 * Render a card wrapper with chamfered corners.
 * @param {string} headerHtml
 * @param {string} bodyHtml
 * @param {string} [footerHtml]
 * @returns {string} HTML
 */
export function renderCard(headerHtml, bodyHtml, footerHtml) {
  return `<div class="card">
  <div class="card__header">${headerHtml}</div>
  <div class="card__body">${bodyHtml}</div>
  ${footerHtml ? `<div class="card__footer">${footerHtml}</div>` : ''}
</div>`;
}

/**
 * Render a compact method row for lists.
 * @param {object} method - Method object from methods.js
 * @param {number} effectiveRate - Calculated effective aUEC/hr
 * @param {string} [reasoning] - Why this method is ranked here
 * @returns {string} HTML
 */
export function renderMethodRow(method, effectiveRate, reasoning) {
  const riskBadge = renderRiskBadge(method.risk);
  const confDot = renderConfidenceDot(method.confidence);
  return `<div class="method-row">
  <div class="method-row__header">
    <span class="method-row__name">${method.name}</span>
    <span class="method-row__rate">${fmtK(effectiveRate)} aUEC/hr</span>
  </div>
  <div class="method-row__meta">
    ${riskBadge}
    ${confDot}
    ${renderPill(method.category, 'cyan')}
    ${renderPill(method.skillLevel, 'default')}
  </div>
  ${reasoning ? `<div class="method-row__reasoning">${reasoning}</div>` : ''}
</div>`;
}

/**
 * Render a confidence indicator dot.
 * @param {string} confidence - 'high'|'medium'|'low'
 * @returns {string} HTML
 */
export function renderConfidenceDot(confidence) {
  const color = confidence === 'high' ? 'var(--green)' : confidence === 'medium' ? 'var(--amber)' : 'var(--red)';
  const title = `Data confidence: ${confidence}`;
  return `<span class="confidence-dot" style="background:${color}" title="${title}"></span>`;
}

/**
 * Render a freshness badge showing data confidence and optional verification date.
 * @param {string} confidence - 'verified'|'estimated'|'unknown'
 * @param {string} [lastVerified] - Human-readable date string
 * @returns {string} HTML
 */
export function renderFreshnessBadge(confidence, lastVerified) {
  const colors = { verified: 'var(--green)', estimated: 'var(--amber)', unknown: 'var(--red)' };
  const labels = { verified: 'Verified', estimated: 'Estimated', unknown: 'Unverified' };
  const color = colors[confidence] || colors.unknown;
  const label = labels[confidence] || 'Unknown';
  return `<span class="freshness-badge" style="color:${color}">
    <span class="dot" style="background:${color}"></span>${label}${lastVerified ? ` · ${lastVerified}` : ''}
  </span>`;
}

/**
 * Render a warning block.
 * @param {string} text
 * @returns {string} HTML
 */
export function renderWarning(text) {
  return `<div class="warning-block">
  <span class="warning-block__icon">!</span>
  <span class="warning-block__text">${text}</span>
</div>`;
}

/**
 * Render an assumption note.
 * @param {string} text
 * @returns {string} HTML
 */
export function renderAssumption(text) {
  return `<div class="assumption-text">
  <span class="assumption-text__icon">*</span>
  <span class="assumption-text__text">${text}</span>
</div>`;
}

/**
 * Render a compact method row for dense lists.
 * @param {object} method
 * @param {number} effectiveRate
 * @returns {string} HTML
 */
export function renderCompactMethodRow(method, effectiveRate) {
  return `<div class="compact-row method-row" data-method="${method.id}">
    <span class="cr-name"><span class="cat-dot cat-dot--${method.category}"></span>${method.name}</span>
    <span class="cr-rate">${fmtK(effectiveRate)}/hr</span>
    <span class="cr-risk">${riskDot(method.risk)}</span>
  </div>`;
}

/**
 * Render a compact ship row for dense lists.
 * @param {object} ship
 * @returns {string} HTML
 */
export function renderCompactShipRow(ship) {
  return `<div class="compact-row ship-row" data-ship="${ship.id}">
    <span class="cr-name">${ship.name}</span>
    <span class="cr-mfr">${ship.mfr}</span>
    <span class="cr-role">${ship.role}</span>
    <span class="cr-price">${fmtK(ship.price)} aUEC</span>
  </div>`;
}

/**
 * Render a mini stat label/value pair.
 * @param {string} label
 * @param {string|number} value
 * @returns {string} HTML
 */
export function renderMiniStat(label, value) {
  return `<div class="mini-stat"><span class="ms-label">${label}</span><span class="ms-value">${value}</span></div>`;
}

/**
 * Render a full method execution guide for modal display.
 * @param {object} method
 * @param {object} ship
 * @param {number} budget
 * @returns {string} HTML
 */
export function renderMethodModal(method, ship, budget) {
  const m = method;
  let html = `<div class="method-guide">`;
  html += `<div class="mg-header">`;
  html += `<h2 class="mg-title">${m.name}</h2>`;
  html += `<div class="mg-meta">${renderRiskBadge(m.risk)} ${renderFreshnessBadge(m.confidence)}</div>`;
  html += `</div>`;
  html += `<p class="mg-desc">${m.desc}</p>`;
  html += `<div class="mg-stats">`;
  html += renderMiniStat('Income Range', fmtRange(m.aUEChrLow, m.aUEChrHigh) + '/hr');
  html += renderMiniStat('Setup Time', m.setupTime + ' min');
  html += renderMiniStat('Consistency', m.consistency);
  html += renderMiniStat('Skill Level', m.skillLevel);
  html += `</div>`;

  if (m.steps && m.steps.length) {
    html += `<div class="mg-section"><h3>Execution Steps</h3><ol class="mg-steps">`;
    m.steps.forEach(s => html += `<li>${s}</li>`);
    html += `</ol></div>`;
  }

  if (m.locations && m.locations.length) {
    html += `<div class="mg-section"><h3>Locations</h3><div class="mg-pills">`;
    m.locations.forEach(l => html += renderPill(l, 'default'));
    html += `</div></div>`;
  }

  if (m.gear && m.gear.length) {
    html += `<div class="mg-section"><h3>Gear & Equipment</h3><ul class="mg-list">`;
    m.gear.forEach(g => html += `<li>${g}</li>`);
    html += `</ul></div>`;
  }

  if (m.risks && m.risks.length) {
    html += `<div class="mg-section"><h3>Risk Factors</h3><ul class="mg-risks">`;
    m.risks.forEach(r => html += `<li>${r}</li>`);
    html += `</ul></div>`;
  }

  if (m.beginnerTips && m.beginnerTips.length) {
    html += `<div class="mg-section"><h3>Beginner Tips</h3><ul class="mg-list">`;
    m.beginnerTips.forEach(t => html += `<li>${t}</li>`);
    html += `</ul></div>`;
  }

  if (m.patchNotes) {
    html += `<div class="mg-section"><h3>Patch Status</h3><p class="mg-patch">${m.patchNotes}</p></div>`;
  }

  html += `</div>`;
  return html;
}
