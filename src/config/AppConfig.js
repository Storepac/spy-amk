/**
 * AppConfig - Configuração centralizada da aplicação
 * Todas as configurações, constantes e definições do sistema
 */

const AppConfig = {
    // ===== INFORMAÇÕES DA APLICAÇÃO =====
    APP: {
        NAME: 'AMK Spy',
        VERSION: '2.0.0',
        DESCRIPTION: 'Analisador avançado de produtos da Amazon',
        AUTHOR: 'AMK Team',
        WEBSITE: 'https://amkspy.com'
    },

    // ===== CONFIGURAÇÕES DE ANÁLISE =====
    ANALYSIS: {
        MAX_PAGES: 5,
        DELAY_BETWEEN_PAGES: 300,
        BATCH_SIZE: 20,
        TIMEOUT: 10000,
        MAX_RETRIES: 3,
        PROGRESS_UPDATE_INTERVAL: 100
    },

    // ===== CONFIGURAÇÕES DE UI =====
    UI: {
        THEME: {
            LIGHT: 'light',
            DARK: 'dark',
            AUTO: 'auto'
        },
        MODAL: {
            SIZES: {
                SMALL: 'small',
                MEDIUM: 'medium',
                LARGE: 'large',
                FULLSCREEN: 'fullscreen'
            },
            ANIMATION_DURATION: 300
        },
        NOTIFICATION: {
            DEFAULT_DURATION: 3000,
            MAX_NOTIFICATIONS: 5,
            POSITION: 'top-right'
        },
        TABLE: {
            ITEMS_PER_PAGE: 50,
            MAX_VISIBLE_ROWS: 100,
            SORT_OPTIONS: ['posicao', 'preco', 'avaliacao', 'vendas', 'bsr']
        }
    },

    // ===== CONFIGURAÇÕES DE FILTROS =====
    FILTERS: {
        PRICE_RANGES: [
            { label: '💵 Todos os preços', value: '' },
            { label: 'R$ 0 - R$ 50', value: '0-50' },
            { label: 'R$ 50 - R$ 100', value: '50-100' },
            { label: 'R$ 100 - R$ 200', value: '100-200' },
            { label: 'R$ 200 - R$ 500', value: '200-500' },
            { label: 'R$ 500 - R$ 1000', value: '500-1000' },
            { label: 'R$ 1000+', value: '1000+' }
        ],
        RATING_OPTIONS: [
            { label: '⭐ Todas as avaliações', value: '' },
            { label: '4+ estrelas', value: '4' },
            { label: '4.5+ estrelas', value: '4.5' },
            { label: '5 estrelas', value: '5' }
        ],
        BSR_RANGES: [
            { label: '🏆 Todos os rankings', value: '' },
            { label: '🥇 Top 100', value: '1-100' },
            { label: '🥈 Top 1000', value: '1-1000' },
            { label: '🥉 Top 5000', value: '1-5000' },
            { label: '📊 101-1000', value: '101-1000' },
            { label: '📈 1001-10000', value: '1001-10000' },
            { label: '📉 10000+', value: '10000+' }
        ],
        POSITION_RANGES: [
            { label: '🏆 Todas as posições', value: '' },
            { label: '🥇 Top 10', value: '1-10' },
            { label: '🥈 Top 50', value: '1-50' },
            { label: '🥉 Top 100', value: '1-100' },
            { label: '📊 11-50', value: '11-50' },
            { label: '📈 51-100', value: '51-100' },
            { label: '📉 101-500', value: '101-500' },
            { label: '🔻 500+', value: '500+' }
        ],
        TYPE_OPTIONS: [
            { label: '🎯 Todos os tipos', value: '' },
            { label: '💰 Patrocinado', value: 'patrocinado' },
            { label: '🎯 Orgânico', value: 'organico' }
        ]
    },

    // ===== CONFIGURAÇÕES DE EXPORTAÇÃO =====
    EXPORT: {
        FORMATS: {
            CSV: 'csv',
            EXCEL: 'xlsx',
            JSON: 'json'
        },
        FIELDS: [
            'posicaoGlobal',
            'titulo',
            'asin',
            'marca',
            'preco',
            'precoNumerico',
            'avaliacao',
            'avaliacaoNumerica',
            'numAvaliacoes',
            'vendidos',
            'receitaMes',
            'ranking',
            'categoria',
            'patrocinado',
            'organico',
            'paginaOrigem',
            'posicaoNaPagina',
            'link'
        ],
        FILENAME_PREFIX: 'amk-spy-export',
        DATE_FORMAT: 'YYYY-MM-DD_HH-mm-ss'
    },

    // ===== CONFIGURAÇÕES DE ARMAZENAMENTO =====
    STORAGE: {
        KEYS: {
            STATE: 'amk-spy-estado',
            CONFIG: 'amk-spy-config',
            ERROR_LOGS: 'amk-spy-error-logs',
            ANALYTICS: 'amk-spy-analytics'
        },
        MAX_ERROR_LOGS: 50,
        MAX_ANALYTICS_ENTRIES: 100
    },

    // ===== CONFIGURAÇÕES DE SELETORES =====
    SELECTORS: {
        PRODUCTS: [
            '[data-asin]:not([data-asin=""])',
            '.s-result-item[data-component-type="s-search-result"]',
            '.s-card-container'
        ],
        TITLE: [
            'h2 a span',
            '.a-size-base-plus',
            '.a-text-normal'
        ],
        PRICE: [
            '.a-price-whole',
            '.a-price .a-offscreen',
            '.a-price-current'
        ],
        RATING: [
            '.a-icon-alt',
            '.a-icon-star-small .a-icon-alt'
        ],
        IMAGE: [
            'img[src*="images-na.ssl-images-amazon.com"]',
            '.s-image'
        ],
        LINK: [
            'h2 a',
            '.a-link-normal'
        ]
    },

    // ===== CONFIGURAÇÕES DE VALIDAÇÃO =====
    VALIDATION: {
        MIN_TITLE_LENGTH: 10,
        MAX_TITLE_LENGTH: 200,
        MIN_PRICE: 0,
        MAX_PRICE: 100000,
        MIN_RATING: 0,
        MAX_RATING: 5,
        ASIN_PATTERN: /^[A-Z0-9]{10}$/,
        URL_PATTERN: /^https:\/\/www\.amazon\.com\.br\/.*$/
    },

    // ===== CONFIGURAÇÕES DE PERFORMANCE =====
    PERFORMANCE: {
        DEBOUNCE_DELAY: 300,
        THROTTLE_DELAY: 100,
        BATCH_SIZE: 20,
        MAX_CONCURRENT_REQUESTS: 5,
        CACHE_DURATION: 5 * 60 * 1000 // 5 minutos
    },

    // ===== CONFIGURAÇÕES DE LOGGING =====
    LOGGING: {
        LEVELS: {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        },
        CURRENT_LEVEL: 2, // INFO
        ENABLE_CONSOLE: true,
        ENABLE_STORAGE: true
    },

    // ===== MENSAGENS =====
    MESSAGES: {
        SUCCESS: {
            ANALYSIS_COMPLETE: 'Análise concluída com sucesso!',
            DATA_EXPORTED: 'Dados exportados com sucesso!',
            SETTINGS_SAVED: 'Configurações salvas!',
            FILTERS_CLEARED: 'Filtros limpos!',
            ASIN_COPIED: 'ASIN copiado para a área de transferência!'
        },
        ERROR: {
            ANALYSIS_FAILED: 'Erro na análise. Tente novamente.',
            EXPORT_FAILED: 'Erro na exportação. Tente novamente.',
            INVALID_PAGE: 'Página não suportada.',
            NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
            UNKNOWN_ERROR: 'Erro inesperado. Tente novamente.'
        },
        INFO: {
            LOADING: 'Carregando...',
            PROCESSING: 'Processando dados...',
            NO_PRODUCTS: 'Nenhum produto encontrado.',
            NEW_SEARCH: 'Nova pesquisa detectada. Faça uma nova análise.'
        }
    },

    // ===== CONFIGURAÇÕES DE TEMA =====
    THEMES: {
        LIGHT: {
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f9fafb',
            '--bg-tertiary': '#f3f4f6',
            '--text-primary': '#111827',
            '--text-secondary': '#6b7280',
            '--text-tertiary': '#9ca3af',
            '--border-light': '#e5e7eb',
            '--border-medium': '#d1d5db',
            '--accent-primary': '#3b82f6',
            '--accent-secondary': '#1d4ed8',
            '--success': '#10b981',
            '--warning': '#f59e0b',
            '--error': '#ef4444',
            '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        },
        DARK: {
            '--bg-primary': '#1f2937',
            '--bg-secondary': '#111827',
            '--bg-tertiary': '#374151',
            '--text-primary': '#f9fafb',
            '--text-secondary': '#d1d5db',
            '--text-tertiary': '#9ca3af',
            '--border-light': '#374151',
            '--border-medium': '#4b5563',
            '--accent-primary': '#60a5fa',
            '--accent-secondary': '#3b82f6',
            '--success': '#34d399',
            '--warning': '#fbbf24',
            '--error': '#f87171',
            '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
            '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        }
    },

    // ===== MÉTODOS UTILITÁRIOS =====
    UTILS: {
        // Obter configuração
        get(key, defaultValue = null) {
            const keys = key.split('.');
            let value = AppConfig;
            
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return defaultValue;
                }
            }
            
            return value;
        },

        // Definir configuração
        set(key, value) {
            const keys = key.split('.');
            const lastKey = keys.pop();
            let obj = AppConfig;
            
            for (const k of keys) {
                if (!(k in obj) || typeof obj[k] !== 'object') {
                    obj[k] = {};
                }
                obj = obj[k];
            }
            
            obj[lastKey] = value;
        },

        // Obter tema atual
        getCurrentTheme() {
            const savedTheme = localStorage.getItem('amk-spy-theme');
            if (savedTheme && AppConfig.UI.THEME[savedTheme.toUpperCase()]) {
                return savedTheme;
            }
            
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return AppConfig.UI.THEME.DARK;
            }
            
            return AppConfig.UI.THEME.LIGHT;
        },

        // Aplicar tema
        applyTheme(themeName) {
            const theme = AppConfig.THEMES[themeName.toUpperCase()];
            if (!theme) return;
            
            Object.entries(theme).forEach(([property, value]) => {
                document.documentElement.style.setProperty(property, value);
            });
            
            localStorage.setItem('amk-spy-theme', themeName);
        },

        // Formatar número
        formatNumber(num, locale = 'pt-BR') {
            if (num === null || num === undefined) return 'N/A';
            return num.toLocaleString(locale);
        },

        // Formatar moeda
        formatCurrency(num, locale = 'pt-BR', currency = 'BRL') {
            if (num === null || num === undefined) return 'N/A';
            return num.toLocaleString(locale, {
                style: 'currency',
                currency: currency
            });
        },

        // Debounce
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Log
        log(level, message, data = null) {
            const levels = AppConfig.LOGGING.LEVELS;
            const currentLevel = AppConfig.LOGGING.CURRENT_LEVEL;
            
            if (level <= currentLevel) {
                const timestamp = new Date().toISOString();
                const logEntry = { timestamp, level, message, data };
                
                if (AppConfig.LOGGING.ENABLE_CONSOLE) {
                    const consoleMethod = level === levels.ERROR ? 'error' : 
                                        level === levels.WARN ? 'warn' : 
                                        level === levels.INFO ? 'info' : 'log';
                    console[consoleMethod](`[AMK Spy] ${message}`, data);
                }
                
                if (AppConfig.LOGGING.ENABLE_STORAGE) {
                    this.saveLog(logEntry);
                }
            }
        },

        // Salvar log
        saveLog(logEntry) {
            try {
                const logs = JSON.parse(localStorage.getItem(AppConfig.STORAGE.KEYS.ERROR_LOGS) || '[]');
                logs.push(logEntry);
                
                if (logs.length > AppConfig.STORAGE.MAX_ERROR_LOGS) {
                    logs.splice(0, logs.length - AppConfig.STORAGE.MAX_ERROR_LOGS);
                }
                
                localStorage.setItem(AppConfig.STORAGE.KEYS.ERROR_LOGS, JSON.stringify(logs));
            } catch (error) {
                console.error('Erro ao salvar log:', error);
            }
        }
    }
};

// Expor para uso global
window.AppConfig = AppConfig; 