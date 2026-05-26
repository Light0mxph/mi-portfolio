document.addEventListener("componentsLoaded", () => {
    const counterEl = document.getElementById("live-visits");
    const trendEl = document.querySelector(".visit-trend");
    if (!counterEl) return;
    
    let baseVisits = 12458;
    setInterval(() => {
        if (Math.random() > 0.5) {
            baseVisits += Math.floor(Math.random() * 3) + 1;
            counterEl.textContent = baseVisits.toLocaleString();
            // Variar el porcentaje sutilmente para dar realismo
            const newTrend = (12.5 + (Math.random() - 0.5)).toFixed(1);
            trendEl.innerHTML = `+${newTrend}% <span class="trend-sub">este mes</span>`;
        }
    }, 3000);
});
