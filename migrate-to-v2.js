/**
 * Script de Migração para AMK Spy v2.0.0
 * Execute este script para migrar do sistema antigo para o novo
 */

console.log('🔄 Iniciando migração para AMK Spy v2.0.0...');

// ===== FUNÇÃO PRINCIPAL DE MIGRAÇÃO =====
async function migrateToV2() {
    try {
        // 1. Verificar se já está na v2
        if (isV2Installed()) {
            console.log('✅ AMK Spy v2.0.0 já está instalado');
            return { success: true, alreadyMigrated: true };
        }

        // 2. Backup dos dados antigos
        const backup = createBackup();
        console.log('💾 Backup criado:', backup);

        // 3. Migrar dados
        const migrationResult = await performMigration();
        
        if (!migrationResult.success) {
            console.error('❌ Falha na migração:', migrationResult.error);
            await restoreBackup(backup);
            return migrationResult;
        }

        // 4. Validar dados migrados
        const validation = validateMigratedData();
        
        if (!validation.isValid) {
            console.warn('⚠️ Problemas encontrados na validação:', validation.errors);
        }

        // 5. Limpar dados antigos
        cleanupOldData();

        // 6. Marcar como migrado
        markAsMigrated();

        console.log('✅ Migração concluída com sucesso!');
        return { 
            success: true, 
            migrated: true,
            validation: validation,
            backup: backup
        };

    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        return { success: false, error: error.message };
    }
}

// ===== FUNÇÕES AUXILIARES =====

function isV2Installed() {
    return window.DataManager && window.UIManager && window.Analyzer;
}

function createBackup() {
    const backup = {
        timestamp: new Date().toISOString(),
        version: '1.x',
        data: {}
    };

    // Backup de produtos
    try {
        const produtos = localStorage.getItem('amk-spy-produtos');
        if (produtos) {
            backup.data.produtos = JSON.parse(produtos);
        }
    } catch (error) {
        console.warn('Erro ao fazer backup de produtos:', error);
    }

    // Backup de configurações
    try {
        const config = localStorage.getItem('amk-spy-config');
        if (config) {
            backup.data.config = JSON.parse(config);
        }
    } catch (error) {
        console.warn('Erro ao fazer backup de configurações:', error);
    }

    // Backup de filtros
    try {
        const filtros = localStorage.getItem('amk-spy-filtros');
        if (filtros) {
            backup.data.filtros = JSON.parse(filtros);
        }
    } catch (error) {
        console.warn('Erro ao fazer backup de filtros:', error);
    }

    // Salvar backup
    localStorage.setItem('amk-spy-backup-v1', JSON.stringify(backup));
    
    return backup;
}

async function performMigration() {
    console.log('🔄 Executando migração de dados...');

    // Migrar produtos
    const produtosMigrados = await migrateProducts();
    console.log(`📊 ${produtosMigrados.length} produtos migrados`);

    // Migrar configurações
    const configMigrada = await migrateConfig();
    console.log('⚙️ Configurações migradas');

    // Migrar filtros
    const filtrosMigrados = await migrateFilters();
    console.log('🔍 Filtros migrados');

    return { success: true, produtos: produtosMigrados, config: configMigrada, filtros: filtrosMigrados };
}

async function migrateProducts() {
    try {
        const oldProdutos = localStorage.getItem('amk-spy-produtos');
        if (!oldProdutos) return [];

        const produtos = JSON.parse(oldProdutos);
        const produtosMigrados = produtos.map(produto => ({
            titulo: produto.title || produto.titulo || '',
            asin: produto.asin || '',
            marca: produto.brand || produto.marca || 'N/A',
            preco: produto.price || produto.preco || 'N/A',
            precoNumerico: produto.priceNumber || produto.precoNumerico || 0,
            avaliacao: produto.rating || produto.avaliacao || 'N/A',
            avaliacaoNumerica: produto.ratingNumber || produto.avaliacaoNumerica || 0,
            numAvaliacoes: produto.reviews || produto.numAvaliacoes || 'N/A',
            vendidos: produto.sold || produto.vendidos || 0,
            receitaMes: produto.revenue || produto.receitaMes || 0,
            ranking: produto.bsr || produto.ranking || 'N/A',
            categoria: produto.category || produto.categoria || 'N/A',
            patrocinado: produto.sponsored || produto.patrocinado || false,
            organico: produto.organic || produto.organico || true,
            imagem: produto.image || produto.imagem || '',
            link: produto.link || '',
            posicaoGlobal: produto.position || produto.posicaoGlobal || 0,
            paginaOrigem: produto.page || produto.paginaOrigem || 1,
            posicaoNaPagina: produto.pagePosition || produto.posicaoNaPagina || 0
        }));

        return produtosMigrados;
    } catch (error) {
        console.error('Erro ao migrar produtos:', error);
        return [];
    }
}

async function migrateConfig() {
    try {
        const oldConfig = localStorage.getItem('amk-spy-config');
        if (!oldConfig) return getDefaultConfig();

        const config = JSON.parse(oldConfig);
        return {
            tema: config.theme || 'light',
            autoBusca: config.autoSearch !== false,
            maxPaginas: config.maxPages || 5,
            delayEntrePaginas: config.pageDelay || 300
        };
    } catch (error) {
        console.error('Erro ao migrar configurações:', error);
        return getDefaultConfig();
    }
}

async function migrateFilters() {
    try {
        const oldFilters = localStorage.getItem('amk-spy-filtros');
        if (!oldFilters) return getDefaultFilters();

        const filtros = JSON.parse(oldFilters);
        return {
            nome: filtros.name || '',
            preco: filtros.price || '',
            avaliacao: filtros.rating || '',
            marca: filtros.brand || '',
            vendas: filtros.sales || '',
            bsrFaixa: filtros.bsrRange || '',
            bsrMin: filtros.bsrMin || '',
            bsrMax: filtros.bsrMax || '',
            tipo: filtros.type || '',
            posicao: filtros.position || ''
        };
    } catch (error) {
        console.error('Erro ao migrar filtros:', error);
        return getDefaultFilters();
    }
}

function getDefaultConfig() {
    return {
        tema: 'light',
        autoBusca: true,
        maxPaginas: 5,
        delayEntrePaginas: 300
    };
}

function getDefaultFilters() {
    return {
        nome: '',
        preco: '',
        avaliacao: '',
        marca: '',
        vendas: '',
        bsrFaixa: '',
        bsrMin: '',
        bsrMax: '',
        tipo: '',
        posicao: ''
    };
}

function validateMigratedData() {
    const errors = [];
    let isValid = true;

    // Validar se os componentes v2 estão disponíveis
    if (!window.DataManager) {
        errors.push('DataManager não encontrado');
        isValid = false;
    }

    if (!window.UIManager) {
        errors.push('UIManager não encontrado');
        isValid = false;
    }

    if (!window.Analyzer) {
        errors.push('Analyzer não encontrado');
        isValid = false;
    }

    // Validar dados migrados
    const produtos = window.DataManager?.getProdutos() || [];
    produtos.forEach((produto, index) => {
        if (!produto.asin || produto.asin === 'N/A') {
            errors.push(`Produto ${index}: ASIN inválido`);
            isValid = false;
        }
    });

    return { isValid, errors };
}

function cleanupOldData() {
    console.log('🧹 Limpando dados antigos...');
    
    const oldKeys = [
        'amk-spy-produtos',
        'amk-spy-config',
        'amk-spy-filtros',
        'amk-spy-version',
        'amk-spy-cache'
    ];

    oldKeys.forEach(key => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Erro ao remover ${key}:`, error);
        }
    });
}

function markAsMigrated() {
    try {
        localStorage.setItem('amk-spy-version', '2.0.0');
        localStorage.setItem('amk-spy-migrated', new Date().toISOString());
    } catch (error) {
        console.warn('Erro ao marcar como migrado:', error);
    }
}

async function restoreBackup(backup) {
    console.log('🔄 Restaurando backup...');
    
    try {
        if (backup.data.produtos) {
            localStorage.setItem('amk-spy-produtos', JSON.stringify(backup.data.produtos));
        }
        
        if (backup.data.config) {
            localStorage.setItem('amk-spy-config', JSON.stringify(backup.data.config));
        }
        
        if (backup.data.filtros) {
            localStorage.setItem('amk-spy-filtros', JSON.stringify(backup.data.filtros));
        }
        
        console.log('✅ Backup restaurado');
    } catch (error) {
        console.error('❌ Erro ao restaurar backup:', error);
    }
}

// ===== FUNÇÕES DE UTILIDADE =====

function showMigrationStatus(result) {
    if (result.success) {
        if (result.alreadyMigrated) {
            showNotification('✅ AMK Spy v2.0.0 já está instalado!', 'success');
        } else {
            showNotification('✅ Migração concluída com sucesso!', 'success');
            
            if (result.validation && !result.validation.isValid) {
                showNotification('⚠️ Alguns problemas foram encontrados. Verifique o console.', 'warning');
            }
        }
    } else {
        showNotification(`❌ Erro na migração: ${result.error}`, 'error');
    }
}

function showNotification(message, type = 'info') {
    // Criar notificação simples
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ===== EXECUÇÃO AUTOMÁTICA =====

// Executar migração quando o script for carregado
if (typeof window !== 'undefined') {
    // Aguardar um pouco para garantir que a página carregou
    setTimeout(async () => {
        const result = await migrateToV2();
        showMigrationStatus(result);
        
        // Log detalhado
        console.log('📊 Resultado da migração:', result);
        
        if (result.success && result.migrated) {
            console.log('🎉 AMK Spy v2.0.0 está pronto para uso!');
        }
    }, 1000);
}

// Expor função para uso manual
window.migrateAMKSpyToV2 = migrateToV2; 