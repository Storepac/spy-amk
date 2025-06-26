# 🚀 AMK Spy - API de Tracking de Posições

## **📋 CONFIGURAÇÃO SUPABASE**

### **1. Criar Projeto no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta e novo projeto
3. Aguarde a criação do banco PostgreSQL

### **2. Configurar Variáveis de Ambiente**

#### **No Vercel:**
```bash
DATABASE_URL = postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

#### **Localmente (.env):**
```bash
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
NODE_ENV=development
```

### **3. Estrutura da Tabela**
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

## **🔗 ENDPOINTS DA API**

### **1. Salvar Posição**
```
POST /api/save-position
```

**Body:**
```json
{
    "asin": "B08ABC123",
    "titulo": "Mouse Gamer RGB LED",
    "posicao": 5,
    "termoPesquisa": "mouse gamer",
    "userId": "user_abc123"
}
```

**Resposta:**
```json
{
    "success": true,
    "message": "Posição salva com sucesso",
    "asin": "B08ABC123",
    "posicao": 5,
    "data": "2024-01-15",
    "record": { ... }
}
```

### **2. Buscar Histórico**
```
GET /api/get-history?userId=user_abc123&asin=B08ABC123&dias=30
```

**Parâmetros:**
- `userId` (obrigatório): ID do usuário
- `asin` (opcional): ASIN específico do produto
- `dias` (opcional): Últimos N dias (padrão: 30)

**Resposta:**
```json
{
    "success": true,
    "asin": "B08ABC123",
    "userId": "user_abc123",
    "dias": 30,
    "total": 15,
    "tendencia": "subiu",
    "historico": [
        {
            "asin": "B08ABC123",
            "titulo": "Mouse Gamer RGB LED",
            "termo": "mouse gamer",
            "data": "2024-01-15",
            "posicao": 3,
            "timestamp": 1705334400000
        }
    ]
}
```

### **3. Sincronização em Lote**

#### **UPLOAD (Local → Nuvem):**
```
POST /api/sync-data
```

**Body:**
```json
{
    "userId": "user_abc123",
    "dados": [
        {
            "asin": "B08ABC123",
            "titulo": "Mouse Gamer",
            "termo": "mouse gamer",
            "historico": [
                {
                    "data": "2024-01-15",
                    "posicao": 5,
                    "timestamp": 1705334400000
                }
            ]
        }
    ]
}
```

#### **DOWNLOAD (Nuvem → Local):**
```
GET /api/sync-data?userId=user_abc123&ultimaSync=1705334400000
```

## **🚀 DEPLOY NO VERCEL**

### **1. Instalar Vercel CLI**
```bash
npm install -g vercel
```

### **2. Configurar Variáveis**
```bash
vercel env add DATABASE_URL
# Cole sua connection string do Supabase
```

### **3. Deploy**
```bash
vercel --prod
```

### **4. Verificar Deploy**
```bash
curl https://seu-projeto.vercel.app/api/save-position \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"asin":"TEST123","posicao":1,"userId":"test"}'
```

## **🔧 VANTAGENS DO SUPABASE**

### **✅ Benefícios sobre MongoDB Atlas:**
- 🚀 **Mais rápido** - Latência menor com Vercel
- 🔧 **Mais simples** - SQL familiar 
- 💰 **Mais barato** - Plano gratuito generoso
- 🛡️ **Mais confiável** - Menos timeouts
- 📊 **Dashboard melhor** - Interface mais intuitiva
- 🔍 **Queries mais fáceis** - SQL vs agregações MongoDB

### **📊 Plano Gratuito:**
- 500MB de armazenamento
- 2GB de transferência
- 50.000 requisições mensais
- Autenticação incluída

## **🐛 TROUBLESHOOTING**

### **Erro de Conexão:**
```bash
# Verificar se URL está correta
echo $DATABASE_URL

# Testar conexão local
psql $DATABASE_URL -c "SELECT version();"
```

### **Tabela não existe:**
A API cria automaticamente a tabela na primeira execução.

### **SSL Error:**
A configuração `ssl: { rejectUnauthorized: false }` já está incluída.

## **📈 PRÓXIMOS PASSOS**

1. ✅ API funcionando com Supabase
2. 🔄 Testar sincronização completa
3. 📱 Implementar notificações
4. 📊 Dashboard de analytics
5. 🔐 Sistema de autenticação
6. 🚀 Otimizações de performance

---
**🎯 API Pronta para Produção com Supabase!** 