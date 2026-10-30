import React, { useEffect, useState } from 'react';
import type { Core } from 'cytoscape';
import { AlertCircle } from 'lucide-react';
import { ClassDetails } from './components/ClassDetails/ClassDetails';
import { ClassSidebar } from './components/ClassSidebar/ClassSidebar';
import { GraphCanvas } from './components/GraphCanvas/GraphCanvas';
import { GraphControls } from './components/GraphControls/GraphControls';
import { MermaidEditor } from './components/MermaidEditor/MermaidEditor';
import { TopNavbar } from './components/TopNavbar/TopNavbar';
import { useGraph } from './hooks/useGraph';
import type { GraphLayoutType } from './types/graph';
import './App.css';

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [activeLayout, setActiveLayout] = useState<GraphLayoutType>('force');
  const [cyInstance, setCyInstance] = useState<Core | null>(null);

  // Sync theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const {
    mermaidCode,
    parsedDiagram,
    parseError,
    visibleNodeIds,
    selectedClass,
    selectedClassId,
    searchQuery,
    filteredClasses,
    activeSampleId,
    hasRemoteDiagram,
    remoteDiagramName,
    isLoadingRemote,
    remoteError,
    stats,
    setMermaidCode,
    loadSample,
    reloadRemoteDiagram,
    selectClass,
    setSearchQuery,
    showAllNodes,
    hideNode,
    expandNode,
    collapseNeighbors,
    isolateNode,
    getClassRelations,
  } = useGraph();

  // Get direct relations for the selected class
  const relations = selectedClassId
    ? getClassRelations(selectedClassId)
    : { incoming: [], outgoing: [] };

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleToggleVisibility = (classId: string) => {
    if (visibleNodeIds.has(classId)) {
      hideNode(classId);
    } else {
      expandNode(classId);
    }
  };

  const activeError = remoteError || parseError;

  return (
    <div className="app-container" data-theme={isDark ? 'dark' : 'light'}>
      {/* Top Navbar */}
      <TopNavbar
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenImport={() => setIsEditorOpen(true)}
        onSelectSample={loadSample}
        activeSampleId={activeSampleId}
        hasRemoteDiagram={hasRemoteDiagram}
        remoteDiagramName={remoteDiagramName}
        isLoadingRemote={isLoadingRemote}
        onReloadRemote={reloadRemoteDiagram}
        stats={stats}
      />

      {/* Global Error Banner */}
      {activeError && (
        <div className="app-error-banner animate-fade-in" role="alert">
          <AlertCircle size={18} />
          <span>{activeError}</span>
          {remoteError ? (
            <button onClick={reloadRemoteDiagram} title="Tentar carregar novamente">
              Tentar novamente
            </button>
          ) : (
            <button onClick={() => setIsEditorOpen(true)} title="Abrir editor para corrigir">
              Corrigir
            </button>
          )}
        </div>
      )}

      {/* Main Workspace */}
      <main className="app-main-workspace">
        {/* Left Sidebar */}
        <ClassSidebar
          classes={filteredClasses}
          selectedClassId={selectedClassId}
          visibleNodeIds={visibleNodeIds}
          searchQuery={searchQuery}
          activeLayout={activeLayout}
          onLayoutChange={setActiveLayout}
          onSearchChange={setSearchQuery}
          onSelectClass={selectClass}
          onToggleVisibility={handleToggleVisibility}
        />

        {/* Central Graph Area */}
        <div className="graph-area-wrapper">
          <GraphCanvas
            diagram={parsedDiagram}
            visibleNodeIds={visibleNodeIds}
            selectedClassId={selectedClassId}
            isDark={isDark}
            activeLayout={activeLayout}
            onSelectClass={selectClass}
            onGraphReady={(cy) => setCyInstance(cy)}
          />

          {/* Floating Controls */}
          <GraphControls
            cy={cyInstance}
            hiddenCount={stats.hiddenClasses}
            activeLayout={activeLayout}
            isShifted={Boolean(selectedClass)}
            onShowAll={showAllNodes}
          />

          {/* Selected Class Details Drawer */}
          {selectedClass && (
            <ClassDetails
              selectedClass={selectedClass}
              relations={relations}
              onClose={() => selectClass(null)}
              onSelectClass={selectClass}
              onExpandNeighbors={expandNode}
              onCollapseNeighbors={collapseNeighbors}
              onIsolateClass={isolateNode}
              onHideClass={hideNode}
            />
          )}
        </div>
      </main>

      {/* Mermaid Editor & Import Modal */}
      <MermaidEditor
        isOpen={isEditorOpen}
        currentCode={mermaidCode}
        onClose={() => setIsEditorOpen(false)}
        onApplyCode={setMermaidCode}
      />
    </div>
  );
};

export default App;
