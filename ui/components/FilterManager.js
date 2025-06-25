/**
 * FilterManager - Gerenciamento centralizado de filtros
 */
class FilterManager {
    constructor() {
        this.filtros = {
            nome: '',
            preco: '',
            avaliacao: '',
            marca: '',
            vendas: '',
            bsrFaixa: '',
            bsrMin: '',
            bsrMax: '',
            tipo: ''
        };
        this.produtos = [];
        this.marcasUnicas = [];
    }

    setProdutos(produtos) {
        this.produtos = produtos;
        this.marcasUnicas = this.getMarcasUnicas();
        this.popularFiltroMarcas();
    }

    getMarcasUnicas() {
        const marcas = new Set();
        this.produtos.forEach(produto => {
            if (produto.marca && produto.marca !== 'N/A') {
                marcas.add(produto.marca);
            }
        });
        return Array.from(marcas).sort();
    }

    popularFiltroMarcas() {
        const selectMarca = document.getElementById('filtro-marca');
        if (!selectMarca) return;

        // Manter a opção padrão
        selectMarca.innerHTML = '<option value="">🏷️ Todas as marcas</option>';
        
        this.marcasUnicas.forEach(marca => {
            const option = document.createElement('option');
            option.value = marca;
            option.textContent = marca;
            selectMarca.appendChild(option);
        });
    }

    aplicarFiltros() {
        this.atualizarFiltros();
        const produtosFiltrados = this.filtrarProdutos();
        TableManager.atualizarTabelaComFiltros(produtosFiltrados);
        this.atualizarContador(produtosFiltrados.length);
    }

    atualizarFiltros() {
        this.filtros = {
            nome: document.getElementById('busca-nome')?.value || '',
            preco: document.getElementById('filtro-preco')?.value || '',
            avaliacao: document.getElementById('filtro-avaliacao')?.value || '',
            marca: document.getElementById('filtro-marca')?.value || '',
            vendas: document.getElementById('filtro-vendas')?.value || '',
            bsrFaixa: document.getElementById('filtro-bsr-faixa')?.value || '',
            bsrMin: document.getElementById('filtro-bsr-min')?.value || '',
            bsrMax: document.getElementById('filtro-bsr-max')?.value || '',
            tipo: document.getElementById('filtro-tipo')?.value || ''
        };
    }

    filtrarProdutos() {
        return this.produtos.filter(produto => this.verificarFiltros(produto));
    }

    verificarFiltros(produto) {
        // Filtro por nome
        if (this.filtros.nome && !produto.titulo?.toLowerCase().includes(this.filtros.nome.toLowerCase())) {
            return false;
        }

        // Filtro por preço
        if (this.filtros.preco && !this.verificarFiltroPreco(produto)) {
            return false;
        }

        // Filtro por avaliação
        if (this.filtros.avaliacao && !this.verificarFiltroAvaliacao(produto)) {
            return false;
        }

        // Filtro por marca
        if (this.filtros.marca && produto.marca !== this.filtros.marca) {
            return false;
        }

        // Filtro por vendas
        if (this.filtros.vendas && !this.verificarFiltroVendas(produto)) {
            return false;
        }

        // Filtro por BSR
        if (this.filtros.bsrFaixa && !this.verificarFiltroBSR(produto)) {
            return false;
        }

        // Filtro por tipo
        if (this.filtros.tipo && !this.verificarFiltroTipo(produto)) {
            return false;
        }

        return true;
    }

    verificarFiltroPreco(produto) {
        const preco = produto.precoNumerico || 0;
        const [min, max] = this.filtros.preco.split('-').map(p => p === '+' ? Infinity : parseFloat(p));
        
        if (this.filtros.preco === '1000+') {
            return preco >= 1000;
        }
        
        return preco >= min && preco <= max;
    }

    verificarFiltroAvaliacao(produto) {
        const avaliacao = produto.avaliacaoNumerica || 0;
        const minAvaliacao = parseFloat(this.filtros.avaliacao);
        return avaliacao >= minAvaliacao;
    }

    verificarFiltroVendas(produto) {
        const vendidos = produto.vendidos || 0;
        
        if (this.filtros.vendas === 'mais-vendidos') {
            // Ordenação será aplicada depois
            return true;
        } else if (this.filtros.vendas === 'menos-vendidos') {
            // Ordenação será aplicada depois
            return true;
        }
        
        return true;
    }

    verificarFiltroBSR(produto) {
        const ranking = parseInt(produto.ranking) || 0;
        
        if (this.filtros.bsrFaixa === 'custom') {
            const min = parseInt(this.filtros.bsrMin) || 0;
            const max = parseInt(this.filtros.bsrMax) || Infinity;
            return ranking >= min && ranking <= max;
        }
        
        const [min, max] = this.filtros.bsrFaixa.split('-').map(p => p === '+' ? Infinity : parseInt(p));
        return ranking >= min && ranking <= max;
    }

    verificarFiltroTipo(produto) {
        const patrocinado = produto.patrocinado || false;
        const organico = produto.organico || false;
        
        if (this.filtros.tipo === 'patrocinado') {
            return patrocinado;
        } else if (this.filtros.tipo === 'organico') {
            return organico;
        }
        
        return true;
    }

    aplicarOrdenacao(produtos) {
        if (this.filtros.vendas === 'mais-vendidos') {
            return produtos.sort((a, b) => (b.vendidos || 0) - (a.vendidos || 0));
        } else if (this.filtros.vendas === 'menos-vendidos') {
            return produtos.sort((a, b) => (a.vendidos || 0) - (b.vendidos || 0));
        }
        
        return produtos;
    }

    limparFiltros() {
        // Limpar campos
        const campos = [
            'busca-nome', 'filtro-preco', 'filtro-avaliacao', 'filtro-marca',
            'filtro-vendas', 'filtro-bsr-faixa', 'filtro-bsr-min', 'filtro-bsr-max', 'filtro-tipo'
        ];
        
        campos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (elemento.tagName === 'SELECT') {
                    elemento.selectedIndex = 0;
                } else {
                    elemento.value = '';
                }
            }
        });

        // Ocultar campo customizado BSR
        const customBSR = document.getElementById('filtro-bsr-custom');
        if (customBSR) {
            customBSR.style.display = 'none';
        }

        // Resetar filtros
        this.filtros = {
            nome: '', preco: '', avaliacao: '', marca: '', vendas: '',
            bsrFaixa: '', bsrMin: '', bsrMax: '', tipo: ''
        };

        // Atualizar tabela
        TableManager.atualizarTabelaComFiltros(this.produtos);
        this.atualizarContador(this.produtos.length);
    }

    atualizarContador(quantidade) {
        const contador = document.querySelector('#amazon-analyzer-modal span[style*="opacity: 0.9"]');
        if (contador) {
            contador.textContent = `${quantidade} produtos`;
        }
    }

    configurarEventos() {
        // Evento para campo customizado BSR
        const filtroBSRFaixa = document.getElementById('filtro-bsr-faixa');
        if (filtroBSRFaixa) {
            filtroBSRFaixa.addEventListener('change', (e) => {
                const customBSR = document.getElementById('filtro-bsr-custom');
                if (customBSR) {
                    customBSR.style.display = e.target.value === 'custom' ? 'flex' : 'none';
                }
            });
        }

        // Eventos para aplicar filtros automaticamente
        const camposFiltro = [
            'busca-nome', 'filtro-preco', 'filtro-avaliacao', 'filtro-marca',
            'filtro-vendas', 'filtro-bsr-faixa', 'filtro-bsr-min', 'filtro-bsr-max', 'filtro-tipo'
        ];

        camposFiltro.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('change', () => this.aplicarFiltros());
                if (elemento.tagName === 'INPUT') {
                    elemento.addEventListener('input', () => this.aplicarFiltros());
                }
            }
        });
    }
}

window.FilterManager = FilterManager; 