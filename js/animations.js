document.addEventListener("componentsLoaded", () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = [
        ...document.querySelectorAll(".section-intro, .project-card, .service-row, .about-photo-wrap, .about-copy, .studio-panel, .stack-card, .principles, .contact-shell")
    ];

    targets.forEach((target, index) => {
        target.classList.add("reveal");
        if (target.matches(".service-row, .stack-card")) target.dataset.delay = String(index % 3);
    });

    const count = element => {
        if (element.dataset.counted) return;
        element.dataset.counted = "true";
        const raw = element.dataset.count || element.textContent.trim();
        const match = raw.match(/^(\D*)(\d+)(\D*)$/);
        if (!match || reduced) { element.textContent = raw; return; }
        const [, before, number, after] = match;
        const target = Number(number);
        const start = performance.now();
        const frame = now => {
            const progress = Math.min((now - start) / 900, 1);
            element.textContent = `${before}${Math.round(target * (1 - Math.pow(1 - progress, 3)))}${after}`;
            if (progress < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    };

    if (reduced) {
        targets.forEach(target => target.classList.add("in"));
        document.querySelectorAll("[data-count]").forEach(count);
        return;
    }

    const observer = new IntersectionObserver((entries, current) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            entry.target.querySelectorAll?.("[data-count]").forEach(count);
            current.unobserve(entry.target);
        });
    }, { threshold: .1, rootMargin: "0px 0px -7%" });
    targets.forEach(target => observer.observe(target));
});
