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
    const { userId, termoPesquisa, incluirSimilares = false, limite = 100 } = req.body || {};
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId é obrigatório' 
      });
    }

    console.log(`🔍 Buscando produtos para ${userId}, termo: "${termoPesquisa}"`);

    let query;
    let params;

    if (termoPesquisa && incluirSimilares) {
      // Busca inteligente: termo exato + similares
      const palavras = termoPesquisa.toLowerCase().split(' ').filter(p => p.length > 2);
      const condicoesBusca = palavras.map((_, index) => `LOWER(titulo) LIKE $${index + 2}`).join(' OR ');
      
      query = `
        SELECT DISTINCT asin, titulo, preco, avaliacao, num_avaliacoes, categoria, marca, bsr, 
               created_at, updated_at
        FROM produtos 
        WHERE usuario_id = $1 
        AND (${condicoesBusca})
        ORDER BY updated_at DESC
        LIMIT $${palavras.length + 2}
      `;
      
      params = [userId, ...palavras.map(p => `%${p}%`), limite];
      
    } else if (termoPesquisa) {
      // Busca simples por termo
      query = `
        SELECT DISTINCT asin, titulo, preco, avaliacao, num_avaliacoes, categoria, marca, bsr,
               created_at, updated_at
        FROM produtos 
        WHERE usuario_id = $1 
        AND LOWER(titulo) LIKE $2
        ORDER BY updated_at DESC
        LIMIT $3
      `;
      params = [userId, `%${termoPesquisa.toLowerCase()}%`, limite];
      
    } else {
      // Buscar todos os produtos do usuário
      query = `
        SELECT DISTINCT asin, titulo, preco, avaliacao, num_avaliacoes, categoria, marca, bsr,
               created_at, updated_at
        FROM produtos 
        WHERE usuario_id = $1 
        ORDER BY updated_at DESC
        LIMIT $2
      `;
      params = [userId, limite];
    }

    const result = await pool.query(query, params);
    
    // Formatar produtos para compatibilidade com o frontend
    const produtos = result.rows.map(row => ({
      asin: row.asin,
      titulo: row.titulo,
      preco: row.preco ? `R$ ${parseFloat(row.preco).toFixed(2)}` : 'N/A',
      precoNumerico: parseFloat(row.preco) || 0,
      avaliacao: row.avaliacao || 0,
      numAvaliacoes: row.num_avaliacoes || 0,
      categoria: row.categoria || 'N/A',
      marca: row.marca || 'N/A',
      ranking: row.bsr || null,
      bsr: row.bsr || null,
      link: `https://www.amazon.com.br/dp/${row.asin}`,
      origem: 'banco',
      isNovo: false,
      dataUltimaAtualizacao: row.updated_at,
      dataCriacao: row.created_at
    }));

    console.log(`📦 Encontrados ${produtos.length} produtos no banco`);

    return res.status(200).json({
      success: true,
      total: produtos.length,
      termo_pesquisa: termoPesquisa,
      incluir_similares: incluirSimilares,
      produtos: produtos
    });

  } catch (error) {
    console.error('❌ Erro get-products:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}; 