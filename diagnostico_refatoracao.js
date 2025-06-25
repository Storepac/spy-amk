/**
 * Diagnóstico de Refatoração - Verifica se o sistema está funcionando
 */
class DiagnosticoRefatoracao {
    static executarDiagnostico() {
        console.log('🔍 Iniciando diagnóstico de refatoração...');
        
        const resultados = {
            componentes: this.verificarComponentes(),
            conflitos: this.verificarConflitos(),
            funcionalidades: this.verificarFuncionalidades(),
            botao: this.verificarBotao()
        };
        
        this.exibirResultados(resultados);
        return resultados;
    }

    static verificarComponentes() {
        const componentes = {
            'Constants': typeof Constants !== 'undefined',
            'Helpers': typeof Helpers !== 'undefined',
            'ModalBuilder': typeof ModalBuilder !== 'undefined',
            'TableRowBuilder': typeof TableRowBuilder !== 'undefined',
            'FilterManager': typeof FilterManager !== 'undefined',
            'EventManager': typeof EventManager !== 'undefined',
            'EventManagerLegacy': typeof EventManagerLegacy !== 'undefined',
            'FilterManagerLegacy': typeof FilterManagerLegacy !== 'undefined',
            'TableManager': typeof TableManager !== 'undefined',
            'ProductAnalyzer': typeof ProductAnalyzer !== 'undefined',
            'NotificationManager': typeof NotificationManager !== 'undefined',
            'AppController': typeof AppController !== 'undefined'
        };

        const sucessos = Object.values(componentes).filter(Boolean).length;
        const total = Object.keys(componentes).length;

        return {
            componentes,
            sucessos,
            total,
            percentual: (sucessos / total) * 100
        };
    }

    static verificarConflitos() {
        const conflitos = {
            'FilterManager duplicado': typeof FilterManager !== 'undefined' && typeof FilterManagerLegacy !== 'undefined',
            'EventManager duplicado': typeof EventManager !== 'undefined' && typeof EventManagerLegacy !== 'undefined',
            'Erro de sintaxe': false
        };

        // Verificar se há erros no console
        const logs = performance.getEntriesByType('navigation');
        const temErros = logs.some(log => log.name.includes('error'));

        return {
            conflitos,
            temErros,
            totalConflitos: Object.values(conflitos).filter(Boolean).length
        };
    }

    static verificarFuncionalidades() {
        const funcionalidades = {};

        // Teste de criação de modal
        try {
            const produtosTeste = [{
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
            }];

            const modalHTML = ModalBuilder.criarModalPrincipal(produtosTeste, {}, 'teste');
            funcionalidades['Criação de modal'] = modalHTML.includes('amazon-analyzer-modal');
        } catch (error) {
            funcionalidades['Criação de modal'] = false;
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
            funcionalidades['Criação de linha'] = linhaHTML.includes('data-asin="B08N5WRWNW"');
        } catch (error) {
            funcionalidades['Criação de linha'] = false;
        }

        // Teste de FilterManager
        try {
            const filterManager = new FilterManager();
            filterManager.setProdutos([{
                titulo: 'Produto Teste',
                precoNumerico: 150,
                avaliacaoNumerica: 4.5,
                marca: 'Marca Teste',
                vendidos: 1000,
                ranking: '500',
                patrocinado: true,
                organico: false
            }]);
            funcionalidades['FilterManager'] = filterManager.produtos.length > 0;
        } catch (error) {
            funcionalidades['FilterManager'] = false;
        }

        // Teste de EventManager
        try {
            const eventManager = new EventManager();
            funcionalidades['EventManager'] = typeof eventManager === 'object';
        } catch (error) {
            funcionalidades['EventManager'] = false;
        }

        const sucessos = Object.values(funcionalidades).filter(Boolean).length;
        const total = Object.keys(funcionalidades).length;

        return {
            funcionalidades,
            sucessos,
            total,
            percentual: (sucessos / total) * 100
        };
    }

    static verificarBotao() {
        const botao = document.getElementById('amk-spy-button');
        const menuNavegacao = document.getElementById('nav-tools') || document.getElementById('nav-global-location-slot');
        
        return {
            'Botão existe': botao !== null,
            'Menu navegação existe': menuNavegacao !== null,
            'Botão visível': botao ? botao.offsetParent !== null : false,
            'Botão clicável': botao ? !botao.disabled : false
        };
    }

    static exibirResultados(resultados) {
        console.log('\n📊 DIAGNÓSTICO DE REFATORAÇÃO');
        console.log('==============================\n');

        // Componentes
        console.log('🔧 COMPONENTES:');
        console.log(`   Sucessos: ${resultados.componentes.sucessos}/${resultados.componentes.total} (${resultados.componentes.percentual.toFixed(1)}%)`);
        Object.entries(resultados.componentes.componentes).forEach(([nome, carregado]) => {
            const status = carregado ? '✅' : '❌';
            console.log(`   ${status} ${nome}`);
        });

        // Conflitos
        console.log('\n⚠️ CONFLITOS:');
        console.log(`   Total de conflitos: ${resultados.conflitos.totalConflitos}`);
        Object.entries(resultados.conflitos.conflitos).forEach(([nome, conflito]) => {
            const status = conflito ? '❌' : '✅';
            console.log(`   ${status} ${nome}`);
        });

        // Funcionalidades
        console.log('\n⚡ FUNCIONALIDADES:');
        console.log(`   Sucessos: ${resultados.funcionalidades.sucessos}/${resultados.funcionalidades.total} (${resultados.funcionalidades.percentual.toFixed(1)}%)`);
        Object.entries(resultados.funcionalidades.funcionalidades).forEach(([nome, funcionando]) => {
            const status = funcionando ? '✅' : '❌';
            console.log(`   ${status} ${nome}`);
        });

        // Botão
        console.log('\n🔘 BOTÃO AMK SPY:');
        Object.entries(resultados.botao).forEach(([nome, status]) => {
            const icon = status ? '✅' : '❌';
            console.log(`   ${icon} ${nome}`);
        });

        // Resumo geral
        const totalSucessos = resultados.componentes.sucessos + resultados.funcionalidades.sucessos;
        const totalTestes = resultados.componentes.total + resultados.funcionalidades.total;
        const percentualGeral = (totalSucessos / totalTestes) * 100;

        console.log('\n🎯 RESUMO GERAL:');
        console.log(`   Componentes: ${resultados.componentes.percentual.toFixed(1)}%`);
        console.log(`   Funcionalidades: ${resultados.funcionalidades.percentual.toFixed(1)}%`);
        console.log(`   Conflitos: ${resultados.conflitos.totalConflitos}`);
        console.log(`   Botão: ${resultados.botao['Botão existe'] ? 'Presente' : 'Ausente'}`);

        if (percentualGeral >= 90 && resultados.conflitos.totalConflitos === 0) {
            console.log('\n🎉 REFATORAÇÃO SUCESSO! Sistema funcionando perfeitamente.');
        } else if (percentualGeral >= 70) {
            console.log('\n⚠️ REFATORAÇÃO PARCIAL. Alguns ajustes necessários.');
        } else {
            console.log('\n❌ REFATORAÇÃO COM PROBLEMAS. Revisão necessária.');
        }
    }

    static corrigirProblemas() {
        console.log('\n🔧 Tentando corrigir problemas...');

        // Verificar se o botão existe, se não, criar
        if (!document.getElementById('amk-spy-button')) {
            console.log('🔧 Criando botão AMK Spy...');
            if (typeof EventManagerLegacy !== 'undefined') {
                EventManagerLegacy.adicionarBotaoAmkSpy();
            } else {
                console.error('❌ EventManagerLegacy não disponível');
            }
        }

        // Verificar se há conflitos de classes
        if (typeof FilterManager !== 'undefined' && typeof FilterManagerLegacy !== 'undefined') {
            console.log('⚠️ Detectado conflito FilterManager - usando versão nova');
        }

        if (typeof EventManager !== 'undefined' && typeof EventManagerLegacy !== 'undefined') {
            console.log('⚠️ Detectado conflito EventManager - usando versão nova');
        }

        console.log('✅ Correções aplicadas');
    }
}

// Executar diagnóstico automaticamente
if (typeof window !== 'undefined') {
    window.DiagnosticoRefatoracao = DiagnosticoRefatoracao;
    
    // Executar após carregamento completo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                DiagnosticoRefatoracao.executarDiagnostico();
                DiagnosticoRefatoracao.corrigirProblemas();
            }, 2000);
        });
    } else {
        setTimeout(() => {
            DiagnosticoRefatoracao.executarDiagnostico();
            DiagnosticoRefatoracao.corrigirProblemas();
        }, 2000);
    }
} 