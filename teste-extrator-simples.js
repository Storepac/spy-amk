// Teste simples do Extrator de Vendas
console.log('🧪 Testando extrator de vendas melhorado...\n');

// Simular função de extração
function contemIndicadorVendas(texto) {
    const indicadores = [
        'compras', 'vendidos', 'vendas', 'comprado', 'compraram', 'vendeu',
        'bought', 'purchased', 'sold', 'orders', 'buyers', 'sales'
    ];
    
    const textoLower = texto.toLowerCase();
    return indicadores.some(indicador => textoLower.includes(indicador));
}

function extrairNumeroVendas(texto) {
    console.log(`🔍 Analisando: "${texto}"`);
    
    const textoLimpo = texto
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    
    // Padrão simples para teste
    const match = textoLimpo.match(/(?:mais de|acima de)\s*(\d+(?:[.,]\d+)?)\s*(mil|thousand|k)/i);
    
    if (match) {
        let numero = parseFloat(match[1].replace(',', '.'));
        if (match[2] && (match[2].includes('mil') || match[2] === 'k' || match[2] === 'thousand')) {
            numero = numero * 1000;
        }
        // Aplicar margem de 15% para "mais de"
        numero = Math.floor(numero * 1.15);
        console.log(`✅ Extraído: ${numero}`);
        return numero;
    }
    
    console.log(`❌ Não encontrado`);
    return 0;
}

// Casos de teste
const casos = [
    "Mais de 4 mil compras no mês passado",
    "5+ mil compras",
    "2,5 mil vendidos",
    "1K+ bought in past month",
    "Preço: R$ 1.500"
];

console.log('📋 Testando casos:\n');

casos.forEach((caso, index) => {
    console.log(`--- Teste ${index + 1} ---`);
    console.log(`Entrada: "${caso}"`);
    
    if (contemIndicadorVendas(caso)) {
        const resultado = extrairNumeroVendas(caso);
        console.log(`Resultado: ${resultado > 0 ? '✅ ' + resultado : '❌ 0'}`);
    } else {
        console.log(`❌ Não contém indicadores de vendas`);
    }
    console.log('');
});

console.log('🎉 Teste concluído!'); 