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
