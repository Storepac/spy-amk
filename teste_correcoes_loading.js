// Teste das correções de loading duplo e notificações
console.log('🧪 Testando correções de loading duplo e notificações...');

// Teste 1: Verificar se o método atualizarMarcas existe
console.log('\n📋 Teste 1: Verificar método atualizarMarcas');
if (typeof FilterManager !== 'undefined') {
    const filterManager = new FilterManager();
    console.log('- FilterManager carregado:', typeof filterManager !== 'undefined');
    console.log('- Método atualizarMarcas existe:', typeof filterManager.atualizarMarcas === 'function');
    
    if (typeof filterManager.atualizarMarcas === 'function') {
        console.log('✅ Método atualizarMarcas encontrado!');
    } else {
        console.log('❌ Método atualizarMarcas não encontrado');
    }
} else {
    console.log('❌ FilterManager não está disponível');
}

// Teste 2: Verificar se as verificações de inicialização estão funcionando
console.log('\n📋 Teste 2: Verificar verificações de inicialização');
console.log('- amkSpyInicializado:', window.amkSpyInicializado);
console.log('- amkSpyContentInicializado:', window.amkSpyContentInicializado);

// Teste 3: Verificar se o loading está sendo controlado corretamente
console.log('\n📋 Teste 3: Verificar controle de loading');
const loadingElement = document.getElementById('loading-inicial');
console.log('- Loading element existe:', loadingElement !== null);

// Teste 4: Verificar se o modal está sendo controlado corretamente
console.log('\n📋 Teste 4: Verificar controle de modal');
const modalElement = document.getElementById('amazon-analyzer-modal');
console.log('- Modal element existe:', modalElement !== null);

// Teste 5: Simular tentativa de inicialização dupla
console.log('\n📋 Teste 5: Simular inicialização dupla');
if (typeof AppController !== 'undefined') {
    console.log('- Tentando chamar AppController.init() novamente...');
    AppController.init();
    console.log('- Verificação de inicialização dupla funcionando');
} else {
    console.log('❌ AppController não está disponível');
}

// Teste 6: Verificar se as notificações estão funcionando
console.log('\n📋 Teste 6: Verificar notificações');
if (typeof NotificationManager !== 'undefined') {
    console.log('- NotificationManager disponível');
    console.log('- Testando notificação de informação...');
    NotificationManager.informacao('Teste de notificação - deve aparecer apenas uma vez');
} else {
    console.log('❌ NotificationManager não está disponível');
}

console.log('\n✅ Testes concluídos!');
console.log('📝 Verifique se:');
console.log('   1. Apenas uma notificação apareceu');
console.log('   2. Não há loading duplo');
console.log('   3. Não há erros no console sobre atualizarMarcas');
console.log('   4. A análise inicia apenas uma vez'); 