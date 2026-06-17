(function () {
  'use strict';

  var PHONE = '923218230266';

  function get(id) { return document.getElementById(id); }

  function readNum(id, fallback) {
    var v = parseFloat(get(id) && get(id).value);
    return isNaN(v) ? fallback : v;
  }

  function setText(id, val) {
    var el = get(id);
    if (el) el.textContent = val;
  }

  function calculate() {
    var reed      = Math.max(1, readNum('inp-reed',      72));
    var width     = Math.max(1, readNum('inp-width',     54));
    var warp      = Math.max(1, readNum('inp-warp',      40));
    var weft      = Math.max(1, readNum('inp-weft',      40));
    var warpRate  = Math.max(1, readNum('inp-warp-rate', 720));
    var weftRate  = Math.max(1, readNum('inp-weft-rate', 720));
    var picks     = Math.max(1, readNum('inp-picks',     56));
    var metres    = Math.max(10000, readNum('inp-metres', 10000));
    var fxRate    = readNum('inp-fx',  1) || 1;
    var bagWt     = readNum('inp-bag', 45) || 45;

    var machineEl  = get('inp-machine');
    var kinaraEl   = get('inp-kinara');
    var brokerEl   = get('inp-brokerage');
    var machineRate = parseFloat(machineEl  ? machineEl.value  : '0.85');
    var kinaraRate  = parseFloat(kinaraEl   ? kinaraEl.value   : '2.70');
    var brokerageOn = brokerEl ? brokerEl.value === '1' : false;

    // ── Exact formula per brief §4.3 — markups stay hidden (Option A) ──
    var totalEnds        = (reed + 4) * width;
    var warpWeightLbs    = totalEnds / 731 / Math.max(warp - 1, 1);
    var warpCost         = warpWeightLbs * warpRate;
    var weftWeightLbs    = (picks * width) / 731 / Math.max(weft, 1);
    var weftCost         = weftWeightLbs * weftRate;
    var conversionCost   = machineRate * picks;
    var baseCost         = warpCost + weftCost + conversionCost + kinaraRate;
    var brokerage        = brokerageOn ? baseCost * 0.01 : 0;
    var costBeforeHidden = ((baseCost * 1.10) + brokerage) * fxRate;
    var costMetre        = costBeforeHidden * 1.16;
    var costYard         = costMetre * 0.9144;
    var weightPerMetre   = (warpWeightLbs + weftWeightLbs) * 0.453592;
    var bags             = Math.ceil((weightPerMetre * metres) / bagWt);

    // ── Update output display ──
    setText('out-cost-metre',   'Rs ' + costMetre.toFixed(2));
    setText('out-cost-yard',    'Rs ' + costYard.toFixed(2));
    setText('out-weight-metre', weightPerMetre.toFixed(3) + ' kg');
    setText('out-bags',         bags.toString());

    // ── WhatsApp deep link ──
    var msg = encodeURIComponent(
      'Hello ENZO, I calculated a fabric cost of Rs ' + costMetre.toFixed(2) + '/metre ' +
      'and Rs ' + costYard.toFixed(2) + '/yard for ' + metres.toLocaleString() + ' metres. ' +
      'Please review and quote.'
    );
    var waBtn = get('btn-whatsapp');
    if (waBtn) waBtn.href = 'https://wa.me/' + PHONE + '?text=' + msg;
  }

  // Bind all calculator inputs
  document.querySelectorAll('[data-calc-input]').forEach(function (el) {
    el.addEventListener('input',  calculate);
    el.addEventListener('change', calculate);
  });

  // Initial calculation with defaults
  calculate();
})();
