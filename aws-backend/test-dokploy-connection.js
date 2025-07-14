const { Pool } = require('pg');
require('dotenv').config();

// Configuração específica para teste do Dokploy
const dokployConfig = {
    host: 'spyamkpostgres-8pnhyz',
    port: 5432,
    database: 'spy-amk-db',
    user: 'postgres',
    password: 'spy-amk-banco-@1',
    ssl: false, // Dokploy não precisa de SSL
    connectionTimeoutMillis: 15000,
    query_timeout: 30000,
    statement_timeout: 30000,
    application_name: 'spy-amk-test-connection'
};

async function testDokployConnection() {
    console.log('🔍 Testando conexão com PostgreSQL do Dokploy...');
    console.log('Host:', dokployConfig.host);
    console.log('Database:', dokployConfig.database);
    console.log('User:', dokployConfig.user);
    
    const pool = new Pool(dokployConfig);
    
    try {
        // Teste básico de conexão
        console.log('\n⏳ Conectando ao banco...');
        const client = await pool.connect();
        console.log('✅ Conexão estabelecida com sucesso!');
        
        // Teste de query simples
        console.log('\n⏳ Testando query simples...');
        const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
        console.log('✅ Query executada com sucesso!');
        console.log('Hora atual:', result.rows[0].current_time);
        console.log('Versão PostgreSQL:', result.rows[0].postgres_version);
        
        // Teste de listagem de tabelas
        console.log('\n⏳ Verificando tabelas existentes...');
        const tablesResult = await client.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        if (tablesResult.rows.length > 0) {
            console.log('✅ Tabelas encontradas:');
            tablesResult.rows.forEach(row => {
                console.log(`  - ${row.table_name} (${row.table_type})`);
            });
        } else {
            console.log('📝 Nenhuma tabela encontrada - banco está vazio (isso é normal)');
        }
        
        // Teste de criação de tabela (se não existir)
        console.log('\n⏳ Testando criação de tabela de teste...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS teste_conexao (
                id SERIAL PRIMARY KEY,
                mensagem TEXT,
                criado_em TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Inserir dados de teste
        await client.query(`
            INSERT INTO teste_conexao (mensagem) 
            VALUES ('Conexão Dokploy funcionando!') 
            ON CONFLICT DO NOTHING
        `);
        
        // Verificar dados
        const testResult = await client.query('SELECT * FROM teste_conexao ORDER BY id DESC LIMIT 1');
        if (testResult.rows.length > 0) {
            console.log('✅ Teste de escrita/leitura bem-sucedido!');
            console.log('Último registro:', testResult.rows[0]);
        }
        
        client.release();
        console.log('\n🎉 Todos os testes passaram! Banco do Dokploy está funcionando perfeitamente!');
        
    } catch (error) {
        console.error('\n❌ Erro ao conectar com o banco do Dokploy:');
        console.error('Tipo do erro:', error.name);
        console.error('Mensagem:', error.message);
        
        if (error.code) {
            console.error('Código do erro:', error.code);
        }
        
        // Sugestões de solução baseadas no tipo de erro
        if (error.message.includes('timeout')) {
            console.log('\n💡 Sugestões:');
            console.log('- Verifique se o banco está rodando no Dokploy');
            console.log('- Confirme se a porta 5432 está exposta externamente');
        } else if (error.message.includes('authentication')) {
            console.log('\n💡 Sugestões:');
            console.log('- Verifique usuário e senha');
            console.log('- Confirme as credenciais no painel do Dokploy');
        } else if (error.message.includes('database') && error.message.includes('does not exist')) {
            console.log('\n💡 Sugestões:');
            console.log('- Verifique se o nome do banco está correto');
            console.log('- Confirme se o banco foi criado no Dokploy');
        }
        
        process.exit(1);
        
    } finally {
        await pool.end();
    }
}

// Executar teste
testDokployConnection().catch(console.error); 