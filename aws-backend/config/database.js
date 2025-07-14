const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool de conexões PostgreSQL
const poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    
    // Configurações do pool
    max: 20, // máximo de conexões no pool
    min: 2,  // mínimo de conexões no pool
    idleTimeoutMillis: 30000, // timeout para conexões inativas
    connectionTimeoutMillis: 10000, // timeout para criar conexão
    
    // SSL apenas para AWS RDS em produção (Dokploy não precisa)
    ssl: process.env.NODE_ENV === 'production' && process.env.DB_HOST.includes('rds.amazonaws.com') ? {
        rejectUnauthorized: false
    } : false,
    
    // Query timeout
    query_timeout: 60000,
    statement_timeout: 60000,
    
    // Configurações adicionais
    application_name: 'spy-amk-extension-dokploy'
};

// Criar pool de conexões
const pool = new Pool(poolConfig);

// Event listeners para debugging
pool.on('connect', (client) => {
    console.log('🔗 Nova conexão PostgreSQL estabelecida');
});

pool.on('error', (err, client) => {
    console.error('❌ Erro inesperado no pool PostgreSQL:', err);
    process.exit(-1);
});

// Função para testar conexão
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as timestamp, version() as version');
        client.release();
        
        console.log('✅ Conexão AWS RDS PostgreSQL bem-sucedida!');
        console.log(`🕒 Timestamp: ${result.rows[0].timestamp}`);
        console.log(`📋 Versão: ${result.rows[0].version.split(',')[0]}`);
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com AWS RDS:', error.message);
        return false;
    }
}

// Função helper para executar queries
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 Query executada em ${duration}ms:`, {
                query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                rows: res.rowCount
            });
        }
        
        return res;
    } catch (error) {
        console.error('❌ Erro na query:', {
            query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            error: error.message
        });
        throw error;
    }
}

// Função para transações
async function transaction(callback) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Função para inserção em lote (batch insert)
async function batchInsert(tableName, columns, data, conflictAction = 'DO NOTHING') {
    if (!data || data.length === 0) {
        return { rowCount: 0 };
    }
    
    const columnNames = columns.join(', ');
    const placeholders = data.map((_, index) => {
        const start = index * columns.length;
        const params = columns.map((_, colIndex) => `$${start + colIndex + 1}`);
        return `(${params.join(', ')})`;
    }).join(', ');
    
    const values = data.flat();
    
    const queryText = `
        INSERT INTO ${tableName} (${columnNames})
        VALUES ${placeholders}
        ON CONFLICT ${conflictAction}
    `;
    
    return await query(queryText, values);
}

// Função de cleanup para fechar pool
async function closePool() {
    try {
        await pool.end();
        console.log('🔒 Pool de conexões PostgreSQL fechado');
    } catch (error) {
        console.error('❌ Erro ao fechar pool:', error);
    }
}

// Configurar cleanup no exit
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

module.exports = {
    pool,
    query,
    transaction,
    batchInsert,
    testConnection,
    closePool
}; 