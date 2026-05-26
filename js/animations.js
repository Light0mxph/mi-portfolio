document.addEventListener("componentsLoaded", () => {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Excluimos las cards del dashboard usando :not(.dash-card):not(.dash-mini-card)
    document.querySelectorAll('.glass-panel:not(.dash-card):not(.dash-mini-card), .section-header').forEach((el) => {
        el.classList.add('reveal');
        observer.observe(el);
    });
});
