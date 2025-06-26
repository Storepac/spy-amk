/**
 * AMK Spy - Sistema Principal Refatorado
 * Arquivo principal que inicializa e coordena todos os componentes
 */

class AMKSpyApp {
    constructor() {
        this.isInitialized = false;
        this.components = new Map();
        this.dataManager = null;
        this.uiManager = null;
        this.analyzer = null;
        
        // Bind methods
        this.handleMessage = this.handleMessage.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    // ===== INICIALIZAÇÃO =====
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🚀 Inicializando AMK Spy...');
            
            // Verificar se estamos na página correta
            if (!this.isValidPage()) {
                console.log('❌ Página não suportada');
                return;
            }

            // Inicializar componentes na ordem correta
            await this.initializeCore();
            await this.initializeUI();
            await this.initializeServices();
            
            // Configurar eventos globais
            this.setupGlobalEvents();
            
            // Carregar estado salvo
            this.loadSavedState();
            
            this.isInitialized = true;
            console.log('✅ AMK Spy inicializado com sucesso');
            
            // Mostrar notificação de inicialização
            this.showWelcomeNotification();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar AMK Spy:', error);
            this.handleError(error);
        }
    }

    async initializeCore() {
        console.log('🔧 Inicializando componentes principais...');
        
        // DataManager (deve ser primeiro)
        this.dataManager = window.DataManager;
        if (!this.dataManager) {
            throw new Error('DataManager não encontrado');
        }
        
        // UIManager
        this.uiManager = window.UIManager;
        if (!this.uiManager) {
            throw new Error('UIManager não encontrado');
        }
        
        // Analyzer
        this.analyzer = window.Analyzer;
        if (!this.analyzer) {
            throw new Error('Analyzer não encontrado');
        }
        
        // Registrar componentes no UIManager
        this.registerComponents();
    }

    async initializeUI() {
        console.log('🎨 Inicializando interface...');
        
        // Inicializar UIManager
        await this.uiManager.initialize();
        
        // Inicializar componentes de UI
        await this.initializeUIComponents();
    }

    async initializeUIComponents() {
        const components = [
            { name: 'NotificationManager', instance: window.NotificationComponent },
            { name: 'ModalManager', instance: window.ModalComponent },
            { name: 'TableManager', instance: window.TableComponent },
            { name: 'FilterManager', instance: window.FilterManager },
            { name: 'ExportManager', instance: window.ExportManager },
            { name: 'ThemeManager', instance: window.ThemeManager }
        ];

        for (const { name, instance } of components) {
            if (instance) {
                this.uiManager.registerComponent(name, instance);
                if (typeof instance.initialize === 'function') {
                    await instance.initialize();
                }
            }
        }
    }

    async initializeServices() {
        console.log('🔧 Inicializando serviços...');
        
        // Inicializar serviços adicionais se necessário
        // Por exemplo: cache, analytics, etc.
    }

    registerComponents() {
        // Registrar componentes principais
        this.components.set('DataManager', this.dataManager);
        this.components.set('UIManager', this.uiManager);
        this.components.set('Analyzer', this.analyzer);
    }

    // ===== VERIFICAÇÃO DE PÁGINA =====
    isValidPage() {
        const url = window.location.href;
        const isAmazon = url.includes('amazon.com') || url.includes('amazon.com.br');
        const isSearchPage = url.includes('/s?') || url.includes('/gp/search');
        
        return isAmazon && isSearchPage;
    }

    // ===== EVENTOS GLOBAIS =====
    setupGlobalEvents() {
        // Listener para mensagens do popup
        chrome.runtime.onMessage.addListener(this.handleMessage);
        
        // Eventos de erro globais
        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handleError);
        
        // Evento de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.onPageVisible();
            }
        });
        
        // Evento de mudança de URL
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                this.onUrlChange(url);
            }
        }).observe(document, { subtree: true, childList: true });
    }

    handleMessage(request, sender, sendResponse) {
        try {
            console.log('📨 Mensagem recebida:', request);
            
            switch (request.action) {
                case 'analyze_rapid':
                    this.handleRapidAnalysis().then(sendResponse);
                    return true; // Indica resposta assíncrona
                    
                case 'analyze_complete':
                    this.handleCompleteAnalysis().then(sendResponse);
                    return true;
                    
                case 'show_table':
                    this.handleShowTable().then(sendResponse);
                    return true;
                    
                case 'show_settings':
                    this.handleShowSettings().then(sendResponse);
                    return true;
                    
                case 'export_data':
                    this.handleExportData(request.format).then(sendResponse);
                    return true;
                    
                case 'clear_data':
                    this.handleClearData().then(sendResponse);
                    return true;
                    
                case 'get_status':
                    sendResponse(this.getStatus());
                    break;
                    
                default:
                    console.warn('Ação desconhecida:', request.action);
                    sendResponse({ success: false, error: 'Ação desconhecida' });
            }
            
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    handleError(error) {
        console.error('❌ Erro capturado pelo AMK Spy:', error);
        
        // Mostrar notificação de erro
        if (this.uiManager) {
            this.uiManager.showNotification(
                `Erro: ${error.message || 'Erro inesperado'}`,
                'error',
                5000
            );
        }
        
        // Log do erro
        this.logError(error);
    }

    // ===== HANDLERS DE AÇÕES =====
    async handleRapidAnalysis() {
        try {
            this.uiManager.showLoading('Iniciando análise rápida...');
            
            const produtos = await this.analyzer.analisarProdutosPesquisaRapido();
            
            this.uiManager.showNotification(
                `Análise rápida concluída! ${produtos.length} produtos encontrados.`,
                'success'
            );
            
            return { success: true, count: produtos.length };
            
        } catch (error) {
            this.handleError(error);
            return { success: false, error: error.message };
        }
    }

    async handleCompleteAnalysis() {
        try {
            this.uiManager.showLoading('Iniciando análise completa...');
            
            const produtos = await this.analyzer.analisarProdutosTodasPaginas();
            
            this.uiManager.showNotification(
                `Análise completa concluída! ${produtos.length} produtos encontrados.`,
                'success'
            );
            
            return { success: true, count: produtos.length };
            
        } catch (error) {
            this.handleError(error);
            return { success: false, error: error.message };
        }
    }

    async handleShowTable() {
        try {
            const modalComponent = this.uiManager.getComponent('ModalManager');
            if (modalComponent) {
                modalComponent.showTableModal();
                return { success: true };
            } else {
                throw new Error('ModalComponent não disponível');
            }
        } catch (error) {
            this.handleError(error);
            return { success: false, error: error.message };
        }
    }

    async handleShowSettings() {
        try {
            const modalComponent = this.uiManager.getComponent('ModalManager');
            if (modalComponent) {
                modalComponent.showSettingsModal();
                return { success: true };
            } else {
                throw new Error('ModalComponent não disponível');
            }
        } catch (error) {
            this.handleError(error);
            return { success: false, error: error.message };
        }
    }

    async handleExportData(format = 'csv') {
        try {
            const exportManager = this.uiManager.getComponent('ExportManager');
            if (exportManager) {
                await exportManager.exportarDados(format);
                return { success: true };
            } else {
                throw new Error('ExportManager não disponível');
            }
        } catch (error) {
            this.handleError(error);
            return { success: false, error: error.message };
        }
    }

    async handleClearData() {
        try {
            this.dataManager.limparEstado();
            this.uiManager.showNotification('Dados limpos com sucesso!', 'success');
            return { success: true };
        } catch (error) {
            this.handleError(error);
            return { success: false, error: error.message };
        }
    }

    getStatus() {
        const produtos = this.dataManager.getProdutos();
        const metricas = this.dataManager.getMetricas();
        
        return {
            initialized: this.isInitialized,
            produtosCount: produtos.length,
            metricas: metricas,
            configuracao: this.dataManager.state.configuracao,
            url: window.location.href
        };
    }

    // ===== EVENTOS DE PÁGINA =====
    onPageVisible() {
        console.log('📄 Página tornou-se visível');
        // Recarregar dados se necessário
    }

    onUrlChange(newUrl) {
        console.log('🔗 URL mudou:', newUrl);
        
        // Verificar se ainda estamos em uma página válida
        if (!this.isValidPage()) {
            console.log('❌ Página não suportada após mudança de URL');
            return;
        }
        
        // Limpar dados se mudou de pesquisa
        this.handleSearchChange();
    }

    handleSearchChange() {
        // Detectar se mudou a pesquisa
        const currentSearch = this.getCurrentSearch();
        const lastSearch = this.dataManager.state.lastSearch;
        
        if (currentSearch !== lastSearch) {
            console.log('🔍 Nova pesquisa detectada');
            this.dataManager.updateState('lastSearch', currentSearch);
            
            // Limpar dados antigos
            this.dataManager.limparEstado();
            
            // Mostrar notificação
            this.uiManager.showNotification(
                'Nova pesquisa detectada. Faça uma nova análise para ver os resultados.',
                'info'
            );
        }
    }

    getCurrentSearch() {
        const url = new URL(window.location.href);
        return url.searchParams.get('k') || url.searchParams.get('q') || '';
    }

    // ===== UTILITÁRIOS =====
    loadSavedState() {
        try {
            const loaded = this.dataManager.carregarEstado();
            if (loaded) {
                console.log('📦 Estado salvo carregado');
                this.uiManager.showNotification('Dados anteriores carregados!', 'info');
            }
        } catch (error) {
            console.error('Erro ao carregar estado:', error);
        }
    }

    showWelcomeNotification() {
        this.uiManager.showNotification(
            '🔍 AMK Spy ativo! Clique no ícone da extensão para começar.',
            'info',
            5000
        );
    }

    logError(error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            message: error.message || 'Erro desconhecido',
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        console.error('Log de erro:', errorLog);
        
        // Salvar no localStorage para debug
        try {
            const logs = JSON.parse(localStorage.getItem('amk-spy-error-logs') || '[]');
            logs.push(errorLog);
            
            // Manter apenas os últimos 50 logs
            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }
            
            localStorage.setItem('amk-spy-error-logs', JSON.stringify(logs));
        } catch (e) {
            console.error('Erro ao salvar log:', e);
        }
    }

    // ===== DESTRUIÇÃO =====
    destroy() {
        console.log('🗑️ Destruindo AMK Spy...');
        
        // Remover listeners
        chrome.runtime.onMessage.removeListener(this.handleMessage);
        window.removeEventListener('error', this.handleError);
        window.removeEventListener('unhandledrejection', this.handleError);
        
        // Destruir componentes
        this.components.forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        // Limpar referências
        this.components.clear();
        this.dataManager = null;
        this.uiManager = null;
        this.analyzer = null;
        this.isInitialized = false;
        
        console.log('✅ AMK Spy destruído');
    }
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
let app = null;

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

async function initializeApp() {
    try {
        app = new AMKSpyApp();
        await app.initialize();
    } catch (error) {
        console.error('❌ Erro na inicialização do AMK Spy:', error);
    }
}

// Expor para uso global
window.AMKSpyApp = AMKSpyApp;
window.app = app; 