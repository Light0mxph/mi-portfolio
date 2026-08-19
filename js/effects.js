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
        if (!scrollTick) {
            scrollTick = true;
            requestAnimationFrame(updateProgress);
        }
    }, { passive: true });
    addEventListener("load", updateProgress);

    const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
    if (!reduced && finePointer) {
        let pointerTick = false;
        addEventListener("pointermove", event => {
            pointer.x = event.clientX;
            pointer.y = event.clientY;
            if (pointerTick) return;
            pointerTick = true;
            requestAnimationFrame(() => {
                const x = Math.round(pointer.x / innerWidth * 100);
                const y = Math.round(pointer.y / innerHeight * 100);
                document.querySelector(".page-glow")?.style.setProperty("background", `radial-gradient(52% 50% at ${x}% ${y}%, rgba(15,88,138,.24), rgba(0,0,0,0) 75%)`);
                pointerTick = false;
            });
        }, { passive: true });
    }

    const initNetwork = () => {
        const canvas = document.getElementById("hero-network");
        const hero = document.querySelector(".hero-section");
        if (!canvas || !hero) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const seeds = [
            [.05, .18], [.18, .10], [.32, .22], [.48, .11], [.64, .22], [.82, .10], [.95, .24],
            [.09, .48], [.24, .58], [.39, .42], [.58, .43], [.76, .57], [.92, .48],
            [.14, .82], [.31, .91], [.50, .78], [.68, .91], [.86, .81]
        ];
        const links = [
            [0, 1], [0, 7], [1, 2], [2, 3], [2, 8], [2, 9], [3, 4], [4, 5], [4, 10],
            [5, 6], [6, 12], [7, 8], [8, 9], [8, 13], [9, 10], [9, 15], [10, 11],
            [10, 15], [11, 12], [11, 16], [12, 17], [13, 14], [14, 15], [15, 16], [16, 17]
        ];

        let width = 0;
        let height = 0;
        let nodes = [];
        let frame = 0;
        let visible = true;

        const resize = () => {
            const bounds = hero.getBoundingClientRect();
            const ratio = Math.min(devicePixelRatio || 1, 2);
            width = Math.max(1, Math.round(bounds.width));
            height = Math.max(1, Math.round(bounds.height));
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            nodes = seeds.map(([x, y], index) => ({
                x: x * width,
                y: y * height,
                phase: index * .71,
                size: index % 5 === 0 ? 2.4 : 1.5
            }));
            draw(performance.now());
        };

        const draw = time => {
            context.clearRect(0, 0, width, height);
            const localPointerX = pointer.x;
            const localPointerY = pointer.y - Math.max(0, hero.getBoundingClientRect().top);
            const parallaxX = finePointer ? (localPointerX / Math.max(width, 1) - .5) * 9 : 0;
            const parallaxY = finePointer ? (localPointerY / Math.max(height, 1) - .5) * 7 : 0;

            context.lineWidth = 1;
            context.strokeStyle = "rgba(139,221,255,.035)";
            const grid = 58;
            const gridX = ((time * .004) + parallaxX) % grid;
            const gridY = ((time * .002) + parallaxY) % grid;
            for (let x = gridX; x < width; x += grid) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, height);
                context.stroke();
            }
            for (let y = gridY; y < height; y += grid) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(width, y);
                context.stroke();
            }

            const points = nodes.map(node => ({
                ...node,
                drawX: node.x + Math.sin(time * .00035 + node.phase) * 6 + parallaxX,
                drawY: node.y + Math.cos(time * .00028 + node.phase) * 5 + parallaxY
            }));

            links.forEach(([from, to], index) => {
                const start = points[from];
                const end = points[to];
                context.strokeStyle = index % 6 === 0 ? "rgba(214,183,120,.12)" : "rgba(83,194,239,.13)";
                context.beginPath();
                context.moveTo(start.drawX, start.drawY);
                context.lineTo(end.drawX, end.drawY);
                context.stroke();

                const travel = (time * .00009 + index * .113) % 1;
                const x = start.drawX + (end.drawX - start.drawX) * travel;
                const y = start.drawY + (end.drawY - start.drawY) * travel;
                const gold = index % 6 === 0;
                context.fillStyle = gold ? "rgba(214,183,120,.9)" : "rgba(53,213,255,.9)";
                context.shadowColor = gold ? "rgba(214,183,120,.7)" : "rgba(53,213,255,.8)";
                context.shadowBlur = 12;
                context.beginPath();
                context.arc(x, y, gold ? 1.8 : 1.5, 0, Math.PI * 2);
                context.fill();
                context.shadowBlur = 0;
            });

            points.forEach((node, index) => {
                const distance = Math.hypot(node.drawX - localPointerX, node.drawY - localPointerY);
                const active = finePointer && distance < 150;
                context.fillStyle = active ? "rgba(139,221,255,.9)" : "rgba(139,221,255,.4)";
                context.strokeStyle = index % 5 === 0 ? "rgba(214,183,120,.25)" : "rgba(83,194,239,.14)";
                context.beginPath();
                context.arc(node.drawX, node.drawY, node.size + (active ? 1.5 : 0), 0, Math.PI * 2);
                context.fill();
                context.beginPath();
                context.arc(node.drawX, node.drawY, 8 + node.size, 0, Math.PI * 2);
                context.stroke();
            });
        };

        const animate = time => {
            if (!visible || document.hidden) {
                frame = 0;
                return;
            }
            draw(time);
            frame = requestAnimationFrame(animate);
        };
        const resume = () => {
            if (!reduced && visible && !document.hidden && !frame) frame = requestAnimationFrame(animate);
            if (reduced) draw(0);
        };

        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (!visible && frame) {
                cancelAnimationFrame(frame);
                frame = 0;
            }
            resume();
        }, { threshold: 0 }).observe(hero);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden && frame) {
                cancelAnimationFrame(frame);
                frame = 0;
                return;
            }
            resume();
        });
        new ResizeObserver(resize).observe(hero);
        resize();
        resume();
    };

    const initInteractions = () => {
        const surfaces = document.querySelectorAll(".project-card, .service-row, .studio-panel, .stack-card");
        surfaces.forEach(surface => {
            surface.classList.add("interactive-surface");
            if (!finePointer || reduced) return;
            surface.addEventListener("pointermove", event => {
                const bounds = surface.getBoundingClientRect();
                surface.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
                surface.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
            }, { passive: true });
        });

        if (!finePointer || reduced) return;

        document.querySelectorAll(".demo-window, .tilt-surface").forEach(surface => {
            surface.addEventListener("pointermove", event => {
                const bounds = surface.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width - .5;
                const y = (event.clientY - bounds.top) / bounds.height - .5;
                surface.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
                surface.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
            }, { passive: true });
            surface.addEventListener("pointerleave", () => {
                const demo = surface.classList.contains("demo-window");
                surface.style.setProperty("--tilt-x", demo ? "2deg" : "0deg");
                surface.style.setProperty("--tilt-y", demo ? "-3deg" : "0deg");
            });
        });

        document.querySelectorAll(".button").forEach(button => {
            button.addEventListener("pointermove", event => {
                const bounds = button.getBoundingClientRect();
                const x = (event.clientX - bounds.left - bounds.width / 2) * .09;
                const y = (event.clientY - bounds.top - bounds.height / 2) * .12;
                button.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
                button.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
            }, { passive: true });
            button.addEventListener("pointerleave", () => {
                button.style.setProperty("--magnetic-x", "0px");
                button.style.setProperty("--magnetic-y", "0px");
            });
        });
    };

    document.addEventListener("componentsLoaded", () => {
        initNetwork();
        initInteractions();
        updateProgress();
    }, { once: true });
})();
