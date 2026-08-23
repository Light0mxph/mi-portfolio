(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanPath = `${window.location.pathname}${window.location.search}`;
    const links = [...document.querySelectorAll(".legal-index a[data-scroll-to]")];
    const terms = [...document.querySelectorAll(".legal-term[id]")];

    const cleanAddress = () => {
        if (window.location.hash) window.history.replaceState(window.history.state, "", cleanPath);
    };

    const scrollToTarget = (id, behavior = "smooth") => {
        const target = document.getElementById(id);
        if (!target) return null;
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : behavior, block: "start" });
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
        scrollToTarget(link.dataset.scrollTo);

        if (link.classList.contains("skip-link")) {
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
        }
    });

    const activate = id => {
        links.forEach(link => {
            const active = link.dataset.scrollTo === id;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
    };

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) activate(entry.target.id);
            });
        }, { rootMargin: "-18% 0px -68%", threshold: 0 });
        terms.forEach(term => observer.observe(term));
    }

    const requestedTarget = window.location.hash.slice(1);
    if (requestedTarget) {
        requestAnimationFrame(() => {
            scrollToTarget(requestedTarget, "auto");
            cleanAddress();
        });
    }
})();
