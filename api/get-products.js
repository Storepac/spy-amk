const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido. Use GET.' });
  }

  const { userId, asin, limit = 20 } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório' });
  }

  try {
    let query = `
      SELECT 
        id, asin, titulo, preco, avaliacao, num_avaliacoes, 
        categoria, marca, bsr, created_at, updated_at
      FROM produtos 
      WHERE usuario_id = $1
    `;
    
    const params = [userId];
    
    if (asin) {
      query += ` AND asin = $2`;
      params.push(asin);
      query += ` ORDER BY created_at DESC LIMIT $3`;
      params.push(parseInt(limit));
    } else {
      query += ` ORDER BY created_at DESC LIMIT $2`;
      params.push(parseInt(limit));
    }

    console.log('Query produtos:', query);
    console.log('Params:', params);

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      produtos: result.rows,
      total: result.rows.length,
      filtros: {
        userId,
        asin: asin || null,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}; 