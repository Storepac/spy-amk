# 🚀 Guia Completo: Configurar AWS RDS para Spy AMK

Este guia te ensina a criar um banco de dados PostgreSQL na AWS RDS e configurar o backend para substituir o Supabase.

## 📋 **Pré-requisitos**

- Conta na AWS (free tier disponível)
- Node.js instalado (versão 16+)
- PostgreSQL cliente (psql) - opcional para testes

---

## 🗄️ **PASSO 1: Criar Banco RDS PostgreSQL**

### **1.1 Acessar AWS Console**
```
1. Faça login na AWS Console
2. Navegue para: RDS → Databases → Create database
```

### **1.2 Configurações Básicas**
```yaml
Engine type: PostgreSQL
Version: PostgreSQL 15.x (ou mais recente)
Template: Free tier (para desenvolvimento/teste)
```

### **1.3 Settings**
```yaml
DB instance identifier: spy-amk-db
Master username: postgres
Master password: [CRIE UMA SENHA FORTE - anote ela!]
```

### **1.4 Instance Configuration**
```yaml
DB instance class: db.t3.micro (free tier elegível)
```

### **1.5 Storage**
```yaml
Storage type: General Purpose SSD (gp2)
Allocated storage: 20 GB (suficiente para iniciar)
Storage autoscaling: Enable (recomendado)
```

### **1.6 Connectivity**
```yaml
VPC: Default VPC
Subnet group: default
Publicly accessible: Yes (importante para acesso externo)
VPC security groups: Create new → spy-amk-security-group
Availability Zone: No preference
Database port: 5432
```

### **1.7 Database Authentication**
```yaml
Password authentication: ✓ (manter selecionado)
IAM database authentication: ❌ (opcional)
```

### **1.8 Additional Configuration**
```yaml
Initial database name: spy_amk
DB parameter group: default.postgres15
Backup retention period: 7 days
Backup window: Default
Maintenance window: Default
```

### **1.9 Finalizar**
- Clique em **"Create database"**
- ⏱️ Aguarde 10-15 minutos para criação

---

## 🔐 **PASSO 2: Configurar Security Group**

### **2.1 Editar Security Group**
```
1. AWS Console → EC2 → Security Groups
2. Encontre "spy-amk-security-group"
3. Clique em "Edit inbound rules"
```

### **2.2 Adicionar Regra PostgreSQL**
```yaml
Type: PostgreSQL
Protocol: TCP
Port range: 5432
Source: My IP (para desenvolvimento)
Description: Acesso PostgreSQL Spy AMK
```

⚠️ **Para produção**: Use IPs específicos, não "Anywhere"

---

## 📁 **PASSO 3: Configurar Backend**

### **3.1 Instalar Dependências**
```bash
cd aws-backend
npm install
```

### **3.2 Configurar Variáveis de Ambiente**
```bash
# Copiar exemplo
cp env-example.txt .env

# Editar .env com suas credenciais
notepad .env  # Windows
nano .env     # Linux/Mac
```

### **3.3 Preencher .env**
```env
# Pegar endpoint no AWS Console → RDS → Databases → spy-amk-db
DB_HOST=spy-amk-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=spy_amk
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI

PORT=3000
NODE_ENV=development
JWT_SECRET=um-secret-muito-seguro-aqui
```

---

## 🗃️ **PASSO 4: Criar Tabelas**

### **4.1 Testar Conexão Primeiro**
```bash
# No diretório aws-backend
node -e "
const { testConnection } = require('./config/database');
testConnection().then(success => {
    console.log('Conexão:', success ? 'OK' : 'ERRO');
    process.exit(success ? 0 : 1);
});
"
```

### **4.2 Executar Script SQL**
```bash
# Conectar via psql (se instalado)
psql -h SEU_ENDPOINT -U postgres -d spy_amk -f ../database-schema.sql

# OU executar manualmente no AWS Query Editor
```

### **4.3 Verificar Tabelas**
```sql
-- Conectar ao banco e verificar
\dt  -- Listar tabelas
SELECT COUNT(*) FROM produtos;  -- Deve retornar 0
```

---

## 🚀 **PASSO 5: Iniciar Backend**

### **5.1 Modo Desenvolvimento**
```bash
cd aws-backend
npm run dev
```

### **5.2 Verificar Funcionamento**
```bash
# Teste no navegador ou curl
curl http://localhost:3000/api/health
curl http://localhost:3000/api/test-connection
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Conexão com AWS RDS bem-sucedida!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "spy_amk"
}
```

---

## 🔧 **PASSO 6: Integrar com Extensão**

### **6.1 Atualizar manifest.json**
```json
{
  "content_scripts": [
    {
      "matches": ["https://*.amazon.com.br/*"],
      "js": [
        "ui/components/AWSManager.js",
        "content.js"
      ]
    }
  ]
}
```

### **6.2 Modificar content.js**
```javascript
// Substituir referências ao supabaseManager
// window.supabaseManager -> window.awsManager

// Exemplo:
async function salvarProduto(produto) {
    const result = await window.awsManager.salvarProduto(produto);
    if (result.success) {
        console.log('Produto salvo no AWS!');
    }
}
```

---

## ✅ **PASSO 7: Testar Sistema Completo**

### **7.1 Verificar Backend**
- ✅ Backend rodando: `http://localhost:3000/api/health`
- ✅ Conexão DB: `http://localhost:3000/api/test-connection`

### **7.2 Testar Extensão**
1. Instalar extensão atualizada
2. Abrir Amazon e fazer pesquisa
3. Verificar console: logs `[AWS-MANAGER]`
4. Confirmar produtos salvos

### **7.3 Verificar Dados**
```sql
-- Conectar ao banco
SELECT COUNT(*) FROM produtos;
SELECT * FROM produtos LIMIT 5;
```

---

## 📊 **PASSO 8: Monitoramento (Opcional)**

### **8.1 CloudWatch Logs**
- AWS Console → CloudWatch → Logs
- Monitore performance da instância RDS

### **8.2 Backup Automático**
- RDS tem backup automático configurado (7 dias)
- Point-in-time recovery disponível

---

## 🚨 **Resolução de Problemas**

### **Erro: "Connection timeout"**
```bash
# Verificar security group
# Confirmar IP permitido
# Testar com psql diretamente
```

### **Erro: "Database does not exist"**
```sql
-- Conectar como postgres e criar database
CREATE DATABASE spy_amk;
```

### **Erro: "Failed to fetch"**
```bash
# Verificar se backend está rodando
# Confirmar URL no AWSManager.js
# Verificar CORS no backend
```

### **Erro: "Authentication failed"**
```bash
# Verificar credenciais no .env
# Confirmar senha no AWS Console
# Reset password se necessário
```

---

## 💰 **Custos AWS (Estimativa)**

### **Free Tier (12 meses)**
- ✅ db.t3.micro: 750 horas/mês
- ✅ 20GB storage: Incluído
- ✅ Backup: 20GB incluído

### **Após Free Tier**
- 💵 db.t3.micro: ~$15-20/mês
- 💵 Storage: ~$2-3/mês por 20GB
- 💵 Total estimado: ~$18-25/mês

---

## 🔄 **Migração de Dados Supabase → AWS**

Se você já tem dados no Supabase:

```javascript
// Script de migração (executar no console do navegador)
async function migrarDados() {
    // 1. Buscar dados do localStorage/Supabase
    const produtos = JSON.parse(localStorage.getItem('spy_amk_produtos') || '[]');
    
    // 2. Enviar para AWS em lotes
    const batchSize = 10;
    for (let i = 0; i < produtos.length; i += batchSize) {
        const batch = produtos.slice(i, i + batchSize);
        await window.awsManager.salvarProdutos(batch);
        console.log(`Migrados ${Math.min(i + batchSize, produtos.length)}/${produtos.length}`);
    }
    
    console.log('✅ Migração concluída!');
}

// Executar migração
migrarDados();
```

---

## 🎯 **Próximos Passos**

1. **Deploy do Backend**: Considere usar Heroku, Vercel ou AWS EC2
2. **SSL/HTTPS**: Configure certificado para produção
3. **Autenticação**: Implemente login/registro de usuários
4. **Monitoring**: Configure alertas CloudWatch
5. **Backup Strategy**: Implemente backup adicional

---

## 📞 **Suporte**

Em caso de dúvidas:
1. Verifique logs do backend: `npm run dev`
2. Verifique console da extensão: F12 → Console
3. Teste conexão: `curl http://localhost:3000/api/test-connection`

**Pronto! Seu sistema AWS RDS está configurado! 🎉** 