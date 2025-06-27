import { Client } from 'pg';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.status(405).json({ error: 'Método não permitido' });
        return;
    }
    
    // Extrair userId se fornecido
    let userId = null;
    if (req.method === 'POST' && req.body?.userId) {
        userId = req.body.userId;
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
        
        const contadores = {};
        
        // Verificar e contar tabela de produtos
        try {
            let produtosQuery = 'SELECT COUNT(*) as total FROM produtos';
            let ultimosProdutosQuery = `
                SELECT asin, titulo, marca, created_at 
                FROM produtos 
                ORDER BY created_at DESC 
                LIMIT 5
            `;
            
            if (userId) {
                produtosQuery += ' WHERE usuario_id = $1';
                ultimosProdutosQuery = `
                    SELECT asin, titulo, marca, created_at 
                    FROM produtos 
                    WHERE usuario_id = $1
                    ORDER BY created_at DESC 
                    LIMIT 5
                `;
            }
            
            const produtosResult = await client.query(produtosQuery, userId ? [userId] : []);
            contadores.produtos = parseInt(produtosResult.rows[0].total);
            
            // Últimos 5 produtos inseridos
            const ultimosProdutos = await client.query(ultimosProdutosQuery, userId ? [userId] : []);
            contadores.ultimos_produtos = ultimosProdutos.rows;
            
        } catch (error) {
            contadores.produtos = 'Tabela não existe ainda';
        }
        
        // Verificar e contar tabela de position_tracking
        try {
            let trackingQuery = 'SELECT COUNT(*) as total FROM position_tracking';
            let ultimasPosicoesQuery = `
                SELECT asin, titulo_produto, posicao, data, created_at 
                FROM position_tracking 
                ORDER BY created_at DESC 
                LIMIT 5
            `;
            
            if (userId) {
                trackingQuery += ' WHERE usuario_id = $1';
                ultimasPosicoesQuery = `
                    SELECT asin, titulo_produto, posicao, data, created_at 
                    FROM position_tracking 
                    WHERE usuario_id = $1
                    ORDER BY created_at DESC 
                    LIMIT 5
                `;
            }
            
            const positionsResult = await client.query(trackingQuery, userId ? [userId] : []);
            contadores.position_tracking = parseInt(positionsResult.rows[0].total);
            
            // Últimas 5 posições registradas
            const ultimasPosicoes = await client.query(ultimasPosicoesQuery, userId ? [userId] : []);
            contadores.ultimas_posicoes = ultimasPosicoes.rows;
            
        } catch (error) {
            contadores.position_tracking = 'Tabela não existe ainda';
        }
        
        // Estatísticas por usuário
        try {
            const usuariosResult = await client.query(`
                SELECT usuario_id, COUNT(*) as total_produtos
                FROM produtos 
                GROUP BY usuario_id 
                ORDER BY total_produtos DESC
            `);
            contadores.produtos_por_usuario = usuariosResult.rows;
        } catch (error) {
            contadores.produtos_por_usuario = [];
        }
        
        res.status(200).json({
            success: true,
            message: 'Contagem de registros realizada com sucesso',
            timestamp: new Date().toISOString(),
            userId: userId || 'todos',
            contadores: contadores
        });
        
    } catch (error) {
        console.error('Erro ao contar registros:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao contar registros',
            details: error.message
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