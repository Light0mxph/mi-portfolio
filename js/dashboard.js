document.addEventListener("componentsLoaded", () => {
    setInterval(() => {
        const tpsEl = document.getElementById("live-tps");
        const msptEl = document.getElementById("live-mspt");
        const pingEl = document.getElementById("live-ping");

        if (tpsEl) tpsEl.innerHTML = `${(19.6 + Math.random() * 0.4).toFixed(2)} <span class="metric-sub">/20</span>`;
        if (msptEl) msptEl.innerHTML = `${(42 + Math.random() * 5).toFixed(1)} <span class="metric-sub">ms</span>`;
        if (pingEl) pingEl.innerHTML = `${Math.floor(78 + Math.random() * 6)}<span class="metric-sub">ms</span>`;
    }, 2500);
});
