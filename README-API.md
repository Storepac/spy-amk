# 🚀 AMK Spy - API Cloud Setup

## Deploy da API no Vercel com MongoDB

### 📋 Pré-requisitos

1. **Conta no Vercel** (gratuita)
2. **Conta no MongoDB Atlas** (já configurada)
3. **Git/GitHub** (para deploy automático)

---

## 🔧 Passo a Passo do Deploy

### 1. **Preparar o Repositório**

```bash
# Fazer commit de todos os arquivos da API
git add .
git commit -m "feat: API completa para tracking de posições"
git push origin main
```

### 2. **Deploy no Vercel**

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Import Project"**
3. Conecte com seu GitHub
4. Selecione o repositório `spy-amk`
5. Configure as seguintes **Environment Variables**:

```env
MONGODB_URI=mongodb+srv://db_amk:iqpW69yVTmoNIqnw@dbamk.imkhszp.mongodb.net/?retryWrites=true&w=majority&appName=dbamk
NODE_ENV=production
```

6. Clique em **"Deploy"**

### 3. **Após o Deploy**

1. Anote a URL gerada pelo Vercel (ex: `https://spy-amk.vercel.app`)
2. Teste os endpoints:

```bash
# Teste de conectividade
curl https://sua-app.vercel.app/api/get-history?userId=test

# Deve retornar algo como:
{
  "success": true,
  "usuario_id": "test",
  "total_produtos": 0,
  "historico": {}
}
```

---

## 🛠️ Endpoints da API

### **POST /api/save-position**
Salva posição de um produto

**Body:**
```json
{
  "asin": "B08ABC123",
  "titulo": "Produto Exemplo",
  "posicao": 5,
  "termoPesquisa": "mouse gamer",
  "userId": "user_abc123"
}
```

### **GET /api/get-history**
Busca histórico de posições

**Query Params:**
- `userId` (obrigatório)
- `asin` (opcional - para produto específico)
- `limit` (opcional - padrão: 30)

### **POST /api/sync-data**
Sincronização em lote

**Body:**
```json
{
  "userId": "user_abc123",
  "historico": { ... },
  "action": "merge"
}
```

---

## 🔌 Configurar na Extensão

### 1. **Configurar URL da API**

1. Carregue qualquer página da Amazon
2. Aguarde a extensão carregar
3. Clique no botão **"☁️ SYNC CLOUD"** nos cards de estatísticas
4. Clique em **"🔧 Configurar API"**
5. Cole a URL do Vercel: `https://sua-app.vercel.app`

### 2. **Testar Sincronização**

1. No painel de sync, clique **"☁️ Sincronizar Tudo"**
2. Verifique os logs de sincronização
3. Status deve mostrar "✅ API Configurada"

---

## 📊 Estrutura do Banco (MongoDB)

### **Collection: position_tracking**

```javascript
{
  _id: ObjectId(),
  asin: "B08ABC123",
  titulo_produto: "Mouse Gamer RGB...",
  termo_pesquisa: "mouse gamer",
  usuario_id: "user_abc123",
  historico: [
    {
      data: "2024-01-15",      // YYYY-MM-DD
      posicao: 5,              // Posição na busca
      timestamp: 1705334400000 // Unix timestamp
    }
  ],
  created_at: ISODate(),
  updated_at: ISODate()
}
```

---

## 🐛 Troubleshooting

### **Erro de CORS**
- Verificar se headers estão configurados no `vercel.json`
- Testar com `curl` para confirmar API funcionando

### **Erro de Conexão MongoDB**
- Verificar se `MONGODB_URI` está correta nas env vars
- Confirmar se IP está whitelistado no MongoDB Atlas (usar 0.0.0.0/0 para permitir todos)

### **API não responde**
- Verificar logs no dashboard do Vercel
- Confirmar se arquivo `package.json` está correto
- Verificar se functions estão sendo buildadas

### **Extensão não conecta**
- Verificar se URL está correta (sem / no final)
- Abrir DevTools e verificar erros de console
- Testar endpoint manualmente primeiro

---

## 📈 Recursos do Sistema Híbrido

### **Funcionalidades**

✅ **Tracking Local**: Sempre funciona, mesmo offline  
✅ **Sync Automático**: Sincroniza quando online  
✅ **Merge Inteligente**: Combina dados local + nuvem  
✅ **Fila Offline**: Guarda dados para sync posterior  
✅ **Fingerprint Anônimo**: Identifica usuário sem dados pessoais  
✅ **Rate Limiting**: Evita sobrecarga da API  

### **Vantagens**

- 🔒 **Privacidade**: Fingerprint anônimo, sem dados pessoais
- ⚡ **Performance**: Cache local + sync inteligente
- 🌐 **Offline-First**: Funciona sem internet
- 📱 **Cross-Device**: Dados sincronizados entre dispositivos
- 💰 **Custo Zero**: MongoDB Atlas + Vercel gratuitos

---

## 🎯 Próximos Passos

1. **Deploy da API** ✅
2. **Configurar na extensão** 
3. **Testar sincronização**
4. **Monitorar uso no MongoDB Atlas**
5. **Configurar alertas no Vercel (opcional)**

---

**🚀 Após configurar tudo, você terá um sistema completo de tracking com backup na nuvem!** 