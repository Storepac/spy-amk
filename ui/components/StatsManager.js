/**
 * StatsManager - Versão simplificada para evitar conflitos
 */
class StatsManager {
    constructor() {
        this.produtos = [];
        this.container = null;
    }

    inicializar(produtos) {
        if (!produtos || produtos.length === 0) return;
        
        this.produtos = produtos;
        this.criarContainer();
        this.atualizarEstatisticas(produtos);
    }

    criarContainer() {
        this.container = document.getElementById('stats-container');
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'stats-container';
            
            const tabelaProdutos = document.querySelector('#tabela-produtos');
            if (tabelaProdutos) {
                tabelaProdutos.parentElement.insertBefore(this.container, tabelaProdutos);
            }
        }
    }

    atualizarEstatisticas(produtos) {
        if (!produtos || !this.container) return;
        
        const stats = this.calcularEstatisticas(produtos);
        this.renderizarCards(stats);
    }

    calcularEstatisticas(produtos) {
        const produtosComDados = produtos.filter(p => p.precoNumerico > 0);
        const produtosComVendas = produtos.filter(p => p.vendidos > 0);
        const produtosComBSR = produtos.filter(p => p.ranking && parseInt(p.ranking) > 0);
        
        const receitaTotal = produtosComVendas.reduce((total, produto) => {
            const receita = produto.receitaMes || (produto.precoNumerico * produto.vendidos);
            return total + receita;
        }, 0);

        const totalVendas = produtosComVendas.reduce((total, produto) => {
            return total + (produto.vendidos || 0);
        }, 0);

        const mediaPrecos = produtosComDados.length > 0 ? 
            produtosComDados.reduce((total, produto) => total + produto.precoNumerico, 0) / produtosComDados.length : 0;

        const mediaBSR = produtosComBSR.length > 0 ?
            produtosComBSR.reduce((total, produto) => total + parseInt(produto.ranking), 0) / produtosComBSR.length : 0;

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
            top5Marcas
        };
    }

    renderizarCards(stats) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="
                margin-bottom: 15px;
                padding: 12px;
                background: var(--bg-primary);
                border-radius: 6px;
                border: 1px solid var(--border-light);
            ">
                <div style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin-bottom: 10px;
                ">
                    <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 10px; border-radius: 6px;">
                        <div style="font-size: 9px; color: var(--text-secondary); font-weight: 600; margin-bottom: 4px;">💰 RECEITA</div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">
                            R$ ${stats.receitaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 0})}
                        </div>
                    </div>

                    <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 10px; border-radius: 6px;">
                        <div style="font-size: 9px; color: var(--text-secondary); font-weight: 600; margin-bottom: 4px;">📊 VENDAS</div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">
                            ${stats.totalVendas.toLocaleString('pt-BR')} un
                        </div>
                    </div>

                    <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 10px; border-radius: 6px;">
                        <div style="font-size: 9px; color: var(--text-secondary); font-weight: 600; margin-bottom: 4px;">💸 PREÇO MÉDIO</div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">
                            R$ ${stats.mediaPrecos.toLocaleString('pt-BR', {minimumFractionDigits: 0})}
                        </div>
                    </div>

                    <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 10px; border-radius: 6px;">
                        <div style="font-size: 9px; color: var(--text-secondary); font-weight: 600; margin-bottom: 4px;">🏆 BSR MÉDIO</div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">
                            ${stats.mediaBSR > 0 ? '#' + Math.round(stats.mediaBSR).toLocaleString('pt-BR') : 'N/A'}
                        </div>
                    </div>
                </div>

                ${stats.top5Marcas.length > 0 ? `
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;">
                        ${stats.top5Marcas.map(item => `
                            <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 8px; border-radius: 4px; text-align: center;">
                                <div style="font-size: 8px; color: var(--text-secondary); font-weight: 600; margin-bottom: 2px;">🏷️ MARCA</div>
                                <div style="font-size: 10px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.marca}</div>
                                <div style="font-size: 9px; color: var(--text-secondary);">${item.quantidade} produtos</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${this.gerarStatsTracking()}
            </div>
        `;
    }
    
    /**
     * Gera estatísticas do tracking de posições
     */
    gerarStatsTracking() {
        if (!window.PositionTracker) return '';
        
        const trackingStats = window.PositionTracker.getEstatisticas();
        
        if (trackingStats.totalProdutos === 0) return '';
        
        return `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-light);">
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
                    <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 6px; border-radius: 4px; text-align: center;">
                        <div style="font-size: 8px; color: var(--text-secondary); font-weight: 600;">📈 TRACKING</div>
                        <div style="font-size: 10px; font-weight: 600; color: var(--text-primary);">${trackingStats.totalProdutos}</div>
                    </div>
                    <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 6px; border-radius: 4px; text-align: center;">
                        <div style="font-size: 8px; color: #10b981; font-weight: 600;">↗️ SUBINDO</div>
                        <div style="font-size: 10px; font-weight: 600; color: #10b981;">${trackingStats.produtosSubindo}</div>
                    </div>
                    <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 6px; border-radius: 4px; text-align: center;">
                        <div style="font-size: 8px; color: #ef4444; font-weight: 600;">↘️ DESCENDO</div>
                        <div style="font-size: 10px; font-weight: 600; color: #ef4444;">${trackingStats.produtosDescendo}</div>
                    </div>
                                         <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 6px; border-radius: 4px; text-align: center;">
                         <div style="font-size: 8px; color: #3b82f6; font-weight: 600;">🆕 NOVOS</div>
                         <div style="font-size: 10px; font-weight: 600; color: #3b82f6;">${trackingStats.produtosNovos}</div>
                     </div>
                 </div>
                 
                 <!-- Botão Sync Cloud -->
                 <div style="margin-top: 6px; text-align: center;">
                     <button onclick="window.SyncPanel?.show()" style="
                         background: linear-gradient(135deg, #6366f1, #4f46e5);
                         color: white;
                         border: none;
                         padding: 4px 8px;
                         border-radius: 4px;
                         font-size: 9px;
                         font-weight: 600;
                         cursor: pointer;
                         transition: all 0.2s;
                     " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Abrir painel de sincronização na nuvem">
                         ☁️ SYNC CLOUD
                     </button>
                 </div>
             </div>
        `;
    }

    sincronizarComFiltros(produtosFiltrados) {
        this.atualizarEstatisticas(produtosFiltrados);
    }
}

// Criar instância global
if (typeof window !== 'undefined') {
    window.StatsManager = new StatsManager();
} 