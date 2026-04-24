// ======================================================
// VOID FORGE - ENGINE V3.2
// ======================================================

// 1. CONFIGURACIÓN
const CONFIG = {
    upgrades: [
        { id: 1, name: "Void Spark", icon: "✨", baseCost: 150, manualDamage: 12 },
        { id: 2, name: "Echo Fragment", icon: "🔊", baseCost: 8000, manualDamage: 45 },
        { id: 3, name: "Nebula Weaver", icon: "🌌", baseCost: 250000, manualDamage: 160 },
        { id: 4, name: "Rift Anchor", icon: "🌊", baseCost: 8000000, manualDamage: 520 },
    ],
    dpsImprovements: [
        { id: 101, upgradeId: 1, name: "Void Spark DPS", maxLevel: 5, baseCost: 40000, multiplier: 0.20 },
        { id: 201, upgradeId: 2, name: "Echo Fragment DPS", maxLevel: 5, baseCost: 500000, multiplier: 0.28 },
        { id: 301, upgradeId: 3, name: "Nebula Weaver DPS", maxLevel: 5, baseCost: 8000000, multiplier: 0.60 },
        { id: 401, upgradeId: 4, name: "Rift Anchor DPS", maxLevel: 5, baseCost: 30000000, multiplier: 0.90 },
    ],
    bosses: [
        { id: 1, name: "The Void Wraith", icon: "👻", baseHP: 50000, essenceReward: 150 },
        { id: 2, name: "Nebula Devourer", icon: "🌌", baseHP: 300000, essenceReward: 600 },
        { id: 3, name: "Rift Colossus", icon: "🌊", baseHP: 1500000, essenceReward: 3000 },
        { id: 4, name: "The Event Horizon", icon: "🌑", baseHP: 8000000, essenceReward: 18000, isFinal: true },
    ],
   prestigeNodes: [
    // TIER 1 — disponible desde prestige 1, costes bajos
    { id: 101, prestigeId: 1, cost: 200, name: "Essence Surge",   icon: "⚡", description: "Aumenta la esencia ganada en un 10%.", essenceRatio: 0.10 },
    { id: 102, prestigeId: 1, cost: 200, name: "Shard Mastery",   icon: "💎", description: "Reduce el coste de los Boss Trials en un 5%.", costInShards: 0.05 },
    { id: 103, prestigeId: 1, cost: 250, name: "Eternal Growth",  icon: "🌱", description: "Reduce el crecimiento de costes de upgrades en un 2%.", baseCost: 1.02 },
    { id: 104, prestigeId: 1, cost: 250, name: "Loop Resilience", icon: "🛡️", description: "Reduce el HP de bosses por loop en un 5%.", scalingPerLoop: 0.95 },

    // TIER 2 — disponible desde prestige 3, costes medios
    { id: 201, prestigeId: 2, cost: 600, name: "Manual Mastery",      icon: "👊", description: "Aumenta el daño manual en un 15%.", manualDamage: 0.15 },
    { id: 202, prestigeId: 2, cost: 600, name: "DPS Synergy",         icon: "🤝", description: "Aumenta el multiplicador de DPS en un 10%.", multiplier: 0.10 },
    { id: 203, prestigeId: 2, cost: 600, name: "Essence Efficiency",  icon: "♻️", description: "Reduce el coste de mejoras DPS en un 10%.", baseCost: 0.90 },
    { id: 204, prestigeId: 2, cost: 800, name: "Shard Hoarder",       icon: "🧤", description: "Aumenta shards ganados en Trials en un 10%.", shardsPerBoss: 0.10 },

    // TIER 3 — disponible desde prestige 15, costes altos
    { id: 301, prestigeId: 3, cost: 2500, name: "Loop Mastery",      icon: "🔁", description: "Cada loop aumenta la esencia ganada en un 20%.", essencePerLoop: 0.20 },
    { id: 302, prestigeId: 3, cost: 2500, name: "Trial Veteran",     icon: "🏅", description: "Trials otorgan un 15% más de esencia y shards.", essenceReward: 0.15 },
    { id: 303, prestigeId: 3, cost: 2500, name: "DPS Overdrive",     icon: "🚀", description: "Aumenta tu DPS total en un 25%.", dpsMultiplier: 0.25 },
    { id: 304, prestigeId: 3, cost: 3500, name: "Upgrade Overhaul",  icon: "⚙️", description: "Reduce el coste de upgrades en un 15%.", baseCost: 0.85 },
],
    prestigeCost: {
        tier1: { id: 1, shardCost: 800, essenceCost: 5000 },
        tier2: { id: 2, shardCost: 2500, essenceCost: 50000 },
        tier3: { id: 3, shardCost: 8000, essenceCost: 500000 },
    },
    trialMode: {
        costInShards: 50,
        shardsPerBoss: [8, 18, 35, 80],
        difficultyRange: [0.8, 1.5],
        essenceReward: 80,
    },
    scalingPerLoop: 1.45,
    growth: { upgrade: 1.38, dps: 1.30 },
    essenceRatio: 0.25,
};

// 2. ESTADO
let lastClickTime = 0;
const CLICK_THROTTLE_MS = 50;

const gameState = {
    essence: 0,
    shards: 0,
    damageDone: 0,
    bossIndex: 0,
    loopCount: 0,
    bossMaxHP: 100000,
    bossCurrentHP: 100000,
    hintDismissed: false,
    trialActive: false,
    upgradesOwned: Object.fromEntries(
        CONFIG.upgrades.map((u, i) => [u.id, i === 0 ? 1 : 0]) //
    ),
    dpsLevels: Object.fromEntries(
        CONFIG.dpsImprovements.map(d => [d.id, 0])
    ),
};

const prestigeState = {
    prestigeCount: 1,
    unlockedNodes: Object.fromEntries(
        CONFIG.prestigeNodes.map(n => [n.id, 0])
    )
}

// 3. DOM
const elements = {
    essence: document.getElementById('essence'),
    damageDone: document.getElementById('damage-done'),
    dps: document.getElementById('dps'),
    healthFill: document.getElementById('health-fill'),
    hpText: document.getElementById('boss-hp-text'),
    upgradesContainer: document.getElementById('upgrades'),
    dpsMainBtn: document.getElementById('dps-improves-btn'),
    bossTrialsBtn: document.getElementById('boss-trials-btn'),
    dpsModal: document.getElementById('dps-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    dpsList: document.getElementById('dps-improves-list'),
    prestigeNodes: document.getElementById('prestige-nodes-list'),
};

// 4. UTILIDADES
const formatNumber = (num) => Math.floor(num).toLocaleString('es-ES');
const getCost = (base, growth, level) => Math.floor(base * Math.pow(growth, level));

let cachedDPS = 0;
function getConfigHash() {
    const str = JSON.stringify({
        upgrades: CONFIG.upgrades.map(u => ({ id: u.id, baseCost: u.baseCost })),
        dpsImprovements: CONFIG.dpsImprovements.map(d => ({ id: d.id, baseCost: d.baseCost })),
        bosses: CONFIG.bosses.map(b => ({ id: b.id, baseHP: b.baseHP })),
    });
    // Hash simple pero suficiente
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36); // ej: "1k4zx9"
}

function updateCachedDPS() {
    const rawDPS = CONFIG.dpsImprovements.reduce((total, conf) => {
        const level = gameState.dpsLevels[conf.id] || 0;
        const owned = gameState.upgradesOwned[conf.upgradeId] || 0;
        if (level === 0 || owned === 0) return total;
        const baseUpg = CONFIG.upgrades.find(u => u.id === conf.upgradeId);
        return total + (baseUpg.manualDamage * conf.multiplier * level * owned);
    }, 0);

    const manualDamage = calculateManualDamage();
    const hardCap = manualDamage * 0.85;

    if (rawDPS > hardCap) {
        console.warn(`DPS cap triggered: raw=${rawDPS.toFixed(0)} capped=${hardCap.toFixed(0)}`);
    }

    cachedDPS = Math.min(rawDPS, hardCap);
}

function getBossHP(bossConfig) {
    return Math.floor(bossConfig.baseHP * Math.pow(CONFIG.scalingPerLoop, gameState.loopCount));
}

function triggerButtonFeedback(btn) {
    btn.classList.remove('clicked')
    void btn.offsetWidth;
    btn.classList.add('clicked');
    btn.addEventListener('animationend', () => btn.classList.remove('clicked'), { once: true });
}

function getPrestigeCost() {
    const count = prestigeState.prestigeCount;

    if (count < 1) return [CONFIG.prestigeCost.tier1.shardCost, CONFIG.prestigeCost.tier1.essenceCost];
    if (count < 3) return [CONFIG.prestigeCost.tier2.shardCost, CONFIG.prestigeCost.tier2.essenceCost];
    return [CONFIG.prestigeCost.tier3.shardCost, CONFIG.prestigeCost.tier3.essenceCost];
}

function canPrestige() {
    const [shardCost, essenceCost] = getPrestigeCost();
    return gameState.essence >= essenceCost && gameState.shards >= shardCost;
}

// 5. ACCIONES
function applyDamage(amount) {
    if (gameState.bossCurrentHP <= 0) return;
    gameState.bossCurrentHP = Math.max(0, gameState.bossCurrentHP - amount);
    gameState.damageDone += amount;
    gameState.essence += amount * CONFIG.essenceRatio;

    if (gameState.bossCurrentHP <= 0) {
        onBossDeath();
    }
}

function handlePurchase(id, isDPS = false) {
    const conf = isDPS
        ? CONFIG.dpsImprovements.find(i => i.id === id)
        : CONFIG.upgrades.find(u => u.id === id);

    const level = isDPS ? gameState.dpsLevels[id] : (gameState.upgradesOwned[id] || 0);
    const cost = getCost(conf.baseCost, isDPS ? CONFIG.growth.dps : CONFIG.growth.upgrade, level);

    if (gameState.essence < cost || (isDPS && level >= conf.maxLevel)) return;

    gameState.essence -= cost;
    if (isDPS) {
        gameState.dpsLevels[id]++;
        updateDPSCards();
    } else {
        gameState.upgradesOwned[id] = (gameState.upgradesOwned[id] || 0) + 1;
        updateUpgradeCards();
    }

    updateCachedDPS();
    saveGame();
}

function handlePrestigeNodePurchase(nodeId) {
    const node = CONFIG.prestigeNodes.find(n => n.id === nodeId);
    if (!node) return;

    // El tier disponible se saca del prestigeId del nodo
    const tierUnlocked = prestigeState.prestigeCount >= node.prestigeId;

    if (prestigeState.unlockedNodes[nodeId] === 1) return;
    if (!tierUnlocked) return;                            
    if (gameState.shards < node.cost) return;             

    gameState.shards -= node.cost;
    prestigeState.unlockedNodes[nodeId] = 1;

    updateShardDisplay();
    updatePrestigeNodes();
    savePrestige();
    saveGame();
}

function spawnCurrentBoss() {
    const bossConfig = CONFIG.bosses[gameState.bossIndex];
    gameState.bossMaxHP = getBossHP(bossConfig);
    gameState.bossCurrentHP = gameState.bossMaxHP;

    document.getElementById('boss-name').textContent = bossConfig.name;
    document.getElementById('boss-visual').textContent = bossConfig.icon;
}

function onBossDeath() {
    const bossConfig = CONFIG.bosses[gameState.bossIndex];

    gameState.essence += bossConfig.essenceReward * (gameState.loopCount + 1);

    const shards = CONFIG.trialMode.shardsPerBoss[gameState.bossIndex] || 0;
    gameState.shards += shards;

    gameState.bossIndex++;
    if (gameState.bossIndex >= CONFIG.bosses.length) {
        gameState.bossIndex = 0;
        gameState.loopCount++;
    }

    spawnCurrentBoss();
    saveGame();
}

function calculateManualDamage() {
    return CONFIG.upgrades.reduce((total, conf) => {
        const owned = gameState.upgradesOwned[conf.id] || 0;
        return total + (conf.manualDamage * owned);
    }, 0);
}

function prestigeReset() {
    if (!canPrestige()) return;

    prestigeState.prestigeCount++;

    gameState.essence = 0;
    gameState.damageDone = 0;
    gameState.bossIndex = 0;
    gameState.loopCount = 0;
    gameState.hintDismissed = true;
    // gameState.bossMaxHP = CONFIG.bosses[0].baseHP;
    // gameState.bossCurrentHP = CONFIG.bosses[0].baseHP;
    gameState.upgradesOwned = Object.fromEntries(
        CONFIG.upgrades.map(u => [u.id, u.id === 1 ? 1 : 0])
    );
    gameState.dpsLevels = Object.fromEntries(
        CONFIG.dpsImprovements.map(d => [d.id, 0])
    );

    spawnCurrentBoss();
    updateCachedDPS();
    savePrestige();
    saveGame();
}

// 6. RENDER
function renderUpgrades() {
    elements.upgradesContainer.innerHTML = CONFIG.upgrades.map(conf => `
        <div id="card-${conf.id}" class="upgrade">
            <div class="upgrade-header">
                <span>${conf.icon} <strong>${conf.name}</strong></span>
                <span class="count">×0</span>
            </div>
            <div class="upgrade-info">
                Coste: <strong class="cost-val">0</strong> Essence<br>
                Damage: <strong class="damage-val">0</strong> Dmg
            </div>
            <div class="upgrade-buttons">
                <button class="buy-btn" data-id="${conf.id}">COMPRAR</button>
            </div>
        </div>
    `).join('');
    updateUpgradeCards();
}

function updateUpgradeCards() {
    CONFIG.upgrades.forEach(conf => {
        const card = document.getElementById(`card-${conf.id}`);
        if (!card) return;

        const owned = gameState.upgradesOwned[conf.id] || 0;
        const cost = getCost(conf.baseCost, CONFIG.growth.upgrade, owned);
        const canAfford = gameState.essence >= cost;

        card.querySelector('.count').textContent = `×${owned}`;
        card.querySelector('.cost-val').textContent = formatNumber(cost);
        card.querySelector('.damage-val').textContent = formatNumber(conf.manualDamage * owned);
        card.querySelector('.buy-btn').disabled = !canAfford;

        card.classList.toggle('locked', owned === 0 && !canAfford);
    });
}

function renderDPSImprovements() {
    elements.dpsList.innerHTML = CONFIG.dpsImprovements.map(conf => `
        <div class="dps-item" id="dps-card-${conf.id}">
            <h3>${conf.name}</h3>
            <p class="dps-level"></p>
            <button class="dps-buy-btn" data-dps-id="${conf.id}"></button>
        </div>
    `).join('');
    updateDPSCards();
}

function updateDPSCards() {
    CONFIG.dpsImprovements.forEach(conf => {
        const card = document.getElementById(`dps-card-${conf.id}`);
        if (!card) return;

        // const lvl = gameState.dpsLevels[conf.id] || 0;
        const lvl = gameState.dpsLevels[conf.id];
        const cost = getCost(conf.baseCost, CONFIG.growth.dps, lvl);
        const isMax = lvl >= conf.maxLevel;

        card.querySelector('.dps-level').textContent =
            `Nivel ${lvl}/${conf.maxLevel} (+${(conf.multiplier * 100).toFixed(0)}% por unidad)`;

        const btn = card.querySelector('.dps-buy-btn');
        btn.textContent = isMax ? 'MÁXIMO' : 'MEJORAR: ' + formatNumber(cost);
        btn.disabled = gameState.essence < cost || isMax;
    });
}

function renderPrestigeNodes() {
    elements.prestigeNodes.innerHTML = CONFIG.prestigeNodes.map(conf => `
        <div class="prestige-node" id="prestige-node-${conf.id}">
            <h3>${conf.icon} ${conf.name}</h3>
            <p>${conf.description}</p>
            <button class="prestige-buy-btn" data-prestige-id="${conf.id}"></button>
        </div>
    `).join('');
    updatePrestigeNodes();
}

function updatePrestigeNodes() {
    CONFIG.prestigeNodes.forEach(conf => {
        const node = document.getElementById(`prestige-node-${conf.id}`);
        if (!node) return;

        const isUnlocked = prestigeState.unlockedNodes[conf.id] === 1;
        const tierAvailable = prestigeState.prestigeCount >= conf.prestigeId;
        const canAfford = gameState.shards >= conf.cost;

        const btn = node.querySelector('.prestige-buy-btn');

        if (isUnlocked) {
            btn.textContent = '✅ DESBLOQUEADO';
            btn.disabled = true;
        } else if (!tierAvailable) {
            btn.textContent = `🔒 Requiere prestigio ${conf.prestigeId}`;
            btn.disabled = true;
        } else {
            btn.textContent = `DESBLOQUEAR: ${formatNumber(conf.cost)} Shards`;
            btn.disabled = !canAfford;
        }

        node.classList.toggle('unlocked', isUnlocked);
        node.classList.toggle('tier-locked', !tierAvailable);
    });
}

function spawnDamageNumber(damage, event) {
    const wrapper = document.querySelector('.boss-visual-wrapper');
    const rect = wrapper.getBoundingClientRect();

    const el = document.createElement('span');
    el.className = 'damage-number';
    el.textContent = `-${formatNumber(damage)}`;

    el.style.left = `${20 + Math.random() * 60}%`;
    el.style.top = '30%'

    wrapper.style.position = 'relative';
    wrapper.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
}

// 7. GAME LOOP
let lastTime = performance.now();
let lastEssenceInt = -1;
let lastDPSAnimTime = 0;
const DPS_ANIM_INTERVAL = 1.0

function tick(delta) {
    if (cachedDPS <= 0) return;


    applyDamage(cachedDPS * delta);

    lastDPSAnimTime += delta;
    if (lastDPSAnimTime >= DPS_ANIM_INTERVAL) {
        lastDPSAnimTime = 0;
        spawnDamageNumber(cachedDPS);
        triggerBossHitAnimation();
    }
}

function render() {
    const currentEssenceInt = Math.floor(gameState.essence);
    if (currentEssenceInt !== lastEssenceInt) {
        updateUpgradeCards();
        if (elements.dpsModal.style.display === 'flex') renderDPSImprovements();
        lastEssenceInt = currentEssenceInt;
    }

    elements.essence.textContent = formatNumber(gameState.essence);
    elements.dps.textContent = cachedDPS.toFixed(1);
    elements.damageDone.textContent = `${formatNumber(gameState.damageDone)}`;

    const hpPercent = (gameState.bossCurrentHP / gameState.bossMaxHP) * 100;
    elements.healthFill.style.width = `${Math.max(0, hpPercent)}%`;
    elements.hpText.textContent = `${formatNumber(gameState.bossCurrentHP)} / ${formatNumber(gameState.bossMaxHP)}`;

    const loopEl = document.getElementById('loop-count');
    if (loopEl) loopEl.textContent = gameState.loopCount;

    if (elements.dpsModal.style.display === 'flex') {
        document.getElementById('modal-essence').textContent = formatNumber(gameState.essence);
    }

    updateShardDisplay();

}

function gameLoop(currentTime) {
    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    tick(delta);
    render();

    requestAnimationFrame(gameLoop);
}

// ====================== TRIAL MODE ======================

// Boss del trial — se genera al abrir el modal
let currentTrialBoss = null;

function generateTrialBoss() {
    const manualDamage = calculateManualDamage();
    const [minMult, maxMult] = CONFIG.trialMode.difficultyRange;
    const multiplier = minMult + Math.random() * (maxMult - minMult);

    // HP del trial = tu daño manual × multiplicador aleatorio
    const hp = Math.floor(manualDamage * multiplier);

    // Boss visual aleatorio de la lista de bosses normales
    const randomBoss = CONFIG.bosses[Math.floor(Math.random() * CONFIG.bosses.length)];

    currentTrialBoss = {
        name: `${randomBoss.name} — Trial`,
        icon: randomBoss.icon,
        hp,
        multiplier: parseFloat(multiplier.toFixed(2)),
    };
}

function openTrialModal() {
    generateTrialBoss();

    const manualDamage = calculateManualDamage();
    const canWin = manualDamage >= currentTrialBoss.hp;
    const hasShards = gameState.shards >= CONFIG.trialMode.costInShards;

    document.getElementById('trial-boss-icon').textContent = currentTrialBoss.icon;
    document.getElementById('trial-boss-name').textContent = currentTrialBoss.name;
    document.getElementById('trial-boss-hp').textContent =
        `HP: ${formatNumber(currentTrialBoss.hp)}`;

    document.getElementById('trial-manual-damage').innerHTML =
        `Tu daño manual: <strong>${formatNumber(manualDamage)}</strong>`;

    const hintEl = document.getElementById('trial-result-hint');
    if (canWin) {
        hintEl.textContent = '✅ Puedes matarlo de un golpe';
        hintEl.className = 'trial-hint can-win';
    } else {
        hintEl.textContent = `❌ Te falta ${formatNumber(currentTrialBoss.hp - manualDamage)} de daño`;
        hintEl.className = 'trial-hint cant-win';
    }

    const enterBtn = document.getElementById('trial-enter-btn');
    enterBtn.textContent = `⚔️ ENTRAR AL TRIAL (${CONFIG.trialMode.costInShards} Shards)`;
    enterBtn.disabled = !hasShards;

    document.getElementById('trial-modal').style.display = 'flex';
    document.getElementById('modal-shards').textContent = formatNumber(gameState.shards);
}

function handleTrialAttempt() {
    if (!currentTrialBoss) return;
    if (gameState.shards < CONFIG.trialMode.costInShards) return;

    // Gastar shards
    gameState.shards -= CONFIG.trialMode.costInShards;

    const manualDamage = calculateManualDamage();
    const modalContent = document.querySelector('#trial-modal .modal-content');

    if (manualDamage >= currentTrialBoss.hp) {
        // ✅ VICTORIA
        const reward = Math.floor(manualDamage * CONFIG.trialMode.essenceReward);
        gameState.essence += reward;

        modalContent.classList.add('trial-win-flash');
        document.getElementById('trial-result-hint').textContent =
            `🏆 ¡Victoria! +${formatNumber(reward)} Essence`;
        document.getElementById('trial-result-hint').className = 'trial-hint can-win';

        modalContent.addEventListener('animationend',
            () => modalContent.classList.remove('trial-win-flash'), { once: true });
    } else {
        // ❌ DERROTA
        modalContent.classList.add('trial-fail-flash');
        document.getElementById('trial-result-hint').textContent =
            `💀 Fallado — el boss tenía ${formatNumber(currentTrialBoss.hp - manualDamage)} HP de más`;
        document.getElementById('trial-result-hint').className = 'trial-hint cant-win';

        modalContent.addEventListener('animationend',
            () => modalContent.classList.remove('trial-fail-flash'), { once: true });
    }

    // El boss cambia — el próximo trial será diferente
    currentTrialBoss = null;

    // Deshabilitar botón hasta cerrar y volver a abrir
    document.getElementById('trial-enter-btn').disabled = true;

    saveGame();
    updateShardDisplay();
}

function updateShardDisplay() {
    const shardEl = document.getElementById('shards');
    if (shardEl) shardEl.textContent = formatNumber(gameState.shards);

    const modalShardEl = document.getElementById('modal-shards');
    if (modalShardEl) modalShardEl.textContent = formatNumber(gameState.shards);

    const prestigeShardEl = document.getElementById('prestige-modal-shards');
    if (prestigeShardEl) prestigeShardEl.textContent = formatNumber(gameState.shards);

    const prestigeEssenceEl = document.getElementById('prestige-modal-essence');
    if (prestigeEssenceEl) prestigeEssenceEl.textContent = formatNumber(gameState.essence);

    // Activar/desactivar botón de trials según shards
    // if (elements.bossTrialsBtn) {
    //     elements.bossTrialsBtn.disabled =
    //         gameState.shards < CONFIG.trialMode.costInShards;
    // }
}

function triggerBossHitAnimation() {
    const bossEl = document.getElementById('boss-visual');
    bossEl.classList.remove('hit');
    void bossEl.offsetWidth;
    bossEl.classList.add('hit');
    bossEl.addEventListener('animationend', () => bossEl.classList.remove('hit'), { once: true });
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 8. EVENTOS
function setupListeners() {

    // ── Compras por delegación ──────────────────────────────
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            handlePurchase(parseInt(e.target.dataset.id));
            triggerButtonFeedback(e.target);
        }
        if (e.target.classList.contains('dps-buy-btn')) {
            handlePurchase(parseInt(e.target.dataset.dpsId), true);
            triggerButtonFeedback(e.target);
        }
        if (e.target.classList.contains('prestige-buy-btn')) {
            handlePrestigeNodePurchase(parseInt(e.target.dataset.prestigeId));
            triggerButtonFeedback(e.target);
        }
    });

    // ── Click en el boss ────────────────────────────────────
    document.querySelector('.boss-visual-wrapper').addEventListener('click', (e) => {
        const now = performance.now();
        if (now - lastClickTime < CLICK_THROTTLE_MS) return;
        lastClickTime = now;

        const damage = calculateManualDamage();
        if (damage === 0) return;

        if (!gameState.hintDismissed) {
            gameState.hintDismissed = true;
            document.getElementById('click-hint')?.classList.add('hidden');
            saveGame();
        }

        applyDamage(damage);
        updateUpgradeCards();
        saveGame();
        triggerBossHitAnimation();
        spawnDamageNumber(damage, e);
    });

    // ── Abrir modals ────────────────────────────────────────
    elements.dpsMainBtn.onclick = () => {
        openModal('dps-modal');
        const alreadyRendered = document.getElementById(`dps-card-${CONFIG.dpsImprovements[0].id}`);
        alreadyRendered ? updateDPSCards() : renderDPSImprovements();
    };

    elements.bossTrialsBtn.onclick = () => {
        openModal('trial-modal');
        openTrialModal();
    };

    document.getElementById('prestige-btn').onclick = () => {
        openModal('prestige-modal');
        renderPrestigeNodes();
    };

    // ── Cerrar modals con X ─────────────────────────────────
    elements.closeModalBtn.onclick = () => closeModal('dps-modal');
    document.getElementById('close-trial-modal-btn').onclick = () => {
        closeModal('trial-modal');
        currentTrialBoss = null;
    };
    document.getElementById('close-prestige-modal-btn').onclick = () => closeModal('prestige-modal');

    // ── Cerrar modals al click fuera ────────────────────────
    ['dps-modal', 'trial-modal', 'prestige-modal'].forEach(id => {
        document.getElementById(id).addEventListener('click', (e) => {
            if (e.target === document.getElementById(id)) {
                if (id === 'trial-modal') currentTrialBoss = null;
                closeModal(id);
            }
        });
    });

    // ── Trial ───────────────────────────────────────────────
    document.getElementById('trial-enter-btn').onclick = handleTrialAttempt;
}

// 9. SAVE / LOAD
const SAVE_KEY = `eternalVoidSave_${getConfigHash()}`;
let saveTimeout = null;
const saveGame = () => {
    if (saveTimeout) return;
    saveTimeout = setTimeout(() => {
        const { bossMaxHP, bossCurrentHP, ...toSave } = gameState
        localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
        saveTimeout = null;
    }, 2000)
};

const SAVE_KEY_PRESTIGE = `eternalVoidPrestige`;
const savePrestige = () => {
    localStorage.setItem(SAVE_KEY_PRESTIGE, JSON.stringify(prestigeState));
}

function loadGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (!saved) return;
        const data = JSON.parse(saved);
        Object.keys(gameState).forEach(key => {
            if (data[key] !== undefined) gameState[key] = data[key];
        });

        const savedPrestige = localStorage.getItem(SAVE_KEY_PRESTIGE);
        if (!savedPrestige) return;
        const prestigeData = JSON.parse(savedPrestige);
        Object.keys(prestigeState).forEach(key => {
            if (prestigeData[key] !== undefined) prestigeState[key] = prestigeData[key];
        });

    } catch (e) {
        console.warn('Save corrupto, empezando de cero');
    }
}

// 10. INIT
(function init() {
    loadGame();
    updateCachedDPS();
    spawnCurrentBoss();
    renderUpgrades();
    setupListeners();

    if (gameState.hintDismissed) {
        document.getElementById('click-hint')?.classList.add('hidden');
    }

    requestAnimationFrame(gameLoop);

})();