// game.js

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
        energyCost: 20,
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
        energyCost: 35,
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
        energyCost: 30,
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
        energyCost: 40,
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
        energyCost: 35,
        description: "Vollzeitstelle im Supermarkt/Kaufhaus. Verlässliches Einkommen, aber strammer Wochenplan."
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
    currentJob: null,
    jobContractStart: null,
    logs: []
};

// Days of week array
const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

// Initialize Game
window.onload = function() {
    renderOnboardingJobs();
    updateUI();
};

// Navigation
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Onboarding & Jobs
function renderOnboardingJobs() {
    const container = document.getElementById('onboarding-job-list');
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

    if (gameState.currentJob) {
        const job = gameState.currentJob;
        currentDetails.innerHTML = `
            <p><strong>Position:</strong> ${job.title} (${job.category})</p>
            <p><strong>Gehalt:</strong> ${job.salary.toFixed(2)} € / Monat (Auszahlung am 1.)</p>
            <p><strong>Arbeitstage:</strong> ${job.workDaysText}</p>
            <p><strong>Vertragslaufzeit:</strong> ${job.durationMonths} Monate</p>
        `;
    } else {
        currentDetails.innerHTML = `<p>Du hast aktuell keinen Job. Suche dir in der Liste unten eine Stelle!</p>`;
    }

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

function acceptJob(jobId, isOnboarding) {
    const selectedJob = AVAILABLE_JOBS.find(j => j.id === jobId);
    if (!selectedJob) return;

    gameState.currentJob = selectedJob;
    gameState.jobContractStart = new Date(gameState.currentDate);

    addLog(`Arbeitsvertrag als "${selectedJob.title}" unterschrieben (${selectedJob.salary.toFixed(2)} €/Monat).`);

    if (isOnboarding) {
        document.getElementById('onboarding-modal').style.display = 'none';
    }

    updateUI();
}

// Time System
function advanceDay() {
    // Advance Date
    gameState.currentDate.setDate(gameState.currentDate.getDate() + 1);
    const dayOfWeek = gameState.currentDate.getDay(); // 0 = So, 1 = Mo, ...
    const isFirstOfMonth = gameState.currentDate.getDate() === 1;

    // Handle Work Day
    if (gameState.currentJob && gameState.currentJob.workDays.includes(dayOfWeek)) {
        gameState.energy = Math.max(0, gameState.energy - gameState.currentJob.energyCost);
        addLog(`Arbeitstag bei "${gameState.currentJob.title}". Energie -${gameState.currentJob.energyCost}.`);
    } else {
        // Regenerate Energy on Off-days
        gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + 40);
    }

    // Monthly Payday & Rent Deduction (1st of Month)
    if (isFirstOfMonth) {
        processMonthlyFinances();
    }

    updateUI();
}

function processMonthlyFinances() {
    // Salary
    if (gameState.currentJob) {
        gameState.giroKonto += gameState.currentJob.salary;
        addLog(`💰 Gehalt erhalten: +${gameState.currentJob.salary.toFixed(2)} € von ${gameState.currentJob.title}.`);
    }

    // Fixkosten
    gameState.giroKonto -= gameState.fixkosten;
    addLog(`🏠 Fixkosten abgebucht (Miete & Strom): -${gameState.fixkosten.toFixed(2)} €.`);

    // Zinsen Sparkonto (3% p.a. -> ~0.25% pro Monat)
    if (gameState.sparKonto > 0) {
        const interest = gameState.sparKonto * (0.03 / 12);
        gameState.sparKonto += interest;
        addLog(`📈 Zinsgutschrift Sparkonto: +${interest.toFixed(2)} €.`);
    }
}

// Savings Account Actions
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
    if (gameState.logs.length > 15) gameState.logs.pop();
}

function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
}

// UI Update
function updateUI() {
    // Date
    const dayName = WEEKDAYS[gameState.currentDate.getDay()];
    document.getElementById('date-display').innerText = `${dayName}, ${formatDate(gameState.currentDate)}`;

    // Dashboard Stats
    document.getElementById('giro-val').innerText = `${gameState.giroKonto.toFixed(2)} €`;
    document.getElementById('spar-val').innerText = `${gameState.sparKonto.toFixed(2)} €`;
    document.getElementById('job-val').innerText = gameState.currentJob ? gameState.currentJob.title : "Kein Job";
    document.getElementById('energy-val').innerText = `${gameState.energy} / ${gameState.maxEnergy}`;

    // Finance Tab Stats
    document.getElementById('fin-giro').innerText = `${gameState.giroKonto.toFixed(2)} €`;
    document.getElementById('fin-spar').innerText = `${gameState.sparKonto.toFixed(2)} €`;

    // Logs
    const logList = document.getElementById('log-list');
    logList.innerHTML = '';
    gameState.logs.forEach(log => {
        const li = document.createElement('li');
        li.innerText = log;
        logList.appendChild(li);
    });

    // Render Jobboard
    renderJobBoard();
}
