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

let gameState = {
    setupComplete: false,
    djName: "",
    mainGenre: "",
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
    renderSetlistEditor();
    
    // Initial den Baukasten und den Profilkasten rendern
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

function finishCharacterSetup() {
    let nameInput = document.getElementById("dj-name").value.trim();
    if (!nameInput) {
        alert("Bitte gib einen DJ-Namen ein!");
        return;
    }
    
    if (!nameInput.toLowerCase().startsWith("dj ")) {
        nameInput = "DJ " + nameInput;
    }

    gameState.djName = nameInput;
    gameState.mainGenre = document.getElementById("main-genre-select").value;
    
    const isFirstTime = !gameState.setupComplete;
    gameState.setupComplete = true;

    // Profil-Canvas im linken Rack aktualisieren
    drawCanvasTo("profile-canvas-fallback");

    document.getElementById("name-display").innerText = gameState.djName;
    
    const genreObj = SUBGENRES_DATA.find(g => g.id === gameState.mainGenre);
    document.getElementById("main-genre-display").innerText = genreObj ? genreObj.name : gameState.mainGenre;

    if (isFirstTime) {
        addLog(`Karriere gestartet! ${gameState.djName} betritt den Untergrund.`);
    } else {
        addLog(`${gameState.djName} hat sein Profil & Avatar angepasst.`);
    }

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

// CANVAS GENERATOR LOGIK (8-BIT BAUKASTEN)
function renderCustomAvatar() {
    const canvas = document.getElementById("avatar-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Hintergrund
    ctx.fillStyle = "#08080c";
    ctx.fillRect(0, 0, 64, 64);

    const skinType = document.getElementById("layer-skin")?.value || "pale";
    const hairType = document.getElementById("layer-hair")?.value || "trad";
    const eyesType = document.getElementById("layer-eyes")?.value || "heavy";
    const mouthType = document.getElementById("layer-mouth")?.value || "black";
    const accType = document.getElementById("layer-acc")?.value || "none";

    // 1. KOPF & HAUT
    let skinColors = { pale: "#dcdce6", ghost: "#ffffff", cyber: "#6c757d", warm: "#5a4d41" };
    ctx.fillStyle = skinColors[skinType] || "#dcdce6";
    ctx.fillRect(18, 16, 28, 34); // Kopf
    ctx.fillRect(26, 50, 12, 10); // Hals

    // Kinn Schatten
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(18, 42, 28, 8);

    // Kleidung
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

    // 4. HAAR
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

    // Live auf das Profil-Canvas kopieren
    drawCanvasTo("profile-canvas-fallback");
}

function drawCanvasTo(targetCanvasId) {
    const srcCanvas = document.getElementById("avatar-canvas");
    const targetCanvas = document.getElementById(targetCanvasId);
    if (!srcCanvas || !targetCanvas) return;
    const targetCtx = targetCanvas.getContext("2d");
    targetCtx.drawImage(srcCanvas, 0, 0);
}

function updateUI() {
    document.getElementById("date-display").innerText = getFormattedDate();
    document.getElementById("cash-display").innerText = gameState.cash;
    document.getElementById("rep-display").innerText = gameState.rep;
    document.getElementById("skill-display").innerText = gameState.skill;
    
    document.getElementById("energy-text").innerText = `${gameState.energy}%`;
    document.getElementById("energy-bar").style.width = `${gameState.energy}%`;
}
