// ==========================================
// DRIPDROPSHOP ADMIN - INVENTÁRIO v4 (Backend)
// ==========================================

const API_URL = "https://script.google.com/macros/s/AKfycbxVZhH5-bU8QlNAFysILAwn8fqzoLuYe27yIFm_tTqBIPjk_Q3ttsoHTFg__b41aJUN/exec";

// Fonte agora vem do backend
let items = [];
let costPrices = {}; // será calculado depois a partir do ledger

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

let expandedGroups = {};
let costsHidden = localStorage.getItem('dd-costs-hidden') === 'true';

// ==========================================
// BACKEND LOAD
// ==========================================

async function loadInventoryFromBackend() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        action: "getInventory"
      })
    });

    const data = await res.json();

    if (data.status === "success") {

      items = data.inventory.map(item => ({
        id: item.productId,
        color: item.color,
        size: item.size,
        stock: item.stock
      }));

      // calcular custo médio por produto
      costPrices = {};
      data.inventory.forEach(v => {
        if (!costPrices[v.productId]) {
          costPrices[v.productId] = v.avgCost || 0;
        }
      });

      render();
    }

  } catch (err) {
    console.error("Erro ao carregar inventário:", err);
  }
}

// ==========================================
// HELPERS
// ==========================================

const uniq = (arr) => [...new Set(arr)];

function updateTotals() {
  const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
  const totalVal = items.reduce((sum, item) =>
    sum + (item.stock * (costPrices[item.id] || 0)), 0
  );

  totalUnits.textContent = totalStock;
  totalValue.textContent = costsHidden
    ? '•••••'
    : totalVal.toFixed(2) + "€";
}

// ==========================================
// RENDER (inalterado estruturalmente)
// ==========================================

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

  Object.keys(byId).sort().forEach(id => {

    const groupItems = byId[id];
    const totalStock = groupItems.reduce((sum, v) => sum + v.stock, 0);
    const cost = costPrices[id] || 0;
    const groupValue = totalStock * cost;

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
      <div class="card__header" style="cursor:pointer;margin-bottom:0" data-group="${id}">
        <div style="flex:1;min-width:0">
          <div class="flex items-center gap-sm" style="flex-wrap:wrap">
            <h3 class="card__title" style="margin:0">${id}</h3>
          </div>
          <div class="card__subtitle flex gap-sm items-center" style="margin-top:8px">
            <span class="${badgeClass}">${badgeText}</span>
            <span>${totalStock} un.</span>
            ${costsHidden ? '' : `<span>·</span><span>${groupValue.toFixed(2)}€</span>`}
          </div>
        </div>
      </div>
    `;

    list.appendChild(card);
  });

  updateTotals();
}

// ==========================================
// COST VISIBILITY
// ==========================================

function applyCostVisibility() {
  const btn = document.getElementById('toggleCosts');
  if (btn) {
    btn.textContent = costsHidden
      ? '👁‍🗨 MOSTRAR VALORES'
      : '👁 OCULTAR VALORES';
  }
  localStorage.setItem('dd-costs-hidden', costsHidden);
}

document.getElementById('toggleCosts').addEventListener('click', () => {
  costsHidden = !costsHidden;
  applyCostVisibility();
  render();
});

// ==========================================
// INIT
// ==========================================

loadInventoryFromBackend();
applyCostVisibility();
