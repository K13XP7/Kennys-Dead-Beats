// SPIEL-ZUSTAND (GameState)
let gameState = null;

const DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

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
const btnCloseSummary = document.getElementById('btn-close-summary');

const saveInfoText = document.getElementById('save-info');
const djForm = document.getElementById('dj-form');
const logList = document.getElementById('log-list');
const gigListContainer = document.getElementById('gig-list');
const summaryModal = document.getElementById('summary-modal');

// Tageslöhne Brotjob
const jobDailySalaries = {
    "Plattenladen-Aushilfe": 30,
    "Barkeeper im Szenelokal": 40,
    "Lagerarbeiter": 55
};

// Mögliche Gigs
const possibleGigs = [
    { title: "Düster-Spelunke 'Der Sarg'", minRep: 0, minSkill: 5, pay: 60, repReward: 2, energyCost: 35, desc: "Kleine Kneipe, feuchter Keller. Perfekt für die ersten Gehversuche.", avgGuests: 35 },
    { title: "Jugendzentrum 'Katakombe'", minRep: 5, minSkill: 12, pay: 110, repReward: 4, energyCost: 40, desc: "Szenetreff für Nachwuchs-Goths. Solide Anlage, dankbares Publikum.", avgGuests: 85 },
    { title: "Untergrund-Club 'Schattenwerk'", minRep: 15, minSkill: 20, pay: 220, repReward: 7, energyCost: 50, desc: "Bekannter Szene-Club. Hier schauen auch auswärtige DJs vorbei.", avgGuests: 210 },
    { title: "Industrial Festival 'Maschinensturm'", minRep: 35, minSkill: 35, pay: 450, repReward: 15, energyCost: 65, desc: "Große Halle, harte Bässe. Dein erster großer Festival-Slot!", avgGuests: 650 }
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
        saveInfoText.textContent = `Speicherstand: ${parsed.djName} | KW ${parsed.week || 1} (${DAYS[parsed.dayIndex || 0]}) | ${parsed.money} €`;
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
        if (gameState.dayIndex === undefined) gameState.dayIndex = 0;
        if (!gameState.energy) gameState.energy = 100;
        if (!gameState.currentGigs) gameState.currentGigs = [];
        if (!gameState.logs) gameState.logs = ["Spielstand geladen."];
        if (!gameState.weeklyStats) resetWeeklyStats();
        
        updateDashboard();
        showScreen('dashboard');
    }
}

function resetWeeklyStats() {
    if (!gameState) return;
    gameState.weeklyStats = {
        income: 0,
        expenses: 0,
        guests: 0,
        crowdMood: "Keine Party gespielt"
    };
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

btnCloseSummary.addEventListener('click', () => {
    summaryModal.classList.add('hidden');
});

// Neues Spiel starten
djForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('dj-name').value.trim();
    if (!nameInput) {
        alert("Bitte gib einen DJ-Namen ein!");
        return;
    }

    gameState = {
        djName: nameInput,
        genre: document.getElementById('dj-genre').value,
        region: document.getElementById('dj-region').value,
        job: document.getElementById('dj-job').value,
        money: 150,
        energy: 100,
        reputation: 5,
        skill: 10,
        week: 1,
        dayIndex: 0, // 0 = Montag
        currentGigs: [],
        logs: ["Karriere gestartet in der Region: " + document.getElementById('dj-region').value]
    };

    resetWeeklyStats();
    generateGigOffers();
    updateDashboard();
    showScreen('dashboard');
});

// --- GIG-GENERATOR ---
function generateGigOffers() {
    gameState.currentGigs = [];
    possibleGigs.forEach(gig => {
        if (gameState.reputation >= gig.minRep && Math.random() > 0.4) {
            gameState.currentGigs.push(gig);
        }
    });
}

function playGig(gigIndex) {
    const currentDay = DAYS[gameState.dayIndex];
    if (currentDay !== "Samstag" && currentDay !== "Sonntag") {
        alert("Gigs können nur am Wochenende (Samstag oder Sonntag) gespielt werden!");
        return;
    }

    const gig = gameState.currentGigs[gigIndex];

    if (gameState.energy < gig.energyCost) {
        alert("Du bist zu erschöpft für diesen Gig! Rufe dich erst aus.");
        return;
    }

    const successRate = Math.min(100, (gameState.skill / gig.minSkill) * 80);
    const roll = Math.random() * 100;

    gameState.energy -= gig.energyCost;

    if (roll <= successRate) {
        // Erfolgreich
        const tip = Math.floor(Math.random() * 20) + 10;
        const totalEarnings = gig.pay + tip;
        gameState.money += totalEarnings;
        gameState.reputation += gig.repReward;
        gameState.skill += 2;

        const actualGuests = Math.floor(gig.avgGuests * (0.8 + Math.random() * 0.4));
        gameState.weeklyStats.income += totalEarnings;
        gameState.weeklyStats.guests += actualGuests;
        gameState.weeklyStats.crowdMood = "🔥 Ekstase & Begeisterung!";

        addLog(`🎧 [${currentDay}] GIG ERFOLG in '${gig.title}'! +${totalEarnings}€ (${actualGuests} Gäste).`);
    } else {
        // Reinfall
        const halfPay = Math.floor(gig.pay / 2);
        gameState.money += halfPay;
        gameState.reputation = Math.max(0, gameState.reputation - 1);

        const actualGuests = Math.floor(gig.avgGuests * 0.5);
        gameState.weeklyStats.income += halfPay;
        gameState.weeklyStats.guests += actualGuests;
        gameState.weeklyStats.crowdMood = "💀 Enttäuschte Blicke & Leere Tanzfläche";

        addLog(`💀 [${currentDay}] GIG PANNENSHOW in '${gig.title}'... Set verpatzt. Nur ${halfPay}€ Gage.`);
    }

    gameState.currentGigs.splice(gigIndex, 1);
    advanceDay();
}

// --- TAGES-SIMULATION ---
function performDailyAction(actionType) {
    const currentDay = DAYS[gameState.dayIndex];

    if (actionType === 'work') {
        const salary = jobDailySalaries[gameState.job] || 35;
        gameState.money += salary;
        gameState.weeklyStats.income += salary;
        gameState.energy = Math.max(0, gameState.energy - 30);
        addLog(`💼 [${currentDay}] Brotjob gearbeitet: +${salary} € | -30% Energie`);
    } 
    else if (actionType === 'practice') {
        if (gameState.energy < 15) {
            alert("Du bist zu müde zum Üben! Ruhe dich aus.");
            return;
        }
        gameState.skill += 2;
        gameState.energy -= 15;
        addLog(`🎹 [${currentDay}] Setlisten geübt: Skill +2 | -15% Energie`);
    } 
    else if (actionType === 'digging') {
        if (gameState.money < 40) {
            alert("Du hast nicht genug Geld (40 € benötigt)!");
            return;
        }
        if (gameState.energy < 10) {
            alert("Du bist zu müde zum Diggen!");
            return;
        }
        gameState.money -= 40;
        gameState.weeklyStats.expenses += 40;
        gameState.skill += 4;
        gameState.energy -= 10;
        addLog(`🎧 [${currentDay}] Platten gediggt: -40 €, Skill +4 | -10% Energie`);
    } 
    else if (actionType === 'club') {
        if (gameState.money < 25) {
            alert("Du hast nicht genug Geld für Eintritt & Drinks (25 €)!");
            return;
        }
        if (gameState.energy < 25) {
            alert("Du bist zu kaputt zum Feiern!");
            return;
        }
        gameState.money -= 25;
        gameState.weeklyStats.expenses += 25;
        gameState.reputation += 2;
        gameState.energy -= 25;
        addLog(`🦇 [${currentDay}] Szene-Club Netzwerken: -25 €, Rep +2 | -25% Energie`);
    } 
    else if (actionType === 'rest') {
        gameState.energy = Math.min(100, gameState.energy + 40);
        addLog(`😴 [${currentDay}] Ausgeschlafen & erholt: +40% Energie`);
    }

    advanceDay();
}

function advanceDay() {
    // Burnout Überprüfung am Ende des Tages
    if (gameState.energy <= 0) {
        gameState.energy = 25;
        gameState.money = Math.max(0, gameState.money - 30);
        gameState.weeklyStats.expenses += 30;
        addLog(`💀 BURNOUT! Notfall-Rest nötig. Arztrechnung: -30 €`);
    }

    gameState.dayIndex++;

    // Wenn Sonntag vorbei ist -> Wochenauswertung!
    if (gameState.dayIndex >= 7) {
        endWeek();
    } else {
        updateDashboard();
    }
}

function endWeek() {
    // Miete berechnen
    const rent = gameState.region === 'Metropole' ? 80 : 45;
    gameState.money -= rent;
    gameState.weeklyStats.expenses += rent;
    addLog(`🏚 Miete am Ende der Woche bezahlt: -${rent} €`);

    // Werte für Modal sichern
    const summaryStats = {
        week: gameState.week,
        income: gameState.weeklyStats.income,
        expenses: gameState.weeklyStats.expenses,
        guests: gameState.weeklyStats.guests,
        crowdMood: gameState.weeklyStats.crowdMood
    };

    // Neue Woche vorbereiten
    gameState.week++;
    gameState.dayIndex = 0; // Zurück auf Montag
    
    showSummaryModal(summaryStats);
    resetWeeklyStats();
    generateGigOffers();
    updateDashboard();
}

function showSummaryModal(stats) {
    document.getElementById('summary-week').textContent = stats.week;
    document.getElementById('summary-guests').textContent = stats.guests;
    document.getElementById('summary-crowd-mood').textContent = stats.crowdMood;
    document.getElementById('summary-income').textContent = stats.income;
    document.getElementById('summary-expenses').textContent = stats.expenses;
    
    const balance = stats.income - stats.expenses;
    const balanceEl = document.getElementById('summary-balance');
    balanceEl.textContent = (balance >= 0 ? "+" : "") + balance;
    balanceEl.style.color = balance >= 0 ? "#4caf50" : "#f44336";

    summaryModal.classList.remove('hidden');
}

// Hilfsfunktionen
function addLog(message) {
    gameState.logs.push(message);
}

function updateDashboard() {
    const currentDay = DAYS[gameState.dayIndex];

    document.getElementById('hud-name').textContent = gameState.djName;
    document.getElementById('hud-week').textContent = gameState.week;
    document.getElementById('hud-day').textContent = currentDay;
    document.getElementById('current-day-label').textContent = currentDay;
    
    document.getElementById('hud-job').textContent = gameState.job;
    document.getElementById('hud-region').textContent = gameState.region;
    document.getElementById('hud-money').textContent = gameState.money;
    document.getElementById('hud-energy').textContent = gameState.energy;
    document.getElementById('hud-rep').textContent = gameState.reputation;
    document.getElementById('hud-skill').textContent = gameState.skill;

    // Log-Fenster
    logList.innerHTML = '';
    gameState.logs.slice(-6).forEach(log => { // Zeige nur die letzten 6 Einträge
        const li = document.createElement('li');
        li.textContent = log;
        logList.appendChild(li);
    });

    // Gig-Anfragen
    gigListContainer.innerHTML = '';
    if (!gameState.currentGigs || gameState.currentGigs.length === 0) {
        gigListContainer.innerHTML = '<p class="no-gigs">Keine aktuellen Anfragen diese Woche.</p>';
    } else {
        gameState.currentGigs.forEach((gig, index) => {
            const card = document.createElement('div');
            card.className = 'gig-card';
            const isWeekend = currentDay === "Samstag" || currentDay === "Sonntag";
            
            card.innerHTML = `
                <div class="gig-info">
                    <h5>${gig.title}</h5>
                    <p>${gig.desc}</p>
                    <p><strong>Gage:</strong> ${gig.pay}€ | <strong>Energie:</strong> -${gig.energyCost}% | <strong>Skill:</strong> ${gig.minSkill}</p>
                </div>
                <button class="btn primary" onclick="playGig(${index})" ${!isWeekend ? 'disabled title="Gigs erst am Samstag/Sonntag spielbar"' : ''}>
                    ${isWeekend ? 'Gig Spielen 🎧' : 'Nur am Sa/So'}
                </button>
            `;
            gigListContainer.appendChild(card);
        });
    }
}
