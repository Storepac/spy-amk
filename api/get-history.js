const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
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
        const { asin, userId, dias = 30 } = req.query;
        
        // Validar parâmetros obrigatórios
        if (!userId) {
            res.status(400).json({ error: 'userId é obrigatório' });
            return;
        }
        
        let query;
        let values;
        
        if (asin) {
            // Buscar histórico de um produto específico
            query = `
                SELECT asin, titulo_produto, termo_pesquisa, data, posicao, timestamp
                FROM position_tracking
                WHERE asin = $1 AND usuario_id = $2
                ORDER BY data DESC
                LIMIT $3
            `;
            values = [asin, userId, parseInt(dias)];
        } else {
            // Buscar histórico geral do usuário
            query = `
                SELECT asin, titulo_produto, termo_pesquisa, data, posicao, timestamp
                FROM position_tracking
                WHERE usuario_id = $1
                AND data >= CURRENT_DATE - INTERVAL '${parseInt(dias)} days'
                ORDER BY data DESC, posicao ASC
            `;
            values = [userId];
        }
        
        console.log('Query histórico:', query);
        console.log('Params:', values);
        
        const result = await pool.query(query, values);
        
        // Transformar resultados para formato compatível com frontend
        const historico = result.rows.map(row => ({
            asin: row.asin,
            titulo_produto: row.titulo_produto,
            termo_pesquisa: row.termo_pesquisa,
            data: row.data,
            posicao: row.posicao,
            timestamp: row.timestamp
        }));
        
        // Se busca específica por ASIN, calcular tendência
        let tendencia = null;
        if (asin && historico.length >= 2) {
            const posicaoAtual = historico[0].posicao;
            const posicaoAnterior = historico[1].posicao;
            
            if (posicaoAtual < posicaoAnterior) {
                tendencia = 'subiu';
            } else if (posicaoAtual > posicaoAnterior) {
                tendencia = 'desceu';
            } else {
                tendencia = 'estavel';
            }
        }
        
        res.status(200).json({
            success: true,
            asin: asin || null,
            userId: userId,
            dias: parseInt(dias),
            total: historico.length,
            tendencia: tendencia,
            historico: historico
        });
        
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
} 