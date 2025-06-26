/**
 * TableComponent - Componente de tabela refatorado
 * Responsável por renderizar e gerenciar a tabela de produtos
 */
class TableComponent {
    constructor() {
        this.dataManager = window.DataManager;
        this.uiManager = window.UIManager;
        this.container = null;
        this.isRendered = false;
        
        // Bind methods
        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleCopyASIN = this.handleCopyASIN.bind(this);
        this.handleBSRClick = this.handleBSRClick.bind(this);
    }

    // ===== INICIALIZAÇÃO =====
    async initialize() {
        try {
            console.log('🔧 Inicializando TableComponent...');
            
            // Registrar listener para mudanças de estado
            this.dataManager.subscribe(this.handleStateChange);
            
            // Criar container se não existir
            this.createContainer();
            
            console.log('✅ TableComponent inicializado');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar TableComponent:', error);
            throw error;
        }
    }

    // ===== RENDERIZAÇÃO =====
    render() {
        if (!this.container) {
            this.createContainer();
        }

        const produtos = this.dataManager.getProdutosFiltrados();
        const metricas = this.dataManager.getMetricas();
        
        this.container.innerHTML = this.generateHTML(produtos, metricas);
        this.setupEventListeners();
        
        this.isRendered = true;
        console.log(`📊 Tabela renderizada com ${produtos.length} produtos`);
    }

    generateHTML(produtos, metricas) {
        return `
            <div class="table-container">
                ${this.generateHeader(produtos, metricas)}
                ${this.generateFilters()}
                ${this.generateTable(produtos)}
            </div>
        `;
    }

    generateHeader(produtos, metricas) {
        return `
            <div class="table-header">
                <div class="header-stats">
                    <div class="stat-item">
                        <span class="stat-label">📊 Produtos</span>
                        <span class="stat-value">${produtos.length}</span>
                    </div>
                    ${metricas.precoMedio ? `
                        <div class="stat-item">
                            <span class="stat-label">💰 Preço Médio</span>
                            <span class="stat-value">R$ ${metricas.precoMedio.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    ${metricas.mediaAvaliacao ? `
                        <div class="stat-item">
                            <span class="stat-label">⭐ Avaliação Média</span>
                            <span class="stat-value">${metricas.mediaAvaliacao.toFixed(1)}</span>
                        </div>
                    ` : ''}
                    ${metricas.produtosTop100 ? `
                        <div class="stat-item">
                            <span class="stat-label">🏆 Top 100 BSR</span>
                            <span class="stat-value">${metricas.produtosTop100}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="btn-limpar-filtros" title="Limpar filtros">
                        🗑️ Limpar
                    </button>
                    <button class="btn btn-primary" id="btn-exportar-dados" title="Exportar dados">
                        📊 Exportar
                    </button>
                </div>
            </div>
        `;
    }

    generateFilters() {
        return `
            <div class="filters-container">
                <div class="filters-grid">
                    <div class="filter-group">
                        <label for="busca-nome">🔍 Buscar por nome</label>
                        <input type="text" id="busca-nome" placeholder="Digite o nome do produto...">
                    </div>
                    <div class="filter-group">
                        <label for="filtro-preco">💰 Faixa de preço</label>
                        <select id="filtro-preco">
                            <option value="">💵 Todos os preços</option>
                            <option value="0-50">R$ 0 - R$ 50</option>
                            <option value="50-100">R$ 50 - R$ 100</option>
                            <option value="100-200">R$ 100 - R$ 200</option>
                            <option value="200-500">R$ 200 - R$ 500</option>
                            <option value="500-1000">R$ 500 - R$ 1000</option>
                            <option value="1000+">R$ 1000+</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filtro-avaliacao">⭐ Avaliação mínima</label>
                        <select id="filtro-avaliacao">
                            <option value="">⭐ Todas as avaliações</option>
                            <option value="4">4+ estrelas</option>
                            <option value="4.5">4.5+ estrelas</option>
                            <option value="5">5 estrelas</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filtro-marca">🏷️ Marca</label>
                        <select id="filtro-marca">
                            <option value="">🏷️ Todas as marcas</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filtro-bsr">🏆 Ranking BSR</label>
                        <select id="filtro-bsr-faixa">
                            <option value="">🏆 Todos os rankings</option>
                            <option value="1-100">🥇 Top 100</option>
                            <option value="1-1000">🥈 Top 1000</option>
                            <option value="1-5000">🥉 Top 5000</option>
                            <option value="101-1000">📊 101-1000</option>
                            <option value="1001-10000">📈 1001-10000</option>
                            <option value="10000+">📉 10000+</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filtro-posicao">🏆 Posição na pesquisa</label>
                        <select id="filtro-posicao">
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
            </div>
        `;
    }

    generateTable(produtos) {
        if (produtos.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>Nenhum produto encontrado</h3>
                    <p>Tente ajustar os filtros ou fazer uma nova busca</p>
                </div>
            `;
        }

        return `
            <div class="table-wrapper">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th title="Posição na pesquisa da Amazon">🏆 Posição</th>
                            <th>🖼️ Imagem</th>
                            <th>📝 Título</th>
                            <th>🔢 ASIN</th>
                            <th>🏷️ Marca</th>
                            <th>💰 Preço</th>
                            <th>⭐ Avaliação</th>
                            <th>📊 # Aval.</th>
                            <th>📈 Vendidos</th>
                            <th>💵 Receita</th>
                            <th>🏆 BSR</th>
                            <th>📂 Categoria</th>
                            <th>🎯 Tipo</th>
                            <th>📄 Página</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${produtos.map((produto, index) => this.generateTableRow(produto, index)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    generateTableRow(produto, index) {
        const asinDuplicado = this.verificarASINDuplicado(produto.asin);
        const posicao = produto.posicaoGlobal || produto.posicao || (index + 1);
        const paginaOrigem = produto.paginaOrigem || 1;
        const posicaoNaPagina = produto.posicaoNaPagina || (index + 1);

        return `
            <tr class="product-row ${asinDuplicado ? 'duplicate' : ''}" data-asin="${produto.asin}" data-index="${index}">
                <td class="position-cell ${this.getPositionClass(posicao)}" title="Página ${paginaOrigem}, posição ${posicaoNaPagina} na página">
                    <div class="position-content">
                        <div class="position-main">${this.getPositionIcon(posicao)} ${posicao}</div>
                        ${paginaOrigem > 1 ? `<div class="position-detail">P${paginaOrigem}:${posicaoNaPagina}</div>` : ''}
                    </div>
                </td>
                <td class="image-cell">
                    <img src="${produto.imagem || this.getDefaultImage()}" alt="Produto" class="product-image" onerror="this.src='${this.getDefaultImage()}'">
                </td>
                <td class="title-cell">
                    <a href="${produto.link || '#'}" target="_blank" class="product-title" title="${produto.titulo || 'Título não disponível'}">
                        ${produto.titulo || 'Título não disponível'}
                    </a>
                </td>
                <td class="asin-cell">
                    <button class="btn-copy-asin ${asinDuplicado ? 'duplicate' : ''}" data-asin="${produto.asin || 'N/A'}" title="${asinDuplicado ? 'ASIN duplicado detectado!' : 'Clique para copiar ASIN'}">
                        ${asinDuplicado ? '⚠️ ' : ''}${produto.asin || 'N/A'}
                    </button>
                </td>
                <td class="brand-cell">${produto.marca || 'N/A'}</td>
                <td class="price-cell">${produto.preco || 'N/A'}</td>
                <td class="rating-cell">
                    <div class="rating-content">
                        <div class="rating-value">${produto.avaliacao || 'N/A'}</div>
                        <div class="rating-stars">${this.generateStars(produto.avaliacaoNumerica || 0)}</div>
                    </div>
                </td>
                <td class="reviews-cell">${produto.numAvaliacoes || 'N/A'}</td>
                <td class="sales-cell">${this.formatNumber(produto.vendidos)}</td>
                <td class="revenue-cell">R$ ${this.formatCurrency(produto.receitaMes || 0)}</td>
                <td class="bsr-cell" title="Clique para ver detalhes do ranking">
                    ${produto.ranking || 'N/A'}
                </td>
                <td class="category-cell" title="${produto.categoria || 'N/A'}">${produto.categoria || 'N/A'}</td>
                <td class="type-cell">
                    <span class="type-badge ${produto.patrocinado ? 'sponsored' : 'organic'}">
                        ${produto.patrocinado ? '💰 Patrocinado' : '🎯 Orgânico'}
                    </span>
                </td>
                <td class="page-cell">${paginaOrigem}</td>
            </tr>
        `;
    }

    // ===== EVENTOS =====
    setupEventListeners() {
        // Botões de ação
        this.setupActionButtons();
        
        // Filtros
        this.setupFilters();
        
        // Eventos da tabela
        this.setupTableEvents();
    }

    setupActionButtons() {
        const btnLimparFiltros = this.container.querySelector('#btn-limpar-filtros');
        const btnExportarDados = this.container.querySelector('#btn-exportar-dados');

        if (btnLimparFiltros) {
            btnLimparFiltros.addEventListener('click', () => {
                this.dataManager.limparFiltros();
                this.uiManager.showNotification('Filtros limpos!', 'success');
            });
        }

        if (btnExportarDados) {
            btnExportarDados.addEventListener('click', () => {
                this.handleExport();
            });
        }
    }

    setupFilters() {
        const filterInputs = this.container.querySelectorAll('input[id^="busca"], select[id^="filtro"]');
        
        filterInputs.forEach(input => {
            const debouncedHandler = this.uiManager.debounce(() => {
                this.updateFilters();
            }, 300);

            if (input.tagName === 'INPUT') {
                input.addEventListener('input', debouncedHandler);
            } else {
                input.addEventListener('change', debouncedHandler);
            }
        });
    }

    setupTableEvents() {
        // Eventos de cópia ASIN
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-copy-asin')) {
                e.preventDefault();
                e.stopPropagation();
                this.handleCopyASIN(e.target);
            }
        });

        // Eventos de BSR
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.bsr-cell')) {
                e.preventDefault();
                e.stopPropagation();
                this.handleBSRClick(e.target.closest('.bsr-cell'));
            }
        });
    }

    // ===== HANDLERS =====
    handleStateChange(oldState, newState) {
        if (oldState.produtosFiltrados !== newState.produtosFiltrados) {
            this.render();
        }
    }

    async handleCopyASIN(button) {
        const asin = button.getAttribute('data-asin');
        
        if (!asin || asin === 'N/A') {
            this.uiManager.showNotification('ASIN inválido para copiar.', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(asin);
            this.uiManager.showNotification(`ASIN ${asin} copiado!`, 'success');
            
            // Feedback visual
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            
        } catch (error) {
            console.error('Erro ao copiar ASIN:', error);
            this.uiManager.showNotification('Erro ao copiar ASIN. Tente novamente.', 'error');
        }
    }

    handleBSRClick(cell) {
        const ranking = cell.textContent.trim();
        const rankingNumerico = parseInt(ranking) || 0;
        
        let mensagem = '';
        let cor = '#6b7280';
        
        if (rankingNumerico > 0) {
            if (rankingNumerico <= 100) {
                mensagem = `🏆 <strong>Excelente posição!</strong><br><br>
                    • Ranking: ${ranking}<br>
                    • Categoria: ${this.getProductCategory(cell)}<br>
                    • Status: Top 100 - Muito competitivo`;
                cor = '#10b981';
            } else if (rankingNumerico <= 1000) {
                mensagem = `🥈 <strong>Boa posição!</strong><br><br>
                    • Ranking: ${ranking}<br>
                    • Categoria: ${this.getProductCategory(cell)}<br>
                    • Status: Top 1000 - Competitivo`;
                cor = '#f59e0b';
            } else if (rankingNumerico <= 10000) {
                mensagem = `🥉 <strong>Posição regular</strong><br><br>
                    • Ranking: ${ranking}<br>
                    • Categoria: ${this.getProductCategory(cell)}<br>
                    • Status: Top 10000 - Moderado`;
                cor = '#ef4444';
            } else {
                mensagem = `📉 <strong>Posição baixa</strong><br><br>
                    • Ranking: ${ranking}<br>
                    • Categoria: ${this.getProductCategory(cell)}<br>
                    • Status: Acima de 10000 - Baixa competitividade`;
                cor = '#6b7280';
            }
        } else {
            mensagem = `❓ <strong>Ranking não disponível</strong><br><br>
                • Este produto não possui ranking BSR<br>
                • Pode ser um produto novo ou sem vendas`;
        }

        this.uiManager.showNotification(mensagem, 'info', 5000);
    }

    handleExport() {
        const exportManager = this.uiManager.getComponent('ExportManager');
        if (exportManager) {
            exportManager.exportarDados();
        } else {
            this.uiManager.showNotification('Sistema de exportação não disponível', 'error');
        }
    }

    updateFilters() {
        const filtros = {
            nome: this.container.querySelector('#busca-nome')?.value || '',
            preco: this.container.querySelector('#filtro-preco')?.value || '',
            avaliacao: this.container.querySelector('#filtro-avaliacao')?.value || '',
            marca: this.container.querySelector('#filtro-marca')?.value || '',
            bsrFaixa: this.container.querySelector('#filtro-bsr-faixa')?.value || '',
            posicao: this.container.querySelector('#filtro-posicao')?.value || ''
        };

        this.dataManager.setFiltros(filtros);
    }

    // ===== UTILITÁRIOS =====
    createContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'table-component';
            this.container.className = 'table-component';
        }
    }

    verificarASINDuplicado(asin) {
        if (!asin) return false;
        const produtos = this.dataManager.getProdutos();
        const ocorrencias = produtos.filter(p => p.asin === asin);
        return ocorrencias.length > 1;
    }

    getPositionClass(posicao) {
        if (posicao <= 10) return 'position-gold';
        if (posicao <= 50) return 'position-silver';
        if (posicao <= 100) return 'position-bronze';
        return 'position-default';
    }

    getPositionIcon(posicao) {
        if (posicao <= 10) return '🥇';
        if (posicao <= 50) return '🥈';
        if (posicao <= 100) return '🥉';
        return '📊';
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const emptyStars = 5 - fullStars;
        return '⭐'.repeat(fullStars) + '☆'.repeat(emptyStars);
    }

    formatNumber(num) {
        if (!num) return 'N/A';
        return num.toLocaleString('pt-BR');
    }

    formatCurrency(num) {
        if (!num) return '0,00';
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }

    getDefaultImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkMxMiAxNC4zNDMxIDEzLjM0MzEgMTMgMTUgMTNIMjVDMjYuNjU2OSAxMyAyOCAxNC4zNDMxIDI4IDE2VjI0QzI4IDI1LjY1NjkgMjYuNjU2OSAyNyAyNSAyN0gxNUMxMy4zNDMxIDI3IDEyIDI1LjY1NjkgMTIgMjRWMTZaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxOEMxNiAxNi44OTU0IDE2Ljg5NTQgMTYgMTggMTZIMjJDMjMuMTA0NiAxNiAyNCAxNi44OTU0IDI0IDE4VjIyQzI0IDIzLjEwNDYgMjMuMTA0NiAyNCAyMiAyNEgxOEMxNi44OTU0IDI0IDE2IDIzLjEwNDYgMTYgMjJWMThaIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
    }

    getProductCategory(cell) {
        const row = cell.closest('.product-row');
        const categoryCell = row?.querySelector('.category-cell');
        return categoryCell?.textContent || 'N/A';
    }

    // ===== DESTRUIÇÃO =====
    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        
        this.dataManager.unsubscribe(this.handleStateChange);
        this.isRendered = false;
        
        console.log('🗑️ TableComponent destruído');
    }
}

// Instância global
window.TableComponent = new TableComponent(); 