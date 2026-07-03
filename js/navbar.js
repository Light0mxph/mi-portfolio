/* Navbar: estado scroll + scroll-spy (desktop pills y dock móvil) */
document.addEventListener("componentsLoaded", () => {
    const header = document.getElementById("main-header");

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

    /* Scroll-spy: resalta el enlace de la sección visible */
    const sections = [...document.querySelectorAll("main section[id]")];
    const links = [...document.querySelectorAll(".nav-link, .dock a")];
    if (!sections.length || !links.length) return;

    const setActive = id => {
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
    };

    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));

    /* Al llegar al fondo, la última sección siempre queda activa
       (secciones cortas al final nunca cruzan la franja del observer) */
    let bottomTick = false;
    window.addEventListener("scroll", () => {
        if (bottomTick) return;
        bottomTick = true;
        requestAnimationFrame(() => {
            const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            if (atBottom) setActive(sections[sections.length - 1].id);
            bottomTick = false;
        });
    }, { passive: true });
});
