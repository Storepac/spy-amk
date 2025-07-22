# 🔧 Configurar Acesso Externo - PostgreSQL Dokploy

## 📋 Passo a Passo

### 1. **Acessar Painel do Dokploy**
- Faça login no seu painel do Dokploy
- Vá para a seção **Databases** ou **PostgreSQL**

### 2. **Encontrar seu Banco**
- Procure por **spyamkpostgres-8pnhyz**
- Clique para abrir as configurações

### 3. **Configurar Porta Externa**
- Procure por **"External Port"** ou **"Public Port"**
- Configure a porta **5432** (ou outra disponível)
- **Salve** as configurações

### 4. **Obter URL Externa**
Após configurar, a URL ficará algo como:
```
postgresql://postgres:spy-amk-banco-@1@SEU-DOMINIO-DOKPLOY:5432/spy-amk-db
```

### 5. **Testar Conexão**
Execute no terminal local:
```bash
node teste-conexao-dokploy.cjs
```

## 🔍 Se Não Encontrar a Opção

### Alternativa 1: Terminal Web
1. **No painel do Dokploy**
2. **Procure por "Terminal", "Console" ou "Shell"**
3. **Execute diretamente:**
```sql
-- Conectar ao banco
\c spy-amk-db

-- Verificar tabelas
\dt

-- Contar registros
SELECT COUNT(*) FROM produtos;
SELECT COUNT(*) FROM posicoes;

-- Ver últimos produtos
SELECT asin, titulo, vendas, criado_em 
FROM produtos 
ORDER BY criado_em DESC 
LIMIT 10;
```

### Alternativa 2: Usar Cliente PostgreSQL
Se conseguir a URL externa, instale um cliente:
```bash
# Instalar psql (Windows)
# Baixar PostgreSQL tools do site oficial

# Conectar
psql "postgresql://postgres:spy-amk-banco-@1@SEU-HOST:5432/spy-amk-db"
```

## 🚀 Próximos Passos
1. **Configurar acesso externo** no Dokploy
2. **Testar conexão** com nosso script
3. **Verificar se há dados** salvos
4. **Limpar arquivos** desnecessários 