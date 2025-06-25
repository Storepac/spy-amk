// Teste de debug dos filtros
console.log('🧪 Teste de debug dos filtros...');

// Verificar se as classes estão carregadas
console.log('📋 Verificando dependências:');
console.log('- FilterManager:', typeof FilterManager !== 'undefined' ? '✅ Carregado' : '❌ Não carregado');
console.log('- TableManager:', typeof TableManager !== 'undefined' ? '✅ Carregado' : '❌ Não carregado');

// Dados de teste
const produtosTeste = [
    {
        asin: 'B001',
        titulo: 'Produto A - 1000 vendas',
        vendidos: 1000,
        precoNumerico: 50,
        marca: 'Marca A',
        patrocinado: true,
        organico: false,
        ranking: 100
    },
    {
        asin: 'B002',
        titulo: 'Produto B - 500 vendas',
        vendidos: 500,
        precoNumerico: 100,
        marca: 'Marca B',
        patrocinado: false,
        organico: true,
        ranking: 500
    },
    {
        asin: 'B003',
        titulo: 'Produto C - 2000 vendas',
        vendidos: 2000,
        precoNumerico: 75,
        marca: 'Marca A',
        patrocinado: true,
        organico: false,
        ranking: 50
    }
];

// Testar filtro de vendas
function testarFiltroVendas() {
    console.log('\n🔍 Testando filtro de vendas...');
    
    if (typeof FilterManager === 'undefined') {
        console.log('❌ FilterManager não está disponível');
        return;
    }
    
    const filterManager = new FilterManager();
    filterManager.setProdutosOriginais(produtosTeste);
    
    // Teste 1: Mais vendidos
    console.log('\n📈 Teste 1: Mais vendidos primeiro');
    filterManager.atualizarFiltro('vendas', 'mais-vendidos');
    const resultado1 = filterManager.aplicarFiltros();
    console.log('Resultado ordenado por mais vendidos:');
    resultado1.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.titulo}: ${p.vendidos} vendas`);
    });
    
    // Teste 2: Menos vendidos
    console.log('\n📉 Teste 2: Menos vendidos primeiro');
    filterManager.atualizarFiltro('vendas', 'menos-vendidos');
    const resultado2 = filterManager.aplicarFiltros();
    console.log('Resultado ordenado por menos vendidos:');
    resultado2.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.titulo}: ${p.vendidos} vendas`);
    });
    
    // Teste 3: Sem filtro de vendas
    console.log('\n🔄 Teste 3: Sem filtro de vendas');
    filterManager.atualizarFiltro('vendas', '');
    const resultado3 = filterManager.aplicarFiltros();
    console.log('Resultado sem ordenação:');
    resultado3.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.titulo}: ${p.vendidos} vendas`);
    });
}

// Testar filtros combinados
function testarFiltrosCombinados() {
    console.log('\n🔍 Testando filtros combinados...');
    
    if (typeof FilterManager === 'undefined') {
        console.log('❌ FilterManager não está disponível');
        return;
    }
    
    const filterManager = new FilterManager();
    filterManager.setProdutosOriginais(produtosTeste);
    
    // Teste: Filtro de marca + vendas
    console.log('\n🏷️ Teste: Filtro de marca + vendas');
    filterManager.atualizarFiltro('marca', 'Marca A');
    filterManager.atualizarFiltro('vendas', 'mais-vendidos');
    const resultado = filterManager.aplicarFiltros();
    console.log('Resultado filtrado por marca A e ordenado por vendas:');
    resultado.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.titulo} (${p.marca}): ${p.vendidos} vendas`);
    });
}

// Executar testes
setTimeout(() => {
    testarFiltroVendas();
    testarFiltrosCombinados();
}, 1000);

console.log('✅ Testes de debug iniciados. Verifique o console.'); 