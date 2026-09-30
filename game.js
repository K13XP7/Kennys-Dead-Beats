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
const gigListContainer = document.getElementById('gig-list');

// Brotjob-Gehälter
const jobSalaries = {
    "Plattenladen-Aushilfe": 120,
    "Barkeeper im Szenelokal": 160,
    "Lagerarbeiter": 220
};

// Mögliche Gig-Locations basierend auf Reputation
const possibleGigs = [
    { title: "Düster-Spelunke 'Der Sarg'", minRep: 0, minSkill: 5, pay: 60, repReward: 2, energyCost: 30, desc: "Kleine Kneipe, feuchter Keller. Perfekt für die ersten Gehversuche." },
    { title: "Jugendzentrum 'Katakombe'", minRep: 5, minSkill: 12, pay: 110, repReward: 4, energyCost: 35, desc: "Szenetreff für Nachwuchs-Goths. Solide Anlage, dankbares Publikum." },
    { title: "Untergrund-Club 'Schattenwerk'", minRep: 15, minSkill: 20, pay: 220, repReward: 7, energyCost: 45, desc: "Bekannter Szene-Club. Hier schauen auch auswärtige DJs vorbei." },
    { title: "Industrial Festival 'Maschinensturm'", minRep: 35, minSkill: 35, pay: 450, repReward: 15, energyCost: 60, desc: "Große Halle, harte Bässe. Dein erster großer Festival-Slot!" }
];

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
    alert('Spielstand erfolgreich gespeichert! ⚰️');
    checkExistingSave();
}

function loadGame() {
    const savedData = localStorage.getItem('graveyard_noise_save');
    if (savedData) {
        gameState = JSON.parse(savedData);
        if (!gameState.week) gameState.week = 1;
        if (!gameState.energy) gameState.energy = 100;
        if (!gameState.currentGigs) gameState.currentGigs = [];
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
        currentGigs: [],
        logs: ["Karriere gestartet in der Region: " + document.getElementById('dj-region').value]
    };

    generateGigOffers();
    updateDashboard();
    showScreen('dashboard');
});

// --- GIG-GENERATOR ---
function generateGigOffers() {
    gameState.currentGigs = [];
    // Chance auf Gig-Anfrage basierend auf Reputation
    possibleGigs.forEach(gig => {
        if (gameState.reputation >= gig.minRep && Math.random() > 0.4) {
            gameState.currentGigs.push(gig);
        }
    });
}

function playGig(gigIndex) {
    const gig = gameState.currentGigs[gigIndex];

    if (gameState.energy < gig.energyCost) {
        alert("Du bist zu erschöpft für diesen Gig! Rufe dich erst aus.");
        return;
    }

    // Erfolgswahrscheinlichkeit basierend auf Skill
    const successRate = Math.min(100, (gameState.skill / gig.minSkill) * 80);
    const roll = Math.random() * 100;

    gameState.energy -= gig.energyCost;

    if (roll <= successRate) {
        // Erfolgreicher Gig
        const tip = Math.floor(Math.random() * 20) + 10;
        const totalEarnings = gig.pay + tip;
        gameState.money += totalEarnings;
        gameState.reputation += gig.repReward;
        gameState.skill += 2;
        addLog(`🦇 GIG ERFOLG in '${gig.title}'! Gage: ${gig.pay}€ + ${tip}€ Trinkgeld. Rep: +${gig.repReward}`);
    } else {
        // Desaster-Gig (Übergänge verpatzt etc.)
        const halfPay = Math.floor(gig.pay / 2);
        gameState.money += halfPay;
        gameState.reputation = Math.max(0, gameState.reputation - 1);
        addLog(`💀 GIG PANNENSHOW in '${gig.title}'... Set verpatzt. Nur ${halfPay}€ Gage bekommen. Rep: -1`);
    }

    // Gig aus der Liste entfernen
    gameState.currentGigs.splice(gigIndex, 1);
    updateDashboard();
}

// --- WOCHEN-SIMULATION (LOGIK) ---
btnNextWeek.addEventListener('click', () => {
    const weekdayAction = document.getElementById('select-weekday').value;
    const weekendAction = document.getElementById('select-weekend').value;

    gameState.week++;
    gameState.logs = [];

    // 1. Unter der Woche
    if (weekdayAction === 'work') {
        const salary = jobSalaries[gameState.job] || 100;
        gameState.money += salary;
        gameState.energy -= 40;
        addLog(`💼 Brotjob: +${salary} € | -40% Energie`);
    } else if (weekdayAction === 'digging') {
        if (gameState.money >= 50) {
            gameState.money -= 50;
            gameState.skill += 3;
            gameState.energy -= 20;
            addLog(`🎧 Platten gediggt: -50 €, DJ-Skill +3 | -20% Energie`);
        } else {
            addLog(`⚠️ Zu wenig Geld zum Platten-Diggen!`);
        }
    } else if (weekdayAction === 'rest') {
        gameState.energy = Math.min(100, gameState.energy + 40);
        addLog(`🛋️ Unter der Woche erholt: +40% Energie`);
    }

    // 2. Wochenende
    if (weekendAction === 'club') {
        if (gameState.money >= 30) {
            gameState.money -= 30;
            gameState.reputation += 2;
            gameState.energy -= 30;
            addLog(`🦇 Szene-Club Netzwerken: -30 €, Reputation +2 | -30% Energie`);
        } else {
            addLog(`⚠️ Kein Geld für den Club-Eintritt!`);
        }
    } else if (weekendAction === 'practice') {
        gameState.skill += 2;
        gameState.energy -= 20;
        addLog(`🎹 Setlisten geübt: DJ-Skill +2 | -20% Energie`);
    } else if (weekendAction === 'sleep') {
        gameState.energy = Math.min(100, gameState.energy + 50);
        addLog(`😴 Wochenende ausgeschlafen: +50% Energie`);
    }

    // 3. Miete
    const rent = gameState.region === 'Metropole' ? 80 : 45;
    gameState.money -= rent;
    addLog(`🏚️️ Miete bezahlt: -${rent} €`);

    // Burnout Check
    if (gameState.energy <= 0) {
        gameState.energy = 30;
        gameState.money -= 40;
        addLog(`💀 BURNOUT! Notfall-Rast nötig. Arztrechnung: -40 €`);
    }

    // Neue Gigs für die nächste Woche generieren
    generateGigOffers();
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

    // Log-Fenster
    logList.innerHTML = '';
    gameState.logs.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        logList.appendChild(li);
    });

    // Gig-Anfragen darstellen
    gigListContainer.innerHTML = '';
    if (!gameState.currentGigs || gameState.currentGigs.length === 0) {
        gigListContainer.innerHTML = '<p class="no-gigs">Keine aktuellen Anfragen diese Woche.</p>';
    } else {
        gameState.currentGigs.forEach((gig, index) => {
            const card = document.createElement('div');
            card.className = 'gig-card';
            card.innerHTML = `
                <div class="gig-info">
                    <h5>${gig.title}</h5>
                    <p>${gig.desc}</p>
                    <p><strong>Gage:</strong> ${gig.pay}€ | <strong>Energie:</strong> -${gig.energyCost}% | <strong>Empf. Skill:</strong> ${gig.minSkill}</p>
                </div>
                <button class="btn primary" onclick="playGig(${index})">Gig Spielen 🎧</button>
            `;
            gigListContainer.appendChild(card);
        });
    }
}
