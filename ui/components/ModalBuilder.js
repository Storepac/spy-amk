/**
 * ModalBuilder - Responsável por construir a interface do modal
 * Separa a construção do HTML da lógica de negócio
 */
class ModalBuilder {
    static criarModalPrincipal(produtos, metricas, termoBusca) {
        return `
            <div id="amazon-analyzer-modal" class="amk-spy-container amk-spy-transition" style="${this.getEstilosModal()}">
                <div class="amk-spy-bg-primary amk-spy-shadow-heavy" style="${this.getEstilosContainer()}">
                    ${this.criarHeader(produtos, termoBusca)}
                    ${this.criarFiltros()}
                    ${this.criarLegendaBSR()}
                    ${this.criarMetricas(produtos, metricas)}
                    ${this.criarTabela(produtos)}
                </div>
            </div>
        `;
    }

    static getEstilosModal() {
        return `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${ThemeManager.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(240, 240, 240, 0.1)'};
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            backdrop-filter: blur(5px);
        `;
    }

    static getEstilosContainer() {
        return `
            width: 95%;
            height: 90%;
            border-radius: 5px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        `;
    }

    static criarHeader(produtos, termoBusca) {
        return `
            <div style="${this.getEstilosHeader()}">
                <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                    ${this.criarLogo()}
                    ${this.criarCampoBusca(termoBusca)}
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${this.criarBotoesAcao(produtos)}
                </div>
            </div>
        `;
    }

    static getEstilosHeader() {
        return `
            background: linear-gradient(135deg, #014641, #013935);
            color: white;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        `;
    }

    static criarLogo() {
        return `
            <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="font-size: 18px; color: white; font-weight: 600;">AMK</span>
                <span style="font-size: 12px; color: white; margin-top: 2px; font-weight: 500;">spy</span>
            </div>
        `;
    }

    static criarCampoBusca(termoBusca) {
        return `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 14px; opacity: 0.8;">Buscar:</span>
                <input type="text" id="nova-busca" value="${termoBusca}" placeholder="Digite um termo..." style="${this.getEstilosInputBusca()}">
                <button id="btn-buscar" style="${this.getEstilosBotaoBusca()}">🔍 Buscar</button>
            </div>
        `;
    }

    static getEstilosInputBusca() {
        return `
            padding: 8px 12px;
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 14px;
            outline: none;
            width: 400px;
            transition: all 0.2s;
            font-family: 'Poppins', sans-serif;
        `;
    }

    static getEstilosBotaoBusca() {
        return `
            padding: 8px 16px;
            background: #6ac768;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'Poppins', sans-serif;
        `;
    }

    static criarBotoesAcao(produtos) {
        return `
            <button id="btn-exportar-csv" style="${this.getEstilosBotaoExportar()}">📊 CSV</button>
            <button id="btn-exportar-excel" style="${this.getEstilosBotaoExportar('#059669')}">📈 Excel</button>
            <button id="btn-buscar-marcas" style="${this.getEstilosBotaoSecundario()}" title="Buscar marcas faltantes manualmente">🏷️</button>
            <button id="btn-tema" style="${this.getEstilosBotaoTema()}" title="Alternar modo escuro/claro">🌙</button>
            <span style="font-size: 14px; opacity: 0.9;">${produtos.length} produtos</span>
            <button id="fechar-analise" style="${this.getEstilosBotaoFechar()}">×</button>
        `;
    }

    static getEstilosBotaoExportar(cor = '#6ac768') {
        return `
            padding: 8px 16px;
            background: ${cor};
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'Poppins', sans-serif;
        `;
    }

    static getEstilosBotaoSecundario() {
        return `
            padding: 6px 12px;
            background: rgba(59, 130, 246, 0.8);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'Poppins', sans-serif;
            opacity: 0.8;
        `;
    }

    static getEstilosBotaoTema() {
        return `
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'Poppins', sans-serif;
            opacity: 0.8;
        `;
    }

    static getEstilosBotaoFechar() {
        return `
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            transition: all 0.2s;
        `;
    }

    static criarFiltros() {
        return `
            <div class="amk-spy-bg-secondary amk-spy-border-light" style="padding: 20px 24px; border-bottom: 1px solid var(--border-light);">
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    ${this.criarCampoBuscaNome()}
                    ${this.criarFiltroPreco()}
                    ${this.criarFiltroAvaliacao()}
                    ${this.criarFiltroMarca()}
                    ${this.criarFiltroVendas()}
                    ${this.criarFiltroBSR()}
                    ${this.criarFiltroTipo()}
                    ${this.criarBotoesFiltro()}
                </div>
            </div>
        `;
    }

    static criarCampoBuscaNome() {
        return `
            <input type="text" id="busca-nome" placeholder="🔍 Buscar por nome..." class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="${this.getEstilosInputFiltro()}">
        `;
    }

    static getEstilosInputFiltro() {
        return `
            flex: 1;
            min-width: 200px;
            padding: 6px 12px;
            height: 32px;
            border: 2px solid var(--border-light);
            border-radius: 6px;
            font-size: 13px;
            outline: none;
            font-family: 'Poppins', sans-serif;
        `;
    }

    static criarFiltroPreco() {
        return `
            <select id="filtro-preco" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="${this.getEstilosSelectFiltro()}">
                <option value="">💰 Todos os preços</option>
                <option value="0-50">R$ 0 - R$ 50</option>
                <option value="50-100">R$ 50 - R$ 100</option>
                <option value="100-200">R$ 100 - R$ 200</option>
                <option value="200-500">R$ 200 - R$ 500</option>
                <option value="500-1000">R$ 500 - R$ 1.000</option>
                <option value="1000+">Acima de R$ 1.000</option>
            </select>
        `;
    }

    static getEstilosSelectFiltro() {
        return `
            padding: 6px 12px;
            height: 32px;
            border: 2px solid var(--border-light);
            border-radius: 6px;
            font-size: 13px;
            outline: none;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
        `;
    }

    static criarFiltroAvaliacao() {
        return `
            <select id="filtro-avaliacao" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="${this.getEstilosSelectFiltro()}">
                <option value="">⭐ Todas as avaliações</option>
                <option value="4+">4+ estrelas</option>
                <option value="4.5+">4.5+ estrelas</option>
                <option value="5">5 estrelas</option>
            </select>
        `;
    }

    static criarFiltroMarca() {
        return `
            <select id="filtro-marca" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="${this.getEstilosSelectFiltro()}">
                <option value="">🏷️ Todas as marcas</option>
            </select>
        `;
    }

    static criarFiltroVendas() {
        return `
            <select id="filtro-vendas" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="${this.getEstilosSelectFiltro()}">
                <option value="">📈 Ordenação padrão</option>
                <option value="mais-vendidos">🔥 Mais vendidos primeiro</option>
                <option value="menos-vendidos">📉 Menos vendidos primeiro</option>
            </select>
        `;
    }

    static criarFiltroBSR() {
        return `
            <div style="display: flex; gap: 8px; align-items: center;">
                <select id="filtro-bsr-faixa" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="${this.getEstilosSelectFiltro()}">
                    <option value="">📊 Todas as posições</option>
                    <option value="1-100">Top 100</option>
                    <option value="101-1000">101-1000</option>
                    <option value="1001-10000">1001-10000</option>
                    <option value="10001+">10001+</option>
                    <option value="custom">Faixa personalizada</option>
                </select>
                <div id="filtro-bsr-custom" style="display: none; gap: 4px; align-items: center;">
                    <input type="number" id="filtro-bsr-min" placeholder="Mín" min="1" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="padding: 6px 8px; height: 32px; width: 60px; border: 2px solid var(--border-light); border-radius: 6px; font-size: 13px; outline: none; font-family: 'Poppins', sans-serif;">
                    <span class="amk-spy-text-primary" style="font-size: 13px;">-</span>
                    <input type="number" id="filtro-bsr-max" placeholder="Máx" min="1" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="padding: 6px 8px; height: 32px; width: 60px; border: 2px solid var(--border-light); border-radius: 6px; font-size: 13px; outline: none; font-family: 'Poppins', sans-serif;">
                </div>
            </div>
        `;
    }

    static criarFiltroTipo() {
        return `
            <select id="filtro-tipo" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="${this.getEstilosSelectFiltro()}">
                <option value="">📊 Todos os tipos</option>
                <option value="patrocinado">Patrocinados</option>
                <option value="organico">Orgânicos</option>
            </select>
        `;
    }

    static criarBotoesFiltro() {
        return `
            <button onclick="TableManager.aplicarFiltros()" id="btn-aplicar-filtros" style="${this.getEstilosBotaoFiltro('#014641')}">🔍 Filtrar</button>
            <button onclick="TableManager.limparFiltros()" id="btn-limpar-filtros" style="${this.getEstilosBotaoFiltro('#6b7280')}">🗑️ Limpar</button>
        `;
    }

    static getEstilosBotaoFiltro(cor) {
        return `
            padding: 6px 16px;
            height: 32px;
            background: linear-gradient(135deg, ${cor}, ${cor}dd);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            font-family: 'Poppins', sans-serif;
            transition: all 0.2s;
        `;
    }

    static criarLegendaBSR() {
        return `
            <div class="amk-spy-bg-secondary amk-spy-border-light" style="
                padding: 12px 20px; 
                border-bottom: 1px solid var(--border-light);
                display: flex;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;
                font-family: 'Poppins', sans-serif;
                font-size: 12px;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 600; color: var(--text-primary);">📊 Legenda BSR:</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 12px; height: 12px; background: #10b981; border-radius: 2px; border: 1px solid rgba(0,0,0,0.1);"></div>
                    <span style="color: var(--text-secondary);">Verde (#10b981):</span>
                    <span style="color: var(--text-primary); font-weight: 500;">Top 100 - Excelente posição</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 2px; border: 1px solid rgba(0,0,0,0.1);"></div>
                    <span style="color: var(--text-secondary);">Laranja (#f59e0b):</span>
                    <span style="color: var(--text-primary); font-weight: 500;">101-1000 - Boa posição</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 2px; border: 1px solid rgba(0,0,0,0.1);"></div>
                    <span style="color: var(--text-secondary);">Vermelho (#ef4444):</span>
                    <span style="color: var(--text-primary); font-weight: 500;">1000+ - Baixa posição</span>
                </div>
                
                <div style="margin-left: auto; padding: 4px 8px; background: rgba(59, 130, 246, 0.1); border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.2);">
                    <span style="color: var(--text-secondary); font-size: 11px;">💡 Dica: Clique no BSR para ver detalhes do ranking</span>
                </div>
            </div>
        `;
    }

    static criarMetricas(produtos, metricas) {
        const totalVendas = produtos.reduce((total, produto) => total + (produto.vendidos || 0), 0);
        
        return `
            <div class="amk-spy-bg-secondary" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 16px; padding: 20px;">
                ${this.criarCardMetrica('RECEITA TOTAL', `R$ ${(metricas.receitaTotal || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`)}
                ${this.criarCardMetrica('VENDAS TOTAIS', totalVendas.toLocaleString('pt-BR'))}
                ${this.criarCardMetrica('PREÇO MÉDIO', `R$ ${(metricas.precoMedio || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`)}
                ${this.criarCardMetricaBSR('🏆 TOP 100 BSR', metricas.produtosTop100 || 0, produtos.length, produtos, 100)}
                ${this.criarCardMetricaBSR('🏆 TOP 1000 BSR', metricas.produtosTop1000 || 0, produtos.length, produtos, 1000)}
                ${this.criarCardMetrica('📈 PRODUTOS PATROCINADOS', produtos.filter(p => p.patrocinado).length || 0, produtos.length)}
                ${this.criarCardMetrica('🎯 COMPETITIVIDADE', TableManager.calcularNivelCompetitividade(metricas), null, 'Baseado em BSR e avaliações')}
            </div>
        `;
    }

    static criarCardMetrica(titulo, valor, total = null, subtitulo = null) {
        const percentual = total ? `\n<div class="amk-spy-text-secondary" style="font-size: 10px; margin-top: 2px;">${((valor / total) * 100).toFixed(1)}% dos produtos</div>` : '';
        const subtituloHtml = subtitulo ? `\n<div class="amk-spy-text-secondary" style="font-size: 10px; margin-top: 2px;">${subtitulo}</div>` : '';
        
        return `
            <div class="amk-spy-bg-primary amk-spy-shadow" style="padding: 16px; border-radius: 12px; text-align: center;">
                <div class="amk-spy-text-primary" style="font-size: 12px; font-weight: 500; margin-bottom: 4px;">${titulo}</div>
                <div class="amk-spy-text-primary" style="font-size: 24px; font-weight: 700;">${valor}</div>
                ${percentual}
                ${subtituloHtml}
            </div>
        `;
    }

    static criarCardMetricaBSR(titulo, valor, total, produtos, limite) {
        const percentual = total > 0 ? ((valor / total) * 100).toFixed(1) : '0';
        const top10 = TableManager.getTop10BSR(produtos, limite).join(', ');
        
        return `
            <div class="amk-spy-bg-primary amk-spy-shadow" style="padding: 16px; border-radius: 12px; text-align: center;">
                <div class="amk-spy-text-primary" style="font-size: 12px; font-weight: 500; margin-bottom: 4px;">${titulo}</div>
                <div class="amk-spy-text-primary" style="font-size: 24px; font-weight: 700;">${valor}</div>
                <div class="amk-spy-text-secondary" style="font-size: 10px; margin-top: 2px;">${percentual}% dos produtos</div>
                <div class="amk-spy-text-secondary" style="font-size: 9px; margin-top: 4px; opacity: 0.8;">Top 10: ${top10}</div>
            </div>
        `;
    }

    static criarTabela(produtos) {
        return `
            <div style="flex: 1; overflow-y: auto; padding: 0; scrollbar-width: thin; scrollbar-color: #d1d5db #f8fafc; border-radius: 0 0 16px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                ${this.getEstilosScrollbar()}
                <table id="tabela-produtos" class="amk-spy-bg-primary" style="width: 100%; border-collapse: collapse; font-family: 'Poppins', sans-serif; background: var(--bg-primary);">
                    ${this.criarHeaderTabela()}
                    <tbody>
                        ${produtos.map((produto, index) => TableRowBuilder.criarLinhaProduto(produto, index)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static getEstilosScrollbar() {
        return `
            <style>
            #amazon-analyzer-modal .amk-spy-bg-primary::-webkit-scrollbar {
                width: 8px;
                background: var(--bg-secondary);
            }
            #amazon-analyzer-modal .amk-spy-bg-primary::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 8px;
            }
            .dark-mode #amazon-analyzer-modal .amk-spy-bg-primary::-webkit-scrollbar-thumb {
                background: #333;
            }
            </style>
        `;
    }

    static criarHeaderTabela() {
        return `
            <thead style="background: linear-gradient(135deg, #014641, #013935); color: white; position: sticky; top: 0; z-index: 10;">
                <tr>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Pos</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Imagem</th>
                    <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Título</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">ASIN</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Marca</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Preço</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Avaliação</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Nº Avaliações</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Vendidos</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Receita/Mês</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">BSR</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Categoria</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600;">Tipo</th>
                </tr>
            </thead>
        `;
    }

    static criarModal() {
        return `
            <div id="amazon-analyzer-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Poppins', sans-serif;
            ">
                <div style="
                    background: var(--bg-primary);
                    border-radius: 15px;
                    padding: 30px;
                    width: 95%;
                    max-height: 95%;
                    overflow: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    border: 1px solid var(--border-light);
                    position: relative;
                ">
                    <!-- Cabeçalho -->
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 25px;
                        padding-bottom: 15px;
                        border-bottom: 2px solid var(--border-light);
                    ">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${chrome.runtime.getURL('images/logo.png')}" alt="AMK Spy" style="width: 40px; height: 40px; border-radius: 8px;">
                            <div>
                                <h1 style="
                                    margin: 0;
                                    font-size: 24px;
                                    font-weight: 700;
                                    color: var(--text-primary);
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                ">AMK Spy</h1>
                                <p style="
                                    margin: 0;
                                    font-size: 14px;
                                    color: var(--text-secondary);
                                    opacity: 0.8;
                                ">Analisador Avançado de Produtos Amazon</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <button id="btn-teste-eventos" style="
                                background: #3b82f6;
                                border: none;
                                border-radius: 8px;
                                padding: 8px 12px;
                                cursor: pointer;
                                color: white;
                                font-size: 12px;
                                transition: all 0.2s;
                            " title="Forçar reconfiguração dos eventos">
                                🔧 Teste Eventos
                            </button>
                            <button id="btn-tema" style="
                                background: var(--bg-secondary);
                                border: 1px solid var(--border-light);
                                border-radius: 8px;
                                padding: 8px 12px;
                                cursor: pointer;
                                color: var(--text-primary);
                                font-size: 12px;
                                transition: all 0.2s;
                            " title="Alternar tema">
                                🌙
                            </button>
                            <button style="
                                background: #ef4444;
                                border: none;
                                border-radius: 8px;
                                padding: 8px 12px;
                                cursor: pointer;
                                color: white;
                                font-size: 12px;
                                transition: all 0.2s;
                            " title="Fechar">
                                ✕
                            </button>
                        </div>
                    </div>

                    <!-- Informações sobre a análise -->
                    <div id="info-analise" style="
                        background: var(--bg-secondary);
                        border-radius: 12px;
                        padding: 15px;
                        margin-bottom: 20px;
                        border: 1px solid var(--border-light);
                        border-left: 4px solid #3b82f6;
                    ">
                        <div style="font-size: 13px; color: var(--text-secondary);">
                            <strong>📊 Tabela de Análise:</strong> Use o popup da extensão para iniciar novas análises ou o botão AMK Spy na página para alternar a visualização.
                        </div>
                    </div>

                    <!-- Conteúdo da Tabela (será preenchido dinamicamente) -->
                    <div id="conteudo-tabela" style="display: none;">
                        <!-- A tabela será inserida aqui -->
                    </div>
                    
                    <!-- Botão Nova Busca (aparece quando há produtos armazenados) -->
                    <div id="nova-busca-container" style="display: none; margin-top: 20px; text-align: center;">
                        <button id="btn-nova-busca" style="
                            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                            border: none;
                            border-radius: 8px;
                            padding: 12px 20px;
                            cursor: pointer;
                            color: white;
                            font-size: 14px;
                            font-weight: 600;
                            transition: all 0.2s;
                            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
                        " title="Fazer nova busca">
                            🔄 Nova Busca
                        </button>
                        <p style="
                            margin: 10px 0 0 0;
                            font-size: 12px;
                            color: var(--text-secondary);
                            opacity: 0.8;
                        ">Clique para fazer uma nova análise e substituir os dados atuais</p>
                    </div>
                </div>
            </div>
        `;
    }
}

window.ModalBuilder = ModalBuilder; 