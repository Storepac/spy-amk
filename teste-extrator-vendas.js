// Teste do Extrator de Vendas Melhorado
// Script para testar diferentes formatos de números de vendas

console.log('🧪 Iniciando teste do extrator de vendas melhorado...\n');

// Simular classe ProductExtractor (apenas as funções relevantes)
class TestProductExtractor {
    // Função auxiliar para verificar se o texto contém indicadores de vendas (expandida)
    static contemIndicadorVendas(texto) {
        const indicadores = [
            // Português
            'compras', 'vendidos', 'vendas', 'comprado', 'compraram', 'vendeu',
            'adquirido', 'adquiriram', 'comprou', 'mais vendido', 'best seller',
            
            // Inglês
            'bought', 'purchased', 'sold', 'orders', 'buyers', 'customers bought',
            'people bought', 'times ordered', 'sales',
            
            // Espanhol
            'compras', 'vendido', 'comprado', 'compraron',
            
            // Padrões específicos
            'social proof', 'social proofing', 'mais de', 'acima de',
            'above', 'over', 'mil compras', 'thousand bought'
        ];
        
        const textoLower = texto.toLowerCase();
        return indicadores.some(indicador => textoLower.includes(indicador));
    }

    // Função auxiliar robusta para extrair números de vendas do texto (melhorada)
    static extrairNumeroVendas(texto) {
        console.log(`🔍 Analisando: "${texto}"`);
        
        const textoLimpo = texto
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\u00A0/g, ' ')
            .replace(/[^\w\s.,+\-]/g, ' ')
            .trim()
            .toLowerCase();
        
        const padroes = [
            /(?:mais de|acima de|above|over|more than)\s*(\d+(?:[.,]\d+)?)\s*(mil|milhão|milh[õa]o|thousand|million|k|m)(?:\s+(?:compras|vendidos|bought|sold|purchases|sales))?/i,
            /(\d+(?:[.,]\d+)?)\s*\+\s*(mil|milhão|milh[õa]o|thousand|million|k|m)(?:\s+(?:compras|vendidos|bought|sold|purchases|sales))?/i,
            /(\d+(?:[.,]\d+)?)\s*(mil|milhão|milh[õa]o|thousand|million|k|m)(?:\s+(?:compras|vendidos|bought|sold|purchases|sales))?/i,
            /(?:mais de|acima de|above|over|more than)\s*(\d+(?:[.,]\d+)*(?:\.\d{3})*(?:,\d{3})*)(?:\s+(?:compras|vendidos|bought|sold|purchases|sales))?/i,
            /(\d+(?:[.,]\d+)*(?:\.\d{3})*(?:,\d{3})*)\s*\+(?:\s+(?:compras|vendidos|bought|sold|purchases|sales))?/i,
            /(\d+(?:[.,]\d+)*(?:\.\d{3})*(?:,\d{3})*)(?:\s+(?:compras|vendidos|bought|sold|purchases|sales))/i,
            /(\d+(?:[.,]\d+)?)\s*([km])\+?\s*(?:bought|sold|compras|vendidos)/i,
            /(\d+(?:[.,]\d+)*)(?:\s+(?:compras|vendidos|bought|sold|purchases|sales))/i,
            /(?:compras|vendidos|bought|sold|purchases|sales)\s*:?\s*(\d+(?:[.,]\d+)*)/i,
            /(\d+(?:[.,]\d+)*)/i
        ];
        
        for (let i = 0; i < padroes.length; i++) {
            const match = textoLimpo.match(padroes[i]);
            
            if (match) {
                let numeroStr = match[1].replace(/[^\d.,]/g, '');
                let numero = 0;
                
                if (numeroStr.includes('.') && numeroStr.includes(',')) {
                    if (numeroStr.lastIndexOf('.') > numeroStr.lastIndexOf(',')) {
                        numero = parseFloat(numeroStr.replace(/,/g, ''));
                    } else {
                        numero = parseFloat(numeroStr.replace(/\./g, '').replace(',', '.'));
                    }
                } else if (numeroStr.includes('.')) {
                    const pontos = (numeroStr.match(/\./g) || []).length;
                    if (pontos === 1 && numeroStr.split('.')[1].length <= 2) {
                        numero = parseFloat(numeroStr);
                    } else {
                        numero = parseFloat(numeroStr.replace(/\./g, ''));
                    }
                } else if (numeroStr.includes(',')) {
                    const virgulas = (numeroStr.match(/,/g) || []).length;
                    if (virgulas === 1 && numeroStr.split(',')[1].length <= 2) {
                        numero = parseFloat(numeroStr.replace(',', '.'));
                    } else {
                        numero = parseFloat(numeroStr.replace(/,/g, ''));
                    }
                } else {
                    numero = parseFloat(numeroStr);
                }
                
                const multiplicador = match[2] ? match[2].toLowerCase() : '';
                if (multiplicador) {
                    if (multiplicador.includes('mil') || multiplicador === 'k' || multiplicador === 'thousand') {
                        numero = numero * 1000;
                    } else if (multiplicador.includes('milhão') || multiplicador.includes('milh') || multiplicador === 'm' || multiplicador === 'million') {
                        numero = numero * 1000000;
                    }
                }
                
                if (textoLimpo.includes('mais de') || textoLimpo.includes('acima de') || 
                    textoLimpo.includes('above') || textoLimpo.includes('over') || 
                    textoLimpo.includes('more than') || textoLimpo.includes('+')) {
                    numero = Math.floor(numero * 1.15);
                }
                
                if (numero >= 1 && numero <= 100000000) {
                    console.log(`✅ Extraído: ${numero} (padrão ${i + 1})`);
                    return Math.floor(numero);
                }
            }
        }
        
        console.log(`❌ Nenhum número válido encontrado`);
        return 0;
    }
}

// Casos de teste com diferentes formatos
const casosTestе = [
    // Formatos brasileiros comuns
    "Mais de 4 mil compras no mês passado",
    "5+ mil compras",
    "2,5 mil vendidos",
    "Mais de 1.500 compras",
    "3.000+ vendidos",
    "1.234 compras",
    "500 vendidos",
    "Mais de 100 compras",
    
    // Formatos ingleses
    "1K+ bought in past month",
    "2.5K bought",
    "More than 1,000 purchased",
    "500+ sold",
    "1,234 customers bought",
    "Above 2K orders",
    
    // Formatos com milhões
    "Mais de 1 milhão de vendas",
    "2+ milhões vendidos",
    "1.5M sold",
    
    // Formatos complexos
    "10.000+ compras realizadas",
    "Mais de 25.000 vendidos",
    "1,2 mil people bought this",
    "3K+ orders in last month",
    
    // Casos edge
    "Vendas: 1.500",
    "Compras: 2,300",
    "bought: 500+",
    "sold 1000",
    
    // Casos que não devem funcionar
    "Preço: R$ 1.500",
    "Avaliação: 4,5 estrelas",
    "Código: 12345",
    "Sem números de vendas aqui"
];

console.log('📋 Testando casos de extração de vendas:\n');

let testesPassaram = 0;
let totalTestes = 0;

casosTestе.forEach((caso, index) => {
    console.log(`\n--- Teste ${index + 1} ---`);
    console.log(`Entrada: "${caso}"`);
    
    if (TestProductExtractor.contemIndicadorVendas(caso)) {
        const resultado = TestProductExtractor.extrairNumeroVendas(caso);
        console.log(`Resultado: ${resultado > 0 ? '✅ ' + resultado : '❌ 0'}`);
        if (resultado > 0) testesPassaram++;
    } else {
        console.log(`❌ Não contém indicadores de vendas`);
    }
    
    totalTestes++;
});

console.log(`\n🎯 Resumo dos testes:`);
console.log(`✅ Sucessos: ${testesPassaram}/${totalTestes}`);
console.log(`📊 Taxa de sucesso: ${Math.round((testesPassaram/totalTestes) * 100)}%`);

// Teste de performance
console.log(`\n⚡ Teste de performance:`);
const inicio = Date.now();
for (let i = 0; i < 1000; i++) {
    TestProductExtractor.extrairNumeroVendas("Mais de 4 mil compras no mês passado");
}
const fim = Date.now();
console.log(`🕒 1000 execuções em ${fim - inicio}ms (${((fim - inicio)/1000).toFixed(3)}ms por execução)`);

console.log(`\n🎉 Teste do extrator concluído!`); 