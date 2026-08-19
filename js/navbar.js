document.addEventListener("componentsLoaded", () => {
    const header = document.getElementById("main-header");
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.getElementById("mobile-menu");
    const links = [...document.querySelectorAll(".nav-link, .mobile-menu a")];
    const sections = [...document.querySelectorAll("main section[id]")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanPath = `${window.location.pathname}${window.location.search}`;

    const closeMenu = () => {
        if (!toggle || !menu) return;
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("open");
        document.body.classList.remove("menu-open");
    };

    const cleanAddress = () => {
        if (window.location.hash) window.history.replaceState(window.history.state, "", cleanPath);
    };

    const scrollToSection = (id, behavior = "smooth") => {
        const target = document.getElementById(id);
        if (!target) return null;
        target.scrollIntoView({
            behavior: reducedMotion ? "auto" : behavior,
            block: "start"
        });
        cleanAddress();
        return target;
    };

    document.addEventListener("click", event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest("a[data-scroll-to]");
        if (!link) return;
        const target = document.getElementById(link.dataset.scrollTo);
        if (!target) return;

        event.preventDefault();
        closeMenu();
        scrollToSection(link.dataset.scrollTo);

        if (link.classList.contains("skip-link")) {
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
        }
    });

    toggle?.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(open));
        menu?.classList.toggle("open", open);
        document.body.classList.toggle("menu-open", open);
    });
    menu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => { if (window.innerWidth > 800) closeMenu(); });

    let ticking = false;
    const onScroll = () => {
        header?.classList.toggle("scrolled", window.scrollY > 24);
        ticking = false;
    };
    window.addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    const activate = id => links.forEach(link => link.classList.toggle("active", link.dataset.scrollTo === id));
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) activate(entry.target.id); });
    }, { rootMargin: "-42% 0px -52%", threshold: 0 });
    sections.forEach(section => observer.observe(section));

    const requestedSection = window.location.hash.slice(1);
    if (requestedSection) {
        requestAnimationFrame(() => {
            scrollToSection(requestedSection, "auto");
            cleanAddress();
        });
    }
});
