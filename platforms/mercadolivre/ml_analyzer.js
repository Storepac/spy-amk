/**
 * ML Analyzer - Analisador específico para MercadoLivre
 * Sistema independente e personalizado para ML
 */
class MLAnalyzer {
    
    static config = {
        maxProdutos: 50,
        timeoutCarregamento: 10000,
        intervaloPaginacao: 3000,
        maxPaginas: 5
    };
    
    static estatisticas = {
        produtosAnalisados: 0,
        tempoInicioAnalise: null,
        paginasProcessadas: 0,
        produtosComVendas: 0,
        receitaTotal: 0
    };
    
    /**
     * Analisar produtos do MercadoLivre
     */
    static async analisarProdutos(produtos, termoPesquisa, pagina = 1) {
        console.log('🔍 [ML-ANALYZER] Iniciando análise de produtos ML...');
        
        this.estatisticas.tempoInicioAnalise = Date.now();
        this.estatisticas.produtosAnalisados = produtos.length;
        this.estatisticas.paginasProcessadas = pagina;
        
        try {
            const produtosEnriquecidos = await this.processarProdutos(produtos, termoPesquisa, pagina);
            this.calcularEstatisticas(produtosEnriquecidos);
            
            console.log(`✅ [ML-ANALYZER] ${produtosEnriquecidos.length} produtos analisados com sucesso`);
            return produtosEnriquecidos;
            
        } catch (error) {
            console.error('❌ [ML-ANALYZER] Erro na análise:', error);
            return produtos; // Retorna produtos originais em caso de erro
        }
    }
    
    /**
     * Processar lista de produtos
     */
    static async processarProdutos(produtos, termoPesquisa, pagina) {
        const produtosProcessados = [];
        
        for (let i = 0; i < produtos.length; i++) {
            const produto = produtos[i];
            
            try {
                const produtoEnriquecido = await this.processarProdutoIndividual(produto, termoPesquisa, pagina, i + 1);
                produtosProcessados.push(produtoEnriquecido);
                
                // Log de progresso
                if ((i + 1) % 10 === 0) {
                    console.log(`📊 [ML-ANALYZER] Processados ${i + 1}/${produtos.length} produtos`);
                }
                
            } catch (error) {
                console.error(`❌ [ML-ANALYZER] Erro ao processar produto ${i + 1}:`, error);
                produtosProcessados.push(produto); // Adiciona produto original
            }
        }
        
        return produtosProcessados;
    }
    
    /**
     * Processar produto individual
     */
    static async processarProdutoIndividual(produto, termoPesquisa, pagina, posicao) {
        const produtoEnriquecido = { ...produto };
        
        // Enriquecer dados específicos do ML
        produtoEnriquecido.termoPesquisa = termoPesquisa;
        // Preservar paginaBusca se já existe, senão usar a informada
        if (!produtoEnriquecido.paginaBusca) {
            produtoEnriquecido.paginaBusca = pagina;
        }
        // Calcular posição real baseada na página
        const paginaProduto = produtoEnriquecido.paginaBusca || pagina;
        produtoEnriquecido.posicaoReal = ((paginaProduto - 1) * 50) + posicao;
        
        // Calcular métricas específicas ML
        produtoEnriquecido.competitividade = this.calcularCompetitividade(produto);
        produtoEnriquecido.scoreML = this.calcularScoreML(produto);
        produtoEnriquecido.categoriaRanking = this.extrairCategoriaRanking(produto);
        produtoEnriquecido.badges = this.extrairBadges(produto);
        
        // Análise de preço e vendas
        produtoEnriquecido.faixaPreco = this.determinarFaixaPreco(produto.preco);
        produtoEnriquecido.volumeVendas = this.categorizarVolumeVendas(produto.vendas);
        
        // Dados para salvamento
        produtoEnriquecido.dataAnalise = new Date().toISOString();
        produtoEnriquecido.hashProduto = this.gerarHashProduto(produto);
        
        return produtoEnriquecido;
    }
    
    /**
     * Calcular competitividade do produto
     */
    static calcularCompetitividade(produto) {
        let score = 0;
        
        // Score baseado em vendas
        if (produto.vendas > 1000) score += 30;
        else if (produto.vendas > 100) score += 20;
        else if (produto.vendas > 10) score += 10;
        
        // Score baseado em avaliação
        if (produto.avaliacao >= 4.5) score += 25;
        else if (produto.avaliacao >= 4.0) score += 15;
        else if (produto.avaliacao >= 3.5) score += 10;
        
        // Score baseado em número de avaliações
        if (produto.numAvaliacoes > 500) score += 20;
        else if (produto.numAvaliacoes > 100) score += 15;
        else if (produto.numAvaliacoes > 50) score += 10;
        
        // Penalidade por ser patrocinado
        if (produto.patrocinado) score -= 5;
        
        // Score baseado na posição
        if (produto.posicao <= 5) score += 15;
        else if (produto.posicao <= 10) score += 10;
        else if (produto.posicao <= 20) score += 5;
        
        return Math.min(100, Math.max(0, score));
    }
    
    /**
     * Calcular score ML específico
     */
    static calcularScoreML(produto) {
        const receita = produto.receita || 0;
        const vendas = produto.vendas || 0;
        const preco = produto.preco || 0;
        
        // Score baseado na receita
        let score = Math.log10(receita + 1) * 10;
        
        // Bonus para produtos com bom equilíbrio preço/vendas
        if (vendas > 0 && preco > 0) {
            const ratio = vendas / preco;
            if (ratio > 10) score += 20;
            else if (ratio > 5) score += 15;
            else if (ratio > 1) score += 10;
        }
        
        return Math.min(100, Math.max(0, score));
    }
    
    /**
     * Extrair categoria e ranking
     */
    static extrairCategoriaRanking(produto) {
        // Implementar extração de categoria do ML
        return {
            categoria: null,
            posicaoCategoria: null,
            rankingTexto: null
        };
    }
    
    /**
     * Extrair badges do ML
     */
    static extrairBadges(produto) {
        return {
            maisVendido: false,
            recomendado: false,
            melhorPreco: false,
            envioGratis: false,
            lojaOficial: false,
            mercadoLider: false
        };
    }
    
    /**
     * Determinar faixa de preço
     */
    static determinarFaixaPreco(preco) {
        if (!preco) return 'Sem preço';
        
        if (preco < 50) return 'Baixo (< R$ 50)';
        if (preco < 100) return 'Médio-Baixo (R$ 50-100)';
        if (preco < 500) return 'Médio (R$ 100-500)';
        if (preco < 1000) return 'Médio-Alto (R$ 500-1000)';
        return 'Alto (> R$ 1000)';
    }
    
    /**
     * Categorizar volume de vendas
     */
    static categorizarVolumeVendas(vendas) {
        if (!vendas || vendas === 0) return 'Sem vendas';
        
        if (vendas < 10) return 'Baixo (< 10)';
        if (vendas < 100) return 'Médio (10-100)';
        if (vendas < 1000) return 'Alto (100-1000)';
        if (vendas < 10000) return 'Muito Alto (1k-10k)';
        return 'Excepcional (> 10k)';
    }
    
    /**
     * Gerar hash único do produto
     */
    static gerarHashProduto(produto) {
        const dados = `${produto.mlId}-${produto.titulo}-${produto.preco}`;
        return btoa(dados).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    }
    
    /**
     * Calcular estatísticas finais
     */
    static calcularEstatisticas(produtos) {
        this.estatisticas.produtosComVendas = produtos.filter(p => p.vendas > 0).length;
        this.estatisticas.receitaTotal = produtos.reduce((total, p) => total + (p.receita || 0), 0);
        
        const tempoTotal = Date.now() - this.estatisticas.tempoInicioAnalise;
        console.log(`📊 [ML-ANALYZER] Estatísticas:`, {
            produtosAnalisados: this.estatisticas.produtosAnalisados,
            produtosComVendas: this.estatisticas.produtosComVendas,
            receitaTotal: this.estatisticas.receitaTotal,
            tempoAnalise: `${tempoTotal}ms`
        });
    }
    
    /**
     * Análise comparativa entre produtos
     */
    static analisarCompetitividade(produtos) {
        if (!produtos || produtos.length === 0) return [];
        
        // Ordenar por competitividade
        const produtosOrdenados = [...produtos].sort((a, b) => 
            (b.competitividade || 0) - (a.competitividade || 0)
        );
        
        // Adicionar ranking de competitividade
        produtosOrdenados.forEach((produto, index) => {
            produto.rankingCompetitividade = index + 1;
            produto.percentilCompetitividade = Math.round(((produtos.length - index) / produtos.length) * 100);
        });
        
        return produtosOrdenados;
    }
    
    /**
     * Obter estatísticas atuais
     */
    static obterEstatisticas() {
        return { ...this.estatisticas };
    }
    
    /**
     * Reset das estatísticas
     */
    static resetEstatisticas() {
        this.estatisticas = {
            produtosAnalisados: 0,
            tempoInicioAnalise: null,
            paginasProcessadas: 0,
            produtosComVendas: 0,
            receitaTotal: 0
        };
    }
}

// Expor globalmente
window.MLAnalyzer = MLAnalyzer; 