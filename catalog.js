
// =======================
// GOOGLE SHEETS INTEGRATION
// =======================
async function fetchSheetJSON(url) {
  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.substring(47, text.length - 2));
  return json.table.rows.map(r => r.c.map(c => (c ? c.v : null)));
}

const SHEET_PRODUCTS_URL =
  "https://docs.google.com/spreadsheets/d/1wOS4TwgaSC31jP989lAPvYUi6EDMLNMYMAzKQ4wYuhU/gviz/tq?tqx=out:json&sheet=products";

const SHEET_SIZES_URL =
  "https://docs.google.com/spreadsheets/d/1wOS4TwgaSC31jP989lAPvYUi6EDMLNMYMAzKQ4wYuhU/gviz/tq?tqx=out:json&sheet=sizes";

async function loadSheetData() {
  const productsRows = await fetchSheetJSON(SHEET_PRODUCTS_URL);
  const sizesRows = await fetchSheetJSON(SHEET_SIZES_URL);

  const productOverrides = {};
  productsRows.forEach(([id, price, enabled]) => {
    if (!id) return;
    productOverrides[id] = {
      price: price !== null ? Number(price) : null,
      enabled: enabled !== false
    };
  });

  const sizesByProduct = {};
  sizesRows.forEach(([id, size, stock]) => {
    if (!id || !size) return;
    if (!sizesByProduct[id]) sizesByProduct[id] = {};
    sizesByProduct[id][size] = Number(stock) || 0;
  });

  return { productOverrides, sizesByProduct };
}

/* =====================================================
   CATÁLOGO DRIPDROPSHOP + CUPÕES (CORRIGIDO)
===================================================== */

/* ---------- UTIL ---------- */

function priceToNumber(priceText) {
  if (typeof priceText === "number") return priceText;
  return parseFloat(
    String(priceText)
      .replace(/\s/g, "")
      .replace("€", "")
      .replace(",", ".")
  );
}

/* ---------- IMAGENS ---------- */

function normalizeImages(product) {
  if (Array.isArray(product.colors) && product.colors.length) {
    return product.colors[0].images || [];
  }
  if (Array.isArray(product.images)) return product.images;
  if (Array.isArray(product.image)) return product.image;
  if (typeof product.image === "string") return [product.image];
  return [];
}

/* ---------- CARD ---------- */

function createProductCard(product) {
  const article = document.createElement("article");
  article.className = "product-card";
  article.dataset.productId = product.id;

  const isAvailable = product.available !== false;
  const stockBadge = isAvailable
    ? '<span class="badge badge-stock">EM STOCK</span>'
    : '<span class="badge badge-out">ESGOTADO</span>';

  const images = normalizeImages(product);
  const safeName = product.name || "Produto";
  const safeDesc = product.description || "Artigo novo com etiqueta.";
  const safePriceText =
    typeof product.price === "number"
      ? `${product.price.toFixed(2)} €`
      : product.price || "";

  const priceNumber = priceToNumber(safePriceText);

  // Usar config do WhatsApp
  const whatsappBase = window.APP_CONFIG?.whatsapp?.baseUrl || 'https://wa.me/351XXXXXXXXX';
  const waText = encodeURIComponent(
    product.whatsappText ||
    `Olá, estou interessado em ${safeName}. Ainda está disponível?`
  );

  let colorThumbsHTML = "";

  if (Array.isArray(product.colors)) {
    colorThumbsHTML = `
      <div class="color-thumbs">
        ${product.colors.map((c, i) => `
          <div class="color-thumb ${i === 0 ? "active" : ""}"
               data-images='${JSON.stringify(c.images)}'
               data-color="${c.name}">
            <img src="${c.images[0]}" alt="${c.name}">
          </div>
        `).join("")}
      </div>
    `;
  }

  article.innerHTML = `
    <div class="product-image-wrapper">
      <img
        src="${images[0] || ""}"
        class="product-image"
        alt="${safeName}"
        data-index="0"
        data-images='${JSON.stringify(images)}'
      />

      ${images.length > 1 ? `
        <button class="img-nav prev" type="button" aria-label="Imagem anterior">‹</button>
        <button class="img-nav next" type="button" aria-label="Imagem seguinte">›</button>
      ` : ""}

      ${stockBadge}
    </div>

    <div class="product-info">
      <h3 class="product-title" data-base-title="${safeName}">
        ${safeName}
      </h3>
      
      <div class="product-info-top">
        <p class="product-description">${safeDesc}</p>
        ${colorThumbsHTML}
        <button class="sizes-toggle" type="button" aria-label="Ver tamanhos">Tamanhos ▾</button>
        <div class="sizes-panel" hidden></div>
      </div>
      
      <div class="product-footer">
        <div class="price-container">
          <span class="price-label">PREÇO</span>
          <span class="price"
                data-price="${priceNumber}">
            ${safePriceText}
          </span>
        </div>

        <a
          class="btn-wa-card"
          data-base="${whatsappBase}"
          data-wa-text="${decodeURIComponent(waText).replace(/"/g, "&quot;")}"
          href="${whatsappBase}?text=${waText}"
          target="_blank"
          rel="noopener"
        >
          <img src="assets/icons/whatsapp.png" class="wa-icon-small" alt="">
          WhatsApp
        </a>
      </div>

      <div class="vinted-footer-tag">
        <img src="assets/icons/Vinted_Logo_2022.png" class="vinted-logo-small" alt="Vinted">
        <span class="vinted-text">· Envios em 24h</span>
      </div>
    </div>
  `;

  return article;
}

/* ---------- RENDER ---------- */

function renderCatalog() {
  const grid = document.getElementById("products-grid");
  const loading = document.getElementById("products-loading");
  
  if (!grid || !Array.isArray(window.products)) return;

  // Show loading
  if (loading) loading.style.display = 'block';

  // Clear grid
  grid.innerHTML = "";

  // Render products
  window.products.forEach(p => grid.appendChild(createProductCard(p)));

  // Hide loading
  if (loading) loading.style.display = 'none';
}

/* ---------- CUPÕES ---------- */

function initCouponInput() {
  const input = document.getElementById("couponInput");
  if (!input) return;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const code = input.value.toUpperCase().trim();
      const coupons = window.APP_CONFIG?.coupons || {};
      
      if (coupons[code]) {
        localStorage.setItem("activeCoupon", code);
        applyCoupon(code);
      } else {
        input.classList.add("error");
        setTimeout(() => input.classList.remove("error"), 400);
      }
    }
  });
}

function applyCoupon(code) {
  const coupons = window.APP_CONFIG?.coupons || {};
  const discount = coupons[code];
  
  if (!discount) return;

  // Update all prices
  document.querySelectorAll(".price").forEach(el => {
    const original = parseFloat(el.dataset.price);
    const discounted = (original * (1 - discount)).toFixed(2);

    el.innerHTML = `
      <span class="old-price">${original.toFixed(2)} €</span>
      <span class="new-price">${discounted} €</span>
    `;
  });

  // Add animation once (fix do bug)
  document.querySelectorAll(".price").forEach(el => {
    el.classList.add("coupon-applied");
  });
  
  setTimeout(() => {
    document.querySelectorAll(".price").forEach(el => {
      el.classList.remove("coupon-applied");
    });
  }, 500);

  // Update WhatsApp links
  const whatsappBase = window.APP_CONFIG?.whatsapp?.baseUrl || 'https://wa.me/351XXXXXXXXX';
  
  document.querySelectorAll(".btn-wa-card").forEach(btn => {
    const originalText = btn.dataset.waText;
    btn.href = `${whatsappBase}?text=${encodeURIComponent(
      originalText + "\n\nCupão aplicado: " + code
    )}`;
  });

  // Disable input and update label
  input.disabled = true;
  const label = document.querySelector(".brutalist-label");
  if (label) label.textContent = "CÓDIGO ATIVO";
}

/* ---------- EVENTOS ---------- */

document.addEventListener("DOMContentLoaded", async () => {
  const { productOverrides, sizesByProduct } = await loadSheetData();

  // aplica overrides vindos do Sheets
  window.products = window.products
    .map(p => {
      const override = productOverrides[p.id];
      if (!override) return p;

      return {
        ...p,
        price: override.price ?? p.price,
        available: override.enabled !== false
      };
    })
    .filter(p => p.available !== false);

  renderCatalog();
  initCouponInput();

  const saved = localStorage.getItem("activeCoupon");
  const coupons = window.APP_CONFIG?.coupons || {};
  if (saved && coupons[saved]) applyCoupon(saved);
});


/* ---------- NAVEGAÇÃO DE IMAGENS ---------- */

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".img-nav");
  if (!btn) return;

  const wrapper = btn.closest(".product-image-wrapper");
  const img = wrapper.querySelector(".product-image");
  
  let images;
  try {
    images = JSON.parse(img.dataset.images || "[]");
  } catch (err) {
    console.error("Error parsing images:", err);
    return;
  }

  let index = parseInt(img.dataset.index || "0", 10);
  index = btn.classList.contains("next")
    ? (index + 1) % images.length
    : (index - 1 + images.length) % images.length;

  img.src = images[index];
  img.dataset.index = index;
});

/* ---------- SELETOR DE CORES ---------- */

document.addEventListener("click", (e) => {
  const thumb = e.target.closest(".color-thumb");
  if (!thumb) return;

  const wrapper = thumb.closest(".product-card");
  const img = wrapper.querySelector(".product-image");
  
  let images;
  try {
    images = JSON.parse(thumb.dataset.images || "[]");
  } catch (err) {
    console.error("Error parsing color images:", err);
    return;
  }

  if (!images.length) return;

  // Atualiza imagem
  img.src = images[0];
  img.dataset.images = JSON.stringify(images);
  img.dataset.index = "0";

  // Estado ativo
  wrapper.querySelectorAll(".color-thumb")
    .forEach(t => t.classList.remove("active"));
  thumb.classList.add("active");

  // Título dinâmico
  const title = wrapper.querySelector(".product-title");
  const baseTitle = title.dataset.baseTitle;
  title.textContent = `${baseTitle} — ${thumb.dataset.color}`;

  // Tamanhos por cor
  const sizesPanel = wrapper.querySelector(".sizes-panel");
  const sizesToggle = wrapper.querySelector(".sizes-toggle");

  sizesPanel.hidden = true;
  sizesToggle.textContent = "Tamanhos ▾";

  const productId = wrapper.dataset.productId;
  const product = window.products.find(p => p.id === productId);
  
  if (!product || !product.colors) return;
  
  const colorData = product.colors.find(c => c.name === thumb.dataset.color);

  sizesPanel.innerHTML = colorData?.sizes?.length
    ? colorData.sizes.map(s =>
        `<button class="size-btn" data-sku="${s.sku}">${s.size}</button>`
      ).join("")
    : `<div class="no-stock">Sem stock nesta cor</div>`;
});

/* ---------- TOGGLE DE TAMANHOS ---------- */

document.addEventListener("click", (e) => {
  const toggle = e.target.closest(".sizes-toggle");
  if (!toggle) return;

  const wrapper = toggle.closest(".product-card");
  const panel = wrapper.querySelector(".sizes-panel");

  const isHidden = panel.hidden;
  panel.hidden = !isHidden;
  toggle.textContent = isHidden ? "Tamanhos ▴" : "Tamanhos ▾";
});
