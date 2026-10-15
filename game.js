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
        ctx.fillStyle = "#000000";
        ctx.fillRect(44, 72, 10, 4);
        ctx.fillRect(47, 70, 4, 8);
    } else if (detailType === "piercings") {
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(44, 74, 3, 3);
        ctx.fillRect(81, 74, 3, 3);
    }

    // 4. AUGENBRAUEN
    ctx.fillStyle = cHair;
    if (browsType === "arch") {
        ctx.fillRect(46, 48, 12, 2);
        ctx.fillRect(70, 48, 12, 2);
        ctx.fillRect(56, 50, 2, 2);
        ctx.fillRect(70, 50, 2, 2);
    } else if (browsType === "pierced") {
        ctx.fillRect(46, 50, 12, 3);
        ctx.fillRect(70, 50, 12, 3);
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(52, 49, 3, 5);
    } else if (browsType === "heavy") {
        ctx.fillRect(44, 50, 14, 3);
        ctx.fillRect(70, 50, 14, 3);
    }

    // 5. AUGEN / MAKEUP
    ctx.fillStyle = "#000000";
    if (eyesType === "heavy") {
        ctx.fillRect(46, 56, 12, 6);
        ctx.fillRect(70, 56, 12, 6);
        ctx.fillRect(42, 54, 6, 4);
        ctx.fillRect(80, 54, 6, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(50, 58, 4, 4);
        ctx.fillRect(74, 58, 4, 4);
    } else if (eyesType === "cateye") {
        ctx.fillRect(44, 54, 16, 10);
        ctx.fillRect(68, 54, 16, 10);
        ctx.fillStyle = "#8a2be2";
        ctx.fillRect(46, 56, 12, 6);
        ctx.fillRect(70, 56, 12, 6);
    } else if (eyesType === "smudge") {
        ctx.fillRect(46, 56, 12, 6);
        ctx.fillRect(70, 56, 12, 6);
        ctx.fillRect(48, 62, 2, 8);
        ctx.fillRect(54, 62, 2, 12);
        ctx.fillRect(72, 62, 2, 10);
        ctx.fillRect(78, 62, 2, 6);
    } else if (eyesType === "visor") {
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(40, 54, 48, 10);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(44, 56, 40, 2);
    }

    // 6. MUND & LIPPEN
    if (mouthType === "mask") {
        ctx.fillStyle = "#1a1a24";
        ctx.fillRect(46, 72, 36, 20);
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(60, 78, 8, 8);
    } else {
        ctx.fillStyle = mouthType === "purple" ? "#8a2be2" : (mouthType === "black" ? "#000000" : "#d090a0");
        ctx.fillRect(56, 78, 16, 4);
        ctx.fillRect(58, 82, 12, 2);
        if (mouthType === "piercing") {
            ctx.fillStyle = "#00f3ff";
            ctx.fillRect(54, 84, 2, 3);
            ctx.fillRect(72, 84, 2, 3);
        }
    }

    // 7. HAAR-STILE (ALLE FRISUREN VOLLSTÄNDIG)
    ctx.fillStyle = cHair;
    if (hairType === "trad") {
        // Toupierte Mähne / Spikes
        ctx.fillRect(32, 14, 64, 26);
        ctx.fillRect(24, 26, 80, 20);

        const spikes = [
            [28, 8, 8, 10], [40, 4, 10, 14], [54, 0, 12, 18], 
            [68, 2, 10, 16], [82, 6, 8, 12]
        ];
        spikes.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));

        ctx.fillRect(16, 32, 18, 48);
        ctx.fillRect(94, 32, 18, 48);
        ctx.fillRect(12, 44, 12, 28);
        ctx.fillRect(104, 44, 12, 28);

        if (hairColor === "black") {
            ctx.fillStyle = "#2a2a3a";
            ctx.fillRect(36, 20, 20, 4);
            ctx.fillRect(68, 22, 20, 4);
            ctx.fillRect(20, 40, 4, 16);
            ctx.fillRect(104, 40, 4, 16);
        }
    } else if (hairType === "postpunk") {
        // Asymmetrischer Bob (lang auf einer Seite, kurz auf der anderen)
        ctx.fillRect(32, 18, 64, 20);
        ctx.fillRect(24, 38, 28, 56); // Lange Seite links
        ctx.fillRect(84, 38, 14, 18); // Kurze Seite rechts
        ctx.fillRect(36, 24, 20, 32); // Schräger Pony über der Stirn
        
        if (hairColor === "black") {
            ctx.fillStyle = "#2a2a3a";
            ctx.fillRect(28, 42, 6, 30);
        }
    } else if (hairType === "spikes") {
        // Hoher Irokesen / Deathhawk
        ctx.fillRect(56, 2, 16, 38);
        ctx.fillRect(50, 10, 28, 30);
        ctx.fillRect(44, 18, 40, 22);
        
        // Seitlich rasierte Stoppeln
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(36, 36, 12, 24);
        ctx.fillRect(80, 36, 12, 24);
    } else if (hairType === "cyberdreads") {
        // Dreadlocks / Falls (Lange Stränge zu beiden Seiten)
        ctx.fillRect(38, 20, 52, 18);
        
        // Rechte & linke Dreads
        ctx.fillRect(20, 30, 16, 72);
        ctx.fillRect(92, 30, 16, 72);
        ctx.fillRect(12, 42, 12, 54);
        ctx.fillRect(104, 42, 12, 54);
        
        // Riffel-Muster für Dreads
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        for (let y = 34; y < 98; y += 8) {
            ctx.fillRect(22, y, 12, 2);
            ctx.fillRect(94, y, 12, 2);
        }
    } else if (hairType === "buzz") {
        // Buzzcut / Undercut (Kompakter Haaransatz)
        ctx.fillRect(38, 30, 52, 10);
        ctx.fillRect(36, 34, 56, 8);
        
        // Seiten-Schatten
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(36, 40, 8, 16);
        ctx.fillRect(84, 40, 8, 16);
    }

    // 8. ACCESSOIRES
    if (accType === "sunglasses") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(40, 52, 48, 12);
        ctx.fillStyle = "#8a2be2";
        ctx.fillRect(42, 54, 4, 3);
    } else if (accType === "choker") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(56, 94, 16, 6);
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(62, 94, 4, 6);
    } else if (accType === "tiara") {
        ctx.fillStyle = "#8a2be2";
        ctx.fillRect(48, 26, 32, 3);
        ctx.fillRect(52, 20, 4, 6);
        ctx.fillRect(62, 16, 4, 10);
        ctx.fillRect(72, 20, 4, 6);
    }

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
