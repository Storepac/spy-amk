/**
 * MercadoLivre Product Extractor - Extração de dados do Mercado Livre
 * Compatível com layouts Grid e Stack
 */
class MLExtractor {
    
    static SELECTORS = {
        // Containers principais
        GRID_CONTAINER: 'ol.ui-search-layout.ui-search-layout--grid',
        STACK_CONTAINER: 'ol.ui-search-layout.ui-search-layout--stack',
        SEARCH_ITEMS: '.ui-search-layout__item',
        
        // Dados básicos do produto
        TITLE: 'h2.ui-search-item__title',
        TITLE_LINK: 'h2.ui-search-item__title a',
        PRICE: '.price-tag-amount',
        ORIGINAL_PRICE: '.price-tag.ui-search-price__part',
        DISCOUNT: '.ui-search-price__discount',
        LINK: '.ui-search-link',
        IMAGE: '.ui-search-result-image__element img',
        
        // Reviews e avaliações
        REVIEWS_CONTAINER: '.ui-search-reviews',
        REVIEWS_RATING: '.ui-search-reviews__rating-number',
        REVIEWS_COUNT: '.ui-search-reviews__amount',
        
        // Vendas e informações do vendedor
        SALES: '.ui-search-item__group__element:contains("vendidos")',
        SELLER: '.ui-search-official-store-label',
        OFFICIAL_STORE: '.ui-search-official-store-flag',
        
        // Frete e condições
        SHIPPING: '.ui-search-item__shipping',
        FREE_SHIPPING: '.ui-search-item__shipping:contains("Frete grátis")',
        CONDITION: '.ui-search-item__group__element:contains("usado")',
        
        // Identificadores
        ML_ID: '[data-item-id]',
        RESULT_INDEX: '[data-index]'
    };

    /**
     * Extrair todos os produtos da página
     */
    static extrairProdutosPagina() {
        const produtos = [];
        
        // Tentar layout Grid primeiro
        let container = document.querySelector(this.SELECTORS.GRID_CONTAINER);
        let layoutType = 'grid';
        
        // Se não encontrar Grid, tentar Stack
        if (!container) {
            container = document.querySelector(this.SELECTORS.STACK_CONTAINER);
            layoutType = 'stack';
        }
        
        if (!container) {
            console.error('❌ Nenhum container de produtos encontrado');
            return produtos;
        }
        
        console.log(`📋 Extraindo produtos do layout: ${layoutType}`);
        
        const items = container.querySelectorAll(this.SELECTORS.SEARCH_ITEMS);
        
        items.forEach((item, index) => {
            try {
                const produto = this.extrairDadosProduto(item, index + 1);
                if (produto && produto.titulo) {
                    produtos.push(produto);
                }
            } catch (error) {
                console.error(`Erro ao extrair produto ${index}:`, error);
            }
        });
        
        console.log(`✅ ${produtos.length} produtos extraídos do ML`);
        return produtos;
    }

    /**
     * Extrair dados de um produto específico
     */
    static extrairDadosProduto(elemento, posicao) {
        const dados = {
            // Identificadores
            mlId: this.extrairMLID(elemento),
            posicaoBusca: posicao,
            
            // Dados básicos
            titulo: this.extrairTitulo(elemento),
            link: this.extrairLink(elemento),
            imagem: this.extrairImagem(elemento),
            
            // Preços
            preco: this.extrairPreco(elemento),
            precoOriginal: this.extrairPrecoOriginal(elemento),
            desconto: this.extrairDesconto(elemento),
            
            // Reviews
            avaliacaoNota: this.extrairAvaliacaoNota(elemento),
            avaliacaoQuantidade: this.extrairAvaliacaoQuantidade(elemento),
            
            // Vendas
            vendas: this.extrairVendas(elemento),
            vendasTexto: this.extrairVendasTexto(elemento),
            
            // Vendedor
            vendedor: this.extrairVendedor(elemento),
            lojaOficial: this.isLojaOficial(elemento),
            
            // Frete e condições
            frete: this.extrairFrete(elemento),
            freteGratis: this.hasFreteGratis(elemento),
            condicao: this.extrairCondicao(elemento),
            
            // Metadados
            plataforma: 'mercadolivre',
            dataExtracao: new Date().toISOString()
        };

        // Calcular preço numérico
        dados.precoNumerico = this.converterPrecoNumerico(dados.preco);
        
        // Calcular receita estimada
        dados.receitaEstimada = dados.precoNumerico * (dados.vendas || 0);
        
        // Score de oportunidade ML
        dados.scoreML = this.calcularScoreML(dados);
        
        return dados;
    }

    /**
     * Extrair ML ID (identificador único do produto)
     */
    static extrairMLID(elemento) {
        const mlIdElement = elemento.querySelector(this.SELECTORS.ML_ID);
        return mlIdElement ? mlIdElement.getAttribute('data-item-id') : null;
    }

    /**
     * Extrair título do produto
     */
    static extrairTitulo(elemento) {
        const titleElement = elemento.querySelector(this.SELECTORS.TITLE);
        return titleElement ? titleElement.textContent.trim() : '';
    }

    /**
     * Extrair link do produto
     */
    static extrairLink(elemento) {
        const linkElement = elemento.querySelector(this.SELECTORS.LINK) || 
                           elemento.querySelector(this.SELECTORS.TITLE_LINK);
        
        if (linkElement) {
            let href = linkElement.getAttribute('href');
            // Se for link relativo, converter para absoluto
            if (href && href.startsWith('/')) {
                href = `https://www.mercadolivre.com.br${href}`;
            }
            return href;
        }
        return '';
    }

    /**
     * Extrair imagem do produto
     */
    static extrairImagem(elemento) {
        const imgElement = elemento.querySelector(this.SELECTORS.IMAGE);
        return imgElement ? imgElement.getAttribute('src') || imgElement.getAttribute('data-src') : '';
    }

    /**
     * Extrair preço principal
     */
    static extrairPreco(elemento) {
        const priceElement = elemento.querySelector(this.SELECTORS.PRICE);
        return priceElement ? priceElement.textContent.trim() : '';
    }

    /**
     * Extrair preço original (antes do desconto)
     */
    static extrairPrecoOriginal(elemento) {
        const originalPriceElement = elemento.querySelector(this.SELECTORS.ORIGINAL_PRICE);
        return originalPriceElement ? originalPriceElement.textContent.trim() : '';
    }

    /**
     * Extrair percentual de desconto
     */
    static extrairDesconto(elemento) {
        const discountElement = elemento.querySelector(this.SELECTORS.DISCOUNT);
        if (discountElement) {
            const discountText = discountElement.textContent.trim();
            const match = discountText.match(/(\d+)%/);
            return match ? parseInt(match[1]) : 0;
        }
        return 0;
    }

    /**
     * Extrair nota da avaliação
     */
    static extrairAvaliacaoNota(elemento) {
        const ratingElement = elemento.querySelector(this.SELECTORS.REVIEWS_RATING);
        if (ratingElement) {
            const rating = parseFloat(ratingElement.textContent.trim());
            return isNaN(rating) ? 0 : rating;
        }
        return 0;
    }

    /**
     * Extrair quantidade de avaliações
     */
    static extrairAvaliacaoQuantidade(elemento) {
        const countElement = elemento.querySelector(this.SELECTORS.REVIEWS_COUNT);
        if (countElement) {
            const countText = countElement.textContent.trim();
            // Extrair número de avaliações: "(123)" -> 123
            const match = countText.match(/\((\d+)\)/);
            return match ? parseInt(match[1]) : 0;
        }
        return 0;
    }

    /**
     * Extrair vendas do produto
     */
    static extrairVendas(elemento) {
        const vendasTexto = this.extrairVendasTexto(elemento);
        return this.converterVendasNumerico(vendasTexto);
    }

    /**
     * Extrair texto de vendas
     */
    static extrairVendasTexto(elemento) {
        // Procurar por elementos que contenham "vendidos"
        const salesElements = elemento.querySelectorAll('*');
        for (const el of salesElements) {
            const text = el.textContent.toLowerCase();
            if (text.includes('vendidos') || text.includes('vendas')) {
                return el.textContent.trim();
            }
        }
        return '';
    }

    /**
     * Converter texto de vendas em número
     */
    static converterVendasNumerico(vendasTexto) {
        if (!vendasTexto) return 0;
        
        const texto = vendasTexto.toLowerCase();
        
        // Padrões do ML: "Mais de 1000 vendidos", "500+ vendidos", etc.
        let numero = 0;
        
        // Extrair números do texto
        const numeros = texto.match(/\d+/g);
        if (!numeros) return 0;
        
        numero = parseInt(numeros[0]);
        
        // Aplicar multiplicadores
        if (texto.includes('mil')) {
            numero *= 1000;
        } else if (texto.includes('milhão') || texto.includes('milhao')) {
            numero *= 1000000;
        }
        
        // Se for "mais de X", aplicar margem
        if (texto.includes('mais de') || texto.includes('+')) {
            numero *= 1.2; // 20% a mais como estimativa
        }
        
        return Math.floor(numero);
    }

    /**
     * Extrair informações do vendedor
     */
    static extrairVendedor(elemento) {
        const sellerElement = elemento.querySelector(this.SELECTORS.SELLER);
        return sellerElement ? sellerElement.textContent.trim() : '';
    }

    /**
     * Verificar se é loja oficial
     */
    static isLojaOficial(elemento) {
        return !!elemento.querySelector(this.SELECTORS.OFFICIAL_STORE);
    }

    /**
     * Extrair informações de frete
     */
    static extrairFrete(elemento) {
        const shippingElement = elemento.querySelector(this.SELECTORS.SHIPPING);
        return shippingElement ? shippingElement.textContent.trim() : '';
    }

    /**
     * Verificar se tem frete grátis
     */
    static hasFreteGratis(elemento) {
        return !!elemento.querySelector(this.SELECTORS.FREE_SHIPPING);
    }

    /**
     * Extrair condição do produto
     */
    static extrairCondicao(elemento) {
        const conditionElement = elemento.querySelector(this.SELECTORS.CONDITION);
        if (conditionElement) {
            const text = conditionElement.textContent.toLowerCase();
            if (text.includes('usado')) return 'usado';
            if (text.includes('recondicionado')) return 'recondicionado';
        }
        return 'novo';
    }

    /**
     * Converter preço em texto para número
     */
    static converterPrecoNumerico(precoTexto) {
        if (!precoTexto) return 0;
        
        // Remove símbolos e converte para número
        const numeroStr = precoTexto
            .replace(/[^\d,.]/g, '')  // Remove tudo exceto dígitos, vírgula e ponto
            .replace(/\./g, '')       // Remove pontos (milhares)
            .replace(',', '.');       // Converte vírgula em ponto decimal
        
        const numero = parseFloat(numeroStr);
        return isNaN(numero) ? 0 : numero;
    }

    /**
     * Calcular score de oportunidade específico para ML
     */
    static calcularScoreML(dados) {
        let score = 0;
        
        // Posição na busca (peso 3)
        if (dados.posicaoBusca <= 10) score += 15;
        else if (dados.posicaoBusca <= 30) score += 10;
        else if (dados.posicaoBusca <= 50) score += 5;
        
        // Vendas (peso 3)
        if (dados.vendas > 1000) score += 15;
        else if (dados.vendas > 100) score += 10;
        else if (dados.vendas > 10) score += 5;
        
        // Avaliação (peso 2)
        if (dados.avaliacaoNota >= 4.5) score += 10;
        else if (dados.avaliacaoNota >= 4.0) score += 7;
        else if (dados.avaliacaoNota >= 3.5) score += 4;
        
        // Frete grátis (peso 1)
        if (dados.freteGratis) score += 5;
        
        // Loja oficial (peso 1)
        if (dados.lojaOficial) score += 5;
        
        // Desconto (peso 1)
        if (dados.desconto > 20) score += 5;
        else if (dados.desconto > 10) score += 3;
        
        return Math.min(score, 100); // Máximo 100
    }

    /**
     * Extrair dados da página de produto individual
     */
    static async extrairDetalhesProduto(url) {
        try {
            console.log("🔍 Extraindo detalhes do produto ML:", url);
            
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            return {
                mlId: this.extrairMLIDDetalhes(doc),
                titulo: this.extrairTituloDetalhes(doc),
                preco: this.extrairPrecoDetalhes(doc),
                vendas: this.extrairVendasDetalhes(doc),
                avaliacao: this.extrairAvaliacaoDetalhes(doc),
                vendedor: this.extrairVendedorDetalhes(doc),
                categoria: this.extrairCategoria(doc),
                caracteristicas: this.extrairCaracteristicas(doc)
            };
            
        } catch (error) {
            console.error('Erro ao buscar detalhes do produto ML:', error);
            return null;
        }
    }

    /**
     * Extrair ML ID da página de detalhes
     */
    static extrairMLIDDetalhes(doc) {
        // Tentar diferentes formas de extrair o ML ID
        const metaElement = doc.querySelector('meta[name="twitter:app:url:googleplay"]');
        if (metaElement) {
            const content = metaElement.getAttribute('content');
            const match = content.match(/MLB(\d+)/);
            return match ? `MLB${match[1]}` : null;
        }
        return null;
    }

    /**
     * Debug - Mostrar estrutura da página
     */
    static debugPagina() {
        console.log('🔍 Debug ML Extractor');
        
        const gridContainer = document.querySelector(this.SELECTORS.GRID_CONTAINER);
        const stackContainer = document.querySelector(this.SELECTORS.STACK_CONTAINER);
        
        console.log({
            hasGrid: !!gridContainer,
            hasStack: !!stackContainer,
            itemCount: document.querySelectorAll(this.SELECTORS.SEARCH_ITEMS).length,
            url: window.location.href
        });
        
        // Mostrar alguns produtos como exemplo
        const items = document.querySelectorAll(this.SELECTORS.SEARCH_ITEMS);
        if (items.length > 0) {
            console.log('📋 Primeiros 3 produtos:');
            Array.from(items).slice(0, 3).forEach((item, index) => {
                const produto = this.extrairDadosProduto(item, index + 1);
                console.log(`${index + 1}:`, produto);
            });
        }
    }
} 