import { describe, expect, it } from 'vitest';
import { convertToCytoscapeElements } from '../services/graphConverter';
import { parseMermaidClassDiagram } from '../services/mermaidParser';

describe('graphConverter', () => {
  it('should convert parsed diagram into Cytoscape elements', () => {
    const code = `classDiagram
      class Order {
        +orderId: UUID
        +calculateTotal(): decimal
      }
      class Customer {
        +name: string
      }
      Customer "1" --> "*" Order : "places"
    `;

    const parseResult = parseMermaidClassDiagram(code);
    expect(parseResult.success).toBe(true);
    const diagram = parseResult.diagram!;

    const elements = convertToCytoscapeElements(diagram);

    // Should have 2 nodes and 1 edge
    const nodes = elements.filter((e) => e.group === 'nodes');
    const edges = elements.filter((e) => e.group === 'edges');

    expect(nodes.length).toBe(2);
    expect(edges.length).toBe(1);

    const orderNode = nodes.find((n) => n.data.id === 'Order');
    expect(orderNode).toBeDefined();
    expect(orderNode?.data.attributeCount).toBe(1);
    expect(orderNode?.data.methodCount).toBe(1);

    const relEdge = edges[0];
    expect(relEdge.data.source).toBe('Customer');
    expect(relEdge.data.target).toBe('Order');
    expect(relEdge.data.label).toBe('places');
    expect(relEdge.data.sourceCardinality).toBe('1');
    expect(relEdge.data.targetCardinality).toBe('*');
  });

  it('should filter elements based on visibleNodeIds set', () => {
    const code = `classDiagram
      ClassA --> ClassB
      ClassB --> ClassC
    `;

    const parseResult = parseMermaidClassDiagram(code);
    const diagram = parseResult.diagram!;

    // Make only ClassA and ClassB visible
    const visible = new Set(['ClassA', 'ClassB']);
    const elements = convertToCytoscapeElements(diagram, visible);

    const nodes = elements.filter((e) => e.group === 'nodes');
    const edges = elements.filter((e) => e.group === 'edges');

    expect(nodes.length).toBe(2);
    expect(nodes.some((n) => n.data.id === 'ClassC')).toBe(false);

    // Edge ClassB -> ClassC should not be in visible elements because ClassC is hidden
    expect(edges.length).toBe(1);
    expect(edges[0].data.source).toBe('ClassA');
    expect(edges[0].data.target).toBe('ClassB');
  });
});
