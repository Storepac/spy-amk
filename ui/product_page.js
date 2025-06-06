class ProductPageManager {
    static inicializarPaginaProduto() {
        // Cria o wrapper principal que vai conter o painel e o botão de toggle
        const wrapper = document.createElement('div');
        wrapper.id = 'amk-spy-wrapper';
        wrapper.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            z-index: 999;
            display: flex;
            justify-content: flex-end;
            font-family: Arial, sans-serif;
            background-color: rgba(0, 0, 0, 0.5);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;

        // Cria o botão de toggle
        const toggleButton = document.createElement('button');
        toggleButton.id = 'amk-spy-toggle';
        toggleButton.innerHTML = `
            <div style="writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg);">
                <span style="font-weight: bold; margin-bottom: 8px;">AMK SKY</span>
                <span style="font-size: 20px;">→</span>
            </div>
        `;
        toggleButton.style.cssText = `
            position: fixed;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            background: #00b205;
            border: none;
            color: white;
            padding: 16px 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px 0 0 4px;
            box-shadow: -2px 0 5px rgba(0,0,0,0.1);
            z-index: 999998;
        `;

        // Cria o container principal
        const container = document.createElement('div');
        container.id = 'amk-spy-product-page';
        container.style.cssText = `
            width: 460px;
            height: 100vh;
            background: #ffffff;
            border-left: 1px solid #e7e7e7;
            display: flex;
            flex-direction: column;
            transform: translateX(460px);
            transition: transform 0.3s ease;
        `;

        // Adiciona o conteúdo do painel
        container.innerHTML = `
            <div class="header" style="
                background: #00b205;
                padding: 12px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
            ">
                <div style="
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                ">AMK SKY</div>
                </div>
                <button id="amk-spy-close" style="
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 4px;
                    font-size: 18px;
                ">✕</button>
            </div>

            <div class="content" style="
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: #f8f8f8;
                font-size: 13px;
            ">
                <div class="produto-info" style="
                    background: white;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 12px;
                    ">
                        <h3 style="
                            margin: 0;
                            font-size: 14px;
                            color: #0F1111;
                        ">Nota do Listing</h3>
                        <button id="nota-listing-btn" style="
                            background: #009944;
                            color: white;
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-weight: bold;
                            font-size: 13px;
                            border: none;
                            cursor: pointer;
                            transition: background-color 0.2s ease;
                        ">9.03</button>
                    </div>

                        <div style="
                            display: flex;
                            gap: 16px;
                        margin-bottom: 16px;
                    ">
                        <img id="produto-imagem" style="
                            width: 120px;
                            height: 120px;
                            object-fit: contain;
                            border-radius: 4px;
                            background: white;
                            border: 1px solid #e7e7e7;
                        ">
                        <div style="flex: 1;">
                        <div style="
                                display: grid;
                                grid-template-columns: auto 1fr;
                                gap: 8px 12px;
                                margin-bottom: 12px;
                            ">
                                <div style="color: #565959;">Listado há</div>
                                <div id="listado-ha">N/A</div>
                                
                                <div style="color: #565959;">ASIN</div>
                                <div id="produto-asin" style="font-family: monospace;"></div>
                                
                                <div style="color: #565959;">EAN</div>
                                <div id="produto-ean">N/A</div>
                                
                                <div style="color: #565959;">Marca</div>
                                <div id="produto-marca"></div>
                            </div>
                        </div>
                    </div>

                    <button id="pesquisar-inpi" style="
                        width: 100%;
                        background: #f8f8f8;
                        border: 1px solid #e7e7e7;
                        border-radius: 4px;
                        padding: 6px 12px;
                        font-size: 12px;
                        color: #0F1111;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 4px;
                    ">
                        <span>PESQUISAR MARCA NO INPI</span>
                        <span style="font-size: 14px;">↗</span>
                    </button>

                    <div style="
                        display: flex;
                        gap: 8px;
                        margin-top: 12px;
                    ">
                        <div class="badge" style="
                            background: #f0f0f0;
                            padding: 2px 6px;
                            border-radius: 3px;
                            font-size: 11px;
                            color: #565959;
                        ">FBA: 0</div>
                        <div class="badge" style="
                            background: #f0f0f0;
                            padding: 2px 6px;
                            border-radius: 3px;
                            font-size: 11px;
                            color: #565959;
                        ">FBM: 1</div>
                    </div>

                    <div style="
                        margin-top: 12px;
                        padding-top: 12px;
                        border-top: 1px solid #e7e7e7;
                        color: #565959;
                        font-size: 12px;
                    ">N/A N/A → N/A N/A</div>
                </div>

                <div class="metricas-container" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin-bottom: 32px;
                ">
                    <div class="metrica-card" style="
                        background: white;
                        padding: 24px;
                        border-radius: 12px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    ">
                        <div style="
                            font-size: 14px;
                            color: #565959;
                            margin-bottom: 8px;
                        ">Vendas Estimadas/Mês</div>
                        <div id="vendas-mes" style="
                            font-size: 24px;
                            color: #00b205;
                            font-weight: 600;
                        ">-</div>
                    </div>

                    <div class="metrica-card" style="
                        background: white;
                        padding: 24px;
                        border-radius: 12px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    ">
                        <div style="
                            font-size: 14px;
                            color: #565959;
                            margin-bottom: 8px;
                        ">Receita Estimada/Mês</div>
                        <div id="receita-mes" style="
                            font-size: 24px;
                            color: #00b205;
                            font-weight: 600;
                        ">-</div>
                    </div>

                    <div class="metrica-card" style="
                        background: white;
                        padding: 24px;
                        border-radius: 12px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    ">
                        <div style="
                            font-size: 14px;
                            color: #565959;
                            margin-bottom: 8px;
                        ">BSR Principal</div>
                        <div id="bsr-principal" style="
                            font-size: 24px;
                            color: #00b205;
                            font-weight: 600;
                        ">-</div>
                        <div id="categoria-principal" style="
                            font-size: 14px;
                            color: #565959;
                            margin-top: 8px;
                        "></div>
                    </div>

                    <div class="metrica-card" style="
                        background: white;
                        padding: 24px;
                        border-radius: 12px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    ">
                        <div style="
                            font-size: 14px;
                            color: #565959;
                            margin-bottom: 8px;
                        ">Dimensões</div>
                        <div id="dimensoes" style="
                            font-size: 18px;
                            color: #00b205;
                        ">-</div>
                        <div id="peso" style="
                            font-size: 14px;
                            color: #565959;
                            margin-top: 8px;
                        "></div>
                    </div>
                </div>

                <div class="calculadora-container" style="
                    background: white;
                    padding: 32px;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                ">
                    <h4 style="
                        margin: 0 0 24px 0;
                        color: #0F1111;
                        font-size: 18px;
                    ">Calculadora de Custos</h4>

                    <div class="input-group" style="margin-bottom: 24px;">
                        <label style="
                            display: block;
                            font-size: 14px;
                            color: #565959;
                            margin-bottom: 8px;
                        ">Custo do Produto</label>
                        <div style="
                            display: flex;
                            align-items: center;
                            background: #f8f8f8;
                            border: 1px solid #e7e7e7;
                            border-radius: 8px;
                            padding: 0 16px;
                        ">
                            <span style="color: #565959;">R$</span>
                            <input type="number" id="custo-produto" style="
                                flex: 1;
                                border: none;
                                outline: none;
                                padding: 12px;
                                font-size: 14px;
                                color: #0F1111;
                                background: transparent;
                            " placeholder="0.00">
                        </div>
                    </div>

                    <div class="input-group" style="margin-bottom: 24px;">
                        <label style="
                            display: block;
                            font-size: 14px;
                            color: #565959;
                            margin-bottom: 8px;
                        ">Margem Desejada</label>
                        <div style="
                            display: flex;
                            align-items: center;
                            background: #f8f8f8;
                            border: 1px solid #e7e7e7;
                            border-radius: 8px;
                            padding: 0 16px;
                        ">
                            <input type="number" id="margem-desejada" style="
                                flex: 1;
                                border: none;
                                outline: none;
                                padding: 12px;
                                font-size: 14px;
                                color: #0F1111;
                                background: transparent;
                            " placeholder="0">
                            <span style="color: #565959;">%</span>
                        </div>
                    </div>

                    <button id="calcular-button" style="
                        background: #00b205;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        width: 100%;
                        margin-top: 8px;
                        transition: background-color 0.2s ease;
                    ">Calcular</button>

                    <div id="resultados" style="
                        margin-top: 24px;
                        padding-top: 24px;
                        border-top: 1px solid #e7e7e7;
                        display: none;
                    ">
                        <div class="resultado-item" style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 16px;
                        ">
                            <span style="color: #565959; font-size: 14px;">Preço de Venda Sugerido</span>
                            <span id="preco-sugerido" style="color: #00b205; font-size: 18px; font-weight: 600;">-</span>
                        </div>
                        <div class="resultado-item" style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 16px;
                        ">
                            <span style="color: #565959; font-size: 14px;">Lucro Estimado</span>
                            <span id="lucro-estimado" style="color: #00b205; font-size: 18px; font-weight: 600;">-</span>
                        </div>
                        <div class="resultado-item" style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        ">
                            <span style="color: #565959; font-size: 14px;">ROI</span>
                            <span id="roi" style="color: #00b205; font-size: 18px; font-weight: 600;">-</span>
                        </div>
                    </div>
                </div>
            </div>

            <div id="nota-listing-modal" style="
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background: white;
                    padding: 24px;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 400px;
                    position: relative;
                ">
                    <button id="fechar-modal" style="
                        position: absolute;
                        top: 12px;
                        right: 12px;
                        background: none;
                        border: none;
                        font-size: 18px;
                        cursor: pointer;
                        padding: 4px;
                    ">✕</button>
                    <h3 style="margin: 0 0 16px 0;">Detalhes do Listing</h3>
                    <div style="margin-bottom: 16px;">
                        <div style="font-weight: bold; margin-bottom: 8px;">Nota: 9.03</div>
                        <div style="color: #565959; font-size: 13px;">
                            Esta nota é calculada com base em diversos fatores incluindo:
                            <ul style="margin: 8px 0; padding-left: 20px;">
                                <li>Qualidade das imagens</li>
                                <li>Descrição do produto</li>
                                <li>Palavras-chave</li>
                                <li>Preço competitivo</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Controla o estado do painel
        let isOpen = false;

        toggleButton.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                // Abre o painel
                wrapper.style.opacity = '1';
                wrapper.style.pointerEvents = 'auto';
                container.style.transform = 'translateX(0)';
                toggleButton.querySelector('span:last-child').textContent = '←';
            } else {
                // Fecha o painel
                wrapper.style.opacity = '0';
                wrapper.style.pointerEvents = 'none';
                container.style.transform = 'translateX(460px)';
                toggleButton.querySelector('span:last-child').textContent = '→';
            }
        });

        // Adiciona os elementos ao DOM
        wrapper.appendChild(container);
        document.body.appendChild(wrapper);
        document.body.appendChild(toggleButton);

        // Previne que cliques dentro do container fechem o painel
        container.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Adiciona funcionalidade para fechar o painel principal clicando no overlay
        wrapper.addEventListener('click', (e) => {
            if (e.target === wrapper) {
                isOpen = false;
                wrapper.style.opacity = '0';
                wrapper.style.pointerEvents = 'none';
                container.style.transform = 'translateX(460px)';
                toggleButton.querySelector('span:last-child').textContent = '→';
            }
        });

        // Adiciona a tecla ESC para fechar o painel principal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                isOpen = false;
                wrapper.style.opacity = '0';
                wrapper.style.pointerEvents = 'none';
                container.style.transform = 'translateX(460px)';
                toggleButton.querySelector('span:last-child').textContent = '→';
            }
        });

        this.inicializarEventos();
        this.carregarDadosProduto();

        return { wrapper, container, toggleButton };
    }

    static inicializarEventos() {
        const custoProdutoInput = document.getElementById('custo-produto');
        const margemDesejadaInput = document.getElementById('margem-desejada');
        const calcularButton = document.getElementById('calcular-button');
        const resultadosDiv = document.getElementById('resultados');
        const precoSugeridoSpan = document.getElementById('preco-sugerido');
        const lucroEstimadoSpan = document.getElementById('lucro-estimado');
        const roiSpan = document.getElementById('roi');

        // Função para formatar valores monetários
        const formatarMoeda = (valor) => {
            return `R$ ${valor.toFixed(2)}`;
        };

        // Função para formatar porcentagem
        const formatarPorcentagem = (valor) => {
            return `${valor.toFixed(1)}%`;
        };

        // Função para calcular os resultados
        const calcularResultados = () => {
            const custoProduto = parseFloat(custoProdutoInput.value) || 0;
            const margemDesejada = parseFloat(margemDesejadaInput.value) || 0;

            if (custoProduto <= 0) {
                alert('Por favor, insira um custo de produto válido.');
                return;
            }

            // Cálculos básicos (você pode ajustar conforme necessário)
            const fatorMarkup = 1 + (margemDesejada / 100);
            const precoSugerido = custoProduto * fatorMarkup;
            const lucroEstimado = precoSugerido - custoProduto;
            const roi = (lucroEstimado / custoProduto) * 100;

            // Atualiza os resultados
            precoSugeridoSpan.textContent = formatarMoeda(precoSugerido);
            lucroEstimadoSpan.textContent = formatarMoeda(lucroEstimado);
            roiSpan.textContent = formatarPorcentagem(roi);

            // Mostra a div de resultados
            resultadosDiv.style.display = 'block';
        };

        // Adiciona o evento de click ao botão
        calcularButton.addEventListener('click', calcularResultados);

        // Adiciona efeito hover ao botão
        calcularButton.addEventListener('mouseenter', () => {
            calcularButton.style.backgroundColor = '#009604';
        });
        calcularButton.addEventListener('mouseleave', () => {
            calcularButton.style.backgroundColor = '#00b205';
        });

        // Permite calcular ao pressionar Enter nos inputs
        custoProdutoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calcularResultados();
        });
        margemDesejadaInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calcularResultados();
        });

        // Adiciona evento ao botão de pesquisa INPI
        const pesquisarInpiBtn = document.getElementById('pesquisar-inpi');
        const marcaElement = document.getElementById('produto-marca');
        
        if (pesquisarInpiBtn && marcaElement) {
            pesquisarInpiBtn.addEventListener('click', () => {
                const marca = marcaElement.textContent.trim();
                if (marca) {
                    const url = `https://busca.inpi.gov.br/pePI/jsp/marcas/Pesquisa_classe_basica.jsp?brand=${encodeURIComponent(marca)}`;
                    window.open(url, '_blank');
                }
            });

            // Efeito hover no botão
            pesquisarInpiBtn.addEventListener('mouseenter', () => {
                pesquisarInpiBtn.style.background = '#f0f0f0';
            });
            pesquisarInpiBtn.addEventListener('mouseleave', () => {
                pesquisarInpiBtn.style.background = '#f8f8f8';
            });
        }

        // Eventos do modal da nota do listing
        const notaListingBtn = document.getElementById('nota-listing-btn');
        const notaListingModal = document.getElementById('nota-listing-modal');
        const fecharModalBtn = document.getElementById('fechar-modal');

        if (notaListingBtn && notaListingModal && fecharModalBtn) {
            notaListingBtn.addEventListener('click', () => {
                notaListingModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });

            fecharModalBtn.addEventListener('click', () => {
                notaListingModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });

            notaListingModal.addEventListener('click', (e) => {
                if (e.target === notaListingModal) {
                    notaListingModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });

            // Mantendo os efeitos hover existentes
            notaListingBtn.addEventListener('mouseenter', () => {
                notaListingBtn.style.backgroundColor = '#007733';
            });
            notaListingBtn.addEventListener('mouseleave', () => {
                notaListingBtn.style.backgroundColor = '#009944';
            });
        }
    }

    static atualizarDadosProduto(produto) {
        // Atualiza a imagem do produto
        const imagemProduto = document.getElementById('produto-imagem');
        if (imagemProduto && produto.imagem) {
            imagemProduto.src = produto.imagem;
            imagemProduto.alt = produto.titulo;
        }

        // Atualiza o título do produto
        const tituloProduto = document.querySelector('h3');
        if (tituloProduto && produto.titulo) {
            tituloProduto.textContent = produto.titulo;
        }

        // Atualiza o ASIN com funcionalidade de cópia
        const asinProduto = document.getElementById('produto-asin');
        if (asinProduto && produto.asin) {
            asinProduto.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <span>${produto.asin}</span>
                    <button onclick="navigator.clipboard.writeText('${produto.asin}')" style="
                        background: none;
                        border: none;
                        padding: 4px;
                        cursor: pointer;
                        color: #565959;
                        font-size: 16px;
                    " title="Copiar ASIN">📋</button>
                </div>
            `;
        }

        // Atualiza o EAN
        const eanProduto = document.getElementById('produto-ean');
        if (eanProduto && produto.ean) {
            eanProduto.textContent = produto.ean;
        }

        // Atualiza a marca
        const marcaProduto = document.getElementById('produto-marca');
        if (marcaProduto && produto.marca) {
            marcaProduto.textContent = produto.marca;
        }

        // Atualiza o tempo de listagem
        const listadoHa = document.getElementById('listado-ha');
        if (listadoHa && produto.listadoHa) {
            listadoHa.textContent = produto.listadoHa;
        }

        // Atualiza as métricas
        const vendasMes = document.getElementById('vendas-mes');
        if (vendasMes && produto.vendasEstimadas) {
            vendasMes.textContent = produto.vendasEstimadas;
        }

        const receitaMes = document.getElementById('receita-mes');
        if (receitaMes && produto.receitaEstimada) {
            receitaMes.textContent = `R$ ${produto.receitaEstimada.toFixed(2)}`;
        }

        const bsrPrincipal = document.getElementById('bsr-principal');
        const categoriaPrincipal = document.getElementById('categoria-principal');
        if (bsrPrincipal && produto.bsr) {
            bsrPrincipal.textContent = `#${produto.bsr}`;
        }
        if (categoriaPrincipal && produto.categoria) {
            categoriaPrincipal.textContent = produto.categoria;
        }
    }

    static iniciarMonitoramento() {
        // Verifica se estamos em uma página de produto (URL contém /dp/)
        if (window.location.href.includes('/dp/')) {
            this.adicionarBotaoAnalise();
            this.inicializarPaginaProduto();
        }

        // Monitora mudanças na URL para páginas de produto
        let urlAnterior = window.location.href;
        setInterval(() => {
            if (window.location.href !== urlAnterior) {
                urlAnterior = window.location.href;
                if (window.location.href.includes('/dp/')) {
                    this.adicionarBotaoAnalise();
                    this.inicializarPaginaProduto();
                }
            }
        }, 1000);
    }

    static adicionarBotaoAnalise() {
        // Remove a função de adicionar botão pois agora usamos o toggle
    }

    static async carregarDadosProduto() {
        try {
            // Encontra a data de listagem
            let listadoHa = 'N/A';
            const dataElements = [
                ...document.querySelectorAll('tr'),
                ...document.querySelectorAll('.a-section .a-row')
            ];
            
            for (const element of dataElements) {
                const text = element.textContent;
                if (text.includes('Disponível para compra desde') || text.includes('Data da primeira disponibilidade')) {
                    const date = text.split(':')[1]?.trim();
                    if (date) {
                        // Calcula quantos dias desde a data de listagem
                        const listingDate = new Date(date);
                        const today = new Date();
                        const diffTime = Math.abs(today - listingDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        listadoHa = `${diffDays} dias`;
                        break;
                    }
                }
            }

            // Encontra o ASIN e EAN
            let asin = '', ean = 'N/A';
            
            // Tenta encontrar nas informações do produto
            const productDetails = document.querySelectorAll('#detailBullets_feature_div li, #detailBulletsWrapper_feature_div li, #productDetails_detailBullets_sections1 tr');
            productDetails.forEach(item => {
                const text = item.textContent.trim();
                if (text.includes('ASIN')) {
                    asin = text.split(':').pop().trim();
                } else if (text.includes('Número do modelo')) {
                    ean = text.split(':').pop().trim();
                }
            });

            // Se não encontrou o ASIN, tenta outras formas
            if (!asin) {
                asin = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/)?.[1] || '';
            }

            // Captura a imagem principal
            let imagem = '';
            const imagemElements = [
                document.querySelector('#landingImage'),
                document.querySelector('#imgBlkFront'),
                document.querySelector('#main-image'),
                document.querySelector('.a-dynamic-image'),
                document.querySelector('#imageBlock_feature_div img')
            ];

            for (const element of imagemElements) {
                if (element?.src) {
                    imagem = element.src.split('?')[0];
                    break;
                }
            }

            // Captura a marca e limpa o texto
            let marca = '';
            const marcaElements = [
                document.querySelector('#bylineInfo'),
                document.querySelector('.po-brand .a-span9'),
                document.querySelector('a#bylineInfo'),
                ...document.querySelectorAll('td.a-span9')
            ];

            for (const element of marcaElements) {
                if (element?.textContent) {
                    marca = element.textContent
                        .trim()
                        .replace('Marca:', '')
                        .replace('Visite a loja', '')
                        .replace('Visitar a loja', '')
                        .split('|')[0] // Remove qualquer texto após o pipe
                        .trim();
                    if (marca) break;
                }
            }

        const produto = {
                titulo: document.getElementById('productTitle')?.textContent.trim(),
                asin,
                ean,
                marca,
                imagem,
                listadoHa
            };

            console.log('Dados capturados:', produto);
        this.atualizarDadosProduto(produto);
        } catch (error) {
            console.error('Erro ao carregar dados do produto:', error);
        }
    }
}

// Inicia o monitoramento assim que o script é carregado
window.ProductPageManager = ProductPageManager;

// Função para verificar quando o DOM estiver pronto
function iniciarQuandoDOMEstiverPronto() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        ProductPageManager.iniciarMonitoramento();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            ProductPageManager.iniciarMonitoramento();
        });
    }
}

// Inicia a verificação
iniciarQuandoDOMEstiverPronto();

// Adiciona um listener para mudanças de URL (navegação SPA)
let urlAnterior = window.location.href;
setInterval(() => {
    if (window.location.href !== urlAnterior) {
        urlAnterior = window.location.href;
        if (window.location.href.includes('/dp/')) {
            ProductPageManager.iniciarMonitoramento();
        }
    }
}, 1000); 