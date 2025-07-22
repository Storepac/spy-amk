// Script para migrar extensão do SupabaseManager para DokployManager
console.log('🔄 MIGRAÇÃO PARA DOKPLOY INICIADA\n');

// Configuração do DokployManager
const DOKPLOY_CONFIG = {
    enabled: true,
    baseUrl: 'http://localhost:3000', // URL do backend local
    timeout: 10000,
    retries: 3
};

// Função para substituir SupabaseManager por DokployManager no app.js
function migrarApp() {
    console.log('📝 Migrando app.js...');
    
    // Aqui você pode adicionar lógica para substituir automaticamente
    // Por enquanto, vamos mostrar as mudanças necessárias
    
    console.log('🔧 MUDANÇAS NECESSÁRIAS NO app.js:');
    console.log('');
    console.log('1. Substituir verificação do SupabaseManager:');
    console.log('   ANTES: if (typeof window.supabaseManager === "undefined")');
    console.log('   DEPOIS: if (typeof window.dokployManager === "undefined")');
    console.log('');
    console.log('2. Substituir chamadas de métodos:');
    console.log('   ANTES: window.supabaseManager.analisarPosicoes()');
    console.log('   DEPOIS: window.dokployManager.analisarPosicoes()');
    console.log('');
    console.log('3. Substituir processamento de lotes:');
    console.log('   ANTES: window.supabaseManager.processarListaProdutos()');
    console.log('   DEPOIS: window.dokployManager.processarListaProdutos()');
    console.log('');
}

// Função para verificar se o DokployManager está funcionando
function verificarDokployManager() {
    console.log('🔍 Verificando DokployManager...');
    
    if (typeof window !== 'undefined' && window.dokployManager) {
        console.log('✅ DokployManager está disponível no browser');
        
        // Testar métodos principais
        if (typeof window.dokployManager.testConnection === 'function') {
            console.log('✅ Método testConnection disponível');
        }
        
        if (typeof window.dokployManager.salvarProduto === 'function') {
            console.log('✅ Método salvarProduto disponível');
        }
        
        if (typeof window.dokployManager.salvarPosicao === 'function') {
            console.log('✅ Método salvarPosicao disponível');
        }
        
        return true;
    } else {
        console.log('❌ DokployManager não está disponível');
        console.log('💡 Certifique-se de que o arquivo está carregado no manifest.json');
        return false;
    }
}

// Função para testar salvamento
async function testarSalvamento() {
    console.log('💾 Testando salvamento no Dokploy...');
    
    if (typeof window === 'undefined' || !window.dokployManager) {
        console.log('❌ DokployManager não disponível para teste');
        return;
    }
    
    try {
        // Testar conexão
        console.log('🔌 Testando conexão...');
        await window.dokployManager.testConnection();
        console.log('✅ Conexão funcionando');
        
        // Testar salvamento de produto
        console.log('💾 Testando salvamento de produto...');
        const produtoTeste = {
            asin: 'TEST-MIGRAÇÃO-' + Date.now(),
            titulo: 'Produto de Teste - Migração Dokploy',
            preco: 199.99,
            vendas: 2500,
            ranking: 1,
            categoria: 'Teste',
            marca: 'TesteMarca',
            vendedor: 'TesteVendedor',
            url: 'https://teste-migracao.com',
            imagem: 'https://teste-migracao.com/imagem.jpg',
            vendas_texto_original: '2.5K+ bought',
            vendas_seletor_usado: 'teste-migracao',
            vendas_metodo_extracao: 'restritivo',
            vendas_confiabilidade: 98
        };
        
        const resultadoProduto = await window.dokployManager.salvarProduto(produtoTeste);
        console.log('✅ Produto salvo:', resultadoProduto);
        
        // Testar salvamento de posição
        console.log('📍 Testando salvamento de posição...');
        const posicaoTeste = {
            asin: produtoTeste.asin,
            posicao: 1,
            pagina: 1,
            keyword: 'teste migração dokploy',
            preco_atual: 199.99,
            vendas_atual: 2500
        };
        
        const resultadoPosicao = await window.dokployManager.salvarPosicao(posicaoTeste);
        console.log('✅ Posição salva:', resultadoPosicao);
        
        console.log('🎉 Todos os testes de salvamento passaram!');
        
    } catch (error) {
        console.error('❌ Erro no teste de salvamento:', error.message);
        console.error('💡 Verifique se o backend está rodando: cd aws-backend && npm start');
    }
}

// Função principal de migração
async function executarMigracao() {
    console.log('🚀 INICIANDO MIGRAÇÃO PARA DOKPLOY...\n');
    
    // Passo 1: Mostrar mudanças necessárias
    migrarApp();
    
    // Passo 2: Verificar se DokployManager está disponível
    console.log('\n' + '='.repeat(50));
    const dokployDisponivel = verificarDokployManager();
    
    // Passo 3: Testar salvamento (se disponível)
    if (dokployDisponivel) {
        console.log('\n' + '='.repeat(50));
        await testarSalvamento();
    }
    
    // Passo 4: Instruções finais
    console.log('\n' + '='.repeat(50));
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('');
    console.log('1. ✅ DokployManager já está no manifest.json');
    console.log('2. 🔄 Migrar app.js (substituir supabaseManager por dokployManager)');
    console.log('3. 🚀 Iniciar backend: cd aws-backend && npm start');
    console.log('4. 🧪 Testar extensão em página da Amazon');
    console.log('5. 📊 Verificar dados salvos no banco Dokploy');
    console.log('');
    console.log('💡 DICA: Use o script teste-conexao-dokploy.cjs para verificar o banco');
    console.log('');
}

// Executar migração
if (typeof window !== 'undefined') {
    // Executar no browser
    executarMigracao();
} else {
    // Executar no Node.js
    console.log('📝 Script de migração criado com sucesso!');
    console.log('💡 Execute este script no console do browser para testar a migração');
}

// Exportar para uso no browser
if (typeof window !== 'undefined') {
    window.migrarParaDokploy = executarMigracao;
} 