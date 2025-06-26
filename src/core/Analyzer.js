/**
 * Analyzer - Análise e coleta de produtos da Amazon
 * Versão refatorada com melhor organização e performance
 */
class Analyzer {
    constructor() {
        this.dataManager = window.DataManager;
        this.extractor = new ProductExtractor();
        this.config = {
            maxPaginas: 5,
            delayEntrePaginas: 300,
            batchSize: 20,
            timeout: 10000
        };
    }

    // ===== ANÁLISE RÁPIDA =====
    async analisarProdutosPesquisaRapido() {
        try {
            console.log('🚀 Iniciando análise rápida...');
            this.dataManager.updateState('ui.loading', true);
            this.dataManager.updateState('ui.progresso', 0);

            const produtos = await this.coletarProdutosPaginaAtual();
            
            if (produtos.length === 0) {
                throw new Error('Nenhum produto encontrado na página atual');
            }

            this.dataManager.setProdutos(produtos);
            this.dataManager.adicionarAoHistorico('analise_rapida', { quantidade: produtos.length });

            console.log(`✅ Análise rápida concluída: ${produtos.length} produtos`);
            return produtos;

        } catch (error) {
            console.error('❌ Erro na análise rápida:', error);
            throw error;
        } finally {
            this.dataManager.updateState('ui.loading', false);
        }
    }

    // ===== ANÁLISE COMPLETA =====
    async analisarProdutosTodasPaginas() {
        try {
            console.log('🚀 Iniciando análise completa...');
            this.dataManager.updateState('ui.loading', true);
            this.dataManager.updateState('ui.progresso', 0);

            const produtos = await this.coletarProdutosTodasPaginas();
            
            if (produtos.length === 0) {
                throw new Error('Nenhum produto encontrado');
            }

            this.dataManager.setProdutos(produtos);
            this.dataManager.adicionarAoHistorico('analise_completa', { 
                quantidade: produtos.length,
                paginas: Math.ceil(produtos.length / 48) // Estimativa
            });

            console.log(`✅ Análise completa concluída: ${produtos.length} produtos`);
            return produtos;

        } catch (error) {
            console.error('❌ Erro na análise completa:', error);
            throw error;
        } finally {
            this.dataManager.updateState('ui.loading', false);
        }
    }

    // ===== COLETA DE PRODUTOS =====
    async coletarProdutosPaginaAtual() {
        const elementosProdutos = this.encontrarElementosProdutos();
        console.log(`📊 Encontrados ${elementosProdutos.length} elementos de produtos`);

        if (elementosProdutos.length === 0) {
            throw new Error('Nenhum produto encontrado na página atual');
        }

        const produtos = [];
        elementosProdutos.forEach((elemento, index) => {
            try {
                const dadosBasicos = this.extractor.extrairDadosProduto(elemento);
                if (dadosBasicos.titulo && dadosBasicos.asin) {
                    dadosBasicos.posicaoGlobal = index + 1;
                    dadosBasicos.paginaOrigem = 1;
                    dadosBasicos.posicaoNaPagina = index + 1;
                    dadosBasicos.carregandoDetalhes = true;
                    produtos.push(dadosBasicos);
                }
            } catch (error) {
                console.error(`Erro ao extrair dados do produto ${index}:`, error);
            }
        });

        return produtos;
    }

    async coletarProdutosTodasPaginas() {
        let produtos = [];
        let pagina = 1;
        let posicaoGlobal = 1;
        const maxPaginas = this.config.maxPaginas;

        // Coletar produtos da página atual
        const produtosPaginaAtual = await this.coletarProdutosPaginaAtual();
        produtos.push(...produtosPaginaAtual.map((p, i) => ({
            ...p,
            posicaoGlobal: i + 1,
            paginaOrigem: 1,
            posicaoNaPagina: i + 1
        })));
        posicaoGlobal = produtosPaginaAtual.length + 1;

        console.log(`✅ Página 1: ${produtosPaginaAtual.length} produtos coletados`);

        // Coletar páginas adicionais
        while (pagina < maxPaginas) {
            pagina++;
            
            try {
                const produtosPagina = await this.coletarProdutosPagina(pagina, posicaoGlobal);
                
                if (produtosPagina.length === 0) {
                    console.log(`📄 Página ${pagina} não contém produtos válidos`);
                    break;
                }

                produtos.push(...produtosPagina);
                posicaoGlobal += produtosPagina.length;

                console.log(`✅ Página ${pagina}: ${produtosPagina.length} produtos coletados`);
                
                // Atualizar progresso
                const progresso = (pagina / maxPaginas) * 100;
                this.dataManager.updateState('ui.progresso', progresso);

                // Delay entre páginas
                await this.delay(this.config.delayEntrePaginas);

            } catch (error) {
                console.error(`❌ Erro ao coletar produtos da página ${pagina}:`, error);
                break;
            }
        }

        return produtos.sort((a, b) => a.posicaoGlobal - b.posicaoGlobal);
    }

    async coletarProdutosPagina(pagina, posicaoGlobal) {
        const url = new URL(window.location.href);
        url.searchParams.set('page', pagina);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Página ${pagina} não encontrada`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const elementosProdutos = this.encontrarElementosProdutos(doc);
        const produtos = [];

        elementosProdutos.forEach((elemento, index) => {
            try {
                const dadosBasicos = this.extractor.extrairDadosProduto(elemento);
                if (dadosBasicos.titulo && dadosBasicos.asin && dadosBasicos.link) {
                    dadosBasicos.posicaoGlobal = posicaoGlobal + index;
                    dadosBasicos.paginaOrigem = pagina;
                    dadosBasicos.posicaoNaPagina = index + 1;
                    produtos.push(dadosBasicos);
                }
            } catch (error) {
                console.error(`Erro ao extrair dados do produto ${index} da página ${pagina}:`, error);
            }
        });

        return produtos;
    }

    // ===== BUSCA DE DETALHES =====
    async buscarDetalhesEmParalelo(callback) {
        const produtos = this.dataManager.getProdutos();
        const batchSize = this.config.batchSize;
        
        console.log(`🔍 Buscando detalhes para ${produtos.length} produtos...`);

        for (let i = 0; i < produtos.length; i += batchSize) {
            const batch = produtos.slice(i, i + batchSize);
            
            const promessas = batch.map(async (produto, batchIndex) => {
                const indexGlobal = i + batchIndex;
                
                try {
                    const detalhes = await this.extractor.extrairDetalhesProduto(produto.link);
                    
                    if (detalhes) {
                        const produtoAtualizado = { ...produto, ...detalhes };
                        this.dataManager.updateProduto(indexGlobal, produtoAtualizado);
                        
                        if (callback) {
                            callback(produtoAtualizado, indexGlobal);
                        }
                    }
                    
                } catch (error) {
                    console.error(`Erro ao buscar detalhes do produto ${indexGlobal}:`, error);
                }
            });

            await Promise.all(promessas);
            await this.delay(200); // Delay entre batches
        }

        this.dataManager.calcularMetricas();
        console.log('✅ Busca de detalhes concluída');
    }

    async buscarMarcasFaltantes(callback) {
        const produtos = this.dataManager.getProdutos();
        const produtosSemMarca = produtos.filter(p => !p.marca || p.marca === 'N/A');
        
        if (produtosSemMarca.length === 0) {
            console.log('✅ Todos os produtos já têm marca');
            return;
        }

        console.log(`🏷️ Buscando marcas para ${produtosSemMarca.length} produtos...`);

        for (let i = 0; i < produtosSemMarca.length; i++) {
            const produto = produtosSemMarca[i];
            const index = produtos.findIndex(p => p.asin === produto.asin);
            
            try {
                const detalhes = await this.extractor.extrairDetalhesProduto(produto.link);
                
                if (detalhes && detalhes.marca) {
                    const produtoAtualizado = { ...produto, marca: detalhes.marca };
                    this.dataManager.updateProduto(index, produtoAtualizado);
                    
                    if (callback) {
                        callback(produtoAtualizado, index);
                    }
                }
                
            } catch (error) {
                console.error(`Erro ao buscar marca do produto ${index}:`, error);
            }

            // Delay para não sobrecarregar
            await this.delay(100);
        }

        console.log('✅ Busca de marcas concluída');
    }

    // ===== MÉTODOS AUXILIARES =====
    encontrarElementosProdutos(doc = document) {
        // Tentar diferentes seletores para encontrar produtos
        let elementos = doc.querySelectorAll('[data-asin]:not([data-asin=""])');
        
        if (elementos.length === 0) {
            elementos = doc.querySelectorAll('.s-result-item[data-component-type="s-search-result"]');
        }
        
        if (elementos.length === 0) {
            elementos = doc.querySelectorAll('.s-card-container');
        }

        return Array.from(elementos);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== CONFIGURAÇÃO =====
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }

    getConfig() {
        return { ...this.config };
    }
}

// Instância global
window.Analyzer = new Analyzer(); 