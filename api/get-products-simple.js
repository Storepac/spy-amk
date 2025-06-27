const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Apenas POST permitido' });
    }

    try {
        const { userId, termoPesquisa } = req.body || {};
        
        console.log(`🔍 get-products-simple: userId=${userId}, termo=${termoPesquisa}`);
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'userId é obrigatório' 
            });
        }

        // Query simples para buscar produtos
        let query = `
            SELECT asin, titulo, preco, avaliacao, num_avaliacoes, categoria, marca, bsr
            FROM produtos 
            WHERE usuario_id = $1
        `;
        let params = [userId];

        // Se tem termo de pesquisa, filtrar
        if (termoPesquisa) {
            query += ` AND LOWER(titulo) LIKE $2`;
            params.push(`%${termoPesquisa.toLowerCase()}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT 50`;

        console.log(`📊 Query: ${query}`);
        console.log(`📋 Params: ${JSON.stringify(params)}`);

        const result = await pool.query(query, params);
        
        console.log(`📦 Resultado: ${result.rows.length} produtos encontrados`);

        // Formatar produtos
        const produtos = result.rows.map(row => ({
            asin: row.asin,
            titulo: row.titulo,
            preco: row.preco ? `R$ ${parseFloat(row.preco).toFixed(2)}` : 'N/A',
            avaliacao: row.avaliacao || 0,
            numAvaliacoes: row.num_avaliacoes || 0,
            categoria: row.categoria || 'N/A',
            marca: row.marca || 'N/A',
            bsr: row.bsr || null,
            origem: 'banco',
            isNovo: false
        }));

        return res.status(200).json({
            success: true,
            total: produtos.length,
            termo_pesquisa: termoPesquisa || 'todos',
            produtos: produtos
        });

    } catch (error) {
        console.error('❌ Erro get-products-simple:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}; 