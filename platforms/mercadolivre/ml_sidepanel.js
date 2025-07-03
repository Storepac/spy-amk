/**
 * ML SidePanel - Painel lateral específico para MercadoLivre
 * Sistema independente com funcionalidades específicas ML
 */
class MLSidePanel {
    
    static isVisible = false;
    static panelElement = null;
    static currentPlatform = null;
    
    /**
     * CRIAR PAINEL ML
     */
    static criar() {
        if (this.panelElement) {
            console.log('⚠️ [ML-SIDEPANEL] Painel ML já existe');
            return;
        }
        
        console.log('🛒 [ML-SIDEPANEL] Criando painel lateral específico ML...');
        
        this.panelElement = document.createElement('div');
        this.panelElement.id = 'ml-sidepanel';
        this.panelElement.innerHTML = this.criarHTMLML();
        
        document.body.appendChild(this.panelElement);
        this.configurarEventosML();
        this.adicionarEstilosML();
        
        console.log('✅ [ML-SIDEPANEL] Painel ML criado com sucesso');
    }
    
    /**
     * CRIAR HTML ESPECÍFICO ML
     */
    static criarHTMLML() {
        return `
            <!-- Botão de toggle específico ML -->
            <button id="ml-toggle-button" style="
                position: fixed;
                top: 50%;
                right: 10px;
                transform: translateY(-50%);
                background: linear-gradient(135deg, #FFE600 0%, #FFC107 100%);
                border: none;
                border-radius: 50%;
                width: 55px;
                height: 55px;
                cursor: pointer;
                font-size: 24px;
                z-index: 999998;
                box-shadow: 0 4px 15px rgba(255, 230, 0, 0.4);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #333;
                font-weight: bold;
            " title="AMK Spy MercadoLivre">
                🛒
            </button>
            
            <!-- Container do painel ML -->
            <div class="ml-sidepanel-container" style="
                position: fixed;
                top: 0;
                right: -400px;
                width: 380px;
                height: 100vh;
                background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
                border-left: 3px solid #FFE600;
                z-index: 999997;
                transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: -5px 0 25px rgba(0,0,0,0.15);
                display: flex;
                flex-direction: column;
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            ">
                <!-- Cabeçalho ML -->
                <div style="
                    background: linear-gradient(135deg, #FFE600 0%, #FFC107 100%);
                    padding: 20px;
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                ">
                    <h2 style="
                        margin: 0;
                        color: #333;
                        font-size: 18px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    ">
                        🛒 AMK Spy ML
                        <span style="
                            background: rgba(255,255,255,0.3);
                            padding: 4px 8px;
                            border-radius: 12px;
                            font-size: 10px;
                            font-weight: 500;
                        ">MERCADOLIVRE</span>
                    </h2>
                    <p style="
                        margin: 8px 0 0 0;
                        font-size: 12px;
                        color: #555;
                        opacity: 0.9;
                    ">
                        Análise especializada para MercadoLivre
                    </p>
                </div>
                
                <!-- Conteúdo do painel ML -->
                <div style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                ">
                    <!-- Status da análise ML -->
                    <div id="ml-status-section" style="
                        background: #e3f2fd;
                        border: 1px solid #2196f3;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 20px;
                    ">
                        <h4 style="
                            margin: 0 0 10px 0;
                            color: #1976d2;
                            font-size: 13px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        ">
                            📊 Status ML
                        </h4>
                        <div id="ml-status-content" style="
                            font-size: 12px;
                            color: #333;
                            line-height: 1.4;
                        ">
                            Aguardando análise...
                        </div>
                    </div>
                    
                    <!-- Busca personalizada ML -->
                    <div style="
                        background: #fff3cd;
                        border: 1px solid #ffc107;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 20px;
                    ">
                        <h4 style="
                            margin: 0 0 15px 0;
                            color: #856404;
                            font-size: 13px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        ">
                            🔍 Busca ML
                        </h4>
                        
                        <input type="text" 
                               id="ml-search-term" 
                               placeholder="Digite o termo para buscar no ML..."
                               style="
                                   width: 100%;
                                   padding: 10px;
                                   border: 1px solid #ddd;
                                   border-radius: 6px;
                                   font-size: 12px;
                                   margin-bottom: 10px;
                                   box-sizing: border-box;
                               " />
                        
                        <button id="ml-search-button" style="
                            width: 100%;
                            background: linear-gradient(135deg, #FFE600 0%, #FFC107 100%);
                            color: #333;
                            border: none;
                            padding: 10px;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                        ">
                            🛒 Buscar no MercadoLivre
                        </button>
                    </div>
                    
                    <!-- Filtros específicos ML -->
                    <div style="
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 20px;
                    ">
                        <h4 style="
                            margin: 0 0 15px 0;
                            color: #495057;
                            font-size: 13px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        ">
                            🎯 Filtros ML
                        </h4>
                        
                        <!-- Filtros de preço -->
                        <div style="margin-bottom: 15px;">
                            <label style="
                                display: block;
                                font-size: 11px;
                                color: #666;
                                margin-bottom: 5px;
                                font-weight: 500;
                            ">💰 Faixa de Preço (R$)</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="number" 
                                       id="ml-preco-min" 
                                       placeholder="Min"
                                       style="
                                           flex: 1;
                                           padding: 8px;
                                           border: 1px solid #ddd;
                                           border-radius: 4px;
                                           font-size: 11px;
                                       " />
                                <input type="number" 
                                       id="ml-preco-max" 
                                       placeholder="Max"
                                       style="
                                           flex: 1;
                                           padding: 8px;
                                           border: 1px solid #ddd;
                                           border-radius: 4px;
                                           font-size: 11px;
                                       " />
                            </div>
                        </div>
                        
                        <!-- Filtros de vendas -->
                        <div style="margin-bottom: 15px;">
                            <label style="
                                display: block;
                                font-size: 11px;
                                color: #666;
                                margin-bottom: 5px;
                                font-weight: 500;
                            ">📈 Vendas Mínimas</label>
                            <input type="number" 
                                   id="ml-vendas-min" 
                                   placeholder="Ex: 100"
                                   style="
                                       width: 100%;
                                       padding: 8px;
                                       border: 1px solid #ddd;
                                       border-radius: 4px;
                                       font-size: 11px;
                                       box-sizing: border-box;
                                   " />
                        </div>
                        
                        <!-- Filtros específicos ML -->
                        <div style="margin-bottom: 15px;">
                            <label style="
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                font-size: 11px;
                                color: #666;
                                margin-bottom: 8px;
                                cursor: pointer;
                            ">
                                <input type="checkbox" id="ml-loja-oficial" />
                                🏆 Apenas Lojas Oficiais
                            </label>
                            
                            <label style="
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                font-size: 11px;
                                color: #666;
                                margin-bottom: 8px;
                                cursor: pointer;
                            ">
                                <input type="checkbox" id="ml-frete-gratis" />
                                🚚 Apenas Frete Grátis
                            </label>
                            
                            <label style="
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                font-size: 11px;
                                color: #666;
                                cursor: pointer;
                            ">
                                <input type="checkbox" id="ml-excluir-patrocinados" />
                                🚫 Excluir Patrocinados
                            </label>
                        </div>
                    </div>
                    
                    <!-- Ações ML -->
                    <div style="
                        background: #e8f5e8;
                        border: 1px solid #28a745;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 20px;
                    ">
                        <h4 style="
                            margin: 0 0 15px 0;
                            color: #155724;
                            font-size: 13px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        ">
                            ⚡ Ações ML
                        </h4>
                        
                        <button id="ml-analise-rapida" style="
                            width: 100%;
                            background: #28a745;
                            color: white;
                            border: none;
                            padding: 10px;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            margin-bottom: 8px;
                            transition: all 0.2s;
                        ">
                            ⚡ Análise Rápida ML
                        </button>
                        
                        <button id="ml-analise-completa" style="
                            width: 100%;
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 10px;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            margin-bottom: 8px;
                            transition: all 0.2s;
                        ">
                            🔍 Análise Completa ML
                        </button>
                        
                        <button id="ml-toggle-table" style="
                            width: 100%;
                            background: #6f42c1;
                            color: white;
                            border: none;
                            padding: 10px;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                        ">
                            📊 Mostrar/Ocultar Tabela ML
                        </button>
                    </div>
                    
                    <!-- Estatísticas ML -->
                    <div id="ml-stats-section" style="
                        background: #fff;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 20px;
                    ">
                        <h4 style="
                            margin: 0 0 15px 0;
                            color: #333;
                            font-size: 13px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        ">
                            📈 Estatísticas ML
                        </h4>
                        <div id="ml-stats-content" style="
                            font-size: 11px;
                            color: #666;
                            line-height: 1.4;
                        ">
                            Nenhuma análise realizada
                        </div>
                    </div>
                </div>
                
                <!-- Rodapé ML -->
                <div style="
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #dee2e6;
                    font-size: 10px;
                    color: #666;
                    text-align: center;
                ">
                    🛒 AMK Spy ML v2.0<br>
                    Especializado para MercadoLivre
                </div>
            </div>
        `;
    }
    
    /**
     * CONFIGURAR EVENTOS ML
     */
    static configurarEventosML() {
        console.log('📡 [ML-SIDEPANEL] Configurando eventos ML...');
        
        // Toggle do painel
        const toggleBtn = this.panelElement.querySelector('#ml-toggle-button');
        toggleBtn.addEventListener('click', () => this.toggle());
        
        // Busca no ML
        const searchBtn = this.panelElement.querySelector('#ml-search-button');
        const searchInput = this.panelElement.querySelector('#ml-search-term');
        
        searchBtn.addEventListener('click', () => this.executarBuscaML());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.executarBuscaML();
        });
        
        // Análises ML
        const analiseRapidaBtn = this.panelElement.querySelector('#ml-analise-rapida');
        const analiseCompletaBtn = this.panelElement.querySelector('#ml-analise-completa');
        
        analiseRapidaBtn.addEventListener('click', () => this.executarAnaliseML('rapida'));
        analiseCompletaBtn.addEventListener('click', () => this.executarAnaliseML('completa'));
        
        // Toggle da tabela
        const toggleTableBtn = this.panelElement.querySelector('#ml-toggle-table');
        toggleTableBtn.addEventListener('click', () => this.toggleTabelaML());
        
        console.log('✅ [ML-SIDEPANEL] Eventos ML configurados');
    }
    
    /**
     * ADICIONAR ESTILOS ML
     */
    static adicionarEstilosML() {
        const style = document.createElement('style');
        style.textContent = `
            #ml-toggle-button:hover {
                transform: translateY(-50%) scale(1.1);
                box-shadow: 0 6px 20px rgba(255, 230, 0, 0.6);
            }
            
            #ml-search-button:hover {
                background: linear-gradient(135deg, #FFC107 0%, #FF9800 100%);
                transform: translateY(-1px);
            }
            
            #ml-analise-rapida:hover {
                background: #218838;
                transform: translateY(-1px);
            }
            
            #ml-analise-completa:hover {
                background: #0069d9;
                transform: translateY(-1px);
            }
            
            #ml-toggle-table:hover {
                background: #5a3a9c;
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * MÉTODOS DE AÇÃO ML
     */
    static executarBuscaML() {
        const termoBusca = this.panelElement.querySelector('#ml-search-term').value.trim();
        
        if (!termoBusca) {
            alert('Digite um termo para buscar no MercadoLivre!');
            return;
        }
        
        console.log(`🔍 [ML-SIDEPANEL] Executando busca ML: ${termoBusca}`);
        
        // Construir URL do ML
        const urlML = `https://lista.mercadolivre.com.br/${termoBusca.replace(/\s+/g, '-')}`;
        
        // Salvar filtros antes de navegar
        this.salvarFiltrosML();
        
        // Salvar análise pendente
        sessionStorage.setItem('amk_pending_analysis_ml', JSON.stringify({
            tipo: 'rapida',
            termo: termoBusca,
            filtros: this.coletarFiltrosML(),
            platform: 'mercadolivre'
        }));
        
        // Navegar para a busca
        window.location.href = urlML;
    }
    
    static executarAnaliseML(tipo) {
        console.log(`⚡ [ML-SIDEPANEL] Executando análise ML: ${tipo}`);
        
        this.showStatusML(`Executando análise ${tipo} ML...`, 'info');
        
        // Salvar filtros para uso durante a análise
        const filtros = this.coletarFiltrosML();
        if (Object.keys(filtros).length > 0) {
            sessionStorage.setItem('amk_filtros_ml', JSON.stringify(filtros));
            console.log('💾 [ML-SIDEPANEL] Filtros ML salvos:', filtros);
        }
        
        setTimeout(() => {
            // Usar MLController específico
            if (typeof MLController !== 'undefined') {
                MLController.iniciarAnaliseBackgroundML(tipo);
                this.showStatusML(`Análise ${tipo} ML iniciada...`, 'success');
            } else {
                this.showStatusML('Erro: MLController não disponível', 'error');
                console.error('❌ [ML-SIDEPANEL] MLController não disponível');
            }
        }, 500);
    }
    
    static toggleTabelaML() {
        console.log('📊 [ML-SIDEPANEL] Toggle tabela ML');
        
        const modal = document.getElementById('ml-analyzer-modal');
        if (modal) {
            modal.remove();
            this.showStatusML('Tabela ML ocultada', 'info');
        } else {
            // Tentar recriar tabela se houver dados
            if (window.MLController && MLController.getCurrentProductsML().length > 0) {
                MLController.displayResultsML(MLController.getCurrentProductsML());
                this.showStatusML('Tabela ML exibida', 'success');
            } else {
                this.showStatusML('Nenhum dado ML para exibir', 'warning');
            }
        }
    }
    
    /**
     * MÉTODOS AUXILIARES ML
     */
    static coletarFiltrosML() {
        const filtros = {};
        
        const precoMin = this.panelElement.querySelector('#ml-preco-min')?.value;
        const precoMax = this.panelElement.querySelector('#ml-preco-max')?.value;
        const vendasMin = this.panelElement.querySelector('#ml-vendas-min')?.value;
        
        if (precoMin) filtros.precoMin = parseFloat(precoMin);
        if (precoMax) filtros.precoMax = parseFloat(precoMax);
        if (vendasMin) filtros.vendasMin = parseInt(vendasMin);
        
        filtros.apenasLojaOficial = this.panelElement.querySelector('#ml-loja-oficial')?.checked || false;
        filtros.apenasFreteGratis = this.panelElement.querySelector('#ml-frete-gratis')?.checked || false;
        filtros.excluirPatrocinados = this.panelElement.querySelector('#ml-excluir-patrocinados')?.checked || false;
        
        return filtros;
    }
    
    static salvarFiltrosML() {
        const filtros = this.coletarFiltrosML();
        sessionStorage.setItem('amk_filtros_ml', JSON.stringify(filtros));
    }
    
    static showStatusML(message, type = 'info') {
        const statusContent = this.panelElement.querySelector('#ml-status-content');
        if (!statusContent) return;
        
        const colors = {
            info: '#2196f3',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545'
        };
        
        statusContent.innerHTML = `
            <div style="
                color: ${colors[type] || colors.info};
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
            ">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'} ${message}
            </div>
        `;
    }
    
    static atualizarEstatisticasML(produtos) {
        const statsContent = this.panelElement.querySelector('#ml-stats-content');
        if (!statsContent || !produtos) return;
        
        const total = produtos.length;
        const comVendas = produtos.filter(p => p.vendas > 0).length;
        const receitaTotal = produtos.reduce((sum, p) => sum + (p.receita || 0), 0);
        const patrocinados = produtos.filter(p => p.patrocinado).length;
        
        statsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>📦 Produtos: <strong>${total}</strong></div>
                <div>📈 Com vendas: <strong>${comVendas}</strong></div>
                <div>💵 Receita: <strong>R$ ${(receitaTotal/1000).toFixed(0)}k</strong></div>
                <div>💰 Patrocinados: <strong>${patrocinados}</strong></div>
            </div>
        `;
    }
    
    /**
     * CONTROLES DO PAINEL
     */
    static abrir() {
        if (this.isVisible) return;
        
        const container = this.panelElement.querySelector('.ml-sidepanel-container');
        const toggleBtn = this.panelElement.querySelector('#ml-toggle-button');
        
        if (container && toggleBtn) {
            container.style.right = '0px';
            toggleBtn.style.right = '390px';
            this.isVisible = true;
            
            // Focar no campo de busca e preencher com termo atual se houver
            setTimeout(() => {
                const searchInput = this.panelElement.querySelector('#ml-search-term');
                if (searchInput) {
                    this.preencherTermoAtualML(searchInput);
                    searchInput.focus();
                }
            }, 300);
        }
    }
    
    static fechar() {
        if (!this.panelElement) return;
        
        const container = this.panelElement.querySelector('.ml-sidepanel-container');
        const toggleBtn = this.panelElement.querySelector('#ml-toggle-button');
        
        if (container && toggleBtn) {
            container.style.right = '-400px';
            toggleBtn.style.right = '10px';
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
    
    static preencherTermoAtualML(searchInput) {
        try {
            const url = window.location.href;
            
            if (url.includes('lista.mercadolivre.com.br')) {
                const match = url.match(/lista\.mercadolivre\.com\.br\/([^?#]+)/);
                if (match) {
                    const termo = decodeURIComponent(match[1]).replace(/-/g, ' ');
                    searchInput.value = termo;
                    console.log(`📝 [ML-SIDEPANEL] Campo preenchido com termo ML:`, termo);
                }
            }
        } catch (error) {
            console.warn('⚠️ [ML-SIDEPANEL] Erro ao preencher termo ML:', error);
        }
    }
    
    /**
     * INICIALIZAÇÃO
     */
    static init(platform) {
        // Só inicializar em páginas ML
        if (platform?.platform !== 'mercadolivre') {
            return;
        }
        
        console.log('🛒 [ML-SIDEPANEL] Inicializando painel específico ML...');
        
        this.currentPlatform = platform;
        this.criar();
        
        console.log('✅ [ML-SIDEPANEL] Painel ML inicializado com sucesso');
    }
}

// Expor globalmente
window.MLSidePanel = MLSidePanel; 