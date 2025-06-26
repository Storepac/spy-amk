/**
 * SyncPanel - Painel de controle para sincronização em nuvem
 */
class SyncPanel {
    constructor() {
        this.isVisible = false;
        this.syncInProgress = false;
    }

    /**
     * Mostra o painel de sincronização
     */
    show() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.createPanel();
        this.updateStats();
        
        // Atualizar stats a cada 5 segundos
        this.statsInterval = setInterval(() => {
            this.updateStats();
        }, 5000);
    }

    /**
     * Esconde o painel
     */
    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }
        
        const panel = document.getElementById('sync-panel');
        if (panel) {
            panel.remove();
        }
    }

    /**
     * Cria o painel HTML
     */
    createPanel() {
        // Remover painel existente se houver
        const existing = document.getElementById('sync-panel');
        if (existing) existing.remove();
        
        const panel = document.createElement('div');
        panel.id = 'sync-panel';
        panel.innerHTML = this.getPanelHTML();
        
        // Adicionar ao body
        document.body.appendChild(panel);
        
        // Configurar eventos
        this.setupEvents();
    }

    /**
     * Gera HTML do painel
     */
    getPanelHTML() {
        const stats = window.PositionTracker?.getSyncStats() || {};
        
        return `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-primary);
                border: 2px solid var(--border-light);
                border-radius: 12px;
                padding: 20px;
                width: 500px;
                max-width: 90vw;
                z-index: 10000;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                font-family: 'Poppins', sans-serif;
            ">
                <!-- Header -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid var(--border-light);
                ">
                    <h2 style="
                        margin: 0;
                        font-size: 18px;
                        color: var(--text-primary);
                        font-weight: 600;
                    ">☁️ Sincronização na Nuvem</h2>
                    
                    <button id="close-sync-panel" style="
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        color: var(--text-secondary);
                        padding: 5px;
                        border-radius: 4px;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='none'">
                        ✕
                    </button>
                </div>

                <!-- Status -->
                <div id="sync-status" style="margin-bottom: 20px;">
                    ${this.getStatusHTML(stats)}
                </div>

                <!-- Actions -->
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 20px;
                ">
                    <button id="btn-config-api" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0px)'">
                        🔧 Configurar API
                    </button>
                    
                    <button id="btn-full-sync" style="
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 6px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        ${!stats.hasApiUrl ? 'opacity: 0.5; cursor: not-allowed;' : ''}
                    " onmouseover="if(this.style.opacity !== '0.5') this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0px)'">
                        ☁️ Sincronizar Tudo
                    </button>
                </div>

                <!-- Logs -->
                <div style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-light);
                    border-radius: 6px;
                    padding: 15px;
                    max-height: 200px;
                    overflow-y: auto;
                ">
                    <h4 style="
                        margin: 0 0 10px 0;
                        font-size: 14px;
                        color: var(--text-primary);
                        font-weight: 600;
                    ">📋 Logs de Sincronização</h4>
                    
                    <div id="sync-logs" style="
                        font-size: 12px;
                        color: var(--text-secondary);
                        line-height: 1.4;
                    ">
                        Nenhum log ainda...
                    </div>
                </div>

                <!-- Footer -->
                <div style="
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid var(--border-light);
                    text-align: center;
                    font-size: 11px;
                    color: var(--text-secondary);
                ">
                    💡 Dica: Dados ficam salvos localmente mesmo se a API estiver offline
                </div>
            </div>
        `;
    }

    /**
     * Gera HTML do status
     */
    getStatusHTML(stats) {
        const onlineIcon = stats.isOnline ? '🟢' : '🔴';
        const onlineText = stats.isOnline ? 'Online' : 'Offline';
        const apiIcon = stats.hasApiUrl ? '✅' : '❌';
        const apiText = stats.hasApiUrl ? 'Configurada' : 'Não configurada';
        
        return `
            <div style="
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 15px;
            ">
                <div style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-light);
                    padding: 12px;
                    border-radius: 6px;
                    text-align: center;
                ">
                    <div style="font-size: 20px; margin-bottom: 5px;">${onlineIcon}</div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">Conexão</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${onlineText}</div>
                </div>
                
                <div style="
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-light);
                    padding: 12px;
                    border-radius: 6px;
                    text-align: center;
                ">
                    <div style="font-size: 20px; margin-bottom: 5px;">${apiIcon}</div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">API</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${apiText}</div>
                </div>
            </div>
            
            <div style="
                background: var(--bg-secondary);
                border: 1px solid var(--border-light);
                padding: 12px;
                border-radius: 6px;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">📊 Estatísticas</span>
                    <button id="btn-refresh-stats" style="
                        background: none;
                        border: 1px solid var(--border-light);
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 10px;
                        cursor: pointer;
                        color: var(--text-secondary);
                    ">🔄 Atualizar</button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 11px;">
                    <div style="text-align: center;">
                        <div style="color: var(--text-primary); font-weight: 600;">User ID</div>
                        <div style="color: var(--text-secondary); font-family: monospace;">${stats.userId || 'N/A'}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: var(--text-primary); font-weight: 600;">Fila Sync</div>
                        <div style="color: var(--text-secondary);">${stats.queueSize || 0} itens</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: var(--text-primary); font-weight: 600;">Último Sync</div>
                        <div style="color: var(--text-secondary);">${stats.lastSync || 'Nunca'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Configura eventos do painel
     */
    setupEvents() {
        // Fechar painel
        document.getElementById('close-sync-panel').addEventListener('click', () => {
            this.hide();
        });

        // Configurar API
        document.getElementById('btn-config-api').addEventListener('click', () => {
            this.configureApi();
        });

        // Sincronização completa
        document.getElementById('btn-full-sync').addEventListener('click', () => {
            this.fullSync();
        });

        // Atualizar stats
        document.getElementById('btn-refresh-stats').addEventListener('click', () => {
            this.updateStats();
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Configura URL da API
     */
    configureApi() {
        const currentUrl = window.PositionTracker?.apiBaseUrl || '';
        const newUrl = prompt('Digite a URL da sua API no Vercel:', currentUrl);
        
        if (newUrl && newUrl.trim()) {
            window.PositionTracker?.setApiUrl(newUrl.trim());
            this.updateStats();
            this.addLog('✅ API configurada: ' + newUrl.trim());
        }
    }

    /**
     * Executa sincronização completa
     */
    async fullSync() {
        if (this.syncInProgress) return;
        
        if (!window.PositionTracker?.apiBaseUrl) {
            alert('Configure a URL da API primeiro!');
            return;
        }
        
        this.syncInProgress = true;
        this.addLog('🔄 Iniciando sincronização completa...');
        
        try {
            const success = await window.PositionTracker.fullSync();
            
            if (success) {
                this.addLog('✅ Sincronização concluída com sucesso!');
                localStorage.setItem('amk_last_sync', new Date().toLocaleString('pt-BR'));
            } else {
                this.addLog('❌ Sincronização falhou');
            }
        } catch (error) {
            this.addLog('❌ Erro: ' + error.message);
        } finally {
            this.syncInProgress = false;
            this.updateStats();
        }
    }

    /**
     * Atualiza estatísticas
     */
    updateStats() {
        const statusDiv = document.getElementById('sync-status');
        if (statusDiv && window.PositionTracker) {
            const stats = window.PositionTracker.getSyncStats();
            statusDiv.innerHTML = this.getStatusHTML(stats);
            
            // Reconfigurar eventos dos botões
            const refreshBtn = document.getElementById('btn-refresh-stats');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => this.updateStats());
            }
        }
    }

    /**
     * Adiciona log
     */
    addLog(message) {
        const logsDiv = document.getElementById('sync-logs');
        if (logsDiv) {
            const timestamp = new Date().toLocaleTimeString('pt-BR');
            const logEntry = `[${timestamp}] ${message}`;
            
            if (logsDiv.textContent === 'Nenhum log ainda...') {
                logsDiv.textContent = logEntry;
            } else {
                logsDiv.textContent = logEntry + '\n' + logsDiv.textContent;
            }
            
            // Limitar a 10 logs
            const lines = logsDiv.textContent.split('\n');
            if (lines.length > 10) {
                logsDiv.textContent = lines.slice(0, 10).join('\n');
            }
        }
    }
}

// Criar instância global
if (typeof window !== 'undefined') {
    window.SyncPanel = new SyncPanel();
} 