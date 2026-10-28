# Mermaid Class Graph Explorer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg?logo=vite&logoColor=white)](https://vite.dev/)
[![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.34-ea580c.svg)](https://js.cytoscape.org/)

Uma aplicação web interativa desenvolvida com **React 19**, **TypeScript**, **Vite** e **Cytoscape.js** para transformar diagramas de classe em sintaxe [Mermaid](https://mermaid.js.org/) em uma experiência visual interativa no estilo **Knowledge Graph** e **Circular Layout**.

Projetada com foco em arquiteturas de software reais e diagramas de médio a grande porte (**20 a 100+ classes**), oferecendo navegação fluida, múltiplos motores de layout matemático, inspeção detalhada de membros e controle dinâmico de exploração.

---

## ✨ Destaques e Funcionalidades

### 1. Visualização Estilo Knowledge Graph
- **Nós Geométricos Semânticos**: Nós circulares e poligonais com ícones e cores dedicadas por tipo de estereótipo:
  - 🔵 **Entity / Regular Class**: Círculo com tom azul celeste/índigo.
  - 🔷 **Abstract Class (`«abstract»`)**: Diamante em tom âmbar/ouro.
  - 🔺 **Interface (`«interface»`)**: Triângulo equilátero em esmeralda/turquesa.
  - ⬡ **Enumeration (`«enum»`)**: Hexágono em violeta/púrpura.
  - 🟩 **Service (`«service»`)**: Retângulo arredondado (squircle) em carmesim/rosa.
- **Dimensionamento por Importância (Degree Centrality)**: O tamanho de cada nó escala dinamicamente com base no número de conexões (grau), permitindo identificar visualmente os nós centrais da arquitetura.
- **Rótulos Livres de Sobreposição**: Nomes das classes exibidos abaixo do nó com fundo semitransparente estilizado, eliminando truncamentos e colisões de texto.
- **Arestas Semânticas UML**:
  - **Herança (`<|--`)**: Linha sólida com triângulo vazado (`──▷`).
  - **Realização (`<|..`)**: Linha tracejada com triângulo vazado (`╌╌▷`).
  - **Composição (`*--`)**: Linha sólida com diamante preenchido (`◆──`).
  - **Agregação (`o--`)**: Linha sólida com diamante vazado (`◇──`).
  - **Associação Direcionada (`-->`)**: Linha sólida com seta (`──>`).
  - **Dependência (`..>`)**: Linha tracejada com seta (`╌╌>`).
  - **Bidirecional (`<-->`)**: Linha sólida com setas duplas (`<──>`).
  - Cardinalidades de origem/destino (`"1" *-- "0..*"`) e rótulos de relacionamento.

---

### 2. Seletor com 5 Mecanismos de Layout
Alterne instantaneamente entre diferentes algoritmos de distribuição espacial:
- 🌐 **Force-Directed (fCoSE)**: Simulação de física molecular com forças repulsivas calibradas (`nodeRepulsion: 18000`), ideal para grafos densos e orgânicos.
- 🌲 **Hierárquico (Breadthfirst)**: Ordenação em níveis top-down, destacando hierarquias de herança e árvores de composição.
- 🪐 **Radial (Concentric)**: Classes de maior centralidade no núcleo, com classes periféricas distribuídas em órbitas concêntricas.
- ⭕ **Circular**: Distribuição perimetral equidistante em círculo perfeito, facilitando a análise de densidade de interconexões.
- ▦ **Grade (Grid)**: Organização matricial alinhada em linhas e colunas por ordem alfabética.

---

### 3. Navegação, Zoom e Foco Inteligentes
- **Zoom Fluido pelo Scroll**: Calibração natural de sensibilidade do mouse wheel (`wheelSensitivity: 1.0`).
- **Centralização com Compensação Lateral**: Ao clicar em uma classe, a câmera anima suavemente para o centro da área visível (à esquerda do painel de detalhes), mantendo o nó e seus vizinhos perfeitamente visíveis sem zoom excessivo.
- **Controles Adaptativos**: Os botões de zoom (+ / - / fit / reset) reposicionam-se automaticamente quando o painel de detalhes é aberto, garantindo que nunca fiquem encobertos.
- **Foco e Destaque de Vizinhos**: Ao selecionar um nó, conexões e nós vizinhos são iluminados, enquanto elementos não correlacionados são suavemente atenuados.

---

### 4. Painel de Inspeção & Navegação Relacional
- Exibição de atributos com modificadores de visibilidade UML:
  - `+` Público, `-` Privado, `#` Protegido, `~` Pacote.
- Exibição de métodos completos com parâmetros e tipos de retorno.
- Exibição de notas contextuais do Mermaid (`note for Class`).
- **Navegação Hiperlinkada**: Listagem de todas as relações de entrada e saída. Clicar em qualquer relação move o foco do grafo imediatamente para a classe correspondente.

---

### 5. Editor Mermaid & Modelos Integrados
- **Editor com Validação em Tempo Real**: Alertas de erros sintáticos e contador dinâmico de classes e arestas.
- **Importação de Arquivos**: Carregue arquivos locais `.mmd` ou `.txt`.
- **Exemplos Prontos para Teste**:
  - 🏢 **ATS Recruitment Platform (25 classes, 30+ relações)**: Sistema enterprise completo com vagas, etapas kanban, candidaturas, entrevistas, avaliações, automações e auditoria.
  - 🛒 **E-Commerce Enterprise (15 classes)**: Catálogo, pedidos, pagamentos, estoque e rastreamento.
  - 🏦 **Core Banking & Fintech (11 classes)**: Contas correntes, cartões, processamento de transações e prevenção a fraudes.
  - ⚡ **Quickstart Model (5 classes)**: Modelo compacto para experimentação ágil.

---

### 6. Design Moderno, Temas e Legenda
- **Dark Mode (padrão)** com paleta HSL escura, tons de ardósia e acabamento em glassmorphism.
- **Light Mode** de alto contraste e legibilidade.
- **Legenda UML Flutuante**: Guia visual recolhível com as convenções de nós e setas.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Finalidade |
|---|---|
| **React 19** | Biblioteca de componentes e estado reativo |
| **TypeScript** | Tipagem estática rigorosa para nós, membros e arestas |
| **Vite 8** | Bundler e servidor de desenvolvimento ultra-otimizado |
| **Cytoscape.js** | Motor de renderização em canvas e manipulação de grafos |
| **cytoscape-fcose** | Algoritmo de física force-directed de alta performance |
| **Mermaid 12** | Ecossistema de especificação de diagramas |
| **Lucide React** | Conjunto de ícones consistentes e modernos |
| **Vitest** | Suíte de testes unitários automatizados |
| **Vanilla CSS** | Sistema de design modular com CSS Custom Properties |

---

## 📁 Estrutura do Repositório

```
mermaidexplorer/
├── public/                 # Favicon e assets públicos
├── src/
│   ├── components/
│   │   ├── ClassDetails/   # Drawer lateral de inspeção e navegação entre nós
│   │   ├── ClassSidebar/   # Painel lateral com busca, filtros e layout switcher
│   │   ├── GraphCanvas/    # Viewport Cytoscape.js com suporte a 5 layouts
│   │   ├── GraphControls/  # Botões flutuantes de zoom com deslocamento adaptativo
│   │   ├── MermaidEditor/  # Modal com editor de texto, upload .mmd e validação
│   │   └── TopNavbar/      # Cabeçalho com estatísticas, seletor de modelos e temas
│   ├── hooks/
│   │   └── useGraph.ts     # Hook orquestrador de estado, visibilidade e filtros
│   ├── services/
│   │   ├── mermaidParser.ts  # Parser léxico e sintático de classDiagram Mermaid
│   │   └── graphConverter.ts # Conversor do modelo semântico para nós/arestas Cytoscape
│   ├── types/
│   │   ├── graph.ts        # Contratos TypeScript de nós, arestas, membros e layouts
│   │   └── modules.d.ts    # Declarações de tipos para extensões Cytoscape
│   ├── utils/
│   │   ├── cytoscapeInit.ts # Registro e inicialização de plugins Cytoscape
│   │   ├── graphLayout.ts   # Configuração dos 5 motores de layout e estilos de renderização
│   │   └── sampleDiagrams.ts# Modelos de exemplo (ATS 25 classes, E-Commerce, Banking)
│   ├── styles/
│   │   └── index.css       # Design tokens, variáveis CSS e reset global
│   ├── tests/
│   │   ├── mermaidParser.test.ts  # Testes unitários do parser Mermaid
│   │   └── graphConverter.test.ts # Testes unitários de conversão para Cytoscape
│   ├── App.tsx             # Componente raiz da aplicação
│   └── main.tsx            # Ponto de entrada React
├── TECHNICAL_SUMMARY.md    # Documento detalhado de arquitetura e decisões de engenharia
├── package.json            # Dependências e scripts de execução
├── tsconfig.json           # Configurações TypeScript
└── vite.config.ts          # Configurações do Vite e Vitest
```

Para uma análise aprofundada da arquitetura de software, estrutura do parser e decisões de design, consulte o arquivo [TECHNICAL_SUMMARY.md](./TECHNICAL_SUMMARY.md).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** v18+ (recomendado v20+)
- **npm** v9+

### Passos de Instalação e Execução

1. Clone o repositório:
```bash
git clone https://github.com/Ron4ld0/mermaidexplorer.git
cd mermaidexplorer
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse no seu navegador: **`http://localhost:5173/`**

4. Executar os testes unitários:
```bash
npm test
```

5. Gerar a build de produção otimizada:
```bash
npm run build
```

---

## 🧪 Testes Automatizados

A suíte de testes com **Vitest** cobre:
- **Parser Mermaid**:
  - Extração de nomes, estereótipos (`classDef`, `:::style`) e anotações.
  - Extração de membros com modificadores de visibilidade (`+`, `-`, `#`, `~`), tipos genéricos complexos (`Map~K, V~`) e métodos.
  - Suporte completo a operadores de relacionamento UML (`<|--`, `*--`, `o--`, `-->`, `..>`, `<|..`, `<-->`).
  - Extração precisa de cardinalidades de origem e destino (`"1" *-- "0..*"`).
  - Sanitização de rótulos com aspas e notas contextuais.
- **Conversor de Grafo**:
  - Geração de nós geométricos semânticos com dimensionamento por grau de conexões.
  - Formatação e estilização de arestas com flechas e setas UML.
  - Integridade dos filtros de visibilidade.

Execute os testes com:
```bash
npm test
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE).
