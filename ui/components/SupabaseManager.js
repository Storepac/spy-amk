/**
 * SupabaseManager - Gerencia integração automática com Supabase
 * Envia produtos das pesquisas automaticamente para o banco
 */
class SupabaseManager {
    constructor() {
        this.apiBaseUrl = Constants.API.BASE_URL;
        
        this.userId = this.generateUserFingerprint();
        this.isEnabled = this.getSettings().autoSave;
        this.isOnline = navigator.onLine;
        this.saveQueue = []; // Fila para salvamento offline
        
        // Configurar eventos de conectividade
        this.setupConnectivityListeners();
        
        console.log('🔗 SupabaseManager inicializado:', {
            userId: this.userId,
            apiUrl: this.apiBaseUrl,
            autoSave: this.isEnabled,
            online: this.isOnline
        });
    }

    /**
     * Gera um ID único do usuário baseado no browser
     */
    generateUserFingerprint() {
        try {
            const saved = localStorage.getItem('amk_user_id');
            if (saved) return saved;
            
            // Gerar ID baseado em características do browser
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
                canvas.toDataURL()
            ].join('|');
            
            const userId = 'user_' + btoa(fingerprint).substring(0, 16).replace(/[+/=]/g, '');
            localStorage.setItem('amk_user_id', userId);
            return userId;
            
        } catch (error) {
            console.warn('Erro ao gerar fingerprint, usando fallback:', error);
            const fallbackId = 'user_' + Date.now().toString(36);
            localStorage.setItem('amk_user_id', fallbackId);
            return fallbackId;
        }
    }

    /**
     * Configurar listeners de conectividade
     */
    setupConnectivityListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🟢 Conexão restaurada - processando fila de salvamento');
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('🔴 Conexão perdida - salvamento em fila');
        });
    }

    /**
     * Obter configurações do usuário
     */
    getSettings() {
        try {
            const settings = localStorage.getItem('amk_supabase_settings');
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
            localStorage.setItem('amk_supabase_settings', JSON.stringify(settings));
            this.isEnabled = settings.autoSave;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    }

    /**
     * Salvar produto no Supabase (principal função)
     */
    async salvarProduto(produto) {
        if (!this.isEnabled) {
            console.log('💾 Auto-save desabilitado - pulando produto:', produto.asin);
            return { success: false, reason: 'disabled' };
        }

        const dadosProduto = {
            asin: produto.asin,
            titulo: produto.titulo,
            preco: produto.precoNumerico || null,
            avaliacao: produto.avaliacao || null,
            numAvaliacoes: produto.numAvaliacoes || null,
            categoria: produto.categoria || null,
            marca: produto.marca || null,
            bsr: produto.ranking || null,
            userId: this.userId
        };

        if (this.isOnline) {
            return await this.enviarProdutoParaAPI(dadosProduto);
        } else {
            this.adicionarNaFila(dadosProduto);
            return { success: true, reason: 'queued' };
        }
    }

    /**
     * Enviar produto para API
     */
    async enviarProdutoParaAPI(dadosProduto) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/insert-product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosProduto)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Produto salvo no Supabase:', dadosProduto.asin);
                
                // Salvar também localmente para futuras verificações
                this.salvarProdutoLocal(dadosProduto.asin);
                
                return { success: true, data: result };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('❌ Erro ao salvar produto:', error);
            this.adicionarNaFila(dadosProduto);
            return { success: false, error: error.message };
        }
    }

    /**
     * Salvar posição de produto na pesquisa
     */
    async salvarPosicao(asin, titulo, posicao, termoPesquisa) {
        if (!this.isEnabled || !this.getSettings().savePositions) {
            return { success: false, reason: 'disabled' };
        }

        const dadosPosicao = {
            asin,
            titulo,
            posicao,
            termoPesquisa: termoPesquisa || this.getTermoPesquisaAtual(),
            userId: this.userId
        };

        if (this.isOnline) {
            return await this.enviarPosicaoParaAPI(dadosPosicao);
        } else {
            this.adicionarNaFila(dadosPosicao, 'position');
            return { success: true, reason: 'queued' };
        }
    }

    /**
     * Enviar posição para API
     */
    async enviarPosicaoParaAPI(dadosPosicao) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/save-position`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosPosicao)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('📍 Posição salva no Supabase:', dadosPosicao.asin);
                return { success: true, data: result };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('❌ Erro ao salvar posição:', error);
            this.adicionarNaFila(dadosPosicao, 'position');
            return { success: false, error: error.message };
        }
    }

    /**
     * Processar lista de produtos (função principal para integração)
     */
    async processarListaProdutos(produtos, termoPesquisa = null) {
        if (!this.isEnabled || !produtos || produtos.length === 0) {
            console.log('🚫 Processamento de produtos desabilitado ou lista vazia');
            return { saved: 0, queued: 0, errors: 0 };
        }

        console.log(`📦 Processando ${produtos.length} produtos para Supabase...`);
        
        // Salvar termo de pesquisa atual
        if (termoPesquisa) {
            localStorage.setItem('amk_current_search_term', termoPesquisa);
        }

        let saved = 0, queued = 0, errors = 0;
        const resultados = [];

        for (let i = 0; i < produtos.length; i++) {
            const produto = produtos[i];
            if (!produto.asin) {
                errors++;
                continue;
            }

            try {
                // Salvar produto
                const resultProduto = await this.salvarProduto(produto);
                
                // Salvar posição
                const posicao = i + 1;
                const resultPosicao = await this.salvarPosicao(
                    produto.asin, 
                    produto.titulo, 
                    posicao, 
                    termoPesquisa
                );

                if (resultProduto.success && resultPosicao.success) {
                    if (resultProduto.reason === 'queued' || resultPosicao.reason === 'queued') {
                        queued++;
                    } else {
                        saved++;
                    }
                } else {
                    errors++;
                }

                resultados.push({
                    asin: produto.asin,
                    titulo: produto.titulo,
                    posicao: posicao,
                    produto: resultProduto,
                    posicaoResult: resultPosicao
                });

                // Delay pequeno para não sobrecarregar API
                if (i % 5 === 0 && i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

            } catch (error) {
                console.error(`Erro ao processar produto ${produto.asin}:`, error);
                errors++;
            }
        }

        const stats = { saved, queued, errors, total: produtos.length };
        console.log('📊 Processamento concluído:', stats);
        
        // Mostrar notificação de resultado
        this.mostrarNotificacaoResultado(stats);
        
        return { ...stats, resultados };
    }

    /**
     * Mostrar notificação do resultado
     */
    mostrarNotificacaoResultado(stats) {
        if (typeof NotificationManager === 'undefined') return;

        if (stats.saved > 0) {
            NotificationManager.sucesso(
                `✅ ${stats.saved} produtos salvos no Supabase!` +
                (stats.queued > 0 ? ` (${stats.queued} na fila)` : '') +
                (stats.errors > 0 ? ` (${stats.errors} erros)` : '')
            );
        } else if (stats.queued > 0) {
            NotificationManager.informacao(
                `📋 ${stats.queued} produtos adicionados à fila (offline)`
            );
        } else if (stats.errors > 0) {
            NotificationManager.erro(
                `❌ Erro ao salvar produtos (${stats.errors}/${stats.total})`
            );
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

        // Limitar tamanho da fila
        if (this.saveQueue.length > 1000) {
            this.saveQueue = this.saveQueue.slice(-500); // Manter apenas os 500 mais recentes
        }

        // Salvar fila no localStorage
        try {
            localStorage.setItem('amk_supabase_queue', JSON.stringify(this.saveQueue));
        } catch (error) {
            console.error('Erro ao salvar fila:', error);
        }
    }

    /**
     * Processar fila quando voltar online
     */
    async processQueue() {
        if (!this.isOnline || this.saveQueue.length === 0) return;

        console.log(`🔄 Processando fila com ${this.saveQueue.length} itens...`);
        
        const fila = [...this.saveQueue];
        this.saveQueue = [];

        let processados = 0;
        for (const item of fila) {
            try {
                if (item.type === 'product') {
                    await this.enviarProdutoParaAPI(item.data);
                } else if (item.type === 'position') {
                    await this.enviarPosicaoParaAPI(item.data);
                }
                processados++;
                
                // Delay entre requests
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error('Erro ao processar item da fila:', error);
                // Recolocar item na fila se erro
                this.saveQueue.push(item);
            }
        }

        if (processados > 0) {
            NotificationManager.sucesso(`🔄 ${processados} itens sincronizados da fila!`);
        }

        // Atualizar fila no localStorage
        localStorage.setItem('amk_supabase_queue', JSON.stringify(this.saveQueue));
    }

    /**
     * Obter termo de pesquisa atual
     */
    getTermoPesquisaAtual() {
        try {
            // Tentar extrair da URL
            const urlParams = new URLSearchParams(window.location.search);
            const termoDaUrl = urlParams.get('k');
            if (termoDaUrl) return termoDaUrl;

            // Tentar obter do localStorage
            const termoSalvo = localStorage.getItem('amk_current_search_term');
            if (termoSalvo) return termoSalvo;

            return 'termo-nao-identificado';
        } catch (error) {
            return 'termo-nao-identificado';
        }
    }

    /**
     * Testar conexão com API
     */
    async testarConexao() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/test-connection`);
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Conexão com Supabase OK:', result);
                return { success: true, data: result };
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Erro de conexão com Supabase:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obter estatísticas do banco
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
            console.error('❌ Erro ao obter estatísticas:', error);
            return null;
        }
    }

    /**
     * Limpar dados e configurações
     */
    limparDados() {
        localStorage.removeItem('amk_supabase_queue');
        localStorage.removeItem('amk_current_search_term');
        this.saveQueue = [];
        console.log('🧹 Dados do SupabaseManager limpos');
    }

    /**
     * Análise avançada de posições com fallback automático
     */
    async analisarPosicoes(produtos, termoPesquisa = '', paginaAtual = 1) {
        if (!this.isEnabled || produtos.length === 0) {
            return { success: false, message: 'Auto-save desabilitado ou sem produtos' };
        }

        console.log(`🔍 Tentando análise avançada de ${produtos.length} produtos (página ${paginaAtual})...`);
        
        try {
            // Tentar análise avançada primeiro
            const response = await fetch(`${this.apiBaseUrl}/api/analyze-positions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    produtos: produtos,
                    termoPesquisa: termoPesquisa,
                    userId: this.userId,
                    paginaAtual: paginaAtual
                })
            });

            if (response.ok) {
                const resultado = await response.json();
                
                if (resultado.success) {
                    const stats = resultado.analise.estatisticas;
                    console.log(`✅ Análise avançada concluída:`, stats);
                    
                    // Salvar produtos novos no banco
                    if (resultado.analise.produtos_novos.length > 0) {
                        await this.salvarProdutosNovos(resultado.analise.produtos_novos);
                    }
                    
                    // Mostrar notificação com resultados
                    this.mostrarNotificacaoAnalise(stats);
                    
                    return {
                        success: true,
                        message: `Análise: ${stats.novos} novos, ${stats.existentes} existentes`,
                        analise: resultado.analise,
                        produtosCombinados: resultado.produtos_combinados || []
                    };
                }
            }
            
            throw new Error(`Análise avançada falhou: ${response.status}`);
            
        } catch (error) {
            console.warn('⚠️ Análise avançada falhou, usando método tradicional:', error.message);
            
            // FALLBACK: Usar método tradicional
            return await this.analisarPosicoesTradicional(produtos, termoPesquisa, paginaAtual);
        }
    }

    /**
     * Método tradicional de análise (fallback)
     */
    async analisarPosicoesTradicional(produtos, termoPesquisa = '', paginaAtual = 1) {
        console.log(`🔄 Executando análise tradicional de ${produtos.length} produtos...`);
        
        try {
            // 1. Verificar quais produtos já existem no banco
            const produtosValidos = produtos.filter(p => p && p.asin);
            const asins = produtosValidos.map(p => p.asin);
            
            let produtosNovos = produtosValidos;
            let produtosExistentes = [];
            let totalSalvos = 0;
            
            try {
                // TEMPORÁRIO: Usar verificação local até API ser corrigida
                const produtosExistentesLocal = this.getProdutosExistentesLocal();
                const asinsExistentes = new Set(produtosExistentesLocal);
                
                produtosNovos = produtosValidos.filter(p => !asinsExistentes.has(p.asin));
                produtosExistentes = produtosValidos.filter(p => asinsExistentes.has(p.asin));
                totalSalvos = produtosExistentes.length;
                
                // Marcar produtos como novo/existente
                produtosNovos.forEach(p => p.isNovo = true);
                produtosExistentes.forEach(p => p.isNovo = false);
                
                console.log(`📊 Verificação LOCAL: ${produtosNovos.length} novos, ${produtosExistentes.length} existentes`);
                
                // Tentar API em background (não bloquear)
                this.verificarProdutosExistentesAPI(asins).catch(err => 
                    console.warn('API check-existing falhou (background):', err.message)
                );
                
            } catch (checkError) {
                console.warn('Erro ao verificar produtos existentes, assumindo todos como novos:', checkError);
                // Marcar todos como novos quando há erro
                produtosNovos = produtosValidos;
                produtosExistentes = [];
                produtosNovos.forEach(p => p.isNovo = true);
            }

            // 2. Preparar análise tradicional
            const todosProdutos = [...produtosNovos, ...produtosExistentes];
            
            // DEBUG: Verificar se marcações estão corretas
            console.log(`🔍 Debug marcações:`);
            console.log(`- Produtos novos (${produtosNovos.length}):`, produtosNovos.slice(0, 3).map(p => ({ asin: p.asin, isNovo: p.isNovo })));
            console.log(`- Produtos existentes (${produtosExistentes.length}):`, produtosExistentes.slice(0, 3).map(p => ({ asin: p.asin, isNovo: p.isNovo })));
            
            // Será atualizado depois da combinação
            let analiseTradicional = {
                produtos_novos: produtosNovos,
                produtos_existentes: produtosExistentes,
                produtos_combinados: todosProdutos, // Temporário
                estatisticas: {
                    total_amazon: produtosValidos.length,
                    total_salvos: totalSalvos,
                    novos: produtosNovos.length,
                    existentes: produtosExistentes.length,
                    termo_pesquisa: termoPesquisa,
                    pagina_atual: paginaAtual,
                    posicao_range: `${((paginaAtual - 1) * 16) + 1}-${paginaAtual * 16}`,
                    metodo: 'tradicional'
                }
            };

            // 3. Salvar apenas produtos novos (método tradicional otimizado)
            let resultadoSalvamento = { saved: 0, queued: 0, errors: 0, total: 0 };
            
            if (produtosNovos.length > 0) {
                resultadoSalvamento = await this.processarListaProdutos(produtosNovos, termoPesquisa);
                console.log(`💾 Salvos apenas produtos novos: ${resultadoSalvamento.saved + resultadoSalvamento.queued}/${produtosNovos.length}`);
                
                // Salvar produtos novos no histórico local para fallback
                produtosNovos.forEach(produto => this.salvarProdutoNoHistoricoLocal(produto));
            } else {
                console.log(`✅ Todos os produtos já existem no banco`);
            }
            
            // 3.1. Salvar produtos existentes também no histórico local
            produtosExistentes.forEach(produto => this.salvarProdutoNoHistoricoLocal(produto));
            
            // 4. Salvar tracking de posições para todos os produtos
            await this.salvarTrackingPosicoes(produtosValidos, termoPesquisa, paginaAtual);
            
            // 4.1. Registrar posições no PositionTracker local
            this.registrarPosicoesLocal(produtosValidos, termoPesquisa, paginaAtual);
            
            // 5. NOVO: Buscar produtos do banco relacionados ao termo
            console.log(`🔍 BUSCANDO produtos do banco para termo: "${termoPesquisa}"`);
            const produtosDoBanco = await this.buscarProdutosDoBanco(termoPesquisa);
            console.log(`📦 RETORNADOS do banco: ${produtosDoBanco.length} produtos`);
            
            // 5.1. Combinar produtos: Amazon + Banco (evitando duplicatas)
            console.log(`🔗 COMBINANDO: ${todosProdutos.length} Amazon + ${produtosDoBanco.length} banco`);
            const produtosCombinados = this.combinarProdutos(todosProdutos, produtosDoBanco);
            console.log(`📊 RESULTADO COMBINADO: ${produtosCombinados.length} produtos totais`);
            
            // 5.2. Buscar tendências do servidor e aplicar aos produtos combinados
            await this.aplicarTendenciasAosProdutos(produtosCombinados, termoPesquisa);
            
            // 5.3. Atualizar análise com produtos combinados
            analiseTradicional.produtos_combinados = produtosCombinados;
            analiseTradicional.estatisticas.total_combinado = produtosCombinados.length;
            analiseTradicional.estatisticas.do_banco = produtosDoBanco.length;
            
            // 6. Mostrar notificação atualizada
            this.mostrarNotificacaoAnalise(analiseTradicional.estatisticas);
            
            return {
                success: true,
                message: `Análise tradicional: ${resultadoSalvamento.saved + resultadoSalvamento.queued} produtos processados`,
                analise: analiseTradicional,
                produtosCombinados: produtosCombinados,
                resultadoSalvamento: resultadoSalvamento,
                metodo: 'tradicional'
            };
            
        } catch (error) {
            console.error('❌ Erro na análise tradicional:', error);
            return { 
                success: false, 
                message: `Erro na análise tradicional: ${error.message}`,
                metodo: 'tradicional'
            };
        }
    }

    /**
     * Salvar apenas produtos novos
     */
    async salvarProdutosNovos(produtos) {
        let salvos = 0;
        for (const produto of produtos) {
            try {
                const resultado = await this.salvarProduto(produto);
                if (resultado.success) salvos++;
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                console.error('Erro ao salvar produto novo:', produto.asin, error);
            }
        }
        console.log(`💾 ${salvos} produtos novos salvos no banco`);
        return salvos;
    }

    /**
     * Mostrar notificação de análise
     */
    mostrarNotificacaoAnalise(stats) {
        if (typeof NotificationManager !== 'undefined') {
            const emoji = stats.novos > 0 ? '🆕' : '📊';
            const metodo = stats.metodo === 'tradicional' ? ' (tradicional)' : '';
            
            let mensagem = `${emoji} Análise${metodo}!\n✨ ${stats.novos} produtos novos\n📍 ${stats.existentes} já conhecidos`;
            
            // Adicionar info de produtos combinados se disponível
            if (stats.total_combinado && stats.do_banco !== undefined) {
                mensagem += `\n🔗 ${stats.total_combinado} produtos total (${stats.do_banco} do banco)`;
            }
            
            mensagem += `\n📊 Posições ${stats.posicao_range}`;
            
            NotificationManager.sucesso(mensagem, 6000);
        }
    }

    /**
     * Salvar tracking de posições para todos os produtos
     */
    async salvarTrackingPosicoes(produtos, termoPesquisa, paginaAtual) {
        if (!this.getSettings().savePositions) {
            console.log('📍 Tracking de posições desabilitado');
            return;
        }

        console.log(`📍 Salvando tracking de ${produtos.length} posições...`);
        let salvos = 0;

        for (let i = 0; i < produtos.length; i++) {
            const produto = produtos[i];
            const posicao = ((paginaAtual - 1) * 16) + (i + 1);
            
            try {
                const resultado = await this.salvarPosicao(
                    produto.asin,
                    produto.titulo,
                    posicao,
                    termoPesquisa
                );
                
                if (resultado.success) {
                    salvos++;
                }
                
                // Delay pequeno para não sobrecarregar
                if (i % 10 === 0 && i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (error) {
                console.error(`Erro ao salvar posição ${produto.asin}:`, error);
            }
        }

        console.log(`📍 Tracking salvos: ${salvos}/${produtos.length}`);
        return salvos;
    }

    /**
     * Buscar tendências do servidor e aplicar aos produtos
     */
    async aplicarTendenciasAosProdutos(produtos, termoPesquisa) {
        try {
            if (!window.PositionTracker) {
                console.warn('PositionTracker não disponível');
                return;
            }

            const asins = produtos.map(p => p.asin).filter(Boolean);
            if (asins.length === 0) return;

            console.log(`📈 Buscando tendências para ${asins.length} produtos...`);

            // Buscar tendências do servidor
            const tendencias = await window.PositionTracker.calcularTendenciasServidor(asins, termoPesquisa);
            
            if (tendencias && Object.keys(tendencias).length > 0) {
                // Aplicar tendências aos produtos
                produtos.forEach(produto => {
                    if (produto.asin && tendencias[produto.asin]) {
                        produto.tendencia = tendencias[produto.asin];
                    }
                });
                
                console.log(`📊 Tendências aplicadas a ${Object.keys(tendencias).length} produtos`);
            }
            
        } catch (error) {
            console.warn('Erro ao aplicar tendências:', error);
        }
    }

    /**
     * Obter status atual
     */
    getStatus() {
        return {
            userId: this.userId,
            enabled: this.isEnabled,
            online: this.isOnline,
            queueSize: this.saveQueue.length,
            apiUrl: this.apiBaseUrl,
            settings: this.getSettings()
        };
    }

    /**
     * MÉTODOS TEMPORÁRIOS - Verificação local de produtos existentes
     */
    getProdutosExistentesLocal() {
        try {
            const key = `amk_produtos_${this.userId}`;
            const dados = localStorage.getItem(key);
            return dados ? JSON.parse(dados) : [];
        } catch (error) {
            console.warn('Erro ao buscar produtos locais:', error);
            return [];
        }
    }

    salvarProdutoLocal(asin) {
        try {
            const key = `amk_produtos_${this.userId}`;
            const existentes = this.getProdutosExistentesLocal();
            if (!existentes.includes(asin)) {
                existentes.push(asin);
                localStorage.setItem(key, JSON.stringify(existentes));
            }
        } catch (error) {
            console.warn('Erro ao salvar produto local:', error);
        }
    }

    async verificarProdutosExistentesAPI(asins) {
        // Método em background para tentar API
        const response = await fetch(`${this.apiBaseUrl}/api/check-existing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                asins: asins,
                userId: this.userId
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API check-existing funcionou em background:', data);
            return data;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    }

    /**
     * NOVO: Buscar produtos do banco relacionados ao termo de pesquisa
     */
    async buscarProdutosDoBanco(termoPesquisa) {
        try {
            console.log(`🔍 Buscando produtos do banco relacionados a: "${termoPesquisa}"`);
            console.log(`🌐 URL da API: ${this.apiBaseUrl}/api/get-products`);
            console.log(`👤 UserID: ${this.userId}`);
            
            const requestBody = {
                userId: this.userId,
                termoPesquisa: termoPesquisa,
                incluirSimilares: true // Buscar termos similares
            };
            console.log(`📤 Enviando request:`, requestBody);
            
            const response = await fetch(`${this.apiBaseUrl}/api/get-products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            console.log(`📥 Response status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`📊 Response data:`, data);
                
                if (data.success && data.produtos) {
                    console.log(`📦 Encontrados ${data.produtos.length} produtos do banco`);
                    
                    // Marcar produtos do banco
                    data.produtos.forEach(produto => {
                        produto.isNovo = false; // Produtos do banco são existentes
                        produto.origem = 'banco';
                        produto.posicao = null; // Sem posição atual da Amazon
                    });
                    
                    return data.produtos;
                } else {
                    console.log(`⚠️ API retornou success: ${data.success}, produtos: ${data.produtos?.length || 0}`);
                }
            } else {
                const errorText = await response.text();
                console.error(`❌ Erro HTTP ${response.status}:`, errorText);
            }
            
            console.log('⚠️ API falhou, usando fallback local...');
            return this.buscarProdutosDoBancoLocal(termoPesquisa);
            
        } catch (error) {
            console.error('❌ Erro ao buscar produtos do banco:', error);
            console.log('⚠️ Usando fallback local...');
            return this.buscarProdutosDoBancoLocal(termoPesquisa);
        }
    }

    /**
     * FALLBACK: Buscar produtos do localStorage (método offline)
     */
    buscarProdutosDoBancoLocal(termoPesquisa) {
        try {
            console.log(`💾 Buscando produtos localmente para: "${termoPesquisa}"`);
            
            // Buscar produtos salvos localmente
            const produtosLocais = JSON.parse(localStorage.getItem('spy_produtos_historico') || '[]');
            
            if (!produtosLocais.length) {
                console.log('💾 Nenhum produto encontrado no localStorage');
                return [];
            }
            
            let produtosFiltrados = produtosLocais;
            
            // Filtrar por termo se fornecido
            if (termoPesquisa) {
                const termo = termoPesquisa.toLowerCase();
                produtosFiltrados = produtosLocais.filter(produto => 
                    produto.titulo && produto.titulo.toLowerCase().includes(termo)
                );
            }
            
            // Limitar a 100 produtos para mostrar mais resultados
            produtosFiltrados = produtosFiltrados.slice(0, 100);
            
            // Completar dados dos produtos do banco para compatibilidade
            produtosFiltrados.forEach((produto, index) => {
                produto.isNovo = false;
                produto.origem = 'local';
                produto.posicao = null; // Sem posição atual da Amazon
                
                // Completar dados faltantes para compatibilidade com tabela
                if (!produto.imagem) {
                    produto.imagem = 'https://via.placeholder.com/150x150?text=Sem+Imagem';
                }
                if (!produto.link && produto.asin) {
                    produto.link = `https://www.amazon.com.br/dp/${produto.asin}`;
                }
                if (!produto.ranking && produto.bsr) {
                    produto.ranking = produto.bsr;
                }
                if (!produto.precoNumerico) {
                    const precoStr = produto.preco || '0';
                    produto.precoNumerico = parseFloat(precoStr.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
                }
                if (!produto.vendidos) {
                    produto.vendidos = 'N/A';
                }
                if (!produto.receita) {
                    produto.receita = 'N/A';
                }
                if (!produto.tipo) {
                    produto.tipo = 'Histórico';
                }
                
                // Adicionar indicador visual de que é produto do histórico
                if (produto.titulo && !produto.titulo.includes('📚')) {
                    produto.titulo = `📚 ${produto.titulo}`;
                }
            });
            
            console.log(`💾 Encontrados ${produtosFiltrados.length} produtos localmente`);
            return produtosFiltrados;
            
        } catch (error) {
            console.error('❌ Erro no fallback local:', error);
            return [];
        }
    }

    /**
     * NOVO: Salvar produtos no histórico local para fallback
     */
    salvarProdutoNoHistoricoLocal(produto) {
        try {
            const historico = JSON.parse(localStorage.getItem('spy_produtos_historico') || '[]');
            
            // Verificar se produto já existe
            const existe = historico.find(p => p.asin === produto.asin);
            if (!existe) {
                historico.push({
                    asin: produto.asin,
                    titulo: produto.titulo,
                    preco: produto.preco,
                    precoNumerico: produto.precoNumerico || 0,
                    avaliacao: produto.avaliacao,
                    numAvaliacoes: produto.numAvaliacoes,
                    categoria: produto.categoria,
                    marca: produto.marca,
                    bsr: produto.ranking || produto.bsr,
                    ranking: produto.ranking || produto.bsr,
                    link: produto.link,
                    imagem: produto.imagem,
                    vendidos: produto.vendidos || 'N/A',
                    receita: produto.receita || 'N/A',
                    tipo: 'Histórico',
                    dataAdicionado: new Date().toISOString()
                });
                
                // Manter apenas últimos 500 produtos para não sobrecarregar
                if (historico.length > 500) {
                    historico.splice(0, historico.length - 500);
                }
                
                localStorage.setItem('spy_produtos_historico', JSON.stringify(historico));
            }
        } catch (error) {
            console.warn('Erro ao salvar produto no histórico local:', error);
        }
    }

    /**
     * NOVO: Combinar produtos da Amazon com produtos do banco (evitando duplicatas)
     */
    combinarProdutos(produtosAmazon, produtosBanco) {
        const asinsAmazon = new Set(produtosAmazon.map(p => p.asin));
        
        // Filtrar produtos do banco que NÃO estão na página atual da Amazon
        const produtosBancoUnicos = produtosBanco.filter(produto => 
            !asinsAmazon.has(produto.asin)
        );
        
        // Combinar: Amazon primeiro (com posições), depois banco
        const produtosCombinados = [
            ...produtosAmazon,
            ...produtosBancoUnicos
        ];
        
        console.log(`🔗 Produtos combinados: ${produtosAmazon.length} Amazon + ${produtosBancoUnicos.length} banco únicos = ${produtosCombinados.length} total`);
        
        return produtosCombinados;
    }

    /**
     * Registrar posições no PositionTracker local para cálculo de tendências
     */
    registrarPosicoesLocal(produtos, termoPesquisa, paginaAtual) {
        try {
            if (!window.PositionTracker) {
                console.warn('PositionTracker não disponível');
                return;
            }

            console.log(`📍 Registrando ${produtos.length} posições no tracker local...`);

            // Inicializar o PositionTracker com o termo atual
            window.PositionTracker.inicializar(produtos, termoPesquisa);

            // Registrar cada produto individualmente
            const agora = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            produtos.forEach((produto, index) => {
                if (produto.asin) {
                    const posicaoGlobal = ((paginaAtual - 1) * 16) + (index + 1);
                    
                    // Registrar no PositionTracker
                    window.PositionTracker.trackearPosicao(
                        produto.asin,
                        produto.titulo,
                        posicaoGlobal,
                        agora
                    );
                }
            });

            console.log(`✅ Posições registradas no tracker local`);

        } catch (error) {
            console.warn('Erro ao registrar posições locais:', error);
        }
    }
}

// Expor globalmente
window.SupabaseManager = SupabaseManager;

// Criar instância global
window.supabaseManager = new SupabaseManager(); 