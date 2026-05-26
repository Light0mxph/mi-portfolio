document.addEventListener("DOMContentLoaded", () => {
    // Función para inyectar HTML asíncronamente
    const loadComponent = async (id, url) => {
        const element = document.getElementById(id);
        if (!element) return;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const html = await response.text();
            element.innerHTML = html;
        } catch (error) {
            console.error(`Error cargando el componente ${id}:`, error);
        }
    };

    // Array con todos los componentes en orden
    const componentsToLoad = [
        { id: "main-header", url: "components/navbar.html" },
        { id: "hero", url: "sections/hero.html" },
        { id: "featured-project", url: "sections/featured-project.html" },
        { id: "stack", url: "sections/stack.html" },
        { id: "community", url: "sections/community.html" },
        { id: "main-footer", url: "components/footer.html" }
    ];

    // Cargar todos y luego inicializar eventos
    Promise.all(componentsToLoad.map(comp => loadComponent(comp.id, comp.url)))
        .then(() => {
            initNavbarScroll();
        });
});

// Cambiar el estilo del Navbar al hacer scroll
function initNavbarScroll() {
    const header = document.getElementById("main-header");
    if (!header) return; // Evitar errores si el header no cargó
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}
