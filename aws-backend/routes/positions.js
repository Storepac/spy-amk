const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/database');

// POST /api/positions - Salvar posição
router.post('/positions', async (req, res) => {
    try {
        const {
            asin, titulo, posicao, pagina = 1, termo_pesquisa, user_id = 'default_user'
        } = req.body;

        if (!asin || !titulo || !posicao || !termo_pesquisa) {
            return res.status(400).json({
                success: false,
                message: 'ASIN, título, posição e termo de pesquisa são obrigatórios'
            });
        }

        const queryText = `
            INSERT INTO posicoes (asin, titulo, posicao, pagina, termo_pesquisa, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await query(queryText, [asin, titulo, posicao, pagina, termo_pesquisa, user_id]);

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Posição salva com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao salvar posição:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar posição',
            error: error.message
        });
    }
});

// GET /api/positions/history - Histórico de posições
router.get('/positions/history', async (req, res) => {
    try {
        const {
            user_id = 'default_user',
            asin,
            termo_pesquisa,
            limit = 100,
            days = 30
        } = req.query;

        let whereClause = 'WHERE user_id = $1 AND data_coleta >= CURRENT_DATE - INTERVAL \'1 day\' * $2';
        let params = [user_id, parseInt(days)];
        let paramIndex = 3;

        if (asin) {
            whereClause += ` AND asin = $${paramIndex}`;
            params.push(asin);
            paramIndex++;
        }

        if (termo_pesquisa) {
            whereClause += ` AND termo_pesquisa = $${paramIndex}`;
            params.push(termo_pesquisa);
            paramIndex++;
        }

        const queryText = `
            SELECT asin, titulo, posicao, pagina, termo_pesquisa, data_coleta
            FROM posicoes 
            ${whereClause}
            ORDER BY data_coleta DESC
            LIMIT $${paramIndex}
        `;

        params.push(parseInt(limit));

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Erro ao buscar histórico de posições:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar histórico',
            error: error.message
        });
    }
});

module.exports = router; 