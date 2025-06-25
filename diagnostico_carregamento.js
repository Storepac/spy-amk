// Diagnóstico de carregamento dos componentes
console.log('🔍 Diagnóstico de carregamento dos componentes...');

// Verificar se os componentes estão disponíveis
console.log('\n📋 Status dos componentes:');
console.log('TableManager:', typeof TableManager !== 'undefined' ? '✅ Carregado' : '❌ Não carregado');
console.log('ProductAnalyzer:', typeof ProductAnalyzer !== 'undefined' ? '✅ Carregado' : '❌ Não carregado');
console.log('AppController:', typeof AppController !== 'undefined' ? '✅ Carregado' : '❌ Não carregado');
console.log('NotificationManager:', typeof NotificationManager !== 'undefined' ? '✅ Carregado' : '❌ Não carregado');
console.log('EventManager:', typeof EventManager !== 'undefined' ? '✅ Carregado' : '❌ Não carregado');
console.log('ThemeManager:', typeof ThemeManager !== 'undefined' ? '✅ Carregado' : '❌ Não carregado');

// Verificar se os arquivos foram carregados
console.log('\n📁 Verificação de arquivos carregados:');
const scripts = document.querySelectorAll('script[src*="spy-amk"]');
console.log('Scripts da extensão encontrados:', scripts.length);
scripts.forEach((script, index) => {
    console.log(`${index + 1}. ${script.src}`);
});

// Verificar se há erros no console
console.log('\n🚨 Verificação de erros:');
if (window.onerror) {
    console.log('✅ Handler de erro global configurado');
} else {
    console.log('❌ Handler de erro global não configurado');
}

// Tentar carregar manualmente se necessário
console.log('\n🔧 Tentativa de carregamento manual:');
if (typeof TableManager === 'undefined') {
    console.log('❌ TableManager não está disponível');
    console.log('💡 Tentando carregar manualmente...');
    
    // Verificar se o arquivo existe
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('ui/table.js');
    script.onload = () => {
        console.log('✅ ui/table.js carregado manualmente');
        console.log('TableManager agora:', typeof TableManager !== 'undefined' ? '✅ Disponível' : '❌ Ainda não disponível');
    };
    script.onerror = () => {
        console.log('❌ Erro ao carregar ui/table.js manualmente');
    };
    document.head.appendChild(script);
} else {
    console.log('✅ TableManager já está disponível');
}

// Verificar se há problemas de timing
console.log('\n⏰ Verificação de timing:');
console.log('Document ready state:', document.readyState);
console.log('URL atual:', window.location.href);
console.log('É página de pesquisa:', window.location.href.includes('/s?') || window.location.href.includes('/s/'));

// Verificar se a extensão está ativa
console.log('\n🔌 Status da extensão:');
if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('✅ Chrome extension API disponível');
    console.log('Extension ID:', chrome.runtime.id);
} else {
    console.log('❌ Chrome extension API não disponível');
}

// Verificar se há conflitos
console.log('\n⚡ Verificação de conflitos:');
const elementosConflitantes = document.querySelectorAll('[id*="amazon-analyzer"], [id*="amk-spy"]');
console.log('Elementos da extensão no DOM:', elementosConflitantes.length);

// Sugestões de correção
console.log('\n💡 Sugestões de correção:');
if (typeof TableManager === 'undefined') {
    console.log('1. Recarregue a extensão no Chrome (chrome://extensions/)');
    console.log('2. Verifique se todos os arquivos estão presentes');
    console.log('3. Verifique o console para erros de JavaScript');
    console.log('4. Tente recarregar a página da Amazon');
    console.log('5. Execute: AppController.init() manualmente');
} else {
    console.log('✅ TableManager está funcionando corretamente');
}

console.log('\n🎯 Para testar manualmente:');
console.log('1. Execute: AppController.exibirAnalise()');
console.log('2. Execute: TableManager.criarTabelaProdutos([])');
console.log('3. Execute: teste_filtros_novos.js'); 