/**
 * ModalComponent - Componente de modal refatorado
 * Responsável por gerenciar modais e overlays
 */
class ModalComponent {
    constructor() {
        this.dataManager = window.DataManager;
        this.uiManager = window.UIManager;
        this.currentModal = null;
        this.modalStack = [];
        this.isInitialized = false;
        
        // Bind methods
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
    }

    // ===== INICIALIZAÇÃO =====
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔧 Inicializando ModalComponent...');
            
            // Configurar eventos globais
            this.setupGlobalEvents();
            
            this.isInitialized = true;
            console.log('✅ ModalComponent inicializado');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar ModalComponent:', error);
            throw error;
        }
    }

    // ===== GESTÃO DE MODAIS =====
    show(content, options = {}) {
        const modalId = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const modalConfig = {
            id: modalId,
            content: content,
            title: options.title || 'AMK Spy',
            size: options.size || 'medium', // small, medium, large, fullscreen
            closable: options.closable !== false,
            backdrop: options.backdrop !== false,
            animation: options.animation !== false,
            onClose: options.onClose || null,
            onConfirm: options.onConfirm || null,
            confirmText: options.confirmText || 'Confirmar',
            cancelText: options.cancelText || 'Cancelar',
            showConfirm: options.showConfirm || false,
            showCancel: options.showCancel !== false,
            ...options
        };

        const modalElement = this.createModal(modalConfig);
        
        // Adicionar ao stack
        this.modalStack.push(modalConfig);
        this.currentModal = modalConfig;

        // Adicionar ao DOM
        document.body.appendChild(modalElement);

        // Animar entrada
        if (modalConfig.animation) {
            requestAnimationFrame(() => {
                modalElement.classList.add('modal-show');
            });
        }

        // Focar no modal
        const focusableElement = modalElement.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElement) {
            focusableElement.focus();
        }

        console.log(`📋 Modal ${modalId} aberto`);
        return modalConfig;
    }

    hide(modalId = null) {
        const modalToClose = modalId ? 
            this.modalStack.find(m => m.id === modalId) : 
            this.modalStack[this.modalStack.length - 1];

        if (!modalToClose) {
            console.warn('Nenhum modal para fechar');
            return;
        }

        const modalElement = document.getElementById(modalToClose.id);
        if (!modalElement) {
            console.warn(`Modal ${modalToClose.id} não encontrado no DOM`);
            return;
        }

        // Animar saída
        modalElement.classList.remove('modal-show');
        modalElement.classList.add('modal-hide');

        setTimeout(() => {
            modalElement.remove();
            
            // Remover do stack
            const index = this.modalStack.findIndex(m => m.id === modalToClose.id);
            if (index > -1) {
                this.modalStack.splice(index, 1);
            }

            // Atualizar modal atual
            this.currentModal = this.modalStack[this.modalStack.length - 1] || null;

            // Chamar callback de fechamento
            if (modalToClose.onClose && typeof modalToClose.onClose === 'function') {
                modalToClose.onClose();
            }

            console.log(`📋 Modal ${modalToClose.id} fechado`);
        }, 300);
    }

    hideAll() {
        while (this.modalStack.length > 0) {
            this.hide();
        }
    }

    // ===== CRIAÇÃO DE MODAIS =====
    createModal(config) {
        const modal = document.createElement('div');
        modal.id = config.id;
        modal.className = `modal-overlay ${config.size}`;
        
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">${config.title}</h3>
                    ${config.closable ? '<button class="modal-close" aria-label="Fechar">&times;</button>' : ''}
                </div>
                <div class="modal-body">
                    ${typeof config.content === 'string' ? config.content : ''}
                </div>
                ${this.generateModalFooter(config)}
            </div>
        `;

        // Adicionar conteúdo dinâmico
        if (typeof config.content === 'object' && config.content instanceof Node) {
            const body = modal.querySelector('.modal-body');
            body.innerHTML = '';
            body.appendChild(config.content);
        }

        // Configurar eventos
        this.setupModalEvents(modal, config);

        return modal;
    }

    generateModalFooter(config) {
        if (!config.showConfirm && !config.showCancel) {
            return '';
        }

        return `
            <div class="modal-footer">
                ${config.showCancel ? `
                    <button class="btn btn-secondary modal-cancel">
                        ${config.cancelText}
                    </button>
                ` : ''}
                ${config.showConfirm ? `
                    <button class="btn btn-primary modal-confirm">
                        ${config.confirmText}
                    </button>
                ` : ''}
            </div>
        `;
    }

    setupModalEvents(modal, config) {
        // Botão fechar
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide(config.id));
        }

        // Botão cancelar
        const cancelBtn = modal.querySelector('.modal-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hide(config.id));
        }

        // Botão confirmar
        const confirmBtn = modal.querySelector('.modal-confirm');
        if (confirmBtn && config.onConfirm) {
            confirmBtn.addEventListener('click', () => {
                if (typeof config.onConfirm === 'function') {
                    config.onConfirm();
                }
                this.hide(config.id);
            });
        }

        // Clique no overlay
        if (config.backdrop) {
            modal.addEventListener('click', this.handleOverlayClick);
        }
    }

    // ===== MODAIS PRÉ-DEFINIDOS =====
    showTableModal() {
        const produtos = this.dataManager.getProdutos();
        
        if (produtos.length === 0) {
            return this.show(`
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>Nenhum produto analisado</h3>
                    <p>Faça uma análise primeiro para ver os resultados</p>
                    <button class="btn btn-primary" onclick="window.Analyzer.analisarProdutosPesquisaRapido()">
                        🔍 Fazer Análise Rápida
                    </button>
                </div>
            `, {
                title: '📊 Resultados da Análise',
                size: 'large',
                showConfirm: false,
                showCancel: false
            });
        }

        // Criar container para a tabela
        const tableContainer = document.createElement('div');
        tableContainer.id = 'modal-table-container';
        
        // Renderizar tabela no container
        const tableComponent = this.uiManager.getComponent('TableComponent');
        if (tableComponent) {
            tableComponent.container = tableContainer;
            tableComponent.render();
        }

        return this.show(tableContainer, {
            title: `📊 Resultados da Análise (${produtos.length} produtos)`,
            size: 'fullscreen',
            showConfirm: false,
            showCancel: false
        });
    }

    showAnalysisModal() {
        return this.show(`
            <div class="analysis-options">
                <div class="option-card" onclick="this.handleAnalysisOption('rapida')">
                    <div class="option-icon">⚡</div>
                    <h4>Análise Rápida</h4>
                    <p>Analisa apenas a página atual</p>
                    <div class="option-features">
                        <span>• Produtos da página atual</span>
                        <span>• Dados básicos</span>
                        <span>• Processamento rápido</span>
                    </div>
                </div>
                <div class="option-card" onclick="this.handleAnalysisOption('completa')">
                    <div class="option-icon">🔍</div>
                    <h4>Análise Completa</h4>
                    <p>Analisa múltiplas páginas</p>
                    <div class="option-features">
                        <span>• Até ${this.dataManager.state.configuracao.maxPaginas} páginas</span>
                        <span>• Dados detalhados</span>
                        <span>• Busca de marcas</span>
                    </div>
                </div>
            </div>
        `, {
            title: '🔍 Escolha o tipo de análise',
            size: 'medium',
            showConfirm: false,
            showCancel: false
        });
    }

    showSettingsModal() {
        const config = this.dataManager.state.configuracao;
        
        return this.show(`
            <div class="settings-form">
                <div class="setting-group">
                    <label for="max-paginas">📄 Máximo de páginas para análise completa</label>
                    <input type="number" id="max-paginas" value="${config.maxPaginas}" min="1" max="20">
                </div>
                <div class="setting-group">
                    <label for="delay-paginas">⏱️ Delay entre páginas (ms)</label>
                    <input type="number" id="delay-paginas" value="${config.delayEntrePaginas}" min="100" max="2000">
                </div>
                <div class="setting-group">
                    <label for="tema">🎨 Tema</label>
                    <select id="tema">
                        <option value="light" ${config.tema === 'light' ? 'selected' : ''}>Claro</option>
                        <option value="dark" ${config.tema === 'dark' ? 'selected' : ''}>Escuro</option>
                        <option value="auto" ${config.tema === 'auto' ? 'selected' : ''}>Automático</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="auto-busca" ${config.autoBusca ? 'checked' : ''}>
                        🔄 Busca automática de detalhes
                    </label>
                </div>
            </div>
        `, {
            title: '⚙️ Configurações',
            size: 'medium',
            showConfirm: true,
            showCancel: true,
            confirmText: 'Salvar',
            cancelText: 'Cancelar',
            onConfirm: () => this.saveSettings()
        });
    }

    showErrorModal(error) {
        return this.show(`
            <div class="error-content">
                <div class="error-icon">❌</div>
                <h4>Erro</h4>
                <p>${error.message || error}</p>
                <div class="error-details">
                    <small>Se o problema persistir, tente recarregar a página</small>
                </div>
            </div>
        `, {
            title: '❌ Erro',
            size: 'small',
            showConfirm: false,
            showCancel: true,
            cancelText: 'Fechar'
        });
    }

    // ===== EVENTOS =====
    setupGlobalEvents() {
        // Tecla ESC
        document.addEventListener('keydown', this.handleEscapeKey);
    }

    handleEscapeKey(event) {
        if (event.key === 'Escape' && this.currentModal) {
            this.hide();
        }
    }

    handleOverlayClick(event) {
        if (event.target.classList.contains('modal-overlay')) {
            this.hide();
        }
    }

    // ===== UTILITÁRIOS =====
    saveSettings() {
        const maxPaginas = parseInt(document.getElementById('max-paginas').value) || 5;
        const delayEntrePaginas = parseInt(document.getElementById('delay-paginas').value) || 300;
        const tema = document.getElementById('tema').value;
        const autoBusca = document.getElementById('auto-busca').checked;

        this.dataManager.updateState('configuracao', {
            maxPaginas,
            delayEntrePaginas,
            tema,
            autoBusca
        });

        // Salvar no localStorage
        this.dataManager.salvarEstado();

        this.uiManager.showNotification('Configurações salvas!', 'success');
    }

    handleAnalysisOption(tipo) {
        this.hide();
        
        if (tipo === 'rapida') {
            window.Analyzer.analisarProdutosPesquisaRapido()
                .then(() => this.showTableModal())
                .catch(error => this.showErrorModal(error));
        } else if (tipo === 'completa') {
            window.Analyzer.analisarProdutosTodasPaginas()
                .then(() => this.showTableModal())
                .catch(error => this.showErrorModal(error));
        }
    }

    // ===== DESTRUIÇÃO =====
    destroy() {
        this.hideAll();
        document.removeEventListener('keydown', this.handleEscapeKey);
        this.modalStack = [];
        this.currentModal = null;
        this.isInitialized = false;
        
        console.log('🗑️ ModalComponent destruído');
    }
}

// Instância global
window.ModalComponent = new ModalComponent(); 