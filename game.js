// INITIAL SPIEL-ZUSTAND (GAME STATE)
let gameState = {
    day: 2,
    month: 10,
    year: 2026,
    cash: 1250,
    rep: 32,
    skill: 28,
    energy: 80,
    drinksToday: 0
};

// UI AKTUALISIEREN
function updateUI() {
    // Stats Update
    document.getElementById('date-display').innerText = `${gameState.day < 10 ? '0' + gameState.day : gameState.day}. OKT ${gameState.year}`;
    document.getElementById('cash-display').innerText = gameState.cash;
    document.getElementById('rep-display').innerText = gameState.rep;
    document.getElementById('skill-display').innerText = gameState.skill;
    
    // Energie Update
    document.getElementById('energy-text').innerText = gameState.energy + "%";
    const fill = document.getElementById('energy-fill');
    fill.style.width = gameState.energy + "%";
    if (gameState.energy <= 20) { fill.style.backgroundColor = 'var(--accent-red)'; }
    else { fill.style.backgroundColor = 'var(--accent-green)'; }

    // Drinks Tracker Update
    let trackerStr = "";
    for (let i = 0; i < 5; i++) {
        trackerStr += i < gameState.drinksToday ? "[X]" : "[ ]";
    }
    document.getElementById('drink-tracker').innerText = trackerStr;
}

// LOG-EINTRAG HINZUFÜGEN
function addLog(text) {
    const logContainer = document.getElementById('log-entries');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const dateStr = `[${gameState.day < 10 ? '0' + gameState.day : gameState.day}.${gameState.month < 10 ? '0' + gameState.month : gameState.month}]`;
    entry.innerHTML = `<span class="date">${dateStr}</span> ${text}`;
    logContainer.appendChild(entry);
}

// AKTION: ENERGY DRINK KAUFEN
function buyEnergyDrink() {
    if (gameState.drinksToday >= 5) {
        addLog("🛑 Warnung: Maximale Dosen pro Tag (5) erreicht.");
        return;
    }
    if (gameState.cash < 10) {
        addLog("🛑 Nicht genug Geld für Energy Drink.");
        return;
    }
    gameState.cash -= 10;
    gameState.energy = Math.min(100, gameState.energy + 5);
    gameState.drinksToday++;
    addLog("1x Energy Drink getrunken (+5% E, -10 €).");
    updateUI();
}

// AKTION: NÄCHSTEN TAG SIMULIEREN
function simulateNextDay() {
    const action = document.getElementById('action-select').value;

    // Aktionen ausführen
    if (action === "rest") {
        gameState.energy = Math.min(100, gameState.energy + 40);
        addLog("🛋️ Tag erholsam verbracht (+40% E).");
    } else if (action === "dig") {
        if (gameState.cash < 50) {
            addLog("🛑 Nicht genug Geld zum Platten-Diggen (50 € benötigt).");
            return;
        }
        gameState.cash -= 50;
        gameState.energy = Math.max(0, gameState.energy - 10);
        gameState.skill += 1;
        addLog("💿 Im Plattenladen gediggt (-10% E, -50 €, +Skill, +Tracks).");
    } else if (action === "rehearse") {
        gameState.energy = Math.max(0, gameState.energy - 15);
        gameState.skill += 2;
        addLog("🎧 Set geübt (-15% E, +Skill).");
    } else if (action === "network") {
        gameState.energy = Math.max(0, gameState.energy - 30);
        addLog("🎪 In Szene-Clubs genetzwerkt (-30% E, neue Kontakte geknüpft).");
    }

    // Datum erhöhen
    gameState.day++;
    gameState.drinksToday = 0; // Reset tägliche Drinks

    // BURNOUT CHECK
    if (gameState.energy === 0) {
        addLog("⚠️ BURNOUT! Energie auf 0% gefallen. Krankmeldung für den nächsten Tag erzwungen.");
        gameState.energy = 50; // Zwangserholung
        gameState.day++; // Ein Tag wird übersprungen
        addLog("⚠️ Einen Tag zwangserholt (E=50%).");
    }

    // UI aktualisieren
    updateUI();
}

// INITIAL START
updateUI();
addLog("Graveyard Noise initialisiert.");
