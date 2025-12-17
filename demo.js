/**
 * DEMO.JS
 * Odpowiada za zarządzanie danymi o miejscach parkingowych w LocalStorage.
 * Działa jako symulacja backendu dla GitHub Pages.
 */

const STORAGE_KEY = 'retroParkData';

// Konfiguracja symulacji
const CITIES = ['Warszawa', 'Kraków', 'Gdańsk', 'Wrocław', 'Poznań'];
const TOTAL_SPOTS_PER_CITY = 500;

// Funkcja inicjalizująca dane, jeśli nie istnieją
function initDemoData() {
    const existingData = localStorage.getItem(STORAGE_KEY);
    
    if (!existingData) {
        console.log('Inicjalizacja nowej bazy danych demo...');
        const initialData = generateRandomData();
        saveData(initialData);
    } else {
        console.log('Załadowano dane z LocalStorage.');
        // Opcjonalnie: odśwież dane co jakiś czas, żeby "żyły"
        refreshRandomSpots();
    }
}

// Generowanie losowych danych dla miast
function generateRandomData() {
    let db = {};
    
    CITIES.forEach(city => {
        const occupied = Math.floor(Math.random() * TOTAL_SPOTS_PER_CITY);
        db[city] = {
            total: TOTAL_SPOTS_PER_CITY,
            occupied: occupied,
            free: TOTAL_SPOTS_PER_CITY - occupied,
            lastUpdate: new Date().toISOString()
        };
    });
    
    return db;
}

// Zapis do storage
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Odczyt ze storage
function getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

// Symulacja zmian w czasie rzeczywistym (losowe zwalnianie/zajmowanie)
function refreshRandomSpots() {
    let data = getData();
    if(!data) return;

    CITIES.forEach(city => {
        // Losowa zmiana o +/- 5 miejsc
        const change = Math.floor(Math.random() * 11) - 5; 
        let newOccupied = data[city].occupied + change;
        
        // Zabezpieczenia zakresu
        if(newOccupied < 0) newOccupied = 0;
        if(newOccupied > data[city].total) newOccupied = data[city].total;

        data[city].occupied = newOccupied;
        data[city].free = data[city].total - newOccupied;
        data[city].lastUpdate = new Date().toISOString();
    });

    saveData(data);
}

// API dla frontendu - zwraca zagregowane dane
function getGlobalStats() {
    const data = getData();
    let totalFree = 0;
    let totalOccupied = 0;

    if(data) {
        Object.values(data).forEach(cityData => {
            totalFree += cityData.free;
            totalOccupied += cityData.occupied;
        });
    }

    return { free: totalFree, occupied: totalOccupied };
}

// Uruchomienie przy starcie
initDemoData();

// Symuluj zmiany co 5 sekund
setInterval(refreshRandomSpots, 5000);