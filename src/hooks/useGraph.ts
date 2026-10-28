import { useCallback, useMemo, useState } from 'react';
import { parseMermaidClassDiagram } from '../services/mermaidParser';
import type { ClassNodeData, ClassRelationData, ParsedDiagram } from '../types/graph';
import { SAMPLE_DIAGRAMS } from '../utils/sampleDiagrams';

export interface UseGraphReturn {
  // Data
  mermaidCode: string;
  parsedDiagram: ParsedDiagram | null;
  parseError: string | null;
  parseWarning: string | null;
  visibleNodeIds: Set<string>;
  selectedClass: ClassNodeData | null;
  selectedClassId: string | null;
  highlightedNodeIds: Set<string>;
  searchQuery: string;
  filteredClasses: ClassNodeData[];

  // Statistics
  stats: {
    totalClasses: number;
    totalRelations: number;
    visibleClasses: number;
    visibleRelations: number;
    hiddenClasses: number;
  };

  // Actions
  setMermaidCode: (code: string) => void;
  loadSample: (sampleId: string) => void;
  selectClass: (classId: string | null) => void;
  setSearchQuery: (query: string) => void;
  showAllNodes: () => void;
  hideNode: (classId: string) => void;
  expandNode: (classId: string) => void;
  collapseNode: (classId: string) => void;
  collapseNeighbors: (classId: string) => void;
  isolateNode: (classId: string) => void;
  getClassRelations: (classId: string) => {
    incoming: Array<{ relation: ClassRelationData; otherClass: ClassNodeData }>;
    outgoing: Array<{ relation: ClassRelationData; otherClass: ClassNodeData }>;
  };
}

export function useGraph(initialCode: string = SAMPLE_DIAGRAMS[0].code): UseGraphReturn {
  const [mermaidCode, setMermaidCodeState] = useState<string>(initialCode);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Parse diagram from code
  const { parsedDiagram, parseError, parseWarning } = useMemo(() => {
    const res = parseMermaidClassDiagram(mermaidCode);
    if (!res.success || !res.diagram) {
      return {
        parsedDiagram: null,
        parseError: res.error || 'Erro ao interpretar Mermaid',
        parseWarning: res.warning || null,
      };
    }
    return {
      parsedDiagram: res.diagram,
      parseError: null,
      parseWarning: res.warning || null,
    };
  }, [mermaidCode]);

  // Set of all class IDs in diagram
  const allClassIds = useMemo(() => {
    if (!parsedDiagram) return new Set<string>();
    return new Set(Object.keys(parsedDiagram.classes));
  }, [parsedDiagram]);

  // Visible node IDs state (initialized to all nodes)
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(() => {
    const res = parseMermaidClassDiagram(initialCode);
    if (res.success && res.diagram) {
      return new Set(Object.keys(res.diagram.classes));
    }
    return new Set();
  });

  // When a new diagram is loaded, make all classes visible
  const setMermaidCode = useCallback((newCode: string) => {
    setMermaidCodeState(newCode);
    const res = parseMermaidClassDiagram(newCode);
    if (res.success && res.diagram) {
      setVisibleNodeIds(new Set(Object.keys(res.diagram.classes)));
      setSelectedClassId(null);
    }
  }, []);

  const loadSample = useCallback((sampleId: string) => {
    const sample = SAMPLE_DIAGRAMS.find((s) => s.id === sampleId);
    if (sample) {
      setMermaidCode(sample.code);
    }
  }, [setMermaidCode]);

  // Selected class data
  const selectedClass = useMemo(() => {
    if (!parsedDiagram || !selectedClassId) return null;
    return parsedDiagram.classes[selectedClassId] || null;
  }, [parsedDiagram, selectedClassId]);

  // Calculate highlighted node IDs (selected class + direct neighbors)
  const highlightedNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (!selectedClassId || !parsedDiagram) return set;

    set.add(selectedClassId);

    for (const rel of parsedDiagram.relations) {
      if (rel.source === selectedClassId) {
        set.add(rel.target);
      } else if (rel.target === selectedClassId) {
        set.add(rel.source);
      }
    }
    return set;
  }, [selectedClassId, parsedDiagram]);

  // Select a class
  const selectClass = useCallback((classId: string | null) => {
    setSelectedClassId(classId);
  }, []);

  // Show all nodes
  const showAllNodes = useCallback(() => {
    setVisibleNodeIds(new Set(allClassIds));
  }, [allClassIds]);

  // Hide single node
  const hideNode = useCallback((classId: string) => {
    setVisibleNodeIds((prev) => {
      const next = new Set(prev);
      next.delete(classId);
      return next;
    });
    if (selectedClassId === classId) {
      setSelectedClassId(null);
    }
  }, [selectedClassId]);

  // Expand node (reveal all immediate neighbors in visible set)
  const expandNode = useCallback(
    (classId: string) => {
      if (!parsedDiagram) return;
      setVisibleNodeIds((prev) => {
        const next = new Set(prev);
        next.add(classId);
        for (const rel of parsedDiagram.relations) {
          if (rel.source === classId) {
            next.add(rel.target);
          } else if (rel.target === classId) {
            next.add(rel.source);
          }
        }
        return next;
      });
    },
    [parsedDiagram]
  );

  // Collapse node (hide selected node)
  const collapseNode = useCallback((classId: string) => {
    hideNode(classId);
  }, [hideNode]);

  // Collapse neighbors (hide neighbor nodes that are only connected to classId)
  const collapseNeighbors = useCallback(
    (classId: string) => {
      if (!parsedDiagram) return;
      // Find neighbors of classId
      const neighbors = new Set<string>();
      for (const rel of parsedDiagram.relations) {
        if (rel.source === classId) neighbors.add(rel.target);
        if (rel.target === classId) neighbors.add(rel.source);
      }

      setVisibleNodeIds((prev) => {
        const next = new Set(prev);
        for (const neighbor of neighbors) {
          next.delete(neighbor);
        }
        return next;
      });
    },
    [parsedDiagram]
  );

  // Isolate node (keep only classId and its direct neighbors visible)
  const isolateNode = useCallback(
    (classId: string) => {
      if (!parsedDiagram) return;
      const isolatedSet = new Set<string>([classId]);
      for (const rel of parsedDiagram.relations) {
        if (rel.source === classId) {
          isolatedSet.add(rel.target);
        } else if (rel.target === classId) {
          isolatedSet.add(rel.source);
        }
      }
      setVisibleNodeIds(isolatedSet);
      setSelectedClassId(classId);
    },
    [parsedDiagram]
  );

  // Get relations for a given class
  const getClassRelations = useCallback(
    (classId: string) => {
      if (!parsedDiagram) return { incoming: [], outgoing: [] };

      const incoming: Array<{ relation: ClassRelationData; otherClass: ClassNodeData }> = [];
      const outgoing: Array<{ relation: ClassRelationData; otherClass: ClassNodeData }> = [];

      for (const rel of parsedDiagram.relations) {
        if (rel.target === classId && parsedDiagram.classes[rel.source]) {
          incoming.push({
            relation: rel,
            otherClass: parsedDiagram.classes[rel.source],
          });
        }
        if (rel.source === classId && parsedDiagram.classes[rel.target]) {
          outgoing.push({
            relation: rel,
            otherClass: parsedDiagram.classes[rel.target],
          });
        }
      }

      return { incoming, outgoing };
    },
    [parsedDiagram]
  );

  // Filtered classes by search query
  const filteredClasses = useMemo(() => {
    if (!parsedDiagram) return [];
    const classes = Object.values(parsedDiagram.classes);
    if (!searchQuery.trim()) return classes;

    const q = searchQuery.toLowerCase().trim();
    return classes.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        (c.label && c.label.toLowerCase().includes(q)) ||
        (c.stereotype && c.stereotype.toLowerCase().includes(q)) ||
        c.attributes.some((a) => a.name.toLowerCase().includes(q)) ||
        c.methods.some((m) => m.name.toLowerCase().includes(q))
    );
  }, [parsedDiagram, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    if (!parsedDiagram) {
      return {
        totalClasses: 0,
        totalRelations: 0,
        visibleClasses: 0,
        visibleRelations: 0,
        hiddenClasses: 0,
      };
    }

    const totalClasses = Object.keys(parsedDiagram.classes).length;
    const totalRelations = parsedDiagram.relations.length;
    const visibleClasses = Object.keys(parsedDiagram.classes).filter((id) =>
      visibleNodeIds.has(id)
    ).length;

    let visibleRelations = 0;
    for (const rel of parsedDiagram.relations) {
      if (visibleNodeIds.has(rel.source) && visibleNodeIds.has(rel.target)) {
        visibleRelations++;
      }
    }

    return {
      totalClasses,
      totalRelations,
      visibleClasses,
      visibleRelations,
      hiddenClasses: totalClasses - visibleClasses,
    };
  }, [parsedDiagram, visibleNodeIds]);

  return {
    mermaidCode,
    parsedDiagram,
    parseError,
    parseWarning,
    visibleNodeIds,
    selectedClass,
    selectedClassId,
    highlightedNodeIds,
    searchQuery,
    filteredClasses,
    stats,
    setMermaidCode,
    loadSample,
    selectClass,
    setSearchQuery,
    showAllNodes,
    hideNode,
    expandNode,
    collapseNode,
    collapseNeighbors,
    isolateNode,
    getClassRelations,
  };
}
