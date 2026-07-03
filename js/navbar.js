/* Navbar: estado scroll, menú móvil, scroll-spy */
document.addEventListener("componentsLoaded", () => {
    const header = document.getElementById("main-header");
    const burger = document.getElementById("nav-burger");
    const overlay = document.getElementById("m-overlay");
    const close = document.getElementById("m-close");

    /* Header compacto al hacer scroll */
    if (header) {
        let ticking = false;
        const onScroll = () => {
            header.classList.toggle("scrolled", window.scrollY > 40);
            ticking = false;
        };
        window.addEventListener("scroll", () => {
            if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
        }, { passive: true });
        onScroll();
    }

    /* Menú móvil */
    if (burger && overlay) {
        const open = () => { overlay.classList.add("active"); document.body.style.overflow = "hidden"; };
        const shut = () => { overlay.classList.remove("active"); document.body.style.overflow = ""; };
        burger.addEventListener("click", open);
        close?.addEventListener("click", shut);
        overlay.addEventListener("click", e => { if (e.target === overlay) shut(); });
        document.addEventListener("keydown", e => { if (e.key === "Escape") shut(); });
        overlay.querySelectorAll("a").forEach(a => a.addEventListener("click", shut));
    }

    /* Scroll-spy: resalta el enlace de la sección visible */
    const sections = [...document.querySelectorAll("main section[id]")];
    const links = [...document.querySelectorAll(".nav-link, .dock a")];
    if (sections.length && links.length) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        sections.forEach(s => spy.observe(s));
    }
});
