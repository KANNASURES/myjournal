/* ═══════════════════════════════════════════════════════════
   LUMIO — PARTICLES.JS CONFIGURATION
   Creates the floating star/dot background in the hero section.
   We keep this in a separate file so main.js stays clean.
   MAANG practice: one concern per file.
═══════════════════════════════════════════════════════════ */

function initParticles() {

  // Only run if the particles container exists on this page
  if (!document.getElementById('particles-js')) return;

  particlesJS('particles-js', {
    particles: {
      number: {
        value: 80,
        density: { enable: true, value_area: 900 }
      },
      color: {
        // We read the CSS variable so it respects dark/light theme
        value: ['#7c6aff', '#4fc3f7', '#a78bfa', '#ffffff']
      },
      shape: {
        type: 'circle'
      },
      opacity: {
        value: 0.35,
        random: true,
        anim: {
          enable: true,
          speed: 0.8,
          opacity_min: 0.05,
          sync: false
        }
      },
      size: {
        value: 2.2,
        random: true,
        anim: {
          enable: true,
          speed: 1.5,
          size_min: 0.3,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 160,
        color: '#7c6aff',
        opacity: 0.08,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.6,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: { opacity: 0.25 }
        },
        push: { particles_nb: 3 }
      }
    },
    retina_detect: true
  });
}

// Export so main.js can call it
window.initParticles = initParticles;