import React from 'react';
import {
  Code2,
  FileCode,
  Layers,
  Moon,
  Network,
  RefreshCw,
  Sun,
} from 'lucide-react';
import { SAMPLE_DIAGRAMS } from '../../utils/sampleDiagrams';
import './TopNavbar.css';

interface TopNavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenImport: () => void;
  onSelectSample: (sampleId: string) => void;
  activeSampleId?: string;
  hasRemoteDiagram?: boolean;
  remoteDiagramName?: string;
  isLoadingRemote?: boolean;
  onReloadRemote?: () => void;
  stats: {
    totalClasses: number;
    totalRelations: number;
    visibleClasses: number;
    visibleRelations: number;
    hiddenClasses: number;
  };
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  isDark,
  onToggleTheme,
  onOpenImport,
  onSelectSample,
  activeSampleId = 'ecommerce',
  hasRemoteDiagram = false,
  remoteDiagramName = 'Diagrama da Equipe',
  isLoadingRemote = false,
  onReloadRemote,
  stats,
}) => {
  return (
    <header className="top-navbar glass-panel">
      <div className="navbar-left">
        <div className="brand-container">
          <div className="brand-icon-wrapper">
            <Network className="brand-icon" size={22} />
          </div>
          <div>
            <h1 className="brand-title">Mermaid Explorer</h1>
            <p className="brand-subtitle">Class Graph Visualizer</p>
          </div>
        </div>

        <div className="navbar-stats">
          <div className="stat-pill" title="Total de classes no modelo">
            <Layers size={14} className="stat-icon" />
            <span className="stat-value">{stats.visibleClasses}</span>
            <span className="stat-total">/ {stats.totalClasses} classes</span>
          </div>
          <div className="stat-pill" title="Relacionamentos visíveis no grafo">
            <span className="stat-dot" />
            <span className="stat-value">{stats.visibleRelations}</span>
            <span className="stat-total">relações</span>
          </div>
          {stats.hiddenClasses > 0 && (
            <div className="stat-pill hidden-warning" title="Classes recolhidas ou ocultas">
              <span>{stats.hiddenClasses} ocultas</span>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {/* Sample selector */}
        <div className="sample-selector-wrapper">
          <FileCode size={15} className="sample-icon" />
          <select
            className="sample-select"
            value={activeSampleId}
            onChange={(e) => onSelectSample(e.target.value)}
            aria-label="Selecionar diagrama de exemplo"
          >
            <option value="" disabled>
              Diagramas disponíveis
            </option>
            {hasRemoteDiagram && (
              <option value="remote">
                🌐 {remoteDiagramName} (Remoto)
              </option>
            )}
            {activeSampleId === 'custom' && (
              <option value="custom" disabled>
                ✏️ Diagrama Editado Manualmente
              </option>
            )}
            {SAMPLE_DIAGRAMS.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.name} ({sample.classCount} classes)
              </option>
            ))}
          </select>

          {hasRemoteDiagram && onReloadRemote && (
            <button
              className="btn btn-secondary btn-icon sample-reload-btn"
              onClick={onReloadRemote}
              disabled={isLoadingRemote}
              title="Buscar versão mais recente do diagrama remoto"
              aria-label="Recarregar diagrama remoto"
              id="btn-reload-remote"
            >
              <RefreshCw size={15} className={isLoadingRemote ? 'spin-icon' : ''} />
            </button>
          )}
        </div>

        {/* Import button */}
        <button
          className="btn btn-primary"
          onClick={onOpenImport}
          title="Importar ou editar código Mermaid"
          id="btn-open-editor"
        >
          <Code2 size={16} />
          <span>Editor Mermaid</span>
        </button>

        {/* Theme toggle */}
        <button
          className="btn btn-secondary btn-icon"
          onClick={onToggleTheme}
          title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          aria-label="Alternar tema"
          id="btn-toggle-theme"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};
