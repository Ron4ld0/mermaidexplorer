import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Compass,
  Eye,
  EyeOff,
  GitFork,
  LayoutGrid,
  Network,
  Search,
  X,
} from 'lucide-react';
import type { ClassNodeData, GraphLayoutType } from '../../types/graph';
import './ClassSidebar.css';

interface ClassSidebarProps {
  classes: ClassNodeData[];
  selectedClassId: string | null;
  visibleNodeIds: Set<string>;
  searchQuery: string;
  activeLayout: GraphLayoutType;
  onLayoutChange: (layout: GraphLayoutType) => void;
  onSearchChange: (query: string) => void;
  onSelectClass: (classId: string) => void;
  onToggleVisibility: (classId: string) => void;
}

export const ClassSidebar: React.FC<ClassSidebarProps> = ({
  classes,
  selectedClassId,
  visibleNodeIds,
  searchQuery,
  activeLayout,
  onLayoutChange,
  onSearchChange,
  onSelectClass,
  onToggleVisibility,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [stereotypeFilter, setStereotypeFilter] = useState<string>('all');

  // Filter classes by stereotype
  const filtered = classes.filter((cls) => {
    if (stereotypeFilter === 'all') return true;
    const st = (cls.stereotype || '').toLowerCase();
    if (stereotypeFilter === 'standard') return !cls.stereotype;
    return st.includes(stereotypeFilter);
  });

  if (collapsed) {
    return (
      <aside className="class-sidebar collapsed glass-panel">
        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(false)}
          title="Expandir barra lateral"
          aria-label="Expandir barra lateral"
        >
          <ChevronRight size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="class-sidebar glass-panel" id="class-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <div className="sidebar-title">
            <span>Explorer</span>
            <span className="classes-counter badge badge-blue">
              {filtered.length} nós
            </span>
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setCollapsed(true)}
            title="Recolher barra lateral"
            aria-label="Recolher barra lateral"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="sidebar-search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Pesquisar entidades..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="input-class-search"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Limpar pesquisa"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Layout Switcher (matching Knowledge Graph Explorer) */}
        <div className="sidebar-section-group">
          <span className="sidebar-section-label">Layout do Grafo</span>
          <div className="layout-buttons-grid">
            <button
              className={`layout-btn ${activeLayout === 'force' ? 'active' : ''}`}
              onClick={() => onLayoutChange('force')}
              title="Força física orgânica (fCoSE)"
            >
              <Network size={12} />
              <span>Força</span>
            </button>
            <button
              className={`layout-btn ${activeLayout === 'hierarchy' ? 'active' : ''}`}
              onClick={() => onLayoutChange('hierarchy')}
              title="Árvore Hierárquica Top-Down"
            >
              <GitFork size={12} />
              <span>Árvore</span>
            </button>
            <button
              className={`layout-btn ${activeLayout === 'radial' ? 'active' : ''}`}
              onClick={() => onLayoutChange('radial')}
              title="Radial Concêntrico"
            >
              <Compass size={12} />
              <span>Radial</span>
            </button>
            <button
              className={`layout-btn ${activeLayout === 'circle' ? 'active' : ''}`}
              onClick={() => onLayoutChange('circle')}
              title="Circular (como no exemplo de vinhos)"
            >
              <CircleDot size={12} />
              <span>Círculo</span>
            </button>
            <button
              className={`layout-btn ${activeLayout === 'grid' ? 'active' : ''}`}
              onClick={() => onLayoutChange('grid')}
              title="Grade ortogonal alinhada"
            >
              <LayoutGrid size={12} />
              <span>Grade</span>
            </button>
          </div>
        </div>

        {/* Entity Types Filter (matching Knowledge Graph Explorer) */}
        <div className="sidebar-section-group">
          <span className="sidebar-section-label">Tipos de Entidade</span>
          <div className="filter-pills-row">
            <button
              className={`filter-pill ${stereotypeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStereotypeFilter('all')}
            >
              Todas
            </button>
            <button
              className={`filter-pill ${stereotypeFilter === 'standard' ? 'active' : ''}`}
              onClick={() => setStereotypeFilter('standard')}
            >
              <span className="pill-dot dot-entity" />
              Classes
            </button>
            <button
              className={`filter-pill ${stereotypeFilter === 'abstract' ? 'active' : ''}`}
              onClick={() => setStereotypeFilter('abstract')}
            >
              <span className="pill-dot dot-abstract" />
              Abstratas
            </button>
            <button
              className={`filter-pill ${stereotypeFilter === 'interface' ? 'active' : ''}`}
              onClick={() => setStereotypeFilter('interface')}
            >
              <span className="pill-dot dot-interface" />
              Interfaces
            </button>
            <button
              className={`filter-pill ${stereotypeFilter === 'enum' ? 'active' : ''}`}
              onClick={() => setStereotypeFilter('enum')}
            >
              <span className="pill-dot dot-enum" />
              Enums
            </button>
          </div>
        </div>
      </div>

      {/* Class List */}
      <div className="class-list-scroll">
        <div className="list-caption-row">
          <span>Entidades no modelo ({filtered.length})</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-classes-message">
            <p>Nenhuma classe encontrada.</p>
          </div>
        ) : (
          filtered.map((cls) => {
            const isSelected = selectedClassId === cls.id;
            const isVisible = visibleNodeIds.has(cls.id);
            const st = (cls.stereotype || '').toLowerCase();

            let dotClass = 'dot-entity';
            let badgeClass = 'badge-blue';
            if (st.includes('interface')) {
              dotClass = 'dot-interface';
              badgeClass = 'badge-green';
            } else if (st.includes('abstract')) {
              dotClass = 'dot-abstract';
              badgeClass = 'badge-purple';
            } else if (st.includes('enum')) {
              dotClass = 'dot-enum';
              badgeClass = 'badge-amber';
            } else if (st.includes('service')) {
              dotClass = 'dot-service';
              badgeClass = 'badge-cyan';
            }

            return (
              <div
                key={cls.id}
                className={`class-list-item ${isSelected ? 'selected' : ''} ${!isVisible ? 'hidden-node' : ''}`}
                onClick={() => onSelectClass(cls.id)}
              >
                <div className="item-main-content">
                  <div className="item-name-row">
                    <span className={`node-marker ${dotClass}`} />
                    <span className="class-item-name">{cls.label || cls.id}</span>
                    {cls.stereotype && (
                      <span className={`badge ${badgeClass} stereotype-badge`}>
                        {cls.stereotype}
                      </span>
                    )}
                  </div>
                  <div className="item-details-row">
                    <span>{cls.attributes.length} campos</span>
                    <span className="dot-sep">•</span>
                    <span>{cls.methods.length} métodos</span>
                  </div>
                </div>

                {/* Visibility Toggle Button */}
                <button
                  className={`visibility-toggle-btn ${!isVisible ? 'is-hidden' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(cls.id);
                  }}
                  title={isVisible ? 'Ocultar nó do grafo' : 'Exibir nó no grafo'}
                  aria-label="Alternar visibilidade do nó"
                >
                  {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
