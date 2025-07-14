// Teste simples das funções restritivas do extrator
function contemIndicadorVendasRestritivo(texto) {
    const textoLower = texto.toLowerCase();
    
    // Padrões específicos que devem aparecer JUNTOS (número + indicador)
    const padroesEspecificos = [
        // Português - padrões completos
        /\d+.*(?:compras|vendidos|compraram|adquirido)/i,
        /(?:mais de|acima de).*\d+.*(?:compras|vendidos|mil|k)/i,
        /\d+.*\+.*(?:compras|vendidos)/i,
        
        // Inglês - padrões completos
        /\d+.*(?:bought|purchased|sold|orders)/i,
        /(?:more than|over|above).*\d+.*(?:bought|purchased|k)/i,
        /\d+.*\+.*(?:bought|purchased)/i,
        
        // Padrões Amazon específicos
        /\d+k?\+?\s*bought/i,
        /bought.*\d+/i,
        /\d+.*mil.*compras/i,
        /mais de.*\d+.*(?:mil|compras)/i
    ];
    
    // Verificar se algum padrão específico é encontrado
    const temPadrao = padroesEspecificos.some(padrao => padrao.test(texto));
    
    if (!temPadrao) {
        return false;
    }
    
    // Filtros para EXCLUIR falsos positivos
    const exclusoes = [
        /\$|\€|€|r\$|usd|price|preço|preco|valor/i, // Preços
        /asin|sku|id|code|código|model|modelo/i,     // IDs/códigos
        /review|rating|estrela|star|\*|avaliação/i,  // Reviews
        /\d{8,}/,                                    // Números muito longos (8+ dígitos)
        /shipping|frete|delivery|entrega/i,          // Frete
        /weight|peso|size|tamanho|dimension/i,       // Especificações
        /warranty|garantia|return|devolução/i        // Políticas
    ];
    
    // Se contém alguma exclusão, rejeitar
    if (exclusoes.some(exclusao => exclusao.test(texto))) {
        return false;
    }
    
    return true;
}

function extrairNumeroVendasRestritivo(texto) {
    // Limpar texto básico
    const textoLimpo = texto
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\u00A0/g, ' ')
        .trim()
        .toLowerCase();
    
    // Padrões APENAS para contextos claros de vendas (muito específicos)
    const padroes = [
        // "Mais de X mil compras" - padrão mais comum
        /(?:mais de|acima de|over|above|more than)\s*(\d+(?:[.,]\d+)?)\s*(mil|thousand|k)\s*(?:compras|vendidos|bought|sold|purchases)/i,
        
        // "X mil compras" direto
        /(\d+(?:[.,]\d+)?)\s*(mil|thousand|k)\s*(?:compras|vendidos|bought|sold|purchases)/i,
        
        // "X+ bought" formato Amazon
        /(\d+(?:[.,]\d+)?)\s*([km])?\s*\+\s*(?:bought|sold|compras|vendidos)/i,
        
        // "bought in past month" formato Amazon com número
        /(\d+(?:[.,]\d+)?)\s*([km])?\s*(?:bought|sold|compras|vendidos)(?:\s+(?:in|no|na))?/i,
        
        // Números com separadores seguidos de contexto claro
        /(\d{1,3}(?:[.,]\d{3})*)\s*(?:compras|vendidos|bought|sold|purchases)/i,
        
        // "Mais de X compras" sem multiplicador
        /(?:mais de|acima de|over|above|more than)\s*(\d{1,6})\s*(?:compras|vendidos|bought|sold|purchases)/i
    ];
    
    for (let i = 0; i < padroes.length; i++) {
        const match = textoLimpo.match(padroes[i]);
        
        if (match) {
            let numeroStr = match[1].replace(/[^\d.,]/g, '');
            let numero = 0;
            
            // Processar número baseado no formato
            if (numeroStr.includes('.') && numeroStr.includes(',')) {
                if (numeroStr.lastIndexOf('.') > numeroStr.lastIndexOf(',')) {
                    numero = parseFloat(numeroStr.replace(/,/g, ''));
                } else {
                    numero = parseFloat(numeroStr.replace(/\./g, '').replace(',', '.'));
                }
            } else if (numeroStr.includes('.') && numeroStr.split('.')[1]?.length > 2) {
                // Separador de milhares
                numero = parseFloat(numeroStr.replace(/\./g, ''));
            } else if (numeroStr.includes(',') && numeroStr.split(',')[1]?.length > 2) {
                // Separador de milhares
                numero = parseFloat(numeroStr.replace(/,/g, ''));
            } else {
                numero = parseFloat(numeroStr.replace(/[,.]/, '.'));
            }
            
            // Aplicar multiplicadores se especificados
            const multiplicador = match[2] ? match[2].toLowerCase() : '';
            if (multiplicador) {
                if (multiplicador === 'mil' || multiplicador === 'k' || multiplicador === 'thousand') {
                    numero = numero * 1000;
                } else if (multiplicador === 'm' || multiplicador === 'million') {
                    numero = numero * 1000000;
                }
            }
            
            // Para padrões com "mais de" ou "+", aplicar margem pequena
            if (textoLimpo.includes('mais de') || textoLimpo.includes('acima de') || 
                textoLimpo.includes('above') || textoLimpo.includes('over') || 
                textoLimpo.includes('more than') || textoLimpo.includes('+')) {
                numero = Math.floor(numero * 1.1); // Apenas 10% de margem
            }
            
            // Validação RÍGIDA: entre 1 e 50 milhões (range mais restritivo)
            if (numero >= 1 && numero <= 50000000) {
                return Math.floor(numero);
            }
        }
    }
    
    return 0;
}

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
    if (contemIndicadorVendasRestritivo(caso)) {
        const vendas = extrairNumeroVendasRestritivo(caso);
        console.log(`${index + 1}. "${caso}" → ${vendas} vendas ✅`);
    } else {
        console.log(`${index + 1}. "${caso}" → REJEITADO ❌`);
    }
});

console.log('\n❌ CASOS DE FALSOS POSITIVOS (devem retornar 0):');
let falsosPositivosDetectados = 0;
casosFalsosPositivos.forEach((caso, index) => {
    if (contemIndicadorVendasRestritivo(caso)) {
        const vendas = extrairNumeroVendasRestritivo(caso);
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
    if (contemIndicadorVendasRestritivo(texto)) {
        const vendas = extrairNumeroVendasRestritivo(texto);
        console.log(`${index + 1}. "${texto}" → ${vendas} vendas ⚠️ PROBLEMA!`);
    } else {
        console.log(`${index + 1}. "${texto}" → REJEITADO CORRETAMENTE ✅`);
    }
}); 