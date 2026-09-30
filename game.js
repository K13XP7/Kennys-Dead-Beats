// SPIEL-ZUSTAND (GameState)
let gameState = null;

// DOM-Elemente
const screens = {
    start: document.getElementById('start-screen'),
    onboarding: document.getElementById('onboarding-screen'),
    dashboard: document.getElementById('dashboard-screen')
};

const btnNewGame = document.getElementById('btn-new-game');
const btnContinue = document.getElementById('btn-continue');
const btnSave = document.getElementById('btn-save');
const btnQuit = document.getElementById('btn-quit');
const btnBackToMenu = document.getElementById('btn-back-to-menu');
const saveInfoText = document.getElementById('save-info');
const djForm = document.getElementById('dj-form');

// --- INITIALISIERUNG ---
window.addEventListener('DOMContentLoaded', () => {
    checkExistingSave();
});

// --- NAVIGATION ---
function showScreen(screenKey) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenKey].classList.remove('hidden');
}

// --- SPEICHER-SYSTEM (LocalStorage) ---
function checkExistingSave() {
    const savedData = localStorage.getItem('graveyard_noise_save');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        btnContinue.disabled = false;
        saveInfoText.textContent = `Speicherstand: ${parsed.djName} (${parsed.genre}) | ${parsed.money} €`;
    } else {
        btnContinue.disabled = true;
        saveInfoText.textContent = 'Kein Speicherstand vorhanden';
    }
}

function saveGame() {
    if (!gameState) return;
    localStorage.setItem('graveyard_noise_save', JSON.stringify(gameState));
    alert('Spielstand erfolgreich gespeichert! ⚰️');
    checkExistingSave();
}

function loadGame() {
    const savedData = localStorage.getItem('graveyard_noise_save');
    if (savedData) {
        gameState = JSON.parse(savedData);
        updateDashboard();
        showScreen('dashboard');
    }
}

// --- EVENT HANDLER ---
btnNewGame.addEventListener('click', () => showScreen('onboarding'));
btnContinue.addEventListener('click', loadGame);
btnBackToMenu.addEventListener('click', () => showScreen('start'));

btnSave.addEventListener('click', saveGame);
btnQuit.addEventListener('click', () => {
    checkExistingSave();
    showScreen('start');
});

// Formular-Absendung (Neues Spiel starten)
djForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Zustand für neues Spiel initialisieren
    gameState = {
        djName: document.getElementById('dj-name').value.trim(),
        genre: document.getElementById('dj-genre').value,
        region: document.getElementById('dj-region').value,
        job: document.getElementById('dj-job').value,
        money: 150, // Startkapital
        reputation: 5,
        createdDate: new Date().toLocaleDateString()
    };

    updateDashboard();
    showScreen('dashboard');
});

// HUD Aktualisieren
function updateDashboard() {
    document.getElementById('hud-name').textContent = gameState.djName;
    document.getElementById('hud-genre').textContent = gameState.genre;
    document.getElementById('hud-region').textContent = gameState.region;
    document.getElementById('hud-job').textContent = gameState.job;
    document.getElementById('hud-money').textContent = gameState.money;
    document.getElementById('hud-rep').textContent = gameState.reputation;
}
