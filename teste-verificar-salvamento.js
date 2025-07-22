// Teste para verificar se os dados foram salvos no banco Dokploy
console.log('🔍 VERIFICANDO SALVAMENTO NO BANCO DOKPLOY\n');

/**
 * Função para testar se os dados foram salvos
 */
async function verificarSalvamento() {
    console.log('📊 Verificando dados salvos...');
    
    // 1. Verificar se há notificações de sucesso
    const notificacoes = document.querySelectorAll('.amk-spy-notification');
    if (notificacoes.length > 0) {
        console.log('✅ Notificações encontradas:');
        notificacoes.forEach(notif => {
            console.log(`   📢 ${notif.textContent}`);
        });
    }
    
    // 2. Verificar localStorage para dados temporários
    const produtosLocal = localStorage.getItem('spy_amk_produtos');
    if (produtosLocal) {
        const produtos = JSON.parse(produtosLocal);
        console.log(`📦 ${produtos.length} produtos no localStorage`);
        
        // Mostrar últimos 3 produtos
        produtos.slice(-3).forEach(produto => {
            console.log(`   • ${produto.asin}: ${produto.titulo}`);
        });
    }
    
    // 3. Verificar se DokployManager está funcionando
    if (typeof window.dokployManager !== 'undefined') {
        console.log('✅ DokployManager está ativo');
        console.log('📊 Configurações:', window.dokployManager.getConfig());
        
        // Testar salvamento de um produto de exemplo
        const produtoTeste = {
            asin: 'B08TEST123',
            titulo: 'Produto de Teste',
            preco: 99.99,
            vendas: 1000,
            ranking: 50000,
            categoria: 'Electronics',
            marca: 'TestBrand'
        };
        
        try {
            const resultado = await window.dokployManager.salvarProduto(produtoTeste);
            console.log('✅ Teste de salvamento:', resultado);
        } catch (error) {
            console.error('❌ Erro no teste de salvamento:', error);
        }
    }
    
    // 4. Verificar console logs de salvamento
    console.log('\n🔍 Procure nos logs do console por mensagens como:');
    console.log('   ✅ "Produto salvo no Supabase"');
    console.log('   ✅ "produtos salvos no banco"');
    console.log('   ✅ "Análise concluída"');
    
    // 5. Verificar se há produtos na tabela atual
    if (window.produtosTabela && window.produtosTabela.length > 0) {
        console.log(`📋 ${window.produtosTabela.length} produtos na tabela atual`);
        
        // Contar produtos com diferentes status
        const novos = window.produtosTabela.filter(p => p.status === 'novo').length;
        const existentes = window.produtosTabela.filter(p => p.status === 'existe').length;
        
        console.log(`   🆕 ${novos} produtos novos`);
        console.log(`   📍 ${existentes} produtos existentes`);
    }
    
    // 6. Instruções para verificar no banco
    console.log('\n💡 PARA VERIFICAR NO BANCO DOKPLOY:');
    console.log('1. Acesse o Dokploy: https://dokploy.com');
    console.log('2. Vá para seu projeto "spy-amk"');
    console.log('3. Clique em "Database" → "PostgreSQL"');
    console.log('4. Abra o terminal/console do banco');
    console.log('5. Execute: SELECT COUNT(*) FROM produtos;');
    console.log('6. Execute: SELECT * FROM produtos ORDER BY criado_em DESC LIMIT 10;');
    
    console.log('\n🔍 COMANDOS SQL ÚTEIS:');
    console.log('-- Ver total de produtos:');
    console.log('SELECT COUNT(*) FROM produtos;');
    console.log('');
    console.log('-- Ver últimos produtos salvos:');
    console.log('SELECT asin, titulo, preco, vendas, criado_em FROM produtos ORDER BY criado_em DESC LIMIT 10;');
    console.log('');
    console.log('-- Ver produtos por termo de pesquisa:');
    console.log("SELECT COUNT(*) FROM posicoes WHERE keyword LIKE '%stunt race%';");
    console.log('');
    console.log('-- Ver posições salvas hoje:');
    console.log("SELECT * FROM posicoes WHERE data_coleta >= CURRENT_DATE;");
}

/**
 * Função para simular verificação de conectividade
 */
async function testarConectividade() {
    console.log('\n🌐 TESTANDO CONECTIVIDADE COM DOKPLOY:');
    
    const config = {
        host: '152.53.192.161',
        port: 5432,
        database: 'spy-amk-db'
    };
    
    console.log('📊 Configurações de conexão:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Database: ${config.database}`);
    
    // Simular teste de conectividade
    console.log('\n⚠️  ATENÇÃO: Extensão não pode conectar diretamente ao banco!');
    console.log('💡 Para salvar dados, precisamos de um backend intermediário.');
    console.log('');
    console.log('🔄 STATUS ATUAL:');
    console.log('   ✅ Dados são extraídos da Amazon');
    console.log('   ✅ Dados são processados pela extensão');
    console.log('   ⚠️  Dados são "simulados" como salvos');
    console.log('   ❌ Dados NÃO são salvos no banco real');
    console.log('');
    console.log('🚀 PARA SALVAR REALMENTE:');
    console.log('   1. Criar backend Node.js');
    console.log('   2. Fazer deploy do backend');
    console.log('   3. Extensão enviar dados para backend');
    console.log('   4. Backend salvar no Dokploy');
}

/**
 * Função para mostrar próximos passos
 */
function mostrarProximosPassos() {
    console.log('\n🎯 PRÓXIMOS PASSOS PARA COMERCIALIZAR:');
    console.log('');
    console.log('1. 🖥️  BACKEND:');
    console.log('   • Criar API Node.js/Express');
    console.log('   • Conectar ao banco Dokploy');
    console.log('   • Implementar autenticação');
    console.log('   • Deploy no Vercel/Railway');
    console.log('');
    console.log('2. 🔐 AUTENTICAÇÃO:');
    console.log('   • Sistema de login');
    console.log('   • Planos (Free/Pro/Enterprise)');
    console.log('   • Limites por usuário');
    console.log('');
    console.log('3. 💳 MONETIZAÇÃO:');
    console.log('   • Integração com Stripe');
    console.log('   • Plano Free: 100 produtos/mês');
    console.log('   • Plano Pro: 5.000 produtos/mês');
    console.log('   • Plano Enterprise: Ilimitado');
    console.log('');
    console.log('4. 📊 DASHBOARD:');
    console.log('   • Interface web para análises');
    console.log('   • Gráficos de tendências');
    console.log('   • Relatórios exportáveis');
    console.log('');
    console.log('5. 📱 DISTRIBUIÇÃO:');
    console.log('   • Chrome Web Store');
    console.log('   • Firefox Add-ons');
    console.log('   • Landing page');
    console.log('   • Documentação');
}

// Executar verificação automaticamente
verificarSalvamento();
testarConectividade();
mostrarProximosPassos();

// Disponibilizar funções globalmente
window.verificarSalvamento = verificarSalvamento;
window.testarConectividade = testarConectividade;
window.mostrarProximosPassos = mostrarProximosPassos; 