/* =====================================================
   CONFIG.JS - Configurações Centralizadas
===================================================== */

// Configurações do WhatsApp
const CONFIG = {
  whatsapp: {
    number: '351XXXXXXXXX', // ⚠️ SUBSTITUIR pelo número real antes de publicar
    baseUrl: 'https://wa.me/351XXXXXXXXX'
  },

  // Cupões de desconto
  coupons: {
    DDS10: 0.10,  // 10% desconto
    DDS15: 0.15,  // 15% desconto
    LELO: 0.50    // 50% desconto
  },

  // Textos padrão
  defaultMessages: {
    whatsappBase: 'Olá, estou interessado em',
    whatsappSuffix: '. Ainda está disponível?'
  }
};

// Exportar para uso global
window.APP_CONFIG = CONFIG;
