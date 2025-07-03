const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/database');

// GET /api/products - Listar produtos
router.get('/products', async (req, res) => {
    try {
        const { 
            user_id = 'default_user', 
            termo_pesquisa, 
            limit = 50, 
            offset = 0,
            order_by = 'created_at',
            order_direction = 'DESC'
        } = req.query;

        let whereClause = 'WHERE user_id = $1';
        let params = [user_id];
        let paramIndex = 2;

        if (termo_pesquisa) {
            whereClause += ` AND termo_pesquisa ILIKE $${paramIndex}`;
            params.push(`%${termo_pesquisa}%`);
            paramIndex++;
        }

        const queryText = `
            SELECT 
                id, asin, titulo, preco, preco_numerico, avaliacao, 
                num_avaliacoes, marca, vendedor, link_vendedor,
                categoria, categoria_secundaria, ranking, ranking_secundario,
                vendidos, receita_mes, imagem, link, termo_pesquisa,
                created_at, updated_at
            FROM produtos 
            ${whereClause}
            ORDER BY ${order_by} ${order_direction}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        params.push(parseInt(limit), parseInt(offset));
        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produtos',
            error: error.message
        });
    }
});

// POST /api/products - Inserir produto
router.post('/products', async (req, res) => {
    try {
        const {
            asin, titulo, preco, preco_numerico, avaliacao, num_avaliacoes,
            marca, vendedor, link_vendedor, categoria, categoria_secundaria,
            ranking, ranking_secundario, vendidos, receita_mes, imagem, 
            link, user_id = 'default_user', termo_pesquisa
        } = req.body;

        if (!asin || !titulo) {
            return res.status(400).json({
                success: false,
                message: 'ASIN e título são obrigatórios'
            });
        }

        const queryText = `
            INSERT INTO produtos (
                asin, titulo, preco, preco_numerico, avaliacao, num_avaliacoes,
                marca, vendedor, link_vendedor, categoria, categoria_secundaria,
                ranking, ranking_secundario, vendidos, receita_mes, imagem,
                link, user_id, termo_pesquisa
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
            )
            ON CONFLICT (asin, user_id) 
            DO UPDATE SET
                titulo = EXCLUDED.titulo,
                preco = EXCLUDED.preco,
                preco_numerico = EXCLUDED.preco_numerico,
                avaliacao = EXCLUDED.avaliacao,
                num_avaliacoes = EXCLUDED.num_avaliacoes,
                marca = EXCLUDED.marca,
                vendedor = EXCLUDED.vendedor,
                link_vendedor = EXCLUDED.link_vendedor,
                categoria = EXCLUDED.categoria,
                categoria_secundaria = EXCLUDED.categoria_secundaria,
                ranking = EXCLUDED.ranking,
                ranking_secundario = EXCLUDED.ranking_secundario,
                vendidos = EXCLUDED.vendidos,
                receita_mes = EXCLUDED.receita_mes,
                imagem = EXCLUDED.imagem,
                link = EXCLUDED.link,
                termo_pesquisa = EXCLUDED.termo_pesquisa,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;

        const params = [
            asin, titulo, preco, preco_numerico, avaliacao, num_avaliacoes,
            marca, vendedor, link_vendedor, categoria, categoria_secundaria,
            ranking, ranking_secundario, vendidos, receita_mes, imagem,
            link, user_id, termo_pesquisa
        ];

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Produto salvo com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao inserir produto:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar produto',
            error: error.message
        });
    }
});

// POST /api/products/batch - Inserir múltiplos produtos
router.post('/products/batch', async (req, res) => {
    try {
        const { products, user_id = 'default_user' } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Array de produtos é obrigatório'
            });
        }

        const result = await transaction(async (client) => {
            const insertedProducts = [];
            
            for (const product of products) {
                const {
                    asin, titulo, preco, preco_numerico, avaliacao, num_avaliacoes,
                    marca, vendedor, link_vendedor, categoria, categoria_secundaria,
                    ranking, ranking_secundario, vendidos, receita_mes, imagem,
                    link, termo_pesquisa
                } = product;

                if (!asin || !titulo) {
                    continue;
                }

                const queryText = `
                    INSERT INTO produtos (
                        asin, titulo, preco, preco_numerico, avaliacao, num_avaliacoes,
                        marca, vendedor, link_vendedor, categoria, categoria_secundaria,
                        ranking, ranking_secundario, vendidos, receita_mes, imagem,
                        link, user_id, termo_pesquisa
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
                    )
                    ON CONFLICT (asin, user_id) 
                    DO UPDATE SET
                        titulo = EXCLUDED.titulo,
                        preco = EXCLUDED.preco,
                        preco_numerico = EXCLUDED.preco_numerico,
                        avaliacao = EXCLUDED.avaliacao,
                        num_avaliacoes = EXCLUDED.num_avaliacoes,
                        marca = EXCLUDED.marca,
                        vendedor = EXCLUDED.vendedor,
                        link_vendedor = EXCLUDED.link_vendedor,
                        categoria = EXCLUDED.categoria,
                        categoria_secundaria = EXCLUDED.categoria_secundaria,
                        ranking = EXCLUDED.ranking,
                        ranking_secundario = EXCLUDED.ranking_secundario,
                        vendidos = EXCLUDED.vendidos,
                        receita_mes = EXCLUDED.receita_mes,
                        imagem = EXCLUDED.imagem,
                        link = EXCLUDED.link,
                        termo_pesquisa = EXCLUDED.termo_pesquisa,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING *
                `;

                const params = [
                    asin, titulo, preco, preco_numerico, avaliacao, num_avaliacoes,
                    marca, vendedor, link_vendedor, categoria, categoria_secundaria,
                    ranking, ranking_secundario, vendidos, receita_mes, imagem,
                    link, user_id, termo_pesquisa
                ];

                const insertResult = await client.query(queryText, params);
                insertedProducts.push(insertResult.rows[0]);
            }

            return insertedProducts;
        });

        res.json({
            success: true,
            data: result,
            count: result.length,
            message: `${result.length} produtos salvos com sucesso!`
        });

    } catch (error) {
        console.error('Erro ao inserir produtos em lote:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao salvar produtos em lote',
            error: error.message
        });
    }
});

// GET /api/products/:asin - Buscar produto por ASIN
router.get('/products/:asin', async (req, res) => {
    try {
        const { asin } = req.params;
        const { user_id = 'default_user' } = req.query;

        const queryText = `
            SELECT * FROM produtos 
            WHERE asin = $1 AND user_id = $2
        `;

        const result = await query(queryText, [asin, user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produto',
            error: error.message
        });
    }
});

// DELETE /api/products/:asin - Deletar produto
router.delete('/products/:asin', async (req, res) => {
    try {
        const { asin } = req.params;
        const { user_id = 'default_user' } = req.query;

        const queryText = `
            DELETE FROM produtos 
            WHERE asin = $1 AND user_id = $2
            RETURNING *
        `;

        const result = await query(queryText, [asin, user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Produto deletado com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar produto',
            error: error.message
        });
    }
});

// GET /api/products/search - Busca avançada
router.get('/products/search', async (req, res) => {
    try {
        const {
            user_id = 'default_user',
            q, // query geral
            marca,
            vendedor,
            categoria,
            min_preco,
            max_preco,
            min_avaliacao,
            min_vendidos,
            limit = 50,
            offset = 0
        } = req.query;

        let whereClause = 'WHERE user_id = $1';
        let params = [user_id];
        let paramIndex = 2;

        if (q) {
            whereClause += ` AND (titulo ILIKE $${paramIndex} OR marca ILIKE $${paramIndex} OR categoria ILIKE $${paramIndex})`;
            params.push(`%${q}%`);
            paramIndex++;
        }

        if (marca) {
            whereClause += ` AND marca ILIKE $${paramIndex}`;
            params.push(`%${marca}%`);
            paramIndex++;
        }

        if (vendedor) {
            whereClause += ` AND vendedor ILIKE $${paramIndex}`;
            params.push(`%${vendedor}%`);
            paramIndex++;
        }

        if (categoria) {
            whereClause += ` AND (categoria ILIKE $${paramIndex} OR categoria_secundaria ILIKE $${paramIndex})`;
            params.push(`%${categoria}%`);
            paramIndex++;
        }

        if (min_preco) {
            whereClause += ` AND preco_numerico >= $${paramIndex}`;
            params.push(parseFloat(min_preco));
            paramIndex++;
        }

        if (max_preco) {
            whereClause += ` AND preco_numerico <= $${paramIndex}`;
            params.push(parseFloat(max_preco));
            paramIndex++;
        }

        if (min_avaliacao) {
            whereClause += ` AND avaliacao >= $${paramIndex}`;
            params.push(parseFloat(min_avaliacao));
            paramIndex++;
        }

        if (min_vendidos) {
            whereClause += ` AND vendidos >= $${paramIndex}`;
            params.push(parseInt(min_vendidos));
            paramIndex++;
        }

        const queryText = `
            SELECT * FROM produtos 
            ${whereClause}
            ORDER BY receita_mes DESC NULLS LAST, created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        params.push(parseInt(limit), parseInt(offset));

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Erro na busca avançada:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na busca avançada',
            error: error.message
        });
    }
});

module.exports = router; 