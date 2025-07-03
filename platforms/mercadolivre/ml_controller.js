/**
 * ML Controller - Controlador específico e independente para MercadoLivre
 * Sistema totalmente separado usando componentes ML específicos
 */
class MLController {
    
    static isActive = false;
    static currentProducts = [];
    static currentSearchTerm = '';
    static config = {
        autoExtract: true,
        maxRetries: 3,
        extractDelay: 2000,
        filterEnabled: true
    };
    
    /**
     * INICIALIZAR CONTROLADOR ML
     */
    static init() {
        if (this.isActive) {
            console.log('⚠️ [ML-CONTROLLER] Já está ativo');
            return;
        }
        
        console.log('🛒 [ML-CONTROLLER] Inicializando controlador específico ML...');
        
        // Verificar se estamos em uma página de busca ML
        const platform = window.currentPlatform;
        if (!platform || platform.platform !== 'mercadolivre' || platform.type !== 'search') {
            console.log('ℹ️ [ML-CONTROLLER] Página não é de busca ML');
            return;
        }
        
        this.isActive = true;
        this.setupEventListenersML();
        this.initializeExtractionML();
        
        console.log('✅ [ML-CONTROLLER] Controlador ML inicializado com sucesso');
    }
    
    /**
     * CONFIGURAR EVENT LISTENERS ML
     */
    static setupEventListenersML() {
        console.log('📡 [ML-CONTROLLER] Configurando event listeners ML...');
        
        // Observer para mudanças na página ML
        const observer = new MutationObserver((mutations) => {
            const hasNewProducts = mutations.some(mutation => 
                Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && 
                    (node.classList?.contains('ui-search-layout__item') ||
                     node.querySelector?.('.ui-search-layout__item'))
                )
            );
            
            if (hasNewProducts) {
                console.log('🔄 [ML-CONTROLLER] Novos produtos ML detectados');
                setTimeout(() => this.extractAndAnalyzeML(), 1000);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Listener para mudanças de URL
        window.addEventListener('popstate', () => {
            setTimeout(() => this.checkAndReInitML(), 500);
        });
        
        // Listener para scroll (paginação ML)
        window.addEventListener('scroll', () => {
            if (this.isNearBottom()) {
                setTimeout(() => this.extractAndAnalyzeML(), 1500);
            }
        });
        
        console.log('✅ [ML-CONTROLLER] Event listeners ML configurados');
    }
    
    /**
     * VERIFICAR SE PRECISA REINICIALIZAR
     */
    static checkAndReInitML() {
        const platform = PlatformDetector?.detectPlatform();
        
        if (platform?.platform === 'mercadolivre' && platform?.type === 'search') {
            console.log('🔄 [ML-CONTROLLER] Reinicializando ML para nova busca');
            this.initializeExtractionML();
        } else {
            this.cleanupML();
        }
    }
    
    /**
     * INICIALIZAR EXTRAÇÃO ML
     */
    static async initializeExtractionML() {
        try {
            console.log('🚀 [ML-CONTROLLER] Iniciando extração ML específica...');
            
            // Aguardar carregamento da página ML
            const loaded = await MLExtractor.aguardarCarregamentoML();
            if (!loaded) {
                console.warn('⚠️ [ML-CONTROLLER] Timeout no carregamento ML');
                return;
            }
            
            // Aguardar elementos dinâmicos ML
            await new Promise(resolve => setTimeout(resolve, this.config.extractDelay));
            
            this.extractAndAnalyzeML();
            
        } catch (error) {
            console.error('❌ [ML-CONTROLLER] Erro na inicialização ML:', error);
        }
    }
    
    /**
     * EXTRAIR E ANALISAR PRODUTOS ML
     */
    static async extractAndAnalyzeML() {
        try {
            console.log('🔍 [ML-CONTROLLER] Extraindo produtos ML específicos...');
            
            // 1. Extrair produtos usando MLExtractor específico
            const produtos = MLExtractor.extrairProdutos();
            
            if (!produtos || produtos.length === 0) {
                console.log('⚠️ [ML-CONTROLLER] Nenhum produto ML encontrado');
                this.showNoProductsMessageML();
                return;
            }
            
            console.log(`📦 [ML-CONTROLLER] ${produtos.length} produtos ML extraídos`);
            
            // 2. Obter dados da busca ML
            const searchData = MLExtractor.obterDadosBuscaML();
            this.currentSearchTerm = searchData.termoPesquisa;
            
            console.log('🔍 [ML-CONTROLLER] Dados da busca ML:', searchData);
            
            // 3. Analisar com MLAnalyzer específico se disponível
            let produtosAnalisados = produtos;
            
            if (window.MLAnalyzer) {
                console.log('📊 [ML-CONTROLLER] Analisando produtos com MLAnalyzer...');
                produtosAnalisados = await MLAnalyzer.analisarProdutos(
                    produtos, 
                    this.currentSearchTerm,
                    parseInt(searchData.pagina) || 1
                );
            } else {
                console.warn('⚠️ [ML-CONTROLLER] MLAnalyzer não disponível');
            }
            
            // 4. Aplicar filtros ML se configurados
            const produtosFiltrados = this.aplicarFiltrosML(produtosAnalisados);
            
            // 5. Exibir resultados usando MLTableManager
            this.currentProducts = produtosFiltrados;
            this.displayResultsML(produtosFiltrados);
            
            console.log(`✅ [ML-CONTROLLER] ${produtosFiltrados.length} produtos ML processados e exibidos`);
            
            // 6. Salvar no banco se configurado
            if (this.config.saveToDatabase) {
                this.saveToMLDatabase(produtosFiltrados, searchData);
            }
            
        } catch (error) {
            console.error('❌ [ML-CONTROLLER] Erro na extração/análise ML:', error);
            this.showErrorMessageML();
        }
    }
    
    /**
     * APLICAR FILTROS ML
     */
    static aplicarFiltrosML(produtos) {
        try {
            const filtros = this.carregarFiltrosML();
            
            if (!this.temFiltrosAtivosML(filtros)) {
                console.log('📋 [ML-CONTROLLER] Nenhum filtro ML ativo');
                return produtos;
            }
            
            console.log('🔧 [ML-CONTROLLER] Aplicando filtros ML:', filtros);
            
            const produtosFiltrados = produtos.filter(produto => {
                
                // Filtro de preço
                if (filtros.precoMin && produto.preco < filtros.precoMin) {
                    return false;
                }
                if (filtros.precoMax && produto.preco > filtros.precoMax) {
                    return false;
                }
                
                // Filtro de vendas
                if (filtros.vendasMin && (!produto.vendas || produto.vendas < filtros.vendasMin)) {
                    return false;
                }
                if (filtros.vendasMax && produto.vendas && produto.vendas > filtros.vendasMax) {
                    return false;
                }
                
                // Filtros específicos ML
                if (filtros.apenasLojaOficial && !produto.lojaOficial) {
                    return false;
                }
                if (filtros.apenasFreteGratis && !produto.freteGratis) {
                    return false;
                }
                if (filtros.excluirPatrocinados && produto.patrocinado) {
                    return false;
                }
                
                return true;
            });
            
            console.log(`🎯 [ML-CONTROLLER] ${produtosFiltrados.length}/${produtos.length} produtos ML passaram nos filtros`);
            return produtosFiltrados;
            
        } catch (error) {
            console.error('❌ [ML-CONTROLLER] Erro ao aplicar filtros ML:', error);
            return produtos;
        }
    }
    
    /**
     * EXIBIR RESULTADOS ML
     */
    static displayResultsML(produtos) {
        try {
            console.log('📊 [ML-CONTROLLER] Exibindo resultados ML específicos...');
            
            // Ocultar lista ML original
            if (window.MLTableManager) {
                MLTableManager.ocultarListaMLOriginal();
            }
            
            // Usar MLTableManager específico para criar tabela
            if (window.MLTableManager) {
                console.log('📊 [ML-CONTROLLER] Usando MLTableManager específico');
                this.criarModalMLEspecifico(produtos);
            } else {
                console.warn('⚠️ [ML-CONTROLLER] MLTableManager não disponível - usando exibição básica');
                this.displayBasicResultsML(produtos);
            }
            
            // Atualizar estatísticas ML se disponível
            if (window.MLStatsManager) {
                MLStatsManager.atualizarEstatisticasML(produtos);
            }
            
        } catch (error) {
            console.error('❌ [ML-CONTROLLER] Erro ao exibir resultados ML:', error);
            this.displayBasicResultsML(produtos);
        }
    }
    
    /**
     * CRIAR MODAL ML ESPECÍFICO
     */
    static criarModalMLEspecifico(produtos) {
        try {
            const tabelaHTML = MLTableManager.criarTabelaProdutosML(produtos);
            
            // Criar modal específico para ML
            const modal = document.createElement('div');
            modal.id = 'ml-analyzer-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: #ffffff;
                border-radius: 15px;
                width: 96%;
                height: 92%;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                position: relative;
            `;
            
            modalContent.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #FFE600 0%, #FFC107 100%);
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 15px 15px 0 0;
                ">
                    <h2 style="
                        margin: 0;
                        color: #333;
                        font-size: 18px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    ">
                        🛒 AMK Spy MercadoLivre - ${produtos.length} produtos encontrados
                        <span style="
                            background: rgba(255, 255, 255, 0.3);
                            padding: 4px 10px;
                            border-radius: 12px;
                            font-size: 12px;
                            color: #333;
                        ">${this.currentSearchTerm}</span>
                    </h2>
                    <button id="fechar-modal-ml" style="
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        border-radius: 50%;
                        width: 35px;
                        height: 35px;
                        cursor: pointer;
                        font-size: 18px;
                        color: #333;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    " title="Fechar">×</button>
                </div>
                <div style="
                    flex: 1;
                    overflow: hidden;
                    background: #ffffff;
                ">
                    ${tabelaHTML}
                </div>
            `;
            
            modal.appendChild(modalContent);
            
            // Event listeners específicos ML
            modal.querySelector('#fechar-modal-ml').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            // Tecla ESC para fechar
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && document.getElementById('ml-analyzer-modal')) {
                    modal.remove();
                }
            });
            
            // Remover modal anterior se existir
            const existing = document.getElementById('ml-analyzer-modal');
            if (existing) existing.remove();
            
            document.body.appendChild(modal);
            
            // Inicializar eventos da tabela ML
            setTimeout(() => {
                if (window.MLTableManager) {
                    MLTableManager.inicializarEventosML();
                }
            }, 100);
            
            console.log('✅ [ML-CONTROLLER] Modal ML específico criado com tabela');
            
        } catch (error) {
            console.error('❌ [ML-CONTROLLER] Erro ao criar modal ML:', error);
            this.displayBasicResultsML(produtos);
        }
    }
    
    /**
     * MÉTODOS AUXILIARES ML
     */
    static carregarFiltrosML() {
        try {
            const filtros = sessionStorage.getItem('amk_filtros_ml');
            return filtros ? JSON.parse(filtros) : {};
        } catch (error) {
            return {};
        }
    }
    
    static temFiltrosAtivosML(filtros) {
        return !!(filtros.precoMin || filtros.precoMax || 
                 filtros.vendasMin || filtros.vendasMax ||
                 filtros.apenasLojaOficial || filtros.apenasFreteGratis || 
                 filtros.excluirPatrocinados);
    }
    
    static isNearBottom() {
        return window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000;
    }
    
    static showNoProductsMessageML() {
        console.log('⚠️ [ML-CONTROLLER] Exibindo mensagem de nenhum produto ML');
        // Implementar notificação específica ML
    }
    
    static showErrorMessageML() {
        console.log('❌ [ML-CONTROLLER] Exibindo mensagem de erro ML');
        // Implementar notificação de erro específica ML
    }
    
    static displayBasicResultsML(produtos) {
        console.log('📋 [ML-CONTROLLER] Exibindo resultados ML básicos');
        // Implementar exibição básica ML como fallback
    }
    
    static cleanupML() {
        console.log('🧹 [ML-CONTROLLER] Limpando controlador ML');
        this.isActive = false;
        this.currentProducts = [];
        this.currentSearchTerm = '';
        
        // Remover modal se existir
        const modal = document.getElementById('ml-analyzer-modal');
        if (modal) modal.remove();
    }
    
    /**
     * MÉTODOS PÚBLICOS
     */
    static async reextractML() {
        console.log('🔄 [ML-CONTROLLER] Re-extraindo produtos ML...');
        await this.extractAndAnalyzeML();
    }
    
    static getCurrentProductsML() {
        return [...this.currentProducts];
    }
    
    static getCurrentSearchTermML() {
        return this.currentSearchTerm;
    }
    
    static async iniciarAnaliseBackgroundML(tipo = 'todas') {
        console.log(`🚀 [ML-CONTROLLER] Iniciando análise background ML: ${tipo}`);
        // Implementar análise em background específica ML
    }
    
    /**
     * INTEGRAÇÃO COM BANCO DE DADOS ML
     */
    static async saveToMLDatabase(produtos, searchData) {
        try {
            console.log('💾 [ML-CONTROLLER] Salvando produtos ML no banco...');
            
            // Usar API específica ML se disponível
            if (window.MLDatabase) {
                await MLDatabase.salvarProdutos(produtos, searchData);
            }
            
        } catch (error) {
            console.error('❌ [ML-CONTROLLER] Erro ao salvar no banco ML:', error);
        }
    }
}

// Expor globalmente
window.MLController = MLController; 