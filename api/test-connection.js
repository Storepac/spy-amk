import { Client } from 'pg';

export default async function handler(req, res) {
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
    
    let client = null;
    
    try {
        // String de conexão via variável de ambiente
        const connectionString = process.env.DATABASE_URL;
        
        if (!connectionString) {
            throw new Error('DATABASE_URL não configurada');
        }
        
        client = new Client({
            connectionString: connectionString,
            ssl: { rejectUnauthorized: false }
        });
        
        await client.connect();
        
        // Testar a conexão executando uma query simples
        const result = await client.query('SELECT NOW() as timestamp, version() as postgres_version');
        
        res.status(200).json({
            success: true,
            message: 'Conexão com banco de dados estabelecida com sucesso!',
            timestamp: result.rows[0].timestamp,
            postgres_version: result.rows[0].postgres_version.split(' ').slice(0, 2).join(' '),
            database: 'PostgreSQL',
            connection_status: 'Ativa'
        });
        
    } catch (error) {
        console.error('Erro na conexão:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao conectar com o banco de dados',
            details: error.message,
            code: error.code || 'UNKNOWN'
        });
    } finally {
        if (client) {
            try {
                await client.end();
            } catch (e) {
                console.error('Erro ao fechar conexão:', e);
            }
        }
    }
} 