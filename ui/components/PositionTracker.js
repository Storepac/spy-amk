/**
 * PositionTracker - Sistema de Tracking de Posições Local
 * Salva histórico no localStorage e mostra tendências na tabela
 */
class PositionTracker {
    constructor() {
        this.storageKey = 'amk_position_history';
        this.maxHistoryDays = 30; // Manter apenas 30 dias de histórico
        this.maxProductsTracked = 1000; // Limite de produtos monitorados
        
        // Configuração da API
        this.apiBaseUrl = Constants.API.BASE_URL;
        this.userId = this.generateUserFingerprint();
        this.isOnline = navigator.onLine;
        this.syncQueue = []; // Fila para sincronização offline
        
        // Configurar eventos de conectividade
        this.setupConnectivityListeners();
    }

    /**
     * Gera um fingerprint único para o usuário (anônimo)
     */
    generateUserFingerprint() {
        const saved = localStorage.getItem('amk_user_id');
        if (saved) return saved;
        
        // Gerar ID baseado em características do navegador (anônimo)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('AMK Spy Fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL().slice(-50) // Últimos 50 chars do canvas
        ].join('|');
        
        // Hash simples do fingerprint
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        const userId = 'user_' + Math.abs(hash).toString(36);
        localStorage.setItem('amk_user_id', userId);
        return userId;
    }

    /**
     * Configura listeners para mudanças de conectividade
     */
    setupConnectivityListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    /**
     * Inicializa o tracker com os produtos da busca atual
     * @param {Array} produtos - Array de produtos da tabela
     * @param {string} termoPesquisa - Termo usado na pesquisa
     */
    inicializar(produtos, termoPesquisa = '') {
        if (!produtos || produtos.length === 0) return;
        
        this.termoPesquisa = termoPesquisa || this.detectarTermoPesquisa();
        this.processarProdutos(produtos);
        this.limparHistoricoAntigo();
    }

    /**
     * Detecta o termo de pesquisa da URL atual
     */
    detectarTermoPesquisa() {
        const url = window.location.href;
        const match = url.match(/[?&]k=([^&]+)/);
        return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : 'busca-desconhecida';
    }

    /**
     * Processa lista de produtos e atualiza tracking
     * @param {Array} produtos - Lista de produtos
     */
    processarProdutos(produtos) {
        const agora = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        produtos.forEach((produto, index) => {
            if (produto.asin) {
                const posicaoAtual = index + 1;
                this.trackearPosicao(produto.asin, produto.titulo, posicaoAtual, agora);
            }
        });
    }

    /**
     * Registra ou atualiza a posição de um produto
     * @param {string} asin - ASIN do produto
     * @param {string} titulo - Título do produto
     * @param {number} posicao - Posição atual na busca
     * @param {string} data - Data no formato YYYY-MM-DD
     */
    trackearPosicao(asin, titulo, posicao, data) {
        const historico = this.getHistorico();
        
        // Inicializar produto se não existir
        if (!historico[asin]) {
            historico[asin] = {
                titulo: titulo.substring(0, 100), // Limitar tamanho
                termo: this.termoPesquisa,
                historico: []
            };
        }

        // Verificar se já existe entrada para hoje
        const entryHoje = historico[asin].historico.find(entry => entry.data === data);
        
        if (!entryHoje) {
            // Adicionar nova entrada
            historico[asin].historico.push({
                data: data,
                posicao: posicao,
                timestamp: Date.now()
            });
        } else {
            // Atualizar posição se diferente
            if (entryHoje.posicao !== posicao) {
                entryHoje.posicao = posicao;
                entryHoje.timestamp = Date.now();
            }
        }

        // Limitar histórico por produto (últimas 30 entradas)
        historico[asin].historico = historico[asin].historico
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, this.maxHistoryDays);

        this.salvarHistorico(historico);
    }

    /**
     * Obtém o histórico completo do localStorage
     * @returns {Object} Histórico de posições
     */
    getHistorico() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Erro ao ler histórico de posições:', error);
            return {};
        }
    }

    /**
     * Salva o histórico no localStorage
     * @param {Object} historico - Histórico atualizado
     */
    salvarHistorico(historico) {
        try {
            // Limitar número total de produtos monitorados
            const produtos = Object.keys(historico);
            if (produtos.length > this.maxProductsTracked) {
                // Manter apenas os mais recentemente atualizados
                const produtosOrdenados = produtos
                    .map(asin => ({
                        asin,
                        ultimaAtualizacao: Math.max(...historico[asin].historico.map(h => h.timestamp))
                    }))
                    .sort((a, b) => b.ultimaAtualizacao - a.ultimaAtualizacao)
                    .slice(0, this.maxProductsTracked);

                const novoHistorico = {};
                produtosOrdenados.forEach(item => {
                    novoHistorico[item.asin] = historico[item.asin];
                });
                historico = novoHistorico;
            }

            localStorage.setItem(this.storageKey, JSON.stringify(historico));
        } catch (error) {
            console.error('Erro ao salvar histórico de posições:', error);
        }
    }

    /**
     * Remove entradas antigas do histórico
     */
    limparHistoricoAntigo() {
        const historico = this.getHistorico();
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - this.maxHistoryDays);
        const dataLimiteStr = dataLimite.toISOString().split('T')[0];

        let modificado = false;
        Object.keys(historico).forEach(asin => {
            const historicoOriginal = historico[asin].historico.length;
            historico[asin].historico = historico[asin].historico.filter(entry => entry.data >= dataLimiteStr);
            
            if (historico[asin].historico.length === 0) {
                delete historico[asin];
                modificado = true;
            } else if (historico[asin].historico.length !== historicoOriginal) {
                modificado = true;
            }
        });

        if (modificado) {
            this.salvarHistorico(historico);
        }
    }

    /**
     * Calcula tendências usando API do servidor
     * @param {Array} asins - Lista de ASINs para calcular tendência
     * @param {string} termoPesquisa - Termo de pesquisa atual
     * @returns {Promise<Object>} Objeto com tendências calculadas
     */
    async calcularTendenciasServidor(asins, termoPesquisa = '') {
        // TEMPORÁRIO: Usar apenas método local até API ser deployada
        console.log(`📈 Usando método local para ${asins.length} ASINs (API ainda não deployada)`);
        return this.calcularTendenciasLocal(asins);
        
        /* CÓDIGO PARA QUANDO API ESTIVER DEPLOYADA:
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/get-position-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asins: asins,
                    userId: this.userId,
                    termoPesquisa: termoPesquisa
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(`📈 Tendências do servidor: ${data.tendencias_calculadas}/${data.total_asins}`);
                    return data.tendencias;
                }
            }
            
            console.warn('Falha na API de tendências, usando método local');
            return this.calcularTendenciasLocal(asins);
            
        } catch (error) {
            console.warn('Erro na API de tendências, usando método local:', error);
            return this.calcularTendenciasLocal(asins);
        }
        */
    }

    /**
     * Calcula tendências usando dados locais (fallback)
     * @param {Array} asins - Lista de ASINs
     * @returns {Object} Tendências calculadas localmente
     */
    calcularTendenciasLocal(asins) {
        const tendencias = {};
        const historico = this.getHistorico();
        
        console.log(`📊 Calculando tendências locais para ${asins.length} ASINs...`);
        
        asins.forEach(asin => {
            const tendenciaLocal = this.calcularTendencia(asin);
            
            // Obter posições atual e anterior do histórico
            let posicaoAtual = null;
            let posicaoAnterior = null;
            
            if (historico[asin] && historico[asin].historico.length > 0) {
                const entries = historico[asin].historico.sort((a, b) => new Date(b.data) - new Date(a.data));
                posicaoAtual = entries[0].posicao;
                if (entries.length > 1) {
                    posicaoAnterior = entries[1].posicao;
                }
            }
            
            // Converter formato local para formato da API
            tendencias[asin] = {
                tendencia: tendenciaLocal.tipo,
                icone: tendenciaLocal.icone,
                cor: tendenciaLocal.cor,
                posicao_atual: posicaoAtual,
                posicao_anterior: posicaoAnterior,
                diferenca: tendenciaLocal.diferenca || 0,
                titulo: tendenciaLocal.titulo
            };
        });
        
        console.log(`✅ Tendências locais calculadas:`, Object.keys(tendencias).length, tendencias);
        return tendencias;
    }

    /**
     * Calcula a tendência de um produto (subiu, desceu, manteve)
     * @param {string} asin - ASIN do produto
     * @returns {Object} Objeto com tendência e dados
     */
    calcularTendencia(asin) {
        const historico = this.getHistorico();
        if (!historico[asin] || historico[asin].historico.length < 2) {
            return {
                tipo: 'novo',
                icone: '🆕',
                cor: '#3b82f6',
                titulo: 'Produto detectado pela primeira vez'
            };
        }

        const entries = historico[asin].historico.sort((a, b) => new Date(b.data) - new Date(a.data));
        const posicaoAtual = entries[0].posicao;
        const posicaoAnterior = entries[1].posicao;
        const diferenca = posicaoAnterior - posicaoAtual;

        if (diferenca > 0) {
            return {
                tipo: 'subiu',
                icone: '↗️',
                cor: '#10b981',
                diferenca: diferenca,
                titulo: `Subiu ${diferenca} posição${diferenca > 1 ? 'ões' : ''} (${posicaoAnterior} → ${posicaoAtual})`
            };
        } else if (diferenca < 0) {
            return {
                tipo: 'desceu',
                icone: '↘️',
                cor: '#ef4444',
                diferenca: Math.abs(diferenca),
                titulo: `Desceu ${Math.abs(diferenca)} posição${Math.abs(diferenca) > 1 ? 'ões' : ''} (${posicaoAnterior} → ${posicaoAtual})`
            };
        } else {
            return {
                tipo: 'manteve',
                icone: '➡️',
                cor: '#f59e0b',
                titulo: `Manteve a posição ${posicaoAtual}`
            };
        }
    }

    /**
     * Gera o HTML da coluna de tendência para um produto
     * @param {string} asin - ASIN do produto
     * @param {Object} tendenciaServidor - Tendência calculada pelo servidor (opcional)
     * @returns {string} HTML da célula de tendência
     */
    gerarColunaTendencia(asin, tendenciaServidor = null) {
        if (!asin) return '<td style="text-align: center; color: #6b7280;">-</td>';

        // Usar tendência do servidor se disponível, senão calcular local
        const tendencia = tendenciaServidor || this.calcularTendencia(asin);
        
        // Normalizar propriedades (API usa nomes diferentes)
        const tipo = tendencia.tendencia || tendencia.tipo;
        const icone = tendencia.icone;
        const cor = tendencia.cor;
        const diferenca = tendencia.diferenca;
        const titulo = tendencia.titulo || this.gerarTituloTendencia(tendencia);
        
        return `
            <td style="
                text-align: center; 
                font-size: 16px; 
                color: ${cor};
                cursor: help;
                padding: 8px;
                border-right: 1px solid var(--border-light);
            " title="${titulo}">
                ${icone}
                ${diferenca && diferenca > 0 ? `<span style="font-size: 10px; margin-left: 2px;">${diferenca}</span>` : ''}
            </td>
        `;
    }

    /**
     * Gera título da tendência baseado nos dados
     * @param {Object} tendencia - Dados da tendência
     * @returns {string} Título formatado
     */
    gerarTituloTendencia(tendencia) {
        const tipo = tendencia.tendencia || tendencia.tipo;
        const atual = tendencia.posicao_atual;
        const anterior = tendencia.posicao_anterior;
        const diferenca = tendencia.diferenca;

        switch (tipo) {
            case 'subiu':
                return `Subiu ${diferenca} posição${diferenca > 1 ? 'ões' : ''} (${anterior} → ${atual})`;
            case 'desceu':
                return `Desceu ${diferenca} posição${diferenca > 1 ? 'ões' : ''} (${anterior} → ${atual})`;
            case 'manteve':
                return `Manteve a posição ${atual}`;
            case 'novo':
                return `Produto novo - posição ${atual}`;
            default:
                return 'Sem dados de tendência';
        }
    }

    /**
     * Obtém estatísticas do tracking
     * @returns {Object} Estatísticas gerais
     */
    getEstatisticas() {
        const historico = this.getHistorico();
        const produtos = Object.keys(historico);
        
        let produtosSubindo = 0;
        let produtosDescendo = 0;
        let produtosMantendo = 0;
        let produtosNovos = 0;

        produtos.forEach(asin => {
            const tendencia = this.calcularTendencia(asin);
            switch (tendencia.tipo) {
                case 'subiu': produtosSubindo++; break;
                case 'desceu': produtosDescendo++; break;
                case 'manteve': produtosMantendo++; break;
                case 'novo': produtosNovos++; break;
            }
        });

        const totalStorage = JSON.stringify(historico).length;
        const storagePercent = ((totalStorage / (5 * 1024 * 1024)) * 100).toFixed(1); // % de 5MB

        return {
            totalProdutos: produtos.length,
            produtosSubindo,
            produtosDescendo,
            produtosMantendo,
            produtosNovos,
            totalStorage,
            storagePercent
        };
    }

    /**
     * Exporta o histórico para JSON
     * @returns {string} JSON do histórico
     */
    exportarHistorico() {
        const historico = this.getHistorico();
        const stats = this.getEstatisticas();
        
        return JSON.stringify({
            exportado_em: new Date().toISOString(),
            versao: '1.0',
            estatisticas: stats,
            historico: historico
        }, null, 2);
    }

    /**
     * Limpa todo o histórico (usar com cuidado!)
     */
    limparTudo() {
        localStorage.removeItem(this.storageKey);
    }

    // ===== MÉTODOS DE SINCRONIZAÇÃO COM API =====

    /**
     * Configura a URL da API (será chamado após deploy)
     */
    setApiUrl(url) {
        this.apiBaseUrl = url;
        localStorage.setItem('amk_api_url', url);
    }

    /**
     * Sincroniza uma posição com a API
     */
    async syncPositionToCloud(asin, titulo, posicao, termoPesquisa) {
        if (!this.isOnline || !this.apiBaseUrl) return false;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/save-position`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    asin,
                    titulo,
                    posicao,
                    termoPesquisa,
                    userId: this.userId
                })
            });

            if (response.ok) {
                const result = await response.json();
                return result.success;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('Erro ao sincronizar posição:', error);
            this.addToSyncQueue(asin, titulo, posicao, termoPesquisa);
            return false;
        }
    }

    /**
     * Adiciona item à fila de sincronização offline
     */
    addToSyncQueue(asin, titulo, posicao, termoPesquisa) {
        this.syncQueue.push({
            asin,
            titulo,
            posicao,
            termoPesquisa,
            timestamp: Date.now()
        });
        
        // Limitar fila a 100 itens
        if (this.syncQueue.length > 100) {
            this.syncQueue = this.syncQueue.slice(-100);
        }
        
        localStorage.setItem('amk_sync_queue', JSON.stringify(this.syncQueue));
    }

    /**
     * Processa fila de sincronização quando volta online
     */
    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;
        
        const queueCopy = [...this.syncQueue];
        this.syncQueue = [];
        
        for (const item of queueCopy) {
            const success = await this.syncPositionToCloud(
                item.asin, 
                item.titulo, 
                item.posicao, 
                item.termoPesquisa
            );
            
            if (!success) {
                // Se falhar, recoloca na fila
                this.syncQueue.push(item);
            }
            
            // Delay entre requests para não sobrecarregar API
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        localStorage.setItem('amk_sync_queue', JSON.stringify(this.syncQueue));
    }

    /**
     * Busca histórico da nuvem
     */
    async getCloudHistory(asin = null) {
        if (!this.isOnline || !this.apiBaseUrl) return null;
        
        try {
            const params = new URLSearchParams({
                userId: this.userId,
                ...(asin && { asin })
            });
            
            const response = await fetch(`${this.apiBaseUrl}/api/get-history?${params}`);
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('Erro ao buscar histórico da nuvem:', error);
            return null;
        }
    }

    /**
     * Sincronização completa: merge dados locais com nuvem
     */
    async fullSync() {
        if (!this.isOnline || !this.apiBaseUrl) {
            console.warn('Sincronização cancelada: offline ou API não configurada');
            return false;
        }
        
        try {
            const historicoLocal = this.getHistorico();
            
            if (Object.keys(historicoLocal).length === 0) {
                console.log('Nenhum dado local para sincronizar');
                return true;
            }
            
            const response = await fetch(`${this.apiBaseUrl}/api/sync-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    historico: historicoLocal,
                    action: 'merge'
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Sincronização completa:', result.resultados);
                
                // Atualizar dados locais com dados da nuvem
                const dadosNuvem = await this.getCloudHistory();
                if (dadosNuvem && dadosNuvem.success) {
                    this.salvarHistorico(dadosNuvem.historico);
                }
                
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erro na sincronização completa:', error);
            return false;
        }
    }

    /**
     * Versão híbrida do trackearPosicao que sincroniza com nuvem
     */
    async trackearPosicaoHybrid(asin, titulo, posicao, data) {
        // Sempre salvar localmente primeiro
        this.trackearPosicao(asin, titulo, posicao, data);
        
        // Tentar sincronizar com nuvem
        if (this.isOnline && this.apiBaseUrl) {
            await this.syncPositionToCloud(asin, titulo, posicao, this.termoPesquisa);
        } else {
            // Adicionar à fila se offline
            this.addToSyncQueue(asin, titulo, posicao, this.termoPesquisa);
        }
    }

    /**
     * Obtém estatísticas de sincronização
     */
    getSyncStats() {
        return {
            userId: this.userId,
            isOnline: this.isOnline,
            hasApiUrl: !!this.apiBaseUrl,
            queueSize: this.syncQueue.length,
            lastSync: localStorage.getItem('amk_last_sync') || 'Nunca'
        };
    }
}

// Criar instância global
if (typeof window !== 'undefined') {
    window.PositionTracker = new PositionTracker();
} 