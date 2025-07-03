/**
 * Unified Controller - Controlador unificado que roteia para sistemas específicos
 * Detecta automaticamente a plataforma e usa o sistema apropriado
 */
class UnifiedController {
    
    static currentPlatform = null;
    static activeController = null;
    static isInitialized = false;
    
    /**
     * INICIALIZAR CONTROLADOR UNIFICADO
     */
    static init() {
        if (this.isInitialized) {
            console.log('⚠️ [UNIFIED] Controlador unificado já inicializado');
            return;
        }
        
        console.log('🚀 [UNIFIED] Inicializando controlador unificado...');
        
        // Detectar plataforma
        this.currentPlatform = PlatformDetector?.detectPlatform();
        
        if (!this.currentPlatform) {
            console.log('ℹ️ [UNIFIED] Plataforma não suportada');
            return;
        }
        
        console.log(`🌐 [UNIFIED] Plataforma detectada: ${this.currentPlatform.platform}`);
        
        // Inicializar sistema específico
        this.initializePlatformSpecificSystem();
        
        this.isInitialized = true;
        console.log('✅ [UNIFIED] Controlador unificado inicializado');
    }
    
    /**
     * INICIALIZAR SISTEMA ESPECÍFICO DA PLATAFORMA
     */
    static initializePlatformSpecificSystem() {
        const platform = this.currentPlatform.platform;
        
        if (platform === 'amazon') {
            this.initializeAmazonSystem();
        } else if (platform === 'mercadolivre') {
            this.initializeMercadoLivreSystem();
        } else {
            console.warn(`⚠️ [UNIFIED] Plataforma não implementada: ${platform}`);
        }
    }
    
    /**
     * INICIALIZAR SISTEMA AMAZON
     */
    static initializeAmazonSystem() {
        console.log('📦 [UNIFIED] Inicializando sistema Amazon...');
        
        try {
            // Inicializar SidePanel Amazon
            if (typeof SidePanel !== 'undefined') {
                SidePanel.init(this.currentPlatform);
                console.log('✅ [UNIFIED] SidePanel Amazon inicializado');
            }
            
            // Inicializar AppController se for página de busca
            if (this.currentPlatform.type === 'search' && typeof AppController !== 'undefined') {
                AppController.init();
                this.activeController = 'AppController';
                console.log('✅ [UNIFIED] AppController Amazon inicializado');
            }
            
        } catch (error) {
            console.error('❌ [UNIFIED] Erro ao inicializar sistema Amazon:', error);
        }
    }
    
    /**
     * INICIALIZAR SISTEMA MERCADOLIVRE
     */
    static initializeMercadoLivreSystem() {
        console.log('🛒 [UNIFIED] Inicializando sistema MercadoLivre específico...');
        
        try {
            // Priorizar MLSidePanel específico
            if (typeof MLSidePanel !== 'undefined') {
                MLSidePanel.init(this.currentPlatform);
                console.log('✅ [UNIFIED] MLSidePanel específico inicializado');
            } else if (typeof SidePanel !== 'undefined') {
                // Fallback para SidePanel genérico
                SidePanel.init(this.currentPlatform);
                console.log('⚠️ [UNIFIED] Usando SidePanel genérico para ML');
            }
            
            // Inicializar MLController se for página de busca
            if (this.currentPlatform.type === 'search' && typeof MLController !== 'undefined') {
                MLController.init();
                this.activeController = 'MLController';
                console.log('✅ [UNIFIED] MLController específico inicializado');
            } else {
                console.warn('⚠️ [UNIFIED] MLController específico não disponível');
            }
            
        } catch (error) {
            console.error('❌ [UNIFIED] Erro ao inicializar sistema ML:', error);
        }
    }
    
    /**
     * MÉTODOS DE CONTROLE UNIFICADOS
     */
    static executeAnalysis(type = 'rapida') {
        console.log(`📊 [UNIFIED] Executando análise ${type}...`);
        
        const platform = this.currentPlatform?.platform;
        
        if (platform === 'amazon' && typeof AppController !== 'undefined') {
            AppController.iniciarAnaliseBackground(type);
        } else if (platform === 'mercadolivre' && typeof MLController !== 'undefined') {
            MLController.iniciarAnaliseBackgroundML(type);
        } else {
            console.warn('⚠️ [UNIFIED] Controlador específico não disponível para análise');
        }
    }
    
    static reextractProducts() {
        console.log('🔄 [UNIFIED] Re-extraindo produtos...');
        
        const platform = this.currentPlatform?.platform;
        
        if (platform === 'amazon' && typeof AppController !== 'undefined') {
            AppController.reextract();
        } else if (platform === 'mercadolivre' && typeof MLController !== 'undefined') {
            MLController.reextractML();
        } else {
            console.warn('⚠️ [UNIFIED] Controlador específico não disponível para re-extração');
        }
    }
    
    static getCurrentProducts() {
        const platform = this.currentPlatform?.platform;
        
        if (platform === 'amazon' && typeof AppController !== 'undefined') {
            return AppController.getCurrentProducts();
        } else if (platform === 'mercadolivre' && typeof MLController !== 'undefined') {
            return MLController.getCurrentProductsML();
        }
        
        return [];
    }
    
    static getCurrentSearchTerm() {
        const platform = this.currentPlatform?.platform;
        
        if (platform === 'amazon' && typeof AppController !== 'undefined') {
            return AppController.getCurrentSearchTerm();
        } else if (platform === 'mercadolivre' && typeof MLController !== 'undefined') {
            return MLController.getCurrentSearchTermML();
        }
        
        return '';
    }
    
    static toggleTable() {
        console.log('📊 [UNIFIED] Toggle tabela...');
        
        const platform = this.currentPlatform?.platform;
        
        if (platform === 'amazon') {
            // Amazon: usar SidePanel
            if (typeof SidePanel !== 'undefined') {
                SidePanel.toggleTabela();
            }
        } else if (platform === 'mercadolivre') {
            // ML: usar MLSidePanel específico ou fallback
            if (typeof MLSidePanel !== 'undefined') {
                MLSidePanel.toggleTabelaML();
            } else if (typeof SidePanel !== 'undefined') {
                SidePanel.toggleTabela();
            }
        }
    }
    
    /**
     * MÉTODOS DE INFORMAÇÃO
     */
    static getPlatformInfo() {
        return {
            platform: this.currentPlatform?.platform || 'unknown',
            type: this.currentPlatform?.type || 'unknown',
            activeController: this.activeController,
            isInitialized: this.isInitialized
        };
    }
    
    static getAvailableActions() {
        const platform = this.currentPlatform?.platform;
        const actions = [];
        
        if (platform === 'amazon') {
            actions.push('analise_rapida', 'analise_completa', 'reextrair', 'toggle_tabela', 'exportar');
        } else if (platform === 'mercadolivre') {
            actions.push('analise_rapida_ml', 'analise_completa_ml', 'reextrair_ml', 'toggle_tabela_ml', 'exportar_ml');
        }
        
        return actions;
    }
    
    /**
     * OBSERVER PARA MUDANÇAS DE PLATAFORMA
     */
    static setupPlatformObserver() {
        // Observer para mudanças de URL/página
        const observer = new MutationObserver(() => {
            const newPlatform = PlatformDetector?.detectPlatform();
            
            if (newPlatform?.platform !== this.currentPlatform?.platform) {
                console.log(`🔄 [UNIFIED] Mudança de plataforma detectada: ${this.currentPlatform?.platform} → ${newPlatform?.platform}`);
                this.cleanup();
                this.currentPlatform = newPlatform;
                this.initializePlatformSpecificSystem();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Listener para mudanças de URL
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                const newPlatform = PlatformDetector?.detectPlatform();
                if (newPlatform?.platform !== this.currentPlatform?.platform) {
                    this.cleanup();
                    this.currentPlatform = newPlatform;
                    this.initializePlatformSpecificSystem();
                }
            }, 500);
        });
    }
    
    /**
     * LIMPEZA
     */
    static cleanup() {
        console.log('🧹 [UNIFIED] Limpando controlador unificado...');
        
        // Cleanup específico por plataforma
        if (this.activeController === 'AppController' && typeof AppController !== 'undefined') {
            AppController.cleanup?.();
        } else if (this.activeController === 'MLController' && typeof MLController !== 'undefined') {
            MLController.cleanupML?.();
        }
        
        this.activeController = null;
    }
    
    /**
     * DIAGNÓSTICO
     */
    static diagnostico() {
        console.log('🔍 [UNIFIED] Diagnóstico do sistema:');
        console.log('Plataforma atual:', this.currentPlatform);
        console.log('Controlador ativo:', this.activeController);
        console.log('Inicializado:', this.isInitialized);
        console.log('Componentes disponíveis:');
        console.log('  - PlatformDetector:', typeof PlatformDetector !== 'undefined');
        console.log('  - AppController:', typeof AppController !== 'undefined');
        console.log('  - MLController:', typeof MLController !== 'undefined');
        console.log('  - SidePanel:', typeof SidePanel !== 'undefined');
        console.log('  - MLSidePanel:', typeof MLSidePanel !== 'undefined');
        console.log('  - MLTableManager:', typeof MLTableManager !== 'undefined');
        console.log('  - MLExtractor:', typeof MLExtractor !== 'undefined');
        console.log('  - MLAnalyzer:', typeof MLAnalyzer !== 'undefined');
        
        return this.getPlatformInfo();
    }
}

// Expor globalmente
window.UnifiedController = UnifiedController;

// Auto-inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => UnifiedController.init(), 1000);
    });
} else {
    setTimeout(() => UnifiedController.init(), 1000);
} 