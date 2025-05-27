class EventManager {
    static configurarEventosModal(modal) {
        document.getElementById("fechar-analise").addEventListener("click", () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('busca-produto').addEventListener('input', (e) => {
            const busca = e.target.value.toLowerCase();
            document.querySelectorAll('.linha-produto').forEach(linha => {
                const titulo = linha.getAttribute('data-titulo');
                linha.style.display = titulo.includes(busca) ? '' : 'none';
            });
        });
        
        document.getElementById('ordenacao').addEventListener('change', (e) => {
            TableManager.ordenarTabela(e.target.value);
        });
        
        document.getElementById('reload-produtos').addEventListener('click', () => {
            document.getElementById('busca-produto').value = '';
            document.getElementById('ordenacao').value = 'posicao';
            
            document.querySelectorAll('.linha-produto').forEach(linha => {
                linha.style.display = '';
            });
            
            TableManager.ordenarTabela('posicao');
            NotificationManager.mostrar('Produtos recarregados com sucesso!');
        });
        
        const inputNovaBusca = document.getElementById('nova-busca');
        const btnBuscar = document.getElementById('btn-buscar');
        
        function executarBusca() {
            const novoTermo = inputNovaBusca.value.trim();
            if (novoTermo) {
                UrlManager.navegarParaBusca(novoTermo);
            }
        }
        
        btnBuscar.addEventListener('click', executarBusca);
        inputNovaBusca.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executarBusca();
            }
        });
        
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
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
                AppController.iniciarAnalise('todas');
            }
        });
    }
}

window.EventManager = EventManager; 