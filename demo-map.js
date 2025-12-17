/**
 * DEMO-MAP.JS
 * Obsługa interaktywnej mapy parkingu na podstronie demo.html
 */

const TOTAL_SPOTS = 24; // Ilość miejsc w siatce (4 rzędy po 6)
const GRID_CONTAINER = document.getElementById('parking-grid');
const LOG_CONTAINER = document.getElementById('system-log');
const STORAGE_MAP_KEY = 'retroParkMapState';

// Inicjalizacja przy załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    startClock();
    
    // Symulacja: Co 8 sekund ktoś wjeżdża lub wyjeżdża
    setInterval(simulateRandomTraffic, 8000);
});

// Funkcja główna
function initMap() {
    let mapData = loadMapData();
    
    // Jeśli brak danych, wygeneruj nowe
    if (!mapData || mapData.length !== TOTAL_SPOTS) {
        mapData = generateInitialMapData();
        saveMapData(mapData);
    }

    renderGrid(mapData);
    updateStats(mapData);
}

// Generowanie losowego stanu początkowego
function generateInitialMapData() {
    let data = [];
    for (let i = 0; i < TOTAL_SPOTS; i++) {
        // 40% szans, że miejsce jest zajęte na starcie
        const isOccupied = Math.random() < 0.4;
        data.push({
            id: i,
            label: `A-${i + 1}`, // Np. A-1, A-2...
            status: isOccupied ? 'occupied' : 'free' // 'free', 'occupied', 'reserved'
        });
    }
    return data;
}

// Rysowanie siatki HTML
function renderGrid(data) {
    GRID_CONTAINER.innerHTML = ''; // Czyść

    data.forEach(spot => {
        const spotEl = document.createElement('div');
        spotEl.classList.add('spot');
        spotEl.dataset.id = spot.id;

        // Klasy CSS zależne od statusu
        if (spot.status === 'occupied') spotEl.classList.add('occupied');
        if (spot.status === 'reserved') spotEl.classList.add('reserved');

        // Ikona
        let icon = '';
        if (spot.status === 'occupied') icon = '🚗';
        else if (spot.status === 'reserved') icon = '🔒';
        else icon = 'P'; // Puste

        spotEl.innerHTML = `
            <span class="spot-icon">${icon}</span>
            <span class="spot-label">${spot.label}</span>
        `;

        // Obsługa kliknięcia
        spotEl.addEventListener('click', () => handleSpotClick(spot));

        GRID_CONTAINER.appendChild(spotEl);
    });
}

// Obsługa kliknięcia w miejsce
function handleSpotClick(spot) {
    const actionPanel = document.getElementById('action-panel');
    const title = document.getElementById('selected-spot-id');
    const status = document.getElementById('selected-spot-status');
    const btn = document.getElementById('reserve-btn');

    actionPanel.style.display = 'block';
    title.textContent = `SPOT: ${spot.label}`;
    
    // Reset przycisku (klonowanie usuwa event listenery)
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    if (spot.status === 'occupied') {
        status.textContent = 'ZAJĘTE';
        status.style.color = 'red';
        newBtn.disabled = true;
        newBtn.textContent = 'NIEDOSTĘPNE';
        newBtn.style.opacity = '0.5';
    } else if (spot.status === 'reserved') {
        status.textContent = 'TWOJA REZERWACJA';
        status.style.color = '#aa8800';
        newBtn.disabled = false;
        newBtn.textContent = 'ANULUJ REZERWACJĘ';
        newBtn.onclick = () => toggleReservation(spot.id);
    } else {
        status.textContent = 'WOLNE';
        status.style.color = 'green';
        newBtn.disabled = false;
        newBtn.textContent = 'REZERWUJ MIEJSCE';
        newBtn.onclick = () => toggleReservation(spot.id);
    }
}

// Logika rezerwacji
function toggleReservation(id) {
    let data = loadMapData();
    const spot = data.find(s => s.id === id);

    if (spot.status === 'free') {
        spot.status = 'reserved';
        addLog(`> Spot ${spot.label} reserved by USER.`);
    } else if (spot.status === 'reserved') {
        spot.status = 'free';
        addLog(`> Reservation for ${spot.label} cancelled.`);
    }

    saveMapData(data);
    renderGrid(data);
    updateStats(data);
    document.getElementById('action-panel').style.display = 'none'; // Schowaj panel
}

// Symulacja ruchu (losowe zmiany)
function simulateRandomTraffic() {
    let data = loadMapData();
    // Wybierz losowe miejsce, które nie jest zarezerwowane przez użytkownika
    const changeableSpots = data.filter(s => s.status !== 'reserved');
    
    if (changeableSpots.length === 0) return;

    const randomSpot = changeableSpots[Math.floor(Math.random() * changeableSpots.length)];
    
    // Zmień stan (Free <-> Occupied)
    if (randomSpot.status === 'free') {
        randomSpot.status = 'occupied';
        addLog(`> SENSOR: Car arrived at ${randomSpot.label}`);
    } else {
        randomSpot.status = 'free';
        addLog(`> SENSOR: Car left ${randomSpot.label}`);
    }

    saveMapData(data);
    renderGrid(data);
    updateStats(data);
}

// Pomocnicze funkcje
function updateStats(data) {
    const total = data.length;
    const occupied = data.filter(s => s.status === 'occupied').length;
    const reserved = data.filter(s => s.status === 'reserved').length;
    const free = total - occupied - reserved;

    document.getElementById('map-total').textContent = total;
    document.getElementById('map-free').textContent = free;
    document.getElementById('map-occupied').textContent = occupied + reserved;
}

function addLog(message) {
    const time = new Date().toLocaleTimeString();
    const line = `[${time}] ${message}<br>`;
    LOG_CONTAINER.innerHTML = line + LOG_CONTAINER.innerHTML;
}

function loadMapData() {
    return JSON.parse(localStorage.getItem(STORAGE_MAP_KEY));
}

function saveMapData(data) {
    localStorage.setItem(STORAGE_MAP_KEY, JSON.stringify(data));
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock').textContent = 
            String(now.getHours()).padStart(2, '0') + ':' + 
            String(now.getMinutes()).padStart(2, '0');
    }, 1000);
}