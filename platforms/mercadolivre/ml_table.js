/**
 * ML Table Manager - Sistema de tabela específico para MercadoLivre
 * Totalmente independente do sistema Amazon
 */
class MLTableManager {
    
    static config = {
        larguraTabela: '95%',
        alturaTabelaMaxima: '70vh',
        itensPorPagina: 50,
        colunasPadrao: ['posicao', 'pagina', 'titulo', 'mlId', 'preco', 'vendedor', 'vendas', 'receita', 'badges', 'categoria', 'tipo']
    };
    
    static paginaAtual = 1;
    static dadosOriginais = [];
    static dadosFiltrados = [];
    static ordenacaoAtiva = null;
    
    /**
     * CRIAR TABELA DE PRODUTOS ML - Método principal
     */
    static criarTabelaProdutosML(produtos) {
        console.log('📊 [ML-TABLE] Criando tabela específica para MercadoLivre...');
        
        if (!produtos || produtos.length === 0) {
            return this.criarTabelaVaziaML();
        }
        
        this.dadosOriginais = [...produtos];
        this.dadosFiltrados = [...produtos];
        this.paginaAtual = 1;
        
        const tabelaHTML = this.construirTabelaCompletaML(produtos);
        
        console.log(`✅ [ML-TABLE] Tabela ML criada com ${produtos.length} produtos`);
        return tabelaHTML;
    }
    
    /**
     * CONSTRUIR TABELA COMPLETA ML
     */
    static construirTabelaCompletaML(produtos) {
        const cabecalho = this.criarCabecalhoML();
        const corpo = this.criarCorpoTabelaML(produtos);
        const rodape = this.criarRodapeML(produtos);
        const controles = this.criarControlesML();
        
        return `
            <div id="ml-table-container" style="
                width: ${this.config.larguraTabela};
                margin: 0 auto;
                background: var(--bg-primary, #ffffff);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                ${controles}
                
                <div style="
                    max-height: ${this.config.alturaTabelaMaxima};
                    overflow-y: auto;
                    overflow-x: auto;
                ">
                    <table id="ml-products-table" style="
                        width: 100%;
                        border-collapse: collapse;
                        background: white;
                        font-size: 12px;
                    ">
                        ${cabecalho}
                        ${corpo}
                    </table>
                </div>
                
                ${rodape}
            </div>
        `;
    }
    
    /**
     * CRIAR CABEÇALHO ML
     */
    static criarCabecalhoML() {
        return `
            <thead style="
                background: linear-gradient(135deg, #FFE600 0%, #FFC107 100%);
                color: #333;
                font-weight: 700;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                position: sticky;
                top: 0;
                z-index: 10;
            ">
                <tr>
                    <th style="padding: 12px 8px; border-right: 1px solid rgba(0,0,0,0.1); width: 40px; text-align: center;">
                        <span onclick="MLTableManager.ordenarPor('posicao')" style="cursor: pointer; user-select: none;">
                            #️⃣ Pos
                        </span>
                    </th>
                    <th style="padding: 12px 8px; border-right: 1px solid rgba(0,0,0,0.1); width: 60px; text-align: center;">
                        <span onclick="MLTableManager.ordenarPor('pagina')" style="cursor: pointer; user-select: none;">
                            📄 Pág
                        </span>
                    </th>
                    <th style="padding: 12px 8px; border-right: 1px solid rgba(0,0,0,0.1); min-width: 300px;">
                        <span onclick="MLTableManager.ordenarPor('titulo')" style="cursor: pointer; user-select: none;">
                            📦 Produto
                        </span>
                    </th>
                    <th style="padding: 12px 8px; border-right: 1px solid rgba(0,0,0,0.1); width: 120px; text-align: center;">
                        <span onclick="MLTableManager.ordenarPor('mlId')" style="cursor: pointer; user-select: none;">
                            🔗 MLB ID
                        </span>
                    </th>
                    <th style="padding: 12px 8px; border-right: 1px solid rgba(0,0,0,0.1); width: 100px; text-align: right;">
                        <span onclick="MLTableManager.ordenarPor('preco')" style="cursor: pointer; user-select: none;">
                            💰 Preço
                        </span>
                    </th>
                    <th style="padding: 12px 8px; border-right: 1px solid rgba(0,0,0,0.1); width: 150px;">
                        <span onclick="MLTableManager.ordenarPor('vendedor')" style="cursor: pointer; user-select: none;">
                            🏪 Vendedor
                        </span>
                    </th>
                    <th style="padding: 12px 8px; border-right: 1px solid rgba(0,0,0,0.1); width: 80px; text-align: right;">
                        <span onclick="MLTableManager.ordenarPor('vendas')" style="cursor: pointer; user-select: none;">
                            📈 Vendas
                        </span>
                    </th>
                    <th style="padding: 12px 8px; border-right: 1px solid rgba(0,0,0,0.1); width: 100px; text-align: right;">
                        <span onclick="MLTableManager.ordenarPor('receita')" style="cursor: pointer; user-select: none;">
                            💵 Receita
                        </span>
                    </th>
                    <th style="padding: 12px 8px; border-right: 1px solid rgba(0,0,0,0.1); width: 120px; text-align: center;">
                        <span onclick="MLTableManager.ordenarPor('badges')" style="cursor: pointer; user-select: none;">
                            🏆 Badges
                        </span>
                    </th>
                    <th style="padding: 12px 8px; border-right: 1px solid rgba(0,0,0,0.1); width: 120px; text-align: center;">
                        <span onclick="MLTableManager.ordenarPor('categoria')" style="cursor: pointer; user-select: none;">
                            📂 Categoria
                        </span>
                    </th>
                    <th style="padding: 12px 8px; width: 80px; text-align: center;">
                        <span onclick="MLTableManager.ordenarPor('tipo')" style="cursor: pointer; user-select: none;">
                            🎯 Tipo
                        </span>
                    </th>
                </tr>
            </thead>
        `;
    }
    
    /**
     * CRIAR CORPO DA TABELA ML
     */
    static criarCorpoTabelaML(produtos) {
        let corpoHTML = '<tbody>';
        
        produtos.forEach((produto, index) => {
            corpoHTML += this.criarLinhaML(produto, index);
        });
        
        corpoHTML += '</tbody>';
        return corpoHTML;
    }
    
    /**
     * CRIAR LINHA INDIVIDUAL ML
     */
    static criarLinhaML(produto, index) {
        const corLinha = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
        const corHover = '#fff3cd';
        
        return `
            <tr style="
                background: ${corLinha};
                transition: all 0.2s ease;
                border-bottom: 1px solid #eee;
            " 
            onmouseover="this.style.background='${corHover}'"
            onmouseout="this.style.background='${corLinha}'">
                ${this.criarCelulaPosicaoML(produto)}
                ${this.criarCelulaPaginaML(produto)}
                ${this.criarCelulaProdutoML(produto)}
                ${this.criarCelulaMLIDML(produto)}
                ${this.criarCelulaPrecoML(produto)}
                ${this.criarCelulaVendedorML(produto)}
                ${this.criarCelulaVendasML(produto)}
                ${this.criarCelulaReceitaML(produto)}
                ${this.criarCelulaBadgesML(produto)}
                ${this.criarCelulaCategoriaML(produto)}
                ${this.criarCelulaTipoML(produto)}
            </tr>
        `;
    }
    
    /**
     * CÉLULAS ESPECÍFICAS ML
     */
    static criarCelulaPosicaoML(produto) {
        const cor = produto.posicao <= 5 ? '#28a745' : produto.posicao <= 10 ? '#ffc107' : '#6c757d';
        return `
            <td style="padding: 10px 8px; text-align: center; border-right: 1px solid #eee;">
                <span style="
                    background: ${cor};
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 11px;
                ">${produto.posicao || 0}</span>
            </td>
        `;
    }
    
    static criarCelulaPaginaML(produto) {
        // Calcular página baseada na posição (50 produtos por página no ML)
        const pagina = produto.paginaBusca || Math.ceil((produto.posicao || 1) / 50);
        const corPagina = pagina === 1 ? '#007bff' : pagina <= 3 ? '#28a745' : '#6c757d';
        
        return `
            <td style="padding: 10px 8px; text-align: center; border-right: 1px solid #eee;">
                <span style="
                    background: ${corPagina};
                    color: white;
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 10px;
                    display: inline-block;
                    min-width: 20px;
                " title="Página ${pagina}">${pagina}</span>
            </td>
        `;
    }
    
    static criarCelulaProdutoML(produto) {
        return `
            <td style="padding: 10px 8px; border-right: 1px solid #eee;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${produto.imagem ? `
                        <img src="${produto.imagem}" 
                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;"
                             loading="lazy" />
                    ` : '📦'}
                    <div style="flex: 1; min-width: 0;">
                        <div style="
                            font-weight: 600;
                            color: #333;
                            margin-bottom: 4px;
                            font-size: 12px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        " title="${produto.titulo || ''}">${produto.titulo || 'Sem título'}</div>
                        <div style="font-size: 10px; color: #666;">
                            ${produto.condicao || 'Novo'} ${produto.desconto ? `| -${produto.desconto}%` : ''}
                        </div>
                    </div>
                </div>
            </td>
        `;
    }
    
    static criarCelulaMLIDML(produto) {
        return `
            <td style="padding: 10px 8px; text-align: center; border-right: 1px solid #eee;">
                <a href="${produto.link || '#'}" 
                   target="_blank" 
                   style="
                       color: #FFE600;
                       text-decoration: none;
                       font-weight: 600;
                       font-size: 10px;
                       padding: 4px 6px;
                       background: rgba(255, 230, 0, 0.1);
                       border-radius: 4px;
                       border: 1px solid #FFE600;
                       display: inline-block;
                   "
                   title="Ver produto no ML">${produto.mlId || 'N/A'}</a>
            </td>
        `;
    }
    
    static criarCelulaPrecoML(produto) {
        const precoFormatado = produto.preco ? 
            produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 
            'N/A';
            
        return `
            <td style="padding: 10px 8px; text-align: right; border-right: 1px solid #eee;">
                <span style="
                    font-weight: 700;
                    color: #28a745;
                    font-size: 12px;
                ">${precoFormatado}</span>
            </td>
        `;
    }
    
    static criarCelulaVendedorML(produto) {
        const isOficial = produto.lojaOficial;
        return `
            <td style="padding: 10px 8px; border-right: 1px solid #eee;">
                <div style="
                    font-size: 11px;
                    color: #333;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                " title="${produto.vendedor || 'N/A'}">
                    ${isOficial ? '🏆 ' : ''}${produto.vendedor || 'N/A'}
                </div>
                ${isOficial ? '<div style="font-size: 9px; color: #28a745;">Loja Oficial</div>' : ''}
            </td>
        `;
    }
    
    static criarCelulaVendasML(produto) {
        const vendas = produto.vendas || 0;
        const vendaFormatada = vendas > 0 ? vendas.toLocaleString('pt-BR') : '0';
        const cor = vendas > 1000 ? '#28a745' : vendas > 100 ? '#ffc107' : '#6c757d';
        
        return `
            <td style="padding: 10px 8px; text-align: right; border-right: 1px solid #eee;">
                <span style="color: ${cor}; font-weight: 600; font-size: 11px;">
                    ${vendaFormatada}
                </span>
                ${produto.vendasTexto ? `
                    <div style="font-size: 9px; color: #666;" title="${produto.vendasTextoOriginal || ''}">
                        ${produto.vendasTexto.substring(0, 15)}...
                    </div>
                ` : ''}
            </td>
        `;
    }
    
    static criarCelulaReceitaML(produto) {
        const receita = produto.receita || 0;
        const receitaFormatada = receita > 0 ? 
            receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 
            'N/A';
        const cor = receita > 100000 ? '#28a745' : receita > 10000 ? '#ffc107' : '#6c757d';
        
        return `
            <td style="padding: 10px 8px; text-align: right; border-right: 1px solid #eee;">
                <span style="color: ${cor}; font-weight: 600; font-size: 11px;">
                    ${receitaFormatada}
                </span>
            </td>
        `;
    }
    
    static criarCelulaBadgesML(produto) {
        const badges = produto.badges || {};
        let badgesHTML = '';
        
        if (badges.maisVendido) badgesHTML += '<span style="background: #28a745; color: white; padding: 2px 4px; border-radius: 8px; font-size: 8px; margin: 1px;">MAIS VENDIDO</span><br>';
        if (badges.recomendado) badgesHTML += '<span style="background: #007bff; color: white; padding: 2px 4px; border-radius: 8px; font-size: 8px; margin: 1px;">RECOMENDADO</span><br>';
        if (badges.melhorPreco) badgesHTML += '<span style="background: #ffc107; color: #333; padding: 2px 4px; border-radius: 8px; font-size: 8px; margin: 1px;">MELHOR PREÇO</span><br>';
        if (produto.freteGratis) badgesHTML += '<span style="background: #17a2b8; color: white; padding: 2px 4px; border-radius: 8px; font-size: 8px; margin: 1px;">FRETE GRÁTIS</span>';
        
        if (!badgesHTML) badgesHTML = '<span style="color: #999; font-size: 10px;">-</span>';
        
        return `
            <td style="padding: 10px 8px; text-align: center; border-right: 1px solid #eee; line-height: 1.2;">
                ${badgesHTML}
            </td>
        `;
    }
    
    static criarCelulaCategoriaML(produto) {
        const categoria = produto.categoriaRanking || 'N/A';
        return `
            <td style="padding: 10px 8px; text-align: center; border-right: 1px solid #eee;">
                <span style="
                    font-size: 10px;
                    color: #666;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    display: block;
                " title="${categoria}">${categoria}</span>
            </td>
        `;
    }
    
    static criarCelulaTipoML(produto) {
        const isPatrocinado = produto.patrocinado;
        const cor = isPatrocinado ? '#dc3545' : '#28a745';
        const icone = isPatrocinado ? '💰' : '🎯';
        const texto = isPatrocinado ? 'Patrocinado' : 'Orgânico';
        
        return `
            <td style="padding: 10px 8px; text-align: center;">
                <span style="
                    background: ${cor};
                    color: white;
                    padding: 4px 6px;
                    border-radius: 8px;
                    font-size: 9px;
                    font-weight: 600;
                    display: inline-block;
                ">${icone} ${texto}</span>
            </td>
        `;
    }
    
    /**
     * CRIAR CONTROLES ML
     */
    static criarControlesML() {
        return `
            <div style="
                padding: 15px 20px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
            ">
                <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                    <h3 style="
                        margin: 0;
                        color: #333;
                        font-size: 16px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        🛒 Produtos MercadoLivre
                        <span id="ml-count-badge" style="
                            background: #FFE600;
                            color: #333;
                            padding: 4px 10px;
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: 600;
                        ">0 produtos</span>
                    </h3>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" 
                           id="ml-search-filter" 
                           placeholder="Filtrar por título, MLB ID, vendedor ou página..."
                           style="
                               padding: 8px 12px;
                               border: 1px solid #ddd;
                               border-radius: 6px;
                               font-size: 12px;
                               width: 250px;
                           "
                           onkeyup="MLTableManager.filtrarTabela(this.value)" />
                    
                    <button onclick="MLTableManager.exportarML()" style="
                        background: #28a745;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 11px;
                        cursor: pointer;
                        font-weight: 600;
                    ">📊 Exportar CSV</button>
                    
                    <button onclick="MLTableManager.atualizarTabela()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 11px;
                        cursor: pointer;
                        font-weight: 600;
                    ">🔄 Atualizar</button>
                </div>
            </div>
        `;
    }
    
    /**
     * CRIAR RODAPÉ ML
     */
    static criarRodapeML(produtos) {
        const totalProdutos = produtos.length;
        const totalReceita = produtos.reduce((sum, p) => sum + (p.receita || 0), 0);
        const totalVendas = produtos.reduce((sum, p) => sum + (p.vendas || 0), 0);
        
        return `
            <div style="
                padding: 15px 20px;
                background: linear-gradient(135deg, #343a40 0%, #495057 100%);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
                font-size: 12px;
            ">
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div>
                        <strong>📦 Total de Produtos:</strong> ${totalProdutos.toLocaleString('pt-BR')}
                    </div>
                    <div>
                        <strong>📈 Total de Vendas:</strong> ${totalVendas.toLocaleString('pt-BR')}
                    </div>
                    <div>
                        <strong>💵 Receita Total:</strong> ${totalReceita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                </div>
                
                <div style="font-size: 10px; opacity: 0.8;">
                    🛒 AMK Spy ML - ${new Date().toLocaleString('pt-BR')}
                </div>
            </div>
        `;
    }
    
    /**
     * CRIAR TABELA VAZIA ML
     */
    static criarTabelaVaziaML() {
        return `
            <div style="
                text-align: center;
                padding: 40px 20px;
                color: #666;
                background: white;
                border-radius: 12px;
                border: 2px dashed #ddd;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">🛒</div>
                <h3 style="margin: 0 0 10px 0; color: #333;">Nenhum produto encontrado</h3>
                <p style="margin: 0; font-size: 14px;">
                    Não foram encontrados produtos nesta busca do MercadoLivre.
                </p>
            </div>
        `;
    }
    
    /**
     * MÉTODOS DE INTERAÇÃO
     */
    static ordenarPor(campo) {
        console.log(`🔄 [ML-TABLE] Ordenando por: ${campo}`);
        
        const ordem = this.ordenacaoAtiva?.campo === campo && this.ordenacaoAtiva?.ordem === 'asc' ? 'desc' : 'asc';
        
        this.dadosFiltrados.sort((a, b) => {
            let valorA = a[campo];
            let valorB = b[campo];
            
            // Tratamento especial para diferentes tipos de dados
            if (typeof valorA === 'string') {
                valorA = valorA.toLowerCase();
                valorB = valorB.toLowerCase();
            }
            
            if (valorA === null || valorA === undefined) valorA = 0;
            if (valorB === null || valorB === undefined) valorB = 0;
            
            if (ordem === 'asc') {
                return valorA > valorB ? 1 : -1;
            } else {
                return valorA < valorB ? 1 : -1;
            }
        });
        
        this.ordenacaoAtiva = { campo, ordem };
        this.atualizarCorpoTabela();
    }
    
    static filtrarTabela(filtro) {
        if (!filtro.trim()) {
            this.dadosFiltrados = [...this.dadosOriginais];
        } else {
            const filtroLower = filtro.toLowerCase();
            this.dadosFiltrados = this.dadosOriginais.filter(produto => 
                (produto.titulo || '').toLowerCase().includes(filtroLower) ||
                (produto.mlId || '').toLowerCase().includes(filtroLower) ||
                (produto.vendedor || '').toLowerCase().includes(filtroLower) ||
                (produto.paginaBusca || '').toString().includes(filtroLower)
            );
        }
        
        this.atualizarCorpoTabela();
        this.atualizarContadores();
    }
    
    static atualizarCorpoTabela() {
        const tbody = document.querySelector('#ml-products-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        this.dadosFiltrados.forEach((produto, index) => {
            tbody.innerHTML += this.criarLinhaML(produto, index);
        });
    }
    
    static atualizarContadores() {
        const countBadge = document.getElementById('ml-count-badge');
        if (countBadge) {
            countBadge.textContent = `${this.dadosFiltrados.length} produtos`;
        }
    }
    
    static atualizarTabela() {
        console.log('🔄 [ML-TABLE] Atualizando tabela ML...');
        // Reextração via MLController se disponível
        if (window.MLController && typeof MLController.reextract === 'function') {
            MLController.reextract();
        }
    }
    
    static exportarML() {
        console.log('📊 [ML-TABLE] Exportando dados ML para CSV...');
        
        if (!this.dadosFiltrados.length) {
            alert('Nenhum dado para exportar!');
            return;
        }
        
        const cabecalho = ['Posição', 'Página', 'Título', 'MLB ID', 'Preço', 'Vendedor', 'Vendas', 'Receita', 'Tipo', 'Link'];
        const linhas = this.dadosFiltrados.map(produto => [
            produto.posicao || '',
            produto.paginaBusca || '',
            produto.titulo || '',
            produto.mlId || '',
            produto.preco || '',
            produto.vendedor || '',
            produto.vendas || '',
            produto.receita || '',
            produto.tipo || '',
            produto.link || ''
        ]);
        
        const csvContent = [cabecalho, ...linhas]
            .map(linha => linha.map(campo => `"${campo}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `amk-spy-ml-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    }
    
    /**
     * INICIALIZAR EVENTOS ML
     */
    static inicializarEventosML() {
        console.log('📡 [ML-TABLE] Inicializando eventos da tabela ML...');
        
        // Os eventos estão inline no HTML para simplicidade
        // Aqui podemos adicionar eventos mais complexos se necessário
        
        this.atualizarContadores();
    }
    
    /**
     * OCULTAR LISTA ML ORIGINAL
     */
    static ocultarListaMLOriginal() {
        try {
            const listaML = document.querySelector('#ml-products-list, .ui-search-results, .ui-search-layout');
            if (listaML) {
                listaML.style.display = 'none';
                console.log('✅ [ML-TABLE] Lista ML original ocultada');
            }
        } catch (error) {
            console.warn('⚠️ [ML-TABLE] Erro ao ocultar lista ML:', error);
        }
    }
}

// Expor globalmente
window.MLTableManager = MLTableManager; 