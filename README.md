# 🛒 AMK Spy - Multi-Platform Product Analyzer

Uma extensão Chrome avançada para análise de produtos **Amazon** e **MercadoLivre** com sistemas totalmente independentes e especializados.

## 🆕 **Nova Arquitetura v2.2.0 - Sistemas Independentes**

### 🏗️ **Separação Total de Plataformas**
- **Amazon**: Sistema original mantido e melhorado
- **MercadoLivre**: Sistema completamente novo e específico  
- **Independência**: Cada plataforma tem seus próprios arquivos, extratores, analisadores e tabelas
- **Especialização**: Funcionalidades específicas para cada marketplace

## 🚀 **Funcionalidades Principais**

### **📦 Sistema Amazon (Original)**
- Extração automática de dados de produtos
- Métricas avançadas (receita, vendas, avaliações)
- Análise de BSR (Best Sellers Rank)
- Detecção de produtos patrocinados
- Cálculo de competitividade

### **🛒 Sistema MercadoLivre (Novo)**
- **Extração ML Específica**: MLB IDs, preços em formato brasileiro, vendas ML
- **Métricas ML**: Receita calculada, ranking de categoria, badges oficiais
- **Detecção ML**: Lojas oficiais, frete grátis, produtos patrocinados
- **Filtros ML**: Apenas lojas oficiais, frete grátis, excluir patrocinados
- **Tabela ML**: Formatação brasileira, colunas específicas ML
- **Painel ML**: Interface específica com funcionalidades ML

### **🔍 Sistema de Filtros Avançados**
- **Filtro por Preço**: Faixas personalizáveis (R$ 0-50, R$ 50-100, etc.)
- **Filtro por Avaliação**: Mínimo de estrelas (4+, 4.5+, 5)
- **Filtro por Marca**: Lista dinâmica de marcas encontradas
- **Filtro por BSR**: Rankings específicos (Top 100, 1000, 5000)
- **Filtro por Tipo**: Patrocinados vs Orgânicos
- **Contador Dinâmico**: Produtos encontrados em tempo real

### **📈 Exportação de Dados**
- **Exportação CSV**: Dados estruturados com BOM UTF-8
- **Exportação Excel**: Formatação profissional com cálculos
- **Dados Incluídos**: Posição, título, marca, preço, avaliação, vendas, receita mensal, BSR, categoria, tipo, link
- **Cálculos Automáticos**: Receita mensal baseada em preço × vendas

### **🌙 Modo Escuro Inteligente**
- **Detecção Automática**: Baseada nas preferências do sistema
- **Botão Toggle**: Alternância manual entre temas
- **Aplicação Completa**: Todos os elementos da interface
- **Transições Suaves**: Animações CSS para mudança de tema

### **✨ Animações e UX**
- **Animações CSS**: Fade-in, slide-in, pulse, bounce
- **Efeitos Hover**: Scale, lift, glow
- **Transições Suaves**: Todas as interações
- **Tooltips Informativos**: Dicas contextuais
- **Feedback Visual**: Loading states e confirmações

## 🏗️ **Arquitetura Modular**

### **📁 Estrutura de Arquivos**

```
spy-amk/
├── 📄 manifest.json          # Configuração da extensão
├── 📄 app.js                 # Controlador principal
├── 📄 content.js             # Script de conteúdo
├── 📄 popup.html             # Interface do popup
├── 📄 README.md              # Documentação
├── 📁 core/                  # Lógica de negócio compartilhada
│   ├── 📄 analyzer.js        # Análise de produtos Amazon
│   ├── 📄 extractor.js       # Extração de dados Amazon
│   ├── 📄 platform-detector.js # Detecção de plataforma
│   └── 📄 unified-controller.js # Controlador unificado
├── 📁 platforms/             # 🆕 Sistemas específicos por plataforma
│   └── 📁 mercadolivre/      # Sistema independente MercadoLivre
│       ├── 📄 ml_extractor.js   # Extrator específico ML
│       ├── 📄 ml_analyzer.js    # Analisador específico ML
│       ├── 📄 ml_table.js       # Tabela específica ML
│       ├── 📄 ml_controller.js  # Controlador específico ML
│       └── 📄 ml_sidepanel.js   # Painel lateral específico ML
├── 📁 ui/                    # Interface compartilhada
│   ├── 📄 table.js           # Gerenciamento de tabelas Amazon
│   ├── 📄 filters.js         # Sistema de filtros
│   ├── 📄 export.js          # Sistema de exportação
│   ├── 📄 theme.js           # Gerenciamento de temas
│   ├── 📄 notifications.js   # Sistema de notificações
│   ├── 📄 events.js          # Gerenciamento de eventos
│   └── 📁 components/        # Componentes reutilizáveis
│       ├── 📄 SidePanel.js      # Painel lateral Amazon
│       ├── 📄 TableRowBuilder.js # Construtor de linhas
│       └── 📄 MLManager.js      # Gerenciador ML
└── 📁 utils/                 # Utilitários compartilhados
    ├── 📄 clipboard.js       # Operações de clipboard
    ├── 📄 helpers.js         # Funções auxiliares
    └── 📄 url.js             # Manipulação de URLs
```

### **🔧 Módulos Principais**

#### **FilterManager** (`ui/filters.js`)
```javascript
// Gerenciamento centralizado de filtros
const filterManager = new FilterManager();
filterManager.setProdutosOriginais(produtos);
filterManager.aplicarFiltros();
```

#### **ExportManager** (`ui/export.js`)
```javascript
// Exportação de dados da tabela
const exportManager = new ExportManager();
exportManager.extrairProdutosDaTabela();
exportManager.exportarParaCSV();
```

#### **ThemeManager** (`ui/theme.js`)
```javascript
// Gerenciamento de temas
const themeManager = new ThemeManager();
themeManager.toggleTheme();
```

#### **NotificationManager** (`ui/notifications.js`)
```javascript
// Sistema de notificações
NotificationManager.sucesso('Operação realizada!');
NotificationManager.erro('Erro encontrado');
```

## 🎯 **Melhorias Implementadas**

### **✅ Etapa 1: Sistema de Filtros Avançados**
- [x] Filtros por preço, avaliação, marca, BSR e tipo
- [x] Botões para aplicar e limpar filtros
- [x] Contador dinâmico de produtos
- [x] Animações de feedback

### **✅ Etapa 2: Modo Escuro e Animações**
- [x] Detecção automática do modo escuro
- [x] Botão toggle de tema
- [x] Animações CSS avançadas
- [x] Efeitos hover e transições
- [x] Tooltips informativos

### **✅ Etapa 3: Sistema de Exportação**
- [x] Exportação para CSV com BOM UTF-8
- [x] Exportação para Excel formatado
- [x] Cálculos automáticos de receita
- [x] Animações de feedback
- [x] Tooltips explicativos

### **✅ Etapa 4: Refatoração Modular**
- [x] Separação em arquivos especializados
- [x] Classes modulares e reutilizáveis
- [x] Melhor organização do código
- [x] Facilidade de manutenção

## 🚀 **Como Usar**

1. **Instalar a Extensão**
   - Carregue a pasta `spy-amk` como extensão não empacotada no Chrome
   - A extensão aparecerá na barra de ferramentas

2. **Navegar para Amazon**
   - Vá para uma página de pesquisa da Amazon
   - A extensão detectará automaticamente a página

3. **Iniciar Análise**
   - Clique no ícone da extensão ou aguarde a análise automática
   - Os produtos serão coletados e analisados

4. **Usar Filtros**
   - Selecione critérios nos filtros avançados
   - Clique em "Aplicar Filtros" para filtrar
   - Use "Limpar" para resetar filtros

5. **Exportar Dados**
   - Clique em "📊 CSV" ou "📈 Excel"
   - Os dados serão baixados automaticamente
   - Inclui todos os produtos visíveis na tabela

6. **Alternar Tema**
   - Use o botão 🌙/☀️ no canto superior direito
   - O tema será aplicado instantaneamente

## 🔧 **Tecnologias Utilizadas**

- **JavaScript ES6+**: Lógica principal
- **CSS3**: Animações e estilos avançados
- **HTML5**: Estrutura da interface
- **Chrome Extensions API**: Integração com navegador
- **DOM Manipulation**: Interação com páginas web

## 📊 **Métricas Calculadas**

- **Receita Total**: Soma de (preço × vendas) de todos os produtos
- **Vendas Totais**: Número total de unidades vendidas
- **Preço Médio**: Média ponderada dos preços
- **Avaliação Média**: Média das avaliações dos produtos
- **Produtos Top 100/1000 BSR**: Contagem de produtos bem ranqueados
- **Produtos Patrocinados**: Contagem de anúncios
- **Nível de Competitividade**: Análise baseada em BSR e avaliações

## 🎨 **Design System**

### **Cores Principais**
- **Verde AMK**: `#014641` (marca principal)
- **Verde Sucesso**: `#6ac768` (ações positivas)
- **Azul Info**: `#3b82f6` (informações)
- **Vermelho Erro**: `#ef4444` (erros)
- **Amarelo Aviso**: `#f59e0b` (avisos)

### **Tipografia**
- **Fonte Principal**: Poppins (Google Fonts)
- **Tamanhos**: 10px, 12px, 14px, 18px, 24px
- **Pesos**: 400, 500, 600, 700

### **Animações**
- **Duração**: 0.2s - 0.4s
- **Easing**: ease, ease-out
- **Tipos**: fadeIn, slideIn, slideDown, pulse, bounce

## 🔮 **Próximas Etapas**

### **📋 Etapa 5: Sistema de Alertas**
- [ ] Alertas personalizáveis por critérios
- [ ] Notificações push
- [ ] Histórico de alertas
- [ ] Configurações de sensibilidade

### **📊 Etapa 6: Dashboard de Insights**
- [ ] Gráficos interativos
- [ ] Análise de tendências
- [ ] Comparação de períodos
- [ ] Relatórios automáticos

### **🏆 Etapa 7: Análise Competitiva**
- [ ] Comparação entre produtos
- [ ] Análise de concorrentes
- [ ] Identificação de oportunidades
- [ ] Recomendações estratégicas

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 **Suporte**

Para suporte, envie um email para suporte@amkspy.com ou abra uma issue no GitHub.

---

**Desenvolvido com ❤️ pela equipe AMK Spy**

# AMK Spy - Analisador Multi-Plataforma

Sistema avançado de análise de produtos para **Amazon** e **MercadoLivre** com extração robusta, análise de dados e interface moderna.

## 🚀 Funcionalidades Principais

### Amazon
- ✅ Extração completa de produtos da Amazon
- ✅ Análise de vendas, preços e rankings
- ✅ Detecção de marcas e categorias
- ✅ Sistema de filtros avançados
- ✅ Exportação de dados

### MercadoLivre (NOVO!)
- ✅ **Extração robusta baseada no sistema Python funcional**
- ✅ **Compatibilidade total com o sistema Amazon existente**
- ✅ **Detecção automática de MLB IDs**
- ✅ **Extração de vendas com padrões ML específicos**
- ✅ **Cálculo automático de receita (faturamento)**
- ✅ **Detecção de produtos patrocinados**
- ✅ **Interface unificada com Amazon**

## 🛠️ Arquitetura Técnica

### Sistema ML Extractor (Novo)
Baseado no sistema Python que funciona perfeitamente, o novo ML Extractor:

- **Seletores robustos**: Usa `li.ui-search-layout__item` como no Python
- **Extração inteligente**: MLB ID, preços, vendas, vendedores
- **Padrões de vendas**: Reconhece "+500 vendidos", "+5mil vendas", etc.
- **Estrutura compatível**: Mesma estrutura de dados do sistema Amazon
- **Logs detalhados**: Sistema de debug completo

### Componentes Principais
```
core/
├── ml-extractor.js     # 🆕 Extractor MercadoLivre (baseado no Python)
├── extractor.js        # Extractor Amazon (existente)
├── analyzer.js         # Analisador multi-plataforma
└── platform-detector.js # Detector de plataforma

ui/
├── table.js           # Tabela unificada (Amazon + ML)
├── components/        # Componentes reutilizáveis
└── ...

ml-controller.js       # 🆕 Controlador específico ML
```

## 🧪 Como Testar o Sistema ML

1. **Carregue a extensão** no Chrome
2. **Abra uma página de busca do ML**: 
   ```
   https://lista.mercadolivre.com.br/protetor-fazer-250
   ```
3. **Abra o console** (F12)
4. **Execute o teste**:
   ```javascript
   // Cole o conteúdo do arquivo teste-ml-simples.js
   ```
5. **Verifique os resultados** na tabela

## 📊 Dados Extraídos (ML)

- **MLB ID**: Identificador único do produto
- **Título**: Nome completo do produto
- **Preço**: Valor em R$ (formato numérico)
- **Vendedor**: Nome do vendedor/loja
- **Vendas**: Quantidade vendida ("+500 vendidos" → 500)
- **Receita**: Cálculo automático (vendas × preço)
- **Avaliação**: Nota de 0 a 5 estrelas
- **Patrocinado**: Detecção automática
- **Posição**: Posição na busca

## 🔧 Melhorias Implementadas

### Sistema de Extração ML
- **Baseado no Python funcional**: Usa a mesma lógica que já funciona
- **Regex robusto para MLB ID**: `/MLB[-_]?(\d{8,})/`
- **Padrões de vendas específicos**: Reconhece todos os formatos ML
- **Limpeza de URL**: Remove parâmetros como no Python
- **Prevenção de duplicatas**: Sistema de `Set()` para evitar repetições

### Compatibilidade
- **Estrutura unificada**: Mesmos campos do sistema Amazon
- **Tabela compartilhada**: Uma tabela para ambas as plataformas
- **Filtros compatíveis**: Mesmos filtros funcionam para ambos
- **Exportação unificada**: Exporta dados de ambas as plataformas

### Sistema de Logs
- **Prefixo identificador**: `[ML-EXTRACTOR]` para fácil debug
- **Logs detalhados**: Cada etapa da extração é logada
- **Contadores**: Produtos encontrados, extraídos, únicos
- **Estrutura de dados**: Validação completa dos campos

## 🚀 Próximas Funcionalidades

- [ ] Análise de tendências ML
- [ ] Comparação Amazon vs ML
- [ ] Histórico de posições ML
- [ ] Alertas de mudanças de preço
- [ ] Dashboard unificado

## 📝 Notas Técnicas

### Por que funciona agora?
1. **Baseado no Python**: Copiamos a lógica exata que já funciona
2. **Seletores testados**: Usamos os mesmos seletores do sistema Python
3. **Estrutura compatível**: Mantivemos compatibilidade com sistema Amazon
4. **Logs robustos**: Sistema de debug completo para identificar problemas
5. **Tratamento de erros**: Fallbacks para todos os cenários

### Diferenças do sistema anterior
- ❌ **Antes**: Lógica complexa, muitos logs, estrutura incompatível
- ✅ **Agora**: Lógica simples, logs úteis, estrutura compatível
- ❌ **Antes**: Seletores não testados, regex complexo
- ✅ **Agora**: Seletores do Python funcional, regex robusto
- ❌ **Antes**: Dados não apareciam na tabela
- ✅ **Agora**: Integração completa com tabela existente

---

**Versão**: 2.1.0  
**Última atualização**: Sistema ML Extractor baseado no Python funcional  
**Status**: ✅ Funcional para Amazon e MercadoLivre 