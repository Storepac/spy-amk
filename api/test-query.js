const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Teste simples - buscar um produto específico
        const result = await pool.query(
            "SELECT asin, titulo, usuario_id FROM produtos WHERE asin = 'B0BHDRW1DJ' LIMIT 1"
        );

        return res.status(200).json({
            success: true,
            found: result.rows.length > 0,
            produto: result.rows[0] || null,
            query: "SELECT asin, titulo, usuario_id FROM produtos WHERE asin = 'B0BHDRW1DJ' LIMIT 1"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 