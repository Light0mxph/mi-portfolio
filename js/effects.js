(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const progress = document.getElementById("scroll-progress");
    let scrollTick = false;
    const updateProgress = () => {
        const distance = document.documentElement.scrollHeight - innerHeight;
        progress?.style.setProperty("transform", `scaleX(${distance > 0 ? scrollY / distance : 0})`);
        scrollTick = false;
    };
    addEventListener("scroll", () => {
        if (!scrollTick) { scrollTick = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    addEventListener("load", updateProgress);

    if (!reduced && finePointer) {
        let pointerTick = false;
        addEventListener("pointermove", event => {
            if (pointerTick) return;
            pointerTick = true;
            requestAnimationFrame(() => {
                const x = Math.round(event.clientX / innerWidth * 100);
                const y = Math.round(event.clientY / innerHeight * 100);
                document.querySelector(".page-glow")?.style.setProperty("background", `radial-gradient(52% 50% at ${x}% ${y}%, rgba(31,59,138,.25), rgba(0,0,0,0) 75%)`);
                pointerTick = false;
            });
        }, { passive: true });
    }
})();
