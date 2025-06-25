class ThemeManager {
    constructor() {
        this.isDarkMode = this.detectDarkMode();
        this.init();
    }

    detectDarkMode() {
        return false; // Sempre inicia no modo claro
    }

    init() {
        this.injectThemeCSS();
        this.setupThemeToggle();
        this.applyTheme();
    }

    injectThemeCSS() {
        if (document.querySelector('#amk-spy-theme')) return;

        const themeCSS = `
            <style id="amk-spy-theme">
                /* Variáveis de tema */
                :root {
                    --bg-primary: #ffffff;
                    --bg-secondary: #f8fafc;
                    --bg-tertiary: #ffffff;
                    --text-primary: #374151;
                    --text-secondary: #64748b;
                    --border-color: #e2e8f0;
                    --border-light: #d1d5db;
                    --border-table: #f0f0f0;
                    --shadow: 0 2px 4px rgba(0,0,0,0.05);
                    --shadow-heavy: 0 25px 50px rgba(0,0,0,0.2);
                }

                .dark-mode {
                    --bg-primary: #1a1a1a;
                    --bg-secondary: #2d2d2d;
                    --bg-tertiary: #1a1a1a;
                    --text-primary: #e0e0e0;
                    --text-secondary: #a0a0a0;
                    --border-color: #404040;
                    --border-light: #404040;
                    --border-table: #333333;
                    --shadow: 0 2px 4px rgba(0,0,0,0.2);
                    --shadow-heavy: 0 25px 50px rgba(0,0,0,0.6);
                }

                /* Aplicar variáveis */
                .amk-spy-container {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }

                .amk-spy-bg-secondary {
                    background: var(--bg-secondary);
                }

                .amk-spy-bg-tertiary {
                    background: var(--bg-tertiary);
                }

                .amk-spy-text-primary {
                    color: var(--text-primary);
                }

                .amk-spy-text-secondary {
                    color: var(--text-secondary);
                }

                .amk-spy-border {
                    border-color: var(--border-color);
                }

                .amk-spy-border-light {
                    border-color: var(--border-light);
                }

                .amk-spy-shadow {
                    box-shadow: var(--shadow);
                }

                .amk-spy-shadow-heavy {
                    box-shadow: var(--shadow-heavy);
                }

                /* Aplicar tema ao modal principal */
                #amazon-analyzer-modal.dark-mode {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }

                #amazon-analyzer-modal.dark-mode .amk-spy-bg-secondary {
                    background: var(--bg-secondary);
                }

                #amazon-analyzer-modal.dark-mode .amk-spy-bg-tertiary {
                    background: var(--bg-tertiary);
                }

                #amazon-analyzer-modal.dark-mode .amk-spy-text-primary {
                    color: var(--text-primary);
                }

                #amazon-analyzer-modal.dark-mode .amk-spy-text-secondary {
                    color: var(--text-secondary);
                }

                #amazon-analyzer-modal.dark-mode .amk-spy-border {
                    border-color: var(--border-color);
                }

                #amazon-analyzer-modal.dark-mode .amk-spy-border-light {
                    border-color: var(--border-light);
                }

                /* Transições suaves */
                .amk-spy-transition {
                    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
                }

                /* Animações */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideIn {
                    from { 
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes slideDown {
                    from { 
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }

                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
                    40%, 43% { transform: translate3d(0, -8px, 0); }
                    70% { transform: translate3d(0, -4px, 0); }
                    90% { transform: translate3d(0, -2px, 0); }
                }

                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                .animate-slide-in { animation: slideIn 0.4s ease-out; }
                .animate-slide-down { animation: slideDown 0.3s ease-out; }
                .animate-pulse { animation: pulse 2s infinite; }
                .animate-bounce { animation: bounce 1s; }

                /* Hover effects */
                .hover-scale:hover { transform: scale(1.02); }
                .hover-lift:hover { 
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }
                .hover-glow:hover { 
                    box-shadow: 0 0 20px rgba(106, 199, 104, 0.3);
                }

                /* Transições */
                .transition-all { transition: all 0.2s ease; }
                .transition-transform { transition: transform 0.2s ease; }
                .transition-opacity { transition: opacity 0.2s ease; }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', themeCSS);
    }

    setupThemeToggle() {
        // O botão será criado na interface da tabela, não aqui
        // Apenas configurar o evento quando o botão existir
        this.updateThemeButton();
    }

    updateThemeButton() {
        const toggleButton = document.getElementById('btn-tema');
        if (toggleButton) {
            toggleButton.innerHTML = this.isDarkMode ? '☀️' : '🌙';
            toggleButton.title = this.isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro';
            
            // Remover eventos anteriores para evitar duplicação
            toggleButton.replaceWith(toggleButton.cloneNode(true));
            
            // Adicionar novo evento
            const newToggleButton = document.getElementById('btn-tema');
            newToggleButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        this.updateThemeButton();
    }

    applyTheme() {
        // Aplicar tema no modal principal
        const modal = document.getElementById('amazon-analyzer-modal');
        if (modal) {
            if (this.isDarkMode) {
                modal.classList.add('dark-mode');
            } else {
                modal.classList.remove('dark-mode');
            }
        }
        
        // Aplicar tema em todos os elementos que usam variáveis CSS
        this.updateThemeColors();
        
        // Atualizar botão de tema
        this.updateThemeButton();
    }
    
    updateThemeColors() {
        // Atualizar cores de fundo e texto em toda a interface
        const elements = document.querySelectorAll('.amk-spy-container, .amk-spy-bg-secondary, .amk-spy-bg-tertiary');
        elements.forEach(element => {
            element.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        });
        
        // Forçar reflow para aplicar transições
        document.body.offsetHeight;
    }

    getThemeClass() {
        return this.isDarkMode ? 'dark-mode' : '';
    }

    getThemeColors() {
        return {
            bgPrimary: this.isDarkMode ? '#1a1a1a' : '#ffffff',
            bgSecondary: this.isDarkMode ? '#2d2d2d' : '#f8fafc',
            bgTertiary: this.isDarkMode ? '#1a1a1a' : '#ffffff',
            textPrimary: this.isDarkMode ? '#e0e0e0' : '#374151',
            textSecondary: this.isDarkMode ? '#a0a0a0' : '#64748b',
            borderColor: this.isDarkMode ? '#404040' : '#e2e8f0',
            borderLight: this.isDarkMode ? '#404040' : '#d1d5db'
        };
    }
}

window.ThemeManager = ThemeManager; 
window.ThemeManager = ThemeManager; 
