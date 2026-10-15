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

// 128x128 CANVAS MIT KONTRASTREICHEM HINTERGRUND UND KONTUR-GLOW
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

    // 1. KONTRAST-HINTERGRUND ZEICHNEN
    if (bgType === "crimson") {
        let grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 70);
        grad.addColorStop(0, "#4a0018");
        grad.addColorStop(1, "#0d0206");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
    } else if (bgType === "violet") {
        let grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 70);
        grad.addColorStop(0, "#3a0066");
        grad.addColorStop(1, "#0a0014");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
    } else if (bgType === "cyber") {
        ctx.fillStyle = "#020d18";
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = "#00334e";
        for (let i = 0; i < 128; i += 16) {
            ctx.fillRect(i, 0, 1, 128);
            ctx.fillRect(0, i, 128, 1);
        }
    } else if (bgType === "slate") {
        ctx.fillStyle = "#22222e";
        ctx.fillRect(0, 0, 128, 128);
    } else {
        ctx.fillStyle = "#050508";
        ctx.fillRect(0, 0, 128, 128);
    }

    // Farbkarten
    const skinColors = { ghost: "#ffffff", pale: "#e8d8d8", cyber: "#5c6b73", warm: "#4a3b32" };
    const hairColors = { black: "#0b0b12", purple: "#9d00ff", cyan: "#00f3ff", red: "#e60039", silver: "#e0e0f0" };

    const cSkin = skinColors[skinType] || "#ffffff";
    const cHair = hairColors[hairColor] || "#0b0b12";

    // KONTUR-GLOW FÜR SCHWARZE HAARE
    const outlineColor = (hairColor === "black") ? "rgba(160, 160, 200, 0.4)" : "transparent";

    // 2. HAAR-KONTUR (Outlining, damit dunkles Haar sichtbar ist)
    if (outlineColor !== "transparent") {
        ctx.fillStyle = outlineColor;
        if (hairType === "trad") {
            ctx.fillRect(14, 4, 100, 38);
            ctx.fillRect(10, 28, 30, 64);
            ctx.fillRect(88, 28, 30, 64);
        } else if (hairType === "postpunk") {
            ctx.fillRect(30, 14, 68, 26);
            ctx.fillRect(22, 36, 34, 64);
        } else if (hairType === "spikes") {
            ctx.fillRect(52, 0, 24, 40);
            ctx.fillRect(48, 8, 32, 28);
        } else if (hairType === "cyberdreads") {
            ctx.fillRect(18, 28, 20, 84);
            ctx.fillRect(90, 28, 20, 84);
        }
    }

    // 3. KOPF & GESICHTSFORM
    ctx.fillStyle = cSkin;
    if (hairType === "buzz") {
        ctx.fillRect(36, 32, 56, 68);
    } else {
        ctx.fillRect(38, 34, 52, 66);
    }
    ctx.fillRect(52, 98, 24, 22);

    // WANGENSCHATTEN / KONTUR
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(38, 80, 52, 20);

    // OBERBEKLEIDUNG
    ctx.fillStyle = "#12121c";
    ctx.fillRect(20, 114, 88, 14);

    // 4. GESICHTS-DETAILS
    if (detailType === "spiderweb") {
        ctx.fillStyle = "#11111a";
        ctx.fillRect(40, 68, 14, 2);
        ctx.fillRect(42, 64, 2, 12);
        ctx.fillRect(46, 64, 2, 12);
    } else if (detailType === "bat") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(40, 72, 10, 4);
        ctx.fillRect(43, 70, 4, 8);
    } else if (detailType === "piercings") {
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(40, 74, 4, 4);
        ctx.fillRect(84, 74, 4, 4);
    }

    // 5. AUGENBRAUEN
    ctx.fillStyle = cHair;
    if (browsType === "arch") {
        ctx.fillRect(44, 48, 14, 3);
        ctx.fillRect(70, 48, 14, 3);
        ctx.fillRect(56, 50, 4, 2);
        ctx.fillRect(68, 50, 4, 2);
    } else if (browsType === "pierced") {
        ctx.fillRect(44, 52, 14, 3);
        ctx.fillRect(70, 52, 14, 3);
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(52, 51, 3, 5);
    } else if (browsType === "heavy") {
        ctx.fillRect(42, 52, 16, 4);
        ctx.fillRect(70, 52, 16, 4);
    }

    // 6. AUGEN / MAKEUP
    ctx.fillStyle = "#000000";
    if (eyesType === "heavy") {
        ctx.fillRect(40, 58, 20, 8);
        ctx.fillRect(68, 58, 20, 8);
        ctx.fillRect(36, 56, 6, 4);
        ctx.fillRect(86, 56, 6, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(50, 60, 4, 4);
        ctx.fillRect(74, 60, 4, 4);
    } else if (eyesType === "cateye") {
        ctx.fillRect(42, 56, 18, 12);
        ctx.fillRect(68, 56, 18, 12);
        ctx.fillStyle = "#8a2be2";
        ctx.fillRect(44, 58, 14, 8);
        ctx.fillRect(70, 58, 14, 8);
    } else if (eyesType === "smudge") {
        ctx.fillRect(44, 58, 16, 8);
        ctx.fillRect(68, 58, 16, 8);
        ctx.fillRect(46, 66, 3, 10);
        ctx.fillRect(52, 66, 3, 14);
        ctx.fillRect(72, 66, 3, 12);
        ctx.fillRect(78, 66, 3, 8);
    } else if (eyesType === "visor") {
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(36, 54, 56, 14);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(40, 56, 48, 2);
    }

    // 7. MUND & LIPPEN
    if (mouthType === "mask") {
        ctx.fillStyle = "#181824";
        ctx.fillRect(42, 76, 44, 26);
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(60, 84, 8, 8);
    } else {
        ctx.fillStyle = mouthType === "purple" ? "#9d00ff" : (mouthType === "black" ? "#000000" : "#d8a0b0");
        ctx.fillRect(54, 86, 20, 6);
        if (mouthType === "piercing") {
            ctx.fillStyle = "#00f3ff";
            ctx.fillRect(52, 92, 3, 4);
            ctx.fillRect(73, 92, 3, 4);
        }
    }

    // 8. HAAR-STILE
    ctx.fillStyle = cHair;
    if (hairType === "trad") {
        ctx.fillRect(16, 6, 96, 34);
        ctx.fillRect(12, 30, 26, 60);
        ctx.fillRect(90, 30, 26, 60);
    } else if (hairType === "postpunk") {
        ctx.fillRect(32, 16, 64, 22);
        ctx.fillRect(24, 38, 30, 60);
        ctx.fillRect(84, 38, 12, 20);
    } else if (hairType === "spikes") {
        ctx.fillRect(54, 2, 20, 36);
        ctx.fillRect(50, 10, 28, 24);
        ctx.fillRect(46, 18, 36, 16);
    } else if (hairType === "cyberdreads") {
        ctx.fillRect(36, 16, 56, 18);
        ctx.fillRect(20, 30, 16, 80);
        ctx.fillRect(92, 30, 16, 80);
    } else if (hairType === "buzz") {
        ctx.fillRect(38, 26, 52, 10);
    }

    // 9. ACCESSOIRES
    if (accType === "sunglasses") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(38, 54, 52, 16);
        ctx.fillStyle = "#8a2be2";
        ctx.fillRect(40, 56, 6, 4);
    } else if (accType === "choker") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(52, 102, 24, 8);
        ctx.fillStyle = "#00f3ff";
        ctx.fillRect(62, 102, 4, 8);
    } else if (accType === "tiara") {
        ctx.fillStyle = "#8a2be2";
        ctx.fillRect(48, 22, 32, 4);
        ctx.fillRect(52, 16, 4, 6);
        ctx.fillRect(62, 12, 4, 10);
        ctx.fillRect(72, 16, 4, 6);
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
