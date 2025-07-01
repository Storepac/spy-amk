/**
 * ML Extractor - Extração de dados específica do Mercado Livre
 * Suporta layouts Grid e Stack do ML
 */
class MLExtractor {
    static SELECTORS = {
        // Containers principais
        SEARCH_RESULTS: '.ui-search-layout__item',
        
        // Dados do produto - Nova estrutura Poly
        TITLE: '.poly-component__title',
        PRICE_FRACTION: '.andes-money-amount__fraction',
        PRICE_FULL: '.andes-money-amount',
        INSTALLMENTS: '.poly-price__installments',
        
        // Imagem e link
        IMAGE: '.poly-component__picture',
        LINK: '.poly-component__title',
        
        // Informações adicionais
        REVIEWS_RATING: '.poly-reviews__rating',
        REVIEWS_COUNT: '.poly-reviews__total',
        SELLER: '.poly-component__seller',
        SHIPPING: '.poly-component__shipping',
        
        // Tags especiais
        SPONSORED: '[data-testid="ad-label"]',
        MOST_SOLD: '.poly-component__highlight',
        OFFICIAL_STORE: 'svg[aria-label="Loja oficial"]',
        
        // Labels e badges
        HIGHLIGHT_LABEL: '.poly-component__highlight',
        FLOAT_HIGHLIGHT: '.poly-component__float-highlight'
    };
    
    /**
     * Extrair todos os produtos da página
     */
    static extrairProdutos() {
        console.log('🛒 Iniciando extração ML...');
        
        const elementos = document.querySelectorAll(this.SELECTORS.SEARCH_RESULTS);
        console.log(`🔍 Encontrados ${elementos.length} elementos na página`);
        
        const produtos = Array.from(elementos).map((elemento, index) => 
            this.extrairDadosProduto(elemento, index + 1)
        ).filter(produto => produto !== null);
        
        console.log(`📦 ML: ${produtos.length} produtos extraídos`);
        return produtos;
    }
    
    /**
     * Extrair dados de um produto específico
     */
    static extrairDadosProduto(elemento, posicao) {
        try {
            // ID único do ML (extrair da URL)
            const linkEl = elemento.querySelector(this.SELECTORS.LINK);
            const url = linkEl?.href || '';
            const mlId = this.extrairMLID(url);
            
            if (!mlId) {
                console.warn('❌ ML ID não encontrado:', url);
                return null;
            }
            
            // Título
            const titulo = linkEl?.textContent?.trim() || '';
            
            if (!titulo) {
                console.warn('❌ Título não encontrado para:', mlId);
                return null;
            }
            
            // Preços
            const precoElement = elemento.querySelector(this.SELECTORS.PRICE_FRACTION);
            const preco = this.extrairPreco(precoElement?.textContent);
            
            // Avaliações
            const avaliacaoEl = elemento.querySelector(this.SELECTORS.REVIEWS_RATING);
            const avaliacaoCountEl = elemento.querySelector(this.SELECTORS.REVIEWS_COUNT);
            
            const avaliacao = this.extrairAvaliacao(avaliacaoEl?.textContent);
            const numAvaliacoes = this.extrairNumeroAvaliacoes(avaliacaoCountEl?.textContent);
            
            // Imagem
            const imagemEl = elemento.querySelector(this.SELECTORS.IMAGE);
            const imagem = imagemEl?.src || imagemEl?.dataset?.src || '';
            
            // Vendedor
            const vendedorEl = elemento.querySelector(this.SELECTORS.SELLER);
            const vendedor = vendedorEl?.textContent?.replace(/^Por\s+/i, '').trim() || '';
            
            // Tags especiais e badges
            const maisVendidoEl = elemento.querySelector(this.SELECTORS.MOST_SOLD);
            const maisVendido = maisVendidoEl?.textContent?.includes('MAIS VENDIDO') || false;
            const recomendado = maisVendidoEl?.textContent?.includes('RECOMENDADO') || false;
            
            const lojaOficial = elemento.querySelector(this.SELECTORS.OFFICIAL_STORE) !== null;
            
            // Extrair vendas do texto ("+10mil vendidos", "+500 vendidos", etc)
            const vendas = this.extrairVendasDoTexto(elemento);
            const vendasTexto = this.extrairVendasTextoOriginal(elemento);
            
            // Extrair categoria e posição (ex: "1º em Protetores de Carter")
            const { categoria, posicaoCategoria } = this.extrairCategoriaEPosicao(elemento);
            
            // Frete
            const freteEl = elemento.querySelector(this.SELECTORS.SHIPPING);
            const freteGratis = freteEl?.textContent?.toLowerCase().includes('grátis') || 
                              freteEl?.textContent?.toLowerCase().includes('gratis') || false;
            
            // Patrocinado (verificar se há label "Patrocinado")
            const patrocinado = this.verificarPatrocinado(elemento);
            
            console.log(`✅ Produto extraído: ${titulo} - R$ ${preco}`);
            
            return {
                mlId,
                titulo,
                preco,
                precoOriginal: null, // Será implementado se necessário
                desconto: null, // Será implementado se necessário
                avaliacao,
                numAvaliacoes,
                imagem,
                link: url,
                vendedor,
                patrocinado,
                maisVendido,
                recomendado,
                lojaOficial,
                freteGratis,
                condicao: 'Novo', // Padrão para ML
                vendas,
                vendasTexto,
                receita: vendas && preco ? vendas * preco : null,
                categoria,
                posicaoCategoria,
                posicao,
                plataforma: 'mercadolivre',
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('❌ Erro ao extrair produto ML:', error);
            console.error('Elemento:', elemento);
            return null;
        }
    }
    
    /**
     * Extrair ML ID da URL
     */
    static extrairMLID(url) {
        if (!url) return null;
        
        // 1. URL direta do produto: /MLB-123456789-produto-nome
        let match = url.match(/\/MLB-(\d+)-/);
        if (match) {
            return `MLB-${match[1]}`;
        }
        
        // 2. URL com parâmetro wid (encontrado em URLs de redirecionamento)
        match = url.match(/[?&]wid=(MLB\d+)/);
        if (match) {
            return match[1];
        }
        
        // 3. URL com searchVariation
        match = url.match(/[?&]searchVariation=(MLB[U]?\d+)/);
        if (match) {
            return match[1];
        }
        
        // 4. URL click1.mercadolivre.com.br - extrair do fragmento
        if (url.includes('click1.mercadolivre.com.br')) {
            match = url.match(/#.*wid=(MLB\d+)/);
            if (match) {
                return match[1];
            }
        }
        
        // 5. Fallback: procurar qualquer MLB seguido de números
        match = url.match(/MLB[U]?(\d+)/);
        if (match) {
            return url.includes('MLBU') ? `MLBU${match[1]}` : `MLB${match[1]}`;
        }
        
        return null;
    }
    
    /**
     * Extrair preço numérico
     */
    static extrairPreco(texto) {
        if (!texto) return null;
        
        // Remove tudo exceto números, vírgulas e pontos
        const numeroLimpo = texto.replace(/[^\d,\.]/g, '');
        
        // Se tem vírgula e ponto, assume formato brasileiro (1.234,56)
        if (numeroLimpo.includes(',') && numeroLimpo.includes('.')) {
            return parseFloat(numeroLimpo.replace(/\./g, '').replace(',', '.'));
        }
        
        // Se só tem vírgula, assume formato brasileiro (1234,56)
        if (numeroLimpo.includes(',')) {
            return parseFloat(numeroLimpo.replace(',', '.'));
        }
        
        // Se só tem ponto, pode ser separador de milhares ou decimal
        if (numeroLimpo.includes('.')) {
            const partes = numeroLimpo.split('.');
            if (partes[partes.length - 1].length === 2) {
                // Último ponto tem 2 dígitos, é decimal
                return parseFloat(numeroLimpo.replace(/\.(?=\d{3})/g, ''));
            }
        }
        
        return parseFloat(numeroLimpo);
    }
    
    /**
     * Extrair avaliação numérica
     */
    static extrairAvaliacao(texto) {
        if (!texto) return null;
        const numero = parseFloat(texto.replace(',', '.'));
        return isNaN(numero) ? null : Math.min(5, Math.max(0, numero));
    }
    
    /**
     * Extrair número de avaliações
     */
    static extrairNumeroAvaliacoes(texto) {
        if (!texto) return null;
        
        // Remove parênteses e extrai números
        const numeroLimpo = texto.replace(/[^\d]/g, '');
        const numero = parseInt(numeroLimpo);
        return isNaN(numero) ? null : numero;
    }
    
    /**
     * Extrair vendas do texto do elemento
     */
    static extrairVendasDoTexto(elemento) {
        try {
            // Procurar por padrões de vendas no elemento
            const textoCompleto = elemento.textContent || '';
            
            // Padrões comuns: "+10mil vendidos", "+500 vendidos", "Novo | +10mil vendidos"
            const patterns = [
                /\+(\d+)mil\s+vendidos/i,  // "+10mil vendidos"
                /\+(\d+)\s+vendidos/i,     // "+500 vendidos"
                /(\d+)mil\s+vendidos/i,    // "10mil vendidos"
                /(\d+)\s+vendidos/i        // "500 vendidos"
            ];
            
            for (const pattern of patterns) {
                const match = textoCompleto.match(pattern);
                if (match) {
                    const numero = parseInt(match[1]);
                    
                    // Se contém "mil", multiplicar por 1000
                    if (pattern.source.includes('mil')) {
                        return numero * 1000;
                    } else {
                        return numero;
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.warn('Erro ao extrair vendas:', error);
            return null;
        }
    }
    
    /**
     * Extrair texto original das vendas
     */
    static extrairVendasTextoOriginal(elemento) {
        try {
            const textoCompleto = elemento.textContent || '';
            
            // Procurar pelo padrão de vendas e retornar o texto original
            const match = textoCompleto.match(/(\+?\d+\s*mil|\+?\d+)\s+vendidos/i);
            return match ? match[0] : null;
        } catch (error) {
            console.warn('Erro ao extrair texto de vendas:', error);
            return null;
        }
    }
    
    /**
     * Extrair categoria e posição em categoria
     */
    static extrairCategoriaEPosicao(elemento) {
        try {
            const textoCompleto = elemento.textContent || '';
            
            // Procurar padrões como "1º em Protetores de Carter"
            const match = textoCompleto.match(/(\d+º)\s+em\s+([^"]+)/i);
            
            if (match) {
                return {
                    posicaoCategoria: match[1], // "1º"
                    categoria: match[2].trim()  // "Protetores de Carter"
                };
            }
            
            return {
                categoria: null,
                posicaoCategoria: null
            };
        } catch (error) {
            console.warn('Erro ao extrair categoria:', error);
            return {
                categoria: null,
                posicaoCategoria: null
            };
        }
    }
    
    /**
     * Verificar se produto é patrocinado
     */
    static verificarPatrocinado(elemento) {
        try {
            const textoCompleto = elemento.textContent || '';
            
            // Verificar por "Patrocinado" no texto
            if (textoCompleto.toLowerCase().includes('patrocinado')) {
                return true;
            }
            
            // Verificar elementos específicos de anúncio
            const seletoresAnuncio = [
                '.poly-component__ads-promotions',
                '[data-testid="ad-label"]',
                '.ui-search-ad-label'
            ];
            
            for (const seletor of seletoresAnuncio) {
                if (elemento.querySelector(seletor)) {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.warn('Erro ao verificar patrocinado:', error);
            return false;
        }
    }
    
    /**
     * Aguardar carregamento da página
     */
    static async aguardarCarregamento(timeout = 5000) {
        return new Promise((resolve) => {
            const verificar = () => {
                const produtos = document.querySelectorAll(
                    this.SELECTORS.SEARCH_RESULTS
                );
                
                if (produtos.length > 0) {
                    resolve(true);
                } else {
                    setTimeout(verificar, 100);
                }
            };
            
            verificar();
            
            // Timeout
            setTimeout(() => resolve(false), timeout);
        });
    }
    
    /**
     * Obter dados da busca atual
     */
    static obterDadosBusca() {
        try {
            const url = window.location.href;
            const urlParams = new URLSearchParams(window.location.search);
            
            // Extrair termo de pesquisa
            let termoPesquisa = '';
            
            // Tentar extrair da URL
            if (url.includes('lista.mercadolivre.com.br')) {
                const match = url.match(/\/([^\/]+)(_Desde_|_NoIndex_|$)/);
                if (match) {
                    termoPesquisa = decodeURIComponent(match[1]).replace(/-/g, ' ');
                }
            }
            
            // Fallback: tentar parâmetros da URL
            if (!termoPesquisa) {
                termoPesquisa = urlParams.get('search') || 
                              urlParams.get('q') || 
                              urlParams.get('as_word') || '';
            }
            
            // Tentar extrair da página
            if (!termoPesquisa) {
                const searchInput = document.querySelector('input[placeholder*="buscar"], input[name*="search"]');
                if (searchInput) {
                    termoPesquisa = searchInput.value || searchInput.placeholder || '';
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
            console.error('Erro ao obter dados da busca:', error);
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