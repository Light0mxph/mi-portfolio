document.addEventListener("DOMContentLoaded", () => {
    const counterEl = document.getElementById("live-visits");
    if (!counterEl) return;
    let baseVisits = 12458;
    setInterval(() => {
        if (Math.random() > 0.6) {
            baseVisits += Math.floor(Math.random() * 3) + 1;
            counterEl.textContent = baseVisits.toLocaleString();
        }
    }, 4500);
});
