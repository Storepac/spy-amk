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
        
        // Seletores específicos APENAS para vendas - mais restritivos
        const seletoresVendas = [
            // Seletores específicos para social proof de vendas
            '#social-proofing-faceout-title-tk_bought .a-text-bold',
            '#social-proofing-faceout-title-tk_bought',
            '.social-proofing-faceout-title-text .a-text-bold',
            '.social-proofing-faceout-title-text',
            '#socialProofingAsinFaceout_feature_div .a-text-bold',
            '.social-proofing-faceout .a-text-bold',
            '.social-proofing-faceout-title .a-text-bold',
            
            // Novos seletores específicos para vendas (2025)
            '[data-cy="social-proofing-bought"] .a-text-bold',
            '[data-cy="social-proofing-bought"]',
            '[data-cy*="bought"] .a-text-bold',
            '[data-cy*="purchased"] .a-text-bold',
            
            // Seletores específicos de reviews que mencionam compras
            '#reviewsMedley .social-proofing .a-text-bold',
            '#reviewsMedley .social-proofing'
        ];
        
        console.log('🔍 Iniciando extração de vendas RESTRITIVA...');
        
        for (const seletor of seletoresVendas) {
            try {
                const elementos = doc.querySelectorAll(seletor);
                
                for (const elemento of elementos) {
                    const texto = elemento.textContent?.trim() || '';
                    
                    // Verificação MUITO mais restritiva
                    if (this.contemIndicadorVendasRestritivo(texto)) {
                        textoEncontrado = texto;
                        seletorUsado = seletor;
                        vendas = this.extrairNumeroVendasRestritivo(texto);
                        
                        if (vendas > 0) {
                            console.log(`✅ Vendas encontradas: ${vendas} (texto: "${texto}", seletor: "${seletor}")`);
                            return { vendas, textoOriginal: textoEncontrado, seletorUsado };
                        }
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao processar seletor "${seletor}":`, error.message);
                continue;
            }
        }
        
        // Busca alternativa RESTRITIVA: procurar apenas por frases específicas de vendas
        console.log('🔍 Iniciando busca restritiva por frases específicas de vendas...');
        const bodyText = doc.body?.textContent || '';
        const vendasPorTexto = this.buscarVendasNoTextoRestritivo(bodyText);
        
        if (vendasPorTexto.vendas > 0) {
            console.log(`✅ Vendas encontradas via busca de texto: ${vendasPorTexto.vendas}`);
            return vendasPorTexto;
        }
        
        console.log(`⚠️ Nenhuma venda encontrada. Produto sem dados de vendas visíveis.`);
        return { vendas: 0, textoOriginal: '', seletorUsado: 'sem-vendas' };
    }
    
    // Nova função RESTRITIVA para buscar vendas apenas em contexto específico
    static buscarVendasNoTextoRestritivo(texto) {
        // Dividir em frases menores para análise contextual
        const frases = texto.split(/[.!?;\n]/);
        
        for (const frase of frases) {
            const fraseTrim = frase.trim();
            
            // Só processar frases que claramente falam de vendas/compras
            if (this.contemIndicadorVendasRestritivo(fraseTrim)) {
                const vendas = this.extrairNumeroVendasRestritivo(fraseTrim);
                if (vendas > 0) {
                    console.log(`📝 Vendas encontradas no contexto: ${vendas} (frase: "${fraseTrim}")`);
                    return { 
                        vendas, 
                        textoOriginal: fraseTrim, 
                        seletorUsado: 'busca-contextual' 
                    };
                }
            }
        }
        
        return { vendas: 0, textoOriginal: '', seletorUsado: 'busca-contextual' };
    }
    
    // Função MUITO mais restritiva para verificar indicadores de vendas
    static contemIndicadorVendasRestritivo(texto) {
        const textoLower = texto.toLowerCase();
        
        // Padrões específicos que devem aparecer JUNTOS (número + indicador)
        const padroesEspecificos = [
            // Português - padrões completos
            /\d+.*(?:compras|vendidos|compraram|adquirido)/i,
            /(?:mais de|acima de).*\d+.*(?:compras|vendidos|mil|k)/i,
            /\d+.*\+.*(?:compras|vendidos)/i,
            
            // Inglês - padrões completos
            /\d+.*(?:bought|purchased|sold|orders)/i,
            /(?:more than|over|above).*\d+.*(?:bought|purchased|k)/i,
            /\d+.*\+.*(?:bought|purchased)/i,
            
            // Padrões Amazon específicos
            /\d+k?\+?\s*bought/i,
            /bought.*\d+/i,
            /\d+.*mil.*compras/i,
            /mais de.*\d+.*(?:mil|compras)/i
        ];
        
        // Verificar se algum padrão específico é encontrado
        const temPadrao = padroesEspecificos.some(padrao => padrao.test(texto));
        
        if (!temPadrao) {
            return false;
        }
        
        // Filtros para EXCLUIR falsos positivos
        const exclusoes = [
            /\$|\€|€|r\$|usd|price|preço|preco|valor/i, // Preços
            /asin|sku|id|code|código|model|modelo/i,     // IDs/códigos
            /review|rating|estrela|star|\*|avaliação/i,  // Reviews
            /\d{8,}/,                                    // Números muito longos (8+ dígitos)
            /shipping|frete|delivery|entrega/i,          // Frete
            /weight|peso|size|tamanho|dimension/i,       // Especificações
            /warranty|garantia|return|devolução/i        // Políticas
        ];
        
        // Se contém alguma exclusão, rejeitar
        if (exclusoes.some(exclusao => exclusao.test(texto))) {
            console.log(`❌ Texto rejeitado por filtro: "${texto}"`);
            return false;
        }
        
        console.log(`✅ Texto aprovado para extração: "${texto}"`);
        return true;
    }
    
    // Função RESTRITIVA para extrair números de vendas APENAS de contexto válido
    static extrairNumeroVendasRestritivo(texto) {
        console.log(`🔍 Analisando texto RESTRITIVO: "${texto}"`);
        
        // Limpar texto básico
        const textoLimpo = texto
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\u00A0/g, ' ')
            .trim()
            .toLowerCase();
        
        console.log(`🧹 Texto limpo: "${textoLimpo}"`);
        
        // Padrões APENAS para contextos claros de vendas (muito específicos)
        const padroes = [
            // "Mais de X mil compras" - padrão mais comum
            /(?:mais de|acima de|over|above|more than)\s*(\d+(?:[.,]\d+)?)\s*(mil|thousand|k)\s*(?:compras|vendidos|bought|sold|purchases)/i,
            
            // "X mil compras" direto
            /(\d+(?:[.,]\d+)?)\s*(mil|thousand|k)\s*(?:compras|vendidos|bought|sold|purchases)/i,
            
            // "X+ bought" formato Amazon
            /(\d+(?:[.,]\d+)?)\s*([km])?\s*\+\s*(?:bought|sold|compras|vendidos)/i,
            
            // "bought in past month" formato Amazon com número
            /(\d+(?:[.,]\d+)?)\s*([km])?\s*(?:bought|sold|compras|vendidos)(?:\s+(?:in|no|na))?/i,
            
            // Números com separadores seguidos de contexto claro
            /(\d{1,3}(?:[.,]\d{3})*)\s*(?:compras|vendidos|bought|sold|purchases)/i,
            
            // "Mais de X compras" sem multiplicador
            /(?:mais de|acima de|over|above|more than)\s*(\d{1,6})\s*(?:compras|vendidos|bought|sold|purchases)/i
        ];
        
        for (let i = 0; i < padroes.length; i++) {
            const match = textoLimpo.match(padroes[i]);
            
            if (match) {
                console.log(`✅ Padrão RESTRITIVO ${i + 1} encontrado:`, match);
                
                let numeroStr = match[1].replace(/[^\d.,]/g, '');
                let numero = 0;
                
                // Processar número baseado no formato
                if (numeroStr.includes('.') && numeroStr.includes(',')) {
                    if (numeroStr.lastIndexOf('.') > numeroStr.lastIndexOf(',')) {
                        numero = parseFloat(numeroStr.replace(/,/g, ''));
                    } else {
                        numero = parseFloat(numeroStr.replace(/\./g, '').replace(',', '.'));
                    }
                } else if (numeroStr.includes('.') && numeroStr.split('.')[1]?.length > 2) {
                    // Separador de milhares
                    numero = parseFloat(numeroStr.replace(/\./g, ''));
                } else if (numeroStr.includes(',') && numeroStr.split(',')[1]?.length > 2) {
                    // Separador de milhares
                    numero = parseFloat(numeroStr.replace(/,/g, ''));
                } else {
                    numero = parseFloat(numeroStr.replace(/[,.]/, '.'));
                }
                
                // Aplicar multiplicadores se especificados
                const multiplicador = match[2] ? match[2].toLowerCase() : '';
                if (multiplicador) {
                    if (multiplicador === 'mil' || multiplicador === 'k' || multiplicador === 'thousand') {
                        numero = numero * 1000;
                    } else if (multiplicador === 'm' || multiplicador === 'million') {
                        numero = numero * 1000000;
                    }
                }
                
                // Para padrões com "mais de" ou "+", aplicar margem pequena
                if (textoLimpo.includes('mais de') || textoLimpo.includes('acima de') || 
                    textoLimpo.includes('above') || textoLimpo.includes('over') || 
                    textoLimpo.includes('more than') || textoLimpo.includes('+')) {
                    numero = Math.floor(numero * 1.1); // Apenas 10% de margem
                }
                
                // Validação RÍGIDA: entre 1 e 50 milhões (range mais restritivo)
                if (numero >= 1 && numero <= 50000000) {
                    console.log(`🎯 Número final extraído (RESTRITIVO): ${numero}`);
                    return Math.floor(numero);
                } else {
                    console.log(`⚠️ Número fora do range RESTRITIVO (1-50M): ${numero}`);
                }
            }
        }
        
        console.log(`❌ Nenhum padrão RESTRITIVO encontrado`);
        return 0;
    }

    // Funções de compatibilidade para código existente
    static contemIndicadorVendas(texto) {
        // Usar a versão restritiva por padrão para evitar falsos positivos
        return this.contemIndicadorVendasRestritivo(texto);
    }

    static extrairNumeroVendas(texto) {
        // Usar a versão restritiva por padrão para evitar números absurdos
        return this.extrairNumeroVendasRestritivo(texto);
    }

    static buscarVendasNoTexto(texto) {
        // Usar a versão restritiva por padrão para evitar falsos positivos
        return this.buscarVendasNoTextoRestritivo(texto);
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
        
        // Seletores expandidos e atualizados para lista de produtos 2025
        const seletoresVendasLista = [
            // Seletores principais atualizados
            '#socialProofingAsinFaceout_feature_div .a-text-bold',
            '#social-proofing-faceout-title-tk_bought .a-text-bold',
            '.social-proofing-faceout-title-text .a-text-bold',
            '.social-proofing-faceout .a-text-bold',
            '.social-proofing-faceout-title .a-text-bold',
            
            // Novos seletores para 2025 - estrutura atualizada
            '[data-cy="social-proofing"] .a-text-bold',
            '[data-cy="social-proofing-bought"] .a-text-bold',
            '[data-cy="social-proofing-bought"]',
            '.social-proof-text .a-text-bold',
            '.social-proof-text',
            '.cr-lighthouse-terms .a-text-bold',
            '.cr-lighthouse-terms',
            
            // Seletores para cards de produto
            '.puis-card-container .social-proof .a-text-bold',
            '.puis-card-container .social-proof',
            '.s-result-item .social-proof .a-text-bold',
            '.s-result-item .social-proof',
            '.sg-col-inner .social-proof .a-text-bold',
            '.sg-col-inner .social-proof',
            
            // Seletores para diferentes layouts de lista
            '.s-card-container .a-text-bold',
            '.s-card-container .a-color-secondary',
            '.s-size-mini .a-text-bold',
            '.s-size-mini .a-color-secondary',
            
            // Seletores alternativos sem .a-text-bold
            '#socialProofingAsinFaceout_feature_div',
            '#social-proofing-faceout-title-tk_bought',
            '.social-proofing-faceout-title-text',
            '.social-proofing-faceout',
            
            // Seletores para mobile/responsive
            '.a-section[data-cy*="social"]',
            '.a-section[data-cy*="bought"]',
            '.a-section[data-cy*="purchased"]',
            
            // Seletores genéricos com filtros
            '.a-color-secondary:not(.a-price):not(.a-link-normal)',
            '.a-size-small:not(.a-price):not(.a-link-normal)',
            '.a-spacing-micro:not(.a-price)',
            '.a-section:not(.a-price-wrapper)',
            
            // Seletores amplos específicos para vendas
            '[class*="social-proofing"]',
            '[class*="social-proof"]',
            '[id*="social-proofing"]',
            '[id*="social-proof"]',
            
            // Último recurso - buscar por padrões de texto
            '.a-spacing-small',
            '.a-spacing-base'
        ];
        
        console.log('🔍 Procurando por indicadores de vendas na lista de produtos...');
        
        for (const seletor of seletoresVendasLista) {
            try {
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
            } catch (error) {
                console.warn(`⚠️ Erro ao processar seletor da lista "${seletor}":`, error.message);
                continue;
            }
        }
        
        // Busca alternativa: procurar diretamente no texto do elemento
        console.log('🔍 Iniciando busca alternativa no texto do elemento da lista...');
        const textoCompleto = elemento.textContent || '';
        const vendasPorTexto = this.buscarVendasNoTexto(textoCompleto);
        
        if (vendasPorTexto.vendas > 0) {
            console.log(`✅ Vendas encontradas via busca de texto na lista: ${vendasPorTexto.vendas}`);
            return {
                vendas: vendasPorTexto.vendas,
                textoOriginal: vendasPorTexto.textoOriginal,
                seletorUsado: 'busca-texto-lista'
            };
        }
        
        console.log('❌ Nenhum indicador de vendas encontrado na lista');
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