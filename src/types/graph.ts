export type Visibility = 'public' | 'private' | 'protected' | 'package' | 'none';

export type MemberType = 'attribute' | 'method';

export interface ClassMember {
  id: string;
  raw: string;
  memberType: MemberType;
  visibility: Visibility;
  name: string;
  type?: string;
  parameters?: string;
  returnType?: string;
  isStatic?: boolean;
  isAbstract?: boolean;
}

export interface ClassNodeData {
  id: string;
  label: string;
  stereotype?: string; // e.g. 'interface', 'abstract', 'service', 'enumeration'
  attributes: ClassMember[];
  methods: ClassMember[];
  annotations?: string[];
  notes?: string[];
  rawText?: string;
}

export type RelationType =
  | 'inheritance'    // <|-- or --|>
  | 'realization'    // <|.. or ..|>
  | 'composition'    // *-- or --*
  | 'aggregation'    // o-- or --o
  | 'association'    // <-- or --> or --
  | 'dependency'     // <.. or ..> or ..
  | 'bidirectional'; // <--> or <|--|>

export interface ClassRelationData {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  label?: string;
  sourceCardinality?: string;
  targetCardinality?: string;
  rawSyntax?: string;
}

export interface ParsedDiagram {
  classes: Record<string, ClassNodeData>;
  relations: ClassRelationData[];
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  title?: string;
}

export interface ParseResult {
  success: boolean;
  diagram?: ParsedDiagram;
  error?: string;
  warning?: string;
}

export interface GraphFilterOptions {
  searchQuery: string;
  selectedStereotype: string | null;
  onlyVisible: boolean;
}

export type GraphLayoutType = 'force' | 'hierarchy' | 'radial' | 'circle' | 'grid';
