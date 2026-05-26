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

    // Cargar componentes base
    Promise.all([
        loadComponent("main-header", "components/navbar.html"),
        loadComponent("hero", "sections/hero.html")
        loadComponent("featured-project", "sections/featured-project.html"),
        loadComponent("stack", "sections/stack.html"),
        loadComponent("community", "sections/community.html"),
        loadComponent("main-footer", "components/footer.html")
    ]).then(() => {
        // Inicializar eventos visuales una vez que el DOM esté listo
        initNavbarScroll();
    });
});

// Cambiar el estilo del Navbar al hacer scroll
function initNavbarScroll() {
    const header = document.getElementById("main-header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}
