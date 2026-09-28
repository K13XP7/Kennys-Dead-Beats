// Game State Management
const gameState = {
    money: 1450.00,
    currentDayIndex: 0,
    days: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
};

// DOM Referenzen
const moneyDisplay = document.getElementById("money-display");
const dayDisplay = document.getElementById("day-display");
const nextDayBtn = document.getElementById("next-day-btn");
const statusText = document.getElementById("status-text");

// UI-Update Funktion
function updateUI() {
    moneyDisplay.innerText = `${gameState.money.toFixed(2)} €`;
    const dayName = gameState.days[gameState.currentDayIndex];
    dayDisplay.innerText = dayName;

    if (gameState.currentDayIndex === 4 || gameState.currentDayIndex === 5) {
        nextDayBtn.innerText = "PARTY STARTEN 🎧";
        statusText.innerText = "Das Wochenende ist da! Die Partys laufen.";
    } else {
        nextDayBtn.innerText = "WEITER ➔";
        statusText.innerText = "Bereite das Wochenende vor. Buche DJs und wähle die Setlists.";
    }
}

// Event-Listener für den Button
nextDayBtn.addEventListener("click", () => {
    gameState.currentDayIndex = (gameState.currentDayIndex + 1) % gameState.days.length;
    updateUI();
});

// Initiales UI-Rendering
updateUI();
