/* ============================================================
   Efectos visuales: canvas de hilos, spotlight, magnético,
   tilt, scroll-progress. Todo con guardas de rendimiento.
   ============================================================ */
(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ---------- Canvas: hilos ondulantes con pulsos ---------- */
    const initThreads = () => {
        const canvas = document.getElementById("fx-threads");
        if (!canvas || reduce) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let W = 0, H = 0, dpr = 1, strands = [], raf = 0, t = 0;
        const pointer = { x: -1, y: -1 };

        const build = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = canvas.clientWidth; H = canvas.clientHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = W < 640 ? 6 : W < 1024 ? 9 : 13;
            strands = Array.from({ length: count }, (_, i) => ({
                x: (W / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 30,
                amp: 12 + Math.random() * 26,
                freq: 0.004 + Math.random() * 0.004,
                speed: 0.4 + Math.random() * 0.7,
                phase: Math.random() * Math.PI * 2,
                hue: Math.random() > 0.7 ? 190 : 275,
                pulse: Math.random(),
                pSpeed: 0.0016 + Math.random() * 0.0022
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            t += 1;
            for (const s of strands) {
                const pull = pointer.x >= 0 ? Math.max(0, 1 - Math.abs(pointer.x - s.x) / 240) * 26 : 0;
                ctx.beginPath();
                let px = 0, py = 0;
                for (let y = -10; y <= H + 10; y += 14) {
                    const x = s.x + Math.sin(y * s.freq + t * 0.01 * s.speed + s.phase) * (s.amp + pull);
                    if (y === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    if (Math.abs((y / H) - s.pulse) < 0.02) { px = x; py = y; }
                }
                ctx.strokeStyle = `hsla(${s.hue}, 85%, 65%, 0.10)`;
                ctx.lineWidth = 1;
                ctx.stroke();

                // pulso viajero
                s.pulse += s.pSpeed;
                if (s.pulse > 1.05) s.pulse = -0.05;
                if (py) {
                    const g = ctx.createRadialGradient(px, py, 0, px, py, 22);
                    g.addColorStop(0, `hsla(${s.hue}, 90%, 72%, 0.55)`);
                    g.addColorStop(1, `hsla(${s.hue}, 90%, 72%, 0)`);
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.arc(px, py, 22, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            raf = requestAnimationFrame(draw);
        };

        const start = () => { if (!raf) raf = requestAnimationFrame(draw); };
        const stop = () => { cancelAnimationFrame(raf); raf = 0; };

        let rt;
        window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 200); });
        document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
        if (fine) window.addEventListener("pointermove", e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });

        build();
        start();
    };

    /* ---------- Scroll progress ---------- */
    const initProgress = () => {
        const bar = document.getElementById("scroll-progress");
        if (!bar) return;
        let ticking = false;
        const update = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const p = h > 0 ? window.scrollY / h : 0;
            bar.style.transform = `scaleX(${p})`;
            ticking = false;
        };
        window.addEventListener("scroll", () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        update();
    };

    /* ---------- Spotlight en cards (delegado) ---------- */
    const initSpotlight = () => {
        if (!fine) return;
        document.addEventListener("pointermove", e => {
            const card = e.target.closest(".spot");
            if (!card) return;
            const r = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${e.clientX - r.left}px`);
            card.style.setProperty("--my", `${e.clientY - r.top}px`);
        }, { passive: true });
    };

    /* ---------- Botones magnéticos ---------- */
    const initMagnetic = () => {
        if (!fine) return;
        document.querySelectorAll("[data-magnetic]").forEach(el => {
            el.addEventListener("pointermove", e => {
                const r = el.getBoundingClientRect();
                const mx = e.clientX - r.left - r.width / 2;
                const my = e.clientY - r.top - r.height / 2;
                el.style.transform = `translate(${mx * 0.18}px, ${my * 0.28}px)`;
            });
            el.addEventListener("pointerleave", () => { el.style.transform = ""; });
        });
    };

    document.addEventListener("componentsLoaded", () => {
        initSpotlight();
        initMagnetic();
        initProgress();
    });
    // El canvas es estático en index.html: iniciar cuanto antes
    if (document.readyState !== "loading") initThreads();
    else document.addEventListener("DOMContentLoaded", initThreads);
})();
