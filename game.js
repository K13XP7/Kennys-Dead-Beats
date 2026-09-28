// Game State Management
const gameState = {
    money: 1450.00,
    currentDayIndex: 0,
    days: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
    bookedLocation: null,
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
    ]
};

// DOM Referenzen
const moneyDisplay = document.getElementById("money-display");
const dayDisplay = document.getElementById("day-display");
const nextDayBtn = document.getElementById("next-day-btn");
const statusText = document.getElementById("status-text");
const bookedLocationText = document.getElementById("booked-location-text");
const locationsListContainer = document.getElementById("locations-list");
const gigRequestsListContainer = document.getElementById("gig-requests-list");

// Linke Navigation / Tabs Umschalten
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

// DJ-Anfragen im Karten-Design rendern
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

    // Button Listener
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

// UI Aktualisieren
function updateUI() {
    moneyDisplay.innerText = `${gameState.money.toFixed(2)} €`;
    const dayName = gameState.days[gameState.currentDayIndex];
    dayDisplay.innerText = dayName;

    if (gameState.bookedLocation) {
        bookedLocationText.innerHTML = `<strong>${gameState.bookedLocation.name}</strong> (Max. ${gameState.bookedLocation.capacity} Gäste)`;
    } else {
        bookedLocationText.innerText = "Aktuell keine eigene Location für diese Woche gebucht.";
    }

    if (gameState.currentDayIndex === 4 || gameState.currentDayIndex === 5) {
        nextDayBtn.innerText = "PARTY STARTEN 🦇";
        statusText.innerText = "Das Wochenende bricht an! Die Schattenwelten erwachen.";
    } else {
        nextDayBtn.innerText = "WEITER ➔";
        statusText.innerText = "Bereite das Wochenende vor. Nimm DJ-Anfragen an oder buche eine eigene Location.";
    }

    renderGigRequests();
    renderLocations();
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
    
    if (gameState.currentDayIndex === 0) {
        gameState.bookedLocation = null;
        gameState.gigRequests.forEach(g => {
            g.accepted = false;
            g.declined = false;
        });
    }

    updateUI();
});

// Start
updateUI();
