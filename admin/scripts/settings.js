// ==========================================
// DRIPDROPSHOP ADMIN - SETTINGS
// ==========================================

const themeToggle = document.getElementById('themeToggle');

// ==========================================
// THEME MANAGEMENT
// ==========================================

function initTheme() {
  // Carregar tema salvo (default: dark)
  const savedTheme = localStorage.getItem('dripdrop-theme') || 'dark';
  
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.checked = true;
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.checked = false;
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Aplicar novo tema
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Salvar preferência
  localStorage.setItem('dripdrop-theme', newTheme);
  
  // Feedback visual
  showToast(`Tema ${newTheme === 'light' ? 'claro' : 'escuro'} ativado`, 'success');
}

// Event listener
themeToggle.addEventListener('change', toggleTheme);

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

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

// ==========================================
// INIT
// ==========================================

initTheme();
