# AMK Spy Web - Arquitetura Completa

## Estrutura de Pastas

```
spy-amk-web/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Rotas autenticadas
│   │   ├── dashboard/
│   │   ├── search/
│   │   ├── opportunities/
│   │   ├── niches/
│   │   └── reports/
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── products/
│   │   ├── analytics/
│   │   ├── niches/
│   │   └── reports/
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # Componentes base
│   ├── layout/                  # Layout components
│   ├── charts/                  # Gráficos
│   └── forms/                   # Formulários
├── lib/                         # Utilitários
├── services/                    # Camada de serviços
├── hooks/                       # Custom hooks
├── styles/                      # Estilos
├── database/                    # Schema e migrations
└── tests/                       # Testes
```

## Funcionalidades Principais

### 1. Sistema de Busca Avançada
- Busca inteligente com múltiplas palavras-chave
- Filtros avançados (preço, BSR, avaliações)
- Busca em lote via CSV
- Histórico de buscas

### 2. Score de Oportunidade (0-100)
- BSR ideal: 30 pontos
- Poucas avaliações: 25 pontos  
- Faixa de preço: 20 pontos
- Tendência positiva: 15 pontos
- Baixa saturação: 10 pontos

### 3. Análise de Nichos
- Saturação por palavra-chave
- Preço médio do nicho
- Produtos com alto potencial
- Tendências de crescimento

### 4. Dashboard Analytics
- Métricas globais
- Gráficos de tendências
- Alertas em tempo real
- Comparações entre nichos

### 5. Sistema Multi-usuário
- Autenticação NextAuth
- Planos Freemium/Pro/Enterprise
- Limites por plano
- Compartilhamento de dados

## Stack Tecnológica

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Hook Form
- Zod
- Recharts

### Backend
- Next.js API Routes
- NextAuth.js
- Prisma ORM
- PostgreSQL
- Redis
- Puppeteer

### DevOps
- Vercel
- GitHub Actions
- Sentry
- Upstash Redis
- Neon PostgreSQL

## Banco de Dados

### Tabelas Principais
- users (usuários com planos)
- products_advanced (produtos expandidos)
- opportunities (oportunidades calculadas)
- niches (nichos descobertos)
- user_searches (histórico buscas)

## Plugin vs Web

### Plugin (Limitado)
- 1 página Amazon (16 produtos)
- Análise básica
- Detecção novo/existente

### Web (Premium)
- Páginas ilimitadas
- Score oportunidade
- Análise nichos completa
- Dashboard analytics
- Multi-usuário

## Roadmap

### Fase 1: MVP (2-3 semanas)
- Setup Next.js + TypeScript
- Autenticação básica
- CRUD produtos
- Dashboard básico

### Fase 2: Core (3-4 semanas)
- Score oportunidade
- Análise nichos
- Scraping Amazon
- Charts e analytics

### Fase 3: Advanced (2-3 semanas)
- Sistema planos
- Relatórios
- API pública
- Testes

## Modelo de Negócio

- Free: 50 produtos/mês
- Pro: 2000 produtos/mês, $29/mês
- Business: 10000 produtos/mês, $99/mês
- Enterprise: Ilimitado, $299/mês

## Sugestões 

- Pesquisa ampla ou exata:
Ampla: igual a amazon faz la pega o termo  traz tudo ferente ao termo então trazer tudo 
Exata: apenas o nome que o cliente buscou, os produtos tem que ter
- Saber se a amazon vende os produto e ter um filtro pra procurar apenas produtos que a amazon não vende
- Sistema de busca de fornecdores onde voce coloca o ID do Seller e ele busca os produtos que ele vende
- Salvar os dados desse fornecedores que tem na amazon que criar um banco contendo eles dai o usuario pode produrar tambem
- ter um arquivo que faça analise de produtos que traga algumas informaç~çoes basicas como nome, imagem, fornecedor, SKU, ASIN, categoria que inclui (BRS, quantidade de vendas, faturamento/mês), BuyBox com (preço, fora de estoque: Amazon e Buybox), custo da amazon, total de imposto, Concorrencia
- Um arquivo que faça as contas, custo de produto, preço, impostos, tipo de regime, que faça toda a custeação pra um cliente vender um produto dentro da amazon 

- esse sistema vai ter que ter mais versoes pra outros marketplaces como Mercado livre, Casas bahia, magazine luiza, shopee que dai posso vender o sistema completo ou parcial que agrega valor, entao a trusutura das pastas e arquivoa devem ser bem estruturadas

- questao de produtos pro banco como vouter bastante, vai ser pelos usuarios que fazem pesquisas e posso montar um sistema que faz pesquisa de produtos novos todos os dias para alimentar o banco de dados

- vai ter mais ideias que vou ter ao longo do tempo mas por enquanto é isso entao ve se são ideias viaveis e se tiver melhores coloque em prqtica eme mostre o que posso melhorar e inserir no sistema, lembrando que esse sistema tem o obejtivo de ajudar o usuario a prpcurar um produto viavel pra vender em marktplaces e ajudar ele a otimizar esse tempo