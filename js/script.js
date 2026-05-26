document.addEventListener("DOMContentLoaded", () => {
    const loadComponent = async (id, url) => {
        const element = document.getElementById(id);
        if (!element) return;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            element.innerHTML = await response.text();
        } catch (error) {
            console.error(`Error cargando ${id}:`, error);
        }
    };

    const componentsToLoad = [
        { id: "main-header", url: "components/navbar.html" },
        { id: "hero", url: "sections/hero.html" },
        { id: "about", url: "sections/about.html" },
        { id: "services", url: "sections/services.html" },
        { id: "featured-project", url: "sections/featured-project.html" },
        { id: "stack", url: "sections/stack.html" },
        { id: "community", url: "sections/community.html" },
        { id: "main-footer", url: "components/footer.html" },
        { id: "mobile-menu-container", url: "components/mobile-menu.html" }
    ];

    Promise.all(componentsToLoad.map(comp => loadComponent(comp.id, comp.url)))
        .then(() => {
            // Disparar evento para que navbar.js y animations.js sepan que el HTML ya existe
            document.dispatchEvent(new Event('componentsLoaded'));
        });
});
