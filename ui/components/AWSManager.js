/**
 * AWS RDS Manager - Conecta extensão com backend AWS
 * Substitui SupabaseManager para usar AWS RDS PostgreSQL
 */
class AWSManager {
    constructor() {
        this.baseURL = 'http://localhost:3000/api'; // URL do seu backend
        this.isEnabled = true; // AWS habilitado por padrão
        this.userId = 'default_user';
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        console.log('[AWS-MANAGER] Inicializando conexão com AWS RDS...');
        this.testarConexao();
    }

    /**
     * Testa conexão com backend AWS
     */
    async testarConexao() {
        try {
            console.log('[AWS-MANAGER] Testando conexão...');
            
            const response = await fetch(`${this.baseURL}/test-connection`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(10000) // 10s timeout
            });

            if (response.ok) {
                const data = await response.json();
                this.isConnected = true;
                this.retryCount = 0;
                console.log('[AWS-MANAGER] ✅ Conexão estabelecida:', data);
                
                // Mostrar notificação de sucesso
                if (window.showNotification) {
                    window.showNotification('🔗 Conectado ao AWS RDS!', 'success');
                }
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.isConnected = false;
            console.error('[AWS-MANAGER] ❌ Erro de conexão:', error.message);
            
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`[AWS-MANAGER] Tentativa ${this.retryCount}/${this.maxRetries} em 5s...`);
                setTimeout(() => this.testarConexao(), 5000);
            } else {
                console.log('[AWS-MANAGER] ⚠️ Modo offline ativado');
                if (window.showNotification) {
                    window.showNotification('⚠️ AWS offline - usando cache local', 'warning');
                }
            }
        }
    }

    /**
     * Salvar produto no AWS RDS
     */
    async salvarProduto(produto) {
        if (!this.isEnabled || !this.isConnected) {
            console.log('[AWS-MANAGER] Offline - salvando no localStorage');
            return this.salvarNoLocalStorage([produto]);
        }

        try {
            console.log('[AWS-MANAGER] Salvando produto:', produto.asin);

            const response = await fetch(`${this.baseURL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...produto,
                    user_id: this.userId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('[AWS-MANAGER] ✅ Produto salvo:', result.data.asin);
            
            return {
                success: true,
                data: result.data
            };

        } catch (error) {
            console.error('[AWS-MANAGER] Erro ao salvar produto:', error);
            
            // Fallback para localStorage
            console.log('[AWS-MANAGER] Usando fallback localStorage');
            return this.salvarNoLocalStorage([produto]);
        }
    }

    /**
     * Salvar múltiplos produtos em lote
     */
    async salvarProdutos(produtos) {
        if (!this.isEnabled || !this.isConnected) {
            console.log('[AWS-MANAGER] Offline - salvando no localStorage');
            return this.salvarNoLocalStorage(produtos);
        }

        try {
            console.log('[AWS-MANAGER] Salvando lote de produtos:', produtos.length);

            const response = await fetch(`${this.baseURL}/products/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    products: produtos,
                    user_id: this.userId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('[AWS-MANAGER] ✅ Lote salvo:', result.count, 'produtos');
            
            // Mostrar notificação
            if (window.showNotification) {
                window.showNotification(`💾 ${result.count} produtos salvos no AWS!`, 'success');
            }

            return {
                success: true,
                data: result.data,
                count: result.count
            };

        } catch (error) {
            console.error('[AWS-MANAGER] Erro ao salvar lote:', error);
            
            // Fallback para localStorage
            console.log('[AWS-MANAGER] Usando fallback localStorage');
            return this.salvarNoLocalStorage(produtos);
        }
    }

    /**
     * Buscar produtos
     */
    async buscarProdutos(filtros = {}) {
        if (!this.isEnabled || !this.isConnected) {
            console.log('[AWS-MANAGER] Offline - buscando no localStorage');
            return this.buscarNoLocalStorage(filtros);
        }

        try {
            const params = new URLSearchParams({
                user_id: this.userId,
                limit: filtros.limit || 50,
                offset: filtros.offset || 0,
                ...filtros
            });

            const response = await fetch(`${this.baseURL}/products?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('[AWS-MANAGER] ✅ Produtos encontrados:', result.data.length);
            
            return {
                success: true,
                data: result.data,
                count: result.count
            };

        } catch (error) {
            console.error('[AWS-MANAGER] Erro ao buscar produtos:', error);
            return this.buscarNoLocalStorage(filtros);
        }
    }

    /**
     * Salvar posição (ranking tracking)
     */
    async salvarPosicao(posicao) {
        if (!this.isEnabled || !this.isConnected) {
            return { success: false, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/positions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...posicao,
                    user_id: this.userId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            return { success: true, data: result.data };

        } catch (error) {
            console.error('[AWS-MANAGER] Erro ao salvar posição:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar estatísticas
     */
    async buscarEstatisticas() {
        if (!this.isEnabled || !this.isConnected) {
            return { success: false, offline: true };
        }

        try {
            const response = await fetch(`${this.baseURL}/stats?user_id=${this.userId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            return { success: true, data: result.data };

        } catch (error) {
            console.error('[AWS-MANAGER] Erro ao buscar estatísticas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fallback: Salvar no localStorage
     */
    salvarNoLocalStorage(produtos) {
        try {
            const existingData = JSON.parse(localStorage.getItem('spy_amk_produtos') || '[]');
            
            produtos.forEach(produto => {
                const index = existingData.findIndex(p => p.asin === produto.asin);
                if (index >= 0) {
                    existingData[index] = { ...existingData[index], ...produto };
                } else {
                    existingData.push({
                        ...produto,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                }
            });

            localStorage.setItem('spy_amk_produtos', JSON.stringify(existingData));
            
            console.log('[AWS-MANAGER] ✅ Salvos no localStorage:', produtos.length);
            return { success: true, offline: true, count: produtos.length };

        } catch (error) {
            console.error('[AWS-MANAGER] Erro no localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fallback: Buscar no localStorage
     */
    buscarNoLocalStorage(filtros = {}) {
        try {
            const data = JSON.parse(localStorage.getItem('spy_amk_produtos') || '[]');
            let produtos = [...data];

            // Aplicar filtros
            if (filtros.termo_pesquisa) {
                produtos = produtos.filter(p => 
                    p.termo_pesquisa && p.termo_pesquisa.includes(filtros.termo_pesquisa)
                );
            }

            // Ordenar por data
            produtos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Aplicar limit/offset
            const limit = parseInt(filtros.limit) || 50;
            const offset = parseInt(filtros.offset) || 0;
            produtos = produtos.slice(offset, offset + limit);

            return { 
                success: true, 
                data: produtos, 
                count: produtos.length,
                offline: true 
            };

        } catch (error) {
            console.error('[AWS-MANAGER] Erro ao buscar localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verificar status da conexão
     */
    isOnline() {
        return this.isConnected && this.isEnabled;
    }

    /**
     * Habilitar/Desabilitar AWS
     */
    toggle(enable) {
        this.isEnabled = enable;
        console.log('[AWS-MANAGER] AWS', enable ? 'habilitado' : 'desabilitado');
        
        if (enable && !this.isConnected) {
            this.testarConexao();
        }
    }
}

// Instância global
window.awsManager = new AWSManager();

console.log('[AWS-MANAGER] ✅ Gerenciador AWS RDS carregado!'); 