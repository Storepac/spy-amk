/**
 * MLManager - Gerencia integração específica com Mercado Livre
 * Salva produtos ML automaticamente no banco
 */
class MLManager {
    constructor() {
        this.apiBaseUrl = Constants.API.BASE_URL;
        
        this.userId = this.generateUserFingerprint();
        this.isEnabled = this.getSettings().autoSave;
        this.isOnline = navigator.onLine;
        this.saveQueue = [];
        
        this.setupConnectivityListeners();
        
        console.log('🛒 MLManager inicializado:', {
            userId: this.userId,
            apiUrl: this.apiBaseUrl,
            autoSave: this.isEnabled,
            online: this.isOnline
        });
    }

    /**
     * Gerar fingerprint único do usuário
     */
    generateUserFingerprint() {
        let fingerprint = localStorage.getItem('amk_ml_user_id');
        
        if (!fingerprint) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('AMK ML Fingerprint', 2, 2);
            
            const canvasData = canvas.toDataURL();
            const screen = `${screen.width}x${screen.height}`;
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const userAgent = navigator.userAgent.substring(0, 100);
            
            const data = `${canvasData}-${screen}-${timezone}-${userAgent}`;
            fingerprint = btoa(data).substring(0, 32);
            
            localStorage.setItem('amk_ml_user_id', fingerprint);
        }
        
        return fingerprint;
    }

    /**
     * Configurar listeners de conectividade
     */
    setupConnectivityListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🟢 Conexão restaurada - processando fila ML');
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('🔴 Conexão perdida - salvamento ML em fila');
        });
    }

    /**
     * Obter configurações do usuário
     */
    getSettings() {
        try {
            const settings = localStorage.getItem('amk_ml_settings');
            return settings ? JSON.parse(settings) : {
                autoSave: true,
                savePositions: true,
                saveProductDetails: true
            };
        } catch (error) {
            return {
                autoSave: true,
                savePositions: true,
                saveProductDetails: true
            };
        }
    }

    /**
     * Salvar configurações do usuário
     */
    saveSettings(settings) {
        try {
            localStorage.setItem('amk_ml_settings', JSON.stringify(settings));
            this.isEnabled = settings.autoSave;
        } catch (error) {
            console.error('Erro ao salvar configurações ML:', error);
        }
    }

    /**
     * Analisar posições ML (método principal)
     */
    async analisarProdutosML(produtos, termoPesquisa, paginaAtual = 1) {
        if (!this.isEnabled || !produtos || produtos.length === 0) {
            console.log('⚠️ ML Manager desabilitado ou sem produtos');
            return produtos;
        }

        try {
            console.log(`🛒 Iniciando análise ML: ${produtos.length} produtos, página ${paginaAtual}`);

            // 1. Verificar produtos existentes
            const mlIds = produtos.map(p => p.mlId).filter(id => id);
            const verificacao = await this.verificarProdutosExistentes(mlIds);
            
            if (!verificacao.success) {
                console.warn('⚠️ Não foi possível verificar produtos ML existentes');
                return produtos;
            }

            // 2. Separar novos vs existentes
            const produtosNovos = produtos.filter(p => verificacao.novos.includes(p.mlId));
            const produtosExistentes = produtos.filter(p => verificacao.existentes.includes(p.mlId));

            console.log(`📊 ML: ${produtosNovos.length} novos, ${produtosExistentes.length} existentes`);

            // 3. Salvar produtos novos
            if (produtosNovos.length > 0) {
                await this.salvarProdutosML(produtosNovos);
            }

            // 4. Salvar posições de todos os produtos
            if (this.getSettings().savePositions) {
                await this.salvarPosicoesML(produtos, termoPesquisa);
            }

            // 5. Buscar produtos do banco relacionados ao termo
            const produtosBanco = await this.buscarProdutosDoBanco(termoPesquisa);

            // 6. Combinar produtos atuais + banco, evitando duplicatas
            const todosMLIds = new Set(produtos.map(p => p.mlId));
            const produtosBancoUnicos = produtosBanco.filter(p => !todosMLIds.has(p.mlId));

            const produtosCombinados = [
                ...produtos.map(p => ({ 
                    ...p, 
                    isNovo: verificacao.novos.includes(p.mlId),
                    origem: 'ml_atual'
                })),
                ...produtosBancoUnicos
            ];

            console.log(`✅ ML: ${produtosCombinados.length} produtos finais (${produtos.length} atuais + ${produtosBancoUnicos.length} banco)`);

            return produtosCombinados;

        } catch (error) {
            console.error('❌ Erro na análise ML:', error);
            return produtos;
        }
    }

    /**
     * Verificar produtos ML existentes
     */
    async verificarProdutosExistentes(mlIds) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/ml-check-existing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mlIds, userId: this.userId })
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Erro ao verificar ML existentes:', error);
            return { success: false, existentes: [], novos: mlIds };
        }
    }

    /**
     * Salvar produtos ML novos
     */
    async salvarProdutosML(produtos) {
        const promises = produtos.map(produto => this.salvarProdutoML(produto));
        
        try {
            const resultados = await Promise.allSettled(promises);
            const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
            const falhas = resultados.filter(r => r.status === 'rejected').length;
            
            console.log(`💾 ML salvamento: ${sucessos} sucessos, ${falhas} falhas`);
        } catch (error) {
            console.error('❌ Erro no salvamento ML em lote:', error);
        }
    }

    /**
     * Salvar produto ML individual
     */
    async salvarProdutoML(produto) {
        try {
            const dados = {
                mlId: produto.mlId,
                titulo: produto.titulo,
                preco: produto.preco,
                precoOriginal: produto.precoOriginal,
                desconto: produto.desconto,
                avaliacao: produto.avaliacao,
                numAvaliacoes: produto.numAvaliacoes,
                vendedor: produto.vendedor,
                patrocinado: produto.patrocinado || false,
                maisVendido: produto.maisVendido || false,
                lojaOficial: produto.lojaOficial || false,
                freteGratis: produto.freteGratis || false,
                condicao: produto.condicao || 'Novo',
                vendas: produto.vendas,
                receita: produto.receita,
                link: produto.link,
                imagem: produto.imagem,
                userId: this.userId
            };

            const response = await fetch(`${this.apiBaseUrl}/api/ml-insert-product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                console.log('✅ Produto ML salvo:', produto.mlId);
                return { success: true };
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.warn('❌ Erro ao salvar produto ML:', error);
            this.adicionarNaFila(produto, 'product');
            return { success: false, error: error.message };
        }
    }

    /**
     * Salvar posições ML
     */
    async salvarPosicoesML(produtos, termoPesquisa) {
        const promises = produtos
            .filter(p => p.mlId && p.posicao)
            .map(produto => this.salvarPosicaoML(produto, termoPesquisa));
        
        try {
            await Promise.allSettled(promises);
        } catch (error) {
            console.error('❌ Erro ao salvar posições ML:', error);
        }
    }

    /**
     * Salvar posição ML individual
     */
    async salvarPosicaoML(produto, termoPesquisa) {
        try {
            const dados = {
                mlId: produto.mlId,
                titulo: produto.titulo,
                posicao: produto.posicao,
                termoPesquisa: termoPesquisa,
                userId: this.userId
            };

            const response = await fetch(`${this.apiBaseUrl}/api/ml-save-position`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            return response.ok;
        } catch (error) {
            console.warn('❌ Erro ao salvar posição ML:', error);
            return false;
        }
    }

    /**
     * Buscar produtos ML do banco
     */
    async buscarProdutosDoBanco(termoPesquisa) {
        try {
            const response = await fetch(
                `${this.apiBaseUrl}/api/ml-get-products?termo=${encodeURIComponent(termoPesquisa)}&userId=${this.userId}`
            );

            if (response.ok) {
                const result = await response.json();
                return result.produtos || [];
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Erro ao buscar produtos ML do banco:', error);
            return this.buscarProdutosDoBancoLocal(termoPesquisa);
        }
    }

    /**
     * Fallback local para produtos ML
     */
    buscarProdutosDoBancoLocal(termoPesquisa) {
        try {
            const key = `amk_ml_produtos_${this.userId}`;
            const dados = localStorage.getItem(key);
            
            if (!dados) return [];
            
            const produtosSalvos = JSON.parse(dados);
            const termoLimpo = termoPesquisa.toLowerCase().trim();
            
            const produtosFiltrados = produtosSalvos.filter(produto => 
                produto.titulo && produto.titulo.toLowerCase().includes(termoLimpo)
            ).slice(0, 50);
            
            // Completar dados para compatibilidade
            produtosFiltrados.forEach(produto => {
                produto.isNovo = false;
                produto.origem = 'ml_local';
                produto.posicao = null;
                produto.plataforma = 'mercadolivre';
                produto.tipo = 'Histórico ML';
                
                if (!produto.imagem) {
                    produto.imagem = 'https://via.placeholder.com/150x150?text=ML';
                }
                if (!produto.precoNumerico) {
                    produto.precoNumerico = produto.preco || 0;
                }
                if (!produto.vendidos) {
                    produto.vendidos = produto.vendas || 'N/A';
                }
            });
            
            console.log(`💾 ML: ${produtosFiltrados.length} produtos localmente`);
            return produtosFiltrados;
            
        } catch (error) {
            console.error('❌ Erro no fallback ML local:', error);
            return [];
        }
    }

    /**
     * Adicionar item na fila para salvamento offline
     */
    adicionarNaFila(dados, type = 'product') {
        this.saveQueue.push({
            type,
            data: dados,
            timestamp: Date.now()
        });

        if (this.saveQueue.length > 1000) {
            this.saveQueue = this.saveQueue.slice(-500);
        }

        try {
            localStorage.setItem('amk_ml_queue', JSON.stringify(this.saveQueue));
        } catch (error) {
            console.error('Erro ao salvar fila ML:', error);
        }
    }

    /**
     * Processar fila offline
     */
    async processQueue() {
        if (!this.isOnline || this.saveQueue.length === 0) return;

        console.log(`🔄 Processando ${this.saveQueue.length} itens da fila ML`);

        const queue = [...this.saveQueue];
        this.saveQueue = [];

        for (const item of queue) {
            try {
                if (item.type === 'product') {
                    await this.salvarProdutoML(item.data);
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error('Erro ao processar item da fila ML:', error);
                this.saveQueue.push(item);
            }
        }

        // Atualizar localStorage
        try {
            localStorage.setItem('amk_ml_queue', JSON.stringify(this.saveQueue));
        } catch (error) {
            console.error('Erro ao atualizar fila ML:', error);
        }
    }

    /**
     * Testar conexão com API ML
     */
    async testarConexao() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/test-connection`);
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Conexão ML OK:', result);
                return { success: true, data: result };
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Erro de conexão ML:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Limpar dados ML
     */
    limparDados() {
        localStorage.removeItem('amk_ml_queue');
        localStorage.removeItem('amk_ml_current_search_term');
        this.saveQueue = [];
        console.log('🧹 Dados do MLManager limpos');
    }

    /**
     * Obter estatísticas ML
     */
    async obterEstatisticas() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/count-records`);
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas ML:', error);
            return null;
        }
    }
}

// Expor globalmente
window.MLManager = MLManager;

// Criar instância global
window.mlManager = new MLManager(); 