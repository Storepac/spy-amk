// AMK Spy - Amazon Product Analyzer
// Versão 2.0 - Arquitetura Modular

// Verificar se já foi inicializado
if (window.amkSpyContentInicializado) {
    console.log('⚠️ AMK Spy content já foi inicializado');
} else {
    window.amkSpyContentInicializado = true;

    // Função para verificar se todos os componentes estão carregados
    function verificarComponentes() {
        const componentes = [
            'AppController',
            'TableManager', 
            'ProductAnalyzer',
            'NotificationManager',
            'EventManager',
            'ThemeManager'
        ];
        
        const faltando = componentes.filter(comp => typeof window[comp] === 'undefined');
        
        if (faltando.length > 0) {
            console.warn('⚠️ Componentes não carregados:', faltando);
            return false;
        }
        
        console.log('✅ Todos os componentes carregados com sucesso');
        return true;
    }

    // Função para inicializar a aplicação
    function inicializarAplicacao() {
        console.log('🚀 Inicializando AMK Spy...');
        
        // Verificar se estamos em uma página de pesquisa da Amazon
        if (window.location.href.includes('/s?') || window.location.href.includes('/s/')) {
            console.log('📊 Página de pesquisa detectada');
            
            // Aguardar um pouco para garantir que a página carregou completamente
            setTimeout(() => {
                if (verificarComponentes()) {
                    AppController.init();
                } else {
                    console.error('❌ Falha ao carregar componentes necessários');
                }
            }, 1000);
        } else {
            console.log('ℹ️ Não é uma página de pesquisa da Amazon');
        }
    }

    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarAplicacao);
    } else {
        inicializarAplicacao();
    }
}

// Compatibilidade com funções globais existentes
window.mostrarDetalheProduto = async function(url) {
    if (typeof NotificationManager === 'undefined') {
        console.error('❌ NotificationManager não está disponível');
        return;
    }
    
    NotificationManager.informacao('Carregando detalhes do produto...');
    
    if (typeof ProductExtractor === 'undefined') {
        console.error('❌ ProductExtractor não está disponível');
        return;
    }
    
    const detalhes = await ProductExtractor.extrairDetalhesProduto(url);
    if (!detalhes) {
        NotificationManager.erro('Erro ao carregar detalhes do produto');
        return;
    }
    
    console.log('Detalhes do produto:', detalhes);
};

// Funções auxiliares globais para compatibilidade
if (typeof ProductExtractor !== 'undefined') {
    window.extrairDetalhesProduto = ProductExtractor.extrairDetalhesProduto;
}

if (typeof ClipboardManager !== 'undefined') {
    window.formatarMoeda = ClipboardManager.formatarMoeda;
}

// Expor funções de diagnóstico
window.diagnosticoAMKSpy = function() {
    console.log('🔍 Diagnóstico AMK Spy:');
    console.log('URL:', window.location.href);
    console.log('Ready State:', document.readyState);
    console.log('Componentes:');
    console.log('  AppController:', typeof AppController !== 'undefined');
    console.log('  TableManager:', typeof TableManager !== 'undefined');
    console.log('  ProductAnalyzer:', typeof ProductAnalyzer !== 'undefined');
    console.log('  NotificationManager:', typeof NotificationManager !== 'undefined');
    console.log('  EventManager:', typeof EventManager !== 'undefined');
    console.log('  ThemeManager:', typeof ThemeManager !== 'undefined');
};

// Log de inicialização
console.log('📦 AMK Spy carregado - Versão 2.0'); 