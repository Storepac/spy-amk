class AppController {
    static produtosArmazenados = null;
    static tipoAnaliseAnterior = null;
    
    static async exibirAnalise() {
        try {
            console.log('🔧 Iniciando criação do modal...');
            
            // Remover modal existente se houver
            const modalExistente = document.getElementById('amazon-analyzer-modal');
            if (modalExistente) {
                modalExistente.remove();
            }
            
            // Verificar se já temos produtos armazenados
            if (this.produtosArmazenados && this.produtosArmazenados.length > 0) {
                console.log('📊 Reutilizando produtos armazenados:', this.produtosArmazenados.length);
                this.exibirTabelaComProdutos(this.produtosArmazenados);
                return;
            }
            
            // Criar modal com opções de análise
            const modal = document.createElement("div");
            modal.id = "amazon-analyzer-modal";
            modal.innerHTML = ModalBuilder.criarModal();
            document.body.appendChild(modal);
            
            console.log('✅ Modal criado e adicionado ao DOM');
            console.log('🔍 Verificando elementos do modal...');
            
            // Verificar se os elementos foram criados
            const opcoesAnalise = document.getElementById('opcoes-analise');
            const btnRapida = document.getElementById('btn-analise-rapida');
            const btnCompleta = document.getElementById('btn-analise-completa');
            
            console.log('Elementos encontrados:', {
                opcoesAnalise: !!opcoesAnalise,
                btnRapida: !!btnRapida,
                btnCompleta: !!btnCompleta
            });
            
            // Configurar eventos dos botões
            this.configurarEventosModal();
            
            console.log('✅ Modal de análise exibido com sucesso');
            
        } catch (error) {
            console.error('Erro ao exibir análise:', error);
            NotificationManager.erro('Erro ao abrir o analisador.');
        }
    }

    static exibirTabelaComProdutos(produtos) {
        console.log('📊 Exibindo tabela com produtos armazenados...');
        
        // Criar modal
        const modal = document.createElement("div");
        modal.id = "amazon-analyzer-modal";
        modal.innerHTML = ModalBuilder.criarModal();
        document.body.appendChild(modal);
        
        // Ocultar opções de análise
        const opcoesAnalise = document.getElementById('opcoes-analise');
        if (opcoesAnalise) {
            opcoesAnalise.style.display = 'none';
        }
        
        // Mostrar tabela com produtos
        const conteudoTabela = document.getElementById('conteudo-tabela');
        if (conteudoTabela) {
            conteudoTabela.style.display = 'block';
            conteudoTabela.innerHTML = TableManager.criarTabelaProdutos(produtos);
        }
        
        // Mostrar botão de nova busca
        const novaBuscaContainer = document.getElementById('nova-busca-container');
        if (novaBuscaContainer) {
            novaBuscaContainer.style.display = 'block';
        }
        
        // Configurar produtos no FilterManager
        TableManager.filterManager.setProdutos(produtos);
        
        // Inicializar eventos da tabela com limpeza forçada
        TableManager.inicializarEventos(true);
        
        // Configurar eventos do modal
        this.configurarEventosModal();
        
        NotificationManager.sucesso(`Tabela reaberta com ${produtos.length} produtos!`);
    }

    static configurarEventosModal() {
        console.log('🔧 Configurando eventos do modal...');
        
        // Botão análise rápida
        const btnAnaliseRapida = document.getElementById('btn-analise-rapida');
        console.log('Botão análise rápida encontrado:', !!btnAnaliseRapida);
        if (btnAnaliseRapida) {
            btnAnaliseRapida.addEventListener('click', () => {
                console.log('🚀 Iniciando análise rápida...');
                this.iniciarAnalise('rapida');
            });
        }
        
        // Botão análise completa
        const btnAnaliseCompleta = document.getElementById('btn-analise-completa');
        console.log('Botão análise completa encontrado:', !!btnAnaliseCompleta);
        if (btnAnaliseCompleta) {
            btnAnaliseCompleta.addEventListener('click', () => {
                console.log('🚀 Iniciando análise completa...');
                this.iniciarAnalise('todas');
            });
        }
        
        // Botão nova busca
        const btnNovaBusca = document.getElementById('btn-nova-busca');
        console.log('Botão nova busca encontrado:', !!btnNovaBusca);
        if (btnNovaBusca) {
            btnNovaBusca.addEventListener('click', () => {
                console.log('🔄 Iniciando nova busca...');
                this.limparProdutosArmazenados();
                this.exibirAnalise();
            });
        }
        
        // Botão tema
        const btnTema = document.getElementById('btn-tema');
        console.log('Botão tema encontrado:', !!btnTema);
        if (btnTema) {
            btnTema.addEventListener('click', () => {
                console.log('🎨 Alternando tema...');
                // Por enquanto, apenas um log - podemos implementar o tema depois
                NotificationManager.informacao('Funcionalidade de tema será implementada em breve!');
            });
        }
        
        // Botão teste eventos
        const btnTesteEventos = document.getElementById('btn-teste-eventos');
        console.log('Botão teste eventos encontrado:', !!btnTesteEventos);
        if (btnTesteEventos) {
            btnTesteEventos.addEventListener('click', () => {
                console.log('🔧 Forçando reconfiguração dos eventos...');
                TableManager.forcarReconfiguracaoEventos();
                NotificationManager.sucesso('Eventos reconfigurados! Tente copiar ASIN ou clicar em BSR agora.');
            });
        }
        
        // Botão fechar
        const btnFechar = document.querySelector('#amazon-analyzer-modal button[title="Fechar"]');
        console.log('Botão fechar encontrado:', !!btnFechar);
        if (btnFechar) {
            btnFechar.addEventListener('click', () => {
                TableManager.fecharModal();
            });
        }
        
        console.log('✅ Eventos do modal configurados');
    }

    static async iniciarAnalise(tipo) {
        try {
            // Armazenar tipo de análise
            this.tipoAnaliseAnterior = tipo;
            
            // Ocultar opções de análise
            const opcoesAnalise = document.getElementById('opcoes-analise');
            if (opcoesAnalise) {
                opcoesAnalise.style.display = 'none';
            }
            
            // Mostrar loading inicial
            this.mostrarLoadingInicial();
            
            let produtos = [];
            
            if (tipo === 'todas') {
                NotificationManager.informacao('Iniciando análise completa de todas as páginas...');
                produtos = await ProductAnalyzer.coletarProdutosTodasPaginas();
            } else {
                NotificationManager.informacao('Iniciando análise rápida da página atual...');
                produtos = await ProductAnalyzer.analisarProdutosPesquisaRapido();
            }
            
            if (produtos.length === 0) {
                NotificationManager.erro('Nenhum produto encontrado.');
                this.ocultarLoadingInicial();
                this.mostrarOpcoesAnalise();
                return;
            }
            
            // Armazenar produtos para reutilização
            this.produtosArmazenados = produtos;
            window.produtosTabela = produtos;
            
            // Criar tabela imediatamente com produtos básicos
            const conteudoTabela = document.getElementById('conteudo-tabela');
            if (conteudoTabela) {
                conteudoTabela.style.display = 'block';
                conteudoTabela.innerHTML = TableManager.criarTabelaProdutos(produtos);
            }
            
            // Configurar produtos no FilterManager
            TableManager.filterManager.setProdutos(produtos);
            
            // Inicializar eventos da tabela com limpeza forçada
            TableManager.inicializarEventos(true);
            
            // Ocultar loading inicial
            this.ocultarLoadingInicial();
            
            // Iniciar busca automática em background
            this.iniciarBuscaAutomatica(produtos);
            
        } catch (error) {
            console.error('Erro na análise:', error);
            NotificationManager.erro('Erro ao analisar produtos.');
            this.ocultarLoadingInicial();
            this.mostrarOpcoesAnalise();
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

    static mostrarOpcoesAnalise() {
        const opcoesAnalise = document.getElementById('opcoes-analise');
        if (opcoesAnalise) {
            opcoesAnalise.style.display = 'block';
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
            EventManagerLegacy.adicionarBotaoAmkSpy();
            // Iniciar análise automática imediatamente
            setTimeout(() => {
                console.log('🚀 Iniciando análise automática...');
                this.exibirAnalise();
            }, 1000);
        }
    }

    static limparProdutosArmazenados() {
        this.produtosArmazenados = null;
        this.tipoAnaliseAnterior = null;
        window.produtosTabela = null;
        console.log('🗑️ Produtos armazenados limpos');
    }
}

window.AppController = AppController; 