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
        const { 
            mlId, titulo, preco, precoOriginal, desconto, avaliacao, numAvaliacoes, 
            vendedor, patrocinado, maisVendido, lojaOficial, freteGratis, condicao, 
            vendas, receita, link, imagem, userId 
        } = req.body;
        
        // Validar dados obrigatórios
        if (!mlId || !userId) {
            res.status(400).json({ error: 'mlId e userId são obrigatórios' });
            return;
        }
        
        const client = await connectToDatabase();
        
        // Criar tabela de produtos ML se não existir
        await client.query(`
            CREATE TABLE IF NOT EXISTS produtos_ml (
                id SERIAL PRIMARY KEY,
                ml_id VARCHAR(50) NOT NULL,
                titulo VARCHAR(500),
                preco DECIMAL(10,2),
                preco_original DECIMAL(10,2),
                desconto INTEGER,
                avaliacao DECIMAL(3,2),
                num_avaliacoes INTEGER,
                vendedor VARCHAR(200),
                patrocinado BOOLEAN DEFAULT false,
                mais_vendido BOOLEAN DEFAULT false,
                loja_oficial BOOLEAN DEFAULT false,
                frete_gratis BOOLEAN DEFAULT false,
                condicao VARCHAR(50) DEFAULT 'Novo',
                vendas INTEGER,
                receita DECIMAL(15,2),
                link TEXT,
                imagem TEXT,
                usuario_id VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(ml_id, usuario_id)
            )
        `);
        
        // Inserir ou atualizar produto (UPSERT)
        const query = `
            INSERT INTO produtos_ml (
                ml_id, titulo, preco, preco_original, desconto, avaliacao, num_avaliacoes,
                vendedor, patrocinado, mais_vendido, loja_oficial, frete_gratis, condicao,
                vendas, receita, link, imagem, usuario_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (ml_id, usuario_id)
            DO UPDATE SET 
                titulo = EXCLUDED.titulo,
                preco = EXCLUDED.preco,
                preco_original = EXCLUDED.preco_original,
                desconto = EXCLUDED.desconto,
                avaliacao = EXCLUDED.avaliacao,
                num_avaliacoes = EXCLUDED.num_avaliacoes,
                vendedor = EXCLUDED.vendedor,
                patrocinado = EXCLUDED.patrocinado,
                mais_vendido = EXCLUDED.mais_vendido,
                loja_oficial = EXCLUDED.loja_oficial,
                frete_gratis = EXCLUDED.frete_gratis,
                condicao = EXCLUDED.condicao,
                vendas = EXCLUDED.vendas,
                receita = EXCLUDED.receita,
                link = EXCLUDED.link,
                imagem = EXCLUDED.imagem,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        
        // Sanitizar e validar dados
        const sanitizedValues = [
            mlId?.toString().substring(0, 50) || null,
            titulo?.toString().substring(0, 500) || null,
            preco && !isNaN(parseFloat(preco)) ? parseFloat(preco) : null,
            precoOriginal && !isNaN(parseFloat(precoOriginal)) ? parseFloat(precoOriginal) : null,
            desconto && !isNaN(parseInt(desconto)) ? Math.max(0, Math.min(100, parseInt(desconto))) : null,
            avaliacao && !isNaN(parseFloat(avaliacao)) ? Math.min(5, Math.max(0, parseFloat(avaliacao))) : null,
            numAvaliacoes && !isNaN(parseInt(numAvaliacoes)) ? Math.max(0, parseInt(numAvaliacoes)) : null,
            vendedor?.toString().substring(0, 200) || null,
            !!patrocinado,
            !!maisVendido,
            !!lojaOficial,
            !!freteGratis,
            condicao?.toString().substring(0, 50) || 'Novo',
            vendas && !isNaN(parseInt(vendas)) ? Math.max(0, parseInt(vendas)) : null,
            receita && !isNaN(parseFloat(receita)) ? parseFloat(receita) : null,
            link?.toString() || null,
            imagem?.toString() || null,
            userId?.toString().substring(0, 50) || null
        ];
        
        const result = await client.query(query, sanitizedValues);
        
        res.status(200).json({ 
            success: true, 
            message: 'Produto ML inserido/atualizado com sucesso',
            mlId: mlId,
            record: result.rows[0]
        });
        
    } catch (error) {
        console.error('Erro ao inserir produto ML:', {
            error: error.message,
            mlId: req.body?.mlId,
            userId: req.body?.userId,
            data: req.body
        });
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: error.message,
            mlId: req.body?.mlId
        });
    }
} 