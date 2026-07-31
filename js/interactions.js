/* ============================================================
   AMRUTA — Interactions
   Cart, Wishlist, Add-to-Cart fly animation, Wishlist hearts,
   Product hover particles, Checkout simulation
   ============================================================ */

'use strict';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractions);
} else {
  initInteractions();
}

function initInteractions() {

  // ── Cart State ───────────────────────────────────────────
  const cart = {
    items: {},    // { id: { name, price, qty } }
    get count() {
      return Object.values(this.items).reduce((sum, item) => sum + item.qty, 0);
    },
    get total() {
      return Object.values(this.items).reduce((sum, item) => sum + item.price * item.qty, 0);
    },
    add(id, name, price) {
      if (this.items[id]) {
        this.items[id].qty++;
      } else {
        this.items[id] = { name, price: parseInt(price), qty: 1 };
      }
      saveCart();
    },
    remove(id) {
      delete this.items[id];
      saveCart();
    },
    updateQty(id, delta) {
      if (!this.items[id]) return;
      this.items[id].qty = Math.max(0, this.items[id].qty + delta);
      if (this.items[id].qty === 0) this.remove(id);
      else saveCart();
    }
  };

  function saveCart() {
    try {
      sessionStorage.setItem('amruta_cart', JSON.stringify(cart.items));
    } catch(e) {}
    renderCart();
  }

  function loadCart() {
    try {
      const saved = sessionStorage.getItem('amruta_cart');
      if (saved) cart.items = JSON.parse(saved);
    } catch(e) {}
    renderCart();
  }

  // ── Cart UI ──────────────────────────────────────────────
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartOpenBtn = document.getElementById('cart-open-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartCountEl = document.getElementById('cart-count');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartFooter = document.getElementById('cart-footer');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (cartOpenBtn) cartOpenBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Swipe right to close cart drawer on mobile
  let cartTouchStartX = 0;
  let cartTouchStartY = 0;
  if (cartDrawer) {
    cartDrawer.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        cartTouchStartX = e.touches[0].clientX;
        cartTouchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    cartDrawer.addEventListener('touchmove', (e) => {
      if (!e.touches || !e.touches[0]) return;
      const dx = e.touches[0].clientX - cartTouchStartX;
      const dy = Math.abs(e.touches[0].clientY - cartTouchStartY);
      if (dx > 60 && dy < 40) {
        closeCart();
      }
    }, { passive: true });
  }

  function renderCart() {
    if (!cartCountEl) return;

    // Update count badge
    const count = cart.count;
    cartCountEl.textContent = count;
    cartCountEl.style.display = count > 0 ? 'flex' : 'none';

    // Bump animation
    cartCountEl.classList.add('bump');
    setTimeout(() => cartCountEl.classList.remove('bump'), 400);

    // Render items
    if (!cartItemsList) return;
    const items = Object.entries(cart.items);

    if (items.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🍬</div>
          <p>Your cart is empty.<br/>Add some sweetness!</p>
        </div>
      `;
      if (cartFooter) cartFooter.style.display = 'none';
    } else {
      cartItemsList.innerHTML = items.map(([id, item]) => `
        <div class="cart-item" id="cart-item-${id}">
          <div class="cart-item-img" style="font-size:2rem;display:flex;align-items:center;justify-content:center;background:var(--bg-beige);">🍬</div>
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" data-id="${id}" data-delta="-1" aria-label="Decrease quantity">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" data-id="${id}" data-delta="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </div>
      `).join('');

      // Qty buttons
      cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const delta = parseInt(btn.getAttribute('data-delta'));
          cart.updateQty(id, delta);
          renderCart();
        });
      });

      if (cartFooter) cartFooter.style.display = 'block';
      if (cartTotalEl) cartTotalEl.textContent = `₹${cart.total.toLocaleString('en-IN')}`;
    }
  }

  // ── Add to Cart ──────────────────────────────────────────
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      // Get product data from closest article or data attributes
      const card = btn.closest('[data-product-id]');
      const id   = btn.getAttribute('data-product-id') || (card && card.getAttribute('data-product-id')) || 'generic';
      const name = btn.getAttribute('data-product-name') || (card && card.getAttribute('data-product-name')) || 'Sweet';
      const price = btn.getAttribute('data-product-price') || (card && card.getAttribute('data-product-price')) || '299';

      // Add to cart data
      cart.add(id, name, price);

      // Fly-to-cart animation
      flyToCart(btn);

      // Toast
      if (window.showToast) {
        window.showToast(`🍯 ${name} added to cart!`);
      }
    });
  });

  function flyToCart(btn) {
    const cartIcon = document.getElementById('cart-open-btn');
    if (!cartIcon || !btn) return;

    const btnRect = btn.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const flyEl = document.createElement('div');
    flyEl.style.cssText = `
      position: fixed;
      z-index: 9999;
      width: 20px; height: 20px;
      background: var(--honey);
      border-radius: 50%;
      pointer-events: none;
      left: ${btnRect.left + btnRect.width / 2}px;
      top: ${btnRect.top + btnRect.height / 2}px;
      transform: translate(-50%, -50%);
      transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 1;
    `;
    document.body.appendChild(flyEl);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flyEl.style.left = `${cartRect.left + cartRect.width / 2}px`;
        flyEl.style.top  = `${cartRect.top + cartRect.height / 2}px`;
        flyEl.style.width = '8px';
        flyEl.style.height = '8px';
        flyEl.style.opacity = '0';
      });
    });

    setTimeout(() => flyEl.remove(), 800);
  }

  // ── Wishlist Toggle ──────────────────────────────────────
  document.querySelectorAll('[data-wishlist]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = btn.classList.toggle('active');
      btn.textContent = isActive ? '❤️' : '🤍';
      if (isActive) {
        btn.style.animation = 'heart-beat 0.5s ease';
        if (window.showToast) window.showToast('❤️ Added to wishlist!');
      } else {
        btn.style.animation = '';
        if (window.showToast) window.showToast('Removed from wishlist');
      }
      setTimeout(() => btn.style.animation = '', 600);
    });
  });

  // ── Checkout Simulation ──────────────────────────────────
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      closeCart();
      if (window.showToast) {
        window.showToast('🎉 Redirecting to secure checkout... (demo mode)');
      }
    });
  }

  // ── Product Quick View (simple modal) ───────────────────
  document.querySelectorAll('.product-quick-view').forEach(qv => {
    qv.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = qv.closest('.product-card');
      if (!card) return;
      const name  = card.getAttribute('data-product-name') || 'Sweet';
      const price = card.getAttribute('data-product-price') || '299';
      if (window.showToast) {
        window.showToast(`🔍 Quick View: ${name} — ₹${parseInt(price).toLocaleString('en-IN')}`);
      }
    });
  });

  // ── Gift Occasion hover sparkles ─────────────────────────
  document.querySelectorAll('.gift-occasion').forEach(occ => {
    occ.addEventListener('mouseenter', () => {
      occ.style.transform = 'translateY(-4px) scale(1.05)';
    });
    occ.addEventListener('mouseleave', () => {
      occ.style.transform = '';
    });
  });

  // ── Masonry items — stagger reveal ───────────────────────
  const masonryItems = document.querySelectorAll('.masonry-item');
  const masonryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = `fade-up 0.5s ${i * 0.07}s both`;
        masonryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  masonryItems.forEach(item => masonryObserver.observe(item));

  // ── Star rating animation ─────────────────────────────────
  const starEls = document.querySelectorAll('.stars');
  const starsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stars = entry.target.textContent;
        entry.target.textContent = '';
        [...stars].forEach((char, i) => {
          setTimeout(() => {
            entry.target.textContent += char;
          }, i * 100);
        });
        starsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  starEls.forEach(s => starsObserver.observe(s));

  // ── Ingredient card glow on hover ────────────────────────
  document.querySelectorAll('.ingredient-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Tiny sparkle burst near the emoji
      const emoji = card.querySelector('.ingredient-emoji');
      if (!emoji) return;
      const rect = emoji.getBoundingClientRect();
      // Use particle burst if on canvas
      if (window.particleBurst) {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        const cr = canvas.getBoundingClientRect();
        window.particleBurst(
          rect.left + rect.width / 2 - cr.left,
          rect.top + rect.height / 2 - cr.top,
          'rgba(216,155,40,ALPHA)', 8
        );
      }
    });
  });

  // ── Process scroll tracking ───────────────────────────────
  const processScroll = document.getElementById('process-scroll');
  if (processScroll) {
    processScroll.addEventListener('scroll', () => {
      const fill = document.getElementById('process-fill');
      if (!fill) return;
      const maxScroll = processScroll.scrollWidth - processScroll.clientWidth;
      const pct = maxScroll > 0 ? (processScroll.scrollLeft / maxScroll) * 100 : 100;
      fill.style.width = `${Math.min(pct, 100)}%`;
    });
  }

  // ── Seasonal banner (festive) ─────────────────────────────
  function showSeasonalBanner() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    let festive = null;

    // Diwali approx (Oct–Nov)
    if (month === 10 || month === 11) festive = { emoji: '🪔', text: 'Diwali Special Offer — Free Gift Wrapping on Orders ₹999+', bg: '#D89B28' };
    // Christmas
    else if (month === 12) festive = { emoji: '🎄', text: 'Christmas Hampers Available — Order before 20th Dec', bg: '#D64045' };
    // Valentine's
    else if (month === 2 && day <= 14) festive = { emoji: '💝', text: 'Valentine\'s Gift Boxes — Sugar-Free Love for Your Loved Ones', bg: '#D64045' };

    if (festive) {
      const banner = document.createElement('div');
      banner.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0;
        z-index: ${getComputedStyle(document.documentElement).getPropertyValue('--z-nav').trim() || 100};
        background: ${festive.bg};
        color: #fff;
        text-align: center;
        padding: 10px 20px;
        font-size: 0.82rem;
        font-weight: 600;
        font-family: var(--font-body);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        animation: fade-down 0.5s ease;
      `;
      banner.innerHTML = `<span>${festive.emoji}</span><span>${festive.text}</span><button onclick="this.parentElement.remove()" style="margin-left:auto;background:rgba(255,255,255,0.2);border:none;color:#fff;padding:4px 10px;border-radius:20px;font-size:0.75rem;cursor:pointer;">✕</button>`;

      document.body.prepend(banner);
      // Push navbar down
      const navbar = document.getElementById('navbar');
      if (navbar) navbar.style.top = '56px';
    }
  }

  showSeasonalBanner();

  // ── Add hover listeners for newly added magnetic buttons ─
  document.querySelectorAll('.btn.magnetic').forEach(btn => {
    if (btn._magneticInit) return;
    btn._magneticInit = true;
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ── Load saved cart ─────────────────────────────────────
  loadCart();

  console.log('🛒 Interactions initialized');
}
