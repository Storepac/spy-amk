/**
 * Script para criar database spy-amk-db no AWS RDS
 */
const { Client } = require('pg');

async function createDatabase() {
    const client = new Client({
        host: 'spy-amk-db.cluster-crai2eouav4j.us-east-2.rds.amazonaws.com',
        port: 5432,
        database: 'postgres', // Conecta ao database padrão primeiro
        user: 'postgres',
        password: '5CqwC[o&[REc93,M',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔗 Conectando ao AWS RDS...');
        await client.connect();
        
        console.log('✅ Conectado! Verificando se database spy-amk-db existe...');
        
        // Verificar se database já existe
        const checkDB = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = 'spy-amk-db'"
        );
        
        if (checkDB.rows.length > 0) {
            console.log('✅ Database spy-amk-db já existe!');
        } else {
            console.log('📂 Criando database spy-amk-db...');
            await client.query('CREATE DATABASE "spy-amk-db"');
            console.log('✅ Database spy-amk-db criado com sucesso!');
        }
        
        await client.end();
        console.log('🎉 Pronto! Agora execute: node setup-tables.js');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.log('\n🔧 Possíveis soluções:');
        console.log('1. Verificar se o Security Group permite conexões na porta 5432');
        console.log('2. Confirmar se a instância RDS está rodando');
        console.log('3. Verificar credenciais de acesso');
        
        if (error.code === 'ENOTFOUND') {
            console.log('4. Verificar endpoint do RDS');
        }
        if (error.code === 'ETIMEDOUT') {
            console.log('4. ⚠️  SECURITY GROUP não configurado! Libere porta 5432 para seu IP');
        }
        if (error.code === 'ECONNREFUSED') {
            console.log('4. Verificar Security Group - adicionar regra PostgreSQL');
        }
    }
}

createDatabase(); 