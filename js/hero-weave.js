(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Hero text refs ─────────────────────────────────────────────────
  var heroLabel  = document.getElementById('hero-label');
  var heroLine1  = document.getElementById('hero-line1');
  var heroLine2  = document.getElementById('hero-line2');
  var heroLine3  = document.getElementById('hero-line3');
  var heroBody   = document.getElementById('hero-body');
  var ctaWrap    = document.getElementById('hero-ctas');
  var heroCtas   = ctaWrap ? Array.from(ctaWrap.querySelectorAll('a')) : [];

  // ── Reduced-motion: skip entrance, show everything flat ────────────
  if (reduced) { return; }

  // ── Initial hidden states ──────────────────────────────────────────
  var textEls = [heroLabel, heroLine1, heroLine2, heroLine3, heroBody].filter(Boolean);
  gsap.set(textEls, { opacity: 0, y: 22 });
  gsap.set(heroCtas, { opacity: 0, y: 10, scale: 0.96 });

  // ── Entrance timeline ──────────────────────────────────────────────
  var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // Label
  if (heroLabel) tl.to(heroLabel, { opacity: 1, y: 0, duration: 0.42 }, '-=0.55');

  // H1 lines staggered
  if (heroLine1) tl.to(heroLine1, { opacity: 1, y: 0, duration: 0.44, clearProps: 'transform' }, '-=0.2');
  if (heroLine2) tl.to(heroLine2, { opacity: 1, y: 0, duration: 0.40, clearProps: 'transform' }, '-=0.22');
  if (heroLine3) tl.to(heroLine3, { opacity: 1, y: 0, duration: 0.40, clearProps: 'transform' }, '-=0.22');

  // Body
  if (heroBody) tl.to(heroBody, { opacity: 1, y: 0, duration: 0.40, clearProps: 'transform' }, '-=0.12');

  // CTAs
  if (heroCtas.length) {
    tl.to(heroCtas, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.36, stagger: 0.10,
      clearProps: 'transform,scale'
    }, '-=0.14');
  }

  // ── Stat counters (ScrollTrigger, fires on scroll-enter) ──────────
  if (typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.stat-val').forEach(function (el) {
    var target = parseInt(el.dataset.target, 10);
    var from   = parseInt(el.dataset.from   || '0', 10);
    var noFmt  = el.dataset.nofmt === 'true';
    if (isNaN(target)) return;

    var obj = { val: from };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = noFmt
              ? Math.round(obj.val).toString()
              : Math.round(obj.val).toLocaleString();
          }
        });
      }
    });
  });

})();
