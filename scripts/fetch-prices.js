#!/usr/bin/env node
/**
 * Daily price snapshot fetcher.
 * Run via cron (GitHub Actions or local) to keep static fallback prices fresh.
 *
 * Usage: node scripts/fetch-prices.js
 * Output: data/prices-snapshot.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://uexcorp.space/api/2.0/commodities_prices_all';
const OUTPUT = path.join(__dirname, '..', 'data', 'prices-snapshot.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function main() {
  console.log('Fetching commodity prices from UEX Corp...');

  try {
    const raw = await fetch(API_URL);
    const json = JSON.parse(raw);

    if (!json.data || !Array.isArray(json.data)) {
      throw new Error('Unexpected API response format');
    }

    // Extract and deduplicate commodities
    const commodities = {};
    for (const entry of json.data) {
      const name = entry.commodity_name || entry.name;
      if (!name) continue;
      if (!commodities[name]) {
        commodities[name] = {
          name,
          buyAvg: entry.price_buy || entry.buy_price || 0,
          sellAvg: entry.price_sell || entry.sell_price || 0,
        };
      }
    }

    const snapshot = {
      timestamp: new Date().toISOString(),
      fetchedAt: Date.now(),
      source: 'uex-api',
      patchVersion: '4.6',
      commodityCount: Object.keys(commodities).length,
      commodities: Object.values(commodities)
    };

    fs.writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2));
    console.log(`Wrote ${snapshot.commodityCount} commodities to ${OUTPUT}`);
    console.log(`Timestamp: ${snapshot.timestamp}`);
  } catch (e) {
    console.error('Failed to fetch prices:', e.message);
    process.exit(1);
  }
}

main();
