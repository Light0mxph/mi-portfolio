document.addEventListener("componentsLoaded", () => {
    const header = document.getElementById("main-header");
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.getElementById("mobile-menu");
    const links = [...document.querySelectorAll(".nav-link, .mobile-menu a")];
    const sections = [...document.querySelectorAll("main section[id]")];

    const closeMenu = () => {
        if (!toggle || !menu) return;
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("open");
        document.body.classList.remove("menu-open");
    };

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

    const activate = id => links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${id}`));
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) activate(entry.target.id); });
    }, { rootMargin: "-42% 0px -52%", threshold: 0 });
    sections.forEach(section => observer.observe(section));
});
