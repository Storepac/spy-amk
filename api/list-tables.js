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
        
        // Listar tabelas do schema public
        const tablesResult = await client.query(`
            SELECT table_name, table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        const tabelas = [];
        
        // Para cada tabela, buscar informações detalhadas
        for (const table of tablesResult.rows) {
            const columnsResult = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = $1
                ORDER BY ordinal_position
            `, [table.table_name]);
            
            // Contar registros
            let count = 0;
            try {
                const countResult = await client.query(`SELECT COUNT(*) as total FROM "${table.table_name}"`);
                count = parseInt(countResult.rows[0].total);
            } catch (e) {
                console.log(`Não foi possível contar registros da tabela ${table.table_name}`);
            }
            
            tabelas.push({
                nome: table.table_name,
                tipo: table.table_type,
                total_registros: count,
                colunas: columnsResult.rows.map(col => ({
                    nome: col.column_name,
                    tipo: col.data_type,
                    nulavel: col.is_nullable === 'YES',
                    padrao: col.column_default
                }))
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Tabelas listadas com sucesso',
            total_tabelas: tabelas.length,
            tabelas: tabelas
        });
        
    } catch (error) {
        console.error('Erro ao listar tabelas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar tabelas',
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