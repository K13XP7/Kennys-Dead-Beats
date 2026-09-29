// Available Trades & Retail Jobs (Handel & Gewerbe)
const AVAILABLE_JOBS = [
    {
        id: "minijob_getraenke",
        title: "Aushilfe im Getränkemarkt",
        category: "Handel (Minijob)",
        salary: 520,
        workDays: [6], // Samstag
        workDaysText: "Samstag",
        durationMonths: 3,
        energyCostPerDay: 15,
        description: "Flexible Arbeitszeiten, entspannter Job. Perfekt für maximale Freiheit unter der Woche."
    },
    {
        id: "teilzeit_galabau",
        title: "Lager- & Logistikhelfer",
        category: "Gewerbe (Teilzeit)",
        salary: 1200,
        workDays: [2, 4], // Dienstag & Donnerstag
        workDaysText: "Di & Do",
        durationMonths: 6,
        energyCostPerDay: 20,
        description: "Körperliche Arbeit im Lager. Solides Nebeneinkommen mit freien Wochenenden."
    },
    {
        id: "mid_einzelhandel",
        title: "Verkäufer im Fachhandel",
        category: "Handel (Mid-Level)",
        salary: 1850,
        workDays: [1, 2, 3, 4], // Mo - Do
        workDaysText: "Mo bis Do",
        durationMonths: 6,
        energyCostPerDay: 25,
        description: "Geregelter 4-Tage-Job. Gute Balance aus festem Gehalt und freiem Wochenende."
    },
    {
        id: "mid_handwerk",
        title: "Geselle im Handwerk (Elektro/Holz)",
        category: "Handwerk (Mid-Level)",
        salary: 2100,
        workDays: [1, 2, 3, 4], // Mo - Do
        workDaysText: "Mo bis Do",
        durationMonths: 12,
        energyCostPerDay: 25,
        description: "Handwerkliches Geschick. Hilft dir später beim eigenständigen Aufbau von Bühnen & Sound-Setups."
    },
    {
        id: "full_einzelhandel",
        title: "Einzelhandelskaufmann/-frau",
        category: "Handel (Vollzeit)",
        salary: 2500,
        workDays: [1, 2, 3, 4, 5], // Mo - Fr
        workDaysText: "Mo bis Fr",
        durationMonths: 12,
        energyCostPerDay: 25,
        description: "Anspruchsvoller Vollzeitjob. Gutes Gehalt, erfordert aber genaues Energiemanagement."
    }
];

// Game State
let gameState = {
    currentDate: new Date(2026, 0, 1), // 1. Januar 2026
    giroKonto: 500.00, // Startkapital
    sparKonto: 0.00,
    fixkosten: 750.00, // Miete + Strom
    energy: 100,
    maxEnergy: 100,
    energyDrinksDrunkToday: 0,
    currentJob: null,
    jobContractStart: null,
    logs: []
};

// Wochentage Arrays
const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

// Initialisierung bei Seitenaufruf
window.onload = function() {
    renderOnboardingJobs();
    updateUI();
};

// Navigation zwischen Tabs
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// Onboarding & Jobbörse Rendern
function renderOnboardingJobs() {
    const container = document.getElementById('onboarding-job-list');
    if (!container) return;
    container.innerHTML = '';

    AVAILABLE_JOBS.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.innerHTML = `
            <div>
                <h4>${job.title}</h4>
                <div class="job-meta">
                    <strong>Kategorie:</strong> ${job.category}<br>
                    <strong>Gehalt:</strong> ${job.salary.toFixed(2)} € / Monat<br>
                    <strong>Arbeitstage:</strong> ${job.workDaysText}<br>
                    <strong>Energieverbrauch:</strong> <span class="energy-warning">-${job.energyCostPerDay} / Arbeitstag</span><br>
                    <strong>Laufzeit:</strong> ${job.durationMonths} Monate
                </div>
                <p style="font-size: 0.85rem; color: #a8a8b3;">${job.description}</p>
            </div>
            <button class="primary-btn" style="margin-top: 15px;" onclick="acceptJob('${job.id}', true)">Job Wählen & Starten</button>
        `;
        container.appendChild(card);
    });
}

function renderJobBoard() {
    const currentDetails = document.getElementById('current-job-details');
    const boardContainer = document.getElementById('job-board-list');

    if (currentDetails) {
        if (gameState.currentJob) {
            const job = gameState.currentJob;
            currentDetails.innerHTML = `
                <p><strong>Position:</strong> ${job.title} (${job.category})</p>
                <p><strong>Gehalt:</strong> ${job.salary.toFixed(2)} € / Monat (Auszahlung am 1.)</p>
                <p><strong>Arbeitstage:</strong> ${job.workDaysText}</p>
                <p><strong>Energieverbrauch:</strong> <span class="energy-warning">-${job.energyCostPerDay} / Arbeitstag</span></p>
                <p><strong>Vertragslaufzeit:</strong> ${job.durationMonths} Monate</p>
            `;
        } else {
            currentDetails.innerHTML = `<p>Du hast aktuell keinen Job. Suche dir in der Liste unten eine Stelle!</p>`;
        }
    }

    if (boardContainer) {
        boardContainer.innerHTML = '';
        AVAILABLE_JOBS.forEach(job => {
            const isCurrent = gameState.currentJob && gameState.currentJob.id === job.id;
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <div>
                    <h4>${job.title}</h4>
                    <div class="job-meta">
                        <strong>Kategorie:</strong> ${job.category}<br>
                        <strong>Gehalt:</strong> ${job.salary.toFixed(2)} € / Monat<br>
                        <strong>Arbeitstage:</strong> ${job.workDaysText}<br>
                        <strong>Energieverbrauch:</strong> <span class="energy-warning">-${job.energyCostPerDay} / Arbeitstag</span><br>
                        <strong>Laufzeit:</strong> ${job.durationMonths} Monate
                    </div>
                    <p style="font-size: 0.85rem; color: #a8a8b3;">${job.description}</p>
                </div>
                <button class="primary-btn" style="margin-top: 15px;" ${isCurrent ? 'disabled' : ''} onclick="acceptJob('${job.id}', false)">
                    ${isCurrent ? 'Aktueller Vertrag' : 'Vertrag Annehmen'}
                </button>
            `;
            boardContainer.appendChild(card);
        });
    }
}

function acceptJob(jobId, isOnboarding) {
    const selectedJob = AVAILABLE_JOBS.find(j => j.id === jobId);
    if (!selectedJob) return;

    gameState.currentJob = selectedJob;
    gameState.jobContractStart = new Date(gameState.currentDate);

    addLog(`Arbeitsvertrag als "${selectedJob.title}" unterschrieben (${selectedJob.salary.toFixed(2)} €/Monat).`);

    if (isOnboarding) {
        const modal = document.getElementById('onboarding-modal');
        if (modal) modal.style.display = 'none';
    }

    updateUI();
}

// Energy Drink Boost
function buyEnergyDrink() {
    const DRINK_COST = 10.0;
    const MAX_DRINKS_PER_DAY = 5;
    const BOOST_STEPS = [5, 4, 3, 2, 1];

    if (gameState.energyDrinksDrunkToday >= MAX_DRINKS_PER_DAY) {
        alert("Du hast heute bereits das Maximum von 5 Energy Drinks getrunken!");
        return;
    }

    if (gameState.giroKnto < DRINK_COST) {
        alert("Nicht genügend Geld auf dem Girokonto! Ein Energy Drink kostet 10,00 €.");
        return;
    }

    const currentStep = gameState.energyDrinksDrunkToday;
    const energyGain = BOOST_STEPS[currentStep];

    gameState.giroKonto -= DRINK_COST;
    gameState.energyDrinksDrunkToday += 1;
    gameState.energy = Math.min(100, gameState.energy + energyGain);

    addLog(`⚡ Energy Drink getrunken (-10.00 €)! +${energyGain}% Energie (Dose ${gameState.energyDrinksDrunkToday}/${MAX_DRINKS_PER_DAY}).`);

    updateUI();
}

// Zeit- & Tagessystem
function advanceDay() {
    const dayOfWeek = gameState.currentDate.getDay(); // 0 = So, 1 = Mo, ...
    let didWork = false;
    let didGig = false;

    // 1. Arbeitstag verarbeiten
    if (gameState.currentJob && gameState.currentJob.workDays.includes(dayOfWeek)) {
        didWork = true;
        const cost = gameState.currentJob.energyCostPerDay || 25;
        gameState.energy = Math.max(0, gameState.energy - cost);
        addLog(`Arbeitstag bei "${gameState.currentJob.title}". Energie -${cost}.`);
    }

    // 2. Erholungs-Prüfung (Freier Tag: Kein Job & kein Gig)
    if (!didWork && !didGig) {
        if (gameState.energy < 75) {
            const oldEnergy = gameState.energy;
            gameState.energy = Math.min(75, gameState.energy + 25);
            const gained = gameState.energy - oldEnergy;
            addLog(`Freier Tag! Du erholst dich (+${gained}% Energie -> ${gameState.energy}%).`);
        } else if (gameState.energy >= 75 && gameState.energy < 90) {
            gameState.energy = 90;
            addLog(`Zweiter freier Tag! Tiefe Erholung: Energie auf 90% aufgeladen.`);
        } else {
            addLog(`Freier Tag! Energie liegt bei ${gameState.energy}%.`);
        }
    }

    // 3. Reset des Tageszählers für Energy Drinks
    gameState.energyDrinksDrunkToday = 0;

    // 4. Datum um 1 Tag erhöhen
    gameState.currentDate.setDate(gameState.currentDate.getDate() + 1);

    // 5. Monatsanfang prüfen (Gehalt & Miete)
    if (gameState.currentDate.getDate() === 1) {
        processMonthlyFinances();
    }

    updateUI();
}

function processMonthlyFinances() {
    // Gehalt
    if (gameState.currentJob) {
        gameState.giroKonto += gameState.currentJob.salary;
        addLog(`💰 Gehalt erhalten: +${gameState.currentJob.salary.toFixed(2)} € von ${gameState.currentJob.title}.`);
    }

    // Fixkosten
    gameState.giroKonto -= gameState.fixkosten;
    addLog(`🏠 Fixkosten abgebucht (Miete & Strom): -${gameState.fixkosten.toFixed(2)} €.`);

    // Zinsen Sparkonto (3% p.a.)
    if (gameState.sparKonto > 0) {
        const interest = gameState.sparKonto * (0.03 / 12);
        gameState.sparKonto += interest;
        addLog(`📈 Zinsgutschrift Sparkonto: +${interest.toFixed(2)} €.`);
    }
}

// Sparkonto Aktionen
function depositSavings() {
    const input = document.getElementById('bank-amount');
    const amount = parseFloat(input.value);

    if (!isNaN(amount) && amount > 0 && gameState.giroKonto >= amount) {
        gameState.giroKonto -= amount;
        gameState.sparKonto += amount;
        addLog(`📥 ${amount.toFixed(2)} € auf das Sparkonto eingezahlt.`);
        input.value = '';
        updateUI();
    } else {
        alert("Ungültiger Betrag oder unzureichendes Guthaben auf dem Girokonto!");
    }
}

function withdrawSavings() {
    const input = document.getElementById('bank-amount');
    const amount = parseFloat(input.value);

    if (!isNaN(amount) && amount > 0 && gameState.sparKonto >= amount) {
        gameState.sparKonto -= amount;
        gameState.giroKonto += amount;
        addLog(`📤 ${amount.toFixed(2)} € vom Sparkonto umgebucht.`);
        input.value = '';
        updateUI();
    } else {
        alert("Ungültiger Betrag oder unzureichendes Guthaben auf dem Sparkonto!");
    }
}

// Log System
function addLog(message) {
    const timeStr = `${WEEKDAYS[gameState.currentDate.getDay()]}, ${formatDate(gameState.currentDate)}`;
    gameState.logs.unshift(`[${timeStr}] ${message}`);
    if (gameState.logs.length > 20) gameState.logs.pop();
}

function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
}

// UI Update
function updateUI() {
    // Datumsanzeige
    const dayName = WEEKDAYS[gameState.currentDate.getDay()];
    const dateEl = document.getElementById('date-display');
    if (dateEl) dateEl.innerText = `${dayName}, ${formatDate(gameState.currentDate)}`;

    // Dashboard Werte
    const giroEl = document.getElementById('giro-val');
    const sparEl = document.getElementById('spar-val');
    const jobEl = document.getElementById('job-val');
    const energyEl = document.getElementById('energyDisplay');

    if (giroEl) giroEl.innerText = `${gameState.giroKonto.toFixed(2)} €`;
    if (sparEl) sparEl.innerText = `${gameState.sparKonto.toFixed(2)} €`;
    if (jobEl) jobEl.innerText = gameState.currentJob ? gameState.currentJob.title : "Kein Job";
    if (energyEl) energyEl.innerText = `${gameState.energy} / ${gameState.maxEnergy}`;

    // Energy Drink UI
    const drinkCountEl = document.getElementById('drinkCountDisplay');
    const drinkBtn = document.getElementById('btnEnergyDrink');

    if (drinkCountEl) {
        drinkCountEl.innerText = `Heute getrunken: ${gameState.energyDrinksDrunkToday} / 5`;
    }
    if (drinkBtn) {
        drinkBtn.disabled = (gameState.energyDrinksDrunkToday >= 5);
    }

    // Finanzen Tab Werte
    const finGiro = document.getElementById('fin-giro');
    const finSpar = document.getElementById('fin-spar');
    if (finGiro) finGiro.innerText = `${gameState.giroKonto.toFixed(2)} €`;
    if (finSpar) finSpar.innerText = `${gameState.sparKonto.toFixed(2)} €`;

    // Status Logs
    const logList = document.getElementById('log-list');
    if (logList) {
        logList.innerHTML = '';
        gameState.logs.forEach(log => {
            const li = document.createElement('li');
            li.innerText = log;
            logList.appendChild(li);
        });
    }

    // Jobbörse verwalten
    renderJobBoard();
}
