// game.js

// 1. DATA DEFINITIONS
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
        workDays: [2, 4], // Di & Do
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

const LOCATIONS = [
    {
        id: "caveau_mainz",
        name: "Caveau Mainz (Gewölbekeller)",
        city: "Mainz",
        rent: 250.00,
        capacity: 120,
        description: "Athmosphärischer Gewölbekeller. Ideal für Postpunk, Darkwave und intimere Clubnächte."
    },
    {
        id: "stengelvilla_wiesbaden",
        name: "Stengelvilla",
        city: "Wiesbaden",
        rent: 450.00,
        capacity: 220,
        description: "Roher Industrial-Vibe mit erstklassiger Soundanlage. Sehr beliebt bei EBM- & Noise-Fans."
    },
    {
        id: "kultclub_frankfurt",
        name: "Kult-Halle Frankfurt",
        city: "Frankfurt a.M.",
        rent: 900.00,
        capacity: 500,
        description: "Große Location für Szene-Gigs und Minifestivals. Hohe Miete, aber enormes Potenzial!"
    }
];

const MARKETING_PACKAGES = [
    { id: "none", name: "Mundpropaganda (0 €)", cost: 0, boost: 1.0 },
    { id: "flyer", name: "Plakate & Flyer in Szene-Kneipen (50 €)", cost: 50, boost: 1.25 },
    { id: "online", name: "Social Media & Online-Promo (120 €)", cost: 120, boost: 1.50 },
    { id: "full", name: "Full Szene-Blast (Print, Online, Flyer) (250 €)", cost: 250, boost: 1.85 }
];

// 2. GAME STATE
let gameState = {
    currentDate: new Date(2026, 0, 1),
    giroKonto: 500.00,
    sparKonto: 0.00,
    fixkosten: 750.00,
    energy: 100,
    maxEnergy: 100,
    energyDrinksDrunkToday: 0,
    reputation: 10, // Szene-Bekanntheit
    currentJob: null,
    jobContractStart: null,
    djRequests: [], // Postfach Mails
    acceptedGigs: [], // Akzeptierte Fremd-Gigs
    plannedEvent: null, // Eigenes geplantes Event
    logs: []
};

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

// 3. INITIALIZATION
window.onload = function() {
    generateInitialDJRequests();
    renderOnboardingJobs();
    updateUI();
};

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// 4. ONBOARDING & JOBS
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

// 5. DJ MAILBOX (FREMD-GIGS)
function generateInitialDJRequests() {
    gameState.djRequests = [
        {
            id: "req_1",
            from: "booking@caveau-mainz.de",
            location: "Caveau Mainz",
            genre: "Darkwave & Postpunk",
            dayOfWeek: 5, // Freitag
            dayText: "Diesen Freitag",
            pay: 180.00,
            energyCost: 30
        },
        {
            id: "req_2",
            from: "orga@stengelvilla.de",
            location: "Stengelvilla Wiesbaden",
            genre: "Harsh EBM / Industrial",
            dayOfWeek: 6, // Samstag
            dayText: "Diesen Samstag",
            pay: 250.00,
            energyCost: 35
        }
    ];
}

function renderMailbox() {
    const container = document.getElementById('dj-mailbox-list');
    if (!container) return;

    if (gameState.djRequests.length === 0) {
        container.innerHTML = `<p class="small-text">Keine neuen Anfragen im Postfach.</p>`;
        return;
    }

    container.innerHTML = '';
    gameState.djRequests.forEach(req => {
        const card = document.createElement('div');
        card.className = 'mail-card';
        card.innerHTML = `
            <div class="mail-header">✉️ Von: ${req.from}</div>
            <p><strong>Gig @ ${req.location}</strong> (${req.genre})</p>
            <p class="small-text">Wochentag: ${req.dayText} | Honorar: <strong style="color: #00e676;">+${req.pay.toFixed(2)} €</strong> | Aufwand: -${req.energyCost} Energie</p>
            <div class="mail-actions">
                <button class="secondary-btn" style="padding: 5px 10px; font-size: 0.85rem;" onclick="acceptDJRequest('${req.id}')">Annehmen 👍</button>
                <button class="secondary-btn" style="padding: 5px 10px; font-size: 0.85rem;" onclick="declineDJRequest('${req.id}')">Ablehnen 👎</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function acceptDJRequest(reqId) {
    const reqIndex = gameState.djRequests.findIndex(r => r.id === reqId);
    if (reqIndex === -1) return;

    const req = gameState.djRequests[reqIndex];
    gameState.acceptedGigs.push({ ...req, targetDateDay: req.dayOfWeek });
    gameState.djRequests.splice(reqIndex, 1);

    addLog(`DJ-Gig @ ${req.location} für ${req.dayText} zugesagt! Honorar: +${req.pay.toFixed(2)} €.`);
    updateUI();
}

function declineDJRequest(reqId) {
    gameState.djRequests = gameState.djRequests.filter(r => r.id !== reqId);
    addLog(`DJ-Anfrage abgelehnt.`);
    updateUI();
}

// 6. EVENT PLANNING & LOCATION BOOKING
function renderLocations() {
    const container = document.getElementById('location-list');
    const statusContainer = document.getElementById('active-event-details');
    if (!container) return;

    // Active Event Status
    if (statusContainer) {
        if (gameState.plannedEvent) {
            const ev = gameState.plannedEvent;
            statusContainer.innerHTML = `
                <p><strong>Location:</strong> ${ev.location.name}</p>
                <p><strong>Termin:</strong> ${ev.dayText} (${formatDate(ev.eventDate)})</p>
                <p><strong>Eintritt:</strong> ${ev.ticketPrice.toFixed(2)} € | <strong>Marketing:</strong> ${ev.marketing.name}</p>
                <p><strong>Kosten im Voraus bezahlt:</strong> ${(ev.location.rent + ev.marketing.cost).toFixed(2)} €</p>
            `;
        } else {
            statusContainer.innerHTML = `<p>Aktuell ist keine eigene Party geplant.</p>`;
        }
    }

    container.innerHTML = '';
    LOCATIONS.forEach(loc => {
        const isBooked = gameState.plannedEvent !== null;
        const card = document.createElement('div');
        card.className = 'job-card';
        card.innerHTML = `
            <div>
                <h4>${loc.name} (${loc.city})</h4>
                <div class="job-meta">
                    <strong>Miete (Vorkasse):</strong> ${loc.rent.toFixed(2)} €<br>
                    <strong>Kapazität:</strong> ${loc.capacity} Gäste
                </div>
                <p style="font-size: 0.85rem; color: #a8a8b3; margin-bottom: 15px;">${loc.description}</p>
                
                <div class="booking-form">
                    <label>Veranstaltungstag:</label>
                    <select id="day-select-${loc.id}">
                        <option value="5">Diesen Freitag</option>
                        <option value="6">Diesen Samstag</option>
                    </select>

                    <label>Eintrittspreis (€):</label>
                    <input type="number" id="price-select-${loc.id}" value="8.00" min="0" step="1">

                    <label>📣 Werbepaket auswählen:</label>
                    <select id="marketing-select-${loc.id}">
                        ${MARKETING_PACKAGES.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <button class="primary-btn" style="margin-top: 15px;" ${isBooked ? 'disabled' : ''} onclick="bookLocation('${loc.id}')">
                ${isBooked ? 'Bereits ein Event geplant' : 'Location & Werbung Buchen (Vorkasse)'}
            </button>
        `;
        container.appendChild(card);
    });
}

function bookLocation(locId) {
    if (gameState.plannedEvent) {
        alert("Du hast bereits ein Event geplant!");
        return;
    }

    const loc = LOCATIONS.find(l => l.id === locId);
    if (!loc) return;

    const dayVal = parseInt(document.getElementById(`day-select-${locId}`).value);
    const ticketPrice = parseFloat(document.getElementById(`price-select-${locId}`).value) || 8.0;
    const marketingId = document.getElementById(`marketing-select-${locId}`).value;
    const marketing = MARKETING_PACKAGES.find(m => m.id === marketingId);

    const totalUpfrontCost = loc.rent + marketing.cost;

    if (gameState.giroKonto < totalUpfrontCost) {
        alert(`Unzureichendes Guthaben! Du benötigst ${totalUpfrontCost.toFixed(2)} € auf dem Girokonto (Miete: ${loc.rent.toFixed(2)} € + Werbung: ${marketing.cost.toFixed(2)} €).`);
        return;
    }

    // Calculate Event Date
    const daysUntil = (dayVal - gameState.currentDate.getDay() + 7) % 7 || 7;
    const eventDate = new Date(gameState.currentDate);
    eventDate.setDate(eventDate.getDate() + daysUntil);

    // Deduct Rent & Marketing Upfront
    gameState.giroKonto -= totalUpfrontCost;
    gameState.plannedEvent = {
        location: loc,
        eventDate: eventDate,
        dayText: dayVal === 5 ? "Freitag" : "Samstag",
        ticketPrice: ticketPrice,
        marketing: marketing,
        totalUpfrontCost: totalUpfrontCost
    };

    addLog(`🏛️ Location "${loc.name}" gebucht! Miete & Werbung im Voraus bezahlt (-${totalUpfrontCost.toFixed(2)} €).`);
    updateUI();
}

// 7. ENERGY DRINKS
function buyEnergyDrink() {
    const DRINK_COST = 10.0;
    const MAX_DRINKS_PER_DAY = 5;
    const BOOST_STEPS = [5, 4, 3, 2, 1];

    if (gameState.energyDrinksDrunkToday >= MAX_DRINKS_PER_DAY) {
        alert("Du hast heute bereits das Maximum von 5 Energy Drinks getrunken!");
        return;
    }

    if (gameState.giroKonto < DRINK_COST) {
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

// 8. DAY ADVANCEMENT & EVENTS
function advanceDay() {
    const dayOfWeek = gameState.currentDate.getDay();
    let didWork = false;
    let didGig = false;

    // A. Work Day
    if (gameState.currentJob && gameState.currentJob.workDays.includes(dayOfWeek)) {
        didWork = true;
        const cost = gameState.currentJob.energyCostPerDay || 25;
        gameState.energy = Math.max(0, gameState.energy - cost);
        addLog(`Arbeitstag bei "${gameState.currentJob.title}". Energie -${cost}.`);
    }

    // B. Accepted Fremd-Gig tonight?
    const gigIndex = gameState.acceptedGigs.findIndex(g => g.targetDateDay === dayOfWeek);
    if (gigIndex !== -1) {
        didGig = true;
        const gig = gameState.acceptedGigs[gigIndex];
        gameState.giroKonto += gig.pay;
        gameState.energy = Math.max(0, gameState.energy - gig.energyCost);
        addLog(`🎧 DJ-Gig @ ${gig.location} gespielt! Honorar: +${gig.pay.toFixed(2)} €, Energie -${gig.energyCost}.`);
        gameState.acceptedGigs.splice(gigIndex, 1);
    }

    // C. Own Planned Event tonight?
    if (gameState.plannedEvent && isSameDate(gameState.currentDate, gameState.plannedEvent.eventDate)) {
        didGig = true;
        gameState.energy = Math.max(0, gameState.energy - 40);
        executeOwnEvent(gameState.plannedEvent);
        gameState.plannedEvent = null;
    }

    // D. Energy Regeneration on Off-Days
    if (!didWork && !didGig) {
        if (gameState.energy < 75) {
            const oldEnergy = gameState.energy;
            gameState.energy = Math.min(75, gameState.energy + 25);
            addLog(`Freier Tag! Erholung (+${gameState.energy - oldEnergy}% -> ${gameState.energy}%).`);
        } else if (gameState.energy >= 75 && gameState.energy < 90) {
            gameState.energy = 90;
            addLog(`Zweiter freier Tag! Tiefe Erholung: Energie auf 90% aufgeladen.`);
        } else {
            addLog(`Freier Tag! Energie bei ${gameState.energy}%.`);
        }
    }

    // Reset Energy Drink counter
    gameState.energyDrinksDrunkToday = 0;

    // Advance Date
    gameState.currentDate.setDate(gameState.currentDate.getDate() + 1);

    // 1st of the Month check
    if (gameState.currentDate.getDate() === 1) {
        processMonthlyFinances();
    }

    updateUI();
}

function executeOwnEvent(eventObj) {
    // Visitor Calculation
    const baseDemand = 0.45;
    const priceFactor = Math.max(0.2, 1.2 - (eventObj.ticketPrice / 15.0));
    const reputationFactor = 1.0 + (gameState.reputation / 100.0);
    const marketingBoost = eventObj.marketing.boost;

    let totalAttendanceRatio = baseDemand * priceFactor * reputationFactor * marketingBoost;
    totalAttendanceRatio = Math.min(1.0, Math.max(0.1, totalAttendanceRatio));

    const visitorCount = Math.floor(eventObj.location.capacity * totalAttendanceRatio);
    const grossIncome = visitorCount * eventObj.ticketPrice;
    const netProfit = grossIncome - eventObj.totalUpfrontCost;

    // Add Income to Giro Konto
    gameState.giroKonto += grossIncome;
    gameState.reputation += Math.floor(visitorCount / 15);

    addLog(`🎉 Eigene Party @ ${eventObj.location.name} durchgeführt! ${visitorCount} Gäste. Einnahmen: +${grossIncome.toFixed(2)} €.`);

    // Show Animated Result Modal
    showEventResultModal(eventObj, visitorCount, grossIncome, netProfit);
}

function showEventResultModal(eventObj, visitorCount, grossIncome, netProfit) {
    const modal = document.getElementById('event-result-modal');
    if (!modal) return;

    document.getElementById('res-event-title').innerText = `🎉 Auswertung: ${eventObj.location.name}`;
    document.getElementById('res-event-date').innerText = `Datum: ${formatDate(eventObj.eventDate)}`;
    
    document.getElementById('res-visitors-text').innerText = `${visitorCount} / ${eventObj.location.capacity} Gäste (${Math.round((visitorCount/eventObj.location.capacity)*100)}% Auslastung)`;
    document.getElementById('res-income-text').innerText = `🎟️ Ticket-Einnahmen: +${grossIncome.toFixed(2)} € (${visitorCount} x ${eventObj.ticketPrice.toFixed(2)} €)`;
    document.getElementById('res-costs-text').innerText = `💸 Vorausbezahlt (Miete & Werbung): -${eventObj.totalUpfrontCost.toFixed(2)} €`;

    const totalEl = document.getElementById('res-total-text');
    if (netProfit >= 0) {
        totalEl.innerText = `🟢 Reingewinn: +${netProfit.toFixed(2)} €`;
        totalEl.style.color = '#00e676';
    } else {
        totalEl.innerText = `🔴 Verlust: ${netProfit.toFixed(2)} €`;
        totalEl.style.color = '#ff5555';
    }

    modal.style.display = 'flex';
}

function closeEventResultModal() {
    document.getElementById('event-result-modal').style.display = 'none';
}

// 9. BANKING & FINANCES
function processMonthlyFinances() {
    if (gameState.currentJob) {
        gameState.giroKonto += gameState.currentJob.salary;
        addLog(`💰 Gehalt erhalten: +${gameState.currentJob.salary.toFixed(2)} € von ${gameState.currentJob.title}.`);
    }

    gameState.giroKonto -= gameState.fixkosten;
    addLog(`🏠 Fixkosten abgebucht (Miete & Strom): -${gameState.fixkosten.toFixed(2)} €.`);

    if (gameState.sparKonto > 0) {
        const interest = gameState.sparKonto * (0.03 / 12);
        gameState.sparKonto += interest;
        addLog(`📈 Zinsgutschrift Sparkonto: +${interest.toFixed(2)} €.`);
    }
}

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

// 10. UTILS & UI UPDATE
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

function isSameDate(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

function updateUI() {
    // Date
    const dayName = WEEKDAYS[gameState.currentDate.getDay()];
    const dateEl = document.getElementById('date-display');
    if (dateEl) dateEl.innerText = `${dayName}, ${formatDate(gameState.currentDate)}`;

    // Dashboard
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
    if (drinkCountEl) drinkCountEl.innerText = `Heute getrunken: ${gameState.energyDrinksDrunkToday} / 5`;
    if (drinkBtn) drinkBtn.disabled = (gameState.energyDrinksDrunkToday >= 5);

    // Finances Tab
    const finGiro = document.getElementById('fin-giro');
    const finSpar = document.getElementById('fin-spar');
    if (finGiro) finGiro.innerText = `${gameState.giroKonto.toFixed(2)} €`;
    if (finSpar) finSpar.innerText = `${gameState.sparKonto.toFixed(2)} €`;

    // Logs
    const logList = document.getElementById('log-list');
    if (logList) {
        logList.innerHTML = '';
        gameState.logs.forEach(log => {
            const li = document.createElement('li');
            li.innerText = log;
            logList.appendChild(li);
        });
    }

    // Render Sub-components
    renderMailbox();
    renderJobBoard();
    renderLocations();
}
