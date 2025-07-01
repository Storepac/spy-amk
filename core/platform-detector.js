/**
 * Platform Detector - Detecta qual marketplace está sendo acessado
 * Suporta: Amazon, Mercado Livre, e futuras plataformas
 */
class PlatformDetector {
    static PLATFORMS = {
        AMAZON: 'amazon',
        MERCADO_LIVRE: 'mercadolivre',
        UNKNOWN: 'unknown'
    };

    static URLs = {
        AMAZON: [
            'amazon.com.br',
            'amazon.com'
        ],
        MERCADO_LIVRE: [
            'mercadolivre.com.br',
            'lista.mercadolivre.com.br',
            'produto.mercadolivre.com.br'
        ]
    };

    /**
     * Detecta a plataforma atual baseada na URL
     */
    static detectPlatform() {
        const hostname = window.location.hostname.toLowerCase();
        const url = window.location.href.toLowerCase();

        // Detectar Amazon
        if (this.URLs.AMAZON.some(domain => hostname.includes(domain))) {
            return {
                platform: this.PLATFORMS.AMAZON,
                type: this.detectAmazonPageType(),
                config: this.getAmazonConfig()
            };
        }

        // Detectar Mercado Livre
        if (this.URLs.MERCADO_LIVRE.some(domain => hostname.includes(domain))) {
            return {
                platform: this.PLATFORMS.MERCADO_LIVRE,
                type: this.detectMLPageType(),
                config: this.getMLConfig()
            };
        }

        return {
            platform: this.PLATFORMS.UNKNOWN,
            type: null,
            config: null
        };
    }

    /**
     * Detecta o tipo de página da Amazon
     */
    static detectAmazonPageType() {
        const url = window.location.href;
        
        if (url.includes('/s?') || url.includes('/s/')) {
            return 'search';
        }
        if (url.includes('/dp/')) {
            return 'product';
        }
        if (url.includes('/gp/bestsellers')) {
            return 'bestsellers';
        }
        
        return 'other';
    }

    /**
     * Detecta o tipo de página do Mercado Livre
     */
    static detectMLPageType() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        if (hostname.includes('lista.mercadolivre')) {
            return 'search';
        }
        if (hostname.includes('produto.mercadolivre') || pathname.includes('/p/')) {
            return 'product';
        }
        if (pathname.includes('/ofertas')) {
            return 'deals';
        }
        
        return 'other';
    }

    /**
     * Configurações específicas da Amazon
     */
    static getAmazonConfig() {
        return {
            name: 'Amazon',
            color: '#FF9900',
            icon: '📦',
            currency: 'BRL',
            selectors: {
                searchResults: '[data-asin]:not([data-asin=""])',
                productTitle: '#productTitle',
                price: '.a-price-whole',
                image: '#landingImage',
            },
            features: {
                hasBSR: true,
                hasASIN: true,
                hasVendas: true,
                hasCategorias: true
            }
        };
    }

    /**
     * Configurações específicas do Mercado Livre
     */
    static getMLConfig() {
        return {
            name: 'Mercado Livre',
            color: '#FFE600',
            icon: '🛒',
            currency: 'BRL',
            selectors: {
                searchResults: '.ui-search-layout__item',
                productTitle: 'h2.ui-search-item__title',
                price: '.price-tag-amount',
                image: '.ui-search-result-image__element img',
            },
            features: {
                hasPosition: true,
                hasMLID: true,
                hasReviews: true,
                hasVendas: true,
                hasShipping: true,
                hasCondition: true,
                hasOfficialStore: true
            }
        };
    }

    /**
     * Verifica se a página atual é compatível
     */
    static isCompatiblePage() {
        const detection = this.detectPlatform();
        
        if (detection.platform === this.PLATFORMS.UNKNOWN) {
            return false;
        }

        // Para Amazon, verificar se é página de busca
        if (detection.platform === this.PLATFORMS.AMAZON) {
            return detection.type === 'search';
        }

        // Para ML, verificar se é página de busca
        if (detection.platform === this.PLATFORMS.MERCADO_LIVRE) {
            return detection.type === 'search';
        }

        return false;
    }

    /**
     * Obter dados da busca atual
     */
    static getCurrentSearchData() {
        const detection = this.detectPlatform();
        
        if (detection.platform === this.PLATFORMS.AMAZON) {
            return this.getAmazonSearchData();
        }

        if (detection.platform === this.PLATFORMS.MERCADO_LIVRE) {
            return this.getMLSearchData();
        }

        return null;
    }

    /**
     * Extrair dados de busca da Amazon
     */
    static getAmazonSearchData() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            searchTerm: urlParams.get('k') || urlParams.get('field-keywords') || '',
            category: urlParams.get('i') || '',
            page: urlParams.get('page') || '1'
        };
    }

    /**
     * Extrair dados de busca do Mercado Livre
     */
    static getMLSearchData() {
        const url = new URL(window.location.href);
        const pathname = url.pathname;
        
        // Extrair termo de busca da URL
        let termoPesquisa = '';
        
        if (pathname.includes('/')) {
            const partes = pathname.split('/');
            termoPesquisa = partes[partes.length - 1].replace(/-/g, ' ');
        }
        
        // Tentar extrair de hash fragment também
        if (url.hash.includes('D[A:')) {
            const match = url.hash.match(/D\[A:([^\]]+)\]/);
            if (match) {
                termoPesquisa = decodeURIComponent(match[1]);
            }
        }
        
        return {
            searchTerm: termoPesquisa || '',
            category: url.searchParams.get('category') || '',
            page: url.searchParams.get('_from') || '1'
        };
    }
    
    /**
     * Callback para mudança de plataforma
     */
    static onPlatformChange(callback) {
        let currentPlatform = this.detectPlatform().platform;
        
        // Observer para mudanças de URL
        const observer = new MutationObserver(() => {
            const newPlatform = this.detectPlatform().platform;
            if (newPlatform !== currentPlatform) {
                currentPlatform = newPlatform;
                callback(newPlatform);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Também observar mudanças de URL via popstate
        window.addEventListener('popstate', () => {
            const newPlatform = this.detectPlatform().platform;
            if (newPlatform !== currentPlatform) {
                currentPlatform = newPlatform;
                callback(newPlatform);
            }
        });
    }
    
    /**
     * Inicializar detector
     */
    static init() {
        const detection = this.detectPlatform();
        console.log('🔍 Plataforma detectada:', detection);
        
        // Registrar no window para acesso global
        window.currentPlatform = detection;
        
        return detection;
    }
}

// Expor globalmente
window.PlatformDetector = PlatformDetector;