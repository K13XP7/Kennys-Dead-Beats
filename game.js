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
    setlist: new Array(25).fill("post_punk")
};

document.addEventListener("DOMContentLoaded", () => {
    initSubgenreDropdown();
    initAvatarPicker();
    renderSetlistEditor();
    renderCustomAvatar();
    updateUI();
});

function initSubgenreDropdown() {
    const select = document.getElementById("main-genre-select");
    if (!select) return;
    select.innerHTML = "";
    SUBGENRES_DATA.forEach(genre => {
        const opt = document.createElement("option");
        opt.value = genre.id;
        opt.textContent = genre.name;
        select.appendChild(opt);
    });
}

function initAvatarPicker() {
    const picker = document.getElementById("avatar-picker");
    if (!picker) return;
    picker.innerHTML = "";

    AVATARS_DATA.forEach((avatar, index) => {
        const div = document.createElement("div");
        div.className = `avatar-option ${index === 0 ? 'selected' : ''}`;
        div.dataset.src = avatar.src;
        div.onclick = function() { selectAvatar(this); };

        const img = document.createElement("img");
        img.src = avatar.src;
        img.alt = avatar.label;
        img.onerror = function() { this.style.opacity = '0.2'; };

        const span = document.createElement("span");
        span.textContent = avatar.label;

        div.appendChild(img);
        div.appendChild(span);
        picker.appendChild(div);
    });
}

function selectAvatar(element) {
    document.querySelectorAll(".avatar-option").forEach(el => el.classList.remove("selected"));
    element.classList.add("selected");
}

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

    const avatarImg = document.getElementById("current-avatar");
    if (avatarImg) avatarImg.src = gameState.avatarSrc;

    document.getElementById("name-display").innerText = gameState.djName;
    
    const genreObj = SUBGENRES_DATA.find(g => g.id === gameState.mainGenre);
    document.getElementById("main-genre-display").innerText = genreObj ? genreObj.name : gameState.mainGenre;

    addLog(`Karriere gestartet! DJ ${gameState.djName} betritt den Untergrund.`);
    switchScreen("screen-dashboard");
    updateUI();
}

function switchScreen(screenId) {
    document.querySelectorAll(".view-screen").forEach(screen => {
        screen.classList.remove("active");
    });
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add("active");
    }
}

function buyEnergyDrink() {
    if (gameState.energy >= 100) {
        addLog("Du bist bereits voller Energie!");
        return;
    }
    if (gameState.cash < 15) {
        addLog("Nicht genug Geld für einen Energy-Drink!");
        return;
    }
    gameState.cash -= 15;
    gameState.energy = Math.min(100, gameState.energy + 25);
    addLog("Energy-Drink getrunken: +25 Energie (-15 €)");
    updateUI();
}

function nextDay() {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    gameState.day += 1;
    let maxDays = daysInMonth[gameState.month - 1] || 30;
    
    if (gameState.day > maxDays) {
        gameState.day = 1;
        gameState.month += 1;
        if (gameState.month > 12) {
            gameState.month = 1;
            gameState.year += 1;
        }
    }
    gameState.energy = Math.min(100, gameState.energy + 10);
    addLog(`Neuer Tag angebrochen: ${getFormattedDate()}`);
    updateUI();
}

function addLog(text) {
    const container = document.getElementById("log-entries");
    if (!container) return;
    const entry = document.createElement("div");
    entry.className = "log-item";
    entry.innerHTML = `📜 <span class="date">[${getFormattedDate()}]</span> ${text}`;
    container.prepend(entry);
}

function getFormattedDate() {
    const months = ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];
    const d = String(gameState.day).padStart(2, "0");
    const m = months[gameState.month - 1] || "OKT";
    return `${d}. ${m} ${gameState.year}`;
}

function renderSetlistEditor() {
    const container = document.getElementById("setlist-slots");
    if (!container) return;
    container.innerHTML = "";

    for (let i = 0; i < gameState.setlist.length; i++) {
        const slot = document.createElement("div");
        slot.className = "slot-card";
        
        const slotNum = document.createElement("div");
        slotNum.style.color = "var(--accent-cyan)";
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

// CANVAS RENDER ENGINE (PURE JS 8-BIT GENERATOR)
function renderCustomAvatar() {
    const canvas = document.getElementById("avatar-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#08080c";
    ctx.fillRect(0, 0, 64, 64);

    const skinType = document.getElementById("layer-skin")?.value || "pale";
    const hairType = document.getElementById("layer-hair")?.value || "trad";
    const eyesType = document.getElementById("layer-eyes")?.value || "heavy";
    const mouthType = document.getElementById("layer-mouth")?.value || "black";
    const accType = document.getElementById("layer-acc")?.value || "none";

    // 1. SKIN / HEAD BASE
    let skinColors = { pale: "#dcdce6", ghost: "#ffffff", cyber: "#6c757d", warm: "#5a4d41" };
    ctx.fillStyle = skinColors[skinType] || "#dcdce6";
    ctx.fillRect(18, 16, 28, 34);
    ctx.fillRect(26, 50, 12, 10);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(18, 42, 28, 8);

    ctx.fillStyle = "#121216";
    ctx.fillRect(12, 58, 40, 6);

    // 2. AUGEN / MAKEUP
    ctx.fillStyle = "#000000";
    if (eyesType === "heavy") {
        ctx.fillRect(22, 28, 8, 4);
        ctx.fillRect(34, 28, 8, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(25, 29, 2, 2);
        ctx.fillRect(37, 29, 2, 2);
    } else if (eyesType === "visor") {
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(20, 27, 24, 6);
    } else {
        ctx.fillRect(23, 29, 6, 3);
        ctx.fillRect(35, 29, 6, 3);
    }

    // 3. MUND / LIPPEN
    ctx.fillStyle = mouthType === "black" ? "#000000" : "#8a2be2";
    if (mouthType === "mask") {
        ctx.fillStyle = "#1a1a24";
        ctx.fillRect(20, 38, 24, 12);
    } else {
        ctx.fillRect(28, 42, 8, 2);
    }

    // 4. HAAR-STILE
    ctx.fillStyle = "#050508";
    if (hairType === "trad") {
        ctx.fillRect(12, 6, 40, 14);
        ctx.fillRect(10, 16, 10, 28);
        ctx.fillRect(44, 16, 10, 28);
    } else if (hairType === "spikes") {
        ctx.fillRect(26, 4, 12, 14);
        ctx.fillRect(24, 8, 16, 10);
    } else if (hairType === "cyberdreads") {
        ctx.fillStyle = "#8a2be2";
        ctx.fillRect(12, 12, 8, 40);
        ctx.fillRect(44, 12, 8, 40);
        ctx.fillStyle = "#050508";
        ctx.fillRect(20, 10, 24, 10);
    }

    // 5. ACCESSOIRES
    if (accType === "sunglasses") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(20, 26, 24, 7);
        ctx.fillStyle = "#8a2be2";
        ctx.fillRect(21, 27, 2, 2);
    } else if (accType === "choker") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(26, 52, 12, 3);
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(31, 52, 2, 3);
    }
}

// AVATAR SPEICHERN
function saveCustomAvatar() {
    const canvas = document.getElementById("avatar-canvas");
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/png");
    gameState.avatarSrc = dataUrl;
    
    const avatarImg = document.getElementById("current-avatar");
    if (avatarImg) {
        avatarImg.src = dataUrl;
        avatarImg.style.opacity = "1";
    }

    addLog("Neues 8-Bit Profilbild im Baukasten erstellt & gespeichert!");
    switchScreen("screen-dashboard");
    updateUI();
}

function updateUI() {
    document.getElementById("date-display").innerText = getFormattedDate();
    document.getElementById("cash-display").innerText = gameState.cash;
    document.getElementById("rep-display").innerText = gameState.rep;
    document.getElementById("skill-display").innerText = gameState.skill;
    
    document.getElementById("energy-text").innerText = `${gameState.energy}%`;
    document.getElementById("energy-bar").style.width = `${gameState.energy}%`;
}
