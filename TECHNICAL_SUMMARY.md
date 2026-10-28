# Resumo Técnico — Mermaid Class Graph Explorer

Este documento descreve detalhadamente a arquitetura de software, tecnologias utilizadas, decisões de engenharia, modelo de dados e componentes do **Mermaid Class Graph Explorer**.

---

## 1. Visão Geral do Sistema

O **Mermaid Class Graph Explorer** é uma aplicação web interativa voltada para a exploração, navegação e análise de modelos orientados a objetos definidos em sintaxe Mermaid (`classDiagram`). A ferramenta resolve os problemas comuns de diagramas estáticos em sistemas de médio e grande porte (20 a 100+ classes), oferecendo:

- **Desacoplamento visual**: Separação entre a topologia de conexões no canvas (nós geométricos limpos com rótulos sem sobreposição) e a especificação detalhada de atributos/métodos (exibidos no painel de inspeção).
- **Múltiplos algoritmos de layout**: Suporte a simulação de forças físicas (`fCoSE`), árvores hierárquicas dirigidas (*top-down*), anéis concêntricos/radiais, círculos completos e grades ortogonais.
- **Gestão ativa de visibilidade**: Filtragem e expansão real de relacionamentos com preservação da integridade do modelo.

---

## 2. Stack Tecnológica e Bibliotecas

| Categoria | Tecnologia / Biblioteca | Versão | Justificativa / Papel no Projeto |
|---|---|---|---|
| **Core UI** | React | `^19.3.1` | Biblioteca declarativa de interfaces baseada em componentes funcionais e hooks. |
| **Linguagem** | TypeScript | `~7.0.2` | Tipagem estática rigorosa para todo o pipeline de AST, modelo de domínio e contratos de componentes. |
| **Build & Dev Server** | Vite | `^8.3.5` | Bundler ultrarrápido com Hot Module Replacement (HMR) e suporte a ES Modules nativos. |
| **Motor de Grafo** | Cytoscape.js | `^3.34.4` | Biblioteca de visualização e manipulação de grafos de alta performance com suporte a Canvas e aceleração gráfica. |
| **Layout Physics** | cytoscape-fcose | `^2.2.0` | Algoritmo *Fast Compound Spring Embedder* (fCoSE) para dispersão orgânica de nós por forças de repulsão e atração. |
| **Hierarquia & Expansão** | cytoscape-expand-collapse | `^4.1.1` | Suporte a expansão e recolhimento de subgrafos. |
| **Parser & Gramática** | Mermaid | `^12.2.0` | Ecossistema padrão de diagramas e validação sintática. |
| **Iconografia** | Lucide React | `^1.63.0` | Conjunto consistente e moderno de ícones vetoriais em SVG. |
| **Testes Automatizados** | Vitest | `^5.0.5` | Test runner moderno e veloz, integrado nativamente com o pipeline do Vite. |
| **Estilização** | Vanilla CSS + CSS Variables | N/A | Sistema de design proprietário com temas Claro e Escuro, glassmorphism e design tokens. |

---

## 3. Arquitetura de Software e Fluxo de Dados

A aplicação adota uma arquitetura modular em camadas, garantindo separação rígida de responsabilidades:

```
[ Código Mermaid (.mmd) ]
           │
           ▼
┌────────────────────────┐
│  mermaidParser.ts      │ ◄─── Validação, Regex, extração de AST (Classes, Membros, Relações, Notas)
└────────────────────────┘
           │
           ▼ (ParsedDiagram)
┌────────────────────────┐
│  graphConverter.ts     │ ◄─── Mapeamento de nós geométricos, graus de conexão, cores e arestas UML
└────────────────────────┘
           │
           ▼ (Cytoscape Elements)
┌────────────────────────┐
│  useGraph.ts (Hook)    │ ◄─── Estado reativo: visibilidade de nós, seleção, busca, layout ativo
└────────────────────────┘
           │
     ┌─────┴─────────────────────────┐
     ▼                               ▼
┌────────────────────────┐     ┌────────────────────────┐
│  GraphCanvas.tsx       │     │  ClassDetails.tsx      │
│  (Cytoscape Viewport)  │     │  (Painel de Inspeção)  │
└────────────────────────┘     └────────────────────────┘
```

### 3.1. Pipeline de Interpretação (`mermaidParser.ts`)
- **Headers & Metadados**: Detecta declarações de `classDiagram`, `classDiagram-v2`, `direction TB|BT|LR|RL` e `title`.
- **Declarações de Classes e Diretivas**:
  - Aceita variações de blocos: `class Nome:::estilo { ... }`, `Nome:::estilo { ... }`, `class Nome["Rótulo"] { ... }` e `Nome { ... }`.
  - Ignora e processa diretivas de estilização (`classDef`, `cssClass`, `style`).
- **Membros de Classe**:
  - Marcadores de visibilidade: `+` (public), `-` (private), `#` (protected), `~` (package).
  - Modificadores: `$` (estático), `*` (abstrato).
  - Assinaturas de métodos com parâmetros e tipos de retorno.
  - Atributos com suporte a tipos genéricos complexos (ex: `Map~String, Object~`, `List~String~`).
  - Constantes de enumeração sem modificadores de visibilidade (`DRAFT`, `APPROVAL`).
- **Relacionamentos UML**:
  - Herança: `<|--`, `--|>`
  - Realização: `<|..`, `..|>`
  - Composição: `*--`, `--*`
  - Agregação: `o--`, `--o`
  - Associação direta e bidirecional: `-->`, `<--`, `<-->`, `--`
  - Dependência: `..>`, `<..`, `..`
  - Cardinalidades de origem e destino (ex: `"1"` para `"0..*"`).
  - Rótulos textuais de relacionamento.
- **Notas de Modelo**:
  - Extração de notas associadas a entidades (`note for Entidade "texto"`).

### 3.2. Conversão e Semântica Visual (`graphConverter.ts`)
- **Nós Geométricos**:
  - Classes/Entidades padrão: Círculo (`ellipse`) com borda ciano/azul elétrico.
  - Classes Abstratas: Diamante (`diamond`) em violeta (`#8b5cf6`).
  - Interfaces: Triângulo (`triangle`) em verde esmeralda (`#10b981`).
  - Enumerações: Hexágono (`hexagon`) em dourado/âmbar (`#f59e0b`).
  - Serviços: Retângulo com cantos arredondados (`round-rectangle`) em ciano/teal (`#14b8a6`).
- **Dimensionamento Dinâmico por Conectividade**:
  - O diâmetro do nó é ponderado pelo grau de conexões (nós centrais/hubs como `Job`, `Application` e `AuditableEntity` possuem diâmetro de 54px; nós intermediários 48px; nós folha 42px).
- **Rótulos Externos com Pílula de Contraste**:
  - Posicionados logo abaixo da forma geométrica (`text-valign: bottom`, `text-margin-y: 7px`), com fundo semi-transparente arredondado para garantir legibilidade sobre qualquer fundo ou aresta.

### 3.3. Algoritmos de Layout (`graphLayout.ts`)
A aplicação oferece 5 estratégias de layout instantâneas:
1. **Força Físico (`force`)**: Baseado em `fCoSE` com alta repulsão de nós (`nodeRepulsion: 18000`) e comprimento ideal de arestas (`170px`), dispersando nós de forma orgânica sem colisões.
2. **Árvore Hierárquica (`hierarchy`)**: Baseado em `breadthfirst` dirigido de cima para baixo (*top-down*), ideal para visualizar árvores de herança UML.
3. **Radial Concêntrico (`radial`)**: Baseado em `concentric`, posicionando classes centrais no núcleo e entidades dependentes em anéis externos.
4. **Círculo (`circle`)**: Disposição em roda circular com conexões radiais para o centro.
5. **Grade (`grid`)**: Disposição geométrica ortogonal em linhas e colunas.

---

## 4. Gerenciamento de Estado e UX (`useGraph.ts` e Componentes)

### 4.1. Controle Inteligente de Câmera e Canvas
- **Preservação de Zoom**: Ao clicar em uma entidade, o nível de zoom atual do usuário é preservado (evitando aproximações bruscas indesejadas).
- **Desconto de Viewport Útil**: O cálculo de centralização desloca o foco horizontalmente para compensar o painel lateral direito de 340px, garantindo que o nó selecionado e seus vizinhos fiquem no centro da área visível livre.
- **Sensibilidade do Mouse**: `wheelSensitivity: 1.0` configurado para proporcionar rolagem de zoom rápida, fluida e natural.
- **Barra de Ferramentas Adaptativa**: A barra de zoom (`GraphControls`) monitora o estado de abertura do painel de detalhes e desloca-se automaticamente (`right: 372px`), mantendo-se sempre 100% visível e funcional.

### 4.2. Painel de Detalhes da Entidade
Ao selecionar qualquer nó:
- Exibe estereótipo e nome da classe.
- Lista completa de atributos tipados com ícones de visibilidade UML (`+`, `-`, `#`, `~`).
- Lista completa de métodos com assinaturas, parâmetros e tipos de retorno.
- Exibição de notas explicativas do modelo.
- Relações de entrada e saída interativas: clicar em qualquer classe relacionada faz a navegação imediata pela câmera do grafo.
- Ações de exploração: *Expandir Vizinhos*, *Recolher*, *Isolar* e *Ocultar*.

---

## 5. Estrutura de Diretórios

```
mermaidexplorer/
├── public/                     # Assets estáticos e favicons
├── src/
│   ├── components/             # Componentes de interface modulares
│   │   ├── ClassDetails/       # Painel de atributos, métodos e relações
│   │   ├── ClassSidebar/       # Barra lateral com busca, filtros e layout switcher
│   │   ├── GraphCanvas/        # Viewport Cytoscape.js e legenda gráfica
│   │   ├── GraphControls/      # Controles de zoom e layout responsivos
│   │   ├── MermaidEditor/      # Modal de edição, upload de .mmd e validação
│   │   └── TopNavbar/          # Cabeçalho com métricas, seletor de modelos e temas
│   ├── hooks/                  # Hooks customizados
│   │   └── useGraph.ts         # Gestão central de estado, nós e visibilidade
│   ├── services/               # Lógica de processamento de dados e AST
│   │   ├── mermaidParser.ts    # Parser sintático de classes Mermaid
│   │   └── graphConverter.ts   # Conversor de modelo abstrato para elementos Cytoscape
│   ├── types/                  # Definições de tipos e interfaces TypeScript
│   │   ├── graph.ts            # Tipos de nós, membros, relações e layouts
│   │   └── modules.d.ts        # Tipagem de plugins externos do Cytoscape
│   ├── utils/                  # Utilitários e configurações
│   │   ├── cytoscapeInit.ts    # Registro de extensões Cytoscape
│   │   ├── graphLayout.ts      # Estilos Cytoscape e configurações de layouts
│   │   └── sampleDiagrams.ts   # Diagramas de exemplo integrados (ATS, E-Commerce, Banking)
│   ├── styles/                 # Estilos globais e design tokens
│   │   └── index.css           # Tokens CSS, variáveis de tema e resets
│   ├── tests/                  # Testes automatizados com Vitest
│   │   ├── mermaidParser.test.ts  # Testes de gramática e extração sintática
│   │   └── graphConverter.test.ts # Testes de geração de grafo e visibilidade
│   ├── App.tsx                 # Componente orquestrador da aplicação
│   └── main.tsx                # Ponto de entrada React
├── index.html                  # HTML semântico com meta tags e fontes
├── package.json                # Dependências do projeto e scripts
├── tsconfig.json               # Configurações do compilador TypeScript
├── vite.config.ts              # Configuração do Vite
└── README.md                   # Documentação do projeto e instruções de uso
```

---

## 6. Qualidade, Testes e Performance

- **Testes Automatizados**: Suíte de testes com **Vitest** cobrindo gramática Mermaid, atributos tipados, genéricos, modificadores de visibilidade, relacionamentos direcionados, cardinalidades, extração de notas e conversão para elementos Cytoscape.
- **Performance**:
  - Uso de renderização em lote (`cy.batch()`) ao atualizar elementos e classes CSS.
  - Eliminação de re-renderizações desnecessárias da instância do Cytoscape.
  - Otimizado para diagramas com até 100+ classes e centenas de conexões.
