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
    setlist: new Array(25).fill("batcave"),
    mails: [],
    bookedGig: null
};

// INITIALE GIG-ANFRAGEN (MAILS)
const INITIAL_MAILS = [
    {
        id: "m1",
        sender: "Viktor (Klub Katakombe)",
        subject: "DJ-Anfrage: Kälte & Synthesizer",
        date: "02. OKT 2026",
        read: false,
        text: "Hallo! Wir suchen für diesen Samstag einen DJ für unsere 'Kälte & Synthesizer'-Nacht. Das Publikum erwartet eine düstere, synthetische Atmosphäre mit kühlen Melodien. Bist du dabei?",
        pay: 120,
        repReward: 15,
        targetGenres: { darkwave: 0.5, minimal_ndw: 0.5 },
        dislikedGenres: ["ebm_industrial"]
    },
    {
        id: "m2",
        sender: "Lady Pest (The Vault)",
        subject: "Gig: Batcave & Oldschool Deathrock",
        date: "02. OKT 2026",
        read: false,
        text: "Hey! Bei uns im Vault steigt diesen Monat die Rituell-Nacht. Wir wollen echten 80s Batcave und rotzigen Post-Punk hören. Lass die Synthesizer lieber daheim!",
        pay: 150,
        repReward: 20,
        targetGenres: { batcave: 0.8, synthpop: 0.2 },
        dislikedGenres: ["ebm_industrial", "minimal_ndw"]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    gameState.mails = [...INITIAL_MAILS];
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
    document.getElementById("terminal-nav").style.display = "flex";
    
    const genreObj = SUBGENRES_DATA.find(g => g.id === gameState.mainGenre);
    document.getElementById("main-genre-display").innerText = genreObj ? genreObj.name : gameState.mainGenre;

    if (isFirstTime) {
        addLog(`Karriere gestartet! ${gameState.djName} betritt den Untergrund.`);
    } else {
        addLog(`${gameState.djName} hat sein Profil & Avatar angepasst.`);
    }

    switchScreen("screen-inbox");
    renderInbox();
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

    // Nav Buttons Highlighten
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("onclick")?.includes(screenId)) {
            btn.classList.add("active");
        }
    });

    if (screenId === "screen-inbox") renderInbox();
}

function renderInbox() {
    const tbody = document.getElementById("mail-list-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    gameState.mails.forEach(mail => {
        const tr = document.createElement("tr");
        tr.className = `mail-row ${!mail.read ? 'unread' : ''}`;
        tr.onclick = () => readMail(mail.id);

        tr.innerHTML = `
            <td>${mail.sender}</td>
            <td>${mail.subject}</td>
            <td>${mail.date}</td>
        `;
        tbody.appendChild(tr);
    });
}

function readMail(mailId) {
    const mail = gameState.mails.find(m => m.id === mailId);
    if (!mail) return;

    mail.read = true;
    renderInbox();

    const reader = document.getElementById("mail-reader");
    if (!reader) return;

    const isBooked = gameState.bookedGig && gameState.bookedGig.id === mail.id;

    reader.innerHTML = `
        <div class="mail-header-info">
            <div><strong>VON:</strong> ${mail.sender}</div>
            <div><strong>BETREFF:</strong> ${mail.subject}</div>
            <div><strong>GAGE:</strong> ${mail.pay} € | <strong>REP:</strong> +${mail.repReward}</div>
        </div>
        <div class="mail-body-text">
            ${mail.text}
        </div>
        <div class="mail-actions">
            ${isBooked 
                ? `<span style="color:var(--accent-cyan)">[ GIG ANGENOMMEN ]</span>`
                : `<button class="btn btn-primary" onclick="acceptGig('${mail.id}')">[ GIG ANNEHMEN ]</button>`
            }
        </div>
    `;
}

function acceptGig(mailId) {
    const mail = gameState.mails.find(m => m.id === mailId);
    if (!mail) return;

    gameState.bookedGig = mail;
    addLog(`Gig angenommen: '${mail.subject}' bei ${mail.sender}`);
    
    updateBookedGigDisplay();
    switchScreen("screen-dashboard");
    updateUI();
}

function updateBookedGigDisplay() {
    const box = document.getElementById("booked-gig-info");
    const playBtn = document.getElementById("btn-play-gig");
    if (!box) return;

    if (gameState.bookedGig) {
        box.innerHTML = `
            <p><strong>${gameState.bookedGig.subject}</strong></p>
            <p class="text-muted">${gameState.bookedGig.sender}</p>
            <p style="color:var(--accent-cyan); margin-top:4px;">Gage: ${gameState.bookedGig.pay} €</p>
        `;
        if (playBtn) playBtn.style.display = "inline-block";
    } else {
        box.innerHTML = `<p class="text-muted">Kein Gig gebucht.</p>`;
        if (playBtn) playBtn.style.display = "none";
    }
}

// SETLIST EVALUATION & PERFORMANCE ENGINE
function playBookedGig() {
    if (!gameState.bookedGig) return;
    if (gameState.energy < 30) {
        addLog("Zu müde! Du brauchst mindestens 30% Energie für einen Gig.");
        return;
    }

    const gig = gameState.bookedGig;
    gameState.energy -= 30;

    // Genres der Setlist zählen
    let genreCounts = {};
    SUBGENRES_DATA.forEach(g => genreCounts[g.id] = 0);
    gameState.setlist.forEach(g => {
        if (genreCounts[g] !== undefined) genreCounts[g]++;
    });

    // Score Berechnen
    let totalScore = 0;
    let comments = [];

    // Erwartete Genres prüfen
    Object.keys(gig.targetGenres).forEach(gId => {
        const ratio = (genreCounts[gId] || 0) / 25;
        const targetRatio = gig.targetGenres[gId];
        if (ratio >= targetRatio) {
            totalScore += 40;
        } else {
            totalScore += Math.floor((ratio / targetRatio) * 30);
        }
    });

    // Unerwünschte Genres prüfen (Abzug + Gästebuch-Kommentar)
    gig.dislikedGenres.forEach(dId => {
        if (genreCounts[dId] > 3) {
            totalScore -= 25;
            const genreName = SUBGENRES_DATA.find(g => g.id === dId)?.name;
            comments.push({
                author: "Gästebuch-Eintrag (#42)",
                text: `Eigentlich ein cooler Laden, aber warum spielt der DJ mitten im Set ${genreName}? Das hat die Stimmung ruiniert!`
            });
        }
    });

    // Hauptgenre Bonus
    if (genreCounts[gameState.mainGenre] >= 5) {
        totalScore += 15;
    }

    // Ergebnis auswerten
    let rating = "MÄSSIG";
    if (totalScore >= 70) rating = "PERFEKT!";
    else if (totalScore >= 45) rating = "SOLIDE";

    if (totalScore >= 70) {
        comments.push({
            author: "Szene-Blog Review",
            text: `${gameState.djName} hat den Club gerockt! Die Menge war absolut begeistert. Punktgenaue Trackauswahl!`
        });
    } else if (totalScore < 45 && comments.length === 0) {
        comments.push({
            author: "Clubgänger",
            text: "War ganz okay, aber der Funke ist nicht wirklich übergesprungen..."
        });
    }

    // Belohnungen
    const finalCash = rating === "PERFEKT!" ? gig.pay + 30 : gig.pay;
    const finalRep = rating === "PERFEKT!" ? gig.repReward + 5 : gig.repReward;

    gameState.cash += finalCash;
    gameState.rep += finalRep;
    gameState.skill += 2;

    addLog(`Gig absolviert! Ergebnis: ${rating} (+${finalCash}€, +${finalRep} Rep)`);

    // Results in Eval-Screen rendern
    renderEvalScreen(gig, rating, totalScore, finalCash, finalRep, comments);
    
    // Gig zurücksetzen
    gameState.bookedGig = null;
    updateBookedGigDisplay();
    switchScreen("screen-eval");
    updateUI();
}

function renderEvalScreen(gig, rating, score, cash, rep, comments) {
    const statsBox = document.getElementById("eval-stats");
    const commentsBox = document.getElementById("eval-comments");

    if (statsBox) {
        statsBox.innerHTML = `
            <div><strong>CLUB:</strong> ${gig.sender}</div>
            <div><strong>BEWERTUNG:</strong> <span style="color:var(--accent-cyan)">${rating} (${score}/100 Pkt)</span></div>
            <hr style="border-color:var(--border-color); margin:8px 0;">
            <div><strong>GAGE ERHALTEN:</strong> +${cash} €</div>
            <div><strong>REPUTATION:</strong> +${rep}</div>
            <div><strong>SKILL:</strong> +2</div>
        `;
    }

    if (commentsBox) {
        commentsBox.innerHTML = "";
        comments.forEach(c => {
            const card = document.createElement("div");
            card.className = "comment-card";
            card.innerHTML = `
                <div class="comment-author">💬 ${c.author}</div>
                <div>"${c.text}"</div>
            `;
            commentsBox.appendChild(card);
        });
    }
}

function finishGigEvaluation() {
    switchScreen("screen-inbox");
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
    if (mouthType === "black") mouth = "  |       [███]     |  ";
    if (mouthType === "piercing") mouth = "  |      o[===]o    |  ";
    if (mouthType === "mask") mouth = "  |    [=X=X=X=X=]  |  ";
    if (mouthType === "neutral") mouth = "  |        ---      |  ";

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
