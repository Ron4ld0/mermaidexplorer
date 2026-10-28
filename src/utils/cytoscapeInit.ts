import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

let isRegistered = false;

export function initCytoscapeExtensions(): void {
  if (isRegistered) return;
  try {
    cytoscape.use(fcose);
    isRegistered = true;
  } catch (err) {
    console.warn('Cytoscape extension registration notice:', err);
  }
}
