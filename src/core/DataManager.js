/**
 * DataManager - Gerenciador centralizado de dados
 * Responsável por gerenciar o estado global da aplicação
 */
class DataManager {
    constructor() {
        this.state = {
            produtos: [],
            produtosFiltrados: [],
            metricas: {},
            filtros: {
                nome: '',
                preco: '',
                avaliacao: '',
                marca: '',
                vendas: '',
                bsrFaixa: '',
                bsrMin: '',
                bsrMax: '',
                tipo: '',
                posicao: ''
            },
            configuracao: {
                tema: 'light',
                autoBusca: true,
                maxPaginas: 5,
                delayEntrePaginas: 300
            },
            ui: {
                modalAberto: false,
                loading: false,
                progresso: 0
            }
        };
        
        this.listeners = new Map();
        this.historico = [];
    }

    // ===== GESTÃO DE ESTADO =====
    getState() {
        return { ...this.state };
    }

    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.notifyListeners(oldState, this.state);
    }

    updateState(path, value) {
        const pathArray = path.split('.');
        let current = this.state;
        
        for (let i = 0; i < pathArray.length - 1; i++) {
            current = current[pathArray[i]];
        }
        
        current[pathArray[pathArray.length - 1]] = value;
        this.notifyListeners(this.state, this.state);
    }

    // ===== GESTÃO DE PRODUTOS =====
    setProdutos(produtos) {
        this.state.produtos = produtos;
        this.state.produtosFiltrados = produtos;
        this.calcularMetricas();
        this.notifyListeners(this.state, this.state);
    }

    addProduto(produto) {
        this.state.produtos.push(produto);
        this.state.produtosFiltrados = [...this.state.produtos];
        this.calcularMetricas();
        this.notifyListeners(this.state, this.state);
    }

    updateProduto(index, produto) {
        if (index >= 0 && index < this.state.produtos.length) {
            this.state.produtos[index] = { ...this.state.produtos[index], ...produto };
            this.state.produtosFiltrados = [...this.state.produtos];
            this.calcularMetricas();
            this.notifyListeners(this.state, this.state);
        }
    }

    getProdutos() {
        return this.state.produtos;
    }

    getProdutosFiltrados() {
        return this.state.produtosFiltrados;
    }

    // ===== GESTÃO DE FILTROS =====
    setFiltros(filtros) {
        this.state.filtros = { ...this.state.filtros, ...filtros };
        this.aplicarFiltros();
    }

    limparFiltros() {
        this.state.filtros = {
            nome: '',
            preco: '',
            avaliacao: '',
            marca: '',
            vendas: '',
            bsrFaixa: '',
            bsrMin: '',
            bsrMax: '',
            tipo: '',
            posicao: ''
        };
        this.state.produtosFiltrados = [...this.state.produtos];
        this.notifyListeners(this.state, this.state);
    }

    aplicarFiltros() {
        let produtosFiltrados = [...this.state.produtos];

        // Filtro por nome
        if (this.state.filtros.nome) {
            produtosFiltrados = produtosFiltrados.filter(p => 
                p.titulo?.toLowerCase().includes(this.state.filtros.nome.toLowerCase())
            );
        }

        // Filtro por preço
        if (this.state.filtros.preco) {
            produtosFiltrados = produtosFiltrados.filter(p => 
                this.verificarFiltroPreco(p, this.state.filtros.preco)
            );
        }

        // Filtro por avaliação
        if (this.state.filtros.avaliacao) {
            const minAvaliacao = parseFloat(this.state.filtros.avaliacao);
            produtosFiltrados = produtosFiltrados.filter(p => 
                (p.avaliacaoNumerica || 0) >= minAvaliacao
            );
        }

        // Filtro por marca
        if (this.state.filtros.marca) {
            produtosFiltrados = produtosFiltrados.filter(p => 
                p.marca === this.state.filtros.marca
            );
        }

        // Filtro por BSR
        if (this.state.filtros.bsrFaixa) {
            produtosFiltrados = produtosFiltrados.filter(p => 
                this.verificarFiltroBSR(p, this.state.filtros.bsrFaixa)
            );
        }

        // Filtro por tipo
        if (this.state.filtros.tipo) {
            produtosFiltrados = produtosFiltrados.filter(p => 
                this.verificarFiltroTipo(p, this.state.filtros.tipo)
            );
        }

        // Filtro por posição
        if (this.state.filtros.posicao) {
            produtosFiltrados = produtosFiltrados.filter(p => 
                this.verificarFiltroPosicao(p, this.state.filtros.posicao)
            );
        }

        this.state.produtosFiltrados = produtosFiltrados;
        this.notifyListeners(this.state, this.state);
    }

    // ===== MÉTRICAS =====
    calcularMetricas() {
        const produtos = this.state.produtos;
        
        if (produtos.length === 0) {
            this.state.metricas = {};
            return;
        }

        const produtosComPreco = produtos.filter(p => p.precoNumerico > 0);
        const produtosComAvaliacao = produtos.filter(p => p.avaliacaoNumerica > 0);
        const produtosComVendas = produtos.filter(p => p.vendidos > 0);
        const produtosComRanking = produtos.filter(p => p.ranking);

        this.state.metricas = {
            totalProdutos: produtos.length,
            precoMedio: produtosComPreco.length > 0 ? 
                produtosComPreco.reduce((sum, p) => sum + p.precoNumerico, 0) / produtosComPreco.length : 0,
            mediaAvaliacao: produtosComAvaliacao.length > 0 ? 
                produtosComAvaliacao.reduce((sum, p) => sum + p.avaliacaoNumerica, 0) / produtosComAvaliacao.length : 0,
            mediaVendas: produtosComVendas.length > 0 ? 
                produtosComVendas.reduce((sum, p) => sum + p.vendidos, 0) / produtosComVendas.length : 0,
            mediaBSR: produtosComRanking.length > 0 ? 
                produtosComRanking.reduce((sum, p) => sum + parseInt(p.ranking), 0) / produtosComRanking.length : 0,
            produtosTop100: produtosComRanking.filter(p => parseInt(p.ranking) <= 100).length,
            produtosTop1000: produtosComRanking.filter(p => parseInt(p.ranking) <= 1000).length,
            produtosPatrocinados: produtos.filter(p => p.patrocinado).length,
            produtosOrganicos: produtos.filter(p => p.organico).length
        };
    }

    getMetricas() {
        return this.state.metricas;
    }

    // ===== HISTÓRICO =====
    adicionarAoHistorico(acao, dados) {
        this.historico.push({
            timestamp: new Date(),
            acao,
            dados
        });

        // Manter apenas os últimos 100 registros
        if (this.historico.length > 100) {
            this.historico = this.historico.slice(-100);
        }
    }

    getHistorico() {
        return [...this.historico];
    }

    // ===== EVENTOS =====
    subscribe(callback) {
        const id = Date.now() + Math.random();
        this.listeners.set(id, callback);
        return id;
    }

    unsubscribe(id) {
        this.listeners.delete(id);
    }

    notifyListeners(oldState, newState) {
        this.listeners.forEach(callback => {
            try {
                callback(oldState, newState);
            } catch (error) {
                console.error('Erro no listener:', error);
            }
        });
    }

    // ===== MÉTODOS AUXILIARES =====
    verificarFiltroPreco(produto, filtroPreco) {
        const preco = produto.precoNumerico || 0;
        
        if (filtroPreco === '1000+') {
            return preco >= 1000;
        }
        
        const [min, max] = filtroPreco.split('-').map(p => p === '+' ? Infinity : parseFloat(p));
        return preco >= min && preco <= max;
    }

    verificarFiltroBSR(produto, filtroBSR) {
        const ranking = parseInt(produto.ranking) || 0;
        
        if (filtroBSR === 'custom') {
            const min = parseInt(this.state.filtros.bsrMin) || 0;
            const max = parseInt(this.state.filtros.bsrMax) || Infinity;
            return ranking >= min && ranking <= max;
        }
        
        if (filtroBSR === '10000+') {
            return ranking >= 10000;
        }
        
        const [min, max] = filtroBSR.split('-').map(p => p === '+' ? Infinity : parseInt(p));
        return ranking >= min && ranking <= max;
    }

    verificarFiltroTipo(produto, filtroTipo) {
        if (filtroTipo === 'patrocinado') {
            return produto.patrocinado;
        } else if (filtroTipo === 'organico') {
            return produto.organico;
        }
        return true;
    }

    verificarFiltroPosicao(produto, filtroPosicao) {
        const posicao = produto.posicaoGlobal || produto.posicao || 0;
        
        if (filtroPosicao === '500+') {
            return posicao >= 500;
        }
        
        const [min, max] = filtroPosicao.split('-').map(p => p === '+' ? Infinity : parseInt(p));
        return posicao >= min && posicao <= max;
    }

    // ===== PERSISTÊNCIA =====
    salvarEstado() {
        try {
            const estadoParaSalvar = {
                produtos: this.state.produtos,
                filtros: this.state.filtros,
                configuracao: this.state.configuracao,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('amk-spy-estado', JSON.stringify(estadoParaSalvar));
            return true;
        } catch (error) {
            console.error('Erro ao salvar estado:', error);
            return false;
        }
    }

    carregarEstado() {
        try {
            const estadoSalvo = localStorage.getItem('amk-spy-estado');
            if (estadoSalvo) {
                const estado = JSON.parse(estadoSalvo);
                this.state.produtos = estado.produtos || [];
                this.state.produtosFiltrados = estado.produtos || [];
                this.state.filtros = { ...this.state.filtros, ...estado.filtros };
                this.state.configuracao = { ...this.state.configuracao, ...estado.configuracao };
                this.calcularMetricas();
                this.notifyListeners(this.state, this.state);
                return true;
            }
        } catch (error) {
            console.error('Erro ao carregar estado:', error);
        }
        return false;
    }

    limparEstado() {
        this.state.produtos = [];
        this.state.produtosFiltrados = [];
        this.state.metricas = {};
        this.limparFiltros();
        this.historico = [];
        localStorage.removeItem('amk-spy-estado');
        this.notifyListeners(this.state, this.state);
    }
}

// Instância global
window.DataManager = new DataManager(); 