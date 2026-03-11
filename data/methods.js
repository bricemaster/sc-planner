/**
 * @file Earning methods database for Star Citizen Alpha 4.6.0 money planner.
 * Rates are based on community averages and personal testing as of patch 4.6 (Jan 2026).
 * @module data/methods
 */

export const methods = [
  {
    id: 'combat-gauntlet',
    name: 'Combat Gauntlet Scenario 6',
    category: 'combat',
    aUEChr: 1200000,
    aUEChrLow: 800000,
    aUEChrHigh: 2500000,
    risk: 'medium',
    minBudget: 160000,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 2,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Chain Combat Gauntlet Scenario 6 missions for the best aUEC/hr in the game right now. Rent a Constellation Taurus at New Babbage for 160k/day and run missions back to back.',
    tips: [
      'Each mission pays roughly 151,000 aUEC and takes 6-7 minutes to complete.',
      'Chain 8-10 missions per hour for peak income.',
      'Rent a Constellation Taurus at New Babbage if you do not own one — 160k/day is nothing compared to the returns.'
    ],
    confidence: 'high',
    overhead: 'Rent or spawn a Constellation Taurus. Accept Gauntlet Scenario 6 contracts.',
    setupTime: 10,
    consistency: 'consistent',
    bestWith: ['constellation-taurus', 'constellation-andromeda'],
    explanation: 'Each Scenario 6 mission pays ~151k and completes in 6-7 minutes. Chaining 8-10 per hour yields 1.2M+ average. High-end assumes fast completions with minimal downtime.',
    steps: [
      'Head to New Babbage and rent a Constellation Taurus for 160k/day if you do not own one.',
      'Open the Contract Manager and accept a Combat Gauntlet Scenario 6 mission.',
      'Quantum travel to the mission marker and engage hostile waves.',
      'Use the Taurus turrets and firepower to clear all waves as quickly as possible.',
      'Collect the ~151k payout and immediately accept the next Scenario 6 mission.',
      'Chain 8-10 missions per hour for maximum income.'
    ],
    locations: ['New Babbage (ship rental)', 'Stanton system (mission locations)', 'Crusader vicinity (common spawn area)'],
    gear: ['Constellation Taurus or Andromeda (rent for 160k/day at New Babbage)', 'Upgraded weapons and shields recommended', 'Medpens for emergencies'],
    reputation: 'Requires some combat reputation to access Scenario 6 contracts.',
    loadout: 'Constellation Taurus with upgraded weapons. Andromeda also works well with its extra turret.',
    beginnerTips: [
      'Practice with lower Gauntlet scenarios before attempting Scenario 6.',
      'The Taurus rental pays for itself in a single mission completion.',
      'Stay mobile during waves — the Constellation is tough but not invincible.',
      'If you die, the rental cost is minimal compared to the earning potential.'
    ],
    advancedTips: [
      'Optimize your quantum route between missions to minimize travel time.',
      'Pre-accept the next mission before finishing the current one if possible.',
      'Learn wave spawn patterns to position yourself optimally before each wave.',
      'Overclock weapons for faster wave clears.'
    ],
    risks: [
      'Ship destruction during a mission means lost time on respawn and claim.',
      'Rental cost of 160k/day is lost if you do not run enough missions to cover it.',
      'Other players may contest mission areas.',
      'Requires decent piloting skill — waves hit hard if you are not maneuvering.'
    ],
    patchNotes: '4.6 — Combat Gauntlet Scenario 6 is currently the best money-maker in the game. Payouts at ~151k per mission with 6-7 minute completions.',
    avoidIf: [
      'You are new to ship combat — the waves can be challenging.',
      'You cannot afford the 160k rental fee to get started.',
      'You prefer non-combat gameplay loops.',
      'You find repetitive mission chaining boring.'
    ]
  },
  {
    id: 'salvage-contracts',
    name: 'Unverified Salvage Contracts',
    category: 'salvage',
    aUEChr: 1500000,
    aUEChrLow: 1000000,
    aUEChrHigh: 2000000,
    risk: 'medium',
    minBudget: 0,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: 'A crew can strip wrecks faster and carry more cargo.',
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: true,
    requiresROC: false,
    desc: 'Chain unverified salvage mission contracts for massive income. Loot cargo from salvage wreck missions for the highest salvage income in the game.',
    tips: [
      'Focus on looting high-value cargo from wreck missions rather than just scraping hull.',
      'Chain contracts back to back for maximum income.',
      'The Vulture is the most efficient solo ship for this method.'
    ],
    confidence: 'high',
    overhead: 'Accept salvage contracts and fly to wreck locations.',
    setupTime: 10,
    consistency: 'consistent',
    bestWith: ['vulture', 'reclaimer'],
    explanation: 'Chaining unverified salvage contracts and looting the cargo yields enormous returns. Each wreck can contain high-value cargo worth hundreds of thousands. Average assumes efficient chaining.',
    steps: [
      'Open the Contract Manager and accept unverified salvage contracts.',
      'Fly to the wreck location in your salvage ship.',
      'Loot all high-value cargo from the wreck site before scraping hull material.',
      'Use tractor beam to move cargo efficiently to your ship.',
      'Sell cargo and RMC at the nearest trade terminal.',
      'Immediately accept the next salvage contract and repeat.'
    ],
    locations: ['Stanton system (contract locations vary)', 'Crusader (Yela vicinity — common wreck spawns)', 'Hurston (debris fields)', 'Pyro (higher-value wrecks in lawless space)'],
    gear: ['Vulture or Reclaimer salvage ship', 'Tractor beam multitool', 'EVA-capable suit'],
    reputation: 'Some salvage reputation may be needed for higher-paying contracts.',
    loadout: 'Vulture for solo efficiency. Reclaimer for group operations. Argo MOTH for quick salvage runs.',
    beginnerTips: [
      'Start with basic hull salvage to learn wreck locations and mechanics.',
      'Always check wreck interiors for lootable cargo containers.',
      'Sell at major landing zones for best prices on cargo.',
      'The Vulture is affordable and effective for this method.'
    ],
    advancedTips: [
      'Prioritize cargo looting over hull scraping — it pays far more per minute.',
      'Chain contracts in the same area to minimize travel time.',
      'Check Pyro for higher-value wreck contracts if you can handle lawless space.',
      'Use an Argo MOTH for rapid cargo extraction from wreck sites.'
    ],
    risks: [
      'Wreck locations can be in hostile space with NPC or player threats.',
      'Cargo value varies between contracts — some wrecks have less valuable loot.',
      'EVA operations leave you vulnerable to ambush.',
      'Server crashes lose all unsold cargo.'
    ],
    patchNotes: '4.6 — Unverified salvage contracts are one of the most profitable methods in the game. Cargo loot tables significantly improved.',
    avoidIf: [
      'You do not own a salvage-capable ship.',
      'You dislike inventory management and cargo hauling.',
      'You want zero-risk income — wreck locations can be contested.',
      'You are not comfortable with EVA gameplay.'
    ]
  },
  {
    id: 'salvage-pyro',
    name: 'Pyro Salvage Runs',
    category: 'salvage',
    aUEChr: 1000000,
    aUEChrLow: 600000,
    aUEChrHigh: 1500000,
    risk: 'medium',
    minBudget: 0,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: 'A wingman can provide security in lawless Pyro space.',
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: true,
    requiresROC: false,
    desc: 'Take a Vulture to Pyro via the jump point and salvage wreck panels for massive RMC income. Pyro wrecks are larger and more plentiful than Stanton.',
    tips: [
      'Scan for wreck panels using 2,000-increment signatures on your scanner.',
      'Each large panel yields roughly 9 SCU of RMC worth ~110k aUEC.',
      'Sell at Ruin Station, Ratsnest, or Last Landing in Pyro.'
    ],
    confidence: 'high',
    overhead: 'Travel to Pyro via jump point. Scan for wreck panels.',
    setupTime: 15,
    consistency: 'consistent',
    bestWith: ['vulture', 'reclaimer'],
    explanation: 'Pyro wreck panels are abundant and large. Each panel scraped yields ~9 SCU RMC at ~110k. A Vulture can scrape multiple panels per hour for ~1M/hr average.',
    steps: [
      'Spawn your Vulture at a station near the Stanton-Pyro jump point.',
      'Travel through the jump point into Pyro system.',
      'Use your scanner to look for 2,000-increment signatures — these indicate wreck panels.',
      'Approach wreck panels and activate your salvage beam to scrape hull material.',
      'Each large panel yields approximately 9 SCU of RMC worth ~110k aUEC.',
      'When your hold is full, sell at Ratsnest, Last Landing, or Ruin Station in Pyro.'
    ],
    locations: ['Pyro system (accessed via Stanton-Pyro jump point)', 'Ratsnest (Pyro sell point)', 'Last Landing (Pyro sell point)', 'Ruin Station (Pyro sell point)'],
    gear: ['Vulture or Reclaimer salvage ship', 'No additional gear required — ship scanner is sufficient'],
    reputation: null,
    loadout: 'Vulture is the solo standard for Pyro salvage. Reclaimer for maximum throughput with a crew.',
    beginnerTips: [
      'Pyro is lawless space — there is no security response if attacked by players.',
      'Learn the jump point route before committing to long salvage sessions.',
      'Start by selling at the nearest Pyro station until you learn the system layout.',
      'The 2,000-increment scanner signatures are your key indicator for wreck panels.'
    ],
    advancedTips: [
      'Map efficient wreck panel routes in Pyro for maximum panels per hour.',
      'The Reclaimer with crew can strip panels significantly faster.',
      'Combine Pyro salvage with cross-system hauling — sell RMC in Stanton for potentially better prices.',
      'Fly with an escort if Pyro PvP activity is high.'
    ],
    risks: [
      'Pyro is lawless — PvP attacks have no security response.',
      'The jump point travel adds overhead time to each session.',
      'If destroyed in Pyro, respawn may be far from your salvage area.',
      'Market prices at Pyro stations may fluctuate.'
    ],
    patchNotes: '4.6 — Pyro salvage is massively buffed. Vulture salvaging in Pyro can earn ~1M/hr consistently. Wreck panel spawns are abundant.',
    avoidIf: [
      'You are not comfortable operating in lawless PvP space.',
      'You do not own a Vulture or Reclaimer.',
      'You want zero-risk income — Pyro has no law enforcement.',
      'You dislike the travel time to reach Pyro via the jump point.'
    ]
  },
  {
    id: 'group-ert',
    name: 'Group ERT Bounties',
    category: 'combat',
    aUEChr: 800000,
    aUEChrLow: 800000,
    aUEChrHigh: 1500000,
    risk: 'high',
    minBudget: 0,
    skillLevel: 'advanced',
    soloFriendly: false,
    groupBonus: 'Splitting group ERT payouts still yields more per person than solo VHRT due to speed of completion.',
    requiresShipId: null,
    requiresCombat: 3,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Tackle Extreme Risk Target bounties with a coordinated group. ERT payouts have increased significantly in 4.6 with missions paying 60-90k each.',
    tips: [
      'Designate a tank (Redeemer/Hammerhead) and DPS ships.',
      'Focus fire the capital ship shields first, then engines.',
      'Keep comms clear and call out missile locks.',
      'ERT payouts are now 60-90k per mission — chain them fast for huge income.'
    ],
    confidence: 'medium',
    overhead: 'Assemble group. Ensure all ships are combat-ready. Coordinate loadouts.',
    setupTime: 15,
    consistency: 'consistent',
    bestWith: ['redeemer', 'hammerhead', 'vanguard-warden', 'hornet-f7c-mkii'],
    explanation: 'ERT bounties pay 60-90k each in 4.6. A coordinated group clears them in 5-8 minutes. 8-12 completions per hour per group with efficient chaining.',
    steps: [
      'Assemble a group of 2-4 combat-capable players with upgraded ships.',
      'Designate roles: tank (Hammerhead/Redeemer), DPS (Vanguards/Hornets), support.',
      'All members accept the ERT bounty contract and Call to Arms.',
      'Quantum to the target together — the tank engages first to draw fire.',
      'DPS ships focus fire the capital ship shields, then target engines and weapons.',
      'After the kill, all members accept the next ERT and repeat.'
    ],
    locations: ['Crusader (Yela — fast ERT spawns)', 'Hurston (near Everus Harbor)', 'microTech (near Clio)', 'ArcCorp (Bajini Point area)', 'Pyro (lawless ERTs — higher risk, higher reward)'],
    gear: ['Fully upgraded combat ships for all group members', 'Military-grade shields, weapons, and powerplants', 'Voice comms (Discord or in-game)'],
    reputation: 'Requires maximum bounty hunter reputation to access ERT contracts.',
    loadout: 'Tank: Hammerhead or Redeemer with full military components. DPS: Vanguard Warden or Hornet F7A-Mk2. All ships must be combat-optimized.',
    beginnerTips: [
      'Do NOT attempt ERTs until you are comfortable with VHRT solo.',
      'Join an org or find experienced players to learn the ERT workflow.',
      'Start as DPS in a Vanguard — it is the most forgiving role.',
      'Stay close to the tank ship and focus fire what they call.'
    ],
    advancedTips: [
      'The Hammerhead can solo-tank ERTs while DPS ships burst down the target.',
      'Chain ERTs near Yela for fastest spawn cycling.',
      'Use a Redeemer as a mobile spawn/repair point between fights.',
      'Coordinate shield-face rotation on the tank to maximize uptime.',
      'Pyro ERTs may have higher payouts but come with PvP risk in lawless space.'
    ],
    risks: [
      'ERT targets (Hammerheads, Idris) have devastating firepower that can one-shot fighters.',
      'Uncoordinated groups wipe frequently — communication is essential.',
      'Ship claim times for large ships are very long — expedite fees add up.',
      'Player pirates may target your group, knowing you are carrying bounty payouts.',
      'Pyro ERTs add PvP risk on top of the PvE challenge.'
    ],
    patchNotes: '4.6 — ERT bounties now pay 60-90k per mission, up from previous patches. Capital ship AI improved. Pyro ERTs available for brave groups.',
    avoidIf: [
      'You do not have a group of experienced combat pilots.',
      'Your ships are not combat-fitted with military-grade components.',
      'You have not reached maximum bounty hunter reputation.',
      'You prefer solo gameplay — ERTs require tight coordination.'
    ]
  },
  {
    id: 'bounty-ert',
    name: 'Solo ERT Bounty Hunting',
    category: 'combat',
    aUEChr: 500000,
    aUEChrLow: 500000,
    aUEChrHigh: 1000000,
    risk: 'high',
    minBudget: 0,
    skillLevel: 'advanced',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 3,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Solo Extreme Risk Target bounties for top-tier solo combat income. ERT payouts increased to 60-90k per mission in 4.6.',
    tips: [
      'Use a Vanguard Warden or Constellation Andromeda for best solo ERT results.',
      'Chain ERTs near Yela for fastest respawn cycling.',
      'Always run Call to Arms alongside for bonus income on every kill.'
    ],
    confidence: 'high',
    overhead: 'Fully upgraded combat ship. Accept ERT contracts.',
    setupTime: 5,
    consistency: 'consistent',
    bestWith: ['vanguard-warden', 'constellation-andromeda', 'hornet-f7c-mkii', 'vanguard-sentinel'],
    explanation: 'ERT bounties pay 60-90k each in 4.6. A skilled solo pilot clears 6-10 per hour in a capable ship. Call to Arms adds bonus income.',
    steps: [
      'Ensure your fighter is fully upgraded with military-grade shields, powerplant, and coolers.',
      'Accept ERT bounty contracts from the Contract Manager.',
      'Also accept the Call to Arms mission for bonus pay on every kill.',
      'Quantum travel to each bounty marker and engage immediately on arrival.',
      'Use pip-lead targeting and manage shield faces against capital ship fire.',
      'After each kill, immediately accept the next ERT to minimize downtime.'
    ],
    locations: ['Crusader (Yela — fast ERT spawns)', 'Hurston (near Everus Harbor)', 'microTech (near Clio)', 'ArcCorp (Bajini Point area)', 'Pyro (lawless — higher risk bounties)'],
    gear: ['Military-grade shields (FR-76 or Sukoran)', 'Military-grade powerplant', 'Military-grade coolers x2', 'Fully upgraded weapon systems'],
    reputation: 'Requires maximum bounty hunter reputation. Must complete all lower bounty tiers first.',
    loadout: 'Vanguard Warden or Constellation Andromeda with full military-grade components. Overclocked weapons for maximum DPS.',
    beginnerTips: [
      'Do NOT attempt solo ERTs until you can clear VHRTs without losing shields.',
      'The Vanguard Warden is the most forgiving solo ERT ship — tough and hits hard.',
      'If you take heavy damage, quantum away and repair before re-engaging.',
      'Learn capital ship weak points to speed up kills.'
    ],
    advancedTips: [
      'Chain ERTs near Yela for fastest spawn cycling between targets.',
      'Use a Vanguard Sentinel for EMP burst capability — stun then burst down.',
      'Overclock weapons and manage heat for maximum DPS output.',
      'Position behind capital ships to avoid their main battery arcs.'
    ],
    risks: [
      'ERT targets (Hammerheads, Idris) can destroy even heavy fighters quickly.',
      'Ship claim times on heavy fighters are long — carry expedite fees.',
      'Solo ERTs demand high skill — mistakes are punished severely.',
      'Component damage accumulates — repair between chains.'
    ],
    patchNotes: '4.6 — ERT bounty payouts increased to 60-90k per mission. Solo ERT farming is now extremely profitable for skilled pilots.',
    avoidIf: [
      'You are not confident in solo combat against capital ships.',
      'Your ship is not fully combat-fitted with military-grade components.',
      'You have not built up maximum bounty hunter reputation.',
      'You struggle with VHRT bounties — ERTs are significantly harder.'
    ]
  },
  {
    id: 'bounty-vhrt',
    name: 'VHRT Bounty Hunting',
    category: 'combat',
    aUEChr: 275000,
    aUEChrLow: 200000,
    aUEChrHigh: 350000,
    risk: 'high',
    minBudget: 0,
    skillLevel: 'advanced',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 3,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Very High Risk Target bounties against tough fighters. Solid solo combat income for skilled pilots.',
    tips: [
      'Use a Vanguard Warden or Hornet F7A for best results.',
      'Claim kill bounties between targets to minimize travel downtime.',
      'Upgrade to military-grade components for survivability.'
    ],
    confidence: 'high',
    overhead: 'Ensure ship is combat-fitted. Accept bounty contracts.',
    setupTime: 5,
    consistency: 'consistent',
    bestWith: ['vanguard-warden', 'vanguard-sentinel', 'hornet-f7c-mkii', 'sabre'],
    explanation: 'VHRT bounties pay 30-40k each. A skilled pilot in a capable ship completes 6-8 per hour after factoring in travel.',
    steps: [
      'Ensure your fighter is fully upgraded with military-grade shields, powerplant, and coolers.',
      'Head to a bounty-rich system and accept VHRT contracts from the Contract Manager.',
      'Also accept the Call to Arms mission for bonus pay on every kill.',
      'Quantum travel to each bounty marker and engage immediately on arrival.',
      'Use pip-lead targeting and fire in controlled bursts to maximize DPS.',
      'After each kill, immediately accept the next bounty to minimize downtime.'
    ],
    locations: ['Crusader (Yela asteroid belt — fast spawns)', 'Hurston (near Everus Harbor)', 'microTech (near Clio — less traffic)', 'ArcCorp (Bajini Point vicinity)', 'Pyro (lawless — VHRT targets available with no security backup)'],
    gear: ['Military-grade shields (FR-76 or Sukoran)', 'Military-grade powerplant', 'Military-grade coolers x2', 'Upgraded weapon systems'],
    reputation: 'Requires high bounty hunter reputation. Must complete LRT through HRT tiers first.',
    loadout: 'Vanguard Warden with overclocked weapons is the gold standard. Hornet F7A-Mk2 also excellent. Ensure gimballed weapons for ease of aim.',
    beginnerTips: [
      'Do NOT attempt VHRTs until you can consistently clear HRTs without losing shields.',
      'Practice fixed-weapon aim in Arena Commander before tackling these.',
      'If you get overwhelmed, quantum away — living to fight again is better than claiming.'
    ],
    advancedTips: [
      'Chain bounties near Yela for fastest respawn times between targets.',
      'Use a Vanguard Sentinel for EMP capability — stun then burst down.',
      'Overclock your weapons for extra DPS but manage heat carefully.',
      'Position near quantum points so targets come to you.',
      'Pyro VHRTs can be chained in lawless space — no security interference but watch for PvP.'
    ],
    risks: [
      'VHRT targets hit extremely hard — a momentary lapse can cost your ship.',
      'Ship claim times on heavy fighters are long (8-15 min) — carry expedite fees.',
      'Other players may interdict you while traveling between bounties.',
      'Component damage accumulates over multiple fights — repair between chains.',
      'Pyro VHRTs add PvP risk in lawless space.'
    ],
    patchNotes: '4.6 — VHRT AI improved. Targets use countermeasures and evasive maneuvers. Pyro VHRTs available for pilots willing to risk lawless space.',
    avoidIf: [
      'You are not confident in dogfighting against aggressive AI.',
      'Your ship is not combat-fitted with at least military-grade components.',
      'You have not built up enough bounty reputation to access VHRTs.',
      'You only have a light fighter — VHRTs hit too hard for ships like the Aurora.'
    ]
  },
  {
    id: 'pyro-hauling',
    name: 'Pyro Cross-System Hauling',
    category: 'cargo',
    aUEChr: 400000,
    aUEChrLow: 200000,
    aUEChrHigh: 600000,
    risk: 'high',
    minBudget: 50000,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: 'An escort ship dramatically reduces the risk of PvP loss in Pyro.',
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: true,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Buy commodities in one system and haul them across the Stanton-Pyro jump point to sell in the other system for massive margins. Helium runs from Pyro to Stanton can net ~410k per trip.',
    tips: [
      'Helium from Pyro to Stanton is one of the best cross-system routes at ~410k/run.',
      'Pyro is lawless — fly fast, avoid lingering, and consider an escort.',
      'The jump point transit adds time but the margins are worth it.'
    ],
    confidence: 'medium',
    overhead: 'Purchase cargo in one system. Transit jump point. Sell in the other system.',
    setupTime: 15,
    consistency: 'variable',
    bestWith: ['c2-hercules', 'caterpillar', 'constellation-taurus'],
    explanation: 'Cross-system hauling exploits price differences between Stanton and Pyro. Helium Pyro-to-Stanton runs net ~410k each. Rate assumes 1-2 full runs per hour depending on ship and route.',
    steps: [
      'Research current cross-system commodity prices using trade tools.',
      'Purchase cargo at the buy location (e.g., Helium in Pyro).',
      'Fly to the Stanton-Pyro jump point and transit to the other system.',
      'Navigate to the sell location and sell at the trade terminal.',
      'Purchase return cargo if a profitable reverse route exists.',
      'Transit back through the jump point and repeat the cycle.'
    ],
    locations: ['Pyro system (Helium source stations)', 'Stanton system (Helium sell points)', 'Stanton-Pyro jump point (transit)', 'Ratsnest (Pyro trade hub)', 'Last Landing (Pyro trade hub)'],
    gear: ['Large cargo ship (C2 Hercules, Caterpillar, or Constellation Taurus)', 'Starting capital (minimum 50k, ideally 200k+)', 'Knowledge of cross-system price differences'],
    reputation: null,
    loadout: 'C2 Hercules (696 SCU) for maximum profit per run. Caterpillar for good capacity. Constellation Taurus as a budget option with decent cargo.',
    beginnerTips: [
      'Start with smaller loads to learn the jump point route before risking large investments.',
      'Pyro is lawless space — there is no security response if attacked.',
      'Time your runs during off-peak hours for lower PvP risk.',
      'Always have enough aUEC to cover a total loss before committing to a run.'
    ],
    advancedTips: [
      'Find profitable return cargo to maximize income on both legs of the trip.',
      'Fly with an escort for high-value loads — split the profit.',
      'Learn the fastest quantum routes through each system to minimize transit time.',
      'Monitor community trade trackers for the best cross-system margins.'
    ],
    risks: [
      'Pyro is lawless — PvP pirates actively hunt haulers near the jump point.',
      'Total cargo loss on destruction — your entire investment is gone.',
      'Jump point transit adds significant time overhead.',
      'Market prices fluctuate — a profitable route may dry up.',
      'Server crashes destroy all cargo with no compensation.'
    ],
    patchNotes: '4.6 — Cross-system Pyro hauling is a major new income method. Helium Pyro-to-Stanton routes yield ~410k per run. Pyro trade infrastructure expanded.',
    avoidIf: [
      'You cannot afford to lose your entire cargo investment.',
      'You are uncomfortable operating in lawless PvP space.',
      'You do not have a large cargo ship.',
      'Server stability is questionable — crashes lose everything.',
      'You dislike long transit routes with potential PvP encounters.'
    ]
  },
  {
    id: 'salvage-wreck',
    name: 'Wreck Salvage (Components)',
    category: 'salvage',
    aUEChr: 400000,
    aUEChrLow: 400000,
    aUEChrHigh: 800000,
    risk: 'medium',
    minBudget: 0,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: true,
    requiresROC: false,
    desc: 'Salvage valuable components and loot from wrecks, not just hull material. Higher value but requires more effort. Significantly buffed in 4.6.',
    tips: [
      'Strip weapons and shields from wrecks before scraping the hull.',
      'Use tractor beams to move components to your ship.',
      'Check crash sites after server events for valuable military wrecks.',
      'Pyro wrecks tend to have higher-value components.'
    ],
    confidence: 'medium',
    overhead: 'Locate wrecks with valuable components. Bring tractor beam multitool.',
    setupTime: 10,
    consistency: 'variable',
    bestWith: ['vulture', 'reclaimer'],
    explanation: 'Component stripping and cargo looting from wrecks is significantly more profitable in 4.6. Rate varies based on wreck type and component quality. Pyro wrecks are particularly valuable.',
    steps: [
      'Equip a tractor beam multitool attachment from a weapon/tool shop.',
      'Fly to wreck locations, prioritizing larger military or combat wrecks.',
      'EVA to the wreck and locate component slots (weapons, shields, coolers).',
      'Use the tractor beam to detach and move components to your ship cargo.',
      'After stripping components, use your salvage ship to scrape remaining hull material.',
      'Sell components at weapon shops and RMC at trade terminals.'
    ],
    locations: ['Crusader (Yela — military wreck spawns)', 'Hurston (debris fields near Everus Harbor)', 'microTech (crash sites on Calliope)', 'Near comm arrays (combat wreck spawns)', 'Pyro (high-value wrecks in lawless space — best loot)'],
    gear: ['Vulture or Reclaimer', 'Tractor beam multitool attachment', 'EVA-capable suit', 'Cargo space for components'],
    reputation: null,
    loadout: 'Vulture plus tractor beam multitool. EVA suit with good oxygen capacity for extended component stripping.',
    beginnerTips: [
      'Start with hull scraping to learn wreck locations before adding component stripping.',
      'Military wrecks have the most valuable components — look for Hammerhead or Vanguard debris.',
      'Tractor beam range is limited — position your ship close to the component you are extracting.'
    ],
    advancedTips: [
      'Strip components first (they are worth more per unit time), then scrape hull.',
      'Check for wrecks after dynamic server events — they generate high-value debris.',
      'Upgrade-grade components from wrecks can sell for 10-30k each.',
      'Combine with bunker clearing — destroy enemy ships, then salvage the remains.',
      'Pyro wrecks have the best component loot tables but come with PvP risk.'
    ],
    risks: [
      'EVA component stripping is time-consuming and leaves you vulnerable.',
      'Some wrecks are in hostile NPC space — enemy ships may engage you.',
      'Component value varies wildly — some wrecks yield almost nothing.',
      'Tractor beam can glitch, losing components in space.',
      'Pyro salvage adds PvP risk in lawless space.'
    ],
    patchNotes: '4.6 — Component salvage significantly buffed. More extractable items, better loot tables, and Pyro wrecks added with premium components.',
    avoidIf: [
      'You do not enjoy EVA gameplay.',
      'You want consistent, predictable income — component value varies.',
      'You are not comfortable navigating wreck interiors in zero-g.'
    ]
  },
  {
    id: 'salvage-hull',
    name: 'Hull Salvage (Scraping)',
    category: 'salvage',
    aUEChr: 300000,
    aUEChrLow: 300000,
    aUEChrHigh: 600000,
    risk: 'low',
    minBudget: 0,
    skillLevel: 'beginner',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: true,
    requiresROC: false,
    desc: 'Use a salvage ship to scrape hull material from derelict wrecks. Consistent and relaxing income, significantly buffed in 4.6.',
    tips: [
      'Look for wrecks near comm arrays and populated areas.',
      'Bigger wrecks like Caterpillar hulls yield the most material.',
      'Sell RMC (Recycled Material Composite) at major landing zones.',
      'Pyro wrecks are larger and more plentiful — consider Pyro runs for higher income.'
    ],
    confidence: 'high',
    overhead: 'Fly to wreck locations. Begin scraping operations.',
    setupTime: 10,
    consistency: 'consistent',
    bestWith: ['vulture', 'reclaimer'],
    explanation: 'Salvage was significantly buffed in 4.6. A Vulture fills its hold with RMC faster and RMC values are higher. Pyro wrecks add even more earning potential.',
    steps: [
      'Spawn your Vulture or Reclaimer at a station near known wreck sites.',
      'Fly to wreck locations — check near comm arrays, orbit markers, and moon surfaces.',
      'Approach the wreck and activate your salvage beam in scraping mode.',
      'Systematically scrape all hull panels — work from one end to the other.',
      'When your RMC hold is full, fly to the nearest major landing zone.',
      'Sell RMC at the trade terminal (Admin Office or TDD).'
    ],
    locations: ['Crusader (Yela asteroid field — frequent wrecks)', 'Hurston (orbit debris fields)', 'microTech (surface crash sites)', 'Near any comm array (wreck spawns)', 'Everus Harbor (sell point)', 'Pyro (larger wrecks, lawless space — higher risk/reward)'],
    gear: ['Vulture or Reclaimer salvage ship', 'No additional gear required'],
    reputation: null,
    loadout: 'Vulture is the solo standard — affordable and efficient. Reclaimer for groups wanting massive throughput.',
    beginnerTips: [
      'This is one of the most relaxing money-making methods in the game.',
      'Large wrecks (Caterpillar, Constellation) give the most RMC per scrape.',
      'You can find wrecks by flying near comm arrays — they spawn regularly.',
      'Sell RMC at any major landing zone trade terminal.'
    ],
    advancedTips: [
      'Map a wreck circuit near Yela for consistent spawns.',
      'Combine hull scraping with component stripping for maximum value per wreck.',
      'Use the Reclaimer with crew for 3x the scraping speed.',
      'Check for wrecks after combat events — player and NPC battles leave debris.',
      'Pyro salvage runs yield higher income but add PvP risk.'
    ],
    risks: [
      'Wreck spawns can be inconsistent — sometimes you fly around finding nothing.',
      'Other salvagers may compete for the same wrecks.',
      'Some wrecks are in dangerous areas where hostile NPCs or players may attack.',
      'Pyro salvage adds significant PvP risk in lawless space.'
    ],
    patchNotes: '4.6 — Salvage significantly buffed. RMC values increased, Vulture efficiency improved. Pyro wrecks added for higher-end income.',
    avoidIf: [
      'You do not own a Vulture or Reclaimer.',
      'You want action-packed gameplay — salvaging is slow and methodical.',
      'You dislike flying around searching for wrecks.'
    ]
  },
  {
    id: 'bounty-hrt',
    name: 'HRT Bounty Hunting',
    category: 'combat',
    aUEChr: 160000,
    aUEChrLow: 120000,
    aUEChrHigh: 200000,
    risk: 'medium',
    minBudget: 0,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 2,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'High Risk Target bounties. Solid mid-tier combat income with manageable difficulty.',
    tips: [
      'An Arrow or Gladius handles HRTs easily.',
      'Focus on headshot angles when jousting to end fights fast.',
      'Stack the call-to-arms mission for bonus income on every kill.'
    ],
    confidence: 'high',
    overhead: 'Equip ship for combat. Accept contracts from bounty board.',
    setupTime: 5,
    consistency: 'consistent',
    bestWith: ['arrow', 'gladius', 'buccaneer', 'sabre'],
    explanation: 'HRT bounties pay 20-25k each. Intermediate pilots clear 5-7 per hour in a decent fighter.',
    steps: [
      'Upgrade your fighter with at least industrial-grade shields and weapons.',
      'Accept HRT bounty contracts and the Call to Arms mission.',
      'Quantum travel to the bounty marker — targets spawn near the QT point.',
      'Engage at optimal range for your weapons (ballistics: close, energy: mid-range).',
      'Focus on maintaining your angle — keep the target in your firing cone.',
      'After the kill, accept the next bounty immediately and quantum to the marker.'
    ],
    locations: ['Crusader (Yela, Cellin — common bounty zones)', 'Hurston (Aberdeen orbit)', 'microTech (Clio and Calliope vicinity)', 'ArcCorp (near Bajini Point)', 'Pyro (lawless — no security response, watch for PvP)'],
    gear: ['Industrial-grade shields minimum', 'Upgraded weapons (Mantis or Revenant ballistics)', 'Upgraded powerplant and coolers'],
    reputation: 'Requires moderate bounty hunter reputation. Complete MRT tier first.',
    loadout: 'Arrow or Gladius with upgraded components. Gimballed weapons recommended for consistency.',
    beginnerTips: [
      'Master MRT bounties before attempting HRTs — the difficulty jump is noticeable.',
      'Always keep your speed in the SCM range for maximum maneuverability.',
      'If shields drop below 30%, break away and let them recharge.'
    ],
    advancedTips: [
      'Use fixed weapons for higher DPS once you are comfortable with aim.',
      'Chain bounties in one system to reduce quantum travel time.',
      'Overclock shields for faster regen between fights.',
      'Use decoupled mode for better jousting angles.'
    ],
    risks: [
      'HRT targets are more aggressive and better armed than MRTs.',
      'Shield damage can accumulate if you chain too many fights without repairing.',
      'Missile locks from targets require countermeasure discipline.'
    ],
    patchNotes: '4.6 — HRT targets occasionally fly in pairs. Pyro HRTs available in lawless space.',
    avoidIf: [
      'You are still learning basic flight and combat controls.',
      'Your ship has only stock civilian-grade components.',
      'You struggle with MRT bounties — HRTs are a step up in aggression.'
    ]
  },
  {
    id: 'cargo-trade',
    name: 'Cargo Trading',
    category: 'cargo',
    aUEChr: 250000,
    aUEChrLow: 80000,
    aUEChrHigh: 500000,
    risk: 'medium',
    minBudget: 10000,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: true,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Buy commodities at one location and sell at another for profit. Income scales heavily with cargo capacity and starting capital. Cross-system Pyro routes have made trading more profitable than ever.',
    tips: [
      'Always check current prices before committing — markets fluctuate.',
      'Start with safe commodities like Medical Supplies before risking Laranite.',
      'Never invest more than you can afford to lose in one run.',
      'Cross-system Pyro routes offer the best margins but add PvP risk.'
    ],
    confidence: 'medium',
    overhead: 'Research routes and prices. Fly to buy location, purchase cargo.',
    setupTime: 10,
    consistency: 'variable',
    bestWith: ['c2-hercules', 'caterpillar', 'freelancer-max', 'constellation-taurus'],
    explanation: 'Rate depends heavily on SCU capacity, budget, and route. Cross-system Pyro routes dramatically increase margins. A C2 full of Laranite can make 300k+ per run in Stanton; Pyro routes push higher.',
    steps: [
      'Research current commodity prices using trade tools or community resources.',
      'Identify a profitable route: buy low at one location, sell high at another.',
      'Fly to the buy location and use the trade terminal to purchase cargo.',
      'Start with safe commodities (Medical Supplies, Stims) before moving to high-margin goods.',
      'Fly to the sell location, avoiding risky quantum routes if carrying expensive cargo.',
      'Sell at the trade terminal and reinvest profits into the next run.',
      'Consider cross-system Pyro routes for the best margins (see Pyro Hauling method).'
    ],
    locations: ['Hurston (Lorville — Laranite buyer)', 'microTech (New Babbage trade hub)', 'ArcCorp (Area18 — diversified market)', 'Crusader (Orison — gas commodity trades)', 'Port Olisar', 'Everus Harbor', 'Pyro stations (Ratsnest, Last Landing — cross-system trade)'],
    gear: ['Cargo ship with adequate SCU capacity', 'Starting capital (minimum 10k, ideally 100k+)', 'Trade route spreadsheet or community tool'],
    reputation: null,
    loadout: 'Freelancer MAX (120 SCU) for budget traders. C2 Hercules (696 SCU) for maximum profit. Constellation Taurus (174 SCU) is a solid mid-range option.',
    beginnerTips: [
      'Start with Medical Supplies — low margin but almost zero risk of loss.',
      'Never invest more than 50% of your total aUEC in a single run.',
      'Use community trade calculators to plan routes before flying.',
      'Avoid Laranite and Titanium until you can afford to lose a full load.'
    ],
    advancedTips: [
      'Track market refresh timers to buy maximum quantities.',
      'Use multiple trade terminals in sequence to fill large cargo holds.',
      'Run Laranite from mining outposts to Lorville for peak margins.',
      'Consider escorts for high-value runs in hostile space.',
      'Cross-system Pyro routes are the most profitable but require navigating lawless space.'
    ],
    risks: [
      'Server crash (30k) destroys all cargo with no refund — your entire investment is gone.',
      'Pirates can interdict and destroy your ship, losing everything.',
      'Market prices fluctuate — a route profitable yesterday may not be today.',
      'Large cargo ships are slow and vulnerable while quantum traveling.',
      'Pyro routes add significant PvP risk in lawless space.'
    ],
    patchNotes: '4.6 — Cargo trading more profitable with cross-system Pyro routes. Commodity prices update more frequently. New Pyro trade hubs added.',
    avoidIf: [
      'You have less than 10k aUEC — trading requires capital.',
      'Server stability is poor — 30k crashes destroy cargo.',
      'You dislike slow, methodical gameplay.',
      'You do not have a cargo-capable ship.'
    ]
  },
  {
    id: 'mining-quant',
    name: 'Quantanium Mining',
    category: 'mining',
    aUEChr: 225000,
    aUEChrLow: 200000,
    aUEChrHigh: 400000,
    risk: 'medium',
    minBudget: 0,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: 'MOLE with crew can triple output but requires splitting profits.',
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: true,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Mine Quantanium ore from asteroid belts and sell at refineries. Solid income with the ore being volatile and exploding if you take too long. Pyro has new minable resources like Stileron and Riccite.',
    tips: [
      'Head to Lyria or the Aaron Halo belt for the best Quantanium rocks.',
      'Use a Lancet MH1 mining head for better fracturing control.',
      'You have about 15 minutes once Quantanium is in your hold before it explodes.',
      'Pyro system offers new resources (Stileron, Riccite) for miners willing to brave lawless space.'
    ],
    confidence: 'high',
    overhead: 'Equip mining head and consumables. Fly to mining location. Refine ore after.',
    setupTime: 10,
    consistency: 'variable',
    bestWith: ['prospector', 'mole'],
    explanation: 'A full Prospector hold of Quantanium refines to roughly 150-250k. Runs take 30-50 minutes including travel and refining submission. Pyro resources add variety but rates are similar.',
    steps: [
      'Equip your Prospector with a Lancet MH1 mining head and Surge/Stampede consumables.',
      'Fly to the Aaron Halo asteroid belt or Lyria (Crusader moon).',
      'Scan rocks using the mining mode — look for Quantanium content above 30%.',
      'Fracture the rock using consumables to stay in the green zone.',
      'Extract the Quantanium quickly — you have ~15 minutes before it detonates.',
      'Rush to the nearest refinery station and submit a refining job.'
    ],
    locations: ['Aaron Halo asteroid belt (best yields)', 'Lyria (Crusader moon — surface rocks)', 'ARC-L1 refinery station', 'CRU-L1 refinery station', 'HUR-L1 refinery station', 'Pyro system (Stileron and Riccite deposits — lawless space)'],
    gear: ['Prospector or MOLE mining ship', 'Lancet MH1 mining head', 'Surge consumable modules', 'Stampede consumable modules', 'Brandt or Rime mining heads as alternatives'],
    reputation: null,
    loadout: 'Prospector with Lancet MH1 head, 1x Surge, 1x Stampede. For MOLE: 3 Lancet heads with mixed consumables.',
    beginnerTips: [
      'Practice scanning and fracturing on common rocks before targeting Quantanium.',
      'The 15-minute Quantanium timer is real — have your refinery route planned before mining.',
      'Start with Lyria surface rocks — they are easier to find than Aaron Halo asteroids.',
      'Submit refining jobs at any station with a refinery deck.'
    ],
    advancedTips: [
      'Only mine rocks with 30%+ Quantanium concentration for efficiency.',
      'Use the Aaron Halo belt near CRU-L1 for the shortest refinery trip.',
      'Overcharge fractures with consumables to crack rocks that would otherwise resist.',
      'MOLE with a 3-person crew can pull 3x the Quantanium per run.',
      'Explore Pyro for Stileron and Riccite — new resources with different market dynamics.'
    ],
    risks: [
      'Quantanium detonates after ~15 minutes in your hold — destroying your ship.',
      'Poor rock RNG can waste 20+ minutes finding a good Quantanium rock.',
      'Refinery jobs take real time to complete (1-3 hours) before you can sell.',
      'Other miners may compete for the same rocks in popular areas.',
      'Pyro mining adds PvP risk in lawless space.'
    ],
    patchNotes: '4.6 — Mining rates similar to previous patches. Pyro system adds new resources (Stileron, Riccite). Refinery UI improved.',
    avoidIf: [
      'You do not own a Prospector or MOLE.',
      'You are impatient — finding good rocks takes time.',
      'You panic under time pressure — the Quantanium timer is stressful.',
      'You want immediate payout — refining takes time.'
    ]
  },
  {
    id: 'bunker-high',
    name: 'High-Tier Bunker Clearing',
    category: 'combat',
    aUEChr: 200000,
    aUEChrLow: 150000,
    aUEChrHigh: 250000,
    risk: 'high',
    minBudget: 60000,
    skillLevel: 'advanced',
    soloFriendly: true,
    groupBonus: 'With a partner, you can clear faster and reduce death risk significantly.',
    requiresShipId: null,
    requiresCombat: 3,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'High-threat bunker missions with elite enemies. Great payout but real death risk and gear loss.',
    tips: [
      'Always bring a buddy or park a medical ship nearby.',
      'Use top-tier armor — the Morozov set is excellent.',
      'Slow is smooth, smooth is fast. Do not rush rooms.'
    ],
    confidence: 'medium',
    overhead: 'Buy high-tier armor and weapons. Stage medical supplies. Fly out.',
    setupTime: 15,
    consistency: 'consistent',
    bestWith: ['cutlass-red', 'cutlass-black', 'constellation-andromeda'],
    explanation: 'High-tier bunkers pay 60-90k per mission. 2-3 completions per hour with premium looting pushes the rate up.',
    steps: [
      'Purchase top-tier heavy armor (Morozov or Stitcher set) and a high-DPS weapon.',
      'Equip medpens (8+), grenades (5+), and maximum ammo. Consider bringing a medgun.',
      'Accept high-threat bunker contracts — these require established mercenary reputation.',
      'Park a Cutlass Red or have a friend in one nearby for mobile respawn.',
      'Enter the bunker and clear extremely methodically — use grenades liberally and never rush.',
      'After clearing, strip every body for high-value loot (helmets, chest pieces, weapons).'
    ],
    locations: ['Hurston (high-sec bunkers on Aberdeen)', 'Crusader (Yela underground facilities)', 'microTech (Calliope deep bunkers)', 'Pyro (lawless bunkers — highest difficulty and best loot)'],
    gear: ['Heavy armor set (Morozov Overlord or Stitcher)', 'LMG or high-DPS rifle (Demeco, SF7B)', 'Frag grenades x6', 'Medpens x8', 'Medgun', 'Spare weapon as backup'],
    reputation: 'Requires high mercenary reputation. Build up through low and mid-tier missions first.',
    loadout: 'Cutlass Red strongly recommended for medical bed respawn. Alternatively, a Carrack if available.',
    beginnerTips: [
      'Do NOT attempt high-tier bunkers until you can consistently clear mid-tier without dying.',
      'Losing a full high-tier loadout costs 60k+ — make sure you can afford multiple sets.',
      'Practice headshot accuracy in low-tier missions before stepping up.'
    ],
    advancedTips: [
      'Duo with a partner using crossfire positions at doorways.',
      'Bring a medical gun to heal mid-fight instead of using medpens.',
      'Speed-clear with LMG spray for maximum missions per hour once you know the layouts.',
      'Loot can exceed the mission payout — always take time to strip bodies.'
    ],
    risks: [
      'Elite NPCs can two-shot you even in heavy armor — never peek without a plan.',
      'Full gear loss on death is devastating (60k+).',
      'Other players may camp the bunker entrance knowing high-tier loot is inside.',
      'If your medical ship is destroyed, you respawn at the nearest station and lose the mission.'
    ],
    patchNotes: '4.6 — High-tier bunker enemies have improved AI with suppression fire and better grenades. Loot tables updated with rare items. Pyro bunkers available.',
    avoidIf: [
      'You are new to FPS combat — these enemies are punishing.',
      'You cannot afford to lose 60k+ in gear on a bad run.',
      'You are playing solo without a medical ship nearby.',
      'Server stability is questionable — a 30k crash loses everything.'
    ]
  },
  {
    id: 'bunker-mid',
    name: 'Mid-Tier Bunker Clearing',
    category: 'combat',
    aUEChr: 105000,
    aUEChrLow: 80000,
    aUEChrHigh: 130000,
    risk: 'medium',
    minBudget: 30000,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 2,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Mid-difficulty bunker missions with tougher enemies and better payouts. Requires decent FPS gear and awareness.',
    tips: [
      'Bring heavy armor and a good ballistic rifle like the P6-LR.',
      'Use grenades to clear stacked rooms before entering.',
      'Watch for friendly NPCs — shooting them tanks your rep.'
    ],
    confidence: 'high',
    overhead: 'Purchase mid-tier armor and weapons. Fly to mission location.',
    setupTime: 10,
    consistency: 'consistent',
    bestWith: ['cutlass-black', 'cutlass-red', 'avenger-titan'],
    explanation: 'Mid-tier bunker missions pay 30-45k each. Completing 2-3 per hour plus some looting yields the estimated range.',
    steps: [
      'Purchase medium/heavy armor and a high-damage ballistic rifle (P6-LR or Demeco).',
      'Stock up on medpens (5+), grenades (3-4), and ample ammo.',
      'Accept mid-tier bunker missions (Remove Illegal Occupants or Neutralize Hostiles).',
      'Fly to the bunker, land, and prepare loadout before entering.',
      'Clear rooms using grenades for groups and controlled fire for singles.',
      'Loot all bodies for valuable armor and weapons before extracting.'
    ],
    locations: ['Hurston (HDMS-Edmond, HDMS-Hadley)', 'Crusader (Yela bunkers)', 'microTech (Clio surface bunkers)', 'ArcCorp (Wala bunkers)'],
    gear: ['Medium/Heavy armor (Morozov or Artimex set)', 'P6-LR or Demeco LMG', 'Frag grenades x4', 'Medpens x6', 'Spare magazines x6'],
    reputation: 'Need basic mercenary reputation to access mid-tier contracts.',
    loadout: 'Cutlass Black or Red recommended. Red provides mobile medical respawn if you die inside.',
    beginnerTips: [
      'Upgrade to this from low-tier only after you are comfortable clearing rooms without dying.',
      'Always pre-aim doorways before entering — enemies react faster at this tier.',
      'Keep your medpen hotkey ready; mid-tier enemies deal more damage per hit.'
    ],
    advancedTips: [
      'Use a Morozov heavy armor set for maximum damage reduction.',
      'Pre-throw grenades into rooms you know have clustered spawns.',
      'Bring a tractor beam multitool to rapidly collect loot for resale.'
    ],
    risks: [
      'Friendly NPC encounters — shooting them fails the mission and gives crimestat.',
      'Heavier enemies can down you quickly if you push without checking corners.',
      'Gear loss on death is more costly at this tier (30k+ in equipment).'
    ],
    patchNotes: '4.6 — Mid-tier bunker enemies now use grenades and flanking. Increased payout to compensate.',
    avoidIf: [
      'You have not mastered low-tier bunkers yet.',
      'You cannot afford to lose a 30k armor/weapon loadout.',
      'You struggle with identifying friendly vs hostile NPCs.'
    ]
  },
  {
    id: 'mining-gem',
    name: 'Hand Mining Gems',
    category: 'mining',
    aUEChr: 120000,
    aUEChrLow: 80000,
    aUEChrHigh: 160000,
    risk: 'low',
    minBudget: 5000,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: true,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Hand mine Hadanite and other gems in caves using a mining multitool. No ship requirements beyond getting there.',
    tips: [
      'Bring extra batteries for your mining multitool.',
      'Caves on Aberdeen and Arial have the densest gem nodes.',
      'Wear a backpack with maximum storage for more gem capacity.'
    ],
    confidence: 'medium',
    overhead: 'Buy mining multitool and attachments. Travel to cave entrance.',
    setupTime: 15,
    consistency: 'consistent',
    bestWith: ['avenger-titan', 'cutlass-black', 'pisces'],
    explanation: 'Hand-mined Hadanite at 275/unit, filling a large backpack 3-5 times per hour. Good caves yield the higher end consistently.',
    steps: [
      'Purchase a multitool with a mining attachment from a tool shop.',
      'Buy extra batteries and equip a large backpack for gem storage.',
      'Fly to a moon with known cave systems (Aberdeen or Arial recommended).',
      'Land near a cave entrance marker and enter on foot with your flashlight.',
      'Locate Hadanite deposits (glowing purple/pink crystals) and mine them with your multitool.',
      'When your backpack is full, return to your ship and fly to a trade terminal to sell.'
    ],
    locations: ['Aberdeen caves (Hurston moon — best Hadanite density)', 'Arial caves (Crusader moon)', 'Daymar caves (Crusader moon — easier to navigate)', 'Lyria caves (smaller but accessible)'],
    gear: ['Multitool with mining attachment', 'Extra batteries x4', 'Large backpack (TrueDef Nightfire or similar)', 'Flashlight attachment', 'Medpens x2 (cave hazards)'],
    reputation: null,
    loadout: 'Any ship that can land near a cave entrance. Pisces for fastest entry/exit. Bring extra batteries.',
    beginnerTips: [
      'Caves are dark — always bring a flashlight attachment or use your helmet light.',
      'Hadanite glows purple/pink — it is easy to spot in dark caves.',
      'Do not jump in caves — falling damage can kill you and you lose your backpack of gems.',
      'Mark cave entrances on your map so you can find them again.'
    ],
    advancedTips: [
      'Memorize cave layouts for the fastest mining routes.',
      'Aberdeen caves have the highest Hadanite density consistently.',
      'Bring a friend to carry double the gems per trip.',
      'Switch multitools when batteries die rather than waiting to recharge.'
    ],
    risks: [
      'Cave navigation can be disorienting — bring breadcrumb markers or memorize paths.',
      'Fall damage in caves is lethal and loses all mined gems.',
      'Some caves have hostile NPCs (rarely) that can ambush miners.',
      'Backpack gems are lost if you die — no insurance.'
    ],
    patchNotes: '4.6 — Cave generation improved with more diverse layouts. Hadanite prices stable. Mining multitool efficiency unchanged.',
    avoidIf: [
      'You are claustrophobic or dislike dark enclosed spaces in games.',
      'You want high-efficiency income — hand mining is slower than ship mining.',
      'You do not enjoy on-foot exploration gameplay.'
    ]
  },
  {
    id: 'bunker-loot',
    name: 'Bunker Looting',
    category: 'combat',
    aUEChr: 90000,
    aUEChrLow: 60000,
    aUEChrHigh: 120000,
    risk: 'medium',
    minBudget: 15000,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 1,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Focus on looting armor, weapons, and valuables from cleared bunker NPCs rather than just the mission payout.',
    tips: [
      'Strip every body — helmets and chest armor are the most valuable.',
      'Bring a large backpack to maximize what you carry out.',
      'Sell looted gear at admin offices or weapon shops for best prices.'
    ],
    confidence: 'medium',
    overhead: 'Complete bunker missions, then loot bodies and containers.',
    setupTime: 10,
    consistency: 'consistent',
    bestWith: ['cutlass-black', 'avenger-titan', 'cutlass-red'],
    explanation: 'Bunker mission pay (15-25k) plus looted gear (20-40k in armor/weapons per clear). Total of 2-3 runs per hour.',
    steps: [
      'Accept a bunker mission and equip for combat (can use lower-tier gear since loot replaces losses).',
      'Fly to the bunker and clear all hostile NPCs.',
      'After clearing, systematically loot every body — prioritize helmets, chest armor, and weapons.',
      'Use a tractor beam multitool to stack loot near the elevator for faster extraction.',
      'Carry as much as possible to your ship — use backpacks and weapon racks.',
      'Sell looted gear at weapon shops and armor shops at major landing zones.'
    ],
    locations: ['Hurston (HDMS bunkers — close to Lorville sell point)', 'Crusader (Yela bunkers)', 'microTech (surface bunkers near New Babbage)', 'ArcCorp (Wala bunkers near Area18)'],
    gear: ['Basic combat loadout (can be cheap — you loot upgrades)', 'Large backpack (TrueDef Nightfire or similar)', 'Tractor beam multitool', 'Medpens x3-5'],
    reputation: null,
    loadout: 'Cutlass Black is ideal — large cargo bay for stacking looted armor. Tractor beam multitool makes extraction fast.',
    beginnerTips: [
      'You do not need expensive gear for looting — cheap armor works since you replace it from bodies.',
      'Helmets and chest pieces are the highest-value items to loot.',
      'Sell at weapon shops (guns) and armor shops (armor) for best prices.',
      'A tractor beam multitool makes moving loot dramatically faster.'
    ],
    advancedTips: [
      'Focus on high-tier bunkers for better loot quality.',
      'Strip every NPC completely — even undersuit and backpacks have value.',
      'Use the ship cargo grid to organize loot for efficient selling.',
      'Chain multiple bunkers before selling for maximum efficiency.'
    ],
    risks: [
      'Spending too long looting means fewer missions per hour.',
      'Other players may come to contest the bunker while you are looting.',
      'Crimestat from accidentally shooting friendlies prevents selling at legitimate shops.',
      'Loot can clip through the floor or glitch during stacking.'
    ],
    patchNotes: '4.6 — Loot tables improved with more variety. Tractor beam stacking works more reliably.',
    avoidIf: [
      'You dislike inventory management and sorting gear.',
      'You want pure combat action without the looting phase.',
      'You are unable to clear bunkers consistently — you need to survive to loot.'
    ]
  },
  {
    id: 'hand-mining-cave',
    name: 'Cave Hand Mining (Hadanite)',
    category: 'mining',
    aUEChr: 80000,
    aUEChrLow: 50000,
    aUEChrHigh: 120000,
    risk: 'low',
    minBudget: 0,
    skillLevel: 'beginner',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Mine Hadanite in caves on moons using just a mining multitool. No ship requirements beyond getting to the cave. Excellent starter income with virtually zero risk.',
    tips: [
      'Aberdeen and Arial moons have the best cave Hadanite deposits.',
      'Bring extra batteries — they run out faster than you expect.',
      'A large backpack significantly increases your income per trip.'
    ],
    confidence: 'high',
    overhead: 'Purchase mining multitool (cheap). Fly to any moon with caves.',
    setupTime: 10,
    consistency: 'consistent',
    bestWith: ['pisces', 'avenger-titan', 'aurora-mr'],
    explanation: 'Hadanite sells for ~275/unit. Fill a backpack in a cave, sell, and repeat. Beginner-friendly with no ship or expensive gear requirements.',
    steps: [
      'Purchase a multitool with a mining attachment from any tool shop (very cheap).',
      'Equip a large backpack for maximum Hadanite storage.',
      'Fly to a moon with cave systems — Aberdeen or Arial recommended for best deposits.',
      'Land near a cave entrance marker and enter on foot.',
      'Locate Hadanite deposits (glowing purple/pink crystals) and mine them with your multitool.',
      'When your backpack is full, return to your ship and sell at the nearest trade terminal.',
      'Repeat — caves respawn deposits over time.'
    ],
    locations: ['Aberdeen caves (Hurston moon — best deposits)', 'Arial caves (Crusader moon)', 'Daymar caves (Crusader moon — beginner-friendly)', 'Any moon with cave markers'],
    gear: ['Multitool with mining attachment (very cheap)', 'Extra batteries x3-4', 'Large backpack', 'Flashlight or helmet light'],
    reputation: null,
    loadout: 'Any ship at all — you just need to get to the cave. Even an Aurora works fine. Pisces is ideal for quick landing and takeoff.',
    beginnerTips: [
      'This is one of the best starter income methods — almost no investment required.',
      'The mining multitool is very cheap and available at most tool shops.',
      'Hadanite glows purple/pink and is easy to spot in dark caves.',
      'Do not jump or sprint near ledges in caves — fall damage is lethal.',
      'You can do this on your very first day in the game with minimal aUEC.'
    ],
    advancedTips: [
      'Learn specific cave layouts for fastest routes to Hadanite deposits.',
      'Bring a friend to carry double the gems per trip.',
      'Aberdeen caves consistently have the densest Hadanite spawns.',
      'Upgrade to ROC mining once you can afford the vehicle for significantly faster income.'
    ],
    risks: [
      'Fall damage in caves is the primary danger — move carefully on ledges.',
      'Getting lost in cave systems can waste time.',
      'Backpack contents are lost on death — no insurance for hand-mined gems.',
      'Very rare hostile NPC encounters in some caves.'
    ],
    patchNotes: '4.6 — Cave hand mining remains a solid beginner method. Cave layouts more varied. Hadanite prices stable.',
    avoidIf: [
      'You want high income — this is a starter method, not top-tier pay.',
      'You dislike dark, enclosed cave environments.',
      'You already have a mining ship — ship mining pays significantly more.',
      'You find repetitive on-foot gameplay tedious.'
    ]
  },
  {
    id: 'bounty-mrt',
    name: 'MRT Bounty Hunting',
    category: 'combat',
    aUEChr: 80000,
    aUEChrLow: 60000,
    aUEChrHigh: 100000,
    risk: 'medium',
    minBudget: 0,
    skillLevel: 'beginner',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 1,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Medium Risk Target bounties. Entry-level combat grinding accessible with starter ships.',
    tips: [
      'An Avenger Titan can handle MRTs comfortably.',
      'Always run Call to Arms alongside bounties for extra pay.',
      'Stick near one planet/moon system to reduce travel time.'
    ],
    confidence: 'high',
    overhead: 'Basic ship combat loadout. Accept bounty missions.',
    setupTime: 5,
    consistency: 'consistent',
    bestWith: ['avenger-titan', 'gladius', 'arrow', '300i'],
    explanation: 'MRT bounties pay 10-15k each. Completing 5-7 per hour with Call to Arms bonuses yields estimated range.',
    steps: [
      'Accept MRT bounty hunting contracts from the Contract Manager.',
      'Also accept the Call to Arms mission for additional income per kill.',
      'Quantum travel to the bounty target marker.',
      'Engage the target — MRTs are single fighters that are manageable for starter ships.',
      'Use gimballed weapons and stay within optimal range.',
      'Collect the bounty and immediately take the next contract.'
    ],
    locations: ['Crusader (Cellin, Yela — beginner-friendly zones)', 'Hurston (near Lorville)', 'microTech (near New Babbage)', 'ArcCorp (near Area18)'],
    gear: ['Stock or slightly upgraded ship weapons', 'Optional: upgraded shields for survivability'],
    reputation: 'Requires basic bounty hunter certification (complete the initial bounty mission).',
    loadout: 'Avenger Titan with stock loadout works fine. Upgrade shields first if possible.',
    beginnerTips: [
      'This is the best entry point for learning ship combat.',
      'Keep your speed in the SCM (blue) zone for best handling.',
      'Use gimballed weapons — they track automatically and are much easier to use.',
      'If your shields drop, boost away and let them recharge before re-engaging.'
    ],
    advancedTips: [
      'Switch to fixed weapons for higher DPS once comfortable.',
      'Stay in one system and chain bounties for efficiency.',
      'Use Call to Arms plus bounty stacking for maximum income per kill.'
    ],
    risks: [
      'MRT targets can still damage starter ships — do not ignore incoming fire.',
      'Ship destruction means a claim timer and lost time.',
      'Learning curve on combat can be frustrating initially.'
    ],
    patchNotes: '4.6 — MRT difficulty unchanged. Good entry point for new combat pilots.',
    avoidIf: [
      'You have never flown in combat before — try the tutorial first.',
      'Your ship is an Aurora MR — it struggles with even MRTs.',
      'You prefer non-combat gameplay loops.'
    ]
  },
  {
    id: 'mining-roc',
    name: 'ROC Mining',
    category: 'mining',
    aUEChr: 60000,
    aUEChrLow: 40000,
    aUEChrHigh: 80000,
    risk: 'low',
    minBudget: 172000,
    skillLevel: 'beginner',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: true,
    desc: 'Drive a ROC ground vehicle to mine Hadanite gems on moons. Relaxing, consistent, and low risk.',
    tips: [
      'Aberdeen and Arial have the best Hadanite deposits.',
      'Stay near the poles for denser gem clusters.',
      'Bring the ROC in a Cutlass Black or Nomad for easy loading.'
    ],
    confidence: 'high',
    overhead: 'Load ROC into ship. Fly to moon. Land and deploy ROC.',
    setupTime: 15,
    consistency: 'consistent',
    bestWith: ['cutlass-black', 'nomad', 'constellation-taurus', 'drake-corsair'],
    explanation: 'Hadanite sells for about 275/unit. A full ROC load is worth roughly 25-30k. Two loads per hour is realistic with travel.',
    steps: [
      'Purchase or rent a ROC mining vehicle from a vehicle shop.',
      'Load the ROC into a ship with a cargo bay (Cutlass Black, Nomad, etc.).',
      'Fly to Aberdeen (Hurston moon) or Arial (Crusader moon) — best Hadanite spots.',
      'Land on flat terrain, deploy the ROC, and drive to gem deposits (purple markers on scan).',
      'Mine Hadanite clusters using the ROC mining laser — keep the beam in the green zone.',
      'When the ROC is full, load it back into your ship and fly to a trade terminal to sell.'
    ],
    locations: ['Aberdeen (Hurston moon — densest deposits)', 'Arial (Crusader moon)', 'Daymar (Crusader moon — less dense but accessible)', 'Wala (ArcCorp moon)'],
    gear: ['ROC mining vehicle (purchase: ~172k aUEC)', 'Ship with vehicle bay (Cutlass Black, Nomad, Constellation Taurus)', 'Mining consumables (optional)'],
    reputation: null,
    loadout: 'Cutlass Black is the easiest ROC carrier — wide ramp, fast loading. Nomad works but the open bed can be tricky.',
    beginnerTips: [
      'The ROC is very forgiving to operate — just keep the laser in the green zone.',
      'Land your ship facing downhill so the ROC rolls out easily.',
      'Stick to flat areas — the ROC can flip on steep terrain.',
      'Aberdeen has the best Hadanite density for consistent income.'
    ],
    advancedTips: [
      'Map out gem cluster routes on Aberdeen for efficient loops.',
      'Use the Constellation Taurus for extended mining sessions — more cargo capacity.',
      'Mine near the poles of moons for higher gem density.',
      'Consider a Corsair for the vehicle bay plus combat capability if interrupted.'
    ],
    risks: [
      'ROC can flip on uneven terrain, potentially requiring a ship ramp reset.',
      'Gems can clip through the ROC collection basket on rough ground.',
      'Planet weather effects (storms on microTech) can reduce visibility.'
    ],
    patchNotes: '4.6 — ROC physics improved. Hadanite prices stable. Vehicle loading into ships is smoother.',
    avoidIf: [
      'You do not own or cannot rent a ROC (172k aUEC to buy).',
      'You do not have a ship with a vehicle bay.',
      'You want high income — ROC mining is relaxing but not top-tier pay.',
      'You dislike ground vehicle gameplay.'
    ]
  },
  {
    id: 'bunker-low',
    name: 'Low-Tier Bunker Clearing',
    category: 'combat',
    aUEChr: 55000,
    aUEChrLow: 40000,
    aUEChrHigh: 70000,
    risk: 'medium',
    minBudget: 15000,
    skillLevel: 'beginner',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 1,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Clear low-threat bunkers of hostile NPCs. Decent pay for beginners who can handle basic FPS combat.',
    tips: [
      'Bring medpens and a spare helmet in your ship inventory.',
      'Clear rooms methodically — check corners and doorways.',
      'A Cutlass Red parked nearby gives you a respawn point.'
    ],
    confidence: 'high',
    overhead: 'Buy basic armor and weapons, fly to bunker location.',
    setupTime: 10,
    consistency: 'consistent',
    bestWith: ['avenger-titan', 'cutlass-black', 'pisces'],
    explanation: 'Low-tier bunker missions pay 15-20k each and take roughly 15-20 minutes including travel. Looting adds minor extra income.',
    steps: [
      'Purchase light armor and a ballistic rifle from a weapon shop at any major landing zone.',
      'Stock up on medpens (3-5) and ammo magazines.',
      'Accept a low-threat bunker mission from the Contract Manager.',
      'Fly to the bunker marker, land nearby on flat ground, and enter on foot.',
      'Clear each room methodically — peek corners, listen for footsteps, and use short bursts.',
      'After clearing all hostiles, loot bodies for bonus gear and return to your ship.'
    ],
    locations: ['Hurston (HDMS sites)', 'Crusader (Kareah vicinity)', 'microTech (surface bunkers)', 'ArcCorp (Wala moon bunkers)'],
    gear: ['Light armor set (Pembroke or TrueDef)', 'Ballistic rifle (Gallant or Klaus & Werner)', 'Medpens x5', 'Extra magazines x4'],
    reputation: null,
    loadout: 'Any ship that can land near a bunker. Cutlass Red is ideal for the medical bed respawn.',
    beginnerTips: [
      'Crouch when entering rooms — it reduces your profile and improves accuracy.',
      'Do NOT shoot the friendly NPCs (green markers) — killing them gives a crimestat.',
      'If you die, your gear stays on your body. You can return to loot yourself.',
      'Start with the easiest bunker missions (Assist in Removing Illegal Occupants).'
    ],
    advancedTips: [
      'Speed-run by sprinting through with a shotgun for maximum missions per hour.',
      'Bring a tractor beam to quickly stack loot near the elevator.',
      'Chain bunker missions on the same moon to minimize travel time.'
    ],
    risks: [
      'Accidentally shooting a friendly NPC gives you a crimestat and fails the mission.',
      'Getting killed means losing your equipped armor and weapons.',
      'Other players can ambush you at bunker entrances — check radar before landing.'
    ],
    patchNotes: '4.6 — Bunker AI improved with better pathing. Friendly NPC markers are now more visible.',
    avoidIf: [
      'You are uncomfortable with FPS combat mechanics.',
      'You cannot afford to replace gear if killed (need ~15k buffer).',
      'The server is heavily populated — other players may contest bunkers.'
    ]
  },
  {
    id: 'racing',
    name: 'Racing',
    category: 'other',
    aUEChr: 30000,
    aUEChrLow: 20000,
    aUEChrHigh: 40000,
    risk: 'low',
    minBudget: 0,
    skillLevel: 'intermediate',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Participate in scramble races for aUEC rewards. Fun but not highly profitable compared to other methods.',
    tips: [
      'Practice the track layout before racing competitively.',
      'Smaller, more agile ships tend to perform better in tight courses.',
      'Completing races builds rep even if you don\'t win.'
    ],
    confidence: 'medium',
    overhead: 'Travel to race location and queue for events.',
    setupTime: 10,
    consistency: 'variable',
    bestWith: ['arrow', 'gladius', 'mustang-delta', 'pisces'],
    explanation: 'Race payouts range 5-15k per race depending on placement. 2-4 races per hour with queue and travel time.',
    steps: [
      'Travel to a race event location (check Contract Manager for active races).',
      'Accept the race mission and wait for the event to start.',
      'Fly through each checkpoint in order — missing one disqualifies your lap.',
      'Focus on smooth racing lines rather than maximum speed through turns.',
      'Complete all laps and place as high as possible for better payout.',
      'Queue for the next race or travel to another race location.'
    ],
    locations: ['Crusader (Old Vanderval racecourse)', 'microTech (ice canyon races)', 'Hurston (desert surface courses)', 'Various orbital racecourses'],
    gear: ['Fast, agile ship (Arrow, Gladius, Razor)', 'No special equipment needed'],
    reputation: null,
    loadout: 'Arrow or Razor for best racing performance. Strip unnecessary components for weight reduction if min-maxing.',
    beginnerTips: [
      'Practice the track in free-fly before competing for money.',
      'Focus on finishing races consistently rather than winning immediately.',
      'Use third-person view for better spatial awareness around checkpoints.',
      'Racing builds reputation even with low placements.'
    ],
    advancedTips: [
      'Learn racing lines and brake points for each track.',
      'Use decoupled mode for tighter turns around checkpoints.',
      'The Razor is the fastest dedicated racer but expensive — Arrow is a great budget option.',
      'Time your boosts for straightaways, not turns.'
    ],
    risks: [
      'Collision with obstacles or other racers can destroy your ship.',
      'Low payout makes this more fun than profitable.',
      'Queue times can eat into your earning rate.'
    ],
    patchNotes: '4.6 — New racecourses added. Race payouts slightly increased. Checkpoint detection improved.',
    avoidIf: [
      'You want serious income — racing pays the least of any method.',
      'You dislike competitive PvP events.',
      'You do not have a fast, maneuverable ship.'
    ]
  },
  {
    id: 'cargo-smuggling',
    name: 'Cargo Smuggling',
    category: 'cargo',
    aUEChr: 200000,
    aUEChrLow: 100000,
    aUEChrHigh: 300000,
    risk: 'high',
    minBudget: 50000,
    skillLevel: 'advanced',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: true,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Run illegal commodities like Slam or Maze for high margins. Huge profits if successful, devastating losses if caught. Pyro system is ideal for smuggling with no law enforcement.',
    tips: [
      'Avoid major trade hubs where security scans are frequent.',
      'Use fast ships to outrun patrols — the Mercury Star Runner excels here.',
      'Never carry more than you can afford to lose.',
      'Pyro system is completely lawless — no security scans but PvP pirates are common.'
    ],
    confidence: 'low',
    overhead: 'Locate black market sellers. Plan route avoiding security. Purchase illegal cargo.',
    setupTime: 15,
    consistency: 'volatile',
    bestWith: ['mercury-star-runner', 'freelancer-max', 'caterpillar', 'c2-hercules'],
    explanation: 'Illegal commodities have 2-3x margins vs legal goods but seizure or destruction means total loss. Rate assumes 70% success rate.',
    steps: [
      'Locate a drug lab or black market vendor — these are unmarked outposts on moons.',
      'Purchase illegal commodities (Slam, Maze, WiDoW, or Neon).',
      'Plan a route that avoids comm arrays and security patrol zones.',
      'Disable your transponder if possible and fly at speed to the sell point.',
      'Sell at a black market buyer or drug-friendly outpost.',
      'Repeat with profits — always keep a reserve you can afford to lose.'
    ],
    locations: ['Jumptown (drug lab on Yela)', 'Nuen Waste Management (Daymar)', 'Benson Mining on Daymar', 'GrimHEX (fence/black market)', 'Pyro system (completely lawless — ideal for smuggling operations)'],
    gear: ['Fast cargo ship with good quantum drive', 'Starting capital (minimum 50k)', 'Knowledge of drug lab locations'],
    reputation: null,
    loadout: 'Mercury Star Runner is purpose-built for smuggling — shielded cargo bay and fast quantum. Freelancer MAX for budget smuggling.',
    beginnerTips: [
      'Do NOT attempt smuggling until you understand crime and security mechanics.',
      'Start with small amounts to learn routes before risking large investments.',
      'A crimestat means security forces will attack you on sight.',
      'GrimHEX is a safe haven for criminals — you can sell and resupply there.'
    ],
    advancedTips: [
      'Time your runs when server population is low for fewer player pirates.',
      'Use the Mercury Star Runner shielded cargo bay to avoid scans.',
      'Run multiple small loads rather than one massive haul to reduce risk per run.',
      'Keep a crimestat-clearing route planned in case things go wrong.',
      'Use Pyro as a transit route to avoid Stanton security entirely.'
    ],
    risks: [
      'Getting caught means total cargo loss plus a crimestat bounty on your head.',
      'Player pirates specifically target known smuggling routes.',
      'Security scans at stations will detect illegal cargo and engage.',
      'Your entire investment is at risk every single run.',
      '30k server crashes destroy your illegal cargo with no compensation.'
    ],
    patchNotes: '4.6 — Smuggling routes expanded with Pyro system fully accessible. Security scanning improved in Stanton. New illegal commodities added.',
    avoidIf: [
      'You cannot afford to lose your entire investment.',
      'You are risk-averse — smuggling is the highest-variance method.',
      'You do not know drug lab locations and sell points.',
      'You have a clean reputation you want to maintain.',
      'Server stability is poor — crashes lose everything.'
    ]
  },
  {
    id: 'box-delivery',
    name: 'Box Delivery Missions',
    category: 'mission',
    aUEChr: 20000,
    aUEChrLow: 15000,
    aUEChrHigh: 25000,
    risk: 'low',
    minBudget: 0,
    skillLevel: 'beginner',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Pick up boxes and deliver them between stations. Low pay but zero risk and no gear requirements.',
    tips: [
      'Stack multiple delivery missions going to the same destination.',
      'Use a fast ship with interior space like the Pisces for quick runs.',
      'Prioritize missions that share pickup or dropoff locations.'
    ],
    confidence: 'high',
    overhead: 'Accept missions and fly to pickup points. Minimal prep.',
    setupTime: 5,
    consistency: 'very-consistent',
    bestWith: ['pisces', 'avenger-titan', '300i'],
    explanation: 'Based on completing 3-5 delivery missions per hour at 4-6k each. Higher end assumes efficient stacking.',
    steps: [
      'Open your MobiGlas and navigate to the Contract Manager.',
      'Accept 3-5 delivery missions that share pickup or dropoff locations.',
      'Fly to the first pickup point, exit your ship, and grab the box.',
      'Store boxes in your ship interior — do not place them on external surfaces.',
      'Fly to each dropoff location and place the box on the marked delivery pad.',
      'Return to a terminal to accept a new batch of missions.'
    ],
    locations: ['Hurston', 'microTech', 'ArcCorp', 'Crusader', 'Port Olisar', 'Everus Harbor', 'Bajini Point'],
    gear: ['No special gear required', 'Flight suit with helmet for EVA deliveries'],
    reputation: null,
    loadout: 'Any ship with interior space. Pisces or Avenger Titan are ideal for quick entry/exit.',
    beginnerTips: [
      'Start with missions around one planet to learn the locations.',
      'Read the delivery address carefully — some drop points are inside stations, not outside.',
      'If a box glitches through the floor, abandon and take a new mission.'
    ],
    advancedTips: [
      'Map out efficient loops hitting 3+ destinations per trip.',
      'Use the Pisces for its fast entry/exit and low claim time if destroyed.',
      'Stack missions from multiple terminals at different stations for maximum density.'
    ],
    risks: [
      'Boxes can clip through surfaces — place them gently on flat ground.',
      'Server crashes lose all undelivered boxes with no compensation.',
      'Some delivery points are in armistice zones that may have hostile players loitering.'
    ],
    patchNotes: '4.6 — Delivery missions are stable and reliable. Box physics improved but occasional clipping still occurs.',
    avoidIf: [
      'You want high income — this is the lowest-paying method.',
      'Servers are unstable — you lose all progress on a 30k disconnect.',
      'You find repetitive flying boring — there is no combat or skill challenge.'
    ]
  },
  {
    id: 'medical-rescue',
    name: 'Medical Rescue',
    category: 'mission',
    aUEChr: 45000,
    aUEChrLow: 30000,
    aUEChrHigh: 60000,
    risk: 'low',
    minBudget: 5000,
    skillLevel: 'beginner',
    soloFriendly: true,
    groupBonus: null,
    requiresShipId: null,
    requiresCombat: 0,
    requiresCargo: false,
    requiresMining: false,
    requiresSalvage: false,
    requiresROC: false,
    desc: 'Respond to medical beacons and rescue downed players or NPCs. Rewarding gameplay with moderate pay.',
    tips: [
      'Always carry medpens and a medical tool.',
      'A Cutlass Red gives you a mobile spawn and medical bed.',
      'Respond quickly — beacons expire and players may give up.'
    ],
    confidence: 'low',
    overhead: 'Buy medical supplies. Wait for or seek rescue beacons.',
    setupTime: 5,
    consistency: 'volatile',
    bestWith: ['cutlass-red', 'pisces', 'avenger-titan'],
    explanation: 'Medical missions pay 8-15k each. Beacon frequency is unpredictable. Rate assumes 3-5 rescues per hour in a populated server.',
    steps: [
      'Purchase a medical tool (ParaMed or CureLife) and medpens from a medical supply shop.',
      'Equip the medical tool in your multitool slot.',
      'Monitor the Contract Manager for medical rescue beacons.',
      'Accept a beacon and quantum travel to the patient location.',
      'Locate the downed player/NPC, apply the medical tool to stabilize, then use medpens to heal.',
      'If using a Cutlass Red, bring the patient to your medical bed for full recovery.'
    ],
    locations: ['Anywhere players are active (Crusader and Hurston are busiest)', 'Near bunkers (common injury location)', 'Near mining sites (common accident location)', 'Port Olisar (hub area)', 'Pyro (lawless — rescues here are high-risk but rewarding)'],
    gear: ['Medical tool (ParaMed or CureLife)', 'Medpens x10', 'Medgun (optional, for faster healing)', 'Large backpack for extra supplies'],
    reputation: null,
    loadout: 'Cutlass Red is the gold standard — medical bed, fast, and affordable. Any ship works for basic medpen rescues.',
    beginnerTips: [
      'Medical gameplay is a great way to meet other players and learn the game.',
      'You do not need a Cutlass Red — medpens and a medical tool work fine.',
      'Respond to beacons quickly — patients may bleed out or log off.',
      'Practice using the medical tool on yourself or friends first.'
    ],
    advancedTips: [
      'Position yourself near popular bunker locations for fastest response times.',
      'The Cutlass Red medical bed can revive fully dead players — not just stabilize.',
      'Combine medical runs with bunker clearing — heal yourself, then help others in the area.',
      'Join medical-focused organizations for coordinated rescue operations.'
    ],
    risks: [
      'Some medical beacons are traps — players may ambush rescuers for gear.',
      'Beacon frequency is unpredictable — some sessions have no beacons at all.',
      'Travel time to remote beacons can eat into your hourly rate.',
      'Players may give up and respawn before you arrive, wasting your trip.',
      'Pyro rescues carry significant PvP risk in lawless space.'
    ],
    patchNotes: '4.6 — Medical gameplay expanded with more rescue mission types. Medical tool UI improved. Beacon system more reliable.',
    avoidIf: [
      'You want consistent, predictable income — beacons are random.',
      'You are in an empty server — no players means no beacons.',
      'You dislike helping other players — this is a service role.',
      'You want high income — medical pay is modest.'
    ]
  }
];

/**
 * Look up an earning method by its ID.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getMethodById(id) {
  return methods.find(m => m.id === id);
}
