# 🔍 AMK Spy - Sistema Refatorado v2.0.0

## 📋 Visão Geral

O AMK Spy é uma extensão avançada para análise de produtos da Amazon, completamente refatorada com arquitetura modular, melhor performance e manutenibilidade.

## 🏗️ Nova Arquitetura

### Estrutura de Diretórios

```
spy-amk/
├── src/                          # Código fonte principal
│   ├── core/                     # Lógica de negócio
│   │   ├── DataManager.js        # Gerenciador de estado global
│   │   ├── Analyzer.js           # Análise e coleta de produtos
│   │   └── Extractor.js          # Extração de dados
│   ├── ui/                       # Interface do usuário
│   │   ├── managers/             # Gerenciadores de UI
│   │   │   └── UIManager.js      # Gerenciador central de UI
│   │   ├── components/           # Componentes reutilizáveis
│   │   │   ├── TableComponent.js # Componente de tabela
│   │   │   ├── ModalComponent.js # Componente de modal
│   │   │   └── NotificationComponent.js # Componente de notificações
│   │   └── styles/               # Estilos e temas
│   ├── utils/                    # Utilitários
│   │   ├── MigrationManager.js   # Gerenciador de migração
│   │   ├── clipboard.js          # Utilitários de clipboard
│   │   └── helpers.js            # Funções auxiliares
│   ├── config/                   # Configurações
│   │   └── AppConfig.js          # Configuração centralizada
│   └── services/                 # Serviços externos
├── public/                       # Arquivos públicos
│   ├── manifest.json             # Manifesto da extensão
│   ├── popup.html                # Interface do popup
│   └── images/                   # Ícones e imagens
└── docs/                         # Documentação
```

## 🚀 Principais Melhorias

### 1. **Arquitetura Modular**
- Separação clara de responsabilidades
- Componentes reutilizáveis
- Injeção de dependências
- Fácil manutenção e extensão

### 2. **Gerenciamento de Estado Centralizado**
- `DataManager` único para todo o estado
- Sistema de eventos reativo
- Persistência automática
- Histórico de mudanças

### 3. **Interface Moderna**
- Componentes modulares de UI
- Sistema de temas (claro/escuro)
- Animações suaves
- Design responsivo

### 4. **Performance Otimizada**
- Lazy loading de componentes
- Debounce e throttle
- Cache inteligente
- Processamento em lotes

### 5. **Sistema de Migração**
- Migração automática de dados antigos
- Rollback em caso de problemas
- Validação de dados migrados
- Relatórios detalhados

## 🔧 Componentes Principais

### DataManager
```javascript
// Gerenciamento de estado
const dataManager = window.DataManager;
dataManager.setProdutos(produtos);
dataManager.setFiltros(filtros);
dataManager.subscribe(callback);
```

### UIManager
```javascript
// Gerenciamento de interface
const uiManager = window.UIManager;
uiManager.showModal(content, options);
uiManager.showNotification(message, type);
uiManager.registerComponent(name, component);
```

### Analyzer
```javascript
// Análise de produtos
const analyzer = window.Analyzer;
await analyzer.analisarProdutosPesquisaRapido();
await analyzer.analisarProdutosTodasPaginas();
```

## 📊 Funcionalidades

### ✅ Análise de Produtos
- **Análise Rápida**: Página atual
- **Análise Completa**: Múltiplas páginas
- **Busca de Detalhes**: Informações completas
- **Detecção de Marcas**: Busca automática

### ✅ Filtros Avançados
- Por nome do produto
- Por faixa de preço
- Por avaliação
- Por marca
- Por ranking BSR
- Por posição na pesquisa
- Por tipo (patrocinado/orgânico)

### ✅ Exportação de Dados
- **CSV**: Compatível com Excel
- **Excel**: Formato .xlsx nativo
- **JSON**: Dados estruturados
- **Campos Personalizados**: Seleção de colunas

### ✅ Interface Moderna
- **Tabela Responsiva**: Ordenação e paginação
- **Modais Inteligentes**: Diferentes tamanhos
- **Notificações**: Sistema de feedback
- **Temas**: Claro, escuro e automático

### ✅ Funcionalidades Avançadas
- **Cópia de ASIN**: Múltiplos métodos
- **Detecção de Duplicados**: ASINs repetidos
- **Métricas**: Estatísticas em tempo real
- **Histórico**: Log de ações
- **Configurações**: Personalização completa

## 🎨 Sistema de Temas

### Tema Claro
```css
--bg-primary: #ffffff;
--text-primary: #111827;
--accent-primary: #3b82f6;
```

### Tema Escuro
```css
--bg-primary: #1f2937;
--text-primary: #f9fafb;
--accent-primary: #60a5fa;
```

## ⚙️ Configuração

### Configurações Principais
```javascript
const config = {
    maxPaginas: 5,           // Máximo de páginas para análise
    delayEntrePaginas: 300,  // Delay entre páginas (ms)
    tema: 'auto',            // Tema: light, dark, auto
    autoBusca: true          // Busca automática de detalhes
};
```

### Configurações de Performance
```javascript
const performance = {
    batchSize: 20,           // Tamanho do lote
    maxConcurrentRequests: 5, // Requisições simultâneas
    cacheDuration: 300000    // Cache: 5 minutos
};
```

## 🔄 Sistema de Migração

### Migração Automática
```javascript
const migrationManager = window.MigrationManager;
const result = await migrationManager.migrate();

if (result.success) {
    console.log('Migração concluída!');
}
```

### Validação de Dados
```javascript
const validation = migrationManager.validateMigratedData();
if (!validation.isValid) {
    console.warn('Problemas encontrados:', validation.errors);
}
```

## 📈 Métricas e Analytics

### Métricas Disponíveis
- Total de produtos
- Preço médio
- Avaliação média
- Média de vendas
- Média de BSR
- Produtos top 100/1000
- Produtos patrocinados/orgânicos

### Relatórios
- Relatório de migração
- Log de erros
- Analytics de uso
- Performance metrics

## 🛠️ Desenvolvimento

### Instalação
```bash
# Clonar repositório
git clone https://github.com/amk/spy-amk.git
cd spy-amk

# Instalar dependências (se houver)
npm install
```

### Estrutura de Desenvolvimento
```javascript
// Novo componente
class MeuComponente {
    async initialize() {
        // Inicialização
    }
    
    render() {
        // Renderização
    }
    
    destroy() {
        // Limpeza
    }
}

// Registro no UIManager
window.UIManager.registerComponent('MeuComponente', new MeuComponente());
```

### Padrões de Código
- **ES6+**: Arrow functions, destructuring, async/await
- **Modular**: Classes e módulos
- **Eventos**: Sistema de eventos reativo
- **Error Handling**: Try/catch em operações assíncronas
- **Logging**: Sistema de logs estruturado

## 🧪 Testes

### Testes Automatizados
```javascript
// Teste de componente
describe('TableComponent', () => {
    it('should render products correctly', () => {
        // Teste de renderização
    });
    
    it('should handle filters', () => {
        // Teste de filtros
    });
});
```

### Testes Manuais
- Análise rápida e completa
- Filtros e exportação
- Temas e configurações
- Migração de dados

## 📝 Logs e Debug

### Níveis de Log
```javascript
AppConfig.UTILS.log(0, 'Erro crítico');     // ERROR
AppConfig.UTILS.log(1, 'Aviso');            // WARN
AppConfig.UTILS.log(2, 'Informação');       // INFO
AppConfig.UTILS.log(3, 'Debug');            // DEBUG
```

### Logs Persistidos
- Logs de erro no localStorage
- Histórico de ações
- Métricas de performance
- Relatórios de migração

## 🔒 Segurança

### Boas Práticas
- Validação de entrada
- Sanitização de dados
- Rate limiting
- Error boundaries
- Secure storage

### Permissões
```json
{
    "permissions": [
        "activeTab",
        "storage",
        "clipboardWrite"
    ],
    "host_permissions": [
        "https://www.amazon.com/*",
        "https://www.amazon.com.br/*"
    ]
}
```

## 🚀 Deploy

### Build de Produção
```bash
# Minificar código
npm run build

# Testar extensão
npm run test

# Empacotar
npm run package
```

### Distribuição
- Chrome Web Store
- Firefox Add-ons
- Edge Add-ons
- Instalação manual

## 📞 Suporte

### Documentação
- [Guia de Uso](docs/USAGE.md)
- [API Reference](docs/API.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### Comunidade
- [Issues](https://github.com/amk/spy-amk/issues)
- [Discussions](https://github.com/amk/spy-amk/discussions)
- [Wiki](https://github.com/amk/spy-amk/wiki)

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📊 Status do Projeto

- ✅ **v2.0.0**: Sistema refatorado completo
- 🔄 **v2.1.0**: Melhorias de performance
- 📋 **v2.2.0**: Novos filtros e métricas
- 🎯 **v3.0.0**: Machine Learning e IA

---

**AMK Spy v2.0.0** - Transformando a análise de produtos da Amazon! 🚀 