/**
 * StatsManager - Gerenciador de estatísticas/KPIs em tempo real
 * Sincronizado com os filtros aplicados na tabela
 */
class StatsManager {
    constructor() {
        this.produtos = [];
        this.produtosFiltrados = [];
        this.container = null;
    }

    /**
     * Inicializa o gerenciador de estatísticas
     * @param {Array} produtos - Array de produtos
     */
    inicializar(produtos) {
        this.produtos = produtos;
        this.produtosFiltrados = produtos;
        this.criarContainer();
        this.atualizarEstatisticas(produtos);
    }

    /**
     * Cria o container HTML para os cards de estatísticas
     */
    criarContainer() {
        // Procura por um container existente
        this.container = document.getElementById('stats-container');
        
        if (!this.container) {
            // Cria o container se não existir
            this.container = document.createElement('div');
            this.container.id = 'stats-container';
            
            // Insere o container DEPOIS dos filtros mas ANTES da tabela
            const tabelaProdutos = document.querySelector('#tabela-produtos');
            if (tabelaProdutos) {
                tabelaProdutos.parentElement.insertBefore(this.container, tabelaProdutos);
            }
        }
    }

    /**
     * Atualiza as estatísticas com base nos produtos filtrados
     * @param {Array} produtosFiltrados - Array de produtos filtrados
     */
    atualizarEstatisticas(produtosFiltrados) {
        this.produtosFiltrados = produtosFiltrados;
        
        const stats = this.calcularEstatisticas(produtosFiltrados);
        this.renderizarCards(stats);
    }

    /**
     * Calcula todas as estatísticas necessárias
     * @param {Array} produtos - Array de produtos para calcular
     * @returns {Object} Objeto com todas as estatísticas
     */
    calcularEstatisticas(produtos) {
        const produtosComDados = produtos.filter(p => p.precoNumerico > 0);
        const produtosComVendas = produtos.filter(p => p.vendidos > 0);
        const produtosComBSR = produtos.filter(p => p.ranking && parseInt(p.ranking) > 0);
        
        // 1. Soma total da receita
        const receitaTotal = produtosComVendas.reduce((total, produto) => {
            const receita = produto.receitaMes || (produto.precoNumerico * produto.vendidos);
            return total + receita;
        }, 0);

        // 2. Soma total de vendas
        const totalVendas = produtosComVendas.reduce((total, produto) => {
            return total + (produto.vendidos || 0);
        }, 0);

        // 3. Média de preços
        const mediaPrecos = produtosComDados.length > 0 ? 
            produtosComDados.reduce((total, produto) => total + produto.precoNumerico, 0) / produtosComDados.length : 0;

        // 4. Média do BSR
        const mediaBSR = produtosComBSR.length > 0 ?
            produtosComBSR.reduce((total, produto) => total + parseInt(produto.ranking), 0) / produtosComBSR.length : 0;

        // 5. Top 5 marcas que mais aparecem
        const contadorMarcas = {};
        produtos.forEach(produto => {
            if (produto.marca && produto.marca !== 'N/A' && produto.marca.trim() !== '') {
                contadorMarcas[produto.marca] = (contadorMarcas[produto.marca] || 0) + 1;
            }
        });

        const top5Marcas = Object.entries(contadorMarcas)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([marca, quantidade]) => ({ marca, quantidade }));

        return {
            receitaTotal,
            totalVendas,
            mediaPrecos,
            mediaBSR,
            top5Marcas,
            totalProdutos: produtos.length,
            produtosComDados: produtosComDados.length,
            produtosComVendas: produtosComVendas.length,
            produtosComBSR: produtosComBSR.length
        };
    }

    /**
     * Renderiza os cards de estatísticas no DOM
     * @param {Object} stats - Objeto com as estatísticas calculadas
     */
    renderizarCards(stats) {
        const html = `
            <div style="
                margin-bottom: 15px;
                padding: 12px;
                background: var(--bg-primary);
                border-radius: 6px;
                border: 1px solid var(--border-light);
            ">
                <!-- Linha 1: 4 Cards principais compactos -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin-bottom: 10px;
                ">
                    <!-- Card: Receita Total -->
                    <div class="stats-card" style="
                        background: var(--bg-secondary);
                        border: 1px solid var(--border-light);
                        padding: 10px;
                        border-radius: 6px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.borderColor='#10b981'" onmouseout="this.style.borderColor='var(--border-light)'">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                            <div style="font-size: 14px; color: #10b981;">💰</div>
                            <div style="font-size: 9px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Receita</div>
                        </div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">
                            R$ ${stats.receitaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 0})}
                        </div>
                    </div>

                    <!-- Card: Total de Vendas -->
                    <div class="stats-card" style="
                        background: var(--bg-secondary);
                        border: 1px solid var(--border-light);
                        padding: 10px;
                        border-radius: 6px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='var(--border-light)'">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                            <div style="font-size: 14px; color: #3b82f6;">📊</div>
                            <div style="font-size: 9px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Vendas</div>
                        </div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">
                            ${stats.totalVendas.toLocaleString('pt-BR')} un
                        </div>
                    </div>

                    <!-- Card: Média de Preços -->
                    <div class="stats-card" style="
                        background: var(--bg-secondary);
                        border: 1px solid var(--border-light);
                        padding: 10px;
                        border-radius: 6px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.borderColor='#f59e0b'" onmouseout="this.style.borderColor='var(--border-light)'">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                            <div style="font-size: 14px; color: #f59e0b;">💸</div>
                            <div style="font-size: 9px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Preço Médio</div>
                        </div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">
                            R$ ${stats.mediaPrecos.toLocaleString('pt-BR', {minimumFractionDigits: 0})}
                        </div>
                    </div>

                    <!-- Card: Média do BSR -->
                    <div class="stats-card" style="
                        background: var(--bg-secondary);
                        border: 1px solid var(--border-light);
                        padding: 10px;
                        border-radius: 6px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.borderColor='#8b5cf6'" onmouseout="this.style.borderColor='var(--border-light)'">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                            <div style="font-size: 14px; color: #8b5cf6;">🏆</div>
                            <div style="font-size: 9px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">BSR Médio</div>
                        </div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">
                            ${stats.mediaBSR > 0 ? '#' + Math.round(stats.mediaBSR).toLocaleString('pt-BR') : 'N/A'}
                        </div>
                    </div>
                </div>

                <!-- Linha 2: Top 5 Marcas em cards pequenos -->
                ${stats.top5Marcas.length > 0 ? `
                    <div style="margin-bottom: 6px;">
                        <div style="font-size: 10px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                            <span style="color: #6b7280;">🏷️</span> Top 5 Marcas
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;">
                            ${stats.top5Marcas.slice(0, 5).map(({marca, quantidade}, index) => `
                                <div style="
                                    background: var(--bg-secondary);
                                    border: 1px solid var(--border-light);
                                    padding: 8px;
                                    border-radius: 4px;
                                    text-align: center;
                                    transition: all 0.2s ease;
                                " onmouseover="this.style.borderColor='#6b7280'" onmouseout="this.style.borderColor='var(--border-light)'">
                                    <div style="font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${marca}">
                                        ${marca}
                                    </div>
                                    <div style="font-size: 10px; color: var(--text-secondary);">
                                        ${quantidade} produtos
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div style="text-align: center; color: var(--text-secondary); font-size: 11px; font-style: italic; margin-top: 8px;">
                        Nenhuma marca encontrada
                    </div>
                `}
            </div>
        `;

        this.container.innerHTML = html;
    }

    /**
     * Método para ser chamado quando os filtros são aplicados
     * @param {Array} produtosFiltrados - Produtos após aplicação dos filtros
     */
    sincronizarComFiltros(produtosFiltrados) {
        this.atualizarEstatisticas(produtosFiltrados);
    }

    /**
     * Remove o container de estatísticas
     */
    destruir() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}

// Instância global do gerenciador de estatísticas
window.StatsManager = new StatsManager(); 