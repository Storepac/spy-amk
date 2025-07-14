# 🚀 Guia de Migração para Dokploy PostgreSQL

## 📋 Resumo da Migração

Migração da extensão spy-amk de **AWS RDS** para **PostgreSQL no Dokploy**

### 🔗 Informações do Banco Dokploy

- **URL de Conexão**: `postgresql://postgres:spy-amk-banco-@1@spyamkpostgres-8pnhyz:5432/spy-amk-db`
- **Host**: `spyamkpostgres-8pnhyz`
- **Porta**: `5432`
- **Banco**: `spy-amk-db`
- **Usuário**: `postgres`
- **Senha**: `spy-amk-banco-@1`

## 🔧 Passo a Passo da Migração

### **1. Configurar Variáveis de Ambiente**

Copie o conteúdo do arquivo `dokploy-env-config.txt` para `aws-backend/.env`:

```bash
cd aws-backend
cp ../dokploy-env-config.txt .env
```

### **2. Configurar Banco de Dados**

Execute o script de configuração para criar todas as tabelas:

```bash
cd aws-backend
node setup-dokploy-database.js
```

### **3. Testar Conexão**

Verifique se a conexão está funcionando:

```bash
node test-dokploy-connection.js
```

### **4. Iniciar Backend**

```bash
npm start
```

O backend estará disponível em: `http://localhost:3000`

### **5. Atualizar Extension**

No arquivo `manifest.json`, certifique-se de que o DokployManager está sendo carregado:

```json
{
  "content_scripts": [
    {
      "matches": ["*://*.amazon.com.br/*"],
      "js": [
        "ui/components/DokployManager.js",
        "content.js"
      ]
    }
  ]
}
```

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:

1. **produtos** - Informações dos produtos Amazon
2. **posicoes** - Rankings/posições dos produtos
3. **pesquisas** - Histórico de pesquisas realizadas
4. **tendencias** - Análises de tendências
5. **user_stats** - Estatísticas dos usuários

### Índices para Performance:

- `idx_produtos_asin` - Busca rápida por ASIN
- `idx_posicoes_palavra_chave` - Busca por palavra-chave
- `idx_posicoes_data` - Consultas por data
- E outros...

## 🔄 Testando a Migração

### **1. Teste de Conexão Básica**

```bash
node aws-backend/test-dokploy-connection.js
```

**Resultado esperado:**
```
✅ Conexão estabelecida com sucesso!
✅ Query executada com sucesso!
📋 produtos (19 colunas)
📋 posicoes (11 colunas)
🎉 Todos os testes passaram!
```

### **2. Teste do Backend**

```bash
cd aws-backend
npm start
```

Acesse: `http://localhost:3000/api/health`

**Resultado esperado:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-01-XX..."
}
```

### **3. Teste da Extensão**

1. Abra uma página de produto na Amazon
2. Abra o Console do navegador (F12)
3. Verifique as mensagens:

```
🚀 DokployManager inicializado
✅ Conexão com Dokploy estabelecida
```

## 🆚 Comparação: AWS RDS vs Dokploy

| Aspecto | AWS RDS | Dokploy |
|---------|---------|---------|
| **Custo** | Pago | Gratuito |
| **Configuração** | Complexa | Simples |
| **SSL** | Obrigatório | Opcional |
| **Backup** | Manual | Automático |
| **Monitoramento** | CloudWatch | Interface web |
| **Escalabilidade** | Manual | Fácil |

## 🎯 Vantagens da Migração

### ✅ Benefícios do Dokploy:

1. **Custo Zero** - Não há cobrança mensal
2. **Interface Amigável** - Dashboard visual intuitivo
3. **SSL Automático** - Let's Encrypt integrado
4. **Backup Integrado** - Configure backups automáticos
5. **Monitoramento** - Logs e métricas em tempo real
6. **Simplicidade** - Sem configurações AWS complexas

## 🔧 APIs Disponíveis

### Endpoints do Backend:

```
GET  /api/health              - Status de saúde
POST /api/products            - Criar produto
GET  /api/products/:asin      - Buscar produto
POST /api/positions           - Salvar posição
GET  /api/positions/history   - Histórico posições
POST /api/searches            - Registrar pesquisa
GET  /api/stats               - Estatísticas gerais
POST /api/stats/user          - Estatísticas usuário
```

### Exemplo de Uso:

```javascript
// Salvar produto
await dokployManager.saveProduct({
    asin: 'B08N5WRWNW',
    title: 'Echo Dot (4ª Geração)',
    price: 299.00,
    category: 'Electronics'
});

// Buscar histórico
const history = await dokplayManager.getPositionHistory('B08N5WRWNW', 'echo dot');
```

## 🚨 Troubleshooting

### Problemas Comuns:

#### 1. **Erro de Conexão**
```
❌ Erro: timeout na conexão
```
**Solução:** Verifique se o banco está rodando no painel Dokploy

#### 2. **Erro de Autenticação**
```
❌ authentication failed for user "postgres"
```
**Solução:** Confirme usuário e senha no painel Dokploy

#### 3. **Banco Não Encontrado**
```
❌ database "spy-amk-db" does not exist
```
**Solução:** Verifique se o banco foi criado corretamente

#### 4. **Backend Não Inicia**
```
❌ EADDRINUSE: address already in use :::3000
```
**Solução:**
```bash
# Matar processo na porta 3000
sudo lsof -t -i:3000 | xargs kill -9
```

## 📝 Comandos Úteis

### Comandos do Backend:
```bash
# Instalar dependências
npm install

# Configurar banco
node setup-dokploy-database.js

# Testar conexão
node test-dokploy-connection.js

# Iniciar servidor
npm start

# Modo desenvolvimento
npm run dev
```

### Comandos do Banco:
```sql
-- Ver tabelas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Contar registros
SELECT COUNT(*) FROM produtos;

-- Últimas posições
SELECT * FROM posicoes ORDER BY data_pesquisa DESC LIMIT 10;
```

## 🎉 Conclusão

A migração para o Dokploy oferece:

- ✅ **Economia** - Sem custos mensais
- ✅ **Simplicidade** - Interface mais amigável
- ✅ **Confiabilidade** - Backup automático
- ✅ **Performance** - Mesmo desempenho
- ✅ **Facilidade** - Menos configurações

Sua extensão spy-amk agora está rodando no Dokploy com todas as funcionalidades mantidas! 