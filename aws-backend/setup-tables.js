/**
 * Script para criar tabelas no database spy-amk-db
 */
const fs = require('fs');
const { Client } = require('pg');
const path = require('path');

async function setupTables() {
    const client = new Client({
        host: 'spy-amk-db.cluster-crai2eouav4j.us-east-2.rds.amazonaws.com',
        port: 5432,
        database: 'spy-amk-db', // Agora conecta ao nosso database
        user: 'postgres',
        password: '5CqwC[o&[REc93,M',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔗 Conectando ao database spy-amk-db...');
        await client.connect();
        console.log('✅ Conectado!');
        
        // Ler arquivo SQL
        console.log('📄 Lendo schema SQL...');
        const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('🗃️ Executando schema SQL...');
        await client.query(schema);
        
        console.log('✅ Tabelas criadas com sucesso!');
        
        // Verificar tabelas criadas
        console.log('🔍 Verificando tabelas criadas...');
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('📋 Tabelas criadas:');
        tables.rows.forEach(row => {
            console.log(`  ✅ ${row.table_name}`);
        });
        
        await client.end();
        console.log('\n🎉 Setup completo! Agora execute: npm run dev');
        
    } catch (error) {
        console.error('❌ Erro ao criar tabelas:', error.message);
        
        if (error.code === '42P07') {
            console.log('ℹ️  Algumas tabelas já existem (normal)');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('⚠️  SECURITY GROUP não configurado! Libere porta 5432 para seu IP');
        } else {
            console.log('\n🔧 Verifique:');
            console.log('1. Se o database spy-amk-db foi criado');
            console.log('2. Se o arquivo database-schema.sql existe');
            console.log('3. Conexão com AWS RDS');
        }
    }
}

setupTables(); 