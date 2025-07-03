/**
 * ML Extractor - Baseado no sistema Python funcional e no padrão Amazon
 * Extração robusta e confiável para MercadoLivre
 */
class MLExtractor {
    static SELECTORS = {
        // Container principal - EXATAMENTE como no Python
        SEARCH_RESULTS: 'li.ui-search-layout__item',
        
        // Dados básicos - seletores testados e funcionais
        TITLE: '.poly-component__title',
        PRICE_FRACTION: '.andes-money-amount__fraction',
        IMAGE: 'img[decoding="async"][src*=".webp"]',
        LINK: 'a[href*="MLB"]',
        SELLER: '.poly-component__seller',
        RATING: '.poly-reviews__rating',
        REVIEWS_COUNT: '.poly-reviews__total',
        
        // Detecção de patrocinado - EXATO do Python
        SPONSORED: 'a.poly-component__ads-promotions'
    };
    
    /**
     * MÉTODO PRINCIPAL - Extrair produtos (baseado no Python funcional)
     */
    static extrairProdutos() {
        console.log('🛒 [ML-EXTRACTOR] Iniciando extração (método Python + Amazon)...');
        
        const elementos = document.querySelectorAll(this.SELECTORS.SEARCH_RESULTS);
        console.log(`🔍 [ML-EXTRACTOR] Encontrados ${elementos.length} elementos`);
        
        if (elementos.length === 0) {
            console.warn('⚠️ [ML-EXTRACTOR] Nenhum produto encontrado! Verificar seletores...');
            return [];
        }
        
        const produtos = [];
        const vistos = new Set(); // Evitar duplicatas como no Python
        
        // Processar cada elemento (como no Python)
        elementos.forEach((elemento, index) => {
            try {
                const produto = this.processarElemento(elemento, index + 1);
                
                if (produto && produto.mlId && !vistos.has(produto.mlId)) {
                    vistos.add(produto.mlId);
                    produtos.push(produto);
                    
                    // Limite de 50 produtos como no Python
                    if (produtos.length >= 50) {
                        return;
                    }
                }
            } catch (error) {
                console.error(`❌ [ML-EXTRACTOR] Erro no elemento ${index + 1}:`, error);
            }
        });
        
        console.log(`✅ [ML-EXTRACTOR] Extraídos ${produtos.length} produtos únicos`);
        return produtos;
    }
    
    /**
     * PROCESSAR ELEMENTO INDIVIDUAL - Baseado no Python + Amazon
     */
    static processarElemento(elemento, posicao) {
        try {
            // 1. EXTRAIR URL E MLB ID (EXATAMENTE como no Python)
            const linkTag = elemento.querySelector(this.SELECTORS.LINK);
            if (!linkTag || !linkTag.href) {
                return null;
            }
            
            // Limpar URL como no Python
            const url = linkTag.href.split("?")[0];
            
            // Extrair MLB ID com regex robusto
            const idMatch = url.match(/MLB[-_]?(\d{8,})/);
            if (!idMatch) {
                return null;
            }
            
            const mlId = `MLB${idMatch[1]}`;
            
            // 2. EXTRAIR DADOS BÁSICOS (estrutura similar ao Amazon)
            const titulo = this.extrairTitulo(elemento);
            const preco = this.extrairPreco(elemento);
            const imagem = this.extrairImagem(elemento);
            const vendedor = this.extrairVendedor(elemento);
            const avaliacao = this.extrairAvaliacao(elemento);
            const numAvaliacoes = this.extrairNumeroAvaliacoes(elemento);
            const patrocinado = this.verificarPatrocinado(elemento);
            
            // 3. EXTRAIR VENDAS (método robusto)
            const vendasData = this.extrairVendas(elemento);
            
            // 4. CRIAR OBJETO PRODUTO (estrutura compatível com tabela)
            const produto = {
                // Dados principais
                mlId: mlId,
                titulo: titulo,
                preco: preco,
                imagem: imagem,
                link: url,
                vendedor: vendedor,
                avaliacao: avaliacao,
                numAvaliacoes: numAvaliacoes,
                
                // Dados de vendas
                vendas: vendasData.vendas,
                vendasTexto: vendasData.vendasTexto,
                
                // Receita calculada (como no Python - faturamento)
                receita: (vendasData.vendas && preco) ? Math.round(vendasData.vendas * preco) : null,
                
                // Metadados
                posicao: posicao,
                patrocinado: patrocinado,
                plataforma: 'mercadolivre',
                timestamp: Date.now(),
                
                // Campos padrão para compatibilidade
                categoria: null,
                maisVendido: false,
                recomendado: false,
                lojaOficial: false,
                freteGratis: false,
                condicao: 'Novo'
            };
            
            // Log resumido (como no Python)
            console.log(`✅ [${posicao}] ${titulo?.substring(0, 30)}... | ${mlId} | R$ ${preco} | ${vendasData.vendas || 0} vendas`);
            
            return produto;
            
        } catch (error) {
            console.error('❌ [ML-EXTRACTOR] Erro ao processar elemento:', error);
            return null;
        }
    }
    
    /**
     * EXTRAIR TÍTULO
     */
    static extrairTitulo(elemento) {
        try {
            const tituloEl = elemento.querySelector(this.SELECTORS.TITLE);
            return tituloEl?.textContent?.trim() || '';
        } catch (error) {
            return '';
        }
    }
    
    /**
     * EXTRAIR PREÇO - Método robusto baseado no Amazon
     */
    static extrairPreco(elemento) {
        try {
            const precoEl = elemento.querySelector(this.SELECTORS.PRICE_FRACTION);
            if (!precoEl?.textContent) return null;
            
            const precoTexto = precoEl.textContent.trim();
            
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
            
            // Só ponto: pode ser milhares ou decimal
            if (numeroLimpo.includes('.')) {
                const partes = numeroLimpo.split('.');
                if (partes.length === 2 && partes[1].length <= 2) {
                    return parseFloat(numeroLimpo);
                } else {
                    return parseFloat(numeroLimpo.replace(/\./g, ''));
                }
            }
            
            return parseFloat(numeroLimpo);
        } catch (error) {
            return null;
        }
    }
    
    /**
     * EXTRAIR IMAGEM - Como no Python
     */
    static extrairImagem(elemento) {
        try {
            const imgTag = elemento.querySelector(this.SELECTORS.IMAGE);
            return imgTag?.src || '';
        } catch (error) {
            return '';
        }
    }
    
    /**
     * EXTRAIR VENDEDOR
     */
    static extrairVendedor(elemento) {
        try {
            const vendedorEl = elemento.querySelector(this.SELECTORS.SELLER);
            if (!vendedorEl?.textContent) return '';
            
            return vendedorEl.textContent.replace(/^Por\s+/i, '').trim();
        } catch (error) {
            return '';
        }
    }
    
    /**
     * EXTRAIR AVALIAÇÃO
     */
    static extrairAvaliacao(elemento) {
        try {
            const avaliacaoEl = elemento.querySelector(this.SELECTORS.RATING);
            if (!avaliacaoEl?.textContent) return null;
            
            const numero = parseFloat(avaliacaoEl.textContent.replace(',', '.'));
            return isNaN(numero) ? null : Math.min(5, Math.max(0, numero));
        } catch (error) {
            return null;
        }
    }
    
    /**
     * EXTRAIR NÚMERO DE AVALIAÇÕES
     */
    static extrairNumeroAvaliacoes(elemento) {
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
    
    /**
     * VERIFICAR PATROCINADO - EXATO do Python
     */
    static verificarPatrocinado(elemento) {
        try {
            const patrocinadoTag = elemento.querySelector(this.SELECTORS.SPONSORED);
            return !!patrocinadoTag;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * EXTRAIR VENDAS - Método robusto baseado no padrão observado
     */
    static extrairVendas(elemento) {
        try {
            const textoCompleto = elemento.textContent || '';
            
            // Padrões robustos baseados no HTML real do ML
            const padroes = [
                // Padrão principal: "Novo | +500 vendidos"
                { regex: /Novo\s*\|\s*\+(\d+)mil\s+vendidos/i, multiplier: 1000 },
                { regex: /Novo\s*\|\s*\+(\d+)\s+vendidos/i, multiplier: 1 },
                
                // Padrões MercadoLíder: "MercadoLíder | +5mil vendas"
                { regex: /MercadoLíder\s*\|\s*\+(\d+)mil\s+vendas/i, multiplier: 1000 },
                { regex: /MercadoLíder\s*\|\s*\+(\d+)\s+vendas/i, multiplier: 1 },
                
                // Padrões alternativos
                { regex: /\+(\d+)mil\s+vendidos/i, multiplier: 1000 },
                { regex: /\+(\d+)\s+vendidos/i, multiplier: 1 },
                { regex: /(\d+)mil\s+vendidos/i, multiplier: 1000 },
                { regex: /(\d+)\s+vendidos/i, multiplier: 1 },
                
                // Padrões de vendas concluídas
                { regex: /\+(\d+)mil\s+Vendas\s+concluídas/i, multiplier: 1000 },
                { regex: /\+(\d+)\s+Vendas\s+concluídas/i, multiplier: 1 }
            ];
            
            for (const padrao of padroes) {
                const match = textoCompleto.match(padrao.regex);
                if (match) {
                    const numero = parseInt(match[1]);
                    const vendas = numero * padrao.multiplier;
                    
                    return {
                        vendas: vendas,
                        vendasTexto: match[0]
                    };
                }
            }
            
            // Se não encontrou vendas, retornar 0
            return {
                vendas: 0,
                vendasTexto: null
            };
            
        } catch (error) {
            console.error('❌ [ML-EXTRACTOR] Erro ao extrair vendas:', error);
            return {
                vendas: 0,
                vendasTexto: null
            };
        }
    }
    
    /**
     * AGUARDAR CARREGAMENTO - Como no Amazon extractor
     */
    static async aguardarCarregamento(timeout = 5000) {
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
     * OBTER DADOS DA BUSCA ATUAL
     */
    static obterDadosBusca() {
        try {
            const url = window.location.href;
            
            // Extrair termo de pesquisa da URL
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
            
            return {
                termoPesquisa: termoPesquisa.trim(),
                pagina: pagina.toString(),
                url: url,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('❌ [ML-EXTRACTOR] Erro ao obter dados da busca:', error);
            return {
                termoPesquisa: '',
                pagina: '1',
                url: window.location.href,
                timestamp: Date.now()
            };
        }
    }
}

// Expor globalmente
window.MLExtractor = MLExtractor; 