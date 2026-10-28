import React from 'react';
import type { Core } from 'cytoscape';
import {
  Eye,
  Maximize2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { GraphLayoutType } from '../../types/graph';
import { getLayoutConfig, getCoseLayoutConfig } from '../../utils/graphLayout';
import './GraphControls.css';

interface GraphControlsProps {
  cy: Core | null;
  hiddenCount: number;
  activeLayout: GraphLayoutType;
  isShifted?: boolean;
  onShowAll: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  cy,
  hiddenCount,
  activeLayout,
  isShifted = false,
  onShowAll,
}) => {
  const handleZoomIn = () => {
    if (!cy) return;
    cy.animate(
      {
        zoom: cy.zoom() * 1.3,
      },
      { duration: 200 }
    );
  };

  const handleZoomOut = () => {
    if (!cy) return;
    cy.animate(
      {
        zoom: cy.zoom() / 1.3,
      },
      { duration: 200 }
    );
  };

  const handleFit = () => {
    if (!cy) return;
    cy.animate(
      {
        fit: {
          eles: cy.elements(':visible'),
          padding: 60,
        },
      },
      { duration: 350 }
    );
  };

  const handleReorganize = () => {
    if (!cy) return;
    try {
      const layout = cy.layout(getLayoutConfig(activeLayout, true));
      layout.run();
    } catch {
      const fallback = cy.layout(getCoseLayoutConfig(true));
      fallback.run();
    }
  };

  return (
    <div
      className={`graph-controls-toolbar glass-panel ${isShifted ? 'shifted' : ''}`}
      id="graph-controls-toolbar"
    >
      <button
        className="ctrl-btn"
        onClick={handleZoomIn}
        title="Aproximar zoom (+)"
        aria-label="Aproximar zoom"
        id="btn-zoom-in"
      >
        <ZoomIn size={16} />
      </button>

      <button
        className="ctrl-btn"
        onClick={handleZoomOut}
        title="Afastar zoom (-)"
        aria-label="Afastar zoom"
        id="btn-zoom-out"
      >
        <ZoomOut size={16} />
      </button>

      <div className="ctrl-separator" />

      <button
        className="ctrl-btn"
        onClick={handleFit}
        title="Ajustar grafo à tela"
        aria-label="Ajustar grafo à tela"
        id="btn-fit-screen"
      >
        <Maximize2 size={16} />
      </button>

      <button
        className="ctrl-btn"
        onClick={handleReorganize}
        title={`Reorganizar layout (${activeLayout})`}
        aria-label="Reorganizar layout"
        id="btn-reorganize"
      >
        <RefreshCw size={16} />
      </button>

      {hiddenCount > 0 && (
        <>
          <div className="ctrl-separator" />
          <button
            className="ctrl-btn highlight-action"
            onClick={onShowAll}
            title={`Restaurar ${hiddenCount} classes ocultas`}
            id="btn-show-all"
          >
            <Eye size={15} />
            <span className="ctrl-badge">{hiddenCount}</span>
          </button>
        </>
      )}
    </div>
  );
};
