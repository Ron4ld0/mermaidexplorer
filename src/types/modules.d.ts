declare module 'cytoscape-fcose' {
  const fcose: any;
  export default fcose;
}

declare module 'cytoscape-expand-collapse' {
  const expandCollapse: any;
  export default expandCollapse;
}

interface ImportMetaEnv {
  readonly VITE_DIAGRAM_URL?: string;
  readonly VITE_DIAGRAM_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
