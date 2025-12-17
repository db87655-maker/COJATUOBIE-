document.addEventListener('DOMContentLoaded', () => {
    
    // 1. ZEGAR w pasku zadań
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('clock').textContent = `${hours}:${minutes}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 2. Animacja pojawiania się sekcji przy scrollowaniu (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.window-wrapper').forEach(section => {
        observer.observe(section);
    });

    // 3. Integracja z DEMO DATA
    function updateDashboard() {
        // Funkcja zdefiniowana w demo.js
        if (typeof getGlobalStats === 'function') {
            const stats = getGlobalStats();
            
            // Animacja licznika (prosta)
            const freeEl = document.getElementById('free-spots-count');
            const occupiedEl = document.getElementById('occupied-spots-count');
            const totalDisplay = document.getElementById('total-spots-display');

            if(freeEl) freeEl.textContent = stats.free;
            if(occupiedEl) occupiedEl.textContent = stats.occupied;
            if(totalDisplay) totalDisplay.textContent = `SYSTEM ONLINE: Śledzimy ${stats.free + stats.occupied} miejsc.`;
        }
    }

    // Odświeżaj widok co sekundę (żeby złapać zmiany z demo.js)
    setInterval(updateDashboard, 1000);
    updateDashboard();

    // 4. Obsługa wyszukiwarki (Demo alert)
    const searchBtn = document.querySelector('.search-box .retro-btn');
    const searchInput = document.getElementById('city-search');

    if(searchBtn) {
        searchBtn.addEventListener('click', () => {
            const city = searchInput.value;
            if(city) {
                alert(`Szukam parkingu w: ${city}... \n(To funkcjonalność demo - przekierowanie nastąpi w pełnej wersji)`);
            } else {
                alert('Wpisz nazwę miasta!');
            }
        });
    }
});