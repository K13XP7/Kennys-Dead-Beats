const SUBGENRES_DATA = [
    { id: "batcave", name: "Batcave" },
    { id: "darkwave", name: "Darkwave" },
    { id: "minimal_ndw", name: "Minimal Wave / NDW" },
    { id: "ebm_industrial", name: "EBM / Industrial" },
    { id: "synthpop", name: "Synthpop / New Wave" }
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
    setlist: new Array(25).fill("batcave")
};

document.addEventListener("DOMContentLoaded", () => {
    initSubgenreDropdown();
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

// FULL 128x128 CANVAS BAUKASTEN (PROPORTIONIERT & DETAILLIERT)
function renderCustomAvatar() {
    const canvas = document.getElementById("avatar-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const bgType = document.getElementById("layer-bg")?.value || "crimson";
    const skinType = document.getElementById("layer-skin")?.value || "ghost";
    const hairType = document.getElementById("layer-hair")?.value || "trad";
    const hairColor = document.getElementById("layer-haircolor")?.value || "black";
    const browsType = document.getElementById("layer-brows")?.value || "heavy";
    const eyesType = document.getElementById("layer-eyes")?.value || "heavy";
    const mouthType = document.getElementById("layer-mouth")?.value || "black";
    const detailType = document.getElementById("layer-face-detail")?.value || "none";
    const accType = document.getElementById("layer-acc")?.value || "none";

    // 1. KONTRAST-HINTERGRUND
    if (bgType === "crimson") {
        let grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
        grad.addColorStop(0, "#5a001a");
        grad.addColorStop(1, "#0a0005");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
    } else if (bgType === "violet") {
        let grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
        grad.addColorStop(0, "#4a007a");
        grad.addColorStop(1, "#080012");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
    } else if (bgType === "cyber") {
        ctx.fillStyle = "#040e1a";
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = "rgba(0, 243, 255, 0.15)";
        for (let i = 0; i < 128; i += 16) {
            ctx.fillRect(i, 0, 1, 128);
            ctx.fillRect(0, i, 128, 1);
        }
    } else if (bgType === "slate") {
        ctx.fillStyle = "#222230";
        ctx.fillRect(0, 0, 128, 128);
    } else {
        ctx.fillStyle = "#08080d";
        ctx.fillRect(0, 0, 128, 128);
    }

    const skinColors = { ghost: "#f2f2f7", pale: "#e5d0d0", cyber: "#687788", warm: "#544338" };
    const hairColors = { black: "#111118", purple: "#8a2be2", cyan: "#00f3ff", red: "#c71585", silver: "#d0d0e0" };

    const cSkin = skinColors[skinType] || "#f2f2f7";
    const cHair = hairColors[hairColor] || "#111118";

    // 2. KOPF & GESICHTSFORM (ANATOMISCH Schlank)
    ctx.fillStyle = cSkin;
    ctx.fillRect(42, 38, 44, 52); // Gesicht
    ctx.fillRect(56, 90, 16, 18); // Hals

    // WANGENSCHATTEN & KINNKONTUR
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(42, 76, 44, 14);
    ctx.fillRect(42, 86, 6, 4);
    ctx.fillRect(80, 86, 6, 4);

    // OBERBEKLEIDUNG / KRAGEN
    ctx.fillStyle = "#12121a";
    ctx.fillRect(28, 108, 72, 20);
    ctx.fillStyle = "#222230";
    ctx.fillRect(52, 108, 24, 20);

    // 3. GESICHTS-DETAILS
    if (detailType === "spiderweb") {
        ctx.fillStyle = "#11111a";
        ctx.fillRect(44, 68, 14, 2);
        ctx.fillRect(46, 64, 2, 12);
        ctx.fillRect(50, 64, 2, 12);
    } else if (detailType === "bat") {
        ctx.fillStyle = "#000000
