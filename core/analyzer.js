class ProductAnalyzer {
    static calcularMetricas(produtos) {
        const produtosComPreco = produtos.filter(p => p.precoNumerico > 0);
        const produtosComAvaliacao = produtos.filter(p => p.avaliacaoNumerica > 0);
        const produtosComVendas = produtos.filter(p => p.vendidos > 0);
        
        const precoMedio = produtosComPreco.length > 0 ? 
            produtosComPreco.reduce((sum, p) => sum + p.precoNumerico, 0) / produtosComPreco.length : 0;
        
        const receitaTotal = produtosComVendas.reduce((sum, p) => sum + (p.precoNumerico * p.vendidos), 0);
        const receitaMedia = produtosComVendas.length > 0 ? receitaTotal / produtosComVendas.length : 0;
        
        const mediaVendasMes = produtosComVendas.length > 0 ? 
            produtosComVendas.reduce((sum, p) => sum + p.vendidos, 0) / produtosComVendas.length : 0;
        
        const mediaAvaliacao = produtosComAvaliacao.length > 0 ? 
            produtosComAvaliacao.reduce((sum, p) => sum + p.avaliacaoNumerica, 0) / produtosComAvaliacao.length : 0;
        
        return {
            precoMedio,
            receitaTotal,
            receitaMedia,
            mediaVendasMes,
            mediaAvaliacao,
            totalProdutos: produtos.length
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
                    
                    produto.carregandoDetalhes = false;
                    atualizarCallback(produto, indexGlobal);
                    
                } catch (error) {
                    console.error(`Erro ao buscar detalhes do produto ${indexGlobal}:`, error);
                    produto.carregandoDetalhes = false;
                    atualizarCallback(produto, indexGlobal);
                }
            });
            
            await Promise.all(promessas);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        NotificationManager.mostrar('Análise completa!');
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