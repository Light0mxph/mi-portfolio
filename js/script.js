document.addEventListener("DOMContentLoaded", () => {
    // Motor de inyección
    const loadComponent = async (id, url) => {
        const element = document.getElementById(id);
        if (!element) {
            // Si el contenedor no existe en index.html, lo creamos dinámicamente
            const newSection = document.createElement('section');
            newSection.id = id;
            newSection.className = id + "-section";
            // Insertamos antes del footer
            const footer = document.getElementById("main-footer");
            document.body.insertBefore(newSection, footer);
        }
        
        try {
            const targetElement = document.getElementById(id);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const html = await response.text();
            targetElement.innerHTML = html;
        } catch (error) {
            console.error(`Error cargando ${id}:`, error);
        }
    };

    // Orden maestro de componentes
    const componentsToLoad = [
        { id: "main-header", url: "components/navbar.html" },
        { id: "hero", url: "sections/hero.html" },
        { id: "about", url: "sections/about.html" },
        { id: "services", url: "sections/services.html" },
        { id: "featured-project", url: "sections/featured-project.html" },
        { id: "projects", url: "sections/projects.html" },
        { id: "stack", url: "sections/stack.html" },
        { id: "community", url: "sections/community.html" },
        { id: "main-footer", url: "components/footer.html" }
    ];

    // Cargar todo y arrancar eventos
    Promise.all(componentsToLoad.map(comp => loadComponent(comp.id, comp.url)))
        .then(() => {
            initNavbarScroll();
            // Evitar que los enlaces rotos (#) salten hacia arriba
            document.querySelectorAll('a[href="#"]').forEach(a => {
                a.addEventListener('click', e => e.preventDefault());
            });
        });
});

function initNavbarScroll() {
    const header = document.getElementById("main-header");
    if (!header) return;
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}
