// ======================================================
// VOID FORGE - ENGINE V3.2
// ======================================================

// 1. CONFIGURACIÓN
const CONFIG = {
    upgrades: [
        { id: 1, name: "Void Spark",    icon: "✨", baseCost: 150,      manualDamage: 12  },
        { id: 2, name: "Echo Fragment", icon: "🔊", baseCost: 8000,     manualDamage: 45  },
        { id: 3, name: "Nebula Weaver", icon: "🌌", baseCost: 250000,   manualDamage: 160 },
        { id: 4, name: "Rift Anchor",   icon: "🌊", baseCost: 8000000,  manualDamage: 520 },
    ],
    dpsImprovements: [
        { id: 101, upgradeId: 1, name: "Void Spark DPS",     maxLevel: 5, baseCost: 40000,    multiplier: 0.20 },
        { id: 201, upgradeId: 2, name: "Echo Fragment DPS",  maxLevel: 5, baseCost: 500000,   multiplier: 0.28 },
        { id: 301, upgradeId: 3, name: "Nebula Weaver DPS",  maxLevel: 5, baseCost: 8000000,  multiplier: 0.60 },
        { id: 401, upgradeId: 4, name: "Rift Anchor DPS",    maxLevel: 5, baseCost: 30000000, multiplier: 0.90 },
    ],
    bosses: [
        { id: 1, name: "The Void Wraith",   icon: "👻", baseHP: 50000,    essenceReward: 150   },
        { id: 2, name: "Nebula Devourer",   icon: "🌌", baseHP: 300000,   essenceReward: 600   },
        { id: 3, name: "Rift Colossus",     icon: "🌊", baseHP: 1500000,  essenceReward: 3000  },
        { id: 4, name: "The Event Horizon", icon: "🌑", baseHP: 8000000,  essenceReward: 18000, isFinal: true },
    ],
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


    document.querySelector('.boss-visual-wrapper').addEventListener('click', (e) => {
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

        triggerBossHitAnimation()

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

    // Trials
    if (elements.bossTrialsBtn) {
        elements.bossTrialsBtn.onclick = openTrialModal;
    }

    document.getElementById('close-trial-modal-btn').onclick = () => {
        document.getElementById('trial-modal').style.display = 'none';
        currentTrialBoss = null;
    };

    document.getElementById('trial-enter-btn').onclick = handleTrialAttempt;

    // Cerrar trial modal al click fuera
    document.getElementById('trial-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('trial-modal')) {
            document.getElementById('trial-modal').style.display = 'none';
            currentTrialBoss = null;
        }
    });
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

    if (gameState.hintDismissed) {
        document.getElementById('click-hint')?.classList.add('hidden');
    }

    requestAnimationFrame(gameLoop);

})();