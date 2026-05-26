document.addEventListener("componentsLoaded", () => {
    const counterEl = document.getElementById("live-visits");
    if (!counterEl) return;
    let baseVisits = 12458;
    setInterval(() => {
        if (Math.random() > 0.4) {
            baseVisits += Math.floor(Math.random() * 4) + 1;
            counterEl.textContent = baseVisits.toLocaleString();
        }
    }, 3500);
});
