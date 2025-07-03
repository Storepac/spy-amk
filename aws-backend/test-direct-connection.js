/**
 * Teste direto de conexão AWS RDS para debug
 */
const { Client } = require('pg');

async function testDirectConnection() {
    console.log('🧪 Teste direto de conexão AWS RDS');
    console.log('📍 Endpoint:', 'spy-amk-db.cluster-crai2eouav4j.us-east-2.rds.amazonaws.com');
    console.log('📊 Porta:', 5432);
    console.log('👤 Usuário:', 'postgres');
    console.log('🗄️ Database:', 'spy-amk-db');
    console.log('');

    const client = new Client({
        host: 'spy-amk-db.cluster-crai2eouav4j.us-east-2.rds.amazonaws.com',
        port: 5432,
        database: 'postgres', // Conecta ao database padrão primeiro
        user: 'postgres',
        password: '5CqwC[o&[REc93,M',
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000, // 10 segundos timeout
    });

    try {
        console.log('🔗 Tentando conectar...');
        await client.connect();
        
        console.log('✅ CONEXÃO ESTABELECIDA!');
        
        // Testar query
        const result = await client.query('SELECT NOW() as timestamp, version() as version');
        console.log('🕒 Timestamp:', result.rows[0].timestamp);
        console.log('📋 Versão PostgreSQL:', result.rows[0].version.split(',')[0]);
        
        // Verificar se database spy-amk-db existe
        const dbCheck = await client.query("SELECT 1 FROM pg_database WHERE datname = 'spy-amk-db'");
        if (dbCheck.rows.length > 0) {
            console.log('✅ Database "spy-amk-db" existe');
        } else {
            console.log('⚠️  Database "spy-amk-db" NÃO existe - será criado');
        }
        
        await client.end();
        console.log('✅ Teste concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
        console.log('🔧 Código do erro:', error.code);
        
        if (error.code === 'ETIMEDOUT') {
            console.log('🚨 TIMEOUT - Possíveis causas:');
            console.log('   1. Security Group não liberou porta 5432 para seu IP');
            console.log('   2. Instância RDS não está rodando');
            console.log('   3. Endpoint incorreto');
        } else if (error.code === 'ENOTFOUND') {
            console.log('🚨 ENDPOINT NÃO ENCONTRADO - Verifique o endpoint do RDS');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('🚨 CONEXÃO RECUSADA - Porta 5432 não está aberta');
        } else {
            console.log('🚨 Erro desconhecido - Verifique credenciais e configurações');
        }
    }
}

testDirectConnection(); 