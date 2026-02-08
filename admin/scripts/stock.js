// ==========================================
// DRIPDROPSHOP ADMIN - INVENTÁRIO
// ==========================================

let items = [
  { id: "RL-HOODIE", color: "Azul", size: "M", stock: 5, price: 35 },
  { id: "RL-HOODIE", color: "Azul", size: "L", stock: 2, price: 35 },
  { id: "RL-HOODIE", color: "Verde", size: "M", stock: 1, price: 35 },
  { id: "CARH-JACKET", color: "Preto", size: "L", stock: 3, price: 55 }
];

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

function calculateTotals() {
  const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
  const totalVal = items.reduce((sum, item) => sum + (item.stock * item.price), 0);
  
  totalUnits.textContent = totalStock;
  totalValue.textContent = totalVal.toFixed(2) + "€";
}

/* ==========================================
   SELECTS (Dinâmicos)
========================================== */

function populateProductSelect(isEdit) {
  m_product.innerHTML = `<option value="" disabled selected>Selecionar produto...</option>`;

  uniq(items.map(i => i.id)).sort().forEach(id => {
    const o = document.createElement("option");
    o.value = id;
    o.textContent = id;
    m_product.appendChild(o);
  });

  if (!isEdit) {
    const o = document.createElement("option");
    o.value = "__new";
    o.textContent = "➕ Novo produto";
    m_product.appendChild(o);
  }
}

function populateColorSelect(isEdit, productId = null) {
  m_color.innerHTML = `<option value="" disabled selected>Selecionar cor...</option>`;

  const colors = productId
    ? items.filter(i => i.id === productId).map(i => i.color)
    : items.map(i => i.color);

  uniq(colors).sort().forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    m_color.appendChild(o);
  });

  if (!isEdit) {
    const o = document.createElement("option");
    o.value = "__new";
    o.textContent = "➕ Nova cor";
    m_color.appendChild(o);
  }
}

/* ==========================================
   RENDER
========================================== */

function render() {
  list.innerHTML = "";
  
  // Show empty state if no items
  if (items.length === 0) {
    emptyState.style.display = "block";
    calculateTotals();
    return;
  }
  
  emptyState.style.display = "none";

  // Group by Product ID
  const byId = {};
  items.forEach((it, i) => {
    if (!byId[it.id]) byId[it.id] = [];
    byId[it.id].push({ ...it, index: i });
  });

  // Render each group
  Object.keys(byId).sort().forEach(id => {
    const groupItems = byId[id];
    const totalStock = groupItems.reduce((sum, v) => sum + v.stock, 0);
    const totalValue = groupItems.reduce((sum, v) => sum + (v.stock * v.price), 0);

    // Determine status badge
    let statusBadge = "";
    if (totalStock === 0) {
      statusBadge = '<span class="badge badge--critical">ESGOTADO</span>';
    } else if (totalStock <= 3) {
      statusBadge = '<span class="badge badge--warning">BAIXO</span>';
    } else {
      statusBadge = '<span class="badge badge--success">EM STOCK</span>';
    }

    // Create group card
    const card = document.createElement("div");
    card.className = "card mb-md";
    card.style.animation = "slideDown 0.3s ease-out";

    const header = document.createElement("div");
    header.className = "card__header";
    header.style.cursor = "pointer";
    header.dataset.action = "toggle";
    header.dataset.group = id;

    header.innerHTML = `
      <div>
        <h3 class="card__title">${id}</h3>
        <div class="card__subtitle flex gap-sm items-center" style="margin-top: 8px;">
          ${statusBadge}
          <span>${totalStock} unidades</span>
          <span>·</span>
          <span class="text-mono" style="color: var(--success);">${totalValue.toFixed(2)}€</span>
        </div>
      </div>
      <button class="btn--icon" data-action="toggle" data-group="${id}">
        ${expandedGroups[id] ? '▼' : '▶'}
      </button>
    `;

    // Content (expandable)
    const content = document.createElement("div");
    content.style.display = expandedGroups[id] ? "block" : "none";
    content.style.marginTop = "var(--space-md)";
    content.style.paddingTop = "var(--space-md)";
    content.style.borderTop = "1px solid var(--border-subtle)";

    // Group by size
    const bySize = {};
    groupItems.forEach(v => {
      if (!bySize[v.size]) bySize[v.size] = [];
      bySize[v.size].push(v);
    });

    Object.keys(bySize).sort().forEach(size => {
      const sizeBlock = document.createElement("div");
      sizeBlock.style.marginBottom = "var(--space-md)";
      
      const sizeTitle = document.createElement("div");
      sizeTitle.className = "text-accent text-sm";
      sizeTitle.style.marginBottom = "var(--space-sm)";
      sizeTitle.textContent = `TAMANHO ${size}`;
      sizeBlock.appendChild(sizeTitle);

      bySize[size].forEach(v => {
        const item = document.createElement("div");
        item.className = "list-item";
        
        item.innerHTML = `
          <div class="flex justify-between items-center mb-sm">
            <div>
              <div class="text-base font-semibold">${v.color}</div>
              <div class="text-sm text-secondary">Stock: ${v.stock} · ${v.price}€</div>
            </div>
            <div class="flex gap-sm">
              <button class="btn btn--sm btn--danger" data-action="stock" data-index="${v.index}" data-delta="-1">
                −1
              </button>
              <button class="btn btn--sm btn--success" data-action="stock" data-index="${v.index}" data-delta="1">
                +1
              </button>
            </div>
          </div>
          <div class="flex gap-sm">
            <button class="btn btn--sm btn--secondary" data-action="edit" data-index="${v.index}" style="flex: 1;">
              ✏️ Editar
            </button>
            <button class="btn btn--sm btn--danger" data-action="delete" data-index="${v.index}" style="flex: 1;">
              🗑 Eliminar
            </button>
          </div>
        `;
        
        sizeBlock.appendChild(item);
      });

      content.appendChild(sizeBlock);
    });

    card.appendChild(header);
    card.appendChild(content);
    list.appendChild(card);
  });

  calculateTotals();
}

/* ==========================================
   EVENT HANDLERS
========================================== */

// Click handler for list
list.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  const action = el.dataset.action;

  // Toggle expand/collapse
  if (action === "toggle") {
    const id = el.dataset.group;
    expandedGroups[id] = !expandedGroups[id];
    render();
    return;
  }

  const i = Number(el.dataset.index);
  if (!items[i]) return;

  // Update stock
  if (action === "stock") {
    const delta = Number(el.dataset.delta);
    items[i].stock = Math.max(0, items[i].stock + delta);
    
    // Visual feedback
    el.classList.add("animate-tapScale");
    setTimeout(() => el.classList.remove("animate-tapScale"), 150);
    
    render();
  }

  // Edit variant
  if (action === "edit") {
    openModal(i);
  }

  // Delete variant
  if (action === "delete") {
    if (confirm(`Eliminar ${items[i].id} · ${items[i].color} · ${items[i].size}?`)) {
      items.splice(i, 1);
      render();
      
      // Show success feedback
      showToast("Variante eliminada com sucesso", "success");
    }
  }
});

/* ==========================================
   MODAL
========================================== */

addBtn.onclick = () => openModal();
cancel.onclick = closeModal;

// Close modal on backdrop click
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

    modalTitle.textContent = "Editar variante";
  } else {
    resetModal();
    populateColorSelect(false);
    m_product.disabled = false;
    m_color.disabled = false;
    modalTitle.textContent = "Nova variante";
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
  populateColorSelect(false, isNew ? null : m_product.value);
};

m_color.onchange = () => {
  m_color_new.style.display = m_color.value === "__new" ? "block" : "none";
};

/* ==========================================
   SAVE
========================================== */

save.onclick = () => {
  // Validation
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

  // Update or create
  if (editingIndex !== null) {
    items[editingIndex] = data;
    showToast("Variante atualizada com sucesso", "success");
  } else {
    items.push(data);
    showToast("Variante criada com sucesso", "success");
  }

  closeModal();
  render();
};

/* ==========================================
   TOAST NOTIFICATIONS
========================================== */

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `badge badge--${type}`;
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = "80px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.zIndex = "1000";
  toast.style.padding = "12px 24px";
  toast.style.fontSize = "14px";
  toast.style.boxShadow = "var(--shadow-lg)";
  toast.style.animation = "slideDown 0.3s ease-out";
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = "fadeIn 0.3s ease-out reverse";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/* ==========================================
   SYNC BUTTON
========================================== */

syncBtn.onclick = () => {
  syncBtn.textContent = "⏳";
  syncBtn.disabled = true;
  
  // Simulate sync (replace with actual Google Sheets sync)
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
   INIT
========================================== */

render();
