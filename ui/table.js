class TableManager {
    static criarTabelaProdutos(produtos) {
        const metricas = ProductAnalyzer.calcularMetricas(produtos);
        const termoBusca = UrlManager.extrairTermoBusca();
        
        const totalVendas = produtos.reduce((total, produto) => total + (produto.vendidos || 0), 0);
        
        return `
            <div id="amazon-analyzer-principal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(240, 240, 240, 0.1);
                z-index: 999990;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(8px);
                font-family: 'Poppins', sans-serif;
            ">
                <div style="
                    width: 98vw;
                    max-width: 2000px;
                    height: 95vh;
                    background: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                ">
                    <div style="
                        background: linear-gradient(135deg, #014641, #013935);
                        color: white;
                        padding: 12px 16px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 10px;
                    ">
                        <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <span style="font-size: 18px; color: white; font-weight: 600;">AMK</span>
                                <span style="font-size: 12px; color: white; margin-top: 2px; font-weight: 500;">spy</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 14px; opacity: 0.8;">Buscar:</span>
                                <input type="text" id="nova-busca" value="${termoBusca}" placeholder="Digite um termo..." style="
                                    padding: 8px 12px;
                                    border: 2px solid rgba(255,255,255,0.2);
                                    border-radius: 8px;
                                    background: rgba(255,255,255,0.1);
                                    color: white;
                                    font-size: 14px;
                                    outline: none;
                                    width: 400px;
                                    transition: all 0.2s;
                                    font-family: 'Poppins', sans-serif;
                                ">
                                <button id="btn-buscar" style="
                                    padding: 8px 16px;
                                    background: #6ac768;
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    font-weight: 500;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    font-family: 'Poppins', sans-serif;
                                ">🔍 Buscar</button>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 14px; opacity: 0.9;">${produtos.length} produtos</span>
                            <button id="fechar-analise" style="
                                background: rgba(255,255,255,0.1);
                                border: none;
                                color: white;
                                width: 32px;
                                height: 32px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 18px;
                                font-weight: bold;
                                transition: all 0.2s;
                            ">×</button>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding: 20px; background: #f8fafc;">
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px;">RECEITA TOTAL</div>
                            <div style="font-size: 18px; font-weight: 700; color: #6ac768;">R$ ${metricas.receitaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px;">TOTAL DE VENDAS</div>
                            <div style="font-size: 18px; font-weight: 700; color: #6ac768;">${totalVendas.toLocaleString()}</div>
                        </div>
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px;">PREÇO MÉDIO</div>
                            <div style="font-size: 18px; font-weight: 700; color: #6ac768;">R$ ${metricas.precoMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px;">MÉDIA VENDAS/MÊS</div>
                            <div style="font-size: 18px; font-weight: 700; color: #6ac768;">${Math.round(metricas.mediaVendasMes).toLocaleString()}</div>
                        </div>
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px;">AVALIAÇÃO MÉDIA</div>
                            <div style="font-size: 18px; font-weight: 700; color: #6ac768;">⭐ ${metricas.mediaAvaliacao.toFixed(1)}</div>
                        </div>
                    </div>
                    
                    <div style="padding: 20px 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                            <input type="text" id="busca-produto" placeholder="🔍 Filtrar produtos..." style="
                                flex: 1;
                                min-width: 180px;
                                padding: 6px 12px;
                                height: 32px;
                                border: 2px solid #e2e8f0;
                                border-radius: 6px;
                                font-size: 13px;
                                outline: none;
                                transition: all 0.2s;
                                font-family: 'Poppins', sans-serif;
                            ">
                            
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="font-size: 13px; color: #014641;">Ordenar por:</span>
                                <select id="ordenacao" style="
                                    padding: 6px 12px;
                                    height: 32px;
                                    border: 2px solid #e2e8f0;
                                    border-radius: 6px;
                                    font-size: 13px;
                                    outline: none;
                                    background: white;
                                    cursor: pointer;
                                    font-family: 'Poppins', sans-serif;
                                    min-width: 150px;
                                ">
                                    <option value="posicao">Ordem Original</option>
                                    <option value="marca">Marca (A-Z)</option>
                                    <option value="vendas-desc">Mais Vendidos ↓</option>
                                    <option value="vendas-asc">Menos Vendidos ↑</option>
                                    <option value="receita-desc">Maior Receita ↓</option>
                                    <option value="receita-asc">Menor Receita ↑</option>
                                    <option value="preco-desc">Maior Preço ↓</option>
                                    <option value="preco-asc">Menor Preço ↑</option>
                                </select>
                            </div>

                            <button id="reload-produtos" style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 32px;
                                height: 32px;
                                background: #014641;
                                color: white;
                                border: none;
                                border-radius: 50%;
                                cursor: pointer;
                                font-size: 16px;
                                transition: all 0.2s;
                            " title="Recarregar produtos">
                                ↻
                            </button>
                        </div>
                    </div>
                    
                    <div style="flex: 1; overflow-y: auto; background: white;">
                        <div style="overflow-x: auto; width: 100%;">
                            <table id="tabela-produtos" style="width: 100%; min-width: 800px; border-collapse: collapse; font-family: 'Poppins', sans-serif;">
                                <thead style="
                                    background: #f8fafc;
                                    position: sticky;
                                    top: 0;
                                    z-index: 10;
                                ">
                                    <tr>
                                        <th style="padding: 12px 8px; text-align: left; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">IMG</th>
                                        <th style="padding: 12px 8px; text-align: left; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">PRODUTO</th>
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">MARCA</th>
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">POS</th>
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">ASIN</th>
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">PREÇO</th>
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">VENDAS</th>
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">RECEITA</th>
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">AVAL</th>
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">REVIEWS</th>
                                    </tr>
                                </thead>
                                <tbody id="corpo-tabela">
                                    ${produtos.map((produto, index) => `
                                        <tr class="linha-produto" 
                                            data-titulo="${produto.titulo.toLowerCase()}" 
                                            data-preco="${produto.precoNumerico}"
                                            data-avaliacao="${produto.avaliacaoNumerica}"
                                            data-vendas="${produto.vendidos}"
                                            data-posicao="${produto.posicaoGlobal}"
                                            data-receita="${produto.precoNumerico * produto.vendidos}"
                                            style="border-bottom: 1px solid #f1f5f9;">
                                            <td style="padding: 8px 16px;">
                                                ${produto.imagem ? `<img src="${produto.imagem}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;">` : ''}
                                            </td>
                                            <td style="padding: 8px 16px; max-width: 300px;">
                                                <a href="${produto.link}" target="_blank" style="
                                                    color: #014641;
                                                    text-decoration: none;
                                                    font-weight: 500;
                                                    font-size: 14px;
                                                    line-height: 1.4;
                                                    display: block;
                                                ">
                                                    ${produto.titulo}
                                                </a>
                                            </td>
                                            <td style="padding: 8px 16px; text-align: center; font-size: 13px; color: #014641;">
                                                <span>${produto.carregandoDetalhes ? '<span style="color: #6ac768;">⏳ Carregando...</span>' : (produto.marca || '-')}</span>
                                            </td>
                                            <td style="padding: 8px 16px; text-align: center; font-weight: 500; font-size: 14px;">
                                                <span style="color: #014641;">${produto.posicaoGlobal}</span>
                                                ${produto.paginaOrigem > 1 ? `<span style="color: #6ac768; font-size: 11px; margin-left: 4px;">(Pág. ${produto.paginaOrigem})</span>` : ''}
                                            </td>
                                            <td style="padding: 8px 16px; text-align: center; font-family: monospace; font-size: 12px; color: #014641;">
                                                <span>${produto.asin}</span>
                                            </td>
                                            <td style="padding: 8px 16px; text-align: center; font-weight: 600; color: #6ac768; font-size: 15px;">
                                                ${produto.preco}
                                            </td>
                                            <td style="padding: 8px 16px; text-align: center; color: #014641; font-size: 14px;">
                                                ${produto.vendidos ? produto.vendidos.toLocaleString() : '-'}
                                            </td>
                                            <td style="padding: 8px 16px; text-align: center; font-weight: 600; color: #6ac768; font-size: 15px;">
                                                ${produto.vendidos ? `R$ ${(produto.precoNumerico * produto.vendidos).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '-'}
                                            </td>
                                            <td style="padding: 8px 16px; text-align: center; font-weight: 500; font-size: 14px;">
                                                ${produto.avaliacao ? `⭐ ${produto.avaliacao}` : '-'}
                                            </td>
                                            <td style="padding: 8px 16px; text-align: center; color: #014641; font-size: 14px;">
                                                ${produto.numAvaliacoes ? produto.numAvaliacoes.toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static atualizarLinhaProduto(produto, index) {
        const linha = document.querySelector(`#corpo-tabela tr:nth-child(${index + 1})`);
        if (!linha) return;
        
        const colunaMarca = linha.querySelector('td:nth-child(3) span');
        if (colunaMarca) {
            if (produto.carregandoDetalhes) {
                colunaMarca.innerHTML = '<span style="color: #6ac768;">⏳ Carregando...</span>';
            } else {
                colunaMarca.textContent = produto.marca || '-';
                colunaMarca.style.color = produto.marca ? '#014641' : '#94a3b8';
            }
        }
        
        if (!produto.carregandoDetalhes) {
            const loadingIndicator = linha.querySelector('.loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            
            linha.style.background = '#dcfce7';
            setTimeout(() => {
                linha.style.background = 'white';
            }, 1000);
        }
    }

    static ordenarTabela(tipo) {
        const tbody = document.getElementById('corpo-tabela');
        const linhas = Array.from(tbody.querySelectorAll('tr.linha-produto')).filter(linha => 
            linha.style.display !== 'none'
        );
        
        linhas.sort((a, b) => {
            switch(tipo) {
                case 'marca':
                    const marcaA = a.querySelector('td:nth-child(3)').textContent.trim().toLowerCase();
                    const marcaB = b.querySelector('td:nth-child(3)').textContent.trim().toLowerCase();
                    return marcaA.localeCompare(marcaB);
                case 'vendas-desc':
                    const vendasA1 = parseInt(a.getAttribute('data-vendas')) || 0;
                    const vendasB1 = parseInt(b.getAttribute('data-vendas')) || 0;
                    return vendasB1 - vendasA1;
                case 'vendas-asc':
                    const vendasA2 = parseInt(a.getAttribute('data-vendas')) || 0;
                    const vendasB2 = parseInt(b.getAttribute('data-vendas')) || 0;
                    return vendasA2 - vendasB2;
                case 'receita-desc':
                    const receitaA1 = parseFloat(a.getAttribute('data-receita')) || 0;
                    const receitaB1 = parseFloat(b.getAttribute('data-receita')) || 0;
                    return receitaB1 - receitaA1;
                case 'receita-asc':
                    const receitaA2 = parseFloat(a.getAttribute('data-receita')) || 0;
                    const receitaB2 = parseFloat(b.getAttribute('data-receita')) || 0;
                    return receitaA2 - receitaB2;
                case 'preco-desc':
                    const precoA1 = parseFloat(a.getAttribute('data-preco')) || 0;
                    const precoB1 = parseFloat(b.getAttribute('data-preco')) || 0;
                    return precoB1 - precoA1;
                case 'preco-asc':
                    const precoA2 = parseFloat(a.getAttribute('data-preco')) || 0;
                    const precoB2 = parseFloat(b.getAttribute('data-preco')) || 0;
                    return precoA2 - precoB2;
                default:
                    const posA = parseInt(a.getAttribute('data-posicao')) || 0;
                    const posB = parseInt(b.getAttribute('data-posicao')) || 0;
                    return posA - posB;
            }
        });
        
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        
        linhas.forEach(linha => tbody.appendChild(linha));
    }
}

window.TableManager = TableManager; 