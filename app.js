class AppController {
    static async exibirAnalise() {
        // Verificar se já existe um modal ativo
        if (document.getElementById("amazon-analyzer-modal")) {
            console.log('⚠️ Modal já existe, não iniciando nova análise');
            return;
        }
        
        await this.iniciarAnalise('automatico');
    }

    static async iniciarAnalise(tipo) {
        // Verificar se já existe um modal ativo
        if (document.getElementById("amazon-analyzer-modal")) {
            console.log('⚠️ Modal já existe, não iniciando nova análise');
            return;
        }
        
        // Verificar se já existe um loading ativo
        if (document.getElementById('loading-inicial')) {
            console.log('⚠️ Loading já ativo, não iniciando nova análise');
            return;
        }
        
        // Inicializar ThemeManager se ainda não foi inicializado
        if (!window.themeManager) {
            window.themeManager = new ThemeManager();
        }
        
        // Mostrar loading inicial
        this.mostrarLoadingInicial();
        
        try {
            NotificationManager.informacao('Coletando produtos básicos...');
            const produtos = await ProductAnalyzer.analisarProdutosPesquisaRapido();
            
            if (produtos.length === 0) {
                NotificationManager.erro('Nenhum produto encontrado.');
                this.ocultarLoadingInicial();
                return;
            }
            
            // Criar modal e tabela
            const modal = document.createElement("div");
            modal.id = "amazon-analyzer-modal";
            modal.innerHTML = TableManager.criarTabelaProdutos(produtos);
            document.body.appendChild(modal);
            
            // Inicializar eventos da tabela
            TableManager.inicializarEventos();
            
            // Configurar eventos do modal
            EventManager.configurarEventosModal(modal);
            
            // Ocultar loading inicial
            this.ocultarLoadingInicial();
            
            // Iniciar busca automática imediatamente
            this.iniciarBuscaAutomatica(produtos);
            
        } catch (error) {
            console.error('Erro na análise:', error);
            NotificationManager.erro('Erro ao analisar produtos.');
            this.ocultarLoadingInicial();
        }
    }

    static async iniciarBuscaAutomatica(produtos) {
        console.log('🚀 Iniciando busca automática completa...');
        
        try {
            // Fase 1: Buscar detalhes básicos
            NotificationManager.informacao('Buscando detalhes básicos...');
            await ProductAnalyzer.buscarDetalhesEmParalelo(produtos, TableManager.atualizarLinhaProduto);
            
            // Fase 2: Buscar marcas automaticamente
            NotificationManager.informacao('Buscando marcas e categorias das páginas dos produtos...');
            await ProductAnalyzer.buscarMarcasFaltantes(produtos, TableManager.atualizarLinhaProduto);
            
            // Fase 3: Atualizar métricas finais
            TableManager.atualizarMetricas(produtos);
            
            // Fase 4: Atualizar filtros
            if (TableManager.filterManager && typeof TableManager.filterManager.atualizarMarcas === 'function') {
                TableManager.filterManager.atualizarMarcas();
            } else {
                console.warn('⚠️ FilterManager não disponível ou método atualizarMarcas não encontrado');
            }
            
            NotificationManager.sucesso('Análise completa finalizada!');
            
            // Mostrar resumo dos dados coletados
            this.mostrarResumoAnalise(produtos);
            
        } catch (error) {
            console.error('Erro na busca automática:', error);
            NotificationManager.erro('Erro durante a busca automática.');
        }
    }

    static mostrarLoadingInicial() {
        let loadingElement = document.getElementById('loading-inicial');
        
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.id = 'loading-inicial';
            loadingElement.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 30px;
                border-radius: 15px;
                z-index: 10000;
                font-family: 'Poppins', sans-serif;
                text-align: center;
                min-width: 350px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            `;
            document.body.appendChild(loadingElement);
        }
        
        loadingElement.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">🔍 AMK Spy</div>
            <div style="font-size: 14px; opacity: 0.8; margin-bottom: 15px;">Iniciando análise automática...</div>
            <div style="font-size: 12px; opacity: 0.6;">Coletando produtos e preparando busca</div>
        `;
        
        // Adicionar CSS para animação se não existir
        if (!document.getElementById('loading-css')) {
            const style = document.createElement('style');
            style.id = 'loading-css';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log('✅ Loading inicial exibido');
    }

    static ocultarLoadingInicial() {
        const loadingElement = document.getElementById('loading-inicial');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    static mostrarResumoAnalise(produtos) {
        const produtosComMarca = produtos.filter(p => p.marca && p.marca !== 'N/A' && p.marca !== '');
        const produtosSemMarca = produtos.filter(p => !p.marca || p.marca === 'N/A' || p.marca === '');
        const produtosComCategoria = produtos.filter(p => p.categoria && p.categoria !== 'N/A' && p.categoria !== '');
        const produtosSemCategoria = produtos.filter(p => !p.categoria || p.categoria === 'N/A' || p.categoria === '');
        
        console.log('📊 Resumo da análise:');
        console.log(`   Total de produtos: ${produtos.length}`);
        console.log(`   Produtos com marca: ${produtosComMarca.length}`);
        console.log(`   Produtos sem marca: ${produtosSemMarca.length}`);
        console.log(`   Produtos com categoria: ${produtosComCategoria.length}`);
        console.log(`   Produtos sem categoria: ${produtosSemCategoria.length}`);
        console.log(`   Taxa de sucesso marca: ${((produtosComMarca.length / produtos.length) * 100).toFixed(1)}%`);
        console.log(`   Taxa de sucesso categoria: ${((produtosComCategoria.length / produtos.length) * 100).toFixed(1)}%`);
        
        // Estatísticas de BSR
        const bsrsEspecificos = produtos
            .filter(p => p.infoVendas?.bsrEspecifico)
            .map(p => p.infoVendas.bsrEspecifico);
        
        const bsrsGerais = produtos
            .filter(p => p.infoVendas?.bsrGeral)
            .map(p => p.infoVendas.bsrGeral);
        
        if (bsrsEspecificos.length > 0) {
            const mediaBsrEspecifico = Math.round(bsrsEspecificos.reduce((a, b) => a + b, 0) / bsrsEspecificos.length);
            const melhorBsrEspecifico = Math.min(...bsrsEspecificos);
            console.log(`📊 BSR Específico: ${bsrsEspecificos.length} produtos analisados`);
            console.log(`   • Média: #${mediaBsrEspecifico.toLocaleString()}`);
            console.log(`   • Melhor: #${melhorBsrEspecifico.toLocaleString()}`);
        }
        
        if (bsrsGerais.length > 0) {
            const mediaBsrGeral = Math.round(bsrsGerais.reduce((a, b) => a + b, 0) / bsrsGerais.length);
            const melhorBsrGeral = Math.min(...bsrsGerais);
            console.log(`📊 BSR Geral: ${bsrsGerais.length} produtos analisados`);
            console.log(`   • Média: #${mediaBsrGeral.toLocaleString()}`);
            console.log(`   • Melhor: #${melhorBsrGeral.toLocaleString()}`);
        }
        
        // Mostrar notificação com resumo
        if (produtosComMarca.length > 0 || produtosComCategoria.length > 0) {
            const mensagem = `Análise completa! ${produtosComMarca.length}/${produtos.length} marcas e ${produtosComCategoria.length}/${produtos.length} categorias encontradas.`;
            NotificationManager.sucesso(mensagem);
        } else {
            NotificationManager.informacao(`Análise concluída. ${produtos.length} produtos processados.`);
        }
    }

    static init() {
        // Verificar se já foi inicializado
        if (window.amkSpyInicializado) {
            console.log('⚠️ AMK Spy já foi inicializado');
            return;
        }
        
        // Marcar como inicializado
        window.amkSpyInicializado = true;
        
        // Inicializar ThemeManager
        if (!window.themeManager) {
            window.themeManager = new ThemeManager();
        }
        
        if (window.location.href.includes('/s?') || window.location.href.includes('/s/')) {
            EventManager.adicionarBotaoAmkSpy();
            // Iniciar análise automática imediatamente
            setTimeout(() => {
                console.log('🚀 Iniciando análise automática...');
                this.exibirAnalise();
            }, 1000);
        }
    }
}

window.AppController = AppController; 