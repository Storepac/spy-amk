# 🎯 Sistema de Filtros Avançados - AMK Spy

## Visão Geral

O sistema de filtros avançados permite configurar critérios específicos antes de iniciar a análise de produtos na Amazon, otimizando os resultados conforme necessidades específicas de pesquisa.

## 🚀 Funcionalidades Implementadas

### 1. **Toggle BSR ≤ 100**
- **Descrição**: Checkbox que filtra apenas produtos com BSR (Best Seller Rank) menor ou igual a 100
- **Comportamento**: Quando ativado, desabilita automaticamente os campos de BSR personalizado
- **Uso**: Ideal para encontrar apenas produtos de alta performance

### 2. **Filtros de Preço do BuyBox**
- **Campos**: Mínimo e Máximo em R$
- **Formato**: Aceita valores decimais (ex: 49.90)
- **Validação**: Valores devem ser ≥ 0
- **Uso**: Definir faixa de preço desejada para análise

### 3. **Filtros de Ranking Categoria (BSR)**
- **Campos**: BSR Mínimo e BSR Máximo
- **Comportamento**: Desabilitado quando "BSR ≤ 100" está ativo
- **Validação**: Valores devem ser ≥ 1
- **Uso**: Definir faixa específica de ranking quando não usar o toggle

### 4. **Filtros de N° de Vendas**
- **Campos**: Vendas Mínimas e Vendas Máximas
- **Formato**: Valores inteiros
- **Validação**: Valores devem ser ≥ 0
- **Uso**: Filtrar por volume de vendas mensais

## 🎛️ Interface de Usuário

### Design Visual
- **Cards com bordas**: Fundo #f8f9fa com bordas #e9ecef
- **Toggle inteligente**: Visual feedback quando BSR ≤ 100 está ativo
- **Campos organizados**: Layout em duas colunas para min/max
- **Ícones intuitivos**: 📊 BSR, 💰 Preço, 🏆 Ranking, 📈 Vendas

### Interatividade
- **Toggle automático**: Ativar BSR ≤ 100 desabilita campos personalizados
- **Feedback visual**: Campos desabilitados ficam com opacity 0.5
- **Limpeza automática**: Valores são limpos quando campos são desabilitados

## ⚙️ Implementação Técnica

### Arquivos Modificados

#### `ui/components/SidePanel.js`
```javascript
// Novos métodos adicionados:
- configurarEventosFiltros()      // Configura toggle BSR
- coletarFiltros()                // Coleta valores da interface
- aplicarFiltrosProdutos()        // Aplica filtros em array de produtos
- temFiltrosAtivos()              // Verifica se há filtros configurados
- mostrarResumoFiltros()          // Mostra resumo dos filtros ativos
- executarAnalise()               // Modificado para incluir filtros
- executarAnaliseAgora()          // Modificado para salvar filtros
- verificarAnalisePendente()      // Modificado para carregar filtros
```

#### `core/analyzer.js`
```javascript
// Novos métodos adicionados:
- carregarFiltrosAnalise()        // Carrega filtros do sessionStorage
- temFiltrosAtivos()              // Verifica filtros ativos
- aplicarFiltros()                // Aplica filtros em produtos coletados

// Métodos modificados:
- analisarProdutosPesquisaRapido() // Aplica filtros após coleta
- coletarProdutosTodasPaginas()    // Aplica filtros após coleta completa
```

### Estrutura de Dados

#### Objeto Filtros
```javascript
{
    bsrTop100: boolean,          // Toggle BSR ≤ 100
    precoMin: number | null,     // Preço mínimo em R$
    precoMax: number | null,     // Preço máximo em R$
    bsrMin: number | null,       // BSR mínimo (desabilitado se bsrTop100 = true)
    bsrMax: number | null,       // BSR máximo (desabilitado se bsrTop100 = true)
    vendasMin: number | null,    // Vendas mínimas
    vendasMax: number | null     // Vendas máximas
}
```

### Persistência de Dados
- **sessionStorage**: Filtros são salvos como `amk_filtros_analise`
- **Análise pendente**: Filtros incluídos em `amk_pending_analysis`
- **Sincronização**: Filtros aplicados tanto na análise rápida quanto completa

## 🔄 Fluxo de Funcionamento

### 1. Configuração dos Filtros
1. Usuário abre SidePanel (botão 🔍)
2. Configura filtros desejados na seção "🎯 Filtros de Análise"
3. Toggle BSR ≤ 100 desabilita automaticamente campos BSR personalizados
4. Campos são validados em tempo real

### 2. Execução da Análise
1. Usuário clica em "Análise Rápida" ou "Análise Completa"
2. Sistema coleta filtros da interface
3. Mostra resumo dos filtros ativos no console
4. Salva filtros no sessionStorage
5. Executa análise (local ou após navegação)

### 3. Aplicação dos Filtros
1. **Durante coleta**: Produtos são coletados normalmente
2. **Após coleta**: Filtros são aplicados ao array de produtos
3. **Reposicionamento**: Produtos filtrados recebem novas posições
4. **Feedback**: Interface mostra quantos produtos foram filtrados

### 4. Navegação Entre Páginas
1. Se análise requer navegação, filtros são salvos
2. Após carregamento da nova página, filtros são restaurados
3. Análise é executada com filtros originais

## 📊 Exemplos de Uso

### Cenário 1: Produtos Elite
```javascript
// Configuração
{
    bsrTop100: true,
    precoMin: 50,
    precoMax: 200,
    vendasMin: 1000
}

// Resultado: Apenas produtos BSR ≤ 100, preço R$ 50-200, vendas ≥ 1000
```

### Cenário 2: Nicho Específico
```javascript
// Configuração
{
    bsrTop100: false,
    bsrMin: 500,
    bsrMax: 2000,
    precoMin: 30,
    precoMax: 100
}

// Resultado: Produtos BSR #500-2000, preço R$ 30-100
```

### Cenário 3: Alto Volume
```javascript
// Configuração
{
    vendasMin: 2000,
    vendasMax: 10000,
    precoMin: 100
}

// Resultado: Produtos com 2000-10000 vendas, preço ≥ R$ 100
```

## 🎨 Melhorias de UX

### Feedback Visual
- **Status dinâmico**: Mensagens mostram quando filtros estão ativos
- **Contador inteligente**: "X produtos coletados (Y filtrados)"
- **Resumo no console**: Log detalhado dos filtros aplicados

### Validação Inteligente
- **Prevenção de conflitos**: Toggle BSR desabilita campos conflitantes
- **Valores válidos**: Validação de tipos e ranges
- **Limpeza automática**: Campos são limpos quando desabilitados

### Persistência de Estado
- **Sessão mantida**: Filtros salvos durante navegação
- **Recuperação automática**: Estado restaurado após reload
- **Sincronização**: Filtros aplicados em todas as análises

## 🔧 Testes e Validação

### Arquivo de Teste
- **teste-filtros-sidepanel.html**: Interface completa para testar filtros
- **Produtos simulados**: 5 produtos com diferentes características
- **Testes automatizados**: Verificação de cada tipo de filtro
- **Log detalhado**: Console com informações de debug

### Cenários Testados
1. ✅ Toggle BSR ≤ 100 funcional
2. ✅ Filtros de preço aplicados corretamente
3. ✅ Filtros BSR personalizados funcionais
4. ✅ Filtros de vendas aplicados
5. ✅ Integração com análise rápida
6. ✅ Integração com análise completa
7. ✅ Persistência durante navegação
8. ✅ Feedback visual adequado

## 🚀 Benefícios

### Para o Usuário
- **Precisão**: Encontra apenas produtos relevantes
- **Eficiência**: Reduz tempo de análise manual
- **Flexibilidade**: Múltiplos critérios combinados
- **Simplicidade**: Interface intuitiva e visual

### Para o Sistema
- **Performance**: Menos produtos para processar
- **Qualidade**: Dados mais focados e relevantes
- **Escalabilidade**: Filtros aplicados antes do processamento pesado
- **Manutenibilidade**: Código modular e bem estruturado

## 📈 Próximas Melhorias

### Funcionalidades Futuras
- [ ] **Presets de filtros**: Salvar configurações favoritas
- [ ] **Filtros por categoria**: Filtrar por categorias específicas
- [ ] **Filtros por marca**: Incluir/excluir marcas específicas
- [ ] **Análise de concorrência**: Filtros baseados em competitors
- [ ] **Histórico de filtros**: Recuperar filtros de análises anteriores

### Otimizações Técnicas
- [ ] **Cache inteligente**: Cachear resultados de filtros
- [ ] **Filtros no servidor**: Aplicar filtros via API
- [ ] **Análise incremental**: Aplicar filtros durante coleta
- [ ] **Validação avançada**: Prevenção de configurações inválidas

---

## 📝 Conclusão

O sistema de filtros avançados transforma a experiência de análise de produtos, permitindo pesquisas mais focadas e eficientes. A implementação modular garante fácil manutenção e expansão futura das funcionalidades.

**Status**: ✅ **Implementado e Funcional**  
**Versão**: 1.0  
**Data**: Dezembro 2024 