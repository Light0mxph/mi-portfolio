/* Carga modular de secciones/componentes + preloader */
document.addEventListener("DOMContentLoaded", () => {
    const VER = "6"; // cache-busting: subir en cada deploy que toque secciones/CSS/JS
    const loadComponent = async (id, url) => {
        const el = document.getElementById(id);
        if (!el) return;
        try {
            const res = await fetch(`${url}?v=${VER}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            el.innerHTML = await res.text();
        } catch (err) {
            console.error(`Error cargando ${id}:`, err);
        }
    };

    const components = [
        { id: "main-header", url: "components/navbar.html" },
        { id: "hero", url: "sections/hero.html" },
        { id: "about", url: "sections/about.html" },
        { id: "services", url: "sections/services.html" },
        { id: "featured-project", url: "sections/featured-project.html" },
        { id: "stack", url: "sections/stack.html" },
        { id: "community", url: "sections/community.html" },
        { id: "main-footer", url: "components/footer.html" }
    ];

    const hidePreloader = () => document.body.classList.add("loaded");
    // Red de seguridad: nunca dejar la pantalla de carga atascada
    const safety = setTimeout(hidePreloader, 4000);

    const applySiteData = data => {
        document.querySelectorAll("[data-count]").forEach(el => {
            const key = el.getAttribute("data-count-key");
            if (key && data && data[key]) el.setAttribute("data-count", data[key]);
        });
    };

    Promise.all(components.map(c => loadComponent(c.id, c.url)))
        .then(() => fetch(`data/site.json?v=${VER}`).then(r => r.json()).catch(() => ({})))
        .then(data => {
            applySiteData(data);
            document.dispatchEvent(new Event("componentsLoaded"));
            clearTimeout(safety);
            requestAnimationFrame(hidePreloader);
        });
});
