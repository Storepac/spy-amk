import { Client } from 'pg';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }
    
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Método não permitido' });
        return;
    }
    
    try {
        const { asin, titulo, posicao, termoPesquisa, userId } = req.body;
        
        // Validar dados obrigatórios
        if (!asin || !posicao || !userId) {
            res.status(400).json({ error: 'ASIN, posição e userId são obrigatórios' });
            return;
        }
        
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
        
        const agora = new Date();
        const dataHoje = agora.toISOString().split('T')[0]; // YYYY-MM-DD
        const timestamp = agora.getTime();
        
        // Inserir ou atualizar posição (UPSERT)
        const query = `
            INSERT INTO position_tracking (asin, titulo_produto, termo_pesquisa, usuario_id, data, posicao, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (asin, usuario_id, data)
            DO UPDATE SET 
                posicao = EXCLUDED.posicao,
                timestamp = EXCLUDED.timestamp,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        
        const values = [
            asin,
            titulo?.substring(0, 200) || 'Produto sem título',
            termoPesquisa || 'termo-desconhecido',
            userId,
            dataHoje,
            posicao,
            timestamp
        ];
        
        const result = await client.query(query, values);
        
        res.status(200).json({ 
            success: true, 
            message: 'Posição salva com sucesso',
            asin: asin,
            posicao: posicao,
            data: dataHoje,
            record: result.rows[0]
        });
        
    } catch (error) {
        console.error('Erro ao salvar posição:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
} 