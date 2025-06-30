# 🚀 PLANO AMK SPY - MERCADO LIVRE

## 📊 **SISTEMA HÍBRIDO AMAZON + MERCADO LIVRE**

### 🔧 **REFATORAÇÃO NECESSÁRIA**

#### 1. **MANIFEST.JSON - Multi-plataforma**
```json
{
  "host_permissions": [
    "https://www.amazon.com.br/*",
    "https://www.amazon.com/*",
    "https://lista.mercadolivre.com.br/*",
    "https://produto.mercadolivre.com.br/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "https://www.amazon.com.br/*",
        "https://www.amazon.com/*",
        "https://lista.mercadolivre.com.br/*",
        "https://produto.mercadolivre.com.br/*"
      ]
    }
  ]
}
```

#### 2. **DETECTORES DE PLATAFORMA**
- `core/platform-detector.js` - Detecta Amazon vs ML
- Adaptação automática de interface
- Seletores específicos por plataforma

#### 3. **EXTRATORES ESPECÍFICOS**

##### **Amazon (Atual)**
- ✅ BSR/Ranking
- ✅ Vendas estimadas
- ✅ ASIN
- ✅ Preços BuyBox

##### **Mercado Livre (Novo)**
- 🆕 **ML ID** (identificador único)
- 🆕 **Posição no ranking de busca**
- 🆕 **Reviews/Avaliações** (quantidade e nota)
- 🆕 **Vendas do anúncio** ("mais de X vendidos")
- 🆕 **Tipo de frete** (grátis, pago, full)
- 🆕 **Loja oficial** vs vendedor comum
- 🆕 **Status ML** (MercadoLíder, etc.)
- 🆕 **Condição** (novo, usado, recondicionado)
- 🆕 **Parcelas** (qtd de parcelas sem juros)

### 🎯 **DADOS ESPECÍFICOS MERCADO LIVRE**

#### **Métricas de Performance ML**
1. **Volume de Vendas**: "Mais de 500 vendidos"
2. **Reputação do Vendedor**: Termômetro ML
3. **Posição na Busca**: Ranking natural
4. **Tipo de Anúncio**: Clássico, Premium, etc.
5. **Frete**: Grátis, Full, Local
6. **Reviews**: Quantidade e média de estrelas

#### **Filtros Exclusivos ML**
- 💰 **Faixa de Preço** (min/max)
- ⭐ **Avaliação Mínima** (4+ estrelas)
- 📦 **Apenas Frete Grátis**
- 🏪 **Apenas Lojas Oficiais**
- 🚀 **Apenas MercadoLíder**
- 📈 **Mínimo de Vendas** ("mais de X vendidos")
- 🆕 **Apenas Produtos Novos**

### 🏗️ **ARQUITETURA PROPOSTA**

```
spy-amk/
├── core/
│   ├── platform-detector.js     # Novo - Detecta plataforma
│   ├── amazon-extractor.js      # Refatorado do atual
│   ├── ml-extractor.js          # Novo - Extrator ML
│   ├── unified-analyzer.js      # Novo - Análise unificada
│   └── data-normalizer.js       # Novo - Padroniza dados
├── platforms/
│   ├── amazon/
│   │   ├── selectors.js         # Seletores Amazon
│   │   └── filters.js           # Filtros Amazon
│   └── mercadolivre/
│       ├── selectors.js         # Seletores ML
│       └── filters.js           # Filtros ML
├── database/
│   ├── amazon-schema.sql        # Schema Amazon
│   └── ml-schema.sql            # Schema ML
└── ui/
    ├── platform-switcher.js    # Alternar plataformas
    └── unified-interface.js     # Interface adaptável
```

### 🔍 **SELETORES MERCADO LIVRE**

#### **Produtos na Lista**
```javascript
// Layout Grid (preferencial)
const GRID_CONTAINER = 'ol.ui-search-layout.ui-search-layout--grid';
const GRID_ITEMS = '.ui-search-layout__item';

// Layout Stack (fallback)
const STACK_CONTAINER = 'ol.ui-search-layout.ui-search-layout--stack';
const STACK_ITEMS = '.ui-search-layout__item';

// Dados do Produto
const SELECTORS = {
  title: 'h2.ui-search-item__title',
  price: '.price-tag-amount',
  originalPrice: '.price-tag.ui-search-price__part',
  link: '.ui-search-link',
  image: '.ui-search-result-image__element img',
  reviews: '.ui-search-reviews',
  sales: '.ui-search-item__group__element:contains("vendidos")',
  shipping: '.ui-search-item__group__element:contains("frete")',
  condition: '.ui-search-item__group__element:contains("usado")',
  mlId: '[data-item-id]'
};
```

### 📊 **BANCO DE DADOS - SCHEMA ML**

```sql
-- Tabela produtos_mercadolivre
CREATE TABLE produtos_mercadolivre (
  id SERIAL PRIMARY KEY,
  ml_id VARCHAR(50) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  preco DECIMAL(10,2),
  preco_original DECIMAL(10,2),
  desconto_percentual INTEGER,
  vendas_quantidade VARCHAR(50),
  vendas_numerico INTEGER,
  avaliacao_nota DECIMAL(3,2),
  avaliacao_quantidade INTEGER,
  vendedor VARCHAR(255),
  vendedor_reputacao VARCHAR(50),
  frete_tipo VARCHAR(50),
  condicao VARCHAR(20),
  categoria VARCHAR(255),
  posicao_busca INTEGER,
  termo_busca VARCHAR(255),
  loja_oficial BOOLEAN DEFAULT FALSE,
  mercado_lider BOOLEAN DEFAULT FALSE,
  link TEXT,
  imagem TEXT,
  data_coleta TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ml_id ON produtos_mercadolivre(ml_id);
CREATE INDEX idx_termo_busca ON produtos_mercadolivre(termo_busca);
CREATE INDEX idx_posicao ON produtos_mercadolivre(posicao_busca);
CREATE INDEX idx_vendas ON produtos_mercadolivre(vendas_numerico);
```

### 🎨 **INTERFACE ADAPTATIVA**

#### **Painel Lateral Inteligente**
- 🔄 **Switch Amazon ↔ ML** no header
- 🎯 **Filtros adaptativos** por plataforma
- 📊 **Métricas específicas** de cada marketplace
- 🔍 **Busca unificada** ou separada

#### **Tabela de Resultados**
```
Amazon: ASIN | Título | Preço | BSR | Vendas | Categoria
ML:     MLID | Título | Preço | Pos | Vendas | Reviews
```

### 🚀 **FUNCIONALIDADES EXCLUSIVAS ML**

1. **🏆 Análise de Competitividade**
   - Top 10 na busca = "Zona Premium"
   - Posições 11-30 = "Zona Competitiva"
   - 30+ = "Zona de Oportunidade"

2. **💰 Calculadora de ROI ML**
   - Comissão ML: 11-16% dependendo categoria
   - Custo MercadoPago: 4,99%
   - Frete vs Margem

3. **📈 Tendências de Preço**
   - Comparar preços na mesma busca
   - Identificar outliers (muito caro/barato)

4. **🎯 Score de Oportunidade**
   ```javascript
   const scoreML = {
     posicao: posicao <= 10 ? 5 : posicao <= 30 ? 3 : 1,
     vendas: vendas > 100 ? 5 : vendas > 50 ? 3 : 1,
     reviews: reviews > 4.5 ? 5 : reviews > 4.0 ? 3 : 1,
     frete: freteGratis ? 2 : 0,
     lojaOficial: lojaOficial ? 2 : 0
   };
   ```

### 🔧 **IMPLEMENTAÇÃO TÉCNICA**

#### **Fase 1: Refatoração (3 dias)**
- ✅ Separar código Amazon em módulos
- ✅ Criar detector de plataforma
- ✅ Interface adaptável base

#### **Fase 2: Extrator ML (5 dias)**
- 🆕 Seletores e extração ML
- 🆕 Parser de vendas ML ("mais de X")
- 🆕 Sistema de reviews/avaliações

#### **Fase 3: Análise Unificada (3 dias)**
- 🔄 Métricas comparativas
- 📊 Dashboard dual-platform
- 🎯 Score de oportunidade

#### **Fase 4: Features Avançadas (7 dias)**
- 🚀 Análise cross-platform
- 📈 Alertas de oportunidades
- 💾 Histórico comparativo

## 🎯 **RESULTADO FINAL**

### **Sistema Híbrido Completo**
- 🔍 **Uma extensão** → **Dois marketplaces**
- 📊 **Análises comparativas** entre Amazon e ML
- 🎯 **Filtros específicos** para cada plataforma
- 📈 **Oportunidades cross-platform**

### **Casos de Uso Poderosos**
1. **Arbitragem**: Produto barato na Amazon, caro no ML
2. **Validação**: Produto vende bem na Amazon, testar no ML
3. **Nichos**: Encontrar gaps de mercado
4. **Pricing**: Estratégias de preço comparativas

---

## 🤔 **O QUE VOCÊ PRECISA ME CONFIRMAR**

1. **Prioridade**: Amazon + ML ou só ML?
2. **Dados**: Usar mesmo Supabase ou separar?
3. **Interface**: Unified ou separada?
4. **Filtros**: Quais são mais importantes no ML?
5. **Análises**: Que métricas ML são cruciais para você?

---

**🚀 PRÓXIMO PASSO**: Após sua confirmação, começamos a implementação! 