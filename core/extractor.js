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
            
            // Buscar vendedor
            const vendedorData = this.extrairVendedor(doc);

            return {
                asin,
                marca,
                vendedor: vendedorData.vendedor,
                linkVendedor: vendedorData.linkVendedor,
                titulo,
                preco: precoData.preco,
                precoNumerico: precoData.precoNumerico,
                vendas: vendasData.vendas,
                vendasTextoOriginal: vendasData.textoOriginal,
                vendasSeletorUsado: vendasData.seletorUsado,
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

        // Aplicar limpeza final na marca
        if (marca) {
            marca = this.limparTextoMarca(marca);
        }
        
        return marca;
    }
    
    // Função helper para limpar texto da marca
    static limparTextoMarca(texto) {
        if (!texto) return '';
        
        return texto
            .replace(/Visite a loja\s*/gi, '')
            .replace(/Visitar a loja\s*/gi, '')
            .replace(/Visit.*store\s*/gi, '')
            .replace(/Marca:\s*/gi, '')
            .split('|')[0] // Remove qualquer texto após o pipe
            .trim();
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
        let textoEncontrado = '';
        let seletorUsado = '';
        
        // Múltiplos seletores para capturar vendas baseados na estrutura HTML fornecida
        const seletoresVendas = [
            // Seletores específicos baseados no HTML de exemplo fornecido
            '#social-proofing-faceout-title-tk_bought .a-text-bold',
            '#social-proofing-faceout-title-tk_bought',
            '.social-proofing-faceout-title-text .a-text-bold',
            '.social-proofing-faceout-title-text',
            
            // Seletores do container principal
            '#socialProofingAsinFaceout_feature_div .a-text-bold',
            '.social-proofing-faceout .a-text-bold',
            '.social-proofing-faceout-title .a-text-bold',
            
            // Seletores alternativos para diferentes estruturas
            '.social-proofing-faceout-title',
            '.social-proofing-faceout',
            '#social-proofing-badge_feature_div',
            
            // Seletores mais genéricos para fallback
            '[class*="social-proofing"] .a-text-bold',
            '[id*="social-proofing"] .a-text-bold',
            '.a-size-small.social-proofing-faceout-title-text',
            
            // Seletores amplos como último recurso
            '.a-color-secondary',
            '.a-size-small',
            '.a-spacing-micro',
            '.a-section'
        ];
        
        console.log('🔍 Iniciando extração de vendas...');
        
        for (const seletor of seletoresVendas) {
            const elementos = doc.querySelectorAll(seletor);
            
            for (const elemento of elementos) {
                const texto = elemento.textContent?.trim() || '';
                
                // Verificar se o texto contém indicadores de vendas/compras
                if (this.contemIndicadorVendas(texto)) {
                    textoEncontrado = texto;
                    seletorUsado = seletor;
                    vendas = this.extrairNumeroVendas(texto);
                    
                    if (vendas > 0) {
                        console.log(`✅ Vendas encontradas: ${vendas} (texto: "${texto}", seletor: "${seletor}")`);
                        return { vendas, textoOriginal: textoEncontrado, seletorUsado };
                    }
                }
            }
        }
        
        console.log(`⚠️ Nenhuma venda encontrada. Último texto analisado: "${textoEncontrado}"`);
        return { vendas: 0, textoOriginal: textoEncontrado, seletorUsado };
    }
    
    // Função auxiliar para verificar se o texto contém indicadores de vendas
    static contemIndicadorVendas(texto) {
        const indicadores = [
            'compras',
            'vendidos',
            'vendas',
            'comprado',
            'bought',
            'purchased',
            'sold'
        ];
        
        const textoLower = texto.toLowerCase();
        return indicadores.some(indicador => textoLower.includes(indicador));
    }
    
    // Função auxiliar robusta para extrair números de vendas do texto
    static extrairNumeroVendas(texto) {
        console.log(`🔍 Analisando texto: "${texto}"`);
        
        // Limpar texto - remover &nbsp; e normalizar espaços
        const textoLimpo = texto
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
        
        console.log(`🧹 Texto limpo: "${textoLimpo}"`);
        
        // Padrões para capturar diferentes formatos
        const padroes = [
            // "Mais de 4 mil compras", "Acima de 500 compras"
            /(?:mais de|acima de|above|over)\s*(\d+(?:[.,]\d+)?)\s*(mil|milhão|thousand|million|k|m)/i,
            
            // "4+ mil compras", "500+ compras"
            /(\d+(?:[.,]\d+)?)\s*\+\s*(mil|milhão|thousand|million|k|m)/i,
            
            // "4 mil compras", "2,5 mil compras"
            /(\d+(?:[.,]\d+)?)\s*(mil|milhão|thousand|million|k|m)/i,
            
            // "Mais de 4.000 compras" (número já expandido)
            /(?:mais de|acima de|above|over)\s*(\d+(?:[.,]\d+)*)/i,
            
            // "4.000+ compras", "500+ compras"
            /(\d+(?:[.,]\d+)*)\s*\+/i,
            
            // Números simples "1500 compras"
            /(\d+(?:[.,]\d+)*)/i
        ];
        
        for (let i = 0; i < padroes.length; i++) {
            const match = textoLimpo.match(padroes[i]);
            
            if (match) {
                console.log(`✅ Padrão ${i + 1} encontrado:`, match);
                
                let numero = parseFloat(match[1].replace(',', '.'));
                const multiplicador = match[2] ? match[2].toLowerCase() : '';
                
                // Aplicar multiplicadores
                if (multiplicador) {
                    if (multiplicador.includes('mil') || multiplicador === 'k' || multiplicador === 'thousand') {
                        numero = numero * 1000;
                    } else if (multiplicador.includes('milhão') || multiplicador === 'm' || multiplicador === 'million') {
                        numero = numero * 1000000;
                    }
                }
                
                // Para padrões com "mais de" ou "+", interpretar como valor mínimo
                // Podemos adicionar uma margem para estimativa mais realista
                if (textoLimpo.includes('mais de') || textoLimpo.includes('acima de') || textoLimpo.includes('+')) {
                    // Aplicar uma margem de 10% para "mais de X"
                    numero = Math.floor(numero * 1.1);
                }
                
                console.log(`🎯 Número final extraído: ${numero}`);
                return Math.floor(numero);
            }
        }
        
        console.log(`❌ Nenhum padrão encontrado no texto`);
        return 0;
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

    // Função específica para extrair vendas dos elementos da lista de produtos
    static extrairVendasDaLista(elemento) {
        let vendas = 0;
        let textoEncontrado = '';
        let seletorUsado = '';
        
        // Seletores específicos para o div de social proofing baseado no HTML fornecido
        const seletoresVendasLista = [
            '#socialProofingAsinFaceout_feature_div .a-text-bold',
            '#social-proofing-faceout-title-tk_bought .a-text-bold',
            '.social-proofing-faceout-title-text .a-text-bold',
            '.social-proofing-faceout .a-text-bold',
            '.social-proofing-faceout-title .a-text-bold',
            '#socialProofingAsinFaceout_feature_div',
            '#social-proofing-faceout-title-tk_bought',
            '.social-proofing-faceout-title-text',
            '.social-proofing-faceout',
            '.a-color-secondary',
            '.a-size-small',
            '.a-spacing-micro',
            '[class*="social-proofing"]',
            '.a-section',
            '.a-spacing-small'
        ];
        
        console.log('🔍 Procurando por div de social proofing na lista...');
        
        for (const seletor of seletoresVendasLista) {
            const elementos = elemento.querySelectorAll(seletor);
            
            for (const subElemento of elementos) {
                const texto = subElemento.textContent?.trim() || '';
                
                // Verificar se contém indicadores de vendas/compras
                if (this.contemIndicadorVendas(texto)) {
                    textoEncontrado = texto;
                    seletorUsado = seletor;
                    vendas = this.extrairNumeroVendas(texto);
                    
                    if (vendas > 0) {
                        console.log(`✅ Vendas encontradas na lista: ${vendas} (texto: "${texto}", seletor: "${seletor}")`);
                        return { vendas, textoOriginal: textoEncontrado, seletorUsado };
                    }
                }
            }
        }
        
        console.log('❌ Nenhum div de social proofing com vendas encontrado na lista');
        return { vendas: 0, textoOriginal: textoEncontrado, seletorUsado };
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
            patrocinado: false,
            organico: false,
            posicaoMatch: elemento.getAttribute('data-cel-widget')?.match(/search_result_(\d+)/),
            posicao: '',
            marca: '',
            vendedor: '',
            linkVendedor: '',
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
            let marcaBruta = marcaText.startsWith('Marca:') ? marcaText.replace('Marca:', '').trim() : '';
            dados.marca = this.limparTextoMarca(marcaBruta);
        }
        
        // Extrair vendedor - para produtos na lista, geralmente não há info de vendedor
        // Na lista de produtos da Amazon, essa info não está disponível
        // Deixamos vazio e será preenchido apenas na página individual do produto
        
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
        
        // Extrair vendas - usando a nova lógica robusta
        const vendasData = this.extrairVendasDaLista(elemento);
        dados.vendidos = vendasData.vendas;
        dados.vendidosTextoOriginal = vendasData.textoOriginal;
        dados.vendidosSeletorUsado = vendasData.seletorUsado;
        
        // Melhorar detecção de produtos patrocinados
        const patrocinadoSelectors = [
            '.puis-sponsored-label-text',
            '[data-component-type="sp-sponsored-result"]',
            '.s-sponsored-label-info-icon',
            '.a-color-secondary:contains("Patrocinado")',
            '.a-color-secondary:contains("Sponsored")'
        ];
        
        dados.patrocinado = patrocinadoSelectors.some(selector => {
            try {
                return elemento.querySelector(selector) !== null;
            } catch (e) {
                return false;
            }
        });
        
        // Produto é orgânico se não é patrocinado
        dados.organico = !dados.patrocinado;
        
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

    static extrairVendedor(doc) {
        let vendedor = '';
        let linkVendedor = '';
        
        console.log('🔍 [EXTRATOR-VENDEDOR] Iniciando extração de vendedor...');
        
        // Estratégia 1: Buscar pelo ID sellerProfileTriggerId (vendedores terceiros)
        const vendedorLink = doc.querySelector('#sellerProfileTriggerId');
        if (vendedorLink) {
            vendedor = vendedorLink.textContent.trim();
            linkVendedor = vendedorLink.href || '';
            console.log('✅ [EXTRATOR-VENDEDOR] Vendedor extraído via sellerProfileTriggerId:', vendedor, 'Link:', linkVendedor);
        }
        
        // Estratégia 2: Buscar por classe sellerProfileTriggerId
        if (!vendedor) {
            const vendedorElementClass = doc.querySelector('.sellerProfileTriggerId');
            if (vendedorElementClass) {
                vendedor = vendedorElementClass.textContent.trim();
                linkVendedor = vendedorElementClass.href || '';
                console.log('Vendedor extraído via classe sellerProfileTriggerId:', vendedor);
            }
        }
        
        // Estratégia 3: Buscar por span com classe offer-display-feature-text-message (Amazon)
        if (!vendedor) {
            const vendedorSpan = doc.querySelector('span.offer-display-feature-text-message');
            if (vendedorSpan && vendedorSpan.textContent.trim()) {
                vendedor = vendedorSpan.textContent.trim();
                console.log('Vendedor extraído via span offer-display-feature-text-message:', vendedor);
            }
        }
        
        // Estratégia 4: Buscar por link com classe offer-display-feature-text-message
        if (!vendedor) {
            const vendedorLinkGenerico = doc.querySelector('a.offer-display-feature-text-message');
            if (vendedorLinkGenerico) {
                vendedor = vendedorLinkGenerico.textContent.trim();
                linkVendedor = vendedorLinkGenerico.href || '';
                console.log('Vendedor extraído via link offer-display-feature-text-message:', vendedor);
            }
        }
        
        // Estratégia 5: Buscar qualquer elemento com classe offer-display-feature-text-message
        if (!vendedor) {
            const vendedorGenerico = doc.querySelector('.offer-display-feature-text-message');
            if (vendedorGenerico && vendedorGenerico.textContent.trim()) {
                vendedor = vendedorGenerico.textContent.trim();
                if (vendedorGenerico.href) {
                    linkVendedor = vendedorGenerico.href;
                }
                console.log('Vendedor extraído via classe genérica offer-display-feature-text-message:', vendedor);
            }
        }
        
        // Estratégia 6: Buscar em divs próximas se span estiver vazio
        if (!vendedor) {
            const spanVazio = doc.querySelector('span.offer-display-feature-text-message');
            if (spanVazio) {
                // Procurar no elemento pai ou irmãos
                const elementoPai = spanVazio.parentElement;
                if (elementoPai) {
                    const textoCompleto = elementoPai.textContent.trim();
                    // Remover texto comum e manter só o vendedor
                    const vendedorLimpo = textoCompleto
                        .replace(/Vendido por\s*/gi, '')
                        .replace(/Sold by\s*/gi, '')
                        .trim();
                    
                    if (vendedorLimpo && vendedorLimpo !== textoCompleto) {
                        vendedor = vendedorLimpo;
                        console.log('Vendedor extraído do elemento pai do span vazio:', vendedor);
                    }
                }
            }
        }
        
        // Estratégia 7: Fallback - buscar por qualquer elemento que contenha "Vendido por"
        if (!vendedor) {
            const vendidoPorElements = doc.querySelectorAll('*');
            for (const element of vendidoPorElements) {
                if (element.textContent && element.textContent.includes('Vendido por')) {
                    // Buscar o próximo elemento que pode conter o nome do vendedor
                    const nextElement = element.nextElementSibling;
                    if (nextElement) {
                        const vendedorText = nextElement.textContent.trim();
                        if (vendedorText && !vendedorText.includes('Vendido por')) {
                            vendedor = vendedorText;
                            console.log('Vendedor extraído (fallback):', vendedor);
                            break;
                        }
                    }
                }
            }
        }
        
        // Limpar o nome do vendedor
        if (vendedor) {
            vendedor = vendedor.replace(/^\s*,\s*/, '').trim(); // Remove vírgulas no início
        }
        
        // Log final
        if (vendedor) {
            console.log('✅ [EXTRATOR-VENDEDOR] Vendedor final extraído:', vendedor, linkVendedor ? 'com link' : 'sem link');
        } else {
            console.log('❌ [EXTRATOR-VENDEDOR] Nenhum vendedor encontrado na página');
            
            // Debug: mostrar elementos encontrados
            const spanEncontrado = doc.querySelector('span.offer-display-feature-text-message');
            const linkEncontrado = doc.querySelector('#sellerProfileTriggerId');
            const classeEncontrada = doc.querySelector('.sellerProfileTriggerId');
            
            console.log('🔍 [DEBUG] Elementos encontrados:', {
                spanOfferText: spanEncontrado ? spanEncontrado.outerHTML : 'não encontrado',
                sellerProfileId: linkEncontrado ? linkEncontrado.outerHTML : 'não encontrado',
                sellerProfileClass: classeEncontrada ? classeEncontrada.outerHTML : 'não encontrado'
            });
        }
        
        return { vendedor, linkVendedor };
    }
}

window.ProductExtractor = ProductExtractor; 