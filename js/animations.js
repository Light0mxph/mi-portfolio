document.addEventListener("componentsLoaded", () => {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-panel, .section-header, .hero-content > *').forEach((el) => {
        el.classList.add('reveal');
        observer.observe(el);
    });
});
