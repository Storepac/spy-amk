/**
 * TableManager - Gerenciador principal da tabela de produtos
 * Versão refatorada com componentes modulares
 */
class TableManager {
    static filterManager = new FilterManager();
    static exportManager = new ExportManager();
    static themeManager = new ThemeManager();
    static eventManager = new EventManager();

    static criarTabelaProdutos(produtos) {
        // Definir produtos globalmente para uso em outras funções
        window.produtosTabela = produtos;
        
        // Configurar produtos no FilterManager
        this.filterManager.setProdutos(produtos);
        
        // Calcular métricas
        const metricas = this.atualizarMetricas(produtos);
        const termoBusca = UrlManager.extrairTermoBusca();
        
        // Criar modal usando ModalBuilder
        const modalHTML = ModalBuilder.criarModalPrincipal(produtos, metricas, termoBusca);
        
        // Inserir no DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Inicializar eventos
        this.inicializarEventos();
        
        // Configurar eventos da tabela
        this.eventManager.configurarEventosTabela();
        
        return true;
    }

    static inicializarEventos() {
        // Aguardar um pouco para garantir que o DOM foi renderizado
        setTimeout(() => {
            this.eventManager.inicializar();
        }, 100);
    }

    static atualizarTabelaComFiltros(produtosFiltrados) {
        const tbody = document.querySelector('#tabela-produtos tbody');
        if (!tbody) return;

        // Aplicar ordenação se necessário
        const produtosOrdenados = this.filterManager.aplicarOrdenacao(produtosFiltrados);
        
        // Recriar linhas da tabela
        tbody.innerHTML = produtosOrdenados.map((produto, index) => 
            TableRowBuilder.criarLinhaProduto(produto, index)
        ).join('');
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

    static async copiarASIN(asin) {
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
            mostrarFeedback(true);
        } catch (error) {
            console.log('Método moderno falhou, tentando fallback...');
            this.copiarASINFallback(asin, mostrarFeedback);
        }
    }

    static copiarASINFallback(asin, mostrarFeedback) {
        try {
            // Criar elemento temporário
            const textArea = document.createElement('textarea');
            textArea.value = asin;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const sucesso = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            mostrarFeedback(sucesso);
        } catch (error) {
            console.error('Fallback também falhou:', error);
            this.copiarASINLegacy(asin, mostrarFeedback);
        }
    }

    static copiarASINLegacy(asin, mostrarFeedback) {
        try {
            // Método mais antigo
            const textArea = document.createElement('textarea');
            textArea.value = asin;
            document.body.appendChild(textArea);
            textArea.select();
            
            const sucesso = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            mostrarFeedback(sucesso);
        } catch (error) {
            console.error('Todos os métodos de cópia falharam:', error);
            mostrarFeedback(false);
        }
    }

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
        window.open(url, '_blank');
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
        
        // Limpar variáveis globais
        window.produtosTabela = null;
    }

    // Método para verificar se todos os componentes estão carregados
    static verificarComponentes() {
        const componentes = {
            'FilterManager': typeof FilterManager !== 'undefined',
            'ExportManager': typeof ExportManager !== 'undefined',
            'ThemeManager': typeof ThemeManager !== 'undefined',
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
}

window.TableManager = TableManager; 