(function () {
  'use strict';

  var fine    = matchMedia('(pointer: fine)').matches;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cursor  = document.getElementById('enzo-cursor');

  // ── Custom cursor: pointer:fine + no reduced-motion only ──
  if (cursor && fine && !reduced) {
    cursor.style.opacity = '1';
    var cx = 0, cy = 0, tx = 0, ty = 0;

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });

    // Revert to native cursor over form controls and the calculator output panel
    document.addEventListener('mouseover', function (e) {
      var inNativeZone = e.target.closest('input, select, textarea, button, [data-no-cursor]');
      cursor.style.opacity = inNativeZone ? '0' : '1';
    });

    (function loop() {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      cursor.style.transform = 'translate(' + cx + 'px, ' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  // ── Scroll fade-up via IntersectionObserver ──
  if (!reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-up').forEach(function (el) {
      io.observe(el);
    });
  } else {
    // Immediately reveal when motion is reduced — no animation
    document.querySelectorAll('.fade-up').forEach(function (el) {
      el.classList.add('visible');
    });
  }
})();
