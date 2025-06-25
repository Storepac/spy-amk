/**
 * Teste de Refatoração - Verifica se todos os componentes estão funcionando
 */
class TesteRefatoracao {
    static executarTestes() {
        console.log('🧪 Iniciando testes de refatoração...');
        
        const resultados = {
            componentes: this.testarComponentes(),
            funcionalidades: this.testarFuncionalidades(),
            performance: this.testarPerformance(),
            integracao: this.testarIntegracao()
        };
        
        this.exibirResultados(resultados);
        return resultados;
    }

    static testarComponentes() {
        const testes = {
            'Constants': typeof Constants !== 'undefined',
            'Helpers': typeof Helpers !== 'undefined',
            'ModalBuilder': typeof ModalBuilder !== 'undefined',
            'TableRowBuilder': typeof TableRowBuilder !== 'undefined',
            'FilterManager': typeof FilterManager !== 'undefined',
            'EventManager': typeof EventManager !== 'undefined',
            'TableManager': typeof TableManager !== 'undefined'
        };

        const sucessos = Object.values(testes).filter(Boolean).length;
        const total = Object.keys(testes).length;

        return {
            testes,
            sucessos,
            total,
            percentual: (sucessos / total) * 100
        };
    }

    static testarFuncionalidades() {
        const testes = {};

        // Teste de formatação
        try {
            const moeda = Helpers.formatarMoeda(1234.56);
            testes['Formatação de moeda'] = moeda === 'R$ 1.234,56';
        } catch (error) {
            testes['Formatação de moeda'] = false;
        }

        // Teste de validação ASIN
        try {
            testes['Validação ASIN válido'] = Helpers.validarASIN('B08N5WRWNW');
            testes['Validação ASIN inválido'] = !Helpers.validarASIN('INVALID');
        } catch (error) {
            testes['Validação ASIN'] = false;
        }

        // Teste de extração de número
        try {
            testes['Extração de número'] = Helpers.extrairNumero('R$ 123,45') === 123.45;
        } catch (error) {
            testes['Extração de número'] = false;
        }

        // Teste de truncamento
        try {
            testes['Truncamento de texto'] = Helpers.truncarTexto('Texto muito longo', 10) === 'Texto mui...';
        } catch (error) {
            testes['Truncamento de texto'] = false;
        }

        const sucessos = Object.values(testes).filter(Boolean).length;
        const total = Object.keys(testes).length;

        return {
            testes,
            sucessos,
            total,
            percentual: (sucessos / total) * 100
        };
    }

    static testarPerformance() {
        const testes = {};

        // Teste de debounce
        try {
            const debouncedFn = Helpers.debounce(() => {}, 100);
            testes['Debounce'] = typeof debouncedFn === 'function';
        } catch (error) {
            testes['Debounce'] = false;
        }

        // Teste de throttle
        try {
            const throttledFn = Helpers.throttle(() => {}, 100);
            testes['Throttle'] = typeof throttledFn === 'function';
        } catch (error) {
            testes['Throttle'] = false;
        }

        // Teste de geração de ID
        try {
            const id1 = Helpers.gerarId();
            const id2 = Helpers.gerarId();
            testes['Geração de ID único'] = id1 !== id2 && id1.length > 0;
        } catch (error) {
            testes['Geração de ID único'] = false;
        }

        const sucessos = Object.values(testes).filter(Boolean).length;
        const total = Object.keys(testes).length;

        return {
            testes,
            sucessos,
            total,
            percentual: (sucessos / total) * 100
        };
    }

    static testarIntegracao() {
        const testes = {};

        // Teste de verificação de componentes
        try {
            testes['Verificação de componentes'] = typeof TableManager.verificarComponentes === 'function';
        } catch (error) {
            testes['Verificação de componentes'] = false;
        }

        // Teste de criação de modal
        try {
            const produtosTeste = [
                {
                    titulo: 'Produto Teste',
                    asin: 'B08N5WRWNW',
                    preco: 'R$ 100,00',
                    precoNumerico: 100,
                    avaliacao: '4.5',
                    avaliacaoNumerica: 4.5,
                    vendidos: 1000,
                    ranking: '500',
                    marca: 'Marca Teste',
                    patrocinado: false,
                    organico: true
                }
            ];

            const modalHTML = ModalBuilder.criarModalPrincipal(produtosTeste, {}, 'teste');
            testes['Criação de modal'] = modalHTML.includes('amazon-analyzer-modal');
        } catch (error) {
            testes['Criação de modal'] = false;
        }

        // Teste de criação de linha
        try {
            const produto = {
                titulo: 'Produto Teste',
                asin: 'B08N5WRWNW',
                preco: 'R$ 100,00',
                precoNumerico: 100,
                avaliacao: '4.5',
                avaliacaoNumerica: 4.5,
                vendidos: 1000,
                ranking: '500',
                marca: 'Marca Teste',
                patrocinado: false,
                organico: true
            };

            const linhaHTML = TableRowBuilder.criarLinhaProduto(produto, 0);
            testes['Criação de linha'] = linhaHTML.includes('data-asin="B08N5WRWNW"');
        } catch (error) {
            testes['Criação de linha'] = false;
        }

        const sucessos = Object.values(testes).filter(Boolean).length;
        const total = Object.keys(testes).length;

        return {
            testes,
            sucessos,
            total,
            percentual: (sucessos / total) * 100
        };
    }

    static exibirResultados(resultados) {
        console.log('\n📊 RESULTADOS DOS TESTES DE REFATORAÇÃO');
        console.log('=====================================\n');

        Object.entries(resultados).forEach(([categoria, resultado]) => {
            console.log(`\n🔍 ${categoria.toUpperCase()}:`);
            console.log(`   Sucessos: ${resultado.sucessos}/${resultado.total} (${resultado.percentual.toFixed(1)}%)`);
            
            Object.entries(resultado.testes).forEach(([teste, sucesso]) => {
                const status = sucesso ? '✅' : '❌';
                console.log(`   ${status} ${teste}`);
            });
        });

        const totalSucessos = Object.values(resultados).reduce((sum, r) => sum + r.sucessos, 0);
        const totalTestes = Object.values(resultados).reduce((sum, r) => sum + r.total, 0);
        const percentualGeral = (totalSucessos / totalTestes) * 100;

        console.log('\n🎯 RESUMO GERAL:');
        console.log(`   Total de testes: ${totalTestes}`);
        console.log(`   Sucessos: ${totalSucessos}`);
        console.log(`   Taxa de sucesso: ${percentualGeral.toFixed(1)}%`);

        if (percentualGeral >= 90) {
            console.log('\n🎉 REFATORAÇÃO SUCESSO! Sistema pronto para uso.');
        } else if (percentualGeral >= 70) {
            console.log('\n⚠️ REFATORAÇÃO PARCIAL. Alguns ajustes necessários.');
        } else {
            console.log('\n❌ REFATORAÇÃO COM PROBLEMAS. Revisão necessária.');
        }
    }

    static testarCenariosReais() {
        console.log('\n🧪 Testando cenários reais...');

        // Cenário 1: Criação completa do sistema
        try {
            const produtos = [
                {
                    titulo: 'Produto 1',
                    asin: 'B08N5WRWNW',
                    preco: 'R$ 100,00',
                    precoNumerico: 100,
                    avaliacao: '4.5',
                    avaliacaoNumerica: 4.5,
                    vendidos: 1000,
                    ranking: '500',
                    marca: 'Marca A',
                    patrocinado: true,
                    organico: false
                },
                {
                    titulo: 'Produto 2',
                    asin: 'B08N5WRWNW', // ASIN duplicado
                    preco: 'R$ 200,00',
                    precoNumerico: 200,
                    avaliacao: '4.0',
                    avaliacaoNumerica: 4.0,
                    vendidos: 500,
                    ranking: '1000',
                    marca: 'Marca B',
                    patrocinado: false,
                    organico: true
                }
            ];

            // Simular criação da tabela
            const metricas = ProductAnalyzer.calcularMetricas(produtos);
            const modalHTML = ModalBuilder.criarModalPrincipal(produtos, metricas, 'teste');
            
            console.log('✅ Cenário 1: Criação do sistema - SUCESSO');
            console.log(`   Produtos processados: ${produtos.length}`);
            console.log(`   Modal criado: ${modalHTML.length} caracteres`);
            
        } catch (error) {
            console.log('❌ Cenário 1: Criação do sistema - FALHOU');
            console.error('   Erro:', error.message);
        }

        // Cenário 2: Filtros
        try {
            const filterManager = new FilterManager();
            filterManager.setProdutos([
                {
                    titulo: 'Produto Teste',
                    precoNumerico: 150,
                    avaliacaoNumerica: 4.5,
                    marca: 'Marca Teste',
                    vendidos: 1000,
                    ranking: '500',
                    patrocinado: true,
                    organico: false
                }
            ]);

            console.log('✅ Cenário 2: Sistema de filtros - SUCESSO');
            console.log(`   Marcas únicas: ${filterManager.marcasUnicas.length}`);
            
        } catch (error) {
            console.log('❌ Cenário 2: Sistema de filtros - FALHOU');
            console.error('   Erro:', error.message);
        }

        // Cenário 3: Eventos
        try {
            const eventManager = new EventManager();
            console.log('✅ Cenário 3: Sistema de eventos - SUCESSO');
            
        } catch (error) {
            console.log('❌ Cenário 3: Sistema de eventos - FALHOU');
            console.error('   Erro:', error.message);
        }
    }
}

// Executar testes automaticamente se estiver no console
if (typeof window !== 'undefined') {
    window.TesteRefatoracao = TesteRefatoracao;
    
    // Executar após carregamento completo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => TesteRefatoracao.executarTestes(), 1000);
        });
    } else {
        setTimeout(() => TesteRefatoracao.executarTestes(), 1000);
    }
} 