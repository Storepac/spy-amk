class AppController {
    static async exibirAnalise() {
        if (document.getElementById("amazon-analyzer-modal")) return;
        
        NotificationManager.mostrar('Coletando produtos básicos...');
        const produtos = await ProductAnalyzer.analisarProdutosPesquisaRapido();
        
        if (produtos.length === 0) {
            NotificationManager.mostrar('Nenhum produto encontrado.');
            return;
        }
        
        const modal = document.createElement("div");
        modal.id = "amazon-analyzer-modal";
        modal.innerHTML = TableManager.criarTabelaProdutos(produtos);
        document.body.appendChild(modal);
        
        EventManager.configurarEventosModal(modal);
        
        ProductAnalyzer.buscarDetalhesEmParalelo(produtos, TableManager.atualizarLinhaProduto);
    }

    static async iniciarAnalise(tipo) {
        NotificationManager.mostrar('Coletando produtos básicos...');
        const produtos = await ProductAnalyzer.analisarProdutosPesquisaRapido();
        
        if (produtos.length === 0) {
            NotificationManager.mostrar('Nenhum produto encontrado.');
            return;
        }
        
        const modal = document.createElement("div");
        modal.id = "amazon-analyzer-modal";
        modal.innerHTML = TableManager.criarTabelaProdutos(produtos);
        document.body.appendChild(modal);
        
        EventManager.configurarEventosModal(modal);
        
        ProductAnalyzer.buscarDetalhesEmParalelo(produtos, TableManager.atualizarLinhaProduto);
    }

    static init() {
        if (window.location.href.includes('/s?') || window.location.href.includes('/s/')) {
            EventManager.adicionarBotaoAmkSpy();
            setTimeout(this.exibirAnalise, 2000);
        }
    }
}

window.AppController = AppController; 