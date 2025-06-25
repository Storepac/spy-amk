/**
 * TableRowBuilder - Responsável por construir as linhas da tabela
 */
class TableRowBuilder {
    static criarLinhaProduto(produto, index) {
        const asinDuplicado = TableManager.verificarASINDuplicado(produto.asin);
        const corFundo = asinDuplicado ? 'rgba(239, 68, 68, 0.1)' : (index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)');
        const bordaDuplicado = asinDuplicado ? '2px solid #ef4444' : '1px solid var(--border-light)';
        
        return `
            <tr style="
                background: ${corFundo};
                border-bottom: ${bordaDuplicado};
                transition: all 0.2s;
                font-family: 'Poppins', sans-serif;
            " data-asin="${produto.asin}" data-index="${index}" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='var(--bg-secondary)'">
                ${this.criarCelulaPosicao(produto, index)}
                ${this.criarCelulaImagem(produto)}
                ${this.criarCelulaTitulo(produto)}
                ${this.criarCelulaASIN(produto, asinDuplicado)}
                ${this.criarCelulaMarca(produto)}
                ${this.criarCelulaPreco(produto)}
                ${this.criarCelulaAvaliacao(produto)}
                ${this.criarCelulaNumAvaliacoes(produto)}
                ${this.criarCelulaVendidos(produto)}
                ${this.criarCelulaReceita(produto)}
                ${this.criarCelulaBSR(produto)}
                ${this.criarCelulaCategoria(produto)}
                ${this.criarCelulaTipo(produto)}
                ${this.criarCelulaPagina(produto)}
            </tr>
        `;
    }

    static criarCelulaPosicao(produto, index) {
        // Usar posição real da pesquisa se disponível
        const posicaoReal = produto.posicaoGlobal || produto.posicao || (index + 1);
        const paginaOrigem = produto.paginaOrigem || 1;
        const posicaoNaPagina = produto.posicaoNaPagina || (index + 1);
        
        // Determinar cor baseada na posição
        let corFundo = 'linear-gradient(135deg, #014641, #013935)';
        let corTexto = 'white';
        let icone = '📊';
        
        if (posicaoReal <= 10) {
            corFundo = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
            icone = '🥇';
        } else if (posicaoReal <= 50) {
            corFundo = 'linear-gradient(135deg, #6b7280, #4b5563)';
            icone = '🥈';
        } else if (posicaoReal <= 100) {
            corFundo = 'linear-gradient(135deg, #cd7f32, #b8860b)';
            icone = '🥉';
        }
        
        // Se tem informação de página, mostrar mais detalhes
        const temInfoPagina = produto.paginaOrigem && produto.posicaoNaPagina;
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                font-size: 12px;
                font-weight: 600;
                color: ${corTexto};
                border-right: 1px solid var(--border-light);
                background: ${corFundo};
                position: relative;
            " title="${temInfoPagina ? `Página ${paginaOrigem}, posição ${posicaoNaPagina} na página` : 'Posição na pesquisa'}">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 1px;">
                    <div style="font-size: 11px; font-weight: 700;">${icone} ${posicaoReal}</div>
                    ${temInfoPagina ? `<div style="font-size: 9px; opacity: 0.8;">P${paginaOrigem}:${posicaoNaPagina}</div>` : ''}
                </div>
            </td>
        `;
    }

    static criarCelulaImagem(produto) {
        const imagem = produto.imagem || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkMxMiAxNC4zNDMxIDEzLjM0MzEgMTMgMTUgMTNIMjVDMjYuNjU2OSAxMyAyOCAxNC4zNDMxIDI4IDE2VjI0QzI4IDI1LjY1NjkgMjYuNjU2OSAyNyAyNSAyN0gxNUMxMy4zNDMxIDI3IDEyIDI1LjY1NjkgMTIgMjRWMTZaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxOEMxNiAxNi44OTU0IDE2Ljg5NTQgMTYgMTggMTZIMjJDMjMuMTA0NiAxNiAyNCAxNi44OTU0IDI0IDE4VjIyQzI0IDIzLjEwNDYgMjMuMTA0NiAyNCAyMiAyNEgxOEMxNi44OTU0IDI0IDE2IDIzLjEwNDYgMTYgMjJWMThaIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                border-right: 1px solid var(--border-light);
                width: 60px;
            ">
                <img src="${imagem}" alt="Produto" style="
                    width: 40px;
                    height: 40px;
                    object-fit: cover;
                    border-radius: 4px;
                    border: 1px solid var(--border-light);
                " onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkMxMiAxNC4zNDMxIDEzLjM0MzEgMTMgMTUgMTNIMjVDMjYuNjU2OSAxMyAyOCAxNC4zNDMxIDI4IDE2VjI0QzI4IDI1LjY1NjkgMjYuNjU2OSAyNyAyNSAyN0gxNUMxMy4zNDMxIDI3IDEyIDI1LjY1NjkgMTIgMjRWMTZaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxOEMxNiAxNi44OTU0IDE2Ljg5NTQgMTYgMTggMTZIMjJDMjMuMTA0NiAxNiAyNCAxNi44OTU0IDI0IDE4VjIyQzI0IDIzLjEwNDYgMjMuMTA0NiAyNCAyMiAyNEgxOEMxNi44OTU0IDI0IDE2IDIzLjEwNDYgMTYgMjJWMThaIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo='">
            </td>
        `;
    }

    static criarCelulaTitulo(produto) {
        const titulo = produto.titulo || 'Título não disponível';
        const link = produto.link || '#';
        
        return `
            <td style="
                padding: 8px;
                text-align: left;
                border-right: 1px solid var(--border-light);
                max-width: 300px;
            ">
                <a href="${link}" target="_blank" style="
                    color: var(--text-primary);
                    text-decoration: none;
                    font-size: 12px;
                    font-weight: 500;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                " title="${titulo}">${titulo}</a>
            </td>
        `;
    }

    static criarCelulaASIN(produto, asinDuplicado) {
        const asin = produto.asin || 'N/A';
        const estiloDuplicado = asinDuplicado ? 'background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444;' : '';
        const iconeDuplicado = asinDuplicado ? '⚠️ ' : '';
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                border-right: 1px solid var(--border-light);
                font-size: 11px;
                font-weight: 600;
                font-family: 'Courier New', monospace;
            ">
                <button class="btn-copiar-asin" data-asin="${asin}" style="
                    ${estiloDuplicado}
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-light);
                    border-radius: 4px;
                    padding: 4px 8px;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 600;
                    font-family: 'Courier New', monospace;
                    color: var(--text-primary);
                    transition: all 0.2s;
                    width: 100%;
                    max-width: 120px;
                " title="${asinDuplicado ? 'ASIN duplicado detectado!' : 'Clique para copiar ASIN'}">
                    ${iconeDuplicado}${asin}
                </button>
            </td>
        `;
    }

    static criarCelulaMarca(produto) {
        const marca = produto.marca || 'N/A';
        const corMarca = produto.marca ? 'var(--text-primary)' : 'var(--text-secondary)';
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                border-right: 1px solid var(--border-light);
                font-size: 12px;
                font-weight: 500;
                color: ${corMarca};
            ">${marca}</td>
        `;
    }

    static criarCelulaPreco(produto) {
        const preco = produto.preco || 'N/A';
        const precoNumerico = produto.precoNumerico || 0;
        const corPreco = precoNumerico > 0 ? 'var(--text-primary)' : 'var(--text-secondary)';
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                border-right: 1px solid var(--border-light);
                font-size: 12px;
                font-weight: 600;
                color: ${corPreco};
            ">${preco}</td>
        `;
    }

    static criarCelulaAvaliacao(produto) {
        const avaliacao = produto.avaliacao || 'N/A';
        const avaliacaoNumerica = produto.avaliacaoNumerica || 0;
        const estrelas = '⭐'.repeat(Math.floor(avaliacaoNumerica)) + '☆'.repeat(5 - Math.floor(avaliacaoNumerica));
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                border-right: 1px solid var(--border-light);
                font-size: 12px;
            ">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                    <div style="font-size: 10px; color: var(--text-primary); font-weight: 600;">${avaliacao}</div>
                    <div style="font-size: 8px; color: #fbbf24;">${estrelas}</div>
                </div>
            </td>
        `;
    }

    static criarCelulaNumAvaliacoes(produto) {
        const numAvaliacoes = produto.numAvaliacoes || 'N/A';
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                border-right: 1px solid var(--border-light);
                font-size: 12px;
                color: var(--text-primary);
            ">${numAvaliacoes}</td>
        `;
    }

    static criarCelulaVendidos(produto) {
        const vendidos = produto.vendidos || 0;
        const corVendidos = vendidos > 0 ? 'var(--text-primary)' : 'var(--text-secondary)';
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                border-right: 1px solid var(--border-light);
                font-size: 12px;
                font-weight: 600;
                color: ${corVendidos};
            ">${vendidos.toLocaleString('pt-BR')}</td>
        `;
    }

    static criarCelulaReceita(produto) {
        const receita = produto.receitaMes || 0;
        const corReceita = receita > 0 ? 'var(--text-primary)' : 'var(--text-secondary)';
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                border-right: 1px solid var(--border-light);
                font-size: 12px;
                font-weight: 600;
                color: ${corReceita};
            ">R$ ${receita.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
        `;
    }

    static criarCelulaBSR(produto) {
        const ranking = produto.ranking || 'N/A';
        const rankingNumerico = parseInt(ranking) || 0;
        
        let corBSR = 'var(--text-secondary)';
        if (rankingNumerico > 0) {
            if (rankingNumerico <= 100) corBSR = '#10b981';
            else if (rankingNumerico <= 1000) corBSR = '#f59e0b';
            else corBSR = '#ef4444';
        }
        
        return `
            <td class="celula-bsr" style="
                padding: 8px;
                text-align: center;
                border-right: 1px solid var(--border-light);
                font-size: 12px;
                font-weight: 600;
                color: ${corBSR};
                cursor: pointer;
            " title="Clique para ver detalhes do ranking">
                ${ranking}
            </td>
        `;
    }

    static criarCelulaCategoria(produto) {
        const categoria = produto.categoria || 'N/A';
        const corCategoria = produto.categoria ? 'var(--text-primary)' : 'var(--text-secondary)';
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                border-right: 1px solid var(--border-light);
                font-size: 11px;
                color: ${corCategoria};
                max-width: 150px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            " title="${categoria}">${categoria}</td>
        `;
    }

    static criarCelulaTipo(produto) {
        const patrocinado = produto.patrocinado || false;
        const organico = produto.organico || false;
        
        let tipo = 'Orgânico';
        let cor = '#10b981';
        let icone = '🎯';
        
        if (patrocinado && organico) {
            tipo = 'Ambos';
            cor = '#8b5cf6';
            icone = '🔄';
        } else if (patrocinado) {
            tipo = 'Patrocinado';
            cor = '#f59e0b';
            icone = '💰';
        }
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                font-size: 11px;
                font-weight: 500;
                color: ${cor};
            " title="${tipo}">${icone} ${tipo}</td>
        `;
    }

    static criarCelulaPagina(produto) {
        const pagina = produto.paginaOrigem || produto.pagina || '1';
        const corPagina = pagina === '1' ? 'var(--text-primary)' : '#3b82f6';
        
        return `
            <td style="
                padding: 8px;
                text-align: center;
                font-size: 12px;
                font-weight: 600;
                color: ${corPagina};
            " title="Página de origem">${pagina}</td>
        `;
    }
}

window.TableRowBuilder = TableRowBuilder; 