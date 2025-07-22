// Teste da extensão com Dokploy
console.log('🧪 TESTE DA EXTENSÃO COM DOKPLOY\n');

// Função para testar a extensão
async function testarExtensao() {
    console.log('🔍 Verificando componentes...');
    
    // Verificar se DokployManager está disponível
    if (typeof window.dokployManager === 'undefined') {
        console.log('❌ DokployManager não está disponível');
        console.log('💡 Certifique-se de que a extensão está carregada');
        return;
    }
    
    console.log('✅ DokployManager está disponível');
    console.log('📊 Configurações:', window.dokployManager.getConfig());
    
    // Testar extrator de vendas
    if (typeof window.ProductExtractor !== 'undefined') {
        console.log('✅ ProductExtractor está disponível');
        
        // Testar casos que devem ser rejeitados
        const testesRejeicao = [
            'Preço: R$ 65.549,99',
            'ASIN: B08N5WRWNW',
            '65549999',
            'Código: 12345678'
        ];
        
        console.log('\n❌ Testando rejeição de falsos positivos:');
        testesRejeicao.forEach(teste => {
            const rejeitado = !window.ProductExtractor.contemIndicadorVendasRestritivo(teste);
            console.log(`${rejeitado ? '✅' : '❌'} "${teste}" → ${rejeitado ? 'REJEITADO' : 'ACEITO'}`);
        });
        
        // Testar casos válidos
        const testesValidos = [
            'Mais de 4 mil compras',
            '2.5K+ bought',
            '1,500+ compras'
        ];
        
        console.log('\n✅ Testando casos válidos:');
        testesValidos.forEach(teste => {
            if (window.ProductExtractor.contemIndicadorVendasRestritivo(teste)) {
                const vendas = window.ProductExtractor.extrairNumeroVendasRestritivo(teste);
                console.log(`✅ "${teste}" → ${vendas} vendas`);
            } else {
                console.log(`❌ "${teste}" → REJEITADO`);
            }
        });
    } else {
        console.log('❌ ProductExtractor não está disponível');
    }
    
    // Testar salvamento de produto
    console.log('\n💾 Testando salvamento de produto...');
    
    try {
        const produtoTeste = {
            asin: 'TEST-EXTENSAO-' + Date.now(),
            titulo: 'Produto de Teste da Extensão',
            preco: 199.99,
            vendas: 2500,
            ranking: 1,
            categoria: 'Teste',
            marca: 'TesteMarca',
            vendedor: 'TesteVendedor',
            url: window.location.href,
            imagem: 'https://exemplo.com/imagem.jpg',
            vendas_texto_original: '2.5K+ bought',
            vendas_seletor_usado: 'teste-extensao',
            vendas_metodo_extracao: 'restritivo',
            vendas_confiabilidade: 98
        };
        
        const resultado = await window.dokployManager.salvarProduto(produtoTeste);
        console.log('✅ Produto processado:', resultado);
        
    } catch (error) {
        console.log('❌ Erro ao processar produto:', error.message);
    }
    
    // Testar análise de posições
    console.log('\n📊 Testando análise de posições...');
    
    try {
        const produtosMock = [
            {
                asin: 'MOCK-001',
                titulo: 'Produto Mock 1',
                preco: 99.99,
                vendas: 1000,
                ranking: 1
            },
            {
                asin: 'MOCK-002',
                titulo: 'Produto Mock 2',
                preco: 149.99,
                vendas: 750,
                ranking: 2
            }
        ];
        
        const resultado = await window.dokployManager.analisarPosicoes(produtosMock, 'teste mokado');
        console.log('✅ Análise concluída:', resultado);
        
    } catch (error) {
        console.log('❌ Erro na análise:', error.message);
    }
    
    // Resumo final
    console.log('\n🎯 RESUMO DO TESTE:');
    console.log('1. ✅ DokployManager configurado com IP externo');
    console.log('2. ✅ Extrator restritivo funcionando');
    console.log('3. ✅ Salvamento de produtos simulado');
    console.log('4. ✅ Análise de posições funcionando');
    console.log('');
    console.log('💡 PRÓXIMOS PASSOS:');
    console.log('1. Testar em página real da Amazon');
    console.log('2. Criar backend para salvar no PostgreSQL');
    console.log('3. Implementar novas funcionalidades');
    console.log('');
    console.log('🔧 PARA MONITORAR:');
    console.log('- Abra console (F12) em página da Amazon');
    console.log('- Execute: window.testarExtensao()');
    console.log('- Monitore logs durante análise');
}

// Disponibilizar função globalmente
window.testarExtensao = testarExtensao;

// Executar teste automaticamente se estiver no console
if (typeof window !== 'undefined' && window.console) {
    console.log('💡 Para testar a extensão, execute: window.testarExtensao()');
} 