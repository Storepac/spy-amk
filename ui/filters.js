class FilterManagerLegacy {
    constructor() {
        this.filters = {
            preco: '',
            avaliacao: '',
            marca: '',
            bsrTipo: '',
            bsrFaixa: '',
            bsrMin: '',
            bsrMax: '',
            patrocinado: '',
            vendas: ''
        };
        this.produtosOriginais = [];
        this.produtosFiltrados = [];
    }

    setProdutosOriginais(produtos) {
        this.produtosOriginais = produtos;
        this.produtosFiltrados = [...produtos];
    }

    aplicarFiltros() {
        this.produtosFiltrados = this.produtosOriginais.filter(produto => {
            return this.aplicarFiltroPreco(produto) &&
                   this.aplicarFiltroAvaliacao(produto) &&
                   this.aplicarFiltroMarca(produto) &&
                   this.aplicarFiltroBSR(produto) &&
                   this.aplicarFiltroPatrocinado(produto);
        });

        // Aplicar ordenação por vendas se especificado
        if (this.filters.vendas) {
            this.aplicarFiltroVendas();
        }

        return this.produtosFiltrados;
    }

    aplicarFiltroPreco(produto) {
        if (!this.filters.preco) return true;
        
        const preco = produto.precoNumerico || 0;
        switch(this.filters.preco) {
            case '0-50':
                return preco >= 0 && preco <= 50;
            case '50-100':
                return preco > 50 && preco <= 100;
            case '100-200':
                return preco > 100 && preco <= 200;
            case '200-500':
                return preco > 200 && preco <= 500;
            case '500+':
                return preco > 500;
            default:
                return true;
        }
    }

    aplicarFiltroAvaliacao(produto) {
        if (!this.filters.avaliacao) return true;
        
        const avaliacao = produto.avaliacaoNumerica || 0;
        switch(this.filters.avaliacao) {
            case '4+':
                return avaliacao >= 4;
            case '4.5+':
                return avaliacao >= 4.5;
            case '5':
                return avaliacao === 5;
            default:
                return true;
        }
    }

    aplicarFiltroMarca(produto) {
        if (!this.filters.marca) return true;
        return produto.marca === this.filters.marca;
    }

    aplicarFiltroBSR(produto) {
        if (!this.filters.bsrFaixa) return true;
        
        // Buscar rankings do produto
        const rankings = produto.infoVendas?.rankings || [];
        
        // Se não tem rankings, usar dados antigos
        if (rankings.length === 0) {
            const bsrEspecifico = produto.infoVendas?.bsrEspecifico;
            const bsrGeral = produto.infoVendas?.bsrGeral;
            const bsr = bsrEspecifico || bsrGeral || produto.ranking;
            
            if (!bsr) return true;
            
            return this.verificarFaixaBSR(bsr);
        }
        
        // Filtrar por tipo de ranking
        let rankingsFiltrados = rankings;
        if (this.filters.bsrTipo) {
            rankingsFiltrados = rankings.filter(r => r.tipo === this.filters.bsrTipo);
        }
        
        // Se não tem rankings do tipo especificado, não passa no filtro
        if (rankingsFiltrados.length === 0) return false;
        
        // Verificar se pelo menos um ranking passa na faixa
        return rankingsFiltrados.some(ranking => {
            const posicao = ranking.posicao || ranking.ranking;
            return this.verificarFaixaBSR(posicao);
        });
    }
    
    verificarFaixaBSR(posicao) {
        if (!this.filters.bsrFaixa) return true;
        
        // Converter posição para número
        const posicaoNum = parseInt(posicao) || 0;
        if (posicaoNum === 0) return true; // Se não tem BSR, não filtrar
        
        switch(this.filters.bsrFaixa) {
            case '1-100':
                return posicaoNum >= 1 && posicaoNum <= 100;
            case '1-1000':
                return posicaoNum >= 1 && posicaoNum <= 1000;
            case '1-5000':
                return posicaoNum >= 1 && posicaoNum <= 5000;
            case '101-1000':
                return posicaoNum >= 101 && posicaoNum <= 1000;
            case '1001-10000':
                return posicaoNum >= 1001 && posicaoNum <= 10000;
            case '10000+':
                return posicaoNum > 10000;
            case 'custom':
                const min = parseInt(this.filters.bsrMin) || 1;
                const max = parseInt(this.filters.bsrMax) || Infinity;
                return posicaoNum >= min && posicaoNum <= max;
            default:
                return true;
        }
    }

    aplicarFiltroPatrocinado(produto) {
        if (!this.filters.patrocinado) return true;
        
        // Verificar se o produto aparece como orgânico e patrocinado
        const isPatrocinado = produto.patrocinado === true;
        const isOrganico = produto.patrocinado === false;
        const isAmbos = produto.patrocinado === true && produto.organico === true;
        
        switch(this.filters.patrocinado) {
            case 'patrocinado':
                return isPatrocinado || isAmbos;
            case 'organico':
                return isOrganico || isAmbos;
            default:
                return true;
        }
    }

    aplicarFiltroVendas() {
        if (!this.filters.vendas) return;
        
        console.log('🔄 Aplicando filtro de vendas:', this.filters.vendas);
        console.log('📊 Produtos antes da ordenação:', this.produtosFiltrados.length);
        
        this.produtosFiltrados.sort((a, b) => {
            const vendasA = parseInt(a.vendidos) || 0;
            const vendasB = parseInt(b.vendidos) || 0;
            
            console.log(`📈 Comparando: ${a.titulo} (${vendasA}) vs ${b.titulo} (${vendasB})`);
            
            switch(this.filters.vendas) {
                case 'mais-vendidos':
                    return vendasB - vendasA; // Decrescente
                case 'menos-vendidos':
                    return vendasA - vendasB; // Crescente
                default:
                    return 0;
            }
        });
        
        console.log('✅ Ordenação por vendas aplicada');
        console.log('📊 Primeiros 3 produtos após ordenação:');
        this.produtosFiltrados.slice(0, 3).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.titulo}: ${p.vendidos} vendas`);
        });
    }

    atualizarFiltro(tipo, valor) {
        this.filters[tipo] = valor;
    }

    limparFiltros() {
        this.filters = {
            preco: '',
            avaliacao: '',
            marca: '',
            bsrTipo: '',
            bsrFaixa: '',
            bsrMin: '',
            bsrMax: '',
            patrocinado: '',
            vendas: ''
        };
        this.produtosFiltrados = [...this.produtosOriginais];
    }

    getProdutosFiltrados() {
        return this.produtosFiltrados;
    }

    getMarcasUnicas() {
        const marcas = new Set();
        this.produtosOriginais.forEach(produto => {
            if (produto.marca && produto.marca !== 'N/A') {
                marcas.add(produto.marca);
            }
        });
        return Array.from(marcas).sort();
    }

    atualizarMarcas() {
        const selectMarca = document.getElementById('filtro-marca');
        if (!selectMarca) return;

        const marcasUnicas = this.getMarcasUnicas();
        
        // Manter a opção padrão
        selectMarca.innerHTML = '<option value="">🏷️ Todas as marcas</option>';
        
        marcasUnicas.forEach(marca => {
            const option = document.createElement('option');
            option.value = marca;
            option.textContent = marca;
            selectMarca.appendChild(option);
        });
    }
}

window.FilterManagerLegacy = FilterManagerLegacy; 