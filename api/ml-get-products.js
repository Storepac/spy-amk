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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Método não permitido' });
        return;
    }
    
    try {
        const { termo, userId } = req.query;
        
        if (!userId) {
            res.status(400).json({ error: 'userId é obrigatório' });
            return;
        }
        
        const client = await connectToDatabase();
        
        let query;
        let queryValues;
        
        if (termo && termo.trim() !== '') {
            // Buscar produtos que contenham o termo no título
            query = `
                SELECT 
                    ml_id as mlId,
                    titulo,
                    preco,
                    preco_original as precoOriginal,
                    desconto,
                    avaliacao,
                    num_avaliacoes as numAvaliacoes,
                    vendedor,
                    patrocinado,
                    mais_vendido as maisVendido,
                    loja_oficial as lojaOficial,
                    frete_gratis as freteGratis,
                    condicao,
                    vendas,
                    receita,
                    link,
                    imagem,
                    created_at as createdAt,
                    updated_at as updatedAt
                FROM produtos_ml 
                WHERE usuario_id = $1 
                    AND (titulo ILIKE $2 OR ml_id ILIKE $2)
                ORDER BY updated_at DESC
                LIMIT 100
            `;
            queryValues = [userId, `%${termo}%`];
        } else {
            // Buscar todos os produtos do usuário
            query = `
                SELECT 
                    ml_id as mlId,
                    titulo,
                    preco,
                    preco_original as precoOriginal,
                    desconto,
                    avaliacao,
                    num_avaliacoes as numAvaliacoes,
                    vendedor,
                    patrocinado,
                    mais_vendido as maisVendido,
                    loja_oficial as lojaOficial,
                    frete_gratis as freteGratis,
                    condicao,
                    vendas,
                    receita,
                    link,
                    imagem,
                    created_at as createdAt,
                    updated_at as updatedAt
                FROM produtos_ml 
                WHERE usuario_id = $1 
                ORDER BY updated_at DESC
                LIMIT 100
            `;
            queryValues = [userId];
        }
        
        const result = await client.query(query, queryValues);
        
        // Formatar dados para compatibilidade com o frontend
        const produtos = result.rows.map(produto => ({
            ...produto,
            // Campos de compatibilidade
            id: produto.mlId,
            precoNumerico: produto.preco,
            vendidos: produto.vendas || 'N/A',
            plataforma: 'mercadolivre',
            origem: 'banco',
            isNovo: false,
            posicao: null,
            tipo: 'Histórico ML'
        }));
        
        res.status(200).json({
            success: true,
            message: `${produtos.length} produtos ML encontrados`,
            produtos: produtos,
            total: produtos.length,
            termo: termo || 'todos'
        });
        
    } catch (error) {
        console.error('Erro ao buscar produtos ML:', {
            error: error.message,
            termo: req.query?.termo,
            userId: req.query?.userId
        });
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
} 