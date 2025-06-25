class EventManager {
    static configurarEventosModal(modal) {
        // Botão fechar análise
        const btnFechar = document.getElementById("fechar-analise");
        if (btnFechar) {
            btnFechar.addEventListener("click", () => {
                modal.style.display = 'none';
            });
        }
        
        // Campo de busca por nome
        const buscaProduto = document.getElementById('busca-nome');
        if (buscaProduto) {
            buscaProduto.addEventListener('input', (e) => {
                const busca = e.target.value.toLowerCase();
                document.querySelectorAll('.linha-produto').forEach(linha => {
                    const titulo = linha.querySelector('td:nth-child(3) a')?.textContent?.toLowerCase() || '';
                    linha.style.display = titulo.includes(busca) ? '' : 'none';
                });
            });
        }
        
        // Ordenação de produtos
        const ordenacao = document.getElementById('ordenacao-produtos');
        if (ordenacao) {
            ordenacao.addEventListener('change', (e) => {
                TableManager.ordenarTabela(e.target.value);
            });
        }
        
        // Botão recarregar produtos
        const reloadProdutos = document.getElementById('reload-produtos');
        if (reloadProdutos) {
            reloadProdutos.addEventListener('click', () => {
                const buscaProduto = document.getElementById('busca-nome');
                const ordenacao = document.getElementById('ordenacao-produtos');
                
                if (buscaProduto) buscaProduto.value = '';
                if (ordenacao) ordenacao.value = 'posicao';
                
                document.querySelectorAll('.linha-produto').forEach(linha => {
                    linha.style.display = '';
                });
                
                TableManager.ordenarTabela('posicao');
                NotificationManager.sucesso('Produtos recarregados com sucesso!');
            });
        }
        
        // Nova busca
        const inputNovaBusca = document.getElementById('nova-busca');
        const btnBuscar = document.getElementById('btn-buscar');
        
        function executarBusca() {
            const novoTermo = inputNovaBusca?.value?.trim();
            if (novoTermo) {
                UrlManager.navegarParaBusca(novoTermo);
            }
        }
        
        if (btnBuscar) {
            btnBuscar.addEventListener('click', executarBusca);
        }
        
        if (inputNovaBusca) {
            inputNovaBusca.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    executarBusca();
                }
            });
        }
        
        // Fechar modal ao clicar fora
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Inicializar eventos da tabela
        if (typeof TableManager !== 'undefined') {
            TableManager.inicializarEventos();
        }
    }

    static adicionarBotaoAmkSpy() {
        const menuNavegacao = document.getElementById('nav-tools') || document.getElementById('nav-global-location-slot');
        
        if (!menuNavegacao) return;
        
        const botaoContainer = document.createElement('div');
        botaoContainer.style.cssText = `
            display: inline-block;
            margin: 0 10px;
            position: relative;
        `;
        
        botaoContainer.innerHTML = `
            <button id="amk-spy-button" style="
                background: linear-gradient(135deg, #014641, #013935);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                height: 40px;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='linear-gradient(135deg, #013935, #012925)'"
               onmouseout="this.style.background='linear-gradient(135deg, #014641, #013935)'"
            >
                🔍 AMK spy
            </button>
        `;
        
        menuNavegacao.appendChild(botaoContainer);
        
        document.getElementById('amk-spy-button').addEventListener('click', () => {
            const modal = document.getElementById('amazon-analyzer-modal');
            if (modal) {
                modal.style.display = 'flex';
            } else {
                // Verificar se já está em processo de análise
                if (document.getElementById('loading-inicial')) {
                    console.log('⚠️ Análise já em andamento');
                    return;
                }
                AppController.iniciarAnalise('todas');
            }
        });
    }
}

window.EventManager = EventManager; 