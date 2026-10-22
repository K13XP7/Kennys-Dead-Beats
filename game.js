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

    renderCustomAvatar();

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

// MONOCHROMER ASCII-AVATAR GENERATOR
function renderCustomAvatar() {
    const hairType = document.getElementById("layer-hair")?.value || "trad";
    const browsType = document.getElementById("layer-brows")?.value || "heavy";
    const eyesType = document.getElementById("layer-eyes")?.value || "heavy";
    const mouthType = document.getElementById("layer-mouth")?.value || "black";
    const accType = document.getElementById("layer-acc")?.value || "none";

    let hairLines = [];
    
    if (hairType === "trad") {
        hairLines = [
            "    /\\ /\\  /\\ /\\ /\\    ",
            "  /  \\/  \\/  \\/  \\/  \\  ",
            " / /\\  /\\  /\\  /\\  /\\ \\ ",
            "| |  \\/  \\/  \\/  \\/  | |",
            "| |                  | |"
        ];
    } else if (hairType === "spikes") {
        hairLines = [
            "      /||\\  /||\\       ",
            "     //||\\\\//||\\\\      ",
            "    ///||||||||\\\\\\     ",
            "   ////||||||||\\\\\\\\    ",
            "  /////||||||||\\\\\\\\\\   "
        ];
    } else if (hairType === "postpunk") {
        hairLines = [
            "  .-----------------.  ",
            " /  _________________\\ ",
            "|  /                  |",
            "| /                   |",
            "|/                    |"
        ];
    } else if (hairType === "cyberdreads") {
        hairLines = [
            "  |||||||||||||||||||  ",
            "  || | | | | | | | ||  ",
            " ()(  | | | | | |  )() ",
            " ()(              )() ",
            " ()(              )() "
        ];
    } else {
        hairLines = [
            "                       ",
            "   .---------------.   ",
            "  ::: :: ::: ::: :::   ",
            "  ::::::::::::::::::   ",
            "  ::::::::::::::::::   "
        ];
    }

    let brows = "  |  :=:       :=:  |  ";
    if (browsType === "arch") brows = "  |  /=\\       /=\\  |  ";
    if (browsType === "pierced") brows = "  |  :=o       :=:  |  ";
    if (browsType === "none") brows = "  |                 |  ";

    let eyes = "  |  [o]       [o]  |  ";
    if (eyesType === "heavy") eyes = "  | >[#]<     >[#]< |  ";
    if (eyesType === "cateye") eyes = "  | /{#}\\     /{#}\\ |  ";
    if (eyesType === "visor") eyes = "  | [==============]|  ";

    if (accType === "sunglasses") eyes = "  |  [===]     [===]|  ";

    let nose = "  |        ||       |  ";

    let mouth = "  |       [===]     |  ";
    if (mouthType === "purple" || mouthType === "black") mouth = "  |       [███]     |  ";
    if (mouthType === "piercing") mouth = "  |      o[===]o    |  ";
    if (mouthType === "mask") mouth = "  |    [=X=X=X=X=]  |  ";

    let neck = "  \\        ||       /  ";
    let collar = "   \\___[======]___/   ";
    if (accType === "choker") collar = "   \\___[==+-+=]___/   ";

    const asciiArt = [
        ...hairLines,
        brows,
        eyes,
        nose,
        mouth,
        neck,
        collar,
        "  /                 \\  ",
        " /                   \\ "
    ].join("\n");

    const previewBox = document.getElementById("ascii-avatar-preview");
    if (previewBox) {
        previewBox.textContent = asciiArt;
    }

    const profileBox = document.getElementById("profile-ascii-display");
    if (profileBox) {
        profileBox.textContent = asciiArt;
    }
}

function updateUI() {
    document.getElementById("date-display").innerText = getFormattedDate();
    document.getElementById("cash-display").innerText = gameState.cash;
    document.getElementById("rep-display").innerText = gameState.rep;
    document.getElementById("skill-display").innerText = gameState.skill;
    
    document.getElementById("energy-text").innerText = `${gameState.energy}%`;
    document.getElementById("energy-bar").style.width = `${gameState.energy}%`;
}
