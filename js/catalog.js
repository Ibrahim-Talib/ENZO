(function () {
  'use strict';

  // ── Render cards from PRODUCTS array ──
  var grid = document.getElementById('catalog-grid');
  if (!grid || typeof PRODUCTS === 'undefined') return;

  function buildSwatch(hex, name) {
    var wrap = document.createElement('span');
    wrap.className = 'flex items-center gap-1.5';
    var dot = document.createElement('span');
    dot.className = 'swatch-dot';
    dot.style.backgroundColor = hex;
    dot.setAttribute('aria-hidden', 'true');
    var label = document.createElement('span');
    label.style.cssText = 'font-size:0.6875rem;color:#9DB4C6;font-family:Inter,sans-serif;';
    label.textContent = name;
    wrap.appendChild(dot);
    wrap.appendChild(label);
    return wrap;
  }

  function buildCard(p) {
    var card = document.createElement('article');
    card.className = 'catalog-card flex flex-col rounded-lg overflow-hidden';
    card.dataset.category = p.category;
    card.style.cssText = 'background:#F5F8FA;border:1px solid #D6DEE6;transition:border-color 0.2s ease,box-shadow 0.2s ease;';

    card.addEventListener('mouseenter', function () {
      card.style.borderColor = '#5C7386';
      card.style.boxShadow   = '0 4px 24px rgba(14,24,37,0.18)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.borderColor = '#D6DEE6';
      card.style.boxShadow   = 'none';
    });

    // Image area
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
    card.appendChild(imgWrap);

    // Body
    var body = document.createElement('div');
    body.className = 'flex flex-col flex-1 p-4 gap-3';
    body.style.backgroundColor = '#F5F8FA';

    // Quality name + article number
    var nameEl = document.createElement('h3');
    nameEl.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:1.25rem;color:#0E1825;letter-spacing:0.04em;margin:0;";
    nameEl.textContent = p.name;

    var articleEl = document.createElement('p');
    articleEl.style.cssText = "font-family:'JetBrains Mono',monospace;font-size:0.8125rem;color:#5C7386;margin:0;";
    articleEl.textContent = p.comingSoon ? 'Coming Soon' : ('Art. ' + p.article);

    // Color swatches — static, never hover-only (accessibility requirement)
    var swatchWrap = document.createElement('div');
    swatchWrap.className = 'flex flex-wrap gap-x-3 gap-y-1.5';
    p.colors.forEach(function (name, i) {
      swatchWrap.appendChild(buildSwatch(p.colorHex[i] || '#9DB4C6', name));
    });

    body.appendChild(nameEl);
    body.appendChild(articleEl);
    body.appendChild(swatchWrap);

    // CTA
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
      cta.href      = '/contact.html?quality=' + encodeURIComponent(p.name) + '&article=' + encodeURIComponent(p.article);
      cta.className = 'btn-primary';
      cta.style.cssText = 'display:block;text-align:center;width:100%;border-radius:4px;';
      cta.textContent = 'Request Quote';
      ctaWrap.appendChild(cta);
    }

    body.appendChild(ctaWrap);
    card.appendChild(body);
    return card;
  }

  PRODUCTS.forEach(function (p) {
    grid.appendChild(buildCard(p));
  });

  // ── Filter tabs ──
  var tabs = document.querySelectorAll('[data-filter]');

  function applyFilter(cat) {
    document.querySelectorAll('[data-category]').forEach(function (card) {
      var match = cat === 'all' || card.dataset.category === cat;
      card.style.display = match ? '' : 'none';
    });
    tabs.forEach(function (t) {
      var active = t.dataset.filter === cat;
      t.setAttribute('aria-pressed', String(active));
      t.style.borderColor     = active ? '#9DB4C6'   : '#5C7386';
      t.style.color           = active ? '#F5F8FA'   : '#9DB4C6';
      t.style.backgroundColor = active ? '#1E2A39'   : 'transparent';
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { applyFilter(tab.dataset.filter); });
  });

  applyFilter('all');

  // ── Touch fallback: tap card to toggle lifestyle image ──
  if (matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.catalog-card').forEach(function (card) {
      var lifestyle = card.querySelector('.card-img-lifestyle');
      var fabric    = card.querySelector('.card-img-fabric');
      if (!lifestyle || !fabric) return;
      var revealed  = false;
      card.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        revealed = !revealed;
        lifestyle.style.opacity = revealed ? '1' : '0';
        fabric.style.opacity    = revealed ? '0' : '1';
      });
    });
  }
})();
