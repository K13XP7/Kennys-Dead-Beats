// SPIEL-ZUSTAND (GameState)
let gameState = null;

// DOM-Elemente
const screens = {
    start: document.getElementById('start-screen'),
    onboarding: document.getElementById('onboarding-screen'),
    dashboard: document.getElementById('dashboard-screen')
};

const btnNewGame = document.getElementById('btn-new-game');
const btnContinue = document.getElementById('btn-continue');
const btnSave = document.getElementById('btn-save');
const btnQuit = document.getElementById('btn-quit');
const btnBackToMenu = document.getElementById('btn-back-to-menu');
const btnNextWeek = document.getElementById('btn-next-week');

const saveInfoText = document.getElementById('save-info');
const djForm = document.getElementById('dj-form');
const logList = document.getElementById('log-list');

// Brotjob-Gehälter Tabelle
const jobSalaries = {
    "Plattenladen-Aushilfe": 120,
    "Barkeeper im Szenelokal": 160,
    "Lagerarbeiter": 220
};

// --- INITIALISIERUNG ---
window.addEventListener('DOMContentLoaded', () => {
    checkExistingSave();
});

// --- NAVIGATION ---
function showScreen(screenKey) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenKey].classList.remove('hidden');
}

// --- SPEICHER-SYSTEM ---
function checkExistingSave() {
    const savedData = localStorage.getItem('graveyard_noise_save');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        btnContinue.disabled = false;
        saveInfoText.textContent = `Speicherstand: ${parsed.djName} | KW ${parsed.week || 1} | ${parsed.money} €`;
    } else {
        btnContinue.disabled = true;
        saveInfoText.textContent = 'Kein Speicherstand vorhanden';
    }
}

function saveGame() {
    if (!gameState) return;
    localStorage.setItem('graveyard_noise_save', JSON.stringify(gameState));
    addLog("💾 Spielstand gespeichert.");
    alert('Spielstand erfolgreich gespeichert! ⚰️️');
    checkExistingSave();
}

function loadGame() {
    const savedData = localStorage.getItem('graveyard_noise_save');
    if (savedData) {
        gameState = JSON.parse(savedData);
        // Falls alter Speicherstand geladen wird, Standardwerte setzen:
        if (!gameState.week) gameState.week = 1;
        if (!gameState.energy) gameState.energy = 100;
        if (!gameState.logs) gameState.logs = ["Spielstand geladen."];
        
        updateDashboard();
        showScreen('dashboard');
    }
}

// --- EVENT HANDLER ---
btnNewGame.addEventListener('click', () => showScreen('onboarding'));
btnContinue.addEventListener('click', loadGame);
btnBackToMenu.addEventListener('click', () => showScreen('start'));
btnSave.addEventListener('click', saveGame);

btnQuit.addEventListener('click', () => {
    checkExistingSave();
    showScreen('start');
});

// Neues Spiel starten
djForm.addEventListener('submit', (e) => {
    e.preventDefault();

    gameState = {
        djName: document.getElementById('dj-name').value.trim(),
        genre: document.getElementById('dj-genre').value,
        region: document.getElementById('dj-region').value,
        job: document.getElementById('dj-job').value,
        money: 150,
        energy: 100,
        reputation: 5,
        skill: 10,
        week: 1,
        logs: ["Karriere gestartet in der Region: " + document.getElementById('dj-region').value]
    };

    updateDashboard();
    showScreen('dashboard');
});

// --- WOCHEN-SIMULATION (LOGIK) ---
btnNextWeek.addEventListener('click', () => {
    const weekdayAction = document.getElementById('select-weekday').value;
    const weekendAction = document.getElementById('select-weekend').value;

    gameState.week++;
    gameState.logs = []; // Log für neue Woche zurücksetzen

    // 1. Unter der Woche Aktion
    if (weekdayAction === 'work') {
        const salary = jobSalaries[gameState.job] || 100;
        gameState.money += salary;
        gameState.energy -= 40;
        addLog(`💼 Im Brotjob gearbeitet: +${salary} € | -40% Energie`);
    } else if (weekdayAction === 'digging') {
        if (gameState.money >= 50) {
            gameState.money -= 50;
            gameState.skill += 3;
            gameState.energy -= 20;
            addLog(`🎧 Platten gediggt: -50 €, DJ-Skill steigt (+3) | -20% Energie`);
        } else {
            addLog(`⚠️ Zu wenig Geld zum Platten-Diggen! Woche verbracht ohne Käufe.`);
        }
    } else if (weekdayAction === 'rest') {
        gameState.energy = Math.min(100, gameState.energy + 40);
        addLog(`🛋️ Unter der Woche ausgeruht: +40% Energie`);
    }

    // 2. Wochenende Aktion
    if (weekendAction === 'club') {
        if (gameState.money >= 30) {
            gameState.money -= 30;
            gameState.reputation += 2;
            gameState.energy -= 30;
            addLog(`🦇 Im Szene-Club netzwerkt: -30 €, Reputation steigt (+2) | -30% Energie`);
        } else {
            addLog(`⚠️ Nicht genug Geld für den Club-Eintritt/Drinks!`);
        }
    } else if (weekendAction === 'practice') {
        gameState.skill += 2;
        gameState.energy -= 20;
        addLog(`🎹 Setlisten geübt: DJ-Skill steigt (+2) | -20% Energie`);
    } else if (weekendAction === 'sleep') {
        gameState.energy = Math.min(100, gameState.energy + 50);
        addLog(`😴 Wochenende ausgeschlafen: +50% Energie`);
    }

    // 3. Fixkosten / Miete (Wöchentlich)
    const rent = gameState.region === 'Metropole' ? 80 : 45;
    gameState.money -= rent;
    addLog(`🏚️ Wöchentliche Fixkosten/Miete bezahlt: -${rent} €`);

    // Burnout Check
    if (gameState.energy <= 0) {
        gameState.energy = 30;
        gameState.money -= 40;
        addLog(`💀 BURNOUT! Du warst völlig erschöpft. Arztrechnung: -40 €`);
    }

    updateDashboard();
});

// Hilfsfunktionen
function addLog(message) {
    gameState.logs.push(message);
}

function updateDashboard() {
    document.getElementById('hud-name').textContent = gameState.djName;
    document.getElementById('hud-week').textContent = gameState.week;
    document.getElementById('hud-job').textContent = gameState.job;
    document.getElementById('hud-region').textContent = gameState.region;
    document.getElementById('hud-money').textContent = gameState.money;
    document.getElementById('hud-energy').textContent = gameState.energy;
    document.getElementById('hud-rep').textContent = gameState.reputation;

    // Log-Fenster aktualisieren
    logList.innerHTML = '';
    gameState.logs.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        logList.appendChild(li);
    });
}
