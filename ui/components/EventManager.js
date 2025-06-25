/**
 * EventManager - Gerenciamento centralizado de eventos
 */
class EventManager {
    constructor() {
        this.eventos = new Map();
        this.inicializado = false;
    }

    inicializar() {
        if (this.inicializado) return;
        
        this.configurarEventosFiltros();
        this.configurarEventosExportacao();
        this.configurarEventosBusca();
        this.configurarEventosTema();
        this.configurarEventosFechamento();
        
        this.inicializado = true;
    }

    configurarEventosFiltros() {
        // Botões de filtro
        this.adicionarEvento('btn-aplicar-filtros', 'click', () => {
            if (TableManager.filterManager) {
                TableManager.filterManager.aplicarFiltros();
            }
        });

        this.adicionarEvento('btn-limpar-filtros', 'click', () => {
            if (TableManager.filterManager) {
                TableManager.filterManager.limparFiltros();
            }
        });

        // Configurar eventos do FilterManager
        if (TableManager.filterManager) {
            TableManager.filterManager.configurarEventos();
        }
    }

    configurarEventosExportacao() {
        // Exportar CSV
        this.adicionarEvento('btn-exportar-csv', 'click', () => {
            if (TableManager.exportManager) {
                TableManager.exportManager.exportarCSV();
            }
        });

        // Exportar Excel
        this.adicionarEvento('btn-exportar-excel', 'click', () => {
            if (TableManager.exportManager) {
                TableManager.exportManager.exportarExcel();
            }
        });
    }

    configurarEventosBusca() {
        // Busca por nome
        this.adicionarEvento('busca-nome', 'input', (e) => {
            if (TableManager.filterManager) {
                TableManager.filterManager.aplicarFiltros();
            }
        });

        // Nova busca
        this.adicionarEvento('btn-buscar', 'click', () => {
            TableManager.realizarNovaBusca();
        });

        // Busca por Enter
        this.adicionarEvento('nova-busca', 'keypress', (e) => {
            if (e.key === 'Enter') {
                TableManager.realizarNovaBusca();
            }
        });

        // Buscar marcas
        this.adicionarEvento('btn-buscar-marcas', 'click', () => {
            if (window.produtosTabela) {
                ProductAnalyzer.buscarMarcasFaltantes(window.produtosTabela, (produto, index) => {
                    TableManager.atualizarLinhaProduto(produto, index);
                });
            }
        });
    }

    configurarEventosTema() {
        this.adicionarEvento('btn-tema', 'click', () => {
            if (TableManager.themeManager) {
                TableManager.themeManager.toggleTheme();
            }
        });
    }

    configurarEventosFechamento() {
        this.adicionarEvento('fechar-analise', 'click', () => {
            TableManager.fecharModal();
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                TableManager.fecharModal();
            }
        });

        // Fechar clicando fora do modal
        this.adicionarEvento('amazon-analyzer-modal', 'click', (e) => {
            if (e.target.id === 'amazon-analyzer-modal') {
                TableManager.fecharModal();
            }
        });
    }

    adicionarEvento(elementId, tipo, callback) {
        const elemento = document.getElementById(elementId);
        if (!elemento) {
            console.warn(`Elemento ${elementId} não encontrado para evento ${tipo}`);
            return;
        }

        const chave = `${elementId}-${tipo}`;
        if (this.eventos.has(chave)) {
            elemento.removeEventListener(tipo, this.eventos.get(chave));
        }

        elemento.addEventListener(tipo, callback);
        this.eventos.set(chave, callback);
    }

    removerEvento(elementId, tipo) {
        const chave = `${elementId}-${tipo}`;
        const callback = this.eventos.get(chave);
        if (callback) {
            const elemento = document.getElementById(elementId);
            if (elemento) {
                elemento.removeEventListener(tipo, callback);
            }
            this.eventos.delete(chave);
        }
    }

    limparTodosEventos() {
        this.eventos.forEach((callback, chave) => {
            const [elementId, tipo] = chave.split('-');
            const elemento = document.getElementById(elementId);
            if (elemento) {
                elemento.removeEventListener(tipo, callback);
            }
        });
        this.eventos.clear();
        this.inicializado = false;
    }

    // Métodos específicos para eventos da tabela
    configurarEventosTabela() {
        // Eventos de clique nos BSR
        document.addEventListener('click', (e) => {
            if (e.target.closest('td[onclick*="toggleRankingInfo"]')) {
                TableManager.toggleRankingInfo(e.target);
            }
        });

        // Eventos de copiar ASIN
        document.addEventListener('click', (e) => {
            if (e.target.closest('button[onclick*="copiarASIN"]')) {
                const asin = e.target.getAttribute('onclick').match(/'([^']+)'/)?.[1];
                if (asin) {
                    TableManager.copiarASIN(asin);
                }
            }
        });
    }
}

window.EventManager = EventManager; 