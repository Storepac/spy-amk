/**
 * TableManager - Gerenciador principal da tabela de produtos
 * Versão refatorada com funcionalidades separadas
 */
class TableManager {
    static filterManager = new FilterManager();
    static exportManager = new ExportManager();
    static eventManager = new EventManager();
    static themeManager = new ThemeManager();

    static criarTabelaProdutos(produtos) {
        window.produtosTabela = produtos;
        
        // Detectar plataforma
        const isML = produtos.length > 0 && (produtos[0].plataforma === 'mercadolivre' || produtos[0].mlId);
        
        // Inicializar o FilterManager com os produtos
        if (this.filterManager) {
            this.filterManager.setProdutos(produtos);
        }
        
        // Inicializar StatsManager se disponível (sem interferir nos filtros)
        if (window.StatsManager) {
            setTimeout(() => {
                window.StatsManager.inicializar(produtos);
            }, 100);
        }
        
        // Inicializar PositionTracker se disponível
        if (window.PositionTracker) {
            setTimeout(() => {
                window.PositionTracker.inicializar(produtos);
            }, 200);
        }
        
        return `
            <!-- Contador e Filtros -->
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                margin-bottom: 20px;
                        flex-wrap: wrap;
                gap: 15px;
            ">
                <div style="
                    background: var(--bg-secondary);
                    padding: 10px 15px;
                                    border-radius: 8px;
                    border: 1px solid var(--border-light);
                ">
                    <span class="contador-produtos" style="
                        color: var(--text-primary);
                        font-weight: 600;
                                    font-size: 14px;
                        opacity: 0.9;
                    ">${produtos.length} produtos ${isML ? 'ML' : 'Amazon'}</span>
                            </div>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button id="btn-limpar-filtros" style="
                        background: var(--bg-secondary);
                        border: 1px solid var(--border-light);
                                border-radius: 6px;
                                padding: 6px 12px;
                                    cursor: pointer;
                        color: var(--text-primary);
                        font-size: 12px;
                                transition: all 0.2s;
                    " title="Limpar filtros">
                        🗑️ Limpar
                    </button>
                    <button id="btn-exportar-dados" style="
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                border: none;
                                border-radius: 6px;
                                    padding: 6px 12px;
                                    cursor: pointer;
                                color: white;
                        font-size: 12px;
                        font-weight: 600;
                                transition: all 0.2s;
                    " title="Exportar dados">
                        📊 Exportar
                            </button>
                        </div>
                    </div>
                    
            <!-- Filtros -->
            ${FilterManager.criarFiltros()}

            <!-- Tabela -->
            <table id="tabela-produtos" style="
                            width: 95%;
                            border-collapse: collapse;
                font-size: 12px;
                background: var(--bg-secondary);
                border-radius: 10px;
                overflow: hidden;
                border: 1px solid var(--border-light);
                margin: 0 auto;
            ">
                <thead>
                    ${this.criarCabecalhoTabela(isML)}
                                </thead>
                <tbody>
                    ${produtos.map((produto, index) => TableRowBuilder.criarLinhaProduto(produto, index)).join('')}
                            </tbody>
                        </table>
        `;
    }
    
    static criarCabecalhoTabela(isML) {
        if (isML) {
            return `
                <tr style="
                    background: var(--bg-primary);
                    border-bottom: 2px solid var(--border-light);
                ">
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary);" title="Posição na pesquisa do ML">🏆 Posição</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Imagem</th>
                    <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Título</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">MLB</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Vendedor</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Preço</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Avaliação</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);"># Aval.</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light); cursor: help;" title="📊 Vendas extraídas do ML&#10;&#10;💡 Formatos:&#10;• '+10mil vendidos' → 10.000&#10;• '+500 vendidos' → 500&#10;• Baseado em dados públicos do ML">Vendidos 📊</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Receita</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Badge</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Categoria</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);" title="Status do produto (novo/existente)">Status</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary);" title="Tendência de posição (subiu/desceu/manteve)">📈 Tendência</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Tipo</th>
                </tr>
            `;
        } else {
            return `
                <tr style="
                    background: var(--bg-primary);
                    border-bottom: 2px solid var(--border-light);
                ">
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary);" title="Posição na pesquisa da Amazon">🏆 Posição</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Imagem</th>
                    <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Título</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">ASIN</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Marca</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Preço</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Avaliação</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);"># Aval.</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light); cursor: help;" title="📊 Vendas no último mês&#10;&#10;💡 Estimativas:&#10;• 'Mais de X mil' → +20% margem&#10;• '2+ mil' → +20% margem&#10;• Números exatos conforme Amazon&#10;&#10;🎯 Baseado em dados públicos da Amazon">Vendidos 📊</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Receita</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">BSR</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Categoria</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);" title="Status do produto (novo/existente)">Status</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary);" title="Tendência de posição (subiu/desceu/manteve)">📈 Tendência</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border-light);">Tipo</th>
                </tr>
            `;
        }
    }

    static inicializarEventos(forcarLimpeza = false) {
        console.log('🔧 Inicializando eventos da tabela...', forcarLimpeza ? '(com limpeza forçada)' : '');
        
        // Aplicar tema inicialmente
        if (this.themeManager) {
            this.themeManager.applyTheme();
            console.log('🎨 Tema aplicado na inicialização');
        }
        
        // SEMPRE limpar filtros ao inicializar para garantir funcionamento correto
        if (this.filterManager) {
            console.log('🧹 Auto-limpeza de filtros para garantir funcionamento correto...');
            this.filterManager.limparFiltros();
        }
        
        // Aguardar um pouco para garantir que o DOM foi renderizado
        setTimeout(() => {
            // Configurar eventos de cópia de ASIN PRIMEIRO
            this.configurarEventosCopiarASIN();
            
            // Configurar eventos de BSR
            this.configurarEventosBSR();
            
            // Configurar eventos dos botões da tabela
            this.configurarEventosBotoes();
            
            // Configurar eventos do FilterManager
            if (this.filterManager) {
                this.filterManager.configurarEventos();
            }
            
            // Configurar eventos do EventManager
            if (this.eventManager) {
                this.eventManager.inicializar();
            }
            
            // Aplicar tema novamente após DOM estabilizar
            if (this.themeManager) {
                this.themeManager.applyTheme();
            }
            
            // Executar segunda limpeza após eventos configurados para garantir estado correto
            setTimeout(() => {
                if (this.filterManager) {
                    console.log('🧹 Segunda limpeza para garantir estado correto dos eventos...');
                    this.filterManager.limparFiltros();
                    this.reconfigurarEventosTabela();
                }
            }, 100);
            
            console.log('✅ Todos os eventos da tabela foram inicializados');
        }, 200); // Aumentado para 200ms para garantir que o DOM está pronto
    }

    static configurarEventosBotoes() {
        console.log('🔧 Configurando eventos dos botões...');
        
        // Botão limpar filtros
        const btnLimparFiltros = document.getElementById('btn-limpar-filtros');
        if (btnLimparFiltros) {
            btnLimparFiltros.addEventListener('click', () => {
                console.log('🧹 Limpando filtros...');
                this.limparFiltros();
            });
            console.log('✅ Evento configurado para botão limpar filtros');
        } else {
            console.warn('⚠️ Botão limpar filtros não encontrado');
        }
        
        // Botão exportar dados
        const btnExportarDados = document.getElementById('btn-exportar-dados');
        if (btnExportarDados) {
            btnExportarDados.addEventListener('click', () => {
                console.log('📊 Exportando dados...');
                this.exportarDados();
            });
            console.log('✅ Evento configurado para botão exportar dados');
            } else {
            console.warn('⚠️ Botão exportar dados não encontrado');
        }
    }

    static configurarEventosCopiarASIN() {
        console.log('🔧 Configurando eventos de cópia de ASIN...');
        
        const configurarEventos = () => {
            // Encontrar todos os botões de ASIN pela nova classe
            const botoesASIN = document.querySelectorAll('.btn-copiar-asin');
            console.log('📋 Encontrados', botoesASIN.length, 'botões de ASIN');
            
            if (botoesASIN.length === 0) {
                console.warn('⚠️ Nenhum botão ASIN encontrado, tentando novamente em 100ms...');
                setTimeout(configurarEventos, 100);
                return;
            }
            
            botoesASIN.forEach((botao, index) => {
                // Remover eventos existentes para evitar duplicação
                if (botao.asinClickHandler) {
                    botao.removeEventListener('click', botao.asinClickHandler);
                }
                
                // Criar novo handler
                botao.asinClickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Extrair ASIN do atributo data-asin
                    const asin = botao.getAttribute('data-asin');
                    console.log(`📋 Clicou no botão ${index + 1}, ASIN: ${asin}`);
                    
                    if (asin && asin !== 'N/A') {
                        this.copiarASIN(asin);
            } else {
                        NotificationManager.erro('ASIN inválido para copiar.');
                    }
                };
                
                // Adicionar evento via JavaScript
                botao.addEventListener('click', botao.asinClickHandler);
                
                console.log(`✅ Evento configurado para botão ASIN ${index + 1}`);
            });
        };
        
        // Iniciar configuração com delay inicial
        setTimeout(configurarEventos, 100);
    }

    static configurarEventosBSR() {
        console.log('🔧 Configurando eventos de BSR...');
        
        const configurarEventos = () => {
            // Encontrar todas as células de BSR pela nova classe
            const celulasBSR = document.querySelectorAll('.celula-bsr');
            console.log('📊 Encontradas', celulasBSR.length, 'células de BSR');
            
            if (celulasBSR.length === 0) {
                console.warn('⚠️ Nenhuma célula BSR encontrada, tentando novamente em 100ms...');
                setTimeout(configurarEventos, 100);
                return;
            }
            
            celulasBSR.forEach((celula, index) => {
                // Remover eventos existentes para evitar duplicação
                if (celula.bsrClickHandler) {
                    celula.removeEventListener('click', celula.bsrClickHandler);
                }
                
                // Criar novo handler
                celula.bsrClickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log(`📊 Clicou na célula BSR ${index + 1}`);
                    this.toggleRankingInfo(celula);
                };
                
                // Adicionar evento via JavaScript
                celula.addEventListener('click', celula.bsrClickHandler);
                
                console.log(`✅ Evento configurado para célula BSR ${index + 1}`);
            });
        };
        
        // Iniciar configuração com delay inicial
        setTimeout(configurarEventos, 100);
    }

    static limparFiltros() {
        console.log('🧹 Iniciando limpeza de filtros...');
        
        try {
            // Limpar filtros no FilterManager
            if (this.filterManager && typeof this.filterManager.limparFiltros === 'function') {
                this.filterManager.limparFiltros();
        } else {
                console.error('❌ FilterManager não disponível ou método limparFiltros não encontrado');
                NotificationManager.erro('Erro ao limpar filtros.');
            }
                } catch (error) {
            console.error('❌ Erro ao limpar filtros:', error);
            NotificationManager.erro('Erro ao limpar filtros.');
        }
    }

    static exportarDados() {
        console.log('📊 Iniciando exportação de dados...');
        
        try {
            // Exportar dados via ExportManager
            if (this.exportManager && typeof this.exportManager.exportarDados === 'function') {
                this.exportManager.exportarDados();
                } else {
                console.error('❌ ExportManager não disponível ou método exportarDados não encontrado');
                NotificationManager.erro('Erro ao exportar dados.');
            }
        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            NotificationManager.erro('Erro ao exportar dados.');
        }
    }

    static forcarReconfiguracaoEventos() {
        console.log('🔄 Forçando reconfiguração completa dos eventos...');
        
        // Limpar filtros primeiro
        if (this.filterManager) {
            this.filterManager.limparFiltros();
        }
        
        // Aguardar um pouco e reconfigurar todos os eventos
        setTimeout(() => {
            this.reconfigurarEventosTabela();
            console.log('✅ Reconfiguração forçada concluída');
        }, 300);
    }

    static reconfigurarEventosTabela() {
        console.log('🔧 Reconfigurando eventos da tabela...');
        
        // Reconfigurar eventos de cópia de ASIN
        this.configurarEventosCopiarASIN();
        
        // Reconfigurar eventos de BSR
        this.configurarEventosBSR();
        
        // Reconfigurar eventos dos botões
        this.configurarEventosBotoes();
        
        // Reconfigurar eventos do FilterManager
        if (this.filterManager) {
            this.filterManager.configurarEventos();
        }
        
        // Forçar atualização das linhas da tabela
        const linhasProdutos = document.querySelectorAll('.linha-produto');
        linhasProdutos.forEach((linha, index) => {
            linha.style.display = '';
            // Garantir que os eventos estão ativos
            const btnASIN = linha.querySelector('.btn-copiar-asin');
            const btnBSR = linha.querySelector('.bsr-cell');
            
            if (btnASIN) {
                btnASIN.style.pointerEvents = 'auto';
                btnASIN.style.opacity = '1';
            }
            
            if (btnBSR) {
                btnBSR.style.pointerEvents = 'auto';
                btnBSR.style.opacity = '1';
            }
        });
        
        console.log('✅ Eventos da tabela reconfigurados');
    }

    static atualizarTabelaComFiltros(produtosFiltrados) {
        console.log('🔄 TableManager.atualizarTabelaComFiltros() iniciado com', produtosFiltrados.length, 'produtos');
        
        const tbody = document.querySelector('#tabela-produtos tbody');
        if (!tbody) {
            console.error('❌ Tbody da tabela não encontrado');
            return;
        }

        // Aplicar ordenação se necessário
        const produtosOrdenados = this.filterManager.aplicarOrdenacao(produtosFiltrados);
        console.log('📊 Produtos após ordenação:', produtosOrdenados.length);
        
        // Recriar linhas da tabela
        tbody.innerHTML = produtosOrdenados.map((produto, index) => 
            TableRowBuilder.criarLinhaProduto(produto, index)
        ).join('');
        
        console.log('✅ Tabela atualizada com', produtosOrdenados.length, 'produtos');
        
        // Aguardar um pouco para garantir que o DOM foi atualizado
            setTimeout(() => {
            // Reconfigurar eventos
            this.configurarEventosCopiarASIN();
            this.configurarEventosBSR();
            console.log('✅ Eventos reconfigurados após atualização da tabela');
        }, 150);
    }

    static atualizarLinhaProduto(produto, index) {
        const linha = document.querySelector(`tr[data-index="${index}"]`);
        if (!linha) return;

        // Recriar a linha com os dados atualizados
        const novaLinha = TableRowBuilder.criarLinhaProduto(produto, index);
        linha.outerHTML = novaLinha;
    }

    static verificarASINDuplicado(asin) {
        if (!window.produtosTabela) return false;
        
        const ocorrencias = window.produtosTabela.filter(p => p.asin === asin);
        return ocorrencias.length > 1;
    }

    static atualizarMetricas(produtos) {
        return ProductAnalyzer.calcularMetricas(produtos);
    }

    static calcularNivelCompetitividade(metricas) {
        const mediaBSR = metricas.mediaBSR || 0;
        const mediaAvaliacao = metricas.mediaAvaliacao || 0;
        
        if (mediaBSR <= 1000 && mediaAvaliacao >= 4.0) return 'Alta 🟢';
        if (mediaBSR <= 5000 && mediaAvaliacao >= 3.5) return 'Média 🟡';
        return 'Baixa 🔴';
    }

    // ===== FUNCIONALIDADE DE COPIAR ASIN =====
    static async copiarASIN(asin) {
        console.log('📋 Tentando copiar ASIN:', asin);
        
        if (!asin || asin === 'N/A') {
            NotificationManager.erro('ASIN inválido para copiar.');
            return;
        }
        
        const mostrarFeedback = (sucesso) => {
            if (sucesso) {
                NotificationManager.sucesso(`ASIN ${asin} copiado para a área de transferência!`);
        } else {
                NotificationManager.erro('Erro ao copiar ASIN. Tente novamente.');
            }
        };

        try {
            // Tentar método moderno primeiro
            await navigator.clipboard.writeText(asin);
            console.log('✅ ASIN copiado com sucesso via navigator.clipboard');
            mostrarFeedback(true);
        } catch (error) {
            console.log('❌ Método moderno falhou, tentando fallback...', error);
            this.copiarASINFallback(asin, mostrarFeedback);
        }
    }

    static copiarASINFallback(asin, mostrarFeedback) {
        try {
            console.log('🔄 Tentando método fallback...');
            
            // Criar elemento temporário
            const textArea = document.createElement('textarea');
            textArea.value = asin;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const sucesso = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (sucesso) {
                console.log('✅ ASIN copiado com sucesso via fallback');
                mostrarFeedback(true);
                    } else {
                console.log('❌ Fallback falhou, tentando legacy...');
                this.copiarASINLegacy(asin, mostrarFeedback);
            }
        } catch (error) {
            console.error('❌ Fallback também falhou:', error);
            this.copiarASINLegacy(asin, mostrarFeedback);
        }
    }

    static copiarASINLegacy(asin, mostrarFeedback) {
        try {
            console.log('🔄 Tentando método legacy...');
            
            // Método mais antigo
            const textArea = document.createElement('textarea');
            textArea.value = asin;
            textArea.style.position = 'absolute';
            textArea.style.left = '50%';
            textArea.style.top = '50%';
            textArea.style.transform = 'translate(-50%, -50%)';
            textArea.style.zIndex = '9999';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const sucesso = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (sucesso) {
                console.log('✅ ASIN copiado com sucesso via legacy');
                mostrarFeedback(true);
                } else {
                console.log('❌ Todos os métodos de cópia falharam');
                mostrarFeedback(false);
            }
        } catch (error) {
            console.error('❌ Todos os métodos de cópia falharam:', error);
            mostrarFeedback(false);
        }
    }

    // ===== FUNCIONALIDADE DE BSR =====
    static toggleRankingInfo(element) {
        const ranking = element.textContent.trim();
        const rankingNumerico = parseInt(ranking) || 0;
        
        let mensagem = '';
        let cor = '#6b7280';
        
        if (rankingNumerico > 0) {
            if (rankingNumerico <= 100) {
                mensagem = `🏆 <strong>Excelente posição!</strong><br><br>
                    • Ranking: ${ranking}<br>
                    • Status: Top 100<br>
                    • Competitividade: Alta<br>
                    • Dificuldade: Muito alta<br><br>
                    <em>💡 Dica: Produtos nesta faixa são muito competitivos e podem ter margens menores.</em>`;
                cor = '#10b981';
            } else if (rankingNumerico <= 1000) {
                mensagem = `🥈 <strong>Boa posição!</strong><br><br>
                    • Ranking: ${ranking}<br>
                    • Status: Top 1000<br>
                    • Competitividade: Média<br>
                    • Dificuldade: Moderada<br><br>
                    <em>💡 Dica: Esta é uma faixa equilibrada com boa oportunidade de vendas.</em>`;
                cor = '#f59e0b';
            } else if (rankingNumerico <= 10000) {
                mensagem = `🥉 <strong>Posição regular</strong><br><br>
                    • Ranking: ${ranking}<br>
                    • Status: Top 10000<br>
                    • Competitividade: Baixa<br>
                    • Dificuldade: Baixa<br><br>
                    <em>💡 Dica: Menos competitivo, mas pode ter menor volume de vendas.</em>`;
                cor = '#ef4444';
            } else {
                mensagem = `📊 <strong>Posição baixa</strong><br><br>
                    • Ranking: ${ranking}<br>
                    • Status: Acima de 10000<br>
                    • Competitividade: Muito baixa<br>
                    • Dificuldade: Muito baixa<br><br>
                    <em>💡 Dica: Fácil de entrar, mas pode ter baixo volume de vendas.</em>`;
                cor = '#6b7280';
            }
        } else {
            mensagem = `❓ <strong>Ranking não disponível</strong><br><br>
                • Este produto não possui ranking BSR<br>
                • Pode ser um produto novo ou sem vendas<br><br>
                <em>💡 Dica: Verifique se o produto está ativo e tem vendas.</em>`;
        }
        
        NotificationManager.informacao(mensagem, 8000);
    }
    
    static realizarNovaBusca() {
        const termo = document.getElementById('nova-busca')?.value?.trim();
        if (!termo) {
            NotificationManager.erro('Digite um termo para buscar.');
            return;
        }
        
        const url = `https://www.amazon.com.br/s?k=${encodeURIComponent(termo)}`;
        window.location.href = url;
    }

    static getTop10BSR(produtos, limite) {
        return produtos
            .filter(p => p.ranking && parseInt(p.ranking) <= limite)
            .sort((a, b) => parseInt(a.ranking) - parseInt(b.ranking))
            .slice(0, 10)
            .map(p => p.ranking);
    }

    static fecharModal() {
        const modal = document.getElementById('amazon-analyzer-modal');
        if (modal) {
            modal.remove();
        }
        
        // Limpar eventos
        this.eventManager.limparTodosEventos();
        
        // NÃO limpar produtos armazenados - eles ficam para reutilização
        // window.produtosTabela = null; // Comentado para manter produtos
        
        NotificationManager.informacao('Tabela fechada. Clique no AMK Spy para reabrir.');
    }

    // Método para verificar se todos os componentes estão carregados
    static verificarComponentes() {
        const componentes = {
            'FilterManager': typeof FilterManager !== 'undefined',
            'ExportManager': typeof ExportManager !== 'undefined',
            'EventManager': typeof EventManager !== 'undefined',
            'ModalBuilder': typeof ModalBuilder !== 'undefined',
            'TableRowBuilder': typeof TableRowBuilder !== 'undefined',
            'ProductAnalyzer': typeof ProductAnalyzer !== 'undefined',
            'NotificationManager': typeof NotificationManager !== 'undefined'
        };

        const faltando = Object.entries(componentes)
            .filter(([nome, carregado]) => !carregado)
            .map(([nome]) => nome);

        if (faltando.length > 0) {
            console.error('Componentes faltando:', faltando);
            return false;
        }

        return true;
    }

    /**
     * Copiar MLB ID para a área de transferência
     */
    static copiarMLID(mlId) {
        try {
            // Criar elemento temporário para copiar
            const tempElement = document.createElement('textarea');
            tempElement.value = mlId;
            document.body.appendChild(tempElement);
            tempElement.select();
            document.execCommand('copy');
            document.body.removeChild(tempElement);
            
            // Feedback visual
            this.mostrarNotificacao(`MLB ID copiado: ${mlId}`, 'success');
            
            console.log(`📋 MLB ID copiado: ${mlId}`);
        } catch (error) {
            console.error('Erro ao copiar MLB ID:', error);
            this.mostrarNotificacao('Erro ao copiar MLB ID', 'error');
        }
    }
    
    /**
     * Verificar se MLB ID é duplicado
     */
    static verificarMLIDDuplicado(mlId) {
        if (!window.produtosTabela || !mlId) return false;
        
        const ocorrencias = window.produtosTabela.filter(produto => 
            produto.mlId === mlId
        );
        
        return ocorrencias.length > 1;
    }
    
    /**
     * Ocultar elemento específico
     */
    static ocultarElemento(selector) {
        try {
            const elemento = document.querySelector(selector);
            if (elemento) {
                elemento.style.display = 'none';
                console.log(`✅ Elemento ocultado: ${selector}`);
            }
        } catch (error) {
            console.warn(`Elemento não encontrado para ocultar: ${selector}`, error);
        }
    }
    
    /**
     * Ocultar lista de produtos ML se existir
     */
    static ocultarListaML() {
        this.ocultarElemento('#ml-products-list');
    }
}

window.TableManager = TableManager; 