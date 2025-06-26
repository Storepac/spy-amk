/**
 * NotificationComponent - Componente de notificações refatorado
 * Responsável por exibir notificações e mensagens ao usuário
 */
class NotificationComponent {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.isInitialized = false;
        this.defaultDuration = 3000;
        this.maxNotifications = 5;
        
        // Bind methods
        this.handleNotificationClick = this.handleNotificationClick.bind(this);
    }

    // ===== INICIALIZAÇÃO =====
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔧 Inicializando NotificationComponent...');
            
            this.createContainer();
            this.setupStyles();
            
            this.isInitialized = true;
            console.log('✅ NotificationComponent inicializado');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar NotificationComponent:', error);
            throw error;
        }
    }

    // ===== GESTÃO DE NOTIFICAÇÕES =====
    show(message, type = 'info', duration = null) {
        const notification = this.createNotification(message, type);
        const actualDuration = duration !== null ? duration : this.defaultDuration;
        
        // Adicionar ao container
        this.container.appendChild(notification);
        this.notifications.push(notification);
        
        // Animar entrada
        requestAnimationFrame(() => {
            notification.classList.add('notification-show');
        });
        
        // Configurar auto-remoção
        if (actualDuration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, actualDuration);
        }
        
        // Limitar número de notificações
        this.limitNotifications();
        
        console.log(`📢 Notificação ${type}: ${message}`);
        return notification;
    }

    hide(notification) {
        if (!notification) return;
        
        notification.classList.add('notification-hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    hideAll() {
        this.notifications.forEach(notification => {
            this.hide(notification);
        });
    }

    // ===== CRIAÇÃO DE NOTIFICAÇÕES =====
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getNotificationIcon(type);
        const title = this.getNotificationTitle(type);
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icon}</div>
                <div class="notification-body">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close" aria-label="Fechar">&times;</button>
            </div>
            <div class="notification-progress"></div>
        `;
        
        // Configurar eventos
        this.setupNotificationEvents(notification);
        
        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳'
        };
        return icons[type] || icons.info;
    }

    getNotificationTitle(type) {
        const titles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Aviso',
            info: 'Informação',
            loading: 'Processando'
        };
        return titles[type] || titles.info;
    }

    setupNotificationEvents(notification) {
        // Botão fechar
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide(notification);
            });
        }
        
        // Clique na notificação
        notification.addEventListener('click', this.handleNotificationClick);
    }

    handleNotificationClick(event) {
        // Se clicou no botão fechar, não fazer nada
        if (event.target.classList.contains('notification-close')) {
            return;
        }
        
        // Para notificações de erro, mostrar detalhes
        if (event.currentTarget.classList.contains('notification-error')) {
            this.showErrorDetails(event.currentTarget);
        }
    }

    // ===== NOTIFICAÇÕES ESPECÍFICAS =====
    showSuccess(message, duration = null) {
        return this.show(message, 'success', duration);
    }

    showError(message, duration = null) {
        return this.show(message, 'error', duration);
    }

    showWarning(message, duration = null) {
        return this.show(message, 'warning', duration);
    }

    showInfo(message, duration = null) {
        return this.show(message, 'info', duration);
    }

    showLoading(message = 'Carregando...', duration = null) {
        return this.show(message, 'loading', duration);
    }

    showCopySuccess(content) {
        return this.showSuccess(`${content} copiado para a área de transferência!`);
    }

    showCopyError(content) {
        return this.showError(`Erro ao copiar ${content}. Tente novamente.`);
    }

    showAnalysisProgress(current, total) {
        const percentage = Math.round((current / total) * 100);
        return this.show(`Analisando produtos... ${current}/${total} (${percentage}%)`, 'loading', 0);
    }

    showAnalysisComplete(count) {
        return this.showSuccess(`Análise concluída! ${count} produtos encontrados.`);
    }

    showAnalysisError(error) {
        return this.showError(`Erro na análise: ${error.message || error}`);
    }

    showExportSuccess(format) {
        return this.showSuccess(`Dados exportados em ${format.toUpperCase()} com sucesso!`);
    }

    showExportError(error) {
        return this.showError(`Erro na exportação: ${error.message || error}`);
    }

    showFilterApplied(filters) {
        const activeFilters = Object.values(filters).filter(f => f && f !== '').length;
        if (activeFilters > 0) {
            return this.showInfo(`${activeFilters} filtro(s) aplicado(s)`);
        }
    }

    showFiltersCleared() {
        return this.showSuccess('Filtros limpos!');
    }

    // ===== UTILITÁRIOS =====
    createContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    setupStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                font-family: 'Poppins', sans-serif;
            }
            
            .notification {
                background: var(--bg-primary, #ffffff);
                border: 1px solid var(--border-light, #e5e7eb);
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                max-width: 100%;
            }
            
            .notification-show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification-hide {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .notification-content {
                display: flex;
                align-items: flex-start;
                padding: 16px;
                gap: 12px;
            }
            
            .notification-icon {
                font-size: 20px;
                flex-shrink: 0;
                margin-top: 2px;
            }
            
            .notification-body {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: var(--text-primary, #111827);
                margin-bottom: 4px;
            }
            
            .notification-message {
                font-size: 13px;
                color: var(--text-secondary, #6b7280);
                line-height: 1.4;
                word-wrap: break-word;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                color: var(--text-secondary, #6b7280);
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            
            .notification-close:hover {
                background: var(--bg-secondary, #f3f4f6);
                color: var(--text-primary, #111827);
            }
            
            .notification-progress {
                height: 3px;
                background: var(--border-light, #e5e7eb);
                position: relative;
                overflow: hidden;
            }
            
            .notification-progress::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: progress 2s linear infinite;
            }
            
            @keyframes progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            /* Tipos de notificação */
            .notification-success {
                border-left: 4px solid #10b981;
            }
            
            .notification-error {
                border-left: 4px solid #ef4444;
            }
            
            .notification-warning {
                border-left: 4px solid #f59e0b;
            }
            
            .notification-info {
                border-left: 4px solid #3b82f6;
            }
            
            .notification-loading {
                border-left: 4px solid #8b5cf6;
            }
            
            /* Tema escuro */
            @media (prefers-color-scheme: dark) {
                .notification {
                    background: var(--bg-primary-dark, #1f2937);
                    border-color: var(--border-dark, #374151);
                }
                
                .notification-title {
                    color: var(--text-primary-dark, #f9fafb);
                }
                
                .notification-message {
                    color: var(--text-secondary-dark, #d1d5db);
                }
                
                .notification-close {
                    color: var(--text-secondary-dark, #d1d5db);
                }
                
                .notification-close:hover {
                    background: var(--bg-secondary-dark, #374151);
                    color: var(--text-primary-dark, #f9fafb);
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    limitNotifications() {
        while (this.notifications.length > this.maxNotifications) {
            const oldestNotification = this.notifications.shift();
            this.hide(oldestNotification);
        }
    }

    showErrorDetails(notification) {
        const message = notification.querySelector('.notification-message').textContent;
        
        // Criar modal com detalhes do erro
        const errorDetails = document.createElement('div');
        errorDetails.innerHTML = `
            <div class="error-details">
                <h4>Detalhes do Erro</h4>
                <pre>${message}</pre>
                <div class="error-actions">
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('${message.replace(/'/g, "\\'")}')">
                        📋 Copiar Erro
                    </button>
                    <button class="btn btn-primary" onclick="location.reload()">
                        🔄 Recarregar Página
                    </button>
                </div>
            </div>
        `;
        
        // Usar o ModalComponent se disponível
        const modalComponent = window.ModalComponent;
        if (modalComponent) {
            modalComponent.show(errorDetails, {
                title: '❌ Detalhes do Erro',
                size: 'medium',
                showConfirm: false,
                showCancel: true,
                cancelText: 'Fechar'
            });
        }
    }

    // ===== CONFIGURAÇÃO =====
    setDefaultDuration(duration) {
        this.defaultDuration = duration;
    }

    setMaxNotifications(max) {
        this.maxNotifications = max;
        this.limitNotifications();
    }

    // ===== DESTRUIÇÃO =====
    destroy() {
        this.hideAll();
        
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        
        const style = document.getElementById('notification-styles');
        if (style) {
            style.remove();
        }
        
        this.notifications = [];
        this.isInitialized = false;
        
        console.log('🗑️ NotificationComponent destruído');
    }
}

// Instância global
window.NotificationComponent = new NotificationComponent(); 