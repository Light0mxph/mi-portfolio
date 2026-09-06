/* Apariciones finitas y animación ambiental según visibilidad. */
(() => {
    const state = window.Portfolio;
    const regions = document.querySelectorAll(".motion-region");
    const activeAnimations = new Set();

    if ("IntersectionObserver" in window) {
        const visibility = new IntersectionObserver(entries => {
            entries.forEach(entry => { entry.target.dataset.active = String(entry.isIntersecting); });
        }, { threshold: 0 });
        regions.forEach(region => visibility.observe(region));

        const reveal = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                if (state?.motionOff || state?.hidden || !entry.target.animate) return;
                const animation = entry.target.animate(
                    [{ opacity: .65, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }],
                    { duration: 650, easing: "cubic-bezier(.22,1,.36,1)" }
                );
                activeAnimations.add(animation);
                const forget = () => activeAnimations.delete(animation);
                animation.addEventListener("finish", forget, { once: true });
                animation.addEventListener("cancel", forget, { once: true });
            });
        }, { threshold: .06 });
        document.querySelectorAll("[data-reveal]").forEach(element => reveal.observe(element));
    }
    // Sin observer las regiones quedan estáticas, pero todo su contenido sigue visible.
    state?.subscribe(() => {
        if (!state.motionOff && !state.hidden) return;
        activeAnimations.forEach(animation => animation.cancel());
        activeAnimations.clear();
    });
})();
