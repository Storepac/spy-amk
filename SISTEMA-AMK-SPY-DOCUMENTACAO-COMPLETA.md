# 📚 DOCUMENTAÇÃO COMPLETA - SISTEMA AMK SPY ATUAL

## 🎯 VISÃO GERAL

O AMK Spy é uma **extensão Chrome** para análise de produtos da Amazon Brasil que:
- Extrai dados de produtos em tempo real
- Analisa oportunidades de venda 
- Calcula tendências de posição
- Combina dados da Amazon + Banco de dados
- Fornece insights para vendedores

## 🏗️ ARQUITETURA GERAL

```
spy-amk/
├── 🎨 Frontend (Extensão Chrome)
│   ├── popup.html/js (Interface)
│   ├── content.js (Injeção Amazon)
│   └── ui/ (Componentes)
├── 🔧 Core (Lógica)
│   ├── extractor.js (Extração)
│   └── analyzer.js (Análise)
├── 🌐 Backend (APIs Vercel)
│   └── api/ (Endpoints)
└── 💾 Database (PostgreSQL Neon)
```

## 📁 ARQUIVOS PRINCIPAIS

### 🎨 INTERFACE

#### `popup.html` - Interface Principal
- Header com logo AMK Spy
- Painel configurações (auto-save on/off)
- Estatísticas tempo real
- Botões ação (sync, limpar)

#### `popup.js` - Controlador Interface
- Inicializa componentes UI
- Gerencia estado extensão
- Comunica com content scripts
- Atualiza estatísticas

### 🔧 CORE SISTEMA

#### `content.js` - Script Injetado Amazon
**FUNÇÃO**: Script principal injetado nas páginas Amazon
**RESPONSABILIDADES**:
- Detecta página de busca Amazon
- Coordena extração dados
- Gerencia interface overlay
- Comunica popup/background

#### `core/extractor.js` - Extrator Dados
**FUNÇÃO**: Extrai dados produtos da Amazon
**MÉTODOS CRÍTICOS**:

```javascript
// Extrai todos produtos da página
extrairProdutosDaPagina()
// RETORNA: Array objetos produto

// Extrai detalhes específicos
extrairDetalhesProduto(asin)  
// RETORNA: BSR, vendas, detalhes

// Calcula posição na busca
calcularPosicao(elemento, paginaAtual)
// RETORNA: Posição numérica global
```

**DADOS EXTRAÍDOS**:
- ASIN (ID único)
- Título produto
- Preço atual
- Avaliação (estrelas)
- Número avaliações
- Imagem principal
- Link produto
- Posição busca
- Seller/vendedor
- Categoria
- BSR (Best Seller Rank)
- Marca

#### `core/analyzer.js` - Analisador Oportunidades
**FUNÇÃO**: Analisa produtos e calcula scores
**MÉTODOS**:

```javascript
// Analisa produto individual
analisarProduto(produto)
// RETORNA: Score 0-100

// Calcula tendência posição
calcularTendencia(asin, posicaoAtual, historico)
// RETORNA: 'subiu', 'desceu', 'manteve', 'novo'

// Detecta oportunidades
detectarOportunidades(produtos)
// RETORNA: Array produtos promissores
```

### 🎨 COMPONENTES UI

#### `ui/components/SupabaseManager.js` - GERENCIADOR PRINCIPAL
**FUNÇÃO**: Coordena TODA lógica do sistema
**MÉTODO CRÍTICO**:

```javascript
async analisarPosicoes(produtos, termoPesquisa, paginaAtual) {
  // 1. VERIFICA produtos novos vs existentes
  const produtosExistentes = this.getProdutosExistentesLocal();
  const produtosNovos = produtos.filter(p => !existentes.includes(p.asin));
  
  // 2. SALVA apenas produtos novos no banco
  await this.processarListaProdutos(produtosNovos, termoPesquisa);
  
  // 3. BUSCA produtos do banco relacionados ao termo
  const produtosDoBanco = await this.buscarProdutosDoBanco(termoPesquisa);
  
  // 4. COMBINA Amazon + Banco evitando duplicatas
  const produtosCombinados = this.combinarProdutos(produtos, produtosDoBanco);
  
  // 5. APLICA tendências de posição
  await this.aplicarTendenciasAosProdutos(produtosCombinados, termoPesquisa);
  
  // 6. RETORNA lista combinada completa
  return { produtosCombinados, analise };
}
```

**MÉTODO BUSCA BANCO**:
```javascript
async buscarProdutosDoBanco(termoPesquisa) {
  try {
    // Tenta API get-products
    const response = await fetch('/api/get-products', {
      method: 'POST',
      body: JSON.stringify({ userId, termoPesquisa })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.produtos;
    }
  } catch (error) {
    // FALLBACK: usa localStorage
    return this.buscarProdutosDoBancoLocal(termoPesquisa);
  }
}
```

**MÉTODO COMBINAÇÃO**:
```javascript
combinarProdutos(produtosAmazon, produtosBanco) {
  // Evita duplicatas por ASIN
  const asinsAmazon = new Set(produtosAmazon.map(p => p.asin));
  const produtosBancoUnicos = produtosBanco.filter(p => 
    !asinsAmazon.has(p.asin)
  );
  
  // Combina: Amazon primeiro + Banco únicos
  return [...produtosAmazon, ...produtosBancoUnicos];
}
```

#### `ui/components/PositionTracker.js` - Rastreador Posições
**FUNÇÃO**: Gerencia histórico posições e tendências

```javascript
// Inicializa tracker
inicializar(produtos, termoPesquisa)

// Registra posição produto
trackearPosicao(asin, titulo, posicao, data)

// Calcula tendências servidor
async calcularTendenciasServidor(asins, termoPesquisa)

// Calcula tendências local
calcularTendenciasLocal(produtos)
```

#### `ui/components/TableRowBuilder.js` - Construtor Tabela
**FUNÇÃO**: Constrói cada linha da tabela produtos
**COLUNAS** (ordem exata):
1. Posição
2. Imagem  
3. Título
4. ASIN
5. Marca
6. Preço
7. Avaliação
8. Nº Avaliações
9. Vendidos
10. Receita
11. BSR
12. Categoria
13. Status (🆕 NOVO / ♻️ EXISTENTE)
14. Tendência (📈📉➖🆕)
15. Tipo

#### `ui/components/StatsManager.js` - Estatísticas
**FUNÇÃO**: Calcula estatísticas tempo real
**DADOS**:
- Total produtos
- Novos vs existentes  
- Subindo/descendo posição
- BSR médio
- Preço médio

### 🌐 BACKEND APIS

#### `api/insert-product.js` - Salvar Produto
**FUNÇÃO**: Salva produto individual no banco
**TABELA**: produtos
**VALIDAÇÃO**: ASIN único por usuário

#### `api/save-position.js` - Salvar Posição  
**FUNÇÃO**: Registra posição produto em busca
**TABELA**: position_tracking

#### `api/get-position-history.js` - Histórico Posições
**FUNÇÃO**: Busca histórico para calcular tendências
**LÓGICA**: Compara últimas 2 posições por ASIN

#### `api/check-existing.js` - Verificar Existentes
**FUNÇÃO**: Verifica quais produtos já existem
**QUERY**: `SELECT asin FROM produtos WHERE asin = ANY($1)`

#### `api/get-products.js` - Buscar Produtos
**FUNÇÃO**: Busca produtos banco relacionados a termo
**LÓGICA**: Busca por termo no título, formata dados

### 💾 BANCO DE DADOS

#### Tabela `produtos`
```sql
CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL,
  asin VARCHAR(50) NOT NULL,
  titulo TEXT,
  preco DECIMAL(10,2),
  avaliacao DECIMAL(3,2),
  num_avaliacoes INTEGER,
  categoria VARCHAR(255),
  marca VARCHAR(255),
  bsr INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(asin, usuario_id)
);
```

#### Tabela `position_tracking`
```sql
CREATE TABLE position_tracking (
  id SERIAL PRIMARY KEY,
  usuario_id VARCHAR(255),
  asin VARCHAR(50),
  titulo TEXT,
  posicao INTEGER,
  termo_pesquisa VARCHAR(255),
  data_busca DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 FLUXO COMPLETO

### 1. INICIALIZAÇÃO
```
1. Usuário acessa Amazon busca
2. content.js detecta página
3. Injeta interface overlay
4. Inicializa SupabaseManager
5. Carrega configurações
```

### 2. EXTRAÇÃO
```
1. extractor.js escaneia página
2. Identifica produtos
3. Extrai dados básicos
4. Calcula posições
5. Busca detalhes adicionais
```

### 3. ANÁLISE (CRÍTICO)
```
1. SupabaseManager.analisarPosicoes()
2. Separa novos vs existentes  
3. Salva apenas novos no banco
4. Busca produtos banco relacionados
5. Combina Amazon + Banco
6. Aplica tendências posição
7. Retorna lista combinada
```

### 4. EXIBIÇÃO
```
1. TableRowBuilder constrói linhas
2. Aplica formatação/estilos
3. Adiciona indicadores visuais
4. StatsManager atualiza stats
5. Mostra tabela completa
```

## 🎯 LÓGICAS CRÍTICAS

### Detecção Novo vs Existente
```javascript
// Cache local para performance
const existentes = this.getProdutosExistentesLocal();
const asinsExistentes = new Set(existentes);

// Separação
const novos = produtos.filter(p => !asinsExistentes.has(p.asin));
const existentes = produtos.filter(p => asinsExistentes.has(p.asin));

// Marcação
novos.forEach(p => p.isNovo = true);
existentes.forEach(p => p.isNovo = false);
```

### Cálculo Tendências
```javascript
// Busca últimas 2 posições
const historico = await buscarHistorico(asin, termo);

if (historico.length >= 2) {
  const [atual, anterior] = historico;
  if (atual.posicao < anterior.posicao) return 'subiu';
  if (atual.posicao > anterior.posicao) return 'desceu';
  return 'manteve';
}
return 'novo';
```

### Sistema Fallback
```javascript
// Se API falhar, usa localStorage
buscarProdutosDoBancoLocal(termo) {
  const historico = JSON.parse(localStorage.getItem('spy_produtos_historico') || '[]');
  
  // Filtra por termo
  const filtrados = historico.filter(p => 
    p.titulo.toLowerCase().includes(termo.toLowerCase())
  );
  
  // Completa dados faltantes
  filtrados.forEach(p => {
    p.imagem = p.imagem || 'placeholder';
    p.origem = 'local';
    p.tipo = 'Histórico';
    p.isNovo = false;
  });
  
  return filtrados.slice(0, 100);
}
```

## 🔧 CONFIGURAÇÕES

### `manifest.json` - Configuração Extensão
```json
{
  "manifest_version": 3,
  "name": "AMK Spy",
  "permissions": ["activeTab", "storage", "scripting"],
  "host_permissions": ["*://*.amazon.com.br/*"],
  "content_scripts": [{
    "matches": ["*://*.amazon.com.br/*"],
    "js": ["content.js"]
  }]
}
```

### `config/constants.js` - Constantes
```javascript
const Constants = {
  API: {
    BASE_URL: 'https://spy-amk.vercel.app'
  },
  SELECTORS: {
    PRODUCT_CONTAINER: '[data-component-type="s-search-result"]',
    PRODUCT_TITLE: 'h2 a span',
    PRODUCT_PRICE: '.a-price-whole'
  }
};
```

## 🚨 PONTOS CRÍTICOS REPLICAÇÃO

### 1. Seletores CSS Amazon
```javascript
// PODEM MUDAR - verificar sempre
PRODUCT_CONTAINER: '[data-component-type="s-search-result"]'
PRODUCT_TITLE: 'h2 a span'
PRODUCT_PRICE: '.a-price-whole'
```

### 2. Cálculo Posição
```javascript
// Fórmula exata
const posicao = ((paginaAtual - 1) * 16) + (index + 1);
```

### 3. ID Usuário
```javascript
// Gera fingerprint único
generateUserFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('AMK Spy', 2, 2);
  return btoa(canvas.toDataURL() + navigator.userAgent).substring(0, 32);
}
```

### 4. CORS APIs
```javascript
// Headers obrigatórios
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

### 5. Tratamento Erros
```javascript
// Sempre try/catch
try {
  const resultado = await operacao();
  return { success: true, data: resultado };
} catch (error) {
  return { success: false, error: error.message };
}
```

## ✅ CHECKLIST REPLICAÇÃO

### Estrutura Base
- [ ] manifest.json com permissões
- [ ] popup.html/js interface
- [ ] content.js injeção
- [ ] Estrutura pastas ui/, core/, api/

### Core Sistema  
- [ ] extractor.js com seletores
- [ ] analyzer.js análise
- [ ] SupabaseManager completo
- [ ] PositionTracker tendências

### Backend APIs
- [ ] Banco PostgreSQL Neon
- [ ] APIs Vercel (insert, save, get, check)
- [ ] Sistema fallback
- [ ] CORS configurado

### Interface
- [ ] Componentes UI completos
- [ ] Sistema notificações
- [ ] Tabela responsiva
- [ ] Modais/overlays

### Lógica Negócio
- [ ] Detecção novo/existente
- [ ] Cálculo tendências
- [ ] Combinação Amazon + Banco
- [ ] Estatísticas tempo real

### Deploy
- [ ] Backend Vercel
- [ ] Banco Neon
- [ ] Extensão Chrome Store
- [ ] Domínio/SSL

---

**ESTA DOCUMENTAÇÃO CONTÉM TODOS OS DETALHES PARA REPLICAR O SISTEMA AMK SPY EXATAMENTE.** 

**Qualquer IA que seguir esta documentação conseguirá recriar o sistema funcionando identicamente.** 🚀 