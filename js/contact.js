(function () {
  'use strict';

  var cfg    = window.ENZO_CONFIG || {};
  var form   = document.querySelector('form[data-quote-form]');
  if (!form) return;
  var status = document.getElementById('form-status');
  var PHONE  = '923218230266';

  function setStatus(msg, ok) {
    if (!status) return;
    status.textContent = msg;
    status.style.color = ok ? '#1A5A2A' : '#8B3A2A';
  }

  // ── Prefill Quality / Article from ?quality= & ?article= (catalog deep-links) ──
  try {
    var params  = new URLSearchParams(window.location.search);
    var quality = params.get('quality');
    var article = params.get('article');
    var qEl     = document.getElementById('f-quality');
    if (qEl && (quality || article)) {
      qEl.value = [quality, article ? 'Art. ' + article : ''].filter(Boolean).join(' — ');
    }
  } catch (e) { /* URLSearchParams unsupported — non-fatal */ }

  // ── WhatsApp fallback (used when no Formspree ID is configured) ──
  function waLink(data) {
    var lines = [
      'Hello ENZO, I would like to request a quote.',
      data.name     ? 'Name: ' + data.name : '',
      data.company  ? 'Company: ' + data.company : '',
      data.email    ? 'Email: ' + data.email : '',
      data.phone    ? 'Phone: ' + data.phone : '',
      data.quantity ? 'Quantity: ' + data.quantity + ' m' : '',
      data.quality  ? 'Quality/Article: ' + data.quality : '',
      data.location ? 'Location: ' + data.location : '',
      data.message  ? 'Message: ' + data.message : ''
    ].filter(Boolean);
    return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fd   = new FormData(form);
    var data = {};
    fd.forEach(function (v, k) { data[k] = v.toString().trim(); });

    if (!data.name || !data.email) {
      setStatus('Please provide at least your name and email.', false);
      return;
    }

    // No backend configured yet → hand the inquiry off to WhatsApp
    if (!cfg.formspreeId) {
      setStatus('Opening WhatsApp to send your inquiry…', true);
      window.open(waLink(data), '_blank', 'noopener');
      return;
    }

    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    setStatus('Sending…', true);

    fetch('https://formspree.io/f/' + cfg.formspreeId, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd
    }).then(function (res) {
      if (res.ok) {
        form.reset();
        setStatus('Thank you — we will respond within 1 business day.', true);
      } else {
        setStatus('Something went wrong. Please reach us on WhatsApp instead.', false);
      }
    }).catch(function () {
      setStatus('Network error. Please reach us on WhatsApp instead.', false);
    }).finally(function () {
      if (btn) btn.disabled = false;
    });
  });
})();
