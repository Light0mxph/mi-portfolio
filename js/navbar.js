document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const openBtn = document.getElementById("mobile-menu-btn");
        const closeBtn = document.getElementById("close-menu-btn");
        const overlay = document.getElementById("mobile-overlay");
        
        if(openBtn && closeBtn && overlay) {
            openBtn.addEventListener("click", () => overlay.classList.add("active"));
            closeBtn.addEventListener("click", () => overlay.classList.remove("active"));
            document.querySelectorAll(".mob-link").forEach(link => {
                link.addEventListener("click", () => overlay.classList.remove("active"));
            });
        }
    }, 1000);
});
