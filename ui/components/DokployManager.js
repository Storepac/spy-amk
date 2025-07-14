class DokployManager {
    constructor() {
        this.baseURL = 'http://localhost:3000/api'; // URL do seu backend
        this.isEnabled = true; // Habilitado por padrão
        this.retryAttempts = 3;
        this.timeout = 10000; // 10 segundos
        
        console.log('🚀 DokployManager inicializado');
        this.testConnection();
    }

    /**
     * Testa conectividade com o backend Dokploy
     */
    async testConnection() {
        try {
            const response = await this.makeRequest('/health', 'GET');
            if (response.status === 'ok') {
                console.log('✅ Conexão com Dokploy estabelecida');
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Falha na conexão com Dokploy:', error.message);
            this.isEnabled = false;
        }
        return false;
    }

    /**
     * Faz requisições HTTP com retry e timeout
     */
    async makeRequest(endpoint, method = 'GET', data = null, retryCount = 0) {
        if (!this.isEnabled) {
            throw new Error('DokployManager está desabilitado');
        }

        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'spy-amk-extension/1.0'
            },
            timeout: this.timeout
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            options.signal = controller.signal;
            
            const response = await fetch(url, options);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`❌ Erro na requisição ${method} ${endpoint}:`, error.message);
            
            // Retry logic
            if (retryCount < this.retryAttempts && !error.name?.includes('Abort')) {
                console.log(`🔄 Tentativa ${retryCount + 1}/${this.retryAttempts} para ${endpoint}`);
                await this.delay(1000 * (retryCount + 1)); // Backoff progressivo
                return this.makeRequest(endpoint, method, data, retryCount + 1);
            }
            
            if (error.name?.includes('Abort')) {
                throw new Error('Timeout na conexão com Dokploy');
            }
            
            throw error;
        }
    }

    /**
     * Salva produto no banco Dokploy
     */
    async saveProduct(productData) {
        try {
            console.log('💾 Salvando produto no Dokploy:', productData.asin);
            
            const response = await this.makeRequest('/products', 'POST', {
                asin: productData.asin,
                titulo: productData.title,
                preco: productData.price,
                preco_original: productData.originalPrice,
                desconto: productData.discount,
                rating: productData.rating,
                num_reviews: productData.numReviews,
                url: productData.url,
                imagem_url: productData.imageUrl,
                categoria: productData.category,
                subcategoria: productData.subcategory,
                brand: productData.brand,
                disponivel: productData.available,
                prime: productData.prime,
                frete_gratis: productData.freeShipping,
                vendedor: productData.seller
            });

            console.log('✅ Produto salvo no Dokploy:', response.asin);
            return response;
        } catch (error) {
            console.error('❌ Erro ao salvar produto no Dokploy:', error.message);
            throw error;
        }
    }

    /**
     * Salva posição do produto
     */
    async savePosition(positionData) {
        try {
            console.log('📍 Salvando posição no Dokploy:', positionData.asin);
            
            const response = await this.makeRequest('/positions', 'POST', {
                asin: positionData.asin,
                palavra_chave: positionData.keyword,
                posicao: positionData.position,
                pagina: positionData.page,
                metodo_pesquisa: positionData.method || 'extension',
                resultados_totais: positionData.totalResults,
                tempo_busca: positionData.searchTime,
                user_agent: navigator.userAgent
            });

            console.log('✅ Posição salva no Dokploy:', response.id);
            return response;
        } catch (error) {
            console.error('❌ Erro ao salvar posição no Dokploy:', error.message);
            throw error;
        }
    }

    /**
     * Registra pesquisa realizada
     */
    async saveSearch(searchData) {
        try {
            console.log('🔍 Registrando pesquisa no Dokploy:', searchData.keyword);
            
            const response = await this.makeRequest('/searches', 'POST', {
                palavra_chave: searchData.keyword,
                total_resultados: searchData.totalResults,
                tempo_execucao: searchData.executionTime,
                produtos_encontrados: searchData.productsFound,
                paginas_analisadas: searchData.pagesAnalyzed,
                sucesso: searchData.success,
                erro: searchData.error,
                user_id: searchData.userId || 'anonymous',
                session_id: this.getSessionId()
            });

            console.log('✅ Pesquisa registrada no Dokploy:', response.id);
            return response;
        } catch (error) {
            console.error('❌ Erro ao registrar pesquisa no Dokploy:', error.message);
            throw error;
        }
    }

    /**
     * Busca histórico de posições
     */
    async getPositionHistory(asin, keyword, limit = 30) {
        try {
            const endpoint = `/positions/history?asin=${asin}&keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
            const response = await this.makeRequest(endpoint, 'GET');
            
            console.log(`📊 Histórico obtido: ${response.length} registros`);
            return response;
        } catch (error) {
            console.error('❌ Erro ao buscar histórico:', error.message);
            return [];
        }
    }

    /**
     * Busca produtos por categoria
     */
    async getProductsByCategory(category, limit = 50) {
        try {
            const endpoint = `/products/category/${encodeURIComponent(category)}?limit=${limit}`;
            const response = await this.makeRequest(endpoint, 'GET');
            
            console.log(`📦 Produtos encontrados: ${response.length}`);
            return response;
        } catch (error) {
            console.error('❌ Erro ao buscar produtos por categoria:', error.message);
            return [];
        }
    }

    /**
     * Atualiza estatísticas do usuário
     */
    async updateUserStats(userId, stats) {
        try {
            const response = await this.makeRequest('/stats/user', 'POST', {
                user_id: userId,
                ...stats
            });

            console.log('📈 Estatísticas atualizadas no Dokploy');
            return response;
        } catch (error) {
            console.error('❌ Erro ao atualizar estatísticas:', error.message);
            throw error;
        }
    }

    /**
     * Obtém estatísticas gerais
     */
    async getStats() {
        try {
            const response = await this.makeRequest('/stats', 'GET');
            console.log('📊 Estatísticas obtidas do Dokploy');
            return response;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error.message);
            return null;
        }
    }

    /**
     * Busca produtos por ASIN
     */
    async getProduct(asin) {
        try {
            const response = await this.makeRequest(`/products/${asin}`, 'GET');
            console.log('📦 Produto encontrado:', asin);
            return response;
        } catch (error) {
            console.error('❌ Erro ao buscar produto:', error.message);
            return null;
        }
    }

    /**
     * Utilitários
     */
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Habilita/desabilita o manager
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`🔧 DokployManager ${enabled ? 'habilitado' : 'desabilitado'}`);
    }

    /**
     * Verifica se está funcionando
     */
    isWorking() {
        return this.isEnabled;
    }

    /**
     * Obtém status de saúde
     */
    async getHealthStatus() {
        try {
            const response = await this.makeRequest('/health', 'GET');
            return {
                status: 'ok',
                database: response.database || 'connected',
                timestamp: response.timestamp || new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Exportar instância global
window.dokployManager = new DokployManager(); 