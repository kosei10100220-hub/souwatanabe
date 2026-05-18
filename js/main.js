/* ===========================
   main.js — 渡邉颯 Website
=========================== */

'use strict';

// ===========================
// CUSTOM CURSOR
// ===========================
(function initCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  const follower = document.createElement('div');
  follower.className = 'cursor-follower';
  document.body.appendChild(cursor);
  document.body.appendChild(follower);

  let mx = 0, my = 0;
  let fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();
})();


// ===========================
// PARTICLE CANVAS (HERO)
// ===========================
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x      = Math.random() * W;
      this.y      = init ? Math.random() * H : H + 10;
      this.size   = Math.random() * 1.8 + 0.3;
      this.speedY = -(Math.random() * 0.5 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.opacity = Math.random() * 0.55 + 0.1;
      this.life   = 0;
      this.maxLife = Math.random() * 250 + 120;
      // random warm tones
      const tones = ['#8b7355','#a0956a','#c8b89a','#b8a07a'];
      this.color  = tones[Math.floor(Math.random() * tones.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }

    draw() {
      const alpha = this.opacity * (1 - this.life / this.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: 160 }, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  init();
  animate();
})();


// ===========================
// NAVBAR — scroll behavior
// ===========================
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });

  // Hamburger toggle (mobile)
  const hamburger = document.getElementById('hamburger');
  const ul = nav.querySelector('ul');
  if (hamburger && ul) {
    hamburger.addEventListener('click', () => {
      const open = ul.style.display === 'flex';
      ul.style.display = open ? 'none' : 'flex';
      ul.style.flexDirection = 'column';
      ul.style.position = 'absolute';
      ul.style.top = '100%';
      ul.style.right = '1.5rem';
      ul.style.background = 'rgba(245,240,232,0.97)';
      ul.style.padding = '1.2rem 2rem';
      ul.style.gap = '1.2rem';
      ul.style.border = '1px solid rgba(10,10,10,0.08)';
      if (!open) {
        ul.querySelectorAll('a').forEach(a => { a.style.color = '#0a0a0a'; });
      }
    });
  }
})();


// ===========================
// SCROLL REVEAL
// ===========================
(function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();


// ===========================
// PHOTO STRIP — pause on hover
// (handled via CSS, but also
//  add drag-to-scroll on desktop)
// ===========================
(function initPhotoStrip() {
  const track = document.getElementById('track');
  if (!track) return;

  let isDown = false, startX, scrollLeft;

  track.addEventListener('mousedown', e => {
    isDown = true;
    track.style.animationPlayState = 'paused';
    startX     = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.animationPlayState = 'running';
    track.style.cursor = 'default';
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.style.animationPlayState = 'running';
    track.style.cursor = 'default';
  });

  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.4;
    track.scrollLeft = scrollLeft - walk;
  });
})();


// ===========================
// QUOTE — parallax text ghost
// ===========================
(function initQuoteParallax() {
  const quoteSection = document.getElementById('quote');
  if (!quoteSection) return;

  window.addEventListener('scroll', () => {
    const rect   = quoteSection.getBoundingClientRect();
    const center = rect.top + rect.height / 2 - window.innerHeight / 2;
    const shift  = center * 0.12;
    const pseudo = quoteSection.querySelector('*::before');
    // Move ghost text via CSS variable
    quoteSection.style.setProperty('--ghost-shift', shift + 'px');
  }, { passive: true });
})();


// ===========================
// CATEGORY CARDS — tilt effect
// ===========================
(function initCardTilt() {
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();


// ===========================
// SMOOTH ANCHOR SCROLL
// ===========================
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


// ===========================
// INFO CARDS — stagger on load
// ===========================
(function initInfoCards() {
  document.querySelectorAll('.info-card').forEach((card, i) => {
    card.style.setProperty('--delay', (i * 0.12) + 's');
  });
})();
