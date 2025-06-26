/**
 * UIManager - Gerenciador centralizado da interface do usuário
 * Responsável por coordenar todos os componentes de UI
 */
class UIManager {
    constructor() {
        this.dataManager = window.DataManager;
        this.components = new Map();
        this.modal = null;
        this.isInitialized = false;
        
        // Bind methods
        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    // ===== INICIALIZAÇÃO =====
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔧 Inicializando UIManager...');
            
            // Registrar listener para mudanças de estado
            this.dataManager.subscribe(this.handleStateChange);
            
            // Inicializar componentes
            await this.initializeComponents();
            
            // Configurar eventos globais
            this.setupGlobalEvents();
            
            this.isInitialized = true;
            console.log('✅ UIManager inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar UIManager:', error);
            this.handleError(error);
        }
    }

    async initializeComponents() {
        // Inicializar componentes na ordem correta
        const componentOrder = [
            'NotificationManager',
            'ModalManager', 
            'TableManager',
            'FilterManager',
            'ExportManager',
            'ThemeManager'
        ];

        for (const componentName of componentOrder) {
            try {
                const component = this.getComponent(componentName);
                if (component && typeof component.initialize === 'function') {
                    await component.initialize();
                    console.log(`✅ ${componentName} inicializado`);
                }
            } catch (error) {
                console.error(`❌ Erro ao inicializar ${componentName}:`, error);
            }
        }
    }

    // ===== GESTÃO DE COMPONENTES =====
    registerComponent(name, component) {
        this.components.set(name, component);
        console.log(`📝 Componente ${name} registrado`);
    }

    getComponent(name) {
        return this.components.get(name);
    }

    getComponents() {
        return Array.from(this.components.keys());
    }

    // ===== GESTÃO DE MODAL =====
    showModal(content, options = {}) {
        const modalManager = this.getComponent('ModalManager');
        if (modalManager) {
            return modalManager.show(content, options);
        }
    }

    hideModal() {
        const modalManager = this.getComponent('ModalManager');
        if (modalManager) {
            modalManager.hide();
        }
    }

    // ===== GESTÃO DE TABELA =====
    updateTable() {
        const tableManager = this.getComponent('TableManager');
        if (tableManager) {
            tableManager.render();
        }
    }

    // ===== GESTÃO DE FILTROS =====
    updateFilters() {
        const filterManager = this.getComponent('FilterManager');
        if (filterManager) {
            filterManager.render();
        }
    }

    // ===== NOTIFICAÇÕES =====
    showNotification(message, type = 'info', duration = 3000) {
        const notificationManager = this.getComponent('NotificationManager');
        if (notificationManager) {
            notificationManager.show(message, type, duration);
        }
    }

    // ===== LOADING =====
    showLoading(message = 'Carregando...') {
        this.dataManager.updateState('ui.loading', true);
        this.showNotification(message, 'info');
    }

    hideLoading() {
        this.dataManager.updateState('ui.loading', false);
    }

    updateProgress(progress) {
        this.dataManager.updateState('ui.progresso', progress);
    }

    // ===== EVENTOS =====
    setupGlobalEvents() {
        // Evento de tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });

        // Evento de clique fora do modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hideModal();
            }
        });

        // Evento de erro global
        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handleError);
    }

    handleStateChange(oldState, newState) {
        // Reagir a mudanças de estado
        if (oldState.produtos !== newState.produtos) {
            this.updateTable();
        }

        if (oldState.filtros !== newState.filtros) {
            this.updateFilters();
        }

        if (oldState.ui.loading !== newState.ui.loading) {
            this.handleLoadingChange(newState.ui.loading);
        }
    }

    handleLoadingChange(isLoading) {
        const loadingElement = document.getElementById('loading-overlay');
        
        if (isLoading) {
            if (!loadingElement) {
                this.createLoadingOverlay();
            }
        } else {
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    }

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Poppins', sans-serif;
        `;

        overlay.innerHTML = `
            <div style="
                background: var(--bg-primary);
                border-radius: 15px;
                padding: 30px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                border: 1px solid var(--border-light);
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <div style="
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 10px;
                ">🔍 AMK Spy</div>
                <div style="
                    font-size: 14px;
                    color: var(--text-secondary);
                ">Processando dados...</div>
            </div>
        `;

        // Adicionar CSS para animação
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(overlay);
    }

    handleError(error) {
        console.error('❌ Erro capturado pelo UIManager:', error);
        
        let message = 'Ocorreu um erro inesperado';
        
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        } else if (error.reason) {
            message = error.reason;
        }

        this.showNotification(message, 'error', 5000);
        this.hideLoading();
    }

    // ===== UTILITÁRIOS =====
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Aplicar atributos
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('on')) {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });

        // Adicionar filhos
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return element;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ===== DESTRUIÇÃO =====
    destroy() {
        // Remover listeners
        this.dataManager.unsubscribe(this.handleStateChange);
        
        // Destruir componentes
        this.components.forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        // Limpar referências
        this.components.clear();
        this.modal = null;
        this.isInitialized = false;

        console.log('🗑️ UIManager destruído');
    }
}

// Instância global
window.UIManager = new UIManager(); 