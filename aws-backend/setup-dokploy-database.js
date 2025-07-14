const { Pool } = require('pg');
require('dotenv').config();

// Configuração do banco Dokploy
const dokployConfig = {
    host: 'spyamkpostgres-8pnhyz',
    port: 5432,
    database: 'spy-amk-db',
    user: 'postgres',
    password: 'spy-amk-banco-@1',
    ssl: false,
    connectionTimeoutMillis: 15000,
    application_name: 'spy-amk-setup'
};

// Schema SQL completo para spy-amk
const createTablesSQL = `
-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    asin VARCHAR(20) UNIQUE NOT NULL,
    titulo TEXT NOT NULL,
    preco DECIMAL(10,2),
    preco_original DECIMAL(10,2),
    desconto DECIMAL(5,2),
    rating DECIMAL(3,2),
    num_reviews INTEGER,
    url TEXT,
    imagem_url TEXT,
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    brand VARCHAR(100),
    disponivel BOOLEAN DEFAULT true,
    prime BOOLEAN DEFAULT false,
    frete_gratis BOOLEAN DEFAULT false,
    vendedor VARCHAR(200),
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de posições/rankings
CREATE TABLE IF NOT EXISTS posicoes (
    id SERIAL PRIMARY KEY,
    asin VARCHAR(20) NOT NULL,
    palavra_chave TEXT NOT NULL,
    posicao INTEGER NOT NULL,
    pagina INTEGER NOT NULL,
    data_pesquisa TIMESTAMP DEFAULT NOW(),
    metodo_pesquisa VARCHAR(50) DEFAULT 'manual',
    resultados_totais INTEGER,
    tempo_busca INTEGER,
    user_agent TEXT,
    ip_origem INET,
    FOREIGN KEY (asin) REFERENCES produtos(asin) ON DELETE CASCADE
);

-- Tabela de pesquisas realizadas
CREATE TABLE IF NOT EXISTS pesquisas (
    id SERIAL PRIMARY KEY,
    palavra_chave TEXT NOT NULL,
    data_pesquisa TIMESTAMP DEFAULT NOW(),
    total_resultados INTEGER,
    tempo_execucao INTEGER,
    produtos_encontrados INTEGER,
    paginas_analisadas INTEGER,
    erro TEXT,
    sucesso BOOLEAN DEFAULT true,
    user_id VARCHAR(100),
    session_id VARCHAR(200)
);

-- Tabela de tendências e análises
CREATE TABLE IF NOT EXISTS tendencias (
    id SERIAL PRIMARY KEY,
    asin VARCHAR(20) NOT NULL,
    palavra_chave TEXT NOT NULL,
    posicao_atual INTEGER,
    posicao_anterior INTEGER,
    variacao INTEGER,
    data_analise TIMESTAMP DEFAULT NOW(),
    periodo_dias INTEGER DEFAULT 1,
    tipo_tendencia VARCHAR(20) CHECK (tipo_tendencia IN ('subiu', 'desceu', 'estavel', 'novo', 'saiu')),
    FOREIGN KEY (asin) REFERENCES produtos(asin) ON DELETE CASCADE
);

-- Tabela de estatísticas de usuário
CREATE TABLE IF NOT EXISTS user_stats (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    total_pesquisas INTEGER DEFAULT 0,
    total_produtos_monitorados INTEGER DEFAULT 0,
    ultima_atividade TIMESTAMP DEFAULT NOW(),
    data_criacao TIMESTAMP DEFAULT NOW(),
    plano VARCHAR(50) DEFAULT 'free',
    limite_pesquisas INTEGER DEFAULT 100,
    pesquisas_realizadas INTEGER DEFAULT 0
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_asin ON produtos(asin);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_posicoes_asin ON posicoes(asin);
CREATE INDEX IF NOT EXISTS idx_posicoes_palavra_chave ON posicoes(palavra_chave);
CREATE INDEX IF NOT EXISTS idx_posicoes_data ON posicoes(data_pesquisa);
CREATE INDEX IF NOT EXISTS idx_pesquisas_data ON pesquisas(data_pesquisa);
CREATE INDEX IF NOT EXISTS idx_pesquisas_palavra_chave ON pesquisas(palavra_chave);
CREATE INDEX IF NOT EXISTS idx_tendencias_asin ON tendencias(asin);
CREATE INDEX IF NOT EXISTS idx_tendencias_data ON tendencias(data_analise);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Trigger para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela produtos
DROP TRIGGER IF EXISTS trigger_update_produtos ON produtos;
CREATE TRIGGER trigger_update_produtos
    BEFORE UPDATE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION update_data_atualizacao();
`;

async function setupDokployDatabase() {
    console.log('🚀 Configurando banco de dados spy-amk no Dokploy...');
    
    const pool = new Pool(dokployConfig);
    
    try {
        const client = await pool.connect();
        console.log('✅ Conectado ao banco do Dokploy');
        
        // Executar script de criação das tabelas
        console.log('\n⏳ Criando tabelas e índices...');
        await client.query(createTablesSQL);
        console.log('✅ Tabelas criadas com sucesso!');
        
        // Verificar tabelas criadas
        console.log('\n⏳ Verificando tabelas criadas...');
        const tablesResult = await client.query(`
            SELECT table_name, 
                   (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        console.log('✅ Tabelas no banco:');
        tablesResult.rows.forEach(row => {
            console.log(`  📋 ${row.table_name} (${row.column_count} colunas)`);
        });
        
        // Verificar índices
        console.log('\n⏳ Verificando índices criados...');
        const indexesResult = await client.query(`
            SELECT indexname, tablename 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname LIKE 'idx_%'
            ORDER BY tablename, indexname
        `);
        
        console.log('✅ Índices criados:');
        indexesResult.rows.forEach(row => {
            console.log(`  🔍 ${row.indexname} (tabela: ${row.tablename})`);
        });
        
        // Inserir dados de exemplo para teste
        console.log('\n⏳ Inserindo dados de exemplo...');
        await client.query(`
            INSERT INTO produtos (asin, titulo, preco, categoria, brand) 
            VALUES 
                ('B08N5WRWNW', 'Echo Dot (4ª Geração)', 299.00, 'Electronics', 'Amazon'),
                ('B07XJ8C8F5', 'Fire TV Stick', 179.00, 'Electronics', 'Amazon')
            ON CONFLICT (asin) DO NOTHING
        `);
        
        await client.query(`
            INSERT INTO user_stats (user_id, total_pesquisas, plano) 
            VALUES ('test-user-1', 5, 'free')
            ON CONFLICT DO NOTHING
        `);
        
        // Verificar dados inseridos
        const produtosCount = await client.query('SELECT COUNT(*) FROM produtos');
        const userStatsCount = await client.query('SELECT COUNT(*) FROM user_stats');
        
        console.log('✅ Dados de exemplo inseridos:');
        console.log(`  📦 Produtos: ${produtosCount.rows[0].count}`);
        console.log(`  👤 User Stats: ${userStatsCount.rows[0].count}`);
        
        client.release();
        console.log('\n🎉 Banco de dados spy-amk configurado com sucesso no Dokploy!');
        console.log('\n📝 Próximos passos:');
        console.log('1. Copie o conteúdo de dokploy-env-config.txt para aws-backend/.env');
        console.log('2. Execute: cd aws-backend && node test-dokploy-connection.js');
        console.log('3. Execute: cd aws-backend && npm start');
        
    } catch (error) {
        console.error('\n❌ Erro ao configurar banco do Dokploy:');
        console.error('Erro:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Executar configuração
setupDokployDatabase().catch(console.error); 