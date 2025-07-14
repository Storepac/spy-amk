-- Spy AMK Database Schema para AWS RDS PostgreSQL
-- Criado para substituir Supabase

-- 1. Tabela de produtos (atualizada com melhor suporte a vendas)
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    asin VARCHAR(20) NOT NULL,
    titulo TEXT NOT NULL,
    preco DECIMAL(10,2),
    preco_numerico DECIMAL(10,2),
    preco_original DECIMAL(10,2), -- Preço antes de desconto
    desconto DECIMAL(5,2), -- Percentual de desconto
    avaliacao DECIMAL(3,1),
    num_avaliacoes INTEGER,
    marca VARCHAR(255),
    vendedor VARCHAR(255),
    link_vendedor TEXT,
    categoria VARCHAR(255),
    categoria_secundaria VARCHAR(255),
    ranking INTEGER,
    ranking_secundario INTEGER,
    
    -- Campos de vendas melhorados
    vendidos INTEGER,
    vendas_texto_original TEXT, -- Texto original encontrado para vendas
    vendas_seletor_usado VARCHAR(500), -- Seletor CSS que funcionou
    vendas_metodo_extracao VARCHAR(100), -- Método usado para extrair (seletor/texto/manual)
    vendas_confiabilidade INTEGER DEFAULT 0, -- 0-100 baseado no método usado
    vendas_ultima_atualizacao TIMESTAMP, -- Quando as vendas foram atualizadas
    
    receita_mes DECIMAL(12,2),
    imagem TEXT,
    link TEXT,
    user_id VARCHAR(100) NOT NULL,
    termo_pesquisa VARCHAR(255),
    
    -- Campos de status e disponibilidade
    disponivel BOOLEAN DEFAULT true,
    prime BOOLEAN DEFAULT false,
    frete_gratis BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    UNIQUE(asin, user_id),
    INDEX idx_asin (asin),
    INDEX idx_user_id (user_id),
    INDEX idx_termo_pesquisa (termo_pesquisa),
    INDEX idx_created_at (created_at)
);

-- 2. Tabela de posições (tracking de ranking)
CREATE TABLE IF NOT EXISTS posicoes (
    id SERIAL PRIMARY KEY,
    asin VARCHAR(20) NOT NULL,
    titulo TEXT NOT NULL,
    posicao INTEGER NOT NULL,
    pagina INTEGER DEFAULT 1,
    termo_pesquisa VARCHAR(255) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    data_coleta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    INDEX idx_asin_termo (asin, termo_pesquisa),
    INDEX idx_user_id_termo (user_id, termo_pesquisa),
    INDEX idx_data_coleta (data_coleta)
);

-- 3. Tabela de histórico de pesquisas
CREATE TABLE IF NOT EXISTS pesquisas (
    id SERIAL PRIMARY KEY,
    termo_pesquisa VARCHAR(255) NOT NULL,
    num_produtos INTEGER DEFAULT 0,
    num_paginas INTEGER DEFAULT 1,
    user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_user_id_termo (user_id, termo_pesquisa),
    INDEX idx_created_at (created_at)
);

-- 4. Tabela de análises de tendências
CREATE TABLE IF NOT EXISTS tendencias (
    id SERIAL PRIMARY KEY,
    asin VARCHAR(20) NOT NULL,
    termo_pesquisa VARCHAR(255) NOT NULL,
    posicao_anterior INTEGER,
    posicao_atual INTEGER,
    tendencia VARCHAR(20) NOT NULL, -- 'subiu', 'desceu', 'manteve', 'novo'
    diferenca INTEGER DEFAULT 0,
    user_id VARCHAR(100) NOT NULL,
    data_analise TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_asin_termo_analise (asin, termo_pesquisa, data_analise),
    INDEX idx_user_id (user_id),
    INDEX idx_data_analise (data_analise)
);

-- 5. Tabela de estatísticas de usuário
CREATE TABLE IF NOT EXISTS user_stats (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    total_produtos INTEGER DEFAULT 0,
    total_pesquisas INTEGER DEFAULT 0,
    total_posicoes INTEGER DEFAULT 0,
    primeira_pesquisa TIMESTAMP,
    ultima_pesquisa TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Triggers para updated_at
CREATE TRIGGER update_produtos_updated_at 
    BEFORE UPDATE ON produtos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at 
    BEFORE UPDATE ON user_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Inserir dados iniciais (opcional)
INSERT INTO user_stats (user_id, total_produtos, total_pesquisas, total_posicoes)
VALUES ('default_user', 0, 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- 9. Visualizações úteis (Views)
CREATE OR REPLACE VIEW produtos_recentes AS
SELECT 
    p.*,
    ps.data_coleta as ultima_posicao_data
FROM produtos p
LEFT JOIN (
    SELECT asin, termo_pesquisa, MAX(data_coleta) as data_coleta
    FROM posicoes 
    GROUP BY asin, termo_pesquisa
) ps ON p.asin = ps.asin AND p.termo_pesquisa = ps.termo_pesquisa
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY p.created_at DESC;

CREATE OR REPLACE VIEW top_produtos_receita AS
SELECT 
    asin,
    titulo,
    marca,
    categoria,
    receita_mes,
    vendidos,
    ranking,
    termo_pesquisa,
    created_at
FROM produtos 
WHERE receita_mes IS NOT NULL 
ORDER BY receita_mes DESC 
LIMIT 100;

-- 10. Função para limpar dados antigos (manutenção)
CREATE OR REPLACE FUNCTION limpar_dados_antigos(dias INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Deletar posições antigas
    DELETE FROM posicoes WHERE data_coleta < CURRENT_DATE - INTERVAL '1 day' * dias;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Deletar tendências antigas
    DELETE FROM tendencias WHERE data_analise < CURRENT_DATE - INTERVAL '1 day' * dias;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Executar limpeza automaticamente (pode ser configurado como cron job)
-- SELECT limpar_dados_antigos(90); -- Manter apenas últimos 90 dias 