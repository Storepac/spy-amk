class ProductExtractor {
    static async extrairDetalhesProduto(url) {
        console.info("Extraindo detalhes do produto:", url);
        let marca = '';
        let asin = '';
        
        try {
            // Extrair ASIN da URL
            const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
            if (asinMatch) {
                asin = asinMatch[1];
            }
            
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Buscar marca - múltiplas estratégias
            marca = this.extrairMarca(doc);

            // Buscar Ranking dos mais vendidos e categoria
            const rankingData = this.extrairRankingECategoria(doc);
            
            // Buscar categoria do breadcrumb
            const categoriaBreadcrumb = this.extrairCategoria(doc);
            
            // Buscar preço
            const precoData = this.extrairPreco(doc);
            
            // Buscar título
            const titulo = doc.querySelector('#productTitle')?.textContent.trim() || '';
            
            // Buscar vendas
            const vendasData = this.extrairVendas(doc);
            
            // Buscar imagem
            const imagem = this.extrairImagem(doc);

            return {
                asin,
                marca,
                titulo,
                preco: precoData.preco,
                precoNumerico: precoData.precoNumerico,
                vendas: vendasData.vendas,
                receitaMes: precoData.precoNumerico * vendasData.vendas,
                ranking: rankingData.ranking,
                categoria: categoriaBreadcrumb || rankingData.categoria,
                rankingSecundario: rankingData.rankingSecundario,
                categoriaSecundaria: rankingData.categoriaSecundaria,
                imagem: imagem
            };
        } catch (error) {
            console.error('Erro ao buscar detalhes do produto:', error);
            return null;
        }
    }

    static extrairMarca(doc) {
        let marca = '';
        
        // Estratégia 1: Byline info - estratégia específica mencionada pelo usuário
        const bylineInfo = doc.querySelector('#bylineInfo');
        if (bylineInfo) {
            const marcaText = bylineInfo.textContent.trim();
            if (marcaText.startsWith('Marca:')) {
                marca = marcaText.replace('Marca:', '').trim();
            } else {
                const marcaMatch = marcaText.match(/Marca:\s*([^]+)/);
                if (marcaMatch) {
                    marca = marcaMatch[1].trim();
                } else {
                    // Se não encontrar "Marca:", pegar o texto completo
                    marca = marcaText;
                }
            }
            console.log('Marca extraída do bylineInfo:', marca);
        }
        
        // Estratégia 2: "Vendido por" - novo seletor baseado no HTML fornecido
        if (!marca) {
            const vendidoPorElement = doc.querySelector('.offer-display-feature-text-message');
            if (vendidoPorElement) {
                marca = vendidoPorElement.textContent.trim();
                console.log('Marca extraída do vendido por:', marca);
            }
        }
        
        // Estratégia 3: Buscar por "Vendido por" em elementos específicos
        if (!marca) {
            const merchantElements = doc.querySelectorAll('.offer-display-feature-text');
            for (const element of merchantElements) {
                const labelElement = element.previousElementSibling;
                if (labelElement && labelElement.textContent.includes('Vendido por')) {
                    const marcaElement = element.querySelector('.offer-display-feature-text-message');
                    if (marcaElement) {
                        marca = marcaElement.textContent.trim();
                        console.log('Marca extraída de merchant elements:', marca);
                        break;
                    }
                }
            }
        }
        
        // Estratégia 4: Tabela de especificações
        if (!marca) {
            const marcaRow = doc.querySelector('tr.po-brand td:nth-child(2) span');
            if (marcaRow) {
                marca = marcaRow.textContent.trim();
                console.log('Marca extraída da tabela de especificações:', marca);
            }
        }
        
        // Estratégia 5: Buscar por "Marca" em qualquer tabela
        if (!marca) {
                const rows = doc.querySelectorAll('table tr');
                for (const row of rows) {
                const labelCell = row.querySelector('td:first-child span, th');
                if (labelCell && labelCell.textContent.trim().toLowerCase().includes('marca')) {
                    const valueCell = row.querySelector('td:nth-child(2) span, td:nth-child(2)');
                        if (valueCell) {
                            marca = valueCell.textContent.trim();
                        console.log('Marca extraída de tabela genérica:', marca);
                            break;
                        }
                    }
                }
        }
        
        // Estratégia 6: Brand link
        if (!marca) {
            const brandLink = doc.querySelector('a[href*="/brand/"]');
            if (brandLink) {
                marca = brandLink.textContent.trim();
                console.log('Marca extraída do brand link:', marca);
            }
        }
        
        // Estratégia 7: Buscar em elementos com classe específica
        if (!marca) {
            const marcaElements = doc.querySelectorAll('.a-section.a-spacing-none');
            for (const element of marcaElements) {
                const link = element.querySelector('a#bylineInfo');
                if (link) {
                    const linkText = link.textContent.trim();
                    if (linkText.includes('Marca:')) {
                        marca = linkText.replace('Marca:', '').trim();
                        console.log('Marca extraída de a-section:', marca);
                        break;
                    }
                }
            }
        }
        
        // Estratégia 8: Buscar por qualquer elemento que contenha "Marca:"
                if (!marca) {
            const allElements = doc.querySelectorAll('*');
            for (const element of allElements) {
                if (element.textContent && element.textContent.includes('Marca:')) {
                    const marcaMatch = element.textContent.match(/Marca:\s*([^]+)/);
                    if (marcaMatch) {
                        marca = marcaMatch[1].trim();
                        console.log('Marca extraída de elemento genérico:', marca);
                        break;
                        }
                    }
                }
            }

        return marca;
    }

    static extrairRankingECategoria(doc) {
            let ranking = '';
            let categoria = '';
            let rankingSecundario = '';
            let categoriaSecundaria = '';
            
        // Estratégia 1: Product details table - seletores corretos
            const rankingTable = doc.querySelector('#productDetails_detailBullets_sections1');
            if (rankingTable) {
                const rows = rankingTable.querySelectorAll('tr');
                for (const row of rows) {
                    const labelCell = row.querySelector('th');
                if (labelCell && labelCell.textContent.trim().includes('Ranking dos mais vendidos')) {
                        const valueCell = row.querySelector('td');
                        if (valueCell) {
                            const rankingText = valueCell.textContent.trim();
                        console.log('Ranking text encontrado:', rankingText);
                        
                        // Extrair rankings da lista
                        const listItems = valueCell.querySelectorAll('li');
                        if (listItems.length > 0) {
                            for (let i = 0; i < listItems.length; i++) {
                                const itemText = listItems[i].textContent.trim();
                                const rankingMatch = itemText.match(/Nº\s*([\d.,]+)\s*em\s*([^(]+)/);
                                if (rankingMatch) {
                                    const pos = rankingMatch[1].replace(/\./g, '');
                                    const cat = rankingMatch[2].trim();
                                    
                                    if (i === 0) {
                                        ranking = pos;
                                        categoria = cat;
                                    } else if (i === 1) {
                                        rankingSecundario = pos;
                                        categoriaSecundaria = cat;
                                    }
                                }
                            }
                        } else {
                            // Fallback para texto direto
                            const rankings = rankingText.split(/\n|\r\n/).filter(line => line.trim());
                            for (let i = 0; i < rankings.length; i++) {
                                const rankingMatch = rankings[i].match(/Nº\s*([\d.,]+)\s*em\s*([^(]+)/);
                                if (rankingMatch) {
                                    const pos = rankingMatch[1].replace(/\./g, '');
                                    const cat = rankingMatch[2].trim();
                                    
                                    if (i === 0) {
                                        ranking = pos;
                                        categoria = cat;
                                    } else if (i === 1) {
                                        rankingSecundario = pos;
                                        categoriaSecundaria = cat;
                                    }
                                }
                            }
                        }
                            break;
                        }
                    }
                }
            }
        
        // Estratégia 2: Alternative ranking section
        if (!ranking) {
            const rankingSection = doc.querySelector('[data-feature-name="cr-dp-bestsellers-rank"]');
            if (rankingSection) {
                const rankingText = rankingSection.textContent;
                const rankingMatch = rankingText.match(/Nº\s*([\d.,]+)\s*em\s*([^(]+)/);
                if (rankingMatch) {
                    ranking = rankingMatch[1].replace(/\./g, '');
                    categoria = rankingMatch[2].trim();
                }
            }
        }
        
        return { ranking, categoria, rankingSecundario, categoriaSecundaria };
    }

    static extrairPreco(doc) {
        let preco = '';
        let precoNumerico = 0;
        
        // Estratégia 1: Preço principal
            const precoElement = doc.querySelector('.a-price .a-offscreen');
        if (precoElement) {
            preco = precoElement.textContent.trim();
        }
        
        // Estratégia 2: Preço alternativo
        if (!preco) {
            const precoAlt = doc.querySelector('.a-price-whole');
            if (precoAlt) {
                preco = precoAlt.textContent.trim();
            }
        }
        
        // Converter para número
        if (preco) {
            precoNumerico = parseFloat(preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        }
        
        return { preco, precoNumerico };
    }

    static extrairVendas(doc) {
        let vendas = 0;
        
        // Estratégia 1: Elemento de vendas
            const vendidosElement = doc.querySelector('.a-color-secondary');
        if (vendidosElement) {
            const vendidosTexto = vendidosElement.textContent;
            if (vendidosTexto.includes('compras')) {
                const numeroMatch = vendidosTexto.match(/(\d+)/);
                const numero = parseInt(numeroMatch?.[1] || '0');
                
                if (vendidosTexto.includes('mil')) {
                    vendas = numero * 1000;
                } else if (vendidosTexto.includes('milhão')) {
                    vendas = numero * 1000000;
                } else {
                    vendas = numero;
                }
            }
        }
        
        return { vendas };
    }

    static extrairImagem(doc) {
        // Estratégia 1: Imagem principal
        const imagemElement = doc.querySelector('#landingImage');
        if (imagemElement) {
            return imagemElement.src;
        }
        
        // Estratégia 2: Imagem alternativa
        const imagemAlt = doc.querySelector('.a-dynamic-image');
        if (imagemAlt) {
            return imagemAlt.src;
        }
        
        return '';
    }

    static extrairDadosProduto(elemento) {
        const dados = {
            asin: elemento.getAttribute('data-asin'),
            titulo: elemento.querySelector('h2 span')?.textContent?.trim() || '',
            precoElement: elemento.querySelector('.a-price .a-offscreen'),
            preco: elemento.querySelector('.a-price .a-offscreen')?.textContent?.trim() || '',
            precoNumerico: 0,
            avaliacaoElement: elemento.querySelector('.a-icon-alt'),
            avaliacao: '',
            avaliacaoNumerica: 0,
            numAvaliacoesElement: elemento.querySelector('a[aria-label*="classificações"]'),
            numAvaliacoes: 0,
            imagemElement: elemento.querySelector('.s-image'),
            imagem: '',
            linkElement: elemento.querySelector('a.a-link-normal.s-link-style.a-text-normal'),
            link: '',
            vendidosElement: elemento.querySelector('.a-color-secondary'),
            vendidos: 0,
            patrocinado: elemento.querySelector('.puis-sponsored-label-text') !== null,
            posicaoMatch: elemento.getAttribute('data-cel-widget')?.match(/search_result_(\d+)/),
            posicao: '',
            marca: '',
            categoria: '',
            categoriaSecundaria: '',
            ranking: '',
            rankingSecundario: '',
            receitaMes: 0
        };
        
        // Extrair ASIN da URL se não estiver no data-asin
        if (!dados.asin) {
            const linkRelativo = dados.linkElement?.getAttribute('href') || '';
            const asinMatch = linkRelativo.match(/\/dp\/([A-Z0-9]{10})/);
            if (asinMatch) {
                dados.asin = asinMatch[1];
            }
        }
        
        // Extrair imagem - melhorado para pegar a imagem correta
        const imagemElement = elemento.querySelector('.s-image');
        if (imagemElement) {
            dados.imagem = imagemElement.src || '';
            // Se não tem src, tentar srcset
            if (!dados.imagem && imagemElement.srcset) {
                const srcsetMatch = imagemElement.srcset.match(/([^\s]+)/);
                if (srcsetMatch) {
                    dados.imagem = srcsetMatch[1];
                }
            }
        }
        
        // Extrair marca do byline
        const bylineInfo = elemento.querySelector('.a-size-base.a-color-secondary');
        if (bylineInfo && bylineInfo.textContent.includes('Marca:')) {
            const marcaText = bylineInfo.textContent.trim();
            dados.marca = marcaText.startsWith('Marca:') ? marcaText.replace('Marca:', '').trim() : '';
        }
        
        // Calcular preço numérico
        dados.precoNumerico = parseFloat(dados.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        
        // Extrair avaliação
        const avaliacaoMatch = dados.avaliacaoElement?.textContent?.match(/(\d+,\d+)/);
        dados.avaliacao = avaliacaoMatch ? avaliacaoMatch[1] : '';
        dados.avaliacaoNumerica = parseFloat(dados.avaliacao.replace(',', '.')) || 0;
        
        // Extrair número de avaliações
        dados.numAvaliacoes = parseInt(dados.numAvaliacoesElement?.getAttribute('aria-label')?.match(/(\d+)/)?.[1] || '0');
        
        // Construir link completo
        const linkRelativo = dados.linkElement?.getAttribute('href') || '';
        dados.link = linkRelativo ? `https://www.amazon.com.br${linkRelativo}` : '';
        
        // Extrair vendas
        const vendidosTexto = dados.vendidosElement?.textContent || '';
        if (vendidosTexto.includes('compras')) {
            const numeroMatch = vendidosTexto.match(/(\d+)/);
            const numero = parseInt(numeroMatch?.[1] || '0');
            
            if (vendidosTexto.includes('mil')) {
                dados.vendidos = numero * 1000;
            } else if (vendidosTexto.includes('milhão')) {
                dados.vendidos = numero * 1000000;
            } else {
                dados.vendidos = numero;
            }
        }
        
        // Calcular receita mensal
        dados.receitaMes = dados.precoNumerico * dados.vendidos;
        
        // Extrair posição
        dados.posicao = dados.posicaoMatch ? dados.posicaoMatch[1] : '';
        
        return dados;
    }

    static extrairCategoria(doc) {
        let categoria = '';
        
        // Estratégia 1: Breadcrumb navigation - baseado no HTML fornecido
        const breadcrumbList = doc.querySelector('ul.a-unordered-list.a-horizontal.a-size-small');
        if (breadcrumbList) {
            const breadcrumbItems = breadcrumbList.querySelectorAll('li .a-list-item a');
            if (breadcrumbItems.length > 0) {
                // Pegar a última categoria (mais específica)
                categoria = breadcrumbItems[breadcrumbItems.length - 1].textContent.trim();
            }
        }
        
        // Estratégia 2: Se não encontrou no breadcrumb, usar a do ranking
        if (!categoria) {
            const rankingData = this.extrairRankingECategoria(doc);
            categoria = rankingData.categoria;
        }
        
        return categoria;
    }
}

window.ProductExtractor = ProductExtractor; 