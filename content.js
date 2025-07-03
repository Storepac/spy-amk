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
        'ThemeManager',
        'StatsManager',
        'SidePanel'
    ];
    
    const faltando = componentes.filter(comp => typeof window[comp] === 'undefined');
    
    if (faltando.length > 0) {
        console.warn('⚠️ Componentes não carregados:', faltando);
        return false;
    }
    
    console.log('✅ Todos os componentes carregados com sucesso');
    return true;
}

    // Função para tentar carregar componentes com retry
    function tentarCarregarComponentes(maxTentativas = 5, intervalo = 1000) {
        let tentativas = 0;
        
        function tentar() {
            tentativas++;
            console.log(`🔄 Tentativa ${tentativas}/${maxTentativas} de carregar componentes...`);
            
            if (verificarComponentes()) {
                console.log('✅ Componentes carregados com sucesso!');
                inicializarAplicacao();
                return;
            }
            
            if (tentativas < maxTentativas) {
                console.log(`⏳ Aguardando ${intervalo}ms antes da próxima tentativa...`);
                setTimeout(tentar, intervalo);
            } else {
                console.error('❌ Falha ao carregar componentes após todas as tentativas');
                mostrarErroCarregamento();
            }
        }
        
        tentar();
    }

    // Função para mostrar erro de carregamento
    function mostrarErroCarregamento() {
        const erroDiv = document.createElement('div');
        erroDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
        `;
        erroDiv.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: 600;">❌ AMK Spy - Erro de Carregamento</div>
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 10px;">
                Alguns componentes não foram carregados corretamente.
            </div>
            <button onclick="window.location.reload()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
            ">🔄 Recarregar Página</button>
        `;
        document.body.appendChild(erroDiv);
        
        // Remover após 10 segundos
        setTimeout(() => {
            if (erroDiv.parentNode) {
                erroDiv.parentNode.removeChild(erroDiv);
            }
        }, 10000);
    }

// Função para inicializar a aplicação
function inicializarAplicacao() {
    console.log('🚀 Inicializando AMK Spy Multi-Plataforma...');
    
    // Detectar plataforma atual
    const platform = PlatformDetector ? PlatformDetector.init() : null;
    
    if (!platform) {
        console.log('ℹ️ Plataforma não suportada');
        return;
    }
    
    console.log(`🌐 Plataforma detectada: ${platform.platform} (${platform.type})`);
    
    // Aguardar carregamento completo
    setTimeout(() => {
        if (verificarComponentes()) {
            // Inicializar controladores específicos por plataforma
            if (platform.platform === 'amazon') {
                // Inicializar sistema Amazon
            if (typeof SidePanel !== 'undefined') {
                SidePanel.init(platform);
            }
            
                if (platform.type === 'search' && typeof AppController !== 'undefined') {
                    console.log('📊 Inicializando sistema Amazon...');
                    AppController.init();
                }
                
                } else if (platform.platform === 'mercadolivre') {
                // Inicializar sistema MercadoLivre independente
                console.log('🛒 Inicializando sistema MercadoLivre específico...');
                
                if (typeof MLSidePanel !== 'undefined') {
                    MLSidePanel.init(platform);
                } else if (typeof SidePanel !== 'undefined') {
                    // Fallback para SidePanel genérico
                    SidePanel.init(platform);
                }
                
                if (platform.type === 'search' && typeof MLController !== 'undefined') {
                    console.log('📊 Inicializando MLController específico...');
                        MLController.init();
                    } else {
                    console.warn('⚠️ MLController específico não disponível');
                }
            }
        } else {
            console.error('❌ Falha ao carregar componentes necessários');
            mostrarErroCarregamento();
        }
    }, 1000);
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            tentarCarregarComponentes();
        });
} else {
        tentarCarregarComponentes();
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
    console.log('  StatsManager:', typeof StatsManager !== 'undefined');
};

// Funcionalidade do popup removida - agora usamos o painel lateral

// Log de inicialização
console.log('📦 AMK Spy carregado - Versão 2.0'); 