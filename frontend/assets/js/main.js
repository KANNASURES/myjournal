/* ═══════════════════════════════════════════════════════════
   LUMIO — MAIN.JS
   Handles: Theme toggle, Navbar scroll, Hamburger menu,
            AOS init, Vanilla-Tilt, Mood buttons,
            Back-to-top, Smooth scroll, Active nav links
   
   MAANG practice: Use IIFE to avoid polluting global scope.
   Each feature is its own clearly named function.
═══════════════════════════════════════════════════════════ */

(function ($) {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     1. THEME TOGGLE (Dark / Light)
     Saves preference to localStorage so it persists on reload.
  ───────────────────────────────────────────────────────── */
  function initThemeToggle() {
    const $html       = $('html');
    const $btn        = $('#themeToggle');
    const $icon       = $('#themeIcon');

    // On load: read saved preference, default to dark
    const savedTheme  = localStorage.getItem('lumio-theme') || 'dark';
    applyTheme(savedTheme);

    // On click: flip the theme
    $btn.on('click', function () {
      const current = $html.attr('data-theme');
      const next    = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('lumio-theme', next);
    });

    function applyTheme(theme) {
      $html.attr('data-theme', theme);

      if (theme === 'dark') {
        $icon.removeClass('bi-sun-fill').addClass('bi-moon-stars-fill');
        $btn.attr('aria-label', 'Switch to light mode');
      } else {
        $icon.removeClass('bi-moon-stars-fill').addClass('bi-sun-fill');
        $btn.attr('aria-label', 'Switch to dark mode');
      }
    }
  }


  /* ─────────────────────────────────────────────────────────
     2. NAVBAR — Scroll Shrink Effect
     Adds .scrolled class when user scrolls past 60px.
     CSS then adds border + shadow to the nav.
  ───────────────────────────────────────────────────────── */
  function initNavScroll() {
    const $nav = $('#mainNav');

    // Run once on load in case page is already scrolled
    toggleScrolled();

    $(window).on('scroll.navscroll', function () {
      toggleScrolled();
    });

    function toggleScrolled() {
      if ($(window).scrollTop() > 60) {
        $nav.addClass('scrolled');
      } else {
        $nav.removeClass('scrolled');
      }
    }
  }


  /* ─────────────────────────────────────────────────────────
     3. HAMBURGER MENU (Mobile)
     Toggles the mobile dropdown menu open/closed.
  ───────────────────────────────────────────────────────── */
  function initHamburger() {
    const $burger = $('#hamburger');
    const $menu   = $('#mobileMenu');

    $burger.on('click', function () {
      const isOpen = $menu.hasClass('open');

      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when a mobile nav link is clicked
    $menu.find('a').on('click', function () {
      closeMobileMenu();
    });

    // Close menu when clicking outside
    $(document).on('click.hamburger', function (e) {
      if (
        !$(e.target).closest('#mainNav').length &&
        $menu.hasClass('open')
      ) {
        closeMobileMenu();
      }
    });

    function openMobileMenu() {
      $menu.addClass('open');
      $burger.addClass('open');
      $burger.attr('aria-expanded', 'true');
    }

    function closeMobileMenu() {
      $menu.removeClass('open');
      $burger.removeClass('open');
      $burger.attr('aria-expanded', 'false');
    }
  }


  /* ─────────────────────────────────────────────────────────
     4. AOS — ANIMATE ON SCROLL
     Initialises the AOS library once DOM is ready.
  ───────────────────────────────────────────────────────── */
  function initAOS() {
    if (typeof AOS === 'undefined') return;

    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,          // animate only the first time
      offset: 80,          // px from bottom of viewport to trigger
      delay: 0,
      anchorPlacement: 'top-bottom'
    });
  }


  /* ─────────────────────────────────────────────────────────
     5. VANILLA-TILT — 3D Journal Card
     Adds a smooth 3D perspective tilt on mouse move.
  ───────────────────────────────────────────────────────── */
  function initTilt() {
    const card = document.getElementById('journalCard');
    if (!card || typeof VanillaTilt === 'undefined') return;

    VanillaTilt.init(card, {
      max: 12,           // max tilt degrees
      speed: 600,        // tilt speed (ms)
      glare: true,       // light glare overlay
      'max-glare': 0.12, // subtle glare intensity
      perspective: 1000, // depth of 3D effect
      scale: 1.03        // slight scale up on hover
    });
  }


  /* ─────────────────────────────────────────────────────────
     6. MOOD BUTTONS (Landing Page preview)
     Interactive emoji mood selector with label update.
  ───────────────────────────────────────────────────────── */
  function initMoodButtons() {
    const moodLabels = {
      awful: '😞  Feeling awful today',
      bad:   '😕  Not my best day',
      okay:  '😌  Feeling peaceful',
      good:  '😊  Doing well!',
      great: '🤩  Absolutely amazing!'
    };

    $(document).on('click', '.mood-btn', function () {
      const $this = $(this);
      const mood  = $this.data('mood');

      // Update active state
      $('.mood-btn').removeClass('active');
      $this.addClass('active');

      // Update label text with animation
      const $label = $('.mood-selected-label');
      $label.css({ opacity: 0, transform: 'translateY(6px)' });

      setTimeout(function () {
        $label.text(moodLabels[mood] || 'Feeling ' + mood);
        $label.animate({ opacity: 1 }, 200);
        $label.css('transform', 'translateY(0)');
      }, 150);
    });
  }


  /* ─────────────────────────────────────────────────────────
     7. BACK TO TOP BUTTON
     Appears after scrolling 400px. Smooth scrolls to top.
  ───────────────────────────────────────────────────────── */
  function initBackToTop() {
    const $btn = $('#backToTop');

    $(window).on('scroll.btt', function () {
      if ($(this).scrollTop() > 400) {
        $btn.addClass('visible');
      } else {
        $btn.removeClass('visible');
      }
    });

    $btn.on('click', function () {
      $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
    });
  }


  /* ─────────────────────────────────────────────────────────
     8. SMOOTH SCROLL — Anchor Links
     Handles all in-page href="#section" links smoothly,
     accounting for the fixed navbar height.
  ───────────────────────────────────────────────────────── */
  function initSmoothScroll() {
    $(document).on('click', 'a[href^="#"]', function (e) {
      const target = $(this).attr('href');

      // Skip if it's just "#" or empty
      if (!target || target === '#') return;

      const $target = $(target);
      if (!$target.length) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height'),
        10
      ) || 72;

      const offsetTop = $target.offset().top - navHeight - 16;

      $('html, body').animate(
        { scrollTop: offsetTop },
        700,
        'swing'
      );
    });
  }


  /* ─────────────────────────────────────────────────────────
     9. ACTIVE NAV LINK — Highlight on Scroll
     Watches which section is in viewport and highlights
     the matching nav link.
  ───────────────────────────────────────────────────────── */
  function initActiveNavLink() {
    const sections = $('section[id]');
    const $navLinks = $('.nav-links a');

    if (!sections.length || !$navLinks.length) return;

    $(window).on('scroll.activenav', function () {
      const scrollY = $(this).scrollTop();
      const navH    = 72 + 20;

      sections.each(function () {
        const $section = $(this);
        const top      = $section.offset().top - navH;
        const bottom   = top + $section.outerHeight();
        const id       = $section.attr('id');

        if (scrollY >= top && scrollY < bottom) {
          $navLinks.removeClass('active');
          $navLinks.filter('[href="#' + id + '"]').addClass('active');
        }
      });
    });
  }


  /* ─────────────────────────────────────────────────────────
     10. HERO BADGE — Typewriter Effect
     The hero badge text types itself in on page load.
  ───────────────────────────────────────────────────────── */
  function initHeroBadge() {
    const $badge = $('.hero-badge');
    if (!$badge.length) return;

    // We just add a subtle fade-in with a slight delay
    $badge.css({ opacity: 0 });
    setTimeout(function () {
      $badge.animate({ opacity: 1 }, 800);
    }, 400);
  }


  /* ─────────────────────────────────────────────────────────
     11. JOURNAL CARD — Live Date Update
     Keeps the date in the floating journal card current.
  ───────────────────────────────────────────────────────── */
  function initLiveDate() {
    const $dateEl = $('.jc-date');
    if (!$dateEl.length) return;

    const now  = new Date();
    const days = [
      'Sunday','Monday','Tuesday','Wednesday',
      'Thursday','Friday','Saturday'
    ];
    const months = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'
    ];

    const formatted =
      days[now.getDay()] + ', ' +
      months[now.getMonth()] + ' ' +
      now.getDate() + ', ' +
      now.getFullYear();

    $dateEl.text(formatted);
  }


  /* ─────────────────────────────────────────────────────────
     12. PARTICLES — reinit on theme change
     Particles color does not auto-update with CSS variables,
     so we track theme changes and nudge opacity.
  ───────────────────────────────────────────────────────── */
  function watchThemeForParticles() {
    const observer = new MutationObserver(function () {
      // Particles colors are baked in, so we just adjust opacity
      const theme = document.documentElement.getAttribute('data-theme');
      const canvas = document.querySelector('#particles-js canvas');
      if (!canvas) return;

      canvas.style.opacity = theme === 'light' ? '0.4' : '1';
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }


  /* ─────────────────────────────────────────────────────────
     INIT — Run everything when DOM is ready
  ───────────────────────────────────────────────────────── */
  $(document).ready(function () {
    initThemeToggle();
    initNavScroll();
    initHamburger();
    initAOS();
    initMoodButtons();
    initBackToTop();
    initSmoothScroll();
    initActiveNavLink();
    initHeroBadge();
    initLiveDate();
    watchThemeForParticles();

    // Particles and Tilt need the DOM fully painted
    // so we wait one frame before initialising them
    setTimeout(function () {
      if (typeof window.initParticles === 'function') {
        window.initParticles();
      }
      initTilt();
    }, 50);

    console.log('✦ Lumio JS loaded successfully');
  });

}(jQuery));