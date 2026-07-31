/* ============================================================
   AMRUTA — Hero Canvas Particle System
   Floating cocoa dust, sparkles, petals, leaves
   ============================================================ */

(function() {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  let animId;
  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Particle configurations
  const PARTICLE_TYPES = [
    // Cocoa dots
    { shape: 'circle', color: 'rgba(75,46,32,ALPHA)', size: [2, 5], count: 30, speed: [0.3, 0.7] },
    // Sparkles / stars
    { shape: 'star', color: 'rgba(216,155,40,ALPHA)', size: [3, 7], count: 20, speed: [0.2, 0.5] },
    // Petal shapes (ellipse)
    { shape: 'petal', color: 'rgba(201,138,74,ALPHA)', size: [4, 9], count: 15, speed: [0.15, 0.4] },
    // Leaf-like ovals
    { shape: 'leaf', color: 'rgba(106,168,79,ALPHA)', size: [5, 10], count: 10, speed: [0.1, 0.3] },
    // Golden shimmer motes
    { shape: 'circle', color: 'rgba(240,192,96,ALPHA)', size: [1, 3], count: 25, speed: [0.5, 1.0] },
  ];

  // ── Resize ──────────────────────────────────────────────
  function resize() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  // ── Mouse & Touch tracking ──────────────────────────────
  function updatePointer(clientX, clientY) {
    const heroRect = canvas.getBoundingClientRect();
    mouse.x = clientX - heroRect.left;
    mouse.y = clientY - heroRect.top;
  }

  document.addEventListener('mousemove', (e) => {
    updatePointer(e.clientX, e.clientY);
  });

  document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // ── Particle class ───────────────────────────────────────
  class Particle {
    constructor(type) {
      this.type = type;
      this.reset(true);
    }

    reset(fromBottom = false) {
      this.x = Math.random() * width;
      this.y = fromBottom ? height + Math.random() * 200 : Math.random() * height;
      const speedRange = this.type.speed;
      const speed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -speed;
      const sizeRange = this.type.size;
      this.baseSize = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
      this.size = this.baseSize;
      this.alpha = 0.2 + Math.random() * 0.6;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.life = 0;
      this.maxLife = 200 + Math.random() * 300;
      this.oscilPhase = Math.random() * Math.PI * 2;
      this.oscilSpeed = 0.01 + Math.random() * 0.02;
      this.oscilAmp = 0.5 + Math.random() * 1.5;
    }

    update() {
      this.life++;
      if (this.life > this.maxLife) { this.reset(); return; }

      // Oscillate horizontally
      this.x += this.vx + Math.sin(this.life * this.oscilSpeed + this.oscilPhase) * this.oscilAmp * 0.05;
      this.y += this.vy;
      this.rotation += this.rotSpeed;

      // Mouse repulsion (gentle)
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += (dx / dist) * force * 1.2;
        this.y += (dy / dist) * force * 0.8;
      }

      // Fade in/out at life edges
      const lifeFrac = this.life / this.maxLife;
      if (lifeFrac < 0.1) {
        this.alpha = (lifeFrac / 0.1) * 0.6;
      } else if (lifeFrac > 0.85) {
        this.alpha = ((1 - lifeFrac) / 0.15) * 0.6;
      }

      // Wrap horizontally
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      // Reset when out of top
      if (this.y < -30) this.reset();
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;

      const colorStr = this.type.color.replace('ALPHA', this.alpha.toFixed(2));

      switch (this.type.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fillStyle = colorStr;
          ctx.fill();
          break;

        case 'star':
          drawStar(ctx, 0, 0, 4, this.size, this.size * 0.4);
          ctx.fillStyle = colorStr;
          ctx.fill();
          // Add small glow
          ctx.shadowColor = 'rgba(216,155,40,0.6)';
          ctx.shadowBlur = this.size * 2;
          ctx.fill();
          ctx.shadowBlur = 0;
          break;

        case 'petal':
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size * 0.5, this.size, 0, 0, Math.PI * 2);
          ctx.fillStyle = colorStr;
          ctx.fill();
          break;

        case 'leaf':
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.bezierCurveTo(this.size * 0.7, -this.size * 0.5, this.size * 0.7, this.size * 0.5, 0, this.size);
          ctx.bezierCurveTo(-this.size * 0.7, this.size * 0.5, -this.size * 0.7, -this.size * 0.5, 0, -this.size);
          ctx.fillStyle = colorStr;
          ctx.fill();
          break;
      }

      ctx.restore();
    }
  }

  // ── Draw star helper ─────────────────────────────────────
  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  // ── Create all particles ─────────────────────────────────
  function createParticles() {
    particles = [];
    if (prefersReducedMotion) return;
    PARTICLE_TYPES.forEach(type => {
      const count = width < 768 ? Math.floor(type.count * 0.5) : type.count;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(type));
      }
    });
  }

  // ── Animation loop ───────────────────────────────────────
  function animate() {
    animId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
  }

  // ── Init ─────────────────────────────────────────────────
  resize();
  createParticles();
  if (!prefersReducedMotion) animate();

  // ── Burst effect on button click ─────────────────────────
  window.particleBurst = function(x, y, color = 'rgba(216,155,40,ALPHA)', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 4;
      // Quick one-shot particle animation
      let bx = x, by = y;
      let bvx = Math.cos(angle) * speed;
      let bvy = Math.sin(angle) * speed;
      let bAlpha = 0.9;
      let bSize = 3 + Math.random() * 5;
      const id = setInterval(() => {
        bx += bvx;
        by += bvy;
        bvy += 0.15; // gravity
        bAlpha -= 0.04;
        bSize *= 0.97;
        if (bAlpha <= 0) { clearInterval(id); return; }
        ctx.save();
        ctx.globalAlpha = bAlpha;
        ctx.beginPath();
        ctx.arc(bx, by, bSize, 0, Math.PI * 2);
        ctx.fillStyle = color.replace('ALPHA', bAlpha.toFixed(2));
        ctx.fill();
        ctx.restore();
      }, 16);
    }
  };

})();
