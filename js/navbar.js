document.addEventListener("componentsLoaded", () => {
    const openBtn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("close-menu-btn");
    const overlay = document.getElementById("mobile-overlay");
    const header = document.getElementById("main-header");
    
    if(openBtn && closeBtn && overlay) {
        openBtn.addEventListener("click", () => {
            overlay.classList.add("active");
            document.body.style.overflow = "hidden";
        });
        const closeMenu = () => {
            overlay.classList.remove("active");
            document.body.style.overflow = "auto";
        };
        closeBtn.addEventListener("click", closeMenu);
        document.querySelectorAll(".mob-link").forEach(link => link.addEventListener("click", closeMenu));
    }

    if (header) {
        window.addEventListener("scroll", () => {
            header.classList.toggle("scrolled", window.scrollY > 50);
        });
    }
});
