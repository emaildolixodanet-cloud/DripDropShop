// ==========================================
// DRIPDROPSHOP ADMIN - INVENTÁRIO v2
// ==========================================
// Fixes: no-flicker stock, size measurements, fast selects

let items = [
  { id: "RL-HOODIE", color: "Azul", size: "M", stock: 5, price: 35 },
  { id: "RL-HOODIE", color: "Azul", size: "L", stock: 2, price: 35 },
  { id: "RL-HOODIE", color: "Verde", size: "M", stock: 1, price: 35 },
  { id: "CARH-JACKET", color: "Preto", size: "L", stock: 3, price: 55 }
];

// ==========================================
// MEDIDAS POR TAMANHO (fictícias - editar depois)
// Formato: O = Ombro, C = Comprimento, L = Largura
// ==========================================
const SIZE_MEASUREMENTS = {
  "XS": "O - 38 / C - 64 / L - 46",
  "S":  "O - 40 / C - 68 / L - 48",
  "M":  "O - 42 / C - 72 / L - 52",
  "L":  "O - 44 / C - 76 / L - 56",
  "XL": "O - 46 / C - 80 / L - 60",
  "XXL":"O - 48 / C - 84 / L - 64"
};

// DOM Elements
const list = document.getElementById("stockList");
const modal = document.getElementById("modal");
const emptyState = document.getElementById("emptyState");
const totalValue = document.getElementById("totalValue");
const totalUnits = document.getElementById("totalUnits");

// State
let editingIndex = null;
let expandedGroups = {};

/* ==========================================
   HELPERS
========================================== */

const uniq = (arr) => [...new Set(arr)];

function resetModal() {
  m_product.value = "";
  m_product_new.value = "";
  m_product_new.style.display = "none";
  m_color.value = "";
  m_color_new.value = "";
  m_color_new.style.display = "none";
  m_size.value = "";
  m_stock.value = "";
  m_price.value = "";
}

/* ==========================================
   PARTIAL UPDATE - Totals only (no flicker)
========================================== */

function updateTotals() {
  const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
  const totalVal = items.reduce((sum, item) => sum + (item.stock * item.price), 0);
  totalUnits.textContent = totalStock;
  totalValue.textContent = totalVal.toFixed(2) + "€";
}

/* ==========================================
   PARTIAL UPDATE - Single item stock (no flicker)
========================================== */

function updateItemDisplay(index) {
  const item = items[index];
  if (!item) return;

  // Find the item's stock text by data attribute
  const stockEl = list.querySelector(`[data-stock-index="${index}"]`);
  if (stockEl) {
    stockEl.textContent = `Stock: ${item.stock} · ${item.price}€`;
  }

  // Update group summary
  const groupItems = items.filter(i => i.id === item.id);
  const groupStock = groupItems.reduce((s, v) => s + v.stock, 0);
  const groupValue = groupItems.reduce((s, v) => s + (v.stock * v.price), 0);

  const groupEl = list.querySelector(`[data-group-id="${item.id}"]`);
  if (groupEl) {
    const unitsEl = groupEl.querySelector('[data-group-units]');
    const valueEl = groupEl.querySelector('[data-group-value]');
    const badgeEl = groupEl.querySelector('[data-group-badge]');

    if (unitsEl) unitsEl.textContent = `${groupStock} unidades`;
    if (valueEl) valueEl.textContent = `${groupValue.toFixed(2)}€`;

    if (badgeEl) {
      if (groupStock === 0) {
        badgeEl.className = 'badge badge--critical';
        badgeEl.textContent = 'ESGOTADO';
      } else if (groupStock <= 3) {
        badgeEl.className = 'badge badge--warning';
        badgeEl.textContent = 'BAIXO';
      } else {
        badgeEl.className = 'badge badge--success';
        badgeEl.textContent = 'EM STOCK';
      }
    }
  }

  updateTotals();
}

/* ==========================================
   SELECTS (Dinâmicos - Otimizados com Fragment)
========================================== */

function populateProductSelect(isEdit) {
  const fragment = document.createDocumentFragment();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = "Selecionar produto...";
  fragment.appendChild(placeholder);

  uniq(items.map(i => i.id)).sort().forEach(id => {
    const o = document.createElement("option");
    o.value = id;
    o.textContent = id;
    fragment.appendChild(o);
  });

  if (!isEdit) {
    const o = document.createElement("option");
    o.value = "__new";
    o.textContent = "➕ Novo produto";
    fragment.appendChild(o);
  }

  m_product.innerHTML = "";
  m_product.appendChild(fragment);
}

function populateColorSelect(isEdit, productId = null) {
  const fragment = document.createDocumentFragment();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = "Selecionar cor...";
  fragment.appendChild(placeholder);

  const colors = productId
    ? items.filter(i => i.id === productId).map(i => i.color)
    : items.map(i => i.color);

  uniq(colors).sort().forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    fragment.appendChild(o);
  });

  if (!isEdit) {
    const o = document.createElement("option");
    o.value = "__new";
    o.textContent = "➕ Nova cor";
    fragment.appendChild(o);
  }

  m_color.innerHTML = "";
  m_color.appendChild(fragment);
}

/* ==========================================
   FULL RENDER (only when structure changes)
========================================== */

function render() {
  list.innerHTML = "";

  if (items.length === 0) {
    emptyState.style.display = "block";
    updateTotals();
    return;
  }

  emptyState.style.display = "none";

  // Group by Product ID
  const byId = {};
  items.forEach((it, i) => {
    if (!byId[it.id]) byId[it.id] = [];
    byId[it.id].push({ ...it, index: i });
  });

  const fragment = document.createDocumentFragment();

  Object.keys(byId).sort().forEach(id => {
    const groupItems = byId[id];
    const totalStock = groupItems.reduce((sum, v) => sum + v.stock, 0);
    const groupValue = groupItems.reduce((sum, v) => sum + (v.stock * v.price), 0);

    // Status
    let badgeClass, badgeText;
    if (totalStock === 0) {
      badgeClass = 'badge badge--critical';
      badgeText = 'ESGOTADO';
    } else if (totalStock <= 3) {
      badgeClass = 'badge badge--warning';
      badgeText = 'BAIXO';
    } else {
      badgeClass = 'badge badge--success';
      badgeText = 'EM STOCK';
    }

    const card = document.createElement("div");
    card.className = "card mb-md";

    card.innerHTML = `
      <div class="card__header" style="cursor:pointer;margin-bottom:0" data-action="toggle" data-group="${id}" data-group-id="${id}">
        <div>
          <h3 class="card__title">${id}</h3>
          <div class="card__subtitle flex gap-sm items-center" style="margin-top:8px">
            <span class="${badgeClass}" data-group-badge>${badgeText}</span>
            <span data-group-units>${totalStock} unidades</span>
            <span>·</span>
            <span class="text-mono" style="color:var(--success)" data-group-value>${groupValue.toFixed(2)}€</span>
          </div>
        </div>
        <button class="btn--icon" data-action="toggle" data-group="${id}">
          ${expandedGroups[id] ? '▼' : '▶'}
        </button>
      </div>
    `;

    // Expandable content
    if (expandedGroups[id]) {
      const content = document.createElement("div");
      content.style.cssText = "margin-top:var(--space-md);padding-top:var(--space-md);border-top:1px solid var(--border-subtle)";

      // Group by size
      const bySize = {};
      groupItems.forEach(v => {
        if (!bySize[v.size]) bySize[v.size] = [];
        bySize[v.size].push(v);
      });

      Object.keys(bySize).sort().forEach(size => {
        const sizeBlock = document.createElement("div");
        sizeBlock.style.marginBottom = "var(--space-md)";

        // Size title WITH measurements
        const measurements = SIZE_MEASUREMENTS[size] || "";
        const sizeTitle = document.createElement("div");
        sizeTitle.className = "flex items-center gap-sm";
        sizeTitle.style.cssText = "margin-bottom:var(--space-sm);flex-wrap:wrap;gap:8px";
        sizeTitle.innerHTML = `
          <span class="text-accent text-sm" style="white-space:nowrap">TAMANHO ${size}</span>
          ${measurements ? `<span style="font-family:var(--font-display);font-size:11px;color:var(--text-tertiary);letter-spacing:0.3px;padding:3px 8px;background:rgba(255,255,255,0.04);border-radius:6px;border:1px solid var(--border-subtle)">${measurements}</span>` : ''}
        `;
        sizeBlock.appendChild(sizeTitle);

        bySize[size].forEach(v => {
          const item = document.createElement("div");
          item.className = "list-item";
          item.innerHTML = `
            <div class="flex justify-between items-center mb-sm">
              <div>
                <div class="text-base font-semibold">${v.color}</div>
                <div class="text-sm text-secondary" data-stock-index="${v.index}">Stock: ${v.stock} · ${v.price}€</div>
              </div>
              <div class="flex gap-sm">
                <button class="btn btn--sm btn--danger" data-action="stock" data-index="${v.index}" data-delta="-1">−1</button>
                <button class="btn btn--sm btn--success" data-action="stock" data-index="${v.index}" data-delta="1">+1</button>
              </div>
            </div>
            <div class="flex gap-sm">
              <button class="btn btn--sm btn--secondary" data-action="edit" data-index="${v.index}" style="flex:1">✏️ Editar</button>
              <button class="btn btn--sm btn--danger" data-action="delete" data-index="${v.index}" style="flex:1">🗑 Eliminar</button>
            </div>
          `;
          sizeBlock.appendChild(item);
        });

        content.appendChild(sizeBlock);
      });

      card.appendChild(content);
    }

    fragment.appendChild(card);
  });

  list.appendChild(fragment);
  updateTotals();
}

/* ==========================================
   EVENT HANDLERS (Delegated)
========================================== */

list.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  const action = el.dataset.action;

  // Toggle expand/collapse
  if (action === "toggle") {
    const id = el.dataset.group || el.closest("[data-group]")?.dataset.group;
    if (id) {
      expandedGroups[id] = !expandedGroups[id];
      render();
    }
    return;
  }

  const i = Number(el.dataset.index);
  if (!items[i]) return;

  // Update stock — NO FLICKER (partial update only)
  if (action === "stock") {
    const delta = Number(el.dataset.delta);
    const newStock = Math.max(0, items[i].stock + delta);

    // Don't do anything if already 0 and trying to subtract
    if (newStock === items[i].stock) return;

    items[i].stock = newStock;

    // Tap feedback via transform (no class toggle = no reflow)
    el.style.transform = "scale(0.88)";
    requestAnimationFrame(() => {
      setTimeout(() => { el.style.transform = ""; }, 100);
    });

    // Partial update — NO full re-render!
    updateItemDisplay(i);
    return;
  }

  // Edit
  if (action === "edit") {
    openModal(i);
  }

  // Delete
  if (action === "delete") {
    if (confirm(`Eliminar ${items[i].id} · ${items[i].color} · ${items[i].size}?`)) {
      items.splice(i, 1);
      render();
      showToast("Artigo eliminado", "success");
    }
  }
});

/* ==========================================
   MODAL
========================================== */

addBtn.onclick = () => openModal();
cancel.onclick = closeModal;

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function openModal(index = null) {
  editingIndex = index;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  const isEdit = index !== null;
  populateProductSelect(isEdit);

  if (isEdit) {
    const it = items[index];
    populateColorSelect(true, it.id);
    m_product.value = it.id;
    m_color.value = it.color;
    m_size.value = it.size;
    m_stock.value = it.stock;
    m_price.value = it.price;
    m_product.disabled = true;
    m_color.disabled = true;
    modalTitle.textContent = "Editar artigo";
  } else {
    resetModal();
    populateColorSelect(false);
    m_product.disabled = false;
    m_color.disabled = false;
    modalTitle.textContent = "Novo artigo";
  }
}

function closeModal() {
  modal.classList.remove("active");
  document.body.style.overflow = "";
  editingIndex = null;
}

/* ==========================================
   INPUT LOGIC
========================================== */

m_product.onchange = () => {
  const isNew = m_product.value === "__new";
  m_product_new.style.display = isNew ? "block" : "none";
  if (isNew) {
    requestAnimationFrame(() => m_product_new.focus());
  }
  populateColorSelect(false, isNew ? null : m_product.value);
};

m_color.onchange = () => {
  const isNew = m_color.value === "__new";
  m_color_new.style.display = isNew ? "block" : "none";
  if (isNew) {
    requestAnimationFrame(() => m_color_new.focus());
  }
};

/* ==========================================
   SAVE
========================================== */

save.onclick = () => {
  if (!m_product.value || !m_color.value || !m_size.value) {
    alert("Por favor, preenche Product ID, Cor e Tamanho.");
    return;
  }

  const id = m_product.value === "__new" ? m_product_new.value.trim().toUpperCase() : m_product.value;
  const color = m_color.value === "__new" ? m_color_new.value.trim() : m_color.value;

  if (!id || !color) {
    alert("Por favor, preenche os campos corretamente.");
    return;
  }

  const data = {
    id,
    color,
    size: m_size.value,
    stock: Number(m_stock.value) || 0,
    price: Number(m_price.value) || 0
  };

  if (editingIndex !== null) {
    items[editingIndex] = data;
    showToast("Artigo atualizado", "success");
  } else {
    items.push(data);
    expandedGroups[data.id] = true;
    showToast("Artigo adicionado", "success");
  }

  closeModal();
  render();
};

/* ==========================================
   TOAST NOTIFICATIONS
========================================== */

function showToast(message, type = "success") {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast-notification badge badge--${type}`;
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    top: "calc(70px + env(safe-area-inset-top, 0px))",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: "1000",
    padding: "12px 24px",
    fontSize: "14px",
    boxShadow: "var(--shadow-lg)",
    animation: "slideDown 0.3s ease-out"
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/* ==========================================
   SYNC BUTTON
========================================== */

syncBtn.onclick = () => {
  syncBtn.textContent = "⏳";
  syncBtn.disabled = true;

  setTimeout(() => {
    syncBtn.textContent = "✅";
    showToast("Dados sincronizados", "success");

    setTimeout(() => {
      syncBtn.textContent = "🔄";
      syncBtn.disabled = false;
    }, 1000);
  }, 1000);
};

/* ==========================================
   LOGOUT
========================================== */

function logout() {
  localStorage.removeItem('dripdrop-auth');
  window.location.href = '../index.html';
}

/* ==========================================
   INIT
========================================== */

render();
