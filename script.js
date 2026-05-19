/* ══════════════════════════════════════════
   DIEGOCPSX7Z — PORTFOLIO · script.js
   ══════════════════════════════════════════ */

'use strict';

/* ── Cursor ── */
const cursor = document.getElementById('cursor');
if (cursor && window.matchMedia('(pointer:fine)').matches) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  }, { passive: true });

  const hoverEls = document.querySelectorAll(
    'a, button, .skp, .scard, .srv-card, .ccard, .lb-seg, .tag-row span'
  );
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

/* ── Nav scroll ── */
const nav = document.getElementById('nav');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 50);
  lastY = y;
}, { passive: true });

/* ── Hamburger ── */
const ham  = document.getElementById('hamburger');
const mob  = document.getElementById('mobileOverlay');

ham.addEventListener('click', () => {
  const open = ham.classList.toggle('open');
  mob.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

function closeMenu() {
  ham.classList.remove('open');
  mob.classList.remove('open');
  document.body.style.overflow = '';
}
window.closeMenu = closeMenu;

/* ── Typewriter terminal ── */
const termEl = document.getElementById('termText');
const phrases = [
  'building Aztrix Prime Studio...',
  'compiling C++ at -O3...',
  'writing plugins in Java...',
  'deploying from Termux...',
  'crafting Rust systems...',
  'architecting servers...',
  'pushing to Light0mxph...',
];
let pIdx = 0, cIdx = 0, deleting = false;

function typeLoop() {
  if (!termEl) return;
  const phrase = phrases[pIdx];

  if (!deleting) {
    termEl.textContent = phrase.slice(0, ++cIdx);
    if (cIdx === phrase.length) {
      deleting = true;
      setTimeout(typeLoop, 2000);
      return;
    }
    setTimeout(typeLoop, 65);
  } else {
    termEl.textContent = phrase.slice(0, --cIdx);
    if (cIdx === 0) {
      deleting = false;
      pIdx = (pIdx + 1) % phrases.length;
      setTimeout(typeLoop, 400);
      return;
    }
    setTimeout(typeLoop, 35);
  }
}
typeLoop();

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // stagger siblings
      const siblings = [...e.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const delay = siblings.indexOf(e.target) * 80;
      setTimeout(() => {
        e.target.classList.add('visible');
      }, delay);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(r => io.observe(r));

/* ── Particle canvas ── */
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COUNT = Math.min(60, Math.floor(window.innerWidth / 22));

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.2 + .3;
      this.vx = (Math.random() - .5) * .18;
      this.vy = -(Math.random() * .35 + .1);
      this.a  = Math.random() * .45 + .05;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const alpha = this.a * Math.sin(progress * Math.PI);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,224,204,${alpha.toFixed(3)})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  let raf;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }
  loop();

  // pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else loop();
  });
})();

/* ── Smooth anchor scroll offset for fixed nav ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
  const scrollY = window.scrollY + nav.offsetHeight + 80;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const bot = top + sec.offsetHeight;
    if (scrollY >= top && scrollY < bot) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${sec.id}`
          ? 'var(--accent)'
          : '';
      });
    }
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
