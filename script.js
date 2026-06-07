const ENZO_PHONE = "923218230266";
const HIDDEN_MARGIN = 1.16;
const currentPage = window.location.pathname.split("/").pop() || "index.html";

if (currentPage !== "index.html" && !sessionStorage.getItem("enzoEntered")) {
  window.location.replace("index.html");
}

const products = [
  { category: "wash", name: "Shabier Gold", article: "187", colors: ["Warm Tan", "Deep Mocha", "Rich Umber", "Pale Wheat"], tones: ["#a1744f", "#4a3328", "#6b442e", "#d8c498"], image: "placeholders/shabier-gold.svg" },
  { category: "wash", name: "Super Diamond", article: "202", colors: ["Slate Blue", "Deep Navy", "Steel Grey", "Ice Blue"], tones: ["#546b7f", "#17233e", "#778084", "#c9d9e7"], image: "placeholders/super-diamond.svg" },
  { category: "wash", name: "Pearl Suiting", article: "214", colors: ["Charcoal", "Ash Grey", "Silver", "Ivory Pearl"], tones: ["#252525", "#888985", "#b8b8b2", "#e4dfcf"], image: "placeholders/pearl-suiting.svg" },
  { category: "wash", name: "Swiss Gold", article: "218", colors: ["Antique Gold", "Bronze", "Sand", "Champagne"], tones: ["#b18a45", "#8a603c", "#c8b37e", "#dccda4"], image: "placeholders/swiss-gold.svg" },
  { category: "wash", name: "Haroon Soft", article: "229", colors: ["Forest", "Olive", "Sage", "Mist"], tones: ["#203528", "#697145", "#9aa783", "#c8cec0"], image: "placeholders/haroon-soft.svg" },
  { category: "wash", name: "8888", article: "122", colors: ["Burgundy", "Wine", "Rose", "Blush"], tones: ["#5e1725", "#4a1420", "#b87885", "#d8aaa5"], image: "placeholders/8888.svg" },
  { category: "wash", name: "Fenci Black", article: "213", colors: ["Jet Black", "Onyx", "Graphite"], tones: ["#020202", "#151515", "#414143"], image: "placeholders/fenci-black.svg" },
  { category: "wash", name: "Special Black", article: "227", colors: ["Pure Black", "Deep Black", "Matte Black"], tones: ["#000000", "#070707", "#1b1a18"], image: "placeholders/special-black.svg" },
  { category: "wash", name: "Black Sher", article: "259", colors: ["Black", "Dark Grey", "Charcoal"], tones: ["#050505", "#2a2a2a", "#383735"], image: "placeholders/black-sher.svg" },
  { category: "wash", name: "Four Season", article: "240", colors: ["Stone", "Taupe", "Linen", "Off White"], tones: ["#9a9183", "#7a6c5e", "#cbbf9e", "#e8e1d0"], image: "placeholders/four-season.svg" },
  { category: "wash", name: "Classic Dress", article: "204", colors: ["Navy", "Royal Blue", "Sky", "Powder"], tones: ["#13213b", "#244d90", "#86a9ce", "#c5d4e2"], image: "placeholders/classic-dress.svg" },
  { category: "cotton", name: "Pure Cotton", article: "Internal", colors: ["White", "Light Blue"], tones: ["#f1efe6", "#bfd8ee"], image: "placeholders/pure-cotton.svg" },
  { category: "boski", name: "Pure Boski", article: "B-01", colors: ["Cream", "Ivory", "Sand"], tones: ["#efe1ba", "#e6ddc4", "#c8b27e"], image: "placeholders/pure-boski.svg" },
  { category: "boski", name: "Blended Boski", article: "B-02", colors: ["Light Grey", "Stone", "Charcoal"], tones: ["#b7b7b2", "#8f897c", "#31302d"], image: "placeholders/blended-boski.svg" },
  { category: "winter", name: "Winter Range", article: "Coming Soon", colors: ["Wool", "Pashmina", "Tweed", "Velvet"], tones: ["#6f665c", "#b8a58b", "#4d5148", "#33213a"], image: "placeholders/winter-range.svg" }
];

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function inquiryUrl(message) {
  return `https://wa.me/${ENZO_PHONE}?text=${encodeURIComponent(message)}`;
}

function initPage() {
  if (currentPage === "index.html") {
    sessionStorage.setItem("enzoEntered", "true");
  }

  const preloader = qs(".preloader");
  requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
    if (preloader) {
      if (sessionStorage.getItem("enzoPreloaded")) {
        preloader.classList.add("is-done");
        return;
      }
      sessionStorage.setItem("enzoPreloaded", "true");
      setTimeout(() => preloader.classList.add("is-done"), 1250);
    }
  });

  qsa("[data-inquiry]").forEach((link) => {
    const message = link.dataset.inquiry || "Hello ENZO, I would like to request a B2B quotation.";
    link.setAttribute("href", inquiryUrl(message));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener");
  });

  initNav();
  initTransitions();
  // initThemeToggle();
  initReveals();
  initWeave();
  initCatalog();
  initCalculator();
}

// function initThemeToggle() {
//   const nav = qs(".nav-shell");
//   if (!nav) return;

//   const toggle = document.createElement("button");
//   toggle.type = "button";
//   toggle.className = "theme-toggle";
//   toggle.textContent = "Theme test";
//   toggle.setAttribute("aria-pressed", "false");
//   nav.appendChild(toggle);

//   toggle.addEventListener("click", () => {
//     const active = document.body.classList.toggle("theme-light");
//     toggle.setAttribute("aria-pressed", String(active));
//   });
// }

function initNav() {
  const toggle = qs(".nav-toggle");
  const links = qs(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function initTransitions() {
  const wipe = qs(".page-wipe");
  if (!wipe) return;

  qsa("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      document.body.classList.add("is-transitioning");
      wipe.classList.add("is-active");
      setTimeout(() => {
        window.location.href = href;
      }, 420);
    });
  });
}

function initReveals() {
  const items = qsa(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  items.forEach((item) => observer.observe(item));
}

function initWeave() {
  qsa("canvas[data-weave]").forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let frame = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(rect.width * scale);
      height = Math.floor(rect.height * scale);
      canvas.width = width;
      canvas.height = height;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }

    function draw() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.globalAlpha = 0.58;

      const gap = rect.width < 720 ? 18 : 26;
      for (let x = -gap; x < rect.width + gap; x += gap) {
        const tone = (Math.floor(x / gap) % 3) / 3;
        ctx.strokeStyle = `rgba(${150 + tone * 70}, ${134 + tone * 45}, ${105 + tone * 38}, 0.18)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + Math.sin(frame * 0.012 + x * 0.02) * 5, 0);
        ctx.lineTo(x - rect.height * 0.24, rect.height);
        ctx.stroke();
      }

      for (let y = -gap; y < rect.height + gap; y += gap) {
        ctx.strokeStyle = "rgba(230, 224, 210, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y + Math.cos(frame * 0.009 + y * 0.02) * 4);
        ctx.lineTo(rect.width, y + rect.width * 0.08);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      frame += 1;
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
  });
}

function swatches(product) {
  return `<div class="swatches">${product.tones.map((tone) => `<span class="swatch" style="--tone:${tone}" aria-hidden="true"></span>`).join("")}</div>`;
}

function productCard(product) {
  const message = `Hello ENZO, I would like to request a B2B quote for ${product.name}, article ${product.article}. Minimum order 10,000 metres.`;
  return `
    <article class="product reveal" data-category="${product.category}">
      <figure class="product__media">
        <img src="${product.image}" alt="${product.name} fabric placeholder">
      </figure>
      <div class="product__top">
        <h3>${product.name}</h3>
        <span class="article">${product.article}</span>
      </div>
      ${swatches(product)}
      <div class="product__colors">${product.colors.join(", ")}</div>
      <a class="btn" data-inquiry="${message}" href="#">Request quote</a>
    </article>
  `;
}

function initCatalog() {
  const grid = qs("[data-catalog-grid]");
  if (!grid) return;

  grid.innerHTML = products.map(productCard).join("");
  qsa("[data-inquiry]", grid).forEach((link) => {
    link.href = inquiryUrl(link.dataset.inquiry);
    link.target = "_blank";
    link.rel = "noopener";
  });

  const buttons = qsa("[data-filter]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      qsa(".product", grid).forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
      });
    });
  });

  initReveals();
}

function initCalculator() {
  const form = qs("[data-calculator]");
  if (!form) return;

  const output = {
    metre: qs("[data-result='metre']"),
    yard: qs("[data-result='yard']"),
    weight: qs("[data-result='weight']"),
    bags: qs("[data-result='bags']"),
    cta: qs("[data-calc-inquiry]")
  };

  function number(name) {
    return parseFloat(form.elements[name].value) || 0;
  }

  function calculate() {
    const reed = number("reed");
    const width = number("width");
    const warp = number("warp");
    const weft = number("weft");
    const warpRate = number("warpRate");
    const weftRate = number("weftRate");
    const picks = number("picks");
    const metres = number("metres");
    const machineRate = number("machine");
    const kinaraRate = number("kinara");
    const fxRate = number("fxRate") || 1;
    const bagWeight = number("bagWeight") || 45;
    const brokerageEnabled = number("brokerage") === 1;

    const totalEnds = (reed + 4) * width;
    const warpWeightLbs = totalEnds / 731 / Math.max(warp - 1, 1);
    const warpCost = warpWeightLbs * warpRate;
    const weftWeightLbs = (picks * width) / 731 / Math.max(weft, 1);
    const weftCost = weftWeightLbs * weftRate;
    const conversionCost = machineRate * picks;
    const baseCost = warpCost + weftCost + conversionCost + kinaraRate;
    const brokerage = brokerageEnabled ? baseCost * 0.01 : 0;
    const costBeforeHiddenMargin = (((baseCost) * 1.10) + brokerage) * fxRate;
    const costMetre = costBeforeHiddenMargin * HIDDEN_MARGIN;
    const costYard = costMetre * 0.9144;
    const weightPerMetre = (warpWeightLbs + weftWeightLbs) * 0.453592;
    const bags = Math.ceil((weightPerMetre * metres) / bagWeight);

    output.metre.textContent = `Rs ${costMetre.toFixed(2)}`;
    output.yard.textContent = `Rs ${costYard.toFixed(2)}`;
    output.weight.textContent = `${weightPerMetre.toFixed(3)} kg`;
    output.bags.textContent = `${bags}`;

    const message = `Hello ENZO, I calculated a fabric cost of Rs ${costMetre.toFixed(2)}/metre and Rs ${costYard.toFixed(2)}/yard for ${metres || 10000} metres. Please review and quote.`;
    output.cta.href = inquiryUrl(message);
  }

  form.addEventListener("input", calculate);
  calculate();
}

document.addEventListener("DOMContentLoaded", initPage);
