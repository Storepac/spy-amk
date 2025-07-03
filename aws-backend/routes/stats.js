const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/stats - Estatísticas gerais
router.get('/stats', async (req, res) => {
    try {
        const { user_id = 'default_user' } = req.query;

        // Estatísticas básicas
        const statsQuery = `
            SELECT 
                COUNT(*) as total_produtos,
                COUNT(DISTINCT termo_pesquisa) as total_pesquisas,
                AVG(preco_numerico) as preco_medio,
                AVG(avaliacao) as avaliacao_media,
                SUM(receita_mes) as receita_total
            FROM produtos 
            WHERE user_id = $1
        `;

        // Top categorias
        const categoriasQuery = `
            SELECT categoria, COUNT(*) as count
            FROM produtos 
            WHERE user_id = $1 AND categoria IS NOT NULL
            GROUP BY categoria
            ORDER BY count DESC
            LIMIT 10
        `;

        // Top marcas
        const marcasQuery = `
            SELECT marca, COUNT(*) as count, AVG(preco_numerico) as preco_medio
            FROM produtos 
            WHERE user_id = $1 AND marca IS NOT NULL
            GROUP BY marca
            ORDER BY count DESC
            LIMIT 10
        `;

        // Tendências últimos 7 dias
        const tendenciasQuery = `
            SELECT 
                DATE(created_at) as data,
                COUNT(*) as produtos_novos
            FROM produtos 
            WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY data DESC
        `;

        const [stats, categorias, marcas, tendencias] = await Promise.all([
            query(statsQuery, [user_id]),
            query(categoriasQuery, [user_id]),
            query(marcasQuery, [user_id]),
            query(tendenciasQuery, [user_id])
        ]);

        res.json({
            success: true,
            data: {
                estatisticas: stats.rows[0],
                top_categorias: categorias.rows,
                top_marcas: marcas.rows,
                tendencias_7_dias: tendencias.rows
            }
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas',
            error: error.message
        });
    }
});

// GET /api/stats/revenue - Análise de receita
router.get('/stats/revenue', async (req, res) => {
    try {
        const { user_id = 'default_user', limit = 20 } = req.query;

        const queryText = `
            SELECT 
                asin, titulo, marca, categoria, receita_mes, vendidos,
                preco_numerico, ranking, termo_pesquisa
            FROM produtos 
            WHERE user_id = $1 AND receita_mes IS NOT NULL
            ORDER BY receita_mes DESC
            LIMIT $2
        `;

        const result = await query(queryText, [user_id, parseInt(limit)]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Erro ao buscar análise de receita:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar análise de receita',
            error: error.message
        });
    }
});

// GET /api/stats/search-terms - Análise de termos de pesquisa
router.get('/stats/search-terms', async (req, res) => {
    try {
        const { user_id = 'default_user' } = req.query;

        const queryText = `
            SELECT 
                termo_pesquisa,
                COUNT(*) as total_produtos,
                AVG(preco_numerico) as preco_medio,
                AVG(avaliacao) as avaliacao_media,
                SUM(receita_mes) as receita_total,
                MAX(created_at) as ultima_pesquisa
            FROM produtos 
            WHERE user_id = $1 AND termo_pesquisa IS NOT NULL
            GROUP BY termo_pesquisa
            ORDER BY total_produtos DESC
        `;

        const result = await query(queryText, [user_id]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Erro ao analisar termos de pesquisa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao analisar termos de pesquisa',
            error: error.message
        });
    }
});

module.exports = router; 