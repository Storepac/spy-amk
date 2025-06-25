# 🔍 AMK Spy - Análise Inteligente de Produtos Amazon

Uma extensão Chrome avançada para análise de produtos da Amazon com arquitetura modular e funcionalidades empresariais.

## 🚀 **Funcionalidades Principais**

### **📊 Análise de Produtos**
- Extração automática de dados de produtos
- Métricas avançadas (receita, vendas, avaliações)
- Análise de BSR (Best Sellers Rank)
- Detecção de produtos patrocinados
- Cálculo de competitividade

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
├── 📁 core/                  # Lógica de negócio
│   ├── 📄 analyzer.js        # Análise de produtos
│   └── 📄 extractor.js       # Extração de dados
├── 📁 ui/                    # Interface do usuário
│   ├── 📄 table.js           # Gerenciamento de tabelas
│   ├── 📄 filters.js         # Sistema de filtros
│   ├── 📄 export.js          # Sistema de exportação
│   ├── 📄 theme.js           # Gerenciamento de temas
│   ├── 📄 notifications.js   # Sistema de notificações
│   ├── 📄 events.js          # Gerenciamento de eventos
│   └── 📄 product_page.js    # Análise de páginas de produto
└── 📁 utils/                 # Utilitários
    ├── 📄 clipboard.js       # Operações de clipboard
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