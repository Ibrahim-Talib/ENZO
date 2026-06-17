(function () {
  'use strict';

  var line    = document.getElementById('timeline-line');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!line) return;

  if (reduced) {
    line.classList.add('drawn');
    return;
  }

  // Fire once when the timeline section enters the viewport — not on every scroll re-entry
  var section = line.closest('[data-timeline]') || line.parentElement;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        line.classList.add('drawn');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });

  io.observe(section);
})();
