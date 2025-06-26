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
            tipo: '',
            posicao: ''
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

    atualizarMarcas() {
        this.marcasUnicas = this.getMarcasUnicas();
        this.popularFiltroMarcas();
    }

    aplicarFiltros() {
        console.log('🔄 FilterManager.aplicarFiltros() iniciado');
        console.log('📦 Produtos disponíveis:', this.produtos.length);
        
        this.atualizarFiltros();
        console.log('🔍 Filtros atualizados:', this.filtros);
        
        let produtosFiltrados = this.filtrarProdutos();
        console.log('✅ Produtos filtrados:', produtosFiltrados.length);
        
        // Aplicar ordenação se necessário
        produtosFiltrados = this.aplicarOrdenacao(produtosFiltrados);
        
        // Atualizar tabela
        TableManager.atualizarTabelaComFiltros(produtosFiltrados);
        this.atualizarContador(produtosFiltrados.length);
        
        // Sincronizar estatísticas com os filtros aplicados
        if (window.StatsManager) {
            console.log('📊 Sincronizando estatísticas com', produtosFiltrados.length, 'produtos filtrados');
            window.StatsManager.sincronizarComFiltros(produtosFiltrados);
        } else {
            console.warn('⚠️ StatsManager não disponível');
        }
        
        console.log('✅ FilterManager.aplicarFiltros() concluído');
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
            tipo: document.getElementById('filtro-tipo')?.value || '',
            posicao: document.getElementById('filtro-posicao')?.value || ''
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

        // Filtro por posição na pesquisa
        if (this.filtros.posicao && !this.verificarFiltroPosicao(produto)) {
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
        
        // Se não há filtro de tipo, mostrar todos
        return true;
    }

    verificarFiltroPosicao(produto) {
        const posicao = produto.posicaoGlobal || produto.posicao || 0;
        
        if (this.filtros.posicao === '500+') {
            return posicao >= 500;
        }
        
        const [min, max] = this.filtros.posicao.split('-').map(p => p === '+' ? Infinity : parseInt(p));
        return posicao >= min && posicao <= max;
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
        console.log('🧹 Limpando filtros...');
        
        // Limpar campos
        const campos = [
            'busca-nome', 'filtro-preco', 'filtro-avaliacao', 'filtro-marca',
            'filtro-vendas', 'filtro-bsr-faixa', 'filtro-bsr-min', 'filtro-bsr-max', 'filtro-tipo', 'filtro-posicao'
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
            bsrFaixa: '', bsrMin: '', bsrMax: '', tipo: '', posicao: ''
        };

        // Atualizar tabela com todos os produtos
        if (this.produtos && this.produtos.length > 0) {
            TableManager.atualizarTabelaComFiltros(this.produtos);
            this.atualizarContador(this.produtos.length);
            
            // Sincronizar estatísticas quando filtros são limpos
            if (window.StatsManager) {
                window.StatsManager.sincronizarComFiltros(this.produtos);
            }
            
            NotificationManager.sucesso('Filtros limpos!');
        } else {
            console.warn('⚠️ Nenhum produto disponível para limpar filtros');
        }
    }

    atualizarContador(quantidade) {
        // Usar o seletor correto para o contador
        const contador = document.querySelector('.contador-produtos');
        
        if (contador) {
            contador.textContent = `${quantidade} produtos`;
            console.log('✅ Contador atualizado:', quantidade);
        } else {
            console.warn('⚠️ Contador não encontrado');
        }
    }

    configurarEventos() {
        console.log('🔧 FilterManager: Configurando eventos...');
        
        // Evento para campo customizado BSR
        const filtroBSRFaixa = document.getElementById('filtro-bsr-faixa');
        if (filtroBSRFaixa) {
            filtroBSRFaixa.addEventListener('change', (e) => {
                const customBSR = document.getElementById('filtro-bsr-custom');
                if (customBSR) {
                    customBSR.style.display = e.target.value === 'custom' ? 'flex' : 'none';
                }
            });
            console.log('✅ Evento BSR customizado configurado');
        }

        // Eventos para aplicar filtros automaticamente
        const camposFiltro = [
            'busca-nome', 'filtro-preco', 'filtro-avaliacao', 'filtro-marca',
            'filtro-vendas', 'filtro-bsr-faixa', 'filtro-bsr-min', 'filtro-bsr-max', 'filtro-tipo', 'filtro-posicao'
        ];

        let eventosConfigurados = 0;
        camposFiltro.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                // Remover eventos anteriores se existirem
                elemento.removeEventListener('change', this.aplicarFiltros);
                elemento.removeEventListener('input', this.aplicarFiltros);
                
                // Adicionar novos eventos com bind correto
                const handlerChange = () => {
                    console.log(`🔄 Filtro ${id} alterado, aplicando filtros...`);
                    this.aplicarFiltros();
                };
                
                const handlerInput = () => {
                    console.log(`🔄 Input ${id} alterado, aplicando filtros...`);
                    this.aplicarFiltros();
                };
                
                elemento.addEventListener('change', handlerChange.bind(this));
                
                if (elemento.tagName === 'INPUT') {
                    elemento.addEventListener('input', handlerInput.bind(this));
                }
                eventosConfigurados++;
            } else {
                console.warn(`⚠️ Elemento ${id} não encontrado`);
            }
        });
        
        console.log(`✅ FilterManager: ${eventosConfigurados} eventos configurados com sucesso`);
        
        // Testar um filtro automaticamente para debug
        setTimeout(() => {
            console.log('🔍 Teste: Aplicando filtros automaticamente...');
            this.aplicarFiltros();
        }, 500);
    }

    // Método de teste para debug
    testarFiltros() {
        console.log('🧪 Testando filtros:');
        console.log('  - Produtos:', this.produtos.length);
        console.log('  - Filtros ativos:', this.filtros);
        console.log('  - DOM filtros:', {
            'busca-nome': document.getElementById('busca-nome')?.value,
            'filtro-preco': document.getElementById('filtro-preco')?.value,
            'filtro-marca': document.getElementById('filtro-marca')?.value
        });
        this.aplicarFiltros();
    }

    static criarFiltros() {
        return `
            <div style="
                background: var(--bg-secondary);
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid var(--border-light);
            ">
                <h3 style="
                    margin: 0 0 15px 0;
                    font-size: 16px;
                    color: var(--text-primary);
                    font-weight: 600;
                ">🔍 Filtros Avançados</h3>
                
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                ">
                    <!-- Busca por nome -->
                    <div>
                        <label style="
                            display: block;
                            margin-bottom: 5px;
                            font-size: 12px;
                            color: var(--text-secondary);
                            font-weight: 500;
                        ">🔍 Buscar por nome</label>
                        <input type="text" id="busca-nome" placeholder="Digite o nome do produto..." style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-light);
                            border-radius: 6px;
                            font-size: 12px;
                            background: var(--bg-primary);
                            color: var(--text-primary);
                        ">
                    </div>

                    <!-- Filtro de preço -->
                    <div>
                        <label style="
                            display: block;
                            margin-bottom: 5px;
                            font-size: 12px;
                            color: var(--text-secondary);
                            font-weight: 500;
                        ">💰 Faixa de preço</label>
                        <select id="filtro-preco" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-light);
                            border-radius: 6px;
                            font-size: 12px;
                            background: var(--bg-primary);
                            color: var(--text-primary);
                        ">
                            <option value="">💵 Todos os preços</option>
                            <option value="0-50">R$ 0 - R$ 50</option>
                            <option value="50-100">R$ 50 - R$ 100</option>
                            <option value="100-200">R$ 100 - R$ 200</option>
                            <option value="200-500">R$ 200 - R$ 500</option>
                            <option value="500-1000">R$ 500 - R$ 1000</option>
                            <option value="1000+">R$ 1000+</option>
                        </select>
                    </div>

                    <!-- Filtro de avaliação -->
                    <div>
                        <label style="
                            display: block;
                            margin-bottom: 5px;
                            font-size: 12px;
                            color: var(--text-secondary);
                            font-weight: 500;
                        ">⭐ Avaliação mínima</label>
                        <select id="filtro-avaliacao" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-light);
                            border-radius: 6px;
                            font-size: 12px;
                            background: var(--bg-primary);
                            color: var(--text-primary);
                        ">
                            <option value="">⭐ Todas as avaliações</option>
                            <option value="4">4+ estrelas</option>
                            <option value="4.5">4.5+ estrelas</option>
                            <option value="5">5 estrelas</option>
                        </select>
                    </div>

                    <!-- Filtro de marca -->
                    <div>
                        <label style="
                            display: block;
                            margin-bottom: 5px;
                            font-size: 12px;
                            color: var(--text-secondary);
                            font-weight: 500;
                        ">🏷️ Marca</label>
                        <select id="filtro-marca" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-light);
                            border-radius: 6px;
                            font-size: 12px;
                            background: var(--bg-primary);
                            color: var(--text-primary);
                        ">
                            <option value="">🏷️ Todas as marcas</option>
                        </select>
                    </div>

                    <!-- Filtro de vendas -->
                    <div>
                        <label style="
                            display: block;
                            margin-bottom: 5px;
                            font-size: 12px;
                            color: var(--text-secondary);
                            font-weight: 500;
                        ">📈 Ordenar por vendas</label>
                        <select id="filtro-vendas" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-light);
                            border-radius: 6px;
                            font-size: 12px;
                            background: var(--bg-primary);
                            color: var(--text-primary);
                        ">
                            <option value="">📊 Ordem padrão</option>
                            <option value="mais-vendidos">🔥 Mais vendidos</option>
                            <option value="menos-vendidos">❄️ Menos vendidos</option>
                        </select>
                    </div>

                    <!-- Filtro de BSR -->
                    <div>
                        <label style="
                            display: block;
                            margin-bottom: 5px;
                            font-size: 12px;
                            color: var(--text-secondary);
                            font-weight: 500;
                        ">🏆 Ranking BSR</label>
                        <select id="filtro-bsr-faixa" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-light);
                            border-radius: 6px;
                            font-size: 12px;
                            background: var(--bg-primary);
                            color: var(--text-primary);
                        ">
                            <option value="">🏆 Todos os rankings</option>
                            <option value="1-100">🥇 Top 100</option>
                            <option value="1-1000">🥈 Top 1000</option>
                            <option value="1-5000">🥉 Top 5000</option>
                            <option value="101-1000">📊 101-1000</option>
                            <option value="1001-10000">📈 1001-10000</option>
                            <option value="10000+">📉 10000+</option>
                            <option value="custom">⚙️ Personalizado</option>
                        </select>
                    </div>

                    <!-- Filtro de tipo -->
                    <div>
                        <label style="
                            display: block;
                            margin-bottom: 5px;
                            font-size: 12px;
                            color: var(--text-secondary);
                            font-weight: 500;
                        ">🎯 Tipo de produto</label>
                        <select id="filtro-tipo" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-light);
                            border-radius: 6px;
                            font-size: 12px;
                            background: var(--bg-primary);
                            color: var(--text-primary);
                        ">
                            <option value="">🎯 Todos os tipos</option>
                            <option value="patrocinado">💰 Patrocinados</option>
                            <option value="organico">🎯 Orgânicos</option>
                        </select>
                    </div>

                    <!-- Filtro de posição na pesquisa -->
                    <div>
                        <label style="
                            display: block;
                            margin-bottom: 5px;
                            font-size: 12px;
                            color: var(--text-secondary);
                            font-weight: 500;
                        ">🏆 Posição na pesquisa</label>
                        <select id="filtro-posicao" style="
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid var(--border-light);
                            border-radius: 6px;
                            font-size: 12px;
                            background: var(--bg-primary);
                            color: var(--text-primary);
                        ">
                            <option value="">🏆 Todas as posições</option>
                            <option value="1-10">🥇 Top 10</option>
                            <option value="1-50">🥈 Top 50</option>
                            <option value="1-100">🥉 Top 100</option>
                            <option value="11-50">📊 11-50</option>
                            <option value="51-100">📈 51-100</option>
                            <option value="101-500">📉 101-500</option>
                            <option value="500+">🔻 500+</option>
                        </select>
                    </div>
                </div>

                <!-- Campo customizado BSR -->
                <div id="filtro-bsr-custom" style="
                    display: none;
                    margin-top: 15px;
                    padding: 15px;
                    background: var(--bg-primary);
                    border-radius: 8px;
                    border: 1px solid var(--border-light);
                ">
                    <h4 style="
                        margin: 0 0 10px 0;
                        font-size: 14px;
                        color: var(--text-primary);
                        font-weight: 600;
                    ">⚙️ Ranking personalizado</h4>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="flex: 1;">
                            <label style="
                                display: block;
                                margin-bottom: 5px;
                                font-size: 11px;
                                color: var(--text-secondary);
                            ">Mínimo</label>
                            <input type="number" id="filtro-bsr-min" placeholder="1" style="
                                width: 100%;
                                padding: 6px 10px;
                                border: 1px solid var(--border-light);
                                border-radius: 4px;
                                font-size: 11px;
                                background: var(--bg-primary);
                                color: var(--text-primary);
                            ">
                        </div>
                        <div style="flex: 1;">
                            <label style="
                                display: block;
                                margin-bottom: 5px;
                                font-size: 11px;
                                color: var(--text-secondary);
                            ">Máximo</label>
                            <input type="number" id="filtro-bsr-max" placeholder="1000" style="
                                width: 100%;
                                padding: 6px 10px;
                                border: 1px solid var(--border-light);
                                border-radius: 4px;
                                font-size: 11px;
                                background: var(--bg-primary);
                                color: var(--text-primary);
                            ">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

window.FilterManager = FilterManager; 