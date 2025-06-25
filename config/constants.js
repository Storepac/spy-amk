/**
 * Constants - Configurações e constantes do sistema
 */
class Constants {
    // Configurações de UI
    static UI = {
        MODAL_ID: 'amazon-analyzer-modal',
        TABLE_ID: 'tabela-produtos',
        LOADING_CLASS: 'amk-spy-loading',
        THEME_DARK: 'dark-mode',
        THEME_LIGHT: 'light-mode'
    };

    // Configurações de cores
    static COLORS = {
        PRIMARY: '#014641',
        SECONDARY: '#013935',
        SUCCESS: '#10b981',
        WARNING: '#f59e0b',
        ERROR: '#ef4444',
        INFO: '#3b82f6',
        BSR_ELITE: '#10b981',
        BSR_GOOD: '#f59e0b',
        BSR_POOR: '#ef4444'
    };

    // Configurações de BSR
    static BSR = {
        ELITE_MAX: 100,
        GOOD_MAX: 1000,
        REGULAR_MAX: 10000,
        FAIXAS: {
            ELITE: '1-100',
            GOOD: '101-1000',
            REGULAR: '1001-10000',
            POOR: '10001+'
        }
    };

    // Configurações de filtros
    static FILTERS = {
        PRECO_FAIXAS: [
            { value: '0-50', label: 'R$ 0 - R$ 50' },
            { value: '50-100', label: 'R$ 50 - R$ 100' },
            { value: '100-200', label: 'R$ 100 - R$ 200' },
            { value: '200-500', label: 'R$ 200 - R$ 500' },
            { value: '500-1000', label: 'R$ 500 - R$ 1.000' },
            { value: '1000+', label: 'Acima de R$ 1.000' }
        ],
        AVALIACAO_FAIXAS: [
            { value: '4+', label: '4+ estrelas' },
            { value: '4.5+', label: '4.5+ estrelas' },
            { value: '5', label: '5 estrelas' }
        ],
        VENDAS_ORDENACAO: [
            { value: 'mais-vendidos', label: '🔥 Mais vendidos primeiro' },
            { value: 'menos-vendidos', label: '📉 Menos vendidos primeiro' }
        ],
        TIPO_PRODUTO: [
            { value: 'patrocinado', label: 'Patrocinados' },
            { value: 'organico', label: 'Orgânicos' }
        ]
    };

    // Configurações de performance
    static PERFORMANCE = {
        BATCH_SIZE: 5,
        DELAY_BETWEEN_BATCHES: 300,
        MAX_RETRIES: 3,
        TIMEOUT: 10000
    };

    // Configurações de notificações
    static NOTIFICATIONS = {
        DURATION: {
            SHORT: 3000,
            MEDIUM: 5000,
            LONG: 8000
        },
        TYPES: {
            SUCCESS: 'success',
            ERROR: 'error',
            WARNING: 'warning',
            INFO: 'info'
        }
    };

    // Configurações de exportação
    static EXPORT = {
        CSV_DELIMITER: ',',
        EXCEL_SHEET_NAME: 'Produtos Amazon',
        DATE_FORMAT: 'DD/MM/YYYY HH:mm:ss'
    };

    // Configurações de URLs
    static URLS = {
        AMAZON_BR: 'https://www.amazon.com.br',
        AMAZON_SEARCH: 'https://www.amazon.com.br/s?k=',
        AMAZON_PRODUCT: 'https://www.amazon.com.br/dp/'
    };

    // Configurações de seletores CSS
    static SELECTORS = {
        PRODUTO: '[data-asin]:not([data-asin=""])',
        PRODUTO_FALLBACK: '.s-result-item[data-component-type="s-search-result"]',
        PRODUTO_GENERIC: '.s-card-container',
        TITULO: 'h2 a, .a-link-normal[href*="/dp/"]',
        PRECO: '.a-price-whole, .a-price .a-offscreen',
        AVALIACAO: '.a-icon-alt, .a-star-rating-text',
        IMAGEM: 'img[src*="images"], .s-image'
    };

    // Configurações de regex
    static REGEX = {
        ASIN: /\/dp\/([A-Z0-9]{10})/,
        PRECO: /R\$\s*([\d.,]+)/,
        AVALIAÇÃO: /(\d+[.,]\d+)/,
        NUM_AVALIAÇÕES: /(\d+(?:\.\d+)?)\s*avaliações?/i,
        VENDAS: /(\d+(?:\.\d+)?)\s*vendidos?/i
    };

    // Configurações de mensagens
    static MESSAGES = {
        LOADING: {
            INICIAL: 'Carregando produtos...',
            DETALHES: 'Buscando detalhes dos produtos...',
            MARCAS: 'Buscando marcas faltantes...',
            COMPLETO: 'Análise completa!'
        },
        ERROR: {
            NENHUM_PRODUTO: 'Nenhum produto encontrado na página.',
            EXTRACAO_FALHOU: 'Erro ao extrair dados do produto.',
            COPIA_FALHOU: 'Erro ao copiar ASIN. Tente novamente.',
            COMPONENTE_FALTANDO: 'Componente necessário não foi carregado.'
        },
        SUCCESS: {
            PRODUTOS_COLETADOS: 'Produtos coletados com sucesso!',
            ASIN_COPIADO: 'ASIN copiado para a área de transferência!',
            FILTROS_APLICADOS: 'Filtros aplicados com sucesso!'
        }
    };

    // Configurações de métricas
    static METRICS = {
        COMPETITIVIDADE: {
            ALTA: { bsrMax: 1000, avaliacaoMin: 4.0, label: 'Alta 🟢' },
            MEDIA: { bsrMax: 5000, avaliacaoMin: 3.5, label: 'Média 🟡' },
            BAIXA: { bsrMax: Infinity, avaliacaoMin: 0, label: 'Baixa 🔴' }
        }
    };

    // Configurações de tema
    static THEME = {
        CSS_VARS: {
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f8fafc',
            '--text-primary': '#1f2937',
            '--text-secondary': '#6b7280',
            '--border-light': '#e5e7eb',
            '--shadow': '0 1px 3px rgba(0,0,0,0.1)',
            '--shadow-heavy': '0 10px 25px rgba(0,0,0,0.15)'
        },
        CSS_VARS_DARK: {
            '--bg-primary': '#1f2937',
            '--bg-secondary': '#374151',
            '--text-primary': '#f9fafb',
            '--text-secondary': '#d1d5db',
            '--border-light': '#4b5563',
            '--shadow': '0 1px 3px rgba(0,0,0,0.3)',
            '--shadow-heavy': '0 10px 25px rgba(0,0,0,0.4)'
        }
    };
}

window.Constants = Constants; 