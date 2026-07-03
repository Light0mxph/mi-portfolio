document.addEventListener("componentsLoaded", () => {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Solo contenido de main: navbar, bottom-nav y menú móvil son fijos y
    // su transform se rompería con el translateY del reveal
    document.querySelectorAll('main .glass-panel, main .section-header, main .featured-project-container').forEach((el) => {
        el.classList.add('reveal');
        observer.observe(el);
    });
});
