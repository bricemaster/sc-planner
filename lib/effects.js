/* ============================================================
   effects.js — Visual polish layer (items 1-20)
   ============================================================ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* === 1. Loading screen ==================================== */
function initLoadingScreen() {
  let el = document.getElementById('loadingScreen');
  if (!el) {
    el = document.createElement('div');
    el.id = 'loadingScreen';
    el.innerHTML = `
      <div class="loading-ship"></div>
      <div class="loading-bar-track"><div class="loading-bar-fill"></div></div>`;
    document.body.prepend(el);
  }

  const done = () => {
    document.body.classList.add('loading-done');
    setTimeout(() => el.remove(), 700);
  };
  if (document.readyState === 'complete') done();
  else window.addEventListener('load', done);
}

/* === 2. Particle background =============================== */
function initParticles() {
  if (REDUCED) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const MAX = 40;
  let particles = [];
  let visible = true;
  let raf;
  let lastFrame = 0;
  const FRAME_INTERVAL = 33; // ~30 FPS cap

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) {
      lastFrame = 0;
      raf = requestAnimationFrame(loop);
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  });

  for (let i = 0; i < MAX; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.4 + 0.1
    });
  }

  function loop(ts) {
    if (!visible) return;
    raf = requestAnimationFrame(loop);

    if (ts - lastFrame < FRAME_INTERVAL) return;
    lastFrame = ts;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242,242,242,${p.a})`;
      ctx.fill();
    }
  }
  raf = requestAnimationFrame(loop);
}

/* === 3. Cursor trail ====================================== */
function initCursorTrail() {
  if (REDUCED) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.body.classList.add('has-cursor-trail');
  let lastMoveTime = 0;
  document.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastMoveTime < 16) return;
    lastMoveTime = now;
    document.body.style.setProperty('--mx', e.clientX + 'px');
    document.body.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });
}

/* === 10. Parallax layers ================================== */
function initParallax() {
  if (REDUCED) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const layers = document.querySelectorAll('.parallax-layer');
      for (const el of layers) {
        const speed = parseFloat(el.dataset.speed || '0.05');
        el.style.transform = `translateY(${sy * speed}px)`;
      }
      ticking = false;
    });
  }, { passive: true });
}

/* === 9. Floating action button ============================ */
function initFAB() {
  const existing = document.querySelector('.fab');
  if (!existing) return;
  const trigger = existing.querySelector('.fab__trigger');
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    existing.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!existing.contains(e.target)) {
      existing.classList.remove('open');
    }
  });
}

/* === 15. Ambient background =============================== */
function initAmbient() {
  if (REDUCED) return;
  if (document.querySelector('.ambient-bg')) return;
  const el = document.createElement('div');
  el.className = 'ambient-bg';
  document.body.prepend(el);
}

/* === 17. Sound hover (visual ripple) ====================== */
function initSoundHover() {
  document.addEventListener('mousemove', (e) => {
    const target = e.target.closest('.sound-hover');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const rx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const ry = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    target.style.setProperty('--rx', rx + '%');
    target.style.setProperty('--ry', ry + '%');
  }, { passive: true });
}

/* === 18. Confetti on milestones =========================== */
export function createConfetti(x, y, color = '#c9aa6e') {
  if (REDUCED) return;
  const COUNT = 30;
  const pieces = [];
  const colors = [color, '#e4c47e', '#6eb88a', '#f2f2f2', '#c46e6e'];

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.background = colors[i % colors.length];
    el.style.width = (Math.random() * 4 + 4) + 'px';
    el.style.height = (Math.random() * 4 + 4) + 'px';
    if (Math.random() > 0.5) el.style.borderRadius = '50%';
    document.body.appendChild(el);

    pieces.push({
      el,
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -10 - 3,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 12,
      gravity: 0.25
    });
  }

  let start = null;
  function tick(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    for (const p of pieces) {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      const opacity = Math.max(0, 1 - elapsed / 3000);
      p.el.style.transform = `translate(${p.x - x}px, ${p.y - y}px) rotate(${p.rot}deg)`;
      p.el.style.opacity = opacity;
    }
    if (elapsed < 3000) {
      requestAnimationFrame(tick);
    } else {
      for (const p of pieces) p.el.remove();
    }
  }
  requestAnimationFrame(tick);
}

/* === 19. Smooth number transitions ======================== */
export function animateNumber(el, from, to, duration = 800) {
  if (REDUCED) {
    el.textContent = to;
    return;
  }
  const start = performance.now();
  const diff = to - from;

  function ease(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const val = from + diff * ease(t);
    el.textContent = Number.isInteger(to)
      ? Math.round(val)
      : val.toFixed(2);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* === Main init ============================================ */
export function initEffects() {
  initLoadingScreen();
  initParticles();
  initCursorTrail();
  initParallax();
  initFAB();
  initAmbient();
  initSoundHover();
}
