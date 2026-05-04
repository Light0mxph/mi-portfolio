/* ══════════════════════════════════════════════════════════
   DiegoCpsx7z Portfolio — script.js
   Minimal, clean JS for essential UX
══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Mobile menu ─────────────────────────────────────── */
  const burger     = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  function closeMenu() {
    mobileMenu.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("menu-open");
  }

  burger?.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    burger.classList.toggle("open", isOpen);
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    burger.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("menu-open", isOpen);
  });

  mobileMenu?.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", closeMenu)
  );

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });

  /* ── Scroll progress bar ─────────────────────────────── */
  const progressBar = document.getElementById("scrollProgress");

  function updateProgress() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = percentage + "%";
  }

  /* ── Sticky header shadow ────────────────────────────── */
  const header = document.getElementById("siteHeader");

  function onScroll() {
    updateProgress();
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 40);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Reveal on scroll ────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) =>
    revealObserver.observe(el)
  );

  /* ── Skill bar animation ─────────────────────────────── */
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("bar-animated");
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll(".skill-card").forEach((card) =>
    barObserver.observe(card)
  );

  /* ── Count-up animation ──────────────────────────────── */
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = Number(el.dataset.target);
        if (!target) return;

        let start    = null;
        const dur    = 1100;

        function tick(ts) {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / dur, 1);
          const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          el.textContent = Math.floor(eased * target) + (progress >= 1 ? "+" : "");
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    },
    { threshold: 0.7 }
  );

  document
    .querySelectorAll("[data-target]")
    .forEach((el) => countObserver.observe(el));

  /* ── Active nav link on scroll ───────────────────────── */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".desktop-nav a[data-section]");

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("data-section") === id
          );
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );

  sections.forEach((section) => activeObserver.observe(section));

})();
