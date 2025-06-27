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
        const { asins, userId } = req.body || {};
        
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

        console.log(`🔍 Verificando ${asins.length} ASINs para ${userId}`);

        // Query simples - verifica um ASIN por vez para debug
        const produtosExistentes = [];
        
        for (const asin of asins) {
            const result = await pool.query(
                'SELECT asin, titulo FROM produtos WHERE usuario_id = $1 AND asin = $2',
                [userId, asin]
            );
            
            if (result.rows.length > 0) {
                produtosExistentes.push(result.rows[0]);
            }
        }

        const asinsExistentes = produtosExistentes.map(p => p.asin);
        const asinsNovos = asins.filter(asin => !asinsExistentes.includes(asin));

        console.log(`📊 ${produtosExistentes.length} existentes, ${asinsNovos.length} novos`);

        return res.status(200).json({
            success: true,
            total_verificados: asins.length,
            existentes: produtosExistentes.length,
            novos: asinsNovos.length,
            asins_existentes: asinsExistentes,
            asins_novos: asinsNovos,
            produtos_existentes: produtosExistentes
        });

    } catch (error) {
        console.error('❌ Erro check-existing:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Erro interno',
            message: error.message
        });
    }
}; 