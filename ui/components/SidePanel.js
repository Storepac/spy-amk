/**
 * SidePanel - Painel lateral para análise de produtos
 * Substitui o popup para evitar problemas de CSP
 */
class SidePanel {
    static isVisible = false;
    static panelElement = null;
    static currentPlatform = null;

    static criar() {
        if (this.panelElement) {
            return this.panelElement;
        }

        const panel = document.createElement('div');
        panel.id = 'amk-spy-sidepanel';
        panel.innerHTML = this.criarHTML();
        
        // Adicionar à página
        document.body.appendChild(panel);
        this.panelElement = panel;
        
        // Configurar eventos
        this.configurarEventos();
        
        console.log('✅ SidePanel criado com sucesso');
        return panel;
    }

    static criarHTML() {
        return `
            <div style="
                position: fixed;
                top: 0;
                right: -320px;
                width: 320px;
                height: 100vh;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border-left: 2px solid #014641;
                box-shadow: -5px 0 15px rgba(0,0,0,0.1);
                z-index: 999999;
                font-family: 'Poppins', sans-serif;
                transition: right 0.3s ease;
                overflow-y: auto;
                scrollbar-width: thin;
            " class="amk-sidepanel-container">
                <!-- Header -->
                <div style="
                    background: linear-gradient(135deg, #014641, #013935);
                    color: white;
                    padding: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                ">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="
                            width: 30px; 
                            height: 30px; 
                            background: white; 
                            border-radius: 6px; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            font-weight: bold; 
                            color: #014641;
                        ">AMK</div>
                        <div>
                            <div style="font-size: 16px; font-weight: 700;">AMK spy</div>
                            <div style="font-size: 11px; opacity: 0.8;">Análise de Produtos</div>
                        </div>
                    </div>
                    <button id="amk-close-panel" style="
                        background: rgba(255,255,255,0.1);
                        border: none;
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        transition: all 0.2s;
                    " title="Fechar painel">×</button>
                </div>

                <!-- Conteúdo -->
                <div style="padding: 20px;">
                    <!-- Campo de Busca -->
                    <div style="margin-bottom: 20px;">
                        <label style="
                            display: block;
                            font-size: 14px;
                            font-weight: 600;
                            color: #014641;
                            margin-bottom: 8px;
                        ">🔍 Termo de Busca:</label>
                        <input 
                            type="text" 
                            id="amk-search-term" 
                            style="
                                width: 100%;
                                padding: 12px;
                                border: 2px solid #014641;
                                border-radius: 8px;
                                font-size: 14px;
                                font-family: 'Poppins', sans-serif;
                                background: white;
                                color: #333;
                                transition: all 0.3s ease;
                                box-sizing: border-box;
                            "
                            placeholder="Digite o termo para buscar..."
                        >
                    </div>

                    <!-- Filtros de Análise -->
                    <div style="
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 20px;
                        border-left: 4px solid #014641;
                    ">
                        <div style="
                            font-size: 14px;
                            font-weight: 600;
                            color: #014641;
                            margin-bottom: 15px;
                            text-align: center;
                        ">🎯 Filtros de Análise</div>

                        <!-- Preço do BuyBox -->
                        <div style="
                            background: #f8f9fa;
                            border-radius: 8px;
                            padding: 12px;
                            margin-bottom: 12px;
                            border: 1px solid #e9ecef;
                        ">
                            <div style="
                                font-size: 13px;
                                font-weight: 600;
                                color: #014641;
                                margin-bottom: 8px;
                            ">💰 Preço do BuyBox</div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <div style="flex: 1;">
                                    <input 
                                        type="number" 
                                        id="amk-filter-preco-min"
                                        placeholder="R$ Mín"
                                        min="0"
                                        step="0.01"
                                        style="
                                            width: 100%;
                                            padding: 8px;
                                            border: 1px solid #ced4da;
                                            border-radius: 4px;
                                            font-size: 12px;
                                            box-sizing: border-box;
                                        "
                                    >
                                </div>
                                <span style="color: #6c757d; font-size: 12px;">até</span>
                                <div style="flex: 1;">
                                    <input 
                                        type="number" 
                                        id="amk-filter-preco-max"
                                        placeholder="R$ Máx"
                                        min="0"
                                        step="0.01"
                                        style="
                                            width: 100%;
                                            padding: 8px;
                                            border: 1px solid #ced4da;
                                            border-radius: 4px;
                                            font-size: 12px;
                                            box-sizing: border-box;
                                        "
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- N° de Vendas -->
                        <div style="
                            background: #f8f9fa;
                            border-radius: 8px;
                            padding: 12px;
                            margin-bottom: 15px;
                            border: 1px solid #e9ecef;
                        ">
                            <div style="
                                font-size: 13px;
                                font-weight: 600;
                                color: #014641;
                                margin-bottom: 8px;
                            ">📈 N° de Vendas</div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <div style="flex: 1;">
                                    <input 
                                        type="number" 
                                        id="amk-filter-vendas-min"
                                        placeholder="Vendas Mín"
                                        min="0"
                                        style="
                                            width: 100%;
                                            padding: 8px;
                                            border: 1px solid #ced4da;
                                            border-radius: 4px;
                                            font-size: 12px;
                                            box-sizing: border-box;
                                        "
                                    >
                                </div>
                                <span style="color: #6c757d; font-size: 12px;">até</span>
                                <div style="flex: 1;">
                                    <input 
                                        type="number" 
                                        id="amk-filter-vendas-max"
                                        placeholder="Vendas Máx"
                                        min="0"
                                        style="
                                            width: 100%;
                                            padding: 8px;
                                            border: 1px solid #ced4da;
                                            border-radius: 4px;
                                            font-size: 12px;
                                            box-sizing: border-box;
                                        "
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Botões de Análise -->
                    <div style="margin-bottom: 20px;">
                        <div style="
                            font-size: 14px;
                            font-weight: 600;
                            color: #014641;
                            margin-bottom: 12px;
                            text-align: center;
                        ">Escolha o tipo de análise:</div>
                        
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <button 
                                id="amk-btn-analise-rapida" 
                                style="
                                    padding: 14px 16px;
                                    border: none;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    font-weight: 600;
                                    font-family: 'Poppins', sans-serif;
                                    cursor: pointer;
                                    transition: all 0.3s ease;
                                    background: linear-gradient(135deg, #10b981, #059669);
                                    color: white;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    gap: 4px;
                                "
                                title="Analisa apenas a página atual"
                            >
                                <span>⚡ Análise Rápida</span>
                                <span style="font-size: 11px; opacity: 0.9;">Página atual</span>
                            </button>
                            
                            <button 
                                id="amk-btn-analise-completa" 
                                style="
                                    padding: 14px 16px;
                                    border: none;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    font-weight: 600;
                                    font-family: 'Poppins', sans-serif;
                                    cursor: pointer;
                                    transition: all 0.3s ease;
                                    background: linear-gradient(135deg, #014641, #013935);
                                    color: white;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    gap: 4px;
                                "
                                title="Analisa todas as páginas de resultados"
                            >
                                <span>🚀 Análise Completa</span>
                                <span style="font-size: 11px; opacity: 0.9;">Todas as páginas</span>
                            </button>
                        </div>
                    </div>

                    <!-- Botão Toggle Tabela -->
                    <div style="margin-bottom: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                        <button 
                            id="amk-btn-toggle-table" 
                            style="
                                width: 100%;
                                padding: 12px 16px;
                                border: none;
                                border-radius: 8px;
                                font-size: 14px;
                                font-weight: 600;
                                font-family: 'Poppins', sans-serif;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                background: linear-gradient(135deg, #3b82f6, #2563eb);
                                color: white;
                            "
                            title="Abre/fecha a tabela de produtos"
                        >
                            📊 Abrir/Fechar Tabela
                        </button>
                    </div>

                    <!-- Status -->
                    <div style="
                        background: #f3f4f6;
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 15px;
                        border-left: 4px solid #3b82f6;
                    ">
                        <div id="amk-status" style="
                            font-size: 13px;
                            color: #374151;
                            line-height: 1.4;
                        ">Pronto para análise</div>
                    </div>

                    <!-- Informações -->
                    <div style="
                        background: #f0f9ff;
                        border-radius: 8px;
                        padding: 12px;
                        border-left: 4px solid #0ea5e9;
                    ">
                        <div style="font-size: 12px; color: #0369a1; line-height: 1.4;">
                            <strong>💡 Dicas:</strong><br>
                            • Digite um termo e escolha o tipo de análise<br>
                            • Análise rápida: apenas página atual<br>
                            • Análise completa: todas as páginas<br>
                            • Use o botão AMK Spy para alternar tabela
                        </div>
                    </div>
                </div>
            </div>

            <!-- Toggle Button (botão redondo flutuante) -->
            <div id="amk-toggle-button" style="
                position: fixed;
                top: 50%;
                right: 10px;
                transform: translateY(-50%);
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #014641, #013935);
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 999998;
                transition: all 0.3s ease;
                border: 3px solid white;
            " title="Abrir/Fechar painel AMK spy">
                <span style="color: white; font-size: 18px; font-weight: bold;">${this.getIconForPlatform()}</span>
            </div>
        `;
    }

    static configurarEventos() {
        const panel = this.panelElement;
        if (!panel) return;

        // Botão fechar painel
        const btnClose = panel.querySelector('#amk-close-panel');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.fechar());
        }

        // Botão toggle (redondo)
        const btnToggle = panel.querySelector('#amk-toggle-button');
        if (btnToggle) {
            btnToggle.addEventListener('click', () => this.toggle());
        }

        // Campo de busca - Enter
        const searchInput = panel.querySelector('#amk-search-term');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executarAnalise('rapida');
                }
            });
        }

        // Botão análise rápida
        const btnRapida = panel.querySelector('#amk-btn-analise-rapida');
        if (btnRapida) {
            btnRapida.addEventListener('click', () => this.executarAnalise('rapida'));
        }

        // Botão análise completa
        const btnCompleta = panel.querySelector('#amk-btn-analise-completa');
        if (btnCompleta) {
            btnCompleta.addEventListener('click', () => this.executarAnalise('completa'));
        }

        // Botão toggle tabela
        const btnToggleTable = panel.querySelector('#amk-btn-toggle-table');
        if (btnToggleTable) {
            btnToggleTable.addEventListener('click', () => this.toggleTabela());
        }

        // Hover effects
        this.adicionarHoverEffects();
    }

    static adicionarHoverEffects() {
        const buttons = this.panelElement.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.02)';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            });
        });
    }

    static coletarFiltros() {
        if (!this.panelElement) return {};

        const panel = this.panelElement;
        
        // Coletar valores dos filtros
        const filtros = {
            // Preço
            precoMin: parseFloat(panel.querySelector('#amk-filter-preco-min')?.value) || null,
            precoMax: parseFloat(panel.querySelector('#amk-filter-preco-max')?.value) || null,
            
            // Vendas
            vendasMin: parseInt(panel.querySelector('#amk-filter-vendas-min')?.value) || null,
            vendasMax: parseInt(panel.querySelector('#amk-filter-vendas-max')?.value) || null
        };

        console.log('🎯 Filtros coletados:', filtros);
        return filtros;
    }

    static aplicarFiltrosProdutos(produtos, filtros) {
        if (!produtos || produtos.length === 0) return produtos;
        if (!filtros || Object.keys(filtros).length === 0) return produtos;

        console.log('🎯 SidePanel - Aplicando filtros:', filtros);
        console.log('📊 SidePanel - Produtos antes do filtro:', produtos.length);

        let produtosFiltrados = produtos.filter((produto, index) => {
            // Debug detalhado para os primeiros 5 produtos
            if (index < 5) {
                console.log(`🔍 SidePanel - Produto ${index + 1} - Debug:`, {
                    titulo: produto.titulo?.substring(0, 30) + '...',
                    precoNumerico: produto.precoNumerico,
                    preco: produto.preco,
                    vendidos: produto.vendidos
                });
            }

            // Extrair preço de múltiplas fontes
            let preco = 0;
            if (produto.precoNumerico && !isNaN(parseFloat(produto.precoNumerico))) {
                preco = parseFloat(produto.precoNumerico);
            } else if (produto.preco) {
                // Tentar extrair preço do texto
                const precoMatch = produto.preco.toString().match(/[\d,\.]+/);
                if (precoMatch) {
                    preco = parseFloat(precoMatch[0].replace(',', '.'));
                }
            }

            // Extrair vendas
            let vendas = 0;
            if (produto.vendidos && !isNaN(parseInt(produto.vendidos))) {
                vendas = parseInt(produto.vendidos);
            }

            // Debug dos valores extraídos para os primeiros produtos
            if (index < 5) {
                console.log(`🔍 SidePanel - Valores extraídos Produto ${index + 1}:`, {
                    preco: preco,
                    vendas: vendas
                });
            }

            // Aplicar filtros

            // Filtro de preço
            if (filtros.precoMin || filtros.precoMax) {
                if (filtros.precoMin && (preco === 0 || preco < filtros.precoMin)) {
                    if (index < 5) console.log(`❌ SidePanel - Produto ${index + 1} reprovado - Preço Min: R$${preco} < R$${filtros.precoMin}`);
                    return false;
                }
                if (filtros.precoMax && (preco === 0 || preco > filtros.precoMax)) {
                    if (index < 5) console.log(`❌ SidePanel - Produto ${index + 1} reprovado - Preço Max: R$${preco} > R$${filtros.precoMax}`);
                    return false;
                }
            }

            // Filtro de vendas
            if (filtros.vendasMin || filtros.vendasMax) {
                if (filtros.vendasMin && vendas < filtros.vendasMin) {
                    if (index < 5) console.log(`❌ SidePanel - Produto ${index + 1} reprovado - Vendas Min: ${vendas} < ${filtros.vendasMin}`);
                    return false;
                }
                if (filtros.vendasMax && vendas > filtros.vendasMax) {
                    if (index < 5) console.log(`❌ SidePanel - Produto ${index + 1} reprovado - Vendas Max: ${vendas} > ${filtros.vendasMax}`);
                    return false;
                }
            }

            if (index < 5) console.log(`✅ SidePanel - Produto ${index + 1} aprovado nos filtros`);
            return true;
        });

        console.log(`🎯 SidePanel - Filtros aplicados: ${produtos.length} → ${produtosFiltrados.length} produtos`);

        // Log dos produtos que passaram (primeiros 5)
        console.log('✅ SidePanel - Produtos aprovados (primeiros 5):', 
            produtosFiltrados.slice(0, 5).map((p, i) => ({
                posicao: i + 1,
                titulo: p.titulo?.substring(0, 30) + '...',
                preco: p.precoNumerico,
                vendas: p.vendidos
            }))
        );

        return produtosFiltrados;
    }

    static executarAnalise(tipo) {
        const searchInput = this.panelElement.querySelector('#amk-search-term');
        const termo = searchInput.value.trim();
        
        if (!termo) {
            this.showStatus('Digite um termo para buscar', 'error');
            searchInput.focus();
            return;
        }

        // Coletar filtros da interface
        const filtros = this.coletarFiltros();
        
        // Mostrar resumo dos filtros se algum estiver ativo
        this.mostrarResumoFiltros(filtros);

        this.showStatus(`Iniciando análise ${tipo}${this.temFiltrosAtivos(filtros) ? ' com filtros' : ''}...`, 'info');

        // Determinar URL baseada na plataforma atual
        let targetUrl;
        let searchParam;
        
        if (this.currentPlatform?.platform === 'mercadolivre') {
            targetUrl = `https://lista.mercadolivre.com.br/${encodeURIComponent(termo)}`;
            searchParam = termo; // ML usa o termo diretamente na URL
        } else {
            // Amazon (padrão)
            targetUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(termo)}`;
            searchParam = `k=${encodeURIComponent(termo)}`;
        }

        // Verificar se já estamos na página de busca correta
        const currentUrl = window.location.href;
        const isCorrectPage = this.currentPlatform?.platform === 'mercadolivre' 
            ? currentUrl.includes(`lista.mercadolivre.com.br/${encodeURIComponent(termo)}`)
            : currentUrl.includes(searchParam);

        if (!isCorrectPage) {
            this.showStatus('Navegando para busca...', 'info');
            
            // Armazenar dados da análise para executar após navegação
            sessionStorage.setItem('amk_pending_analysis', JSON.stringify({
                tipo: tipo,
                termo: termo,
                filtros: filtros,
                platform: this.currentPlatform?.platform || 'amazon'
            }));
            
            window.location.href = targetUrl;
            return;
        }

        // Executar análise diretamente
        this.executarAnaliseAgora(tipo, filtros);
    }

    static verificarStatusTabela() {
        const modal = document.getElementById('amazon-analyzer-modal');
        return modal && modal.style.display === 'flex';
    }

    static atualizarStatusBotao() {
        const btnToggleTable = this.panelElement?.querySelector('#amk-btn-toggle-table');
        if (!btnToggleTable) return;

        const tabelaAberta = this.verificarStatusTabela();
        
        // Verificar produtos baseado na plataforma
        let temProdutos = false;
        if (this.currentPlatform?.platform === 'mercadolivre') {
            temProdutos = typeof MLController !== 'undefined' && 
                         MLController.produtosArmazenados && 
                         MLController.produtosArmazenados.length > 0;
        } else {
            temProdutos = typeof AppController !== 'undefined' && 
                         AppController.produtosArmazenados && 
                         AppController.produtosArmazenados.length > 0;
        }

        if (tabelaAberta) {
            btnToggleTable.innerHTML = '📊 Fechar Tabela';
            btnToggleTable.title = 'Fecha a tabela de produtos';
        } else {
            if (temProdutos) {
                btnToggleTable.innerHTML = '📊 Abrir Tabela';
                btnToggleTable.title = 'Abre a tabela com produtos encontrados';
            } else {
                btnToggleTable.innerHTML = '📊 Abrir/Fechar Tabela';
                btnToggleTable.title = 'Abre/fecha a tabela de produtos';
            }
        }
    }

    static toggleTabela() {
        const modal = document.getElementById('amazon-analyzer-modal');
        if (modal) {
            // Se modal existe, alternar visibilidade
            if (modal.style.display === 'none' || modal.style.display === '') {
                modal.style.display = 'flex';
                this.showStatus('Tabela aberta', 'success');
            } else {
                modal.style.display = 'none';
                this.showStatus('Tabela fechada', 'info');
            }
        } else {
            // Se não existe modal, criar usando controlador apropriado
            if (this.currentPlatform?.platform === 'mercadolivre') {
                // Mercado Livre
                if (typeof MLController !== 'undefined') {
                    if (MLController.produtosArmazenados && MLController.produtosArmazenados.length > 0) {
                        MLController.exibirTabelaComProdutos(MLController.produtosArmazenados);
                        this.showStatus('Tabela ML aberta com produtos armazenados', 'success');
                    } else {
                        MLController.criarModalVazio();
                        this.showStatus('Tabela ML aberta (vazia)', 'info');
                    }
                } else {
                    this.showStatus('Erro: MLController não carregado', 'error');
                }
            } else {
                // Amazon (padrão)
                if (typeof AppController !== 'undefined') {
                    if (AppController.produtosArmazenados && AppController.produtosArmazenados.length > 0) {
                        AppController.exibirTabelaComProdutos(AppController.produtosArmazenados);
                        this.showStatus('Tabela aberta com produtos armazenados', 'success');
                    } else {
                        AppController.criarModalVazio();
                        this.showStatus('Tabela aberta (vazia)', 'info');
                    }
                } else {
                    this.showStatus('Erro: AppController não carregado', 'error');
                }
            }
        }
        
        // Atualizar texto do botão após alternar
        setTimeout(() => this.atualizarStatusBotao(), 100);
    }

    static showStatus(message, type = 'info') {
        const statusElement = this.panelElement.querySelector('#amk-status');
        if (!statusElement) return;

        const colors = {
            error: '#ef4444',
            success: '#10b981',
            info: '#3b82f6'
        };

        statusElement.textContent = message;
        statusElement.style.color = colors[type] || colors.info;

        // Limpar após 3 segundos
        setTimeout(() => {
            statusElement.textContent = 'Pronto para análise';
            statusElement.style.color = '#374151';
        }, 3000);
    }

    static abrir() {
        if (!this.panelElement) {
            this.criar();
        }
        
        const container = this.panelElement.querySelector('.amk-sidepanel-container');
        const toggleBtn = this.panelElement.querySelector('#amk-toggle-button');
        
        if (container && toggleBtn) {
            container.style.right = '0px';
            toggleBtn.style.right = '330px';
            toggleBtn.querySelector('span').textContent = '✕';
            this.isVisible = true;
            
            // Focar no campo de busca e preencher com termo atual se houver
            setTimeout(() => {
                const searchInput = this.panelElement.querySelector('#amk-search-term');
                if (searchInput) {
                    // Tentar preencher com termo da URL atual
                    this.preencherTermoAtual(searchInput);
                    searchInput.focus();
                }
            }, 300);
        }
    }

    static fechar() {
        if (!this.panelElement) return;
        
        const container = this.panelElement.querySelector('.amk-sidepanel-container');
        const toggleBtn = this.panelElement.querySelector('#amk-toggle-button');
        
        if (container && toggleBtn) {
            container.style.right = '-320px';
            toggleBtn.style.right = '10px';
            toggleBtn.querySelector('span').textContent = '🔍';
            this.isVisible = false;
        }
    }

    static toggle() {
        if (this.isVisible) {
            this.fechar();
        } else {
            this.abrir();
        }
    }

    static temFiltrosAtivos(filtros) {
        if (!filtros) return false;
        
        return filtros.precoMin || filtros.precoMax ||
               filtros.vendasMin || filtros.vendasMax;
    }

    static mostrarResumoFiltros(filtros) {
        if (!this.temFiltrosAtivos(filtros)) return;

        const resumo = [];

        if (filtros.precoMin || filtros.precoMax) {
            const precoRange = [];
            if (filtros.precoMin) precoRange.push(`≥R$${filtros.precoMin}`);
            if (filtros.precoMax) precoRange.push(`≤R$${filtros.precoMax}`);
            resumo.push(`Preço ${precoRange.join(' e ')}`);
        }

        if (filtros.vendasMin || filtros.vendasMax) {
            const vendasRange = [];
            if (filtros.vendasMin) vendasRange.push(`≥${filtros.vendasMin}`);
            if (filtros.vendasMax) vendasRange.push(`≤${filtros.vendasMax}`);
            resumo.push(`Vendas ${vendasRange.join(' e ')}`);
        }

        console.log(`🎯 Filtros ativos: ${resumo.join(', ')}`);
    }

    static executarAnaliseAgora(tipo, filtros = {}) {
        this.showStatus(`Executando análise ${tipo}...`, 'info');
        
        // Armazenar filtros para uso durante a análise
        if (this.temFiltrosAtivos(filtros)) {
            sessionStorage.setItem('amk_filtros_analise', JSON.stringify(filtros));
            console.log('💾 Filtros salvos para análise:', filtros);
        } else {
            sessionStorage.removeItem('amk_filtros_analise');
        }
        
        setTimeout(() => {
            // Usar controlador apropriado baseado na plataforma
            if (this.currentPlatform?.platform === 'mercadolivre') {
                if (typeof MLController !== 'undefined') {
                    // Executar análise ML
                    MLController.iniciarAnaliseBackground(tipo === 'rapida' ? 'rapida' : 'todas');
                    this.showStatus(`Análise ${tipo} ML iniciada em background...`, 'info');
                } else {
                    this.showStatus('Erro: MLController não carregado', 'error');
                    console.error('❌ MLController não disponível');
                }
            } else {
                // Amazon (padrão)
                if (typeof AppController !== 'undefined') {
                    AppController.iniciarAnaliseBackground(tipo === 'rapida' ? 'rapida' : 'todas');
                    this.showStatus(`Análise ${tipo} iniciada em background...`, 'info');
                } else {
                    this.showStatus('Erro: AppController não carregado', 'error');
                }
            }
        }, 500);
    }

    static verificarAnalisePendente() {
        const pendingAnalysis = sessionStorage.getItem('amk_pending_analysis');
        if (pendingAnalysis) {
            try {
                const { tipo, termo, filtros = {}, platform = 'amazon' } = JSON.parse(pendingAnalysis);
                sessionStorage.removeItem('amk_pending_analysis');
                
                // Verificar se estamos na plataforma correta
                if (this.currentPlatform?.platform !== platform) {
                    console.log('⚠️ Plataforma não coincide com análise pendente. Ignorando.');
                    return;
                }
                
                console.log('🔄 Executando análise pendente:', { tipo, termo, platform });
                if (this.temFiltrosAtivos(filtros)) {
                    console.log('🎯 Com filtros:', filtros);
                }
                
                const platformLabel = platform === 'mercadolivre' ? 'ML' : 'Amazon';
                this.showStatus(`Executando análise ${tipo} ${platformLabel} pendente${this.temFiltrosAtivos(filtros) ? ' com filtros' : ''}...`, 'info');
                
                // Aguardar página carregar e executar análise
                setTimeout(() => {
                    this.executarAnaliseAgora(tipo, filtros);
                }, 2000);
                
            } catch (error) {
                console.error('❌ Erro ao processar análise pendente:', error);
                sessionStorage.removeItem('amk_pending_analysis');
            }
        }
    }

    static preencherTermoAtual(searchInput) {
        try {
            const url = window.location.href;
            let termo;
            
            if (this.currentPlatform?.platform === 'mercadolivre') {
                // Mercado Livre: extrair termo da URL
                const match = url.match(/lista\.mercadolivre\.com\.br\/([^?#]+)/);
                if (match) {
                    termo = decodeURIComponent(match[1]);
                    // Limpar parâmetros especiais do ML
                    termo = termo.replace(/\?.*$/, '').replace(/#.*$/, '');
                }
            } else {
                // Amazon: extrair parâmetro k
                if (url.includes('/s?') && url.includes('k=')) {
                    const urlParams = new URLSearchParams(window.location.search);
                    termo = urlParams.get('k');
                }
            }
            
            if (termo && searchInput) {
                searchInput.value = decodeURIComponent(termo);
                console.log(`📝 Campo preenchido com termo atual (${this.currentPlatform?.platform || 'amazon'}):`, termo);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao preencher termo atual:', error);
        }
    }

    static init(platform) {
        // Armazenar plataforma para uso posterior
        this.currentPlatform = platform;
        
        // Criar o painel mas mantê-lo fechado inicialmente
        this.criar();
        
        // Verificar se há análise pendente (após navegação)
        this.verificarAnalisePendente();
        
        // Atualizar status inicial do botão
        setTimeout(() => this.atualizarStatusBotao(), 500);
        
        // Atualizar status do botão a cada 2 segundos para manter sincronizado
        setInterval(() => {
            this.atualizarStatusBotao();
        }, 2000);
        
        console.log(`✅ SidePanel inicializado para ${platform?.platform || 'plataforma desconhecida'}`);
    }

    static getIconForPlatform() {
        if (!this.currentPlatform) {
            return '🔍'; // Padrão Amazon
        }
        
        switch (this.currentPlatform.platform) {
            case 'mercadolivre':
                return '🛒';
            case 'amazon':
            default:
                return '🔍';
        }
    }
}

// Exportar para uso global
window.SidePanel = SidePanel; 