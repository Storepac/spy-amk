/**
 * MigrationManager - Gerenciador de migração
 * Responsável por migrar dados e configurações do sistema antigo para o novo
 */
class MigrationManager {
    constructor() {
        this.dataManager = window.DataManager;
        this.currentVersion = '2.0.0';
        this.migrations = new Map();
        
        // Registrar migrações
        this.registerMigrations();
    }

    // ===== REGISTRO DE MIGRAÇÕES =====
    registerMigrations() {
        // Migração de v1.x para v2.0.0
        this.migrations.set('1.0.0', this.migrateFromV1ToV2.bind(this));
        this.migrations.set('1.1.0', this.migrateFromV1ToV2.bind(this));
        this.migrations.set('1.2.0', this.migrateFromV1ToV2.bind(this));
    }

    // ===== EXECUÇÃO DE MIGRAÇÕES =====
    async migrate() {
        try {
            console.log('🔄 Iniciando processo de migração...');
            
            const currentVersion = this.getStoredVersion();
            const targetVersion = this.currentVersion;
            
            if (currentVersion === targetVersion) {
                console.log('✅ Sistema já está na versão mais recente');
                return { success: true, migrated: false };
            }
            
            console.log(`📦 Migrando de ${currentVersion} para ${targetVersion}`);
            
            // Executar migrações necessárias
            const migrationsToRun = this.getMigrationsToRun(currentVersion, targetVersion);
            
            for (const migration of migrationsToRun) {
                await this.runMigration(migration);
            }
            
            // Atualizar versão
            this.updateVersion(targetVersion);
            
            console.log('✅ Migração concluída com sucesso');
            return { success: true, migrated: true, fromVersion: currentVersion, toVersion: targetVersion };
            
        } catch (error) {
            console.error('❌ Erro durante a migração:', error);
            return { success: false, error: error.message };
        }
    }

    getMigrationsToRun(fromVersion, toVersion) {
        const migrations = [];
        
        for (const [version, migration] of this.migrations) {
            if (this.isVersionGreater(version, fromVersion) && this.isVersionLessOrEqual(version, toVersion)) {
                migrations.push({ version, migration });
            }
        }
        
        return migrations.sort((a, b) => this.compareVersions(a.version, b.version));
    }

    async runMigration(migrationInfo) {
        const { version, migration } = migrationInfo;
        
        console.log(`🔄 Executando migração ${version}...`);
        
        try {
            await migration();
            console.log(`✅ Migração ${version} concluída`);
        } catch (error) {
            console.error(`❌ Erro na migração ${version}:`, error);
            throw error;
        }
    }

    // ===== MIGRAÇÕES ESPECÍFICAS =====
    async migrateFromV1ToV2() {
        console.log('🔄 Migrando dados da versão 1.x para 2.0.0...');
        
        // Migrar dados de produtos
        await this.migrateProductsData();
        
        // Migrar configurações
        await this.migrateSettings();
        
        // Migrar filtros
        await this.migrateFilters();
        
        // Limpar dados antigos
        await this.cleanupOldData();
        
        console.log('✅ Migração v1.x → v2.0.0 concluída');
    }

    async migrateProductsData() {
        // Tentar carregar dados antigos
        const oldData = this.loadOldProductsData();
        
        if (oldData && oldData.length > 0) {
            console.log(`📊 Migrando ${oldData.length} produtos...`);
            
            // Converter formato antigo para novo
            const migratedProducts = oldData.map(product => this.migrateProductFormat(product));
            
            // Salvar no novo formato
            this.dataManager.setProdutos(migratedProducts);
            
            console.log(`✅ ${migratedProducts.length} produtos migrados`);
        }
    }

    async migrateSettings() {
        const oldSettings = this.loadOldSettings();
        
        if (oldSettings) {
            console.log('⚙️ Migrando configurações...');
            
            const newConfig = {
                tema: oldSettings.theme || 'light',
                autoBusca: oldSettings.autoSearch !== false,
                maxPaginas: oldSettings.maxPages || 5,
                delayEntrePaginas: oldSettings.pageDelay || 300
            };
            
            this.dataManager.updateState('configuracao', newConfig);
            
            console.log('✅ Configurações migradas');
        }
    }

    async migrateFilters() {
        const oldFilters = this.loadOldFilters();
        
        if (oldFilters) {
            console.log('🔍 Migrando filtros...');
            
            const newFilters = {
                nome: oldFilters.name || '',
                preco: oldFilters.price || '',
                avaliacao: oldFilters.rating || '',
                marca: oldFilters.brand || '',
                vendas: oldFilters.sales || '',
                bsrFaixa: oldFilters.bsrRange || '',
                bsrMin: oldFilters.bsrMin || '',
                bsrMax: oldFilters.bsrMax || '',
                tipo: oldFilters.type || '',
                posicao: oldFilters.position || ''
            };
            
            this.dataManager.setFiltros(newFilters);
            
            console.log('✅ Filtros migrados');
        }
    }

    async cleanupOldData() {
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
        
        console.log('✅ Dados antigos removidos');
    }

    // ===== UTILITÁRIOS DE MIGRAÇÃO =====
    loadOldProductsData() {
        try {
            const oldData = localStorage.getItem('amk-spy-produtos');
            return oldData ? JSON.parse(oldData) : null;
        } catch (error) {
            console.warn('Erro ao carregar dados antigos:', error);
            return null;
        }
    }

    loadOldSettings() {
        try {
            const oldSettings = localStorage.getItem('amk-spy-config');
            return oldSettings ? JSON.parse(oldSettings) : null;
        } catch (error) {
            console.warn('Erro ao carregar configurações antigas:', error);
            return null;
        }
    }

    loadOldFilters() {
        try {
            const oldFilters = localStorage.getItem('amk-spy-filtros');
            return oldFilters ? JSON.parse(oldFilters) : null;
        } catch (error) {
            console.warn('Erro ao carregar filtros antigos:', error);
            return null;
        }
    }

    migrateProductFormat(oldProduct) {
        // Converter formato antigo para novo
        return {
            titulo: oldProduct.title || oldProduct.titulo || '',
            asin: oldProduct.asin || '',
            marca: oldProduct.brand || oldProduct.marca || 'N/A',
            preco: oldProduct.price || oldProduct.preco || 'N/A',
            precoNumerico: oldProduct.priceNumber || oldProduct.precoNumerico || 0,
            avaliacao: oldProduct.rating || oldProduct.avaliacao || 'N/A',
            avaliacaoNumerica: oldProduct.ratingNumber || oldProduct.avaliacaoNumerica || 0,
            numAvaliacoes: oldProduct.reviews || oldProduct.numAvaliacoes || 'N/A',
            vendidos: oldProduct.sold || oldProduct.vendidos || 0,
            receitaMes: oldProduct.revenue || oldProduct.receitaMes || 0,
            ranking: oldProduct.bsr || oldProduct.ranking || 'N/A',
            categoria: oldProduct.category || oldProduct.categoria || 'N/A',
            patrocinado: oldProduct.sponsored || oldProduct.patrocinado || false,
            organico: oldProduct.organic || oldProduct.organico || true,
            imagem: oldProduct.image || oldProduct.imagem || '',
            link: oldProduct.link || '',
            posicaoGlobal: oldProduct.position || oldProduct.posicaoGlobal || 0,
            paginaOrigem: oldProduct.page || oldProduct.paginaOrigem || 1,
            posicaoNaPagina: oldProduct.pagePosition || oldProduct.posicaoNaPagina || 0
        };
    }

    // ===== GESTÃO DE VERSÕES =====
    getStoredVersion() {
        try {
            return localStorage.getItem('amk-spy-version') || '1.0.0';
        } catch (error) {
            console.warn('Erro ao obter versão armazenada:', error);
            return '1.0.0';
        }
    }

    updateVersion(version) {
        try {
            localStorage.setItem('amk-spy-version', version);
        } catch (error) {
            console.warn('Erro ao atualizar versão:', error);
        }
    }

    isVersionGreater(version1, version2) {
        return this.compareVersions(version1, version2) > 0;
    }

    isVersionLessOrEqual(version1, version2) {
        return this.compareVersions(version1, version2) <= 0;
    }

    compareVersions(version1, version2) {
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;
            
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        
        return 0;
    }

    // ===== VALIDAÇÃO DE DADOS =====
    validateMigratedData() {
        const produtos = this.dataManager.getProdutos();
        const config = this.dataManager.state.configuracao;
        
        let isValid = true;
        const errors = [];
        
        // Validar produtos
        produtos.forEach((produto, index) => {
            if (!produto.asin || produto.asin === 'N/A') {
                errors.push(`Produto ${index}: ASIN inválido`);
                isValid = false;
            }
            
            if (!produto.titulo || produto.titulo.length < 5) {
                errors.push(`Produto ${index}: Título muito curto`);
                isValid = false;
            }
        });
        
        // Validar configuração
        if (!config.maxPaginas || config.maxPaginas < 1 || config.maxPaginas > 20) {
            errors.push('Configuração: maxPaginas inválido');
            isValid = false;
        }
        
        if (!isValid) {
            console.warn('⚠️ Dados migrados com problemas:', errors);
        }
        
        return { isValid, errors };
    }

    // ===== ROLLBACK =====
    async rollback() {
        try {
            console.log('🔄 Executando rollback...');
            
            // Restaurar versão anterior
            const currentVersion = this.getStoredVersion();
            const previousVersion = this.getPreviousVersion(currentVersion);
            
            if (previousVersion) {
                this.updateVersion(previousVersion);
                console.log(`✅ Rollback para versão ${previousVersion}`);
                return { success: true, version: previousVersion };
            } else {
                console.log('❌ Não é possível fazer rollback');
                return { success: false, error: 'Versão anterior não encontrada' };
            }
            
        } catch (error) {
            console.error('❌ Erro no rollback:', error);
            return { success: false, error: error.message };
        }
    }

    getPreviousVersion(currentVersion) {
        // Mapeamento de versões anteriores
        const versionMap = {
            '2.0.0': '1.2.0',
            '1.2.0': '1.1.0',
            '1.1.0': '1.0.0'
        };
        
        return versionMap[currentVersion] || null;
    }

    // ===== RELATÓRIO DE MIGRAÇÃO =====
    generateMigrationReport() {
        const produtos = this.dataManager.getProdutos();
        const config = this.dataManager.state.configuracao;
        const validation = this.validateMigratedData();
        
        return {
            timestamp: new Date().toISOString(),
            fromVersion: this.getStoredVersion(),
            toVersion: this.currentVersion,
            produtosCount: produtos.length,
            configuracao: config,
            validation: validation,
            success: validation.isValid
        };
    }

    // ===== DESTRUIÇÃO =====
    destroy() {
        this.migrations.clear();
        console.log('🗑️ MigrationManager destruído');
    }
}

// Instância global
window.MigrationManager = new MigrationManager(); 