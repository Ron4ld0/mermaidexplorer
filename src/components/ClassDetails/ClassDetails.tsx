import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  EyeOff,
  Focus,
  Minimize2,
  UnfoldHorizontal,
  X,
} from 'lucide-react';
import type { ClassMember, ClassNodeData, ClassRelationData, Visibility } from '../../types/graph';
import './ClassDetails.css';

interface ClassDetailsProps {
  selectedClass: ClassNodeData | null;
  relations: {
    incoming: Array<{ relation: ClassRelationData; otherClass: ClassNodeData }>;
    outgoing: Array<{ relation: ClassRelationData; otherClass: ClassNodeData }>;
  };
  onClose: () => void;
  onSelectClass: (classId: string) => void;
  onExpandNeighbors: (classId: string) => void;
  onCollapseNeighbors: (classId: string) => void;
  onIsolateClass: (classId: string) => void;
  onHideClass: (classId: string) => void;
}

function getVisibilitySymbol(v: Visibility): { symbol: string; className: string } {
  switch (v) {
    case 'public':
      return { symbol: '+', className: 'vis-public' };
    case 'private':
      return { symbol: '-', className: 'vis-private' };
    case 'protected':
      return { symbol: '#', className: 'vis-protected' };
    case 'package':
      return { symbol: '~', className: 'vis-package' };
    default:
      return { symbol: '•', className: 'vis-none' };
  }
}

function getRelationTypeBadge(type: string): { label: string; className: string } {
  switch (type) {
    case 'inheritance':
      return { label: 'Herança', className: 'badge-blue' };
    case 'realization':
      return { label: 'Realização', className: 'badge-purple' };
    case 'composition':
      return { label: 'Composição', className: 'badge-danger' };
    case 'aggregation':
      return { label: 'Agregação', className: 'badge-amber' };
    case 'association':
      return { label: 'Associação', className: 'badge-secondary' };
    case 'dependency':
      return { label: 'Dependência', className: 'badge-purple' };
    case 'bidirectional':
      return { label: 'Bidirecional', className: 'badge-green' };
    default:
      return { label: type, className: 'badge-secondary' };
  }
}

export const ClassDetails: React.FC<ClassDetailsProps> = ({
  selectedClass,
  relations,
  onClose,
  onSelectClass,
  onExpandNeighbors,
  onCollapseNeighbors,
  onIsolateClass,
  onHideClass,
}) => {
  if (!selectedClass) return null;

  const st = (selectedClass.stereotype || '').toLowerCase();
  let stereotypeBadgeClass = 'badge-blue';
  if (st.includes('interface')) stereotypeBadgeClass = 'badge-green';
  else if (st.includes('abstract')) stereotypeBadgeClass = 'badge-purple';
  else if (st.includes('enum')) stereotypeBadgeClass = 'badge-amber';
  else if (st.includes('service')) stereotypeBadgeClass = 'badge-cyan';

  return (
    <section className="class-details-drawer glass-panel animate-fade-in" id="class-details-panel">
      {/* Header */}
      <div className="drawer-header">
        <div className="header-info">
          {selectedClass.stereotype && (
            <span className={`badge ${stereotypeBadgeClass}`}>
              «{selectedClass.stereotype}»
            </span>
          )}
          <h2 className="class-title">{selectedClass.label || selectedClass.id}</h2>
        </div>
        <button
          className="drawer-close-btn"
          onClick={onClose}
          title="Fechar painel de detalhes"
          aria-label="Fechar painel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Quick Action Buttons for Exploration */}
      <div className="drawer-actions-bar">
        <button
          className="btn btn-secondary btn-action"
          onClick={() => onExpandNeighbors(selectedClass.id)}
          title="Exibir todas as classes relacionadas"
        >
          <UnfoldHorizontal size={14} />
          <span>Expandir Vizinhos</span>
        </button>

        <button
          className="btn btn-secondary btn-action"
          onClick={() => onCollapseNeighbors(selectedClass.id)}
          title="Recolher vizinhos conectados"
        >
          <Minimize2 size={14} />
          <span>Recolher</span>
        </button>

        <button
          className="btn btn-secondary btn-action"
          onClick={() => onIsolateClass(selectedClass.id)}
          title="Focar apenas nesta classe e suas relações diretas"
        >
          <Focus size={14} />
          <span>Isolar</span>
        </button>

        <button
          className="btn btn-secondary btn-action"
          onClick={() => onHideClass(selectedClass.id)}
          title="Ocultar esta classe do grafo"
        >
          <EyeOff size={14} />
          <span>Ocultar</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="drawer-body-scroll">
        {/* Attributes section */}
        <div className="details-section">
          <div className="section-header">
            <span className="section-title">Atributos</span>
            <span className="section-count">{selectedClass.attributes.length}</span>
          </div>
          {selectedClass.attributes.length === 0 ? (
            <p className="empty-section-hint">Nenhum atributo definido.</p>
          ) : (
            <div className="members-list">
              {selectedClass.attributes.map((attr: ClassMember) => {
                const vis = getVisibilitySymbol(attr.visibility);
                return (
                  <div key={attr.id} className="member-row">
                    <span className={`visibility-tag ${vis.className}`} title={attr.visibility}>
                      {vis.symbol}
                    </span>
                    <span className="member-name">
                      {attr.isStatic && <span className="member-tag">$</span>}
                      {attr.name}
                    </span>
                    {attr.type && <span className="member-type">: {attr.type}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Methods section */}
        <div className="details-section">
          <div className="section-header">
            <span className="section-title">Métodos</span>
            <span className="section-count">{selectedClass.methods.length}</span>
          </div>
          {selectedClass.methods.length === 0 ? (
            <p className="empty-section-hint">Nenhum método definido.</p>
          ) : (
            <div className="members-list">
              {selectedClass.methods.map((meth: ClassMember) => {
                const vis = getVisibilitySymbol(meth.visibility);
                return (
                  <div key={meth.id} className="member-row">
                    <span className={`visibility-tag ${vis.className}`} title={meth.visibility}>
                      {vis.symbol}
                    </span>
                    <span className="member-name">
                      {meth.isStatic && <span className="member-tag">$</span>}
                      {meth.isAbstract && <span className="member-tag">*</span>}
                      {meth.name}
                    </span>
                    <span className="method-signature">
                      ({meth.parameters || ''})
                    </span>
                    {meth.returnType && (
                      <span className="member-type">: {meth.returnType}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Outgoing Relations */}
        <div className="details-section">
          <div className="section-header">
            <span className="section-title">Relações de Saída</span>
            <span className="section-count">{relations.outgoing.length}</span>
          </div>
          {relations.outgoing.length === 0 ? (
            <p className="empty-section-hint">Nenhuma relação de saída.</p>
          ) : (
            <div className="relations-list">
              {relations.outgoing.map(({ relation, otherClass }) => {
                const badge = getRelationTypeBadge(relation.type);
                return (
                  <div
                    key={relation.id}
                    className="relation-item"
                    onClick={() => onSelectClass(otherClass.id)}
                    title={`Navegar para ${otherClass.id}`}
                  >
                    <div className="rel-direction-icon out">
                      <ArrowUpRight size={14} />
                    </div>
                    <div className="rel-info">
                      <div className="rel-target-row">
                        <span className="rel-class-name">{otherClass.label || otherClass.id}</span>
                        <span className={`badge ${badge.className}`}>{badge.label}</span>
                      </div>
                      <div className="rel-meta">
                        {relation.targetCardinality && (
                          <span className="rel-cardinality">
                            Card: {relation.targetCardinality}
                          </span>
                        )}
                        {relation.label && (
                          <span className="rel-label-text">«{relation.label}»</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Incoming Relations */}
        <div className="details-section">
          <div className="section-header">
            <span className="section-title">Relações de Entrada</span>
            <span className="section-count">{relations.incoming.length}</span>
          </div>
          {relations.incoming.length === 0 ? (
            <p className="empty-section-hint">Nenhuma relação de entrada.</p>
          ) : (
            <div className="relations-list">
              {relations.incoming.map(({ relation, otherClass }) => {
                const badge = getRelationTypeBadge(relation.type);
                return (
                  <div
                    key={relation.id}
                    className="relation-item"
                    onClick={() => onSelectClass(otherClass.id)}
                    title={`Navegar para ${otherClass.id}`}
                  >
                    <div className="rel-direction-icon in">
                      <ArrowDownLeft size={14} />
                    </div>
                    <div className="rel-info">
                      <div className="rel-target-row">
                        <span className="rel-class-name">{otherClass.label || otherClass.id}</span>
                        <span className={`badge ${badge.className}`}>{badge.label}</span>
                      </div>
                      <div className="rel-meta">
                        {relation.sourceCardinality && (
                          <span className="rel-cardinality">
                            Card: {relation.sourceCardinality}
                          </span>
                        )}
                        {relation.label && (
                          <span className="rel-label-text">«{relation.label}»</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes if any */}
        {selectedClass.notes && selectedClass.notes.length > 0 && (
          <div className="details-section">
            <div className="section-header">
              <span className="section-title">Notas</span>
            </div>
            {selectedClass.notes.map((note, idx) => (
              <p key={idx} className="class-note-box">
                {note}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
