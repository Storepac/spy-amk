/**
 * MLController - Controlador principal para Mercado Livre
 * Coordena extração, análise e exibição de produtos ML
 */
class MLController {
    
    static isActive = false;
    static currentProducts = [];
    static currentSearchTerm = '';
    
    /**
     * Inicializar controlador ML
     */
    static init() {
        if (this.isActive) {
            console.log('⚠️ MLController já está ativo');
            return;
        }
        
        console.log('🛒 Inicializando MLController...');
        
        // Verificar se estamos em uma página de busca ML
        const platform = window.currentPlatform;
        if (!platform || platform.platform !== 'mercadolivre' || platform.type !== 'search') {
            console.log('ℹ️ Página não é de busca ML');
            return;
        }
        
        this.isActive = true;
        this.setupEventListeners();
        this.initializeExtraction();
    }
    
    /**
     * Configurar event listeners
     */
    static setupEventListeners() {
        // Observer para mudanças na página
        const observer = new MutationObserver((mutations) => {
            const hasNewProducts = mutations.some(mutation => 
                Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && 
                    (node.classList?.contains('ui-search-layout__item') ||
                     node.querySelector?.('.ui-search-layout__item'))
                )
            );
            
            if (hasNewProducts) {
                console.log('🔄 Novos produtos ML detectados');
                setTimeout(() => this.extractAndAnalyze(), 1000);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Listener para mudanças de URL
        window.addEventListener('popstate', () => {
            setTimeout(() => this.checkAndReInit(), 500);
        });
        
        console.log('📡 Event listeners ML configurados');
    }
    
    /**
     * Verificar se precisa reinicializar
     */
    static checkAndReInit() {
        const platform = PlatformDetector.detectPlatform();
        
        if (platform.platform === 'mercadolivre' && platform.type === 'search') {
            console.log('🔄 Reinicializando ML para nova busca');
            this.initializeExtraction();
        } else {
            this.cleanup();
        }
    }
    
    /**
     * Inicializar extração
     */
    static async initializeExtraction() {
        try {
            console.log('🚀 Iniciando extração ML...');
            
            // Aguardar carregamento da página
            const loaded = await MLExtractor.aguardarCarregamento();
            if (!loaded) {
                console.warn('⚠️ Timeout no carregamento ML');
                return;
            }
            
            // Aguardar um pouco mais para elementos dinâmicos
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.extractAndAnalyze();
            
        } catch (error) {
            console.error('❌ Erro na inicialização ML:', error);
        }
    }
    
    /**
     * Extrair e analisar produtos ML
     */
    static async extractAndAnalyze() {
        try {
            console.log('🔍 Extraindo produtos ML...');
            
            // 1. Extrair produtos da página
            const produtos = MLExtractor.extrairProdutos();
            
            if (!produtos || produtos.length === 0) {
                console.log('⚠️ Nenhum produto ML encontrado');
                this.showNoProductsMessage();
                return;
            }
            
            console.log(`📦 ${produtos.length} produtos ML extraídos`);
            
            // 2. Obter dados da busca
            const searchData = MLExtractor.obterDadosBusca();
            this.currentSearchTerm = searchData.termoPesquisa;
            
            console.log('🔍 Dados da busca ML:', searchData);
            
            // 3. Analisar com MLManager se disponível
            let produtosAnalisados = produtos;
            
            if (window.mlManager) {
                console.log('📊 Analisando produtos com MLManager...');
                produtosAnalisados = await window.mlManager.analisarProdutosML(
                    produtos, 
                    this.currentSearchTerm,
                    parseInt(searchData.pagina) || 1
                );
            } else {
                console.warn('⚠️ MLManager não disponível - análise limitada');
            }
            
            // 4. Aplicar filtros se configurados
            const produtosFiltrados = this.aplicarFiltros(produtosAnalisados);
            
            // 5. Exibir resultados
            this.currentProducts = produtosFiltrados;
            this.displayResults(produtosFiltrados);
            
            console.log(`✅ ML: ${produtosFiltrados.length} produtos processados e exibidos`);
            
        } catch (error) {
            console.error('❌ Erro na extração/análise ML:', error);
            this.showErrorMessage();
        }
    }
    
    /**
     * Aplicar filtros configurados
     */
    static aplicarFiltros(produtos) {
        try {
            // Carregar filtros do sessionStorage (compatível com sistema Amazon)
            const filtros = this.carregarFiltros();
            
            if (!this.temFiltrosAtivos(filtros)) {
                console.log('📋 ML: Nenhum filtro ativo');
                return produtos;
            }
            
            console.log('🔧 ML: Aplicando filtros:', filtros);
            
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
                
                return true;
            });
            
            console.log(`🎯 ML: ${produtosFiltrados.length}/${produtos.length} produtos passaram nos filtros`);
            return produtosFiltrados;
            
        } catch (error) {
            console.error('❌ Erro ao aplicar filtros ML:', error);
            return produtos;
        }
    }
    
    /**
     * Carregar filtros do sessionStorage
     */
    static carregarFiltros() {
        try {
            const filtros = sessionStorage.getItem('amk_filtros_analise');
            return filtros ? JSON.parse(filtros) : {};
        } catch (error) {
            console.error('❌ Erro ao carregar filtros ML:', error);
            return {};
        }
    }
    
    /**
     * Verificar se há filtros ativos
     */
    static temFiltrosAtivos(filtros) {
        return filtros.precoMin || filtros.precoMax || 
               filtros.vendasMin || filtros.vendasMax;
    }
    
    /**
     * Exibir resultados
     */
    static displayResults(produtos) {
        try {
            // Ocultar elemento ml-products-list se existir
            if (window.TableManager && typeof TableManager.ocultarListaML === 'function') {
                setTimeout(() => {
                    TableManager.ocultarListaML();
                }, 500);
            }
            
            // Usar TableManager se disponível para criar tabela em modal
            if (window.TableManager && typeof TableManager.criarTabelaProdutos === 'function') {
                console.log('📊 Exibindo resultados ML com TableManager');
                this.criarModalComTabela(produtos);
            } else {
                console.warn('⚠️ TableManager não disponível - usando exibição básica');
                this.displayBasicResults(produtos);
            }
            
            // Atualizar estatísticas se disponível
            if (window.StatsManager) {
                StatsManager.atualizarEstatisticas(produtos);
            }
            
        } catch (error) {
            console.error('❌ Erro ao exibir resultados ML:', error);
            this.displayBasicResults(produtos);
        }
    }
    
    /**
     * Criar modal com tabela usando TableManager
     */
    static criarModalComTabela(produtos) {
        try {
            const tabelaHTML = TableManager.criarTabelaProdutos(produtos);
            
            // Criar modal para exibir tabela
            const modal = document.createElement('div');
            modal.id = 'amazon-analyzer-modal';
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
                background: var(--bg-primary, #ffffff);
                border-radius: 15px;
                width: 95%;
                height: 90%;
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
                        🛒 AMK Spy ML - ${produtos.length} produtos encontrados
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
                    overflow-y: auto;
                    padding: 20px;
                    background: var(--bg-primary, #ffffff);
                ">
                    ${tabelaHTML}
                </div>
            `;
            
            modal.appendChild(modalContent);
            
            // Event listeners
            modal.querySelector('#fechar-modal-ml').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            // Remover modal anterior se existir
            const existing = document.getElementById('amazon-analyzer-modal');
            if (existing) existing.remove();
            
            document.body.appendChild(modal);
            
            // Inicializar eventos da tabela
            setTimeout(() => {
                if (window.TableManager) {
                    TableManager.inicializarEventos();
                }
            }, 100);
            
            console.log('✅ Modal ML criado com tabela');
            
        } catch (error) {
            console.error('❌ Erro ao criar modal ML:', error);
            this.displayBasicResults(produtos);
        }
    }
    
    /**
     * Exibição básica de resultados (fallback)
     */
    static displayBasicResults(produtos) {
        console.log('📋 Exibindo resultados ML básicos');
        
        // Criar overlay simples
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 600px;
            background: white;
            border: 2px solid #FFE600;
            border-radius: 10px;
            padding: 20px;
            z-index: 999999;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #333; font-size: 16px;">
                    🛒 AMK Spy ML - ${produtos.length} produtos
                </h3>
                <button id="fechar-overlay-ml" 
                        style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
                Termo: ${this.currentSearchTerm}
            </div>
            <div id="ml-products-list"></div>
        `;
        
        const lista = overlay.querySelector('#ml-products-list');
        
        produtos.slice(0, 20).forEach((produto, index) => {
            const item = document.createElement('div');
            item.style.cssText = `
                border-bottom: 1px solid #eee;
                padding: 10px 0;
                font-size: 12px;
            `;
            
            item.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">
                    ${index + 1}. ${produto.titulo?.substring(0, 50) || 'Sem título'}...
                </div>
                <div style="color: #666;">
                    💰 R$ ${produto.preco?.toFixed(2) || '0,00'} 
                    ${produto.desconto ? `(-${produto.desconto}%)` : ''}
                    ${produto.vendas ? `| 📦 ${produto.vendas} vendas` : ''}
                </div>
                ${produto.vendedor ? `<div style="color: #999; font-size: 11px;">👤 ${produto.vendedor}</div>` : ''}
            `;
            
            if (produto.link) {
                item.style.cursor = 'pointer';
                item.onclick = () => window.open(produto.link, '_blank');
            }
            
            lista.appendChild(item);
        });
        
        // Adicionar event listener para o botão fechar
        overlay.querySelector('#fechar-overlay-ml').addEventListener('click', () => {
            overlay.remove();
        });
        
        // Remover overlay anterior se existir
        const existing = document.getElementById('amk-ml-results');
        if (existing) existing.remove();
        
        document.body.appendChild(overlay);
    }
    
    /**
     * Mostrar mensagem de nenhum produto
     */
    static showNoProductsMessage() {
        console.log('📋 Exibindo mensagem de nenhum produto ML');
        
        if (window.NotificationManager) {
            NotificationManager.aviso('Nenhum produto encontrado na página ML');
        }
    }
    
    /**
     * Mostrar mensagem de erro
     */
    static showErrorMessage() {
        console.log('⚠️ Exibindo mensagem de erro ML');
        
        if (window.NotificationManager) {
            NotificationManager.erro('Erro ao analisar produtos ML');
        }
    }
    
    /**
     * Cleanup
     */
    static cleanup() {
        this.isActive = false;
        this.currentProducts = [];
        this.currentSearchTerm = '';
        
        // Remover overlays
        const overlay = document.getElementById('amk-ml-results');
        if (overlay) overlay.remove();
        
        console.log('🧹 MLController cleanup concluído');
    }
    
    /**
     * Reextrair produtos (chamado pelo SidePanel)
     */
    static async reextract() {
        console.log('🔄 Reextração ML solicitada');
        await this.extractAndAnalyze();
    }
    
    /**
     * Iniciar análise em background (compatibilidade com SidePanel)
     */
    static async iniciarAnaliseBackground(tipo = 'todas') {
        console.log(`🚀 Iniciando análise ML em background (${tipo})`);
        await this.extractAndAnalyze();
    }
    
    /**
     * Criar modal vazio (compatibilidade com SidePanel)
     */
    static criarModalVazio() {
        console.log('📊 Criando modal vazio ML');
        this.displayBasicResults([]);
    }
    
    /**
     * Exibir tabela com produtos (compatibilidade com SidePanel)
     */
    static exibirTabelaComProdutos(produtos) {
        console.log(`📊 Exibindo tabela ML com ${produtos.length} produtos`);
        this.displayResults(produtos);
    }
    
    /**
     * Getter para produtos armazenados (compatibilidade com SidePanel)
     */
    static get produtosArmazenados() {
        return this.currentProducts;
    }
    
    /**
     * Obter produtos atuais
     */
    static getCurrentProducts() {
        return this.currentProducts;
    }
    
    /**
     * Obter termo de busca atual
     */
    static getCurrentSearchTerm() {
        return this.currentSearchTerm;
    }
}

// Expor globalmente
window.MLController = MLController; 