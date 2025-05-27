class ProductExtractor {
    static async extrairDetalhesProduto(url) {
        console.info("Extraindo detalhes do produto:", url);
        let marca = '';
        
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Buscar marca na tabela de especificações
            console.info("Tentando extrair marca da tabela de especificações");
            const marcaRow = doc.querySelector('tr.po-brand td:nth-child(2) span');
            if (marcaRow) {
                marca = marcaRow.textContent.trim();
            } else {
                console.info("Tentando extrair marca por qualquer linha que contenha 'Marca'");
                const rows = doc.querySelectorAll('table tr');
                for (const row of rows) {
                    const labelCell = row.querySelector('td:first-child span');
                    if (labelCell && labelCell.textContent.trim() === 'Marca') {
                        const valueCell = row.querySelector('td:nth-child(2) span');
                        if (valueCell) {
                            marca = valueCell.textContent.trim();
                            console.info("Marca encontrada:", marca);
                            break;
                        }
                    }
                }
                
                if (!marca) {
                    console.info("Tentando extrair marca do bylineInfo");
                    const bylineInfo = doc.querySelector('#bylineInfo');
                    if (bylineInfo) {
                        const marcaText = bylineInfo.textContent.trim();
                        if (marcaText.startsWith('Marca:')) {
                            marca = marcaText.replace('Marca:', '').trim();
                        } else {
                            console.info("Tentando extrair marca do bylineInfo com regex");
                            const marcaMatch = bylineInfo.textContent.match(/Marca:\s*([^]+)/);
                            console.info("Marca match:", marcaMatch);
                            marca = marcaMatch ? marcaMatch[1].trim() : '';
                        }
                    }
                }
            }

            const precoElement = doc.querySelector('.a-price .a-offscreen');
            const preco = precoElement ? precoElement.textContent.trim() : '';
            const precoNumerico = parseFloat(preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

            const titulo = doc.querySelector('#productTitle')?.textContent.trim() || '';

            const vendidosElement = doc.querySelector('.a-color-secondary');
            const vendidosTexto = vendidosElement?.textContent || '';
            const vendas = vendidosTexto.includes('compras') ? 
                parseInt(vendidosTexto.match(/(\d+)/)?.[1] || '0') : 0;

            return {
                marca,
                titulo,
                preco,
                precoNumerico,
                vendas,
                receitaMes: precoNumerico * vendas
            };
        } catch (error) {
            console.error('Erro ao buscar detalhes do produto:', error);
            return null;
        } finally {
            console.info('Marca extraída:', marca);
        }
    }

    static extrairDadosProduto(elemento) {
        const dados = {
            asin: elemento.getAttribute('data-asin'),
            titulo: elemento.querySelector('h2 span')?.textContent?.trim() || '',
            precoElement: elemento.querySelector('.a-price .a-offscreen'),
            preco: elemento.querySelector('.a-price .a-offscreen')?.textContent?.trim() || '',
            precoNumerico: 0,
            avaliacaoElement: elemento.querySelector('.a-icon-alt'),
            avaliacao: '',
            avaliacaoNumerica: 0,
            numAvaliacoesElement: elemento.querySelector('a[aria-label*="classificações"]'),
            numAvaliacoes: 0,
            imagemElement: elemento.querySelector('.s-image'),
            imagem: elemento.querySelector('.s-image')?.src || '',
            linkElement: elemento.querySelector('a.a-link-normal.s-link-style.a-text-normal'),
            link: '',
            vendidosElement: elemento.querySelector('.a-color-secondary'),
            vendidos: 0,
            patrocinado: elemento.querySelector('.puis-sponsored-label-text') !== null,
            posicaoMatch: elemento.getAttribute('data-cel-widget')?.match(/search_result_(\d+)/),
            posicao: '',
            marca: ''
        };
        
        const bylineInfo = elemento.querySelector('.a-size-base.a-color-secondary');
        if (bylineInfo && bylineInfo.textContent.includes('Marca:')) {
            const marcaText = bylineInfo.textContent.trim();
            dados.marca = marcaText.startsWith('Marca:') ? marcaText : '';
        }
        
        dados.precoNumerico = parseFloat(dados.preco.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        
        const avaliacaoMatch = dados.avaliacaoElement?.textContent?.match(/(\d+,\d+)/);
        dados.avaliacao = avaliacaoMatch ? avaliacaoMatch[1] : '';
        dados.avaliacaoNumerica = parseFloat(dados.avaliacao.replace(',', '.')) || 0;
        
        dados.numAvaliacoes = parseInt(dados.numAvaliacoesElement?.getAttribute('aria-label')?.match(/(\d+)/)?.[1] || '0');
        
        const linkRelativo = dados.linkElement?.getAttribute('href') || '';
        dados.link = linkRelativo ? `https://www.amazon.com.br${linkRelativo}` : '';
        
        const vendidosTexto = dados.vendidosElement?.textContent || '';
        if (vendidosTexto.includes('compras')) {
            const numeroMatch = vendidosTexto.match(/(\d+)/);
            const numero = parseInt(numeroMatch?.[1] || '0');
            
            if (vendidosTexto.includes('mil')) {
                dados.vendidos = numero * 1000;
            } else {
                dados.vendidos = numero;
            }
        }
        
        dados.posicao = dados.posicaoMatch ? dados.posicaoMatch[1] : '';
        
        return dados;
    }
}

window.ProductExtractor = ProductExtractor; 