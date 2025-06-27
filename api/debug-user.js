const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
    // Configurar headers primeiro
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Lidar com OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Validar método
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Apenas POST é permitido' 
        });
    }

    try {
        // Extrair userId
        const { userId } = req.body || {};
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'userId é obrigatório',
                received: req.body
            });
        }

        console.log('🔍 Debug usuário:', userId);

        // Query simples para produtos
        const produtosResult = await pool.query(
            'SELECT COUNT(*) as total FROM produtos WHERE usuario_id = $1',
            [userId]
        );

        // Query simples para tracking  
        const trackingResult = await pool.query(
            'SELECT COUNT(*) as total FROM position_tracking WHERE usuario_id = $1',
            [userId]
        );

        const response = {
            success: true,
            userId: userId,
            produtos: parseInt(produtosResult.rows[0]?.total || 0),
            tracking: parseInt(trackingResult.rows[0]?.total || 0),
            timestamp: new Date().toISOString()
        };

        console.log('✅ Debug resultado:', response);
        return res.status(200).json(response);

    } catch (error) {
        console.error('❌ Erro debug-user:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Erro interno',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}; 