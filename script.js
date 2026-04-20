// ======================================================
// VOID FORGE - ENGINE V3.1 (COMPATIBLE CON UI ULTRA)
// ======================================================

// 1. CONFIGURACIÓN ESTATAL
const SAVE_KEY = 'eternalVoidSave_v3';
const CONFIG = {
    upgrades: [
        { id: 1, name: "Void Spark",   icon: "✨", baseCost: 15,   manualDamage: 12 },
        { id: 2, name: "Echo Fragment", icon: "🔊", baseCost: 70,   manualDamage: 45 },
        { id: 3, name: "Nebula Weaver", icon: "🌌", baseCost: 320,  manualDamage: 160 },
        { id: 4, name: "Rift Anchor",   icon: "🌊", baseCost: 1100, manualDamage: 520 },
    ],
    dpsImprovements: [
        { id: 101, upgradeId: 1, name: "Void Spark DPS",    maxLevel: 5, baseCost: 700,  multiplier: 0.25 },
        { id: 201, upgradeId: 2, name: "Echo Fragment DPS", maxLevel: 5, baseCost: 2500, multiplier: 0.35 },
    ],
    growth: { upgrade: 1.18, dps: 1.25 },
    essenceRatio: 0.7
};

// 2. ESTADO DEL JUEGO
const gameState = {
    essence: 0,
    damageDone: 0,
    bossMaxHP: 100000,
    bossCurrentHP: 100000,
    lastRegenTime: Date.now(),
    upgradesOwned: { 1: 1, 2: 0, 3: 0, 4: 0 },
    dpsLevels: { 101: 0, 201: 0 }
};

// 3. CACHÉ DE ELEMENTOS DOM
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

// 5. ACCIONES
function applyDamage(amount) {
    if (gameState.bossCurrentHP <= 0) return;
    gameState.bossCurrentHP = Math.max(0, gameState.bossCurrentHP - amount);
    gameState.damageDone += amount;
    gameState.essence += amount * CONFIG.essenceRatio;
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
        renderDPSImprovements(); // El modal siempre se refresca entero
    } else {
        gameState.upgradesOwned[id] = (gameState.upgradesOwned[id] || 0) + 1;
        updateUpgradeCards(); // Actualiza visualmente la card
    }

    updateCachedDPS();
    saveGame();
}

// 6. RENDERIZADO REACTIVO
function renderUpgrades() {
    elements.upgradesContainer.innerHTML = CONFIG.upgrades.map(conf => `
        <div id="card-${conf.id}" class="upgrade">
            <div class="upgrade-header">
                <span>${conf.icon} <strong>${conf.name}</strong></span>
                <span class="count">×0</span>
            </div>
            <div class="upgrade-info">
                Coste: <strong class="cost-val">0</strong> Essence
            </div>
            <div class="upgrade-buttons">
                <button class="buy-btn" data-id="${conf.id}">COMPRAR</button>
                <button class="atk-btn" data-atk-id="${conf.id}">ATACAR</button>
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
        
        card.querySelector('.count').textContent = `×${owned}`;
        card.querySelector('.cost-val').textContent = formatNumber(cost);
        card.querySelector('.buy-btn').disabled = gameState.essence < cost;
        card.querySelector('.atk-btn').disabled = owned === 0;
        card.classList.toggle('locked', owned === 0);
    });
}

function renderDPSImprovements() {
    elements.dpsList.innerHTML = CONFIG.dpsImprovements.map(conf => {
        const lvl = gameState.dpsLevels[conf.id] || 0;
        const cost = getCost(conf.baseCost, CONFIG.growth.dps, lvl);
        const isMax = lvl >= conf.maxLevel;
        return `
            <div class="dps-item">
                <h3>${conf.name}</h3>
                <p>Nivel ${lvl}/${conf.maxLevel} (+${(conf.multiplier * 100).toFixed(0)}% por unidad)</p>
                <button class="dps-buy-btn" data-dps-id="${conf.id}" ${gameState.essence < cost || isMax ? 'disabled' : ''}>
                    ${isMax ? 'MÁXIMO' : 'MEJORAR: ' + formatNumber(cost)}
                </button>
            </div>`;
    }).join('');
}

// 7. GAME LOOP (OPTIMIZADO)
let lastTime = performance.now();
let lastEssenceInt = -1;

function gameLoop(currentTime) {
    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (cachedDPS > 0) applyDamage(cachedDPS * delta);

    // DIRTY CHECKING: Solo actualiza el DOM pesado si la esencia cambia de unidad
    const currentEssenceInt = Math.floor(gameState.essence);
    if (currentEssenceInt !== lastEssenceInt) {
        updateUpgradeCards();
        if (elements.dpsModal.style.display === 'flex') renderDPSImprovements();
        lastEssenceInt = currentEssenceInt;
    }

    // Actualización de stats ligeros (cada frame)
    elements.essence.textContent = formatNumber(gameState.essence);
    elements.dps.textContent = cachedDPS.toFixed(1);
    elements.damageDone.textContent = `Total: ${formatNumber(gameState.damageDone)}`;
    
    const hpPercent = (gameState.bossCurrentHP / gameState.bossMaxHP) * 100;
    elements.healthFill.style.width = `${Math.max(0, hpPercent)}%`;
    elements.hpText.textContent = `${formatNumber(gameState.bossCurrentHP)} / ${formatNumber(gameState.bossMaxHP)}`;
    
    requestAnimationFrame(gameLoop);
}

// 8. EVENTOS Y PERSISTENCIA
const saveGame = () => localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));

function setupListeners() {
    document.addEventListener('click', (e) => {
        // Manejo de Compras de Upgrades
        if (e.target.classList.contains('buy-btn')) {
            handlePurchase(parseInt(e.target.dataset.id));
        }
        
        // Manejo de Compras de DPS
        if (e.target.classList.contains('dps-buy-btn')) {
            handlePurchase(parseInt(e.target.dataset.dpsId), true);
        }

        // Manejo de Ataque Manual
        if (e.target.dataset.atkId) {
            const id = parseInt(e.target.dataset.atkId);
            const upg = CONFIG.upgrades.find(u => u.id === id);
            applyDamage(upg.manualDamage * gameState.upgradesOwned[id]);
            updateUpgradeCards(); // Feedback inmediato
        }
    });

    elements.dpsMainBtn.onclick = () => {
        elements.dpsModal.style.display = 'flex';
        renderDPSImprovements();
    };

    elements.closeModalBtn.onclick = () => elements.dpsModal.style.display = 'none';
    
    window.onclick = (e) => {
        if (e.target === elements.dpsModal) elements.dpsModal.style.display = 'none';
    };
}

// 9. INICIALIZACIÓN
(function init() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(gameState, parsed);
        } catch (e) { console.error("Error al cargar partida"); }
    }

    updateCachedDPS();
    renderUpgrades();
    setupListeners();
    requestAnimationFrame(gameLoop);

    // Auto-regen cada hora
    setInterval(() => {
        if (Date.now() - gameState.lastRegenTime > 3600000) {
            gameState.bossCurrentHP = gameState.bossMaxHP;
            gameState.lastRegenTime = Date.now();
            saveGame();
        }
    }, 60000);
})();
