// ====================== GAME STATE ======================
const gameState = {
    score: 0,
    totalClicks: 0,
    clickValue: 1,
    cps: 0,
    upgrades: [
        { id: 1,  name: "Void Spark",                baseCost: 15,     cost: 15,     owned: 0, production: 0.5 },
        { id: 2,  name: "Echo Fragment",             baseCost: 80,     cost: 80,     owned: 0, production: 3 },
        { id: 3,  name: "Nebula Weaver",             baseCost: 350,    cost: 350,    owned: 0, production: 9 },
        { id: 4,  name: "Rift Anchor",               baseCost: 1200,   cost: 1200,   owned: 0, production: 28 },
        { id: 5,  name: "Stellar Crucible",          baseCost: 4500,   cost: 4500,   owned: 0, production: 75 },
        { id: 6,  name: "Quantum Echo",              baseCost: 16000,  cost: 16000,  owned: 0, production: 190 },
        { id: 7,  name: "Dark Matter Harvester",     baseCost: 55000,  cost: 55000,  owned: 0, production: 480 },
        { id: 8,  name: "Singularity Seed",          baseCost: 200000, cost: 200000, owned: 0, production: 1200 },
        { id: 9,  name: "Void Leviathan",            baseCost: 750000, cost: 750000, owned: 0, production: 3200 },
        { id: 10, name: "Nexus Forge",               baseCost: 2500000,cost:2500000, owned: 0, production: 8500 },
        { id: 11, name: "Entropy Engine",            baseCost: 9000000,cost:9000000, owned: 0, production: 22000 },
        { id: 12, name: "Eternal Abyss",             baseCost: 35000000,cost:35000000,owned:0, production: 52000 }
    ]
};

// ====================== DOM CACHE ======================
const elements = {
    score: document.getElementById('score'),
    mainClicker: document.getElementById('main-clicker'),
    upgradesContainer: document.getElementById('upgrades'),
    cps: document.getElementById('cps'),
    totalClicks: document.getElementById('total-clicks')
};

// ====================== HELPERS ======================
function formatNumber(num) {
    return Math.floor(num).toLocaleString('es-ES');
}

function updateUI() {
    elements.score.textContent = formatNumber(gameState.score);
    elements.cps.textContent = `Essence/s: ${gameState.cps.toFixed(1)}`;
    elements.totalClicks.textContent = `Forjados: ${gameState.totalClicks}`;

    elements.upgradesContainer.innerHTML = '';
    gameState.upgrades.forEach(upgrade => {
        const btn = document.createElement('button');
        btn.className = 'upgrade-btn';
        btn.innerHTML = `
            <strong>${upgrade.name}</strong><br>
            <small>${upgrade.owned} | ${formatNumber(upgrade.cost)} Essence</small>
        `;
        btn.disabled = gameState.score < upgrade.cost;
        btn.onclick = () => buyUpgrade(upgrade.id);
        elements.upgradesContainer.appendChild(btn);
    });
}

function buyUpgrade(id) {
    const upgrade = gameState.upgrades.find(u => u.id === id);
    if (!upgrade || gameState.score < upgrade.cost) return;

    gameState.score -= upgrade.cost;
    upgrade.owned++;
    upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.18, upgrade.owned));

    recalculateCPS();
    updateUI();
    saveGame();
}

function recalculateCPS() {
    gameState.cps = gameState.upgrades.reduce((sum, u) => sum + (u.production * u.owned), 0);
}

// ====================== GAME LOOP ======================
let lastTime = Date.now();

function gameLoop() {
    const now = Date.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    gameState.score += gameState.cps * delta;
    updateUI();
    requestAnimationFrame(gameLoop);
}

// ====================== EVENTS ======================
elements.mainClicker.addEventListener('click', () => {
    gameState.score += gameState.clickValue;
    gameState.totalClicks++;

    elements.mainClicker.style.transform = 'scale(0.75) rotate(15deg)';
    setTimeout(() => elements.mainClicker.style.transform = '', 90);

    updateUI();
    saveGame();
});

// ====================== SAVE / LOAD ======================
function saveGame() {
    localStorage.setItem('voidForgeSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('voidForgeSave');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(gameState, data);
        gameState.upgrades.forEach(u => {
            u.cost = Math.floor(u.baseCost * Math.pow(1.18, u.owned));
        });
        recalculateCPS();
    }
}

// ====================== INIT ======================
loadGame();
recalculateCPS();
updateUI();
gameLoop();