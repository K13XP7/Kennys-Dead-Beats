// STAMMDATEN DER SUBGENRES
const SUBGENRES_DATA = [
    { id: "trad_goth", name: "Trad-Goth" },
    { id: "darkwave", name: "Darkwave" },
    { id: "cybergoth", name: "Cybergoth" },
    { id: "deathrock", name: "Deathrock" },
    { id: "ethereal", name: "Ethereal Wave" },
    { id: "post_punk", name: "Post-Punk" },
    { id: "ebm", name: "EBM / Industrial" },
    { id: "goth_rock", name: "Goth-Rock" },
    { id: "aggrotech", name: "Aggrotech" },
    { id: "new_wave", name: "New-Wave" }
];

// STAMMDATEN DER AVATARE (5x Frau, 5x Mann)
const AVATARS_DATA = [
    { id: "trad_goth_f", label: "Trad-Goth F", src: "assets/images/avatars/trad_goth_f.png" },
    { id: "darkwave_f", label: "Darkwave F", src: "assets/images/avatars/darkwave_f.png" },
    { id: "cybergoth_f", label: "Cybergoth F", src: "assets/images/avatars/cybergoth_f.png" },
    { id: "deathrock_f", label: "Deathrock F", src: "assets/images/avatars/deathrock_f.png" },
    { id: "ethereal_f", label: "Ethereal F", src: "assets/images/avatars/ethereal_f.png" },
    { id: "post_punk_m", label: "Post-Punk M", src: "assets/images/avatars/post_punk_m.png" },
    { id: "ebm_m", label: "EBM M", src: "assets/images/avatars/ebm_m.png" },
    { id: "goth_rock_m", label: "Goth-Rock M", src: "assets/images/avatars/goth_rock_m.png" },
    { id: "aggrotech_m", label: "Aggrotech M", src: "assets/images/avatars/aggrotech_m.png" },
    { id: "new_wave_m", label: "New-Wave M", src: "assets/images/avatars/new_wave_m.png" }
];

// GAME STATE
let gameState = {
    setupComplete: false,
    djName: "",
    mainGenre: "",
    avatarSrc: "",
    day: 2,
    month: 10,
    year: 2026,
    cash: 300,
    rep: 0,
    skill: 10,
    energy: 100,
    setlist: new Array(10).fill("post_punk")
};

// INITIALISIERUNG BEIM LADEN DER SEITE
document.addEventListener("DOMContentLoaded", () => {
    initSubgenreDropdown();
    initAvatarPicker();
    renderSetlistEditor();
    updateUI();
});

// SUBGENRE DROPDOWN FÜLLEN
function initSubgenreDropdown() {
    const select = document.getElementById("main-genre-select");
    select.innerHTML = "";
    SUBGENRES_DATA.forEach(genre => {
        const opt = document.createElement("option");
        opt.value = genre.id;
        opt.textContent = `[Wave] ${genre.name}`;
        select.appendChild(opt);
    });
}

// AVATAR PICKER ERSTELLEN
function initAvatarPicker() {
    const picker = document.getElementById("avatar-picker");
    picker.innerHTML = "";

    AVATARS_DATA.forEach((avatar, index) => {
        const div = document.createElement("div");
        div.className = `avatar-option ${index === 0 ? 'selected' : ''}`;
        div.dataset.src = avatar.src;
        div.onclick = function() { selectAvatar(this); };

        const img = document.createElement("img");
        img.src = avatar.src;
        img.alt = avatar.label;
        img.onerror = function() {
            this.style.display = 'none';
        };

        const span = document.createElement("span");
        span.textContent = avatar.label;

        div.appendChild(img);
        div.appendChild(span);
        picker.appendChild(div);
    });
}

// AVATAR AUSWÄHLEN
function selectAvatar(element) {
    document.querySelectorAll(".avatar-option").forEach(el => el.classList.remove("selected"));
    element.classList.add("selected");
}

// CHARAKTERERSTELLUNG ABSCHLIESSEN
function finishCharacterSetup() {
    const nameInput = document.getElementById("dj-name").value.trim();
    if (!nameInput) {
        alert("Bitte gib einen DJ-Namen ein!");
        return;
    }
    
    const selectedAvatar = document.querySelector(".avatar-option.selected");
    
    gameState.djName = nameInput;
    gameState.mainGenre = document.getElementById("main-genre-select").value;
    gameState.avatarSrc = selectedAvatar ? selectedAvatar.dataset.src : AVATARS_DATA[0].src;
    gameState.setupComplete = true;

    // UI aktualisieren
    document.getElementById("current-avatar").src = gameState.avatarSrc;
    document.getElementById("name-display").innerText = gameState.djName;
    
    const genreObj = SUBGENRES_DATA.find(g => g.id === gameState.mainGenre);
    document.getElementById("main-genre-display").innerText = genreObj ? genreObj.name : gameState.mainGenre;

    addLog(`Karriere gestartet! DJ ${gameState.djName} betritt den Untergrund.`);
    switchScreen("screen-dashboard");
    updateUI();
}

// SCREEN WECHSELN
function switchScreen(screenId) {
    document.querySelectorAll(".view-screen").forEach(screen => {
        screen.classList.remove("active");
    });
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add("active");
    }
}

// DRINK KAUFEN (+ENERGIE)
function buyEnergyDrink() {
    if (gameState.cash < 15) {
        addLog("Nicht genug Geld für einen Energy-Drink!");
        return;
    }
    gameState.cash -= 15;
    gameState.energy = Math.min(100, gameState.energy + 25);
    addLog("Energy-Drink getrunken: +25 Energie (-15 €)");
    updateUI();
}

// NÄCHSTER TAG
function nextDay() {
    gameState.day += 1;
    if (gameState.day > 31) {
        gameState.day = 1;
        gameState.month += 1;
    }
    gameState.energy = Math.min(100, gameState.energy + 10);
    addLog(`Neuer Tag angebrochen: ${getFormattedDate()}`);
    updateUI();
}

// CHRONIK LOG HINZUFÜGEN
function addLog(text) {
    const container = document.getElementById("log-entries");
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `📜 <span class="date">[${getFormattedDate()}]</span> ${text}`;
    container.prepend(entry);
}

// DATUM FORMATIEREN
function getFormattedDate() {
    const months = ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];
    const d = String(gameState.day).padStart(2, "0");
    const m = months[gameState.month - 1] || "OKT";
    return `${d}. ${m} ${gameState.year}`;
}

// SETLIST EDITOR RENDERN
function renderSetlistEditor() {
    const container = document.getElementById("setlist-slots");
    if (!container) return;
    container.innerHTML = "";

    for (let i = 0; i < gameState.setlist.length; i++) {
        const slot = document.createElement("div");
        slot.className = "slot-card";
        
        const slotNum = document.createElement("div");
        slotNum.className = "slot-num";
        slotNum.textContent = `#${i + 1}`;

        const select = document.createElement("select");
        SUBGENRES_DATA.forEach(genre => {
            const opt = document.createElement("option");
            opt.value = genre.id;
            opt.textContent = genre.name;
            if (genre.id === gameState.setlist[i]) opt.selected = true;
            select.appendChild(opt);
        });

        select.onchange = (e) => {
            gameState.setlist[i] = e.target.value;
        };

        slot.appendChild(slotNum);
        slot.appendChild(select);
        container.appendChild(slot);
    }
}

// UI AKTUALISIEREN
function updateUI() {
    document.getElementById("date-display").innerText = getFormattedDate();
    document.getElementById("cash-display").innerText = gameState.cash;
    document.getElementById("rep-display").innerText = gameState.rep;
    document.getElementById("skill-display").innerText = gameState.skill;
    
    document.getElementById("energy-text").innerText = `${gameState.energy}%`;
    document.getElementById("energy-bar").style.width = `${gameState.energy}%`;
}
