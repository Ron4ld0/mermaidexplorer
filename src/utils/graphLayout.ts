import type cytoscape from 'cytoscape';
import type { GraphLayoutType } from '../types/graph';

export interface ThemeColors {
  background: string;
  nodeBg: string;
  nodeText: string;
  nodeBorder: string;
  selectedBorder: string;
  highlightedBorder: string;
  labelBg: string;
  labelText: string;
  edgeColor: string;
}

export const DARK_THEME_COLORS: ThemeColors = {
  background: '#090d16',
  nodeBg: '#0f172a',
  nodeText: '#f8fafc',
  nodeBorder: '#38bdf8',
  selectedBorder: '#ffffff',
  highlightedBorder: '#fbbf24',
  labelBg: 'rgba(9, 13, 22, 0.88)',
  labelText: '#cbd5e1',
  edgeColor: '#475569',
};

export const LIGHT_THEME_COLORS: ThemeColors = {
  background: '#f8fafc',
  nodeBg: '#ffffff',
  nodeText: '#0f172a',
  nodeBorder: '#0284c7',
  selectedBorder: '#0f172a',
  highlightedBorder: '#d97706',
  labelBg: 'rgba(255, 255, 255, 0.92)',
  labelText: '#334155',
  edgeColor: '#94a3b8',
};

/**
 * Returns Cytoscape stylesheet designed for a clean, intuitive knowledge-graph aesthetic
 * (matching modern interactive graph explorers).
 */
export function getCytoscapeStylesheet(isDark = true): cytoscape.StylesheetStyle[] {
  const c = isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;

  return [
    // Base node style (Geometric, clean, uncrowded)
    {
      selector: 'node.class-node',
      style: {
        width: 'data(nodeSize)',
        height: 'data(nodeSize)',
        'background-color': '#0284c7',
        'border-width': 2.5,
        'border-color': '#38bdf8',
        'border-opacity': 0.95,
        label: 'data(label)',
        color: c.nodeText,
        'font-family': 'Inter, -apple-system, system-ui, sans-serif',
        'font-size': '11.5px',
        'font-weight': 600,
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 7,
        'text-wrap': 'none',
        'text-background-color': c.labelBg,
        'text-background-opacity': 0.85,
        'text-background-padding': '3px',
        'text-background-shape': 'roundrectangle',
        'transition-property': 'background-color, border-color, border-width, opacity, width, height',
        'transition-duration': 250,
      },
    },

    // Category / Stereotype Shapes & Colors (Matching Knowledge Graph Explorer)
    // 1. Entities / Standard Classes -> Smooth Circle (Sky Blue)
    {
      selector: 'node.node-entity',
      style: {
        shape: 'ellipse',
        'background-color': isDark ? '#0284c7' : '#0ea5e9',
        'border-color': isDark ? '#38bdf8' : '#0284c7',
      },
    },

    // 2. Abstract Classes -> Diamond (Vibrant Purple)
    {
      selector: 'node.node-abstract',
      style: {
        shape: 'diamond',
        'background-color': isDark ? '#7c3aed' : '#8b5cf6',
        'border-color': isDark ? '#c084fc' : '#6d28d9',
      },
    },

    // 3. Interfaces -> Triangle (Emerald Green)
    {
      selector: 'node.node-interface',
      style: {
        shape: 'triangle',
        'background-color': isDark ? '#059669' : '#10b981',
        'border-color': isDark ? '#34d399' : '#047857',
      },
    },

    // 4. Enumerations -> Hexagon (Warm Gold / Amber)
    {
      selector: 'node.node-enum',
      style: {
        shape: 'hexagon',
        'background-color': isDark ? '#d97706' : '#f59e0b',
        'border-color': isDark ? '#fbbf24' : '#b45309',
      },
    },

    // 5. Services -> Rounded Rectangle / Squircle (Cyan / Teal)
    {
      selector: 'node.node-service',
      style: {
        shape: 'round-rectangle',
        'corner-radius': '8px',
        'background-color': isDark ? '#0d9488' : '#14b8a6',
        'border-color': isDark ? '#2dd4bf' : '#0f766e',
      },
    },

    // Selected state: Glowing halo ring
    {
      selector: 'node:selected, node.selected',
      style: {
        'border-color': '#ffffff',
        'border-width': 4.5,
        'border-opacity': 1,
        'z-index': 100,
        width: 58,
        height: 58,
      },
    },

    // Highlighted direct neighbors
    {
      selector: 'node.highlighted-neighbor',
      style: {
        'border-color': '#fbbf24',
        'border-width': 3.5,
        'border-opacity': 1,
        'z-index': 90,
      },
    },

    // Dimmed nodes when another node is focused
    {
      selector: 'node.dimmed',
      style: {
        opacity: 0.18,
      },
    },

    // Base edge style
    {
      selector: 'edge.class-edge',
      style: {
        width: 2,
        'curve-style': 'bezier',
        'line-color': c.edgeColor,
        'target-arrow-color': c.edgeColor,
        'source-arrow-color': c.edgeColor,
        'font-family': 'Inter, system-ui, sans-serif',
        'font-size': '10px',
        'font-weight': 500,
        color: c.labelText,
        'text-rotation': 'autorotate',
        'text-margin-y': -8,
        'text-background-color': c.labelBg,
        'text-background-opacity': 0.85,
        'text-background-padding': '2px',
        'text-background-shape': 'roundrectangle',
        'arrow-scale': 1.25,
        'transition-property': 'line-color, width, opacity',
        'transition-duration': 250,
      },
    },

    // Edge Labels & Cardinalities
    {
      selector: 'edge[label]',
      style: {
        label: 'data(label)',
      },
    },
    {
      selector: 'edge[sourceCardinality]',
      style: {
        'source-label': 'data(sourceCardinality)',
        'source-text-offset': 24,
        'source-text-margin-y': -6,
      },
    },
    {
      selector: 'edge[targetCardinality]',
      style: {
        'target-label': 'data(targetCardinality)',
        'target-text-offset': 24,
        'target-text-margin-y': -6,
      },
    },

    // Specific Relationship Types
    {
      selector: 'edge.edge-inheritance',
      style: {
        'line-color': '#38bdf8',
        'target-arrow-color': '#38bdf8',
        'target-arrow-shape': 'triangle',
        'target-arrow-fill': 'hollow',
        width: 2.5,
      },
    },
    {
      selector: 'edge.edge-realization',
      style: {
        'line-color': '#818cf8',
        'line-style': 'dashed',
        'line-dash-pattern': [6, 4],
        'target-arrow-color': '#818cf8',
        'target-arrow-shape': 'triangle',
        'target-arrow-fill': 'hollow',
        width: 2,
      },
    },
    {
      selector: 'edge.edge-composition',
      style: {
        'line-color': '#f43f5e',
        'source-arrow-color': '#f43f5e',
        'source-arrow-shape': 'diamond',
        'source-arrow-fill': 'filled',
        width: 2.5,
      },
    },
    {
      selector: 'edge.edge-aggregation',
      style: {
        'line-color': '#fb923c',
        'source-arrow-color': '#fb923c',
        'source-arrow-shape': 'diamond',
        'source-arrow-fill': 'hollow',
        width: 2,
      },
    },
    {
      selector: 'edge.edge-association',
      style: {
        'line-color': isDark ? '#94a3b8' : '#64748b',
        'target-arrow-color': isDark ? '#94a3b8' : '#64748b',
        'target-arrow-shape': 'vee',
        width: 2,
      },
    },
    {
      selector: 'edge.edge-dependency',
      style: {
        'line-color': '#c084fc',
        'line-style': 'dashed',
        'line-dash-pattern': [4, 4],
        'target-arrow-color': '#c084fc',
        'target-arrow-shape': 'vee',
        width: 1.5,
      },
    },
    {
      selector: 'edge.edge-bidirectional',
      style: {
        'line-color': '#10b981',
        'source-arrow-color': '#10b981',
        'target-arrow-color': '#10b981',
        'source-arrow-shape': 'vee',
        'target-arrow-shape': 'vee',
        width: 2,
      },
    },

    // Highlighted and Dimmed Edges
    {
      selector: 'edge.highlighted-edge',
      style: {
        width: 4,
        'z-index': 95,
        opacity: 1,
      },
    },
    {
      selector: 'edge.dimmed',
      style: {
        opacity: 0.12,
      },
    },
  ];
}

/**
 * Returns layout options for any requested layout type
 * (Force, Hierarchy/Tree, Radial/Concentric, Circle, Grid)
 */
export function getLayoutConfig(
  layoutType: GraphLayoutType = 'force',
  animate = true
): cytoscape.LayoutOptions {
  switch (layoutType) {
    case 'hierarchy':
      return {
        name: 'breadthfirst',
        directed: true,
        spacingFactor: 1.6,
        padding: 70,
        animate,
        animationDuration: 550,
        avoidOverlap: true,
      } as cytoscape.LayoutOptions;

    case 'radial':
      return {
        name: 'concentric',
        concentric: (node: cytoscape.NodeSingular) => {
          return node.degree();
        },
        levelWidth: () => 2,
        spacingFactor: 1.6,
        padding: 70,
        animate,
        animationDuration: 550,
        avoidOverlap: true,
      } as cytoscape.LayoutOptions;

    case 'circle':
      return {
        name: 'circle',
        spacingFactor: 1.25,
        padding: 80,
        animate,
        animationDuration: 550,
        avoidOverlap: true,
      } as cytoscape.LayoutOptions;

    case 'grid':
      return {
        name: 'grid',
        spacingFactor: 1.4,
        padding: 70,
        animate,
        animationDuration: 500,
        avoidOverlap: true,
      } as cytoscape.LayoutOptions;

    case 'force':
    default:
      return {
        name: 'fcose',
        quality: 'proof',
        randomize: false,
        animate,
        animationDuration: 650,
        fit: true,
        padding: 70,
        nodeRepulsion: 18000,
        idealEdgeLength: 170,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.2,
        numIter: 3000,
        tile: true,
      } as cytoscape.LayoutOptions;
  }
}

/**
 * Returns fcose layout configuration suited for class diagrams
 */
export function getFcoseLayoutConfig(animate = true): cytoscape.LayoutOptions {
  return getLayoutConfig('force', animate);
}

/**
 * Returns cose layout configuration (built-in fallback)
 */
export function getCoseLayoutConfig(animate = true): cytoscape.LayoutOptions {
  return {
    name: 'cose',
    animate,
    animationDuration: 500,
    fit: true,
    padding: 70,
    componentSpacing: 120,
    nodeOverlap: 20,
    idealEdgeLength: 160,
    edgeElasticity: 100,
    nodeRepulsion: 600000,
  } as cytoscape.LayoutOptions;
}
