class ProductAnalyzer {
    static calcularMetricas(produtos) {
        const produtosComPreco = produtos.filter(p => p.precoNumerico > 0);
        const produtosComAvaliacao = produtos.filter(p => p.avaliacaoNumerica > 0);
        const produtosComVendas = produtos.filter(p => p.vendidos > 0);
        const produtosComRanking = produtos.filter(p => p.ranking);
        
        const precoMedio = produtosComPreco.length > 0 ? 
            produtosComPreco.reduce((sum, p) => sum + p.precoNumerico, 0) / produtosComPreco.length : 0;
        
        const receitaTotal = produtosComVendas.reduce((sum, p) => sum + (p.precoNumerico * p.vendidos), 0);
        const receitaMedia = produtosComVendas.length > 0 ? receitaTotal / produtosComVendas.length : 0;
        
        const mediaVendasMes = produtosComVendas.length > 0 ? 
            produtosComVendas.reduce((sum, p) => sum + p.vendidos, 0) / produtosComVendas.length : 0;
        
        const mediaAvaliacao = produtosComAvaliacao.length > 0 ? 
            produtosComAvaliacao.reduce((sum, p) => sum + p.avaliacaoNumerica, 0) / produtosComAvaliacao.length : 0;

        // Métricas de BSR
        const mediaBSR = produtosComRanking.length > 0 ?
            produtosComRanking.reduce((sum, p) => sum + parseInt(p.ranking), 0) / produtosComRanking.length : 0;

        const produtosTop100 = produtosComRanking.filter(p => parseInt(p.ranking) <= 100).length;
        const produtosTop1000 = produtosComRanking.filter(p => parseInt(p.ranking) <= 1000).length;
        
        // Estatísticas de BSR por faixas
        const faixasBSR = {
            elite: produtosComRanking.filter(p => parseInt(p.ranking) <= 100).length,
            otimo: produtosComRanking.filter(p => parseInt(p.ranking) > 100 && parseInt(p.ranking) <= 1000).length,
            bom: produtosComRanking.filter(p => parseInt(p.ranking) > 1000 && parseInt(p.ranking) <= 5000).length,
            regular: produtosComRanking.filter(p => parseInt(p.ranking) > 5000 && parseInt(p.ranking) <= 10000).length,
            baixo: produtosComRanking.filter(p => parseInt(p.ranking) > 10000).length
        };

        // Análise de categorias mais competitivas (com melhores rankings)
        const categoriaRankings = {};
        produtosComRanking.forEach(p => {
            if (p.categoria) {
                if (!categoriaRankings[p.categoria]) {
                    categoriaRankings[p.categoria] = [];
                }
                categoriaRankings[p.categoria].push(parseInt(p.ranking));
            }
        });

        const categoriasCompetitivas = Object.entries(categoriaRankings)
            .map(([categoria, rankings]) => ({
                categoria,
                mediaBSR: rankings.reduce((a, b) => a + b, 0) / rankings.length,
                quantidade: rankings.length
            }))
            .sort((a, b) => a.mediaBSR - b.mediaBSR)
            .slice(0, 5);

        return {
            precoMedio,
            receitaTotal,
            receitaMedia,
            mediaVendasMes,
            mediaAvaliacao,
            mediaBSR,
            produtosTop100,
            produtosTop1000,
            faixasBSR,
            categoriasCompetitivas,
            totalProdutos: produtos.length,
            produtosComRanking: produtosComRanking.length
        };
    }

    static async analisarProdutosPesquisaRapido() {
        const produtos = [];
        const elementosProdutos = document.querySelectorAll('[data-asin]:not([data-asin=""])');
        
        NotificationManager.mostrar(`Coletando ${elementosProdutos.length} produtos básicos...`);
        
        elementosProdutos.forEach((elemento, index) => {
            const dadosBasicos = ProductExtractor.extrairDadosProduto(elemento);
            if (dadosBasicos.titulo && dadosBasicos.asin) {
                dadosBasicos.posicaoGlobal = index + 1;
                dadosBasicos.paginaOrigem = 1;
                dadosBasicos.carregandoDetalhes = true;
                produtos.push(dadosBasicos);
            }
        });
        
        return produtos;
    }

    static async buscarDetalhesEmParalelo(produtos, atualizarCallback) {
        const BATCH_SIZE = 5;
        let produtosAtualizados = 0;
        
        for (let i = 0; i < produtos.length; i += BATCH_SIZE) {
            const batch = produtos.slice(i, i + BATCH_SIZE);
            
            const promessas = batch.map(async (produto, batchIndex) => {
                const indexGlobal = i + batchIndex;
                
                try {
                    NotificationManager.mostrar(`Buscando detalhes: ${indexGlobal + 1}/${produtos.length}`);
                    
                    const detalhes = await ProductExtractor.extrairDetalhesProduto(produto.link);
                    
                    if (detalhes && detalhes.marca) {
                        produto.marca = detalhes.marca;
                    }

                    if (detalhes && detalhes.categoria) {
                        produto.categoria = detalhes.categoria;
                    }

                    if (detalhes && detalhes.categoriaSecundaria) {
                        produto.categoriaSecundaria = detalhes.categoriaSecundaria;
                    }

                    if (detalhes && detalhes.ranking) {
                        produto.ranking = detalhes.ranking;
                    }

                    if (detalhes && detalhes.rankingSecundario) {
                        produto.rankingSecundario = detalhes.rankingSecundario;
                    }
                    
                    produto.carregandoDetalhes = false;
                    atualizarCallback(produto, indexGlobal);
                    
                    produtosAtualizados++;
                    if (produtosAtualizados === produtos.length) {
                        // Todos os produtos foram atualizados
                        TableManager.atualizarMetricas(produtos);
                        NotificationManager.mostrar('Análise completa! Rankings atualizados.');
                    }
                    
                } catch (error) {
                    console.error(`Erro ao buscar detalhes do produto ${indexGlobal}:`, error);
                    produto.carregandoDetalhes = false;
                    atualizarCallback(produto, indexGlobal);
                    
                    produtosAtualizados++;
                    if (produtosAtualizados === produtos.length) {
                        TableManager.atualizarMetricas(produtos);
                    }
                }
            });
            
            await Promise.all(promessas);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    static async recarregarDetalhes(produtos, atualizarCallback) {
        NotificationManager.mostrar('Recarregando detalhes dos produtos...');
        
        // Resetar status de carregamento
        produtos.forEach(produto => {
            produto.carregandoDetalhes = true;
            produto.ranking = null;
            produto.categoria = null;
            produto.rankingSecundario = null;
            produto.categoriaSecundaria = null;
        });
        
        // Atualizar UI para mostrar loading
        produtos.forEach((produto, index) => {
            atualizarCallback(produto, index);
        });
        
        // Buscar detalhes novamente
        await this.buscarDetalhesEmParalelo(produtos, atualizarCallback);
    }

    static async coletarProdutosTodasPaginas() {
        let produtos = [];
        let pagina = 1;
        let temMaisPaginas = true;
        let posicaoGlobal = 1;
        
        while (temMaisPaginas && pagina <= 7) {
            const url = new URL(window.location.href);
            url.searchParams.set('page', pagina);
            
            try {
                const response = await fetch(url.toString());
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                const elementosProdutos = Array.from(doc.querySelectorAll('[data-asin]:not([data-asin=""])'));
                
                if (elementosProdutos.length === 0) {
                    temMaisPaginas = false;
                    continue;
                }
                
                NotificationManager.mostrar(`Coletando produtos da página ${pagina}... (${elementosProdutos.length} produtos)`);
                
                for (let i = 0; i < elementosProdutos.length; i++) {
                    const elemento = elementosProdutos[i];
                    const dadosBasicos = ProductExtractor.extrairDadosProduto(elemento);
                    
                    if (dadosBasicos.titulo && dadosBasicos.asin && dadosBasicos.link) {
                        NotificationManager.mostrar(`Analisando produto ${i + 1}/${elementosProdutos.length} da página ${pagina}...`);
                        
                        const detalhes = await ProductExtractor.extrairDetalhesProduto(dadosBasicos.link);
                        
                        if (detalhes) {
                            const produtoCompleto = {
                                ...dadosBasicos,
                                marca: detalhes.marca || dadosBasicos.marca,
                                categoria: detalhes.categoria || dadosBasicos.categoria,
                                categoriaSecundaria: detalhes.categoriaSecundaria || dadosBasicos.categoriaSecundaria,
                                ranking: detalhes.ranking || dadosBasicos.ranking,
                                rankingSecundario: detalhes.rankingSecundario || dadosBasicos.rankingSecundario,
                                posicaoGlobal,
                                paginaOrigem: pagina
                            };
                            
                            produtos.push(produtoCompleto);
                        } else {
                            produtos.push({
                                ...dadosBasicos,
                                posicaoGlobal,
                                paginaOrigem: pagina
                            });
                        }
                        
                        posicaoGlobal++;
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                }
                
                pagina++;
                
            } catch (error) {
                console.error('Erro ao coletar produtos:', error);
                temMaisPaginas = false;
            }
        }
        
        return produtos.sort((a, b) => a.posicaoGlobal - b.posicaoGlobal);
    }
}

window.ProductAnalyzer = ProductAnalyzer; 