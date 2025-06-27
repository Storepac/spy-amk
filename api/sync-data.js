import { Client } from 'pg';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }
    
    // String de conexão via variável de ambiente
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
        throw new Error('DATABASE_URL não configurada');
    }
    
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        const client = await connectToDatabase();
        
        // Criar tabela se não existir
        await client.query(`
            CREATE TABLE IF NOT EXISTS position_tracking (
                id SERIAL PRIMARY KEY,
                asin VARCHAR(20) NOT NULL,
                titulo_produto VARCHAR(200),
                termo_pesquisa VARCHAR(100),
                usuario_id VARCHAR(50) NOT NULL,
                data DATE NOT NULL,
                posicao INTEGER NOT NULL,
                timestamp BIGINT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(asin, usuario_id, data)
            )
        `);
        
        if (req.method === 'POST') {
            // UPLOAD: Sincronizar dados locais para nuvem
            const { userId, dados } = req.body;
            
            if (!userId || !dados || !Array.isArray(dados)) {
                res.status(400).json({ error: 'userId e dados são obrigatórios' });
                return;
            }
            
            let sucessos = 0;
            let erros = 0;
            const resultados = [];
            
            // Processar cada produto em lote
            for (const item of dados) {
                try {
                    const { asin, titulo, termo, historico } = item;
                    
                    if (!asin || !historico || !Array.isArray(historico)) {
                        erros++;
                        continue;
                    }
                    
                    // Inserir cada entrada do histórico
                    for (const entry of historico) {
                        const { data, posicao, timestamp } = entry;
                        
                        if (!data || !posicao || !timestamp) continue;
                        
                        const query = `
                            INSERT INTO position_tracking (asin, titulo_produto, termo_pesquisa, usuario_id, data, posicao, timestamp)
                            VALUES ($1, $2, $3, $4, $5, $6, $7)
                            ON CONFLICT (asin, usuario_id, data)
                            DO UPDATE SET 
                                posicao = EXCLUDED.posicao,
                                timestamp = EXCLUDED.timestamp,
                                updated_at = CURRENT_TIMESTAMP
                        `;
                        
                        const values = [
                            asin,
                            titulo?.substring(0, 200) || 'Produto sem título',
                            termo || 'termo-desconhecido',
                            userId,
                            data,
                            posicao,
                            timestamp
                        ];
                        
                        await client.query(query, values);
                    }
                    
                    sucessos++;
                    resultados.push({ asin, status: 'success' });
                    
                } catch (error) {
                    console.error(`Erro no ASIN ${item?.asin}:`, error);
                    erros++;
                    resultados.push({ asin: item?.asin, status: 'error', error: error.message });
                }
            }
            
            res.status(200).json({
                success: true,
                message: 'Sincronização de upload concluída',
                userId: userId,
                total: dados.length,
                sucessos: sucessos,
                erros: erros,
                resultados: resultados
            });
            
        } else if (req.method === 'GET') {
            // DOWNLOAD: Buscar dados da nuvem para local
            const { userId, ultimaSync } = req.query;
            
            if (!userId) {
                res.status(400).json({ error: 'userId é obrigatório' });
                return;
            }
            
            let query = `
                SELECT asin, titulo_produto, termo_pesquisa, data, posicao, timestamp
                FROM position_tracking
                WHERE usuario_id = $1
            `;
            const values = [userId];
            
            // Se há última sincronização, buscar apenas dados mais recentes
            if (ultimaSync) {
                query += ` AND updated_at > $2`;
                values.push(new Date(parseInt(ultimaSync)));
            }
            
            query += ` ORDER BY asin, data DESC`;
            
            const result = await client.query(query, values);
            
            // Agrupar por ASIN para formar estrutura compatível
            const produtosPorAsin = {};
            
            result.rows.forEach(row => {
                const asin = row.asin;
                
                if (!produtosPorAsin[asin]) {
                    produtosPorAsin[asin] = {
                        asin: asin,
                        titulo: row.titulo_produto,
                        termo: row.termo_pesquisa,
                        historico: []
                    };
                }
                
                produtosPorAsin[asin].historico.push({
                    data: row.data,
                    posicao: row.posicao,
                    timestamp: row.timestamp
                });
            });
            
            // Converter para array
            const dados = Object.values(produtosPorAsin);
            
            res.status(200).json({
                success: true,
                message: 'Dados da nuvem recuperados',
                userId: userId,
                total: dados.length,
                ultimaSync: ultimaSync ? parseInt(ultimaSync) : null,
                timestamp: Date.now(),
                dados: dados
            });
        }
        
    } catch (error) {
        console.error('Erro na sincronização:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
} 