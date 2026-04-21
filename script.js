// ======================================================
// VOID FORGE - ENGINE V3.2
// ======================================================

// 1. CONFIGURACIÓN
const CONFIG = {
    upgrades: [
        { id: 1, name: "Void Spark", icon: "✨", baseCost: 15, manualDamage: 12 },
        { id: 2, name: "Echo Fragment", icon: "🔊", baseCost: 2000, manualDamage: 45 },
        { id: 3, name: "Nebula Weaver", icon: "🌌", baseCost: 85000, manualDamage: 160 },
        { id: 4, name: "Rift Anchor", icon: "🌊", baseCost: 3500000, manualDamage: 520 },
    ],
    dpsImprovements: [
        { id: 101, upgradeId: 1, name: "Void Spark DPS", maxLevel: 5, baseCost: 8000, multiplier: 0.25 },
        { id: 201, upgradeId: 2, name: "Echo Fragment DPS", maxLevel: 5, baseCost: 120000, multiplier: 0.35 },
        { id: 301, upgradeId: 3, name: "Nebula Weaver DPS", maxLevel: 5, baseCost: 2000000, multiplier: 0.75 },
        { id: 401, upgradeId: 4, name: "Rift Anchor DPS", maxLevel: 5, baseCost: 8000000, multiplier: 1.15 },
    ],
    bosses: [
        { id: 1, name: "The Void Wraith", icon: "👻", baseHP: 100000, essenceReward: 300 },
        { id: 2, name: "Nebula Devourer", icon: "🌌", baseHP: 500000, essenceReward: 1200 },
        { id: 3, name: "Rift Colossus", icon: "🌊", baseHP: 2000000, essenceReward: 6000 },
        { id: 4, name: "The Event Horizon", icon: "🌑", baseHP: 10000000, essenceReward: 35000, isFinal: true },
    ],
    scalingPerLoop: 2.2,
    growth: { upgrade: 1.38, dps: 1.30 },
    essenceRatio: 0.5
};

// 2. ESTADO
const gameState = {
    essence: 0,
    damageDone: 0,
    bossIndex: 0,
    loopCount: 0,
    bossMaxHP: 100000,
    bossCurrentHP: 100000,
    upgradesOwned: Object.fromEntries(
        CONFIG.upgrades.map((u, i) => [u.id, i === 0 ? 1 : 0]) //
    ),
    dpsLevels: Object.fromEntries(
        CONFIG.dpsImprovements.map(d => [d.id, 0])
    ),
};

// 3. DOM
const elements = {
    essence: document.getElementById('essence'),
    damageDone: document.getElementById('damage-done'),
    dps: document.getElementById('dps'),
    healthFill: document.getElementById('health-fill'),
    hpText: document.getElementById('boss-hp-text'),
    upgradesContainer: document.getElementById('upgrades'),
    dpsMainBtn: document.getElementById('dps-improves-btn'),
    dpsModal: document.getElementById('dps-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    dpsList: document.getElementById('dps-improves-list')
};

// 4. UTILIDADES
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

const formatNumber = (num) => Math.floor(num).toLocaleString('es-ES');
const getCost = (base, growth, level) => Math.floor(base * Math.pow(growth, level));

let cachedDPS = 0;
function updateCachedDPS() {
    cachedDPS = CONFIG.dpsImprovements.reduce((total, conf) => {
        const level = gameState.dpsLevels[conf.id] || 0;
        const owned = gameState.upgradesOwned[conf.upgradeId] || 0;
        if (level === 0 || owned === 0) return total;
        const baseUpg = CONFIG.upgrades.find(u => u.id === conf.upgradeId);
        return total + (baseUpg.manualDamage * conf.multiplier * level * owned);
    }, 0);
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

        const lvl = gameState.dpsLevels[conf.id] || 0;
        const cost = getCost(conf.baseCost, CONFIG.growth.dps, lvl);
        const isMax = lvl >= conf.maxLevel;

        card.querySelector('.dps-level').textContent =
            `Nivel ${lvl}/${conf.maxLevel} (+${(conf.multiplier * 100).toFixed(0)}% por unidad)`;

        const btn = card.querySelector('.dps-buy-btn');
        btn.textContent = isMax ? 'MÁXIMO' : 'MEJORAR: ' + formatNumber(cost);
        btn.disabled = gameState.essence < cost || isMax;
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

function tick(delta) {
    if (cachedDPS > 0) applyDamage(cachedDPS * delta);
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
}

function gameLoop(currentTime) {
    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    tick(delta);
    render();

    requestAnimationFrame(gameLoop);
}

// 8. EVENTOS
function setupListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            handlePurchase(parseInt(e.target.dataset.id));
            triggerButtonFeedback(e.target);
        }
        if (e.target.classList.contains('dps-buy-btn')) {
            handlePurchase(parseInt(e.target.dataset.dpsId), true);
            triggerButtonFeedback(e.target);
        }
        if (e.target === elements.dpsModal) {
            elements.dpsModal.style.display = 'none';
        }
        
    });

    
    document.getElementById('boss-visual').addEventListener('click', (e) => {
        const damage = calculateManualDamage();
        if (damage === 0) return;

        const hint = document.getElementById('click-hint');
        if (hint) {
            if (gameState.damageDone > 50) {
                hint.style.display = 'none';
            }
        }

        applyDamage(damage);
        updateUpgradeCards();
        saveGame();

        const bossEl = document.getElementById('boss-visual');
        bossEl.classList.remove('hit');
        void bossEl.offsetWidth;
        bossEl.classList.add('hit');
        bossEl.addEventListener('animationend', () => bossEl.classList.remove('hit'), { once: true });

        spawnDamageNumber(damage, e);
    });

    elements.dpsMainBtn.onclick = () => {
        elements.dpsModal.style.display = 'flex';
        const alreadyRendered = document.getElementById(`dps-card-${CONFIG.dpsImprovements[0].id}`);
        if (alreadyRendered) {
            updateDPSCards();
        } else {
            renderDPSImprovements();
        }
    };

    elements.closeModalBtn.onclick = () => {
        elements.dpsModal.style.display = 'none';
    };
}

// 9. SAVE / LOAD
const SAVE_KEY = `eternalVoidSave_${getConfigHash()}`;
const saveGame = () => {
    const { bossMaxHP, bossCurrentHP, ...toSave } = gameState
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
};
function loadGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (!saved) return;
        const data = JSON.parse(saved);
        Object.keys(gameState).forEach(key => {
            if (data[key] !== undefined) gameState[key] = data[key];
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
    requestAnimationFrame(gameLoop);

})();