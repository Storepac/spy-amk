/**
 * TESTE SIMPLES - ML EXTRACTOR NOVO
 * Baseado no sistema Python + Amazon que funciona
 */

console.log('🧪 TESTE ML EXTRACTOR - NOVO SISTEMA');
console.log('=====================================');

// Verificar se estamos no ML
if (!window.location.href.includes('mercadolivre.com.br')) {
    console.error('⚠️ Este teste deve ser executado no MercadoLivre!');
} else {
    console.log('✅ Detectado MercadoLivre - OK');
}

// Verificar se o MLExtractor está carregado
if (typeof MLExtractor === 'undefined') {
    console.error('❌ MLExtractor não encontrado! Carregue o arquivo ml-extractor.js primeiro');
} else {
    console.log('✅ MLExtractor carregado - OK');
    
    // TESTE 1: Verificar seletores básicos
    console.log('\n🔍 TESTE 1: Verificando seletores...');
    
    const elementos = document.querySelectorAll(MLExtractor.SELECTORS.SEARCH_RESULTS);
    console.log(`- Elementos encontrados: ${elementos.length}`);
    
    if (elementos.length > 0) {
        console.log('✅ Seletor principal funcionando');
        
        // Testar primeiro elemento
        const primeiro = elementos[0];
        console.log('\n📋 Testando primeiro elemento:');
        
        // Testar cada seletor
        const titulo = primeiro.querySelector(MLExtractor.SELECTORS.TITLE);
        console.log(`- Título: ${titulo ? '✅ Encontrado' : '❌ Não encontrado'}`);
        
        const preco = primeiro.querySelector(MLExtractor.SELECTORS.PRICE_FRACTION);
        console.log(`- Preço: ${preco ? '✅ Encontrado' : '❌ Não encontrado'}`);
        
        const link = primeiro.querySelector(MLExtractor.SELECTORS.LINK);
        console.log(`- Link MLB: ${link ? '✅ Encontrado' : '❌ Não encontrado'}`);
        
        const imagem = primeiro.querySelector(MLExtractor.SELECTORS.IMAGE);
        console.log(`- Imagem: ${imagem ? '✅ Encontrada' : '❌ Não encontrada'}`);
        
        const vendedor = primeiro.querySelector(MLExtractor.SELECTORS.SELLER);
        console.log(`- Vendedor: ${vendedor ? '✅ Encontrado' : '❌ Não encontrado'}`);
        
        const patrocinado = primeiro.querySelector(MLExtractor.SELECTORS.SPONSORED);
        console.log(`- Patrocinado: ${patrocinado ? '🟡 É patrocinado' : '✅ Não patrocinado'}`);
        
    } else {
        console.error('❌ Nenhum elemento encontrado! Verificar seletor principal');
    }
    
    // TESTE 2: Extração completa
    console.log('\n🚀 TESTE 2: Executando extração completa...');
    
    try {
        const produtos = MLExtractor.extrairProdutos();
        
        console.log(`\n📊 RESULTADOS:`);
        console.log(`- Total produtos extraídos: ${produtos.length}`);
        
        if (produtos.length > 0) {
            console.log('\n🎯 PRIMEIRO PRODUTO:');
            const primeiro = produtos[0];
            
            console.log(`- MLB ID: ${primeiro.mlId}`);
            console.log(`- Título: ${primeiro.titulo?.substring(0, 50)}...`);
            console.log(`- Preço: R$ ${primeiro.preco}`);
            console.log(`- Vendedor: ${primeiro.vendedor}`);
            console.log(`- Vendas: ${primeiro.vendas}`);
            console.log(`- Receita: R$ ${primeiro.receita}`);
            console.log(`- Posição: ${primeiro.posicao}`);
            console.log(`- Patrocinado: ${primeiro.patrocinado ? 'Sim' : 'Não'}`);
            
            // Verificar estrutura do objeto
            console.log('\n🔧 ESTRUTURA DO OBJETO:');
            console.log('Campos obrigatórios:');
            console.log(`- mlId: ${primeiro.mlId ? '✅' : '❌'}`);
            console.log(`- titulo: ${primeiro.titulo ? '✅' : '❌'}`);
            console.log(`- preco: ${primeiro.preco ? '✅' : '❌'}`);
            console.log(`- link: ${primeiro.link ? '✅' : '❌'}`);
            console.log(`- plataforma: ${primeiro.plataforma === 'mercadolivre' ? '✅' : '❌'}`);
            
            // Mostrar mais alguns produtos
            if (produtos.length > 1) {
                console.log('\n📋 RESUMO DOS PRIMEIROS 5 PRODUTOS:');
                produtos.slice(0, 5).forEach((p, i) => {
                    console.log(`${i+1}. ${p.titulo?.substring(0, 40)}... | R$ ${p.preco} | ${p.vendas} vendas | ${p.mlId}`);
                });
            }
            
        } else {
            console.error('❌ Nenhum produto foi extraído!');
        }
        
    } catch (error) {
        console.error('❌ ERRO na extração:', error);
    }
    
    // TESTE 3: Verificar compatibilidade com tabela
    console.log('\n🔗 TESTE 3: Verificando compatibilidade com tabela...');
    
    if (typeof TableManager !== 'undefined') {
        console.log('✅ TableManager encontrado');
        
        // Simular criação da tabela
        try {
            const produtos = MLExtractor.extrairProdutos();
            if (produtos.length > 0) {
                console.log('🧪 Testando criação da tabela...');
                // Não vamos realmente criar a tabela, só verificar se os dados estão corretos
                const temCamposObrigatorios = produtos.every(p => 
                    p.mlId && p.titulo && p.plataforma === 'mercadolivre'
                );
                
                if (temCamposObrigatorios) {
                    console.log('✅ Estrutura de dados compatível com tabela');
                } else {
                    console.error('❌ Estrutura de dados incompatível');
                }
            }
        } catch (error) {
            console.error('❌ Erro no teste de compatibilidade:', error);
        }
    } else {
        console.log('🟡 TableManager não encontrado (normal se não estiver na página principal)');
    }
}

console.log('\n🏁 TESTE CONCLUÍDO');
console.log('====================================='); 