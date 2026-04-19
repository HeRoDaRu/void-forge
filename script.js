// ====================== GAME STATE ======================
const gameState = {
    essence: 0,
    damageDone: 0,
    dps: 0,
    bossMaxHP: 100000,
    bossCurrentHP: 100000,
    lastRegenTime: Date.now(),
    upgrades: [
        { id: 1, name: "Void Spark", baseCost: 15, cost: 15, owned: 1, manualDamage: 12 },
        { id: 2, name: "Echo Fragment", baseCost: 70, cost: 70, owned: 0, manualDamage: 45 },
        { id: 3, name: "Nebula Weaver", baseCost: 320, cost: 320, owned: 0, manualDamage: 160 },
        { id: 4, name: "Rift Anchor", baseCost: 1100, cost: 1100, owned: 0, manualDamage: 520 },
        // Añade más cuando quieras equilibrar
    ],
    dpsImproves: [
        { id: 101, upgradeId: 1, name: "Void Spark DPS", level: 0, maxLevel: 5, baseCost: 5000, cost: 5000, multiplier: 0.25 },
        { id: 201, upgradeId: 2, name: "Echo Fragment DPS", level: 0, maxLevel: 5, baseCost: 20000, cost: 20000, multiplier: 0.35 },
        // Mejora pasiva que aumenta el multiplicador de DPS pasivo
    ]
};

// ====================== DOM ======================
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
    dpsImprovementsList: document.getElementById('dps-improves-list')

};

// ====================== HELPERS ======================
function formatNumber(num) {
    return Math.floor(num).toLocaleString('es-ES');
}

function calculateDPS() {
    return gameState.dpsImproves.reduce((total, improvement) => {
        // Solo calculamos si el jugador ha comprado al menos un nivel de esta mejora DPS
        if (improvement.level > 0) {
            const baseUpgrade = gameState.upgrades.find(u => u.id === improvement.upgradeId);
            
            // Verificamos que el item base exista y que el jugador tenga al menos uno
            if (baseUpgrade && baseUpgrade.owned > 0) {
                // Cálculo: (Daño Manual) * (Multiplicador % * Nivel) * (Cantidad de Items)
                const dpsPorUnidad = baseUpgrade.manualDamage * (improvement.multiplier * improvement.level);
                // return total + (dpsPorUnidad * baseUpgrade.owned);
                return total + dpsPorUnidad;
            }
        }
        return total;
    }, 0);
}

function updateBossUI() {
    // Calculamos el porcentaje con precisión decimal
    const percent = Math.max(0, (gameState.bossCurrentHP / gameState.bossMaxHP) * 100);
    
    // Forzamos el estilo de la barra
    if (elements.healthFill) {
        elements.healthFill.style.width = `${percent}%`;
    }
    
    // Usamos toFixed(0) para que el texto de vida no baile con decimales locos
    if (elements.hpText) {
        elements.hpText.textContent = `${formatNumber(gameState.bossCurrentHP)} / ${formatNumber(gameState.bossMaxHP)}`;
    }
}

function updateUI() {
    const currentDPS = calculateDPS();
    gameState.dps = currentDPS; // Guardamos el valor actual en el estado

    elements.essence.textContent = `Essence: ${formatNumber(gameState.essence)}`;
    elements.damageDone.textContent = `Daño total: ${formatNumber(gameState.damageDone)}`;
    elements.dps.textContent = `DPS actual: ${currentDPS.toFixed(1)}`;

    // [OPCIONAL] Si el modal está abierto, actualizamos los botones para que se habiliten/deshabiliten
    if (elements.dpsModal && elements.dpsModal.style.display === 'flex') {
        const dpsButtons = elements.dpsImprovementsList.querySelectorAll('.dps-buy-btn');
        dpsButtons.forEach(btn => {
            const imp = btn.improvementData;
            btn.disabled = gameState.essence < imp.cost || imp.level >= imp.maxLevel;
        });
    }

    updateBossUI();
}

function getIcon(name) {
    const icons = {
        // Upgrades
        "Void Spark": "✨",
        "Echo Fragment": "🔊",
        "Nebula Weaver": "🌌",
        "Rift Anchor": "🌊",
        "Stellar Crucible": "⭐",
        "Quantum Echo": "⟲",

        // Iconos generales
        "essence": "🌀",
        "damage": "⚔️",
        "attack": "💥",
        "buy": "🛒",
        "default": "🌑"
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
    renderUpgrades()
    saveGame();
}

// ====================== BUY ======================
function buyUpgrade(upgrade) {
    if (!upgrade || gameState.essence < upgrade.cost) {
        return;
    }

    gameState.essence -= upgrade.cost;
    upgrade.owned++;
    upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.18, upgrade.owned));


    updateUI();
    renderUpgrades();
    saveGame();
}

function buyDPSImprovement(improvement) {
    if (!improvement || gameState.essence < improvement.cost) return;

    gameState.essence -= improvement.cost;
    improvement.level++;

    improvement.cost = Math.floor(improvement.baseCost * Math.pow(1.25, improvement.level));

    updateUI();
    renderDPSImprovements();
    saveGame();

}

// ====================== RENDER ======================
function renderUpgrades() {
    elements.upgradesContainer.innerHTML = '';

    gameState.upgrades.forEach(upgrade => {
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
                <span class="cost">Coste: <strong>${formatNumber(upgrade.cost)}${getIcon("essence")}</strong>Essence<br></span>
                <span class="damage">Daño: <strong>${upgrade.manualDamage}${getIcon("damage")}</strong>Damage</span>
            </div>

            <div class="upgrade-buttons">
            <!-- Boton Comprar -->
                <button 
                    class="buy-btn" 
                    ${canAfford ? '' : 'disabled'}
                    onclick="buyUpgrade(this.upgradeData)">
                    COMPRAR
                </button>
            <!-- Boton Atacar -->
                <button 
                    class="attack-btn"
                    ${upgrade.owned > 0 ? '' : 'disabled'}
                    onclick="attackWithUpgrade(this.upgradeData)">
                    ATACAR
                </button>
            </div>
        `;
        div.querySelectorAll('button').forEach(btn => btn.upgradeData = upgrade);
        elements.upgradesContainer.appendChild(div);
    });
}
function renderDPSImprovements() {
    const container = elements.dpsImprovementsList;
    if (!container) return;

    container.innerHTML = '';

    gameState.dpsImproves.forEach(improvement => {
        const item = document.createElement('div');
        item.className = 'dps-item';

        const currentMultiplier = (improvement.level * improvement.multiplier).toFixed(2);

        item.innerHTML = `
            <h3>${improvement.name}</h3>
            <div class="current-level">
                Nivel: ${improvement.level} / ${improvement.maxLevel} 
                (${currentMultiplier}x DPS)
            </div>
            <div class="dps-info">
                Coste para siguiente nivel: <strong>${formatNumber(improvement.cost)}</strong> Essence
            </div>
            <button 
                class="dps-buy-btn"
                ${gameState.essence >= improvement.cost ? '' : 'disabled'}
                onclick="buyDPSImprovement(this.improvementData)">
                ${improvement.level === 0 ? 'Activar DPS' : 'Mejorar DPS'}
            </button>
        `;
        item.querySelector('.dps-buy-btn').improvementData = improvement;
        container.appendChild(item);
    });
}

function setupModalListeners() {
    if (elements.dpsMainBtn) {
        elements.dpsMainBtn.addEventListener('click', openDPSModal);
    }

    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', closeDPSModal);
    }

    // Cerrar modal al hacer clic fuera
    if (elements.dpsModal) {
        elements.dpsModal.addEventListener('click', (e) => {
            if (e.target === elements.dpsModal) {
                closeDPSModal();
            }
        });
    }
}


// ====================== MODAL DPS ======================
function openDPSModal() {

    if (elements.dpsModal) {
        elements.dpsModal.style.display = 'flex';
        renderDPSImprovements();
    }
}

function closeDPSModal() {
    if (elements.dpsModal) {
        elements.dpsModal.style.display = 'none';
    }
}

// ====================== GAME LOOP (Passive DPS) ======================
let lastTime = Date.now();

function gameLoop() {
    const now = Date.now();
    const delta = (now - lastTime) / 1000; // Segundos transcurridos (aprox 0.016)
    lastTime = now;

    if (gameState.bossCurrentHP > 0) {
        const dps = calculateDPS();

        if (dps > 0) {
            const passiveDamage = dps * delta;
            
            // 1. Restamos vida
            gameState.bossCurrentHP -= passiveDamage;
            gameState.damageDone += passiveDamage;

            // 2. IMPORTANTE: Ganar esencia pasiva 
            // Si el ataque manual da 0.7, el DPS debería dar algo similar o proporcional
            gameState.essence += passiveDamage * 0.7; 

            // 3. Control de muerte del Boss
            if (gameState.bossCurrentHP <= 0) {
                gameState.bossCurrentHP = 0;
                // Aquí podrías llamar a una función para generar un nuevo Boss
            }
        }
    }

    updateUI(); // Esto refresca el texto del DPS y la Esencia
    updateBossUI(); // Esto refresca la barra de vida
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
setupModalListeners();
gameLoop();

// Comprobar regeneración cada 30 segundos
setInterval(checkRegen, 30000);