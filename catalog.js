function createProductCard(product) {
  const article = document.createElement("article");
  article.className = "product-card";

  const isAvailable = product.available !== false;
  const stockBadge = isAvailable 
    ? `<span class="badge badge-stock">EM STOCK</span>` 
    : `<span class="badge badge-out">ESGOTADO</span>`;

const images =
  (Array.isArray(product.images) && product.images.length) ? product.images
  : (Array.isArray(product.image) && product.image.length) ? product.image
  : (typeof product.image === "string" && product.image) ? [product.image]
  : [];

  article.innerHTML = `
    
  <div class="product-image-wrapper">
  <img
    src="${images[0]}"
    class="product-image"
    alt="${product.name}"
    data-index="0"
    data-images='${JSON.stringify(images)}'
  />

  ${images.length > 1 ? `
    <button class="img-nav prev">‹</button>
    <button class="img-nav next">›</button>
  ` : ""}

  ${stockBadge}
</div>



    <div class="product-info">
      <h3>${product.name}</h3>
      <p class="product-description">${product.description || 'Artigo novo com etiqueta.'}</p>
      
      <div class="product-pills">
        <span class="pill pill-size">Tamanhos · Sob consulta</span>
        <span class="pill pill-color">Cores · Sob consulta</span>
      </div>

      <div class="product-footer">
        <div class="price-container">
          <span class="price-label">PREÇO</span>
          <span class="price">${product.price}</span>
        </div>
        
        <a href="https://wa.me/351XXXXXXXXX?text=${encodeURIComponent(product.whatsappText)}"
           class="btn-wa-card"
           target="_blank">
         <img src="assets/icons/whatsapp.png" alt="WhatsApp" class="wa-icon-small">
          WhatsApp
        </a>
      </div>
      
      <div class="vinted-footer-tag">
        <img src="assets/icons/Vinted_Logo_2022.png"
             alt="Vinted"
             class="vinted-logo-small">
        <span class="vinted-text">· Envios em 24h</span>
      </div>
    </div>
  `;
  return article;
}

function renderCatalog() {
  const grid = document.getElementById("products-grid");
  if (!grid || !Array.isArray(products)) return;
  grid.innerHTML = "";
  products.forEach(p => grid.appendChild(createProductCard(p)));
}

document.addEventListener("DOMContentLoaded", renderCatalog);

document.addEventListener("mouseover", (e) => {
  const img = e.target.closest(".product-image");
  if (!img) return;

  const alt = img.dataset.altImage;
  if (alt) {
    img.dataset.original = img.src;
    img.src = alt;
  }
});

document.addEventListener("mouseout", (e) => {
  const img = e.target.closest(".product-image");
  if (!img || !img.dataset.original) return;

  img.src = img.dataset.original;
});
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".img-nav");
  if (!btn) return;

  const wrapper = btn.closest(".product-image-wrapper");
  const img = wrapper.querySelector(".product-image");

  const images = JSON.parse(img.dataset.images);
  let index = parseInt(img.dataset.index, 10);

  index = btn.classList.contains("next")
    ? (index + 1) % images.length
    : (index - 1 + images.length) % images.length;

  img.src = images[index];
  img.dataset.index = index;
});
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-image");
const closeBtn = document.querySelector(".modal-close");
const prevBtn = document.querySelector(".modal-nav.prev");
const nextBtn = document.querySelector(".modal-nav.next");

let modalImages = [];
let modalIndex = 0;

document.addEventListener("click", (e) => {
  const img = e.target.closest(".product-image");
  if (!img) return;

  modalImages = JSON.parse(img.dataset.images || "[]");
  modalIndex = parseInt(img.dataset.index || 0);

  modalImg.src = modalImages[modalIndex];
  modal.classList.add("active");
});

closeBtn.onclick = () => modal.classList.remove("active");

modal.onclick = (e) => {
  if (e.target === modal) modal.classList.remove("active");
};

prevBtn.onclick = () => {
  modalIndex = (modalIndex - 1 + modalImages.length) % modalImages.length;
  modalImg.src = modalImages[modalIndex];
};

nextBtn.onclick = () => {
  modalIndex = (modalIndex + 1) % modalImages.length;
  modalImg.src = modalImages[modalIndex];
};

document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("active")) return;
  if (e.key === "Escape") modal.classList.remove("active");
  if (e.key === "ArrowLeft") prevBtn.click();
  if (e.key === "ArrowRight") nextBtn.click();
});
