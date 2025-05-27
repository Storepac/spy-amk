// AMK Spy - Amazon Product Analyzer
// Versão 2.0 - Arquitetura Modular

// Inicializar aplicação quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AppController.init();
    });
} else {
    AppController.init();
}

// Compatibilidade com funções globais existentes
window.mostrarDetalheProduto = async function(url) {
    NotificationManager.mostrar('Carregando detalhes do produto...');
    
    const detalhes = await ProductExtractor.extrairDetalhesProduto(url);
    if (!detalhes) {
        NotificationManager.mostrar('Erro ao carregar detalhes do produto');
        return;
    }
    
    // Modal de detalhes será implementado em versão futura
    console.log('Detalhes do produto:', detalhes);
};

// Funções auxiliares globais para compatibilidade
window.extrairDetalhesProduto = ProductExtractor.extrairDetalhesProduto;
window.formatarMoeda = ClipboardManager.formatarMoeda; 