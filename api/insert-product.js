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
        const { asin, titulo, preco, avaliacao, numAvaliacoes, categoria, marca, bsr, userId } = req.body;
        
        // Validar dados obrigatórios
        if (!asin || !userId) {
            res.status(400).json({ error: 'ASIN e userId são obrigatórios' });
            return;
        }
        
        const client = await connectToDatabase();
        
        // Criar tabela de produtos se não existir
        await client.query(`
            CREATE TABLE IF NOT EXISTS produtos (
                id SERIAL PRIMARY KEY,
                asin VARCHAR(20) NOT NULL,
                titulo VARCHAR(500),
                preco DECIMAL(10,2),
                avaliacao DECIMAL(3,2),
                num_avaliacoes INTEGER,
                categoria VARCHAR(200),
                marca VARCHAR(200),
                bsr INTEGER,
                usuario_id VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(asin, usuario_id)
            )
        `);
        
        // Inserir ou atualizar produto (UPSERT)
        const query = `
            INSERT INTO produtos (asin, titulo, preco, avaliacao, num_avaliacoes, categoria, marca, bsr, usuario_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (asin, usuario_id)
            DO UPDATE SET 
                titulo = EXCLUDED.titulo,
                preco = EXCLUDED.preco,
                avaliacao = EXCLUDED.avaliacao,
                num_avaliacoes = EXCLUDED.num_avaliacoes,
                categoria = EXCLUDED.categoria,
                marca = EXCLUDED.marca,
                bsr = EXCLUDED.bsr,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        
        // Sanitizar e validar dados
        const sanitizedValues = [
            asin?.toString().substring(0, 20) || null,
            titulo?.toString().substring(0, 500) || null,
            preco && !isNaN(parseFloat(preco)) ? parseFloat(preco) : null,
            avaliacao && !isNaN(parseFloat(avaliacao)) ? Math.min(5, Math.max(0, parseFloat(avaliacao))) : null,
            numAvaliacoes && !isNaN(parseInt(numAvaliacoes)) ? Math.max(0, parseInt(numAvaliacoes)) : null,
            categoria?.toString().substring(0, 200) || null,
            marca?.toString().substring(0, 200) || null,
            bsr && !isNaN(parseInt(bsr)) ? Math.max(0, parseInt(bsr)) : null,
            userId?.toString().substring(0, 50) || null
        ];
        
        const result = await client.query(query, sanitizedValues);
        
        res.status(200).json({ 
            success: true, 
            message: 'Produto inserido/atualizado com sucesso',
            asin: asin,
            record: result.rows[0]
        });
        
    } catch (error) {
        console.error('Erro ao inserir produto:', {
            error: error.message,
            asin: req.body?.asin,
            userId: req.body?.userId,
            data: req.body
        });
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: error.message,
            asin: req.body?.asin
        });
    }
} 