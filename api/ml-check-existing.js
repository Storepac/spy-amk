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
        const { mlIds, userId } = req.body;
        
        if (!Array.isArray(mlIds) || !userId) {
            res.status(400).json({ error: 'mlIds (array) e userId são obrigatórios' });
            return;
        }
        
        if (mlIds.length === 0) {
            res.status(200).json({
                success: true,
                existentes: [],
                novos: []
            });
            return;
        }
        
        const client = await connectToDatabase();
        
        // Verificar quais ML IDs já existem
        const placeholders = mlIds.map((_, index) => `$${index + 2}`).join(',');
        const query = `
            SELECT ml_id 
            FROM produtos_ml 
            WHERE usuario_id = $1 AND ml_id = ANY($2)
        `;
        
        const result = await client.query(query, [userId, mlIds]);
        
        const existentes = result.rows.map(row => row.ml_id);
        const novos = mlIds.filter(mlId => !existentes.includes(mlId));
        
        res.status(200).json({
            success: true,
            existentes: existentes,
            novos: novos,
            total_verificados: mlIds.length,
            total_existentes: existentes.length,
            total_novos: novos.length
        });
        
    } catch (error) {
        console.error('Erro ao verificar produtos ML existentes:', {
            error: error.message,
            mlIds: req.body?.mlIds?.length || 0,
            userId: req.body?.userId
        });
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
} 