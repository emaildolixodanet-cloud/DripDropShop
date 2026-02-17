// ==========================================
// DRIPDROPSHOP ADMIN - INVENTÁRIO v3
// ==========================================
// cost_price per Product ID, no sell price

let items = [
  { id: "RL-HOODIE", color: "Azul", size: "M", stock: 5 },
  { id: "RL-HOODIE", color: "Azul", size: "L", stock: 2 },
  { id: "RL-HOODIE", color: "Verde", size: "M", stock: 1 },
  { id: "CARH-JACKET", color: "Preto", size: "L", stock: 3 }
];

// Preço de custo POR PRODUTO (não por variante)
let costPrices = {
  "RL-HOODIE": 18,
  "CARH-JACKET": 25
};

// Medidas por tamanho (fictícias - editar depois)
const SIZE_MEASUREMENTS = {
  "XS": "O - 38 / C - 64 / L - 46",
  "S":  "O - 40 / C - 68 / L - 48",
  "M":  "O - 42 / C - 72 / L - 52",
  "L":  "O - 44 / C - 76 / L - 56",
  "XL": "O - 46 / C - 80 / L - 60",
  "XXL":"O - 48 / C - 84 / L - 64"
};

// DOM
const list = document.getElementById("stockList");
const modal = document.getElementById("modal");
const emptyState = document.getElementById("emptyState");
const totalValue = document.getElementById("totalValue");
const totalUnits = document.getElementById("totalUnits");

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
  m_cost.value = "";
}

/* ==========================================
   PARTIAL UPDATES (no flicker)
========================================== */

function updateTotals() {
  const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
  const totalVal = items.reduce((sum, item) => sum + (item.stock * (costPrices[item.id] || 0)), 0);
  totalUnits.textContent = totalStock;
  totalValue.textContent = costsHidden ? '•••••' : totalVal.toFixed(2) + "€";
}

function updateItemDisplay(index) {
  const item = items[index];
  if (!item) return;

  const stockEl = list.querySelector(`[data-stock-index="${index}"]`);
  if (stockEl) {
    stockEl.textContent = `Stock: ${item.stock}`;
  }

  const groupItems = items.filter(i => i.id === item.id);
  const groupStock = groupItems.reduce((s, v) => s + v.stock, 0);
  const cost = costPrices[item.id] || 0;
  const groupValue = groupStock * cost;

  const groupEl = list.querySelector(`[data-group-id="${item.id}"]`);
  if (groupEl) {
    const unitsEl = groupEl.querySelector('[data-group-units]');
    const valueEl = groupEl.querySelector('[data-group-value]');
    const badgeEl = groupEl.querySelector('[data-group-badge]');

    if (unitsEl) unitsEl.textContent = `${groupStock} un.`;
    if (valueEl) valueEl.textContent = costsHidden ? '•••••' : `${groupValue.toFixed(2)}€`;

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
   SELECTS
========================================== */

function populateProductSelect(isEdit) {
  const fragment = document.createDocumentFragment();
  const ph = document.createElement("option");
  ph.value = ""; ph.disabled = true; ph.selected = true;
  ph.textContent = "Selecionar produto...";
  fragment.appendChild(ph);

  uniq(items.map(i => i.id)).sort().forEach(id => {
    const o = document.createElement("option");
    o.value = id; o.textContent = id;
    fragment.appendChild(o);
  });

  if (!isEdit) {
    const o = document.createElement("option");
    o.value = "__new"; o.textContent = "➕ Novo produto";
    fragment.appendChild(o);
  }

  m_product.innerHTML = "";
  m_product.appendChild(fragment);
}

function populateColorSelect(isEdit, productId = null) {
  const fragment = document.createDocumentFragment();
  const ph = document.createElement("option");
  ph.value = ""; ph.disabled = true; ph.selected = true;
  ph.textContent = "Selecionar cor...";
  fragment.appendChild(ph);

  const colors = productId
    ? items.filter(i => i.id === productId).map(i => i.color)
    : items.map(i => i.color);

  uniq(colors).sort().forEach(c => {
    const o = document.createElement("option");
    o.value = c; o.textContent = c;
    fragment.appendChild(o);
  });

  if (!isEdit) {
    const o = document.createElement("option");
    o.value = "__new"; o.textContent = "➕ Nova cor";
    fragment.appendChild(o);
  }

  m_color.innerHTML = "";
  m_color.appendChild(fragment);
}

/* ==========================================
   RENDER
========================================== */

function render() {
  list.innerHTML = "";

  if (items.length === 0) {
    emptyState.style.display = "block";
    updateTotals();
    return;
  }

  emptyState.style.display = "none";

  const byId = {};
  items.forEach((it, i) => {
    if (!byId[it.id]) byId[it.id] = [];
    byId[it.id].push({ ...it, index: i });
  });

  const fragment = document.createDocumentFragment();

  Object.keys(byId).sort().forEach(id => {
    const groupItems = byId[id];
    const totalStock = groupItems.reduce((sum, v) => sum + v.stock, 0);
    const cost = costPrices[id] || 0;
    const groupValue = totalStock * cost;

    let badgeClass, badgeText;
    if (totalStock === 0) {
      badgeClass = 'badge badge--critical'; badgeText = 'ESGOTADO';
    } else if (totalStock <= 3) {
      badgeClass = 'badge badge--warning'; badgeText = 'BAIXO';
    } else {
      badgeClass = 'badge badge--success'; badgeText = 'EM STOCK';
    }

    const card = document.createElement("div");
    card.className = "card mb-md";

    card.innerHTML = `
      <div class="card__header" style="cursor:pointer;margin-bottom:0" data-action="toggle" data-group="${id}" data-group-id="${id}">
        <div style="flex:1;min-width:0">
          <div class="flex items-center gap-sm" style="flex-wrap:wrap">
            <h3 class="card__title" style="margin:0">${id}</h3>
            ${costsHidden ? '' : `<span style="font-family:var(--font-display);font-size:12px;color:var(--primary-light);background:var(--primary-glow);padding:2px 8px;border-radius:6px">Custo: ${cost.toFixed(2)}€</span>`}
          </div>
          <div class="card__subtitle flex gap-sm items-center" style="margin-top:8px">
            <span class="${badgeClass}" data-group-badge>${badgeText}</span>
            <span data-group-units>${totalStock} un.</span>
            ${costsHidden ? '' : `<span>·</span><span class="text-mono cost-value" style="color:var(--success)" data-group-value>${groupValue.toFixed(2)}€</span>`}
          </div>
        </div>
        <button class="btn--icon" data-action="toggle" data-group="${id}">
          ${expandedGroups[id] ? '▼' : '▶'}
        </button>
      </div>
    `;

    if (expandedGroups[id]) {
      const content = document.createElement("div");
      content.style.cssText = "margin-top:var(--space-md);padding-top:var(--space-md);border-top:1px solid var(--border-subtle)";

      // Edit cost button (hidden when costs hidden)
      if (!costsHidden) {
        const costRow = document.createElement("div");
        costRow.style.cssText = "margin-bottom:var(--space-md);display:flex;align-items:center;gap:8px";
        costRow.innerHTML = `
          <span class="text-sm text-secondary">Preço de custo:</span>
          <span class="text-mono font-semibold" style="color:var(--primary-light)">${cost.toFixed(2)}€</span>
          <button class="btn btn--sm btn--secondary" data-action="editcost" data-product="${id}" style="margin-left:auto">✏️ Alterar</button>
        `;
        content.appendChild(costRow);
      }

      const bySize = {};
      groupItems.forEach(v => {
        if (!bySize[v.size]) bySize[v.size] = [];
        bySize[v.size].push(v);
      });

      Object.keys(bySize).sort().forEach(size => {
        const sizeBlock = document.createElement("div");
        sizeBlock.style.marginBottom = "var(--space-md)";

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
                <div class="text-sm text-secondary" data-stock-index="${v.index}">Stock: ${v.stock}</div>
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
   EVENTS
========================================== */

list.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  const action = el.dataset.action;

  if (action === "toggle") {
    const id = el.dataset.group || el.closest("[data-group]")?.dataset.group;
    if (id) { expandedGroups[id] = !expandedGroups[id]; render(); }
    return;
  }

  if (action === "editcost") {
    const pid = el.dataset.product;
    const current = costPrices[pid] || 0;
    const newVal = prompt(`Preço de custo para ${pid}:`, current);
    if (newVal !== null && !isNaN(Number(newVal))) {
      costPrices[pid] = Number(newVal);
      render();
      showToast("Preço de custo atualizado", "success");
    }
    return;
  }

  const i = Number(el.dataset.index);
  if (!items[i]) return;

  if (action === "stock") {
    const delta = Number(el.dataset.delta);
    const newStock = Math.max(0, items[i].stock + delta);
    if (newStock === items[i].stock) return;
    items[i].stock = newStock;
    el.style.transform = "scale(0.88)";
    requestAnimationFrame(() => { setTimeout(() => { el.style.transform = ""; }, 100); });
    updateItemDisplay(i);
    return;
  }

  if (action === "edit") { openModal(i); }

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
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

function openModal(index = null) {
  editingIndex = index;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  const isEdit = index !== null;
  populateProductSelect(isEdit);

  // Show/hide cost field
  const costGroup = document.getElementById("costGroup");

  if (isEdit) {
    const it = items[index];
    populateColorSelect(true, it.id);
    m_product.value = it.id;
    m_color.value = it.color;
    m_size.value = it.size;
    m_stock.value = it.stock;
    m_product.disabled = true;
    m_color.disabled = true;
    costGroup.style.display = "none";
    modalTitle.textContent = "Editar artigo";
  } else {
    resetModal();
    populateColorSelect(false);
    m_product.disabled = false;
    m_color.disabled = false;
    costGroup.style.display = "block";
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
  if (isNew) requestAnimationFrame(() => m_product_new.focus());
  populateColorSelect(false, isNew ? null : m_product.value);

  // Pre-fill cost if product exists
  const costGroup = document.getElementById("costGroup");
  if (!isNew && costPrices[m_product.value] !== undefined) {
    m_cost.value = costPrices[m_product.value];
    costGroup.style.display = "none";
  } else {
    costGroup.style.display = "block";
    m_cost.value = "";
  }
};

m_color.onchange = () => {
  const isNew = m_color.value === "__new";
  m_color_new.style.display = isNew ? "block" : "none";
  if (isNew) requestAnimationFrame(() => m_color_new.focus());
};

/* ==========================================
   SAVE
========================================== */

save.onclick = () => {
  if (!m_product.value || !m_color.value || !m_size.value) {
    alert("Preenche Product ID, Cor e Tamanho.");
    return;
  }

  const id = m_product.value === "__new" ? m_product_new.value.trim().toUpperCase() : m_product.value;
  const color = m_color.value === "__new" ? m_color_new.value.trim() : m_color.value;

  if (!id || !color) { alert("Preenche os campos corretamente."); return; }

  // Save cost price if new product or updated
  if (m_cost.value && (m_product.value === "__new" || costPrices[id] === undefined)) {
    costPrices[id] = Number(m_cost.value) || 0;
  }

  const data = { id, color, size: m_size.value, stock: Number(m_stock.value) || 0 };

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
   TOAST
========================================== */

function showToast(message, type = "success") {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `toast-notification badge badge--${type}`;
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed", top: "calc(70px + env(safe-area-inset-top, 0px))",
    left: "50%", transform: "translateX(-50%)", zIndex: "1000",
    padding: "12px 24px", fontSize: "14px", boxShadow: "var(--shadow-lg)",
    animation: "slideDown 0.3s ease-out"
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0"; toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/* ==========================================
   SYNC & LOGOUT
========================================== */

syncBtn.onclick = () => {
  syncBtn.textContent = "⏳"; syncBtn.disabled = true;
  setTimeout(() => {
    syncBtn.textContent = "✅";
    showToast("Dados sincronizados", "success");
    setTimeout(() => { syncBtn.textContent = "🔄"; syncBtn.disabled = false; }, 1000);
  }, 1000);
};

function logout() {
  localStorage.removeItem('dripdrop-auth');
  window.location.href = '../index.html';
}

/* ==========================================
   COST VISIBILITY
========================================== */

let costsHidden = localStorage.getItem('dd-costs-hidden') === 'true';

function applyCostVisibility() {
  const btn = document.getElementById('toggleCosts');
  if (btn) {
    btn.textContent = costsHidden ? '👁‍🗨 MOSTRAR VALORES' : '👁 OCULTAR VALORES';
  }
  localStorage.setItem('dd-costs-hidden', costsHidden);
}

document.getElementById('toggleCosts').addEventListener('click', () => {
  costsHidden = !costsHidden;
  applyCostVisibility();
  render();
});

/* ==========================================
   INIT
========================================== */

render();
applyCostVisibility();
