# 🚀 AMK Spy API - PostgreSQL Integration

API para sincronização de dados do AMK Spy com banco PostgreSQL serverless.

## 📋 Configuração

### Banco de Dados
- **Provedor**: Neon PostgreSQL Serverless (Recomendado) 
- **Alternativas**: Railway, PlanetScale, Supabase
- **SSL**: Obrigatório
- **Compatibilidade**: IPv4 ✅ Vercel

### String de Conexão (Neon)
Configure a variável `DATABASE_URL` no Vercel com sua string do Neon:
```
postgresql://user:password@ep-xyz.region.aws.neon.tech/database?sslmode=require
```

## 🔗 Endpoints Disponíveis

### 1. Inserir Produto
**POST** `/api/insert-product`

Insere ou atualiza um produto no banco.

```javascript
{
  "asin": "B08N5WRWNW",
  "titulo": "Echo Dot (4ª Geração) - Smart Speaker com Alexa",
  "preco": 299.90,
  "avaliacao": 4.5,
  "numAvaliacoes": 12500,
  "categoria": "Eletrônicos > Smart Home",
  "marca": "Amazon",
  "bsr": 150,
  "userId": "user123"
}
```

### 2. Salvar Posição
**POST** `/api/save-position`

Salva a posição de um produto na pesquisa.

```javascript
{
  "asin": "B08N5WRWNW",
  "titulo": "Echo Dot (4ª Geração)",
  "posicao": 5,
  "termoPesquisa": "alexa echo dot",
  "userId": "user123"
}
```

### 3. Sincronizar Dados
**POST/GET** `/api/sync-data`

- **POST**: Upload de dados locais para nuvem
- **GET**: Download de dados da nuvem para local

### 4. Buscar Histórico
**GET** `/api/get-history?userId=user123&dias=30`

Busca histórico de posições de um usuário.

### 5. Testar Conexão
**GET** `/api/test-connection`

Testa a conectividade com o banco Supabase.

### 6. Listar Tabelas
**GET** `/api/list-tables`

Lista todas as tabelas do banco com detalhes.

### 7. Contar Registros
**GET** `/api/count-records`

Mostra estatísticas dos registros no banco.

## 📊 Estrutura das Tabelas

### Tabela: `produtos`
```sql
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    asin VARCHAR(20) NOT NULL,
    titulo VARCHAR(500),
    preco DECIMAL(10,2),
    avaliacao DECIMAL(3,2),
    num_avaliacoes INTEGER,
    categoria VARCHAR(200),
    marca VARCHAR(200),
    bsr INTEGER,
    usuario_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asin, usuario_id)
);
```

### Tabela: `position_tracking`
```sql
CREATE TABLE position_tracking (
    id SERIAL PRIMARY KEY,
    asin VARCHAR(20) NOT NULL,
    titulo_produto VARCHAR(200),
    termo_pesquisa VARCHAR(100),
    usuario_id VARCHAR(50) NOT NULL,
    data DATE NOT NULL,
    posicao INTEGER NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asin, usuario_id, data)
);
```

## 🧪 Teste da API

### Teste Manual
Abra o arquivo `teste-api.html` no navegador para:
- ✅ Testar conexão com Supabase
- ✅ Inserir produtos
- ✅ Salvar posições
- ✅ Visualizar tabelas e registros

### Teste Automático (Extension)
1. **Carregue a extensão** no Chrome/Edge
2. **Vá para uma página de pesquisa da Amazon** (ex: https://amazon.com.br/s?k=mouse+gamer)
3. **Abra o painel lateral** da extensão (botão AMK Spy)
4. **Clique em "Analisar Página"** - os produtos serão automaticamente:
   - 📊 Extraídos da pesquisa
   - 💾 Salvos na tabela `produtos` do Supabase
   - 📍 Posições salvas na tabela `position_tracking`
   - 🔄 Sincronizados em tempo real

**Resultado esperado:**
```
✅ X produtos salvos no Supabase!
📍 Posições registradas automaticamente
💾 Dados sincronizados com banco
```

## 🚀 Deploy no Vercel

### Variáveis de Ambiente
Configure no Vercel dashboard:

```env
DATABASE_URL=postgresql://user:password@ep-xyz.region.aws.neon.tech/database?sslmode=require
NODE_ENV=production
```

### Alternativas de Banco

**🥇 Neon (Recomendado)**
- ✅ Grátis: 512MB, 1 projeto
- ✅ IPv4 compatível com Vercel
- ✅ PostgreSQL completo
- ✅ Serverless autoscaling

**🥈 Railway**
- ✅ $5/mês após trial
- ✅ PostgreSQL completo
- ✅ Fácil deploy

**🥉 PlanetScale**
- ✅ Grátis: 5GB
- ⚠️ MySQL (requer ajustes SQL)

### Comandos de Deploy
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Ou conectar com GitHub para deploy automático
```

## 📱 Uso no Extension

### Inserir Produto
```javascript
const produto = {
    asin: 'B08N5WRWNW',
    titulo: 'Echo Dot',
    preco: 299.90,
    avaliacao: 4.5,
    numAvaliacoes: 12500,
    categoria: 'Eletrônicos',
    marca: 'Amazon',
    bsr: 150,
    userId: 'user123'
};

fetch('/api/insert-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(produto)
});
```

### Salvar Posição
```javascript
const posicao = {
    asin: 'B08N5WRWNW',
    titulo: 'Echo Dot',
    posicao: 5,
    termoPesquisa: 'alexa',
    userId: 'user123'
};

fetch('/api/save-position', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(posicao)
});
```

## 🔧 Troubleshooting

### Connection Timeout
- Verificar se o IP está na whitelist do Supabase
- Confirmar a string de conexão

### SSL Certificate Error
- Certificar que `ssl: { rejectUnauthorized: false }` está configurado

### Tabela não existe
- As tabelas são criadas automaticamente na primeira inserção
- Verificar permissões do usuário

## 📊 Performance

- **Connection Pooling**: Implementado com cache de conexões
- **Timeout**: 60 segundos por função
- **CORS**: Configurado para todos os origins
- **SSL**: Conexão segura obrigatória

## 🔐 Segurança

- String de conexão com SSL obrigatório
- Validação de dados de entrada
- Sanitização de inputs
- Rate limiting via Vercel

---

**Versão**: 2.0.0 - Supabase Integration  
**Atualizado**: 2024 