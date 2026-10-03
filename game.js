// 25 SUBGENRES IN 5 FAMILIEN
const SUBGENRES_DATA = [
    // Post-Punk & Wave
    { id: "post_punk", name: "Post-Punk", family: "Wave" },
    { id: "coldwave", name: "Coldwave", family: "Wave" },
    { id: "darkwave", name: "Darkwave", family: "Wave" },
    { id: "new_wave", name: "New Wave", family: "Wave" },
    { id: "minimal_wave", name: "Minimal Wave", family: "Wave" },
    // Batcave & Gothic Rock
    { id: "goth_rock", name: "Gothic Rock", family: "Goth" },
    { id: "batcave", name: "Batcave / Deathrock", family: "Goth" },
    { id: "horrorpunk", name: "Horrorpunk", family: "Goth" },
    { id: "ethereal", name: "Ethereal Wave", family: "Goth" },
    { id: "goth_metal", name: "Gothic Metal", family: "Goth" },
    // EBM, Electro & Synth
    { id: "ebm", name: "EBM (Oldschool)", family: "Electro" },
    { id: "synthpop", name: "Synthpop / Dark Synth", family: "Electro" },
    { id: "futurepop", name: "Futurepop", family: "Electro" },
    { id: "electrogoth", name: "Electro-Goth", family: "Electro" },
    { id: "dark_disco", name: "Italo / Dark Disco", family: "Electro" },
    // Industrial, Harsh & Noise
    { id: "industrial", name: "Industrial (Oldschool)", family: "Industrial" },
    { id: "aggrotech", name: "Aggrotech / Harsh", family: "Industrial" },
    { id: "rhythm_noise", name: "Rhythm 'n' Noise", family: "Industrial" },
    { id: "cyberpunk", name: "Cyberpunk / Midtempo", family: "Industrial" },
    { id: "power_noise", name: "Power Noise", family: "Industrial" },
    // Neofolk & Experimental
    { id: "neofolk", name: "Neofolk", family: "Experimental" },
    { id: "mittelalter", name: "Mittelalter-Rock", family: "Experimental" },
    { id: "martial", name: "Martial Industrial", family: "Experimental" },
    { id: "ambient", name: "Ritual Ambient", family: "Experimental" },
    { id: "cabaret", name: "Dark Cabaret", family: "Experimental" }
];

// 10 AVATARE (5 WEIBLICH, 5 MÄNNLICH)
const AVATARS_DATA = [
    { id: "f1", name: "Trad-Goth", gender: "f", src: "https://placehold.co/128x128/1a0022/8a2be2?text=Trad-Goth+F" },
    { id: "f2", name: "Darkwave", gender: "f", src: "https://placehold.co/128x128/001a22/00f3ff?text=Darkwave+F" },
    { id: "f3", name: "Cybergoth", gender: "f", src: "https://placehold.co/128x128/112200/39ff14?text=Cybergoth+F" },
    { id: "f4", name: "Deathrock", gender: "f", src: "https://placehold.co/128x128/220011/dc143c?text=Deathrock+F" },
    { id: "f5", name: "Ethereal", gender: "f", src: "https://placehold.co/128x128/222222/ffffff?text=Ethereal+F" },
    { id: "m1", name: "Post-Punk", gender: "m", src: "https://placehold.co/128x128/110022/8a2be2?text=Post-Punk+M" },
    { id: "m2", name: "EBM / Mil", gender: "m", src: "https://placehold.co/128x128/002211/39ff14?text=EBM+M" },
    { id: "m3", name: "Goth-Rock", gender: "m", src: "https://placehold.co/128x128/220000/dc143c?text=Goth-Rock+M" },
    { id: "m4", name: "Aggrotech", gender: "m", src: "https://placehold.co/128x128/001122/00f3ff?text=Aggrotech+M" },
    { id: "m5", name: "New Wave", gender: "m", src: "https://placehold.co/128x128/111111/aaaaaa?text=New-Wave+M" }
];

// GAME STATE
let gameState = {
    setupComplete: false,
    djName: "",
    region: "",
    mainGenre: "",
    avatarSrc: "",
    day: 2,
    month: 10,
    year: 2026,
    cash: 300,
    rep: 0,
    skill: 10,
    energy: 100,
    drinksToday: 0,
    setlist: new Array(25).fill("post_punk"),
    unlockedTracks: ["post_punk", "darkwave", "goth_rock"]
};

// INITIALISIERUNG
window.onload = function() {
    initSubgenreSelect();
    initAvatarPicker();
    initSetlistEditor();
    initPromoterPlanner();
};

function initSubgenreSelect() {
    const select = document.getElementById('main-genre-select');
    select.innerHTML = "";
    SUBGENRES_DATA.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.innerText = `[${g.family}] ${g.name}`;
        select.appendChild(opt);
    });
}

function initAvatarPicker() {
    const picker = document.getElementById('avatar-picker');
    picker.innerHTML = "";
    AVATARS_DATA.forEach((av, index) => {
        const div = document.createElement('div');
        div.className = `avatar-option ${index === 0 ? 'selected' : ''}`;
        div.dataset.src = av.src;
        div.onclick = () => {
            document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
        };
        div.innerHTML = `<img src="${av.src}" alt="${av.name}"><span>${av.name}</span>`;
        picker.appendChild(div);
    });
}

// CHARAKTER-SETUP ABSCHLIESSEN
function finishCharacterSetup() {
    const nameInput = document.getElementById('dj-name').value.trim();
    if (!nameInput) {
        alert("Bitte gib einen DJ-Namen ein!");
        return;
    }
    
    const selectedAvatar = document.querySelector('.avatar-option.selected');
    
    gameState.djName = nameInput;
    gameState.region = document.getElementById('start-region').value;
    gameState.mainGenre = document.getElementById('main-genre-select').value;
    gameState.avatarSrc = selectedAvatar ? selectedAvatar.dataset.src : AVATARS_DATA[0].src;
    gameState.setupComplete = true;

    // UI aktualisieren
    document.getElementById('current-avatar').src = gameState.avatarSrc;
    document.getElementById('name-display').innerText = gameState.djName;
    const genreObj = SUBGENRES_DATA.find(g => g.id === gameState.mainGenre);
    document.getElementById('main-genre-display').innerText = genreObj ? genreObj.name : gameState.mainGenre;

    addLog(`Karriere gestartet! DJ ${gameState.djName} legt in ${gameState.region} los.`);
    switchScreen('screen-dashboard');
    updateUI();
}

// SCREEN SWITCHER
function switchScreen(screenId) {
    document.querySelectorAll('.view-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// UI UPDATE
function updateUI() {
    if (!gameState.setupComplete) return;

    document.getElementById('date-display').innerText = `${gameState.day < 10 ? '0' + gameState.day : gameState.day}. OKT ${gameState.year}`;
    document.getElementById('cash-display').innerText = gameState.cash;
    document.getElementById('rep-display').innerText = gameState.rep;
    document.getElementById('skill-display').innerText = gameState.skill;
    
    document.getElementById('energy-text').innerText = gameState.energy + "%";
    const fill = document.getElementById('energy-fill');
    fill.style.width = gameState.energy + "%";
    fill.style.backgroundColor = gameState.energy <= 20 ? 'var(--accent-red)' : 'var(--accent-green)';

    // Promoter Button ab Rep 30
    const btnPromoter = document.getElementById('btn-promoter');
    if (gameState.rep >= 30) {
        btnPromoter.disabled = false;
        btnPromoter.innerText = "🎪 PARTY-PLANNER (FREI)";
    }

    // Drinks Tracker
    let trackerStr = "";
    for (let i = 0; i < 5; i++) {
        trackerStr += i < gameState.drinksToday ? "[X]" : "[ ]";
    }
    document.getElementById('drink-tracker').innerText = trackerStr;
}

// LOG SYSTEM
function addLog(text) {
    const logContainer = document.getElementById('log-entries');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const dateStr = `[${gameState.day < 10 ? '0' + gameState.day : gameState.day}.${gameState.month < 10 ? '0' + gameState.month : gameState.month}]`;
    entry.innerHTML = `<span class="date">${dateStr}</span> ${text}`;
    logContainer.appendChild(entry);
}

// ENERGY BOOSTER
function buyEnergyDrink() {
    if (gameState.drinksToday >= 5) {
        addLog("🛑 Max. 5 Energy Drinks pro Tag erlaubt!");
        return;
    }
    if (gameState.cash < 10) {
        addLog("🛑 Nicht genug Geld für einen Energy Drink (10 €).");
        return;
    }
    gameState.cash -= 10;
    gameState.energy = Math.min(100, gameState.energy + 5);
    gameState.drinksToday++;
    addLog("🥤 Energy Drink getrunken (+5% E, -10 €).");
    updateUI();
}

// TAGES SIMULATION
function simulateNextDay() {
    const action = document.getElementById('action-select').value;

    if (action === "rest") {
        gameState.energy = Math.min(100, gameState.energy + 40);
        addLog("🛋️ Erholt und Akkus aufgeladen (+40% E).");
    } else if (action === "dig") {
        if (gameState.cash < 50) {
            addLog("🛑 Zu wenig Geld zum Diggen (50 € benötigt).");
            return;
        }
        gameState.cash -= 50;
        gameState.energy = Math.max(0, gameState.energy - 10);
        gameState.skill += 1;
        addLog("💿 Seltene Scheiben gediggt (-50 €, -10% E, +1 Skill).");
    } else if (action === "rehearse") {
        gameState.energy = Math.max(0, gameState.energy - 15);
        gameState.skill += 2;
        addLog("🎧 Übergänge im Proberaum perfektioniert (-15% E, +2 Skill).");
    } else if (action === "network") {
        gameState.energy = Math.max(0, gameState.energy - 30);
        gameState.rep += 2;
        addLog("🎪 In Szene-Clubs Kontakte geknüpft (-30% E, +2 REP).");
    }

    gameState.day++;
    gameState.drinksToday = 0;

    // Burnout Check
    if (gameState.energy === 0) {
        addLog("⚠️ BURNOUT! Zwangserholung eingelegt. +1 Tag Ausfall.");
        gameState.energy = 50;
        gameState.day++;
    }

    updateUI();
}

// 25-SLOT SETLIST EDITOR
function initSetlistEditor() {
    const grid = document.getElementById('setlist-slots-grid');
    grid.innerHTML = "";
    for (let i = 0; i < 25; i++) {
        const card = document.createElement('div');
        card.className = "slot-card";
        
        let selectHTML = `<select onchange="updateSlot(${i}, this.value)">`;
        SUBGENRES_DATA.forEach(g => {
            const selected = gameState.setlist[i] === g.id ? "selected" : "";
            selectHTML += `<option value="${g.id}" ${selected}>${g.name}</option>`;
        });
        selectHTML += `</select>`;

        card.innerHTML = `<span class="slot-num">#${i+1}</span> ${selectHTML}`;
        grid.appendChild(card);
    }
}

function updateSlot(index, val) {
    gameState.setlist[index] = val;
}

function autoFillSetlist() {
    for (let i = 0; i < 25; i++) {
        gameState.setlist[i] = gameState.mainGenre;
    }
    initSetlistEditor();
    addLog("🎼 Setlist automatisch mit Haupt-Genre befüllt.");
}

function clearSetlist() {
    gameState.setlist.fill("post_punk");
    initSetlistEditor();
}

// PROMOTER / EVENT PLANNER
function initPromoterPlanner() {
    const container = document.getElementById('lineup-slots-container');
    container.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const row = document.createElement('div');
        row.className = "lineup-slot-row";
        row.innerHTML = `
            <span>Slot ${i}:</span>
            <select class="select-box" id="lineup-slot-${i}" onchange="updateEventCosts()">
                <option value="self">Du Selbst (0 €)</option>
                <option value="local">Local Hero Gast-DJ (100 €)</option>
                <option value="allrounder">Allrounder Gast-DJ (250 €)</option>
                <option value="specialist">Genre-Spezialist Gast-DJ (400 €)</option>
                <option value="legend">Szene-Legende (1.000 €)</option>
            </select>
        `;
        container.appendChild(row);
    }
    updateEventCosts();
}

function updateEventCosts() {
    const locValue = document.getElementById('event-location').value.split('|')[0];
    let total = parseInt(locValue) || 0;
    
    const promo = parseInt(document.getElementById('promo-budget').value) || 0;
    total += promo;

    for (let i = 1; i <= 5; i++) {
        const val = document.getElementById(`lineup-slot-${i}`).value;
        if (val === "local") total += 100;
        if (val === "allrounder") total += 250;
        if (val === "specialist") total += 400;
        if (val === "legend") total += 1000;
    }

    document.getElementById('event-total-cost').innerText = total + " €";
}

function hostEvent() {
    const costText = document.getElementById('event-total-cost').innerText;
    const totalCost = parseInt(costText);

    if (gameState.cash < totalCost) {
        addLog(`🛑 Zu wenig Geld für dieses Event (${totalCost} € benötigt).`);
        return;
    }

    gameState.cash -= totalCost;
    const profit = Math.floor(totalCost * (1.1 + Math.random() * 0.8));
    gameState.cash += profit;
    gameState.rep += 10;

    addLog(`🎪 Event veranstaltet! Kosten: ${totalCost} €, Einnahmen: ${profit} € (+10 REP).`);
    switchScreen('screen-dashboard');
    updateUI();
}
