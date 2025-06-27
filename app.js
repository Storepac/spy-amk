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
            
            // Se não há produtos armazenados, criar modal vazio para aguardar análise
            console.log('ℹ️ Não há produtos armazenados - criando modal vazio');
            this.criarModalVazio();
            
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
        
        // ESCONDER informação sobre análise quando há produtos
        const infoAnalise = document.getElementById('info-analise');
        if (infoAnalise) {
            infoAnalise.style.display = 'none';
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
        
        // Botão nova busca
        const btnNovaBusca = document.getElementById('btn-nova-busca');
        console.log('Botão nova busca encontrado:', !!btnNovaBusca);
        if (btnNovaBusca) {
            btnNovaBusca.addEventListener('click', () => {
                console.log('🔄 Iniciando nova busca...');
                this.limparProdutosArmazenados();
                NotificationManager.informacao('Use o popup da extensão para iniciar uma nova análise.');
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
        
        // Botão teste eventos removido - função integrada automaticamente
        
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

    static async iniciarAnaliseBackground(tipo) {
        try {
            // Armazenar tipo de análise
            this.tipoAnaliseAnterior = tipo;
            
            // Executar análise em background sem mostrar modal
            console.log(`🔄 Iniciando análise ${tipo} em background...`);
            
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
            
            // Verificar se tabela já está aberta para atualizar
            const modal = document.getElementById('amazon-analyzer-modal');
            if (modal && modal.style.display === 'flex') {
                console.log('📊 Tabela já está aberta - atualizando com novos dados...');
                this.atualizarTabelaExistente(produtos);
                NotificationManager.sucesso(`Análise concluída! Tabela atualizada com ${produtos.length} produtos.`);
            } else {
                console.log(`✅ Análise ${tipo} concluída! ${produtos.length} produtos encontrados.`);
                NotificationManager.sucesso(`Análise concluída! ${produtos.length} produtos encontrados. Use "Abrir/Fechar Tabela" para visualizar.`);
            }
            
            // Atualizar status do botão do painel
            if (typeof SidePanel !== 'undefined') {
                SidePanel.atualizarStatusBotao();
            }
            
            // Iniciar busca automática em background
            this.iniciarBuscaAutomaticaBackground(produtos);
            
            // Salvar produtos no Supabase automaticamente
            this.salvarProdutosNoSupabase(produtos);
            
        } catch (error) {
            console.error('Erro na análise:', error);
            NotificationManager.erro('Erro ao analisar produtos.');
            this.ocultarLoadingInicial();
            this.mostrarOpcoesAnalise();
        }
    }

    static async iniciarBuscaAutomaticaBackground(produtos) {
        console.log('🚀 Iniciando busca automática em background...');
        
        try {
            // Verificar se tabela está aberta para usar callback que atualiza
            let modal = document.getElementById('amazon-analyzer-modal');
            let tabelaAberta = modal && modal.style.display === 'flex';
            let produtosProcessados = 0;
            const totalProdutos = produtos.length;
            const metadeProdutos = Math.ceil(totalProdutos / 2);
            
            // Callback inteligente que auto-abre tabela ao atingir 50%
            const callbackInteligente = (produto, index) => {
                produtosProcessados++;
                
                // Verificar se deve auto-abrir tabela
                if (!tabelaAberta && produtosProcessados >= metadeProdutos) {
                    console.log(`📊 ${produtosProcessados}/${totalProdutos} produtos processados - Auto-abrindo tabela!`);
                    this.autoAbrirTabelaComProgresso(produtos);
                    tabelaAberta = true;
                    NotificationManager.sucesso(`Tabela aberta automaticamente! ${produtosProcessados}/${totalProdutos} produtos processados.`);
                }
                
                // Se tabela está aberta, atualizar linha
                if (tabelaAberta) {
                    TableManager.atualizarLinhaProduto(produto, index);
                } else {
                    console.log(`📊 Produto ${index + 1} processado: ${produto.titulo}`);
                }
            };
            
            // Executar análise com callback inteligente
            await ProductAnalyzer.buscarDetalhesEmParalelo(produtos, callbackInteligente);
            await ProductAnalyzer.buscarMarcasFaltantes(produtos, callbackInteligente);
            
            // Atualizar métricas finais se tabela está aberta
            if (tabelaAberta) {
                TableManager.atualizarMetricas(produtos);
                console.log('✅ Busca automática concluída - tabela atualizada');
                NotificationManager.sucesso(`Análise completa! ${totalProdutos} produtos processados.`);
            } else {
                console.log('✅ Busca automática em background concluída');
            }
            
        } catch (error) {
            console.error('Erro na busca automática em background:', error);
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
            // NÃO iniciar análise automática na primeira carga
            // O usuário deve usar o painel lateral para iniciar análises
            console.log('✅ AMK Spy pronto - use o painel lateral (🔍) para iniciar análises');
        }
    }

    static criarModalVazio() {
        try {
            console.log('🔧 Criando modal vazio...');
            
            // Remover modal existente se houver
            const modalExistente = document.getElementById('amazon-analyzer-modal');
            if (modalExistente) {
                modalExistente.remove();
            }
            
            // Criar modal vazio
            const modal = document.createElement("div");
            modal.id = "amazon-analyzer-modal";
            modal.innerHTML = ModalBuilder.criarModal();
            document.body.appendChild(modal);
            
            // Mostrar informação sobre análise
            const infoAnalise = document.getElementById('info-analise');
            if (infoAnalise) {
                infoAnalise.style.display = 'block';
                infoAnalise.innerHTML = `
                    <div style="font-size: 13px; color: #374151; text-align: center;">
                        <strong>📊 Aguardando análise...</strong><br>
                        Use o painel lateral (botão 🔍) para iniciar uma nova análise.
                    </div>
                `;
            }
            
            // Mostrar conteúdo da tabela vazio
            const conteudoTabela = document.getElementById('conteudo-tabela');
            if (conteudoTabela) {
                conteudoTabela.style.display = 'block';
                conteudoTabela.innerHTML = `
                    <div style="
                        text-align: center;
                        padding: 40px 20px;
                        color: #666;
                        background: #f9fafb;
                        border-radius: 10px;
                        border: 2px dashed #d1d5db;
                    ">
                        <div style="font-size: 48px; margin-bottom: 15px;">📊</div>
                        <h3 style="margin-bottom: 10px; color: #374151;">Tabela Pronta para Análise</h3>
                        <p style="font-size: 14px; line-height: 1.4; max-width: 400px; margin: 0 auto;">
                            Use o painel lateral (botão redondo 🔍) para buscar produtos na Amazon.<br>
                            Os resultados aparecerão aqui automaticamente.
                        </p>
                    </div>
                `;
            }
            
            // Configurar eventos do modal
            this.configurarEventosModal();
            
            console.log('✅ Modal vazio criado com sucesso');
            
        } catch (error) {
            console.error('Erro ao criar modal vazio:', error);
        }
    }

    static autoAbrirTabelaComProgresso(produtos) {
        try {
            console.log('🚀 Auto-abrindo tabela com progresso...');
            
            // Criar modal se não existir
            let modal = document.getElementById('amazon-analyzer-modal');
            if (!modal) {
                modal = document.createElement("div");
                modal.id = "amazon-analyzer-modal";
                modal.innerHTML = ModalBuilder.criarModal();
                document.body.appendChild(modal);
                
                // Configurar eventos do modal
                this.configurarEventosModal();
            }
            
            // Mostrar modal
            modal.style.display = 'flex';
            
            // ESCONDER informação sobre análise quando há produtos
            const infoAnalise = document.getElementById('info-analise');
            if (infoAnalise) {
                infoAnalise.style.display = 'none';
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
            
            // Atualizar estatísticas
            if (window.statsUpdater) {
                window.statsUpdater.atualizarEstatisticas(produtos);
            }
            
            // Inicializar eventos da tabela com limpeza forçada
            TableManager.inicializarEventos(true);
            
            // Atualizar status do botão do painel
            if (typeof SidePanel !== 'undefined') {
                SidePanel.atualizarStatusBotao();
            }
            
            console.log('✅ Tabela auto-aberta com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao auto-abrir tabela:', error);
        }
    }

    static atualizarTabelaExistente(produtos) {
        try {
            // Atualizar conteúdo da tabela se ela já estiver aberta
            const conteudoTabela = document.getElementById('conteudo-tabela');
            if (conteudoTabela) {
                conteudoTabela.style.display = 'block';
                conteudoTabela.innerHTML = TableManager.criarTabelaProdutos(produtos);
            }
            
            // ESCONDER informação sobre análise quando há produtos
            const infoAnalise = document.getElementById('info-analise');
            if (infoAnalise) {
                infoAnalise.style.display = 'none';
            }
            
            // Mostrar botão de nova busca
            const novaBuscaContainer = document.getElementById('nova-busca-container');
            if (novaBuscaContainer) {
                novaBuscaContainer.style.display = 'block';
            }
            
            // Configurar produtos no FilterManager
            TableManager.filterManager.setProdutos(produtos);
            
            // Atualizar estatísticas
            if (window.statsUpdater) {
                window.statsUpdater.atualizarEstatisticas(produtos);
            }
            
            // Inicializar eventos da tabela com limpeza forçada
            TableManager.inicializarEventos(true);
            
            console.log('✅ Tabela existente atualizada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar tabela existente:', error);
        }
    }

    static limparProdutosArmazenados() {
        this.produtosArmazenados = null;
        this.tipoAnaliseAnterior = null;
        window.produtosTabela = null;
        console.log('🗑️ Produtos armazenados limpos');
    }

    /**
     * Salvar produtos no Supabase com análise avançada
     */
    static async salvarProdutosNoSupabase(produtos) {
        if (!produtos || produtos.length === 0) return;

        try {
            // Verificar se SupabaseManager está disponível
            if (typeof window.supabaseManager === 'undefined') {
                console.warn('⚠️ SupabaseManager não está disponível');
                return;
            }

            // Obter termo de pesquisa da URL
            const urlParams = new URLSearchParams(window.location.search);
            const termoPesquisa = urlParams.get('k') || 'termo-nao-identificado';
            const paginaAtual = parseInt(urlParams.get('page') || '1');

            console.log(`🔍 Iniciando análise avançada de ${produtos.length} produtos (página ${paginaAtual})...`);

            // Usar análise avançada
            const resultado = await window.supabaseManager.analisarPosicoes(
                produtos, 
                termoPesquisa,
                paginaAtual
            );

            if (resultado.success) {
                const stats = resultado.analise.estatisticas;
                const metodo = resultado.metodo || 'avançado';
                console.log(`✅ Análise ${metodo} concluída:`, stats);
                
                // Usar produtos combinados com marcações de status se disponível
                if (resultado.produtosCombinados && resultado.produtosCombinados.length > 0) {
                    console.log(`🔄 Atualizando tabela com ${resultado.produtosCombinados.length} produtos marcados`);
                    
                    // Atualizar tabela com produtos que têm marcação de status
                    this.atualizarTabelaExistente(resultado.produtosCombinados);
                    
                    // Atualizar estatísticas dinâmicas
                    if (window.statsUpdater) {
                        window.statsUpdater.atualizarEstatisticas(
                            resultado.produtosCombinados, 
                            resultado.analise.estatisticas
                        );
                    }
                }
                
                // A notificação já é mostrada pelo SupabaseManager
                // Apenas log adicional se for método tradicional
                if (resultado.metodo === 'tradicional') {
                    console.log(`📊 Fallback usado: ${resultado.resultadoSalvamento?.saved || 0} salvos, ${resultado.resultadoSalvamento?.queued || 0} na fila`);
                }
            } else {
                console.warn('⚠️ Todas as análises falharam, usando método simples...');
                await this.salvarProdutosSimplesNoSupabase(produtos);
            }

        } catch (error) {
            console.error('❌ Erro na análise avançada, usando método tradicional:', error);
            await this.salvarProdutosSimplesNoSupabase(produtos);
        }
    }

    /**
     * Método de salvamento simples (fallback)
     */
    static async salvarProdutosSimplesNoSupabase(produtos) {
        try {
            // Obter termo de pesquisa da URL
            const urlParams = new URLSearchParams(window.location.search);
            const termoPesquisa = urlParams.get('k') || 'termo-nao-identificado';

            console.log(`💾 Salvamento simples de ${produtos.length} produtos...`);

            // Processar produtos em lotes menores para não sobrecarregar
            const tamanhoLote = 8;
            let totalSalvos = 0;

            for (let i = 0; i < produtos.length; i += tamanhoLote) {
                const lote = produtos.slice(i, i + tamanhoLote);
                
                const resultado = await window.supabaseManager.processarListaProdutos(lote, termoPesquisa);
                totalSalvos += resultado.saved + resultado.queued;

                // Delay entre lotes
                if (i + tamanhoLote < produtos.length) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }

            if (totalSalvos > 0) {
                console.log(`✅ ${totalSalvos} produtos processados tradicionalmente`);
                
                // Mostrar notificação simples
                if (typeof NotificationManager !== 'undefined') {
                    NotificationManager.informacao(
                        `💾 ${totalSalvos}/${produtos.length} produtos salvos no banco!`,
                        4000
                    );
                }
            }

        } catch (error) {
            console.error('❌ Erro no salvamento simples:', error);
        }
    }
}

window.AppController = AppController; 