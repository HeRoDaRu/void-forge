// ====================== CONFIG (nunca cambia) ======================
const SAVE_KEY = 'eternalVoidSave';

const upgradesConfig = [
    { id: 1, name: "Void Spark",     icon: "✨", baseCost: 15,   manualDamage: 12  },
    { id: 2, name: "Echo Fragment",  icon: "🔊", baseCost: 70,   manualDamage: 45  },
    { id: 3, name: "Nebula Weaver",  icon: "🌌", baseCost: 320,  manualDamage: 160 },
    { id: 4, name: "Rift Anchor",    icon: "🌊", baseCost: 1100, manualDamage: 520 },
];

const improvesConfig = [
    { id: 101, upgradeId: 1, name: "Void Spark DPS",    maxLevel: 5, baseCost: 700,  multiplier: 0.25 },
    { id: 201, upgradeId: 2, name: "Echo Fragment DPS", maxLevel: 5, baseCost: 2500, multiplier: 0.65 },
];

// ====================== STATE (lo que se guarda) ======================
const gameState = {
    essence:       0,
    damageDone:    0,
    bossMaxHP:     100000,
    bossCurrentHP: 100000,
    lastRegenTime: Date.now(),
    upgradesOwned:  { 1: 1, 2: 0, 3: 0, 4: 0 },
    dpsLevels:      { 101: 0, 201: 0 },
};

// ====================== DOM ======================
const elements = {
    essence:          document.getElementById('essence'),
    damageDone:       document.getElementById('damage-done'),
    dps:              document.getElementById('dps'),
    healthFill:       document.getElementById('health-fill'),
    hpText:           document.getElementById('boss-hp-text'),
    upgradesContainer: document.getElementById('upgrades'),
    dpsMainBtn:       document.getElementById('dps-improves-btn'),
    dpsModal:         document.getElementById('dps-modal'),
    closeModalBtn:    document.getElementById('close-modal-btn'),
    dpsList:          document.getElementById('dps-improves-list'),
};

// ====================== HELPERS ======================
function formatNumber(num) {
    return Math.floor(num).toLocaleString('es-ES');
}

function getUpgradeCost(upgradeId) {
    const config = upgradesConfig.find(u => u.id === upgradeId);
    const owned  = gameState.upgradesOwned[upgradeId] ?? 0;
    return Math.floor(config.baseCost * Math.pow(1.18, owned));
}

function getImproveCost(improveId) {
    const config = improvesConfig.find(i => i.id === improveId);
    const level  = gameState.dpsLevels[improveId] ?? 0;
    return Math.floor(config.baseCost * Math.pow(1.25, level));
}

function calculateDPS() {
    return improvesConfig.reduce((total, config) => {
        const level = gameState.dpsLevels[config.id] ?? 0;
        if (level === 0) return total;

        const baseUpgrade = upgradesConfig.find(u => u.id === config.upgradeId);
        const owned = gameState.upgradesOwned[config.upgradeId] ?? 0;
        if (owned === 0) return total;

        const dps = baseUpgrade.manualDamage * (config.multiplier * level) * owned;
        return total + dps;
    }, 0);
}

// ====================== ATTACK ======================
function attackWithUpgrade(upgradeId) {
    const config = upgradesConfig.find(u => u.id === upgradeId);
    const owned  = gameState.upgradesOwned[upgradeId] ?? 0;
    if (owned === 0 || gameState.bossCurrentHP <= 0) return;

    const damage = config.manualDamage * owned;
    gameState.bossCurrentHP = Math.max(0, gameState.bossCurrentHP - damage);
    gameState.damageDone   += damage;
    gameState.essence      += Math.floor(damage * 0.7);

    saveGame();
    render();
    updateUpgradeCards(); // refresca botones sin reconstruir el DOM
}

// ====================== BUY ======================
function buyUpgrade(upgradeId) {
    const cost  = getUpgradeCost(upgradeId);
    const owned = gameState.upgradesOwned[upgradeId] ?? 0;
    if (gameState.essence < cost) return;

    gameState.essence -= cost;
    gameState.upgradesOwned[upgradeId] = owned + 1;

    saveGame();
    render();
    updateUpgradeCards();
}

function buyDPSImprovement(improveId) {
    const config = improvesConfig.find(i => i.id === improveId);
    const level  = gameState.dpsLevels[improveId] ?? 0;
    const cost   = getImproveCost(improveId);

    if (gameState.essence < cost || level >= config.maxLevel) return;

    gameState.essence -= cost;
    gameState.dpsLevels[improveId] = level + 1;

    saveGame();
    render();
    renderDPSImprovements(); // el modal siempre reconstruye, no pasa nada
}

// ====================== RENDER ======================

// Se llama UNA vez al inicio — construye las cards
function renderUpgrades() {
    elements.upgradesContainer.innerHTML = '';

    upgradesConfig.forEach(config => {
        const owned     = gameState.upgradesOwned[config.id] ?? 0;
        const cost      = getUpgradeCost(config.id);
        const canAfford = gameState.essence >= cost;

        const div = document.createElement('div');
        div.className = `upgrade ${owned > 0 ? '' : 'locked'}`;
        div.dataset.upgradeId = config.id; // ← clave para updateUpgradeCards()

        div.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-icon">${config.icon}</span>
                <strong>${config.name}</strong>
                <span class="owned-count">×${owned}</span>
            </div>
            <div class="upgrade-info">
                <span class="cost">Coste: <strong class="cost-value">${formatNumber(cost)}</strong> Essence</span><br>
                <span class="damage">Daño: <strong>${config.manualDamage}</strong></span>
            </div>
            <div class="upgrade-buttons">
                <button class="buy-btn"    ${canAfford ? '' : 'disabled'} onclick="buyUpgrade(${config.id})">COMPRAR</button>
                <button class="attack-btn" ${owned > 0 ? '' : 'disabled'} onclick="attackWithUpgrade(${config.id})">ATACAR</button>
            </div>
        `;

        elements.upgradesContainer.appendChild(div);
    });
}

// Se llama en cada acción — solo actualiza los valores que cambian
function updateUpgradeCards() {
    upgradesConfig.forEach(config => {
        const card = document.querySelector(`[data-upgrade-id="${config.id}"]`);
        if (!card) return;

        const owned     = gameState.upgradesOwned[config.id] ?? 0;
        const cost      = getUpgradeCost(config.id);
        const canAfford = gameState.essence >= cost;

        card.className = `upgrade ${owned > 0 ? '' : 'locked'}`;
        card.querySelector('.owned-count').textContent  = `×${owned}`;
        card.querySelector('.cost-value').textContent   = formatNumber(cost);
        card.querySelector('.buy-btn').disabled         = !canAfford;
        card.querySelector('.attack-btn').disabled      = owned === 0;
    });
}

function renderDPSImprovements() {
    const container = elements.dpsList;
    if (!container) return;
    container.innerHTML = '';

    improvesConfig.forEach(config => {
        const level     = gameState.dpsLevels[config.id] ?? 0;
        const cost      = getImproveCost(config.id);
        const canAfford = gameState.essence >= cost;
        const maxed     = level >= config.maxLevel;

        const item = document.createElement('div');
        item.className = 'dps-item';
        item.innerHTML = `
            <h3>${config.name}</h3>
            <div class="current-level">
                Nivel: ${level} / ${config.maxLevel} (${(level * config.multiplier).toFixed(2)}x DPS)
            </div>
            <div class="dps-info">
                Coste siguiente nivel: <strong>${maxed ? '—' : formatNumber(cost)}</strong> Essence
            </div>
            <button class="dps-buy-btn" ${canAfford && !maxed ? '' : 'disabled'} onclick="buyDPSImprovement(${config.id})">
                ${maxed ? 'MÁXIMO' : level === 0 ? 'Activar DPS' : 'Mejorar DPS'}
            </button>
        `;
        container.appendChild(item);
    });
}

// El render del game loop — solo texto y barra de vida
function render() {
    elements.essence.textContent   = `Essence: ${formatNumber(gameState.essence)}`;
    elements.damageDone.textContent = `Daño total: ${formatNumber(gameState.damageDone)}`;
    elements.dps.textContent        = `DPS actual: ${calculateDPS().toFixed(1)}`;

    const percent = Math.max(0, (gameState.bossCurrentHP / gameState.bossMaxHP) * 100);
    elements.healthFill.style.width = `${percent}%`;
    elements.hpText.textContent = `${formatNumber(gameState.bossCurrentHP)} / ${formatNumber(gameState.bossMaxHP)}`;
}

// ====================== MODAL ======================
function setupModalListeners() {
    elements.dpsMainBtn?.addEventListener('click', () => {
        elements.dpsModal.style.display = 'flex';
        renderDPSImprovements();
    });
    elements.closeModalBtn?.addEventListener('click', () => {
        elements.dpsModal.style.display = 'none';
    });
    elements.dpsModal?.addEventListener('click', (e) => {
        if (e.target === elements.dpsModal) elements.dpsModal.style.display = 'none';
    });
}

// ====================== GAME LOOP ======================
let lastTime = Date.now();

function gameLoop() {
    const now   = Date.now();
    const delta = (now - lastTime) / 1000;
    lastTime    = now;

    tick(delta);
    render();
    requestAnimationFrame(gameLoop);
}

function tick(delta) {
    if (gameState.bossCurrentHP <= 0) return;
    const dps = calculateDPS();
    if (dps <= 0) return;

    const damage = dps * delta;
    gameState.bossCurrentHP = Math.max(0, gameState.bossCurrentHP - damage);
    gameState.damageDone   += damage;
    gameState.essence      += damage * 0.7;
}

// ====================== REGEN ======================
function checkRegen() {
    const now = Date.now();
    if (now - gameState.lastRegenTime > 3600000) {
        gameState.bossCurrentHP = gameState.bossMaxHP;
        gameState.lastRegenTime = now;
    }
}

// ====================== SAVE / LOAD ======================
function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

function loadGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (!saved) return;
        const data = JSON.parse(saved);
        Object.keys(gameState).forEach(key => {
            if (data[key] !== undefined) gameState[key] = data[key];
        });
    } catch (e) {
        console.warn('Save corrupto, empezando de cero', e);
    }
}

// ====================== INIT ======================
loadGame();
checkRegen();
renderUpgrades();      
setupModalListeners();
gameLoop();           

setInterval(checkRegen, 30000);