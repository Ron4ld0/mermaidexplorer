import type cytoscape from 'cytoscape';
import type { ClassNodeData, ClassRelationData, ParsedDiagram } from '../types/graph';

export interface CytoscapeNodeData {
  id: string;
  label: string;
  glyph: string;
  category: 'abstract' | 'interface' | 'enum' | 'service' | 'entity';
  stereotype?: string;
  degree: number;
  nodeSize: number;
  attributeCount: number;
  methodCount: number;
  totalMembers: number;
  classData: ClassNodeData;
  isInterface: boolean;
  isAbstract: boolean;
  isEnum: boolean;
  isService: boolean;
}

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  relationType: string;
  label: string;
  sourceCardinality: string;
  targetCardinality: string;
  relationData: ClassRelationData;
}

/**
 * Returns category and glyph for a class
 */
function getClassCategory(cls: ClassNodeData): {
  category: 'abstract' | 'interface' | 'enum' | 'service' | 'entity';
  glyph: string;
} {
  const st = (cls.stereotype || '').toLowerCase();
  if (st.includes('abstract')) return { category: 'abstract', glyph: 'A' };
  if (st.includes('interface')) return { category: 'interface', glyph: 'I' };
  if (st.includes('enum')) return { category: 'enum', glyph: 'E' };
  if (st.includes('service')) return { category: 'service', glyph: 'S' };
  return { category: 'entity', glyph: 'C' };
}

/**
 * Converts parsed Mermaid diagram into clean, modern Cytoscape graph elements
 * similar to Knowledge Graph Explorer (Image 2) and Circular Graph (Image 3).
 */
export function convertToCytoscapeElements(
  diagram: ParsedDiagram,
  visibleNodeIds?: Set<string>
): cytoscape.ElementDefinition[] {
  const elements: cytoscape.ElementDefinition[] = [];
  const classes = Object.values(diagram.classes);

  // Filter visible nodes if set is provided
  const visibleClasses = visibleNodeIds
    ? classes.filter((c) => visibleNodeIds.has(c.id))
    : classes;

  const visibleClassIds = new Set(visibleClasses.map((c) => c.id));

  // Compute node degrees for dynamic sizing
  const degreeMap = new Map<string, number>();
  for (const rel of diagram.relations) {
    if (visibleClassIds.has(rel.source) && visibleClassIds.has(rel.target)) {
      degreeMap.set(rel.source, (degreeMap.get(rel.source) || 0) + 1);
      degreeMap.set(rel.target, (degreeMap.get(rel.target) || 0) + 1);
    }
  }

  // Create Nodes
  for (const cls of visibleClasses) {
    const { category, glyph } = getClassCategory(cls);
    const degree = degreeMap.get(cls.id) || 0;

    // Node sizing based on degree: hubs (more connected) are slightly larger
    let nodeSize = 42;
    if (degree >= 5) nodeSize = 54;
    else if (degree >= 3) nodeSize = 48;

    const nodeClasses = ['class-node', `node-${category}`];

    const nodeData: CytoscapeNodeData = {
      id: cls.id,
      label: cls.label || cls.id,
      glyph,
      category,
      stereotype: cls.stereotype,
      degree,
      nodeSize,
      attributeCount: cls.attributes.length,
      methodCount: cls.methods.length,
      totalMembers: cls.attributes.length + cls.methods.length,
      classData: cls,
      isInterface: category === 'interface',
      isAbstract: category === 'abstract',
      isEnum: category === 'enum',
      isService: category === 'service',
    };

    elements.push({
      group: 'nodes',
      data: nodeData,
      classes: nodeClasses.join(' '),
    });
  }

  // Create Edges (only if both source and target are visible)
  for (const rel of diagram.relations) {
    if (visibleClassIds.has(rel.source) && visibleClassIds.has(rel.target)) {
      const edgeClasses = ['class-edge', `edge-${rel.type}`];

      const edgeData: CytoscapeEdgeData = {
        id: rel.id,
        source: rel.source,
        target: rel.target,
        relationType: rel.type,
        label: rel.label || '',
        sourceCardinality: rel.sourceCardinality || '',
        targetCardinality: rel.targetCardinality || '',
        relationData: rel,
      };

      elements.push({
        group: 'edges',
        data: edgeData,
        classes: edgeClasses.join(' '),
      });
    }
  }

  return elements;
}
