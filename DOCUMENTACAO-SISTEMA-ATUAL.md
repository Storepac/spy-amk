# 📚 DOCUMENTAÇÃO COMPLETA - AMK SPY SISTEMA ATUAL

## 🎯 VISÃO GERAL DO SISTEMA

O AMK Spy é uma **extensão Chrome** para análise de produtos da Amazon Brasil. O sistema extrai dados de produtos, analisa oportunidades de venda, calcula tendências de posição e fornece insights para vendedores de marketplace.

### 🏗️ ARQUITETURA GERAL
```
spy-amk/
├── 🎨 Frontend (Extensão Chrome)
│   ├── popup.html/js (Interface principal)
│   ├── content.js (Injeção na Amazon)
│   └── ui/ (Componentes interface)
├── 🔧 Core (Lógica principal)
│   ├── extractor.js (Extração dados)
│   └── analyzer.js (Análise produtos)
├── 🌐 Backend (APIs Vercel)
│   └── api/ (Endpoints serverless)
└── 💾 Database (PostgreSQL)
    └── Neon (Serverless)
```

---

## 📁 ESTRUTURA DE ARQUIVOS DETALHADA

### 🎨 INTERFACE PRINCIPAL

#### `popup.html` - Interface da Extensão
**FUNÇÃO**: Interface principal que o usuário vê ao clicar na extensão
**LOCALIZAÇÃO**: Raiz do projeto
**CONTEÚDO**:
- Header com logo e navegação
- Painel de configurações (auto-save on/off)
- Área de estatísticas em tempo real
- Botões de ação (sincronizar, limpar dados)
- Footer com informações do usuário

#### `popup.js` - Controlador da Interface
**FUNÇÃO**: Controla toda interação da popup
**RESPONSABILIDADES**:
- Inicializar componentes da UI
- Gerenciar estado da extensão
- Comunicar com content scripts
- Atualizar estatísticas em tempo real
- Controlar configurações do usuário

### 🔧 CORE DO SISTEMA

#### `content.js` - Script Principal Injetado
**FUNÇÃO**: Script injetado nas páginas da Amazon
**LOCALIZAÇÃO**: Raiz do projeto
**RESPONSABILIDADES**:
- Detectar quando usuário está em página de busca
- Coordenar extração de dados
- Gerenciar interface overlay
- Comunicar com popup e background

#### `core/extractor.js` - Extrator de Dados
**FUNÇÃO**: Extrai dados dos produtos da página Amazon
**MÉTODOS PRINCIPAIS**:

```javascript
// Extrai todos produtos da página de busca
extrairProdutosDaPagina()
// Retorna: Array de objetos produto com dados básicos

// Extrai detalhes específicos de um produto
extrairDetalhesProduto(asin)
// Retorna: Objeto com dados completos (BSR, vendas, etc.)

// Extrai informações do seller
extrairDadosSeller(elemento)
// Retorna: Nome, ID, país do vendedor

// Calcula posição do produto na busca
calcularPosicao(elemento, paginaAtual)
// Retorna: Posição numérica global
```

**DADOS EXTRAÍDOS**:
- ASIN (identificador único)
- Título do produto
- Preço atual
- Avaliação (estrelas)
- Número de avaliações
- Imagem principal
- Link do produto
- Posição na busca
- Seller/vendedor
- Categoria
- BSR (Best Seller Rank)
- Marca

#### `core/analyzer.js` - Analisador de Oportunidades
**FUNÇÃO**: Analisa produtos e calcula scores de oportunidade
**MÉTODOS PRINCIPAIS**:

```javascript
// Analisa um produto individual
analisarProduto(produto)
// Retorna: Score 0-100 baseado em critérios

// Calcula tendência de posição
calcularTendencia(asin, posicaoAtual, historico)
// Retorna: 'subiu', 'desceu', 'manteve', 'novo'

// Detecta produtos promissores
detectarOportunidades(produtos)
// Retorna: Array filtrado com melhores oportunidades

// Calcula saturação do nicho
analisarSaturacao(termoPesquisa, produtos)
// Retorna: Percentual de saturação 0-100%
```

### 🎨 COMPONENTES DE INTERFACE

#### `ui/components/SupabaseManager.js` - Gerenciador Principal
**FUNÇÃO**: Gerencia toda comunicação com backend e análise de dados
**RESPONSABILIDADES CRÍTICAS**:

```javascript
// Analisa produtos combinando Amazon + Banco
async analisarPosicoes(produtos, termoPesquisa, paginaAtual)
// 1. Verifica produtos existentes vs novos
// 2. Salva apenas produtos novos no banco
// 3. Busca produtos do banco relacionados ao termo
// 4. Combina Amazon + Banco evitando duplicatas
// 5. Aplica tendências de posição
// 6. Retorna lista combinada completa

// Busca produtos do banco de dados
async buscarProdutosDoBanco(termoPesquisa)
// 1. Tenta API get-products
// 2. Se falhar, usa fallback localStorage
// 3. Completa dados faltantes para compatibilidade
// 4. Marca origem como 'banco' ou 'local'

// Combina produtos evitando duplicatas
combinarProdutos(produtosAmazon, produtosBanco)
// 1. Cria Set com ASINs da Amazon
// 2. Filtra produtos do banco que NÃO estão na Amazon
// 3. Combina: Amazon primeiro + Banco únicos
// 4. Retorna array combinado
```

#### `ui/components/PositionTracker.js` - Rastreador de Posições
**FUNÇÃO**: Gerencia histórico de posições e calcula tendências
**MÉTODOS PRINCIPAIS**:

```javascript
// Inicializa tracker com produtos
inicializar(produtos, termoPesquisa)

// Registra posição de um produto
trackearPosicao(asin, titulo, posicao, data)

// Calcula tendências do servidor
async calcularTendenciasServidor(asins, termoPesquisa)

// Calcula tendências localmente
calcularTendenciasLocal(produtos)

// Obtém estatísticas gerais
getEstatisticas()
```

#### `ui/components/StatsManager.js` - Gerenciador de Estatísticas
**FUNÇÃO**: Calcula e exibe estatísticas em tempo real
**DADOS CALCULADOS**:
- Total de produtos analisados
- Produtos novos vs existentes
- Produtos subindo/descendo posição
- BSR médio
- Preço médio
- Receita estimada

#### `ui/components/TableRowBuilder.js` - Construtor de Linhas
**FUNÇÃO**: Constrói cada linha da tabela de produtos
**COLUNAS GERADAS**:
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

#### `ui/components/ModalBuilder.js` - Construtor de Modais
**FUNÇÃO**: Cria modais para exibir detalhes de produtos
**FUNCIONALIDADES**:
- Modal de detalhes expandidos
- Modal de histórico de preços
- Modal de análise de oportunidade
- Modal de configurações

### 🌐 BACKEND (APIs VERCEL)

#### `api/test-connection.js` - Teste de Conexão
**FUNÇÃO**: Verifica conectividade com banco PostgreSQL
**RETORNA**: Status da conexão + versão PostgreSQL

#### `api/insert-product.js` - Inserir Produto
**FUNÇÃO**: Salva produto individual no banco
**PARÂMETROS**:
- usuario_id
- asin, titulo, preco, avaliacao
- num_avaliacoes, categoria, marca, bsr
**VALIDAÇÕES**:
- ASIN único por usuário
- Dados obrigatórios
- Sanitização de entrada

#### `api/save-position.js` - Salvar Posição
**FUNÇÃO**: Registra posição de produto em busca específica
**TABELA**: position_tracking
**DADOS**: asin, titulo, posicao, termo_pesquisa, data

#### `api/get-position-history.js` - Histórico Posições
**FUNÇÃO**: Busca histórico de posições para calcular tendências
**LÓGICA**:
- Busca últimas 2 posições por ASIN
- Calcula se subiu, desceu ou manteve
- Retorna objeto com tendências

#### `api/check-existing.js` - Verificar Existentes
**FUNÇÃO**: Verifica quais produtos já existem no banco
**ENTRADA**: Array de ASINs
**RETORNA**: Array de ASINs existentes
**QUERY**: `SELECT asin FROM produtos WHERE asin = ANY($1) AND usuario_id = $2`

#### `api/get-products.js` - Buscar Produtos
**FUNÇÃO**: Busca produtos do banco relacionados a termo
**PARÂMETROS**:
- userId
- termoPesquisa
- incluirSimilares (boolean)
**LÓGICA**:
- Se incluirSimilares: busca por palavras do termo
- Se não: busca exata
- Formata dados para compatibilidade frontend

#### `api/debug-user.js` - Debug Usuário
**FUNÇÃO**: Retorna estatísticas do usuário para debug
**DADOS**:
- Total de produtos
- Total de tracking
- Últimos produtos adicionados

### 💾 ESTRUTURA DO BANCO DE DADOS

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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(asin, usuario_id)
);
```

#### Tabela `position_tracking`
```sql
CREATE TABLE position_tracking (
  id SERIAL PRIMARY KEY,
  usuario_id VARCHAR(255) NOT NULL,
  asin VARCHAR(50) NOT NULL,
  titulo TEXT,
  posicao INTEGER,
  termo_pesquisa VARCHAR(255),
  data_busca DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🔄 FLUXO COMPLETO DO SISTEMA

#### 1. INICIALIZAÇÃO
```
1. Usuário acessa página de busca Amazon
2. content.js detecta página
3. Injeta interface overlay
4. Carrega configurações do usuário
5. Inicializa componentes (SupabaseManager, PositionTracker, etc.)
```

#### 2. EXTRAÇÃO DE DADOS
```
1. extractor.js escaneia página
2. Identifica elementos de produtos
3. Extrai dados básicos de cada produto
4. Para produtos importantes, busca detalhes adicionais
5. Calcula posições baseado na paginação
```

#### 3. ANÁLISE E PROCESSAMENTO
```
1. SupabaseManager.analisarPosicoes() coordena processo
2. Verifica quais produtos são novos vs existentes
3. Salva apenas produtos novos no banco
4. Busca produtos do banco relacionados ao termo
5. Combina Amazon + Banco evitando duplicatas
6. Aplica tendências de posição do histórico
```

#### 4. EXIBIÇÃO DOS RESULTADOS
```
1. TableRowBuilder constrói cada linha
2. Aplica formatação e estilos
3. Adiciona indicadores visuais (status, tendências)
4. StatsManager atualiza estatísticas
5. Interface mostra tabela completa
```

### 🎯 LÓGICA DE NEGÓCIO PRINCIPAL

#### Detecção Novo vs Existente
```javascript
// 1. Busca ASINs no localStorage (cache local)
const produtosExistentesLocal = this.getProdutosExistentesLocal();
const asinsExistentes = new Set(produtosExistentesLocal);

// 2. Separa produtos
const produtosNovos = produtos.filter(p => !asinsExistentes.has(p.asin));
const produtosExistentes = produtos.filter(p => asinsExistentes.has(p.asin));

// 3. Marca status
produtosNovos.forEach(p => p.isNovo = true);
produtosExistentes.forEach(p => p.isNovo = false);
```

#### Cálculo de Tendências
```javascript
// 1. Busca últimas 2 posições do produto
const historico = await this.buscarHistoricoPositions(asin, termo);

// 2. Compara posições
if (historico.length >= 2) {
  const [atual, anterior] = historico;
  if (atual.posicao < anterior.posicao) return 'subiu';
  if (atual.posicao > anterior.posicao) return 'desceu';
  return 'manteve';
}
return 'novo';
```

#### Combinação de Produtos
```javascript
// 1. Produtos da Amazon (página atual)
const produtosAmazon = extrairProdutosDaPagina();

// 2. Produtos do banco (relacionados ao termo)
const produtosBanco = await buscarProdutosDoBanco(termo);

// 3. Evita duplicatas
const asinsAmazon = new Set(produtosAmazon.map(p => p.asin));
const produtosBancoUnicos = produtosBanco.filter(p => 
  !asinsAmazon.has(p.asin)
);

// 4. Combina
const produtosCombinados = [...produtosAmazon, ...produtosBancoUnicos];
```

### 🔧 CONFIGURAÇÕES E CONSTANTES

#### `config/constants.js`
```javascript
const Constants = {
  API: {
    BASE_URL: 'https://spy-amk.vercel.app'
  },
  LIMITS: {
    MAX_PRODUCTS_PER_PAGE: 16,
    MAX_HISTORY_PRODUCTS: 500,
    MAX_RETRIES: 3
  },
  SELECTORS: {
    PRODUCT_CONTAINER: '[data-component-type="s-search-result"]',
    PRODUCT_TITLE: 'h2 a span',
    PRODUCT_PRICE: '.a-price-whole',
    // ... mais seletores
  }
};
```

### 🎨 ESTILOS E UI

#### `ui/theme.js` - Tema da Interface
**FUNÇÃO**: Define cores, fontes e estilos do sistema
**VARIÁVEIS**:
- Cores primárias e secundárias
- Tamanhos de fonte
- Espaçamentos
- Animações

#### `ui/notifications.js` - Sistema de Notificações
**FUNÇÃO**: Exibe notificações para o usuário
**TIPOS**:
- Sucesso (verde)
- Erro (vermelho)
- Aviso (amarelo)
- Info (azul)

### 🔄 SISTEMA DE FALLBACK

#### Fallback Local (localStorage)
```javascript
// Se API falhar, usa dados locais
buscarProdutosDoBancoLocal(termoPesquisa) {
  const historico = JSON.parse(localStorage.getItem('spy_produtos_historico') || '[]');
  
  // Filtra por termo
  const filtrados = historico.filter(produto => 
    produto.titulo.toLowerCase().includes(termoPesquisa.toLowerCase())
  );
  
  // Completa dados faltantes
  filtrados.forEach(produto => {
    produto.imagem = produto.imagem || 'placeholder.jpg';
    produto.origem = 'local';
    produto.tipo = 'Histórico';
  });
  
  return filtrados;
}
```

### 📊 SISTEMA DE ESTATÍSTICAS

#### Métricas Calculadas
```javascript
const stats = {
  total: produtos.length,
  novos: produtos.filter(p => p.isNovo).length,
  existentes: produtos.filter(p => !p.isNovo).length,
  subindo: produtos.filter(p => p.tendencia?.tendencia === 'subiu').length,
  descendo: produtos.filter(p => p.tendencia?.tendencia === 'desceu').length,
  bsrMedio: calcularMedia(produtos.map(p => p.ranking)),
  precoMedio: calcularMedia(produtos.map(p => p.precoNumerico))
};
```

### 🚀 DEPLOY E INFRAESTRUTURA

#### Vercel (Backend)
- **APIs**: Serverless functions
- **Deploy**: Automático via Git push
- **Domínio**: spy-amk.vercel.app

#### Neon (Database)
- **Tipo**: PostgreSQL serverless
- **Conexão**: Via connection string
- **SSL**: Habilitado para produção

#### Chrome Web Store (Extensão)
- **Manifest V3**: Formato atual
- **Permissões**: activeTab, storage, scripting
- **Host permissions**: *.amazon.com.br

---

## 🎯 PONTOS CRÍTICOS PARA REPLICAÇÃO

### 1. SELETORES CSS DA AMAZON
Os seletores podem mudar. Principais:
```javascript
PRODUCT_CONTAINER: '[data-component-type="s-search-result"]'
PRODUCT_TITLE: 'h2 a span'
PRODUCT_PRICE: '.a-price-whole'
PRODUCT_RATING: '.a-icon-alt'
```

### 2. LÓGICA DE POSICIONAMENTO
```javascript
// Posição = (página - 1) * 16 + índice + 1
const posicao = ((paginaAtual - 1) * 16) + (index + 1);
```

### 3. IDENTIFICAÇÃO DE USUÁRIO
```javascript
// Gera fingerprint único baseado em navigator
generateUserFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('AMK Spy', 2, 2);
  
  return btoa(canvas.toDataURL() + navigator.userAgent).substring(0, 32);
}
```

### 4. TRATAMENTO DE ERROS
```javascript
// Sempre usar try/catch em operações críticas
try {
  const resultado = await operacaoRiscos();
  return { success: true, data: resultado };
} catch (error) {
  console.error('Erro:', error);
  return { success: false, error: error.message };
}
```

### 5. CORS E SEGURANÇA
```javascript
// Headers obrigatórios nas APIs
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

---

## 📋 CHECKLIST PARA REPLICAÇÃO COMPLETA

### ✅ Estrutura Base
- [ ] Criar manifest.json com permissões corretas
- [ ] Configurar popup.html e popup.js
- [ ] Implementar content.js para injeção
- [ ] Criar estrutura de pastas ui/, core/, api/

### ✅ Core do Sistema
- [ ] Implementar extractor.js com seletores atualizados
- [ ] Criar analyzer.js para análise de oportunidades
- [ ] Desenvolver SupabaseManager completo
- [ ] Implementar PositionTracker para tendências

### ✅ Backend (APIs)
- [ ] Configurar banco PostgreSQL (Neon)
- [ ] Criar todas as APIs em Vercel
- [ ] Implementar sistema de fallback
- [ ] Configurar CORS adequadamente

### ✅ Interface
- [ ] Implementar todos os componentes UI
- [ ] Criar sistema de notificações
- [ ] Desenvolver tabela responsiva
- [ ] Implementar modais e overlays

### ✅ Lógica de Negócio
- [ ] Sistema de detecção novo/existente
- [ ] Cálculo de tendências de posição
- [ ] Combinação de produtos Amazon + Banco
- [ ] Sistema de estatísticas em tempo real

### ✅ Deploy e Configuração
- [ ] Deploy backend no Vercel
- [ ] Configurar banco de dados Neon
- [ ] Publicar extensão na Chrome Web Store
- [ ] Configurar domínio e SSL

---

**Esta documentação contém TODOS os detalhes necessários para replicar o sistema AMK Spy exatamente como está funcionando atualmente.** 🚀 