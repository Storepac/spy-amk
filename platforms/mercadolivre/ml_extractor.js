/**
 * ML Extractor - Extrator específico e independente para MercadoLivre
 * Sistema totalmente separado do Amazon para máxima personalização
 */
class MLExtractor {
    static SELECTORS = {
        // Container principal - EXATAMENTE como no Python funcional
        SEARCH_RESULTS: 'li.ui-search-layout__item',
        
        // Dados básicos - seletores testados e funcionais
        TITLE: '.poly-component__title',
        PRICE_FRACTION: '.andes-money-amount__fraction',
        PRICE_CENTS: '.andes-money-amount__cents',
        IMAGE: 'img[decoding="async"][src*=".webp"]',
        LINK: 'a[href*="MLB"]',
        SELLER: '.poly-component__seller',
        RATING: '.poly-reviews__rating',
        REVIEWS_COUNT: '.poly-reviews__total',
        
        // ML específicos - badges e indicadores
        SPONSORED: 'a.poly-component__ads-promotions',
        OFFICIAL_STORE: '.message-text:contains("Loja oficial")',
        FREE_SHIPPING: '.shipping-text:contains("Frete grátis")',
        HIGHLIGHT_BADGE: '.ui-search-item__highlight-label',
        CATEGORY_RANKING: '.ui-search-item__category-text',
        
        // Novos seletores ML específicos
        SALES_TEXT: '.ui-search-item__sales',
        CONDITION: '.ui-search-item__condition',
        DISCOUNT: '.ui-search-price__discount'
    };
    
    /**
     * MÉTODO PRINCIPAL - Extrair produtos ML (baseado no Python + melhorias)
     */
    static extrairProdutos() {
        console.log('🛒 [ML-EXTRACTOR] Iniciando extração ML específica...');
        
        const elementos = document.querySelectorAll(this.SELECTORS.SEARCH_RESULTS);
        console.log(`🔍 [ML-EXTRACTOR] Encontrados ${elementos.length} elementos ML`);
        
        if (elementos.length === 0) {
            console.warn('⚠️ [ML-EXTRACTOR] Nenhum produto ML encontrado!');
            return [];
        }
        
        const produtos = [];
        const vistos = new Set(); // Evitar duplicatas
        
        // Processar cada elemento
        elementos.forEach((elemento, index) => {
            try {
                const produto = this.processarElementoML(elemento, index + 1);
                
                if (produto && produto.mlId && !vistos.has(produto.mlId)) {
                    vistos.add(produto.mlId);
                    produtos.push(produto);
                    
                    // Limite de 50 produtos
                    if (produtos.length >= 50) {
                        return;
                    }
                }
            } catch (error) {
                console.error(`❌ [ML-EXTRACTOR] Erro no elemento ${index + 1}:`, error);
            }
        });
        
        console.log(`✅ [ML-EXTRACTOR] Extraídos ${produtos.length} produtos ML únicos`);
        return produtos;
    }
    
    /**
     * PROCESSAR ELEMENTO ML - Totalmente específico para ML
     */
    static processarElementoML(elemento, posicao) {
        try {
            // 1. EXTRAIR URL E MLB ID (múltiplas estratégias)
            const linkData = this.extrairLinkEMLID(elemento);
            if (!linkData.mlId) {
                return null;
            }
            
            // 2. EXTRAIR DADOS BÁSICOS ML
            const dadosBasicos = this.extrairDadosBasicosML(elemento);
            
            // 3. EXTRAIR DADOS ESPECÍFICOS ML
            const dadosEspecificos = this.extrairDadosEspecificosML(elemento);
            
            // 4. EXTRAIR VENDAS (método robusto ML)
            const vendasData = this.extrairVendasML(elemento);
            
            // 5. OBTER DADOS DA BUSCA PARA PÁGINA
            const dadosBusca = this.obterDadosBuscaML();
            const paginaAtual = parseInt(dadosBusca.pagina) || 1;
            
            // 6. CRIAR OBJETO PRODUTO ML COMPLETO
            const produto = {
                // Identificadores
                mlId: linkData.mlId,
                link: linkData.url,
                plataforma: 'mercadolivre',
                posicao: posicao,
                paginaBusca: paginaAtual,
                posicaoReal: ((paginaAtual - 1) * 50) + posicao,
                timestamp: Date.now(),
                
                // Dados básicos
                titulo: dadosBasicos.titulo,
                preco: dadosBasicos.preco,
                precoFormatado: dadosBasicos.precoFormatado,
                imagem: dadosBasicos.imagem,
                vendedor: dadosBasicos.vendedor,
                avaliacao: dadosBasicos.avaliacao,
                numAvaliacoes: dadosBasicos.numAvaliacoes,
                
                // Dados ML específicos
                condicao: dadosEspecificos.condicao,
                desconto: dadosEspecificos.desconto,
                lojaOficial: dadosEspecificos.lojaOficial,
                freteGratis: dadosEspecificos.freteGratis,
                badges: dadosEspecificos.badges,
                categoriaRanking: dadosEspecificos.categoriaRanking,
                
                // Dados de vendas
                vendas: vendasData.vendas,
                vendasTexto: vendasData.vendasTexto,
                vendasTextoOriginal: vendasData.vendasTextoOriginal,
                
                // Cálculos
                receita: (vendasData.vendas && dadosBasicos.preco) ? 
                    Math.round(vendasData.vendas * dadosBasicos.preco) : null,
                
                // Status e tipo
                patrocinado: dadosEspecificos.patrocinado,
                tipo: dadosEspecificos.patrocinado ? 'Patrocinado' : 'Orgânico',
                
                // Metadados para análise
                hashProduto: this.gerarHashML(linkData.mlId, dadosBasicos.titulo, dadosBasicos.preco)
            };
            
            // Log de extração bem-sucedida
            console.log(`✅ [${posicao}] ${produto.titulo?.substring(0, 30)}... | ${produto.mlId} | R$ ${produto.preco} | ${produto.vendas || 0} vendas`);
            
            return produto;
            
        } catch (error) {
            console.error('❌ [ML-EXTRACTOR] Erro ao processar elemento ML:', error);
            return null;
        }
    }
    
    /**
     * EXTRAIR LINK E MLB ID - Múltiplas estratégias para ML
     */
    static extrairLinkEMLID(elemento) {
        try {
            const linkTag = elemento.querySelector(this.SELECTORS.LINK);
            if (!linkTag || !linkTag.href) {
                return { url: null, mlId: null };
            }
            
            const url = linkTag.href.split("?")[0];
            
            // Estratégias múltiplas para extrair MLB ID
            const estrategias = [
                // 1. URL direta: /MLB-123456789-produto
                /\/MLB[-_]?(\d{8,})-/,
                // 2. URL com MLB: /MLB123456789
                /\/MLB(\d{8,})/,
                // 3. Parâmetro wid: ?wid=MLB123456789
                /[?&]wid=MLB(\d{8,})/,
                // 4. Fragment: #wid=MLB123456789
                /#.*wid=MLB(\d{8,})/,
                // 5. Qualquer MLB seguido de números
                /MLB[U]?(\d{8,})/
            ];
            
            for (const regex of estrategias) {
                const match = url.match(regex);
                if (match) {
                    const mlId = `MLB${match[1]}`;
                    return { url, mlId };
                }
            }
            
            return { url, mlId: null };
            
        } catch (error) {
            return { url: null, mlId: null };
        }
    }
    
    /**
     * EXTRAIR DADOS BÁSICOS ML
     */
    static extrairDadosBasicosML(elemento) {
        return {
            titulo: this.extrairTituloML(elemento),
            preco: this.extrairPrecoML(elemento),
            precoFormatado: this.extrairPrecoFormatadoML(elemento),
            imagem: this.extrairImagemML(elemento),
            vendedor: this.extrairVendedorML(elemento),
            avaliacao: this.extrairAvaliacaoML(elemento),
            numAvaliacoes: this.extrairNumeroAvaliacoesML(elemento)
        };
    }
    
    /**
     * EXTRAIR DADOS ESPECÍFICOS ML
     */
    static extrairDadosEspecificosML(elemento) {
        return {
            condicao: this.extrairCondicaoML(elemento),
            desconto: this.extrairDescontoML(elemento),
            lojaOficial: this.verificarLojaOficialML(elemento),
            freteGratis: this.verificarFreteGratisML(elemento),
            badges: this.extrairBadgesML(elemento),
            categoriaRanking: this.extrairCategoriaRankingML(elemento),
            patrocinado: this.verificarPatrocinadoML(elemento)
        };
    }
    
    /**
     * EXTRAIR TÍTULO ML
     */
    static extrairTituloML(elemento) {
        try {
            const tituloEl = elemento.querySelector(this.SELECTORS.TITLE);
            return tituloEl?.textContent?.trim() || '';
        } catch (error) {
            return '';
        }
    }
    
    /**
     * EXTRAIR PREÇO ML - Formato brasileiro específico
     */
    static extrairPrecoML(elemento) {
        try {
            const precoFraction = elemento.querySelector(this.SELECTORS.PRICE_FRACTION);
            const precoCents = elemento.querySelector(this.SELECTORS.PRICE_CENTS);
            
            if (!precoFraction?.textContent) return null;
            
            let precoCompleto = precoFraction.textContent.trim();
            
            // Adicionar centavos se existir
            if (precoCents?.textContent) {
                precoCompleto += ',' + precoCents.textContent.trim();
            }
            
            // Converter formato brasileiro para número
            return this.converterPrecoML(precoCompleto);
            
        } catch (error) {
            return null;
        }
    }
    
    /**
     * CONVERTER PREÇO ML - Específico para formato brasileiro
     */
    static converterPrecoML(precoTexto) {
        try {
            // Remove tudo exceto números, vírgulas e pontos
            const numeroLimpo = precoTexto.replace(/[^\d,\.]/g, '');
            
            // Formato brasileiro: 1.234,56
            if (numeroLimpo.includes(',') && numeroLimpo.includes('.')) {
                return parseFloat(numeroLimpo.replace(/\./g, '').replace(',', '.'));
            }
            
            // Só vírgula: 1234,56
            if (numeroLimpo.includes(',')) {
                return parseFloat(numeroLimpo.replace(',', '.'));
            }
            
            // Só ponto: pode ser milhares (1.234) ou decimal (12.34)
            if (numeroLimpo.includes('.')) {
                const partes = numeroLimpo.split('.');
                if (partes.length === 2 && partes[1].length <= 2) {
                    return parseFloat(numeroLimpo); // É decimal
                } else {
                    return parseFloat(numeroLimpo.replace(/\./g, '')); // São milhares
                }
            }
            
            return parseFloat(numeroLimpo);
        } catch (error) {
            return null;
        }
    }
    
    /**
     * EXTRAIR PREÇO FORMATADO ML - Para exibição
     */
    static extrairPrecoFormatadoML(elemento) {
        try {
            const preco = this.extrairPrecoML(elemento);
            if (!preco) return '';
            
            return preco.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        } catch (error) {
            return '';
        }
    }
    
    /**
     * EXTRAIR VENDAS ML - Robusto para padrões ML
     */
    static extrairVendasML(elemento) {
        try {
            const textoCompleto = elemento.textContent || '';
            
            // Padrões específicos do MercadoLivre
            const padroes = [
                // Padrão principal: "Novo | +500 vendidos"
                { regex: /Novo\s*\|\s*\+(\d+)mil\s+vendidos/i, multiplier: 1000 },
                { regex: /Novo\s*\|\s*\+(\d+)\s+vendidos/i, multiplier: 1 },
                
                // Padrões MercadoLíder
                { regex: /MercadoLíder\s*\|\s*\+(\d+)mil\s+vendas/i, multiplier: 1000 },
                { regex: /MercadoLíder\s*\|\s*\+(\d+)\s+vendas/i, multiplier: 1 },
                
                // Padrões com números decimais
                { regex: /\+(\d+,?\d*)mil\s+vendidos/i, multiplier: 1000 },
                { regex: /\+(\d+,?\d*)\s+vendidos/i, multiplier: 1 },
                
                // Padrões alternativos
                { regex: /(\d+)mil\s+vendidos/i, multiplier: 1000 },
                { regex: /(\d+)\s+vendidos/i, multiplier: 1 },
                
                // Vendas concluídas
                { regex: /\+(\d+)mil\s+Vendas\s+concluídas/i, multiplier: 1000 },
                { regex: /\+(\d+)\s+Vendas\s+concluídas/i, multiplier: 1 }
            ];
            
            for (const padrao of padroes) {
                const match = textoCompleto.match(padrao.regex);
                if (match) {
                    // Tratar números com vírgula (formato brasileiro)
                    const numeroTexto = match[1].replace(',', '.');
                    const numero = parseFloat(numeroTexto);
                    const vendas = Math.round(numero * padrao.multiplier);
                    
                    return {
                        vendas: vendas,
                        vendasTexto: match[0],
                        vendasTextoOriginal: match[0]
                    };
                }
            }
            
            // Se não encontrou vendas
            return {
                vendas: 0,
                vendasTexto: null,
                vendasTextoOriginal: null
            };
            
        } catch (error) {
            console.error('❌ [ML-EXTRACTOR] Erro ao extrair vendas ML:', error);
            return {
                vendas: 0,
                vendasTexto: null,
                vendasTextoOriginal: null
            };
        }
    }
    
    /**
     * GERAR HASH ML
     */
    static gerarHashML(mlId, titulo, preco) {
        try {
            const dados = `${mlId}-${titulo}-${preco}`;
            return btoa(dados).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
        } catch (error) {
            return Math.random().toString(36).substring(2, 18);
        }
    }
    
    /**
     * AGUARDAR CARREGAMENTO ML
     */
    static async aguardarCarregamentoML(timeout = 10000) {
        return new Promise((resolve) => {
            const verificar = () => {
                const produtos = document.querySelectorAll(this.SELECTORS.SEARCH_RESULTS);
                if (produtos.length > 0) {
                    resolve(true);
                } else {
                    setTimeout(verificar, 100);
                }
            };
            
            verificar();
            setTimeout(() => resolve(false), timeout);
        });
    }
    
    /**
     * OBTER DADOS DA BUSCA ML
     */
    static obterDadosBuscaML() {
        try {
            const url = window.location.href;
            
            // Extrair termo de pesquisa da URL ML
            let termoPesquisa = '';
            if (url.includes('lista.mercadolivre.com.br')) {
                const match = url.match(/\/([^\/]+)(_Desde_|_NoIndex_|$)/);
                if (match) {
                    termoPesquisa = decodeURIComponent(match[1]).replace(/-/g, ' ');
                }
            }
            
            // Extrair página atual
            const paginaMatch = url.match(/_Desde_(\d+)/);
            const pagina = paginaMatch ? Math.ceil(parseInt(paginaMatch[1]) / 50) + 1 : 1;
            
            // Extrair filtros aplicados
            const filtros = this.extrairFiltrosURL(url);
            
            return {
                termoPesquisa: termoPesquisa.trim(),
                pagina: pagina.toString(),
                url: url,
                filtros: filtros,
                timestamp: Date.now(),
                plataforma: 'mercadolivre'
            };
        } catch (error) {
            console.error('❌ [ML-EXTRACTOR] Erro ao obter dados da busca ML:', error);
            return {
                termoPesquisa: '',
                pagina: '1',
                url: window.location.href,
                filtros: {},
                timestamp: Date.now(),
                plataforma: 'mercadolivre'
            };
        }
    }
    
    /**
     * EXTRAIR FILTROS DA URL ML
     */
    static extrairFiltrosURL(url) {
        try {
            const urlObj = new URL(url);
            const filtros = {};
            
            // Filtros comuns do ML
            if (urlObj.searchParams.get('price')) {
                filtros.faixaPreco = urlObj.searchParams.get('price');
            }
            if (urlObj.searchParams.get('installments')) {
                filtros.parcelas = urlObj.searchParams.get('installments');
            }
            if (urlObj.searchParams.get('shipping')) {
                filtros.frete = urlObj.searchParams.get('shipping');
            }
            
            return filtros;
        } catch (error) {
            return {};
        }
    }
    
    // Métodos auxiliares específicos ML (implementação básica)
    static extrairImagemML(elemento) {
        try {
            const imgTag = elemento.querySelector(this.SELECTORS.IMAGE);
            return imgTag?.src || '';
        } catch (error) {
            return '';
        }
    }
    
    static extrairVendedorML(elemento) {
        try {
            const vendedorEl = elemento.querySelector(this.SELECTORS.SELLER);
            if (!vendedorEl?.textContent) return '';
            return vendedorEl.textContent.replace(/^Por\s+/i, '').trim();
        } catch (error) {
            return '';
        }
    }
    
    static extrairAvaliacaoML(elemento) {
        try {
            const avaliacaoEl = elemento.querySelector(this.SELECTORS.RATING);
            if (!avaliacaoEl?.textContent) return null;
            const numero = parseFloat(avaliacaoEl.textContent.replace(',', '.'));
            return isNaN(numero) ? null : Math.min(5, Math.max(0, numero));
        } catch (error) {
            return null;
        }
    }
    
    static extrairNumeroAvaliacoesML(elemento) {
        try {
            const numAvaliacoesEl = elemento.querySelector(this.SELECTORS.REVIEWS_COUNT);
            if (!numAvaliacoesEl?.textContent) return null;
            const numeroLimpo = numAvaliacoesEl.textContent.replace(/[^\d]/g, '');
            const numero = parseInt(numeroLimpo);
            return isNaN(numero) ? null : numero;
        } catch (error) {
            return null;
        }
    }
    
    static extrairCondicaoML(elemento) {
        try {
            const condicaoEl = elemento.querySelector(this.SELECTORS.CONDITION);
            return condicaoEl?.textContent?.trim() || 'Novo';
        } catch (error) {
            return 'Novo';
        }
    }
    
    static extrairDescontoML(elemento) {
        try {
            const descontoEl = elemento.querySelector(this.SELECTORS.DISCOUNT);
            if (!descontoEl?.textContent) return null;
            const match = descontoEl.textContent.match(/(\d+)%/);
            return match ? parseInt(match[1]) : null;
        } catch (error) {
            return null;
        }
    }
    
    static verificarLojaOficialML(elemento) {
        try {
            const lojaOficialEl = elemento.querySelector(this.SELECTORS.OFFICIAL_STORE);
            return !!lojaOficialEl;
        } catch (error) {
            return false;
        }
    }
    
    static verificarFreteGratisML(elemento) {
        try {
            const freteGratisEl = elemento.querySelector(this.SELECTORS.FREE_SHIPPING);
            return !!freteGratisEl;
        } catch (error) {
            return false;
        }
    }
    
    static extrairBadgesML(elemento) {
        try {
            const badgeEl = elemento.querySelector(this.SELECTORS.HIGHLIGHT_BADGE);
            const badges = {
                maisVendido: false,
                recomendado: false,
                melhorPreco: false,
                promocao: false
            };
            
            if (badgeEl?.textContent) {
                const texto = badgeEl.textContent.toLowerCase();
                badges.maisVendido = texto.includes('mais vendido');
                badges.recomendado = texto.includes('recomendado');
                badges.melhorPreco = texto.includes('melhor preço');
                badges.promocao = texto.includes('promoção');
            }
            
            return badges;
        } catch (error) {
            return {
                maisVendido: false,
                recomendado: false,
                melhorPreco: false,
                promocao: false
            };
        }
    }
    
    static extrairCategoriaRankingML(elemento) {
        try {
            const categoriaEl = elemento.querySelector(this.SELECTORS.CATEGORY_RANKING);
            return categoriaEl?.textContent?.trim() || null;
        } catch (error) {
            return null;
        }
    }
    
    static verificarPatrocinadoML(elemento) {
        try {
            const patrocinadoTag = elemento.querySelector(this.SELECTORS.SPONSORED);
            return !!patrocinadoTag;
        } catch (error) {
            return false;
        }
    }
}

// Expor globalmente
window.MLExtractor = MLExtractor; 