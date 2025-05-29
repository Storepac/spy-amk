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
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px;">BSR MÉDIO</div>
                            <div data-metrica="bsr-medio" style="font-size: 18px; font-weight: 700; color: #6ac768;">#${Math.round(metricas.mediaBSR).toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <!-- Novas Métricas de BSR -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding: 0 20px 20px 20px; background: #f8fafc;">
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative;">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                PRODUTOS TOP 100
                                <button class="btn-expandir-top100" style="
                                    background: none;
                                    border: none;
                                    padding: 0;
                                    width: 20px;
                                    height: 20px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 14px;
                                    color: #6ac768;
                                    cursor: pointer;
                                ">↓</button>
                                <button class="btn-info-top100" style="
                                    background: #014641;
                                    border: none;
                                    width: 16px;
                                    height: 16px;
                                    border-radius: 50%;
                                    color: white;
                                    font-size: 11px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                ">i</button>
                            </div>
                            <div class="info-top100-tooltip" style="
                                display: none;
                                position: absolute;
                                background: #014641;
                                color: white;
                                padding: 12px;
                                border-radius: 8px;
                                font-size: 12px;
                                max-width: 250px;
                                z-index: 100;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            ">
                                <div style="margin-bottom: 8px;">Produtos com altíssima competitividade e excelente volume de vendas.</div>
                                <div style="margin-bottom: 8px;">✓ Maior visibilidade na Amazon</div>
                                <div style="margin-bottom: 8px;">✓ Geralmente líderes de mercado</div>
                                <div>✓ Alta concorrência e investimento necessário</div>
                            </div>
                            <div data-metrica="top100" style="font-size: 18px; font-weight: 700; color: #6ac768;">${metricas.produtosTop100}</div>
                            <div data-metrica="top100-pct" style="font-size: 11px; color: #64748b;">${((metricas.produtosTop100/metricas.produtosComRanking)*100).toFixed(1)}% do total</div>
                            <div class="top100-lista" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 100; margin-top: 8px; padding: 12px; text-align: left; max-height: 300px; overflow-y: auto;"></div>
                        </div>
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative;">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                PRODUTOS TOP 1000
                                <button class="btn-expandir-top1000" style="
                                    background: none;
                                    border: none;
                                    padding: 0;
                                    width: 20px;
                                    height: 20px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 14px;
                                    color: #6ac768;
                                    cursor: pointer;
                                ">↓</button>
                                <button class="btn-info-top1000" style="
                                    background: #014641;
                                    border: none;
                                    width: 16px;
                                    height: 16px;
                                    border-radius: 50%;
                                    color: white;
                                    font-size: 11px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                ">i</button>
                            </div>
                            <div class="info-top1000-tooltip" style="
                                display: none;
                                position: absolute;
                                background: #014641;
                                color: white;
                                padding: 12px;
                                border-radius: 8px;
                                font-size: 12px;
                                max-width: 250px;
                                z-index: 100;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            ">
                                <div style="margin-bottom: 8px;">Produtos com boa performance e oportunidade de crescimento.</div>
                                <div style="margin-bottom: 8px;">✓ Menor concorrência que Top 100</div>
                                <div style="margin-bottom: 8px;">✓ Bom potencial de vendas</div>
                                <div>✓ Melhor relação custo-benefício</div>
                            </div>
                            <div data-metrica="top1000" style="font-size: 18px; font-weight: 700; color: #6ac768;">${metricas.produtosTop1000}</div>
                            <div data-metrica="top1000-pct" style="font-size: 11px; color: #64748b;">${((metricas.produtosTop1000/metricas.produtosComRanking)*100).toFixed(1)}% do total</div>
                            <div class="top1000-lista" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 100; margin-top: 8px; padding: 12px; text-align: left; max-height: 300px; overflow-y: auto;"></div>
                        </div>
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative;">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                PRODUTOS RANK > 1000
                                <button class="btn-expandir-top10000" style="
                                    background: none;
                                    border: none;
                                    padding: 0;
                                    width: 20px;
                                    height: 20px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 14px;
                                    color: #6ac768;
                                    cursor: pointer;
                                ">↓</button>
                                <button class="btn-info-top10000" style="
                                    background: #014641;
                                    border: none;
                                    width: 16px;
                                    height: 16px;
                                    border-radius: 50%;
                                    color: white;
                                    font-size: 11px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                ">i</button>
                            </div>
                            <div class="info-top10000-tooltip" style="
                                display: none;
                                position: absolute;
                                background: #014641;
                                color: white;
                                padding: 12px;
                                border-radius: 8px;
                                font-size: 12px;
                                max-width: 250px;
                                z-index: 100;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            ">
                                <div style="margin-bottom: 8px;">Produtos com ranking acima de 1000.</div>
                                <div style="margin-bottom: 8px;">✓ Oportunidades inexploradas</div>
                                <div style="margin-bottom: 8px;">✓ Menor competição</div>
                                <div>✓ Potencial para otimização</div>
                            </div>
                            <div data-metrica="top10000" style="font-size: 18px; font-weight: 700; color: #6ac768;">${metricas.produtosAcima1000}</div>
                            <div data-metrica="top10000-pct" style="font-size: 11px; color: #64748b;">${((metricas.produtosAcima1000/metricas.produtosComRanking)*100).toFixed(1)}% do total</div>
                            <div class="top10000-lista" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 100; margin-top: 8px; padding: 12px; text-align: left; max-height: 300px; overflow-y: auto;"></div>
                        </div>
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                DISTRIBUIÇÃO BSR
                                <button class="btn-info-bsr" style="
                                    background: #014641;
                                    border: none;
                                    width: 16px;
                                    height: 16px;
                                    border-radius: 50%;
                                    color: white;
                                    font-size: 11px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                ">i</button>
                            </div>
                            <div class="info-bsr-tooltip" style="
                                display: none;
                                position: absolute;
                                background: #014641;
                                color: white;
                                padding: 12px;
                                border-radius: 8px;
                                font-size: 12px;
                                max-width: 250px;
                                z-index: 100;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            ">
                                <div style="margin-bottom: 8px;"><strong>Elite (1-100):</strong> Produtos com excelente performance, geralmente líderes de categoria</div>
                                <div style="margin-bottom: 8px;"><strong>Ótimo (101-1000):</strong> Produtos muito bem posicionados com bom volume de vendas</div>
                                <div><strong>Bom (1001-5000):</strong> Produtos com performance regular e potencial de crescimento</div>
                            </div>
                            <div style="display: flex; justify-content: center; gap: 12px; margin-top: 8px;">
                                <div title="Elite (1-100)">
                                    <div style="font-size: 11px; color: #64748b;">Elite</div>
                                    <div data-metrica="bsr-elite" style="font-size: 14px; font-weight: 600; color: #6ac768;">${metricas.faixasBSR.elite}</div>
                                </div>
                                <div title="Ótimo (101-1000)">
                                    <div style="font-size: 11px; color: #64748b;">Ótimo</div>
                                    <div data-metrica="bsr-otimo" style="font-size: 14px; font-weight: 600; color: #6ac768;">${metricas.faixasBSR.otimo}</div>
                                </div>
                                <div title="Bom (1001-5000)">
                                    <div style="font-size: 11px; color: #64748b;">Bom</div>
                                    <div data-metrica="bsr-bom" style="font-size: 14px; font-weight: 600; color: #6ac768;">${metricas.faixasBSR.bom}</div>
                                </div>
                            </div>
                        </div>
                        <div style="background: white; padding: 16px; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 12px; color: #014641; font-weight: 500; margin-bottom: 4px;">CATEGORIAS MAIS COMPETITIVAS</div>
                            <div data-metrica="categorias-competitivas" style="font-size: 11px; text-align: left; margin-top: 8px;">
                                ${metricas.categoriasCompetitivas.map(cat => `
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <span style="color: #64748b;">${cat.categoria.substring(0, 20)}${cat.categoria.length > 20 ? '...' : ''}</span>
                                        <span style="color: #6ac768; font-weight: 600;">#${Math.round(cat.mediaBSR).toLocaleString()}</span>
                                    </div>
                                `).join('')}
                            </div>
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
                                    <option value="bsr-asc">Melhor BSR ↑</option>
                                    <option value="bsr-desc">Pior BSR ↓</option>
                                </select>
                            </div>

                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="font-size: 13px; color: #014641;">Filtrar BSR:</span>
                                <select id="filtro-bsr" style="
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
                                    <option value="todos">Todos os Rankings</option>
                                    <option value="top100">Top 100</option>
                                    <option value="top1000">Top 1.000</option>
                                    <option value="top5000">Top 5.000</option>
                                    <option value="top10000">Top 10.000</option>
                                </select>
                            </div>

                            <button id="reload-rankings" style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 0 16px;
                                height: 32px;
                                background: #6ac768;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 13px;
                                font-weight: 500;
                                transition: all 0.2s;
                                gap: 6px;
                            " title="Recarregar Rankings">
                                <span style="font-size: 14px;">↻</span>
                                Atualizar Rankings
                            </button>

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
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">CATEGORIA</th>
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">ASIN</th>
                                        <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #014641; border-bottom: 2px solid #e2e8f0;">POS</th>
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
                                            data-ranking='${JSON.stringify({
                                                ranking: produto.ranking || '',
                                                categoria: produto.categoria || '',
                                                rankingSecundario: produto.rankingSecundario || '',
                                                categoriaSecundaria: produto.categoriaSecundaria || ''
                                            })}'
                                            style="border-bottom: 1px solid #f1f5f9;">
                                            <td style="padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
                                                <button class="btn-expandir-ranking" style="
                                                    background: #6ac768;
                                                    color: white;
                                                    border: none;
                                                    border-radius: 4px;
                                                    padding: 4px 8px;
                                                    font-size: 11px;
                                                    font-weight: 500;
                                                    cursor: pointer;
                                                    transition: all 0.2s;
                                                    font-family: 'Poppins', sans-serif;
                                                    
                                                ">mais</button>
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
                                            <td style="padding: 8px 16px; text-align: center; font-size: 13px; color: #014641;">
                                                <span>${produto.carregandoDetalhes ? '<span style="color: #6ac768;">⏳ Carregando...</span>' : (produto.categoria || '-')}</span>
                                            </td>
                                            <td style="padding: 8px 16px; text-align: center; font-family: monospace; font-size: 12px; color: #014641;">
                                                <span>${produto.asin}</span>
                                            </td>
                                            <td style="padding: 8px 16px; text-align: center; font-weight: 500; font-size: 14px;">
                                                <span style="color: #014641;">${produto.posicaoGlobal}</span>
                                                ${produto.paginaOrigem > 1 ? `<span style="color: #6ac768; font-size: 11px; margin-left: 4px;">(Pág. ${produto.paginaOrigem})</span>` : ''}
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

    static atualizarMetricas(produtos) {
        const metricas = ProductAnalyzer.calcularMetricas(produtos);
        
        // Atualizar BSR Médio
        const bsrMedioElement = document.querySelector('[data-metrica="bsr-medio"]');
        if (bsrMedioElement) {
            bsrMedioElement.textContent = `#${Math.round(metricas.mediaBSR).toLocaleString()}`;
        }
        
        // Atualizar Top 100
        const top100Element = document.querySelector('[data-metrica="top100"]');
        if (top100Element) {
            top100Element.textContent = metricas.produtosTop100;
            const top100PctElement = document.querySelector('[data-metrica="top100-pct"]');
            if (top100PctElement) {
                top100PctElement.textContent = `${((metricas.produtosTop100/metricas.produtosComRanking)*100).toFixed(1)}% do total`;
            }
        }
        
        // Atualizar Top 1000
        const top1000Element = document.querySelector('[data-metrica="top1000"]');
        if (top1000Element) {
            top1000Element.textContent = metricas.produtosTop1000;
            const top1000PctElement = document.querySelector('[data-metrica="top1000-pct"]');
            if (top1000PctElement) {
                top1000PctElement.textContent = `${((metricas.produtosTop1000/metricas.produtosComRanking)*100).toFixed(1)}% do total`;
            }
        }
        
        // Atualizar Top 10.000
        const top10000Element = document.querySelector('[data-metrica="top10000"]');
        if (top10000Element) {
            top10000Element.textContent = metricas.produtosAcima1000;
            const top10000PctElement = document.querySelector('[data-metrica="top10000-pct"]');
            if (top10000PctElement) {
                top10000PctElement.textContent = `${((metricas.produtosAcima1000/metricas.produtosComRanking)*100).toFixed(1)}% do total`;
            }
        }
        
        // Atualizar distribuição BSR
        const distribuicaoElements = {
            elite: document.querySelector('[data-metrica="bsr-elite"]'),
            otimo: document.querySelector('[data-metrica="bsr-otimo"]'),
            bom: document.querySelector('[data-metrica="bsr-bom"]')
        };
        
        Object.entries(distribuicaoElements).forEach(([faixa, element]) => {
            if (element && metricas.faixasBSR[faixa] !== undefined) {
                element.textContent = metricas.faixasBSR[faixa];
            }
        });
        
        // Atualizar categorias competitivas
        const categoriasContainer = document.querySelector('[data-metrica="categorias-competitivas"]');
        if (categoriasContainer && metricas.categoriasCompetitivas) {
            categoriasContainer.innerHTML = metricas.categoriasCompetitivas.map(cat => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: #64748b;">${cat.categoria.substring(0, 20)}${cat.categoria.length > 20 ? '...' : ''}</span>
                    <span style="color: #6ac768; font-weight: 600;">#${Math.round(cat.mediaBSR).toLocaleString()}</span>
                </div>
            `).join('');
        }

        // Atualizar listas de Top 100, Top 1000 e Top 10.000
        this.atualizarListaProdutos(produtos, 100, '.top100-lista');
        this.atualizarListaProdutos(produtos, 1000, '.top1000-lista');
        this.atualizarListaProdutos(produtos, 10000, '.top10000-lista');

        // Reaplica o filtro atual
        const filtroBSR = document.getElementById('filtro-bsr');
        if (filtroBSR) {
            this.filtrarPorBSR(filtroBSR.value);
        }
    }

    static atualizarListaProdutos(produtos, limite, seletor) {
        const container = document.querySelector(seletor);
        if (!container) return;

        // Filtra e ordena produtos por ranking
        const produtosFiltrados = produtos
            .filter(p => {
                const ranking = parseInt(p.ranking);
                if (!ranking) return false; // Ignora produtos sem ranking
                
                if (limite === 100) {
                    return ranking > 0 && ranking <= 100;
                } else if (limite === 1000) {
                    return ranking > 100 && ranking <= 1000;
                } else {
                    return ranking > 1000; // Mostra todos acima de 1000
                }
            })
            .sort((a, b) => parseInt(a.ranking) - parseInt(b.ranking));

        // Ajusta a largura do dropdown para ser fixa
        container.style.width = '320px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';

        if (produtosFiltrados.length === 0) {
            container.innerHTML = `
                <div style="padding: 16px; text-align: center; color: #64748b; font-size: 12px;">
                    Nenhum produto encontrado nesta faixa de ranking.
                </div>
            `;
            return;
        }

        // Atualiza o contador no card correspondente
        if (limite === 100) {
            const counterElement = document.querySelector('[data-metrica="top100"]');
            if (counterElement) counterElement.textContent = produtosFiltrados.length;
        } else if (limite === 1000) {
            const counterElement = document.querySelector('[data-metrica="top1000"]');
            if (counterElement) counterElement.textContent = produtosFiltrados.length;
        } else {
            const counterElement = document.querySelector('[data-metrica="top10000"]');
            if (counterElement) counterElement.textContent = produtosFiltrados.length;
        }

        container.innerHTML = produtosFiltrados.map(p => `
            <div style="
                padding: 12px;
                border-bottom: 1px solid #f1f5f9;
                display: grid;
                grid-template-columns: 50px 1fr;
                gap: 12px;
                align-items: start;
            ">
                <div style="grid-row: span 2;">
                    ${p.imagem ? `
                        <img src="${p.imagem}" style="
                            width: 50px;
                            height: 50px;
                            object-fit: cover;
                            border-radius: 4px;
                            border: 1px solid #f1f5f9;
                        " onerror="this.style.display='none'">
                    ` : ''}
                    <div style="
                        width: 50px;
                        height: 50px;
                        background: #f1f5f9;
                        border-radius: 4px;
                        display: ${p.imagem ? 'none' : 'block'};
                    "></div>
                </div>
                <div style="min-width: 0;">
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 6px;
                    ">
                        <span style="
                            color: #6ac768;
                            font-weight: 600;
                            font-size: 12px;
                            flex-shrink: 0;
                            min-width: 45px;
                        ">#${p.ranking}</span>
                        <span style="
                            color: #64748b;
                            font-size: 11px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        ">${p.categoria || ''}</span>
                    </div>
                    <div style="
                        font-size: 12px;
                        line-height: 1.4;
                        color: #014641;
                        margin-bottom: 6px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        word-break: break-word;
                        min-height: 34px;
                    ">
                        ${p.titulo}
                    </div>
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 8px;
                    ">
                        <code style="
                            color: #64748b;
                            font-size: 11px;
                            font-family: monospace;
                            background: #f8fafc;
                            padding: 3px 6px;
                            border-radius: 3px;
                            flex-shrink: 0;
                        ">${p.asin}</code>
                        <a href="${p.link}" 
                           target="_blank"
                           style="
                            background: #6ac768;
                            color: white;
                            text-decoration: none;
                            font-size: 11px;
                            padding: 3px 8px;
                            border-radius: 4px;
                            flex-shrink: 0;
                            transition: all 0.2s;
                            display: flex;
                            align-items: center;
                            gap: 4px;
                        ">
                            Ver na Amazon
                            <span style="font-size: 14px;">→</span>
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        // Ajusta altura máxima e adiciona scroll personalizado
        container.style.maxHeight = '400px';
        container.style.overflowY = 'auto';
        container.style.overflowX = 'hidden';
        container.style.scrollbarWidth = 'thin';
        container.style.scrollbarColor = '#6ac768 #f1f5f9';
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
        
        const colunaCategoria = linha.querySelector('td:nth-child(4) span');
        if (colunaCategoria) {
            if (produto.carregandoDetalhes) {
                colunaCategoria.innerHTML = '<span style="color: #6ac768;">⏳ Carregando...</span>';
            } else {
                const categoria = produto.categoria || produto.categoriaSecundaria || '-';
                colunaCategoria.textContent = categoria;
                colunaCategoria.style.color = categoria !== '-' ? '#014641' : '#94a3b8';
            }
        }
        
        if (!produto.carregandoDetalhes) {
            // Atualizar dados de ranking
            if (produto.ranking || produto.rankingSecundario) {
                linha.setAttribute('data-ranking', JSON.stringify({
                    ranking: produto.ranking || '',
                    categoria: produto.categoria || '',
                    rankingSecundario: produto.rankingSecundario || '',
                    categoriaSecundaria: produto.categoriaSecundaria || ''
                }));
                
                // Mostrar botão "mais"
                const botao = linha.querySelector('.btn-expandir-ranking');
                if (botao) {
                    botao.style.display = 'inline-block';
                }
            }
            
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
                case 'bsr-asc':
                    const rankingA = JSON.parse(a.getAttribute('data-ranking')).ranking;
                    const rankingB = JSON.parse(b.getAttribute('data-ranking')).ranking;
                    return (parseInt(rankingA) || Infinity) - (parseInt(rankingB) || Infinity);
                case 'bsr-desc':
                    const rankingA2 = JSON.parse(a.getAttribute('data-ranking')).ranking;
                    const rankingB2 = JSON.parse(b.getAttribute('data-ranking')).ranking;
                    return (parseInt(rankingB2) || 0) - (parseInt(rankingA2) || 0);
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

    static toggleRankingInfo(elemento) {
        const linhaDetalhes = elemento.nextElementSibling;
        const botao = elemento.querySelector('.btn-expandir-ranking');
        
        if (linhaDetalhes && linhaDetalhes.classList.contains('linha-detalhes-ranking')) {
            linhaDetalhes.remove();
            elemento.style.background = '';
            if (botao) botao.textContent = 'mais';
            return;
        }
        
        document.querySelectorAll('.linha-detalhes-ranking').forEach(linha => linha.remove());
        document.querySelectorAll('.linha-produto').forEach(linha => {
            linha.style.background = '';
            const btn = linha.querySelector('.btn-expandir-ranking');
            if (btn) btn.textContent = 'mais';
        });
        
        const dados = JSON.parse(elemento.getAttribute('data-ranking'));
        if (!dados.ranking && !dados.rankingSecundario) {
            return;
        }
        
        let conteudo = '';
        if (dados.ranking && dados.categoria) {
            conteudo += `<div style="margin-bottom: 8px;">
                <span style="color: #6ac768; font-weight: 600; font-size: 16px;">#${dados.ranking}</span> 
                <span style="color: #014641; margin-left: 8px;">em ${dados.categoria}</span>
            </div>`;
        }
        
        if (dados.rankingSecundario && dados.categoriaSecundaria) {
            conteudo += `<div>
                <span style="color: #6ac768; font-weight: 600; font-size: 16px;">#${dados.rankingSecundario}</span> 
                <span style="color: #014641; margin-left: 8px;">em ${dados.categoriaSecundaria}</span>
            </div>`;
        }
        
        const novaLinha = document.createElement('tr');
        novaLinha.className = 'linha-detalhes-ranking';
        novaLinha.innerHTML = `
            <td colspan="11" style="
                padding: 16px 24px;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                border-left: 4px solid #6ac768;
                font-family: 'Poppins', sans-serif;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 20px;">📊</span>
                    <div>
                        <div style="font-weight: 600; color: #014641; margin-bottom: 8px; font-size: 14px;">Rankings do Produto</div>
                        ${conteudo}
                    </div>
                </div>
            </td>
        `;
        
        elemento.insertAdjacentElement('afterend', novaLinha);
        elemento.style.background = '#f0fdf4';
        if (botao) botao.textContent = 'menos';
    }

    static mostrarTooltipRanking(elemento, dados) {
        // Função removida - usando expansão de linha
    }

    static ocultarTooltipRanking() {
        // Função removida - usando expansão de linha
    }

    static filtrarPorBSR(filtro) {
        const linhas = document.querySelectorAll('.linha-produto');
        linhas.forEach(linha => {
            const ranking = parseInt(JSON.parse(linha.getAttribute('data-ranking')).ranking) || Infinity;
            switch(filtro) {
                case 'top100':
                    linha.style.display = ranking <= 100 ? '' : 'none';
                    break;
                case 'top1000':
                    linha.style.display = ranking <= 1000 ? '' : 'none';
                    break;
                case 'top5000':
                    linha.style.display = ranking <= 5000 ? '' : 'none';
                    break;
                case 'top10000':
                    linha.style.display = ranking <= 10000 ? '' : 'none';
                    break;
                default:
                    linha.style.display = '';
            }
        });
    }

    static inicializarEventos() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-expandir-ranking')) {
                const linha = e.target.closest('.linha-produto');
                if (linha) {
                    TableManager.toggleRankingInfo(linha);
                }
            }
        });

        const reloadRankings = document.getElementById('reload-rankings');
        if (reloadRankings) {
            reloadRankings.addEventListener('click', async function() {
                const produtos = Array.from(document.querySelectorAll('.linha-produto')).map(linha => {
                    const ranking = JSON.parse(linha.getAttribute('data-ranking') || '{}');
                    return {
                        link: linha.querySelector('a').href,
                        titulo: linha.querySelector('a').textContent,
                        asin: linha.querySelector('td:nth-child(5) span').textContent,
                        carregandoDetalhes: true,
                        ranking: ranking.ranking,
                        categoria: ranking.categoria,
                        rankingSecundario: ranking.rankingSecundario,
                        categoriaSecundaria: ranking.categoriaSecundaria
                    };
                });
                
                await ProductAnalyzer.recarregarDetalhes(produtos, TableManager.atualizarLinhaProduto);
            });
        }

        const filtroBSR = document.getElementById('filtro-bsr');
        if (filtroBSR) {
            filtroBSR.addEventListener('change', function() {
                TableManager.filtrarPorBSR(this.value);
            });
        }

        const ordenacao = document.getElementById('ordenacao');
        if (ordenacao) {
            ordenacao.addEventListener('change', function() {
                TableManager.ordenarTabela(this.value);
            });
        }

        // Eventos para expandir Top 100, Top 1000 e Top 10.000
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-expandir-top100') ||
                e.target.classList.contains('btn-expandir-top1000') ||
                e.target.classList.contains('btn-expandir-top10000')) {
                
                const tipo = e.target.classList.contains('btn-expandir-top100') ? 'top100' :
                           e.target.classList.contains('btn-expandir-top1000') ? 'top1000' : 'top10000';
                
                const lista = document.querySelector(`.${tipo}-lista`);
                const todosDropdowns = document.querySelectorAll('.top100-lista, .top1000-lista, .top10000-lista');
                
                todosDropdowns.forEach(d => {
                    if (d !== lista) d.style.display = 'none';
                });
                
                lista.style.display = lista.style.display === 'none' ? 'block' : 'none';
                e.target.textContent = lista.style.display === 'none' ? '↓' : '↑';
            }

            // Fechar dropdowns ao clicar fora
            if (!e.target.classList.contains('btn-expandir-top100') && 
                !e.target.classList.contains('btn-expandir-top1000') &&
                !e.target.classList.contains('btn-expandir-top10000')) {
                const dropdowns = document.querySelectorAll('.top100-lista, .top1000-lista, .top10000-lista');
                dropdowns.forEach(d => d.style.display = 'none');
                document.querySelectorAll('.btn-expandir-top100, .btn-expandir-top1000, .btn-expandir-top10000')
                    .forEach(btn => btn.textContent = '↓');
            }
        });

        // Tooltips
        const tooltips = [
            { btn: '.btn-info-top100', tooltip: '.info-top100-tooltip' },
            { btn: '.btn-info-top1000', tooltip: '.info-top1000-tooltip' },
            { btn: '.btn-info-top10000', tooltip: '.info-top10000-tooltip' },
            { btn: '.btn-info-bsr', tooltip: '.info-bsr-tooltip' }
        ];

        tooltips.forEach(({ btn, tooltip }) => {
            const btnElement = document.querySelector(btn);
            const tooltipElement = document.querySelector(tooltip);
            if (btnElement && tooltipElement) {
                btnElement.addEventListener('mouseenter', () => {
                    tooltipElement.style.display = 'block';
                });
                btnElement.addEventListener('mouseleave', () => {
                    tooltipElement.style.display = 'none';
                });
            }
        });
    }
}

window.TableManager = TableManager; 