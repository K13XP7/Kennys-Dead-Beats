// Game State Management
const gameState = {
    money: 1450.00,
    currentDayIndex: 0,
    days: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
    bookedLocation: null,
    bookedDJs: [],
    gigRequests: [
        {
            id: "gig-1",
            title: "Darkwave Night @ Caveau Mainz",
            genre: "Darkwave & Postpunk",
            day: "Freitag",
            fee: 180.00,
            accepted: false,
            declined: false
        },
        {
            id: "gig-2",
            title: "Industrial Noise Mass @ Stengelvilla",
            genre: "Harsh EBM / Industrial",
            day: "Samstag",
            fee: 250.00,
            accepted: false,
            declined: false
        },
        {
            id: "gig-3",
            title: "Gothic Classics @ Final Darkness",
            genre: "80s Goth & Batcave",
            day: "Samstag",
            fee: 210.00,
            accepted: false,
            declined: false
        }
    ],
    locations: [
        {
            id: "ponyhof",
            name: "Ponyhof (FFM-Sachsenhausen)",
            capacity: 120,
            cost: 220.00,
            description: "Gemütlicher Gewölbekeller Klappergasse. Perfekt für intime Post-Punk & Coldwave Abende."
        },
        {
            id: "kreativfabrik",
            name: "Kreativfabrik (Wiesbaden)",
            capacity: 200,
            cost: 380.00,
            description: "Roher DIY-Charme direkt am Schlachthof-Gelände. Bekannt für Obscure Wave & Minimal Synth."
        },
        {
            id: "nachtleben",
            name: "Nachtleben (FFM Innenstadt)",
            capacity: 280,
            cost: 550.00,
            description: "Kult-Gothic-Keller an der Konstablerwache. Heimat von EBM, Batcave & Darkwave Partys."
        },
        {
            id: "dasbett",
            name: "Das BETT (FFM-Gallus)",
            capacity: 400,
            cost: 850.00,
            description: "Bühne für Düster-Konzerte & schwarze Partys mit sattem Sound und düsterem Vibe."
        },
        {
            id: "kesselhaus",
            name: "Kesselhaus / Schlachthof (Wiesbaden)",
            capacity: 500,
            cost: 1250.00,
            description: "Industrieller Backstein-Look mit hoher Decke. Ideal für harten EBM, Industrial & Goth-Rock."
        },
        {
            id: "milchsack",
            name: "Tanzhaus West / Milchsackfabrik (FFM)",
            capacity: 900,
            cost: 1950.00,
            description: "Altes Fabrikgelände im Gutleutviertel. Mehrere düstere Floors für große Schwarze Nächte."
        }
    ],
    // Szene-DJs aus dem Rhein-Main-Gebiet
    djs: [
        {
            id: "dj-shadowkin",
            name: "DJ Shadowkin",
            status: "Underground-Tipp",
            genres: "Coldwave, Minimal Synth",
            location: "Mainz / Wiesbaden",
            fee: 80.00,
            popularity: "+10% Gäste",
            description: "Aufstrebender DJ aus den Gewölben des Caveau Mainz. Zieht echtes Underground-Publikum an."
        },
        {
            id: "dj-vampira",
            name: "DJane Vampira",
            status: "Lokalmatadorin",
            genres: "Post-Punk, Batcave, Deathrock",
            location: "Frankfurt am Main",
            fee: 140.00,
            popularity: "+20% Gäste",
            description: "Bekannt aus dem Ponyhof FFM. Liefert energiegeladenen 80s-Goth & Underground-Klassiker."
        },
        {
            id: "dj-cyberpulse",
            name: "DJ CyberPulse",
            status: "Industrial-Spezialist",
            genres: "EBM, Harsh Electro, Aggrotech",
            location: "Offenbach am Main",
            fee: 220.00,
            popularity: "+30% Gäste",
            description: "Bekannt für tanzbare Bässe und harten EBM. Garant für volle Floors bei Industrial-Liebhabern."
        },
        {
            id: "dj-nox",
            name: "DJ Nox & Fräulein Schatten",
            status: "Szenegröße",
            genres: "Darkwave, Gothic Rock, Neofolk",
            location: "Darmstadt / FFM",
            fee: 350.00,
            popularity: "+45% Gäste",
            description: "Erfahrenes DJ-Duo, das seit Jahren im Nachtleben FFM auflegt. Zieht treue Stammgäste an."
        },
        {
            id: "dj-ironbeast",
            name: "DJ Ironbeast",
            status: "Headliner",
            genres: "Industrial, Rhythmic Noise, Synthpop",
            location: "Wiesbaden (Schlachthof)",
            fee: 550.00,
            popularity: "+65% Gäste",
            description: "Regionaler Veteran, der regelmäßig das Kesselhaus füllt. Bringt eine riesige Fanbase mit."
        }
    ]
};

// DOM Referenzen
const moneyDisplay = document.getElementById("money-display");
const dayDisplay = document.getElementById("day-display");
const nextDayBtn = document.getElementById("next-day-btn");
const statusText = document.getElementById("status-text");
const bookedLocationText = document.getElementById("booked-location-text");
const bookedDJsText = document.getElementById("booked-djs-text");
const locationsListContainer = document.getElementById("locations-list");
const gigRequestsListContainer = document.getElementById("gig-requests-list");
const djsListContainer = document.getElementById("djs-list");

// Navigation / Tabs Umschalten
const navItems = document.querySelectorAll(".nav-item");
const tabContents = document.querySelectorAll(".tab-content");

navItems.forEach(item => {
    item.addEventListener("click", () => {
        const targetTab = item.getAttribute("data-tab");

        navItems.forEach(i => i.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));

        item.classList.add("active");
        document.getElementById(`tab-${targetTab}`).classList.add("active");
    });
});

// DJ-Anfragen (Nachrichten) rendern
function renderGigRequests() {
    gigRequestsListContainer.innerHTML = "";

    gameState.gigRequests.forEach(gig => {
        const card = document.createElement("div");
        card.className = "card";

        let actionHTML = "";
        if (gig.accepted) {
            actionHTML = `<span class="badge-success">Zugesagt ✓ (+${gig.fee.toFixed(2)} € am ${gig.day})</span>`;
        } else if (gig.declined) {
            actionHTML = `<span class="badge-muted">Abgelehnt ✗</span>`;
        } else {
            actionHTML = `
                <button class="btn-primary accept-gig-btn" data-id="${gig.id}">Annehmen</button>
                <button class="btn-secondary decline-gig-btn" data-id="${gig.id}">Ablehnen</button>
            `;
        }

        card.innerHTML = `
            <div>
                <h3>${gig.title}</h3>
                <p><strong>Genre:</strong> ${gig.genre}</p>
                <p><strong>Wochentag:</strong> ${gig.day}</p>
                <p><strong>Honorar:</strong> ${gig.fee.toFixed(2)} €</p>
            </div>
            <div class="card-action">
                ${actionHTML}
            </div>
        `;

        gigRequestsListContainer.appendChild(card);
    });

    document.querySelectorAll(".accept-gig-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const gigId = e.target.getAttribute("data-id");
            acceptGig(gigId);
        });
    });

    document.querySelectorAll(".decline-gig-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const gigId = e.target.getAttribute("data-id");
            declineGig(gigId);
        });
    });
}

function acceptGig(gigId) {
    const gig = gameState.gigRequests.find(g => g.id === gigId);
    if (gig) {
        gig.accepted = true;
        updateUI();
    }
}

function declineGig(gigId) {
    const gig = gameState.gigRequests.find(g => g.id === gigId);
    if (gig) {
        gig.declined = true;
        updateUI();
    }
}

// Locations rendern
function renderLocations() {
    locationsListContainer.innerHTML = "";

    gameState.locations.forEach(loc => {
        const isBooked = gameState.bookedLocation && gameState.bookedLocation.id === loc.id;
        const canAfford = gameState.money >= loc.cost;

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div>
                <h3>${loc.name}</h3>
                <p>${loc.description}</p>
                <p><strong>Max. Kapazität:</strong> ${loc.capacity} Personen</p>
                <p><strong>Miete/Wochenende:</strong> ${loc.cost.toFixed(2)} €</p>
            </div>
            <div class="card-action">
                <button class="btn-primary book-btn" 
                    data-id="${loc.id}" 
                    ${isBooked || !canAfford ? "disabled" : ""}>
                    ${isBooked ? "Gebucht ✓" : "Für Wochenende buchen"}
                </button>
            </div>
        `;
        locationsListContainer.appendChild(card);
    });

    document.querySelectorAll(".book-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const locId = e.target.getAttribute("data-id");
            bookLocation(locId);
        });
    });
}

function bookLocation(locId) {
    const loc = gameState.locations.find(l => l.id === locId);
    if (loc && gameState.money >= loc.cost) {
        gameState.money -= loc.cost;
        gameState.bookedLocation = loc;
        updateUI();
    }
}

// DJs buchen rendern
function renderDJs() {
    djsListContainer.innerHTML = "";

    gameState.djs.forEach(dj => {
        const isBooked = gameState.bookedDJs.some(b => b.id === dj.id);
        const canAfford = gameState.money >= dj.fee;

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div>
                <h3>${dj.name} <small style="font-size:0.8rem; color:#888;">(${dj.status})</small></h3>
                <p>${dj.description}</p>
                <p><strong>Herkunft/Szene:</strong> ${dj.location}</p>
                <p><strong>Genres:</strong> ${dj.genres}</p>
                <p><strong>Anziehungskraft:</strong> <span style="color:#00e676;">${dj.popularity}</span></p>
                <p><strong>Gage/Honorar:</strong> ${dj.fee.toFixed(2)} €</p>
            </div>
            <div class="card-action">
                <button class="btn-primary book-dj-btn" 
                    data-id="${dj.id}" 
                    ${isBooked || !canAfford ? "disabled" : ""}>
                    ${isBooked ? "Gebucht ✓" : "Für Party buchen"}
                </button>
            </div>
        `;
        djsListContainer.appendChild(card);
    });

    document.querySelectorAll(".book-dj-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const djId = e.target.getAttribute("data-id");
            bookDJ(djId);
        });
    });
}

function bookDJ(djId) {
    const dj = gameState.djs.find(d => d.id === djId);
    if (dj && gameState.money >= dj.fee) {
        gameState.money -= dj.fee;
        gameState.bookedDJs.push(dj);
        updateUI();
    }
}

// UI Aktualisieren
function updateUI() {
    moneyDisplay.innerText = `${gameState.money.toFixed(2)} €`;
    const dayName = gameState.days[gameState.currentDayIndex];
    dayDisplay.innerText = dayName;

    // Location-Anzeige auf Dashboard
    if (gameState.bookedLocation) {
        bookedLocationText.innerHTML = `<strong>${gameState.bookedLocation.name}</strong> (Max. ${gameState.bookedLocation.capacity} Gäste)`;
    } else {
        bookedLocationText.innerText = "Aktuell keine Location gebucht.";
    }

    // DJs-Anzeige auf Dashboard
    if (gameState.bookedDJs.length > 0) {
        const djNames = gameState.bookedDJs.map(d => d.name).join(", ");
        bookedDJsText.innerHTML = `<strong>Gebuchte DJs:</strong> ${djNames}`;
    } else {
        bookedDJsText.innerText = "Gebuchte DJs: Keine";
    }

    if (gameState.currentDayIndex === 4 || gameState.currentDayIndex === 5) {
        nextDayBtn.innerText = "PARTY STARTEN 🦇";
        statusText.innerText = "Das Wochenende bricht an! Die Schattenwelten erwachen.";
    } else {
        nextDayBtn.innerText = "WEITER ➔";
        statusText.innerText = "Bereite das Wochenende vor. Nimm DJ-Anfragen an, buche eine Location und stelle dein Lineup zusammen.";
    }

    renderGigRequests();
    renderLocations();
    renderDJs();
}

// Weiter-Button (Tage weiterschalten & Geld auszahlen)
nextDayBtn.addEventListener("click", () => {
    const currentDay = gameState.days[gameState.currentDayIndex];

    gameState.gigRequests.forEach(gig => {
        if (gig.accepted && gig.day === currentDay) {
            gameState.money += gig.fee;
            alert(`🎧 Du hast am ${currentDay} auf der '${gig.title}' aufgelegt und ${gig.fee.toFixed(2)} € Honorar kassiert!`);
        }
    });

    gameState.currentDayIndex = (gameState.currentDayIndex + 1) % gameState.days.length;
    
    // Montag Reset
    if (gameState.currentDayIndex === 0) {
        gameState.bookedLocation = null;
        gameState.bookedDJs = [];
        gameState.gigRequests.forEach(g => {
            g.accepted = false;
            g.declined = false;
        });
    }

    updateUI();
});

// Start
updateUI();
