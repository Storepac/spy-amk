class ExportManager {
    constructor() {
        this.produtos = [];
        this.produtosFiltrados = [];
    }

    setProdutos(produtos) {
        this.produtos = produtos;
    }
    
    setProdutosFiltrados(produtosFiltrados) {
        this.produtosFiltrados = produtosFiltrados;
    }

    // Método para obter produtos que devem ser exportados (com filtros aplicados)
    getProdutosParaExportar() {
        // Se existem produtos filtrados, usar eles, senão usar todos os produtos
        return this.produtosFiltrados.length > 0 ? this.produtosFiltrados : this.produtos;
    }

    exportarParaCSV() {
        const produtosExportacao = this.getProdutosParaExportar();
        
        if (produtosExportacao.length === 0) {
            NotificationManager.mostrar('Nenhum produto para exportar');
            return;
        }

        // Cabeçalhos do CSV atualizados
        const headers = [
            'Posição',
            'Tendência',
            'Título',
            'ASIN',
            'Marca',
            'Preço',
            'Avaliação',
            'Número de Avaliações',
            'Vendidos',
            'Receita Mensal',
            'BSR',
            'Categoria',
            'Tipo',
            'Página',
            'Link',
            'URL da Imagem'
        ];

        // Dados dos produtos atualizados
        const csvData = produtosExportacao.map(produto => {
            // Calcular tendência se PositionTracker disponível
            let tendencia = 'N/A';
            if (window.PositionTracker && produto.asin) {
                const tendenciaObj = window.PositionTracker.calcularTendencia(produto.asin);
                tendencia = `${tendenciaObj.icone} ${tendenciaObj.titulo}`;
            }
            
            return [
                produto.posicaoGlobal || produto.posicao || '',
                `"${tendencia}"`,
                `"${(produto.titulo || '').replace(/"/g, '""')}"`,
            produto.asin || '',
            produto.marca || '',
            produto.preco || '',
            produto.avaliacao || '',
            produto.numAvaliacoes || '',
            produto.vendidos || '',
            produto.receitaMes ? `R$ ${produto.receitaMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '',
            produto.ranking || '',
            produto.categoria || '',
            produto.patrocinado ? 'Patrocinado' : 'Orgânico',
            produto.paginaOrigem || '',
            produto.link || '',
            produto.imagem || ''
        ];
        });

        // Combinar cabeçalhos e dados
        const csvContent = [headers, ...csvData]
            .map(row => row.join(','))
            .join('\n');

        // Adicionar BOM para UTF-8
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

        // Download do arquivo
        this.downloadArquivo(blob, `amk-spy-produtos-${new Date().toISOString().split('T')[0]}.csv`);
        NotificationManager.mostrar(`CSV exportado: ${produtosExportacao.length} produtos`);
    }

    exportarParaExcel() {
        const produtosExportacao = this.getProdutosParaExportar();
        
        if (produtosExportacao.length === 0) {
            NotificationManager.mostrar('Nenhum produto para exportar');
            return;
        }

        // Criar HTML para Excel atualizado
        const htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="UTF-8">
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .number { text-align: right; }
                    .currency { text-align: right; }
                    .center { text-align: center; }
                    .patrocinado { background-color: #e3f2fd; }
                    .organico { background-color: #e8f5e8; }
                </style>
            </head>
            <body>
                <h2>AMK Spy - Análise de Produtos Amazon</h2>
                <p><strong>Data de exportação:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <p><strong>Total de produtos:</strong> ${produtosExportacao.length}</p>
                <p><strong>URL da pesquisa:</strong> ${window.location.href}</p>
                
                <h3>Resumo dos Dados</h3>
                <table style="margin-bottom: 20px;">
                    <tr>
                        <td><strong>Receita Total:</strong></td>
                        <td class="currency">R$ ${produtosExportacao.reduce((total, p) => total + (p.receitaMes || 0), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                        <td><strong>Vendas Totais:</strong></td>
                        <td class="number">${produtosExportacao.reduce((total, p) => total + (parseInt(p.vendidos) || 0), 0).toLocaleString('pt-BR')}</td>
                    </tr>
                    <tr>
                        <td><strong>Preço Médio:</strong></td>
                        <td class="currency">R$ ${(produtosExportacao.reduce((total, p) => total + (parseFloat(p.precoNumerico) || 0), 0) / produtosExportacao.length).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                        <td><strong>Produtos Patrocinados:</strong></td>
                        <td class="number">${produtosExportacao.filter(p => p.patrocinado).length}</td>
                    </tr>
                </table>
                
                <table>
                    <thead>
                        <tr>
                            <th>Posição</th>
                            <th>Tendência</th>
                            <th>Título</th>
                            <th>ASIN</th>
                            <th>Marca</th>
                            <th>Preço</th>
                            <th>Avaliação</th>
                            <th>Número de Avaliações</th>
                            <th>Vendidos</th>
                            <th>Receita Mensal</th>
                            <th>BSR</th>
                            <th>Categoria</th>
                            <th>Tipo</th>
                            <th>Página</th>
                            <th>Link</th>
                            <th>URL da Imagem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${produtosExportacao.map(produto => {
                            // Calcular tendência para Excel
                            let tendencia = 'N/A';
                            if (window.PositionTracker && produto.asin) {
                                const tendenciaObj = window.PositionTracker.calcularTendencia(produto.asin);
                                tendencia = `${tendenciaObj.icone} ${tendenciaObj.titulo}`;
                            }
                            
                            return `
                            <tr class="${produto.patrocinado ? 'patrocinado' : 'organico'}">
                                <td class="number">${produto.posicaoGlobal || produto.posicao || ''}</td>
                                <td class="center">${tendencia}</td>
                                <td>${produto.titulo || ''}</td>
                                <td class="center" style="font-family: monospace;">${produto.asin || ''}</td>
                                <td>${produto.marca || ''}</td>
                                <td class="currency">${produto.preco || ''}</td>
                                <td class="number">${produto.avaliacao || ''}</td>
                                <td class="number">${produto.numAvaliacoes || ''}</td>
                                <td class="number">${produto.vendidos || ''}</td>
                                <td class="currency">${produto.receitaMes ? `R$ ${produto.receitaMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : ''}</td>
                                <td class="number">${produto.ranking || ''}</td>
                                <td>${produto.categoria || ''}</td>
                                <td class="center">${produto.patrocinado ? 'Patrocinado' : 'Orgânico'}</td>
                                <td class="number">${produto.paginaOrigem || ''}</td>
                                <td><a href="${produto.link || ''}">${produto.link || ''}</a></td>
                                <td><a href="${produto.imagem || ''}">${produto.imagem || ''}</a></td>
                            </tr>
                        `;
                        }).join('')}
                    </tbody>
                </table>
                
                <h3>Legenda</h3>
                <ul>
                    <li><strong>Posição:</strong> Posição do produto na pesquisa</li>
                    <li><strong>ASIN:</strong> Código único do produto na Amazon</li>
                    <li><strong>BSR:</strong> Best Sellers Rank (ranking de vendas)</li>
                    <li><strong>Receita Mensal:</strong> Preço × Quantidade vendida</li>
                    <li><strong>Tipo:</strong> Patrocinado (anúncio) ou Orgânico (resultado natural)</li>
                </ul>
            </body>
            </html>
        `;

        // Download do arquivo
        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
        this.downloadArquivo(blob, `amk-spy-produtos-${new Date().toISOString().split('T')[0]}.xls`);
        NotificationManager.mostrar(`Excel exportado: ${produtosExportacao.length} produtos`);
    }

    // Nova funcionalidade: Exportação para PDF
    async exportarParaPDF() {
        const produtosExportacao = this.getProdutosParaExportar();
        
        if (produtosExportacao.length === 0) {
            NotificationManager.mostrar('Nenhum produto para exportar');
            return;
        }

        try {
            const htmlContent = this.gerarHTMLRelatorio(produtosExportacao);
            
            // Criar janela temporária para impressão com configurações específicas
            const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
            
            if (!printWindow) {
                NotificationManager.erro('Popup bloqueado! Permita popups para gerar o PDF.');
                return;
            }
            
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // Aguardar carregamento completo antes de imprimir
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.focus(); // Garantir foco na janela
                    printWindow.print();
                    
                    // Fechar janela após impressão (com delay maior)
                    setTimeout(() => {
                        try {
                            printWindow.close();
                        } catch (e) {
                            console.log('Janela já foi fechada pelo usuário');
                        }
                    }, 2000);
                }, 800);
            };
            
            NotificationManager.mostrar(`Relatório PDF gerado: ${produtosExportacao.length} produtos`);
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            NotificationManager.erro('Erro ao gerar relatório PDF');
        }
    }

    gerarHTMLRelatorio(produtos) {
        const stats = this.calcularEstatisticas(produtos);
        const topProdutos = produtos; // TODOS os produtos filtrados, não apenas 10
        
        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Relatório de Análise - AMK Spy</title>
                <style>
                    @media print {
                        @page {
                            margin: 15mm;
                            size: A4;
                        }
                        body { margin: 0; }
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.5;
                        color: #2c3e50;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                        background: linear-gradient(135deg, #014641 0%, #016661 100%);
                        padding: 40px 30px;
                        border-radius: 20px;
                        color: white;
                        box-shadow: 0 15px 40px rgba(1, 70, 65, 0.3);
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .header::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        right: -50%;
                        width: 200%;
                        height: 200%;
                        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                        animation: rotate 20s linear infinite;
                    }
                    
                    .header h1 {
                        color: white;
                        font-size: 36px;
                        margin: 0 0 10px 0;
                        font-weight: 800;
                        text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                        position: relative;
                        z-index: 1;
                    }
                    
                    .header p {
                        color: rgba(255, 255, 255, 0.9);
                        margin: 8px 0;
                        font-size: 16px;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .header p:first-of-type {
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 15px;
                    }
                    
                    @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    
                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                        gap: 20px;
                        margin: 30px 0;
                    }
                    
                    .stat-card {
                        background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
                        border: none;
                        border-radius: 16px;
                        padding: 25px;
                        text-align: center;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                        border-left: 4px solid #014641;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .stat-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 60px;
                        height: 60px;
                        background: linear-gradient(135deg, #014641, #016661);
                        opacity: 0.1;
                        border-radius: 50%;
                        transform: translate(20px, -20px);
                    }
                    
                    .stat-card h3 {
                        color: #014641;
                        margin: 0 0 12px 0;
                        font-size: 13px;
                        text-transform: uppercase;
                        letter-spacing: 1.2px;
                        font-weight: 600;
                    }
                    
                    .stat-card .value {
                        font-size: 28px;
                        font-weight: 800;
                        color: #1a202c;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .section {
                        margin: 40px 0;
                        page-break-inside: avoid;
                    }
                    
                    .section h2 {
                        color: #014641;
                        border-bottom: 2px solid #014641;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }
                    
                    .product-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                        font-size: 12px;
                    }
                    
                    .product-table th,
                    .product-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    
                    .product-table th {
                        background: linear-gradient(135deg, #014641 0%, #016661 100%);
                        color: white;
                        font-weight: 700;
                        text-transform: uppercase;
                        font-size: 11px;
                        letter-spacing: 0.5px;
                        position: sticky;
                        top: 0;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                    }
                    
                    .product-table tr:nth-child(even) {
                        background-color: #f8fafc;
                    }
                    
                    .product-table tr:hover {
                        background-color: #e2e8f0;
                        transform: scale(1.001);
                        transition: all 0.2s ease;
                    }
                    
                    .trend-analysis {
                        background: #e8f5e8;
                        border-left: 4px solid #28a745;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    
                    .insights {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    
                    .footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    
                    .chart-placeholder {
                        background: #f8f9fa;
                        border: 2px dashed #ccc;
                        height: 200px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 20px 0;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📊 Relatório de Análise Amazon</h1>
                    <p><strong>AMK Spy</strong> - Inteligência Competitiva</p>
                    <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
                    <p>Total de produtos analisados: <strong>${produtos.length}</strong></p>
                </div>

                <div class="summary-grid">
                    <div class="stat-card">
                        <h3>💰 Receita Total</h3>
                        <div class="value">R$ ${stats.receitaTotal.toLocaleString('pt-BR')}</div>
                        <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                            ${stats.receitaTotal > 1000000 ? '🔥 Alto potencial' : stats.receitaTotal > 500000 ? '📈 Bom mercado' : '🌱 Nicho emergente'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <h3>📦 Vendas Totais</h3>
                        <div class="value">${stats.vendasTotais.toLocaleString('pt-BR')}</div>
                        <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                            Movimento mensal estimado
                        </div>
                    </div>
                    <div class="stat-card">
                        <h3>💳 Preço Médio</h3>
                        <div class="value">R$ ${stats.precoMedio.toFixed(2)}</div>
                        <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                            ${stats.precoMedio < 100 ? '💸 Baixo custo' : stats.precoMedio < 500 ? '💰 Médio valor' : '💎 Premium'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <h3>⭐ Avaliação Média</h3>
                        <div class="value">${stats.avaliacaoMedia.toFixed(1)} ⭐</div>
                        <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                            ${'⭐'.repeat(Math.floor(stats.avaliacaoMedia))}${'☆'.repeat(5-Math.floor(stats.avaliacaoMedia))}
                        </div>
                    </div>
                    <div class="stat-card">
                        <h3>🏷️ Marcas Únicas</h3>
                        <div class="value">${stats.marcasUnicas}</div>
                        <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                            ${stats.marcasUnicas < 5 ? '🎯 Concentrado' : stats.marcasUnicas < 15 ? '📊 Diversificado' : '🌐 Muito pulverizado'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <h3>📈 BSR Médio</h3>
                        <div class="value">#${Math.round((stats.bsrMin + stats.bsrMax) / 2).toLocaleString('pt-BR')}</div>
                        <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                            ${Math.round((stats.bsrMin + stats.bsrMax) / 2) < 1000 ? '🏆 Top rankeados' : '📊 Competitivo'}
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>🎯 Insights Principais</h2>
                    <div class="insights">
                        <h4>Análise de Competitividade</h4>
                        <ul>
                            <li><strong>Produtos Patrocinados:</strong> ${stats.produtosPatrocinados} (${((stats.produtosPatrocinados/produtos.length)*100).toFixed(1)}%)</li>
                            <li><strong>Marcas Identificadas:</strong> ${stats.marcasUnicas} marcas diferentes</li>
                            <li><strong>Faixa de BSR:</strong> ${stats.bsrMin} - ${stats.bsrMax}</li>
                            <li><strong>Oportunidade de Mercado:</strong> R$ ${stats.receitaTotal.toLocaleString('pt-BR')} em receita mensal</li>
                        </ul>
                    </div>
                </div>

                <div class="section">
                    <h2>📈 Produtos Analisados (${produtos.length} itens)</h2>
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th>Pos.</th>
                                <th>Produto</th>
                                <th>Marca</th>
                                <th>Preço</th>
                                <th>Avaliação</th>
                                <th>Vendidos</th>
                                <th>Receita</th>
                                <th>BSR</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topProdutos.map((produto, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td style="max-width: 200px; word-wrap: break-word;">${produto.titulo?.substring(0, 50) || ''}...</td>
                                    <td>${produto.marca || 'N/A'}</td>
                                    <td>${produto.preco || 'N/A'}</td>
                                    <td>${produto.avaliacao || 'N/A'}</td>
                                    <td>${produto.vendidos || 'N/A'}</td>
                                    <td>R$ ${(produto.receitaMes || 0).toLocaleString('pt-BR')}</td>
                                    <td>${produto.ranking || 'N/A'}</td>
                                    <td>${produto.patrocinado ? '💰 Patr.' : '🌱 Org.'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h2>📊 Análise de Tendências</h2>
                    <div class="trend-analysis">
                        <h4>Indicadores de Mercado</h4>
                        <p><strong>Competitividade:</strong> ${this.calcularNivelCompetitividade(stats)}</p>
                        <p><strong>Saturação:</strong> ${stats.produtosPatrocinados > produtos.length * 0.3 ? 'Alta' : 'Moderada'}</p>
                        <p><strong>Potencial de Entrada:</strong> ${stats.precoMedio < 100 ? 'Alto' : stats.precoMedio < 300 ? 'Médio' : 'Baixo'}</p>
                    </div>
                </div>

                <div class="section">
                    <h2>💡 Recomendações Estratégicas</h2>
                    <div class="insights">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div style="background: #ecfccb; padding: 15px; border-radius: 8px; border-left: 4px solid #65a30d;">
                                <h4 style="color: #365314; margin: 0 0 8px 0;">🎯 Oportunidades</h4>
                                <ul style="margin: 0; color: #374151; font-size: 13px;">
                                    <li>Faixa de preço ideal: R$ ${(stats.precoMedio * 0.8).toFixed(2)} - R$ ${(stats.precoMedio * 1.2).toFixed(2)}</li>
                                    <li>${stats.produtosPatrocinados < produtos.length * 0.3 ? 'Baixa concorrência em anúncios' : 'Alta competição - focar em SEO orgânico'}</li>
                                    <li>Mercado ${stats.marcasUnicas < 10 ? 'concentrado - boa para players estabelecidos' : 'fragmentado - oportunidade para novos entrantes'}</li>
                                </ul>
                            </div>
                            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #d97706;">
                                <h4 style="color: #92400e; margin: 0 0 8px 0;">⚠️ Riscos</h4>
                                <ul style="margin: 0; color: #374151; font-size: 13px;">
                                    <li>${stats.avaliacaoMedia > 4.3 ? 'Padrão de qualidade muito alto' : 'Oportunidade de diferenciação pela qualidade'}</li>
                                    <li>BSR médio: ${Math.round((stats.bsrMin + stats.bsrMax) / 2) < 1000 ? 'Categoria competitiva' : 'Mercado menos concorrido'}</li>
                                    <li>Volume estimado: ${stats.vendasTotais > 5000 ? 'Alto volume - validação de demanda' : 'Volume moderado - testar demanda'}</li>
                                </ul>
                            </div>
                        </div>
                        
                        <h4 style="color: #1f2937; margin: 20px 0 15px 0;">📋 Plano de Ação Recomendado</h4>
                        <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1;">
                            <div style="display: grid; grid-template-columns: auto 1fr; gap: 15px; align-items: start;">
                                <div style="background: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">1</div>
                                <div>
                                    <strong style="color: #1e40af;">Análise Competitiva Detalhada</strong>
                                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 13px;">Mapear os ${Math.min(5, produtos.length)} principais concorrentes e suas estratégias de precificação</p>
                                </div>
                                
                                <div style="background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">2</div>
                                <div>
                                    <strong style="color: #047857;">Validação de Produto</strong>
                                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 13px;">Testar conceito na faixa de preço R$ ${(stats.precoMedio * 0.9).toFixed(2)} com margem ${stats.precoMedio > 200 ? 'premium' : 'competitiva'}</p>
                                </div>
                                
                                <div style="background: #f59e0b; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">3</div>
                                <div>
                                    <strong style="color: #d97706;">Estratégia de Entrada</strong>
                                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 13px;">${stats.produtosPatrocinados > produtos.length * 0.4 ? 'Investir em SEO orgânico inicialmente' : 'Combinar PPC com estratégia orgânica'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 15px; margin-top: 40px;">
                        <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center;">
                            <div>
                                <h4 style="color: #014641; margin: 0 0 8px 0; font-size: 16px;">🔍 AMK Spy - Inteligência Competitiva</h4>
                                <p style="margin: 0; color: #64748b; font-size: 13px;">
                                    Relatório gerado em ${new Date().toLocaleString('pt-BR')} | 
                                    Dados coletados da Amazon Brasil
                                </p>
                                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">
                                    ⚠️ Este relatório contém informações confidenciais para análise estratégica interna
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div style="background: #014641; color: white; padding: 12px 20px; border-radius: 8px; font-size: 12px; font-weight: 600;">
                                    📊 ${produtos.length} Produtos Analisados
                                </div>
                                <div style="margin-top: 8px; font-size: 11px; color: #64748b;">
                                    Versão ${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}
                                </div>
                            </div>
                        </div>
                        
                        <div style="border-top: 1px solid #cbd5e1; margin-top: 20px; padding-top: 15px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 11px; color: #64748b;">
                            <div>
                                <strong>📈 Metodologia:</strong><br>
                                Análise baseada em dados públicos da Amazon
                            </div>
                            <div>
                                <strong>🎯 Precisão:</strong><br>
                                Estimativas com base em algoritmos proprietários
                            </div>
                            <div>
                                <strong>📅 Validade:</strong><br>
                                Dados válidos por 7 dias após geração
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    calcularEstatisticas(produtos) {
        const stats = {
            receitaTotal: produtos.reduce((total, p) => total + (p.receitaMes || 0), 0),
            vendasTotais: produtos.reduce((total, p) => total + (parseInt(p.vendidos) || 0), 0),
            precoMedio: produtos.reduce((total, p) => total + (parseFloat(p.precoNumerico) || 0), 0) / produtos.length,
            avaliacaoMedia: produtos.reduce((total, p) => total + (parseFloat(p.avaliacaoNumerica) || 0), 0) / produtos.length,
            produtosPatrocinados: produtos.filter(p => p.patrocinado).length,
            marcasUnicas: new Set(produtos.map(p => p.marca).filter(m => m && m !== 'N/A')).size,
            bsrMin: Math.min(...produtos.map(p => parseInt(p.ranking) || Infinity).filter(r => r !== Infinity)),
            bsrMax: Math.max(...produtos.map(p => parseInt(p.ranking) || 0))
        };
        
        return stats;
    }

    calcularNivelCompetitividade(stats) {
        let score = 0;
        
        // Avaliar com base em múltiplos fatores
        if (stats.produtosPatrocinados / stats.receitaTotal * 100 > 30) score += 2; // Muitos anúncios = alta competição
        if (stats.avaliacaoMedia > 4.2) score += 1; // Avaliações altas = produtos estabelecidos
        if (stats.marcasUnicas < 5) score += 1; // Poucas marcas = monopolização
        
        if (score >= 3) return 'ALTA - Mercado saturado com players estabelecidos';
        if (score >= 2) return 'MÉDIA - Oportunidades com estratégia diferenciada';
        return 'BAIXA - Mercado com potencial de entrada';
    }

    downloadArquivo(blob, nomeArquivo) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', nomeArquivo);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Método legado mantido para compatibilidade (mas atualizado para usar produtos filtrados)
    extrairProdutosDaTabela() {
        // Se existem produtos filtrados disponíveis, usar eles
        if (this.produtosFiltrados.length > 0) {
            return this.produtosFiltrados;
        }
        
        // Caso contrário, extrair do DOM (método original)
        const linhas = document.querySelectorAll('.linha-produto:not([style*="display: none"])');
        const produtos = [];

        linhas.forEach(linha => {
            const produto = {
                posicao: linha.querySelector('td:nth-child(1)')?.textContent?.trim() || '',
                titulo: linha.querySelector('td:nth-child(3) a')?.textContent?.trim() || '',
                asin: linha.querySelector('td:nth-child(4) span')?.textContent?.trim() || '',
                marca: linha.querySelector('td:nth-child(5)')?.textContent?.trim() || '',
                preco: linha.querySelector('td:nth-child(6)')?.textContent?.trim() || '',
                avaliacao: linha.querySelector('td:nth-child(7) span')?.textContent?.trim() || '',
                numAvaliacoes: linha.querySelector('td:nth-child(8)')?.textContent?.trim() || '',
                vendidos: linha.querySelector('td:nth-child(9)')?.textContent?.trim() || '',
                receitaMes: 0,
                ranking: linha.querySelector('td:nth-child(11) span')?.textContent?.replace('#', '').trim() || '',
                categoria: linha.querySelector('td:nth-child(12)')?.textContent?.trim() || '',
                patrocinado: linha.querySelector('td:nth-child(13) span')?.textContent?.includes('Patrocinado') || false,
                link: linha.querySelector('td:nth-child(3) a')?.href || '',
                imagem: linha.querySelector('td:nth-child(2) img')?.src || '',
                paginaOrigem: linha.querySelector('td:nth-child(10)')?.textContent?.trim() || ''
            };

            // Calcular receita mensal
            const precoNumerico = parseFloat(produto.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            const vendidosNumerico = parseInt(produto.vendidos.replace(/[^\d]/g, '')) || 0;
            produto.receitaMes = precoNumerico * vendidosNumerico;
            produto.precoNumerico = precoNumerico;

            produtos.push(produto);
        });

        return produtos;
    }

    exportarDados() {
        // Obter produtos filtrados do FilterManager se disponível
        let produtosParaExportar = [];
        
        if (window.TableManager && window.TableManager.filterManager) {
            const filterManager = window.TableManager.filterManager;
            
            // Aplicar filtros para obter produtos atualizados
            filterManager.atualizarFiltros();
            produtosParaExportar = filterManager.filtrarProdutos();
            
            console.log('🔍 Produtos filtrados para exportação:', produtosParaExportar.length);
        } else if (window.produtosTabela && window.produtosTabela.length > 0) {
            produtosParaExportar = window.produtosTabela;
        } else {
            // Fallback: tentar extrair da tabela atual
            produtosParaExportar = this.extrairProdutosDaTabela();
        }
        
        if (produtosParaExportar.length === 0) {
            NotificationManager.erro('Nenhum produto encontrado para exportar.');
            return;
        }
        
        // Configurar produtos no ExportManager
        this.setProdutos(produtosParaExportar);
        this.setProdutosFiltrados(produtosParaExportar);
        
        // Mostrar opções de exportação
        this.mostrarOpcoesExportacao();
    }
    
    mostrarOpcoesExportacao() {
        const produtosCount = this.getProdutosParaExportar().length;
        
        // Remover modais existentes para evitar conflito
        const modaisExistentes = document.querySelectorAll('[data-modal="export"]');
        modaisExistentes.forEach(modal => modal.remove());
        
        const modal = document.createElement('div');
        modal.setAttribute('data-modal', 'export');
        modal.id = 'modal-exportacao-amk';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.75);
            z-index: 2147483647;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Poppins', sans-serif;
            backdrop-filter: blur(3px);
            animation: fadeIn 0.3s ease-out;
        `;
        
        modal.innerHTML = `
            <style>
                @keyframes fadeIn { 
                    from { opacity: 0; } 
                    to { opacity: 1; } 
                }
                @keyframes fadeOut { 
                    from { opacity: 1; } 
                    to { opacity: 0; } 
                }
                @keyframes slideUp { 
                    from { transform: translateY(50px) scale(0.9); opacity: 0; } 
                    to { transform: translateY(0) scale(1); opacity: 1; } 
                }
                @keyframes slideDown { 
                    from { transform: translateY(0) scale(1); opacity: 1; } 
                    to { transform: translateY(50px) scale(0.9); opacity: 0; } 
                }
                .modal-content { 
                    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); 
                }
                .btn-export { 
                    transition: all 0.2s ease; 
                    transform: scale(1); 
                    cursor: pointer;
                    user-select: none;
                }
                .btn-export:hover { 
                    transform: scale(1.03); 
                    box-shadow: 0 6px 25px rgba(0,0,0,0.25); 
                    filter: brightness(1.1);
                }
                .btn-export:active { 
                    transform: scale(0.97); 
                }
            </style>
            <div class="modal-content" style="
                background: #ffffff;
                border-radius: 16px;
                padding: 35px;
                max-width: 480px;
                min-width: 400px;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
                border: none;
                position: relative;
            ">
                <h3 style="
                    margin: 0 0 20px 0;
                    font-size: 18px;
                    color: var(--text-primary);
                    font-weight: 600;
                    text-align: center;
                ">📊 Exportar Dados</h3>
                
                <p style="
                    margin: 0 0 25px 0;
                    font-size: 14px;
                    color: var(--text-secondary);
                    text-align: center;
                ">Escolha o formato de exportação para <strong>${produtosCount} produtos</strong>:</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 20px;">
                    <button id="btn-exportar-csv" class="btn-export" style="
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        border: none;
                        border-radius: 12px;
                        padding: 18px 12px;
                        cursor: pointer;
                        color: white;
                        font-size: 14px;
                        font-weight: 600;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                    " title="Exportar dados como CSV para análise em planilhas">
                        <span style="font-size: 24px;">📄</span>
                        <span>CSV</span>
                        <small style="opacity: 0.8; font-size: 11px;">Para planilhas</small>
                    </button>
                    <button id="btn-exportar-excel" class="btn-export" style="
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        border: none;
                        border-radius: 12px;
                        padding: 18px 12px;
                        cursor: pointer;
                        color: white;
                        font-size: 14px;
                        font-weight: 600;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                    " title="Exportar como Excel com formatação avançada">
                        <span style="font-size: 24px;">📊</span>
                        <span>Excel</span>
                        <small style="opacity: 0.8; font-size: 11px;">Com formatação</small>
                    </button>
                </div>
                
                <button id="btn-exportar-pdf" class="btn-export" style="
                    width: 100%;
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    border: none;
                    border-radius: 12px;
                    padding: 20px 16px;
                    cursor: pointer;
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
                    position: relative;
                " title="Gerar relatório executivo em PDF para apresentações">
                    <span style="font-size: 28px;">📋</span>
                    <div style="text-align: left;">
                        <div>Relatório Executivo</div>
                        <small style="opacity: 0.9; font-size: 12px; font-weight: 400;">PDF para apresentações</small>
                    </div>
                </button>
                
                <button id="btn-cancelar-exportar" style="
                    width: 100%;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-light);
                    border-radius: 8px;
                    padding: 10px;
                    cursor: pointer;
                    color: var(--text-primary);
                    font-size: 14px;
                    transition: all 0.2s;
                " title="Cancelar">
                    ❌ Cancelar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Função global para fechar modal com animação
        const fecharModalGlobal = () => {
            modal.style.animation = 'fadeOut 0.2s ease-out';
            setTimeout(() => {
            modal.remove();
            }, 200);
        };
        
        // Aguardar um pequeno delay para garantir que o modal foi renderizado completamente
        setTimeout(() => {
            // Configurar eventos (evitar duplicação)
            const btnCSV = document.getElementById('btn-exportar-csv');
            const btnExcel = document.getElementById('btn-exportar-excel');
            const btnPDF = document.getElementById('btn-exportar-pdf');
            const btnCancelar = document.getElementById('btn-cancelar-exportar');
            
            // Garantir que os elementos existem antes de configurar eventos
            if (btnCSV && btnExcel && btnPDF && btnCancelar) {
                // Remover event listeners anteriores se existirem
                btnCSV.onclick = null;
                btnExcel.onclick = null;
                btnPDF.onclick = null;
                btnCancelar.onclick = null;
                
                // Configurar novos eventos usando onclick para evitar duplicação
                btnCSV.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔄 Exportando CSV...');
                    fecharModalGlobal();
                    setTimeout(() => this.exportarParaCSV(), 250);
                };
                
                btnExcel.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔄 Exportando Excel...');
                    fecharModalGlobal();
                    setTimeout(() => this.exportarParaExcel(), 250);
                };
                
                btnPDF.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔄 Exportando PDF...');
                    fecharModalGlobal();
                    setTimeout(() => this.exportarParaPDF(), 250);
                };
                
                btnCancelar.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('❌ Cancelando exportação...');
                    fecharModalGlobal();
                };
                
                // Adicionar eventos de mouse para feedback visual
                [btnCSV, btnExcel, btnPDF].forEach(btn => {
                    btn.addEventListener('mouseenter', () => {
                        btn.style.transform = 'scale(1.02)';
                        btn.style.transition = 'all 0.2s ease';
                    });
                    
                    btn.addEventListener('mouseleave', () => {
                        btn.style.transform = 'scale(1)';
                    });
                    
                    btn.addEventListener('mousedown', () => {
                        btn.style.transform = 'scale(0.98)';
                    });
                    
                    btn.addEventListener('mouseup', () => {
                        btn.style.transform = 'scale(1.02)';
                    });
                });
                
                console.log('✅ Eventos do modal configurados com sucesso');
            } else {
                console.error('❌ Erro: Botões do modal não encontrados');
            }
        }, 100);
        
        // Fechar ao clicar no backdrop
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                e.preventDefault();
                e.stopPropagation();
                fecharModalGlobal();
            }
        });
        
        // Fechar com ESC
        const handleEscape = (e) => {
            if (e.key === 'Escape' && document.getElementById('modal-exportacao-amk')) {
                e.preventDefault();
                fecharModalGlobal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Impedir que cliques dentro do modal o fechem
        setTimeout(() => {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        }, 50);
        
        // Garantir foco no modal
        modal.tabIndex = -1;
        setTimeout(() => {
            modal.focus();
        }, 100);
    }
}

window.ExportManager = ExportManager; 