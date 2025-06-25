class TableManager {
    static filterManager = new FilterManager();
    static exportManager = new ExportManager();
    static themeManager = new ThemeManager();

    static criarTabelaProdutos(produtos) {
        // Definir produtos globalmente para uso em outras funções
        window.produtosTabela = produtos;
        
        // Calcular métricas
        const metricas = this.atualizarMetricas(produtos);
        const termoBusca = UrlManager.extrairTermoBusca();
        
        const totalVendas = produtos.reduce((total, produto) => total + (produto.vendidos || 0), 0);
        
        // Extrair marcas únicas para o filtro
        const marcasUnicas = this.filterManager.getMarcasUnicas();
        
        // Obter cores do tema
        const colors = this.themeManager.getThemeColors();
        const themeClass = this.themeManager.getThemeClass();
        
        return `
            <div id="amazon-analyzer-modal" class="amk-spy-container amk-spy-transition" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${this.themeManager.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(240, 240, 240, 0.1)'};
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: 'Poppins', sans-serif;
                backdrop-filter: blur(5px);
            ">
                <div class="amk-spy-bg-primary amk-spy-shadow-heavy" style="
                    width: 95%;
                    height: 90%;
                    border-radius: 5px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                ">
                    <div style="
                        background: linear-gradient(135deg, #014641, #013935);
                        color: white;
                        padding: 12px 16px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 10px;
                    ">
                        <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <span style="font-size: 18px; color: white; font-weight: 600;">AMK</span>
                                <span style="font-size: 12px; color: white; margin-top: 2px; font-weight: 500;">spy</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 14px; opacity: 0.8;">Buscar:</span>
                                <input type="text" id="nova-busca" value="${termoBusca}" placeholder="Digite um termo..." style="
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
                                ">
                                <button id="btn-buscar" style="
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
                                ">🔍 Buscar</button>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <!-- Botões de Exportação -->
                            <button id="btn-exportar-csv" style="
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
                            ">📊 CSV</button>
                            
                            <button id="btn-exportar-excel" style="
                                padding: 8px 16px;
                                background: #059669;
                                    color: white;
                                    border: none;
                                border-radius: 8px;
                                    font-size: 14px;
                                font-weight: 500;
                                    cursor: pointer;
                                transition: all 0.2s;
                                font-family: 'Poppins', sans-serif;
                            ">📈 Excel</button>
                            
                            <!-- Botão para buscar marcas -->
                            <button id="btn-buscar-marcas" style="
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
                            " title="Buscar marcas faltantes manualmente">🏷️</button>
                            
                            <!-- Botão de tema -->
                            <button id="btn-tema" style="
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
                            " title="Alternar modo escuro/claro">🌙</button>
                            
                            <span style="font-size: 14px; opacity: 0.9;">${produtos.length} produtos</span>
                            <button id="fechar-analise" style="
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
                            ">×</button>
                        </div>
                    </div>

                    <!-- Sistema de Filtros Avançados -->
                    <div class="amk-spy-bg-secondary amk-spy-border-light" style="padding: 20px 24px; border-bottom: 1px solid var(--border-light);">
                        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                            <!-- Campo de busca por nome -->
                            <input type="text" id="busca-nome" placeholder="🔍 Buscar por nome..." class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="
                                flex: 1;
                                min-width: 200px;
                                padding: 6px 12px;
                                height: 32px;
                                border: 2px solid var(--border-light);
                                border-radius: 6px;
                                font-size: 13px;
                                outline: none;
                                font-family: 'Poppins', sans-serif;
                            ">
                            
                            <!-- Filtro de preço -->
                            <select id="filtro-preco" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="
                                    padding: 6px 12px;
                                    height: 32px;
                                border: 2px solid var(--border-light);
                                    border-radius: 6px;
                                    font-size: 13px;
                                    outline: none;
                                    cursor: pointer;
                                    font-family: 'Poppins', sans-serif;
                            ">
                                <option value="">💰 Todos os preços</option>
                                <option value="0-50">R$ 0 - R$ 50</option>
                                <option value="50-100">R$ 50 - R$ 100</option>
                                <option value="100-200">R$ 100 - R$ 200</option>
                                <option value="200-500">R$ 200 - R$ 500</option>
                                <option value="500-1000">R$ 500 - R$ 1.000</option>
                                <option value="1000+">Acima de R$ 1.000</option>
                            </select>
                            
                            <!-- Filtro de marca (dinâmico) -->
                            <select id="filtro-marca" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="
                                padding: 6px 12px;
                                height: 32px;
                                border: 2px solid var(--border-light);
                                border-radius: 6px;
                                font-size: 13px;
                                outline: none;
                                cursor: pointer;
                                font-family: 'Poppins', sans-serif;
                            ">
                            </select>
                            
                            <!-- Filtro de Mais Vendidos -->
                            <select id="filtro-vendas" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="
                                padding: 6px 12px;
                                height: 32px;
                                border: 2px solid var(--border-light);
                                border-radius: 6px;
                                font-size: 13px;
                                outline: none;
                                cursor: pointer;
                                font-family: 'Poppins', sans-serif;
                            ">
                                <option value="">📈 Ordenação padrão</option>
                                <option value="mais-vendidos">🔥 Mais vendidos primeiro</option>
                                <option value="menos-vendidos">📉 Menos vendidos primeiro</option>
                            </select>
                            
                            <!-- Filtro de BSR -->
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <select id="filtro-bsr-faixa" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="
                                    padding: 6px 12px;
                                    height: 32px;
                                    border: 2px solid var(--border-light);
                                    border-radius: 6px;
                                    font-size: 13px;
                                    outline: none;
                                    cursor: pointer;
                                    font-family: 'Poppins', sans-serif;
                                ">
                                    <option value="">📊 Todas as posições</option>
                                    <option value="1-100">Top 100</option>
                                    <option value="101-1000">101-1000</option>
                                    <option value="1001-10000">1001-10000</option>
                                    <option value="10001+">10001+</option>
                                    <option value="custom">Faixa personalizada</option>
                                </select>
                                
                                <div id="filtro-bsr-custom" style="display: none; gap: 4px; align-items: center;">
                                    <input type="number" id="filtro-bsr-min" placeholder="Mín" min="1" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="
                                        padding: 6px 8px;
                                        height: 32px;
                                        width: 60px;
                                        border: 2px solid var(--border-light);
                                        border-radius: 6px;
                                        font-size: 13px;
                                        outline: none;
                                        font-family: 'Poppins', sans-serif;
                                    ">
                                    <span class="amk-spy-text-primary" style="font-size: 13px;">-</span>
                                    <input type="number" id="filtro-bsr-max" placeholder="Máx" min="1" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="
                                        padding: 6px 8px;
                                        height: 32px;
                                        width: 60px;
                                        border: 2px solid var(--border-light);
                                        border-radius: 6px;
                                        font-size: 13px;
                                        outline: none;
                                        font-family: 'Poppins', sans-serif;
                                    ">
                                </div>
                            </div>

                            <!-- Filtro de tipo -->
                            <select id="filtro-tipo" class="amk-spy-bg-secondary amk-spy-border-light amk-spy-text-primary" style="
                                    padding: 6px 12px;
                                    height: 32px;
                                border: 2px solid var(--border-light);
                                    border-radius: 6px;
                                    font-size: 13px;
                                    outline: none;
                                    cursor: pointer;
                                    font-family: 'Poppins', sans-serif;
                            ">
                                <option value="">📊 Todos os tipos</option>
                                <option value="patrocinado">Patrocinados</option>
                                <option value="organico">Orgânicos</option>
                                </select>
                            
                            <!-- Botões de ação -->
                            <button onclick="TableManager.aplicarFiltros()" id="btn-aplicar-filtros" style="
                                padding: 6px 16px;
                                height: 32px;
                                background: linear-gradient(135deg, #014641, #013935);
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 13px;
                                font-weight: 500;
                                font-family: 'Poppins', sans-serif;
                                transition: all 0.2s;
                            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                                🔍 Filtrar
                            </button>

                            <button onclick="TableManager.limparFiltros()" id="btn-limpar-filtros" style="
                                padding: 6px 16px;
                                height: 32px;
                                background: linear-gradient(135deg, #6b7280, #4b5563);
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 13px;
                                font-weight: 500;
                                font-family: 'Poppins', sans-serif;
                                transition: all 0.2s;
                            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                                🗑️ Limpar
                            </button>
                        </div>
                        
                    </div>
                    
                    <!-- Legenda das Cores do BSR -->
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
                            <div style="
                                width: 12px; 
                                height: 12px; 
                                background: #10b981; 
                                border-radius: 2px;
                                border: 1px solid rgba(0,0,0,0.1);
                            "></div>
                            <span style="color: var(--text-secondary);">Verde (#10b981):</span>
                            <span style="color: var(--text-primary); font-weight: 500;">Top 100 - Excelente posição</span>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <div style="
                                width: 12px; 
                                height: 12px; 
                                background: #f59e0b; 
                                border-radius: 2px;
                                border: 1px solid rgba(0,0,0,0.1);
                            "></div>
                            <span style="color: var(--text-secondary);">Laranja (#f59e0b):</span>
                            <span style="color: var(--text-primary); font-weight: 500;">101-1000 - Boa posição</span>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <div style="
                                width: 12px; 
                                height: 12px; 
                                background: #ef4444; 
                                border-radius: 2px;
                                border: 1px solid rgba(0,0,0,0.1);
                            "></div>
                            <span style="color: var(--text-secondary);">Vermelho (#ef4444):</span>
                            <span style="color: var(--text-primary); font-weight: 500;">1000+ - Baixa posição</span>
                        </div>
                        
                        <div style="
                            margin-left: auto;
                            padding: 4px 8px;
                            background: rgba(59, 130, 246, 0.1);
                            border-radius: 4px;
                            border: 1px solid rgba(59, 130, 246, 0.2);
                        ">
                            <span style="color: var(--text-secondary); font-size: 11px;">
                                💡 Dica: Clique no BSR para ver detalhes do ranking
                            </span>
                        </div>
                    </div>
                    
                    <div class="amk-spy-bg-secondary" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 16px; padding: 20px;">
                        <div class="amk-spy-bg-primary amk-spy-shadow" style="padding: 16px; border-radius: 12px; text-align: center;">
                            <div class="amk-spy-text-primary" style="font-size: 12px; font-weight: 500; margin-bottom: 4px;">RECEITA TOTAL</div>
                            <div class="amk-spy-text-primary" style="font-size: 24px; font-weight: 700;">R$ ${(metricas.receitaTotal || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div class="amk-spy-bg-primary amk-spy-shadow" style="padding: 16px; border-radius: 12px; text-align: center;">
                            <div class="amk-spy-text-primary" style="font-size: 12px; font-weight: 500; margin-bottom: 4px;">VENDAS TOTAIS</div>
                            <div class="amk-spy-text-primary" style="font-size: 24px; font-weight: 700;">${totalVendas.toLocaleString('pt-BR')}</div>
                        </div>
                        <div class="amk-spy-bg-primary amk-spy-shadow" style="padding: 16px; border-radius: 12px; text-align: center;">
                            <div class="amk-spy-text-primary" style="font-size: 12px; font-weight: 500; margin-bottom: 4px;">PREÇO MÉDIO</div>
                            <div class="amk-spy-text-primary" style="font-size: 24px; font-weight: 700;">R$ ${(metricas.precoMedio || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div class="amk-spy-bg-primary amk-spy-shadow" style="padding: 16px; border-radius: 12px; text-align: center;">
                            <div class="amk-spy-text-primary" style="font-size: 12px; font-weight: 500; margin-bottom: 4px;">🏆 TOP 100 BSR</div>
                            <div class="amk-spy-text-primary" style="font-size: 24px; font-weight: 700;">${metricas.produtosTop100 || 0}</div>
                            <div class="amk-spy-text-secondary" style="font-size: 10px; margin-top: 2px;">${produtos.length > 0 ? ((metricas.produtosTop100 || 0) / produtos.length * 100).toFixed(1) : '0'}% dos produtos</div>
                            <div class="amk-spy-text-secondary" style="font-size: 9px; margin-top: 4px; opacity: 0.8;">Top 10: ${this.getTop10BSR(produtos, 100).join(', ')}</div>
                        </div>
                        <div class="amk-spy-bg-primary amk-spy-shadow" style="padding: 16px; border-radius: 12px; text-align: center;">
                            <div class="amk-spy-text-primary" style="font-size: 12px; font-weight: 500; margin-bottom: 4px;">🏆 TOP 1000 BSR</div>
                            <div class="amk-spy-text-primary" style="font-size: 24px; font-weight: 700;">${metricas.produtosTop1000 || 0}</div>
                            <div class="amk-spy-text-secondary" style="font-size: 10px; margin-top: 2px;">${produtos.length > 0 ? ((metricas.produtosTop1000 || 0) / produtos.length * 100).toFixed(1) : '0'}% dos produtos</div>
                            <div class="amk-spy-text-secondary" style="font-size: 9px; margin-top: 4px; opacity: 0.8;">Top 10: ${this.getTop10BSR(produtos, 1000).join(', ')}</div>
                        </div>
                        <div class="amk-spy-bg-primary amk-spy-shadow" style="padding: 16px; border-radius: 12px; text-align: center;">
                            <div class="amk-spy-text-primary" style="font-size: 12px; font-weight: 500; margin-bottom: 4px;">📈 PRODUTOS PATROCINADOS</div>
                            <div class="amk-spy-text-primary" style="font-size: 24px; font-weight: 700;">${produtos.filter(p => p.patrocinado).length || 0}</div>
                            <div class="amk-spy-text-secondary" style="font-size: 10px; margin-top: 2px;">${produtos.length > 0 ? ((produtos.filter(p => p.patrocinado).length || 0) / produtos.length * 100).toFixed(1) : '0'}% dos produtos</div>
                        </div>
                        <div class="amk-spy-bg-primary amk-spy-shadow" style="padding: 16px; border-radius: 12px; text-align: center;">
                            <div class="amk-spy-text-primary" style="font-size: 12px; font-weight: 500; margin-bottom: 4px;">🎯 COMPETITIVIDADE</div>
                            <div class="amk-spy-text-primary" style="font-size: 24px; font-weight: 700;">${this.calcularNivelCompetitividade(metricas)}</div>
                            <div class="amk-spy-text-secondary" style="font-size: 10px; margin-top: 2px;">Baseado em BSR e avaliações</div>
                        </div>
                    </div>
                    
                    <div style="flex: 1; overflow-y: auto; padding: 0; scrollbar-width: thin; scrollbar-color: #d1d5db #f8fafc; border-radius: 0 0 16px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
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
                        <table id="tabela-produtos" class="amk-spy-bg-primary" style="
                            width: 100%;
                            border-collapse: collapse;
                            font-family: 'Poppins', sans-serif;
                            background: var(--bg-primary);
                        ">
                                <thead style="
                                background: linear-gradient(135deg, #014641, #013935);
                                color: white;
                                    position: sticky;
                                    top: 0;
                                    z-index: 10;
                                ">
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
                                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Receita</th>
                                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">BSR</th>
                                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.15);">Categoria</th>
                                    <th style="padding: 12px 8px; text-align: center; font-size: 12px; font-weight: 600;">Tipo</th>
                                    </tr>
                                </thead>
                            <tbody id="lista-produtos">
                                ${produtos.map((produto, index) => this.criarLinhaProduto(produto, index)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <script>
                // Inicializar eventos após a tabela estar carregada
                setTimeout(() => {
                    if (typeof TableManager !== 'undefined') {
                        console.log('🔧 Inicializando eventos da tabela...');
                        TableManager.inicializarEventos();
                        TableManager.inicializarBarraBusca();
                        console.log('✅ Eventos da tabela inicializados');
                    }
                }, 100);
            </script>
        `;
    }

    static criarLinhaProduto(produto, index) {
        const receitaMes = (produto.precoNumerico || 0) * (produto.vendidos || 0);
        
        // Verificar se o produto é tanto orgânico quanto patrocinado
        const isPatrocinado = produto.patrocinado ? 'Patrocinado' : 'Orgânico';
        const patrocinadoClass = produto.patrocinado ? 'patrocinado' : 'organico';
        
        // Verificar se há ASINs duplicados
        const asinDuplicado = this.verificarASINDuplicado(produto.asin);
        const duplicadoClass = asinDuplicado ? 'duplicado' : '';
        const duplicadoStyle = asinDuplicado ? 'border-left: 4px solid #f59e0b; background: #fef3c7;' : '';
        
        // Estilo especial para produtos que aparecem como orgânicos e patrocinados
        const estiloEspecial = produto.patrocinado && produto.organico ? 'border-left: 4px solid #8b5cf6; background: #f3f4f6;' : '';
        
        return `
            <tr class="linha-produto amk-spy-border-light ${duplicadoClass}" data-asin="${produto.asin || ''}" style="
                border-bottom: 1px solid var(--border-light);
                transition: all 0.2s ease;
                animation: slideIn 0.3s ease-out ${index * 0.05}s both;
                background: var(--bg-primary);
                ${duplicadoStyle}
                ${estiloEspecial}
            " onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='${duplicadoStyle ? '#fef3c7' : estiloEspecial ? '#f3f4f6' : 'var(--bg-primary)'}'">
                <td class="amk-spy-text-primary amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid var(--border-table);">
                    ${produto.posicao || index + 1}
                    ${asinDuplicado ? '<span style="color: #f59e0b; font-size: 10px; margin-left: 4px;" title="ASIN duplicado">🔄</span>' : ''}
                </td>
                <td class="amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; border-right: 1px solid var(--border-table);">
                    ${produto.imagem ? `
                        <img src="${produto.imagem}" alt="${produto.titulo || 'Produto'}" style="
                            width: 60px;
                            height: 60px;
                            object-fit: contain;
                            border-radius: 6px;
                            border: 1px solid var(--border-light);
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " 
                        onmouseover="this.style.transform='scale(2.5)'; this.style.zIndex='1000'; this.style.position='relative'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.3)'"
                        onmouseout="this.style.transform='scale(1)'; this.style.zIndex='auto'; this.style.position='static'; this.style.boxShadow='none'"
                        title="Clique para ampliar">
                    ` : `
                        <div class="amk-spy-bg-secondary amk-spy-text-secondary amk-spy-border-light" style="
                            width: 60px;
                            height: 60px;
                            border-radius: 6px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                            border: 1px solid var(--border-light);
                        ">Sem imagem</div>
                    `}
                </td>
                <td class="amk-spy-border-light" style="padding: 8px; text-align: left; font-size: 12px; border-right: 1px solid var(--border-table);">
                    <a href="${produto.link || '#'}" target="_blank" class="amk-spy-text-primary" style="
                        text-decoration: none;
                        font-weight: 500;
                        display: block;
                        max-width: 300px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    " title="${produto.titulo || ''}">${produto.titulo || 'N/A'}</a>
                </td>
                <td class="amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; border-right: 1px solid var(--border-table);">
                    <span class="amk-spy-text-primary" style="
                        font-family: monospace; 
                        font-weight: 600; 
                        cursor: pointer;
                        padding: 2px 6px;
                        border-radius: 4px;
                        transition: background 0.2s;
                    " 
                    onclick="TableManager.copiarASIN('${produto.asin || ''}')"
                    onmouseover="this.style.background='var(--bg-secondary)'"
                    onmouseout="this.style.background='transparent'"
                    title="Clique para copiar ASIN">
                        ${produto.asin || 'N/A'}
                    </span>
                </td>
                <td class="amk-spy-text-secondary amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; border-right: 1px solid var(--border-table);">${produto.marca || 'N/A'}</td>
                <td class="amk-spy-text-primary amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; font-weight: 600; border-right: 1px solid var(--border-table);">${produto.preco || 'N/A'}</td>
                <td class="amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; border-right: 1px solid var(--border-table);">
                    <span style="color: #f59e0b; font-weight: 600;">${produto.avaliacao || 'N/A'}</span>
                </td>
                <td class="amk-spy-text-secondary amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; border-right: 1px solid var(--border-table);">${produto.numAvaliacoes || 'N/A'}</td>
                <td class="amk-spy-text-secondary amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; border-right: 1px solid var(--border-table);">${produto.vendidos || 'N/A'}</td>
                <td class="amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; border-right: 1px solid var(--border-table); font-weight: 600; color: #10b981;">R$ ${receitaMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; border-right: 1px solid var(--border-table);">
                    <span style="
                        color: ${produto.ranking <= 100 ? '#10b981' : produto.ranking <= 1000 ? '#f59e0b' : '#ef4444'};
                        font-weight: 600;
                        cursor: pointer;
                    " onclick="TableManager.toggleRankingInfo(this)" title="Clique para ver detalhes do ranking">#${produto.ranking || 'N/A'}</span>
                </td>
                <td class="amk-spy-text-secondary amk-spy-border-light" style="padding: 8px; text-align: center; font-size: 12px; border-right: 1px solid var(--border-table);">${produto.categoria || 'N/A'}</td>
                <td style="padding: 8px; text-align: center; font-size: 12px;">
                    <span class="${patrocinadoClass}" style="
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 600;
                        color: white;
                        background: ${produto.patrocinado ? '#3b82f6' : '#10b981'};
                    ">${isPatrocinado}</span>
                    ${produto.patrocinado && produto.organico ? '<span style="color: #8b5cf6; font-size: 10px; margin-left: 4px;" title="Aparece como orgânico e patrocinado">⚡</span>' : ''}
                </td>
            </tr>
        `;
    }

    static verificarASINDuplicado(asin) {
        if (!asin) return false;
        
        // Verificar se o ASIN já existe em outras linhas
        const linhasExistentes = document.querySelectorAll('.linha-produto');
        let contador = 0;
        
        linhasExistentes.forEach(linha => {
            const asinLinha = linha.getAttribute('data-asin');
            if (asinLinha === asin) {
                contador++;
            }
        });
        
        return contador > 1;
    }

    static aplicarFiltros() {
        // Garantir que o FilterManager tenha os produtos originais
        if (!this.filterManager.produtosOriginais.length && window.produtosTabela) {
            this.filterManager.setProdutosOriginais(window.produtosTabela);
        }
        
        const filtros = {
            preco: document.getElementById('filtro-preco')?.value || '',
            marca: document.getElementById('filtro-marca')?.value || '',
            bsrFaixa: document.getElementById('filtro-bsr-faixa')?.value || '',
            bsrMin: document.getElementById('filtro-bsr-min')?.value || '',
            bsrMax: document.getElementById('filtro-bsr-max')?.value || '',
            patrocinado: document.getElementById('filtro-tipo')?.value || '',
            vendas: document.getElementById('filtro-vendas')?.value || ''
        };

        // Atualizar filtros no FilterManager
        Object.keys(filtros).forEach(tipo => {
            this.filterManager.atualizarFiltro(tipo, filtros[tipo]);
        });
        
        // Aplicar filtros
        const produtosFiltrados = this.filterManager.aplicarFiltros();
        
        // Atualizar tabela
        this.atualizarTabelaComFiltros(produtosFiltrados);
        
        // Atualizar contador
        const contador = document.getElementById('contador-produtos');
        if (contador) {
            contador.textContent = `${produtosFiltrados.length} produtos encontrados`;
        }
        
        NotificationManager.sucesso(`Filtros aplicados! ${produtosFiltrados.length} produtos encontrados.`);
    }

    static filtrarTabela(filtros) {
        const linhas = document.querySelectorAll('#tabela-produtos tbody tr');
        let produtosVisiveis = 0;

        linhas.forEach(linha => {
            const deveMostrar = this.verificarFiltros(linha, filtros);
            linha.style.display = deveMostrar ? '' : 'none';
            if (deveMostrar) produtosVisiveis++;
        });

        // Atualizar contador
        const contador = document.getElementById('contador-resultados');
        if (contador) {
            contador.textContent = produtosVisiveis;
        }

        return produtosVisiveis;
    }

    static verificarFiltros(linha, filtros) {
        // Busca por nome
        if (filtros.nome) {
            const titulo = linha.querySelector('td:nth-child(3) a')?.textContent?.toLowerCase() || '';
            if (!titulo.includes(filtros.nome.toLowerCase())) {
                return false;
            }
        }

        // Filtro de preço
        if (filtros.preco) {
            const precoTexto = linha.querySelector('td:nth-child(6)')?.textContent || '';
            const preco = parseFloat(precoTexto.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            
            const [min, max] = filtros.preco.split('-').map(p => {
                if (p.includes('+')) return Infinity;
                return parseFloat(p);
            });
            
            if (preco < min || (max !== Infinity && preco > max)) {
                return false;
            }
        }

        // Filtro de marca
        if (filtros.marca) {
            const marca = linha.querySelector('td:nth-child(5)')?.textContent?.trim() || '';
            if (marca !== filtros.marca) {
                return false;
            }
        }

        // Filtro de BSR
        if (filtros.bsrFaixa) {
            const bsrTexto = linha.querySelector('td:nth-child(10) span')?.textContent || '';
            // Extrair apenas o número do BSR (ex: "#11 Eletrônico" -> 11)
            const bsrMatch = bsrTexto.match(/#(\d+)/);
            const bsr = bsrMatch ? parseInt(bsrMatch[1]) : 0;
            
            if (filtros.bsrFaixa === 'custom') {
                const min = parseInt(filtros.bsrMin) || 1;
                const max = parseInt(filtros.bsrMax) || Infinity;
                
                if (bsr < min || (max !== Infinity && bsr > max)) {
                    return false;
                }
            } else {
                const [min, max] = filtros.bsrFaixa.split('-').map(p => {
                    if (p.includes('+')) return Infinity;
                    return parseInt(p);
                });
                
                if (bsr < min || (max !== Infinity && bsr > max)) {
                    return false;
                }
            }
        }

        // Filtro de tipo
        if (filtros.tipo) {
            const tipoTexto = linha.querySelector('td:nth-child(12) span')?.textContent || '';
            const isPatrocinado = tipoTexto === 'Patrocinado';
            
            if (filtros.tipo === 'patrocinado' && !isPatrocinado) {
                return false;
            }
            if (filtros.tipo === 'organico' && isPatrocinado) {
                return false;
            }
        }

        return true;
    }

    static limparFiltros() {
        // Limpar campos de filtro
        const camposFiltro = [
            'filtro-preco', 'filtro-marca', 
            'filtro-bsr-faixa', 'filtro-bsr-min', 
            'filtro-bsr-max', 'filtro-tipo', 'filtro-vendas'
        ];
        
        camposFiltro.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.value = '';
            }
        });
        
        // Limpar campo de busca
        const buscaNome = document.getElementById('busca-nome');
        if (buscaNome) {
            buscaNome.value = '';
        }
        
        // Ocultar campos de faixa personalizada
        const filtroCustom = document.getElementById('filtro-bsr-custom');
        if (filtroCustom) {
            filtroCustom.style.display = 'none';
        }
        
        // Limpar filtros no FilterManager
        const produtosFiltrados = this.filterManager.limparFiltros();
        
        // Atualizar tabela
        this.atualizarTabelaComFiltros(produtosFiltrados);
        
        // Atualizar contador
        const contador = document.getElementById('contador-produtos');
        if (contador) {
            contador.textContent = `${produtosFiltrados.length} produtos`;
        }
        
        NotificationManager.sucesso('Filtros limpos!');
    }

    static popularFiltroMarcas(produtos) {
        const filtroMarca = document.getElementById('filtro-marca');
        if (!filtroMarca) return;

        // Limpar opções existentes, mantendo apenas "Todas as marcas"
        filtroMarca.innerHTML = '<option value="">🏷️ Todas as marcas</option>';

        // Coletar todas as marcas únicas dos produtos
        const marcas = new Set();
        produtos.forEach(produto => {
            if (produto.marca && produto.marca !== 'N/A' && produto.marca.trim() !== '') {
                marcas.add(produto.marca.trim());
            }
        });

        // Adicionar marcas ao filtro
        Array.from(marcas).sort().forEach(marca => {
            const option = document.createElement('option');
            option.value = marca;
            option.textContent = marca;
            filtroMarca.appendChild(option);
        });
    }

    static inicializarFiltros(produtos) {
        // Configurar produtos no FilterManager
        this.filterManager.setProdutosOriginais(produtos);
        
        // Popular filtro de marcas
        this.popularFiltroMarcas(produtos);

        // Configurar busca em tempo real
        const buscaNome = document.getElementById('busca-nome');
        if (buscaNome) {
            buscaNome.addEventListener('input', (e) => {
                const filtros = {
                    nome: e.target.value,
                    preco: document.getElementById('filtro-preco')?.value || '',
                    marca: document.getElementById('filtro-marca')?.value || '',
                    bsrFaixa: document.getElementById('filtro-bsr-faixa')?.value || '',
                    bsrMin: document.getElementById('filtro-bsr-min')?.value || '',
                    bsrMax: document.getElementById('filtro-bsr-max')?.value || '',
                    tipo: document.getElementById('filtro-tipo')?.value || '',
                    vendas: document.getElementById('filtro-vendas')?.value || ''
                };
                
                this.filtrarTabela(filtros);
            });
        }
    }

    static atualizarTabelaComFiltros(produtosFiltrados) {
        const linhas = document.querySelectorAll('.linha-produto');
        
        linhas.forEach((linha, index) => {
            const produto = this.extrairDadosProduto(linha);
            const deveMostrar = produtosFiltrados.some(p => p.asin === produto.asin);
            
            if (deveMostrar) {
                linha.style.display = '';
                linha.classList.add('animate-fade-in');
            } else {
                linha.style.display = 'none';
                linha.classList.remove('animate-fade-in');
            }
        });
    }

    static extrairDadosProduto(linha) {
        // Extrair dados do produto da linha da tabela
        const dados = {
            asin: linha.getAttribute('data-asin') || '',
            posicao: linha.querySelector('td:nth-child(1)')?.textContent?.trim() || '',
            titulo: linha.querySelector('td:nth-child(2) a')?.textContent?.trim() || '',
            marca: linha.querySelector('td:nth-child(4)')?.textContent?.trim() || '',
            preco: linha.querySelector('td:nth-child(5)')?.textContent?.trim() || '',
            avaliacao: linha.querySelector('td:nth-child(6)')?.textContent?.trim() || '',
            numAvaliacoes: linha.querySelector('td:nth-child(7)')?.textContent?.trim() || '',
            vendidos: linha.querySelector('td:nth-child(8)')?.textContent?.trim() || '',
            ranking: linha.querySelector('td:nth-child(9) span')?.textContent?.trim() || '',
            categoria: linha.querySelector('td:nth-child(10)')?.textContent?.trim() || '',
            patrocinado: linha.querySelector('td:nth-child(11) span')?.textContent?.includes('Patrocinado') || false,
            link: linha.querySelector('td:nth-child(2) a')?.href || '',
            precoNumerico: 0,
            avaliacaoNumerica: 0
        };

        // Calcular valores numéricos
        dados.precoNumerico = parseFloat(dados.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        dados.avaliacaoNumerica = parseFloat(dados.avaliacao.replace(',', '.')) || 0;

        return dados;
    }

    static configurarEventosFiltros() {
        // Evento para mostrar/ocultar campos de faixa personalizada
        const filtroBsrFaixa = document.getElementById('filtro-bsr-faixa');
        const filtroBsrCustom = document.getElementById('filtro-bsr-custom');
        
        if (filtroBsrFaixa && filtroBsrCustom) {
            filtroBsrFaixa.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    filtroBsrCustom.style.display = 'flex';
                } else {
                    filtroBsrCustom.style.display = 'none';
                }
                // Aplicar filtros automaticamente
                this.aplicarFiltros();
            });
        }
        
        // Eventos para aplicar filtros automaticamente
        const camposFiltro = [
            'filtro-preco', 'filtro-marca', 
            'filtro-bsr-faixa', 'filtro-bsr-min', 
            'filtro-bsr-max', 'filtro-tipo', 'filtro-vendas'
        ];
        
        camposFiltro.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                // Aplicar filtros ao mudar valor
                elemento.addEventListener('change', () => {
                    this.aplicarFiltros();
                });
                
                // Aplicar filtros ao pressionar Enter
                elemento.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.aplicarFiltros();
                    }
                });
            }
        });
    }

    static configurarEventosExportacao() {
        // Botão exportar CSV
        const btnCSV = document.getElementById('btn-exportar-csv');
        if (btnCSV) {
            btnCSV.addEventListener('click', () => {
                btnCSV.classList.add('animate-pulse');
                btnCSV.textContent = '📊 Exportando...';
                
                setTimeout(() => {
                    // Extrair produtos da tabela e exportar
                    const produtos = this.exportManager.extrairProdutosDaTabela();
                    this.exportManager.exportarParaCSV();
                    
                    btnCSV.classList.remove('animate-pulse');
                    btnCSV.textContent = '📊 CSV';
                    btnCSV.classList.add('animate-bounce');
                    setTimeout(() => btnCSV.classList.remove('animate-bounce'), 1000);
                }, 300);
            });
        }

        // Botão exportar Excel
        const btnExcel = document.getElementById('btn-exportar-excel');
        if (btnExcel) {
            btnExcel.addEventListener('click', () => {
                btnExcel.classList.add('animate-pulse');
                btnExcel.textContent = '📈 Exportando...';
                
                setTimeout(() => {
                    // Extrair produtos da tabela e exportar
                    const produtos = this.exportManager.extrairProdutosDaTabela();
                    this.exportManager.exportarParaExcel();
                    
                    btnExcel.classList.remove('animate-pulse');
                    btnExcel.textContent = '📈 Excel';
                    btnExcel.classList.add('animate-bounce');
                    setTimeout(() => btnExcel.classList.remove('animate-bounce'), 1000);
                }, 300);
            });
        }

        // Botão buscar marcas
        const btnBuscarMarcas = document.getElementById('btn-buscar-marcas');
        if (btnBuscarMarcas) {
            btnBuscarMarcas.addEventListener('click', async () => {
                btnBuscarMarcas.classList.add('animate-pulse');
                btnBuscarMarcas.textContent = '🏷️ Buscando...';
                btnBuscarMarcas.disabled = true;
                
                try {
                    // Buscar marcas faltantes
                    await ProductAnalyzer.buscarMarcasFaltantes(window.produtosTabela, TableManager.atualizarLinhaProduto);
                    
                    btnBuscarMarcas.classList.remove('animate-pulse');
                    btnBuscarMarcas.textContent = '🏷️ Buscar Marcas';
                    btnBuscarMarcas.classList.add('animate-bounce');
                    setTimeout(() => btnBuscarMarcas.classList.remove('animate-bounce'), 1000);
                    
                } catch (error) {
                    console.error('Erro ao buscar marcas:', error);
                    btnBuscarMarcas.textContent = '🏷️ Erro';
                    setTimeout(() => {
                        btnBuscarMarcas.textContent = '🏷️ Buscar Marcas';
                    }, 2000);
                } finally {
                    btnBuscarMarcas.disabled = false;
                }
            });
        }
    }

    static inicializarEventos() {
        // Configurar eventos de filtros
        this.configurarEventosFiltros();
        
        // Configurar eventos de exportação
        this.configurarEventosExportacao();
        
        // Configurar barra de busca
        this.inicializarBarraBusca();
        
        // Configurar eventos de botões
        const btnAplicar = document.getElementById('btn-aplicar-filtros');
        if (btnAplicar) {
            btnAplicar.addEventListener('click', () => {
                this.aplicarFiltros();
            });
        }
        
        const btnLimpar = document.getElementById('btn-limpar-filtros');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                this.limparFiltros();
            });
        }
        
        // Configurar botão de tema
        const btnTema = document.getElementById('btn-tema');
        if (btnTema && this.themeManager) {
            this.themeManager.updateThemeButton();
        }
        
        // Inicializar filtros (será chamado quando a tabela for criada)
        if (window.produtosTabela) {
            this.inicializarFiltros(window.produtosTabela);
        }
        
        // Ativar busca automática de marcas e BSR após um pequeno delay
        setTimeout(() => {
            this.ativarBuscaAutomaticaMarcas();
        }, 1000);
    }

    static ativarBuscaAutomaticaMarcas() {
        console.log('🔍 Ativando busca automática de marcas...');
        
        const btnBuscarMarcas = document.getElementById('btn-buscar-marcas');
        
        if (btnBuscarMarcas) {
            console.log('✅ Botão buscar marcas encontrado, ativando automaticamente...');
            
            // Simular clique no botão
            btnBuscarMarcas.click();
            
            // Adicionar indicador visual de que foi ativado automaticamente
            btnBuscarMarcas.style.background = 'rgba(16, 185, 129, 0.8)';
            btnBuscarMarcas.title = 'Busca automática ativada!';
            
            // Restaurar cor original após 3 segundos
            setTimeout(() => {
                btnBuscarMarcas.style.background = 'rgba(59, 130, 246, 0.8)';
                btnBuscarMarcas.title = 'Buscar marcas faltantes manualmente';
            }, 3000);
            
        } else {
            console.log('ℹ️ Botão buscar marcas não encontrado (pode não estar na tabela)');
        }
    }

    static atualizarLinhaProduto(produto, index) {
        const linha = document.querySelector(`.linha-produto[data-asin="${produto.asin}"]`);
        if (linha) {
            // Atualizar dados da linha
            const tituloCell = linha.querySelector('td:nth-child(3) a');
            if (tituloCell) {
                tituloCell.textContent = produto.titulo || 'N/A';
                tituloCell.title = produto.titulo || '';
            }

            // Atualizar ASIN (coluna 4)
            const asinCell = linha.querySelector('td:nth-child(4) span');
            if (asinCell) {
                asinCell.textContent = produto.asin || 'N/A';
            }

            // Atualizar Marca (coluna 5)
            const marcaCell = linha.querySelector('td:nth-child(5)');
            if (marcaCell) {
                marcaCell.textContent = produto.marca || 'N/A';
                
                // Adicionar tooltip com informações adicionais se disponível
                if (produto.informacoesAdicionais) {
                    const tooltip = [];
                    if (produto.informacoesAdicionais.dimensoes) tooltip.push(`Dimensões: ${produto.informacoesAdicionais.dimensoes}`);
                    if (produto.informacoesAdicionais.peso) tooltip.push(`Peso: ${produto.informacoesAdicionais.peso}`);
                    if (produto.informacoesAdicionais.material) tooltip.push(`Material: ${produto.informacoesAdicionais.material}`);
                    
                    if (tooltip.length > 0) {
                        marcaCell.title = tooltip.join('\n');
                        marcaCell.style.cursor = 'help';
                    }
                }
            }

            const precoCell = linha.querySelector('td:nth-child(6)');
            if (precoCell) {
                precoCell.textContent = produto.preco || 'N/A';
            }

            const avaliacaoCell = linha.querySelector('td:nth-child(7) span');
            if (avaliacaoCell) {
                // Usar avaliação detalhada se disponível
                const rating = produto.avaliacoesDetalhadas?.rating || produto.avaliacao;
                avaliacaoCell.textContent = rating || 'N/A';
            }

            const numAvaliacoesCell = linha.querySelector('td:nth-child(8)');
            if (numAvaliacoesCell) {
                // Usar número de avaliações detalhado se disponível
                const numAval = produto.avaliacoesDetalhadas?.numAvaliacoes || produto.numAvaliacoes;
                numAvaliacoesCell.textContent = numAval || 'N/A';
            }

            const vendidosCell = linha.querySelector('td:nth-child(9)');
            if (vendidosCell) {
                vendidosCell.textContent = produto.vendidos || 'N/A';
            }

            const receitaCell = linha.querySelector('td:nth-child(10)');
            if (receitaCell) {
                const receitaMes = (produto.precoNumerico || 0) * (produto.vendidos || 0);
                receitaCell.textContent = `R$ ${receitaMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            }

            const rankingCell = linha.querySelector('td:nth-child(11) span');
            if (rankingCell) {
                // Limpar conteúdo anterior
                rankingCell.innerHTML = '';
                
                if (produto.infoVendas?.rankings && produto.infoVendas.rankings.length > 0) {
                    const rankings = produto.infoVendas.rankings;
                    
                    rankings.forEach((ranking, index) => {
                        const rankingSpan = document.createElement('div');
                        rankingSpan.style.cssText = `
                            margin-bottom: 2px;
                            font-size: 11px;
                            font-weight: 600;
                            line-height: 1.2;
                        `;
                        
                        // Cores baseadas no tipo de ranking
                        let cor = '#10b981'; // Verde padrão
                        if (ranking.tipo === 'geral') {
                            cor = '#f97316'; // Laranja vibrante
                        } else if (ranking.tipo === 'especifico') {
                            cor = '#10b981'; // Verde
                        } else if (ranking.tipo === 'terceiro') {
                            cor = '#3b82f6'; // Azul
                        }
                        
                        // Cor baseada na posição (sobrescreve a cor do tipo se for muito alta)
                        if (ranking.posicao <= 100) {
                            cor = '#10b981'; // Verde para top 100
                        } else if (ranking.posicao <= 1000) {
                            cor = '#f59e0b'; // Amarelo para top 1000
                        } else if (ranking.posicao > 10000) {
                            cor = '#ef4444'; // Vermelho para posições muito altas
                        }
                        
                        rankingSpan.style.color = cor;
                        rankingSpan.textContent = `#${ranking.posicao} ${ranking.categoria}`;
                        
                        // Tooltip com informações detalhadas
                        rankingSpan.title = `${ranking.tipo.toUpperCase()}: #${ranking.posicao} em ${ranking.categoria}`;
                        rankingSpan.style.cursor = 'help';
                        
                        rankingCell.appendChild(rankingSpan);
                    });
                } else {
                    // Fallback para dados antigos
                    const bsrEspecifico = produto.infoVendas?.bsrEspecifico;
                    const bsrGeral = produto.infoVendas?.bsrGeral;
                    const bsr = bsrEspecifico || bsrGeral || produto.infoVendas?.bsr || produto.ranking;
                    
                    if (bsr) {
                        const rankingSpan = document.createElement('div');
                        rankingSpan.textContent = `#${bsr}`;
                        rankingSpan.style.color = bsr <= 100 ? '#10b981' : 
                                                 bsr <= 1000 ? '#f59e0b' : '#ef4444';
                        rankingSpan.style.cursor = 'pointer';
                        rankingSpan.title = 'Clique para ver detalhes do BSR';
                        rankingSpan.onclick = (e) => {
                            e.stopPropagation();
                            TableManager.toggleRankingInfo(rankingSpan);
                        };
                        rankingCell.appendChild(rankingSpan);
                    } else {
                        rankingCell.textContent = 'N/A';
                    }
                }
            }

            const categoriaCell = linha.querySelector('td:nth-child(12)');
            if (categoriaCell) {
                // Usar categoria extraída da página do produto se disponível
                const categoriaExtraida = produto.categoria;
                categoriaCell.textContent = categoriaExtraida || produto.categoria || 'N/A';
                
                // Adicionar tooltip se a categoria foi extraída da página
                if (categoriaExtraida && categoriaExtraida !== 'N/A') {
                    categoriaCell.title = `Categoria extraída da página do produto: ${categoriaExtraida}`;
                    categoriaCell.style.cursor = 'help';
                    categoriaCell.style.color = '#10b981'; // Verde para indicar que foi extraída
                }
            }

            const tipoCell = linha.querySelector('td:nth-child(13) span');
            if (tipoCell) {
                const isPatrocinado = produto.patrocinado;
                tipoCell.textContent = isPatrocinado ? 'Patrocinado' : 'Orgânico';
                tipoCell.style.background = isPatrocinado ? '#3b82f6' : '#10b981';
            }

            // Adicionar indicador visual se tem dados extras
            if (produto.informacoesAdicionais || produto.especificacoes || produto.infoVendas) {
                linha.setAttribute('data-dados-extras', 'true');
            }

            // Adicionar animação de atualização
            linha.classList.add('animate-fade-in');
            setTimeout(() => linha.classList.remove('animate-fade-in'), 1000);
        }
    }

    static atualizarMetricas(produtos) {
        const metricas = ProductAnalyzer.calcularMetricas(produtos);
        
        // Calcular produtos no TOP 100 e TOP 1000 baseado no BSR geral
        let produtosTop100 = 0;
        let produtosTop1000 = 0;
        
        produtos.forEach(produto => {
            // Usar o BSR geral (primeiro ranking disponível)
            let bsrGeral = produto.ranking; // Fallback para ranking antigo
            
            // Tentar pegar o BSR geral dos rankings múltiplos
            if (produto.rankings && produto.rankings.length > 0) {
                const rankingGeral = produto.rankings.find(r => r.tipo === 'geral');
                if (rankingGeral) {
                    bsrGeral = rankingGeral.posicao;
                }
            }
            
            // Se não encontrou BSR geral, usar o primeiro ranking disponível
            if (!bsrGeral && produto.rankings && produto.rankings.length > 0) {
                bsrGeral = produto.rankings[0].posicao;
            }
            
            if (bsrGeral && bsrGeral <= 100) {
                produtosTop100++;
            }
            if (bsrGeral && bsrGeral <= 1000) {
                produtosTop1000++;
            }
        });
        
        // Atualizar métricas na interface se existirem
        const receitaElement = document.querySelector('[data-metrica="receita"]');
        if (receitaElement) {
            receitaElement.textContent = `R$ ${(metricas.receitaTotal || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        }

        const vendasElement = document.querySelector('[data-metrica="vendas"]');
        if (vendasElement) {
            const totalVendas = produtos.reduce((total, produto) => total + (produto.vendidos || 0), 0);
            vendasElement.textContent = totalVendas.toLocaleString('pt-BR');
        }

        const precoMedioElement = document.querySelector('[data-metrica="preco-medio"]');
        if (precoMedioElement) {
            precoMedioElement.textContent = `R$ ${(metricas.precoMedio || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        }

        const avaliacaoElement = document.querySelector('[data-metrica="avaliacao"]');
        if (avaliacaoElement) {
            avaliacaoElement.textContent = `${(metricas.mediaAvaliacao || 0).toFixed(1)} ⭐`;
        }
        
        // Retornar métricas atualizadas
        return {
            ...metricas,
            produtosTop100,
            produtosTop1000
        };
    }

    static calcularNivelCompetitividade(metricas) {
        // Implemente a lógica para calcular o nível de competitividade com base nos dados fornecidos
        // Este é um exemplo básico e pode ser ajustado de acordo com a sua lógica de negócios
        if (metricas.produtosTop100 && metricas.produtosTop1000 && metricas.produtosPatrocinados) {
            const nivel = (metricas.produtosTop100 + metricas.produtosTop1000 + metricas.produtosPatrocinados) / 3;
            return nivel.toFixed(2);
        }
        return 'Não disponível';
    }

    static async copiarASIN(asin) {
        console.log('🔍 Tentando copiar ASIN:', asin);
        
        if (!asin || asin === 'N/A') {
            console.log('❌ ASIN inválido:', asin);
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.erro('ASIN inválido para copiar');
            }
            return;
        }

        // Função para mostrar feedback visual
        const mostrarFeedback = (sucesso) => {
            const elemento = event?.target;
            if (elemento) {
                elemento.style.background = sucesso ? '#d1fae5' : '#fee2e2';
                setTimeout(() => {
                    elemento.style.background = 'transparent';
                }, 500);
            }
        };

        // Tentar usar ClipboardManager primeiro
        if (typeof ClipboardManager !== 'undefined' && ClipboardManager.copiarParaClipboard) {
            console.log('📋 Usando ClipboardManager');
            try {
                ClipboardManager.copiarParaClipboard(asin);
                mostrarFeedback(true);
            } catch (error) {
                console.error('❌ Erro no ClipboardManager:', error);
                this.copiarASINFallback(asin, mostrarFeedback);
            }
        } else {
            console.log('📋 Usando fallback');
            this.copiarASINFallback(asin, mostrarFeedback);
        }
    }

    static copiarASINFallback(asin, mostrarFeedback) {
        // Fallback para navegadores modernos
        if (navigator.clipboard) {
            navigator.clipboard.writeText(asin)
                .then(() => {
                    console.log('✅ ASIN copiado com sucesso');
                    if (typeof NotificationManager !== 'undefined') {
                        NotificationManager.sucesso('ASIN copiado!');
                    }
                    mostrarFeedback(true);
                })
                .catch((error) => {
                    console.error('❌ Erro ao copiar com clipboard API:', error);
                    this.copiarASINLegacy(asin, mostrarFeedback);
                });
        } else {
            // Fallback para navegadores antigos
            this.copiarASINLegacy(asin, mostrarFeedback);
        }
    }

    static copiarASINLegacy(asin, mostrarFeedback) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = asin;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const resultado = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (resultado) {
                console.log('✅ ASIN copiado com sucesso (legacy)');
                if (typeof NotificationManager !== 'undefined') {
                    NotificationManager.sucesso('ASIN copiado!');
                }
                mostrarFeedback(true);
            } else {
                throw new Error('execCommand retornou false');
            }
        } catch (error) {
            console.error('❌ Erro ao copiar com execCommand:', error);
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.erro('Erro ao copiar ASIN');
            }
            mostrarFeedback(false);
        }
    }

    static toggleRankingInfo(element) {
        // Implementação melhorada para mostrar informações detalhadas do ranking
        const ranking = element.textContent.replace('#', '');
        if (ranking && ranking !== 'N/A') {
            const rankingNum = parseInt(ranking);
            let mensagem = `📊 Ranking BSR: #${ranking}`;
            let tipo = '';
            let cor = '';
            
            if (rankingNum <= 100) {
                tipo = 'EXCELENTE';
                cor = '#10b981';
                mensagem += '\n🏆 Posicionamento: EXCELENTE';
                mensagem += '\n💡 Este produto está no TOP 100 da categoria!';
                mensagem += '\n📈 Alto potencial de vendas';
                mensagem += '\n🎯 Baixa competição';
            } else if (rankingNum <= 1000) {
                tipo = 'BOM';
                cor = '#f59e0b';
                mensagem += '\n🥈 Posicionamento: BOM';
                mensagem += '\n💡 Este produto está no TOP 1000 da categoria';
                mensagem += '\n📈 Bom potencial de vendas';
                mensagem += '\n🎯 Competição moderada';
            } else if (rankingNum <= 10000) {
                tipo = 'MÉDIO';
                cor = '#f59e0b';
                mensagem += '\n🥉 Posicionamento: MÉDIO';
                mensagem += '\n💡 Este produto está no TOP 10000 da categoria';
                mensagem += '\n📈 Potencial de vendas moderado';
                mensagem += '\n🎯 Competição alta';
            } else {
                tipo = 'BAIXO';
                cor = '#ef4444';
                mensagem += '\n📉 Posicionamento: BAIXO';
                mensagem += '\n💡 Este produto está fora do TOP 10000';
                mensagem += '\n📈 Baixo potencial de vendas';
                mensagem += '\n🎯 Competição muito alta';
            }
            
            // Adicionar informações sobre a categoria se disponível
            const linha = element.closest('tr');
            if (linha) {
                const categoriaCell = linha.querySelector('td:nth-child(12)');
                if (categoriaCell && categoriaCell.textContent !== 'N/A') {
                    mensagem += `\n📂 Categoria: ${categoriaCell.textContent}`;
                }
            }
            
            // Adicionar dicas baseadas no ranking
            mensagem += '\n\n💡 Dicas:';
            if (rankingNum <= 100) {
                mensagem += '\n• Produto com alto potencial de lucro';
                mensagem += '\n• Considere investir em anúncios';
                mensagem += '\n• Monitore preços da concorrência';
            } else if (rankingNum <= 1000) {
                mensagem += '\n• Produto com bom potencial';
                mensagem += '\n• Analise estratégias de preço';
                mensagem += '\n• Considere melhorias no produto';
            } else if (rankingNum <= 10000) {
                mensagem += '\n• Produto com potencial limitado';
                mensagem += '\n• Foque em nichos específicos';
                mensagem += '\n• Considere diferenciação';
            } else {
                mensagem += '\n• Produto com baixo potencial';
                mensagem += '\n• Considere outras categorias';
                mensagem += '\n• Analise produtos similares';
            }
            
            // Mostrar notificação com informações detalhadas
            if (typeof NotificationManager !== 'undefined') {
                // Criar uma notificação customizada com mais informações
                const notificacao = document.createElement('div');
                notificacao.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.95);
                    color: white;
                    padding: 20px;
                    border-radius: 12px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    max-width: 400px;
                    z-index: 100000;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    border: 2px solid ${cor};
                    white-space: pre-line;
                    line-height: 1.5;
                `;
                
                notificacao.innerHTML = `
                    <div style="margin-bottom: 15px; text-align: center;">
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 5px;">📊 Análise BSR</div>
                        <div style="font-size: 12px; opacity: 0.8;">Clique fora para fechar</div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        ${mensagem}
                    </div>
                    <div style="text-align: center;">
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            background: ${cor};
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 12px;
                            font-weight: 500;
                        ">Fechar</button>
                    </div>
                `;
                
                document.body.appendChild(notificacao);
                
                // Fechar ao clicar fora
                notificacao.addEventListener('click', (e) => {
                    if (e.target === notificacao) {
                        notificacao.remove();
                    }
                });
                
                // Fechar automaticamente após 10 segundos
                setTimeout(() => {
                    if (notificacao.parentNode) {
                        notificacao.remove();
                    }
                }, 10000);
            } else {
                // Fallback para notificação simples
                alert(mensagem);
            }
        }
    }

    static filtrarProdutos(termo) {
        const tabela = document.getElementById('tabela-produtos');
        if (!tabela) return;
        
        const linhas = tabela.querySelectorAll('tbody tr');
        const termoLower = termo.toLowerCase();
        
        linhas.forEach(linha => {
            const texto = linha.textContent.toLowerCase();
            const deveMostrar = texto.includes(termoLower);
            linha.style.display = deveMostrar ? '' : 'none';
        });
    }

    static inicializarBarraBusca() {
        // Barra de busca da tabela (busca por nome)
        const barraBuscaNome = document.getElementById('busca-nome');
        if (barraBuscaNome) {
            // Limpar busca anterior
            barraBuscaNome.value = '';
            
            // Adicionar evento de input para busca em tempo real
            barraBuscaNome.addEventListener('input', (e) => {
                this.filtrarProdutos(e.target.value);
            });
            
            // Adicionar evento de keydown para Enter
            barraBuscaNome.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.filtrarProdutos(e.target.value);
                }
            });
        }
        
        // Barra de busca principal (nova busca na Amazon)
        const novaBusca = document.getElementById('nova-busca');
        const btnBuscar = document.getElementById('btn-buscar');
        
        if (novaBusca && btnBuscar) {
            // Evento de busca ao pressionar Enter
            novaBusca.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.realizarNovaBusca();
                }
            });
            
            // Evento de busca ao clicar no botão
            btnBuscar.addEventListener('click', () => {
                this.realizarNovaBusca();
            });
        }
    }
    
    static realizarNovaBusca() {
        const termoBusca = document.getElementById('nova-busca').value.trim();
        if (termoBusca) {
            // Construir URL de busca da Amazon
            const urlBase = window.location.origin;
            const urlBusca = `${urlBase}/s?k=${encodeURIComponent(termoBusca)}`;
            
            // Navegar para a nova busca
            window.location.href = urlBusca;
        } else {
            NotificationManager.erro('Digite um termo para buscar');
        }
    }

    static getTop10BSR(produtos, limite) {
        // Filtrar produtos que estão dentro do limite especificado
        const produtosFiltrados = produtos.filter(produto => {
            const bsrGeral = produto.rankings && produto.rankings.length > 0 ? 
                produto.rankings.find(r => r.tipo === 'geral')?.posicao : 
                produto.ranking;
            return bsrGeral && bsrGeral <= limite;
        });
        
        // Ordenar por BSR (menor = melhor ranking) e pegar os top 10
        const top10 = produtosFiltrados
            .sort((a, b) => {
                const bsrA = a.rankings && a.rankings.length > 0 ? 
                    a.rankings.find(r => r.tipo === 'geral')?.posicao : 
                    a.ranking;
                const bsrB = b.rankings && b.rankings.length > 0 ? 
                    b.rankings.find(r => r.tipo === 'geral')?.posicao : 
                    b.ranking;
                return (bsrA || Infinity) - (bsrB || Infinity);
            })
            .slice(0, 10)
            .map(produto => {
                const bsr = produto.rankings && produto.rankings.length > 0 ? 
                    produto.rankings.find(r => r.tipo === 'geral')?.posicao : 
                    produto.ranking;
                return `#${bsr}`;
            });
        
        return top10;
    }
}

window.TableManager = TableManager; 