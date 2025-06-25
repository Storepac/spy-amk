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
        
        // Tentar diferentes seletores para encontrar produtos
        let elementosProdutos = document.querySelectorAll('[data-asin]:not([data-asin=""])');
        
        // Se não encontrar com data-asin, tentar outros seletores
        if (elementosProdutos.length === 0) {
            elementosProdutos = document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]');
        }
        
        // Se ainda não encontrar, tentar seletores mais genéricos
        if (elementosProdutos.length === 0) {
            elementosProdutos = document.querySelectorAll('.s-card-container');
        }
        
        console.log(`Encontrados ${elementosProdutos.length} elementos de produtos`);
        
        if (elementosProdutos.length === 0) {
            NotificationManager.erro('Nenhum produto encontrado na página. Verifique se está em uma página de pesquisa da Amazon.');
            return produtos;
        }
        
        NotificationManager.informacao(`Coletando ${elementosProdutos.length} produtos básicos...`);
        
        elementosProdutos.forEach((elemento, index) => {
            try {
                const dadosBasicos = ProductExtractor.extrairDadosProduto(elemento);
                if (dadosBasicos.titulo && dadosBasicos.asin) {
                    dadosBasicos.posicaoGlobal = index + 1;
                    dadosBasicos.paginaOrigem = 1;
                    dadosBasicos.carregandoDetalhes = true;
                    produtos.push(dadosBasicos);
                }
            } catch (error) {
                console.error(`Erro ao extrair dados do produto ${index}:`, error);
            }
        });
        
        console.log(`Produtos extraídos com sucesso: ${produtos.length}`);
        
        if (produtos.length === 0) {
            NotificationManager.erro('Nenhum produto válido foi extraído. Verifique se a página está carregada completamente.');
        } else {
            NotificationManager.sucesso(`${produtos.length} produtos coletados com sucesso!`);
        }
        
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
                    NotificationManager.informacao(`Buscando detalhes: ${indexGlobal + 1}/${produtos.length}`);
                    
                    const detalhes = await ProductExtractor.extrairDetalhesProduto(produto.link);
                    
                    if (detalhes) {
                        // Atualizar todos os dados disponíveis
                        if (detalhes.asin) produto.asin = detalhes.asin;
                        if (detalhes.marca) produto.marca = detalhes.marca;
                        if (detalhes.categoria) produto.categoria = detalhes.categoria;
                        if (detalhes.categoriaSecundaria) produto.categoriaSecundaria = detalhes.categoriaSecundaria;
                        if (detalhes.ranking) produto.ranking = detalhes.ranking;
                        if (detalhes.rankingSecundario) produto.rankingSecundario = detalhes.rankingSecundario;
                        if (detalhes.imagem) produto.imagem = detalhes.imagem;
                        if (detalhes.receitaMes) produto.receitaMes = detalhes.receitaMes;
                        
                        // Atualizar vendas se disponível
                        if (detalhes.vendas) {
                            produto.vendidos = detalhes.vendas;
                            // Recalcular receita
                            produto.receitaMes = (produto.precoNumerico || 0) * detalhes.vendas;
                        }
                    }
                    
                    produto.carregandoDetalhes = false;
                    atualizarCallback(produto, indexGlobal);
                    
                    produtosAtualizados++;
                    if (produtosAtualizados === produtos.length) {
                        // Todos os produtos foram atualizados
                        TableManager.atualizarMetricas(produtos);
                        NotificationManager.sucesso('Análise completa! Rankings atualizados.');
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
        NotificationManager.informacao('Recarregando detalhes dos produtos...');
        
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
                
                NotificationManager.informacao(`Coletando produtos da página ${pagina}... (${elementosProdutos.length} produtos)`);
                
                for (let i = 0; i < elementosProdutos.length; i++) {
                    const elemento = elementosProdutos[i];
                    const dadosBasicos = ProductExtractor.extrairDadosProduto(elemento);
                    
                    if (dadosBasicos.titulo && dadosBasicos.asin && dadosBasicos.link) {
                        NotificationManager.informacao(`Analisando produto ${i + 1}/${elementosProdutos.length} da página ${pagina}...`);
                        
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

    static async buscarMarcasFaltantes(produtos, callback) {
        console.log('🔍 Iniciando busca automática de marcas e categorias...');
        
        const produtosSemMarca = produtos.filter(p => !p.marca || p.marca === 'N/A' || p.marca === '');
        const produtosSemCategoria = produtos.filter(p => !p.categoria || p.categoria === 'N/A' || p.categoria === '');
        
        const produtosParaBuscar = [...new Set([...produtosSemMarca, ...produtosSemCategoria])];
        
        if (produtosParaBuscar.length === 0) {
            console.log('✅ Todos os produtos já têm marca e categoria definidas');
            return;
        }
        
        console.log(`📊 Buscando marcas e categorias para ${produtosParaBuscar.length} produtos...`);
        console.log(`   - Produtos sem marca: ${produtosSemMarca.length}`);
        console.log(`   - Produtos sem categoria: ${produtosSemCategoria.length}`);
        
        // Criar loading na interface
        this.mostrarLoadingMarcas(produtosParaBuscar.length);
        
        // Processar em lotes maiores para maior velocidade
        const batchSize = 5; // Aumentado de 3 para 5
        const batches = [];
        
        for (let i = 0; i < produtosParaBuscar.length; i += batchSize) {
            batches.push(produtosParaBuscar.slice(i, i + batchSize));
        }
        
        let processados = 0;
        
        for (const batch of batches) {
            const promises = batch.map(async (produto) => {
                try {
                    const dadosCompletos = await this.buscarDadosCompletosProduto(produto.asin);
                    
                    // Atualizar produto com dados completos
                    Object.assign(produto, dadosCompletos);
                    
                    // Atualizar interface
                    if (callback) {
                        callback(produto, produtos.indexOf(produto));
                    }
                    
                    processados++;
                    this.atualizarProgressoMarcas(processados, produtosParaBuscar.length);
                    
                    return produto;
                } catch (error) {
                    console.error(`❌ Erro ao buscar dados do produto ${produto.asin}:`, error);
                    processados++;
                    this.atualizarProgressoMarcas(processados, produtosParaBuscar.length);
                    return produto;
                }
            });
            
            await Promise.all(promises);
            
            // Delay menor para maior velocidade
            await new Promise(resolve => setTimeout(resolve, 300)); // Reduzido de 500ms para 300ms
        }
        
        this.ocultarLoadingMarcas();
        console.log('✅ Busca de marcas e categorias concluída!');
    }

    static async buscarDadosCompletosProduto(asin) {
        if (!asin) return {};
        
        try {
            const url = `https://www.amazon.com.br/dp/${asin}`;
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const dados = {};
            
            // 1. Buscar marca (múltiplas estratégias)
            dados.marca = this.extrairMarcaAvancada(doc);
            
            // 2. Buscar categoria do breadcrumb
            dados.categoria = this.extrairCategoriaBreadcrumb(doc);
            
            // 3. Buscar informações adicionais
            dados.informacoesAdicionais = this.extrairInformacoesAdicionais(doc);
            
            // 4. Buscar especificações técnicas
            dados.especificacoes = this.extrairEspecificacoes(doc);
            
            // 5. Buscar informações de vendas
            dados.infoVendas = this.extrairInfoVendas(doc);
            
            // 6. Buscar avaliações detalhadas
            dados.avaliacoesDetalhadas = this.extrairAvaliacoesDetalhadas(doc);
            
            console.log(`✅ Dados completos extraídos para ${asin}:`, {
                marca: dados.marca,
                categoria: dados.categoria,
                temInfoAdicional: !!dados.informacoesAdicionais,
                temEspecificacoes: !!dados.especificacoes,
                temInfoVendas: !!dados.infoVendas,
                temAvaliacoesDetalhadas: !!dados.avaliacoesDetalhadas
            });
            
            return dados;
            
        } catch (error) {
            console.error(`❌ Erro ao buscar dados completos do produto ${asin}:`, error);
            return {};
        }
    }

    static extrairMarcaAvancada(doc) {
        // Estratégia 1: bylineInfo (mais confiável)
        const bylineInfo = doc.getElementById('bylineInfo');
        if (bylineInfo) {
            const texto = bylineInfo.textContent.trim();
            const match = texto.match(/Marca:\s*([^,\n]+)/i);
            if (match) {
                console.log(`✅ Marca extraída do bylineInfo: ${match[1]}`);
                return match[1].trim();
            }
        }
        
        // Estratégia 2: Product Information
        const productInfo = doc.querySelector('[data-feature-name="productInformation"]');
        if (productInfo) {
            const marcaElement = productInfo.querySelector('td:contains("Marca")');
            if (marcaElement) {
                const marca = marcaElement.nextElementSibling?.textContent.trim();
                if (marca) {
                    console.log(`✅ Marca extraída do Product Information: ${marca}`);
                    return marca;
                }
            }
        }
        
        // Estratégia 3: Technical Details
        const techDetails = doc.querySelector('#productDetails_techSpec_section_1');
        if (techDetails) {
            const rows = techDetails.querySelectorAll('tr');
            for (const row of rows) {
                const label = row.querySelector('th')?.textContent.trim();
                if (label && label.toLowerCase().includes('marca')) {
                    const value = row.querySelector('td')?.textContent.trim();
                    if (value) {
                        console.log(`✅ Marca extraída do Technical Details: ${value}`);
                        return value;
                    }
                }
            }
        }
        
        // Estratégia 4: Product Details
        const productDetails = doc.querySelector('#productDetails_detailBullets_sections1');
        if (productDetails) {
            const rows = productDetails.querySelectorAll('tr');
            for (const row of rows) {
                const label = row.querySelector('th')?.textContent.trim();
                if (label && label.toLowerCase().includes('marca')) {
                    const value = row.querySelector('td')?.textContent.trim();
                    if (value) {
                        console.log(`✅ Marca extraída do Product Details: ${value}`);
                        return value;
                    }
                }
            }
        }
        
        // Estratégia 5: Breadcrumb navigation
        const breadcrumbs = doc.querySelector('#wayfinding-breadcrumbs_feature_div');
        if (breadcrumbs) {
            const links = breadcrumbs.querySelectorAll('a');
            for (const link of links) {
                const texto = link.textContent.trim();
                if (texto && !texto.includes('Amazon') && !texto.includes('Todos') && texto.length > 2) {
                    console.log(`✅ Possível marca extraída do breadcrumb: ${texto}`);
                    return texto;
                }
            }
        }
        
        console.log('⚠️ Marca não encontrada com nenhuma estratégia');
        return 'N/A';
    }

    static extrairInformacoesAdicionais(doc) {
        const info = {};
        
        // Buscar dimensões
        const dimensoes = doc.querySelector('[data-feature-name="productDimensions"]');
        if (dimensoes) {
            info.dimensoes = dimensoes.textContent.trim();
        }
        
        // Buscar peso
        const peso = doc.querySelector('[data-feature-name="itemWeight"]');
        if (peso) {
            info.peso = peso.textContent.trim();
        }
        
        // Buscar material
        const material = doc.querySelector('[data-feature-name="material"]');
        if (material) {
            info.material = material.textContent.trim();
        }
        
        return Object.keys(info).length > 0 ? info : null;
    }

    static extrairEspecificacoes(doc) {
        const specs = {};
        
        // Technical Details
        const techSection = doc.querySelector('#productDetails_techSpec_section_1');
        if (techSection) {
            const rows = techSection.querySelectorAll('tr');
            for (const row of rows) {
                const label = row.querySelector('th')?.textContent.trim();
                const value = row.querySelector('td')?.textContent.trim();
                if (label && value) {
                    specs[label] = value;
                }
            }
        }
        
        return Object.keys(specs).length > 0 ? specs : null;
    }

    static extrairInfoVendas(doc) {
        const info = {};
        
        // Buscar BSR na tabela de detalhes do produto
        const bsrTable = doc.querySelector('#productDetails_detailBullets_sections1');
        if (bsrTable) {
            const rows = bsrTable.querySelectorAll('tr');
            
            for (const row of rows) {
                const header = row.querySelector('th')?.textContent.trim();
                
                if (header && header.includes('Ranking dos mais vendidos')) {
                    const td = row.querySelector('td');
                    if (td) {
                        const ul = td.querySelector('ul.a-unordered-list');
                        if (ul) {
                            const lis = ul.querySelectorAll('li');
                            
                            // Array para armazenar todos os rankings
                            info.rankings = [];
                            
                            lis.forEach((li, index) => {
                                const texto = li.textContent.trim();
                                const match = texto.match(/Nº\s*([\d.,]+)/);
                                
                                if (match) {
                                    const numeroOriginal = match[1];
                                    const bsr = parseInt(numeroOriginal.replace(/[.,]/g, ''));
                                    
                                    // Extrair categoria
                                    const categoriaMatch = texto.match(/em\s+([^(]+)/);
                                    const categoria = categoriaMatch ? categoriaMatch[1].trim() : 'N/A';
                                    
                                    const ranking = {
                                        posicao: bsr,
                                        categoria: categoria,
                                        tipo: index === 0 ? 'geral' : index === 1 ? 'especifico' : 'terceiro'
                                    };
                                    
                                    info.rankings.push(ranking);
                                    
                                    // Manter compatibilidade com código existente
                                    if (index === 0) {
                                        info.bsrGeral = bsr;
                                        info.categoriaGeral = categoria;
                                        console.log(`✅ BSR Geral extraído: #${bsr} em ${categoria}`);
                                    } else if (index === 1) {
                                        info.bsrEspecifico = bsr;
                                        info.categoriaEspecifica = categoria;
                                        console.log(`✅ BSR Específico extraído: #${bsr} em ${categoria}`);
                                    } else if (index === 2) {
                                        info.bsrTerceiro = bsr;
                                        info.categoriaTerceira = categoria;
                                        console.log(`✅ BSR Terceiro extraído: #${bsr} em ${categoria}`);
                                    }
                                }
                            });
                            
                            console.log(`📊 Total de rankings extraídos: ${info.rankings.length}`);
                        }
                    }
                    break; // Encontrou a linha, pode sair do loop
                }
            }
        }
        
        // Buscar data de lançamento
        const dataLancamento = doc.querySelector('[data-feature-name="releaseDate"]');
        if (dataLancamento) {
            info.dataLancamento = dataLancamento.textContent.trim();
        }
        
        // Buscar data de lançamento na tabela
        if (!info.dataLancamento) {
            const bsrTable = doc.querySelector('#productDetails_detailBullets_sections1');
            if (bsrTable) {
                const rows = bsrTable.querySelectorAll('tr');
                
                for (const row of rows) {
                    const header = row.querySelector('th')?.textContent.trim();
                    
                    if (header && header.includes('Disponível para compra desde')) {
                        const td = row.querySelector('td');
                        if (td) {
                            info.dataLancamento = td.textContent.trim();
                            console.log(`✅ Data de lançamento extraída: ${info.dataLancamento}`);
                        }
                        break;
                    }
                }
            }
        }
        
        return Object.keys(info).length > 0 ? info : null;
    }

    static extrairAvaliacoesDetalhadas(doc) {
        const avaliacoes = {};
        
        // Rating geral
        const ratingElement = doc.querySelector('#acrPopover');
        if (ratingElement) {
            const ratingText = ratingElement.getAttribute('title');
            const match = ratingText.match(/(\d+\.?\d*)/);
            if (match) {
                avaliacoes.rating = parseFloat(match[1]);
            }
        }
        
        // Número de avaliações
        const numAvaliacoesElement = doc.querySelector('#acrCustomerReviewText');
        if (numAvaliacoesElement) {
            const texto = numAvaliacoesElement.textContent;
            const match = texto.match(/(\d+(?:,\d+)*)/);
            if (match) {
                avaliacoes.numAvaliacoes = parseInt(match[1].replace(/,/g, ''));
            }
        }
        
        return Object.keys(avaliacoes).length > 0 ? avaliacoes : null;
    }

    static extrairCategoriaBreadcrumb(doc) {
        // Buscar breadcrumb navigation
        const breadcrumb = doc.querySelector('ul.a-unordered-list.a-horizontal.a-size-small');
        
        if (breadcrumb) {
            const links = breadcrumb.querySelectorAll('a.a-link-normal.a-color-tertiary');
            
            if (links.length > 0) {
                // Pegar o último link (categoria mais específica)
                const ultimoLink = links[links.length - 1];
                const categoria = ultimoLink.textContent.trim();
                
                console.log(`✅ Categoria extraída do breadcrumb: ${categoria}`);
                return categoria;
            }
        }
        
        // Estratégia alternativa: buscar em outros elementos
        const categoriaElement = doc.querySelector('[data-feature-name="category"]');
        if (categoriaElement) {
            const categoria = categoriaElement.textContent.trim();
            console.log(`✅ Categoria extraída de data-feature-name: ${categoria}`);
            return categoria;
        }
        
        // Estratégia alternativa: buscar no título da página
        const titleElement = doc.querySelector('title');
        if (titleElement) {
            const title = titleElement.textContent;
            // Tentar extrair categoria do título
            const match = title.match(/em\s+([^|]+)/i);
            if (match) {
                const categoria = match[1].trim();
                console.log(`✅ Categoria extraída do título: ${categoria}`);
                return categoria;
            }
        }
        
        console.log('⚠️ Categoria não encontrada no breadcrumb');
        return 'N/A';
    }

    static mostrarLoadingMarcas(total) {
        // Usar o modal principal em vez de criar um elemento separado
        const modal = document.getElementById('amazon-analyzer-modal');
        if (!modal) {
            console.warn('⚠️ Modal principal não encontrado, criando loading separado');
            this.mostrarLoadingMarcasFallback(total);
            return;
        }
        
        // Criar overlay de loading dentro do modal
        let loadingOverlay = document.getElementById('loading-marcas-overlay');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-marcas-overlay';
            loadingOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                backdrop-filter: blur(5px);
            `;
            modal.appendChild(loadingOverlay);
        }
        
        loadingOverlay.innerHTML = `
            <div style="
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                min-width: 350px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            ">
                <div style="margin-bottom: 20px;">
                    <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">🔍 Buscando marcas e categorias...</div>
                <div style="font-size: 14px; opacity: 0.8; margin-bottom: 15px;">Processando ${total} produtos</div>
                <div style="margin-top: 15px;">
                    <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div id="progresso-marcas" style="background: #3b82f6; height: 100%; width: 0%; transition: width 0.3s;"></div>
                    </div>
                </div>
                <div id="contador-marcas" style="font-size: 12px; margin-top: 8px; opacity: 0.7;">0 / ${total}</div>
                <div style="font-size: 11px; margin-top: 10px; opacity: 0.6;">Extraindo marcas e categorias das páginas dos produtos</div>
            </div>
        `;
        
        // Adicionar CSS para animação se não existir
        if (!document.getElementById('loading-css')) {
            const style = document.createElement('style');
            style.id = 'loading-css';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log('✅ Loading de marcas integrado ao modal principal');
    }

    static mostrarLoadingMarcasFallback(total) {
        // Fallback para quando o modal principal não existe
        let loadingElement = document.getElementById('loading-marcas');
        
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.id = 'loading-marcas';
            loadingElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 10000;
                font-family: 'Poppins', sans-serif;
                text-align: center;
                min-width: 300px;
            `;
            document.body.appendChild(loadingElement);
        }
        
        loadingElement.innerHTML = `
            <div style="margin-bottom: 15px;">
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">🔍 Buscando marcas e categorias...</div>
            <div style="font-size: 14px; opacity: 0.8;">Processando ${total} produtos</div>
            <div style="margin-top: 10px;">
                <div style="background: #333; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div id="progresso-marcas" style="background: #3b82f6; height: 100%; width: 0%; transition: width 0.3s;"></div>
                </div>
            </div>
            <div id="contador-marcas" style="font-size: 12px; margin-top: 5px; opacity: 0.7;">0 / ${total}</div>
            <div style="font-size: 11px; margin-top: 8px; opacity: 0.6;">Extraindo marcas e categorias das páginas dos produtos</div>
        `;
        
        // Adicionar CSS para animação
        if (!document.getElementById('loading-css')) {
            const style = document.createElement('style');
            style.id = 'loading-css';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    static atualizarProgressoMarcas(processados, total) {
        const progressoElement = document.getElementById('progresso-marcas');
        const contadorElement = document.getElementById('contador-marcas');
        
        if (progressoElement && contadorElement) {
            const percentual = (processados / total) * 100;
            progressoElement.style.width = `${percentual}%`;
            contadorElement.textContent = `${processados} / ${total}`;
        }
    }

    static ocultarLoadingMarcas() {
        // Remover overlay do modal principal
        const loadingOverlay = document.getElementById('loading-marcas-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
            console.log('✅ Loading de marcas removido do modal principal');
            return;
        }
        
        // Fallback: remover elemento separado
        const loadingElement = document.getElementById('loading-marcas');
        if (loadingElement) {
            loadingElement.remove();
            console.log('✅ Loading de marcas separado removido');
        }
    }

    static async analisarProdutosCompleto(produtos, atualizarCallback) {
        console.log('🚀 Iniciando análise completa dos produtos...');
        
        // Primeiro, buscar detalhes básicos (ranking, categoria, etc.)
        await this.buscarDetalhesEmParalelo(produtos, atualizarCallback);
        
        // Depois, buscar marcas faltantes
        await this.buscarMarcasFaltantes(produtos, atualizarCallback);
        
        // Atualizar métricas finais
        TableManager.atualizarMetricas(produtos);
        
        console.log('✅ Análise completa finalizada');
        NotificationManager.sucesso('Análise completa finalizada!');
    }
}

window.ProductAnalyzer = ProductAnalyzer; 