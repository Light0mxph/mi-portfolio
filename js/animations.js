/* Reveal on scroll + stagger + count-up numérico */
document.addEventListener("componentsLoaded", () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Count-up: "data-count" con formato tipo "+3", "20+", "1.2k" */
    const runCount = el => {
        if (el.dataset.counted) return;
        el.dataset.counted = "1";
        const raw = String(el.getAttribute("data-count") || el.textContent).trim();
        const m = raw.match(/^(\D*?)(\d+(?:\.\d+)?)(\D*)$/);
        if (!m) { el.textContent = raw; return; }
        const [, pre, numStr, suf] = m;
        const target = parseFloat(numStr);
        const decimals = (numStr.split(".")[1] || "").length;
        if (reduce) { el.textContent = pre + numStr + suf; return; }
        const dur = 1100, t0 = performance.now();
        const tick = now => {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = pre + (target * eased).toFixed(decimals) + suf;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    /* Marcar elementos revelables (excluir los que ya viven en un stagger) */
    const targets = [...document.querySelectorAll(
        "main .glass, main .section-head, main .feat, main .svc, main .tech, main .pillar, main .stat, [data-reveal]"
    )].filter(el => !el.closest("[data-stagger]"));
    targets.forEach(el => el.classList.add("reveal"));
    document.querySelectorAll("[data-stagger]").forEach(el => el.classList.add("stagger"));

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add("in");
            el.querySelectorAll?.("[data-count]").forEach(runCount);
            if (el.hasAttribute?.("data-count")) runCount(el);
            obs.unobserve(el);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    targets.forEach(el => io.observe(el));
    document.querySelectorAll("[data-stagger]").forEach(el => io.observe(el));
    // Contadores fuera de un contenedor revelable (p.ej. hero, visible al cargar)
    document.querySelectorAll(".stat[data-count], [data-count]").forEach(el => io.observe(el));
});
