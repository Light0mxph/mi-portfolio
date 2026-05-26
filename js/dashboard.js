document.addEventListener("componentsLoaded", () => {
    setInterval(() => {
        const tpsEl = document.getElementById("live-tps");
        const msptEl = document.getElementById("live-mspt");
        const pingEl = document.getElementById("live-ping");
        // Seleccionamos las mini cards correctamente
        const entEl = document.querySelectorAll(".mini-val")[0];
        const playEl = document.querySelectorAll(".mini-val")[1];
        const trendEl = document.querySelector(".visit-trend");

        if (tpsEl) tpsEl.innerHTML = `${(19.6 + Math.random() * 0.4).toFixed(2)} <span class="metric-sub">/20</span>`;
        if (msptEl) msptEl.innerHTML = `${(42 + Math.random() * 5).toFixed(1)} <span class="metric-sub">ms</span>`;
        if (pingEl) pingEl.innerHTML = `${Math.floor(78 + Math.random() * 6)}<span class="metric-sub">ms</span>`;
        
        // Animamos entidades y jugadores
        if (entEl) entEl.textContent = (12450 + Math.floor(Math.random() * 50)).toLocaleString();
        if (playEl) playEl.textContent = (30 + Math.floor(Math.random() * 5)).toString();
        
        // Variamos el % del hero
        if (trendEl) {
            const newTrend = (12.5 + (Math.random() - 0.5)).toFixed(1);
            trendEl.innerHTML = `+${newTrend}% <span class="trend-sub">este mes</span>`;
        }
    }, 2000);
});
