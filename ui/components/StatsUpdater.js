/**
 * StatsUpdater - Atualiza estatísticas dinâmicas na interface
 */
class StatsUpdater {
    constructor() {
        this.statsContainer = null;
        this.currentStats = {
            novos: 0,
            existentes: 0,
            subindo: 0,
            descendo: 0,
            mantendo: 0,
            total: 0
        };
    }

    /**
     * Inicializa o atualizador de estatísticas
     */
    inicializar() {
        this.statsContainer = document.getElementById('stats-container');
        if (!this.statsContainer) {
            console.warn('Container de estatísticas não encontrado');
            return false;
        }
        
        console.log('📊 StatsUpdater inicializado');
        return true;
    }

    /**
     * Atualiza estatísticas baseado nos produtos da tabela
     * @param {Array} produtos - Lista de produtos
     * @param {Object} analiseStats - Estatísticas da análise
     */
    atualizarEstatisticas(produtos, analiseStats = null) {
        if (!this.statsContainer) {
            if (!this.inicializar()) return;
        }

        // Calcular estatísticas dos produtos
        const stats = this.calcularEstatisticas(produtos, analiseStats);
        
        // Atualizar interface
        this.renderizarEstatisticas(stats);
        
        // Salvar estatísticas atuais
        this.currentStats = stats;
        
        console.log('📊 Estatísticas atualizadas:', stats);
    }

    /**
     * Calcula estatísticas dos produtos
     * @param {Array} produtos - Lista de produtos
     * @param {Object} analiseStats - Estatísticas da análise
     * @returns {Object} Estatísticas calculadas
     */
    calcularEstatisticas(produtos, analiseStats) {
        const stats = {
            novos: 0,
            existentes: 0,
            subindo: 0,
            descendo: 0,
            mantendo: 0,
            total: produtos.length,
            bsr_medio: 0,
            preco_medio: 0
        };

        let totalBsr = 0;
        let totalPreco = 0;
        let produtosComBsr = 0;
        let produtosComPreco = 0;

        produtos.forEach(produto => {
            // Contar status (novo/existente)
            if (produto.isNovo === false) {
                stats.existentes++;
            } else {
                stats.novos++;
            }
            
            // DEBUG: Log dos primeiros 3 produtos
            if (stats.total <= 3) {
                console.log(`📊 Debug produto ${stats.total}:`, {
                    asin: produto.asin,
                    isNovo: produto.isNovo,
                    tendencia: produto.tendencia?.tendencia || 'sem tendência',
                    tendenciaCompleta: produto.tendencia
                });
            }

            // Contar tendências
            if (produto.tendencia) {
                const tipo = produto.tendencia.tendencia || produto.tendencia.tipo;
                switch (tipo) {
                    case 'subiu':
                        stats.subindo++;
                        break;
                    case 'desceu':
                        stats.descendo++;
                        break;
                    case 'manteve':
                        stats.mantendo++;
                        break;
                }
            }

            // Calcular médias
            if (produto.bsr && produto.bsr > 0) {
                totalBsr += produto.bsr;
                produtosComBsr++;
            }

            if (produto.precoNumerico && produto.precoNumerico > 0) {
                totalPreco += produto.precoNumerico;
                produtosComPreco++;
            }
        });

        // Calcular médias
        stats.bsr_medio = produtosComBsr > 0 ? Math.round(totalBsr / produtosComBsr) : 0;
        stats.preco_medio = produtosComPreco > 0 ? (totalPreco / produtosComPreco).toFixed(2) : 0;

        // Usar dados da análise se disponível
        if (analiseStats) {
            stats.novos = analiseStats.novos || stats.novos;
            stats.existentes = analiseStats.existentes || stats.existentes;
        }

        return stats;
    }

    /**
     * Renderiza as estatísticas na interface
     * @param {Object} stats - Estatísticas calculadas
     */
    renderizarEstatisticas(stats) {
        const html = `
            <div class="stats-grid" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 12px;
                margin: 16px 0;
            ">
                ${this.criarCardStat('📊 Total', stats.total, '#3b82f6')}
                ${this.criarCardStat('🆕 Novos', stats.novos, '#10b981')}
                ${this.criarCardStat('♻️ Existentes', stats.existentes, '#6b7280')}
                ${this.criarCardStat('📈 Subindo', stats.subindo, '#10b981')}
                ${this.criarCardStat('📉 Descendo', stats.descendo, '#ef4444')}
                ${this.criarCardStat('➖ Mantendo', stats.mantendo, '#f59e0b')}
            </div>
            
            <div class="stats-averages" style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-top: 12px;
            ">
                ${this.criarCardStat('📊 BSR Médio', this.formatarNumero(stats.bsr_medio), '#8b5cf6')}
                ${this.criarCardStat('💰 Preço Médio', `R$ ${stats.preco_medio}`, '#06b6d4')}
            </div>
        `;

        this.statsContainer.innerHTML = html;
    }

    /**
     * Cria um card de estatística
     * @param {string} titulo - Título do card
     * @param {string|number} valor - Valor a exibir
     * @param {string} cor - Cor do card
     * @returns {string} HTML do card
     */
    criarCardStat(titulo, valor, cor) {
        return `
            <div style="
                background: linear-gradient(135deg, ${cor}15, ${cor}05);
                border: 1px solid ${cor}30;
                border-radius: 8px;
                padding: 12px;
                text-align: center;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div style="
                    font-size: 11px;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                    font-weight: 500;
                ">${titulo}</div>
                <div style="
                    font-size: 18px;
                    font-weight: 700;
                    color: ${cor};
                ">${valor}</div>
            </div>
        `;
    }

    /**
     * Formata números grandes
     * @param {number} numero - Número para formatar
     * @returns {string} Número formatado
     */
    formatarNumero(numero) {
        if (!numero || numero === 0) return '0';
        
        if (numero >= 1000000) {
            return (numero / 1000000).toFixed(1) + 'M';
        } else if (numero >= 1000) {
            return (numero / 1000).toFixed(1) + 'K';
        }
        
        return numero.toLocaleString('pt-BR');
    }

    /**
     * Atualiza apenas um tipo de estatística
     * @param {string} tipo - Tipo da estatística
     * @param {number} valor - Novo valor
     */
    atualizarEstatisticaIndividual(tipo, valor) {
        if (this.currentStats[tipo] !== undefined) {
            this.currentStats[tipo] = valor;
            this.renderizarEstatisticas(this.currentStats);
        }
    }

    /**
     * Obtém estatísticas atuais
     * @returns {Object} Estatísticas atuais
     */
    getEstatisticasAtuais() {
        return { ...this.currentStats };
    }

    /**
     * Limpa todas as estatísticas
     */
    limpar() {
        if (this.statsContainer) {
            this.statsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhuma estatística disponível</p>';
        }
        
        this.currentStats = {
            novos: 0,
            existentes: 0,
            subindo: 0,
            descendo: 0,
            mantendo: 0,
            total: 0
        };
    }
}

// Expor globalmente
window.StatsUpdater = StatsUpdater;

// Criar instância global
if (!window.statsUpdater) {
    window.statsUpdater = new StatsUpdater();
} 