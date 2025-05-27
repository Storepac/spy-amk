# AMK Spy - Amazon Product Analyzer

Extensão para análise inteligente de produtos da Amazon com extração de marcas e métricas avançadas.

## 🏗️ Arquitetura Modular v2.0

### 📁 Estrutura de Arquivos

```
anderson/
├── 📄 content.js           # Ponto de entrada principal
├── 📄 app.js              # Controlador da aplicação
├── 📄 manifest.json       # Configuração da extensão
├── 📄 popup.html          # Interface do popup
├── 
├── 📁 core/               # Lógica de negócio
│   ├── extractor.js       # Extração de dados dos produtos
│   └── analyzer.js        # Análise e processamento
├── 
├── 📁 ui/                 # Interface do usuário
│   ├── notifications.js   # Sistema de notificações
│   ├── table.js          # Gerenciamento da tabela
│   └── events.js         # Gerenciamento de eventos
├── 
├── 📁 utils/              # Utilitários
│   ├── url.js            # Manipulação de URLs
│   └── clipboard.js      # Clipboard e formatação
└── 
└── 📁 images/             # Ícones da extensão
```

## 🚀 Funcionalidades

### ⚡ Sistema Otimizado de 3 Fases
1. **Coleta Instantânea** - Extrai dados básicos em < 1 segundo
2. **Modal Imediato** - Abre interface instantaneamente
3. **Detalhes Paralelos** - Busca marcas em lotes de 5 produtos

### 📊 Métricas Calculadas
- Receita total estimada
- Total de vendas
- Preço médio
- Média de vendas/mês
- Avaliação média

### 🔍 Extração de Dados
- **Marca**: Tabela de especificações + fallbacks
- **Preços**: Formatação brasileira
- **Vendas**: Suporte a "mil" e números
- **Avaliações**: Nota e quantidade de reviews

## 🛠️ Classes Principais

### `ProductExtractor`
Responsável pela extração de dados dos produtos.
```javascript
ProductExtractor.extrairDetalhesProduto(url)
ProductExtractor.extrairDadosProduto(elemento)
```

### `ProductAnalyzer`
Análise e processamento dos dados coletados.
```javascript
ProductAnalyzer.calcularMetricas(produtos)
ProductAnalyzer.analisarProdutosPesquisaRapido()
ProductAnalyzer.buscarDetalhesEmParalelo(produtos, callback)
```

### `TableManager`
Gerenciamento da interface da tabela.
```javascript
TableManager.criarTabelaProdutos(produtos)
TableManager.atualizarLinhaProduto(produto, index)
TableManager.ordenarTabela(tipo)
```

### `NotificationManager`
Sistema de notificações e feedback visual.
```javascript
NotificationManager.mostrar(mensagem)
NotificationManager.mostrarFeedbackCopia(botao)
```

### `EventManager`
Gerenciamento de eventos da interface.
```javascript
EventManager.configurarEventosModal(modal)
EventManager.adicionarBotaoAmkSpy()
```

### `AppController`
Controlador principal da aplicação.
```javascript
AppController.init()
AppController.exibirAnalise()
AppController.iniciarAnalise(tipo)
```

## 🎯 Benefícios da Arquitetura

- **Modularidade**: Cada responsabilidade em arquivo separado
- **Manutenibilidade**: Código organizado e fácil de modificar
- **Escalabilidade**: Fácil adição de novas funcionalidades
- **Performance**: Sistema otimizado com processamento paralelo
- **Testabilidade**: Classes isoladas facilitam testes

## 🔧 Desenvolvimento

### Ordem de Carregamento (manifest.json)
1. `utils/url.js` - Utilitários de URL
2. `utils/clipboard.js` - Clipboard e formatação
3. `ui/notifications.js` - Sistema de notificações
4. `ui/table.js` - Interface da tabela
5. `ui/events.js` - Gerenciamento de eventos
6. `core/extractor.js` - Extração de dados
7. `core/analyzer.js` - Análise de produtos
8. `app.js` - Controlador principal
9. `content.js` - Inicialização

### Padrões Utilizados
- **Classes estáticas**: Para organização modular
- **Window globals**: Para compatibilidade entre módulos
- **Async/await**: Para operações assíncronas
- **Event delegation**: Para performance de eventos

## 📈 Performance

- **Modal abre em ~1 segundo** (vs 60+ segundos antes)
- **Processamento paralelo** de 5 produtos simultâneos
- **Feedback visual em tempo real**
- **UX otimizada** com loading states

## 🔄 Versionamento

- **v1.0**: Versão monolítica original
- **v2.0**: Arquitetura modular com otimizações de performance 