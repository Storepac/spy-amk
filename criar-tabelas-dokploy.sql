-- Script para criar tabelas no PostgreSQL Dokploy
-- Execute este script no terminal do Dokploy após conectar ao banco

-- Criar tabela produtos com campos do extrator restritivo
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    asin VARCHAR(20) UNIQUE NOT NULL,
    titulo TEXT,
    preco DECIMAL(10,2),
    vendas INTEGER DEFAULT 0,
    ranking INTEGER,
    categoria VARCHAR(255),
    marca VARCHAR(255),
    vendedor VARCHAR(255),
    url TEXT,
    imagem TEXT,
    -- Novos campos para extrator restritivo
    vendas_texto_original TEXT,
    vendas_seletor_usado VARCHAR(255),
    vendas_metodo_extracao VARCHAR(50),
    vendas_confiabilidade INTEGER,
    preco_original DECIMAL(10,2),
    desconto DECIMAL(5,2),
    disponivel BOOLEAN DEFAULT true,
    prime BOOLEAN DEFAULT false,
    frete_gratis BOOLEAN DEFAULT false,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Criar tabela posicoes
CREATE TABLE IF NOT EXISTS posicoes (
    id SERIAL PRIMARY KEY,
    asin VARCHAR(20) NOT NULL,
    posicao INTEGER NOT NULL,
    pagina INTEGER NOT NULL,
    keyword VARCHAR(255) NOT NULL,
    preco_atual DECIMAL(10,2),
    vendas_atual INTEGER,
    data_coleta TIMESTAMP DEFAULT NOW()
);

-- Criar tabela pesquisas
CREATE TABLE IF NOT EXISTS pesquisas (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    total_produtos INTEGER,
    data_pesquisa TIMESTAMP DEFAULT NOW()
);

-- Criar tabela estatisticas
CREATE TABLE IF NOT EXISTS estatisticas (
    id SERIAL PRIMARY KEY,
    total_produtos INTEGER,
    total_posicoes INTEGER,
    total_pesquisas INTEGER,
    ultima_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_asin ON produtos(asin);
CREATE INDEX IF NOT EXISTS idx_produtos_vendas ON produtos(vendas);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_criado_em ON produtos(criado_em);
CREATE INDEX IF NOT EXISTS idx_posicoes_asin ON posicoes(asin);
CREATE INDEX IF NOT EXISTS idx_posicoes_keyword ON posicoes(keyword);
CREATE INDEX IF NOT EXISTS idx_posicoes_data_coleta ON posicoes(data_coleta);

-- Inserir registro inicial de estatísticas
INSERT INTO estatisticas (total_produtos, total_posicoes, total_pesquisas) 
VALUES (0, 0, 0) 
ON CONFLICT DO NOTHING;

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status;
\dt 