(function () {
  'use strict';

  var track   = document.getElementById('catalog-track');
  var prevBtn = document.getElementById('carousel-prev');
  var nextBtn = document.getElementById('carousel-next');
  var dotsEl  = document.getElementById('carousel-dots');

  if (!track || typeof PRODUCTS === 'undefined') return;

  var isTouch       = matchMedia('(hover: none)').matches;
  var allCards      = [];
  var filteredCards = [];
  var currentIdx    = 0;
  var autoTimer     = null;
  var resumeTimer   = null;
  var AUTO_INTERVAL = 4000;

  // ── Helpers ──────────────────────────────────────────────────────────
  function getPerView() {
    if (window.innerWidth >= 1024) return 3;
    return 2;
  }

  function buildSwatch(hex, name) {
    // Dot only — the colour name stays accessible via label/tooltip, not visible text.
    var dot = document.createElement('span');
    dot.className = 'swatch-dot';
    dot.style.backgroundColor = hex;
    dot.setAttribute('role', 'img');
    dot.setAttribute('aria-label', name);
    dot.setAttribute('title', name);
    return dot;
  }

  function buildCard(p) {
    var card = document.createElement('article');
    card.className = 'catalog-card flex flex-col rounded-xl overflow-hidden';
    card.dataset.category = p.category;
    card.style.cssText = 'background:#F5F8FA;border:1px solid #D6DEE6;transition:border-color 0.2s ease,box-shadow 0.2s ease;flex-shrink:0;';

    card.addEventListener('mouseenter', function () {
      card.style.borderColor = '#5C7386';
      card.style.boxShadow   = '0 4px 24px rgba(14,24,37,0.18)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.borderColor = '#D6DEE6';
      card.style.boxShadow   = 'none';
    });

    var imgWrap = document.createElement('div');
    imgWrap.className = 'card-img-wrap';

    var imgFabric = document.createElement('img');
    imgFabric.className = 'card-img-fabric';
    imgFabric.src    = p.imgProduct;
    imgFabric.alt    = p.name + ' fabric texture';
    imgFabric.width  = 400;
    imgFabric.height = 300;

    var imgLife = document.createElement('img');
    imgLife.className = 'card-img-lifestyle';
    imgLife.src     = p.imgLifestyle;
    imgLife.alt     = p.name + ' lifestyle';
    imgLife.width   = 400;
    imgLife.height  = 300;
    imgLife.loading = 'lazy';

    imgWrap.appendChild(imgFabric);
    imgWrap.appendChild(imgLife);

    if (p.inStock && !p.comingSoon) {
      var stock = document.createElement('span');
      stock.className = 'card-stock';
      stock.textContent = 'In Stock';
      imgWrap.appendChild(stock);
    }

    card.appendChild(imgWrap);

    var body = document.createElement('div');
    body.className = 'flex flex-col flex-1 p-4 gap-3';
    body.style.backgroundColor = '#F5F8FA';

    if (p.eyebrow) {
      var eyebrowEl = document.createElement('p');
      eyebrowEl.className = 'card-eyebrow';
      eyebrowEl.textContent = p.eyebrow;
      body.appendChild(eyebrowEl);
    }

    var nameEl = document.createElement('h3');
    nameEl.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:1.25rem;color:#0E1825;letter-spacing:0.04em;margin:0;";
    nameEl.textContent = p.name;
    body.appendChild(nameEl);

    if (p.description) {
      var descEl = document.createElement('p');
      descEl.className = 'card-desc';
      descEl.textContent = p.description;
      body.appendChild(descEl);
    }

    var swatchWrap = document.createElement('div');
    swatchWrap.className = 'flex flex-wrap gap-x-3 gap-y-1.5';
    p.colors.forEach(function (name, i) {
      swatchWrap.appendChild(buildSwatch(p.colorHex[i] || '#9DB4C6', name));
    });
    body.appendChild(swatchWrap);

    // ── Spec row: construction · composition · tag ──
    if (p.construction || p.composition || p.tag) {
      var spec = document.createElement('div');
      spec.className = 'card-spec';

      function specCol(val, key) {
        var col = document.createElement('div');
        var v = document.createElement('p');
        v.className = 'card-spec-val';
        v.textContent = val;
        var k = document.createElement('p');
        k.className = 'card-spec-key';
        k.textContent = key;
        col.appendChild(v);
        col.appendChild(k);
        return col;
      }

      if (p.construction) spec.appendChild(specCol(p.construction, 'Construction'));
      if (p.composition)  spec.appendChild(specCol(p.composition, 'Composition'));
      if (p.tag) {
        var tagEl = document.createElement('span');
        tagEl.className = 'card-tag';
        tagEl.textContent = p.tag;
        spec.appendChild(tagEl);
      }
      body.appendChild(spec);
    }

    var ctaWrap = document.createElement('div');
    ctaWrap.className = 'mt-auto pt-3';
    ctaWrap.style.borderTop = '1px solid #D6DEE6';

    if (p.comingSoon) {
      var badge = document.createElement('span');
      badge.style.cssText = "display:block;text-align:center;font-family:'Inter',sans-serif;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:#5C7386;padding:0.5rem 0;";
      badge.textContent = 'Available Soon';
      ctaWrap.appendChild(badge);
    } else {
      var cta = document.createElement('a');
      cta.href      = 'contact.html?quality=' + encodeURIComponent(p.name) + '&article=' + encodeURIComponent(p.article);
      cta.className = 'btn-primary';
      cta.style.cssText = 'display:block;text-align:center;width:100%;border-radius:4px;';
      cta.textContent = 'Request Quote';
      ctaWrap.appendChild(cta);
    }

    body.appendChild(ctaWrap);
    card.appendChild(body);

    if (isTouch) {
      var revealed = false;
      card.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        revealed = !revealed;
        imgLife.style.opacity   = revealed ? '1' : '0';
        imgFabric.style.opacity = revealed ? '0' : '1';
      });
    }

    return card;
  }

  // ── Build all cards once ──────────────────────────────────────────
  PRODUCTS.forEach(function (p) { allCards.push(buildCard(p)); });

  // ── Autoplay ──────────────────────────────────────────────────────
  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function () {
      var maxIdx = Math.max(0, filteredCards.length - getPerView());
      currentIdx = currentIdx >= maxIdx ? 0 : currentIdx + 1;
      updateCarousel();
    }, AUTO_INTERVAL);
  }

  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  function delayedResume() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAuto, 5000);
  }

  // ── Carousel update ───────────────────────────────────────────────
  function updateCarousel() {
    var n        = filteredCards.length;
    var perView  = getPerView();
    var gap      = 24;
    var viewportW = track.parentElement.offsetWidth || 320;
    var cardW    = Math.max(150, (viewportW - gap * (perView - 1)) / perView);
    var maxIdx   = Math.max(0, n - perView);

    currentIdx = Math.min(currentIdx, maxIdx);

    // Size each card
    filteredCards.forEach(function (c, i) {
      c.style.width       = cardW + 'px';
      c.style.marginRight = i < n - 1 ? gap + 'px' : '0';
    });

    // Slide by one card width each step
    track.style.transform = 'translateX(-' + (currentIdx * (cardW + gap)) + 'px)';

    // Button states
    if (prevBtn) prevBtn.disabled = currentIdx <= 0;
    if (nextBtn) nextBtn.disabled = currentIdx >= maxIdx;

    // Dots: one per position (hidden when too many)
    if (dotsEl) {
      dotsEl.innerHTML = '';
      if (maxIdx <= 8) {
        for (var i = 0; i <= maxIdx; i++) {
          var dot = document.createElement('button');
          dot.className = 'carousel-dot' + (i === currentIdx ? ' active' : '');
          dot.setAttribute('aria-label', 'Position ' + (i + 1));
          (function (idx) {
            dot.addEventListener('click', function () {
              currentIdx = Math.min(idx, Math.max(0, filteredCards.length - getPerView()));
              stopAuto();
              delayedResume();
              updateCarousel();
            });
          })(i);
          dotsEl.appendChild(dot);
        }
      }
    }
  }

  // ── Filter ────────────────────────────────────────────────────────
  function applyFilter(cat) {
    filteredCards = cat === 'all'
      ? allCards.slice()
      : allCards.filter(function (c) { return c.dataset.category === cat; });

    currentIdx = 0;
    track.innerHTML = '';
    filteredCards.forEach(function (c) { track.appendChild(c); });
    updateCarousel();

    document.querySelectorAll('[data-filter]').forEach(function (t) {
      var active = t.dataset.filter === cat;
      t.setAttribute('aria-pressed', String(active));
      t.style.borderColor     = active ? '#9DB4C6' : '#5C7386';
      t.style.color           = active ? '#F5F8FA' : '#9DB4C6';
      t.style.backgroundColor = active ? '#1E2A39' : 'transparent';
    });
  }

  // ── Navigation ────────────────────────────────────────────────────
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentIdx > 0) {
        currentIdx--;
        stopAuto();
        delayedResume();
        updateCarousel();
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      var maxIdx = Math.max(0, filteredCards.length - getPerView());
      if (currentIdx < maxIdx) {
        currentIdx++;
        stopAuto();
        delayedResume();
        updateCarousel();
      }
    });
  }

  // ── Touch swipe ───────────────────────────────────────────────────
  var touchStartX = 0;
  track.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 50) { delayedResume(); return; }
    var maxIdx = Math.max(0, filteredCards.length - getPerView());
    if (dx < 0 && currentIdx < maxIdx) { currentIdx++; updateCarousel(); }
    if (dx > 0 && currentIdx > 0)      { currentIdx--; updateCarousel(); }
    delayedResume();
  }, { passive: true });

  // ── Hover pause ──────────────────────────────────────────────────
  var viewport = track.parentElement;
  viewport.addEventListener('mouseenter', stopAuto);
  viewport.addEventListener('mouseleave', function () {
    clearTimeout(resumeTimer);
    startAuto();
  });

  // ── Resize ────────────────────────────────────────────────────────
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateCarousel, 200);
  });

  // ── Filter tabs + init ────────────────────────────────────────────
  document.querySelectorAll('[data-filter]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      stopAuto();
      applyFilter(tab.dataset.filter);
      delayedResume();
    });
  });

  applyFilter('all');
  startAuto();

})();
