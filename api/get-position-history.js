const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
    // Headers
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
        const { asins, userId, termoPesquisa } = req.body || {};
        
        if (!asins || !Array.isArray(asins) || asins.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'asins deve ser um array não vazio' 
            });
        }

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'userId é obrigatório' 
            });
        }

        console.log(`📈 Buscando histórico de ${asins.length} ASINs para ${userId}`);

        const tendencias = {};
        
        // Para cada ASIN, buscar as últimas 2 posições para calcular tendência
        for (const asin of asins) {
            const query = `
                SELECT asin, posicao, data, termo_pesquisa, created_at
                FROM position_tracking 
                WHERE usuario_id = $1 AND asin = $2
                ${termoPesquisa ? 'AND termo_pesquisa = $3' : ''}
                ORDER BY created_at DESC 
                LIMIT 2
            `;
            
            const params = termoPesquisa ? [userId, asin, termoPesquisa] : [userId, asin];
            const result = await pool.query(query, params);
            
            if (result.rows.length >= 2) {
                const [atual, anterior] = result.rows;
                const diferencaPosicao = anterior.posicao - atual.posicao;
                
                let tendencia = 'manteve';
                let icone = '➖';
                let cor = '#6b7280';
                
                if (diferencaPosicao > 0) {
                    tendencia = 'subiu';
                    icone = '📈';
                    cor = '#10b981';
                } else if (diferencaPosicao < 0) {
                    tendencia = 'desceu';
                    icone = '📉';
                    cor = '#ef4444';
                }
                
                tendencias[asin] = {
                    tendencia,
                    icone,
                    cor,
                    posicao_atual: atual.posicao,
                    posicao_anterior: anterior.posicao,
                    diferenca: Math.abs(diferencaPosicao),
                    data_atual: atual.data,
                    data_anterior: anterior.data,
                    historico: result.rows
                };
            } else if (result.rows.length === 1) {
                // Produto novo (apenas 1 registro)
                tendencias[asin] = {
                    tendencia: 'novo',
                    icone: '🆕',
                    cor: '#3b82f6',
                    posicao_atual: result.rows[0].posicao,
                    posicao_anterior: null,
                    diferenca: 0,
                    data_atual: result.rows[0].data,
                    data_anterior: null,
                    historico: result.rows
                };
            } else {
                // Sem histórico
                tendencias[asin] = {
                    tendencia: 'sem_dados',
                    icone: '❓',
                    cor: '#9ca3af',
                    posicao_atual: null,
                    posicao_anterior: null,
                    diferenca: 0,
                    data_atual: null,
                    data_anterior: null,
                    historico: []
                };
            }
        }

        console.log(`📊 Tendências calculadas para ${Object.keys(tendencias).length} produtos`);

        return res.status(200).json({
            success: true,
            total_asins: asins.length,
            tendencias_calculadas: Object.keys(tendencias).length,
            tendencias: tendencias,
            termo_pesquisa: termoPesquisa || 'todos'
        });

    } catch (error) {
        console.error('❌ Erro get-position-history:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Erro interno',
            message: error.message
        });
    }
}; 