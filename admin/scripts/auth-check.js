// ==========================================
// DRIPDROP ADMIN - AUTH PROTECTION
// ==========================================

// Sistema simples de autenticação via localStorage
// Para usar: incluir no topo de cada página protegida

(function() {
  // Verificar se está autenticado
  const isAuthenticated = localStorage.getItem('dripdrop-auth') === 'true';
  
  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    // Redirecionar para index.html (página de login)
    window.location.href = '../index.html';
  }
})();

// Função para fazer logout (pode ser usada em botões)
function logout() {
  localStorage.removeItem('dripdrop-auth');
  window.location.href = '../index.html';
}

// Exportar para usar em outras páginas se necessário
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { logout };
}
