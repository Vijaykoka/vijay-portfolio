/* ═══════════════════════════════════════════════════════════════════
   VIJAY KOKA — 3D PORTFOLIO INTERACTIONS & GALAXY PHYSICS
   Features 3D Milky Way / Galaxy canvas with mouse distortion, scroll warp,
   3D tilt physics, horizontal project carousel, 3D pop-out modal, & cursor.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Helpers ────────────────────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  let bgSpeedFactor = 1;

  // ══════════════════════════════════════════════════════════════════
  // 1. INTRO 3D SEQUENCE
  // ══════════════════════════════════════════════════════════════════

  function initIntroFinale() {
    const canvas = document.getElementById('introFireworks');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let running = true;
    let rafId = 0;
    let burstTimer = null;
    let lastBurst = 0;

    const COLORS = ['#d4af37', '#f4e4bc', '#38bdf8', '#c084fc', '#f472b6', '#ffffff', '#7dd3fc'];
    const particles = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const burst = (x, y, color) => {
      const cx = x || width * (0.15 + Math.random() * 0.7);
      const cy = y || height * (0.22 + Math.random() * 0.34);
      const c = color || COLORS[Math.floor(Math.random() * COLORS.length)];
      const count = 70 + Math.floor(Math.random() * 50);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.18;
        const speed = 2.0 + Math.random() * 3.4;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.008 + Math.random() * 0.013,
          color: c,
          size: 1 + Math.random() * 2.2,
          twinkle: Math.random() * Math.PI * 2
        });
      }
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      const now = performance.now();
      if (now - lastBurst > 750) {
        lastBurst = now;
        burst();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        const alpha = Math.max(p.life, 0) * 0.9;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.35})`);
        glow.addColorStop(0.4, p.color);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = alpha;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life * 0.8 + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    };

    burst(width * 0.5, height * 0.3, '#d4af37');
    burst(width * 0.28, height * 0.42, '#38bdf8');
    rafId = requestAnimationFrame(tick);

    return {
      stop() {
        running = false;
        cancelAnimationFrame(rafId);
        if (burstTimer) clearTimeout(burstTimer);
        window.removeEventListener('resize', resize);
        ctx.clearRect(0, 0, width, height);
      }
    };
  }

  function initIntro() {
    const overlay = $('#introOverlay');
    const nameContainer = $('#introName');
    const subtitle = $('.intro-subtitle');
    const progress = $('#introProgress');
    const skipBtn = $('#introSkipBtn');
    if (!overlay || !nameContainer) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = localStorage.getItem('vk_intro_seen');
    const execMode = document.documentElement.dataset.execMode === 'on';

    if (reduceMotion || seen || execMode) {
      overlay.classList.add('done');
      initHeroAnimations();
      return;
    }

    const nameText = 'Dr. KOKA VIJAY';
    nameContainer.innerHTML = nameText.split('').map(l =>
      l === ' ' ? '<span style="width:20px;"></span>' : `<span class="letter">${l}</span>`
    ).join('');

    const letters = $$('.letter', nameContainer);
    const finale = initIntroFinale();

    if (progress) {
      setTimeout(() => { progress.style.width = '100%'; }, 80);
    }

    letters.forEach((l, i) => {
      setTimeout(() => {
        l.classList.add('show');
      }, 250 + i * 60);
    });

    if (subtitle) {
      setTimeout(() => { subtitle.classList.add('show'); }, 1200);
    }

    const finish = () => {
      if (finale) finale.stop();
      overlay.classList.add('done');
      document.body.style.overflow = '';
      localStorage.setItem('vk_intro_seen', '1');
      initHeroAnimations();
    };

    const introTimer = setTimeout(finish, 10000);
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(introTimer);
        finish();
      });
    }
    overlay.addEventListener('click', () => { clearTimeout(introTimer); finish(); });
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. HERO ANIMATIONS
  // ══════════════════════════════════════════════════════════════════

  function initHeroAnimations() {
    const heroTitle = $('#heroTitle');
    const heroGreeting = $('#heroGreeting');
    const roleText = $('#heroRoleText');

    // Contextual Time-based greeting
    if (heroGreeting) {
      const hour = new Date().getHours();
      let greeting = 'WELCOME';
      let icon = 'fa-sun';
      if (hour >= 5 && hour < 12) {
        greeting = 'GOOD MORNING';
        icon = 'fa-sun';
      } else if (hour >= 12 && hour < 17) {
        greeting = 'GOOD AFTERNOON';
        icon = 'fa-cloud-sun';
      } else if (hour >= 17 && hour < 22) {
        greeting = 'GOOD EVENING';
        icon = 'fa-moon';
      } else {
        greeting = 'GREETINGS';
        icon = 'fa-star-and-crescent';
      }
      heroGreeting.innerHTML = `<i class="fas ${icon}"></i> <span>${greeting} · EXPLORE EXECUTIVE PORTFOLIO</span>`;
    }

    if (!heroTitle) return;

    const letters = $$('.letter', heroTitle);
    letters.forEach((letter, i) => {
      letter.style.opacity = '0';
      letter.style.transform = 'translateY(60px) rotateX(-45deg)';

      setTimeout(() => {
        letter.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        letter.style.opacity = '1';
        letter.style.transform = 'translateY(0) rotateX(0deg)';
      }, i * 60);
    });

    // Typing effect on Hero Role Subtitle
    if (roleText) {
      const text = roleText.textContent.trim();
      roleText.textContent = '';
      roleText.classList.remove('typed');
      let charIdx = 0;
      setTimeout(() => {
        const typeInterval = setInterval(() => {
          if (charIdx < text.length) {
            roleText.textContent += text.charAt(charIdx);
            charIdx++;
          } else {
            clearInterval(typeInterval);
            roleText.classList.add('typed');
          }
        }, 35);
      }, letters.length * 60 + 300);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. DUAL CUSTOM CURSOR & MAGNETIC BUTTONS
  // ══════════════════════════════════════════════════════════════════

  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (document.documentElement.dataset.execMode === 'on') return;
    const dot = $('#cursorDot');
    const ring = $('#cursorRing');
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let dotX = -100, dotY = -100;
    let ringX = -100, ringY = -100;
    let visible = false;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });

    const hoverTargets = $$('a, button, [data-cursor="hover"], .cert-card-3d, .gallery-thumb, .p-card-3d');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });

    function renderCursor() {
      dotX = lerp(dotX, mouseX, 0.4);
      dotY = lerp(dotY, mouseY, 0.4);
      ringX = lerp(ringX, mouseX, 0.15);
      ringY = lerp(ringY, mouseY, 0.15);

      dot.style.transform = `translate3d(${dotX - 3}px, ${dotY - 3}px, 0)`;
      ring.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0)`;

      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }

  function initMagneticButtons() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const magneticEls = $$('[data-magnetic]');
    const execModeOn = () => document.documentElement.dataset.execMode === 'on';
    magneticEls.forEach(el => {
      el.addEventListener('mousemove', e => {
        if (execModeOn()) return;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.35;
        const deltaY = (e.clientY - centerY) * 0.35;

        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = `translate3d(0, 0, 0)`;
        el.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      });

      el.addEventListener('mouseenter', () => {
        el.style.transition = 'none';
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. INTERACTIVE 3D TILT PHYSICS ([data-3d-card])
  // ══════════════════════════════════════════════════════════════════

  function init3DTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = $$('[data-3d-card]');
    const execModeOn = () => document.documentElement.dataset.execMode === 'on';
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        if (execModeOn()) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${percentX}%`);
        card.style.setProperty('--mouse-y', `${percentY}%`);
      });

      card.addEventListener('mouseleave', () => {
        if (execModeOn()) return;
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.transition = 'transform 0.5s var(--ease-out-expo)';
      });

      card.addEventListener('mouseenter', () => {
        if (execModeOn()) return;
        card.style.transition = 'none';
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. MILKY WAY / GALAXY 3D CANVAS WITH MOUSE DISTORT & SCROLL WARP
  // ══════════════════════════════════════════════════════════════════

  function initGalaxyMilkyWayField() {
    const canvas = $('#heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const speedInput = document.getElementById('bgSpeed');
    if (speedInput) {
      const saved = parseFloat(localStorage.getItem('vk_bg_speed'));
      if (!isNaN(saved)) { speedInput.value = saved; bgSpeedFactor = saved; }
      speedInput.addEventListener('input', () => {
        bgSpeedFactor = parseFloat(speedInput.value) || 0;
        localStorage.setItem('vk_bg_speed', bgSpeedFactor);
      });
    }

    let width = 0, height = 0;
    let stars = [];
    let mouseX = -1000, mouseY = -1000;
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;

    const STAR_COUNT = window.innerWidth < 768 ? 450 : 900;
    const FOCAL_LENGTH = 450;

    // Track scroll speed for warp distortion
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      scrollVelocity = (currentY - lastScrollY) * 0.4;
      lastScrollY = currentY;
    });

    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        const numArms = 5;
        const arm = Math.floor(Math.random() * numArms);
        const armAngle = (arm * 2 * Math.PI) / numArms;

        // Radial distribution favoring spiral structure & dense core
        const distRatio = Math.pow(Math.random(), 1.4);
        const maxRadius = Math.max(width, height) * 0.75;
        this.distance = distRatio * maxRadius + 15;

        // Spiral angle formula: theta = theta0 + b * r
        const spiralAngle = this.distance * 0.0038;
        this.angle = armAngle + spiralAngle + (Math.random() - 0.5) * 0.7;

        this.x = Math.cos(this.angle) * this.distance;
        this.y = Math.sin(this.angle) * this.distance;
        this.z = (Math.random() - 0.5) * 600; // 3D depth [-300, 300]

        this.vx = 0;
        this.vy = 0;
        this.vz = 0;

        this.baseSize = Math.random() * 2.2 + 0.5;
        this.orbitalSpeed = (1 / (this.distance + 25)) * 0.95;

        // Color distribution: Golden Core, Purple/Cyan Spiral Arms, Star White, Rose Nebula
        const rnd = Math.random();
        if (this.distance < 140) {
          this.color = rnd < 0.5 ? '#f59e0b' : (rnd < 0.8 ? '#d4af37' : '#fef08a'); // Core Gold / Warm White
        } else if (rnd < 0.3) {
          this.color = '#38bdf8'; // Cyan Arm
        } else if (rnd < 0.6) {
          this.color = '#c084fc'; // Purple Nebula
        } else if (rnd < 0.75) {
          this.color = '#f472b6'; // Rose Nebula
        } else {
          this.color = '#ffffff'; // Deep Space Star
        }
        this.alpha = Math.random() * 0.75 + 0.25;
      }

      update() {
        // Continuous 3D Forward Motion towards screen/viewer
        const baseSpeed = (1.8 + Math.random() * 0.8) * bgSpeedFactor;
        const totalForwardSpeed = baseSpeed + Math.abs(scrollVelocity) * 0.8 * bgSpeedFactor;
        this.z -= totalForwardSpeed; // Moves Z forward towards camera!

        // Galactic orbit rotation around center
        this.angle += (this.orbitalSpeed + scrollVelocity * 0.0001) * bgSpeedFactor;
        const targetX = Math.cos(this.angle) * this.distance;
        const targetY = Math.sin(this.angle) * this.distance;

        this.vx += (targetX - this.x) * 0.008;
        this.vy += (targetY - this.y) * 0.008;

        // Mouse Distortion (Curving stars outward/around cursor as they fly forward)
        const centerX = width / 2;
        const centerY = height / 2;

        const scale = FOCAL_LENGTH / (FOCAL_LENGTH + this.z);
        if (scale > 0) {
          const projX = centerX + (this.x * scale);
          const projY = centerY + (this.y * scale);

          const dx = mouseX - projX;
          const dy = mouseY - projY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const DISTORT_RADIUS = 260;

          if (dist < DISTORT_RADIUS) {
            const force = (DISTORT_RADIUS - dist) / DISTORT_RADIUS;
            const pushAngle = Math.atan2(dy, dx);

            // Push forward-flying stars outward and sideways around cursor
            this.vx -= Math.cos(pushAngle + 0.4) * force * 5;
            this.vy -= Math.sin(pushAngle + 0.4) * force * 5;
            this.z -= force * 4; // Extra boost towards screen when mouse is over
          }
        }

        // Damping
        this.vx *= 0.92;
        this.vy *= 0.92;

        this.x += this.vx;
        this.y += this.vy;

        // Recycle star back into deep space when it flies past screen
        if (this.z < -FOCAL_LENGTH + 30) {
          this.z = 700 + Math.random() * 200;
          this.distance = Math.pow(Math.random(), 1.4) * (Math.max(width, height) * 0.75) + 15;
          this.x = Math.cos(this.angle) * this.distance;
          this.y = Math.sin(this.angle) * this.distance;
          this.vx = 0;
          this.vy = 0;
        }

        // Scroll velocity decay
        scrollVelocity *= 0.88;
      }

      draw() {
        const centerX = width / 2;
        const centerY = height / 2;

        const scale = FOCAL_LENGTH / (FOCAL_LENGTH + this.z);
        if (scale <= 0) return;

        const projX = centerX + (this.x * scale);
        const projY = centerY + (this.y * scale);
        const size = this.baseSize * scale;

        if (projX < 0 || projX > width || projY < 0 || projY > height) return;

        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(size, 0.4), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.min(this.alpha * Math.min(scale, 1.2), 1);
        ctx.fill();

        // Core Glow Effect for larger stars
        if (size > 1.8) {
          ctx.beginPath();
          ctx.arc(projX, projY, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = 0.15;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
      }
    }

    // Draw central Milky Way core glow
    function drawGalacticCore() {
      const centerX = width / 2;
      const centerY = height / 2;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.45);
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
      gradient.addColorStop(0.3, 'rgba(168, 85, 247, 0.06)');
      gradient.addColorStop(0.6, 'rgba(56, 189, 248, 0.03)');
      gradient.addColorStop(1, 'rgba(3, 5, 9, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      drawGalacticCore();

      stars.forEach(s => {
        s.update();
        s.draw();
      });

      galRafId = requestAnimationFrame(animate);
    }

    let galRafId = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(galRafId);
        galRafId = 0;
      } else if (!galRafId) {
        animate();
      }
    });
    galRafId = requestAnimationFrame(animate);

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    window.addEventListener('resize', resize);
    resize();
    initStars();
    animate();
  }

  // ══════════════════════════════════════════════════════════════════
  // 6. FEATURED PROJECTS: HORIZONTAL LEFT-TO-RIGHT 3D CAROUSEL & POP-OUT
  // ══════════════════════════════════════════════════════════════════

  const projectDatabase = {
    'bank-integration': {
      title: 'Bank Integration Platform',
      category: 'FINTECH & ENTERPRISE BANKING',
      client: 'Enterprise Banking Client · $40M/mo Transaction Volume',
      challenge: 'Seamlessly integrate multiple banking APIs to enable real-time international payment processing while maintaining strict security compliance (PCI-DSS) and zero platform downtime.',
      solution: 'Architected a standardized API gateway and microservices layer with robust SLA management, automated failover routing, and end-to-end encrypted payload screening.',
      role: 'Product owner for the integration — defined the API contract roadmap, prioritized bank onboarding with stakeholder alignment across 4 banking partners, and owned SLA, compliance, and go-live governance end-to-end.',
      metrics: [
        { val: '40%', lbl: 'Faster Transaction Times' },
        { val: '99.9%', lbl: 'Platform Uptime SLA' },
        { val: '$40M+', lbl: 'Monthly Processing Volume' },
        { val: 'PCI-DSS', lbl: 'Strict Compliance Level' }
      ],
      basis: 'Measured vs. 2019 baseline — internal dashboards & bank settlement reports, 12-month cohort.',
      tech: ['REST APIs', 'Payment Gateways', 'PCI-DSS Compliance', 'Microservices', 'SLA Frameworks', 'Agile / Scrum', 'SQL Dashboards']
    },
    'mobile-commerce': {
      title: 'Mobile Commerce Suite',
      category: 'TELECOM & FINTECH',
      client: 'Telcom Live Content FZC · 500,000+ Active Users (MENA)',
      challenge: 'Lead multi-disciplinary teams to deliver a comprehensive mobile commerce ecosystem combining mobile wallet, bill payment, and international remittance capabilities.',
      solution: 'Formed strategic partnerships with Etisalat and IBM, modernized legacy monolith into microservices, and instituted high-velocity sprint cycles.',
      role: 'Product owner across all three commercial products — scoped the MVP, set OKRs, and managed the roadmap while coaching 3 engineering teams through Agile/Scrum execution.',
      metrics: [
        { val: '500K+', lbl: 'Active Regional Users' },
        { val: '3', lbl: 'Commercial Products' },
        { val: '6', lbl: 'Countries Deployed' },
        { val: '-10%', lbl: 'Under Budget Delivery' }
      ],
      basis: 'Measured across MENA deployments — platform analytics & partner settlement records, 2-year window.',
      tech: ['Mobile Commerce', 'Payment Gateway', 'IBM Integration', 'Etisalat Partner', 'Scrum / SAFe', 'RESTful API Contracts']
    },
    'who-portal': {
      title: 'WHO Global Communication Portal',
      category: 'HEALTHCARE & PUBLIC SECTOR',
      client: 'World Health Organization (WHO) · Global Field Operations',
      challenge: 'Develop and deploy a secure communication and analytics platform for global health officials to coordinate pandemic response efforts across international regions.',
      solution: 'Engineered an encrypted messaging and real-time field analytics dashboard capable of operating seamlessly across low-bandwidth global regions.',
      role: 'Program manager & product lead — translated WHO stakeholder requirements into delivery plans, coordinated multi-region rollout with global teams, and enforced encryption and compliance standards.',
      metrics: [
        { val: 'Global', lbl: 'International Rollout' },
        { val: 'Real-Time', lbl: 'Field Analytics' },
        { val: '100%', lbl: 'Encrypted & Compliant' },
        { val: 'Low-Latency', lbl: 'Global Synchronization' }
      ],
      basis: 'Usage & latency metrics from WHO field-operations dashboards post-rollout.',
      tech: ['Encrypted Portals', 'Real-time Analytics', 'Global Compliance', 'Low-bandwidth Sync', 'Enterprise Program Management']
    },
    'google-fraud': {
      title: 'Google Wallet Risk Screening Engine',
      category: 'AI FRAUD PREVENTION & RISK',
      client: 'GlobalLogic / Google Wallet · Fraud Operations',
      challenge: 'Minimize false-positive escalations in high-volume Google Wallet transaction screening while keeping operational friction low for legitimate users.',
      solution: 'Analyzed transaction patterns, designed risk scoring models, and implemented automated anomaly detection workflows.',
      role: 'Risk product owner — designed the screening workflow with the ML team, defined anomaly-detection rules, and owned the reduction in false-positive escalations across Google Wallet operations.',
      metrics: [
        { val: '-22%', lbl: 'False-Positive Escalations' },
        { val: '+15%', lbl: 'Operational Quality Score' },
        { val: '24/7', lbl: 'Automated Fraud Screening' },
        { val: 'Google', lbl: 'Wallet Operations' }
      ],
      basis: 'Measured vs. pre-tooling baseline — Google Wallet operations metrics, quarter-on-quarter comparison.',
      tech: ['Machine Learning', 'Transaction Screening', 'Fraud Prevention', 'Risk Scoring', 'Anomaly Detection', 'Data Analytics']
    },
    'htc-transformation': {
      title: 'HTC Enterprise Digital Transformation',
      category: 'DIGITAL TRANSFORMATION & LEADERSHIP',
      client: 'HTC Global Services · 5 Product Lines',
      challenge: 'Transform legacy product delivery pipelines across 5 enterprise product lines and 40+ cross-functional personnel to accelerate release velocity.',
      solution: 'Introduced SAFe / Agile methodologies, standardized CI/CD pipelines, and authored AI/LLM product roadmaps.',
      role: 'Senior PM & TPM — defined the transformation roadmap, introduced SAFe across product lines, authored AI/LLM product roadmaps, and aligned 40+ cross-functional personnel to executive OKRs.',
      metrics: [
        { val: '88%', lbl: 'On-Time Release Predictability' },
        { val: '-25%', lbl: 'Reduced Time-to-Market' },
        { val: '40+', lbl: 'Engineering Personnel Led' },
        { val: '3', lbl: 'C-Suite Platform Approvals' }
      ],
      basis: 'Measured vs. 2019 baseline — release analytics & executive OKR scorecards across 5 product lines.',
      tech: ['Product Roadmapping', 'SAFe / Agile', 'Generative AI PRDs', 'CI/CD Pipelines', 'API Governance', 'Executive OKRs']
    }
  };

  function initHorizontalProjects() {
    const trackWrap = $('#projectsTrackWrap');
    const track = $('#projectsTrack');
    const prevBtn = $('#pPrevBtn');
    const nextBtn = $('#pNextBtn');
    const tabs = $$('.p-tab');
    const cards = $$('.p-card-3d');
    if (!trackWrap || !track) return;

    const scrollAmount = 400;
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        trackWrap.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        trackWrap.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;
        cards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(() => { card.style.display = 'none'; }, 300);
          }
        });
      });
    });

    const modalOverlay = $('#projectModalOverlay');
    const modalClose = $('#projectModalClose');
    const popoutBtns = $$('.btn-popout');

    popoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.p-card-3d');
        if (!card) return;
        const projectId = card.dataset.projectId;
        const data = projectDatabase[projectId];

        if (data && modalOverlay) {
          $('#pModalBadge').textContent = data.category;
          $('#pModalTitle').textContent = data.title;
          $('#pModalClient').textContent = data.client;
          $('#pModalChallenge').textContent = data.challenge;
          $('#pModalSolution').textContent = data.solution;
          $('#pModalRole').textContent = data.role;

          const metricsContainer = $('#pModalMetrics');
          metricsContainer.innerHTML = data.metrics.map(m => `
            <div class="modal-m-card">
              <div class="modal-m-val">${m.val}</div>
              <div class="modal-m-lbl">${m.lbl}</div>
            </div>
          `).join('');

          const basisEl = $('#pModalBasis');
          if (basisEl) basisEl.textContent = data.basis ? `◍ Measurement basis: ${data.basis}` : '';

          const techContainer = $('#pModalTech');
          techContainer.innerHTML = data.tech.map(t => `<span class="tech-chip">${t}</span>`).join('');

          modalOverlay.classList.add('open');
        }
      });
    });

    function closeModal() {
      if (modalOverlay) modalOverlay.classList.remove('open');
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) {
      modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 6B. INSIGHTS / THOUGHT LEADERSHIP — POP-OUT MODALS
  // ══════════════════════════════════════════════════════════════════

  const insightDatabase = {
    'llm-agents': {
      badge: 'AI PRODUCT',
      title: 'Why LLM Agents Fail in Production — And the Product Framework That Fixes It',
      meta: '2025 · 6 min read',
      thesis: 'Most teams treat LLM agents as chat features. They are not — they are autonomous workflows with real blast radius. When agents fail in production, the cause is almost never the model. It is the product: no success contract, no guardrails, no evaluation harness, and no rollback path. The fix is to manage agents the way you manage any production platform — with a control plane, not a prayer.',
      points: [
        'Define the success contract before the model: measurable outcomes — accuracy, latency, cost, human-oversight rate — not vibes.',
        'Ship with guardrails: scoped tool access, budget limits, human-in-the-loop checkpoints, and canary rollouts.',
        'Build an evaluation harness from day one: golden-set evals, regression tests on every prompt or tool change, and production telemetry.',
        'Treat agent behavior like platform behavior: versioned, observable, and rollback-able at all times.'
      ],
      framework: 'This is the same discipline as launching a payment platform: SLA, monitoring, staged rollout (canary → cohort → full), and incident runbooks. The principle transfers across domains — every autonomous system needs a control plane before it needs more intelligence. Executives should ask three questions of any GenAI initiative: What is the measurable contract? Who can stop it? How do we roll back?',
      topics: ['LLM Agents', 'GenAI Product Strategy', 'Evaluation Harness', 'Guardrails', 'AI Governance'],
      link: 'https://www.linkedin.com/in/dr-koka-vijay-ph-d-165788111/'
    },
    'fraud-loop': {
      badge: 'FRAUD & AI',
      title: 'Cutting False Positives in Google Wallet — The Anomaly-Detection Product Loop',
      meta: '2024 · 5 min read',
      thesis: 'Fraud screening is a product problem, not just a model problem. The loop — detect, score, review, feed back — only improves when product managers instrument every stage and close the loop between fraud analysts and the ML pipeline. In Google Wallet operations for the UK and US regions, that loop was the product.',
      points: [
        'Start from the operator: VIP account reviews and analyst workflows define what "good" looks like before any model is tuned.',
        'Instrument false positives as first-class metrics — every false positive is both training signal and operational cost.',
        'Blend rules with ML risk scoring, and let analysts\' decisions become labeled training data for the next model iteration.',
        'Measure business impact — review time, customer friction, fraud loss — not just precision and recall.'
      ],
      framework: 'The loop was built during my Google Wallet UK/US operations work at GlobalLogic: analysts flagged, the anomaly-detection pipeline scored, and every decision fed back into the model. That feedback-loop discipline is directly transferable to any AI risk platform — and it is why the loop, not the model, is the durable asset.',
      topics: ['Fraud Analytics', 'ML Risk Scoring', 'VIP Account Operations', 'Feedback Loops', '24/7 Ops'],
      link: 'https://www.linkedin.com/in/dr-koka-vijay-ph-d-165788111/'
    },
    'payments-blueprint': {
      badge: 'FINTECH PLATFORM',
      title: 'Building a $40M/mo Multi-Bank Payment Platform — The Integration Blueprint',
      meta: '2023 · 7 min read',
      thesis: 'Scaling a payment platform is an architecture-and-governance problem first, an integration problem second. The blueprint that worked: standardize the API contract, govern the SLA continuously, automate compliance evidence, and protect velocity with a single integration owner per partner.',
      points: [
        'Standardize the contract: one versioned API spec, reviewed with each banking partner before a line of code is written.',
        'Make SLA governance continuous: automated uptime measurement, alerting, and per-partner reporting.',
        'Bake compliance into the pipeline: PCI-DSS evidence collected automatically as part of every release.',
        'Velocity without chaos: partner onboarding sprints, integration test harnesses, and one named integration owner per bank.'
      ],
      framework: 'This blueprint drove the merchant payments and remittance platform work at Telcom Live Content — and the governance layer transfers to any regulated platform. When boards ask "can this scale?", the answer lives in the contract standard, the SLA machinery, and the compliance pipeline — not in the number of integrations shipped.',
      topics: ['Payment Gateways', 'API Contracts', 'SLA Governance', 'PCI-DSS', 'Integration Management'],
      link: 'https://www.linkedin.com/in/dr-koka-vijay-ph-d-165788111/'
    }
  };

  function initInsightModals() {
    const overlay = $('#insightModalOverlay');
    const closeBtn = $('#insightModalClose');
    const openBtns = $$('[data-open-insight]');
    if (!overlay) return;

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const data = insightDatabase[btn.dataset.openInsight];
        if (!data) return;

        $('#iModalBadge').textContent = data.badge;
        $('#iModalTitle').textContent = data.title;
        $('#iModalMeta').textContent = data.meta;
        $('#iModalThesis').textContent = data.thesis;
        $('#iModalPoints').innerHTML = data.points.map(p => `<li>${p}</li>`).join('');
        $('#iModalFramework').textContent = data.framework;
        $('#iModalTopics').innerHTML = data.topics.map(t => `<span class="tech-chip">${t}</span>`).join('');
        const linkEl = $('#iModalLink');
        linkEl.href = data.link;

        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 7. SCROLL REVEAL & SECTION COUNTER
  // ══════════════════════════════════════════════════════════════════

  function initScrollReveal() {
    const revealEls = $$('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealEls.forEach(el => el.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const parent = el.parentElement;
          const siblings = parent ? [...parent.querySelectorAll('[data-reveal]')] : [el];
          const index = siblings.indexOf(el);
          el.style.transitionDelay = (Math.min(index, 6) * 80) + 'ms';
          el.classList.add('revealed');
          setTimeout(() => { el.style.transitionDelay = ''; }, 900);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => observer.observe(el));
  }

  function initStatCounters() {
    const stats = $$('[data-count]');
    if (!stats.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animateCount = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      const frame = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.textContent = prefix + value.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(frame);
        else el.textContent = prefix + target.toFixed(decimals) + suffix;
      };
      requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(s => observer.observe(s));
  }

  function initSectionCounter() {
    const sections = $$('section[data-section]');
    const numEl = $('#counterNum');
    const labelEl = $('#counterLabel');
    if (!numEl || !sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sec = entry.target;
          const index = sections.indexOf(sec) + 1;
          const label = sec.dataset.section || 'SECTION';

          numEl.textContent = String(index).padStart(2, '0');
          if (labelEl) labelEl.textContent = label.toUpperCase();
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(s => observer.observe(s));
  }

  // ══════════════════════════════════════════════════════════════════
  // 8. TEXT SCRAMBLE DECODER
  // ══════════════════════════════════════════════════════════════════

  function initTextScramble() {
    const scrambleEls = $$('[data-scramble]');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

    scrambleEls.forEach(el => {
      const originalText = el.textContent.trim();
      let iteration = 0;
      let interval = null;

      el.addEventListener('mouseenter', () => {
        clearInterval(interval);
        iteration = 0;

        interval = setInterval(() => {
          el.textContent = originalText.split('').map((char, index) => {
            if (index < iteration) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');

          if (iteration >= originalText.length) {
            clearInterval(interval);
          }
          iteration += 1 / 2;
        }, 30);
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 9. HEADER LIVE CLOCK (IST - Hyderabad)
  // ══════════════════════════════════════════════════════════════════

  function initClock() {
    const clockEl = $('#headerTime');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      const timeStr = new Intl.DateTimeFormat('en-GB', options).format(now);
      clockEl.textContent = `${timeStr} IST`;
    }

    update();
    setInterval(update, 1000);
  }

  // ══════════════════════════════════════════════════════════════════
  // 10. PROFILE IMAGE SWITCHER & CERTIFICATE LIGHTBOX
  // ══════════════════════════════════════════════════════════════════

  window.switchProfileImage = function(thumb) {
    const mainImg = $('#mainProfileImg');
    const thumbs = $$('.gallery-thumb');

    if (thumb && thumb.src && mainImg) {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = thumb.src;
        mainImg.style.opacity = '1';
      }, 200);
    }
  };

  function initLightbox() {
    const overlay = $('#lightboxOverlay');
    const img = $('#lightboxImg');
    const closeBtn = $('#lightboxClose');
    if (!overlay || !img) return;

    const certCards = $$('[data-cert-img]');
    certCards.forEach(card => {
      card.addEventListener('click', () => {
        const src = card.dataset.certImg;
        if (src) {
          img.src = src;
          overlay.classList.add('open');
        }
      });
    });

    function close() { overlay.classList.remove('open'); }
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  }

  // ══════════════════════════════════════════════════════════════════
  // 10B. FOCUS TRAP FOR ACCESSIBLE MODALS
  // ══════════════════════════════════════════════════════════════════

  function trapFocus(modal) {
    const focusable = modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function initFocusTraps() {
    const modals = $$('.project-modal-overlay, .shortcuts-modal, .lightbox-overlay, .nav-overlay');
    modals.forEach(modal => {
      const observer = new MutationObserver(() => {
        if (modal.classList.contains('open')) {
          trapFocus(modal);
          const focusable = modal.querySelector('button, [tabindex]:not([tabindex="-1"])'); 
          if (focusable) focusable.focus();
        }
      });
      observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 11. THEME TOGGLE & HEADER SCROLL & FORM
  // ══════════════════════════════════════════════════════════════════

  function initThemeToggle() {
    const toggle = $('#themeToggle');
    if (!toggle) return;

    const savedTheme = localStorage.getItem('vk_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('vk_theme', next);
    });
  }

  function initExecMode() {
    const btn = $('#execModeBtn');
    if (!btn) return;

    const saved = localStorage.getItem('vk_exec_mode') === 'on';
    document.documentElement.dataset.execMode = saved ? 'on' : 'off';

    btn.addEventListener('click', () => {
      const next = document.documentElement.dataset.execMode !== 'on';
      document.documentElement.dataset.execMode = next ? 'on' : 'off';
      localStorage.setItem('vk_exec_mode', next ? 'on' : 'off');

      const overlay = $('#introOverlay');
      if (next && overlay) overlay.classList.add('done');
    });
  }

  function initHeaderScroll() {
    const header = $('#siteHeader');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  function initNavOverlay() {
    const overlay = $('#navOverlay');
    const openBtn = $('#navMenuBtn');
    const closeBtn = $('#navCloseBtn');
    const links = $$('.nav-overlay-link');
    if (!overlay || !openBtn) return;

    openBtn.addEventListener('click', () => overlay.classList.add('open'));
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('open'));

    links.forEach(l => {
      l.addEventListener('click', () => overlay.classList.remove('open'));
    });
  }

  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const status = $('#formStatus');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) {
        if (status) {
          status.textContent = 'Your message could not be sent. Please try again.';
          status.className = 'c-form-status error';
        }
        return;
      }

      const btn = form.querySelector('.btn-submit-3d');
      const btnLabel = btn.querySelector('span');
      const originalLabel = btnLabel.textContent;

      btn.disabled = true;
      btnLabel.textContent = 'Sending…';

      if (status) {
        status.textContent = '';
        status.className = 'c-form-status';
      }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.reset();
          if (status) {
            status.textContent = 'Thank you — your message has been sent. Dr. Vijay will respond shortly.';
            status.className = 'c-form-status success';
          }
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        const subject = encodeURIComponent(form.querySelector('[name="subject"]').value || 'Portfolio inquiry');
        const body = encodeURIComponent(form.querySelector('[name="message"]').value || '');
        window.location.href = `mailto:kokavijay58@gmail.com?subject=${subject}&body=${body}`;
        if (status) {
          status.textContent = 'Your email app has been opened — or write to kokavijay58@gmail.com directly.';
          status.className = 'c-form-status';
        }
      } finally {
        btn.disabled = false;
        btnLabel.textContent = originalLabel;
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 8. UX ENHANCEMENTS — PROGRESS BAR · BACK TO TOP · SHORTCUTS · TOOLTIPS
  // ══════════════════════════════════════════════════════════════════

  function initUXWidgets() {
    const progress = $('#scrollProgress');
    const backTop = $('#backToTopFab');
    const execSticky = $('#execStickyBar');
    const shortcutsFab = $('#shortcutsFab');
    const shortcutsModal = $('#shortcutsModal');
    const shortcutsClose = $('#shortcutsClose');
    const tooltip = $('#navTooltip');

    const sectionIds = ['hero', 'about', 'process', 'experience', 'projects', 'publications', 'insights', 'certifications', 'skills', 'testimonials', 'contact'];

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;

      if (progress && max > 0) {
        progress.style.width = (scrollY / max * 100) + '%';
      }
      if (backTop) backTop.classList.toggle('visible', scrollY > 600);

      // Sticky Executive CTA: show past hero, hide near bottom / contact form
      if (execSticky) {
        const heroEl = $('#hero');
        const contactEl = $('#contact');
        const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 600;
        const contactTop = contactEl ? contactEl.offsetTop - 300 : document.body.offsetHeight - 1000;
        
        const shouldShow = scrollY > heroBottom - 200 && scrollY < contactTop;
        execSticky.classList.toggle('visible', shouldShow);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backTop) {
      backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (tooltip) {
      $$('.nav-link[data-tip]').forEach(link => {
        link.addEventListener('mouseenter', e => {
          tooltip.textContent = link.dataset.tip;
          tooltip.classList.add('visible');
          const rect = link.getBoundingClientRect();
          tooltip.style.left = Math.min(rect.left + rect.width / 2, window.innerWidth - 210) + 'px';
          tooltip.style.top = (rect.bottom + 10) + 'px';
          tooltip.style.transform = 'translateX(-50%)';
        });
        link.addEventListener('mouseleave', () => {
          tooltip.classList.remove('visible');
        });
      });
    }

    const openShortcuts = () => shortcutsModal && shortcutsModal.classList.add('open');
    const closeShortcuts = () => shortcutsModal && shortcutsModal.classList.remove('open');

    if (shortcutsFab) shortcutsFab.addEventListener('click', openShortcuts);
    if (shortcutsClose) shortcutsClose.addEventListener('click', closeShortcuts);
    if (shortcutsModal) shortcutsModal.addEventListener('click', e => {
      if (e.target === shortcutsModal) closeShortcuts();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeShortcuts(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey || e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;

      if (e.key === '?') { openShortcuts(); return; }
      if (e.key === 'e' || e.key === 'E') { $('#execModeBtn') && $('#execModeBtn').click(); return; }
      if (e.key === 't' || e.key === 'T') { $('#themeToggle') && $('#themeToggle').click(); return; }

      const digit = parseInt(e.key, 10);
      if (digit >= 1 && digit <= sectionIds.length) {
        const target = document.getElementById(sectionIds[digit - 1]);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // INIT ALL MODULES
  // ══════════════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => {
    initIntro();
    initCursor();
    initMagneticButtons();
    init3DTilt();
    initGalaxyMilkyWayField();
    initHorizontalProjects();
    initInsightModals();
    initScrollReveal();
    initStatCounters();
    initSectionCounter();
    initTextScramble();
    initClock();
    initLightbox();
    initThemeToggle();
    initExecMode();
    initHeaderScroll();
    initNavOverlay();
    initContactForm();
    initUXWidgets();
    initFocusTraps();
  });

})();
