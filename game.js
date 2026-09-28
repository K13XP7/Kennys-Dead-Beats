// Game State Management
const gameState = {
    money: 1450.00,
    currentDayIndex: 0,
    days: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
    bookedLocation: null,
    locations: [
        {
            id: "basement",
            name: "Der Kellerclub",
            capacity: 150,
            cost: 300.00,
            description: "Dreckig, laut, intim. Perfekt für die ersten kleinen Underground-Partys."
        },
        {
            id: "warehouse",
            name: "Alte Lagerhalle",
            capacity: 500,
            cost: 850.00,
            description: "Industrie-Charm mit viel Platz und robuster Anlage."
        },
        {
            id: "kulturbahnhof",
            name: "Kulturbahnhof",
            capacity: 1200,
            cost: 2200.00,
            description: "Renommierte Event-Location mit professioneller Licht- & Sound-Anlage."
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

// Tab-Steuerung
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
                <p><strong>Kapazität:</strong> ${loc.capacity} Personen</p>
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

    // Event Listener für Buchen-Buttons
    document.querySelectorAll(".book-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const locId = e.target.getAttribute("data-id");
            bookLocation(locId);
        });
    });
}

// Location buchen Funktion
function bookLocation(locId) {
    const loc = gameState.locations.find(l => l.id === locId);
    if (loc && gameState.money >= loc.cost) {
        gameState.money -= loc.cost;
        gameState.bookedLocation = loc;
        updateUI();
    }
}

// UI-Update Funktion
function updateUI() {
    moneyDisplay.innerText = `${gameState.money.toFixed(2)} €`;
    const dayName = gameState.days[gameState.currentDayIndex];
    dayDisplay.innerText = dayName;

    if (gameState.bookedLocation) {
        bookedLocationText.innerHTML = `<strong>${gameState.bookedLocation.name}</strong> (Max. ${gameState.bookedLocation.capacity} Gäste)`;
    } else {
        bookedLocationText.innerText = "Aktuell keine Location für diese Woche gebucht.";
    }

    if (gameState.currentDayIndex === 4 || gameState.currentDayIndex === 5) {
        nextDayBtn.innerText = "PARTY STARTEN 🎧";
        statusText.innerText = "Das Wochenende ist da! Die Partys laufen.";
    } else {
        nextDayBtn.innerText = "WEITER ➔";
        statusText.innerText = "Bereite das Wochenende vor. Buche eine Location und passende DJs.";
    }

    renderLocations();
}

// Event-Listener für Weiter-Button
nextDayBtn.addEventListener("click", () => {
    gameState.currentDayIndex = (gameState.currentDayIndex + 1) % gameState.days.length;
    
    // Nach dem Wochenende (Montag) wird die Buchung für die neue Woche zurückgesetzt
    if (gameState.currentDayIndex === 0) {
        gameState.bookedLocation = null;
    }

    updateUI();
});

// Initiales Rendering
updateUI();
