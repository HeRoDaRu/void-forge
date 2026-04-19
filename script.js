// ====================== GAME STATE ======================
const gameState = {
    essence: 0,
    damageDone: 0,
    bossMaxHP: 100000,
    bossCurrentHP: 100000,
    lastRegenTime: Date.now(),
    passiveMultiplier: 0.25,   // empieza bajo, subirá con upgrades futuros
    upgrades: [
        { id: 1, name: "Void Spark", baseCost: 15, cost: 15, owned: 1, manualDamage: 12 },
        { id: 2, name: "Echo Fragment", baseCost: 70, cost: 70, owned: 0, manualDamage: 45 },
        { id: 3, name: "Nebula Weaver", baseCost: 320, cost: 320, owned: 0, manualDamage: 160 },
        { id: 4, name: "Rift Anchor", baseCost: 1100, cost: 1100, owned: 0, manualDamage: 520 },
        // Añade más cuando quieras equilibrar
    ]
};

// ====================== DOM ======================
const elements = {
    essence: document.getElementById('essence'),
    damageDone: document.getElementById('damage-done'),
    dps: document.getElementById('dps'),
    healthFill: document.getElementById('health-fill'),
    hpText: document.getElementById('boss-hp-text'),
    upgradesContainer: document.getElementById('upgrades')
};

// ====================== HELPERS ======================
function formatNumber(num) {
    return Math.floor(num).toLocaleString('es-ES');
}

function calculateDPS() {
    return gameState.upgrades.reduce((sum, u) => {
        return sum + (u.owned * u.manualDamage * gameState.passiveMultiplier);
    }, 0);
}

function updateBossUI() {
    const percent = Math.max(0, (gameState.bossCurrentHP / gameState.bossMaxHP) * 100);
    elements.healthFill.style.width = percent + '%';
    elements.hpText.textContent = `${formatNumber(gameState.bossCurrentHP)} / ${formatNumber(gameState.bossMaxHP)}`;
}

function updateUI() {
    elements.essence.textContent = `Essence: ${formatNumber(gameState.essence)}`;
    elements.damageDone.textContent = `Daño total: ${formatNumber(gameState.damageDone)}`;
    elements.dps.textContent = `DPS actual: ${calculateDPS().toFixed(1)}`;
    updateBossUI();
}

function getIcon(name) {
    const icons = {
        // Upgrades
        "Void Spark":        "✨",
        "Echo Fragment":     "🔊",
        "Nebula Weaver":     "🌌",
        "Rift Anchor":       "🌊",
        "Stellar Crucible":  "⭐",
        "Quantum Echo":      "⟲",

        // Iconos generales
        "essence":           "🌀",
        "damage":            "⚔️",
        "attack":            "💥",
        "buy":               "🛒",
        "default":           "🌑"
    }
    return icons[name] || icons["default"];
}

// ====================== ATTACK ======================
function attackWithUpgrade(upgrade) {
    if (gameState.bossCurrentHP <= 0) return;

    const damage = upgrade.manualDamage * upgrade.owned;
    gameState.bossCurrentHP -= damage;
    gameState.damageDone += damage;
    gameState.essence += Math.floor(damage * 0.7); // ganas esencia al atacar manualmente

    if (gameState.bossCurrentHP < 0) gameState.bossCurrentHP = 0;

    updateUI();
    saveGame();
}

// ====================== BUY ======================
function buyUpgrade(upgrade) {
    if (gameState.essence < upgrade.cost) return;

    gameState.essence -= upgrade.cost;
    upgrade.owned++;
    upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.18, upgrade.owned));

    updateUI();
    renderUpgrades();
    saveGame();
}

// ====================== RENDER ======================
function renderUpgrades() {
    elements.upgradesContainer.innerHTML = '';

    gameState.upgrades.forEach((upgrade, index) => {
        const canAfford = gameState.essence >= upgrade.cost;
        const isUnlocked = upgrade.owned > 0;

        const div = document.createElement('div');
        div.className = `upgrade ${isUnlocked ? '' : 'locked'}`;

        div.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-icon">${getIcon(upgrade.name)}</span>
                <strong>${upgrade.name}</strong>
                <span class="owned-count">×${upgrade.owned}</span><br>
            </div>

            <div class="upgrade-info">
                <span class="cost">${getIcon("essence")}Coste: <strong>${formatNumber(upgrade.cost)}</strong> Essence<br></span>
                <span class="damage">${getIcon("damage")}Daño: <strong>${upgrade.manualDamage}</strong></span>
            </div>

            <div class="upgrade-buttons">
            <!-- Boton Comprar -->
                <button 
                    class="buy-btn" 
                    ${canAfford ? '' : 'disabled'}
                    onclick="buyUpgrade(gameState.upgrades[${index}])">
                    COMPRAR
                </button>
            <!-- Boton Atacar -->
                <button 
                    class="attack-btn"
                    ${upgrade.owned > 0 ? '' : 'disabled'}
                    onclick="attackWithUpgrade(gameState.upgrades[${index}])">
                    ATACAR
                </button>
            </div>
        `;
        elements.upgradesContainer.appendChild(div);
    });
}

// ====================== GAME LOOP (Passive DPS) ======================
let lastTime = Date.now();

function gameLoop() {
    const now = Date.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    if (gameState.bossCurrentHP > 0) {
        const dps = calculateDPS();
        const passiveDamage = dps * delta;
        gameState.bossCurrentHP -= passiveDamage;
        gameState.damageDone += passiveDamage;

        if (gameState.bossCurrentHP < 0) gameState.bossCurrentHP = 0;
    }

    updateUI();
    requestAnimationFrame(gameLoop);
}

// ====================== REGENERACIÓN ======================
function checkRegen() {
    const now = Date.now();
    if (now - gameState.lastRegenTime > 3600000) { // 1 hora
        gameState.bossCurrentHP = gameState.bossMaxHP;
        gameState.lastRegenTime = now;
    }
}

// ====================== SAVE / LOAD ======================
function saveGame() {
    localStorage.setItem('eternalVoidSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('eternalVoidSave');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(gameState, data);
        gameState.upgrades.forEach(u => {
            u.cost = Math.floor(u.baseCost * Math.pow(1.18, u.owned));
        });
    }
}

// ====================== INIT ======================
loadGame();
checkRegen();
updateUI();
renderUpgrades();
gameLoop();

// Comprobar regeneración cada 30 segundos
setInterval(checkRegen, 30000);