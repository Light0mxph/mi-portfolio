document.addEventListener("DOMContentLoaded", async () => {
    const version = "10";
    const parts = [
        ["main-header", "components/navbar.html"],
        ["inicio", "sections/hero.html"],
        ["trabajo", "sections/featured-project.html"],
        ["servicios", "sections/services.html"],
        ["perfil", "sections/about.html"],
        ["tecnologia", "sections/stack.html"],
        ["contacto", "sections/community.html"],
        ["main-footer", "components/footer.html"]
    ];

    const load = async ([id, path]) => {
        const target = document.getElementById(id);
        if (!target) return;
        try {
            const response = await fetch(`${path}?v=${version}`);
            if (!response.ok) throw new Error(`Error ${response.status}`);
            target.innerHTML = await response.text();
        } catch (error) {
            console.error(`No se pudo cargar ${path}:`, error);
            target.innerHTML = `<p class="load-error">No fue posible cargar esta sección. Actualiza la página para intentarlo de nuevo.</p>`;
        }
    };

    await Promise.all(parts.map(load));

    try {
        const response = await fetch(`data/site.json?v=${version}`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        document.querySelectorAll("[data-count]").forEach(element => {
            const key = element.dataset.countKey;
            if (key && data[key]) element.dataset.count = data[key];
        });
    } catch (error) {
        console.warn("Se utilizarán las cifras incluidas en la página.");
    }

    document.body.classList.add("ready");
    document.dispatchEvent(new CustomEvent("componentsLoaded"));
});
