/* Preferencias compartidas. La página ya contiene todo su HTML. */
(() => {
    const root = document.documentElement;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection;
    const button = document.querySelector(".motion-toggle");
    const subscribers = new Set();
    let userPaused = false;
    try { userPaused = localStorage.getItem("aztrix-motion") === "paused"; } catch { /* Almacenamiento opcional. */ }

    const state = {
        get motionOff() { return media.matches || Boolean(connection?.saveData) || userPaused; },
        get hidden() { return document.hidden; },
        subscribe(callback) { subscribers.add(callback); return () => subscribers.delete(callback); }
    };
    window.Portfolio = Object.freeze(state);

    const update = () => {
        root.dataset.motion = state.motionOff ? "off" : "on";
        root.dataset.pageHidden = String(state.hidden);
        if (button) {
            const forced = media.matches || Boolean(connection?.saveData);
            const label = forced ? "Movimiento reducido activado por tus preferencias" : (userPaused ? "Activar animaciones" : "Pausar animaciones");
            button.hidden = false;
            button.disabled = forced;
            button.setAttribute("aria-pressed", String(state.motionOff));
            button.setAttribute("aria-label", label);
            button.title = label;
        }
        subscribers.forEach(callback => callback());
    };
    button?.addEventListener("click", () => {
        userPaused = !userPaused;
        try { localStorage.setItem("aztrix-motion", userPaused ? "paused" : "on"); } catch { /* No afecta a la navegación. */ }
        update();
    });
    media.addEventListener("change", update);
    connection?.addEventListener?.("change", update);
    document.addEventListener("visibilitychange", update);
    update();
})();
