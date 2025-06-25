class ExportManager {
    constructor() {
        this.produtos = [];
    }

    setProdutos(produtos) {
        this.produtos = produtos;
    }

    exportarParaCSV() {
        if (this.produtos.length === 0) {
            NotificationManager.mostrar('Nenhum produto para exportar');
            return;
        }

        // Cabeçalhos do CSV atualizados
        const headers = [
            'Posição',
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
            'Link',
            'URL da Imagem'
        ];

        // Dados dos produtos atualizados
        const csvData = this.produtos.map(produto => [
            produto.posicao || '',
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
            produto.link || '',
            produto.imagem || ''
        ]);

        // Combinar cabeçalhos e dados
        const csvContent = [headers, ...csvData]
            .map(row => row.join(','))
            .join('\n');

        // Adicionar BOM para UTF-8
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

        // Download do arquivo
        this.downloadArquivo(blob, `amk-spy-produtos-${new Date().toISOString().split('T')[0]}.csv`);
        NotificationManager.mostrar(`CSV exportado: ${this.produtos.length} produtos`);
    }

    exportarParaExcel() {
        if (this.produtos.length === 0) {
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
                <p><strong>Total de produtos:</strong> ${this.produtos.length}</p>
                <p><strong>URL da pesquisa:</strong> ${window.location.href}</p>
                
                <h3>Resumo dos Dados</h3>
                <table style="margin-bottom: 20px;">
                    <tr>
                        <td><strong>Receita Total:</strong></td>
                        <td class="currency">R$ ${this.produtos.reduce((total, p) => total + (p.receitaMes || 0), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                        <td><strong>Vendas Totais:</strong></td>
                        <td class="number">${this.produtos.reduce((total, p) => total + (parseInt(p.vendidos) || 0), 0).toLocaleString('pt-BR')}</td>
                    </tr>
                    <tr>
                        <td><strong>Preço Médio:</strong></td>
                        <td class="currency">R$ ${(this.produtos.reduce((total, p) => total + (parseFloat(p.precoNumerico) || 0), 0) / this.produtos.length).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                        <td><strong>Produtos Patrocinados:</strong></td>
                        <td class="number">${this.produtos.filter(p => p.patrocinado).length}</td>
                    </tr>
                </table>
                
                <table>
                    <thead>
                        <tr>
                            <th>Posição</th>
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
                            <th>Link</th>
                            <th>URL da Imagem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.produtos.map(produto => `
                            <tr class="${produto.patrocinado ? 'patrocinado' : 'organico'}">
                                <td class="number">${produto.posicao || ''}</td>
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
                                <td><a href="${produto.link || ''}">${produto.link || ''}</a></td>
                                <td><a href="${produto.imagem || ''}">${produto.imagem || ''}</a></td>
                            </tr>
                        `).join('')}
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
        NotificationManager.mostrar(`Excel exportado: ${this.produtos.length} produtos`);
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

    extrairProdutosDaTabela() {
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
                imagem: linha.querySelector('td:nth-child(2) img')?.src || ''
            };

            // Calcular receita mensal
            const precoNumerico = parseFloat(produto.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            const vendidosNumerico = parseInt(produto.vendidos.replace(/[^\d]/g, '')) || 0;
            produto.receitaMes = precoNumerico * vendidosNumerico;
            produto.precoNumerico = precoNumerico;

            produtos.push(produto);
        });

        this.setProdutos(produtos);
        return produtos;
    }
}

window.ExportManager = ExportManager; 