/* =========================================
   AI BROKERS FUNNEL — main.js
   Handles: navbar scroll, mobile nav,
   counter animations, scroll reveal,
   FAQ accordion, form validation,
   progress bar animation, toast demos.
   ========================================= */

(function () {
  'use strict';

  /* ── Utility helpers ─────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /* ── Navbar: transparent → solid on scroll ─ */
  const navbar = $('#navbar');
  if (navbar) {
    const onScroll = debounce(function () {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ── Mobile nav toggle ──────────────── */
  const navToggle = $('#navToggle');
  const navLinks  = $('#navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('mobile-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu on link click
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('mobile-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('mobile-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Smooth scroll for anchor links ─── */
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ── Scroll-reveal (IntersectionObserver) ─ */
  const revealEls = $$('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback: show everything immediately
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Animated counters ──────────────── */
  function animateCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const prefix   = el.dataset.prefix  || '';
    const suffix   = el.dataset.suffix  || '';
    const duration = 2000; // ms
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = target * eased;

      if (Number.isInteger(target)) {
        el.textContent = prefix + Math.round(value).toLocaleString() + suffix;
      } else {
        el.textContent = prefix + value.toFixed(1) + suffix;
      }

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterEls = $$('[data-count]');
  if (counterEls.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => cio.observe(el));
  }

  /* ── Progress bar animation ─────────── */
  const progressFills = $$('.progress-fill[data-target]');
  if (progressFills.length && 'IntersectionObserver' in window) {
    const pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const target = entry.target.dataset.target;
          // Delay slightly for visual appeal
          setTimeout(function () {
            entry.target.style.width = target + '%';
          }, 400);
          pio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    progressFills.forEach(el => pio.observe(el));
  }

  /* ── FAQ accordion ──────────────────── */
  $$('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const isOpen = btn.classList.contains('open');
      const answerId = btn.getAttribute('aria-controls');
      const answer   = answerId ? document.getElementById(answerId) : btn.nextElementSibling;

      // Close all others
      $$('.faq-question.open').forEach(function (other) {
        if (other !== btn) {
          other.classList.remove('open');
          other.setAttribute('aria-expanded', 'false');
          const otherId = other.getAttribute('aria-controls');
          const otherAnswer = otherId
            ? document.getElementById(otherId)
            : other.nextElementSibling;
          if (otherAnswer) otherAnswer.classList.remove('open');
        }
      });

      if (isOpen) {
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        if (answer) answer.classList.remove('open');
      } else {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.classList.add('open');
      }
    });
  });

  /* ── Lead form validation & submit ─── */
  const form       = $('#leadForm');
  const formSuccess = $('#formSuccess');
  const submitBtn  = $('#submitBtn');
  const btnText    = $('#btnText');
  const btnSpinner = $('#btnSpinner');

  if (form) {
    // Real-time validation on blur
    form.addEventListener('focusout', function (e) {
      const input = e.target;
      if (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
        validateField(input);
      }
    }, true);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate all required fields
      const fields  = $$('[required]', form);
      let hasErrors = false;
      fields.forEach(function (field) {
        if (!validateField(field)) hasErrors = true;
      });

      if (hasErrors) {
        // Scroll to first error
        const firstError = $('.form-group.error', form);
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Show loading state
      if (btnText)    btnText.style.display    = 'none';
      if (btnSpinner) btnSpinner.style.display = 'inline';
      if (submitBtn)  submitBtn.disabled = true;

      // Simulate async submission (replace with real fetch/API call)
      setTimeout(function () {
        form.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';

        // Scroll success into view
        if (formSuccess) formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Show confirmation toast
        showToast('🎉', 'Request received!', 'We\'ll be in touch within 24 hours.');
      }, 1200);
    });
  }

  function validateField(field) {
    const group = field.closest('.form-group, .checkbox-group');
    if (!group) return true;

    const groupId = group.id;
    if (!groupId) return true;

    let valid = true;

    if (field.type === 'checkbox') {
      valid = field.checked;
    } else if (field.type === 'email') {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    } else if (field.type === 'tel') {
      // Phone is optional but if filled must look valid
      const val = field.value.trim();
      valid = val === '' || /^[+\d\s\-().]{7,20}$/.test(val);
    } else {
      valid = field.value.trim() !== '';
    }

    if (valid) {
      group.classList.remove('error');
    } else {
      group.classList.add('error');
    }

    return valid;
  }

  /* ── Toast notification helper ──────── */
  const toast      = $('#toast');
  const toastTitle = $('#toastTitle');
  const toastBody  = $('#toastBody');
  const toastIcon  = toast ? toast.querySelector('.toast-icon') : null;
  let toastTimer;

  function showToast(icon, title, body, duration) {
    if (!toast) return;
    duration = duration || 5000;

    if (toastIcon)  toastIcon.textContent  = icon;
    if (toastTitle) toastTitle.textContent = title;
    if (toastBody)  toastBody.textContent  = body;

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, duration);
  }

  // Make toast dismissible on click
  if (toast) {
    toast.addEventListener('click', function () {
      toast.classList.remove('show');
    });
  }

  /* ── Demo toasts: simulate live activity ─ */
  const demoToasts = [
    ['🤖', 'AI matched a new lead!',      'Score 96/100 — ready to contact.'],
    ['🏆', 'Deal closed — $1.2M',          'Converted via AI Brokers funnel.'],
    ['📈', 'Pipeline update',              '3 new hot leads scored this hour.'],
    ['⚡', 'Automated follow-up sent',    'Lead re-engaged after 7 days.'],
    ['🎯', 'High-value listing matched',  'Perfect buyer identified by AI.'],
  ];

  let demoIndex = 0;
  function scheduleDemoToast() {
    // Only show on desktop (don't distract mobile users filling the form)
    if (window.innerWidth < 680) return;

    const [icon, title, body] = demoToasts[demoIndex % demoToasts.length];
    demoIndex++;
    showToast(icon, title, body, 4000);
    // Next demo toast in 8-14 seconds
    const delay = 8000 + Math.random() * 6000;
    setTimeout(scheduleDemoToast, delay);
  }

  // Start first demo toast after 6 seconds
  setTimeout(scheduleDemoToast, 6000);

})();
