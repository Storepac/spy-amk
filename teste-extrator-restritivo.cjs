const { ProductExtractor } = require('./core/extractor.js');

// Casos de teste para validar o extrator RESTRITIVO
const casosValidos = [
    'Mais de 4 mil compras no mês passado',
    '2.5K+ bought in past month',
    '1,500+ compras',
    'Mais de 10 mil vendidos',
    '500+ bought',
    '3K bought in past month',
    '2 mil compras'
];

const casosFalsosPositivos = [
    // Preços que não devem ser interpretados como vendas
    'Preço: R$ 65.549,99',
    'Price: $1,234.56',
    'Valor: € 999,99',
    
    // IDs e códigos que não devem ser vendas
    'ASIN: B08N5WRWNW',
    'SKU: 12345678',
    'Modelo: ABC123456789',
    'Código: 65549999',
    
    // Reviews que não devem ser vendas
    '4.5 estrelas (1,234 avaliações)',
    'Rating: 4.8/5 with 999 reviews',
    '5 stars from 10,000 customers',
    
    // Especificações que não devem ser vendas
    'Peso: 1.5 kg',
    'Dimensões: 30x20x10 cm',
    'Garantia: 12 meses',
    
    // Números soltos sem contexto
    '65549999',
    '1234567',
    'Item 999888777',
    
    // Textos genéricos sem indicadores claros
    'Produto muito bom com 500',
    'Disponível em 10 cores diferentes',
    'Entrega em até 7 dias úteis'
];

console.log('🧪 TESTE DO EXTRATOR RESTRITIVO DE VENDAS\n');

console.log('✅ CASOS VÁLIDOS (devem retornar vendas):');
casosValidos.forEach((caso, index) => {
    if (ProductExtractor.contemIndicadorVendasRestritivo(caso)) {
        const vendas = ProductExtractor.extrairNumeroVendasRestritivo(caso);
        console.log(`${index + 1}. "${caso}" → ${vendas} vendas ✅`);
    } else {
        console.log(`${index + 1}. "${caso}" → REJEITADO ❌`);
    }
});

console.log('\n❌ CASOS DE FALSOS POSITIVOS (devem retornar 0):');
let falsosPositivosDetectados = 0;
casosFalsosPositivos.forEach((caso, index) => {
    if (ProductExtractor.contemIndicadorVendasRestritivo(caso)) {
        const vendas = ProductExtractor.extrairNumeroVendasRestritivo(caso);
        console.log(`${index + 1}. "${caso}" → ${vendas} vendas ⚠️ FALSO POSITIVO!`);
        falsosPositivosDetectados++;
    } else {
        console.log(`${index + 1}. "${caso}" → REJEITADO CORRETAMENTE ✅`);
    }
});

console.log(`\n📊 RESULTADO FINAL:`);
console.log(`- Casos válidos processados: ${casosValidos.length}`);
console.log(`- Falsos positivos detectados: ${falsosPositivosDetectados}/${casosFalsosPositivos.length}`);

if (falsosPositivosDetectados === 0) {
    console.log(`🎉 SUCESSO! Extrator restritivo funcionando perfeitamente!`);
} else {
    console.log(`⚠️ ATENÇÃO: ${falsosPositivosDetectados} falsos positivos detectados - revisar filtros`);
}

// Teste específico do problema reportado
console.log(`\n🔍 TESTE ESPECÍFICO DO PROBLEMA (65.549.999):`);
const textosProblematicos = [
    '65549999',
    '65.549.999',
    'ID: 65549999',
    'Código: 65.549.999',
    'Preço: R$ 65.549,99'
];

textosProblematicos.forEach((texto, index) => {
    if (ProductExtractor.contemIndicadorVendasRestritivo(texto)) {
        const vendas = ProductExtractor.extrairNumeroVendasRestritivo(texto);
        console.log(`${index + 1}. "${texto}" → ${vendas} vendas ⚠️ PROBLEMA!`);
    } else {
        console.log(`${index + 1}. "${texto}" → REJEITADO CORRETAMENTE ✅`);
    }
}); 