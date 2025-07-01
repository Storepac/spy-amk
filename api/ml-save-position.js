import { Client } from 'pg';

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }
    
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
        const { mlId, titulo, posicao, termoPesquisa, userId } = req.body;
        
        // Validar dados obrigatórios
        if (!mlId || !posicao || !termoPesquisa || !userId) {
            res.status(400).json({ 
                error: 'mlId, posicao, termoPesquisa e userId são obrigatórios' 
            });
            return;
        }
        
        const client = await connectToDatabase();
        
        // Criar tabela de tracking ML se não existir
        await client.query(`
            CREATE TABLE IF NOT EXISTS position_tracking_ml (
                id SERIAL PRIMARY KEY,
                ml_id VARCHAR(50) NOT NULL,
                titulo VARCHAR(500),
                posicao INTEGER NOT NULL,
                termo_pesquisa VARCHAR(255) NOT NULL,
                usuario_id VARCHAR(50) NOT NULL,
                data_busca DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX(ml_id, usuario_id, data_busca)
            )
        `);
        
        // Inserir posição
        const query = `
            INSERT INTO position_tracking_ml (ml_id, titulo, posicao, termo_pesquisa, usuario_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const sanitizedValues = [
            mlId?.toString().substring(0, 50),
            titulo?.toString().substring(0, 500) || '',
            parseInt(posicao),
            termoPesquisa?.toString().substring(0, 255),
            userId?.toString().substring(0, 50)
        ];
        
        const result = await client.query(query, sanitizedValues);
        
        res.status(200).json({
            success: true,
            message: 'Posição ML salva com sucesso',
            record: result.rows[0]
        });
        
    } catch (error) {
        console.error('Erro ao salvar posição ML:', {
            error: error.message,
            mlId: req.body?.mlId,
            userId: req.body?.userId
        });
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
} 