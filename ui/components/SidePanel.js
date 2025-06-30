/**
 * SidePanel - Painel lateral para análise de produtos
 * Substitui o popup para evitar problemas de CSP
 */
class SidePanel {
    static isVisible = false;
    static panelElement = null;

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

                    <!-- Filtros Avançados -->
                    <div style="margin-bottom: 20px;">
                        <div style="
                            font-size: 14px;
                            font-weight: 600;
                            color: #014641;
                            margin-bottom: 12px;
                            text-align: center;
                        ">🎯 Filtros de Análise:</div>
                        
                        <!-- Toggle BSR > 100 -->
                        <div style="
                            background: #f8f9fa;
                            border-radius: 8px;
                            padding: 12px;
                            margin-bottom: 15px;
                            border: 1px solid #e9ecef;
                        ">
                            <label style="
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                cursor: pointer;
                                font-size: 13px;
                                font-weight: 500;
                                color: #495057;
                            ">
                                <input 
                                    type="checkbox" 
                                    id="amk-filter-bsr-top100"
                                    style="
                                        width: 16px;
                                        height: 16px;
                                        accent-color: #014641;
                                    "
                                >
                                <span>📊 Apenas produtos BSR ≤ 100</span>
                            </label>
                            <div style="font-size: 11px; color: #6c757d; margin-top: 4px; margin-left: 24px;">
                                Quando marcado, desabilita filtros BSR personalizados
                            </div>
                        </div>

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

                        <!-- Ranking Categoria (BSR) -->
                        <div id="amk-bsr-custom-container" style="
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
                            ">🏆 Ranking Categoria (BSR)</div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <div style="flex: 1;">
                                    <input 
                                        type="number" 
                                        id="amk-filter-bsr-min"
                                        placeholder="BSR Mín"
                                        min="1"
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
                                        id="amk-filter-bsr-max"
                                        placeholder="BSR Máx"
                                        min="1"
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
                <span style="color: white; font-size: 18px; font-weight: bold;">🔍</span>
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

        // Configurar eventos dos filtros
        this.configurarEventosFiltros();

        // Hover effects
        this.adicionarHoverEffects();
    }

    static configurarEventosFiltros() {
        const panel = this.panelElement;
        if (!panel) return;

        // Toggle BSR ≤ 100
        const toggleBSR = panel.querySelector('#amk-filter-bsr-top100');
        const bsrContainer = panel.querySelector('#amk-bsr-custom-container');
        const bsrMinInput = panel.querySelector('#amk-filter-bsr-min');
        const bsrMaxInput = panel.querySelector('#amk-filter-bsr-max');

        if (toggleBSR && bsrContainer && bsrMinInput && bsrMaxInput) {
            const toggleBSRFields = () => {
                const isChecked = toggleBSR.checked;
                
                // Desabilitar/habilitar campos BSR personalizados
                bsrMinInput.disabled = isChecked;
                bsrMaxInput.disabled = isChecked;
                
                // Visual feedback
                bsrContainer.style.opacity = isChecked ? '0.5' : '1';
                bsrContainer.style.pointerEvents = isChecked ? 'none' : 'auto';
                
                // Limpar valores se desabilitado
                if (isChecked) {
                    bsrMinInput.value = '';
                    bsrMaxInput.value = '';
                }
                
                console.log(`🎯 BSR Filter: ${isChecked ? 'Top 100 only' : 'Custom range'}`);
            };

            toggleBSR.addEventListener('change', toggleBSRFields);
            
            // Aplicar estado inicial
            toggleBSRFields();
        }

        console.log('✅ Eventos dos filtros configurados');
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
            // BSR Toggle
            bsrTop100: panel.querySelector('#amk-filter-bsr-top100')?.checked || false,
            
            // Preço
            precoMin: parseFloat(panel.querySelector('#amk-filter-preco-min')?.value) || null,
            precoMax: parseFloat(panel.querySelector('#amk-filter-preco-max')?.value) || null,
            
            // BSR Personalizado (só se toggle estiver desmarcado)
            bsrMin: null,
            bsrMax: null,
            
            // Vendas
            vendasMin: parseInt(panel.querySelector('#amk-filter-vendas-min')?.value) || null,
            vendasMax: parseInt(panel.querySelector('#amk-filter-vendas-max')?.value) || null
        };

        // BSR personalizado só se toggle estiver desmarcado
        if (!filtros.bsrTop100) {
            filtros.bsrMin = parseInt(panel.querySelector('#amk-filter-bsr-min')?.value) || null;
            filtros.bsrMax = parseInt(panel.querySelector('#amk-filter-bsr-max')?.value) || null;
        }

        console.log('🎯 Filtros coletados:', filtros);
        return filtros;
    }

    static aplicarFiltrosProdutos(produtos, filtros) {
        if (!produtos || produtos.length === 0) return produtos;
        if (!filtros || Object.keys(filtros).length === 0) return produtos;

        let produtosFiltrados = produtos.filter(produto => {
            // Filtro BSR ≤ 100
            if (filtros.bsrTop100) {
                const bsr = parseInt(produto.ranking || produto.bsr || 0);
                if (bsr > 100 || bsr === 0) return false;
            }

            // Filtro BSR personalizado (só se toggle estiver desmarcado)
            if (!filtros.bsrTop100 && (filtros.bsrMin || filtros.bsrMax)) {
                const bsr = parseInt(produto.ranking || produto.bsr || 0);
                if (filtros.bsrMin && bsr < filtros.bsrMin) return false;
                if (filtros.bsrMax && bsr > filtros.bsrMax) return false;
            }

            // Filtro de preço
            if (filtros.precoMin || filtros.precoMax) {
                const preco = produto.precoNumerico || 0;
                if (filtros.precoMin && preco < filtros.precoMin) return false;
                if (filtros.precoMax && preco > filtros.precoMax) return false;
            }

            // Filtro de vendas
            if (filtros.vendasMin || filtros.vendasMax) {
                const vendas = parseInt(produto.vendidos || 0);
                if (filtros.vendasMin && vendas < filtros.vendasMin) return false;
                if (filtros.vendasMax && vendas > filtros.vendasMax) return false;
            }

            return true;
        });

        console.log(`🎯 Filtros aplicados: ${produtos.length} → ${produtosFiltrados.length} produtos`);
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

        // Se não estamos na página de busca correta, navegar primeiro
        if (!window.location.href.includes(`k=${encodeURIComponent(termo)}`)) {
            const amazonUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(termo)}`;
            this.showStatus('Navegando para busca...', 'info');
            
            // Armazenar dados da análise para executar após navegação
            sessionStorage.setItem('amk_pending_analysis', JSON.stringify({
                tipo: tipo,
                termo: termo,
                filtros: filtros
            }));
            
            window.location.href = amazonUrl;
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
        const temProdutos = typeof AppController !== 'undefined' && 
                           AppController.produtosArmazenados && 
                           AppController.produtosArmazenados.length > 0;

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
            // Se não existe modal, criar sempre (com ou sem dados)
            if (typeof AppController !== 'undefined' && AppController.produtosArmazenados && AppController.produtosArmazenados.length > 0) {
                // Há produtos armazenados, mostrar tabela com dados
                AppController.exibirTabelaComProdutos(AppController.produtosArmazenados);
                this.showStatus('Tabela aberta com produtos armazenados', 'success');
            } else {
                // Não há produtos, mostrar tabela vazia
                if (typeof AppController !== 'undefined') {
                    AppController.criarModalVazio();
                    this.showStatus('Tabela aberta (vazia)', 'info');
                } else {
                    this.showStatus('Erro: Componentes não carregados', 'error');
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
        
        return filtros.bsrTop100 || 
               filtros.precoMin || filtros.precoMax ||
               filtros.bsrMin || filtros.bsrMax ||
               filtros.vendasMin || filtros.vendasMax;
    }

    static mostrarResumoFiltros(filtros) {
        if (!this.temFiltrosAtivos(filtros)) return;

        const resumo = [];
        
        if (filtros.bsrTop100) {
            resumo.push('BSR ≤ 100');
        } else if (filtros.bsrMin || filtros.bsrMax) {
            const bsrRange = [];
            if (filtros.bsrMin) bsrRange.push(`≥${filtros.bsrMin}`);
            if (filtros.bsrMax) bsrRange.push(`≤${filtros.bsrMax}`);
            resumo.push(`BSR ${bsrRange.join(' e ')}`);
        }

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
            if (typeof AppController !== 'undefined') {
                // Executar análise sem abrir tabela automaticamente
                AppController.iniciarAnaliseBackground(tipo === 'rapida' ? 'rapida' : 'todas');
                this.showStatus(`Análise ${tipo} iniciada em background...`, 'info');
            } else {
                this.showStatus('Erro: Componentes não carregados', 'error');
            }
        }, 500);
    }

    static verificarAnalisePendente() {
        const pendingAnalysis = sessionStorage.getItem('amk_pending_analysis');
        if (pendingAnalysis) {
            try {
                const { tipo, termo, filtros = {} } = JSON.parse(pendingAnalysis);
                sessionStorage.removeItem('amk_pending_analysis');
                
                console.log('🔄 Executando análise pendente:', { tipo, termo });
                if (this.temFiltrosAtivos(filtros)) {
                    console.log('🎯 Com filtros:', filtros);
                }
                
                this.showStatus(`Executando análise ${tipo} pendente${this.temFiltrosAtivos(filtros) ? ' com filtros' : ''}...`, 'info');
                
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
            if (url.includes('/s?') && url.includes('k=')) {
                const urlParams = new URLSearchParams(window.location.search);
                const termo = urlParams.get('k');
                if (termo && searchInput) {
                    searchInput.value = decodeURIComponent(termo);
                    console.log('📝 Campo preenchido com termo atual:', termo);
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao preencher termo atual:', error);
        }
    }

    static init() {
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
        
        console.log('✅ SidePanel inicializado');
    }
}

// Exportar para uso global
window.SidePanel = SidePanel; 