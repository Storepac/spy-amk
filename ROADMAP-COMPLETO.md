# 🚀 AMK Spy Web - Roadmap Completo

## 🎯 Funcionalidades Baseadas nas Suas Ideias

### 1. 🔍 Sistema de Busca Inteligente
#### Pesquisa Ampla vs Exata
- **Ampla**: Como Amazon - busca termos relacionados
- **Exata**: Apenas produtos com termo exato no título
- **Híbrida**: Combina ambas com score de relevância
- **Sinônimos**: Base de dados de termos relacionados

#### Filtros Avançados
- **Amazon vs Terceiros**: Checkbox "Apenas produtos que Amazon NÃO vende"
- **Seller específico**: Busca por ID do vendedor
- **Faixa de preço**: Min/Max customizável
- **BSR Range**: 1K-10K, 10K-100K, etc.
- **Avaliações**: Mínimo/máximo
- **Estoque**: Em estoque, fora de estoque
- **Prime**: Apenas produtos Prime

### 2. 🏪 Sistema de Fornecedores
#### Banco de Sellers
- **Perfil completo**: Nome, país, produtos, performance
- **Score do fornecedor**: Baseado em vendas, avaliações, tempo
- **Produtos por seller**: Lista completa do catálogo
- **Histórico**: Evolução de preços e ranking
- **Contato**: Links para contato direto

#### Espionagem de Concorrentes
- **Busca por Seller ID**: Descobre todo catálogo
- **Análise de estratégia**: Preços, produtos, sazonalidade
- **Alertas**: Novos produtos do concorrente
- **Comparação**: Performance vs seus produtos

### 3. 📊 Análise Completa de Produtos
#### Dados Essenciais
- **Básico**: Nome, imagem, ASIN, categoria, marca
- **Vendas**: BSR, quantidade vendida estimada, faturamento/mês
- **BuyBox**: Preço atual, histórico, quem tem
- **Estoque**: Amazon vs sellers, níveis
- **Custos**: Custo Amazon, impostos, margens

#### Análise de Oportunidade
- **Score 0-100**: Algoritmo proprietário
- **Fatores**: BSR ideal, poucas avaliações, preço bom, tendência
- **Concorrência**: Quantos sellers, saturação
- **Sazonalidade**: Picos de venda, tendências
- **Previsão**: Potencial de vendas baseado em dados

### 4. 💰 Calculadora de Custos
#### Custeação Completa
- **Produto**: Custo de aquisição
- **Frete**: Nacional e internacional
- **Impostos**: PIS, COFINS, ICMS, IPI
- **Taxas Amazon**: Referral fee, FBA, storage
- **Regime tributário**: Simples, Lucro Real, MEI
- **Margem**: Cálculo automático de lucro

#### Cenários
- **Otimista**: Melhores condições
- **Realista**: Condições médias
- **Pessimista**: Piores condições
- **Comparação**: Múltiplos produtos lado a lado

### 5. 🌐 Multi-Marketplace
#### Estrutura Escalável
```
services/
├── marketplaces/
│   ├── AmazonService.ts
│   ├── MercadoLivreService.ts
│   ├── CasasBahiaService.ts
│   ├── MagazineLuizaService.ts
│   ├── ShopeeService.ts
│   └── BaseMarketplaceService.ts
```

#### Funcionalidades por Marketplace
- **Amazon**: Completo (já temos)
- **Mercado Livre**: Busca, preços, vendas
- **Casas Bahia**: Produtos, estoque, preços
- **Magazine Luiza**: Catálogo, promoções
- **Shopee**: Produtos importados, preços

### 6. 🤖 Auto-Alimentação do Banco
#### Scraping Automático
- **Cron jobs**: Busca diária de produtos novos
- **Trending**: Produtos em alta por categoria
- **Oportunidades**: Algoritmo detecta produtos promissores
- **Atualizações**: Preços, BSR, estoque em tempo real

#### Machine Learning
- **Padrões**: Detecta produtos que viram sucesso
- **Predição**: Antecipa oportunidades
- **Alertas**: Notifica usuários sobre achados
- **Otimização**: Melhora busca baseado em comportamento

## 🏗️ Arquitetura Técnica

### Frontend (Next.js 14)
```
app/
├── (dashboard)/
│   ├── search/
│   │   ├── ampla/page.tsx
│   │   ├── exata/page.tsx
│   │   └── seller/page.tsx
│   ├── products/
│   │   ├── analyzer/page.tsx
│   │   └── calculator/page.tsx
│   ├── suppliers/
│   │   ├── database/page.tsx
│   │   └── spy/page.tsx
│   └── marketplaces/
│       ├── amazon/page.tsx
│       ├── mercadolivre/page.tsx
│       └── [marketplace]/page.tsx
```

### Backend (API Routes)
```
api/
├── search/
│   ├── ampla/route.ts
│   ├── exata/route.ts
│   └── seller/route.ts
├── products/
│   ├── analyze/route.ts
│   └── calculate/route.ts
├── suppliers/
│   ├── profile/route.ts
│   └── products/route.ts
├── marketplaces/
│   └── [marketplace]/
│       ├── search/route.ts
│       └── products/route.ts
└── automation/
    ├── scraping/route.ts
    └── alerts/route.ts
```

### Services (Camada de Negócio)
```
services/
├── SearchService.ts          # Busca ampla/exata
├── ProductAnalyzer.ts        # Análise completa
├── CostCalculator.ts         # Calculadora custos
├── SupplierService.ts        # Gestão fornecedores
├── MarketplaceService.ts     # Multi-marketplace
├── AutomationService.ts      # Scraping automático
└── OpportunityDetector.ts    # IA oportunidades
```

### Database (PostgreSQL)
```sql
-- Produtos expandidos
products_advanced (
  id, marketplace, asin, title, price, bsr, reviews,
  seller_id, buybox_winner, stock_amazon, stock_sellers,
  cost_amazon, taxes, opportunity_score, created_at
)

-- Fornecedores
suppliers (
  id, seller_id, name, country, total_products,
  avg_rating, performance_score, contact_info
)

-- Histórico preços
price_history (
  id, product_id, price, date, buybox_winner
)

-- Custos por produto
product_costs (
  id, product_id, acquisition_cost, shipping_cost,
  taxes, amazon_fees, profit_margin
)

-- Marketplaces
marketplaces (
  id, name, base_url, scraper_config, active
)
```

## 🎯 Diferencial Competitivo

### Plugin vs Web
- **Plugin**: Amostra (1 página, busca simples)
- **Web**: Completo (todas funcionalidades)

### Funcionalidades Únicas
1. **Espionagem de sellers** - Ninguém tem!
2. **Multi-marketplace** - Visão 360°
3. **Calculadora completa** - ROI real
4. **IA para oportunidades** - Automação
5. **Auto-alimentação** - Sistema vivo

## 💰 Modelo de Receita

### Planos
- **Free**: 50 produtos/mês, 1 marketplace
- **Pro**: 2000 produtos/mês, todos marketplaces, $39/mês
- **Business**: 10k produtos/mês, API, sellers, $99/mês
- **Enterprise**: Ilimitado, white-label, $299/mês

### Receitas Adicionais
- **API**: $0.01 por consulta
- **Dados**: Venda de insights para marcas
- **Consultoria**: Implementação personalizada
- **Plugins**: Marketplace específicos

## 🚀 Cronograma

### Fase 1: Core (4 semanas)
- [ ] Setup Next.js + TypeScript
- [ ] Busca ampla/exata
- [ ] Análise básica produtos
- [ ] Calculadora custos

### Fase 2: Advanced (4 semanas)
- [ ] Sistema fornecedores
- [ ] Multi-marketplace
- [ ] Auto-alimentação
- [ ] IA oportunidades

### Fase 3: Scale (4 semanas)
- [ ] API pública
- [ ] Mobile app
- [ ] Integrações
- [ ] White-label

---

**Quer que eu comece implementando? Por onde começamos?** 🚀 