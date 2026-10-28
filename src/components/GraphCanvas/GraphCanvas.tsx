import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { type Core, type EventObject } from 'cytoscape';
import { convertToCytoscapeElements } from '../../services/graphConverter';
import type { GraphLayoutType, ParsedDiagram } from '../../types/graph';
import { initCytoscapeExtensions } from '../../utils/cytoscapeInit';
import { getCytoscapeStylesheet, getLayoutConfig, getCoseLayoutConfig } from '../../utils/graphLayout';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import './GraphCanvas.css';

interface GraphCanvasProps {
  diagram: ParsedDiagram | null;
  visibleNodeIds: Set<string>;
  selectedClassId: string | null;
  isDark: boolean;
  activeLayout?: GraphLayoutType;
  onSelectClass: (classId: string | null) => void;
  onGraphReady?: (cy: Core) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  diagram,
  visibleNodeIds,
  selectedClassId,
  isDark,
  activeLayout = 'force',
  onSelectClass,
  onGraphReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [legendOpen, setLegendOpen] = useState(true);

  // Initialize Cytoscape extensions once
  useEffect(() => {
    initCytoscapeExtensions();
  }, []);

  // Initialize Cytoscape core instance
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: getCytoscapeStylesheet(isDark),
      elements: [],
      wheelSensitivity: 1.0,
      minZoom: 0.15,
      maxZoom: 3.5,
      boxSelectionEnabled: false,
    });

    cyRef.current = cy;

    // Node click event
    cy.on('tap', 'node', (evt: EventObject) => {
      const node = evt.target;
      const classId = node.id();
      onSelectClass(classId);
    });

    // Background click event (clears selection)
    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        onSelectClass(null);
      }
    });

    if (onGraphReady) {
      onGraphReady(cy);
    }

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []); // Run once on mount

  // Update stylesheet when theme changes
  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.style(getCytoscapeStylesheet(isDark));
  }, [isDark]);

  // Update elements and rerun layout when diagram or visibleNodeIds changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !diagram) return;

    const elements = convertToCytoscapeElements(diagram, visibleNodeIds);

    cy.batch(() => {
      cy.elements().remove();
      cy.add(elements);
    });

    // Run active layout with smooth animation
    try {
      const layout = cy.layout(getLayoutConfig(activeLayout, true));
      layout.run();
    } catch (err) {
      console.warn('Layout execution error, fallback to cose:', err);
      const fallbackLayout = cy.layout(getCoseLayoutConfig(true));
      fallbackLayout.run();
    }
  }, [diagram, visibleNodeIds]);

  // Re-run layout when activeLayout changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !diagram) return;

    try {
      const layout = cy.layout(getLayoutConfig(activeLayout, true));
      layout.run();
    } catch (err) {
      console.warn('Layout switch fallback to cose:', err);
      const fallbackLayout = cy.layout(getCoseLayoutConfig(true));
      fallbackLayout.run();
    }
  }, [activeLayout]);

  // Update visual selection and neighbor highlights
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      // Remove previous highlights
      cy.elements().removeClass('selected highlighted-neighbor highlighted-edge dimmed');

      if (!selectedClassId) {
        return;
      }

      const selectedNode = cy.getElementById(selectedClassId);
      if (!selectedNode || selectedNode.length === 0) return;

      // Find neighborhood
      const neighborhood = selectedNode.neighborhood();
      const connectedEdges = selectedNode.connectedEdges();
      const connectedNodes = neighborhood.nodes();

      // Apply classes
      cy.elements().addClass('dimmed');

      selectedNode.removeClass('dimmed').addClass('selected');
      connectedNodes.removeClass('dimmed').addClass('highlighted-neighbor');
      connectedEdges.removeClass('dimmed').addClass('highlighted-edge');

      // Smoothly pan so the selected node is centered in the visible area (offsetting for the right details drawer)
      const nodePos = selectedNode.position();
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = containerRef.current?.clientHeight || 600;
      const currentZoom = cy.zoom();

      // Shift target X to the left by 170px (half of 340px drawer) so node is centered in visible canvas
      const targetX = (containerWidth - 340) / 2 - nodePos.x * currentZoom;
      const targetY = containerHeight / 2 - nodePos.y * currentZoom;

      cy.animate(
        {
          pan: { x: targetX, y: targetY },
        },
        { duration: 350 }
      );
    });
  }, [selectedClassId]);

  return (
    <div className="graph-canvas-container" id="graph-canvas-wrapper">
      <div ref={containerRef} className="cytoscape-viewport" id="cytoscape-container" />

      {/* Floating UML & Entity Legend */}
      <div className={`uml-legend glass-panel ${legendOpen ? 'open' : 'collapsed'}`}>
        <div className="legend-header" onClick={() => setLegendOpen(!legendOpen)}>
          <div className="legend-title">
            <Info size={14} className="legend-info-icon" />
            <span>Legenda do Grafo</span>
          </div>
          <button className="legend-toggle-btn" aria-label="Alternar legenda">
            {legendOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {legendOpen && (
          <div className="legend-items">
            {/* Entity Types */}
            <div className="legend-subheading">Tipos de Entidade</div>
            <div className="legend-item">
              <span className="legend-dot dot-entity" />
              <span className="legend-label">Classe / Entidade</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-abstract" />
              <span className="legend-label">Classe Abstrata</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-interface" />
              <span className="legend-label">Interface</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-enum" />
              <span className="legend-label">Enumeração</span>
            </div>

            {/* UML Relations */}
            <div className="legend-subheading" style={{ marginTop: 6 }}>
              Relacionamentos
            </div>
            <div className="legend-item">
              <span className="legend-symbol sym-inheritance">──▷</span>
              <span className="legend-label">Herança</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol sym-realization">╌╌▷</span>
              <span className="legend-label">Realização</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol sym-composition">◆──</span>
              <span className="legend-label">Composição</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol sym-aggregation">◇──</span>
              <span className="legend-label">Agregação</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol sym-association">──&gt;</span>
              <span className="legend-label">Associação</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol sym-dependency">╌╌&gt;</span>
              <span className="legend-label">Dependência</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
