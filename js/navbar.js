/* Navegación progresiva: enlaces reales como respaldo y URL limpia con JS. */
(() => {
    const state = window.Portfolio;
    const header = document.getElementById("main-header");
    const progress = document.getElementById("scroll-progress");
    const disclosure = document.querySelector(".menu-disclosure");
    const summary = disclosure?.querySelector("summary");
    const breakpoint = matchMedia("(max-width: 900px)");
    const navLinks = [...document.querySelectorAll(".nav-link, .mobile-menu a[data-scroll-to]")];
    const sections = [...document.querySelectorAll("main > section[id]")];

    const closeMenu = (restoreFocus = false) => {
        if (!disclosure?.open) return;
        disclosure.open = false;
        document.body.classList.remove("menu-open");
        if (restoreFocus) summary?.focus();
    };
    const cleanAddress = () => {
        if (!location.hash) return;
        try { history.replaceState(history.state, "", location.pathname + location.search); } catch { /* file:// conserva sus enlaces nativos. */ }
    };
    const scrollToTarget = (id, behavior = "smooth", focus = false) => {
        const target = document.getElementById(id);
        if (!target) return false;
        target.scrollIntoView({ behavior: state?.motionOff ? "auto" : behavior, block: "start" });
        if (focus) {
            const temporaryTabindex = !target.hasAttribute("tabindex");
            if (temporaryTabindex) target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
            if (temporaryTabindex) target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
        }
        cleanAddress();
        return true;
    };

    document.addEventListener("click", event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest("a[data-scroll-to]");
        if (!link || !document.getElementById(link.dataset.scrollTo)) return;
        event.preventDefault();
        closeMenu();
        scrollToTarget(link.dataset.scrollTo, "smooth", true);
    });
    disclosure?.addEventListener("toggle", () => document.body.classList.toggle("menu-open", disclosure.open));
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && disclosure?.open) { closeMenu(true); event.preventDefault(); }
    });
    document.addEventListener("pointerdown", event => {
        if (disclosure?.open && !disclosure.contains(event.target)) closeMenu();
    });
    disclosure?.addEventListener("focusout", event => {
        if (disclosure.open && !disclosure.contains(event.relatedTarget)) closeMenu();
    });
    breakpoint.addEventListener("change", () => { if (!breakpoint.matches) closeMenu(); });
    window.addEventListener("pageshow", () => closeMenu());

    let distance = 0;
    let frame = 0;
    const paintScroll = () => {
        frame = 0;
        header?.classList.toggle("scrolled", scrollY > 20);
        const fraction = distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
        if (progress) progress.style.transform = "scaleX(" + fraction + ")";
    };
    const scheduleScroll = () => { if (!frame) frame = requestAnimationFrame(paintScroll); };
    const measurePage = () => {
        distance = Math.max(0, document.documentElement.scrollHeight - innerHeight);
        scheduleScroll();
    };
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", measurePage, { passive: true });
    window.addEventListener("load", measurePage, { once: true });
    if ("ResizeObserver" in window) new ResizeObserver(measurePage).observe(document.body);
    measurePage();

    const activate = id => navLinks.forEach(link => {
        const active = link.dataset.scrollTo === id;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
    });
    if ("IntersectionObserver" in window) {
        const visible = new Set();
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); });
            const current = sections.find(section => visible.has(section));
            if (current) activate(current.id);
        }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
        sections.forEach(section => observer.observe(section));
    }

    const openHash = () => {
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        if (!id) return;
        if (document.getElementById(id)) {
            closeMenu();
            scrollToTarget(id, "auto");
        }
    };
    window.addEventListener("hashchange", openHash);
    if (location.hash) requestAnimationFrame(openHash);
})();
