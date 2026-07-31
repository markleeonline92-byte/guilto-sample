/* ============================================================
   AMRUTA — Main JS
   Lenis Smooth Scroll, Custom Cursor, Navbar, Scroll Reveals,
   GSAP animations, Counter animation
   ============================================================ */

'use strict';



// Wait for DOM + deferred scripts to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {

  // ── 1. Lenis Smooth Scroll ──────────────────────────────
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate with GSAP ScrollTrigger if available
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  } catch(e) {
    console.warn('Lenis not available, using native scroll');
  }

  // Anchor click — smooth scroll + close drawer
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeDrawer();
      if (lenis) {
        lenis.scrollTo(target, { offset: -90 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });



  // ── 3. Navbar Scroll Behavior ────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (navbar) {
      if (scrollY > 60) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;

    // Active nav link
    updateActiveNavLink();
  }, { passive: true });

  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
      if (!link) return;
      if (section.offsetTop <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  // ── 4. Mobile Nav Drawer & Touch Gestures ───────────────
  const hamburger = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-drawer');
  const drawerClose = document.getElementById('nav-drawer-close');

  // Create mobile nav overlay backdrop
  let drawerOverlay = document.getElementById('nav-drawer-overlay');
  if (!drawerOverlay) {
    drawerOverlay = document.createElement('div');
    drawerOverlay.id = 'nav-drawer-overlay';
    drawerOverlay.className = 'nav-drawer-overlay';
    document.body.appendChild(drawerOverlay);
  }

  function openDrawer() {
    drawer.classList.add('open');
    drawerOverlay.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
    if (hamburger) {
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    if (hamburger) {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', () => {
    if (drawer.classList.contains('open')) closeDrawer();
    else openDrawer();
  });
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // Auto-close drawer when a navigation link inside the drawer is tapped
  if (drawer) {
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }

  // Swipe right to close mobile drawer
  let touchStartX = 0;
  let touchStartY = 0;
  if (drawer) {
    drawer.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    drawer.addEventListener('touchmove', (e) => {
      if (!e.touches || !e.touches[0]) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dx > 50 && dy < 40) {
        closeDrawer();
      }
    }, { passive: true });
  }

  // ── 5. Magnetic Buttons ──────────────────────────────────
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      btn.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      btn.style.transform = 'translate(0, 0)';
      setTimeout(() => btn.style.transition = '', 500);
    });
  });

  // ── 6. Ripple Effect on Buttons ──────────────────────────
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top  = (e.clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // ── 7. Scroll Reveal (Always Visible by Default) ─────────
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    el.classList.add('revealed');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.01,
    rootMargin: '300px 0px 300px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });

  // ── 8. 3D Tilt Cards (Mouse & Touch) ─────────────────────
  document.querySelectorAll('[data-tilt]').forEach(card => {
    function applyTilt(clientX, clientY) {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (clientX - cx) / (rect.width / 2);
      const dy = (clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(600px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) translateY(-12px)`;
    }

    function resetTilt() {
      card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
      card.style.transform = '';
      setTimeout(() => card.style.transition = '', 600);
    }

    card.addEventListener('mousemove', (e) => applyTilt(e.clientX, e.clientY));
    card.addEventListener('mouseleave', resetTilt);
    card.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) applyTilt(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    card.addEventListener('touchend', resetTilt);
  });

  // ── 9. Product Card Tilt (Mouse & Touch) ─────────────────
  document.querySelectorAll('.product-card, .bs-card').forEach(card => {
    function applyProductTilt(clientX, clientY) {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (clientX - cx) / (rect.width / 2);
      const dy = (clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) translateY(-10px)`;
    }

    function resetProductTilt() {
      card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.5s';
      card.style.transform = '';
      setTimeout(() => card.style.transition = '', 500);
    }

    card.addEventListener('mousemove', (e) => applyProductTilt(e.clientX, e.clientY));
    card.addEventListener('mouseleave', resetProductTilt);
    card.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) applyProductTilt(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    card.addEventListener('touchend', resetProductTilt);
  });

  // ── 10. Animated Counters ────────────────────────────────
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      const duration = 2000;
      const start = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }

      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ── 11. Process Timeline Progress Fill ───────────────────
  const processFill = document.getElementById('process-fill');
  const processTrack = document.getElementById('process-track');
  if (processFill && processTrack) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        processFill.style.width = '85%';
        // Animate steps active state
        const steps = processTrack.querySelectorAll('.process-step');
        steps.forEach((step, i) => {
          setTimeout(() => step.classList.add('active'), i * 300);
        });
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(processTrack);
  }

  // ── 12. GSAP ScrollTrigger Animations (if GSAP loaded) ──
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Hero elements cascade
    gsap.from('.hero-badge', {
      y: -15, duration: 0.6, delay: 0.1, ease: 'power3.out'
    });

    gsap.from('.hero-h1', {
      y: 25, duration: 0.8, delay: 0.2, ease: 'power3.out'
    });

    // About image parallax
    gsap.to('.about-img-main img', {
      scrollTrigger: {
        trigger: '#about',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
      yPercent: -10,
      ease: 'none',
    });
  }

    // Gallery items
    gsap.from('.masonry-item', {
      scrollTrigger: { trigger: '#gallery', start: 'top 80%' },
      opacity: 0, y: 40, duration: 0.5, stagger: 0.07, ease: 'power2.out'
    });

    // Gift section
    gsap.from('.giftbox-content', {
      scrollTrigger: { trigger: '#giftbox', start: 'top 75%' },
      opacity: 0, x: 50, duration: 0.9, ease: 'power3.out'
    });
  }

  // GSAP might load slightly after DOMContentLoaded due to defer
  if (window.gsap) {
    initGSAP();
  } else {
    window.addEventListener('load', initGSAP);
  }

  // ── 13. Category Filter ──────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      const filter = btn.getAttribute('data-filter');

      productCards.forEach((card, i) => {
        const cat = card.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.style.display = '';
          card.style.animation = `fade-up 0.4s ${i * 0.05}s both`;
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ── 14. Newsletter Form ──────────────────────────────────
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email').value.trim();
      if (email && email.includes('@')) {
        showToast('🎉 You\'re subscribed! Check your inbox for 15% off.');
        newsletterForm.reset();
      } else {
        showToast('⚠️ Please enter a valid email address.', 3000);
      }
    });
  }

  // ── 15. Contact Form ─────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      if (name) {
        showToast(`🍯 Thank you, ${name}! We'll be in touch within 2 hours.`);
        contactForm.reset();
      } else {
        showToast('⚠️ Please fill in your name and email.', 3000);
      }
    });
  }

  // ── 16. Graceful Image Fallback ──────────────────────────
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      const container = img.parentElement;
      if (container && !container.getAttribute('data-has-fallback')) {
        container.setAttribute('data-has-fallback', '1');
        img.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.style.cssText = 'width:100%;height:100%;min-height:160px;display:flex;align-items:center;justify-content:center;font-size:4rem;background:linear-gradient(135deg,var(--bg-gold-light),var(--bg-cream));border-radius:inherit;';
        fallback.innerHTML = '🍯';
        container.appendChild(fallback);
      }
    });
  });

  // ── 16. Toast ─────────────────────────────────────────────
  let toastTimer;
  function showToast(message, duration = 3500) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    if (!toast || !toastMsg) return;
    clearTimeout(toastTimer);
    toastMsg.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  window.showToast = showToast;

  // ── 17. Hero ring rotation pause on focus ────────────────
  const rings = document.querySelectorAll('.hero-img-ring');
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      rings.forEach(r => {
        r.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      });
    });
    heroObserver.observe(heroSection);
  }

  // ── 18. Footer sub btn ───────────────────────────────────
  const footerSubBtn = document.querySelector('.footer-sub-btn');
  if (footerSubBtn) {
    footerSubBtn.addEventListener('click', () => {
      const input = document.querySelector('.footer-email-input');
      if (input && input.value.includes('@')) {
        showToast('🍯 Subscribed! Welcome to the Amruta family.');
        input.value = '';
      } else {
        showToast('⚠️ Please enter a valid email.');
      }
    });
  }

  // ── 19. Parallax blob elements on scroll ─────────────────
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const parallaxEls = document.querySelectorAll('.float-1, .float-2, .float-3, .float-4');
    parallaxEls.forEach((el, i) => {
      const speed = 0.03 + i * 0.01;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });

  console.log('%c🍯 Amruta — Sugar-Free Sweets', 'font-family:serif;font-size:20px;color:#D89B28;font-weight:bold;');
  console.log('%cHandcrafted with love & code.', 'font-size:13px;color:#746B63;');
}
