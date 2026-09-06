/* Preferencias compartidas. La página ya contiene todo su HTML. */
(() => {
    const root = document.documentElement;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection;
    const button = document.querySelector(".motion-toggle");
    const subscribers = new Set();
    let userPaused = false;
    try { userPaused = localStorage.getItem("aztrix-motion") === "paused"; } catch { /* Almacenamiento opcional. */ }

    const state = {
        get motionOff() { return media.matches || Boolean(connection?.saveData) || userPaused; },
        get hidden() { return document.hidden; },
        subscribe(callback) { subscribers.add(callback); return () => subscribers.delete(callback); }
    };
    window.Portfolio = Object.freeze(state);

    const update = () => {
        root.dataset.motion = state.motionOff ? "off" : "on";
        root.dataset.pageHidden = String(state.hidden);
        if (button) {
            const forced = media.matches || Boolean(connection?.saveData);
            const label = forced ? "Movimiento reducido activado por tus preferencias" : (userPaused ? "Activar animaciones" : "Pausar animaciones");
            button.hidden = false;
            button.disabled = forced;
            button.setAttribute("aria-pressed", String(state.motionOff));
            button.setAttribute("aria-label", label);
            button.title = label;
        }
        subscribers.forEach(callback => callback());
    };
    button?.addEventListener("click", () => {
        userPaused = !userPaused;
        try { localStorage.setItem("aztrix-motion", userPaused ? "paused" : "on"); } catch { /* No afecta a la navegación. */ }
        update();
    });
    media.addEventListener("change", update);
    connection?.addEventListener?.("change", update);
    document.addEventListener("visibilitychange", update);
    update();
})();

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

/* Interacciones locales: sin canvas, librerías ni bucles permanentes en JS. */
(() => {
    const state = window.Portfolio;
    const bench = document.querySelector(".system-workbench");
    const description = document.getElementById("system-description");
    const tabs = [...document.querySelectorAll("[data-system]")];
    const runButton = document.querySelector(".run-flow");
    const descriptions = {
        api: "Una entrada clara. Validación, contratos y respuestas que tienen sentido.",
        tasks: "Cada tarea, en su contexto. Trabajo asíncrono y coordinación entre módulos.",
        data: "Datos donde los necesitas. Caché para el acceso frecuente y persistencia para conservarlos."
    };
    let currentMode = "api";
    let flowTimer = 0;
    let running = false;
    const setRunLabel = text => { if (runButton?.firstChild) runButton.firstChild.textContent = text + " "; };
    const selectMode = (mode, text = descriptions[mode]) => {
        if (!bench || !descriptions[mode]) return;
        currentMode = mode;
        bench.dataset.systemMode = mode;
        tabs.forEach(tab => {
            const selected = tab.dataset.system === mode;
            tab.setAttribute("aria-pressed", String(selected));
            tab.classList.toggle("is-selected", selected);
        });
        if (description) description.textContent = text;
    };
    const stopFlow = () => {
        clearTimeout(flowTimer);
        flowTimer = 0;
        running = false;
        bench?.classList.remove("is-running");
        if (runButton) runButton.disabled = false;
        setRunLabel("Ejecutar flujo");
    };

    if (bench && description && runButton && tabs.length) {
        bench.querySelector(".system-controls").hidden = false;
        runButton.hidden = false;
        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => { stopFlow(); selectMode(tab.dataset.system); });
            tab.addEventListener("keydown", event => {
                let next = index;
                if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
                else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = tabs.length - 1;
                else return;
                event.preventDefault();
                tabs[next].focus();
                tabs[next].click();
            });
        });
        runButton.addEventListener("click", () => {
            stopFlow();
            if (state?.motionOff) {
                selectMode("data", "Flujo ilustrativo: la API valida, el núcleo coordina las tareas y la capa de datos conserva el resultado.");
                return;
            }
            const steps = [
                ["api", "01 / La API recibe la solicitud y valida sus datos."],
                ["tasks", "02 / El núcleo coordina la tarea y delega el trabajo a su módulo."],
                ["data", "03 / La capa de datos conserva el resultado y completa el recorrido."]
            ];
            running = true;
            runButton.disabled = true;
            setRunLabel("Flujo en curso");
            bench.classList.add("is-running");
            let step = 0;
            const advance = () => {
                if (state?.hidden || state?.motionOff) { stopFlow(); selectMode(currentMode); return; }
                if (step >= steps.length) {
                    stopFlow();
                    selectMode("data", "Recorrido completo: entrada validada, trabajo coordinado y resultado persistido. Modelo ilustrativo.");
                    return;
                }
                const [mode, text] = steps[step++];
                selectMode(mode, text);
                flowTimer = setTimeout(advance, 1350);
            };
            advance();
        });
        state?.subscribe(() => {
            if (running && (state.hidden || state.motionOff)) { stopFlow(); selectMode(currentMode); }
        });
        if ("IntersectionObserver" in window) {
            new IntersectionObserver(entries => {
                if (!entries[0].isIntersecting && running) { stopFlow(); selectMode(currentMode); }
            }, { threshold: 0 }).observe(bench);
        }
    }

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    document.querySelectorAll("[data-tilt]").forEach(surface => {
        let bounds = null;
        let initialScroll = 0;
        let frame = 0;
        let clientX = 0;
        let clientY = 0;
        const reset = () => {
            cancelAnimationFrame(frame);
            frame = 0;
            bounds = null;
            ["--tilt-x", "--tilt-y", "--light-x", "--light-y"].forEach(property => surface.style.removeProperty(property));
        };
        const paint = () => {
            frame = 0;
            if (!bounds || state?.motionOff || state?.hidden || !finePointer.matches) return;
            const top = bounds.top - (scrollY - initialScroll);
            const x = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
            const y = Math.max(0, Math.min(1, (clientY - top) / bounds.height));
            surface.style.setProperty("--tilt-x", ((.5 - y) * 4).toFixed(2) + "deg");
            surface.style.setProperty("--tilt-y", ((x - .5) * 4).toFixed(2) + "deg");
            surface.style.setProperty("--light-x", (x * 100).toFixed(1) + "%");
            surface.style.setProperty("--light-y", (y * 100).toFixed(1) + "%");
        };
        surface.addEventListener("pointermove", event => {
            if (event.pointerType !== "mouse" || state?.motionOff || !finePointer.matches) return;
            if (!bounds) { bounds = surface.getBoundingClientRect(); initialScroll = scrollY; }
            clientX = event.clientX;
            clientY = event.clientY;
            if (!frame) frame = requestAnimationFrame(paint);
        }, { passive: true });
        surface.addEventListener("pointerleave", reset);
        surface.addEventListener("pointercancel", reset);
        window.addEventListener("resize", reset, { passive: true });
        finePointer.addEventListener("change", reset);
        state?.subscribe(() => { if (state.motionOff || state.hidden) reset(); });
    });
})();

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
