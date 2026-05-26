function initScrollAnimations() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.glass-panel, .section-header').forEach((el) => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}
document.addEventListener("DOMContentLoaded", () => setTimeout(initScrollAnimations, 800));
