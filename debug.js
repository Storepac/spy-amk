// Debug script para testar funcionalidades do AMK Spy
console.log('🔍 AMK Spy Debug - Iniciando testes...');

// Teste 1: Verificar se as classes estão carregadas
console.log('Teste 1 - Classes carregadas:');
console.log('- AppController:', typeof AppController);
console.log('- ProductAnalyzer:', typeof ProductAnalyzer);
console.log('- ProductExtractor:', typeof ProductExtractor);
console.log('- TableManager:', typeof TableManager);
console.log('- NotificationManager:', typeof NotificationManager);
console.log('- ThemeManager:', typeof ThemeManager);

// Teste 2: Verificar se estamos em uma página de pesquisa da Amazon
console.log('Teste 2 - Página atual:');
console.log('- URL:', window.location.href);
console.log('- É página de pesquisa:', window.location.href.includes('/s?') || window.location.href.includes('/s/'));

// Teste 3: Verificar elementos de produtos na página
console.log('Teste 3 - Elementos de produtos:');
const elementosDataAsin = document.querySelectorAll('[data-asin]:not([data-asin=""])');
const elementosSResult = document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]');
const elementosSCard = document.querySelectorAll('.s-card-container');

console.log('- Elementos com data-asin:', elementosDataAsin.length);
console.log('- Elementos s-result-item:', elementosSResult.length);
console.log('- Elementos s-card-container:', elementosSCard.length);

// Teste 4: Testar extração de dados básicos
if (elementosDataAsin.length > 0) {
    console.log('Teste 4 - Extração de dados básicos:');
    const primeiroElemento = elementosDataAsin[0];
    console.log('- Primeiro elemento:', primeiroElemento);
    
    try {
        const dadosBasicos = ProductExtractor.extrairDadosProduto(primeiroElemento);
        console.log('- Dados extraídos:', dadosBasicos);
    } catch (error) {
        console.error('- Erro na extração:', error);
    }
}

// Teste 5: Verificar se o botão AMK Spy foi adicionado
console.log('Teste 5 - Botão AMK Spy:');
const botaoAmkSpy = document.getElementById('amk-spy-button');
console.log('- Botão encontrado:', !!botaoAmkSpy);

// Função para testar análise manual
window.testarAnalise = async function() {
    console.log('🧪 Iniciando teste de análise...');
    
    try {
        const produtos = await ProductAnalyzer.analisarProdutosPesquisaRapido();
        console.log('✅ Produtos coletados:', produtos.length);
        console.log('📊 Primeiro produto:', produtos[0]);
        
        if (produtos.length > 0) {
            // Criar modal de teste
            const modal = document.createElement("div");
            modal.id = "amazon-analyzer-modal";
            modal.innerHTML = TableManager.criarTabelaProdutos(produtos);
            document.body.appendChild(modal);
            
            // Configurar eventos
            EventManager.configurarEventosModal(modal);
            
            console.log('✅ Modal criado com sucesso!');
        }
    } catch (error) {
        console.error('❌ Erro no teste de análise:', error);
    }
};

// Função para limpar modal de teste
window.limparModalTeste = function() {
    const modal = document.getElementById('amazon-analyzer-modal');
    if (modal) {
        modal.remove();
        console.log('✅ Modal de teste removido');
    }
};

console.log('🔍 AMK Spy Debug - Testes concluídos!');
console.log('💡 Use testarAnalise() para testar a funcionalidade completa');
console.log('💡 Use limparModalTeste() para remover o modal de teste'); 