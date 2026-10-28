import type {
  ClassMember,
  ClassNodeData,
  ClassRelationData,
  MemberType,
  ParseResult,
  RelationType,
  Visibility,
} from '../types/graph';

// Regular expressions for relationship operators
// Source <arrow> Target
// Supports cardinalities e.g.: ClassA "1" --> "*" ClassB : label
const RELATION_REGEX =
  /^([a-zA-Z0-9_~$-]+)\s*(?:"([^"]*)")?\s*(<\|--|--\|>|<\|\.\.|\.\.\|>|\*--|--\*|o--|--o|<-->|-->|<--|\.\.>|<\.\.|--|\.\.)\s*(?:"([^"]*)")?\s*([a-zA-Z0-9_~$-]+)(?:\s*:\s*(.*))?$/;

const INLINE_MEMBER_REGEX =
  /^([a-zA-Z0-9_~$-]+)\s*:\s*(.+)$/;

const STEREOTYPE_LINE_REGEX =
  /^<<([a-zA-Z0-9_ -]+)>>\s*([a-zA-Z0-9_~$-]+)?$/;

/**
 * Determines visibility from prefix character.
 */
function parseVisibility(raw: string): { visibility: Visibility; clean: string } {
  const trimmed = raw.trim();
  const first = trimmed.charAt(0);
  switch (first) {
    case '+':
      return { visibility: 'public', clean: trimmed.slice(1).trim() };
    case '-':
      return { visibility: 'private', clean: trimmed.slice(1).trim() };
    case '#':
      return { visibility: 'protected', clean: trimmed.slice(1).trim() };
    case '~':
      return { visibility: 'package', clean: trimmed.slice(1).trim() };
    default:
      return { visibility: 'none', clean: trimmed };
  }
}

/**
 * Parses a class member line (attribute or method).
 */
export function parseMember(rawLine: string, index: number): ClassMember {
  const trimmed = rawLine.trim();
  const { visibility, clean } = parseVisibility(trimmed);

  let isStatic = false;
  let isAbstract = false;
  let text = clean;

  // Check for classifier marks: $ (static) or * (abstract)
  if (text.startsWith('$') || text.endsWith('$')) {
    isStatic = true;
    text = text.replace(/^\$|\$$/g, '').trim();
  } else if (text.startsWith('*') && text.endsWith('*')) {
    isAbstract = true;
    text = text.slice(1, -1).trim();
  }

  // Method detection: contains "(" and ")"
  const methodMatch = text.match(/^([a-zA-Z0-9_~]+)\s*\(([^)]*)\)\s*(?::\s*(.+)|(.+))?$/);
  if (methodMatch) {
    const name = methodMatch[1];
    const parameters = methodMatch[2].trim();
    const returnType = (methodMatch[3] || methodMatch[4] || '').trim() || undefined;

    return {
      id: `member-${index}-${name}`,
      raw: trimmed,
      memberType: 'method' as MemberType,
      visibility,
      name,
      parameters,
      returnType,
      isStatic,
      isAbstract,
    };
  }

  // Attribute parsing
  // Forms:
  // 1) Type name: e.g. "String name", "List~T~ items"
  // 2) name: Type: e.g. "name: String", "items: List~T~"
  // 3) Just name: "name"
  let attrName = text;
  let attrType: string | undefined = undefined;

  if (text.includes(':')) {
    const parts = text.split(':');
    attrName = parts[0].trim();
    attrType = parts.slice(1).join(':').trim();
  } else {
    const spaceIndex = text.lastIndexOf(' ');
    if (spaceIndex > 0) {
      attrType = text.substring(0, spaceIndex).trim();
      attrName = text.substring(spaceIndex + 1).trim();
    }
  }

  return {
    id: `member-${index}-${attrName}`,
    raw: trimmed,
    memberType: 'attribute' as MemberType,
    visibility,
    name: attrName,
    type: attrType,
    isStatic,
    isAbstract,
  };
}

/**
 * Normalizes relation symbol into standard RelationType, handling directionality.
 */
function mapRelation(
  source: string,
  target: string,
  op: string
): { source: string; target: string; type: RelationType } {
  switch (op) {
    case '<|--':
      // ClassA <|-- ClassB: ClassB extends ClassA
      // In UML graph, edge goes from child (source) to parent (target) or parent to child.
      // Standard convention: source is subclass (ClassB), target is superclass (ClassA)
      return { source: target, target: source, type: 'inheritance' };
    case '--|>':
      // ClassA --|> ClassB: ClassA extends ClassB
      return { source, target, type: 'inheritance' };

    case '<|..':
      // ClassA <|.. ClassB: ClassB realizes ClassA
      return { source: target, target: source, type: 'realization' };
    case '..|>':
      // ClassA ..|> ClassB: ClassA realizes ClassB
      return { source, target, type: 'realization' };

    case '*--':
      // ClassA *-- ClassB: ClassA contains ClassB (composite is ClassA)
      return { source, target, type: 'composition' };
    case '--*':
      // ClassA --* ClassB: ClassB contains ClassA
      return { source: target, target: source, type: 'composition' };

    case 'o--':
      // ClassA o-- ClassB: ClassA aggregates ClassB
      return { source, target, type: 'aggregation' };
    case '--o':
      // ClassA --o ClassB: ClassB aggregates ClassA
      return { source: target, target: source, type: 'aggregation' };

    case '-->':
      return { source, target, type: 'association' };
    case '<--':
      return { source: target, target: source, type: 'association' };

    case '..>':
      return { source, target, type: 'dependency' };
    case '<..':
      return { source: target, target: source, type: 'dependency' };

    case '<-->':
      return { source, target, type: 'bidirectional' };

    case '--':
      return { source, target, type: 'association' };
    case '..':
      return { source, target, type: 'dependency' };

    default:
      return { source, target, type: 'association' };
  }
}

/**
 * Ensures a class node exists in the map and returns it.
 */
function ensureClass(classes: Record<string, ClassNodeData>, rawId: string): ClassNodeData {
  const id = rawId.trim();
  if (!classes[id]) {
    classes[id] = {
      id,
      label: id,
      attributes: [],
      methods: [],
      annotations: [],
      notes: [],
    };
  }
  return classes[id];
}

/**
 * Main parser for Mermaid Class Diagrams.
 */
export function parseMermaidClassDiagram(code: string): ParseResult {
  if (!code || !code.trim()) {
    return {
      success: false,
      error: 'O código Mermaid está vazio.',
    };
  }

  const lines = code.split(/\r?\n/);
  const classes: Record<string, ClassNodeData> = {};
  const relations: ClassRelationData[] = [];
  let direction: 'TB' | 'BT' | 'LR' | 'RL' | undefined = undefined;
  let title: string | undefined = undefined;

  let inClassBlock: string | null = null;
  let foundDiagramHeader = false;
  let memberCounter = 0;
  let relationCounter = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex];
    const line = rawLine.trim();

    // Skip empty lines and full-line comments
    if (!line || line.startsWith('%%')) {
      continue;
    }

    // Frontmatter title check
    if (line.startsWith('---') || line.startsWith('title:')) {
      const titleMatch = line.match(/title:\s*([^-\n]+)/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
      continue;
    }

    // Diagram header
    if (/^classDiagram(-v2)?\b/i.test(line)) {
      foundDiagramHeader = true;
      continue;
    }

    // Direction declaration
    const directionMatch = line.match(/^direction\s+(TB|BT|LR|RL)\b/i);
    if (directionMatch) {
      direction = directionMatch[1].toUpperCase() as 'TB' | 'BT' | 'LR' | 'RL';
      continue;
    }

    // Ignore directives like classDef, cssClass, click, style, etc.
    if (/^(?:classDef|cssClass|style|click)\b/i.test(line)) {
      continue;
    }

    // Check if closing a class block
    if (line === '}' && inClassBlock) {
      inClassBlock = null;
      continue;
    }

    // Inside class block
    if (inClassBlock) {
      const currentClass = classes[inClassBlock];

      // Stereotype inside block: <<interface>>, <<abstract>>, <<enumeration>>, etc.
      const stereotypeMatch = line.match(/^<<([a-zA-Z0-9_ -]+)>>$/);
      if (stereotypeMatch) {
        const st = stereotypeMatch[1].trim();
        currentClass.stereotype = st;
        if (!currentClass.annotations) currentClass.annotations = [];
        if (!currentClass.annotations.includes(st)) currentClass.annotations.push(st);
        continue;
      }

      // Member inside block
      const member = parseMember(line, ++memberCounter);
      if (member.memberType === 'attribute') {
        currentClass.attributes.push(member);
      } else {
        currentClass.methods.push(member);
      }
      continue;
    }

    // Standalone Stereotype line: <<interface>> ClassName or <<enumeration>> ClassName
    const stLineMatch = line.match(STEREOTYPE_LINE_REGEX);
    if (stLineMatch && stLineMatch[2]) {
      const st = stLineMatch[1].trim();
      const cls = ensureClass(classes, stLineMatch[2]);
      cls.stereotype = st;
      if (!cls.annotations) cls.annotations = [];
      if (!cls.annotations.includes(st)) cls.annotations.push(st);
      continue;
    }

    // Class definition with block start:
    // e.g. "class BaseEntity:::entity {", "class User {", "JobStage {", "class List~T~ {"
    let blockStartMatch = line.match(
      /^class\s+([a-zA-Z0-9_~$-]+)(?:\["([^"]+)"\])?(?::::*([a-zA-Z0-9_-]+))?(?:\["([^"]+)"\])?\s*\{$/
    );
    if (!blockStartMatch) {
      blockStartMatch = line.match(
        /^([a-zA-Z0-9_~$-]+)(?:\["([^"]+)"\])?(?::::*([a-zA-Z0-9_-]+))?(?:\["([^"]+)"\])?\s*\{$/
      );
    }
    if (blockStartMatch) {
      const id = blockStartMatch[1];
      const cls = ensureClass(classes, id);
      const label = blockStartMatch[2] || blockStartMatch[4];
      if (label) {
        cls.label = label;
      }
      inClassBlock = id;
      continue;
    }

    // Single class declaration: "class ClassName", "class ClassName:::style", "class ClassName["Display Name"]"
    const singleClassMatch = line.match(
      /^class\s+([a-zA-Z0-9_~$-]+)(?:\["([^"]+)"\])?(?::::*([a-zA-Z0-9_-]+))?(?:\["([^"]+)"\])?$/
    );
    if (singleClassMatch) {
      const id = singleClassMatch[1];
      const cls = ensureClass(classes, id);
      const label = singleClassMatch[2] || singleClassMatch[4];
      if (label) {
        cls.label = label;
      }
      continue;
    }

    // Inline member assignment: "ClassName : +attribute"
    const inlineMemberMatch = line.match(INLINE_MEMBER_REGEX);
    if (inlineMemberMatch) {
      const classId = inlineMemberMatch[1];
      const memberText = inlineMemberMatch[2].trim();

      // Check if it's a stereotype: "ClassName : <<interface>>"
      const stInline = memberText.match(/^<<([a-zA-Z0-9_ -]+)>>$/);
      if (stInline) {
        const cls = ensureClass(classes, classId);
        cls.stereotype = stInline[1].trim();
        continue;
      }

      const cls = ensureClass(classes, classId);
      const member = parseMember(memberText, ++memberCounter);
      if (member.memberType === 'attribute') {
        cls.attributes.push(member);
      } else {
        cls.methods.push(member);
      }
      continue;
    }

    // Relationships: ClassA <|-- ClassB : label
    const relationMatch = line.match(RELATION_REGEX);
    if (relationMatch) {
      const leftClass = relationMatch[1];
      const leftCard = relationMatch[2];
      const operator = relationMatch[3];
      const rightCard = relationMatch[4];
      const rightClass = relationMatch[5];
      let label = relationMatch[6]?.trim() || undefined;
      if (label && ((label.startsWith('"') && label.endsWith('"')) || (label.startsWith("'") && label.endsWith("'")))) {
        label = label.slice(1, -1).trim();
      }

      // Ensure both classes exist
      ensureClass(classes, leftClass);
      ensureClass(classes, rightClass);

      const mapped = mapRelation(leftClass, rightClass, operator);

      // Map cardinalities accordingly if direction was flipped in mapRelation
      const isFlipped = mapped.source === rightClass && mapped.target === leftClass;
      const sourceCardinality = isFlipped ? rightCard : leftCard;
      const targetCardinality = isFlipped ? leftCard : rightCard;

      relations.push({
        id: `rel-${++relationCounter}-${mapped.source}-${mapped.target}`,
        source: mapped.source,
        target: mapped.target,
        type: mapped.type,
        label,
        sourceCardinality,
        targetCardinality,
        rawSyntax: line,
      });
      continue;
    }

    // Note statements: note "..." for ClassName or note for ClassName "..."
    const noteMatch = line.match(/^note\s+(?:for\s+([a-zA-Z0-9_~$-]+)\s+)?"([^"]+)"(?:\s+for\s+([a-zA-Z0-9_~$-]+))?/i);
    if (noteMatch) {
      const targetId = noteMatch[1] || noteMatch[3];
      if (targetId) {
        const cls = ensureClass(classes, targetId);
        if (!cls.notes) cls.notes = [];
        cls.notes.push(noteMatch[2]);
      }
      continue;
    }
  }

  // Check if diagram is valid
  const classCount = Object.keys(classes).length;
  if (!foundDiagramHeader && classCount === 0 && relations.length === 0) {
    return {
      success: false,
      error:
        'Não foi encontrado um diagrama de classes válido. Certifique-se de iniciar com "classDiagram" ou "classDiagram-v2".',
    };
  }

  return {
    success: true,
    diagram: {
      classes,
      relations,
      direction,
      title,
    },
  };
}
