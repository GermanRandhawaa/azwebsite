/* AZ BROZ Inc. — script.js */

/* =============================================
   ELEMENT REFS  (all declared up top to avoid
   temporal-dead-zone ReferenceErrors)
   ============================================= */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const navLinksEl  = document.getElementById('navLinks');
const backToTopBtn = document.getElementById('backToTop');
const contactForm  = document.getElementById('contactForm');
const formSuccess  = document.getElementById('formSuccess');
const formError    = document.getElementById('formError');

/* =============================================
   NAVBAR — scroll shadow + active link
   ============================================= */
function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  backToTopBtn.classList.toggle('visible', window.scrollY > 400);
  updateActiveNav();
  checkReveals();
}

function updateActiveNav() {
  const scrollMid = window.scrollY + window.innerHeight / 2;
  document.querySelectorAll('section[id]').forEach(sec => {
    const top  = sec.offsetTop - 80;
    const bot  = top + sec.offsetHeight;
    const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
    if (!link) return;
    link.classList.toggle('active', scrollMid >= top && scrollMid < bot);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });

/* =============================================
   SCROLL REVEAL — simple, reliable approach
   (checks every element on each scroll event
   and also runs immediately + on load so
   elements visible on first paint show up too)
   ============================================= */
const revealEls = Array.from(document.querySelectorAll('.reveal'));

function checkReveals() {
  const trigger = window.innerHeight * 0.92;
  revealEls.forEach(el => {
    if (el.classList.contains('visible')) return;
    if (el.getBoundingClientRect().top < trigger) {
      el.classList.add('visible');
    }
  });
}

// Run immediately, after a short tick, and on full load
checkReveals();
setTimeout(checkReveals, 80);
window.addEventListener('load', checkReveals);

/* =============================================
   HAMBURGER MENU
   ============================================= */
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinksEl.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* =============================================
   SMOOTH SCROLL (offset for fixed nav)
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 8;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    // After smooth scroll ends, ensure reveals fired
    setTimeout(checkReveals, 800);
  });
});

/* =============================================
   BACK TO TOP
   ============================================= */
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* =============================================
   HERO PARTICLES
   ============================================= */
(function initParticles() {
  const wrap = document.getElementById('heroParticles');
  if (!wrap) return;
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  wrap.appendChild(canvas);

  let W, H, particles;

  function resize() {
    W = canvas.width  = wrap.offsetWidth;
    H = canvas.height = wrap.offsetHeight;
  }

  function Particle() { this.reset(); }
  Particle.prototype.reset = function () {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.4 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.a  = Math.random() * 0.5 + 0.1;
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  function build() {
    const count = Math.min(Math.floor((W * H) / 10000), 100);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(193,39,45,${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  build();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); build(); }, 200);
  });
})();

/* =============================================
   CONTACT FORM — mailto submission
   ============================================= */
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      formError.hidden = false;
      formSuccess.hidden = true;
      formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    formError.hidden = true;

    const subject = `Project Inquiry from ${name} — AZ BROZ Website`;
    const body = [
      `Hi AZ BROZ Team,`,
      ``,
      `You have a new inquiry submitted through your website.`,
      ``,
      `──────────────────────────────`,
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Phone:   ${phone || 'Not provided'}`,
      `Service: ${service || 'Not specified'}`,
      `──────────────────────────────`,
      ``,
      `Message:`,
      message,
      ``,
      `──────────────────────────────`,
      `Sent via AZ BROZ Inc. website contact form.`,
    ].join('\n');

    window.location.href = `mailto:az.broz@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => {
      contactForm.reset();
      formSuccess.hidden = true;
    }, 7000);
  });

  contactForm.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (!formError.hidden) formError.hidden = true;
    });
  });
}

/* =============================================
   NAV LINK — subtle magnetic hover
   ============================================= */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('mousemove', e => {
    const rect = link.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.2;
    const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.2;
    link.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  link.addEventListener('mouseleave', () => { link.style.transform = ''; });
});

/* =============================================
   INITIAL STATE
   ============================================= */
updateActiveNav();
onScroll();
