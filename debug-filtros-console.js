/**
 * 🐛 Debug Filtros AMK Spy
 * Cole este código no console do navegador para testar os filtros
 */

// Função para debug dos filtros
window.debugFiltros = function(filtrosTeste) {
    console.log('🐛 Iniciando debug dos filtros...');
    
    // Verificar se há produtos carregados
    let produtos = [];
    
    // Tentar diferentes fontes de produtos
    if (typeof AppController !== 'undefined' && AppController.produtosArmazenados) {
        produtos = AppController.produtosArmazenados;
        console.log('📊 Usando produtos do AppController:', produtos.length);
    } else if (window.produtosTabela) {
        produtos = window.produtosTabela;
        console.log('📊 Usando produtos da window.produtosTabela:', produtos.length);
    } else {
        console.log('❌ Nenhum produto encontrado para teste');
        return;
    }
    
    if (produtos.length === 0) {
        console.log('❌ Array de produtos está vazio');
        return;
    }
    
    // Usar filtros padrão se não fornecidos
    const filtros = filtrosTeste || {
        bsrTop100: false,
        precoMin: 50,
        precoMax: 200,
        bsrMin: 100,
        bsrMax: 1000,
        vendasMin: null,
        vendasMax: null
    };
    
    console.log('🎯 Filtros de teste:', filtros);
    
    // Analisar cada produto individualmente
    console.log('\n📋 Análise detalhada dos produtos:');
    
    produtos.slice(0, 10).forEach((produto, index) => {
        console.log(`\n🔍 Produto ${index + 1}: ${produto.titulo?.substring(0, 40)}...`);
        
        // Dados brutos
        console.log('   📋 Dados brutos:', {
            ranking: produto.ranking,
            bsr: produto.bsr,
            precoNumerico: produto.precoNumerico,
            preco: produto.preco,
            vendidos: produto.vendidos,
            origem: produto.origem
        });
        
        // Extrair valores como o sistema faz
        let bsr = 0;
        if (produto.ranking && !isNaN(parseInt(produto.ranking))) {
            bsr = parseInt(produto.ranking);
        } else if (produto.bsr && !isNaN(parseInt(produto.bsr))) {
            bsr = parseInt(produto.bsr);
        }
        
        let preco = 0;
        if (produto.precoNumerico && !isNaN(parseFloat(produto.precoNumerico))) {
            preco = parseFloat(produto.precoNumerico);
        } else if (produto.preco) {
            const precoMatch = produto.preco.toString().match(/[\d,\.]+/);
            if (precoMatch) {
                preco = parseFloat(precoMatch[0].replace(',', '.'));
            }
        }
        
        let vendas = parseInt(produto.vendidos) || 0;
        
        console.log('   ✅ Valores extraídos:', { bsr, preco, vendas });
        
        // Testar cada filtro
        let passouFiltros = true;
        let motivosRejeicao = [];
        
        // BSR ≤ 100
        if (filtros.bsrTop100) {
            if (bsr === 0 || bsr > 100) {
                passouFiltros = false;
                motivosRejeicao.push(`BSR ${bsr} > 100`);
            }
        }
        
        // BSR personalizado
        if (!filtros.bsrTop100 && (filtros.bsrMin || filtros.bsrMax)) {
            if (filtros.bsrMin && (bsr === 0 || bsr < filtros.bsrMin)) {
                passouFiltros = false;
                motivosRejeicao.push(`BSR ${bsr} < ${filtros.bsrMin}`);
            }
            if (filtros.bsrMax && (bsr === 0 || bsr > filtros.bsrMax)) {
                passouFiltros = false;
                motivosRejeicao.push(`BSR ${bsr} > ${filtros.bsrMax}`);
            }
        }
        
        // Preço
        if (filtros.precoMin || filtros.precoMax) {
            if (filtros.precoMin && (preco === 0 || preco < filtros.precoMin)) {
                passouFiltros = false;
                motivosRejeicao.push(`Preço R$${preco} < R$${filtros.precoMin}`);
            }
            if (filtros.precoMax && (preco === 0 || preco > filtros.precoMax)) {
                passouFiltros = false;
                motivosRejeicao.push(`Preço R$${preco} > R$${filtros.precoMax}`);
            }
        }
        
        // Vendas
        if (filtros.vendasMin || filtros.vendasMax) {
            if (filtros.vendasMin && vendas < filtros.vendasMin) {
                passouFiltros = false;
                motivosRejeicao.push(`Vendas ${vendas} < ${filtros.vendasMin}`);
            }
            if (filtros.vendasMax && vendas > filtros.vendasMax) {
                passouFiltros = false;
                motivosRejeicao.push(`Vendas ${vendas} > ${filtros.vendasMax}`);
            }
        }
        
        if (passouFiltros) {
            console.log('   ✅ APROVADO nos filtros');
        } else {
            console.log('   ❌ REPROVADO:', motivosRejeicao.join(', '));
        }
    });
    
    // Aplicar filtros usando a função real do sistema
    let produtosFiltrados = [];
    
    if (typeof ProductAnalyzer !== 'undefined' && ProductAnalyzer.aplicarFiltros) {
        console.log('\n🎯 Testando com ProductAnalyzer.aplicarFiltros...');
        produtosFiltrados = ProductAnalyzer.aplicarFiltros(produtos, filtros);
    } else if (typeof SidePanel !== 'undefined' && SidePanel.aplicarFiltrosProdutos) {
        console.log('\n🎯 Testando com SidePanel.aplicarFiltrosProdutos...');
        produtosFiltrados = SidePanel.aplicarFiltrosProdutos(produtos, filtros);
    } else {
        console.log('❌ Funções de filtro não encontradas');
        return;
    }
    
    console.log(`\n📊 RESULTADO: ${produtos.length} → ${produtosFiltrados.length} produtos`);
    
    // Mostrar produtos aprovados
    if (produtosFiltrados.length > 0) {
        console.log('\n✅ Produtos aprovados:');
        produtosFiltrados.slice(0, 5).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.titulo?.substring(0, 40)}... | BSR: ${p.ranking || p.bsr} | R$ ${p.precoNumerico}`);
        });
    }
    
    return {
        original: produtos.length,
        filtrados: produtosFiltrados.length,
        aprovados: produtosFiltrados
    };
};

// Função para testar filtros específicos rapidamente
window.testarFiltrosBSR = function(min, max) {
    return debugFiltros({
        bsrTop100: false,
        bsrMin: min,
        bsrMax: max,
        precoMin: null,
        precoMax: null,
        vendasMin: null,
        vendasMax: null
    });
};

window.testarFiltrosPreco = function(min, max) {
    return debugFiltros({
        bsrTop100: false,
        precoMin: min,
        precoMax: max,
        bsrMin: null,
        bsrMax: null,
        vendasMin: null,
        vendasMax: null
    });
};

window.testarBSRTop100 = function() {
    return debugFiltros({
        bsrTop100: true,
        precoMin: null,
        precoMax: null,
        bsrMin: null,
        bsrMax: null,
        vendasMin: null,
        vendasMax: null
    });
};

console.log('🐛 Debug filtros carregado! Use:');
console.log('   debugFiltros() - teste geral');
console.log('   testarFiltrosBSR(100, 5000) - teste BSR');
console.log('   testarFiltrosPreco(50, 200) - teste preço');
console.log('   testarBSRTop100() - teste BSR ≤ 100'); 